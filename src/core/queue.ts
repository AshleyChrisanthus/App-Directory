import { getDomain, ensureProtocol } from '../utils/dom';

export class DomainCircuitBreaker {
  failureThreshold: number;
  failures: Map<string, number>;
  tripped: Set<string>;

  constructor(failureThreshold = 2) {
    this.failureThreshold = failureThreshold;
    this.failures = new Map();
    this.tripped = new Set();
  }

  isTripped(domain?: string | null): boolean {
    if (!domain) return false;
    return this.tripped.has(domain.toLowerCase());
  }

  recordSuccess(domain?: string | null): void {
    if (!domain) return;
    const key = domain.toLowerCase();
    this.failures.delete(key);
  }

  recordFailure(domain?: string | null): void {
    if (!domain) return;
    const key = domain.toLowerCase();
    const count = (this.failures.get(key) || 0) + 1;
    this.failures.set(key, count);
    if (count >= this.failureThreshold) {
      this.tripped.add(key);
    }
  }

  reset(): void {
    this.failures.clear();
    this.tripped.clear();
  }
}

export interface BackoffOptions {
  maxRetries?: number;
  baseDelay?: number;
  isTripped?: () => boolean;
}

export async function fetchWithBackoff<T>(
  taskFn: () => Promise<T>,
  options: BackoffOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 2;
  const baseDelay = options.baseDelay ?? 400;
  const isTripped = options.isTripped || (() => false);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (isTripped()) {
      throw new Error('Circuit tripped for domain');
    }

    try {
      return await taskFn();
    } catch (err) {
      if (attempt === maxRetries || isTripped()) {
        throw err;
      }
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 150;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Retries exceeded');
}

export async function runWorkerQueue<T extends { url?: string }>(
  items: T[],
  concurrency: number,
  taskFn: (item: T, index: number) => Promise<void>,
  onProgress?: (completed: number, total: number, item: T, skipped: boolean) => void,
  circuitBreaker: DomainCircuitBreaker | null = null
): Promise<void> {
  let index = 0;
  let completed = 0;
  const total = items.length;
  if (total === 0) return;

  const workerCount = Math.min(concurrency || 4, total);
  const workers = Array.from({ length: workerCount }, async () => {
    while (index < total) {
      const i = index++;
      const item = items[i];
      const domain = item.url ? getDomain(ensureProtocol(item.url)) : '';

      if (circuitBreaker && domain && circuitBreaker.isTripped(domain)) {
        completed++;
        if (onProgress) onProgress(completed, total, item, true);
        continue;
      }

      try {
        await taskFn(item, i);
        if (circuitBreaker && domain) circuitBreaker.recordSuccess(domain);
      } catch (err) {
        if (circuitBreaker && domain) circuitBreaker.recordFailure(domain);
      }

      completed++;
      if (onProgress) onProgress(completed, total, item, false);
    }
  });

  await Promise.all(workers);
}

export async function runPool<T extends { url?: string }>(
  items: T[],
  concurrency: number,
  taskFn: (item: T, index: number) => Promise<void>,
  onProgress?: (completed: number, total: number, item: T, skipped: boolean) => void
): Promise<void> {
  return runWorkerQueue(items, concurrency, taskFn, onProgress);
}
