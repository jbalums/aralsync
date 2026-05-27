import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Modal, Btn, Select, Tabs, Icon } from '../../../components';
import { useImportStudents } from '../useStudents';
import { useAuthStore } from '../../auth/authStore';
import {
  normalizeImportRow,
  mapRowByOrder,
  FIELD_LABELS,
  FIELD_SAMPLE,
  REQUIRED_FIELDS,
  DEFAULT_COLUMN_ORDER,
  ALL_FIELDS,
  type ImportField,
} from '../student-import.utils';
import type { ImportResult, StudentImportRow } from '../students.service';
import type { ClassLoadListItem } from '../../../shared/types';

interface ImportCSVModalProps {
  open:       boolean;
  onClose:    () => void;
  classLoads: ClassLoadListItem[];
  onSuccess?: (r: ImportResult) => void;
}

export function ImportCSVModal({ open, onClose, classLoads, onSuccess }: ImportCSVModalProps) {
  const importMutation = useImportStudents();
  const userId         = useAuthStore((s) => s.user?.id ?? '');
  const fileRef        = useRef<HTMLInputElement>(null);

  const [rows, setRows]                   = useState<StudentImportRow[]>([]);
  const [parseError, setParseError]       = useState('');
  const [classLoadId, setClassLoadId]     = useState('');
  const [result, setResult]               = useState<ImportResult | null>(null);
  const [tab, setTab]                     = useState<'file' | 'paste'>('file');
  const [pasteText, setPasteText]         = useState('');
  const [columnOrder, setColumnOrder]     = useState<ImportField[]>(DEFAULT_COLUMN_ORDER);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [rejectedSample, setRejectedSample] = useState<string[]>([]);

  const storageKey = userId ? `aralsync.importColumnOrder.${userId}` : '';

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.every((f) => ALL_FIELDS.includes(f as ImportField))) {
        setColumnOrder(parsed as ImportField[]);
      }
    } catch { /* ignore */ }
  }, [storageKey]);

  const persistOrder = useCallback((order: ImportField[]) => {
    setColumnOrder(order);
    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(order)); } catch { /* ignore quota */ }
    }
  }, [storageKey]);

  const parseFileWorkbook = useCallback((wb: XLSX.WorkBook) => {
    const ws  = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
    const parsed = raw.map(normalizeImportRow).filter(Boolean) as StudentImportRow[];
    if (parsed.length === 0) {
      setParseError('No valid rows found. Check the column headers match the template.');
      setRows([]);
    } else {
      setParseError('');
      setRows(parsed);
    }
  }, []);

  const parsePasteMatrix = useCallback((order: ImportField[], text: string) => {
    const cleaned = text.replace(/^﻿/, '').replace(/[\r\n]+$/g, '');
    if (!cleaned.trim()) {
      setRows([]); setParseError(''); setRejectedCount(0); setRejectedSample([]);
      return;
    }
    try {
      const wb     = XLSX.read(cleaned, { type: 'string' });
      const ws     = wb.Sheets[wb.SheetNames[0]];
      const matrix = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });
      const parsed: StudentImportRow[] = [];
      const rejected: string[]         = [];
      matrix.forEach((cols, i) => {
        if (!cols || cols.every((c) => !String(c).trim())) return;
        const r = mapRowByOrder(cols as string[], order);
        if ('error' in r) rejected.push(`row ${i + 1}: ${r.error}`);
        else parsed.push(r);
      });
      setRows(parsed);
      setRejectedCount(rejected.length);
      setRejectedSample(rejected.slice(0, 3));
      if (parsed.length === 0 && rejected.length === 0) {
        setParseError('No rows detected.');
      } else if (parsed.length === 0) {
        setParseError('No valid rows. Check column order matches your pasted data.');
      } else {
        setParseError('');
      }
    } catch {
      setParseError('Failed to parse pasted text. Ensure it is comma-separated.');
      setRows([]); setRejectedCount(0); setRejectedSample([]);
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    setParseError(''); setRows([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'binary' });
        parseFileWorkbook(wb);
      } catch {
        setParseError('Failed to parse file. Ensure it is a valid CSV or Excel file.');
      }
    };
    reader.readAsBinaryString(file);
  }, [parseFileWorkbook]);

  const handlePaste = useCallback((text: string) => {
    setPasteText(text);
    parsePasteMatrix(columnOrder, text);
  }, [columnOrder, parsePasteMatrix]);

  // Re-parse when column order changes while paste text is present
  useEffect(() => {
    if (tab === 'paste' && pasteText) parsePasteMatrix(columnOrder, pasteText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnOrder]);

  const missingRequired = REQUIRED_FIELDS.filter((f) => !columnOrder.includes(f));

  const moveColumn   = (idx: number, delta: number) => {
    const next = [...columnOrder];
    const j    = idx + delta;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    persistOrder(next);
  };
  const removeColumn = (idx: number)  => persistOrder(columnOrder.filter((_, i) => i !== idx));
  const addColumn    = (f: ImportField) => {
    if (f !== 'skip' && columnOrder.includes(f)) return;
    persistOrder([...columnOrder, f]);
  };
  const resetOrder   = () => persistOrder(DEFAULT_COLUMN_ORDER);

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

  const reset = () => {
    setRows([]); setParseError(''); setClassLoadId(''); setResult(null);
    setTab('file'); setPasteText(''); setRejectedCount(0); setRejectedSample([]);
  };

  const importDisabled =
    rows.length === 0 || !classLoadId || importMutation.isPending ||
    (tab === 'paste' && missingRequired.length > 0);

  return (
    <Modal
      open={open}
      onClose={() => { onClose(); reset(); }}
      title="Import students from CSV"
      subtitle="Upload a DepEd roster CSV or Excel file"
      width="max-w-2xl"
      footer={
        <>
          <Btn variant="ghost" onClick={() => { onClose(); reset(); }}>Cancel</Btn>
          <Btn
            variant="primary"
            icon="upload"
            onClick={() => { void handleImport(); }}
            disabled={importDisabled}
          >
            {importMutation.isPending
              ? 'Importing…'
              : `Import ${rows.length} row${rows.length !== 1 ? 's' : ''}`}
          </Btn>
        </>
      }
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
          <Tabs
            tabs={[
              { id: 'file',  label: 'Upload file', icon: 'upload-cloud' },
              { id: 'paste', label: 'Paste CSV',   icon: 'clipboard'    },
            ]}
            active={tab}
            onChange={(id: 'file' | 'paste') => setTab(id)}
          />

          {tab === 'file' ? (
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="rounded-md border-2 border-dashed border-line bg-surface/50 p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Icon name="upload-cloud" size={36} className="text-primary mx-auto" />
              <div className="text-[14px] font-semibold text-navy mt-3">
                {rows.length > 0 ? `${rows.length} rows ready` : 'Drop a CSV / Excel file here'}
              </div>
              <div className="text-[12px] text-muted mt-1">
                or <span className="text-primary font-semibold">browse files</span> · max 5 MB · UTF-8
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-md border border-line bg-surface/40 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold text-navy">Your column format</div>
                  <button
                    type="button"
                    onClick={resetOrder}
                    className="text-[11.5px] text-primary hover:underline font-semibold"
                  >
                    Reset to default
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {columnOrder.map((f, i) => (
                    <div
                      key={`${f}-${i}`}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11.5px] ${
                        f === 'skip'
                          ? 'border-dashed border-line bg-white text-muted'
                          : 'border-primary/30 bg-primary/5 text-navy'
                      }`}
                    >
                      <span className="font-mono text-muted">#{i + 1}</span>
                      <span className="font-semibold">{FIELD_LABELS[f]}</span>
                      <button
                        type="button"
                        onClick={() => moveColumn(i, -1)}
                        disabled={i === 0}
                        className="px-1 text-muted hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Move left"
                      >◀</button>
                      <button
                        type="button"
                        onClick={() => moveColumn(i, +1)}
                        disabled={i === columnOrder.length - 1}
                        className="px-1 text-muted hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Move right"
                      >▶</button>
                      <button
                        type="button"
                        onClick={() => removeColumn(i)}
                        className="px-1 text-red-500 hover:text-red-700"
                        aria-label="Remove column"
                      >×</button>
                    </div>
                  ))}
                  <Select
                    value=""
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const v = e.target.value as ImportField;
                      if (v) addColumn(v);
                    }}
                    className="text-[11.5px] py-1 px-2 w-auto"
                  >
                    <option value="">+ Add column…</option>
                    {ALL_FIELDS.filter((f) => f === 'skip' || !columnOrder.includes(f)).map((f) => (
                      <option key={f} value={f}>{FIELD_LABELS[f]}</option>
                    ))}
                  </Select>
                </div>
                {missingRequired.length > 0 && (
                  <div className="text-[11.5px] text-red-600">
                    Add {missingRequired.map((f) => FIELD_LABELS[f]).join(', ')} to your column format before importing.
                  </div>
                )}
                <div className="text-[11.5px] text-muted">
                  Sample row:{' '}
                  <span className="font-mono text-navy">
                    {columnOrder.map((f) => FIELD_SAMPLE[f]).join(',') || '—'}
                  </span>
                </div>
              </div>

              <textarea
                value={pasteText}
                onChange={(e) => handlePaste(e.target.value)}
                placeholder={columnOrder.map((f) => FIELD_SAMPLE[f]).join(',') + '\n…'}
                rows={8}
                spellCheck={false}
                className="w-full rounded-md border border-line bg-white px-3 py-2 text-[12.5px] font-mono text-navy placeholder:text-muted/70 focus:border-primary focus:outline-none resize-y"
              />
              <div className="flex items-center justify-between text-[12px] text-muted">
                <span>Paste header-less rows. Format follows the column sequence above.</span>
                {rows.length > 0 && (
                  <span className="text-emerald-600 font-semibold">{rows.length} rows ready</span>
                )}
              </div>
              {rejectedCount > 0 && (
                <div className="text-[11.5px] rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-amber-800">
                  <div className="font-semibold">
                    {rejectedCount} row{rejectedCount !== 1 ? 's' : ''} skipped
                  </div>
                  {rejectedSample.map((r, i) => (
                    <div key={i} className="font-mono text-[11px]">{r}</div>
                  ))}
                  {rejectedCount > rejectedSample.length && (
                    <div className="text-[11px]">…and {rejectedCount - rejectedSample.length} more</div>
                  )}
                </div>
              )}
            </div>
          )}

          {parseError && (
            <div className="text-[12px] text-red-500 rounded-md bg-red-50 border border-red-200 px-3 py-2">
              {parseError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="text-[13px] font-medium text-navy min-w-max">Assign to class:</label>
            <Select
              value={classLoadId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClassLoadId(e.target.value)}
              className="flex-1"
            >
              <option value="">Select class…</option>
              {classLoads.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.section.gradeLevel} · {c.section.name} · {c.subject.name}
                </option>
              ))}
            </Select>
          </div>

          {tab === 'file' && (
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
                  {([
                    ['LRN',         'lrn',           '105432100023'],
                    ['LAST_NAME',   'lastName',      'dela Cruz'   ],
                    ['FIRST_NAME',  'firstName',     'Juan'        ],
                    ['MIDDLE_NAME', 'middleName',    'Reyes'       ],
                    ['GENDER',      'gender (M/F)',  'F'           ],
                    ['BIRTHDAY',    'birthday',      '2012-03-19'  ],
                  ] as [string, string, string][]).map(([col, field, ex]) => (
                    <tr key={col} className="border-t border-line">
                      <td className="px-3 py-1.5 font-mono text-navy">{col}</td>
                      <td className="px-3 py-1.5 text-muted">{field}</td>
                      <td className="px-3 py-1.5 text-navy">{ex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
