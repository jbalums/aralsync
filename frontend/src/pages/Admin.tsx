// @ts-nocheck
import React, {
	useState,
	useEffect,
	useMemo,
	useRef,
	useCallback,
	Fragment,
} from "react";
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
	ConnPill,
	Logo,
	Sparkbars,
	RingChart,
	Donut,
	HeatCalendar,
	SubjectChip,
	gradeColor,
	studentStatus,
	SectionHeader,
	Btn,
	Dropdown,
	Tabs,
	Switch,
	Field,
	TextInput,
	Select,
	BADGE_STYLES,
} from "../components";
import {
	TEACHER,
	CLASSES,
	STUDENTS_RIZAL,
	JUAN_SCORES,
	SUBJECT_COLORS,
	TODAY,
	SYNC_STATE,
	ACTIVITY,
	NOTIFICATIONS,
	STUDENT_NOTES,
	ATTENDANCE_LOG,
	SPARKLINES,
} from "../data/mockData";
import { useAuthStore } from "../modules/auth/authStore";
import {
	useSchoolYears,
	useCreateSchoolYear,
	useUpdateSchoolYear,
	useDeleteSchoolYear,
	useActivateSchoolYear,
} from "../modules/classrooms/useSchoolYears";

// ─── ADMIN CONSOLE (school-wide view) ────────────────────

const FACULTY = [
	{
		id: "f1",
		name: "Maria B. Santos",
		role: "Teacher III · Adviser",
		dept: "Science",
		classes: 4,
		students: 155,
		attRate: 92.6,
		online: true,
		isMe: true,
	},
	{
		id: "f2",
		name: "Ricardo G. Reyes",
		role: "Teacher II",
		dept: "Mathematics",
		classes: 5,
		students: 198,
		attRate: 88.4,
		online: true,
	},
	{
		id: "f3",
		name: "Elena F. Cruz",
		role: "Master Teacher I",
		dept: "English",
		classes: 3,
		students: 118,
		attRate: 95.7,
		online: false,
	},
	{
		id: "f4",
		name: "Andres P. Lim",
		role: "Teacher I",
		dept: "Filipino",
		classes: 4,
		students: 160,
		attRate: 90.1,
		online: true,
	},
	{
		id: "f5",
		name: "Sofia M. Aquino",
		role: "Department Head",
		dept: "MAPEH",
		classes: 2,
		students: 80,
		attRate: 96.3,
		online: false,
	},
	{
		id: "f6",
		name: "Joaquin R. Bautista",
		role: "Teacher II",
		dept: "TLE",
		classes: 3,
		students: 120,
		attRate: 87.2,
		online: true,
	},
	{
		id: "f7",
		name: "Therese V. Domingo",
		role: "Teacher III · Adviser",
		dept: "Araling Pan.",
		classes: 4,
		students: 160,
		attRate: 91.4,
		online: false,
	},
	{
		id: "f8",
		name: "Ulysses K. Tolentino",
		role: "Teacher I",
		dept: "EsP",
		classes: 3,
		students: 120,
		attRate: 93.8,
		online: true,
	},
];

const AUDIT_LOG = [
	{
		who: "Maria B. Santos",
		action: "Updated WW4 score",
		target: "Juan dela Cruz",
		when: "2 mins ago",
		tone: "edit",
	},
	{
		who: "Maria B. Santos",
		action: "Saved attendance",
		target: "Grade 7 Rizal · AM",
		when: "7:45 AM",
		tone: "save",
	},
	{
		who: "Ricardo G. Reyes",
		action: "Generated SF2",
		target: "Grade 8 Bonifacio",
		when: "7:30 AM",
		tone: "export",
	},
	{
		who: "Elena F. Cruz",
		action: "Added student",
		target: "Lorenzo M. Vergara",
		when: "Yesterday",
		tone: "create",
	},
	{
		who: "Andres P. Lim",
		action: "Adjusted weights",
		target: "Filipino · Q3",
		when: "Yesterday",
		tone: "edit",
	},
	{
		who: "System",
		action: "Sync failed → retried OK",
		target: "5 records",
		when: "Yesterday",
		tone: "system",
	},
	{
		who: "Sofia M. Aquino",
		action: "Locked Q2 grades",
		target: "MAPEH section A",
		when: "Mon",
		tone: "lock",
	},
	{
		who: "Maria B. Santos",
		action: "Imported roster",
		target: "Grade 7 Rizal",
		when: "Mon",
		tone: "create",
	},
	{
		who: "Joaquin R. Bautista",
		action: "Created new class",
		target: "TLE · Grade 9 Mab.",
		when: "Sun",
		tone: "create",
	},
	{
		who: "Therese V. Domingo",
		action: "Revoked device",
		target: "iPad (lost)",
		when: "Sun",
		tone: "security",
	},
];

