"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { messageService } from '@/services/messageService';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser(currentUser);
    } else if (authService.isAuthenticated()) {
      setUser({ firstName: 'Kullanıcı', email: 'Kullanıcı' });
    } else {
      setUser(null);
    }
  }, [pathname]);

  // Okunmamış mesaj sayısını yükle
  useEffect(() => {
    if (isMounted && user) {
      const loadUnread = async () => {
        try {
          const count = await messageService.getUnreadCount();
          setUnreadCount(count);
        } catch {
          // silently ignore
        }
      };
      loadUnread();
      const interval = setInterval(loadUnread, 30000);

      // Mesaj okunduğunda anında güncelle
      const handleMessagesRead = () => loadUnread();
      window.addEventListener('messagesRead', handleMessagesRead);

      return () => {
        clearInterval(interval);
        window.removeEventListener('messagesRead', handleMessagesRead);
      };
    }
  }, [isMounted, user]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  const isActive = (path: string) => {
    return pathname === path 
      ? "text-primary font-bold border-b-2 border-primary pb-1 font-label-md text-label-md transition-colors duration-200" 
      : "text-on-surface-variant font-medium font-label-md text-label-md hover:text-primary transition-colors duration-200";
  };

  return (
    <header className="bg-surface sticky top-0 z-50 border-b border-outline-variant shadow-sm w-full">
      <div className="flex justify-between items-center px-gutter py-4 w-full max-w-container-max mx-auto">
        {/* Brand Logo */}
        <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">
          HomeMate
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-md">
          <Link href="/" className={isActive("/")}>
            Ev Arkadaşı Bul
          </Link>
          <Link href="/ads/create" className={isActive("/ads/create")}>
            İlan Ver
          </Link>
          <Link href="/test" className={isActive("/test")}>
            Kişilik Testi
          </Link>
        </nav>

        {/* Auth Links */}
        <div className="flex items-center gap-sm text-on-surface-variant">
          {!isMounted ? (
            <div className="w-20 h-10 animate-pulse bg-surface-container rounded-lg"></div>
          ) : user ? (
            <div className="flex items-center gap-md">
              {/* Mesaj İkonu */}
              <Link href="/messages" className="relative p-2 rounded-full hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[22px] text-on-surface-variant">chat_bubble</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error text-on-error rounded-full flex items-center justify-center text-[11px] font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              
              <Link href="/profile" className="flex items-center gap-xs bg-surface-container rounded-full pl-1 pr-3 py-1 border border-outline-variant/30 hover:bg-surface-container-high transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md uppercase overflow-hidden">
                  {user.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    user.firstName ? user.firstName.charAt(0) : user.email.charAt(0)
                  )}
                </div>
                <span className="font-label-md text-on-surface hidden md:inline-block">
                  {user.firstName || user.email.split('@')[0]}
                </span>
              </Link>
              <button 
                onClick={handleLogout}
                className="font-label-md text-error hover:bg-error/10 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span className="hidden md:inline">Çıkış</span>
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="font-label-md text-primary hover:underline px-4 py-2">
                Giriş Yap
              </Link>
              <Link href="/register" className="bg-primary text-on-primary font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm">
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
