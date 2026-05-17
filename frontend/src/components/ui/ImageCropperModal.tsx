"use client";

import { useState, useCallback } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';

// Canvas çizim yardımcı fonksiyonu (Piksel hassasiyetinde görsel kırpma)
const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  fileName: string
): Promise<File> => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (err) => reject(err));
    img.setAttribute('crossOrigin', 'anonymous'); // Tainted canvas hatasını önler
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context oluşturulamadı');
  }

  // Canvas boyutlarını kırpılan alanın boyutlarıyla eşitle
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Görseli kırpılan koordinatlara göre canvas üzerine çiz
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

  // Canvas'ı File nesnesine dönüştür
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas boş/oluşturulamadı'));
        return;
      }
      const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });
      resolve(croppedFile);
    }, 'image/jpeg', 0.92); // %92 yüksek kaliteli JPEG sıkıştırma
  });
};

interface ImageCropperModalProps {
  isOpen: boolean;
  imageUrl: string;
  originalFileName: string;
  onClose: () => void;
  onCropSave: (croppedFile: File, newUrl: string) => void;
}

export default function ImageCropperModal({
  isOpen,
  imageUrl,
  originalFileName,
  onClose,
  onCropSave
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels || !imageUrl) return;
    
    try {
      setIsSaving(true);
      const croppedFile = await getCroppedImg(imageUrl, croppedAreaPixels, originalFileName);
      const newUrl = URL.createObjectURL(croppedFile);
      onCropSave(croppedFile, newUrl);
      setIsSaving(false);
      onClose();
    } catch (error) {
      console.error('Kırpma işlemi sırasında hata oluştu:', error);
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-md bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-3xl w-full max-w-[500px] shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col p-lg gap-md transform scale-100 transition-all duration-300 animate-in zoom-in-95 duration-200">
        
        {/* Başlık ve Kapatma */}
        <div className="flex items-center justify-between pb-sm border-b border-outline-variant/30">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary">crop</span>
            <h3 className="font-headline-sm text-on-surface">Fotoğrafı Kırp</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="material-symbols-outlined text-outline hover:text-on-surface transition-colors cursor-pointer"
          >
            close
          </button>
        </div>

        {/* Kırpma Alanı */}
        <div className="relative w-full h-[300px] bg-neutral-950 rounded-2xl overflow-hidden">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Yakınlaştırma (Zoom) Ayarı */}
        <div className="flex flex-col gap-xs px-xs">
          <div className="flex justify-between items-center text-label-sm text-on-surface-variant">
            <span>Yakınlaştır</span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-outline text-[20px]">zoom_out</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="material-symbols-outlined text-outline text-[20px]">zoom_in</span>
          </div>
        </div>



        {/* Eylem Butonları */}
        <div className="flex gap-md pt-sm border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 border border-outline-variant/50 font-label-lg py-sm rounded-xl text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer text-center"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-primary text-on-primary font-label-lg py-sm rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-xs"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>İşleniyor...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>Kırp ve Kaydet</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
