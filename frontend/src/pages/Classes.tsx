// @ts-nocheck
import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	Icon,
	Avatar,
	Badge,
	QuarterBadge,
	Card,
	Modal,
	useToast,
	EmptyState,
	Skeleton,
	StatCard,
	Progress,
	ComponentWeightBar,
	SubjectChip,
	gradeColor,
	SectionHeader,
	Btn,
	Tabs,
	Field,
	TextInput,
	Select,
	BADGE_STYLES,
} from "../components";
import {
	useClassLoads,
	useClassLoad,
	useClassLoadStudents,
	useCreateClassLoad,
} from "../modules/classrooms/useClassLoads";
import type { ClassLoadListItem, Student } from "../shared/types";

// ─── Subject colour palette ──────────────────────────────
const SUBJECT_HUE: Record<string, string> = {
	Science: "linear-gradient(90deg,#0D9488,#0F766E)",
	Math: "linear-gradient(90deg,#7C3AED,#6D28D9)",
	English: "linear-gradient(90deg,#2563EB,#1D4ED8)",
	Filipino: "linear-gradient(90deg,#D97706,#B45309)",
	"Araling Panlipunan": "linear-gradient(90deg,#DC2626,#B91C1C)",
	MAPEH: "linear-gradient(90deg,#DB2777,#BE185D)",
	TLE: "linear-gradient(90deg,#059669,#047857)",
	"Edukasyon sa Pagpapakatao": "linear-gradient(90deg,#0891B2,#0E7490)",
};
function subjectHue(name: string) {
	return SUBJECT_HUE[name] ?? "linear-gradient(90deg,#64748B,#475569)";
}

// ─── Create class form schema ─────────────────────────────
const createSchema = z
	.object({
		subjectName: z.string().min(1, "Subject name is required"),
		gradeLevel: z.coerce.number().int().min(7).max(12),
		sectionName: z.string().min(1, "Section name is required"),
		quarter: z.enum(["Q1", "Q2", "Q3", "Q4"]),
		roomNumber: z.string().default(""),
		wwPct: z.coerce.number().int().min(1).max(98),
		ptPct: z.coerce.number().int().min(1).max(98),
		qaPct: z.coerce.number().int().min(1).max(98),
	})
	.refine((d) => d.wwPct + d.ptPct + d.qaPct === 100, {
		message: "Component weights must total 100%",
		path: ["qaPct"],
	});
type CreateFormValues = z.infer<typeof createSchema>;

// ─── MY CLASSES (list) ───────────────────────────────────

