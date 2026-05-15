"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adService } from '@/services/adService';
import Dropdown from '@/components/ui/Dropdown';

// Backend'deki DataSeeder ile uyumlu statik veri
const CITIES = [
  { id: 1, name: "İstanbul" },
  { id: 2, name: "Ankara" }
];

const DISTRICTS: Record<number, {id: number, name: string}[]> = {
  1: [
    { id: 1, name: "Kadıköy" },
    { id: 2, name: "Beşiktaş" }
  ],
  2: [
    { id: 3, name: "Çankaya" }
  ]
};

const NEIGHBORHOODS: Record<number, string[]> = {
  1: ["Moda", "Fenerbahçe", "Bostancı", "Caferağa", "Rasimpaşa"],
  2: ["Ortaköy", "Etiler", "Bebek", "Levent", "Dikilitaş"],
  3: ["Kızılay", "Bahçelievler", "Dikmen", "Ayrancı", "Çayyolu"]
};

export default function CreateAdPage() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  
  const [cityId, setCityId] = useState<number | ''>('');
  const [cityName, setCityName] = useState('');
  
  const [districtId, setDistrictId] = useState<number | ''>('');
  const [districtName, setDistrictName] = useState('');
  
  const [neighborhood, setNeighborhood] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCityChange = (name: string) => {
    const city = CITIES.find(c => c.name === name);
    if (city) {
      setCityId(city.id);
      setCityName(name);
      setDistrictId('');
      setDistrictName('');
      setNeighborhood('');
    }
  };

  const handleDistrictChange = (name: string) => {
    const district = cityId ? DISTRICTS[cityId]?.find(d => d.name === name) : null;
    if (district) {
      setDistrictId(district.id);
      setDistrictName(name);
      setNeighborhood('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!title || !description || !price || !cityId || !districtId) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      const adData = {
        title,
        description,
        price: parseFloat(price.replace(/\./g, '')),
        cityId: Number(cityId),
        districtId: Number(districtId),
        neighborhood
      };

      formData.append("ad", JSON.stringify(adData));
      files.forEach(f => {
        formData.append("files", f);
      });

      const newAd = await adService.createAd(formData);
      
      // Başarılı olduğunda ilanın detay sayfasına yönlendir
      router.push(`/ads/${newAd.id}`);
    } catch (err: any) {
      setError(err.message || 'İlan oluşturulurken bir hata oluştu. Lütfen giriş yaptığınızdan emin olun.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-md md:p-xl">
      <div className="w-full max-w-[600px] bg-surface-container-lowest rounded-3xl ambient-shadow p-xl border border-outline-variant/30">
        <div className="text-center mb-xl">
          <span className="material-symbols-outlined text-[48px] text-primary mb-md">add_home</span>
          <h1 className="font-headline-lg text-on-surface mb-xs">Yeni İlan Ekle</h1>
          <p className="font-body-md text-on-surface-variant">
            Ev arkadaşı aradığınız veya kiraladığınız odayı/evi sisteme kaydedin.
          </p>
        </div>

        {error && (
          <div className="mb-lg p-sm bg-error/10 text-error rounded-lg font-body-md text-center border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          {/* İlan Başlığı */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface" htmlFor="title">İlan Başlığı</label>
            <input 
              id="title"
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Kadıköy Moda'da Deniz Manzaralı Oda" 
              className="w-full bg-surface-container px-md py-sm rounded-xl font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary border-none"
              required
            />
          </div>

          {/* Fiyat */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface" htmlFor="price">Aylık Kira (TL)</label>
            <input 
              id="price"
              type="text" 
              value={price}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, '');
                if (rawValue) {
                  const formattedValue = new Intl.NumberFormat('tr-TR').format(Number(rawValue));
                  setPrice(formattedValue);
                } else {
                  setPrice('');
                }
              }}
              placeholder="Örn: 12.500" 
              className="w-full bg-surface-container px-md py-sm rounded-xl font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary border-none"
              required
            />
          </div>

          {/* Şehir, İlçe ve Mahalle Seçimi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="border border-outline-variant/30 rounded-xl bg-surface-container py-1">
              <Dropdown 
                label="Şehir" 
                icon="location_city" 
                options={CITIES.map(c => c.name)} 
                value={cityName} 
                onChange={handleCityChange} 
                isLast={true}
              />
            </div>

            <div className={`border border-outline-variant/30 rounded-xl py-1 ${cityId ? 'bg-surface-container' : 'bg-surface-container-low opacity-50 cursor-not-allowed'}`}>
              <Dropdown 
                label="İlçe" 
                icon="map" 
                options={cityId ? (DISTRICTS[cityId]?.map(d => d.name) || []) : []} 
                value={districtName} 
                onChange={cityId ? handleDistrictChange : () => {}} 
                isLast={true}
              />
            </div>

            <div className={`border border-outline-variant/30 rounded-xl py-1 ${districtId ? 'bg-surface-container' : 'bg-surface-container-low opacity-50 cursor-not-allowed'}`}>
              <Dropdown 
                label="Mahalle" 
                icon="my_location" 
                options={districtId ? (NEIGHBORHOODS[districtId as number] || []) : []} 
                value={neighborhood} 
                onChange={districtId ? setNeighborhood : () => {}} 
                isLast={true}
              />
            </div>
          </div>

          {/* Fotoğraf Linki (File Upload) */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface" htmlFor="file">Fotoğraflar Yükle (İsteğe Bağlı, Çoklu Seçilebilir)</label>
            <input 
              id="file"
              type="file" 
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  setFiles(Array.from(e.target.files));
                }
              }}
              className="w-full bg-surface-container px-md py-sm rounded-xl font-body-md text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary-container hover:file:text-on-primary-container cursor-pointer"
            />
            {files.length > 0 && (
              <p className="font-body-sm text-primary mt-1">{files.length} adet fotoğraf seçildi.</p>
            )}
          </div>

          {/* Açıklama */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface" htmlFor="description">Açıklama</label>
            <textarea 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Evinizin, odanızın özelliklerini ve nasıl bir ev arkadaşı aradığınızı anlatın..." 
              rows={5}
              className="w-full bg-surface-container px-md py-sm rounded-xl font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary border-none resize-none"
              required
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-on-primary font-label-lg py-md rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-colors mt-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin">refresh</span>
            ) : (
              <span className="material-symbols-outlined">publish</span>
            )}
            {isLoading ? 'Kaydediliyor...' : 'İlanı Yayınla'}
          </button>
        </form>
      </div>
    </div>
  );
}
