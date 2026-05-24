import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import {
  Icon, Avatar, Badge, Card, Modal, useToast,
  EmptyState, Skeleton, StatCard, Progress,
  SectionHeader, Btn, Field, TextInput, Select, Tabs,
} from '../components';
import {
  useStudents,
  useStudent,
  useStudentByLRN,
  useStudentAttendanceSummary,
  useCreateStudent,
  useImportStudents,
  useUpdateStudent,
  useDeleteStudent,
} from '../modules/students/useStudents';
import { useClassLoads } from '../modules/classrooms/useClassLoads';
import { validateLRN } from '../shared/utils/lrn';
import type { ImportResult, StudentImportRow } from '../modules/students/students.service';
import type { ClassLoadListItem, Student } from '../shared/types';

// ─── Schemas ─────────────────────────────────────────────
const addSchema = z.object({
  lrn:           z.string().length(12, 'LRN must be 12 digits').regex(/^\d{12}$/, 'LRN must contain only digits'),
  lastName:      z.string().min(1, 'Required'),
  firstName:     z.string().min(1, 'Required'),
  middleInitial: z.string().max(2).optional(),
  gender:        z.enum(['M', 'F']),
  birthday:      z.string().optional(),
  classLoadId:   z.string().min(1, 'Select a class'),
  guardianName:       z.string().default(''),
  guardianRelationship: z.string().default(''),
  guardianContact:    z.string().default(''),
});
type AddFormValues = z.infer<typeof addSchema>;

const editSchema = z.object({
  lastName:             z.string().min(1, 'Required'),
  firstName:            z.string().min(1, 'Required'),
  middleInitial:        z.string().max(2).optional(),
  gender:               z.enum(['M', 'F']),
  birthday:             z.string().optional(),
  guardianName:         z.string().optional(),
  guardianRelationship: z.string().optional(),
  guardianContact:      z.string().optional(),
});
type EditFormValues = z.infer<typeof editSchema>;

// ─── CSV row normaliser ──────────────────────────────────
function normalizeImportRow(raw: Record<string, string>): StudentImportRow | null {
  const lrn = (raw['LRN'] ?? raw['lrn'] ?? '').toString().replace(/\D/g, '').slice(0, 12);
  if (lrn.length !== 12) return null;
  const gender = (raw['GENDER'] ?? raw['gender'] ?? 'F').toString().toUpperCase();
  return {
    lrn,
    lastName:      raw['LAST_NAME'] ?? raw['lastName'] ?? raw['last_name'] ?? '',
    firstName:     raw['FIRST_NAME'] ?? raw['firstName'] ?? raw['first_name'] ?? '',
    middleInitial: raw['MI'] ?? raw['middleInitial'] ?? '',
    gender:        (gender === 'M' || gender === 'MALE') ? 'M' : 'F',
    birthday:      raw['BIRTHDAY'] ?? raw['birthday'] ?? undefined,
    guardian: (raw['GUARDIAN_NAME'] ?? raw['guardianName'])
      ? {
          name:          raw['GUARDIAN_NAME'] ?? raw['guardianName'] ?? '',
          relationship:  raw['GUARDIAN_RELATIONSHIP'] ?? raw['guardianRelationship'] ?? '',
          contactNumber: raw['GUARDIAN_CONTACT'] ?? raw['guardianContact'] ?? '',
        }
      : undefined,
  };
}

// ─── STUDENTS LIST ───────────────────────────────────────