export function PageClasses() {
	const navigate = useNavigate();
	const [gradeFilter, setGradeFilter] = useState("all");
	const [newOpen, setNewOpen] = useState(false);
	const toast = useToast();

	const { data: classLoads = [], isLoading } = useClassLoads();
	const createMutation = useCreateClassLoad();

	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CreateFormValues>({
		resolver: zodResolver(createSchema),
		defaultValues: {
			wwPct: 20,
			ptPct: 60,
			qaPct: 20,
			quarter: "Q1",
			gradeLevel: 7,
		},
	});

	const [ww, pt, qa] = watch(["wwPct", "ptPct", "qaPct"]);
	const weightSum = (ww ?? 0) + (pt ?? 0) + (qa ?? 0);

	const onCreateSubmit = async (values: CreateFormValues) => {
		try {
			await createMutation.mutateAsync({
				subjectName: values.subjectName,
				gradeLevel: values.gradeLevel,
				sectionName: values.sectionName,
				quarter: values.quarter,
				roomNumber: values.roomNumber,
				weights: {
					ww: values.wwPct / 100,
					pt: values.ptPct / 100,
					qa: values.qaPct / 100,
				},
			});
			toast.push({
				type: "success",
				title: "Class created",
				message: "You can now take attendance and enter grades.",
			});
			setNewOpen(false);
			reset();
		} catch (err: unknown) {
			const msg = (err as { response?: { data?: { message?: string } } })
				?.response?.data?.message;
			toast.push({
				type: "error",
				title: "Failed to create class",
				message: msg ?? "Please try again.",
			});
		}
	};

	const filtered = classLoads.filter((c) => {
		if (gradeFilter === "all") return true;
		return c.section.gradeLevel.includes(
			gradeFilter.replace("g", "Grade "),
		);
	});

	return (
		<div className="page-anim space-y-5">
			<Card className="p-4 sm:p-5">
				<div className="flex items-start justify-between gap-3 flex-wrap">
					<div>
						<h2 className="text-[20px] font-semibold tracking-tight text-navy">
							Your class loads
						</h2>
						{isLoading ? (
							<Skeleton className="h-4 w-48 mt-1" />
						) : (
							<p className="text-[13px] text-muted mt-1">
								{classLoads.length} active{" "}
								{classLoads.length === 1 ? "class" : "classes"}{" "}
								·{" "}
								{classLoads.reduce(
									(a, c) => a + c.studentCount,
									0,
								)}{" "}
								total students
							</p>
						)}
					</div>
					<Btn
						variant="primary"
						icon="plus"
						onClick={() => setNewOpen(true)}
					>
						New class
					</Btn>
				</div>

				<div className="mt-4 flex items-center gap-2 flex-wrap">
					{["all", "g7", "g8", "g9", "g10"].map((f) => (
						<button
							key={f}
							onClick={() => setGradeFilter(f)}
							className={`px-3 h-8 rounded-md text-[12.5px] font-semibold transition-colors ${
								gradeFilter === f
									? "bg-navy text-white"
									: "bg-white text-navy border border-line hover:bg-surface"
							}`}
						>
							{f === "all" ? "All" : `Grade ${f.slice(1)}`}
						</button>
					))}
					<span className="ml-auto text-[12px] text-muted">
						{filtered.length} shown
					</span>
				</div>
			</Card>

			{isLoading ? (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<Card key={i} className="p-5 space-y-3">
							<Skeleton className="h-5 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
							<Skeleton className="h-16" />
						</Card>
					))}
				</div>
			) : filtered.length === 0 ? (
				<EmptyState
					icon="book-open"
					title="No class loads yet"
					message='Create your first class load by clicking "New class".'
				/>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{filtered.map((c) => (
						<ClassLoadCard
							key={c.id}
							load={c}
							onView={() =>
								void navigate({
									to: "/app/classes/$classId",
									params: { classId: c.id },
								})
							}
							onAttendance={() =>
								void navigate({ to: "/app/attendance" })
							}
						/>
					))}
				</div>
			)}

			{/* New class modal */}
			<Modal
				open={newOpen}
				onClose={() => {
					setNewOpen(false);
					reset();
				}}
				title="Create a new class load"
				subtitle="Fill in to add a new section to your assignments"
				width="max-w-2xl"
				footer={
					<>
						<Btn
							variant="ghost"
							onClick={() => {
								setNewOpen(false);
								reset();
							}}
						>
							Cancel
						</Btn>
						<Btn
							variant="primary"
							icon="plus"
							onClick={() => {
								void handleSubmit(onCreateSubmit)();
							}}
							disabled={isSubmitting || createMutation.isPending}
						>
							{isSubmitting || createMutation.isPending
								? "Creating…"
								: "Create class"}
						</Btn>
					</>
				}
			>
				<form className="grid grid-cols-2 gap-3" noValidate>
					<Field
						label="Subject name"
						required
						error={errors.subjectName?.message}
					>
						<TextInput
							placeholder="e.g. Science"
							{...register("subjectName")}
						/>
					</Field>
					<Field
						label="Grade level"
						required
						error={errors.gradeLevel?.message}
					>
						<Select {...register("gradeLevel")}>
							{[7, 8, 9, 10, 11, 12].map((g) => (
								<option key={g} value={g}>
									Grade {g}
								</option>
							))}
						</Select>
					</Field>
					<Field
						label="Section name"
						required
						error={errors.sectionName?.message}
					>
						<TextInput
							placeholder="e.g. Mabini"
							{...register("sectionName")}
						/>
					</Field>
					<Field label="Room" error={errors.roomNumber?.message}>
						<TextInput
							placeholder="e.g. Room 207"
							{...register("roomNumber")}
						/>
					</Field>
					<Field
						label="Quarter"
						required
						error={errors.quarter?.message}
					>
						<Select {...register("quarter")}>
							{(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => (
								<option key={q}>{q}</option>
							))}
						</Select>
					</Field>

					<div className="col-span-2 mt-2">
						<div className="text-[12px] font-semibold text-navy mb-2">
							Component weights{" "}
							<span className="text-muted font-normal">
								(must total 100%)
							</span>
						</div>
						<div className="grid grid-cols-3 gap-3">
							<Field
								label="Written Works %"
								required
								error={errors.wwPct?.message}
							>
								<TextInput
									type="number"
									min={1}
									max={98}
									{...register("wwPct")}
								/>
							</Field>
							<Field
								label="Performance Tasks %"
								required
								error={errors.ptPct?.message}
							>
								<TextInput
									type="number"
									min={1}
									max={98}
									{...register("ptPct")}
								/>
							</Field>
							<Field
								label="Quarterly Assessment %"
								required
								error={errors.qaPct?.message}
							>
								<TextInput
									type="number"
									min={1}
									max={98}
									{...register("qaPct")}
								/>
							</Field>
						</div>
						<ComponentWeightBar
							ww={ww ?? 0}
							pt={pt ?? 0}
							qa={qa ?? 0}
							height={10}
							className="mt-3"
						/>
						<div
							className={`text-[11px] mt-1 font-mono ${weightSum === 100 ? "text-emerald-600" : "text-red-500"}`}
						>
							Sum: {weightSum}%{" "}
							{weightSum === 100 ? "✓" : "(must be 100%)"}
						</div>
						{errors.qaPct?.message && (
							<p className="text-[12px] text-red-500 mt-1">
								{errors.qaPct.message}
							</p>
						)}
					</div>
				</form>
			</Modal>
		</div>
	);
}

