export async function urlToDataUrl(imageUrl?: string | null): Promise<string> {
  if (!imageUrl || imageUrl.startsWith('data:')) {
    return imageUrl || '';
  }

  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const imageToDataUrl = (src: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const maxDim = 128;
          let w = img.naturalWidth || img.width || 64;
          let h = img.naturalHeight || img.height || 64;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w || 64;
          canvas.height = h || 64;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context not available'));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = src;
    });

  // Strategy 1: Direct fetch with CORS
  try {
    const resp = await fetch(imageUrl, { mode: 'cors' });
    if (resp.ok) {
      const blob = await resp.blob();
      if (blob && blob.size > 0) {
        const dataUrl = await blobToDataUrl(blob);
        if (dataUrl && dataUrl.startsWith('data:image')) return dataUrl;
      }
    }
  } catch (_) {}

  // Strategy 2: Image element with crossOrigin drawing to canvas
  try {
    const dataUrl = await imageToDataUrl(imageUrl);
    if (dataUrl && dataUrl.startsWith('data:image')) {
      return dataUrl;
    }
  } catch (_) {}

  // Strategy 3: Open CORS image proxy (images.weserv.nl)
  try {
    const cleanUrl = imageUrl.replace(/^https?:\/\//i, '');
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&w=128&output=png`;
    const resp = await fetch(proxyUrl, { mode: 'cors' });
    if (resp.ok) {
      const blob = await resp.blob();
      if (blob && blob.size > 0) {
        const dataUrl = await blobToDataUrl(blob);
        if (dataUrl && dataUrl.startsWith('data:image')) return dataUrl;
      }
    }
  } catch (_) {}

  // Strategy 4: Fallback to original URL
  return imageUrl;
}
