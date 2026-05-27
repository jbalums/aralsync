import React, { useState, useRef, useCallback, useEffect } from "react";
import { useQueries } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as XLSX from "xlsx";
import {
	Icon,
	Avatar,
	Badge,
	Card,
	Modal,
	useToast,
	EmptyState,
	Skeleton,
	StatCard,
	Progress,
	SectionHeader,
	Btn,
	Field,
	TextInput,
	Select,
	Tabs,
} from "../components";
import {
	useStudents,
	useStudent,
	useStudentByLRN,
	useStudentAttendanceSummary,
	useStudentAttendanceRecords,
	useCreateStudent,
	useImportStudents,
	useUpdateStudent,
	useDeleteStudent,
} from "../modules/students/useStudents";
import { quarterlyGradesService } from "../modules/gradebook/quarterlyGrades.service";
import { GRADE_KEYS } from "../modules/gradebook/useGradebook";
import { PASSING_GRADE } from "../shared/constants/grading";
import { useClassLoads } from "../modules/classrooms/useClassLoads";
import { useAuthStore } from "../modules/auth/authStore";
import { validateLRN } from "../shared/utils/lrn";
import type {
	ImportResult,
	StudentImportRow,
} from "../modules/students/students.service";
import type {
	AttendanceStatus,
	ClassLoadListItem,
	Quarter,
	Session,
	Student,
} from "../shared/types";

// ─── Schemas ─────────────────────────────────────────────
const addSchema = z.object({
	lrn: z
		.string()
		.length(12, "LRN must be 12 digits")
		.regex(/^\d{12}$/, "LRN must contain only digits"),
	lastName: z.string().min(1, "Required"),
	firstName: z.string().min(1, "Required"),
	middleName: z.string().max(60).optional(),
	gender: z.enum(["M", "F"]),
	birthday: z.string().optional(),
	classLoadId: z.string().min(1, "Select a class"),
	guardianName: z.string().default(""),
	guardianRelationship: z.string().default(""),
	guardianContact: z.string().default(""),
});
type AddFormValues = z.infer<typeof addSchema>;

const editSchema = z.object({
	lastName: z.string().min(1, "Required"),
	firstName: z.string().min(1, "Required"),
	middleName: z.string().max(60).optional(),
	gender: z.enum(["M", "F"]),
	birthday: z.string().optional(),
	guardianName: z.string().optional(),
	guardianRelationship: z.string().optional(),
	guardianContact: z.string().optional(),
});
type EditFormValues = z.infer<typeof editSchema>;

// ─── CSV row normaliser ──────────────────────────────────
function normalizeImportRow(
	raw: Record<string, string>,
): StudentImportRow | null {
	const lrn = (raw["LRN"] ?? raw["lrn"] ?? "")
		.toString()
		.replace(/\D/g, "")
		.slice(0, 12);
	if (lrn.length !== 12) return null;
	const gender = (raw["GENDER"] ?? raw["gender"] ?? "F")
		.toString()
		.toUpperCase();
	return {
		lrn,
		lastName: raw["LAST_NAME"] ?? raw["lastName"] ?? raw["last_name"] ?? "",
		firstName:
			raw["FIRST_NAME"] ?? raw["firstName"] ?? raw["first_name"] ?? "",
		middleName:
			raw["MIDDLE_NAME"] ??
			raw["middleName"] ??
			raw["middle_name"] ??
			raw["MI"] ??
			"",
		gender: gender === "M" || gender === "MALE" ? "M" : "F",
		birthday: raw["BIRTHDAY"] ?? raw["birthday"] ?? undefined,
		guardian:
			(raw["GUARDIAN_NAME"] ?? raw["guardianName"])
				? {
						name: raw["GUARDIAN_NAME"] ?? raw["guardianName"] ?? "",
						relationship:
							raw["GUARDIAN_RELATIONSHIP"] ??
							raw["guardianRelationship"] ??
							"",
						contactNumber:
							raw["GUARDIAN_CONTACT"] ??
							raw["guardianContact"] ??
							"",
					}
				: undefined,
	};
}

// ─── Paste-CSV column-order catalog ──────────────────────
type ImportField =
	| "lrn"
	| "lastName"
	| "firstName"
	| "middleName"
	| "gender"
	| "birthday"
	| "guardianName"
	| "guardianRelationship"
	| "guardianContact"
	| "skip";

const FIELD_LABELS: Record<ImportField, string> = {
	lrn: "LRN",
	lastName: "Last Name",
	firstName: "First Name",
	middleName: "Middle Name",
	gender: "Gender (M/F)",
	birthday: "Birthday",
	guardianName: "Guardian Name",
	guardianRelationship: "Guardian Rel.",
	guardianContact: "Guardian Contact",
	skip: "— Skip —",
};

const FIELD_SAMPLE: Record<ImportField, string> = {
	lrn: "105432100023",
	lastName: "dela Cruz",
	firstName: "Juan",
	middleName: "Reyes",
	gender: "M",
	birthday: "2012-03-19",
	guardianName: "Ana dela Cruz",
	guardianRelationship: "Mother",
	guardianContact: "09171234567",
	skip: "",
};

const REQUIRED_FIELDS: ImportField[] = [
	"lrn",
	"lastName",
	"firstName",
	"gender",
];
const DEFAULT_COLUMN_ORDER: ImportField[] = [
	"lrn",
	"lastName",
	"firstName",
	"middleName",
	"gender",
	"birthday",
];
const ALL_FIELDS: ImportField[] = [
	"lrn",
	"lastName",
	"firstName",
	"middleName",
	"gender",
	"birthday",
	"guardianName",
	"guardianRelationship",
	"guardianContact",
	"skip",
];

function mapRowByOrder(
	cols: string[],
	order: ImportField[],
): StudentImportRow | { error: string } {
	const pick = (f: ImportField): string => {
		const idx = order.indexOf(f);
		return idx >= 0 ? (cols[idx] ?? "").toString().trim() : "";
	};

	const lrn = pick("lrn").replace(/\D/g, "").slice(0, 12);
	if (lrn.length !== 12) return { error: `invalid LRN "${pick("lrn")}"` };

	const lastName = pick("lastName");
	const firstName = pick("firstName");
	if (!lastName) return { error: "missing last name" };
	if (!firstName) return { error: "missing first name" };

	const genderRaw = pick("gender").toUpperCase();
	const gender: "M" | "F" =
		genderRaw === "M" || genderRaw === "MALE" ? "M" : "F";

	const guardianName = pick("guardianName");
	const guardianRelationship = pick("guardianRelationship");
	const guardianContact = pick("guardianContact");

	return {
		lrn,
		lastName,
		firstName,
		middleName: pick("middleName") || undefined,
		gender,
		birthday: pick("birthday") || undefined,
		guardian: guardianName
			? {
					name: guardianName,
					relationship: guardianRelationship,
					contactNumber: guardianContact,
				}
			: undefined,
	};
}

// ─── STUDENTS LIST ───────────────────────────────────────