function ClassLoadCard({
	load,
	onView,
	onAttendance,
}: {
	load: ClassLoadListItem;
	onView: () => void;
	onAttendance: () => void;
}) {
	const hue = subjectHue(load.subject.name);
	return (
		<Card
			variant="interactive"
			className="overflow-hidden border border-primary/30 shadow-md"
			onClick={onView}
		>
			{/* <div className="h-2 w-full" style={{ background: hue }}/> */}
			<div className="p-4 sm:p-5">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<SubjectChip subject={load.subject.name} />
							<QuarterBadge quarter={load.quarter} />
						</div>
						<h3 className="text-[18px] font-semibold text-navy mt-2 tracking-tight">
							{load.section.gradeLevel} – {load.section.name}
						</h3>
						<div className="text-[12px] text-muted mt-0.5 flex items-center gap-2 flex-wrap">
							<span className="inline-flex items-center gap-1">
								<Icon name="users" size={12} />
								{load.studentCount} students
							</span>
							{load.roomNumber && (
								<>
									<span>·</span>
									<span className="inline-flex items-center gap-1">
										<Icon name="map-pin" size={12} />
										{load.roomNumber}
									</span>
								</>
							)}
							{load.scheduleTime && (
								<>
									<span>·</span>
									<span className="inline-flex items-center gap-1">
										<Icon name="clock" size={12} />
										{load.scheduleTime}
									</span>
								</>
							)}
						</div>
					</div>
					<Avatar
						name={`${load.section.name} ${load.subject.name}`}
						size="md"
						square
					/>
				</div>

				<div className="mt-4">
					<div className="text-[10.5px] uppercase tracking-wider text-muted font-semibold mb-1.5">
						Component weights
					</div>
					<ComponentWeightBar
						ww={Math.round(load.wwWeight * 100)}
						pt={Math.round(load.ptWeight * 100)}
						qa={Math.round(load.qaWeight * 100)}
					/>
					<div className="text-[10.5px] text-muted font-mono mt-1">
						WW {Math.round(load.wwWeight * 100)}% / PT{" "}
						{Math.round(load.ptWeight * 100)}% / QA{" "}
						{Math.round(load.qaWeight * 100)}%
					</div>
				</div>

				<div className="mt-4 flex items-center gap-2">
					<Btn
						variant="secondary"
						size="sm"
						icon="layout-dashboard"
						onClick={(e: React.MouseEvent) => {
							e.stopPropagation();
							onView();
						}}
					>
						View details
					</Btn>
					<Btn
						variant="primary"
						size="sm"
						icon="clipboard-check"
						onClick={(e: React.MouseEvent) => {
							e.stopPropagation();
							onAttendance();
						}}
					>
						Take attendance
					</Btn>
				</div>
			</div>
		</Card>
	);
}

// ─── CLASS DETAIL (tabs) ─────────────────────────────────

