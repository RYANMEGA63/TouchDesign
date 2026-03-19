// Shared product image store using localStorage
// Key format: "pimg_{productId}_{colorName}" for color-specific images
// Key format: "pimg_{productId}_default" for fallback

const key = (productId: string, colorName: string) =>
  `pimg_${productId}_${colorName.toLowerCase().replace(/\s/g, "_")}`;

export function getColorImage(productId: string, colorName: string): string | null {
  try { return localStorage.getItem(key(productId, colorName)); } catch { return null; }
}

export function setColorImage(productId: string, colorName: string, dataUrl: string): void {
  try { localStorage.setItem(key(productId, colorName), dataUrl); } catch (e) { console.warn(e); }
}

export function removeColorImage(productId: string, colorName: string): void {
  try { localStorage.removeItem(key(productId, colorName)); } catch { /* ignore */ }
}

export function getAllColorImages(productId: string, colorNames: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  colorNames.forEach((c) => {
    const img = getColorImage(productId, c);
    if (img) result[c] = img;
  });
  return result;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
