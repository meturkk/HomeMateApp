"use client";

import { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  label: string;
  icon: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  isLast?: boolean;
}

export default function Dropdown({ label, icon, options, value, onChange, isLast }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className={`w-full flex items-center gap-sm px-sm ${isLast ? '' : 'lg:border-r'} border-outline-variant/30 relative`} ref={dropdownRef}>
      <span className="material-symbols-outlined text-outline">{icon}</span>
      <div 
        className="flex flex-col w-full cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <label className="font-label-sm text-label-sm text-on-surface-variant cursor-pointer">{label}</label>
        <div className="flex items-center justify-between">
          <span className="font-body-md text-body-md text-on-surface truncate pr-2">{value || 'Seçiniz'}</span>
          <span className="material-symbols-outlined text-outline text-[18px] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            expand_more
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-4 w-full md:w-[calc(100%+2rem)] md:-ml-4 bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-lg z-50 overflow-hidden transform origin-top transition-all animate-in fade-in zoom-in-95 duration-200">
          <ul className="py-2">
            {options.map((opt, idx) => (
              <li 
                key={idx}
                className={`px-4 py-3 font-body-md text-body-md cursor-pointer transition-colors flex items-center justify-between ${value === opt ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface hover:bg-surface-container-low'}`}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
              >
                {opt}
                {value === opt && <span className="material-symbols-outlined text-[18px]">check</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
