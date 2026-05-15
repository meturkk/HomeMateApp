"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      
      alert("Kayıt işlemi başarılı! Lütfen giriş yapın.");
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Kayıt olurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-gutter py-xl">
      <div className="w-full max-w-[448px] bg-surface-container-lowest rounded-xl border border-outline-variant/30 ambient-shadow p-lg">
        <div className="text-center mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Kayıt Ol</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Aramıza katıl ve mükemmel ev arkadaşını bul!
          </p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container font-label-md p-sm rounded-lg mb-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div className="flex gap-sm">
            <div className="flex-1 flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="firstName">
                Adınız
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full bg-surface border border-outline-variant rounded-lg p-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Örn. Zeynep"
              />
            </div>
            <div className="flex-1 flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="lastName">
                Soyadınız
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full bg-surface border border-outline-variant rounded-lg p-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Örn. Yılmaz"
              />
            </div>
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
              E-posta Adresi
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-surface border border-outline-variant rounded-lg p-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="ornek@mail.com"
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full bg-surface border border-outline-variant rounded-lg p-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="En az 6 karakter"
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="confirmPassword">
              Şifre (Tekrar)
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full bg-surface border border-outline-variant rounded-lg p-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Şifrenizi tekrar girin"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm rounded-lg hover:opacity-90 transition-opacity mt-sm disabled:opacity-50"
          >
            {isLoading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="mt-lg text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Zaten hesabın var mı?{' '}
            <Link href="/login" className="font-label-md text-label-md text-primary hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
