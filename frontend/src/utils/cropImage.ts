export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context oluşturulamadı.');
  }

  // Canvas boyutlarını kırpılan alanın boyutuna getirelim
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Kırpılan resmi çizelim
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Blob olarak alıp File nesnesine dönüştürelim
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas boş veya dönüştürülemedi.'));
        return;
      }
      const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg');
  });
}