export function PageStudents() {
  const navigate = useNavigate();
  const toast = useToast();

  const [q, setQ]                   = useState('');
  const [classLoadId, setClassLoadId] = useState('');
  const [page, setPage]             = useState(1);
  const [addOpen, setAddOpen]       = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const { data, isLoading } = useStudents({ q: q || undefined, classLoadId: classLoadId || undefined, page, limit: 50 });
  const students = data?.students ?? [];
  const total    = data?.total ?? 0;
  const pages    = data?.pages ?? 1;

  const { data: classLoads = [] } = useClassLoads();

  return (
    <div className="page-anim space-y-5">
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search by name or LRN…"
              className="w-full h-9 pl-9 pr-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none"
            />
          </div>
          <Select value={classLoadId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setClassLoadId(e.target.value); setPage(1); }} className="!h-9 max-w-[240px]">
            <option value="">All classes</option>
            {classLoads.map((c) => (
              <option key={c.id} value={c.id}>{c.section.gradeLevel} · {c.section.name} · {c.subject.name}</option>
            ))}
          </Select>
          <span className="ml-auto"/>
          <Btn variant="secondary" size="sm" icon="upload" onClick={() => setImportOpen(true)}>Import CSV</Btn>
          <Btn variant="primary"   size="sm" icon="user-plus" onClick={() => setAddOpen(true)}>Add student</Btn>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">{[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-12"/>)}</div>
        ) : students.length === 0 ? (
          <div className="p-10 text-center">
            <EmptyState icon="users" title="No students found" description={q ? 'Try a different search.' : 'Add or import students to get started.'} action={undefined}/>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="bg-surface text-muted text-left">
                <tr>
                  <th className="px-3 py-2.5 font-semibold w-10">#</th>
                  <th className="px-3 py-2.5 font-semibold">Student</th>
                  <th className="px-3 py-2.5 font-semibold">LRN</th>
                  <th className="px-3 py-2.5 font-semibold">Gender</th>
                  <th className="px-3 py-2.5 font-semibold w-10"/>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr
                    key={s.id}
                    className="border-t border-line hover:bg-slate-50/40 cursor-pointer"
                    onClick={() => void navigate({ to: '/app/students/$studentId', params: { studentId: s.id } })}
                  >
                    <td className="px-3 py-2 font-mono text-muted">{(page - 1) * 50 + i + 1}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={`${s.firstName} ${s.lastName}`} size="sm"/>
                        <span className="font-semibold text-navy">
                          {s.lastName}, {s.firstName}{s.middleInitial ? ` ${s.middleInitial.slice(0,1)}.` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-muted">{s.lrn}</td>
                    <td className="px-3 py-2 text-muted">{s.gender === 'M' ? 'Male' : 'Female'}</td>
                    <td className="px-3 py-2 text-right">
                      <Icon name="chevron-right" size={14} className="text-muted"/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 border-t border-line flex items-center justify-between text-[12px] text-muted">
          <span>Showing {students.length} of {total}</span>
          <div className="flex items-center gap-1">
            <Btn size="sm" variant="ghost" icon="chevron-left"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >Prev</Btn>
            <span className="px-2 font-mono">{page} / {pages}</span>
            <Btn size="sm" variant="ghost" iconRight="chevron-right"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
            >Next</Btn>
          </div>
        </div>
      </Card>

      <AddStudentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        classLoads={classLoads}
        onSuccess={() => toast?.push({ type: 'success', title: 'Student added', message: 'Queued for sync.' })}
      />
      <ImportCSVModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        classLoads={classLoads}
        onSuccess={(r) => toast?.push({
          type: 'success',
          title: 'Import complete',
          message: `Created ${r.created}, updated ${r.updated}${r.failed.length ? `, ${r.failed.length} failed` : ''}.`,
        })}
      />
    </div>
  );
}

// ─── Add-student modal ───────────────────────────────────

interface AddStudentModalProps {
  open: boolean;
  onClose: () => void;
  classLoads: ClassLoadListItem[];
  onSuccess?: () => void;
}

