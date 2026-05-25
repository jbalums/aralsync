import React, { useCallback, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import {
  Icon, Card, Modal, StatCard, SectionHeader, Btn, Badge, Field, TextInput, useToast,
} from '../components';
import {
  schoolsService,
  type CreateSchoolPayload,
  type BulkSchoolRow,
  type BulkCreateSchoolsResult,
} from '../modules/classrooms/schools.service';
import { useAuthStore } from '../modules/auth/authStore';
import type { School } from '../shared/types';

const schoolSchema = z.object({
  name: z.string().min(2, 'School name must be at least 2 characters'),
  schoolId: z.string().min(1, 'DepEd school ID is required'),
  division: z.string().min(2, 'Division is required'),
  district: z.string().optional(),
  address: z.string().optional(),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

export function PageOwnerDashboard() {
  const user = useAuthStore((s) => s.user);
  const _toast = useToast() as { push: (t: { type: string; title?: string; message?: string }) => void } | null;
  const push = _toast?.push.bind(_toast) ?? (() => {});
  const qc = useQueryClient();
  const navigate = useNavigate();

  function openSchoolProfile(school: School) {
    navigate({ to: '/app/owner/schools/$schoolId', params: { schoolId: school.id } });
  }

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<School | null>(null);

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: () => schoolsService.listAll(),
    enabled: user?.role === 'super_admin',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SchoolFormValues>({ resolver: zodResolver(schoolSchema) });

  const createMutation = useMutation({
    mutationFn: (data: CreateSchoolPayload) => schoolsService.createSchool(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['schools'] });
      push({ type: 'success', title: 'School created' });
      closeDialog();
    },
    onError: (err: Error) => {
      push({ type: 'error', title: err.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSchoolPayload> }) =>
      schoolsService.updateSchool(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['schools'] });
      push({ type: 'success', title: 'School updated' });
      closeDialog();
    },
    onError: (err: Error) => {
      push({ type: 'error', title: err.message });
    },
  });

  function openCreate() {
    setEditTarget(null);
    reset({ name: '', schoolId: '', division: '', district: '', address: '' });
    setDialogOpen(true);
  }

  function openEdit(school: School) {
    setEditTarget(school);
    reset({
      name: school.name,
      schoolId: school.schoolId,
      division: school.division,
      district: school.district ?? '',
      address: school.address ?? '',
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditTarget(null);
    reset();
  }

  function onSubmit(values: SchoolFormValues) {
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  }

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon name="shield-off" size={40} className="text-muted mx-auto mb-3" />
          <p className="text-navy font-semibold">Not authorized</p>
          <p className="text-muted text-[13px] mt-1">This page is only accessible to platform owners.</p>
        </div>
      </div>
    );
  }

  const activeCount = schools.filter((s) => s.isActive).length;

  return (
    <div className="page-anim space-y-5">
      {/* Header */}
      <Card
        className="p-4 sm:p-5 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 70%, #3b82f6 130%)' }}
      >
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative flex items-start justify-between gap-3 flex-wrap text-white">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-[11px] font-semibold tracking-wider uppercase">
              <Icon name="globe-2" size={12} /> Platform Owner · Super Admin
            </div>
            <h2 className="text-[26px] font-semibold tracking-tight mt-2.5">Owner Dashboard</h2>
            <p className="text-[13px] text-white/80 mt-1 max-w-xl">
              Manage all registered schools. Teachers can only register once their school is listed here.
            </p>
          </div>
          <div className="flex gap-2">
            <Btn
              size="sm"
              icon="upload"
              className="bg-white/15! text-white! hover:bg-white/25! border border-white/30!"
              onClick={() => setBulkOpen(true)}
            >
              Bulk Import
            </Btn>
            <Btn
              size="sm"
              icon="plus"
              className="bg-white! text-blue-800! hover:bg-blue-50!"
              onClick={openCreate}
            >
              Add School
            </Btn>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon="building-2" label="Total Schools" value={schools.length} color="primary" />
        <StatCard icon="check-circle" label="Active" value={activeCount} color="accent" sub={`${schools.length - activeCount} inactive`} />
        <StatCard icon="users" label="Awaiting Teachers" value="—" color="blue" sub="Teachers register per school" />
        <StatCard icon="cloud" label="Sync Status" value="Live" color="primary" sub="Cloud mode" />
      </div>

      {/* Schools table */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center gap-3 flex-wrap">
          <SectionHeader title="Registered Schools" subtitle={`${schools.length} school${schools.length !== 1 ? 's' : ''} total`} />
          <span className="ml-auto" />
          <Btn variant="ghost" size="sm" icon="upload" onClick={() => setBulkOpen(true)}>Bulk Import</Btn>
          <Btn variant="primary" size="sm" icon="plus" onClick={openCreate}>Add School</Btn>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted text-[13px]">Loading schools…</div>
        ) : schools.length === 0 ? (
          <div className="p-10 text-center">
            <Icon name="building-2" size={36} className="text-muted mx-auto mb-3" />
            <p className="text-navy font-semibold">No schools yet</p>
            <p className="text-muted text-[13px] mt-1 mb-4">Add the first school so teachers can start registering.</p>
            <Btn variant="primary" size="sm" icon="plus" onClick={openCreate}>Add School</Btn>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="bg-surface text-muted text-left">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">School Name</th>
                  <th className="px-3 py-2.5 font-semibold">DepEd ID</th>
                  <th className="px-3 py-2.5 font-semibold">Division</th>
                  <th className="px-3 py-2.5 font-semibold">District</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 font-semibold w-16" />
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => (
                  <tr key={school.id} className="border-t border-line hover:bg-slate-50/40">
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => openSchoolProfile(school)}
                        className="text-left group"
                        title="Open school profile"
                      >
                        <div className="font-semibold text-navy group-hover:text-primary group-hover:underline underline-offset-2 decoration-primary/40 transition-colors">
                          {school.name}
                        </div>
                        {school.address && (
                          <div className="text-[11px] text-muted">{school.address}</div>
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-navy">{school.schoolId}</td>
                    <td className="px-3 py-2.5 text-navy/80">{school.division}</td>
                    <td className="px-3 py-2.5 text-navy/80">{school.district || '—'}</td>
                    <td className="px-3 py-2.5">
                      <Badge status={school.isActive ? 'synced' : 'pending'}>
                        {school.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => openEdit(school)}
                        className="p-1.5 rounded hover:bg-slate-100 text-muted hover:text-navy tx"
                        title="Edit school"
                      >
                        <Icon name="pencil" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        open={dialogOpen}
        onClose={closeDialog}
        title={editTarget ? 'Edit School' : 'Add School'}
        width="max-w-xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="School Name" required hint={errors.name?.message}>
            <TextInput
              {...register('name')}
              placeholder="e.g. Rizal National High School"
              className={errors.name ? 'border-red-400' : ''}
            />
          </Field>

          <Field label="DepEd School ID" required hint={errors.schoolId?.message}>
            <TextInput
              {...register('schoolId')}
              placeholder="e.g. 301034"
              disabled={!!editTarget}
              className={errors.schoolId ? 'border-red-400' : ''}
            />
          </Field>

          <Field label="Division" required hint={errors.division?.message}>
            <TextInput
              {...register('division')}
              placeholder="e.g. Division of Laguna"
              className={errors.division ? 'border-red-400' : ''}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="District" hint={errors.district?.message}>
              <TextInput
                {...register('district')}
                placeholder="e.g. Calamba District 1"
              />
            </Field>
            <Field label="Address">
              <TextInput
                {...register('address')}
                placeholder="e.g. Brgy. Real, Calamba"
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="ghost" size="sm" type="button" onClick={closeDialog}>
              Cancel
            </Btn>
            <Btn
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              {editTarget ? 'Save Changes' : 'Create School'}
            </Btn>
          </div>
        </form>
      </Modal>

      <ImportSchoolsModal open={bulkOpen} onClose={() => setBulkOpen(false)} />
    </div>
  );
}

// ─── Bulk import modal ─────────────────────────────────────────

type ParsedRow = BulkSchoolRow;

function normalizeBulkRow(raw: Record<string, unknown>): ParsedRow | null {
  const lookup: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    lookup[k.trim().toLowerCase().replace(/[\s_-]+/g, '')] = String(v ?? '').trim();
  }
  const schoolId = lookup['schoolid'] ?? lookup['depedid'] ?? lookup['id'] ?? '';
  const name = lookup['schoolname'] ?? lookup['name'] ?? '';
  const address = lookup['address'] ?? '';
  if (!schoolId || !name || name.length < 2) return null;
  return {
    schoolId,
    name,
    address: address && address !== '-' ? address : undefined,
  };
}

function downloadTemplate() {
  const csv = 'School ID,School Name,Address\n407535,"BIT International College-Carmen","Carmen, Bohol"\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'schools-template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseCSVString(text: string): { rows: ParsedRow[]; error: string } {
  try {
    const wb = XLSX.read(text, { type: 'string' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
    const parsed = raw.map(normalizeBulkRow).filter(Boolean) as ParsedRow[];
    if (parsed.length === 0) {
      return { rows: [], error: 'No valid rows found. Expected columns: School ID, School Name, Address' };
    }
    return { rows: parsed, error: '' };
  } catch {
    return { rows: [], error: 'Failed to parse CSV content. Check format and try again.' };
  }
}

function ImportSchoolsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const _toast = useToast() as { push: (t: { type: string; title?: string; message?: string }) => void } | null;
  const push = _toast?.push.bind(_toast) ?? (() => {});
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'file' | 'paste'>('file');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [parseError, setParseError] = useState('');
  const [result, setResult] = useState<BulkCreateSchoolsResult | null>(null);

  const importMutation = useMutation({
    mutationFn: () =>
      schoolsService.bulkCreateSchools({
        division: division.trim(),
        district: district.trim() || undefined,
        schools: rows,
      }),
    onSuccess: (r) => {
      setResult(r);
      void qc.invalidateQueries({ queryKey: ['schools'] });
      push({
        type: 'success',
        title: `Imported ${r.created} school${r.created !== 1 ? 's' : ''}`,
      });
    },
    onError: (err: Error) => {
      push({ type: 'error', title: err.message });
    },
  });

  const handleFile = useCallback((file: File) => {
    setParseError('');
    setRows([]);
    setResult(null);
    if (file.size > 5 * 1024 * 1024) {
      setParseError('File too large. Max 5 MB.');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
        const parsed = raw.map(normalizeBulkRow).filter(Boolean) as ParsedRow[];
        if (parsed.length === 0) {
          setParseError('No valid rows found. Expected columns: School ID, School Name, Address');
        } else {
          setRows(parsed);
        }
      } catch {
        setParseError('Failed to parse file. Ensure it is a valid CSV or Excel file.');
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  const handlePasteChange = useCallback((text: string) => {
    setPasteText(text);
    setResult(null);
    if (!text.trim()) {
      setRows([]);
      setParseError('');
      return;
    }
    const { rows: parsed, error } = parseCSVString(text);
    setRows(parsed);
    setParseError(error);
  }, []);

  function switchMode(next: 'file' | 'paste') {
    setMode(next);
    setRows([]);
    setParseError('');
    setFileName('');
    setPasteText('');
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  function reset() {
    setRows([]);
    setFileName('');
    setPasteText('');
    setParseError('');
    setResult(null);
    setDivision('');
    setDistrict('');
    setMode('file');
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleClose() {
    onClose();
    reset();
  }

  const divisionValid = division.trim().length >= 2;
  const canImport = divisionValid && rows.length > 0 && !importMutation.isPending;

  return (
    <Modal open={open} onClose={handleClose} title="Bulk Import Schools" width="max-w-2xl">
      {result ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-center">
              <div className="text-[24px] font-semibold text-emerald-700 font-mono">{result.created}</div>
              <div className="text-[12px] text-emerald-600">Created</div>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-center">
              <div className="text-[24px] font-semibold text-amber-700 font-mono">{result.skipped.length}</div>
              <div className="text-[12px] text-amber-600">Skipped</div>
            </div>
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-center">
              <div className="text-[24px] font-semibold text-red-700 font-mono">{result.failed.length}</div>
              <div className="text-[12px] text-red-600">Failed</div>
            </div>
          </div>

          {(result.skipped.length > 0 || result.failed.length > 0) && (
            <div className="rounded-md border border-line overflow-hidden">
              <div className="px-3 py-2 bg-surface text-[12px] font-semibold text-navy">
                Issues
              </div>
              <div className="max-h-56 overflow-y-auto">
                {[...result.skipped.map((r) => ({ ...r, kind: 'skipped' as const })),
                  ...result.failed.map((r) => ({ ...r, kind: 'failed' as const }))].map((r, i) => (
                  <div key={i} className="px-3 py-2 border-t border-line text-[12px] flex items-start gap-2">
                    <span className={`mt-0.5 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${r.kind === 'skipped' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {r.kind}
                    </span>
                    <div className="flex-1">
                      <span className="font-mono text-navy">{r.schoolId}</span>
                      <span className="text-navy ml-2">{r.name}</span>
                      <div className="text-muted">{r.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="ghost" size="sm" onClick={() => { reset(); }}>Import Another</Btn>
            <Btn variant="primary" size="sm" onClick={handleClose}>Done</Btn>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Division" required hint={!divisionValid && division.length > 0 ? 'Required' : undefined}>
              <TextInput
                value={division}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDivision(e.target.value)}
                placeholder="e.g. Division of Bohol"
              />
            </Field>
            <Field label="District">
              <TextInput
                value={district}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDistrict(e.target.value)}
                placeholder="e.g. Tagbilaran District"
              />
            </Field>
          </div>

          <div className="flex items-center gap-1 rounded-md bg-surface p-1 w-fit">
            <button
              type="button"
              onClick={() => switchMode('file')}
              className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-colors ${mode === 'file' ? 'bg-white text-navy shadow-sm' : 'text-muted hover:text-navy'}`}
            >
              <Icon name="upload-cloud" size={13} className="mr-1.5" /> Upload file
            </button>
            <button
              type="button"
              onClick={() => switchMode('paste')}
              className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-colors ${mode === 'paste' ? 'bg-white text-navy shadow-sm' : 'text-muted hover:text-navy'}`}
            >
              <Icon name="clipboard-paste" size={13} className="mr-1.5" /> Paste CSV
            </button>
          </div>

          {mode === 'file' ? (
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="rounded-md border-2 border-dashed border-line bg-surface/50 p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Icon name="upload-cloud" size={36} className="text-primary mx-auto" />
              <div className="text-[14px] font-semibold text-navy mt-3">
                {rows.length > 0 ? `${rows.length} row${rows.length !== 1 ? 's' : ''} ready` : 'Drop a CSV / Excel file here'}
              </div>
              <div className="text-[12px] text-muted mt-1">
                or <span className="text-primary font-semibold">browse files</span> · max 5 MB · UTF-8
              </div>
              {fileName && rows.length > 0 && (
                <div className="text-[11px] text-muted mt-2 font-mono">{fileName}</div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={pasteText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handlePasteChange(e.target.value)}
                placeholder={'School ID,School Name,Address\n407535,"BIT International College-Carmen","Carmen, Bohol"\n…'}
                spellCheck={false}
                className="w-full h-48 rounded-md border border-line bg-white p-3 font-mono text-[12px] text-navy resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <div className="text-[12px] text-muted flex items-center justify-between">
                <span>Paste CSV with the header row included.</span>
                {rows.length > 0 && (
                  <span className="text-emerald-600 font-semibold">
                    {rows.length} row{rows.length !== 1 ? 's' : ''} ready
                  </span>
                )}
              </div>
            </div>
          )}

          {parseError && (
            <div className="text-[12px] text-red-500 rounded-md bg-red-50 border border-red-200 px-3 py-2">
              {parseError}
            </div>
          )}

          <div className="overflow-hidden rounded-md border border-line">
            <div className="px-3 py-2 bg-surface text-[12px] font-semibold text-navy flex items-center justify-between">
              <span>Expected columns</span>
              <button
                type="button"
                onClick={downloadTemplate}
                className="text-primary hover:underline text-[11px] font-medium"
              >
                Download template
              </button>
            </div>
            <table className="w-full text-[11.5px]">
              <thead className="text-muted bg-surface/50">
                <tr>
                  <th className="px-3 py-1.5 text-left font-semibold">CSV column</th>
                  <th className="px-3 py-1.5 text-left font-semibold">Required</th>
                  <th className="px-3 py-1.5 text-left font-semibold">Example</th>
                </tr>
              </thead>
              <tbody className="text-navy">
                <tr className="border-t border-line">
                  <td className="px-3 py-1.5 font-mono">School ID</td>
                  <td className="px-3 py-1.5">Yes</td>
                  <td className="px-3 py-1.5">407535</td>
                </tr>
                <tr className="border-t border-line">
                  <td className="px-3 py-1.5 font-mono">School Name</td>
                  <td className="px-3 py-1.5">Yes</td>
                  <td className="px-3 py-1.5">BIT International College-Carmen</td>
                </tr>
                <tr className="border-t border-line">
                  <td className="px-3 py-1.5 font-mono">Address</td>
                  <td className="px-3 py-1.5">No</td>
                  <td className="px-3 py-1.5">Carmen, Bohol</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="ghost" size="sm" onClick={handleClose}>Cancel</Btn>
            <Btn
              variant="primary"
              size="sm"
              icon="upload"
              disabled={!canImport}
              onClick={() => importMutation.mutate()}
            >
              {importMutation.isPending
                ? 'Importing…'
                : `Import ${rows.length} school${rows.length !== 1 ? 's' : ''}`}
            </Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}
