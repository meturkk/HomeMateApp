/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adService } from '@/services/adService';
import { favoriteService } from '@/services/favoriteService';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { AdDto, UserDto } from '@/types';
import Link from 'next/link';

export default function AdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ad, setAd] = useState<AdDto | null>(null);
  const [owner, setOwner] = useState<UserDto | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        if (params.id) {
          const data = await adService.getAdById(params.id as string);
          setAd(data);

          // İlanı veren kullanıcının profil bilgilerini dinamik olarak çek
          if (data.ownerId) {
            try {
              const ownerData = await userService.getUserById(data.ownerId);
              setOwner(ownerData);
            } catch (err) {
              console.error('İlan sahibi bilgileri çekilemedi:', err);
            }
          }
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

  // Favori durumunu kontrol et
  useEffect(() => {
    const checkFavorite = async () => {
      if (authService.isAuthenticated() && ad) {
        try {
          const ids = await favoriteService.getFavoriteIds();
          setIsFavorited(ids.includes(ad.id));
        } catch (e) {
          // silently fail
        }
      }
    };
    checkFavorite();
  }, [ad]);

  const handleToggleFavorite = async () => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    if (!ad) return;
    try {
      const result = await favoriteService.toggle(ad.id);
      setIsFavorited(result.favorited);
    } catch (error) {
      console.error('Favori işlemi başarısız:', error);
    }
  };

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
            <div className="w-full aspect-[16/9] bg-surface-container rounded-2xl overflow-hidden relative border border-outline-variant/30 flex items-center justify-center">
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
                    className={`w-28 aspect-[16/9] flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedPhotoIndex === index ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={url} alt={`${ad.title} - Fotoğraf ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Evin Özellikleri Grid */}
          <div className="bg-surface-container-lowest p-lg rounded-2xl ambient-shadow border border-outline-variant/30 flex flex-col gap-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">home_work</span>
              Ev Özellikleri ve Detayları
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
              {/* Metrekare */}
              <div className="flex items-center gap-sm bg-surface-container-low p-md rounded-xl border border-outline-variant/10">
                <span className="material-symbols-outlined text-primary text-[28px]">square_foot</span>
                <div>
                  <p className="text-body-xs font-body-sm text-on-surface-variant">Metrekare</p>
                  <p className="text-label-md font-label-md text-on-surface">{ad.squareMeters ? `${ad.squareMeters} m²` : 'Belirtilmedi'}</p>
                </div>
              </div>

              {/* Oda Sayısı */}
              <div className="flex items-center gap-sm bg-surface-container-low p-md rounded-xl border border-outline-variant/10">
                <span className="material-symbols-outlined text-primary text-[28px]">bed</span>
                <div>
                  <p className="text-body-xs font-body-sm text-on-surface-variant">Oda Sayısı</p>
                  <p className="text-label-md font-label-md text-on-surface">{ad.roomCount || 'Belirtilmedi'}</p>
                </div>
              </div>

              {/* Bulunduğu Kat */}
              <div className="flex items-center gap-sm bg-surface-container-low p-md rounded-xl border border-outline-variant/10">
                <span className="material-symbols-outlined text-primary text-[28px]">layers</span>
                <div>
                  <p className="text-body-xs font-body-sm text-on-surface-variant">Bulunduğu Kat</p>
                  <p className="text-label-md font-label-md text-on-surface">{ad.floorNumber !== undefined && ad.floorNumber !== null ? `${ad.floorNumber}. Kat` : 'Belirtilmedi'}</p>
                </div>
              </div>

              {/* Banyo Sayısı */}
              <div className="flex items-center gap-sm bg-surface-container-low p-md rounded-xl border border-outline-variant/10">
                <span className="material-symbols-outlined text-primary text-[28px]">bathtub</span>
                <div>
                  <p className="text-body-xs font-body-sm text-on-surface-variant">Banyo Sayısı</p>
                  <p className="text-label-md font-label-md text-on-surface">{ad.bathroomCount !== undefined && ad.bathroomCount !== null ? `${ad.bathroomCount} Banyo` : 'Belirtilmedi'}</p>
                </div>
              </div>

              {/* Isıtma Tipi */}
              <div className="flex items-center gap-sm bg-surface-container-low p-md rounded-xl border border-outline-variant/10">
                <span className="material-symbols-outlined text-primary text-[28px]">thermostat</span>
                <div>
                  <p className="text-body-xs font-body-sm text-on-surface-variant">Isıtma Tipi</p>
                  <p className="text-label-md font-label-md text-on-surface">{ad.heatingType || 'Belirtilmedi'}</p>
                </div>
              </div>

              {/* Kişi Kapasitesi */}
              <div className="flex items-center gap-sm bg-surface-container-low p-md rounded-xl border border-outline-variant/10">
                <span className="material-symbols-outlined text-primary text-[28px]">group</span>
                <div>
                  <p className="text-body-xs font-body-sm text-on-surface-variant">Yaşayan / Kapasite</p>
                  <p className="text-label-md font-label-md text-on-surface">
                    {ad.currentResidents !== undefined && ad.currentResidents !== null ? ad.currentResidents : '?'} Kişi / {ad.totalCapacity !== undefined && ad.totalCapacity !== null ? `${ad.totalCapacity} Kişi` : '?'}
                  </p>
                </div>
              </div>
            </div>

            {/* Donanım ve Çevre Özellikleri (Pills) */}
            <div className="flex flex-col gap-sm pt-sm border-t border-outline-variant/30">
              <p className="font-label-md text-on-surface-variant">Konut Donanım ve Özellikleri</p>
              <div className="flex flex-wrap gap-sm">
                <span className={`px-md py-sm rounded-xl text-label-md font-label-md flex items-center gap-xs border transition-all ${
                  ad.hasBalcony 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 opacity-60'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {ad.hasBalcony ? 'check_circle' : 'cancel'}
                  </span>
                  Balkon
                </span>

                <span className={`px-md py-sm rounded-xl text-label-md font-label-md flex items-center gap-xs border transition-all ${
                  ad.hasElevator 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 opacity-60'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {ad.hasElevator ? 'check_circle' : 'cancel'}
                  </span>
                  Asansör
                </span>

                <span className={`px-md py-sm rounded-xl text-label-md font-label-md flex items-center gap-xs border transition-all ${
                  ad.hasParking 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 opacity-60'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {ad.hasParking ? 'check_circle' : 'cancel'}
                  </span>
                  Otopark
                </span>

                <span className={`px-md py-sm rounded-xl text-label-md font-label-md flex items-center gap-xs border transition-all ${
                  ad.inComplex 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 opacity-60'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {ad.inComplex ? 'check_circle' : 'cancel'}
                  </span>
                  Site İçerisinde
                </span>
              </div>
            </div>
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
                {ad.cityName || 'Şehir Yok'}, {ad.districtName || 'İlçe Yok'}{ad.neighborhood ? `, ${ad.neighborhood} Mah.` : ''}
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
                <span className="font-label-md text-on-surface bg-surface-container px-3 py-1 rounded-lg">
                  {ad.roomCount || 'Belirtilmedi'}
                </span>
              </div>
            </div>

            {/* Ev Arkadaşı Profili (Dinamik Bilgiler) */}
            <div className="flex items-center gap-md">
              {owner?.profilePictureUrl ? (
                <img 
                  src={owner.profilePictureUrl} 
                  alt={`${owner.firstName} ${owner.lastName}`} 
                  className="w-14 h-14 rounded-full object-cover border border-outline-variant/30 shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-headline-md uppercase shadow-sm">
                  {owner ? `${owner.firstName[0]}${owner.lastName[0]}` : 'K'}
                </div>
              )}
              <div>
                <p className="font-label-md text-label-md text-on-surface">
                  {owner ? `${owner.firstName} ${owner.lastName}` : `Kullanıcı ${ad.ownerId}`}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Ev Sahibi</p>
              </div>
            </div>

            <button 
              onClick={handleToggleFavorite}
              className={`w-full font-label-md text-label-md py-md rounded-xl transition-all mt-sm flex items-center justify-center gap-2 border ${
                isFavorited 
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20' 
                  : 'bg-surface-container text-on-surface border-outline-variant/30 hover:border-amber-500 hover:text-amber-600'
              }`}
            >
              <span className="material-symbols-outlined" style={isFavorited ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {isFavorited ? 'star' : 'star_border'}
              </span>
              {isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            </button>

            <button 
              onClick={() => {
                if (!authService.isAuthenticated()) {
                  router.push('/login');
                  return;
                }
                router.push(`/messages?to=${ad.ownerId}`);
              }}
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-md rounded-xl hover:opacity-90 transition-opacity mt-sm shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">chat</span>
              İletişime Geç
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