function AddStudentModal({ open, onClose, classLoads, onSuccess }: AddStudentModalProps) {
  const createMutation = useCreateStudent();
  const [lrnTouched, setLrnTouched] = useState(false);

  const {
    register, handleSubmit, watch, reset,
    formState: { errors, isSubmitting },
    setError, clearErrors,
  } = useForm({
    resolver: zodResolver(addSchema),
    defaultValues: { gender: 'F' },
  });

  const lrnValue = watch('lrn') ?? '';
  const { data: dupStudent } = useStudentByLRN(lrnTouched && lrnValue.length === 12 ? lrnValue : '');

  const onSubmit = async (values: AddFormValues) => {
    try {
      await createMutation.mutateAsync({
        lrn:           values.lrn,
        lastName:      values.lastName,
        firstName:     values.firstName,
        middleInitial: values.middleInitial,
        gender:        values.gender,
        birthday:      values.birthday,
        classLoadId:   values.classLoadId,
        guardian: {
          name:          values.guardianName ?? '',
          relationship:  values.guardianRelationship ?? '',
          contactNumber: values.guardianContact ?? '',
        },
      });
      onSuccess?.();
      reset();
      onClose();
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError('root', { message: msg ?? 'Failed to add student.' });
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => { onClose(); reset(); }}
      title="Add student"
      subtitle="Adds a learner to the selected class load"
      width="max-w-2xl"
      footer={<>
        <Btn variant="ghost" onClick={() => { onClose(); reset(); }}>Cancel</Btn>
        <Btn variant="primary" icon="user-plus"
          onClick={() => { void handleSubmit(onSubmit)(); }}
          disabled={isSubmitting || createMutation.isPending}
        >
          {isSubmitting || createMutation.isPending ? 'Adding…' : 'Add learner'}
        </Btn>
      </>}
    >
      <form className="grid grid-cols-3 gap-3" noValidate>
        {errors.root && (
          <div className="col-span-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {errors.root.message}
          </div>
        )}

        <div className="col-span-3">
          <label className="text-[13px] font-medium text-navy block mb-1">
            LRN (12 digits) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            maxLength={12}
            {...register('lrn', {
              onBlur: (e) => {
                setLrnTouched(true);
                const val = e.target.value;
                if (val.length === 12 && !validateLRN(val)) {
                  setError('lrn', { message: 'Invalid LRN - check digit does not match' });
                } else {
                  clearErrors('lrn');
                }
              },
            })}
            placeholder="105432100123"
            className="h-[42px] w-full px-3 rounded-lg border text-[14px] bg-white outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 border-line"
          />
          {errors.lrn && <span className="text-[12px] text-red-500 mt-1 block">{errors.lrn.message}</span>}
          {dupStudent && !errors.lrn && (
            <span className="text-[12px] text-amber-600 mt-1 block">
              Warning: LRN already exists - {dupStudent.lastName}, {dupStudent.firstName}
            </span>
          )}
        </div>

        <Field label="Last name" required error={errors.lastName?.message}>
          <TextInput placeholder="dela Cruz" {...register('lastName')}/>
        </Field>
        <Field label="First name" required error={errors.firstName?.message}>
          <TextInput placeholder="Juan" {...register('firstName')}/>
        </Field>
        <Field label="Middle initial">
          <TextInput placeholder="R" maxLength={2} {...register('middleInitial')}/>
        </Field>
        <Field label="Gender">
          <Select {...register('gender')}>
            <option value="F">Female</option>
            <option value="M">Male</option>
          </Select>
        </Field>
        <Field label="Birthday">
          <TextInput type="date" {...register('birthday')}/>
        </Field>
        <Field label="Class load" required error={errors.classLoadId?.message}>
          <Select {...register('classLoadId')}>
            <option value="">Select class…</option>
            {classLoads.map((c) => (
              <option key={c.id} value={c.id}>{c.section.gradeLevel} · {c.section.name} · {c.subject.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Guardian name">
          <TextInput placeholder="Rosario dela Cruz" {...register('guardianName')}/>
        </Field>
        <Field label="Relationship">
          <TextInput placeholder="Mother" {...register('guardianRelationship')}/>
        </Field>
        <Field label="Contact number">
          <TextInput placeholder="+63 917 123 4567" {...register('guardianContact')}/>
        </Field>
      </form>
    </Modal>
  );
}

// ─── CSV import modal ────────────────────────────────────

interface ImportCSVModalProps {
  open: boolean;
  onClose: () => void;
  classLoads: ClassLoadListItem[];
  onSuccess?: (r: ImportResult) => void;
}

function ImportCSVModal({ open, onClose, classLoads, onSuccess }: ImportCSVModalProps) {
  const importMutation = useImportStudents();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<StudentImportRow[]>([]);
  const [parseError, setParseError] = useState('');
  const [classLoadId, setClassLoadId] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFile = useCallback((file: File) => {
    setParseError('');
    setRows([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
        const parsed = raw.map(normalizeImportRow).filter(Boolean) as StudentImportRow[];
        if (parsed.length === 0) {
          setParseError('No valid rows found. Check the column headers match the template.');
        } else {
          setRows(parsed);
        }
      } catch {
        setParseError('Failed to parse file. Ensure it is a valid CSV or Excel file.');
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleImport = async () => {
    if (!classLoadId || rows.length === 0) return;
    const r = await importMutation.mutateAsync({ classLoadId, students: rows });
    setResult(r);
    onSuccess?.(r);
  };

  const reset = () => { setRows([]); setParseError(''); setClassLoadId(''); setResult(null); };

  return (
    <Modal
      open={open}
      onClose={() => { onClose(); reset(); }}
      title="Import students from CSV"
      subtitle="Upload a DepEd roster CSV or Excel file"
      width="max-w-2xl"
      footer={<>
        <Btn variant="ghost" onClick={() => { onClose(); reset(); }}>Cancel</Btn>
        <Btn variant="primary" icon="upload"
          onClick={() => { void handleImport(); }}
          disabled={rows.length === 0 || !classLoadId || importMutation.isPending}
        >
          {importMutation.isPending ? 'Importing…' : `Import ${rows.length} row${rows.length !== 1 ? 's' : ''}`}
        </Btn>
      </>}
    >
      {result ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-center">
              <div className="text-[24px] font-semibold text-emerald-700 font-mono">{result.created}</div>
              <div className="text-[12px] text-emerald-600">Created</div>
            </div>
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-center">
              <div className="text-[24px] font-semibold text-blue-700 font-mono">{result.updated}</div>
              <div className="text-[12px] text-blue-600">Updated</div>
            </div>
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-center">
              <div className="text-[24px] font-semibold text-red-700 font-mono">{result.failed.length}</div>
              <div className="text-[12px] text-red-600">Failed</div>
            </div>
          </div>
          {result.failed.length > 0 && (
            <div className="rounded-md border border-line overflow-hidden">
              <div className="px-3 py-2 bg-surface text-[12px] font-semibold text-navy">Failed rows</div>
              <div className="max-h-40 overflow-y-auto">
                {result.failed.map((f, i) => (
                  <div key={i} className="px-3 py-2 border-t border-line text-[12px]">
                    <span className="font-mono text-navy">{f.lrn}</span>
                    <span className="text-muted ml-2">- {f.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="rounded-md border-2 border-dashed border-line bg-surface/50 p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Icon name="upload-cloud" size={36} className="text-primary mx-auto"/>
            <div className="text-[14px] font-semibold text-navy mt-3">
              {rows.length > 0 ? `${rows.length} rows ready` : 'Drop a CSV / Excel file here'}
            </div>
            <div className="text-[12px] text-muted mt-1">or <span className="text-primary font-semibold">browse files</span> · max 5 MB · UTF-8</div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>

          {parseError && (
            <div className="text-[12px] text-red-500 rounded-md bg-red-50 border border-red-200 px-3 py-2">{parseError}</div>
          )}

          <div className="flex items-center gap-3">
            <label className="text-[13px] font-medium text-navy min-w-max">Assign to class:</label>
            <Select value={classLoadId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClassLoadId(e.target.value)} className="flex-1">
              <option value="">Select class…</option>
              {classLoads.map((c) => (
                <option key={c.id} value={c.id}>{c.section.gradeLevel} · {c.section.name} · {c.subject.name}</option>
              ))}
            </Select>
          </div>

          <div className="overflow-hidden rounded-md border border-line">
            <div className="px-3 py-2 bg-surface text-[12px] font-semibold text-navy">Expected columns</div>
            <table className="w-full text-[11.5px]">
              <thead className="text-muted bg-surface/50">
                <tr>
                  <th className="px-3 py-1.5 text-left font-semibold">CSV column</th>
                  <th className="px-3 py-1.5 text-left font-semibold">Maps to</th>
                  <th className="px-3 py-1.5 text-left font-semibold">Example</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['LRN', 'lrn', '105432100023'],
                  ['LAST_NAME', 'lastName', 'dela Cruz'],
                  ['FIRST_NAME', 'firstName', 'Juan'],
                  ['MI', 'middleInitial', 'R'],
                  ['GENDER', 'gender (M/F)', 'F'],
                  ['BIRTHDAY', 'birthday', '2012-03-19'],
                ].map(([col, field, ex]) => (
                  <tr key={col} className="border-t border-line">
                    <td className="px-3 py-1.5 font-mono text-navy">{col}</td>
                    <td className="px-3 py-1.5 text-muted">{field}</td>
                    <td className="px-3 py-1.5 text-navy">{ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Edit-student modal ───────────────────────────────────

interface EditStudentModalProps {
  open: boolean;
  onClose: () => void;
  student: Student;
  onSuccess?: () => void;
}

function EditStudentModal({ open, onClose, student, onSuccess }: EditStudentModalProps) {
  const updateMutation = useUpdateStudent();

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(editSchema),
  });

  // Pre-fill when student changes or modal opens
  React.useEffect(() => {
    if (open) {
      reset({
        lastName:             student.lastName,
        firstName:            student.firstName,
        middleInitial:        student.middleInitial ?? '',
        gender:               student.gender,
        birthday:             student.birthday ?? '',
        guardianName:         student.guardian?.name ?? '',
        guardianRelationship: student.guardian?.relationship ?? '',
        guardianContact:      student.guardian?.contactNumber ?? '',
      });
    }
  }, [open, student, reset]);

  const onSubmit = async (raw: FieldValues) => {
    try {
      await updateMutation.mutateAsync({
        id: student.id,
        payload: {
          lastName:      raw.lastName,
          firstName:     raw.firstName,
          middleInitial: raw.middleInitial,
          gender:        raw.gender,
          birthday:      raw.birthday,
          guardian: {
            name:          raw.guardianName ?? '',
            relationship:  raw.guardianRelationship ?? '',
            contactNumber: raw.guardianContact ?? '',
          },
        },
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError('root', { message: msg ?? 'Failed to update student.' });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit student"
      subtitle={`${student.lastName}, ${student.firstName}`}
      width="max-w-2xl"
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" icon="save"
          onClick={() => { void handleSubmit(onSubmit)(); }}
          disabled={isSubmitting || updateMutation.isPending}
        >
          {isSubmitting || updateMutation.isPending ? 'Saving…' : 'Save changes'}
        </Btn>
      </>}
    >
      <form className="grid grid-cols-3 gap-3" noValidate>
        {errors.root && (
          <div className="col-span-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {errors.root.message}
          </div>
        )}
        <Field label="Last name" required error={errors.lastName?.message}>
          <TextInput placeholder="dela Cruz" {...register('lastName')}/>
        </Field>
        <Field label="First name" required error={errors.firstName?.message}>
          <TextInput placeholder="Juan" {...register('firstName')}/>
        </Field>
        <Field label="Middle initial">
          <TextInput placeholder="R" maxLength={2} {...register('middleInitial')}/>
        </Field>
        <Field label="Gender">
          <Select {...register('gender')}>
            <option value="F">Female</option>
            <option value="M">Male</option>
          </Select>
        </Field>
        <Field label="Birthday">
          <TextInput type="date" {...register('birthday')}/>
        </Field>
        <div className="col-span-1"/>
        <Field label="Guardian name">
          <TextInput placeholder="Rosario dela Cruz" {...register('guardianName')}/>
        </Field>
        <Field label="Relationship">
          <TextInput placeholder="Mother" {...register('guardianRelationship')}/>
        </Field>
        <Field label="Contact number">
          <TextInput placeholder="+63 917 123 4567" {...register('guardianContact')}/>
        </Field>
      </form>
    </Modal>
  );
}

// ─── Delete-student modal ─────────────────────────────────

interface DeleteStudentModalProps {
  open: boolean;
  onClose: () => void;
  student: Student;
  onSuccess: () => void;
}

function DeleteStudentModal({ open, onClose, student, onSuccess }: DeleteStudentModalProps) {
  const deleteMutation = useDeleteStudent();
  const [input, setInput] = useState('');

  const expectedName = `${student.firstName} ${student.lastName}`;
  const confirmed = input.trim() === expectedName;

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(student.id);
    onSuccess();
  };

  React.useEffect(() => {
    if (open) setInput('');
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete student"
      subtitle="This action cannot be undone"
      width="max-w-md"
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="danger" icon="trash-2"
          onClick={() => { void handleDelete(); }}
          disabled={!confirmed || deleteMutation.isPending}
        >
          {deleteMutation.isPending ? 'Deleting…' : 'Delete permanently'}
        </Btn>
      </>}
    >
      <div className="space-y-4">
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
          <strong>{student.lastName}, {student.firstName}</strong> will be removed from
          all classes. Attendance and grade records are preserved but the student
          will no longer appear in any list.
        </div>
        <div>
          <label className="text-[13px] font-medium text-navy block mb-1.5">
            Type <span className="font-mono bg-slate-100 px-1 rounded">{expectedName}</span> to confirm
          </label>
          <TextInput
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            placeholder={expectedName}
          />
        </div>
      </div>
    </Modal>
  );
}

// ─── STUDENT PROFILE ─────────────────────────────────────

export function PageStudentProfile() {
  const navigate = useNavigate();
  const toast = useToast();
  const { studentId } = useParams({ strict: false }) as { studentId: string };
  const [tab, setTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: student, isLoading } = useStudent(studentId);
  const { data: summary } = useStudentAttendanceSummary(studentId);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Card className="p-6 space-y-3">
          <Skeleton className="h-7 w-1/2"/>
          <Skeleton className="h-4 w-1/3"/>
        </Card>
      </div>
    );
  }

  if (!student) {
    return <EmptyState icon="alert-circle" title="Student not found" description="This student does not exist or you don't have access." action={undefined}/>;
  }

  const fullName = `${student.firstName}${student.middleInitial ? ` ${student.middleInitial.slice(0,1)}.` : ''} ${student.lastName}`;

  return (
    <div className="page-anim space-y-5">
      <Card className="p-5 sm:p-6">
        <button
          onClick={() => void navigate({ to: '/app/students' })}
          className="text-[12px] text-muted hover:text-navy inline-flex items-center gap-1 mb-3"
        >
          <Icon name="arrow-left" size={12}/> Back to Students
        </button>
        <div className="flex items-start gap-5 flex-wrap">
          <Avatar name={fullName} size="xl"/>
          <div className="flex-1 min-w-0">
            <h2 className="text-[24px] font-semibold tracking-tight text-navy">
              {student.lastName}, {student.firstName}{student.middleInitial ? ` ${student.middleInitial.slice(0,1)}.` : ''}
            </h2>
            <div className="text-[13px] text-muted mt-0.5">
              LRN <span className="font-mono">{student.lrn}</span> · {student.gender === 'M' ? 'Male' : 'Female'}
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {summary && (
                <span className={`pill ${summary.rate >= 85 ? 'bg-emerald-50 text-emerald-700' : summary.rate >= 75 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                  <Icon name="check-circle" size={11}/>{summary.rate}% attendance
                </span>
              )}
              {student.birthday && (
                <span className="pill bg-slate-100 text-slate-700">
                  <Icon name="calendar" size={11}/>Born {student.birthday}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="secondary" size="sm" icon="pencil" onClick={() => setEditOpen(true)}>Edit</Btn>
            <Btn variant="danger" size="sm" icon="trash-2" onClick={() => setDeleteOpen(true)}>Delete</Btn>
          </div>
        </div>
      </Card>

      <Tabs
        tabs={[
          { id: 'overview',   label: 'Overview',   icon: 'layout-dashboard' },
          { id: 'attendance', label: 'Attendance', icon: 'clipboard-check' },
          { id: 'grades',     label: 'Grades',     icon: 'graduation-cap' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'overview' && (
        <div className="space-y-5">
          {summary ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard icon="check-circle"   label="Attendance rate" value={`${summary.rate}%`}   color="accent"  sub={`${summary.total} sessions`}/>
              <StatCard icon="check"          label="Present"         value={summary.present}       color="primary" sub="sessions"/>
              <StatCard icon="clock"          label="Late"            value={summary.late}           color="amber"  sub="sessions"/>
              <StatCard icon="user-x"         label="Absent"          value={summary.absent}         color="rose"   sub="sessions"/>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {[1,2,3,4].map((i) => <Skeleton key={i} className="h-24"/>)}
            </div>
          )}

          {student.guardian?.name && (
            <Card className="p-5">
              <SectionHeader title="Guardian"/>
              <div className="flex items-center gap-3 mt-3">
                <Avatar name={student.guardian.name} size="lg"/>
                <div>
                  <div className="text-[14px] font-semibold text-navy">{student.guardian.name}</div>
                  {student.guardian.relationship && (
                    <div className="text-[12px] text-muted">{student.guardian.relationship}</div>
                  )}
                  {student.guardian.contactNumber && (
                    <div className="text-[12.5px] text-navy mt-1 flex items-center gap-2">
                      <Icon name="phone" size={13} className="text-muted"/>{student.guardian.contactNumber}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'attendance' && (
        <Card className="p-8 text-center">
          <Icon name="clipboard-check" size={32} className="text-muted mx-auto mb-3"/>
          <p className="text-[14px] font-semibold text-navy">Detailed attendance coming in Phase 5</p>
          {summary && (
            <p className="text-[13px] text-muted mt-1">
              Overall: {summary.present} present · {summary.late} late · {summary.absent} absent · {summary.excused} excused
            </p>
          )}
        </Card>
      )}

      {tab === 'grades' && (
        <Card className="p-8 text-center">
          <Icon name="graduation-cap" size={32} className="text-muted mx-auto mb-3"/>
          <p className="text-[14px] font-semibold text-navy">Grades coming in Phase 6</p>
          <p className="text-[13px] text-muted mt-1">Gradebook must be wired first.</p>
        </Card>
      )}

      <EditStudentModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        student={student}
        onSuccess={() => toast?.push({ type: 'success', title: 'Student updated', message: 'Changes saved.' })}
      />
      <DeleteStudentModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        student={student}
        onSuccess={() => {
          toast?.push({ type: 'success', title: 'Student deleted' });
          void navigate({ to: '/app/students' });
        }}
      />
    </div>
  );
}