export function PageAdmin({ setRoute }) {
	const [tab, setTab] = useState("overview");
	const user = useAuthStore((s) => s.user);

	return (
		<div className="page-anim space-y-5">
			{/* Header */}
			<Card
				className="p-4 sm:p-5 overflow-hidden relative"
				style={{
					background:
						"linear-gradient(135deg, #0D5E57 0%, #0F766E 70%, #10B981 130%)",
				}}
			>
				<div className="absolute inset-0 grid-bg opacity-20"></div>
				<div className="relative flex items-start justify-between gap-3 flex-wrap text-white">
					<div>
						<div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-[11px] font-semibold tracking-wider uppercase">
							<Icon name="shield-check" size={12} /> School
							Administrator · Full access
						</div>
						<h2 className="text-[26px] font-semibold tracking-tight mt-2.5">
							Admin Console
						</h2>
						<p className="text-[13px] text-white/80 mt-1 max-w-xl">
							{TEACHER.school} · {TEACHER.division} ·{" "}
							{TEACHER.schoolYear}. School-wide oversight for{" "}
							{FACULTY.length} teachers, 16 sections, 633
							students.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Btn
							variant="secondary"
							size="sm"
							icon="download"
							className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
						>
							Export school data
						</Btn>
						<Btn
							size="sm"
							icon="settings"
							className="!bg-white !text-primary-dark hover:!bg-primary-light"
							onClick={() => setRoute("settings")}
						>
							School settings
						</Btn>
					</div>
				</div>
			</Card>

			<Tabs
				tabs={[
					{
						id: "overview",
						label: "School Overview",
						icon: "building-2",
					},
					{
						id: "faculty",
						label: "Faculty",
						icon: "users-round",
						count: FACULTY.length,
					},
					{
						id: "classes",
						label: "All Classes",
						icon: "book-marked",
					},
					{
						id: "school_years",
						label: "School Years",
						icon: "calendar",
					},
					{
						id: "audit",
						label: "Audit Log",
						icon: "list",
						count: AUDIT_LOG.length,
					},
					{ id: "roles", label: "Roles & Access", icon: "key-round" },
				]}
				active={tab}
				onChange={setTab}
			/>

			{tab === "overview" && <AdminOverview />}
			{tab === "faculty" && <AdminFaculty />}
			{tab === "classes" && <AdminClasses setRoute={setRoute} />}
			{tab === "school_years" && (
				<AdminSchoolYears schoolId={user?.schoolId} />
			)}
			{tab === "audit" && <AdminAudit />}
			{tab === "roles" && <AdminRoles />}
		</div>
	);
}

