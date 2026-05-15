import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-surface sticky top-0 z-50 border-b border-outline-variant shadow-sm w-full">
      <div className="flex justify-between items-center px-gutter py-4 w-full max-w-container-max mx-auto">
        {/* Brand Logo */}
        <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">
          HomeMate
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-md">
          <Link href="/" className="text-primary font-bold border-b-2 border-primary pb-1 font-label-md text-label-md hover:text-primary transition-colors duration-200">
            Ev Arkadaşı Bul
          </Link>
          <Link href="/ads/new" className="text-on-surface-variant font-medium font-label-md text-label-md hover:text-primary transition-colors duration-200">
            İlan Ver
          </Link>
          <Link href="/test" className="text-on-surface-variant font-medium font-label-md text-label-md hover:text-primary transition-colors duration-200">
            Kişilik Testi
          </Link>
        </nav>

        {/* Auth Links (Replaced trailing icons with auth buttons) */}
        <div className="flex items-center gap-sm text-on-surface-variant">
          <Link href="/login" className="font-label-md text-primary hover:underline px-4 py-2">
            Giriş Yap
          </Link>
          <Link href="/register" className="bg-primary text-on-primary font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm">
            Kayıt Ol
          </Link>
        </div>
      </div>
    </header>
  );
}
