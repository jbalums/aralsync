import { ArrowUpRight, LayoutDashboard, BookMarked, Users, ClipboardCheck, CalendarDays, GraduationCap, FileText } from 'lucide-react';

export function PreviewSection() {
  return (
    <section id="preview" className="bg-surface border-y border-line py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto" data-reveal>
          <span className="text-[12px] font-semibold tracking-[0.16em] uppercase text-primary">See it in action</span>
          <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight text-navy mt-2">Designed to disappear behind your teaching.</h2>
          <p className="mt-4 text-[15.5px] text-muted">Open the demo and click through every page - no sign-up required.</p>
        </div>

        <div className="mt-10 relative" data-reveal>
          <div className="absolute inset-0 -m-6 rounded-3xl bg-gradient-to-br from-primary/15 to-emerald-300/20 blur-3xl"></div>
          <div className="relative rounded-2xl bg-white soft-shadow border border-line overflow-hidden">
            {/* Browser chrome */}
            <div className="h-9 bg-surface border-b border-line flex items-center px-3 gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400/70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70"></span>
              <span className="mx-auto text-[11px] font-mono text-muted-light">aralsync.com / dashboard</span>
            </div>
            <div className="grid grid-cols-[180px_1fr] min-h-[420px]">
              {/* Faux sidebar */}
              <div className="border-r border-line bg-white p-3 hidden sm:block">
                <div className="text-[10px] uppercase tracking-wider text-muted-light font-semibold px-2 mb-2">Main</div>
                <div className="space-y-0.5">
                  <div className="px-2.5 py-1.5 rounded-md bg-primary-light/70 text-primary-dark text-[12.5px] font-semibold flex items-center gap-2">
                    <LayoutDashboard className="w-3.5 h-3.5" strokeWidth={1.75} /> Dashboard
                  </div>
                  <div className="px-2.5 py-1.5 rounded-md text-navy/70 text-[12.5px] font-medium flex items-center gap-2">
                    <BookMarked className="w-3.5 h-3.5" strokeWidth={1.75} /> Classes
                  </div>
                  <div className="px-2.5 py-1.5 rounded-md text-navy/70 text-[12.5px] font-medium flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" strokeWidth={1.75} /> Students
                  </div>
                  <div className="px-2.5 py-1.5 rounded-md text-navy/70 text-[12.5px] font-medium flex items-center gap-2">
                    <ClipboardCheck className="w-3.5 h-3.5" strokeWidth={1.75} /> Attendance
                  </div>
                  <div className="px-2.5 py-1.5 rounded-md text-navy/70 text-[12.5px] font-medium flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5" strokeWidth={1.75} /> Schedules
                  </div>
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-light font-semibold px-2 mt-4 mb-2">Academics</div>
                <div className="space-y-0.5">
                  <div className="px-2.5 py-1.5 rounded-md text-navy/70 text-[12.5px] font-medium flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5" strokeWidth={1.75} /> Gradebook
                  </div>
                  <div className="px-2.5 py-1.5 rounded-md text-navy/70 text-[12.5px] font-medium flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" strokeWidth={1.75} /> Reports
                  </div>
                </div>
              </div>

              {/* Faux dashboard */}
              <div className="p-5">
                <div className="text-[10px] uppercase tracking-widest text-primary font-semibold">Tuesday · Q3 Week 8</div>
                <div className="text-[20px] font-semibold tracking-tight text-navy mt-1">Good morning, Ma'am Maria.</div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                  <div className="rounded-lg border border-line p-3.5">
                    <div className="text-[10.5px] uppercase tracking-wider text-muted font-semibold">Students today</div>
                    <div className="text-[22px] font-bold font-mono text-navy mt-1">155<span className="text-muted text-[12px]">/165</span></div>
                  </div>
                  <div className="rounded-lg border border-line p-3.5">
                    <div className="text-[10.5px] uppercase tracking-wider text-muted font-semibold">Attendance</div>
                    <div className="text-[22px] font-bold font-mono text-emerald-700 mt-1">92.6%</div>
                  </div>
                  <div className="rounded-lg border border-line p-3.5">
                    <div className="text-[10.5px] uppercase tracking-wider text-muted font-semibold">Avg grade</div>
                    <div className="text-[22px] font-bold font-mono text-blue-700 mt-1">85.3</div>
                  </div>
                  <div className="rounded-lg border border-line p-3.5">
                    <div className="text-[10.5px] uppercase tracking-wider text-muted font-semibold">Pending sync</div>
                    <div className="text-[22px] font-bold font-mono text-amber-600 mt-1">3</div>
                  </div>
                </div>
                <div className="mt-5 rounded-lg border border-line p-4">
                  <div className="text-[12px] uppercase tracking-wider text-muted font-semibold mb-3">Today's Schedule</div>
                  <div className="space-y-2.5 text-[12.5px]">
                    <div className="flex items-center gap-3 py-1.5">
                      <span className="w-1 h-8 rounded bg-teal-500"></span>
                      <span className="font-mono w-20 text-navy">7:30 AM</span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: '#CCFBF1', color: '#0F766E' }}>Science</span>
                      <span className="text-muted">Grade 7 – Rizal</span>
                      <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] text-emerald-700 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Saved
                      </span>
                    </div>
                    <div className="flex items-center gap-3 py-1.5 bg-primary-light/30 -mx-4 px-4 rounded-md">
                      <span className="w-1 h-8 rounded bg-blue-600"></span>
                      <span className="font-mono w-20 text-navy">8:30 AM</span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: '#DBEAFE', color: '#1E3A8A' }}>Math</span>
                      <span className="text-muted">Grade 7 – Bonifacio</span>
                      <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] text-amber-700 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 pulse-dot"></span>In progress
                      </span>
                    </div>
                    <div className="flex items-center gap-3 py-1.5">
                      <span className="w-1 h-8 rounded bg-violet-500"></span>
                      <span className="font-mono w-20 text-navy">10:00 AM</span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: '#EDE9FE', color: '#4C1D95' }}>English</span>
                      <span className="text-muted">Grade 8 – Aguinaldo</span>
                      <span className="ml-auto text-[11px] text-muted">Upcoming</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a href="/app" className="inline-flex items-center gap-2 h-11 px-5 rounded-md bg-navy text-white font-semibold text-[14px] hover:bg-primary press tx">
              Open the live demo <ArrowUpRight className="w-4 h-4" strokeWidth={1.75} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
