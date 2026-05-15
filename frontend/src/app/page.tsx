"use client";

import { useEffect, useState } from 'react';
import { adService } from '@/services/adService';
import { AdDto } from '@/types';
import Link from 'next/link';
import Dropdown from '@/components/ui/Dropdown';

import { LOCATION_DATA } from '@/constants/locations';

export default function HomePage() {
  const [ads, setAds] = useState<AdDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  
  const [budget, setBudget] = useState('');
  const [houseType, setHouseType] = useState('');

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedDistrict('');
    setSelectedNeighborhood('');
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setSelectedNeighborhood('');
  };

  const cities = Object.keys(LOCATION_DATA);
  const districts = selectedCity ? Object.keys(LOCATION_DATA[selectedCity] || {}) : [];
  const neighborhoods = (selectedCity && selectedDistrict) ? (LOCATION_DATA[selectedCity][selectedDistrict] || []) : [];

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const data = await adService.getAllAds();
        // Sadece aktif ilanları göster
        setAds(data.filter(ad => ad.isActive !== false));
      } catch (error) {
        console.error("İlanlar yüklenirken hata:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAds();
  }, []);

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-gutter py-lg">
      {/* Hero / Search Section */}
      <section className="mb-xl bg-surface-container-lowest rounded-xl ambient-shadow p-sm md:p-md grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 items-center gap-y-lg gap-x-sm border border-outline-variant/30">
        <Dropdown 
          label="Şehir" 
          icon="location_city" 
          options={cities} 
          value={selectedCity} 
          onChange={handleCityChange} 
        />
        
        <Dropdown 
          label="İlçe" 
          icon="map" 
          options={districts} 
          value={selectedDistrict} 
          onChange={handleDistrictChange} 
        />

        <Dropdown 
          label="Mahalle" 
          icon="my_location" 
          options={neighborhoods} 
          value={selectedNeighborhood} 
          onChange={setSelectedNeighborhood} 
        />
        
        <Dropdown 
          label="Aylık Bütçe" 
          icon="payments" 
          options={['10.000 TL - 15.000 TL', '15.000 TL - 20.000 TL', '20.000 TL+']} 
          value={budget} 
          onChange={setBudget} 
        />
        
        <Dropdown 
          label="Ev Tipi" 
          icon="home" 
          options={['Özel Oda', 'Paylaşımlı Oda', 'Tüm Ev']} 
          value={houseType} 
          onChange={setHouseType} 
          isLast={true}
        />

        <div className="w-full px-sm flex justify-center lg:justify-end">
          <button className="bg-primary text-on-primary w-full lg:w-auto px-xl py-sm rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors flex items-center justify-center gap-2 min-h-[48px]">
            <span className="material-symbols-outlined text-on-primary">search</span>
            Ara
          </button>
        </div>
      </section>

      {/* Listings Section */}
      <section>
        <div className="flex justify-between items-end mb-md">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Sizin İçin Önerilenler</h1>
          <span className="font-body-md text-body-md text-on-surface-variant">{ads.length} sonuç bulundu</span>
        </div>

        {isLoading ? (
          <div className="text-center py-xl font-body-lg text-on-surface-variant">İlanlar yükleniyor...</div>
        ) : ads.length === 0 ? (
          <div className="text-center py-xl font-body-lg text-on-surface-variant">Henüz hiç ilan bulunmuyor. Backend'e ilan eklemeyi deneyin!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {ads.map((ad, index) => {
              // Rastgele uyum skoru (şimdilik)
              const matchScore = 75 + (index * 5 % 20); 
              return (
                <Link href={`/ads/${ad.id}`} key={ad.id} className="h-full">
                  <article className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 hover-ambient-shadow overflow-hidden group cursor-pointer flex flex-col h-full">
                    <div className="relative h-64 overflow-hidden bg-surface-container">
                      {/* Yer tutucu görsel */}
                      <div className="w-full h-full flex items-center justify-center text-outline group-hover:scale-105 transition-transform duration-500">
                         <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>image</span>
                      </div>
                      
                      <div className="absolute top-sm left-sm bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm bg-opacity-90">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        %{matchScore} Uyumlu
                      </div>
                      
                      <button className="absolute top-sm right-sm p-2 bg-surface-container-lowest/80 rounded-full hover:bg-white text-outline hover:text-error transition-colors">
                        <span className="material-symbols-outlined">favorite</span>
                      </button>
                    </div>
                    
                    <div className="p-md flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-sm">
                        <h2 className="font-headline-md text-headline-md text-on-surface">
                          {ad.price} TL <span className="font-body-md text-body-md text-on-surface-variant">/ ay</span>
                        </h2>
                        <span className="bg-surface-container px-2 py-1 rounded font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">meeting_room</span> {ad.houseType || 'Oda'}
                        </span>
                      </div>
                      
                      <h3 className="font-label-md text-on-surface mb-xs truncate">{ad.title}</h3>
                      
                      <p className="font-body-md text-body-md text-on-surface-variant mb-md flex-grow line-clamp-2">
                        {ad.description}
                      </p>
                      
                      <div className="pt-sm border-t border-outline-variant/30 flex items-center gap-sm mt-auto">
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-headline-md uppercase">
                          K
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">Kullanıcı {ad.userId}</p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">location_on</span> {ad.location || 'Bilinmiyor'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
