"use client";

import { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  label: string;
  icon: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  isLast?: boolean;
  disabled?: boolean;
}

// Türkçe karakter duyarlı arama için normalizasyon fonksiyonu
const normalizeTurkish = (str: string) => {
  return str
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/Ş/g, 'ş')
    .replace(/Ğ/g, 'ğ')
    .replace(/Ü/g, 'ü')
    .replace(/Ö/g, 'ö')
    .replace(/Ç/g, 'ç')
    .toLowerCase();
};

export default function Dropdown({ label, icon, options, value, onChange, isLast, disabled }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dropdown açılıp kapandığında arama kutusunu temizle
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Arama filtresi uygula
  const filteredOptions = options.filter(opt =>
    normalizeTurkish(opt).includes(normalizeTurkish(searchQuery))
  );

  return (
    <div className={`w-full flex items-center gap-sm px-sm ${isLast ? '' : 'lg:border-r'} border-outline-variant/30 relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={dropdownRef}>
      <span className="material-symbols-outlined text-outline">{icon}</span>
      <div
        className={`flex flex-col flex-1 min-w-0 select-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <label className="font-label-sm text-label-sm text-on-surface-variant cursor-pointer">{label}</label>
        <div className="flex items-center justify-between">
          <span className="font-body-sm text-body-sm text-on-surface truncate pr-2">{value || 'Seçiniz'}</span>
          <span className="material-symbols-outlined text-outline text-[18px] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            expand_more
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full md:w-[calc(100%+2rem)] md:-ml-4 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col transform origin-top transition-all animate-in fade-in zoom-in-95 duration-200">

          {/* Arama Girişi Kutusu */}
          <div
            className="px-3 py-2 border-b border-outline-variant/30 flex items-center gap-xs sticky top-0 bg-surface-container-lowest z-10"
            onClick={(e) => e.stopPropagation()} // Arama kutusuna tıklanınca dropdown'ın kapanmasını önle
          >
            <span className="material-symbols-outlined text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none py-1 px-2 font-body-sm text-on-surface focus:outline-none focus:ring-0 placeholder:text-outline focus:border-none"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="material-symbols-outlined text-outline text-[18px] hover:text-on-surface transition-colors"
              >
                close
              </button>
            )}
          </div>

          {/* Seçenekler Listesi (Max Yükseklik Sınırı ile) */}
          <ul className="py-1 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-outline-variant">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-4 text-center font-body-sm text-outline-variant italic">
                Sonuç bulunamadı
              </li>
            ) : (
              filteredOptions.map((opt, idx) => (
                <li
                  key={idx}
                  className={`px-4 py-2 font-body-sm text-body-sm cursor-pointer transition-colors flex items-center justify-between ${value === opt ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface hover:bg-surface-container-low'}`}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                >
                  {opt}
                  {value === opt && <span className="material-symbols-outlined text-[18px]">check</span>}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
