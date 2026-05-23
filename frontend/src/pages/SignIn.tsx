import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from '@tanstack/react-router';
import { authService } from '../modules/auth/auth.service';
import { useAuthStore } from '../modules/auth/authStore';

const schema = z.object({
  email:    z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

function generateDeviceId(): string {
  return btoa(`${navigator.userAgent}-${Date.now()}`).slice(0, 32);
}

export default function SignIn() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    try {
      const result = await authService.login({
        ...values,
        deviceId: generateDeviceId(),
      });
      await setAuth(result.user, result.tokens.accessToken, result.tokens.refreshToken);
      void navigate({ to: '/app/dashboard' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg ?? 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between p-10 text-white overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #0D5E57 0%, #0F766E 45%, #10B981 110%)' }}>
        <div className="absolute inset-0 opacity-25"
          style={{ backgroundImage: 'linear-gradient(rgba(15,118,110,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(15,118,110,0.12) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="w-9 h-9 rounded-md bg-white/15 backdrop-blur inline-flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.55a11 11 0 0 1 14 0"/><path d="M8.5 16a6.5 6.5 0 0 1 7 0"/><circle cx="12" cy="20" r="1.2" fill="white" stroke="none"/>
              </svg>
            </span>
            <span className="leading-none">
              <span className="text-[22px] font-extrabold tracking-tight">Aral</span>
              <span className="text-[22px] font-medium tracking-tight text-white/85">Sync</span>
            </span>
          </Link>
        </div>

        <div className="relative">
          <div className="text-[12px] font-semibold tracking-[0.18em] uppercase text-emerald-200/90">Welcome back</div>
          <h1 className="text-[40px] font-bold tracking-tight leading-[1.05] mt-3 max-w-md">
            Teach more.<br/>Sync seamlessly.
          </h1>
          <p className="mt-4 text-white/75 text-[15px] max-w-md leading-relaxed">
            Pick up where you left off — your attendance, grades, and schedules are right where you saved them, online or off.
          </p>
        </div>

        <div className="relative text-[12px] text-white/45">© {new Date().getFullYear()} AralSync</div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col items-center justify-center px-6 py-12 bg-surface min-h-screen lg:min-h-0">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-2">
          <span className="w-9 h-9 rounded-md bg-primary/10 inline-flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M5 12.55a11 11 0 0 1 14 0"/><path d="M8.5 16a6.5 6.5 0 0 1 7 0"/><circle cx="12" cy="20" r="1.2" fill="currentColor" stroke="none"/>
            </svg>
          </span>
          <span className="text-[20px] font-bold tracking-tight text-navy">Aral<span className="font-medium text-muted">Sync</span></span>
        </div>

        <div className="w-full max-w-[380px]">
          <h2 className="text-[24px] font-bold text-navy tracking-tight">Sign in to your account</h2>
          <p className="mt-1 text-sm text-muted">
            New here?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">Create an account</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4" noValidate>
            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                {serverError}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-[13px] font-medium text-navy">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                {...register('email')}
                className={`h-[42px] px-3 rounded-lg border text-[14px] bg-white outline-none transition-all
                  focus:border-primary focus:ring-4 focus:ring-primary/10
                  ${errors.email ? 'border-red-400' : 'border-line'}`}
              />
              {errors.email && <span className="text-[12px] text-red-500">{errors.email.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-[13px] font-medium text-navy">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className={`h-[42px] w-full px-3 pr-10 rounded-lg border text-[14px] bg-white outline-none transition-all
                    focus:border-primary focus:ring-4 focus:ring-primary/10
                    ${errors.password ? 'border-red-400' : 'border-line'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
                  tabIndex={-1}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPassword
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
              {errors.password && <span className="text-[12px] text-red-500">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-[42px] rounded-lg bg-primary text-white text-[14px] font-semibold
                hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
