import { ClipboardCheck, GraduationCap, WifiOff, FileText, RefreshCw, LifeBuoy } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
      <div className="max-w-2xl" data-reveal>
        <span className="text-[12px] font-semibold tracking-[0.16em] uppercase text-primary">What it does</span>
        <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight text-navy mt-2">
          Everything your classroom paperwork needs.<br /><span className="text-muted font-normal">Nothing it doesn't.</span>
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-line p-6 bg-white tx hover:-translate-y-0.5 hover:soft-shadow" data-reveal>
          <span className="w-10 h-10 rounded-md bg-primary-light text-primary inline-flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <h3 className="mt-4 text-[18px] font-semibold tracking-tight text-navy">Attendance in 30 seconds</h3>
          <p className="mt-1.5 text-[13.5px] text-muted leading-relaxed">Fat-finger-friendly rows, P/L/A/E shortcuts, and bulk "mark remaining present." Designed for the chaos right before homeroom.</p>
        </div>

        <div className="rounded-xl border border-line p-6 bg-white tx hover:-translate-y-0.5 hover:soft-shadow" data-reveal>
          <span className="w-10 h-10 rounded-md inline-flex items-center justify-center" style={{ background: '#D1FAE5', color: '#047857' }}>
            <GraduationCap className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <h3 className="mt-4 text-[18px] font-semibold tracking-tight text-navy">DepEd-native grading</h3>
          <p className="mt-1.5 text-[13.5px] text-muted leading-relaxed">Written Works, Performance Tasks, and Quarterly Assessment with configurable weights. Transmuted grades calculated for you.</p>
        </div>

        <div className="rounded-xl border border-line p-6 bg-white tx hover:-translate-y-0.5 hover:soft-shadow" data-reveal>
          <span className="w-10 h-10 rounded-md inline-flex items-center justify-center" style={{ background: '#FEF3C7', color: '#92400E' }}>
            <WifiOff className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <h3 className="mt-4 text-[18px] font-semibold tracking-tight text-navy">Offline by default</h3>
          <p className="mt-1.5 text-[13.5px] text-muted leading-relaxed">Records save instantly to your device — sync queues quietly until your school's WiFi co-operates. No data loss, ever.</p>
        </div>

        <div className="rounded-xl border border-line p-6 bg-white tx hover:-translate-y-0.5 hover:soft-shadow" data-reveal>
          <span className="w-10 h-10 rounded-md inline-flex items-center justify-center" style={{ background: '#DBEAFE', color: '#1D4ED8' }}>
            <FileText className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <h3 className="mt-4 text-[18px] font-semibold tracking-tight text-navy">SF2, SF9, SF10 ready</h3>
          <p className="mt-1.5 text-[13.5px] text-muted leading-relaxed">Generate the forms your Division actually asks for. Print, PDF, or Excel — your roster, your honor roll, in seconds.</p>
        </div>

        <div className="rounded-xl border border-line p-6 bg-white tx hover:-translate-y-0.5 hover:soft-shadow" data-reveal>
          <span className="w-10 h-10 rounded-md inline-flex items-center justify-center" style={{ background: '#EDE9FE', color: '#6D28D9' }}>
            <RefreshCw className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <h3 className="mt-4 text-[18px] font-semibold tracking-tight text-navy">LAN peer sync</h3>
          <p className="mt-1.5 text-[13.5px] text-muted leading-relaxed">Co-advisers can sync between devices on the same WiFi — even when the internet's out at school.</p>
        </div>

        <div className="rounded-xl border border-line p-6 bg-white tx hover:-translate-y-0.5 hover:soft-shadow" data-reveal>
          <span className="w-10 h-10 rounded-md inline-flex items-center justify-center" style={{ background: '#FFE4E6', color: '#9F1239' }}>
            <LifeBuoy className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <h3 className="mt-4 text-[18px] font-semibold tracking-tight text-navy">At-risk early warning</h3>
          <p className="mt-1.5 text-[13.5px] text-muted leading-relaxed">Auto-flag learners falling below 80% attendance or 75 grade. Add notes, contact guardians, intervene early.</p>
        </div>
      </div>
    </section>
  );
}