export function PageClassDetail() {
	const navigate = useNavigate();
	const { classId } = useParams({ strict: false }) as { classId: string };
	const [tab, setTab] = useState("overview");

	const { data: cls, isLoading } = useClassLoad(classId);

	if (isLoading) {
		return (
			<div className="space-y-5">
				<Card className="p-5 space-y-3">
					<Skeleton className="h-6 w-2/3" />
					<Skeleton className="h-4 w-1/2" />
				</Card>
			</div>
		);
	}

	if (!cls) {
		return (
			<EmptyState
				icon="alert-circle"
				title="Class not found"
				message="This class load does not exist or you don't have access."
			/>
		);
	}

	const hue = subjectHue(cls.subject.name);

	return (
		<div className="page-anim space-y-5">
			<Card className="p-4 sm:p-5 overflow-hidden relative">
				<div
					className="absolute top-0 left-0 w-1 h-full"
					style={{ background: hue }}
				/>
				<div className="pl-3 flex items-start justify-between gap-3 flex-wrap">
					<div>
						<button
							onClick={() =>
								void navigate({ to: "/app/classes" })
							}
							className="text-[12px] text-muted hover:text-navy inline-flex items-center gap-1 mb-2"
						>
							<Icon name="arrow-left" size={12} /> Back to My
							Classes
						</button>
						<div className="flex items-center gap-2 flex-wrap">
							<SubjectChip subject={cls.subject.name} />
							<QuarterBadge quarter={cls.quarter} />
							{cls.roomNumber && (
								<span
									className="pill"
									style={{
										background: "#F1F5F9",
										color: "#334155",
									}}
								>
									<Icon name="map-pin" size={11} />
									{cls.roomNumber}
								</span>
							)}
							{cls.scheduleTime && (
								<span
									className="pill"
									style={{
										background: "#F1F5F9",
										color: "#334155",
									}}
								>
									<Icon name="clock" size={11} />
									{cls.scheduleTime}
								</span>
							)}
						</div>
						<h2 className="text-[22px] font-semibold tracking-tight text-navy mt-2.5">
							{cls.section.gradeLevel} – {cls.section.name}
						</h2>
						<div className="text-[12.5px] text-muted mt-0.5">
							{cls.subject.name} · {cls.studentCount} students
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Btn variant="secondary" size="sm" icon="settings">
							Class settings
						</Btn>
						<Btn
							variant="primary"
							size="sm"
							icon="clipboard-check"
							onClick={() =>
								void navigate({ to: "/app/attendance" })
							}
						>
							Take attendance
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
						id: "students",
						label: "Students",
						icon: "users",
						count: cls.studentCount,
					},
					{
						id: "attendance",
						label: "Attendance",
						icon: "clipboard-check",
					},
					{ id: "reports", label: "Reports", icon: "file-text" },
				]}
				active={tab}
				onChange={setTab}
			/>

			{tab === "overview" && <ClassOverviewTab cls={cls} />}
			{tab === "students" && <ClassStudentsTab classId={classId} />}
			{tab === "attendance" && <ClassAttendancePlaceholder />}
			{tab === "reports" && (
				<ClassReportsTab
					studentCount={cls.studentCount}
					quarter={cls.quarter}
				/>
			)}
		</div>
	);
}

function ClassOverviewTab({ cls }: { cls: ClassLoadListItem }) {
	return (
		<div className="space-y-5">
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
				<StatCard
					icon="users"
					label="Total Students"
					value={cls.studentCount}
					color="primary"
					sub={`${cls.section.gradeLevel} · ${cls.section.name}`}
				/>
				<StatCard
					icon="check-circle"
					label="Avg attendance"
					value="-"
					color="accent"
					sub="Not yet computed"
				/>
				<StatCard
					icon="graduation-cap"
					label="Avg grade"
					value="-"
					color="blue"
					sub={`${cls.quarter} cumulative`}
				/>
				<StatCard
					icon="cloud-off"
					label="Pending sync"
					value={0}
					color="amber"
					sub="Up to date"
				/>
			</div>

			<Card className="p-5">
				<SectionHeader
					title="Component weights"
					subtitle={`${cls.quarter} configuration`}
				/>
				<div className="grid grid-cols-3 gap-4 mt-3">
					{[
						{
							label: "Written Works (WW)",
							pct: Math.round(cls.wwWeight * 100),
							icon: "pencil-line",
							color: "bg-teal-500",
						},
						{
							label: "Performance Tasks (PT)",
							pct: Math.round(cls.ptWeight * 100),
							icon: "wrench",
							color: "bg-emerald-500",
						},
						{
							label: "Quarterly Assessment (QA)",
							pct: Math.round(cls.qaWeight * 100),
							icon: "file-check",
							color: "bg-indigo-500",
						},
					].map((row) => (
						<div
							key={row.label}
							className="rounded-md border border-line p-3.5"
						>
							<div className="flex items-center gap-2">
								<Icon
									name={row.icon}
									size={14}
									className="text-muted"
								/>
								<span className="text-[12.5px] font-semibold text-navy">
									{row.label}
								</span>
							</div>
							<div className="text-[28px] font-semibold text-navy font-mono mt-2">
								{row.pct}%
							</div>
							<Progress
								value={row.pct}
								className="mt-2"
								barClass={row.color}
							/>
						</div>
					))}
				</div>
			</Card>
		</div>
	);
}

