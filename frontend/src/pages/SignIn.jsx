import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Sign-in page — same markup as signin.html (now including the <head>
// <style> block) plus the original tab/stepper/password-toggle script.
const SIGNIN_HTML = `<style>
  body { font-family:'Inter', system-ui, sans-serif; color:#0F172A; background:#F8FAFC; -webkit-font-smoothing:antialiased; }
  .dotted-grid { background-image: linear-gradient(rgba(15,118,110,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(15,118,110,0.12) 1px, transparent 1px); background-size: 28px 28px; }
  [data-lucide] { width:18px; height:18px; stroke-width:1.75; }
  .press:active { transform: scale(0.98); }
  .press, .tx { transition: all 150ms ease; }
  .field { width:100%; height:42px; padding:0 12px; border:1px solid #E2E8F0; border-radius:8px; background:#fff; font-size:14px; }
  .field:focus { outline:none; border-color:#0F766E; box-shadow: 0 0 0 4px rgba(15,118,110,0.10); }
  .field.has-icon { padding-left: 38px; }
  @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:.45} }
  .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
  @keyframes glow { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.05);opacity:1} }
  .glow { animation: glow 6s ease-in-out infinite; }
  /* Tabs */
  .seg { position:relative; }
  .seg-bg { position:absolute; top:4px; bottom:4px; border-radius:6px; background:white; box-shadow: 0 1px 3px rgba(15,23,42,0.08); transition: all 200ms cubic-bezier(.2,.7,.2,1); }
  /* Soft float gradient blobs */
  .blob { position:absolute; border-radius:50%; filter: blur(60px); opacity:0.55; pointer-events:none; }
</style>


<!-- Split layout -->
<div class="min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">

  <!-- LEFT: brand panel -->
  <aside class="relative hidden lg:flex flex-col justify-between p-10 text-white overflow-hidden" style="background: linear-gradient(140deg, #0D5E57 0%, #0F766E 45%, #10B981 110%);">
    <div class="absolute inset-0 dotted-grid opacity-25"></div>
    <div class="blob glow" style="width:420px;height:420px;top:-80px;left:-100px;background:rgba(16,185,129,0.55);"></div>
    <div class="blob glow" style="width:340px;height:340px;bottom:-100px;right:-80px;background:rgba(45,212,191,0.45);animation-delay:-3s"></div>

    <div class="relative">
      <a href="/" class="inline-flex items-center gap-2 group">
        <span class="w-9 h-9 rounded-md bg-white/15 backdrop-blur inline-flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14 0"/><path d="M8.5 16a6.5 6.5 0 0 1 7 0"/><circle cx="12" cy="20" r="1.2" fill="white" stroke="none"/>
          </svg>
        </span>
        <span class="leading-none">
          <span class="text-[22px] font-extrabold tracking-tight">Aral</span><span class="text-[22px] font-medium tracking-tight text-white/85">Sync</span>
        </span>
      </a>
    </div>

    <div class="relative">
      <div class="text-[12px] font-semibold tracking-[0.18em] uppercase text-emerald-200/90">Welcome back</div>
      <h1 class="text-[40px] font-bold tracking-tight leading-[1.05] mt-3 max-w-md">Teach more.<br/>Sync seamlessly.</h1>
      <p class="mt-4 text-white/75 text-[15px] max-w-md leading-relaxed">
        Pick up where you left off — your attendance, grades, and schedules are right where you saved them, online or off.
      </p>

      <!-- Quick stats card -->
      <div class="mt-10 rounded-2xl bg-white/8 backdrop-blur-md border border-white/15 p-5 max-w-md">
        <div class="flex items-center justify-between mb-4">
          <div class="text-[11px] uppercase tracking-widest text-white/55 font-semibold">Today on your dashboard</div>
          <span class="inline-flex items-center gap-1.5 text-[11px] text-emerald-200 font-semibold">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot"></span>Live
          </span>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <div class="text-[11px] text-white/55">Students</div>
            <div class="text-[22px] font-bold font-mono leading-none mt-1">155<span class="text-white/55 text-[12px]">/165</span></div>
          </div>
          <div>
            <div class="text-[11px] text-white/55">Avg attend.</div>
            <div class="text-[22px] font-bold font-mono leading-none mt-1">92.6<span class="text-white/55 text-[12px]">%</span></div>
          </div>
          <div>
            <div class="text-[11px] text-white/55">Pending</div>
            <div class="text-[22px] font-bold font-mono leading-none mt-1 text-amber-200">3</div>
          </div>
        </div>
        <div class="mt-4 text-[12.5px] text-white/70 flex items-center gap-2">
          <i data-lucide="quote" class="w-3.5 h-3.5"></i> "Attendance done before students sit down." — Maria S.
        </div>
      </div>
    </div>

    <div class="relative flex items-center justify-between text-[12px] text-white/55">
      <span>© 2024–2025 AralSync · v1.0.0 Beta</span>
      <div class="flex items-center gap-4">
        <a href="#" class="hover:text-white">Privacy</a>
        <a href="#" class="hover:text-white">Terms</a>
      </div>
    </div>
  </aside>

  <!-- RIGHT: form panel -->
  <main class="flex flex-col">
    <!-- top mini header (mobile shows brand) -->
    <div class="flex items-center justify-between px-6 py-5 lg:px-10">
      <a href="/" class="inline-flex items-center gap-2 lg:hidden">
        <span class="w-8 h-8 rounded-md bg-primary inline-flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14 0"/><path d="M8.5 16a6.5 6.5 0 0 1 7 0"/><circle cx="12" cy="20" r="1.2" fill="white" stroke="none"/></svg>
        </span>
        <span class="text-[18px] font-extrabold text-primary">Aral<span class="text-navy/80 font-medium">Sync</span></span>
      </a>
      <a href="/" class="ml-auto text-[12.5px] text-muted hover:text-navy inline-flex items-center gap-1.5">
        <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Back to home
      </a>
    </div>

    <div class="flex-1 flex items-center justify-center px-6 sm:px-10 py-6">
      <div class="w-full max-w-md">
        <!-- Tabs -->
        <div id="tabs" class="seg relative bg-slate-100 p-1 rounded-lg w-full grid grid-cols-2 text-[13px] font-semibold mb-7">
          <div id="seg-bg" class="seg-bg" style="left:4px; width:calc(50% - 4px);"></div>
          <button data-tab="signin" class="relative h-9 rounded-md text-navy tab-active">Sign in</button>
          <button data-tab="register" class="relative h-9 rounded-md text-muted">Create account</button>
        </div>

        <!-- SIGN IN -->
        <div id="panel-signin" class="space-y-4">
          <div>
            <h2 class="text-[26px] font-bold tracking-tight text-navy">Sign in to your account</h2>
            <p class="text-[13px] text-muted mt-1">Welcome back, teacher. Your roster is ready.</p>
          </div>

          <!-- Demo credentials hint -->
          <div class="rounded-lg border border-primary/30 bg-primary-light/40 p-3 text-[12.5px] text-primary-dark flex items-start gap-2">
            <i data-lucide="key-round" class="w-4 h-4 mt-0.5"></i>
            <div class="flex-1">
              <div class="font-semibold">Try the demo</div>
              <div>Use any credentials, or click <button id="fill-demo" class="underline font-semibold">fill demo</button> to sign in as Maria Santos.</div>
            </div>
          </div>

          <form id="signin-form" class="space-y-3.5" novalidate>
            <label class="block">
              <div class="text-[12px] font-semibold text-navy mb-1.5">Email or Employee No.</div>
              <div class="relative">
                <i data-lucide="mail" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted"></i>
                <input id="email-in" type="text" class="field has-icon" placeholder="m.santos@deped.bnhs.ph" autocomplete="username">
              </div>
            </label>
            <label class="block">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[12px] font-semibold text-navy">Password</span>
                <a href="#" class="text-[11.5px] text-primary font-semibold hover:underline">Forgot password?</a>
              </div>
              <div class="relative">
                <i data-lucide="lock" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted"></i>
                <input id="pass-in" type="password" class="field has-icon pr-10" placeholder="••••••••" autocomplete="current-password">
                <button type="button" class="toggle-pass absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy" data-for="pass-in" aria-label="Show password"><i data-lucide="eye" class="w-4 h-4"></i></button>
              </div>
            </label>

            <label class="flex items-center gap-2 text-[12.5px] text-muted select-none">
              <input type="checkbox" id="remember" class="w-4 h-4 rounded border-line text-primary focus:ring-primary" checked>
              <span>Keep me signed in on this device</span>
            </label>

            <button type="submit" class="w-full h-11 rounded-md bg-primary text-white font-semibold text-[14px] hover:bg-primary-dark press tx inline-flex items-center justify-center gap-2">
              Sign in <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>

            <div class="relative my-4">
              <div class="border-t border-line"></div>
              <span class="absolute inset-0 -top-2.5 flex justify-center"><span class="bg-surface px-3 text-[11px] uppercase tracking-widest text-muted font-semibold">Or continue with</span></span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button type="button" class="h-10 rounded-md border border-line bg-white hover:bg-slate-50 inline-flex items-center justify-center gap-2 text-[13px] font-semibold press tx">
                <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 24 44c11.0 0 20-9 20-20 0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.6 5.1A20 20 0 0 0 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.2-.1-2.4-.4-3.5z"/></svg>
                Google
              </button>
              <button type="button" class="h-10 rounded-md border border-line bg-white hover:bg-slate-50 inline-flex items-center justify-center gap-2 text-[13px] font-semibold press tx">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0F172A"><path d="M12.04 2c-2.73 0-4.95 2.21-4.95 4.95v2.74H4.32V14h2.77v8h5.16v-8h2.77l.42-4.31h-3.19V7.18c0-1.04.21-1.45 1.22-1.45h1.97V2.06C14.91 2.02 13.5 2 12.04 2z"/></svg>
                DepEd SSO
              </button>
            </div>
          </form>
        </div>

        <!-- REGISTER -->
        <div id="panel-register" class="space-y-4 hidden">
          <div>
            <h2 class="text-[26px] font-bold tracking-tight text-navy">Create your teacher account</h2>
            <p class="text-[13px] text-muted mt-1">Free for public school teachers during beta.</p>
          </div>

          <!-- Stepper -->
          <div class="flex items-center gap-2 text-[11px] font-semibold">
            <span id="step1" class="px-2.5 py-1 rounded-md bg-primary text-white">1 · Account</span>
            <span class="text-muted-light">›</span>
            <span id="step2" class="px-2.5 py-1 rounded-md bg-slate-100 text-muted">2 · School</span>
            <span class="text-muted-light">›</span>
            <span id="step3" class="px-2.5 py-1 rounded-md bg-slate-100 text-muted">3 · Done</span>
          </div>

          <form id="register-form" class="space-y-3.5" novalidate>
            <!-- STEP 1 -->
            <div id="reg-step1" class="space-y-3.5">
              <div class="grid grid-cols-2 gap-3">
                <label class="block">
                  <div class="text-[12px] font-semibold text-navy mb-1.5">First name</div>
                  <input type="text" class="field" placeholder="Maria" id="reg-first">
                </label>
                <label class="block">
                  <div class="text-[12px] font-semibold text-navy mb-1.5">Last name</div>
                  <input type="text" class="field" placeholder="Santos" id="reg-last">
                </label>
              </div>
              <label class="block">
                <div class="text-[12px] font-semibold text-navy mb-1.5">Email</div>
                <div class="relative">
                  <i data-lucide="mail" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted"></i>
                  <input type="email" class="field has-icon" placeholder="m.santos@deped.gov.ph" id="reg-email">
                </div>
              </label>
              <label class="block">
                <div class="text-[12px] font-semibold text-navy mb-1.5">Password</div>
                <div class="relative">
                  <i data-lucide="lock" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted"></i>
                  <input type="password" class="field has-icon pr-10" placeholder="At least 8 characters" id="reg-pass">
                  <button type="button" class="toggle-pass absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy" data-for="reg-pass"><i data-lucide="eye" class="w-4 h-4"></i></button>
                </div>
                <div class="mt-2 grid grid-cols-4 gap-1.5">
                  <span id="ps1" class="h-1 rounded bg-slate-200"></span>
                  <span id="ps2" class="h-1 rounded bg-slate-200"></span>
                  <span id="ps3" class="h-1 rounded bg-slate-200"></span>
                  <span id="ps4" class="h-1 rounded bg-slate-200"></span>
                </div>
                <div id="ps-text" class="text-[11px] text-muted mt-1.5">Use 8+ characters with a number and a symbol</div>
              </label>
              <button type="button" id="goto-step2" class="w-full h-11 rounded-md bg-primary text-white font-semibold text-[14px] hover:bg-primary-dark press tx inline-flex items-center justify-center gap-2">
                Continue <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>

            <!-- STEP 2 -->
            <div id="reg-step2" class="space-y-3.5 hidden">
              <label class="block">
                <div class="text-[12px] font-semibold text-navy mb-1.5">Position</div>
                <select class="field" id="reg-pos">
                  <option>Teacher I</option><option>Teacher II</option><option selected>Teacher III</option>
                  <option>Master Teacher I</option><option>Department Head</option><option>School Administrator</option>
                </select>
              </label>
              <label class="block">
                <div class="text-[12px] font-semibold text-navy mb-1.5">School</div>
                <div class="relative">
                  <i data-lucide="building-2" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted"></i>
                  <input type="text" class="field has-icon" placeholder="Bonifacio National High School" id="reg-school">
                </div>
              </label>
              <div class="grid grid-cols-2 gap-3">
                <label class="block">
                  <div class="text-[12px] font-semibold text-navy mb-1.5">Division</div>
                  <input type="text" class="field" placeholder="Bacolod City" id="reg-div">
                </label>
                <label class="block">
                  <div class="text-[12px] font-semibold text-navy mb-1.5">District</div>
                  <input type="text" class="field" placeholder="District II" id="reg-dist">
                </label>
              </div>
              <label class="block">
                <div class="text-[12px] font-semibold text-navy mb-1.5">Employee No. <span class="text-muted font-normal">(optional)</span></div>
                <input type="text" class="field" placeholder="2019-0042">
              </label>
              <label class="flex items-start gap-2 text-[12.5px] text-muted select-none">
                <input type="checkbox" id="reg-tos" class="mt-0.5 w-4 h-4 rounded border-line text-primary focus:ring-primary">
                <span>I agree to the <a href="#" class="text-primary font-semibold underline">Terms</a> and <a href="#" class="text-primary font-semibold underline">Data Policy</a>.</span>
              </label>
              <div class="flex items-center gap-2">
                <button type="button" id="back-step1" class="h-11 px-4 rounded-md bg-white border border-line text-navy font-semibold text-[14px] press tx">Back</button>
                <button type="submit" class="flex-1 h-11 rounded-md bg-primary text-white font-semibold text-[14px] hover:bg-primary-dark press tx inline-flex items-center justify-center gap-2">
                  Create account <i data-lucide="check" class="w-4 h-4"></i>
                </button>
              </div>
            </div>

            <!-- STEP 3 -->
            <div id="reg-step3" class="hidden">
              <div class="rounded-xl border border-primary/30 bg-primary-light/40 p-5 text-center">
                <div class="w-14 h-14 rounded-full bg-primary text-white mx-auto inline-flex items-center justify-center"><i data-lucide="check" class="w-7 h-7"></i></div>
                <h3 class="text-[20px] font-semibold text-primary-dark mt-3">Account created!</h3>
                <p class="text-[13px] text-primary-dark/80 mt-1">Your AralSync account is ready. Opening the dashboard…</p>
              </div>
              <a href="/app" id="go-app" class="mt-4 w-full h-11 rounded-md bg-primary text-white font-semibold text-[14px] hover:bg-primary-dark press tx inline-flex items-center justify-center gap-2">
                Go to dashboard <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
            </div>
          </form>
        </div>

        <!-- Footer link -->
        <p class="mt-8 text-center text-[12px] text-muted">
          By continuing you agree to AralSync's <a href="#" class="underline hover:text-navy">Terms</a> and <a href="#" class="underline hover:text-navy">Data Policy</a>.
        </p>
      </div>
    </div>
  </main>
</div>


`;
const SIGNIN_SCRIPT = `
  tailwind.config = { theme: { extend: {
    fontFamily: { sans:['Inter','system-ui','sans-serif'], mono:['JetBrains Mono','monospace'] },
    colors: { primary:{DEFAULT:'#0F766E',light:'#CCFBF1',dark:'#0D5E57'}, accent:'#10B981', navy:'#0F172A', surface:'#F8FAFC', muted:{DEFAULT:'#64748B',light:'#94A3B8'}, line:'#E2E8F0' },
  } } };


  if (window.lucide) window.lucide.createIcons();

  // ─── Tabs ────────────────────────────────────────────
  const tabsEl = document.getElementById('tabs');
  const segBg = document.getElementById('seg-bg');
  function setTab(which) {
    const buttons = tabsEl.querySelectorAll('[data-tab]');
    buttons.forEach(b => {
      const on = b.dataset.tab === which;
      b.classList.toggle('text-navy', on);
      b.classList.toggle('text-muted', !on);
    });
    const idx = which === 'signin' ? 0 : 1;
    const w = tabsEl.offsetWidth;
    segBg.style.left = \`calc(\${idx*50}% + 4px)\`;
    segBg.style.width = \`calc(50% - 8px)\`;
    document.getElementById('panel-signin').classList.toggle('hidden', which !== 'signin');
    document.getElementById('panel-register').classList.toggle('hidden', which !== 'register');
    // reset register stepper
    if (which === 'register') showRegStep(1);
    document.title = which === 'signin' ? 'Sign in · AralSync' : 'Create account · AralSync';
  }
  tabsEl.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));

  // Read mode from URL
  const params = new URLSearchParams(location.search);
  if (params.get('mode') === 'register') setTab('register'); else setTab('signin');

  // ─── Password toggles ────────────────────────────────
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.for);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.innerHTML = input.type === 'password'
        ? '<i data-lucide="eye" class="w-4 h-4"></i>'
        : '<i data-lucide="eye-off" class="w-4 h-4"></i>';
      window.lucide && window.lucide.createIcons();
    });
  });

  // ─── Password strength ───────────────────────────────
  const regPass = document.getElementById('reg-pass');
  const ps = [1,2,3,4].map(i => document.getElementById('ps'+i));
  const psText = document.getElementById('ps-text');
  regPass && regPass.addEventListener('input', () => {
    const v = regPass.value;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/\\d/.test(v)) score++;
    if (/[^a-zA-Z0-9]/.test(v)) score++;
    const colors = ['#EF4444','#F59E0B','#10B981','#0F766E'];
    const labels = ['Too weak','Getting there','Good','Strong'];
    ps.forEach((b,i) => { b.style.background = i < score ? colors[score-1] : '#E2E8F0'; });
    psText.textContent = v ? labels[Math.max(0,score-1)] : 'Use 8+ characters with a number and a symbol';
    psText.style.color = v ? colors[Math.max(0,score-1)] : '#64748B';
  });

  // ─── Register stepper ────────────────────────────────
  function showRegStep(n) {
    [1,2,3].forEach(i => document.getElementById('reg-step'+i).classList.toggle('hidden', i!==n));
    [1,2,3].forEach(i => {
      const el = document.getElementById('step'+i);
      const on = i <= n;
      el.className = \`px-2.5 py-1 rounded-md \${on?'bg-primary text-white':'bg-slate-100 text-muted'}\`;
    });
  }
  document.getElementById('goto-step2').addEventListener('click', () => {
    // basic validation
    const first = document.getElementById('reg-first').value.trim();
    const last  = document.getElementById('reg-last').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass  = document.getElementById('reg-pass').value;
    if (!first || !last || !email.includes('@') || pass.length < 8) {
      alert('Please complete all fields. Password must be 8+ characters.');
      return;
    }
    showRegStep(2);
  });
  document.getElementById('back-step1').addEventListener('click', () => showRegStep(1));
  document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!document.getElementById('reg-tos').checked) { alert('Please accept the Terms to continue.'); return; }
    showRegStep(3);
    setTimeout(() => { window.location.href = '/app'; }, 1800);
  });

  // ─── Sign-in submit ──────────────────────────────────
  document.getElementById('signin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.currentTarget.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25" stroke-width="3"/><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg> Signing in…';
    setTimeout(() => { window.location.href = '/app'; }, 900);
  });

  // ─── Fill demo ───────────────────────────────────────
  document.getElementById('fill-demo').addEventListener('click', () => {
    document.getElementById('email-in').value = 'm.santos@deped.bnhs.ph';
    document.getElementById('pass-in').value = 'aralsync-demo';
  });
`;

export default function SignIn() {
  const wrapRef = useRef(null);
  const navigate = useNavigate();
  // StrictMode fires effects twice in dev. We guard so the page script,
  // which attaches DOM listeners, only runs once per real mount.
  const hasRunRef = useRef(false);

  useEffect(() => {
    document.title = 'Sign in · AralSync';

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
    (async () => {
      const l = await ensureLucide();
      if (cancelled) return;
      l && l.createIcons && l.createIcons();
      if (!hasRunRef.current) {
        hasRunRef.current = true;
        try {
          // eslint-disable-next-line no-new-func
          new Function(SIGNIN_SCRIPT)();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('SignIn script error:', err);
        }
      }
    })();

    // SPA-navigate any in-page <a> within signin
    const root = wrapRef.current;
    const onClick = (ev) => {
      const a = ev.target.closest && ev.target.closest('a[href]');
      if (!a || !root.contains(a)) return;
      const href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#') || a.target === '_blank') return;
      ev.preventDefault();
      navigate(href);
    };
    root && root.addEventListener('click', onClick);

    return () => {
      cancelled = true;
      root && root.removeEventListener('click', onClick);
    };
  }, [navigate]);

  return <div ref={wrapRef} dangerouslySetInnerHTML={{ __html: SIGNIN_HTML }} />;
}
