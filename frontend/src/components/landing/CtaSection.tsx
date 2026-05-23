import { ArrowRight } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="bg-primary relative overflow-hidden">
      <div className="absolute inset-0 dotted-grid opacity-10"></div>
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-20 text-center text-white">
        <h2 className="text-[36px] sm:text-[44px] font-bold tracking-tight">Get back to teaching.</h2>
        <p className="mt-4 text-white/80 text-[16px] max-w-xl mx-auto">Spend your evenings reading, not retyping. Set up your first class in under a minute.</p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <a href="/signin?mode=register" className="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-white text-primary-dark font-semibold text-[14px] hover:bg-primary-light press tx">
            Create free account <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </a>
          <a href="/app" className="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-primary-dark/40 text-white font-semibold text-[14px] hover:bg-primary-dark/60 border border-white/20 press tx">
            Try the demo first
          </a>
        </div>
      </div>
    </section>
  );
}
