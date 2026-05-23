export function DepEdSection() {
  return (
    <section id="deped" className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
        {/* Transmutation table */}
        <div data-reveal>
          <div className="rounded-xl border border-line bg-white p-5">
            <div className="text-[10px] tracking-widest font-semibold text-muted uppercase">DEPED-compliant transmutation</div>
            <div className="mt-2 text-[18px] font-semibold text-navy">WW · PT · QA → Quarterly Grade</div>
            <div className="mt-4 flex w-full h-3 rounded-full overflow-hidden">
              <div style={{ width: '20%', background: '#0F766E' }}></div>
              <div style={{ width: '60%', background: '#10B981' }}></div>
              <div style={{ width: '20%', background: '#6366F1' }}></div>
            </div>
            <div className="mt-2 grid grid-cols-3 text-[11px] text-muted">
              <span>WW 20%</span><span className="text-center">PT 60%</span><span className="text-right">QA 20%</span>
            </div>
            <table className="w-full mt-5 text-[12.5px] border-collapse">
              <thead className="text-muted text-left">
                <tr>
                  <th className="font-semibold py-2">Threshold</th>
                  <th className="font-semibold py-2">Tier</th>
                  <th className="font-semibold py-2 text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-line"><td className="py-2 font-mono text-navy">≥ 98</td><td className="py-2">With Highest Honors</td><td className="py-2 text-right font-mono font-semibold">2</td></tr>
                <tr className="border-t border-line"><td className="py-2 font-mono text-navy">95–97</td><td className="py-2">With High Honors</td><td className="py-2 text-right font-mono font-semibold">5</td></tr>
                <tr className="border-t border-line"><td className="py-2 font-mono text-navy">90–94</td><td className="py-2">With Honors</td><td className="py-2 text-right font-mono font-semibold">14</td></tr>
                <tr className="border-t border-line"><td className="py-2 font-mono text-navy">≥ 75</td><td className="py-2">Passing</td><td className="py-2 text-right font-mono font-semibold">131</td></tr>
                <tr className="border-t border-line"><td className="py-2 font-mono text-rose-600">{'<'} 75</td><td className="py-2">Needs intervention</td><td className="py-2 text-right font-mono font-semibold">3</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Copy + SF cards */}
        <div data-reveal>
          <span className="text-[12px] font-semibold tracking-[0.16em] uppercase text-primary">DepEd-ready</span>
          <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight text-navy mt-2">Built around the forms you already file.</h2>
          <p className="mt-5 text-[15.5px] text-muted leading-relaxed">No more juggling spreadsheets, then re-typing into SF2 templates the night before submission. AralSync speaks DepEd natively.</p>

          <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-line p-4 bg-white">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary-light text-primary-dark text-[10.5px] font-bold">SF2</div>
              <div className="text-[14px] font-semibold text-navy mt-2">Daily Attendance Record</div>
              <div className="text-[12px] text-muted mt-1">Monthly grid auto-generated from your daily marks.</div>
            </div>
            <div className="rounded-lg border border-line p-4 bg-white">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary-light text-primary-dark text-[10.5px] font-bold">SF9</div>
              <div className="text-[14px] font-semibold text-navy mt-2">Learner's Report Card</div>
              <div className="text-[12px] text-muted mt-1">Per-student quarterly grade, ready for parent distribution.</div>
            </div>
            <div className="rounded-lg border border-line p-4 bg-white">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary-light text-primary-dark text-[10.5px] font-bold">SF10</div>
              <div className="text-[14px] font-semibold text-navy mt-2">Permanent Record</div>
              <div className="text-[12px] text-muted mt-1">Cumulative academic history, locked to Q4 transmittal window.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
