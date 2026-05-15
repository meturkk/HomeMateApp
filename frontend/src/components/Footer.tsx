export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-gutter py-md w-full max-w-container-max mx-auto gap-md">
        <div className="flex items-center gap-sm">
          <span className="font-headline-md text-headline-md font-bold text-primary">HomeMate</span>
          <span className="font-body-md text-body-md text-on-surface hidden md:inline ml-sm border-l border-outline-variant pl-sm">
            © 2026 HomeMate. Tüm hakları saklıdır.
          </span>
        </div>
        <nav className="flex flex-wrap justify-center gap-sm md:gap-md">
          <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary transition-all rounded px-1">Hakkımızda</a>
          <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary transition-all rounded px-1">Gizlilik</a>
          <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary transition-all rounded px-1">İletişim</a>
          <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary transition-all rounded px-1">Kurallar</a>
          <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary transition-all rounded px-1">Güvenlik</a>
        </nav>
        <span className="font-body-md text-body-md text-on-surface md:hidden mt-sm text-center">
          © 2026 HomeMate. Tüm hakları saklıdır.
        </span>
      </div>
    </footer>
  );
}
