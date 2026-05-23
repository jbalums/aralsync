import { ArrowRight, Play, WifiOff, ShieldCheck, Zap, RefreshCw, Users, Award, Save } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 dotted-grid opacity-50"></div>
      <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(16,185,129,0.18), transparent 70%)' }}></div>
      <div className="absolute -bottom-40 -left-32 w-[420px] h-[420px] rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(15,118,110,0.15), transparent 70%)' }}></div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-20 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
        {/* Left: headline + CTAs */}
        <div data-reveal>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light/70 text-primary-dark text-[12px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></span>
            Built for Philippine public school teachers
          </span>
          <h1 className="mt-5 text-[40px] sm:text-[56px] leading-[1.05] font-bold tracking-tight text-navy">
            Teach more.<br /><span className="gradient-text">Sync seamlessly.</span>
          </h1>
          <p className="mt-5 text-[16.5px] text-muted leading-relaxed max-w-xl">
            AralSync is the offline-first attendance and academic record system for DepEd classrooms. Save records to your device instantly — sync to the cloud only when the WiFi feels generous.
          </p>
          <div className="mt-7 flex items-center gap-3 flex-wrap">
            <a href="/signin?mode=register" className="inline-flex items-center gap-2 h-12 px-5 rounded-md bg-primary text-white font-semibold text-[14px] hover:bg-primary-dark press tx">
              Create teacher account <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </a>
            <a href="/app" className="inline-flex items-center gap-2 h-12 px-5 rounded-md bg-white border border-line text-navy font-semibold text-[14px] hover:bg-slate-50 press tx">
              <Play className="w-4 h-4" strokeWidth={1.75} /> Try the demo
            </a>
          </div>
          <div className="mt-8 flex items-center gap-6 text-[12.5px] text-muted">
            <div className="flex items-center gap-2"><WifiOff className="w-4 h-4 text-primary" strokeWidth={1.75} /> Works offline</div>
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" strokeWidth={1.75} /> DepEd-aligned</div>
            <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" strokeWidth={1.75} /> 30-second roll call</div>
          </div>
        </div>

        {/* Right: attendance mock UI */}
        <div className="relative" data-reveal>
          <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/10 to-emerald-300/15 blur-2xl"></div>
          <div className="relative rounded-2xl bg-white soft-shadow border border-line/80 overflow-hidden">
            {/* Topbar */}
            <div className="h-10 bg-surface border-b border-line flex items-center px-3 gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400/70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70"></span>
              <span className="ml-3 text-[11px] font-mono text-muted-light">aralsync.com / attendance · Grade 7 — Rizal</span>
              <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold pr-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 pulse-dot"></span>Offline · saving locally
              </span>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[12px] text-muted">Science · Grade 7 – Rizal · Room 104</div>
                  <div className="text-[18px] font-semibold tracking-tight text-navy">Take attendance</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">marked</div>
                  <div className="text-[20px] font-bold font-mono text-navy">38<span className="text-muted text-[14px]">/42</span></div>
                </div>
              </div>
              {/* Segmented progress */}
              <div className="flex w-full h-2 rounded-full overflow-hidden bg-slate-100 mb-4">
                <div style={{ width: '82%', background: '#10B981' }}></div>
                <div style={{ width: '5%', background: '#F59E0B' }}></div>
                <div style={{ width: '3%', background: '#EF4444' }}></div>
                <div style={{ width: '2%', background: '#8B5CF6' }}></div>
              </div>
              {/* Student rows */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 rounded-md border border-line">
                  <div className="w-9 h-9 rounded-full inline-flex items-center justify-center font-semibold text-[12px]" style={{ background: '#CCFBF1', color: '#0F766E' }}>JR</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-navy">dela Cruz, Juan R.</div>
                    <div className="text-[10.5px] text-muted font-mono">LRN ••• 0001 · Att 96%</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border-2" style={{ background: '#D1FAE5', color: '#065F46', borderColor: '#10B981' }}>P</span>
                    <span className="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">L</span>
                    <span className="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">A</span>
                    <span className="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">E</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-md border border-line bg-slate-50/40">
                  <div className="w-9 h-9 rounded-full inline-flex items-center justify-center font-semibold text-[12px]" style={{ background: '#DBEAFE', color: '#1D4ED8' }}>CM</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-navy">Mendoza, Carlo P.</div>
                    <div className="text-[10.5px] text-muted font-mono">LRN ••• 0005 · Att 84%</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">P</span>
                    <span className="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border-2" style={{ background: '#FEF3C7', color: '#78350F', borderColor: '#F59E0B' }}>L</span>
                    <span className="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">A</span>
                    <span className="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">E</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-md border border-line">
                  <div className="w-9 h-9 rounded-full inline-flex items-center justify-center font-semibold text-[12px]" style={{ background: '#FFE4E6', color: '#9F1239' }}>MT</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-navy">Torres, Miguel A.</div>
                    <div className="text-[10.5px] text-muted font-mono">LRN ••• 0007 · Att 76%</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">P</span>
                    <span className="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">L</span>
                    <span className="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border-2" style={{ background: '#FEE2E2', color: '#7F1D1D', borderColor: '#EF4444' }}>A</span>
                    <span className="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">E</span>
                  </div>
                </div>
              </div>
              {/* Bottom action */}
              <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-line">
                <div className="text-[12px] text-muted"><span className="font-semibold text-navy">4</span> unmarked</div>
                <button className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-white text-[13px] font-semibold">
                  <Save className="w-4 h-4" strokeWidth={1.75} /> Save &amp; Sync
                </button>
              </div>
            </div>
          </div>

          {/* Floating sync pill */}
          <div className="absolute -bottom-5 -left-3 sm:-left-6 bg-white rounded-md border border-line soft-shadow px-3 py-2 flex items-center gap-2.5 float-anim">
            <span className="w-8 h-8 rounded-md bg-primary text-white inline-flex items-center justify-center">
              <RefreshCw className="w-4 h-4" strokeWidth={1.75} />
            </span>
            <div>
              <div className="text-[11px] text-muted">3 records queued</div>
              <div className="text-[12.5px] font-semibold text-navy">Will sync at 4:12 PM</div>
            </div>
          </div>
          {/* Floating connection pill */}
          <div className="absolute -top-3 -right-3 bg-white rounded-md border border-line soft-shadow px-3 py-2 flex items-center gap-2 float-anim" style={{ animationDelay: '-3s' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot"></span>
            <span className="text-[12px] font-semibold text-navy">LAN peer · Sir Reyes' Laptop</span>
          </div>
        </div>
      </div>

      {/* Marquee strip */}
      <div className="relative border-t border-line bg-white/70 py-5 marquee-mask">
        <div className="flex gap-12 marquee-track w-max">
          <div className="flex items-center gap-12 text-[12.5px] font-semibold text-muted">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" strokeWidth={1.75} /> DepEd SF2 · SF9 · SF10</span>
            <span className="flex items-center gap-2"><WifiOff className="w-4 h-4 text-primary" strokeWidth={1.75} /> Offline-first by default</span>
            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" strokeWidth={1.75} /> WW · PT · QA grading</span>
            <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 text-primary" strokeWidth={1.75} /> LAN sync between teachers</span>
            <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" strokeWidth={1.75} /> 30-sec attendance</span>
            <span className="flex items-center gap-2"><Award className="w-4 h-4 text-primary" strokeWidth={1.75} /> Auto honor roll</span>
          </div>
          <div className="flex items-center gap-12 text-[12.5px] font-semibold text-muted" aria-hidden="true">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" strokeWidth={1.75} /> DepEd SF2 · SF9 · SF10</span>
            <span className="flex items-center gap-2"><WifiOff className="w-4 h-4 text-primary" strokeWidth={1.75} /> Offline-first by default</span>
            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" strokeWidth={1.75} /> WW · PT · QA grading</span>
            <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 text-primary" strokeWidth={1.75} /> LAN sync between teachers</span>
            <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" strokeWidth={1.75} /> 30-sec attendance</span>
            <span className="flex items-center gap-2"><Award className="w-4 h-4 text-primary" strokeWidth={1.75} /> Auto honor roll</span>
          </div>
        </div>
      </div>
    </section>
  );
}