export function PageStudents() {
	const toast = useToast();

	const [q, setQ] = useState("");
	const [classLoadId, setClassLoadId] = useState("");
	const [page, setPage] = useState(1);
	const [addOpen, setAddOpen] = useState(false);
	const [importOpen, setImportOpen] = useState(false);
	const [profileId, setProfileId] = useState<string | null>(null);

	const { data, isLoading } = useStudents({
		q: q || undefined,
		classLoadId: classLoadId || undefined,
		page,
		limit: 50,
	});
	const students = data?.students ?? [];
	const total = data?.total ?? 0;
	const pages = data?.pages ?? 1;

	const { data: classLoads = [] } = useClassLoads();

	return (
		<div className="page-anim space-y-5">
			<Card className="overflow-hidden">
				<div className="px-4 py-3 border-b border-line flex items-center gap-2 sm:gap-3 flex-wrap">
					<div className="relative flex-1 min-w-[200px] max-w-md">
						<Icon
							name="search"
							size={14}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
						/>
						<input
							value={q}
							onChange={(e) => {
								setQ(e.target.value);
								setPage(1);
							}}
							placeholder="Search by name or LRN…"
							className="w-full h-9 pl-9 pr-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none"
						/>
					</div>
					<Select
						value={classLoadId}
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
							setClassLoadId(e.target.value);
							setPage(1);
						}}
						className="!h-9 max-w-[240px]"
					>
						<option value="">All classes</option>
						{classLoads.map((c) => (
							<option key={c.id} value={c.id}>
								{c.section.gradeLevel} · {c.section.name} ·{" "}
								{c.subject.name}
							</option>
						))}
					</Select>
					<span className="ml-auto" />
					<Btn
						variant="secondary"
						size="sm"
						icon="upload"
						onClick={() => setImportOpen(true)}
					>
						Import CSV
					</Btn>
					<Btn
						variant="primary"
						size="sm"
						icon="user-plus"
						onClick={() => setAddOpen(true)}
					>
						Add student
					</Btn>
				</div>

				{isLoading ? (
					<div className="p-4 space-y-2">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} className="h-12" />
						))}
					</div>
				) : students.length === 0 ? (
					<div className="p-10 text-center">
						<EmptyState
							icon="users"
							title="No students found"
							description={
								q
									? "Try a different search."
									: "Add or import students to get started."
							}
							action={undefined}
						/>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-[12.5px]">
							<thead className="bg-surface text-muted text-left">
								<tr>
									<th className="px-3 py-2.5 font-semibold w-10">
										#
									</th>
									<th className="px-3 py-2.5 font-semibold">
										Student
									</th>
									<th className="px-3 py-2.5 font-semibold">
										LRN
									</th>
									<th className="px-3 py-2.5 font-semibold">
										Gender
									</th>
									<th className="px-3 py-2.5 font-semibold w-10" />
								</tr>
							</thead>
							<tbody>
								{students.map((s, i) => (
									<tr
										key={s.id}
										className="border-t border-line hover:bg-slate-50/40 cursor-pointer"
										onClick={() => setProfileId(s.id)}
									>
										<td className="px-3 py-2 font-mono text-muted">
											{(page - 1) * 50 + i + 1}
										</td>
										<td className="px-3 py-2">
											<div className="flex items-center gap-2.5">
												<Avatar
													name={`${s.firstName} ${s.lastName}`}
													size="sm"
												/>
												<span className="font-semibold text-navy">
													{s.lastName}, {s.firstName}
													{s.middleName
														? ` ${s.middleName.slice(0, 1)}.`
														: ""}
												</span>
											</div>
										</td>
										<td className="px-3 py-2 font-mono text-muted">
											{s.lrn}
										</td>
										<td className="px-3 py-2 text-muted">
											{s.gender === "M"
												? "Male"
												: "Female"}
										</td>
										<td className="px-3 py-2 text-right">
											<Icon
												name="chevron-right"
												size={14}
												className="text-muted"
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				<div className="px-4 py-3 border-t border-line flex items-center justify-between text-[12px] text-muted">
					<span>
						Showing {students.length} of {total}
					</span>
					<div className="flex items-center gap-1">
						<Btn
							size="sm"
							variant="ghost"
							icon="chevron-left"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page <= 1}
						>
							Prev
						</Btn>
						<span className="px-2 font-mono">
							{page} / {pages}
						</span>
						<Btn
							size="sm"
							variant="ghost"
							iconRight="chevron-right"
							onClick={() =>
								setPage((p) => Math.min(pages, p + 1))
							}
							disabled={page >= pages}
						>
							Next
						</Btn>
					</div>
				</div>
			</Card>

			<AddStudentModal
				open={addOpen}
				onClose={() => setAddOpen(false)}
				classLoads={classLoads}
				onSuccess={() =>
					toast?.push({
						type: "success",
						title: "Student added",
						message: "Queued for sync.",
					})
				}
			/>
			<ImportCSVModal
				open={importOpen}
				onClose={() => setImportOpen(false)}
				classLoads={classLoads}
				onSuccess={(r) =>
					toast?.push({
						type: "success",
						title: "Import complete",
						message: `Created ${r.created}, updated ${r.updated}${r.failed.length ? `, ${r.failed.length} failed` : ""}.`,
					})
				}
			/>
			<StudentProfileModal
				studentId={profileId ?? ""}
				open={Boolean(profileId)}
				onClose={() => setProfileId(null)}
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

function AddStudentModal({
	open,
	onClose,
	classLoads,
	onSuccess,
}: AddStudentModalProps) {
	const createMutation = useCreateStudent();
	const [lrnTouched, setLrnTouched] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors, isSubmitting },
		setError,
		clearErrors,
	} = useForm({
		resolver: zodResolver(addSchema),
		defaultValues: { gender: "F" },
	});

	const lrnValue = watch("lrn") ?? "";
	const { data: dupStudent } = useStudentByLRN(
		lrnTouched && lrnValue.length === 12 ? lrnValue : "",
	);

	const onSubmit = async (values: AddFormValues) => {
		try {
			await createMutation.mutateAsync({
				lrn: values.lrn,
				lastName: values.lastName,
				firstName: values.firstName,
				middleName: values.middleName,
				gender: values.gender,
				birthday: values.birthday,
				classLoadId: values.classLoadId,
				guardian: {
					name: values.guardianName ?? "",
					relationship: values.guardianRelationship ?? "",
					contactNumber: values.guardianContact ?? "",
				},
			});
			onSuccess?.();
			reset();
			onClose();
		} catch (err) {
			const msg = (err as { response?: { data?: { message?: string } } })
				?.response?.data?.message;
			setError("root", { message: msg ?? "Failed to add student." });
		}
	};

	return (
		<Modal
			open={open}
			onClose={() => {
				onClose();
				reset();
			}}
			title="Add student"
			subtitle="Adds a learner to the selected class load"
			width="max-w-2xl"
			footer={
				<>
					<Btn
						variant="ghost"
						onClick={() => {
							onClose();
							reset();
						}}
					>
						Cancel
					</Btn>
					<Btn
						variant="primary"
						icon="user-plus"
						onClick={() => {
							void handleSubmit(onSubmit)();
						}}
						disabled={isSubmitting || createMutation.isPending}
					>
						{isSubmitting || createMutation.isPending
							? "Adding…"
							: "Add learner"}
					</Btn>
				</>
			}
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
						{...register("lrn", {
							onBlur: (e) => {
								setLrnTouched(true);
								const val = e.target.value;
								if (val.length === 12 && !validateLRN(val)) {
									setError("lrn", {
										message:
											"Invalid LRN - check digit does not match",
									});
								} else {
									clearErrors("lrn");
								}
							},
						})}
						placeholder="105432100123"
						className="h-[42px] w-full px-3 rounded-lg border text-[14px] bg-white outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 border-line"
					/>
					{errors.lrn && (
						<span className="text-[12px] text-red-500 mt-1 block">
							{errors.lrn.message}
						</span>
					)}
					{dupStudent && !errors.lrn && (
						<span className="text-[12px] text-amber-600 mt-1 block">
							Warning: LRN already exists - {dupStudent.lastName},{" "}
							{dupStudent.firstName}
						</span>
					)}
				</div>

				<Field
					label="Last name"
					required
					error={errors.lastName?.message}
				>
					<TextInput
						placeholder="dela Cruz"
						{...register("lastName")}
					/>
				</Field>
				<Field
					label="First name"
					required
					error={errors.firstName?.message}
				>
					<TextInput placeholder="Juan" {...register("firstName")} />
				</Field>
				<Field label="Middle name">
					<TextInput
						placeholder="Reyes"
						{...register("middleName")}
					/>
				</Field>
				<Field label="Gender">
					<Select {...register("gender")}>
						<option value="F">Female</option>
						<option value="M">Male</option>
					</Select>
				</Field>
				<Field label="Birthday">
					<TextInput type="date" {...register("birthday")} />
				</Field>
				<Field
					label="Class load"
					required
					error={errors.classLoadId?.message}
				>
					<Select {...register("classLoadId")}>
						<option value="">Select class…</option>
						{classLoads.map((c) => (
							<option key={c.id} value={c.id}>
								{c.section.gradeLevel} · {c.section.name} ·{" "}
								{c.subject.name}
							</option>
						))}
					</Select>
				</Field>
				<Field label="Guardian name">
					<TextInput
						placeholder="Rosario dela Cruz"
						{...register("guardianName")}
					/>
				</Field>
				<Field label="Relationship">
					<TextInput
						placeholder="Mother"
						{...register("guardianRelationship")}
					/>
				</Field>
				<Field label="Contact number">
					<TextInput
						placeholder="+63 917 123 4567"
						{...register("guardianContact")}
					/>
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

function ImportCSVModal({
	open,
	onClose,
	classLoads,
	onSuccess,
}: ImportCSVModalProps) {
	const importMutation = useImportStudents();
	const userId = useAuthStore((s) => s.user?.id ?? "");
	const fileRef = useRef<HTMLInputElement>(null);
	const [rows, setRows] = useState<StudentImportRow[]>([]);
	const [parseError, setParseError] = useState("");
	const [classLoadId, setClassLoadId] = useState("");
	const [result, setResult] = useState<ImportResult | null>(null);
	const [tab, setTab] = useState<"file" | "paste">("file");
	const [pasteText, setPasteText] = useState("");
	const [columnOrder, setColumnOrder] =
		useState<ImportField[]>(DEFAULT_COLUMN_ORDER);
	const [rejectedCount, setRejectedCount] = useState(0);
	const [rejectedSample, setRejectedSample] = useState<string[]>([]);

	const storageKey = userId ? `aralsync.importColumnOrder.${userId}` : "";

	// Load persisted column order on mount / user change
	useEffect(() => {
		if (!storageKey) return;
		try {
			const raw = localStorage.getItem(storageKey);
			if (!raw) return;
			const parsed = JSON.parse(raw) as unknown;
			if (
				Array.isArray(parsed) &&
				parsed.every((f) => ALL_FIELDS.includes(f as ImportField))
			) {
				setColumnOrder(parsed as ImportField[]);
			}
		} catch {
			/* ignore */
		}
	}, [storageKey]);

	const persistOrder = useCallback(
		(order: ImportField[]) => {
			setColumnOrder(order);
			if (storageKey) {
				try {
					localStorage.setItem(storageKey, JSON.stringify(order));
				} catch {
					/* ignore quota */
				}
			}
		},
		[storageKey],
	);

	const parseFileWorkbook = useCallback((wb: XLSX.WorkBook) => {
		const ws = wb.Sheets[wb.SheetNames[0]];
		const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
			defval: "",
		});
		const parsed = raw
			.map(normalizeImportRow)
			.filter(Boolean) as StudentImportRow[];
		if (parsed.length === 0) {
			setParseError(
				"No valid rows found. Check the column headers match the template.",
			);
			setRows([]);
		} else {
			setParseError("");
			setRows(parsed);
		}
	}, []);

	const parsePasteMatrix = useCallback(
		(order: ImportField[], text: string) => {
			const cleaned = text.replace(/^﻿/, "").replace(/[\r\n]+$/g, "");
			if (!cleaned.trim()) {
				setRows([]);
				setParseError("");
				setRejectedCount(0);
				setRejectedSample([]);
				return;
			}
			try {
				const wb = XLSX.read(cleaned, { type: "string" });
				const ws = wb.Sheets[wb.SheetNames[0]];
				const matrix = XLSX.utils.sheet_to_json<string[]>(ws, {
					header: 1,
					defval: "",
				});
				const parsed: StudentImportRow[] = [];
				const rejected: string[] = [];
				matrix.forEach((cols, i) => {
					if (!cols || cols.every((c) => !String(c).trim())) return; // skip blank rows
					const r = mapRowByOrder(cols as string[], order);
					if ("error" in r) rejected.push(`row ${i + 1}: ${r.error}`);
					else parsed.push(r);
				});
				setRows(parsed);
				setRejectedCount(rejected.length);
				setRejectedSample(rejected.slice(0, 3));
				if (parsed.length === 0 && rejected.length === 0) {
					setParseError("No rows detected.");
				} else if (parsed.length === 0) {
					setParseError(
						"No valid rows. Check column order matches your pasted data.",
					);
				} else {
					setParseError("");
				}
			} catch {
				setParseError(
					"Failed to parse pasted text. Ensure it is comma-separated.",
				);
				setRows([]);
				setRejectedCount(0);
				setRejectedSample([]);
			}
		},
		[],
	);

	const handleFile = useCallback(
		(file: File) => {
			setParseError("");
			setRows([]);
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const wb = XLSX.read(e.target?.result, { type: "binary" });
					parseFileWorkbook(wb);
				} catch {
					setParseError(
						"Failed to parse file. Ensure it is a valid CSV or Excel file.",
					);
				}
			};
			reader.readAsBinaryString(file);
		},
		[parseFileWorkbook],
	);

	const handlePaste = useCallback(
		(text: string) => {
			setPasteText(text);
			parsePasteMatrix(columnOrder, text);
		},
		[columnOrder, parsePasteMatrix],
	);

	// Re-parse when column order changes while text is present
	useEffect(() => {
		if (tab === "paste" && pasteText)
			parsePasteMatrix(columnOrder, pasteText);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [columnOrder]);

	const missingRequired = REQUIRED_FIELDS.filter(
		(f) => !columnOrder.includes(f),
	);

	const moveColumn = (idx: number, delta: number) => {
		const next = [...columnOrder];
		const j = idx + delta;
		if (j < 0 || j >= next.length) return;
		[next[idx], next[j]] = [next[j], next[idx]];
		persistOrder(next);
	};
	const removeColumn = (idx: number) => {
		const next = columnOrder.filter((_, i) => i !== idx);
		persistOrder(next);
	};
	const addColumn = (f: ImportField) => {
		if (f !== "skip" && columnOrder.includes(f)) return;
		persistOrder([...columnOrder, f]);
	};
	const resetOrder = () => persistOrder(DEFAULT_COLUMN_ORDER);

	const onDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			const file = e.dataTransfer.files[0];
			if (file) handleFile(file);
		},
		[handleFile],
	);

	const handleImport = async () => {
		if (!classLoadId || rows.length === 0) return;
		const r = await importMutation.mutateAsync({
			classLoadId,
			students: rows,
		});
		setResult(r);
		onSuccess?.(r);
	};

	const reset = () => {
		setRows([]);
		setParseError("");
		setClassLoadId("");
		setResult(null);
		setTab("file");
		setPasteText("");
		setRejectedCount(0);
		setRejectedSample([]);
	};

	const importDisabled =
		rows.length === 0 ||
		!classLoadId ||
		importMutation.isPending ||
		(tab === "paste" && missingRequired.length > 0);

	return (
		<Modal
			open={open}
			onClose={() => {
				onClose();
				reset();
			}}
			title="Import students from CSV"
			subtitle="Upload a DepEd roster CSV or Excel file"
			width="max-w-2xl"
			footer={
				<>
					<Btn
						variant="ghost"
						onClick={() => {
							onClose();
							reset();
						}}
					>
						Cancel
					</Btn>
					<Btn
						variant="primary"
						icon="upload"
						onClick={() => {
							void handleImport();
						}}
						disabled={importDisabled}
					>
						{importMutation.isPending
							? "Importing…"
							: `Import ${rows.length} row${rows.length !== 1 ? "s" : ""}`}
					</Btn>
				</>
			}
		>
			{result ? (
				<div className="space-y-3">
					<div className="grid grid-cols-3 gap-3">
						<div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-center">
							<div className="text-[24px] font-semibold text-emerald-700 font-mono">
								{result.created}
							</div>
							<div className="text-[12px] text-emerald-600">
								Created
							</div>
						</div>
						<div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-center">
							<div className="text-[24px] font-semibold text-blue-700 font-mono">
								{result.updated}
							</div>
							<div className="text-[12px] text-blue-600">
								Updated
							</div>
						</div>
						<div className="rounded-md border border-red-200 bg-red-50 p-3 text-center">
							<div className="text-[24px] font-semibold text-red-700 font-mono">
								{result.failed.length}
							</div>
							<div className="text-[12px] text-red-600">
								Failed
							</div>
						</div>
					</div>
					{result.failed.length > 0 && (
						<div className="rounded-md border border-line overflow-hidden">
							<div className="px-3 py-2 bg-surface text-[12px] font-semibold text-navy">
								Failed rows
							</div>
							<div className="max-h-40 overflow-y-auto">
								{result.failed.map((f, i) => (
									<div
										key={i}
										className="px-3 py-2 border-t border-line text-[12px]"
									>
										<span className="font-mono text-navy">
											{f.lrn}
										</span>
										<span className="text-muted ml-2">
											- {f.reason}
										</span>
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
							{
								id: "file",
								label: "Upload file",
								icon: "upload-cloud",
							},
							{
								id: "paste",
								label: "Paste CSV",
								icon: "clipboard",
							},
						]}
						active={tab}
						onChange={(id: "file" | "paste") => setTab(id)}
					/>

					{tab === "file" ? (
						<div
							onDrop={onDrop}
							onDragOver={(e) => e.preventDefault()}
							onClick={() => fileRef.current?.click()}
							className="rounded-md border-2 border-dashed border-line bg-surface/50 p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
						>
							<Icon
								name="upload-cloud"
								size={36}
								className="text-primary mx-auto"
							/>
							<div className="text-[14px] font-semibold text-navy mt-3">
								{rows.length > 0
									? `${rows.length} rows ready`
									: "Drop a CSV / Excel file here"}
							</div>
							<div className="text-[12px] text-muted mt-1">
								or{" "}
								<span className="text-primary font-semibold">
									browse files
								</span>{" "}
								· max 5 MB · UTF-8
							</div>
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
						<div className="space-y-3">
							<div className="rounded-md border border-line bg-surface/40 p-3 space-y-2">
								<div className="flex items-center justify-between">
									<div className="text-[12px] font-semibold text-navy">
										Your column format
									</div>
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
											className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11.5px] ${f === "skip" ? "border-dashed border-line bg-white text-muted" : "border-primary/30 bg-primary/5 text-navy"}`}
										>
											<span className="font-mono text-muted">
												#{i + 1}
											</span>
											<span className="font-semibold">
												{FIELD_LABELS[f]}
											</span>
											<button
												type="button"
												onClick={() =>
													moveColumn(i, -1)
												}
												disabled={i === 0}
												className="px-1 text-muted hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed"
												aria-label="Move left"
											>
												◀
											</button>
											<button
												type="button"
												onClick={() =>
													moveColumn(i, +1)
												}
												disabled={
													i === columnOrder.length - 1
												}
												className="px-1 text-muted hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed"
												aria-label="Move right"
											>
												▶
											</button>
											<button
												type="button"
												onClick={() => removeColumn(i)}
												className="px-1 text-red-500 hover:text-red-700"
												aria-label="Remove column"
											>
												×
											</button>
										</div>
									))}
									<Select
										value=""
										onChange={(
											e: React.ChangeEvent<HTMLSelectElement>,
										) => {
											const v = e.target
												.value as ImportField;
											if (v) addColumn(v);
										}}
										className="text-[11.5px] py-1 px-2 w-auto"
									>
										<option value="">+ Add column…</option>
										{ALL_FIELDS.filter(
											(f) =>
												f === "skip" ||
												!columnOrder.includes(f),
										).map((f) => (
											<option key={f} value={f}>
												{FIELD_LABELS[f]}
											</option>
										))}
									</Select>
								</div>
								{missingRequired.length > 0 && (
									<div className="text-[11.5px] text-red-600">
										Add{" "}
										{missingRequired
											.map((f) => FIELD_LABELS[f])
											.join(", ")}{" "}
										to your column format before importing.
									</div>
								)}
								<div className="text-[11.5px] text-muted">
									Sample row:{" "}
									<span className="font-mono text-navy">
										{columnOrder
											.map((f) => FIELD_SAMPLE[f])
											.join(",") || "—"}
									</span>
								</div>
							</div>

							<textarea
								value={pasteText}
								onChange={(e) => handlePaste(e.target.value)}
								placeholder={
									columnOrder
										.map((f) => FIELD_SAMPLE[f])
										.join(",") + "\n…"
								}
								rows={8}
								spellCheck={false}
								className="w-full rounded-md border border-line bg-white px-3 py-2 text-[12.5px] font-mono text-navy placeholder:text-muted/70 focus:border-primary focus:outline-none resize-y"
							/>
							<div className="flex items-center justify-between text-[12px] text-muted">
								<span>
									Paste header-less rows. Format follows the
									column sequence above.
								</span>
								{rows.length > 0 && (
									<span className="text-emerald-600 font-semibold">
										{rows.length} rows ready
									</span>
								)}
							</div>
							{rejectedCount > 0 && (
								<div className="text-[11.5px] rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-amber-800">
									<div className="font-semibold">
										{rejectedCount} row
										{rejectedCount !== 1 ? "s" : ""} skipped
									</div>
									{rejectedSample.map((r, i) => (
										<div
											key={i}
											className="font-mono text-[11px]"
										>
											{r}
										</div>
									))}
									{rejectedCount > rejectedSample.length && (
										<div className="text-[11px]">
											…and{" "}
											{rejectedCount -
												rejectedSample.length}{" "}
											more
										</div>
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
						<label className="text-[13px] font-medium text-navy min-w-max">
							Assign to class:
						</label>
						<Select
							value={classLoadId}
							onChange={(
								e: React.ChangeEvent<HTMLSelectElement>,
							) => setClassLoadId(e.target.value)}
							className="flex-1"
						>
							<option value="">Select class…</option>
							{classLoads.map((c) => (
								<option key={c.id} value={c.id}>
									{c.section.gradeLevel} · {c.section.name} ·{" "}
									{c.subject.name}
								</option>
							))}
						</Select>
					</div>

					{tab === "file" && (
						<div className="overflow-hidden rounded-md border border-line">
							<div className="px-3 py-2 bg-surface text-[12px] font-semibold text-navy">
								Expected columns
							</div>
							<table className="w-full text-[11.5px]">
								<thead className="text-muted bg-surface/50">
									<tr>
										<th className="px-3 py-1.5 text-left font-semibold">
											CSV column
										</th>
										<th className="px-3 py-1.5 text-left font-semibold">
											Maps to
										</th>
										<th className="px-3 py-1.5 text-left font-semibold">
											Example
										</th>
									</tr>
								</thead>
								<tbody>
									{[
										["LRN", "lrn", "105432100023"],
										["LAST_NAME", "lastName", "dela Cruz"],
										["FIRST_NAME", "firstName", "Juan"],
										["MIDDLE_NAME", "middleName", "Reyes"],
										["GENDER", "gender (M/F)", "F"],
										["BIRTHDAY", "birthday", "2012-03-19"],
									].map(([col, field, ex]) => (
										<tr
											key={col}
											className="border-t border-line"
										>
											<td className="px-3 py-1.5 font-mono text-navy">
												{col}
											</td>
											<td className="px-3 py-1.5 text-muted">
												{field}
											</td>
											<td className="px-3 py-1.5 text-navy">
												{ex}
											</td>
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

// ─── Edit-student modal ───────────────────────────────────

interface EditStudentModalProps {
	open: boolean;
	onClose: () => void;
	student: Student;
	onSuccess?: () => void;
}

function EditStudentModal({
	open,
	onClose,
	student,
	onSuccess,
}: EditStudentModalProps) {
	const updateMutation = useUpdateStudent();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
		setError,
	} = useForm({
		resolver: zodResolver(editSchema),
	});

	// Pre-fill when student changes or modal opens
	React.useEffect(() => {
		if (open) {
			reset({
				lastName: student.lastName,
				firstName: student.firstName,
				middleName: student.middleName ?? "",
				gender: student.gender,
				birthday: student.birthday ?? "",
				guardianName: student.guardian?.name ?? "",
				guardianRelationship: student.guardian?.relationship ?? "",
				guardianContact: student.guardian?.contactNumber ?? "",
			});
		}
	}, [open, student, reset]);

	const onSubmit = async (raw: FieldValues) => {
		try {
			await updateMutation.mutateAsync({
				id: student.id,
				payload: {
					lastName: raw.lastName,
					firstName: raw.firstName,
					middleName: raw.middleName,
					gender: raw.gender,
					birthday: raw.birthday,
					guardian: {
						name: raw.guardianName ?? "",
						relationship: raw.guardianRelationship ?? "",
						contactNumber: raw.guardianContact ?? "",
					},
				},
			});
			onSuccess?.();
			onClose();
		} catch (err) {
			const msg = (err as { response?: { data?: { message?: string } } })
				?.response?.data?.message;
			setError("root", { message: msg ?? "Failed to update student." });
		}
	};

	return (
		<Modal
			open={open}
			onClose={onClose}
			title="Edit student"
			subtitle={`${student.lastName}, ${student.firstName}`}
			width="max-w-2xl"
			footer={
				<>
					<Btn variant="ghost" onClick={onClose}>
						Cancel
					</Btn>
					<Btn
						variant="primary"
						icon="save"
						onClick={() => {
							void handleSubmit(onSubmit)();
						}}
						disabled={isSubmitting || updateMutation.isPending}
					>
						{isSubmitting || updateMutation.isPending
							? "Saving…"
							: "Save changes"}
					</Btn>
				</>
			}
		>
			<form className="grid grid-cols-3 gap-3" noValidate>
				{errors.root && (
					<div className="col-span-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
						{errors.root.message}
					</div>
				)}
				<Field
					label="Last name"
					required
					error={errors.lastName?.message}
				>
					<TextInput
						placeholder="dela Cruz"
						{...register("lastName")}
					/>
				</Field>
				<Field
					label="First name"
					required
					error={errors.firstName?.message}
				>
					<TextInput placeholder="Juan" {...register("firstName")} />
				</Field>
				<Field label="Middle name">
					<TextInput
						placeholder="Reyes"
						{...register("middleName")}
					/>
				</Field>
				<Field label="Gender">
					<Select {...register("gender")}>
						<option value="F">Female</option>
						<option value="M">Male</option>
					</Select>
				</Field>
				<Field label="Birthday">
					<TextInput type="date" {...register("birthday")} />
				</Field>
				<div className="col-span-1" />
				<Field label="Guardian name">
					<TextInput
						placeholder="Rosario dela Cruz"
						{...register("guardianName")}
					/>
				</Field>
				<Field label="Relationship">
					<TextInput
						placeholder="Mother"
						{...register("guardianRelationship")}
					/>
				</Field>
				<Field label="Contact number">
					<TextInput
						placeholder="+63 917 123 4567"
						{...register("guardianContact")}
					/>
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

function DeleteStudentModal({
	open,
	onClose,
	student,
	onSuccess,
}: DeleteStudentModalProps) {
	const deleteMutation = useDeleteStudent();
	const [input, setInput] = useState("");

	const expectedName = `${student.firstName} ${student.lastName}`;
	const confirmed = input.trim() === expectedName;

	const handleDelete = async () => {
		await deleteMutation.mutateAsync(student.id);
		onSuccess();
	};

	React.useEffect(() => {
		if (open) setInput("");
	}, [open]);

	return (
		<Modal
			open={open}
			onClose={onClose}
			title="Delete student"
			subtitle="This action cannot be undone"
			width="max-w-md"
			footer={
				<>
					<Btn variant="ghost" onClick={onClose}>
						Cancel
					</Btn>
					<Btn
						variant="danger"
						icon="trash-2"
						onClick={() => {
							void handleDelete();
						}}
						disabled={!confirmed || deleteMutation.isPending}
					>
						{deleteMutation.isPending
							? "Deleting…"
							: "Delete permanently"}
					</Btn>
				</>
			}
		>
			<div className="space-y-4">
				<div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
					<strong>
						{student.lastName}, {student.firstName}
					</strong>{" "}
					will be removed from all classes. Attendance and grade
					records are preserved but the student will no longer appear
					in any list.
				</div>
				<div>
					<label className="text-[13px] font-medium text-navy block mb-1.5">
						Type{" "}
						<span className="font-mono bg-slate-100 px-1 rounded">
							{expectedName}
						</span>{" "}
						to confirm
					</label>
					<TextInput
						value={input}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setInput(e.target.value)
						}
						placeholder={expectedName}
					/>
				</div>
			</div>
		</Modal>
	);
}

// ─── STUDENT PROFILE ─────────────────────────────────────

function StudentProfileContent({
	studentId,
	onNavigateBack,
	onClose,
}: {
	studentId: string;
	onNavigateBack?: () => void;
	onClose?: () => void;
}) {
	const toast = useToast();
	const [tab, setTab] = useState("overview");
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	// Attendance tab state
	const [attPage, setAttPage] = useState(1);
	const [attStatus, setAttStatus] = useState<AttendanceStatus | "">("");
	const [attSession, setAttSession] = useState<Session | "">("");

	// Grades tab state
	const [activeQuarter, setActiveQuarter] = useState<Quarter>("Q1");

	const { data: student, isLoading } = useStudent(studentId);
	const { data: summary } = useStudentAttendanceSummary(studentId);

	const { data: attRecordsData, isLoading: attLoading } =
		useStudentAttendanceRecords(studentId, {
			page: attPage,
			limit: 20,
			status: attStatus || undefined,
			session: attSession || undefined,
		});

	const { data: allClassLoads } = useClassLoads();
	const studentClassLoads =
		allClassLoads?.filter((cl) => cl.sectionId === student?.sectionId) ??
		[];

	const gradeQueries = useQueries({
		queries: studentClassLoads.map((cl) => ({
			queryKey: GRADE_KEYS.quarterly(cl.id, activeQuarter),
			queryFn: () => quarterlyGradesService.get(cl.id, activeQuarter),
			enabled: Boolean(cl.id),
		})),
	});

	const dismiss = onClose ?? onNavigateBack;

	if (isLoading) {
		return (
			<div className="space-y-5">
				<Card className="p-6 space-y-3">
					<Skeleton className="h-7 w-1/2" />
					<Skeleton className="h-4 w-1/3" />
				</Card>
			</div>
		);
	}

	if (!student) {
		return (
			<EmptyState
				icon="alert-circle"
				title="Student not found"
				description="This student does not exist or you don't have access."
				action={undefined}
			/>
		);
	}

	const fullName = `${student.firstName}${student.middleName ? ` ${student.middleName.slice(0, 1)}.` : ""} ${student.lastName}`;

	return (
		<div className="space-y-5">
			<Card className="p-5 sm:p-6">
				{onNavigateBack && (
					<button
						onClick={onNavigateBack}
						className="text-[12px] text-muted hover:text-navy inline-flex items-center gap-1 mb-3"
					>
						<Icon name="arrow-left" size={12} /> Back to Students
					</button>
				)}
				<div className="flex items-start gap-5 flex-wrap">
					<Avatar name={fullName} size="xl" />
					<div className="flex-1 min-w-0">
						<h2 className="text-[24px] font-semibold tracking-tight text-navy">
							{student.lastName}, {student.firstName}
							{student.middleName
								? ` ${student.middleName.slice(0, 1)}.`
								: ""}
						</h2>
						<div className="text-[13px] text-muted mt-0.5">
							LRN <span className="font-mono">{student.lrn}</span>{" "}
							· {student.gender === "M" ? "Male" : "Female"}
						</div>
						<div className="mt-3 flex items-center gap-2 flex-wrap">
							{summary && (
								<span
									className={`pill ${summary.rate >= 85 ? "bg-emerald-50 text-emerald-700" : summary.rate >= 75 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}
								>
									<Icon name="check-circle" size={11} />
									{summary.rate}% attendance
								</span>
							)}
							{student.birthday && (
								<span className="pill bg-slate-100 text-slate-700">
									<Icon name="calendar" size={11} />
									Born {student.birthday}
								</span>
							)}
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Btn
							variant="secondary"
							size="sm"
							icon="pencil"
							onClick={() => setEditOpen(true)}
						>
							Edit
						</Btn>
						<Btn
							variant="danger"
							size="sm"
							icon="trash-2"
							onClick={() => setDeleteOpen(true)}
						>
							Delete
						</Btn>
					</div>
				</div>
			</Card>

			<Tabs
				tabs={[
					{
						id: "overview",
						label: "Overview",
						icon: "layout-dashboard",
					},
					{
						id: "attendance",
						label: "Attendance",
						icon: "clipboard-check",
					},
					{ id: "grades", label: "Grades", icon: "graduation-cap" },
				]}
				active={tab}
				onChange={setTab}
			/>

			{tab === "overview" && (
				<div className="space-y-5">
					{summary ? (
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
							<StatCard
								icon="check-circle"
								label="Attendance rate"
								value={`${summary.rate}%`}
								color="accent"
								sub={`${summary.total} sessions`}
							/>
							<StatCard
								icon="check"
								label="Present"
								value={summary.present}
								color="primary"
								sub="sessions"
							/>
							<StatCard
								icon="clock"
								label="Late"
								value={summary.late}
								color="amber"
								sub="sessions"
							/>
							<StatCard
								icon="user-x"
								label="Absent"
								value={summary.absent}
								color="rose"
								sub="sessions"
							/>
						</div>
					) : (
						<div className="grid grid-cols-4 gap-3">
							{[1, 2, 3, 4].map((i) => (
								<Skeleton key={i} className="h-24" />
							))}
						</div>
					)}

					{studentClassLoads.length > 0 && (
						<Card className="p-5">
							<SectionHeader title="Student Info" />
							<dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
								<div>
									<dt className="text-muted">LRN</dt>
									<dd className="font-mono font-medium text-navy mt-0.5">
										{student.lrn}
									</dd>
								</div>
								<div>
									<dt className="text-muted">Gender</dt>
									<dd className="font-medium text-navy mt-0.5">
										{student.gender === "M"
											? "Male"
											: "Female"}
									</dd>
								</div>
								<div>
									<dt className="text-muted">Section</dt>
									<dd className="font-medium text-navy mt-0.5">
										{studentClassLoads[0].section.name}
									</dd>
								</div>
								<div>
									<dt className="text-muted">Grade Level</dt>
									<dd className="font-medium text-navy mt-0.5">
										Grade{" "}
										{
											studentClassLoads[0].section
												.gradeLevel
										}
									</dd>
								</div>
								{student.birthday && (
									<div>
										<dt className="text-muted">Birthday</dt>
										<dd className="font-medium text-navy mt-0.5">
											{student.birthday}
										</dd>
									</div>
								)}
								<div>
									<dt className="text-muted">Subjects</dt>
									<dd className="font-medium text-navy mt-0.5">
										{studentClassLoads.length}
									</dd>
								</div>
							</dl>
						</Card>
					)}

					{student.guardian?.name && (
						<Card className="p-5">
							<SectionHeader title="Guardian" />
							<div className="flex items-center gap-3 mt-3">
								<Avatar
									name={student.guardian.name}
									size="lg"
								/>
								<div>
									<div className="text-[14px] font-semibold text-navy">
										{student.guardian.name}
									</div>
									{student.guardian.relationship && (
										<div className="text-[12px] text-muted">
											{student.guardian.relationship}
										</div>
									)}
									{student.guardian.contactNumber && (
										<div className="text-[12.5px] text-navy mt-1 flex items-center gap-2">
											<Icon
												name="phone"
												size={13}
												className="text-muted"
											/>
											{student.guardian.contactNumber}
										</div>
									)}
								</div>
							</div>
						</Card>
					)}
				</div>
			)}

			{tab === "attendance" && (
				<div className="space-y-4">
					<Card className="p-4">
						<div className="flex flex-wrap items-center gap-3">
							<select
								value={attStatus}
								onChange={(e) => {
									setAttStatus(
										e.target.value as AttendanceStatus | "",
									);
									setAttPage(1);
								}}
								className="text-[13px] border border-border rounded-lg px-3 py-1.5 bg-background text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
							>
								<option value="">All statuses</option>
								<option value="present">Present</option>
								<option value="late">Late</option>
								<option value="absent">Absent</option>
								<option value="excused">Excused</option>
							</select>
							<select
								value={attSession}
								onChange={(e) => {
									setAttSession(
										e.target.value as Session | "",
									);
									setAttPage(1);
								}}
								className="text-[13px] border border-border rounded-lg px-3 py-1.5 bg-background text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
							>
								<option value="">All sessions</option>
								<option value="AM">AM</option>
								<option value="PM">PM</option>
							</select>
							{attRecordsData && (
								<span className="ml-auto text-[12px] text-muted">
									{attRecordsData.meta.total} record
									{attRecordsData.meta.total !== 1 ? "s" : ""}
								</span>
							)}
						</div>
					</Card>

					<Card className="overflow-hidden">
						{attLoading ? (
							<div className="p-4 space-y-2">
								{[1, 2, 3, 4, 5].map((i) => (
									<Skeleton key={i} className="h-10" />
								))}
							</div>
						) : !attRecordsData ||
						  attRecordsData.records.length === 0 ? (
							<div className="p-10 text-center">
								<Icon
									name="clipboard-check"
									size={28}
									className="text-muted mx-auto mb-2"
								/>
								<p className="text-[13px] text-muted">
									No attendance records found.
								</p>
							</div>
						) : (
							<>
								<div className="overflow-x-auto">
									<table className="w-full text-[13px]">
										<thead>
											<tr className="border-b border-border bg-muted/5">
												<th className="text-left px-4 py-2.5 font-medium text-muted">
													Date
												</th>
												<th className="text-left px-4 py-2.5 font-medium text-muted">
													Day
												</th>
												<th className="text-left px-4 py-2.5 font-medium text-muted">
													Session
												</th>
												<th className="text-left px-4 py-2.5 font-medium text-muted">
													Subject
												</th>
												<th className="text-left px-4 py-2.5 font-medium text-muted">
													Quarter
												</th>
												<th className="text-left px-4 py-2.5 font-medium text-muted">
													Status
												</th>
											</tr>
										</thead>
										<tbody>
											{attRecordsData.records.map(
												(rec) => {
													const days = [
														"Sun",
														"Mon",
														"Tue",
														"Wed",
														"Thu",
														"Fri",
														"Sat",
													];
													const months = [
														"Jan",
														"Feb",
														"Mar",
														"Apr",
														"May",
														"Jun",
														"Jul",
														"Aug",
														"Sep",
														"Oct",
														"Nov",
														"Dec",
													];
													const [y, m, d] = rec.date
														.split("-")
														.map(Number);
													const dateObj = new Date(
														y,
														m - 1,
														d,
													);
													const dateLabel = `${months[m - 1]} ${d}, ${y}`;
													const dayLabel =
														days[dateObj.getDay()];
													const statusColors: Record<
														string,
														string
													> = {
														present:
															"bg-emerald-50 text-emerald-700",
														late: "bg-amber-50 text-amber-700",
														absent: "bg-rose-50 text-rose-700",
														excused:
															"bg-slate-100 text-slate-600",
													};
													return (
														<tr
															key={rec.id}
															className="border-b border-border/50 hover:bg-muted/5 transition-colors"
														>
															<td className="px-4 py-2.5 text-navy font-medium">
																{dateLabel}
															</td>
															<td className="px-4 py-2.5 text-muted">
																{dayLabel}
															</td>
															<td className="px-4 py-2.5">
																<span
																	className={`pill text-[11px] ${rec.session === "AM" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}
																>
																	{
																		rec.session
																	}
																</span>
															</td>
															<td className="px-4 py-2.5 text-navy">
																{rec.subjectName || (
																	<span className="text-muted">
																		—
																	</span>
																)}
															</td>
															<td className="px-4 py-2.5 text-muted">
																{rec.quarter}
															</td>
															<td className="px-4 py-2.5">
																<span
																	className={`pill text-[11px] capitalize ${statusColors[rec.status] ?? "bg-slate-100 text-slate-600"}`}
																>
																	{rec.status}
																</span>
															</td>
														</tr>
													);
												},
											)}
										</tbody>
									</table>
								</div>

								{attRecordsData.meta.pages > 1 && (
									<div className="flex items-center justify-between px-4 py-3 border-t border-border text-[12px] text-muted">
										<Btn
											variant="secondary"
											size="sm"
											onClick={() =>
												setAttPage((p) =>
													Math.max(1, p - 1),
												)
											}
											disabled={attPage <= 1}
										>
											← Prev
										</Btn>
										<span>
											Page {attRecordsData.meta.page} of{" "}
											{attRecordsData.meta.pages}
										</span>
										<Btn
											variant="secondary"
											size="sm"
											onClick={() =>
												setAttPage((p) =>
													Math.min(
														attRecordsData.meta
															.pages,
														p + 1,
													),
												)
											}
											disabled={
												attPage >=
												attRecordsData.meta.pages
											}
										>
											Next →
										</Btn>
									</div>
								)}
							</>
						)}
					</Card>
				</div>
			)}

			{tab === "grades" && (
				<div className="space-y-4">
					<div className="flex gap-2 flex-wrap">
						{(["Q1", "Q2", "Q3", "Q4"] as Quarter[]).map((q) => (
							<button
								key={q}
								onClick={() => setActiveQuarter(q)}
								className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
									activeQuarter === q
										? "bg-primary text-white"
										: "bg-muted/10 text-muted hover:bg-muted/20"
								}`}
							>
								{q}
							</button>
						))}
					</div>

					<Card className="overflow-hidden">
						{gradeQueries.some((q) => q.isLoading) ? (
							<div className="p-4 space-y-2">
								{[1, 2, 3].map((i) => (
									<Skeleton key={i} className="h-10" />
								))}
							</div>
						) : studentClassLoads.length === 0 ? (
							<div className="p-10 text-center">
								<Icon
									name="graduation-cap"
									size={28}
									className="text-muted mx-auto mb-2"
								/>
								<p className="text-[13px] text-muted">
									No class loads found for this student.
								</p>
							</div>
						) : (
							<>
								<div className="overflow-x-auto">
									<table className="w-full text-[13px]">
										<thead>
											<tr className="border-b border-border bg-muted/5">
												<th className="text-left px-4 py-2.5 font-medium text-muted">
													Subject
												</th>
												<th className="text-right px-4 py-2.5 font-medium text-muted">
													WW
												</th>
												<th className="text-right px-4 py-2.5 font-medium text-muted">
													PT
												</th>
												<th className="text-right px-4 py-2.5 font-medium text-muted">
													QA
												</th>
												<th className="text-right px-4 py-2.5 font-medium text-muted">
													Initial
												</th>
												<th className="text-right px-4 py-2.5 font-medium text-muted">
													Final Grade
												</th>
												<th className="text-center px-4 py-2.5 font-medium text-muted">
													Status
												</th>
											</tr>
										</thead>
										<tbody>
											{studentClassLoads.map((cl, i) => {
												const gradeRow = gradeQueries[
													i
												]?.data?.find(
													(r) =>
														r.studentId ===
														student.id,
												);
												const hasGrade =
													Boolean(gradeRow);
												const passing =
													hasGrade &&
													gradeRow!.transmutedGrade >=
														PASSING_GRADE;
												return (
													<tr
														key={cl.id}
														className="border-b border-border/50 hover:bg-muted/5 transition-colors"
													>
														<td className="px-4 py-2.5 text-navy font-medium">
															{cl.subject.name}
														</td>
														<td className="px-4 py-2.5 text-right text-muted">
															{hasGrade
																? `${gradeRow!.wwWeighted.toFixed(1)}%`
																: "—"}
														</td>
														<td className="px-4 py-2.5 text-right text-muted">
															{hasGrade
																? `${gradeRow!.ptWeighted.toFixed(1)}%`
																: "—"}
														</td>
														<td className="px-4 py-2.5 text-right text-muted">
															{hasGrade
																? `${gradeRow!.qaWeighted.toFixed(1)}%`
																: "—"}
														</td>
														<td className="px-4 py-2.5 text-right text-muted">
															{hasGrade
																? gradeRow!.initialGrade.toFixed(
																		1,
																	)
																: "—"}
														</td>
														<td className="px-4 py-2.5 text-right font-semibold text-navy">
															{hasGrade
																? gradeRow!
																		.transmutedGrade
																: "—"}
														</td>
														<td className="px-4 py-2.5 text-center">
															{hasGrade ? (
																<span
																	className={`pill text-[11px] ${passing ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
																>
																	{passing
																		? "Pass"
																		: "Fail"}
																</span>
															) : (
																<span className="pill text-[11px] bg-slate-100 text-slate-500">
																	Pending
																</span>
															)}
														</td>
													</tr>
												);
											})}
										</tbody>
										{(() => {
											const graded = studentClassLoads
												.map((cl, i) =>
													gradeQueries[i]?.data?.find(
														(r) =>
															r.studentId ===
															student.id,
													),
												)
												.filter(Boolean);
											if (graded.length === 0)
												return null;
											const avg =
												graded.reduce(
													(sum, r) =>
														sum +
														r!.transmutedGrade,
													0,
												) / graded.length;
											return (
												<tfoot>
													<tr className="bg-muted/5 border-t border-border font-semibold">
														<td
															className="px-4 py-2.5 text-navy"
															colSpan={5}
														>
															Average (
															{graded.length}{" "}
															subject
															{graded.length !== 1
																? "s"
																: ""}
															)
														</td>
														<td className="px-4 py-2.5 text-right text-navy">
															{avg.toFixed(1)}
														</td>
														<td className="px-4 py-2.5 text-center">
															<span
																className={`pill text-[11px] ${avg >= PASSING_GRADE ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
															>
																{avg >=
																PASSING_GRADE
																	? "Pass"
																	: "Fail"}
															</span>
														</td>
													</tr>
												</tfoot>
											);
										})()}
									</table>
								</div>
							</>
						)}
					</Card>
				</div>
			)}

			<EditStudentModal
				open={editOpen}
				onClose={() => setEditOpen(false)}
				student={student}
				onSuccess={() =>
					toast?.push({
						type: "success",
						title: "Student updated",
						message: "Changes saved.",
					})
				}
			/>
			<DeleteStudentModal
				open={deleteOpen}
				onClose={() => setDeleteOpen(false)}
				student={student}
				onSuccess={() => {
					toast?.push({ type: "success", title: "Student deleted" });
					dismiss?.();
				}}
			/>
		</div>
	);
}

function StudentProfileModal({
	studentId,
	open,
	onClose,
}: {
	studentId: string;
	open: boolean;
	onClose: () => void;
}) {
	return (
		<Modal
			title="Student Profile"
			open={open}
			onClose={onClose}
			width="max-w-4xl"
		>
			<StudentProfileContent studentId={studentId} onClose={onClose} />
		</Modal>
	);
}

export function PageStudentProfile() {
	const navigate = useNavigate();
	const { studentId } = useParams({ strict: false }) as { studentId: string };
	return (
		<div className="page-anim">
			<StudentProfileContent
				studentId={studentId}
				onNavigateBack={() => void navigate({ to: "/app/students" })}
			/>
		</div>
	);
}
