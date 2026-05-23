export function LandingFooter() {
  return (
    <footer className="bg-navy text-white/80">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="AralSync" style={{ height: '34px', objectFit: 'contain' }} draggable={false} />
          </div>
          <p className="mt-3 text-[13px] text-white/55 max-w-xs">Offline-first classroom records for Philippine public school teachers.</p>
          <p className="mt-3 text-[11px] text-white/40">Teach more. Sync seamlessly.</p>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-3">Product</div>
          <ul className="space-y-2 text-[13px]">
            <li><a href="#features" className="hover:text-white">Features</a></li>
            <li><a href="#offline" className="hover:text-white">Offline-first</a></li>
            <li><a href="#deped" className="hover:text-white">DepEd alignment</a></li>
            <li><a href="/app" className="hover:text-white">Live demo</a></li>
          </ul>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-3">Resources</div>
          <ul className="space-y-2 text-[13px]">
            <li><a href="#faq" className="hover:text-white">FAQ</a></li>
            <li><a href="#" className="hover:text-white">Changelog</a></li>
            <li><a href="#" className="hover:text-white">Help center</a></li>
          </ul>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-3">Get in touch</div>
          <ul className="space-y-2 text-[13px]">
            <li><a href="/signin" className="hover:text-white">Sign in</a></li>
            <li><a href="/signin?mode=register" className="hover:text-white">Create account</a></li>
            <li><a href="mailto:hello@aralsync.com" className="hover:text-white">hello@aralsync.com</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between flex-wrap gap-3 text-[12px] text-white/40">
          <span>© 2024–2025 AralSync · v1.0.0 (Beta)</span>
          <div className="flex items-center gap-5">
            <a href="/privacy" className="hover:text-white">Privacy</a>
            <a href="/terms" className="hover:text-white">Terms</a>
            <a href="/data-policy" className="hover:text-white">Data policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
