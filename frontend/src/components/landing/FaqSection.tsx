import { ChevronDown } from 'lucide-react';

export function FaqSection() {
  return (
    <section id="faq" className="max-w-4xl mx-auto px-5 sm:px-8 py-16">
      <div className="text-center mb-10" data-reveal>
        <span className="text-[12px] font-semibold tracking-[0.16em] uppercase text-primary">Frequently asked</span>
        <h2 className="text-[32px] font-bold tracking-tight text-navy mt-2">Quick answers</h2>
      </div>
      <div className="space-y-3">
        <details className="group rounded-lg border border-line bg-white p-4" data-reveal>
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="font-semibold text-navy text-[15px]">Do I need internet to use AralSync?</span>
            <ChevronDown className="w-5 h-5 text-muted group-open:rotate-180 tx" strokeWidth={1.75} />
          </summary>
          <p className="mt-3 text-[13.5px] text-muted leading-relaxed">No. The app works fully offline. Every action saves to your device. Sync happens automatically when WiFi or mobile data is available — or via LAN peers when other teachers' devices are nearby.</p>
        </details>
        <details className="group rounded-lg border border-line bg-white p-4" data-reveal>
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="font-semibold text-navy text-[15px]">Is it actually DepEd-compliant?</span>
            <ChevronDown className="w-5 h-5 text-muted group-open:rotate-180 tx" strokeWidth={1.75} />
          </summary>
          <p className="mt-3 text-[13.5px] text-muted leading-relaxed">Yes. WW/PT/QA component weights, transmutation tables, and SF2/SF9/SF10 form layouts follow DepEd Order 8, s. 2015 (Policy Guidelines on Classroom Assessment).</p>
        </details>
        <details className="group rounded-lg border border-line bg-white p-4" data-reveal>
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="font-semibold text-navy text-[15px]">Who can see my data?</span>
            <ChevronDown className="w-5 h-5 text-muted group-open:rotate-180 tx" strokeWidth={1.75} />
          </summary>
          <p className="mt-3 text-[13.5px] text-muted leading-relaxed">Only you and devices you've paired. LAN sync uses end-to-end encryption with keys generated on your device. Cloud sync is opt-in per teacher.</p>
        </details>
        <details className="group rounded-lg border border-line bg-white p-4" data-reveal>
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="font-semibold text-navy text-[15px]">How much does it cost?</span>
            <ChevronDown className="w-5 h-5 text-muted group-open:rotate-180 tx" strokeWidth={1.75} />
          </summary>
          <p className="mt-3 text-[13.5px] text-muted leading-relaxed">Free for individual public school teachers during beta. School-wide deployments include training and a coordinator dashboard.</p>
        </details>
      </div>
    </section>
  );
}
