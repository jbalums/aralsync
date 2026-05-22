import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Marketing page — keeps the original HTML markup verbatim (including its
// own <style> block) and re-runs lucide + reveal-on-scroll in a useEffect.
const LANDING_HTML = `<style>
  :root { --primary:#0F766E; --accent:#10B981; --navy:#0F172A; --surface:#F8FAFC; }
  body { font-family:'Inter', system-ui, sans-serif; color:#0F172A; background:#FBFCFD; -webkit-font-smoothing:antialiased; font-feature-settings:'cv11','ss01'; }
  .grid-bg { background-image: radial-gradient(rgba(15,118,110,0.08) 1px, transparent 1px); background-size: 18px 18px; }
  .dotted-grid { background-image: linear-gradient(rgba(15,118,110,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,118,110,0.08) 1px, transparent 1px); background-size: 32px 32px; }
  @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:.45} }
  .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  .float-anim { animation: float 6s ease-in-out infinite; }
  @keyframes dash { to { stroke-dashoffset: -24; } }
  .dash-anim { stroke-dasharray: 6 6; animation: dash 1.6s linear infinite; }
  .press:active { transform: scale(0.97); }
  .press, .tx { transition: all 150ms ease; }
  [data-lucide] { width:18px; height:18px; stroke-width:1.75; }
  .gradient-text { background: linear-gradient(120deg, #0F766E 0%, #10B981 60%, #0EA5A4 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .ring-shadow { box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 0 0 1px rgba(15,23,42,0.05); }
  .soft-shadow { box-shadow: 0 4px 24px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04); }
  .marquee-mask { mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent); -webkit-mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent); }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .marquee-track { animation: marquee 28s linear infinite; }
  /* Section reveal on scroll using IntersectionObserver via [data-reveal] */
  [data-reveal] { opacity: 0; transform: translateY(8px); transition: opacity 600ms ease, transform 600ms ease; }
  [data-reveal].in { opacity: 1; transform: none; }
</style>


<!-- ── NAV ──────────────────────────────────────────────── -->
<header class="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-line/80">
  <div class="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2 group">
      <span class="w-8 h-8 rounded-md bg-primary inline-flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12.55a11 11 0 0 1 14 0"/><path d="M8.5 16a6.5 6.5 0 0 1 7 0"/><circle cx="12" cy="20" r="1.2" fill="white" stroke="none"/>
        </svg>
      </span>
      <span class="leading-none">
        <span class="text-[20px] font-extrabold tracking-tight text-primary">Aral</span><span class="text-[20px] font-medium tracking-tight text-navy/80">Sync</span>
      </span>
    </a>
    <nav class="hidden md:flex items-center gap-7 text-[13.5px] text-navy/75 font-medium">
      <a href="#features" class="hover:text-primary tx">Features</a>
      <a href="#offline" class="hover:text-primary tx">Offline-first</a>
      <a href="#deped" class="hover:text-primary tx">DepEd-ready</a>
      <a href="#preview" class="hover:text-primary tx">See it</a>
      <a href="#faq" class="hover:text-primary tx">FAQ</a>
    </nav>
    <div class="flex items-center gap-2">
      <a href="/signin" class="hidden sm:inline-flex h-9 px-3.5 items-center text-[13px] font-semibold text-navy hover:bg-slate-100 rounded-md tx">Sign in</a>
      <a href="/signin?mode=register" class="inline-flex h-9 px-3.5 items-center gap-1.5 text-[13px] font-semibold bg-primary text-white rounded-md hover:bg-primary-dark press tx">
        Get started <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
      </a>
    </div>
  </div>
</header>

<!-- ── HERO ─────────────────────────────────────────────── -->
<section class="relative overflow-hidden">
  <div class="absolute inset-0 dotted-grid opacity-50"></div>
  <div class="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full" style="background: radial-gradient(closest-side, rgba(16,185,129,0.18), transparent 70%);"></div>
  <div class="absolute -bottom-40 -left-32 w-[420px] h-[420px] rounded-full" style="background: radial-gradient(closest-side, rgba(15,118,110,0.15), transparent 70%);"></div>

  <div class="relative max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-20 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
    <div data-reveal>
      <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light/70 text-primary-dark text-[12px] font-semibold">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></span>
        Built for Philippine public school teachers
      </span>
      <h1 class="mt-5 text-[40px] sm:text-[56px] leading-[1.05] font-bold tracking-tight text-navy">
        Teach more.<br/><span class="gradient-text">Sync seamlessly.</span>
      </h1>
      <p class="mt-5 text-[16.5px] text-muted leading-relaxed max-w-xl">
        AralSync is the offline-first attendance and academic record system for DepEd classrooms. Save records to your device instantly — sync to the cloud only when the WiFi feels generous.
      </p>
      <div class="mt-7 flex items-center gap-3 flex-wrap">
        <a href="/signin?mode=register" class="inline-flex items-center gap-2 h-12 px-5 rounded-md bg-primary text-white font-semibold text-[14px] hover:bg-primary-dark press tx">
          Create teacher account <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </a>
        <a href="/app" class="inline-flex items-center gap-2 h-12 px-5 rounded-md bg-white border border-line text-navy font-semibold text-[14px] hover:bg-slate-50 press tx">
          <i data-lucide="play" class="w-4 h-4"></i> Try the demo
        </a>
      </div>
      <div class="mt-8 flex items-center gap-6 text-[12.5px] text-muted">
        <div class="flex items-center gap-2"><i data-lucide="wifi-off" class="w-4 h-4 text-primary"></i> Works offline</div>
        <div class="flex items-center gap-2"><i data-lucide="shield-check" class="w-4 h-4 text-primary"></i> DepEd-aligned</div>
        <div class="flex items-center gap-2"><i data-lucide="zap" class="w-4 h-4 text-primary"></i> 30-second roll call</div>
      </div>
    </div>

    <!-- HERO MOCK -->
    <div class="relative" data-reveal>
      <div class="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/10 to-emerald-300/15 blur-2xl"></div>
      <div class="relative rounded-2xl bg-white soft-shadow border border-line/80 overflow-hidden">
        <!-- Topbar -->
        <div class="h-10 bg-surface border-b border-line flex items-center px-3 gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-400/70"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-amber-400/70"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400/70"></span>
          <span class="ml-3 text-[11px] font-mono text-muted-light">aralsync.com / attendance · Grade 7 — Rizal</span>
          <span class="ml-auto inline-flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold pr-1">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 pulse-dot"></span>Offline · saving locally
          </span>
        </div>
        <div class="p-4 sm:p-5">
          <div class="flex items-center justify-between mb-3">
            <div>
              <div class="text-[12px] text-muted">Science · Grade 7 – Rizal · Room 104</div>
              <div class="text-[18px] font-semibold tracking-tight text-navy">Take attendance</div>
            </div>
            <div class="text-right">
              <div class="text-[11px] uppercase tracking-wider text-muted font-semibold">marked</div>
              <div class="text-[20px] font-bold font-mono text-navy">38<span class="text-muted text-[14px]">/42</span></div>
            </div>
          </div>
          <!-- Segmented progress -->
          <div class="flex w-full h-2 rounded-full overflow-hidden bg-slate-100 mb-4">
            <div style="width:82%; background:#10B981;"></div>
            <div style="width:5%;  background:#F59E0B;"></div>
            <div style="width:3%;  background:#EF4444;"></div>
            <div style="width:2%;  background:#8B5CF6;"></div>
          </div>
          <!-- Student rows -->
          <div class="space-y-2">
            <!-- Row 1 -->
            <div class="flex items-center gap-3 p-2.5 rounded-md border border-line">
              <div class="w-9 h-9 rounded-full inline-flex items-center justify-center font-semibold text-[12px]" style="background:#CCFBF1; color:#0F766E;">JR</div>
              <div class="flex-1 min-w-0">
                <div class="text-[13.5px] font-semibold text-navy">dela Cruz, Juan R.</div>
                <div class="text-[10.5px] text-muted font-mono">LRN ••• 0001 · Att 96%</div>
              </div>
              <div class="flex items-center gap-1">
                <span class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border-2" style="background:#D1FAE5; color:#065F46; border-color:#10B981;">P</span>
                <span class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">L</span>
                <span class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">A</span>
                <span class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">E</span>
              </div>
            </div>
            <!-- Row 2 (late) -->
            <div class="flex items-center gap-3 p-2.5 rounded-md border border-line bg-slate-50/40">
              <div class="w-9 h-9 rounded-full inline-flex items-center justify-center font-semibold text-[12px]" style="background:#DBEAFE; color:#1D4ED8;">CM</div>
              <div class="flex-1 min-w-0">
                <div class="text-[13.5px] font-semibold text-navy">Mendoza, Carlo P.</div>
                <div class="text-[10.5px] text-muted font-mono">LRN ••• 0005 · Att 84%</div>
              </div>
              <div class="flex items-center gap-1">
                <span class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">P</span>
                <span class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border-2" style="background:#FEF3C7; color:#78350F; border-color:#F59E0B;">L</span>
                <span class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">A</span>
                <span class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">E</span>
              </div>
            </div>
            <!-- Row 3 (absent) -->
            <div class="flex items-center gap-3 p-2.5 rounded-md border border-line">
              <div class="w-9 h-9 rounded-full inline-flex items-center justify-center font-semibold text-[12px]" style="background:#FFE4E6; color:#9F1239;">MT</div>
              <div class="flex-1 min-w-0">
                <div class="text-[13.5px] font-semibold text-navy">Torres, Miguel A.</div>
                <div class="text-[10.5px] text-muted font-mono">LRN ••• 0007 · Att 76%</div>
              </div>
              <div class="flex items-center gap-1">
                <span class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">P</span>
                <span class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">L</span>
                <span class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border-2" style="background:#FEE2E2; color:#7F1D1D; border-color:#EF4444;">A</span>
                <span class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[10px] font-bold border border-line text-muted">E</span>
              </div>
            </div>
          </div>
          <!-- Bottom action -->
          <div class="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-line">
            <div class="text-[12px] text-muted"><span class="font-semibold text-navy">4</span> unmarked</div>
            <button class="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-white text-[13px] font-semibold">
              <i data-lucide="save" class="w-4 h-4"></i> Save & Sync
            </button>
          </div>
        </div>
      </div>

      <!-- Floating sync pill -->
      <div class="absolute -bottom-5 -left-3 sm:-left-6 bg-white rounded-md border border-line soft-shadow px-3 py-2 flex items-center gap-2.5 float-anim">
        <span class="w-8 h-8 rounded-md bg-primary text-white inline-flex items-center justify-center">
          <i data-lucide="refresh-cw" class="w-4 h-4"></i>
        </span>
        <div>
          <div class="text-[11px] text-muted">3 records queued</div>
          <div class="text-[12.5px] font-semibold text-navy">Will sync at 4:12 PM</div>
        </div>
      </div>
      <!-- Floating connection pill -->
      <div class="absolute -top-3 -right-3 bg-white rounded-md border border-line soft-shadow px-3 py-2 flex items-center gap-2 float-anim" style="animation-delay:-3s">
        <span class="w-2 h-2 rounded-full bg-emerald-500 pulse-dot"></span>
        <span class="text-[12px] font-semibold text-navy">LAN peer · Sir Reyes' Laptop</span>
      </div>
    </div>
  </div>

  <!-- Marquee strip -->
  <div class="relative border-t border-line bg-white/70 py-5 marquee-mask">
    <div class="flex gap-12 marquee-track w-max">
      <!-- duplicate set for seamless loop -->
      <div class="flex items-center gap-12 text-[12.5px] font-semibold text-muted">
        <span class="flex items-center gap-2"><i data-lucide="shield-check" class="w-4 h-4 text-primary"></i> DepEd SF2 · SF9 · SF10</span>
        <span class="flex items-center gap-2"><i data-lucide="wifi-off" class="w-4 h-4 text-primary"></i> Offline-first by default</span>
        <span class="flex items-center gap-2"><i data-lucide="users" class="w-4 h-4 text-primary"></i> WW · PT · QA grading</span>
        <span class="flex items-center gap-2"><i data-lucide="refresh-cw" class="w-4 h-4 text-primary"></i> LAN sync between teachers</span>
        <span class="flex items-center gap-2"><i data-lucide="zap" class="w-4 h-4 text-primary"></i> 30-sec attendance</span>
        <span class="flex items-center gap-2"><i data-lucide="award" class="w-4 h-4 text-primary"></i> Auto honor roll</span>
      </div>
      <div class="flex items-center gap-12 text-[12.5px] font-semibold text-muted" aria-hidden="true">
        <span class="flex items-center gap-2"><i data-lucide="shield-check" class="w-4 h-4 text-primary"></i> DepEd SF2 · SF9 · SF10</span>
        <span class="flex items-center gap-2"><i data-lucide="wifi-off" class="w-4 h-4 text-primary"></i> Offline-first by default</span>
        <span class="flex items-center gap-2"><i data-lucide="users" class="w-4 h-4 text-primary"></i> WW · PT · QA grading</span>
        <span class="flex items-center gap-2"><i data-lucide="refresh-cw" class="w-4 h-4 text-primary"></i> LAN sync between teachers</span>
        <span class="flex items-center gap-2"><i data-lucide="zap" class="w-4 h-4 text-primary"></i> 30-sec attendance</span>
        <span class="flex items-center gap-2"><i data-lucide="award" class="w-4 h-4 text-primary"></i> Auto honor roll</span>
      </div>
    </div>
  </div>
</section>

<!-- ── STATS ──────────────────────────────────────────── -->
<section class="max-w-7xl mx-auto px-5 sm:px-8 py-14">
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="rounded-lg border border-line p-5 bg-white" data-reveal>
      <div class="text-[34px] font-bold font-mono text-navy leading-none">30<span class="text-primary">s</span></div>
      <div class="text-[12.5px] text-muted mt-2">Average time to mark a class of 40 students</div>
    </div>
    <div class="rounded-lg border border-line p-5 bg-white" data-reveal>
      <div class="text-[34px] font-bold font-mono text-navy leading-none">0<span class="text-primary"> ms</span></div>
      <div class="text-[12.5px] text-muted mt-2">Connection required to save. Local first, always.</div>
    </div>
    <div class="rounded-lg border border-line p-5 bg-white" data-reveal>
      <div class="text-[34px] font-bold font-mono text-navy leading-none">100<span class="text-primary">%</span></div>
      <div class="text-[12.5px] text-muted mt-2">DepEd grading compliant — WW · PT · QA weights</div>
    </div>
    <div class="rounded-lg border border-line p-5 bg-white" data-reveal>
      <div class="text-[34px] font-bold font-mono text-navy leading-none">3<span class="text-primary"> SFs</span></div>
      <div class="text-[12.5px] text-muted mt-2">Generates SF2, SF9, SF10 forms one tap</div>
    </div>
  </div>
</section>

<!-- ── FEATURES ─────────────────────────────────────────── -->
<section id="features" class="max-w-7xl mx-auto px-5 sm:px-8 py-14">
  <div class="max-w-2xl" data-reveal>
    <span class="text-[12px] font-semibold tracking-[0.16em] uppercase text-primary">What it does</span>
    <h2 class="text-[32px] sm:text-[40px] font-bold tracking-tight text-navy mt-2">Everything your classroom paperwork needs.<br/><span class="text-muted font-normal">Nothing it doesn't.</span></h2>
  </div>

  <div class="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- Feature cards -->
    <div class="rounded-xl border border-line p-6 bg-white tx hover:-translate-y-0.5 hover:soft-shadow" data-reveal>
      <span class="w-10 h-10 rounded-md bg-primary-light text-primary inline-flex items-center justify-center"><i data-lucide="clipboard-check" class="w-5 h-5"></i></span>
      <h3 class="mt-4 text-[18px] font-semibold tracking-tight text-navy">Attendance in 30 seconds</h3>
      <p class="mt-1.5 text-[13.5px] text-muted leading-relaxed">Fat-finger-friendly rows, P/L/A/E shortcuts, and bulk "mark remaining present." Designed for the chaos right before homeroom.</p>
    </div>

    <div class="rounded-xl border border-line p-6 bg-white tx hover:-translate-y-0.5 hover:soft-shadow" data-reveal>
      <span class="w-10 h-10 rounded-md inline-flex items-center justify-center" style="background:#D1FAE5; color:#047857;"><i data-lucide="graduation-cap" class="w-5 h-5"></i></span>
      <h3 class="mt-4 text-[18px] font-semibold tracking-tight text-navy">DepEd-native grading</h3>
      <p class="mt-1.5 text-[13.5px] text-muted leading-relaxed">Written Works, Performance Tasks, and Quarterly Assessment with configurable weights. Transmuted grades calculated for you.</p>
    </div>

    <div class="rounded-xl border border-line p-6 bg-white tx hover:-translate-y-0.5 hover:soft-shadow" data-reveal>
      <span class="w-10 h-10 rounded-md inline-flex items-center justify-center" style="background:#FEF3C7; color:#92400E;"><i data-lucide="wifi-off" class="w-5 h-5"></i></span>
      <h3 class="mt-4 text-[18px] font-semibold tracking-tight text-navy">Offline by default</h3>
      <p class="mt-1.5 text-[13.5px] text-muted leading-relaxed">Records save instantly to your device — sync queues quietly until your school's WiFi co-operates. No data loss, ever.</p>
    </div>

    <div class="rounded-xl border border-line p-6 bg-white tx hover:-translate-y-0.5 hover:soft-shadow" data-reveal>
      <span class="w-10 h-10 rounded-md inline-flex items-center justify-center" style="background:#DBEAFE; color:#1D4ED8;"><i data-lucide="file-text" class="w-5 h-5"></i></span>
      <h3 class="mt-4 text-[18px] font-semibold tracking-tight text-navy">SF2, SF9, SF10 ready</h3>
      <p class="mt-1.5 text-[13.5px] text-muted leading-relaxed">Generate the forms your Division actually asks for. Print, PDF, or Excel — your roster, your honor roll, in seconds.</p>
    </div>

    <div class="rounded-xl border border-line p-6 bg-white tx hover:-translate-y-0.5 hover:soft-shadow" data-reveal>
      <span class="w-10 h-10 rounded-md inline-flex items-center justify-center" style="background:#EDE9FE; color:#6D28D9;"><i data-lucide="refresh-cw" class="w-5 h-5"></i></span>
      <h3 class="mt-4 text-[18px] font-semibold tracking-tight text-navy">LAN peer sync</h3>
      <p class="mt-1.5 text-[13.5px] text-muted leading-relaxed">Co-advisers can sync between devices on the same WiFi — even when the internet's out at school.</p>
    </div>

    <div class="rounded-xl border border-line p-6 bg-white tx hover:-translate-y-0.5 hover:soft-shadow" data-reveal>
      <span class="w-10 h-10 rounded-md inline-flex items-center justify-center" style="background:#FFE4E6; color:#9F1239;"><i data-lucide="life-buoy" class="w-5 h-5"></i></span>
      <h3 class="mt-4 text-[18px] font-semibold tracking-tight text-navy">At-risk early warning</h3>
      <p class="mt-1.5 text-[13.5px] text-muted leading-relaxed">Auto-flag learners falling below 80% attendance or 75 grade. Add notes, contact guardians, intervene early.</p>
    </div>
  </div>
</section>

<!-- ── OFFLINE-FIRST DEEP DIVE ──────────────────────────── -->
<section id="offline" class="bg-navy text-white relative overflow-hidden">
  <div class="absolute inset-0 dotted-grid opacity-10"></div>
  <div class="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    <div data-reveal>
      <span class="text-[12px] font-semibold tracking-[0.16em] uppercase text-emerald-300">Offline-first architecture</span>
      <h2 class="text-[32px] sm:text-[40px] font-bold tracking-tight mt-3">Your records don't depend on a router that doesn't work.</h2>
      <p class="mt-5 text-[15px] text-white/70 leading-relaxed">Every action saves to your device first. AralSync then quietly negotiates with cloud, LAN peers, or USB backup — whichever is available, whenever it's available.</p>
      <div class="mt-7 space-y-3">
        <div class="flex items-start gap-3">
          <span class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 inline-flex items-center justify-center shrink-0 mt-0.5"><i data-lucide="hard-drive" class="w-3.5 h-3.5"></i></span>
          <div><div class="font-semibold">Local-first writes</div><div class="text-[13px] text-white/60">Attendance, grades, notes — committed to device storage in &lt;5ms.</div></div>
        </div>
        <div class="flex items-start gap-3">
          <span class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 inline-flex items-center justify-center shrink-0 mt-0.5"><i data-lucide="git-merge" class="w-3.5 h-3.5"></i></span>
          <div><div class="font-semibold">Conflict-aware sync</div><div class="text-[13px] text-white/60">Last-write-wins per cell, with full edit history. You see what was overwritten and by whom.</div></div>
        </div>
        <div class="flex items-start gap-3">
          <span class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 inline-flex items-center justify-center shrink-0 mt-0.5"><i data-lucide="lock" class="w-3.5 h-3.5"></i></span>
          <div><div class="font-semibold">Encrypted everywhere</div><div class="text-[13px] text-white/60">Data at rest is encrypted on device. LAN sync uses end-to-end keys you control.</div></div>
        </div>
      </div>
    </div>

    <!-- Visualizer -->
    <div class="relative" data-reveal>
      <div class="rounded-xl bg-white/5 backdrop-blur border border-white/10 p-6">
        <div class="text-[11px] uppercase tracking-wider text-white/50 font-semibold mb-4">Live connection map</div>
        <svg viewBox="0 0 480 220" class="w-full">
          <!-- Cloud node -->
          <g transform="translate(40, 50)">
            <circle r="32" fill="#10B981"/>
            <text x="0" y="6" fill="white" font-size="22" font-weight="700" text-anchor="middle">☁</text>
            <text x="0" y="64" fill="white" font-size="11" font-weight="600" text-anchor="middle">Cloud</text>
            <text x="0" y="79" fill="rgba(255,255,255,0.5)" font-size="10" text-anchor="middle">Online</text>
          </g>
          <!-- This device -->
          <g transform="translate(240, 110)">
            <circle r="38" fill="#0F766E"/>
            <text x="0" y="6" fill="white" font-size="22" font-weight="700" text-anchor="middle">📱</text>
            <text x="0" y="68" fill="white" font-size="12" font-weight="600" text-anchor="middle">Maria's iPad</text>
            <text x="0" y="83" fill="rgba(255,255,255,0.5)" font-size="10" text-anchor="middle">This device · 42.3 MB</text>
          </g>
          <!-- Peer -->
          <g transform="translate(440, 50)">
            <circle r="28" fill="#6366F1"/>
            <text x="0" y="6" fill="white" font-size="18" font-weight="700" text-anchor="middle">💻</text>
            <text x="0" y="58" fill="white" font-size="11" font-weight="600" text-anchor="middle">LAN peer</text>
          </g>
          <!-- USB backup -->
          <g transform="translate(40, 170)">
            <circle r="22" fill="#94A3B8"/>
            <text x="0" y="5" fill="white" font-size="14" font-weight="700" text-anchor="middle">💾</text>
            <text x="0" y="48" fill="white" font-size="11" font-weight="600" text-anchor="middle">USB backup</text>
          </g>
          <!-- Lines -->
          <line x1="72" y1="60" x2="208" y2="100" stroke="#10B981" stroke-width="2.5" class="dash-anim"/>
          <line x1="412" y1="60" x2="272" y2="100" stroke="#6366F1" stroke-width="2.5" class="dash-anim"/>
          <line x1="62" y1="170" x2="212" y2="125" stroke="#94A3B8" stroke-width="2" stroke-dasharray="2 4"/>
        </svg>
        <div class="grid grid-cols-3 gap-3 mt-4 text-center">
          <div class="rounded-md bg-white/5 p-2.5"><div class="text-[10px] text-white/50 uppercase">Cloud</div><div class="text-[13px] font-semibold text-emerald-300 mt-1">3 pending</div></div>
          <div class="rounded-md bg-white/5 p-2.5"><div class="text-[10px] text-white/50 uppercase">LAN</div><div class="text-[13px] font-semibold text-indigo-300 mt-1">1 peer</div></div>
          <div class="rounded-md bg-white/5 p-2.5"><div class="text-[10px] text-white/50 uppercase">USB</div><div class="text-[13px] font-semibold text-white/70 mt-1">Mon backup</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ── DEPED ALIGNMENT ──────────────────────────────────── -->
<section id="deped" class="max-w-7xl mx-auto px-5 sm:px-8 py-20">
  <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
    <div data-reveal>
      <div class="rounded-xl border border-line bg-white p-5">
        <div class="text-[10px] tracking-widest font-semibold text-muted uppercase">DEPED-compliant transmutation</div>
        <div class="mt-2 text-[18px] font-semibold text-navy">WW · PT · QA → Quarterly Grade</div>
        <div class="mt-4 flex w-full h-3 rounded-full overflow-hidden">
          <div style="width:20%;background:#0F766E;"></div>
          <div style="width:60%;background:#10B981;"></div>
          <div style="width:20%;background:#6366F1;"></div>
        </div>
        <div class="mt-2 grid grid-cols-3 text-[11px] text-muted">
          <span>WW 20%</span><span class="text-center">PT 60%</span><span class="text-right">QA 20%</span>
        </div>
        <table class="w-full mt-5 text-[12.5px] border-collapse">
          <thead class="text-muted text-left">
            <tr><th class="font-semibold py-2">Threshold</th><th class="font-semibold py-2">Tier</th><th class="font-semibold py-2 text-right">Count</th></tr>
          </thead>
          <tbody>
            <tr class="border-t border-line"><td class="py-2 font-mono text-navy">≥ 98</td><td class="py-2">With Highest Honors</td><td class="py-2 text-right font-mono font-semibold">2</td></tr>
            <tr class="border-t border-line"><td class="py-2 font-mono text-navy">95–97</td><td class="py-2">With High Honors</td><td class="py-2 text-right font-mono font-semibold">5</td></tr>
            <tr class="border-t border-line"><td class="py-2 font-mono text-navy">90–94</td><td class="py-2">With Honors</td><td class="py-2 text-right font-mono font-semibold">14</td></tr>
            <tr class="border-t border-line"><td class="py-2 font-mono text-navy">≥ 75</td><td class="py-2">Passing</td><td class="py-2 text-right font-mono font-semibold">131</td></tr>
            <tr class="border-t border-line"><td class="py-2 font-mono text-rose-600">&lt; 75</td><td class="py-2">Needs intervention</td><td class="py-2 text-right font-mono font-semibold">3</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div data-reveal>
      <span class="text-[12px] font-semibold tracking-[0.16em] uppercase text-primary">DepEd-ready</span>
      <h2 class="text-[32px] sm:text-[40px] font-bold tracking-tight text-navy mt-2">Built around the forms you already file.</h2>
      <p class="mt-5 text-[15.5px] text-muted leading-relaxed">No more juggling spreadsheets, then re-typing into SF2 templates the night before submission. AralSync speaks DepEd natively.</p>

      <div class="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="rounded-lg border border-line p-4 bg-white">
          <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary-light text-primary-dark text-[10.5px] font-bold">SF2</div>
          <div class="text-[14px] font-semibold text-navy mt-2">Daily Attendance Record</div>
          <div class="text-[12px] text-muted mt-1">Monthly grid auto-generated from your daily marks.</div>
        </div>
        <div class="rounded-lg border border-line p-4 bg-white">
          <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary-light text-primary-dark text-[10.5px] font-bold">SF9</div>
          <div class="text-[14px] font-semibold text-navy mt-2">Learner's Report Card</div>
          <div class="text-[12px] text-muted mt-1">Per-student quarterly grade, ready for parent distribution.</div>
        </div>
        <div class="rounded-lg border border-line p-4 bg-white">
          <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary-light text-primary-dark text-[10.5px] font-bold">SF10</div>
          <div class="text-[14px] font-semibold text-navy mt-2">Permanent Record</div>
          <div class="text-[12px] text-muted mt-1">Cumulative academic history, locked to Q4 transmittal window.</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ── PREVIEW WIDE SHOT ────────────────────────────────── -->
<section id="preview" class="bg-surface border-y border-line py-20">
  <div class="max-w-7xl mx-auto px-5 sm:px-8">
    <div class="text-center max-w-2xl mx-auto" data-reveal>
      <span class="text-[12px] font-semibold tracking-[0.16em] uppercase text-primary">See it in action</span>
      <h2 class="text-[32px] sm:text-[40px] font-bold tracking-tight text-navy mt-2">Designed to disappear behind your teaching.</h2>
      <p class="mt-4 text-[15.5px] text-muted">Open the demo and click through every page — no sign-up required.</p>
    </div>
    <div class="mt-10 relative" data-reveal>
      <div class="absolute inset-0 -m-6 rounded-3xl bg-gradient-to-br from-primary/15 to-emerald-300/20 blur-3xl"></div>
      <div class="relative rounded-2xl bg-white soft-shadow border border-line overflow-hidden">
        <div class="h-9 bg-surface border-b border-line flex items-center px-3 gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-400/70"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-amber-400/70"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400/70"></span>
          <span class="mx-auto text-[11px] font-mono text-muted-light">aralsync.com / dashboard</span>
        </div>
        <div class="grid grid-cols-[180px_1fr] min-h-[420px]">
          <!-- Faux sidebar -->
          <div class="border-r border-line bg-white p-3 hidden sm:block">
            <div class="text-[10px] uppercase tracking-wider text-muted-light font-semibold px-2 mb-2">Main</div>
            <div class="space-y-0.5">
              <div class="px-2.5 py-1.5 rounded-md bg-primary-light/70 text-primary-dark text-[12.5px] font-semibold flex items-center gap-2"><i data-lucide="layout-dashboard" class="w-3.5 h-3.5"></i> Dashboard</div>
              <div class="px-2.5 py-1.5 rounded-md text-navy/70 text-[12.5px] font-medium flex items-center gap-2"><i data-lucide="book-marked" class="w-3.5 h-3.5"></i> Classes</div>
              <div class="px-2.5 py-1.5 rounded-md text-navy/70 text-[12.5px] font-medium flex items-center gap-2"><i data-lucide="users" class="w-3.5 h-3.5"></i> Students</div>
              <div class="px-2.5 py-1.5 rounded-md text-navy/70 text-[12.5px] font-medium flex items-center gap-2"><i data-lucide="clipboard-check" class="w-3.5 h-3.5"></i> Attendance</div>
              <div class="px-2.5 py-1.5 rounded-md text-navy/70 text-[12.5px] font-medium flex items-center gap-2"><i data-lucide="calendar-days" class="w-3.5 h-3.5"></i> Schedules</div>
            </div>
            <div class="text-[10px] uppercase tracking-wider text-muted-light font-semibold px-2 mt-4 mb-2">Academics</div>
            <div class="space-y-0.5">
              <div class="px-2.5 py-1.5 rounded-md text-navy/70 text-[12.5px] font-medium flex items-center gap-2"><i data-lucide="graduation-cap" class="w-3.5 h-3.5"></i> Gradebook</div>
              <div class="px-2.5 py-1.5 rounded-md text-navy/70 text-[12.5px] font-medium flex items-center gap-2"><i data-lucide="file-text" class="w-3.5 h-3.5"></i> Reports</div>
            </div>
          </div>
          <!-- Faux dashboard preview -->
          <div class="p-5">
            <div class="text-[10px] uppercase tracking-widest text-primary font-semibold">Tuesday · Q3 Week 8</div>
            <div class="text-[20px] font-semibold tracking-tight text-navy mt-1">Good morning, Ma'am Maria.</div>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
              <div class="rounded-lg border border-line p-3.5">
                <div class="text-[10.5px] uppercase tracking-wider text-muted font-semibold">Students today</div>
                <div class="text-[22px] font-bold font-mono text-navy mt-1">155<span class="text-muted text-[12px]">/165</span></div>
              </div>
              <div class="rounded-lg border border-line p-3.5">
                <div class="text-[10.5px] uppercase tracking-wider text-muted font-semibold">Attendance</div>
                <div class="text-[22px] font-bold font-mono text-emerald-700 mt-1">92.6%</div>
              </div>
              <div class="rounded-lg border border-line p-3.5">
                <div class="text-[10.5px] uppercase tracking-wider text-muted font-semibold">Avg grade</div>
                <div class="text-[22px] font-bold font-mono text-blue-700 mt-1">85.3</div>
              </div>
              <div class="rounded-lg border border-line p-3.5">
                <div class="text-[10.5px] uppercase tracking-wider text-muted font-semibold">Pending sync</div>
                <div class="text-[22px] font-bold font-mono text-amber-600 mt-1">3</div>
              </div>
            </div>
            <div class="mt-5 rounded-lg border border-line p-4">
              <div class="text-[12px] uppercase tracking-wider text-muted font-semibold mb-3">Today's Schedule</div>
              <div class="space-y-2.5 text-[12.5px]">
                <div class="flex items-center gap-3 py-1.5"><span class="w-1 h-8 rounded bg-teal-500"></span><span class="font-mono w-20 text-navy">7:30 AM</span><span class="px-2 py-0.5 rounded-md text-[11px] font-semibold" style="background:#CCFBF1;color:#0F766E;">Science</span><span class="text-muted">Grade 7 – Rizal</span><span class="ml-auto inline-flex items-center gap-1 text-[10.5px] text-emerald-700 font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Saved</span></div>
                <div class="flex items-center gap-3 py-1.5 bg-primary-light/30 -mx-4 px-4 rounded-md"><span class="w-1 h-8 rounded bg-blue-600"></span><span class="font-mono w-20 text-navy">8:30 AM</span><span class="px-2 py-0.5 rounded-md text-[11px] font-semibold" style="background:#DBEAFE;color:#1E3A8A;">Math</span><span class="text-muted">Grade 7 – Bonifacio</span><span class="ml-auto inline-flex items-center gap-1 text-[10.5px] text-amber-700 font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 pulse-dot"></span>In progress</span></div>
                <div class="flex items-center gap-3 py-1.5"><span class="w-1 h-8 rounded bg-violet-500"></span><span class="font-mono w-20 text-navy">10:00 AM</span><span class="px-2 py-0.5 rounded-md text-[11px] font-semibold" style="background:#EDE9FE;color:#4C1D95;">English</span><span class="text-muted">Grade 8 – Aguinaldo</span><span class="ml-auto text-[11px] text-muted">Upcoming</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-6 text-center">
        <a href="/app" class="inline-flex items-center gap-2 h-11 px-5 rounded-md bg-navy text-white font-semibold text-[14px] hover:bg-primary press tx">
          Open the live demo <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ── TESTIMONIAL ──────────────────────────────────────── -->
<section class="max-w-4xl mx-auto px-5 sm:px-8 py-20 text-center" data-reveal>
  <i data-lucide="quote" class="w-8 h-8 text-primary mx-auto"></i>
  <p class="mt-5 text-[22px] sm:text-[28px] font-medium tracking-tight text-navy leading-snug">
    "I used to spend an hour after dismissal updating my class record book. With AralSync, attendance is done before the students even sit down."
  </p>
  <div class="mt-6 inline-flex items-center gap-3">
    <span class="w-10 h-10 rounded-full inline-flex items-center justify-center font-semibold" style="background:#CCFBF1;color:#0F766E;">MS</span>
    <div class="text-left">
      <div class="text-[13px] font-semibold text-navy">Maria B. Santos</div>
      <div class="text-[12px] text-muted">Teacher III · Bonifacio National High School</div>
    </div>
  </div>
</section>

<!-- ── FAQ ──────────────────────────────────────────────── -->
<section id="faq" class="max-w-4xl mx-auto px-5 sm:px-8 py-16">
  <div class="text-center mb-10" data-reveal>
    <span class="text-[12px] font-semibold tracking-[0.16em] uppercase text-primary">Frequently asked</span>
    <h2 class="text-[32px] font-bold tracking-tight text-navy mt-2">Quick answers</h2>
  </div>
  <div class="space-y-3">
    <details class="group rounded-lg border border-line bg-white p-4" data-reveal>
      <summary class="flex items-center justify-between cursor-pointer list-none">
        <span class="font-semibold text-navy text-[15px]">Do I need internet to use AralSync?</span>
        <i data-lucide="chevron-down" class="w-5 h-5 text-muted group-open:rotate-180 tx"></i>
      </summary>
      <p class="mt-3 text-[13.5px] text-muted leading-relaxed">No. The app works fully offline. Every action saves to your device. Sync happens automatically when WiFi or mobile data is available — or via LAN peers when other teachers' devices are nearby.</p>
    </details>
    <details class="group rounded-lg border border-line bg-white p-4" data-reveal>
      <summary class="flex items-center justify-between cursor-pointer list-none">
        <span class="font-semibold text-navy text-[15px]">Is it actually DepEd-compliant?</span>
        <i data-lucide="chevron-down" class="w-5 h-5 text-muted group-open:rotate-180 tx"></i>
      </summary>
      <p class="mt-3 text-[13.5px] text-muted leading-relaxed">Yes. WW/PT/QA component weights, transmutation tables, and SF2/SF9/SF10 form layouts follow DepEd Order 8, s. 2015 (Policy Guidelines on Classroom Assessment).</p>
    </details>
    <details class="group rounded-lg border border-line bg-white p-4" data-reveal>
      <summary class="flex items-center justify-between cursor-pointer list-none">
        <span class="font-semibold text-navy text-[15px]">Who can see my data?</span>
        <i data-lucide="chevron-down" class="w-5 h-5 text-muted group-open:rotate-180 tx"></i>
      </summary>
      <p class="mt-3 text-[13.5px] text-muted leading-relaxed">Only you and devices you've paired. LAN sync uses end-to-end encryption with keys generated on your device. Cloud sync is opt-in per teacher.</p>
    </details>
    <details class="group rounded-lg border border-line bg-white p-4" data-reveal>
      <summary class="flex items-center justify-between cursor-pointer list-none">
        <span class="font-semibold text-navy text-[15px]">How much does it cost?</span>
        <i data-lucide="chevron-down" class="w-5 h-5 text-muted group-open:rotate-180 tx"></i>
      </summary>
      <p class="mt-3 text-[13.5px] text-muted leading-relaxed">Free for individual public school teachers during beta. School-wide deployments include training and a coordinator dashboard.</p>
    </details>
  </div>
</section>

<!-- ── CTA ──────────────────────────────────────────────── -->
<section class="bg-primary relative overflow-hidden">
  <div class="absolute inset-0 dotted-grid opacity-10"></div>
  <div class="relative max-w-5xl mx-auto px-5 sm:px-8 py-20 text-center text-white">
    <h2 class="text-[36px] sm:text-[44px] font-bold tracking-tight">Get back to teaching.</h2>
    <p class="mt-4 text-white/80 text-[16px] max-w-xl mx-auto">Spend your evenings reading, not retyping. Set up your first class in under a minute.</p>
    <div class="mt-8 flex items-center justify-center gap-3 flex-wrap">
      <a href="/signin?mode=register" class="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-white text-primary-dark font-semibold text-[14px] hover:bg-primary-light press tx">
        Create free account <i data-lucide="arrow-right" class="w-4 h-4"></i>
      </a>
      <a href="/app" class="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-primary-dark/40 text-white font-semibold text-[14px] hover:bg-primary-dark/60 border border-white/20 press tx">
        Try the demo first
      </a>
    </div>
  </div>
</section>

<!-- ── FOOTER ───────────────────────────────────────────── -->
<footer class="bg-navy text-white/80">
  <div class="max-w-7xl mx-auto px-5 sm:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
    <div class="col-span-2">
      <div class="flex items-center gap-2">
        <span class="w-8 h-8 rounded-md bg-emerald-500 inline-flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14 0"/><path d="M8.5 16a6.5 6.5 0 0 1 7 0"/><circle cx="12" cy="20" r="1.2" fill="white" stroke="none"/></svg>
        </span>
        <span class="text-[20px] font-extrabold text-emerald-300">Aral<span class="font-medium text-white">Sync</span></span>
      </div>
      <p class="mt-3 text-[13px] text-white/55 max-w-xs">Offline-first classroom records for Philippine public school teachers.</p>
      <p class="mt-3 text-[11px] text-white/40">Teach more. Sync seamlessly.</p>
    </div>
    <div>
      <div class="text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-3">Product</div>
      <ul class="space-y-2 text-[13px]">
        <li><a href="#features" class="hover:text-white">Features</a></li>
        <li><a href="#offline" class="hover:text-white">Offline-first</a></li>
        <li><a href="#deped" class="hover:text-white">DepEd alignment</a></li>
        <li><a href="/app" class="hover:text-white">Live demo</a></li>
      </ul>
    </div>
    <div>
      <div class="text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-3">Resources</div>
      <ul class="space-y-2 text-[13px]">
        <li><a href="#faq" class="hover:text-white">FAQ</a></li>
        <li><a href="#" class="hover:text-white">Changelog</a></li>
        <li><a href="#" class="hover:text-white">Help center</a></li>
      </ul>
    </div>
    <div>
      <div class="text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-3">Get in touch</div>
      <ul class="space-y-2 text-[13px]">
        <li><a href="/signin" class="hover:text-white">Sign in</a></li>
        <li><a href="/signin?mode=register" class="hover:text-white">Create account</a></li>
        <li><a href="mailto:hello@aralsync.com" class="hover:text-white">hello@aralsync.com</a></li>
      </ul>
    </div>
  </div>
  <div class="border-t border-white/10">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between flex-wrap gap-3 text-[12px] text-white/40">
      <span>© 2024–2025 AralSync · v1.0.0 (Beta)</span>
      <div class="flex items-center gap-5">
        <a href="#" class="hover:text-white">Privacy</a>
        <a href="#" class="hover:text-white">Terms</a>
        <a href="#" class="hover:text-white">Data policy</a>
      </div>
    </div>
  </div>
</footer>


`;

export default function Landing() {
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'AralSync — Teach more. Sync seamlessly.';
    let cleanup = () => {};

    // 1. Lucide (CDN, loaded once)
    const ensureLucide = () =>
      new Promise((resolve) => {
        if (window.lucide) return resolve(window.lucide);
        const existing = document.getElementById('lucide-cdn');
        if (existing) {
          existing.addEventListener('load', () => resolve(window.lucide));
          return;
        }
        const s = document.createElement('script');
        s.id = 'lucide-cdn';
        s.src = 'https://unpkg.com/lucide@latest/dist/umd/lucide.min.js';
        s.onload = () => resolve(window.lucide);
        document.body.appendChild(s);
      });

    let cancelled = false;
    ensureLucide().then((l) => {
      if (cancelled || !l) return;
      l.createIcons && l.createIcons();
    });

    // 2. Reveal on scroll
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.12 },
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => obs.observe(el));

    // 3. Intercept in-page links so we get SPA navigation
    const root = wrapRef.current;
    const onClick = (ev) => {
      const a = ev.target.closest && ev.target.closest('a[href]');
      if (!a || !root.contains(a)) return;
      const href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#') || a.target === '_blank') return;
      ev.preventDefault();
      // Strip query for matching but keep when navigating
      navigate(href);
    };
    root && root.addEventListener('click', onClick);

    cleanup = () => {
      cancelled = true;
      obs.disconnect();
      root && root.removeEventListener('click', onClick);
    };
    return cleanup;
  }, [navigate]);

  return <div ref={wrapRef} dangerouslySetInnerHTML={{ __html: LANDING_HTML }} />;
}
