import { HardDrive, GitMerge, Lock } from 'lucide-react';

export function OfflineSection() {
  return (
    <section id="offline" className="bg-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 dotted-grid opacity-10"></div>
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div data-reveal>
          <span className="text-[12px] font-semibold tracking-[0.16em] uppercase text-emerald-300">Offline-first architecture</span>
          <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight mt-3">Your records don't depend on a router that doesn't work.</h2>
          <p className="mt-5 text-[15px] text-white/70 leading-relaxed">Every action saves to your device first. AralSync then quietly negotiates with cloud, LAN peers, or USB backup - whichever is available, whenever it's available.</p>
          <div className="mt-7 space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 inline-flex items-center justify-center shrink-0 mt-0.5">
                <HardDrive className="w-3.5 h-3.5" strokeWidth={1.75} />
              </span>
              <div>
                <div className="font-semibold">Local-first writes</div>
                <div className="text-[13px] text-white/60">Attendance, grades, notes - committed to device storage in {'<'}5ms.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 inline-flex items-center justify-center shrink-0 mt-0.5">
                <GitMerge className="w-3.5 h-3.5" strokeWidth={1.75} />
              </span>
              <div>
                <div className="font-semibold">Conflict-aware sync</div>
                <div className="text-[13px] text-white/60">Last-write-wins per cell, with full edit history. You see what was overwritten and by whom.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 inline-flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-3.5 h-3.5" strokeWidth={1.75} />
              </span>
              <div>
                <div className="font-semibold">Encrypted everywhere</div>
                <div className="text-[13px] text-white/60">Data at rest is encrypted on device. LAN sync uses end-to-end keys you control.</div>
              </div>
            </div>
          </div>
        </div>

        {/* SVG connection map */}
        <div className="relative" data-reveal>
          <div className="rounded-xl bg-white/5 backdrop-blur border border-white/10 p-6">
            <div className="text-[11px] uppercase tracking-wider text-white/50 font-semibold mb-4">Live connection map</div>
            <svg viewBox="0 0 480 220" className="w-full">
              <g transform="translate(40, 50)">
                <circle r="32" fill="#10B981" />
                <text x="0" y="6" fill="white" fontSize="22" fontWeight="700" textAnchor="middle">☁</text>
                <text x="0" y="64" fill="white" fontSize="11" fontWeight="600" textAnchor="middle">Cloud</text>
                <text x="0" y="79" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">Online</text>
              </g>
              <g transform="translate(240, 110)">
                <circle r="38" fill="#0F766E" />
                <text x="0" y="6" fill="white" fontSize="22" fontWeight="700" textAnchor="middle">📱</text>
                <text x="0" y="68" fill="white" fontSize="12" fontWeight="600" textAnchor="middle">Maria's iPad</text>
                <text x="0" y="83" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">This device · 42.3 MB</text>
              </g>
              <g transform="translate(440, 50)">
                <circle r="28" fill="#6366F1" />
                <text x="0" y="6" fill="white" fontSize="18" fontWeight="700" textAnchor="middle">💻</text>
                <text x="0" y="58" fill="white" fontSize="11" fontWeight="600" textAnchor="middle">LAN peer</text>
              </g>
              <g transform="translate(40, 170)">
                <circle r="22" fill="#94A3B8" />
                <text x="0" y="5" fill="white" fontSize="14" fontWeight="700" textAnchor="middle">💾</text>
                <text x="0" y="48" fill="white" fontSize="11" fontWeight="600" textAnchor="middle">USB backup</text>
              </g>
              <line x1="72" y1="60" x2="208" y2="100" stroke="#10B981" strokeWidth="2.5" className="dash-anim" />
              <line x1="412" y1="60" x2="272" y2="100" stroke="#6366F1" strokeWidth="2.5" className="dash-anim" />
              <line x1="62" y1="170" x2="212" y2="125" stroke="#94A3B8" strokeWidth="2" strokeDasharray="2 4" />
            </svg>
            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
              <div className="rounded-md bg-white/5 p-2.5">
                <div className="text-[10px] text-white/50 uppercase">Cloud</div>
                <div className="text-[13px] font-semibold text-emerald-300 mt-1">3 pending</div>
              </div>
              <div className="rounded-md bg-white/5 p-2.5">
                <div className="text-[10px] text-white/50 uppercase">LAN</div>
                <div className="text-[13px] font-semibold text-indigo-300 mt-1">1 peer</div>
              </div>
              <div className="rounded-md bg-white/5 p-2.5">
                <div className="text-[10px] text-white/50 uppercase">USB</div>
                <div className="text-[13px] font-semibold text-white/70 mt-1">Mon backup</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