function ClassStudentsTab({ classId }: { classId: string }) {
	const [q, setQ] = useState("");
	const { data: students = [], isLoading } = useClassLoadStudents(classId);
	const navigate = useNavigate();

	const filtered = students.filter(
		(s) =>
			!q ||
			`${s.lastName} ${s.firstName}`
				.toLowerCase()
				.includes(q.toLowerCase()) ||
			s.lrn.includes(q),
	);

	return (
		<Card className="overflow-hidden">
			<div className="px-4 py-3 border-b border-line flex items-center gap-3 flex-wrap">
				<div className="relative flex-1 max-w-md">
					<Icon
						name="search"
						size={14}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
					/>
					<input
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Search name or LRN…"
						className="w-full h-9 pl-9 pr-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none"
					/>
				</div>
				<span className="ml-auto text-[12px] text-muted">
					{filtered.length} students
				</span>
			</div>

			{isLoading ? (
				<div className="p-4 space-y-2">
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} className="h-10" />
					))}
				</div>
			) : filtered.length === 0 ? (
				<div className="p-8 text-center text-[13px] text-muted">
					{q
						? "No students match your search."
						: "No students enrolled in this class yet."}
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-[12.5px]">
						<thead className="bg-surface text-muted text-left">
							<tr>
								<th className="px-3 py-2 font-semibold w-12">
									#
								</th>
								<th className="px-3 py-2 font-semibold">
									Student
								</th>
								<th className="px-3 py-2 font-semibold">LRN</th>
								<th className="px-3 py-2 font-semibold">
									Gender
								</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((s, i) => (
								<tr
									key={s.id}
									className="border-t border-line hover:bg-slate-50/40 cursor-pointer"
									onClick={() =>
										void navigate({
											to: "/app/students/$studentId",
											params: { studentId: s.id },
										})
									}
								>
									<td className="px-3 py-2 font-mono text-muted">
										{i + 1}
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
										{s.gender}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</Card>
	);
}

function ClassAttendancePlaceholder() {
	return (
		<Card className="p-8 text-center">
			<Icon
				name="clipboard-check"
				size={32}
				className="text-muted mx-auto mb-3"
			/>
			<p className="text-[14px] font-semibold text-navy">
				Attendance history coming soon
			</p>
			<p className="text-[13px] text-muted mt-1">
				Use the Attendance module to take and view attendance records.
			</p>
		</Card>
	);
}

function ClassReportsTab({
	studentCount,
	quarter,
}: {
	studentCount: number;
	quarter: string;
}) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{[
				{
					code: "SF2",
					name: "SF2 Attendance Record",
					desc: "Monthly daily attendance per learner, DepEd format.",
					icon: "clipboard-list",
				},
				{
					code: "SF9",
					name: "Grade Summary",
					desc: `All ${studentCount} students, all components, final ${quarter} grade.`,
					icon: "graduation-cap",
				},
				{
					code: "SF9",
					name: "Individual Report Cards",
					desc: "Per-student SF9 card for parent distribution.",
					icon: "file-text",
				},
				{
					code: "",
					name: "Honor Roll",
					desc: "Auto-generated tiers (Highest/High/Honors).",
					icon: "award",
				},
			].map((r, i) => (
				<Card key={i} className="p-4">
					<div className="flex items-start gap-3">
						<span className="w-10 h-10 rounded-md bg-primary-light text-primary inline-flex items-center justify-center">
							<Icon name={r.icon} size={18} />
						</span>
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<h4 className="text-[14px] font-semibold text-navy">
									{r.name}
								</h4>
								{r.code && (
									<Badge status="primary">{r.code}</Badge>
								)}
							</div>
							<p className="text-[12px] text-muted mt-0.5">
								{r.desc}
							</p>
							<div className="mt-3 flex items-center gap-2">
								<Btn variant="secondary" size="sm" icon="eye">
									Preview
								</Btn>
								<Btn
									variant="primary"
									size="sm"
									icon="download"
								>
									Generate
								</Btn>
							</div>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}
