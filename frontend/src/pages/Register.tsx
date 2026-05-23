import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from '@tanstack/react-router';
import { authService } from '../modules/auth/auth.service';
import { useAuthStore } from '../modules/auth/authStore';

const schema = z.object({
  name:     z.string().min(2, 'Full name is required'),
  email:    z.string().min(1, 'Email is required').email('Invalid email'),
  schoolId: z.string().min(1, 'School ID is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});
type FormValues = z.infer<typeof schema>;

function generateDeviceId(): string {
  return btoa(`${navigator.userAgent}-${Date.now()}`).slice(0, 32);
}

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    try {
      const result = await authService.register({
        name: values.name,
        email: values.email,
        schoolId: values.schoolId,
        password: values.password,
        deviceId: generateDeviceId(),
      });
      await setAuth(result.user, result.tokens.accessToken, result.tokens.refreshToken);
      void navigate({ to: '/app/dashboard' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg ?? 'Registration failed. Please try again.');
    }
  };

  const field = (id: keyof FormValues, label: string, type = 'text', autoComplete?: string) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[13px] font-medium text-navy">{label}</label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        {...register(id)}
        className={`h-[42px] px-3 rounded-lg border text-[14px] bg-white outline-none transition-all
          focus:border-primary focus:ring-4 focus:ring-primary/10
          ${errors[id] ? 'border-red-400' : 'border-line'}`}
      />
      {errors[id] && <span className="text-[12px] text-red-500">{errors[id]?.message}</span>}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-surface">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <span className="w-9 h-9 rounded-md bg-primary/10 inline-flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M5 12.55a11 11 0 0 1 14 0"/><path d="M8.5 16a6.5 6.5 0 0 1 7 0"/><circle cx="12" cy="20" r="1.2" fill="currentColor" stroke="none"/>
            </svg>
          </span>
          <span className="text-[20px] font-bold tracking-tight text-navy">Aral<span className="font-medium text-muted">Sync</span></span>
        </div>

        <h2 className="text-[24px] font-bold text-navy tracking-tight">Create your account</h2>
        <p className="mt-1 text-sm text-muted">
          Already have one?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4" noValidate>
          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {serverError}
            </div>
          )}
          {field('name',     'Full name',          'text',     'name')}
          {field('email',    'Email address',      'email',    'email')}
          {field('schoolId', 'School ID')}
          {field('password', 'Password',           'password', 'new-password')}
          {field('confirm',  'Confirm password',   'password', 'new-password')}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-[42px] rounded-lg bg-primary text-white text-[14px] font-semibold
              hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