function AdminOverview() {
	return (
		<div className="space-y-5">
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
				<StatCard
					icon="users-round"
					label="Faculty"
					value={FACULTY.length}
					color="primary"
					sub="2 dept. heads"
				/>
				<StatCard
					icon="users"
					label="Students"
					value="633"
					color="accent"
					sub="Across 16 sections"
					trend="+12"
				/>
				<StatCard
					icon="check-circle"
					label="School avg att."
					value="91.8%"
					trend="+0.5%"
					color="blue"
					sub="Q3 to date"
				/>
				<StatCard
					icon="cloud-off"
					label="Pending sync"
					value="14"
					color="amber"
					sub="School-wide"
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
				<Card className="p-5 lg:col-span-2">
					<SectionHeader
						title="Attendance by department"
						subtitle="Q3 cumulative · all sections"
					/>
					<div className="space-y-3">
						{[
							{
								dept: "Science",
								att: 94.2,
								count: 155,
								color: "#0EA5A4",
							},
							{
								dept: "Mathematics",
								att: 88.7,
								count: 198,
								color: "#2563EB",
							},
							{
								dept: "English",
								att: 96.1,
								count: 118,
								color: "#9333EA",
							},
							{
								dept: "Filipino",
								att: 91.3,
								count: 160,
								color: "#EA580C",
							},
							{
								dept: "MAPEH",
								att: 96.3,
								count: 80,
								color: "#10B981",
							},
							{
								dept: "TLE",
								att: 87.2,
								count: 120,
								color: "#F59E0B",
							},
						].map((r, i) => (
							<div key={i}>
								<div className="flex items-center justify-between text-[12.5px] mb-1">
									<span className="font-semibold text-navy">
										{r.dept}
									</span>
									<span className="text-muted">
										{r.count} students ·{" "}
										<span className="font-mono text-navy font-semibold">
											{r.att}%
										</span>
									</span>
								</div>
								<div className="h-2 rounded-full bg-slate-100 overflow-hidden">
									<div
										className="h-full"
										style={{
											width: `${r.att}%`,
											background: r.color,
										}}
									/>
								</div>
							</div>
						))}
					</div>
				</Card>

				<Card className="p-5">
					<SectionHeader
						title="Now online"
						subtitle="Teachers currently active"
					/>
					<ul className="space-y-2.5">
						{FACULTY.filter((f) => f.online)
							.slice(0, 5)
							.map((f) => (
								<li
									key={f.id}
									className="flex items-center gap-2.5"
								>
									<div className="relative">
										<Avatar name={f.name} size="sm" />
										<span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="text-[12.5px] font-semibold text-navy truncate">
											{f.name}
										</div>
										<div className="text-[10.5px] text-muted">
											{f.dept}
										</div>
									</div>
									{f.isMe && (
										<Badge status="primary">You</Badge>
									)}
								</li>
							))}
					</ul>
					<Btn
						variant="ghost"
						size="sm"
						className="w-full mt-3"
						icon="users-round"
					>
						View all faculty
					</Btn>
				</Card>

				<Card className="p-5 lg:col-span-3">
					<SectionHeader
						title="School-wide performance distribution"
						subtitle="Q3 grade bands across all subjects"
					/>
					<div className="grid grid-cols-5 gap-3">
						{[
							{
								band: "≥98",
								label: "Highest Honors",
								count: 8,
								color: "#0F766E",
							},
							{
								band: "95–97",
								label: "High Honors",
								count: 32,
								color: "#10B981",
							},
							{
								band: "90–94",
								label: "With Honors",
								count: 84,
								color: "#22C55E",
							},
							{
								band: "75–89",
								label: "Passing",
								count: 488,
								color: "#3B82F6",
							},
							{
								band: "<75",
								label: "Needs help",
								count: 21,
								color: "#EF4444",
							},
						].map((r, i) => (
							<div
								key={i}
								className="rounded-md border border-line p-3.5 text-center"
							>
								<div className="text-[10px] uppercase tracking-wider text-muted font-semibold">
									{r.label}
								</div>
								<div className="text-[24px] font-bold font-mono text-navy mt-1.5">
									{r.count}
								</div>
								<div
									className="text-[10.5px] font-mono mt-1 px-2 py-0.5 rounded-full inline-block"
									style={{
										background: `${r.color}22`,
										color: r.color,
									}}
								>
									{r.band}
								</div>
							</div>
						))}
					</div>
				</Card>
			</div>
		</div>
	);
}

