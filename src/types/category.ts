export type CategoryMatchMode = 'union' | 'intersect';

export interface CategoryColorMap {
  [categoryName: string]: string;
}

export interface CategoryStats {
  name: string;
  count: number;
  color?: string;
}
