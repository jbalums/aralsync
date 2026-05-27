// @ts-nocheck
import React, { useState } from 'react';
import {
  Icon, Avatar, Badge, QuarterBadge, Card, Modal, EmptyState, Skeleton,
  StatCard, Progress, ComponentWeightBar, ConnPill, Logo, Sparkbars,
  RingChart, Donut, HeatCalendar, SubjectChip, SectionHeader,
  Btn, Dropdown, Tabs, Switch, Field, TextInput, Select,
  useToast, BADGE_STYLES, AVATAR_PALETTE, gradeColor,
} from '../components';

function Section({ title, subtitle = null, children }) {
  return (
    <Card className="p-5">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function Label({ children }) {
  return (
    <p className="text-[11px] text-muted uppercase tracking-wider mb-2.5 font-semibold">
      {children}
    </p>
  );
}

const HEAT_STATUSES = Object.fromEntries(
  Array.from({ length: 31 }, (_, i) => [
    i + 1,
    (['present','present','present','late','absent','excused','none'] as const)[i % 7],
  ])
);

export function PageSystemDesign() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [switchA, setSwitchA] = useState(true);
  const [switchB, setSwitchB] = useState(false);
  const [textVal, setTextVal] = useState('');

  return (
    <div className="page-anim flex flex-col gap-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-navy">System Design</h1>
        <p className="text-sm text-muted mt-1">
          Full UI component inventory — AralSync primitives
        </p>
      </div>

      {/* ── 1. Buttons ──────────────────────────────────────── */}
      <Section title="Buttons">
        <div className="flex flex-col gap-4">
          <div>
            <Label>Variants</Label>
            <div className="flex flex-wrap gap-2">
              <Btn variant="primary">Primary</Btn>
              <Btn variant="secondary">Secondary</Btn>
              <Btn variant="ghost">Ghost</Btn>
              <Btn variant="soft">Soft</Btn>
              <Btn variant="danger">Danger</Btn>
              <Btn variant="dark">Dark</Btn>
            </div>
          </div>
          <div>
            <Label>Sizes</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Btn size="sm" variant="primary">Small</Btn>
              <Btn size="md" variant="primary">Medium</Btn>
              <Btn size="lg" variant="primary">Large</Btn>
            </div>
          </div>
          <div>
            <Label>With icons</Label>
            <div className="flex flex-wrap gap-2">
              <Btn icon="save" variant="primary">Save & Sync</Btn>
              <Btn icon="plus" variant="secondary">Add student</Btn>
              <Btn icon="download" variant="ghost">Export</Btn>
              <Btn iconRight="chevron-right" variant="soft">Next step</Btn>
              <Btn icon="trash-2" variant="danger">Delete</Btn>
            </div>
          </div>
          <div>
            <Label>Disabled</Label>
            <div className="flex flex-wrap gap-2">
              <Btn variant="primary" disabled>Primary</Btn>
              <Btn variant="secondary" disabled>Secondary</Btn>
              <Btn variant="danger" disabled>Danger</Btn>
            </div>
          </div>
          <div>
            <Label>Loading state</Label>
            <div className="flex flex-wrap gap-2">
              <Btn icon="loader" variant="primary" disabled>Saving…</Btn>
              <Btn icon="refresh-cw" variant="secondary" disabled>Syncing…</Btn>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 2. Badges ───────────────────────────────────────── */}
      <Section title="Badges">
        <div className="flex flex-col gap-4">
          <div>
            <Label>All 14 status variants (with dot)</Label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(BADGE_STYLES).map((k) => (
                <Badge key={k} status={k} withDot />
              ))}
            </div>
          </div>
          <div>
            <Label>Without dot</Label>
            <div className="flex flex-wrap gap-2">
              {['present','late','absent','excused','pending','synced','failed'].map((k) => (
                <Badge key={k} status={k} />
              ))}
            </div>
          </div>
          <div>
            <Label>Sizes</Label>
            <div className="flex flex-wrap items-center gap-3">
              <Badge status="present" size="sm" withDot />
              <Badge status="present" withDot />
              <Badge status="present" size="lg" withDot />
            </div>
          </div>
          <div>
            <Label>QuarterBadge — Q1–Q4</Label>
            <div className="flex gap-2">
              {['Q1','Q2','Q3','Q4'].map((q) => (
                <QuarterBadge key={q} quarter={q} />
              ))}
            </div>
          </div>
          <div>
            <Label>gradeColor() — transmuted grade bands</Label>
            <div className="flex gap-2 flex-wrap items-center">
              {[100, 95, 90, 87, 82, 78, 65].map((g) => {
                const c = gradeColor(g);
                return (
                  <span
                    key={g}
                    className="px-2.5 py-0.5 rounded-md text-[12px] font-semibold"
                    style={{ background: c.bg, color: c.fg }}
                  >
                    {g}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 3. Avatars ──────────────────────────────────────── */}
      <Section title="Avatars">
        <div className="flex flex-col gap-4">
          <div>
            <Label>Sizes — xs · sm · md · lg · xl</Label>
            <div className="flex items-end gap-4 flex-wrap">
              {[
                { name: 'Maria Santos',   size: 'xs' },
                { name: 'Juan dela Cruz', size: 'sm' },
                { name: 'Ana Reyes',      size: 'md' },
                { name: 'Pedro Gomez',    size: 'lg' },
                { name: 'Rosa Ramos',     size: 'xl' },
              ].map(({ name, size }) => (
                <div key={size} className="flex flex-col items-center gap-1">
                  <Avatar name={name} size={size} />
                  <span className="text-[10px] text-muted">{size}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label>Square variant</Label>
            <div className="flex items-end gap-4">
              <Avatar name="Maria Santos"   size="md" square />
              <Avatar name="Juan dela Cruz" size="lg" square />
            </div>
          </div>
          <div>
            <Label>Color palette (6 deterministic colors)</Label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_PALETTE.map((p, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold"
                  style={{ background: p.bg, color: p.fg }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 4. Cards ────────────────────────────────────────── */}
      <Section title="Cards">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {['base','elevated','interactive','danger'].map((v) => (
            <Card key={v} variant={v} className="p-4">
              <p className="text-[11px] text-muted uppercase tracking-wider font-semibold mb-1">
                {v}
              </p>
              <p className="text-[13px] text-navy">Card body content</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── 5. Form elements ────────────────────────────────── */}
      <Section title="Form Elements">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
          <Field label="Text input" hint="Learner's full name">
            <TextInput
              placeholder="e.g. Juan dela Cruz"
              value={textVal}
              onChange={(e) => setTextVal(e.target.value)}
            />
          </Field>
          <Field label="Select" hint="Pick grade level">
            <Select>
              <option>Grade 7</option>
              <option>Grade 8</option>
              <option>Grade 9</option>
              <option>Grade 10</option>
            </Select>
          </Field>
          <Field label="Input — error state" error="LRN must be exactly 12 digits.">
            <TextInput placeholder="123456789012" />
          </Field>
          <Field label="Input — required" required hint="This field is required">
            <TextInput placeholder="School name" />
          </Field>
          <Field label="Switch — enabled">
            <Switch
              value={switchA}
              onChange={setSwitchA}
              label={switchA ? 'AM session active' : 'AM session off'}
              hint="Toggle session"
            />
          </Field>
          <Field label="Switch — disabled">
            <Switch
              value={switchB}
              onChange={setSwitchB}
              label={switchB ? 'Notifications on' : 'Notifications off'}
              hint="Toggle notifications"
            />
          </Field>
        </div>
      </Section>

      {/* ── 6. Toasts ───────────────────────────────────────── */}
      <Section title="Toasts" subtitle="Click to fire a live toast — appears bottom-right">
        <div className="flex flex-wrap gap-2">
          <Btn
            icon="check-circle"
            variant="soft"
            onClick={() =>
              toast.push({
                type: 'success',
                title: 'Attendance saved',
                message: '32 records uploaded to cloud.',
              })
            }
          >
            Success
          </Btn>
          <Btn
            icon="x-circle"
            variant="soft"
            onClick={() =>
              toast.push({
                type: 'error',
                title: 'Sync failed',
                message: 'Failed to push records. Check connection.',
              })
            }
          >
            Error
          </Btn>
          <Btn
            icon="alert-triangle"
            variant="soft"
            onClick={() =>
              toast.push({
                type: 'warning',
                title: 'Outside window',
                message: 'Submission window closes in 5 minutes.',
              })
            }
          >
            Warning
          </Btn>
          <Btn
            icon="info"
            variant="soft"
            onClick={() =>
              toast.push({
                type: 'info',
                title: 'Bulk action',
                message: '18 students marked Present via bulk mark.',
              })
            }
          >
            Info
          </Btn>
          <Btn
            icon="pin"
            variant="ghost"
            onClick={() =>
              toast.push({
                type: 'success',
                title: 'Sticky toast',
                message: 'This will not auto-dismiss — close manually.',
                duration: 0,
              })
            }
          >
            Sticky
          </Btn>
        </div>
      </Section>

      {/* ── 7. Modal ────────────────────────────────────────── */}
      <Section title="Modal">
        <Btn icon="layout" variant="secondary" onClick={() => setModalOpen(true)}>
          Open demo modal
        </Btn>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Demo modal"
          subtitle="Subtitle / context line goes here"
          footer={
            <div className="flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={() => setModalOpen(false)}>Confirm</Btn>
            </div>
          }
        >
          <p className="text-[13.5px] text-navy leading-relaxed">
            Modal body — supports any React children. Use for confirmations,
            forms, summaries, or multi-step flows. Max width defaults to
            <code className="mx-1 font-mono text-[12px] bg-surface px-1 rounded">max-w-lg</code>
            but is configurable via the <code className="font-mono text-[12px] bg-surface px-1 rounded">width</code> prop.
          </p>
        </Modal>
      </Section>

      {/* ── 8. Stats & Charts ───────────────────────────────── */}
      <Section title="Stats & Charts">
        <div className="flex flex-col gap-6">
          <div>
            <Label>StatCard — 6 color variants</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { color: 'primary', icon: 'users',       label: 'Students',   value: '128', trend: '+4 this month' },
                { color: 'accent',  icon: 'check-circle', label: 'Attendance', value: '94%', trend: '+2.1%' },
                { color: 'blue',    icon: 'book-open',    label: 'Classes',    value: '6' },
                { color: 'amber',   icon: 'clock',        label: 'Late today', value: '7' },
                { color: 'rose',    icon: 'x-circle',     label: 'Absent',     value: '3', trend: '-1 vs yesterday' },
                { color: 'purple',  icon: 'award',        label: 'Honor roll', value: '12' },
              ].map((s) => <StatCard key={s.label} {...s} />)}
            </div>
          </div>

          <div>
            <Label>Progress bars</Label>
            <div className="flex flex-col gap-3 max-w-md">
              {[
                { label: 'Attendance rate 87%', value: 87, cls: undefined },
                { label: 'Grade entries 45%',   value: 45, cls: 'bg-amber-500' },
                { label: 'Sync queue 12%',       value: 12, cls: 'bg-rose-500' },
              ].map(({ label, value, cls }) => (
                <div key={label}>
                  <p className="text-[12px] text-muted mb-1">{label}</p>
                  <Progress value={value} barClass={cls} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>ComponentWeightBar (WW · PT · QA)</Label>
            <div className="max-w-sm flex flex-col gap-2">
              <ComponentWeightBar ww={20} pt={60} qa={20} />
              <ComponentWeightBar ww={30} pt={50} qa={20} />
              <ComponentWeightBar ww={25} pt={55} qa={20} />
            </div>
          </div>

          <div>
            <Label>Ring chart · Donut · Sparkbars</Label>
            <div className="flex flex-wrap gap-10 items-center">
              <div className="flex flex-col items-center gap-2">
                <RingChart percent={87} label="87%" />
                <span className="text-[11px] text-muted font-mono">RingChart</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Donut
                  segs={[
                    { value: 70, color: '#10B981' },
                    { value: 15, color: '#F59E0B' },
                    { value: 10, color: '#EF4444' },
                    { value: 5,  color: '#8B5CF6' },
                  ]}
                />
                <span className="text-[11px] text-muted font-mono">Donut</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Sparkbars values={[60, 80, 72, 90, 85, 78, 95]} label="7-day attendance" />
                <span className="text-[11px] text-muted font-mono">Sparkbars</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 9. Data display ─────────────────────────────────── */}
      <Section title="Data Display">
        <div className="flex flex-col gap-5">
          <div>
            <Label>HeatCalendar — May 2026</Label>
            <HeatCalendar year={2026} month={4} statuses={HEAT_STATUSES} />
          </div>
          <div>
            <Label>SubjectChip</Label>
            <div className="flex flex-wrap gap-2">
              {['Science','Mathematics','English','Filipino','MAPEH','TLE','AP'].map((name) => (
                <SubjectChip key={name} subject={name} />
              ))}
            </div>
          </div>
          <div>
            <Label>ConnPill</Label>
            <div className="flex gap-3 items-center">
              <ConnPill online={true} />
              <ConnPill online={false} />
            </div>
          </div>
          <div>
            <Label>Logo variants</Label>
            <div className="flex items-center gap-8 flex-wrap">
              <div className="flex flex-col items-center gap-1">
                <Logo />
                <span className="text-[10px] text-muted">default</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Logo withTag />
                <span className="text-[10px] text-muted">withTag</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Logo iconOnly />
                <span className="text-[10px] text-muted">iconOnly</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Logo size={30} />
                <span className="text-[10px] text-muted">size=30</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 10. Navigation ──────────────────────────────────── */}
      <Section title="Navigation">
        <div className="flex flex-col gap-5">
          <div>
            <Label>Tabs</Label>
            <Tabs
              tabs={[
                { id: 'overview',  label: 'Overview',  icon: 'layout-dashboard' },
                { id: 'students',  label: 'Students',  icon: 'users',           count: 32 },
                { id: 'gradebook', label: 'Gradebook', icon: 'table' },
                { id: 'reports',   label: 'Reports',   icon: 'file-text' },
              ]}
              active={activeTab}
              onChange={setActiveTab}
            />
            <div className="mt-3 px-3 py-2 rounded-md bg-surface text-[13px] text-muted">
              Active: <strong className="text-navy">{activeTab}</strong>
            </div>
          </div>
          <div>
            <Label>Dropdown</Label>
            <Dropdown
              trigger={
                <Btn icon="more-horizontal" variant="secondary">
                  Actions
                </Btn>
              }
              items={[
                { label: 'Edit class load', icon: 'pencil',    onClick: () => {} },
                { label: 'Export SF2',      icon: 'download',  onClick: () => {} },
                { label: 'Duplicate',       icon: 'copy',      onClick: () => {} },
                { separator: true },
                { label: 'Delete',          icon: 'trash-2',   onClick: () => {}, right: '⚠' },
              ]}
            />
          </div>
        </div>
      </Section>

      {/* ── 11. Feedback states ─────────────────────────────── */}
      <Section title="Feedback States">
        <div className="flex flex-col gap-5">
          <div>
            <Label>Skeleton variants</Label>
            <div className="flex flex-col gap-2 max-w-sm">
              <Skeleton variant="text" />
              <Skeleton variant="text" className="w-2/3" />
              <Skeleton variant="avatar" />
              <Skeleton variant="table-row" />
              <Skeleton variant="card" />
            </div>
          </div>
          <div>
            <Label>EmptyState</Label>
            <EmptyState
              icon="inbox"
              title="No records found"
              description="Add students or class loads to get started."
              action={<Btn variant="primary" icon="plus">Add student</Btn>}
            />
          </div>
        </div>
      </Section>

      {/* ── 12. Typography ──────────────────────────────────── */}
      <Section title="Typography & Colors">
        <div className="flex flex-col gap-5">
          <div>
            <Label>Heading scale</Label>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-navy">H1 — AralSync heading</h1>
              <h2 className="text-2xl font-bold text-navy">H2 — Class records</h2>
              <h3 className="text-xl font-semibold text-navy">H3 — Grade 7 – Rizal</h3>
              <h4 className="text-base font-semibold text-navy">H4 — Section detail</h4>
              <p className="text-[14px] text-navy">Body — Regular paragraph content for reading.</p>
              <p className="text-[12.5px] text-muted">Small / muted — Supporting caption or metadata.</p>
              <p className="text-[11px] font-mono text-muted">Mono — LRN 123456789012</p>
            </div>
          </div>
          <div>
            <Label>Brand gradient text</Label>
            <p className="gradient-text text-3xl font-bold">
              Teach more. Sync seamlessly.
            </p>
          </div>
          <div>
            <Label>Pills & dots</Label>
            <div className="flex flex-wrap gap-2 items-center">
              {[
                { bg: '#D1FAE5', fg: '#065F46', dot: '#10B981', label: 'Online' },
                { bg: '#FFFBEB', fg: '#92400E', dot: '#F59E0B', label: 'Offline' },
                { bg: '#FEE2E2', fg: '#7F1D1D', dot: '#EF4444', label: 'Failed' },
                { bg: '#EDE9FE', fg: '#4C1D95', dot: '#8B5CF6', label: 'Excused' },
              ].map(({ bg, fg, dot, label }) => (
                <span key={label} className="pill" style={{ background: bg, color: fg }}>
                  <span className="dot" style={{ background: dot }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div>
            <Label>Icons (Lucide subset used in app)</Label>
            <div className="flex flex-wrap gap-3">
              {[
                'save','check-circle','x-circle','alert-triangle','info','clock',
                'users','book-open','calendar','download','upload','refresh-cw',
                'wifi','wifi-off','lock','award','trash-2','pencil','plus','x',
                'chevron-right','more-horizontal','layout-dashboard','table',
                'file-text','hard-drive','cloud-upload','shield-check',
              ].map((name) => (
                <div key={name} className="flex flex-col items-center gap-1 w-14">
                  <Icon name={name} size={20} className="text-navy" />
                  <span className="text-[9px] font-mono text-muted text-center leading-tight">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 13. Animations ──────────────────────────────────── */}
      <Section title="Animation Utilities">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { cls: 'page-anim',  label: 'page-anim',  desc: 'Fade + slide on mount' },
            { cls: 'toast-anim', label: 'toast-anim', desc: 'Slide in from right' },
            { cls: 'modal-anim', label: 'modal-anim', desc: 'Scale in 0.96 → 1' },
            { cls: 'float-anim', label: 'float-anim', desc: '6s vertical bob' },
            { cls: 'spin-slow',  label: 'spin-slow',  desc: '2s slow rotation' },
            { cls: 'skeleton',   label: 'skeleton',   desc: 'Shimmer placeholder' },
            { cls: 'pulse-dot',  label: 'pulse-dot',  desc: 'Opacity 1 → 0.45 pulse' },
            { cls: 'press tx',   label: '.press.tx',  desc: 'Scale 0.96 on click' },
          ].map(({ cls, label, desc }) => (
            <div
              key={label}
              className="rounded-md border border-line p-3 flex flex-col items-center gap-2 bg-surface/40"
            >
              <div
                className={`${cls} w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center`}
              >
                <Icon name="box" size={16} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="font-mono text-[11px] text-navy font-semibold">.{label}</p>
                <p className="text-[10.5px] text-muted leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
