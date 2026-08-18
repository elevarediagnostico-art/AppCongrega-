export type OptimizedImage = {
  webpDataUrl: string;
  thumbnailDataUrl: string;
  width: number;
  height: number;
  originalBytes: number;
};

function renderCanvas(image: HTMLImageElement, maxEdge: number, quality: number) {
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
  const context = canvas.getContext("2d"); if (!context) throw new Error("Não foi possível otimizar esta imagem."); context.drawImage(image, 0, 0, width, height);
  return { dataUrl: canvas.toDataURL("image/webp", quality), width, height };
}

export async function optimizeImage(file: File): Promise<OptimizedImage> {
  if (!file.type.startsWith("image/")) throw new Error("Selecione um ficheiro de imagem.");
  if (file.size > 10 * 1024 * 1024) throw new Error("A imagem original deve ter no máximo 10 MB.");
  const objectUrl = URL.createObjectURL(file); const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Não foi possível ler esta imagem.")); image.src = objectUrl; });
    const full = renderCanvas(image, 2048, 0.82); const thumbnail = renderCanvas(image, 480, 0.70);
    return { webpDataUrl: full.dataUrl, thumbnailDataUrl: thumbnail.dataUrl, width: full.width, height: full.height, originalBytes: file.size };
  } finally { URL.revokeObjectURL(objectUrl); }
}
