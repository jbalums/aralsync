import { Quote } from 'lucide-react';

export function TestimonialSection() {
  return (
    <section className="max-w-4xl mx-auto px-5 sm:px-8 py-20 text-center" data-reveal>
      <Quote className="w-8 h-8 text-primary mx-auto" strokeWidth={1.75} />
      <p className="mt-5 text-[22px] sm:text-[28px] font-medium tracking-tight text-navy leading-snug">
        "I used to spend an hour after dismissal updating my class record book. With AralSync, attendance is done before the students even sit down."
      </p>
      <div className="mt-6 inline-flex items-center gap-3">
        <span className="w-10 h-10 rounded-full inline-flex items-center justify-center font-semibold" style={{ background: '#CCFBF1', color: '#0F766E' }}>MS</span>
        <div className="text-left">
          <div className="text-[13px] font-semibold text-navy">Maria B. Santos</div>
          <div className="text-[12px] text-muted">Teacher III · Bonifacio National High School</div>
        </div>
      </div>
    </section>
  );
}