function AdminFaculty() {
	const [q, setQ] = useState("");
	const list = FACULTY.filter(
		(f) =>
			!q ||
			f.name.toLowerCase().includes(q.toLowerCase()) ||
			f.dept.toLowerCase().includes(q.toLowerCase()),
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
						placeholder="Search faculty by name or department…"
						className="w-full h-9 pl-9 pr-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none"
					/>
				</div>
				<Btn variant="ghost" size="sm" icon="filter">
					Filter
				</Btn>
				<span className="ml-auto"></span>
				<Btn variant="secondary" size="sm" icon="upload">
					Import faculty
				</Btn>
				<Btn variant="primary" size="sm" icon="user-plus">
					Invite teacher
				</Btn>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full text-[12.5px]">
					<thead className="bg-surface text-muted text-left">
						<tr>
							<th className="px-3 py-2.5 font-semibold">
								Teacher
							</th>
							<th className="px-3 py-2.5 font-semibold">Role</th>
							<th className="px-3 py-2.5 font-semibold">
								Department
							</th>
							<th className="px-3 py-2.5 font-semibold">
								Classes
							</th>
							<th className="px-3 py-2.5 font-semibold">
								Students
							</th>
							<th className="px-3 py-2.5 font-semibold">Att.</th>
							<th className="px-3 py-2.5 font-semibold">
								Status
							</th>
							<th className="px-3 py-2.5 font-semibold w-12"></th>
						</tr>
					</thead>
					<tbody>
						{list.map((f) => (
							<tr
								key={f.id}
								className="border-t border-line hover:bg-slate-50/40"
							>
								<td className="px-3 py-2">
									<div className="flex items-center gap-2.5">
										<div className="relative">
											<Avatar name={f.name} size="sm" />
											{f.online && (
												<span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
											)}
										</div>
										<div>
											<div className="font-semibold text-navy">
												{f.name}
												{f.isMe && (
													<span className="ml-2 text-[10px] text-primary font-bold">
														(You)
													</span>
												)}
											</div>
											<div className="text-[10.5px] text-muted">
												{f.online
													? "Active now"
													: "Offline"}
											</div>
										</div>
									</div>
								</td>
								<td className="px-3 py-2 text-navy/80">
									{f.role}
								</td>
								<td className="px-3 py-2">
									<span
										className="pill"
										style={{
											background: "#F1F5F9",
											color: "#334155",
										}}
									>
										{f.dept}
									</span>
								</td>
								<td className="px-3 py-2 font-mono text-navy">
									{f.classes}
								</td>
								<td className="px-3 py-2 font-mono text-navy">
									{f.students}
								</td>
								<td className="px-3 py-2">
									<span
										className={`font-mono font-semibold ${f.attRate >= 90 ? "text-emerald-700" : f.attRate >= 85 ? "text-amber-700" : "text-rose-700"}`}
									>
										{f.attRate}%
									</span>
								</td>
								<td className="px-3 py-2">
									<Badge
										status={f.online ? "synced" : "pending"}
									>
										{f.online ? "Online" : "Idle"}
									</Badge>
								</td>
								<td className="px-3 py-2 text-right">
									<Dropdown
										trigger={
											<button className="p-1.5 rounded hover:bg-slate-100">
												<Icon
													name="more-horizontal"
													size={16}
													className="text-muted"
												/>
											</button>
										}
										items={[
											{
												label: "View profile",
												icon: "eye",
											},
											{
												label: "Reassign classes",
												icon: "replace",
											},
											{
												label: "Change role",
												icon: "shield",
											},
											{ separator: true },
											{
												label: "Send message",
												icon: "message-square",
											},
											{
												label: "Suspend access",
												icon: "user-x",
											},
										]}
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Card>
	);
}

function AdminClasses({ setRoute }) {
	const allClasses = [
		...CLASSES,
		{
			id: "g8b-mat",
			subject: "Mathematics",
			grade: "Grade 8",
			section: "Bonifacio",
			count: 38,
			att: 90.2,
			avgGrade: 84,
			teacher: "Ricardo G. Reyes",
		},
		{
			id: "g9a-eng",
			subject: "English",
			grade: "Grade 9",
			section: "Aguinaldo",
			count: 36,
			att: 94.7,
			avgGrade: 88,
			teacher: "Elena F. Cruz",
		},
		{
			id: "g10m-fil",
			subject: "Filipino",
			grade: "Grade 10",
			section: "Mabini",
			count: 42,
			att: 89.4,
			avgGrade: 83,
			teacher: "Andres P. Lim",
		},
	];
	return (
		<Card className="overflow-hidden">
			<div className="px-4 py-3 border-b border-line flex items-center gap-3 flex-wrap">
				<h3 className="text-[14px] font-semibold text-navy">
					All classes · {allClasses.length} active
				</h3>
				<span className="ml-auto"></span>
				<Btn variant="ghost" size="sm" icon="filter">
					Filter
				</Btn>
				<Btn variant="primary" size="sm" icon="plus">
					Create class
				</Btn>
			</div>
			<table className="w-full text-[12.5px]">
				<thead className="bg-surface text-muted text-left">
					<tr>
						<th className="px-3 py-2.5 font-semibold">Subject</th>
						<th className="px-3 py-2.5 font-semibold">
							Grade · Section
						</th>
						<th className="px-3 py-2.5 font-semibold">Teacher</th>
						<th className="px-3 py-2.5 font-semibold">Students</th>
						<th className="px-3 py-2.5 font-semibold">Att.</th>
						<th className="px-3 py-2.5 font-semibold">Avg Grade</th>
						<th className="px-3 py-2.5 font-semibold w-12"></th>
					</tr>
				</thead>
				<tbody>
					{allClasses.map((c) => (
						<tr
							key={c.id}
							className="border-t border-line hover:bg-slate-50/40 cursor-pointer"
							onClick={() => setRoute && setRoute("class-detail")}
						>
							<td className="px-3 py-2">
								<SubjectChip subject={c.subject} />
							</td>
							<td className="px-3 py-2 text-navy font-semibold">
								{c.grade} · {c.section}
							</td>
							<td className="px-3 py-2 text-navy">
								{c.teacher || "Maria B. Santos"}
							</td>
							<td className="px-3 py-2 font-mono text-navy">
								{c.count}
							</td>
							<td className="px-3 py-2">
								<span
									className={`font-mono font-semibold ${c.att >= 90 ? "text-emerald-700" : c.att >= 85 ? "text-amber-700" : "text-rose-700"}`}
								>
									{c.att}%
								</span>
							</td>
							<td className="px-3 py-2">
								<span
									className="inline-flex items-center justify-center w-10 h-7 rounded-md font-mono text-[12px] font-bold"
									style={gradeColor(c.avgGrade)}
								>
									{c.avgGrade}
								</span>
							</td>
							<td className="px-3 py-2 text-right text-muted">
								<Icon name="chevron-right" size={14} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</Card>
	);
}

function AdminAudit() {
	const toneMap = {
		edit: { bg: "#DBEAFE", fg: "#1D4ED8", icon: "pencil-line" },
		save: { bg: "#D1FAE5", fg: "#065F46", icon: "save" },
		export: { bg: "#EDE9FE", fg: "#6D28D9", icon: "download" },
		create: { bg: "#CCFBF1", fg: "#0F766E", icon: "plus" },
		system: { bg: "#FEF3C7", fg: "#92400E", icon: "cpu" },
		lock: { bg: "#F1F5F9", fg: "#475569", icon: "lock" },
		security: { bg: "#FEE2E2", fg: "#7F1D1D", icon: "shield" },
	};
	return (
		<Card className="overflow-hidden">
			<div className="px-4 py-3 border-b border-line flex items-center gap-3 flex-wrap">
				<h3 className="text-[14px] font-semibold text-navy">
					Activity log
				</h3>
				<span className="text-[12px] text-muted">
					School-wide, last 30 days
				</span>
				<span className="ml-auto"></span>
				<Btn variant="ghost" size="sm" icon="filter">
					Filter
				</Btn>
				<Btn variant="ghost" size="sm" icon="download">
					Export CSV
				</Btn>
			</div>
			<ul className="divide-y divide-line">
				{AUDIT_LOG.map((e, i) => {
					const t = toneMap[e.tone] || toneMap.system;
					return (
						<li
							key={i}
							className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50/40"
						>
							<span
								className="w-9 h-9 rounded-md inline-flex items-center justify-center shrink-0"
								style={{ background: t.bg, color: t.fg }}
							>
								<Icon name={t.icon} size={16} />
							</span>
							<div className="flex-1 min-w-0">
								<div className="text-[13px] text-navy">
									<span className="font-semibold">
										{e.who}
									</span>{" "}
									· {e.action}{" "}
									<span className="text-muted">→</span>{" "}
									<span className="text-navy">
										{e.target}
									</span>
								</div>
								<div className="text-[11px] text-muted mt-0.5">
									{e.when}
								</div>
							</div>
							<Btn variant="ghost" size="sm" icon="info">
								Detail
							</Btn>
						</li>
					);
				})}
			</ul>
		</Card>
	);
}

const schoolYearSchema = z.object({
	label: z.string().min(1, "Label is required"),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().min(1, "End date is required"),
});

function fmtDate(iso) {
	if (!iso) return "—";
	const [y, m, d] = iso.split("-");
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
	return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

function AdminSchoolYears({ schoolId }) {
	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [deletingId, setDeletingId] = useState(null);

	const { data: years = [], isLoading } = useSchoolYears(schoolId);
	const create = useCreateSchoolYear(schoolId ?? "");
	const update = useUpdateSchoolYear(schoolId ?? "");
	const activate = useActivateSchoolYear(schoolId ?? "");
	const remove = useDeleteSchoolYear(schoolId ?? "");
	const toast = useToast();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: zodResolver(schoolYearSchema),
	});

	function openAdd() {
		reset({ label: "", startDate: "", endDate: "" });
		setEditing(null);
		setModalOpen(true);
	}

	function openEdit(y) {
		reset({ label: y.label, startDate: y.startDate, endDate: y.endDate });
		setEditing(y);
		setModalOpen(true);
	}

	async function onSubmit(values) {
		try {
			if (editing) {
				await update.mutateAsync({
					yearId: editing.id,
					payload: values,
				});
				toast?.push({ type: "success", title: "School year updated" });
			} else {
				await create.mutateAsync(values);
				toast?.push({ type: "success", title: "School year created" });
			}
			setModalOpen(false);
		} catch {
			toast?.push({ type: "error", title: "Something went wrong" });
		}
	}

	async function handleActivate(yearId) {
		try {
			await activate.mutateAsync(yearId);
			toast?.push({ type: "success", title: "School year activated" });
		} catch {
			toast?.push({
				type: "error",
				title: "Could not activate school year",
			});
		}
	}

	async function confirmDelete() {
		try {
			await remove.mutateAsync(deletingId);
			toast?.push({ type: "success", title: "School year deleted" });
		} catch (err) {
			toast?.push({
				type: "error",
				title:
					err?.response?.data?.message ??
					"Could not delete school year",
			});
		} finally {
			setDeletingId(null);
		}
	}

	return (
		<>
			<Card className="overflow-vissible!">
				<div className="px-4 py-3 border-b border-line flex items-center gap-3 flex-wrap">
					<h3 className="text-[14px] font-semibold text-navy">
						School Years
					</h3>
					<span className="text-[12px] text-muted">
						{years.length} total
					</span>
					<span className="ml-auto" />
					<Btn
						variant="primary"
						size="sm"
						icon="plus"
						onClick={openAdd}
					>
						Add School Year
					</Btn>
				</div>

				{isLoading ? (
					<div className="p-4 space-y-2">
						{[1, 2, 3].map((i) => (
							<Skeleton key={i} className="h-10 rounded-md" />
						))}
					</div>
				) : years.length === 0 ? (
					<div className="py-10">
						<EmptyState
							icon="calendar"
							title="No school years yet"
							description="Add a school year to get started."
							action={
								<Btn
									variant="primary"
									size="sm"
									icon="plus"
									onClick={openAdd}
								>
									Add School Year
								</Btn>
							}
						/>
					</div>
				) : (
					<div className="">
						<table className="w-full text-[12.5px]">
							<thead className="bg-surface text-muted text-left">
								<tr>
									<th className="px-4 py-2.5 font-semibold">
										School Year
									</th>
									<th className="px-4 py-2.5 font-semibold">
										Period
									</th>
									<th className="px-4 py-2.5 font-semibold">
										Status
									</th>
									<th className="px-4 py-2.5 font-semibold w-12"></th>
								</tr>
							</thead>
							<tbody>
								{years.map((y) => (
									<tr
										key={y.id}
										className="border-t border-line hover:bg-slate-50/40"
									>
										<td className="px-4 py-3 font-semibold text-navy">
											{y.label}
										</td>
										<td className="px-4 py-3 text-muted font-mono text-[11.5px]">
											{fmtDate(y.startDate)} →{" "}
											{fmtDate(y.endDate)}
										</td>
										<td className="px-4 py-3">
											{y.isActive ? (
												<Badge status="synced">
													Active
												</Badge>
											) : (
												<Badge status="pending">
													Inactive
												</Badge>
											)}
										</td>
										<td className="px-4 py-3 text-right">
											<Dropdown
												trigger={
													<button className="p-1.5 rounded hover:bg-slate-100">
														<Icon
															name="more-horizontal"
															size={16}
															className="text-muted"
														/>
													</button>
												}
												items={[
													...(!y.isActive
														? [
																{
																	label: "Activate",
																	icon: "check-circle",
																	onClick:
																		() =>
																			handleActivate(
																				y.id,
																			),
																},
															]
														: []),
													{
														label: "Edit",
														icon: "pencil",
														onClick: () =>
															openEdit(y),
													},
													...(y.isActive
														? []
														: [
																{
																	separator: true,
																},
																{
																	label: "Delete",
																	icon: "trash-2",
																	onClick:
																		() =>
																			setDeletingId(
																				y.id,
																			),
																},
															]),
												]}
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</Card>

			{/* Add / Edit modal */}
			<Modal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				title={editing ? "Edit School Year" : "Add School Year"}
				subtitle={
					editing
						? `Editing "${editing.label}"`
						: "Create a new school year for this school."
				}
				footer={
					<div className="flex justify-end gap-2">
						<Btn
							variant="ghost"
							size="sm"
							onClick={() => setModalOpen(false)}
						>
							Cancel
						</Btn>
						<Btn
							variant="primary"
							size="sm"
							onClick={handleSubmit(onSubmit)}
							disabled={isSubmitting}
						>
							{isSubmitting ? "Saving…" : "Save"}
						</Btn>
					</div>
				}
			>
				<div className="p-5 space-y-4">
					<Field label="Label" required error={errors.label?.message}>
						<TextInput
							{...register("label")}
							placeholder="e.g. S.Y. 2026–2027"
						/>
					</Field>
					<div className="grid grid-cols-2 gap-4">
						<Field
							label="Start Date"
							required
							error={errors.startDate?.message}
						>
							<TextInput type="date" {...register("startDate")} />
						</Field>
						<Field
							label="End Date"
							required
							error={errors.endDate?.message}
						>
							<TextInput type="date" {...register("endDate")} />
						</Field>
					</div>
				</div>
			</Modal>

			{/* Delete confirmation modal */}
			<Modal
				open={Boolean(deletingId)}
				onClose={() => setDeletingId(null)}
				title="Delete School Year"
				subtitle="This cannot be undone."
				width="max-w-sm"
				footer={
					<div className="flex justify-end gap-2">
						<Btn
							variant="ghost"
							size="sm"
							onClick={() => setDeletingId(null)}
						>
							Cancel
						</Btn>
						<Btn
							variant="danger"
							size="sm"
							onClick={confirmDelete}
							disabled={remove.isPending}
						>
							{remove.isPending ? "Deleting…" : "Delete"}
						</Btn>
					</div>
				}
			>
				<div className="p-5">
					<p className="text-[13px] text-navy">
						Are you sure you want to delete this school year? All
						associated data will remain, but the school year record
						will be removed.
					</p>
				</div>
			</Modal>
		</>
	);
}

function AdminRoles() {
	const roles = [
		{
			id: "admin",
			label: "School Administrator",
			count: 1,
			perms: [
				"Full access",
				"User management",
				"School settings",
				"Audit log",
				"Multi-class reports",
			],
		},
		{
			id: "depthead",
			label: "Department Head",
			count: 2,
			perms: [
				"View dept. classes",
				"Approve grades",
				"Lock quarters",
				"Export dept. reports",
			],
		},
		{
			id: "master",
			label: "Master Teacher",
			count: 1,
			perms: [
				"Standard teacher",
				"Curriculum templates",
				"Co-teach review",
			],
		},
		{
			id: "teacher",
			label: "Teacher",
			count: 5,
			perms: ["Own classes", "Attendance", "Gradebook", "SF2/SF9 export"],
		},
		{
			id: "viewer",
			label: "Read-only viewer",
			count: 0,
			perms: ["View own dashboard"],
		},
	];
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
			{roles.map((r) => (
				<Card key={r.id} className="p-5">
					<div className="flex items-start justify-between">
						<div>
							<h3 className="text-[15px] font-semibold text-navy">
								{r.label}
							</h3>
							<div className="text-[11.5px] text-muted mt-0.5">
								{r.count} member{r.count === 1 ? "" : "s"}
							</div>
						</div>
						<Badge
							status={r.id === "admin" ? "primary" : "neutral"}
						>
							{r.id}
						</Badge>
					</div>
					<ul className="mt-3 space-y-1.5">
						{r.perms.map((p, i) => (
							<li
								key={i}
								className="text-[12.5px] text-navy flex items-center gap-2"
							>
								<Icon
									name="check"
									size={12}
									className="text-emerald-600"
								/>
								{p}
							</li>
						))}
					</ul>
					<div className="mt-4 flex items-center gap-2">
						<Btn variant="secondary" size="sm" icon="users-round">
							Manage members
						</Btn>
						<Btn
							variant="ghost"
							size="sm"
							icon="sliders-horizontal"
						>
							Edit permissions
						</Btn>
					</div>
				</Card>
			))}
		</div>
	);
}
