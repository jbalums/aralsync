import { useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import '../components/landing/landing.css';
import { LandingNav } from '../components/landing/LandingNav';
import { HeroSection } from '../components/landing/HeroSection';
import { StatsSection } from '../components/landing/StatsSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { OfflineSection } from '../components/landing/OfflineSection';
import { DepEdSection } from '../components/landing/DepEdSection';
import { PreviewSection } from '../components/landing/PreviewSection';
import { TestimonialSection } from '../components/landing/TestimonialSection';
import { FaqSection } from '../components/landing/FaqSection';
import { CtaSection } from '../components/landing/CtaSection';
import { LandingFooter } from '../components/landing/LandingFooter';

export default function Landing() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'AralSync - Teach more. Sync seamlessly.';

    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.12 },
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => obs.observe(el));

    const root = wrapRef.current;
    const onClick = (ev: MouseEvent) => {
      const a = (ev.target as Element).closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || !root?.contains(a)) return;
      const href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#') || a.target === '_blank') return;
      ev.preventDefault();
      navigate({ to: href });
    };
    root?.addEventListener('click', onClick as EventListener);

    return () => {
      obs.disconnect();
      root?.removeEventListener('click', onClick as EventListener);
    };
  }, [navigate]);

  return (
    <div ref={wrapRef}>
      <LandingNav />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <OfflineSection />
      <DepEdSection />
      <PreviewSection />
      <TestimonialSection />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
