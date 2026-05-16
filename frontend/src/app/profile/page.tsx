"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userService } from '@/services/userService';
import { adService } from '@/services/adService';
import { authService } from '@/services/authService';
import { UserDto, AdDto } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserDto | null>(null);
  const [ads, setAds] = useState<AdDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [userData, adsData] = await Promise.all([
          userService.getMe(),
          adService.getMyAds()
        ]);
        setUser(userData);
        setAds(adsData);
      } catch (error) {
        console.error("Profil bilgileri alınamadı", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center p-xl">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-grow flex items-center justify-center p-xl">
        <div className="flex flex-col items-center gap-md">
          <p className="font-body-lg text-error">Profil bilgileri yüklenemedi. Lütfen tekrar giriş yapın.</p>
          <button onClick={() => { authService.logout(); router.push('/login'); }} className="bg-primary text-on-primary px-4 py-2 rounded-lg">Giriş Yap</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-gutter py-xl">
      <h1 className="font-display-sm text-on-surface mb-lg">Profilim</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
        {/* Sol Sütun: Profil Kartı */}
        <div className="md:col-span-1">
          <div className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/30 ambient-shadow flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[40px] font-bold mb-md uppercase shadow-inner border-4 border-surface">
              {user.firstName ? user.firstName.charAt(0) : user.email.charAt(0)}
            </div>
            <h2 className="font-headline-md text-on-surface">{user.firstName} {user.lastName}</h2>
            <p className="font-body-md text-on-surface-variant mb-lg">{user.email}</p>
            
            <div className="w-full bg-surface-container rounded-xl p-md mb-md border border-outline-variant/50">
              <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Kişilik Tipi</p>
              {user.personaId ? (
                <div className="flex flex-col items-center justify-center gap-2 text-primary font-headline-sm">
                  <span className="material-symbols-outlined text-[32px]">psychology</span>
                  Persona {user.personaId}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-sm">
                  <span className="font-body-sm text-error">Henüz test çözülmemiş</span>
                  <Link href="/test" className="font-label-sm bg-primary text-on-primary px-4 py-2 rounded-lg hover:opacity-90 w-full text-center transition-opacity">
                    Kişilik Testini Çöz
                  </Link>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => { authService.logout(); router.push('/login'); }}
              className="w-full flex items-center justify-center gap-2 font-label-md text-error bg-error/10 hover:bg-error/20 py-2 rounded-lg transition-colors mt-auto"
            >
              <span className="material-symbols-outlined">logout</span>
              Güvenli Çıkış
            </button>
          </div>
        </div>

        {/* Sağ Sütun: İlanlarım */}
        <div className="md:col-span-2">
          <div className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/30 ambient-shadow min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-md border-b border-outline-variant/30 pb-sm">
              <h3 className="font-headline-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">format_list_bulleted</span>
                Verdiğim İlanlar
              </h3>
              <span className="font-label-sm bg-primary-container text-on-primary-container px-3 py-1 rounded-full">
                {ads.length} İlan
              </span>
            </div>

            {ads.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md flex-grow content-start">
                {ads.map((ad) => (
                  <Link href={`/ads/${ad.id}`} key={ad.id} className="block group">
                    <div className="bg-surface rounded-xl overflow-hidden border border-outline-variant/30 hover:border-primary/50 hover:shadow-md transition-all flex flex-col h-full">
                      <div className="h-40 bg-surface-container relative">
                        {ad.photoUrls && ad.photoUrls.length > 0 ? (
                          <img src={ad.photoUrls[0]} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-outline">
                            <span className="material-symbols-outlined text-[40px]">image</span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-surface/90 text-primary font-label-sm px-2 py-1 rounded-md backdrop-blur-sm">
                          {ad.price} TL
                        </div>
                      </div>
                      <div className="p-sm flex flex-col flex-grow">
                        <h4 className="font-label-lg text-on-surface line-clamp-1 mb-1">{ad.title}</h4>
                        <p className="font-body-sm text-on-surface-variant flex items-center gap-1 mb-2">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {ad.cityName}, {ad.districtName}
                        </p>
                        <div className="mt-auto pt-2 border-t border-outline-variant/30 flex justify-between items-center">
                          <span className="font-label-sm text-on-surface-variant">Yayında</span>
                          <span className="material-symbols-outlined text-primary text-[18px]">arrow_forward</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-grow py-xl text-outline">
                <span className="material-symbols-outlined text-[60px] mb-sm">inventory_2</span>
                <p className="font-body-lg text-on-surface-variant text-center mb-md">Henüz hiç ilan vermemişsiniz.</p>
                <Link href="/ads/create" className="font-label-md bg-primary text-on-primary px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
                  İlk İlanını Ver
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
