"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login({ email, password });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Giriş yapılamadı. E-posta veya şifrenizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-gutter">
      <div className="w-full max-w-[448px] bg-surface-container-lowest rounded-xl border border-outline-variant/30 ambient-shadow p-lg">
        <div className="text-center mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Hoş Geldin!</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Hesabına giriş yap ve mükemmel ev arkadaşını bul.
          </p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container font-label-md p-sm rounded-lg mb-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
              E-posta Adresi
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface border border-outline-variant rounded-lg p-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="ornek@mail.com"
            />
          </div>

          <div className="flex flex-col gap-xs">
            <div className="flex justify-between items-center">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
                Şifre
              </label>
              <a href="#" className="font-label-sm text-label-sm text-primary hover:underline">
                Şifremi Unuttum
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-surface border border-outline-variant rounded-lg p-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm rounded-lg hover:opacity-90 transition-opacity mt-sm disabled:opacity-50"
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-lg text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Hesabın yok mu?{' '}
            <Link href="/register" className="font-label-md text-label-md text-primary hover:underline">
              Hemen Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
