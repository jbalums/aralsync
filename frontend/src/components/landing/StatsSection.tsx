export function StatsSection() {
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-line p-5 bg-white" data-reveal>
          <div className="text-[34px] font-bold font-mono text-navy leading-none">30<span className="text-primary">s</span></div>
          <div className="text-[12.5px] text-muted mt-2">Average time to mark a class of 40 students</div>
        </div>
        <div className="rounded-lg border border-line p-5 bg-white" data-reveal>
          <div className="text-[34px] font-bold font-mono text-navy leading-none">0<span className="text-primary"> ms</span></div>
          <div className="text-[12.5px] text-muted mt-2">Connection required to save. Local first, always.</div>
        </div>
        <div className="rounded-lg border border-line p-5 bg-white" data-reveal>
          <div className="text-[34px] font-bold font-mono text-navy leading-none">100<span className="text-primary">%</span></div>
          <div className="text-[12.5px] text-muted mt-2">DepEd grading compliant — WW · PT · QA weights</div>
        </div>
        <div className="rounded-lg border border-line p-5 bg-white" data-reveal>
          <div className="text-[34px] font-bold font-mono text-navy leading-none">3<span className="text-primary"> SFs</span></div>
          <div className="text-[12.5px] text-muted mt-2">Generates SF2, SF9, SF10 forms one tap</div>
        </div>
      </div>
    </section>
  );
}
