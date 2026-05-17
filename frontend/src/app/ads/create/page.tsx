"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adService } from '@/services/adService';
import { locationService, LocationItem } from '@/services/locationService';
import Dropdown from '@/components/ui/Dropdown';
import ImageCropperModal from '@/components/ui/ImageCropperModal';

export default function CreateAdPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  
  // Fotoğraf önizleme state'leri
  const [previews, setPreviews] = useState<{ id: string; url: string; file: File }[]>([]);

  // Kırpma modali state'leri
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState('');
  const [cropFileName, setCropFileName] = useState('');
  const [activePreviewId, setActivePreviewId] = useState<string>('');

  // Konum state'leri
  const [cities, setCities] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<LocationItem[]>([]);

  const [cityId, setCityId] = useState<number | ''>('');
  const [cityName, setCityName] = useState('');

  const [districtId, setDistrictId] = useState<number | ''>('');
  const [districtName, setDistrictName] = useState('');

  const [neighborhood, setNeighborhood] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [error, setError] = useState('');

  // Unmount olduğunda tüm object URL'leri temizle (bellek sızıntısını önler)
  useEffect(() => {
    return () => {
      previews.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, []);

  // Fotoğraf yükleme değişim işleyicisi (Önizleme oluşturma ve 10MB boyutu kontrolü)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
      const tooLargeFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
      
      if (tooLargeFiles.length > 0) {
        setError(`Bazı fotoğraflar 10MB limitini aşıyor: ${tooLargeFiles.map(f => f.name).join(', ')}. Lütfen daha küçük fotoğraflar seçin.`);
        e.target.value = '';
        return;
      }
      
      setError('');
      
      // Yeni önizleme öğelerini listeye ekle
      const newPreviews = selectedFiles.map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        url: URL.createObjectURL(file),
        file
      }));
      
      setPreviews(prev => [...prev, ...newPreviews]);
      e.target.value = ''; // Aynı dosyayı tekrar yükleyebilmek için input'u sıfırla
    }
  };

  // Fotoğraf silme işleyicisi
  const handleDeletePreview = (id: string, url: string) => {
    URL.revokeObjectURL(url);
    setPreviews(prev => prev.filter(p => p.id !== id));
  };

  // Kırpma modali açıcı
  const handleOpenCropper = (id: string, url: string, name: string) => {
    setActivePreviewId(id);
    setCropImageUrl(url);
    setCropFileName(name);
    setCropperOpen(true);
  };

  // Kırpılan görseli kaydetme
  const handleCropSave = (croppedFile: File, newUrl: string) => {
    setPreviews(prev => 
      prev.map(p => {
        if (p.id === activePreviewId) {
          URL.revokeObjectURL(p.url); // Eski URL'i bellekten sil
          return { ...p, url: newUrl, file: croppedFile };
        }
        return p;
      })
    );
  };

  // Sayfa yüklendiğinde şehirleri getir
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await locationService.getCities();
        setCities(data);
      } catch (err) {
        console.error('Şehirler yüklenemedi:', err);
      } finally {
        setLocationsLoading(false);
      }
    };
    fetchCities();
  }, []);

  // Şehir seçildiğinde ilçeleri getir
  useEffect(() => {
    if (!cityId) {
      setDistricts([]);
      return;
    }
    const fetchDistricts = async () => {
      try {
        const data = await locationService.getDistricts(cityId as number);
        setDistricts(data);
      } catch (err) {
        console.error('İlçeler yüklenemedi:', err);
      }
    };
    fetchDistricts();
  }, [cityId]);

  // İlçe seçildiğinde mahalleleri getir
  useEffect(() => {
    if (!districtId) {
      setNeighborhoods([]);
      return;
    }
    const fetchNeighborhoods = async () => {
      try {
        const data = await locationService.getNeighborhoods(districtId as number);
        setNeighborhoods(data);
      } catch (err) {
        console.error('Mahalleler yüklenemedi:', err);
      }
    };
    fetchNeighborhoods();
  }, [districtId]);

  const handleCityChange = (name: string) => {
    const city = cities.find(c => c.name === name);
    if (city) {
      setCityId(city.id);
      setCityName(name);
      setDistrictId('');
      setDistrictName('');
      setNeighborhood('');
    }
  };

  const handleDistrictChange = (name: string) => {
    const district = districts.find(d => d.name === name);
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
      previews.forEach(p => {
        formData.append("files", p.file);
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
      <div className="w-full max-w-[800px] bg-surface-container-lowest rounded-3xl ambient-shadow p-xl md:p-2xl border border-outline-variant/30">
        <div className="text-center mb-xl">
          <span className="material-symbols-outlined text-[48px] text-primary mb-md">add_home</span>
          <h1 className="font-headline-lg text-on-surface mb-xs">Yeni İlan Ekle</h1>
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
              placeholder="Kadıköy Moda'da Deniz Manzaralı Oda"
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
              placeholder="10.000"
              className="w-full bg-surface-container px-md py-sm rounded-xl font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary border-none"
              required
            />
          </div>

          {/* Şehir, İlçe ve Mahalle Seçimi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="border border-outline-variant/30 rounded-xl bg-surface-container py-2">
              <Dropdown
                label="Şehir"
                icon="location_city"
                options={locationsLoading ? [] : cities.map(c => c.name)}
                value={cityName}
                onChange={handleCityChange}
                isLast={true}
              />
            </div>

            <div className="border border-outline-variant/30 rounded-xl bg-surface-container py-2">
              <Dropdown
                label="İlçe"
                icon="map"
                options={districts.map(d => d.name)}
                value={districtName}
                onChange={handleDistrictChange}
                isLast={true}
                disabled={!cityId}
              />
            </div>

            <div className="border border-outline-variant/30 rounded-xl bg-surface-container py-2">
              <Dropdown
                label="Mahalle"
                icon="my_location"
                options={neighborhoods.map(n => n.name)}
                value={neighborhood}
                onChange={setNeighborhood}
                isLast={true}
                disabled={!districtId}
              />
            </div>
          </div>

          {/* Fotoğraf Linki (File Upload) */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface" htmlFor="file">Evinizin Fotoğraflarını Yükleyin</label>
            <input
              id="file"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full bg-surface-container px-md py-sm rounded-xl font-body-md text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary-container hover:file:text-on-primary-container cursor-pointer"
            />
            
            {/* Fotoğraf Önizleme Galerisi */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-md mt-sm">
                {previews.map((p) => (
                  <div key={p.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-low shadow-sm">
                    {/* Görsel Önizleme */}
                    <img 
                      src={p.url} 
                      alt={p.file.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Hover İşlem Paneli (Cam Efekti) */}
                    <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-sm backdrop-blur-[2px]">
                      {/* Kırp Butonu */}
                      <button
                        type="button"
                        onClick={() => handleOpenCropper(p.id, p.url, p.file.name)}
                        className="w-10 h-10 rounded-full bg-surface-container-lowest/90 text-on-surface hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center shadow-lg cursor-pointer"
                        title="Kırp"
                      >
                        <span className="material-symbols-outlined text-[20px]">crop</span>
                      </button>

                      {/* Sil Butonu */}
                      <button
                        type="button"
                        onClick={() => handleDeletePreview(p.id, p.url)}
                        className="w-10 h-10 rounded-full bg-surface-container-lowest/90 text-error hover:bg-error hover:text-on-error transition-colors flex items-center justify-center shadow-lg cursor-pointer"
                        title="Sil"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>

                    {/* Dosya Adı Altlığı */}
                    <div className="absolute bottom-0 inset-x-0 bg-neutral-950/60 py-1 px-2 text-[10px] text-white truncate text-center">
                      {p.file.name}
                    </div>
                  </div>
                ))}
              </div>
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

      <ImageCropperModal
        isOpen={cropperOpen}
        imageUrl={cropImageUrl}
        originalFileName={cropFileName}
        onClose={() => setCropperOpen(false)}
        onCropSave={handleCropSave}
      />
    </div>
  );
}
