/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adService } from '@/services/adService';
import { AdDto } from '@/types';
import Link from 'next/link';

export default function AdDetailPage() {
  const params = useParams();
  const [ad, setAd] = useState<AdDto | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAd = async () => {
      try {
        if (params.id) {
          const data = await adService.getAdById(params.id as string);
          setAd(data);
        }
      } catch (err) {
        console.error(err);
        setError("İlan bulunamadı veya bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAd();
  }, [params.id]);

  if (isLoading) {
    return <div className="flex-grow flex items-center justify-center p-xl font-body-lg text-on-surface-variant">İlan detayları yükleniyor...</div>;
  }

  if (error || !ad) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-xl gap-md">
        <h1 className="font-headline-lg text-error">{error || 'İlan Bulunamadı'}</h1>
        <Link href="/" className="font-label-md bg-primary text-on-primary px-xl py-sm rounded-lg hover:opacity-90">
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-gutter py-lg">
      <Link href="/" className="inline-flex items-center gap-xs font-label-md text-primary hover:underline mb-md">
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Sol Sütun: Fotoğraf ve Detaylar */}
        <div className="lg:col-span-2 flex flex-col gap-lg">
          {/* Fotoğraf Alanı */}
          <div className="flex flex-col gap-sm">
            <div className="w-full h-[400px] md:h-[500px] bg-surface-container rounded-2xl overflow-hidden relative border border-outline-variant/30 flex items-center justify-center">
              {ad.photoUrls && ad.photoUrls.length > 0 ? (
                <img src={ad.photoUrls[selectedPhotoIndex]} alt={ad.title} className="w-full h-full object-cover transition-opacity duration-300" />
              ) : (
                <div className="flex flex-col items-center text-outline">
                  <span className="material-symbols-outlined text-[80px] mb-sm">image</span>
                  <span className="font-label-md">Fotoğraf Yok</span>
                </div>
              )}
              <div className="absolute top-md left-md bg-secondary-container text-on-secondary-container font-label-md px-4 py-2 rounded-full shadow-sm backdrop-blur-sm bg-opacity-90 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">verified</span>
                Yüksek Uyumlu
              </div>
            </div>

            {/* Küçük Fotoğraflar (Thumbnails) */}
            {ad.photoUrls && ad.photoUrls.length > 1 && (
              <div className="flex gap-sm overflow-x-auto pb-2 custom-scrollbar">
                {ad.photoUrls.map((url, index) => (
                  <button 
                    key={index} 
                    onClick={() => setSelectedPhotoIndex(index)}
                    className={`w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedPhotoIndex === index ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={url} alt={`${ad.title} - Fotoğraf ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Açıklama */}
          <div className="bg-surface-container-lowest p-lg rounded-2xl ambient-shadow border border-outline-variant/30">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-md">İlan Açıklaması</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant whitespace-pre-wrap">
              {ad.description}
            </p>
          </div>
        </div>

        {/* Sağ Sütun: Özet ve İletişim */}
        <div className="flex flex-col gap-lg">
          {/* Fiyat ve Temel Bilgiler */}
          <div className="bg-surface-container-lowest p-lg rounded-2xl ambient-shadow border border-outline-variant/30 flex flex-col gap-md sticky top-md">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">{ad.title}</h1>
              <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                {ad.cityName || 'Şehir Yok'}, {ad.districtName || 'İlçe Yok'}
              </p>
            </div>

            <div className="py-md border-y border-outline-variant/30 flex flex-col gap-sm">
              <div className="flex justify-between items-center">
                <span className="font-body-md text-on-surface-variant">Aylık Kira</span>
                <span className="font-headline-md text-primary">{ad.price} TL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body-md text-on-surface-variant">Ev Tipi</span>
                <span className="font-label-md text-on-surface bg-surface-container px-3 py-1 rounded-lg">Özel Oda</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body-md text-on-surface-variant">Oda Sayısı</span>
                <span className="font-label-md text-on-surface bg-surface-container px-3 py-1 rounded-lg">3+1</span>
              </div>
            </div>

            {/* Ev Arkadaşı Profili */}
            <div className="flex items-center gap-md">
              <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-headline-md uppercase shadow-sm">
                K
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface">Kullanıcı {ad.ownerId}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Ev Sahibi</p>
              </div>
            </div>

            <button className="w-full bg-primary text-on-primary font-label-md text-label-md py-md rounded-xl hover:opacity-90 transition-opacity mt-sm shadow-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">chat</span>
              İletişime Geç
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
