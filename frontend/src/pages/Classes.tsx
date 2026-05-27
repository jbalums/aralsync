// @ts-nocheck
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
	Card,
	EmptyState,
	Skeleton,
	SubjectChip,
	QuarterBadge,
	Icon,
	Btn,
	Tabs,
} from "../components";
import {
	useClassLoads,
	useClassLoad,
} from "../modules/classrooms/useClassLoads";
import {
	ClassLoadCard,
	CreateClassModal,
	ClassSettingsModal,
	ClassOverviewTab,
	ClassStudentsTab,
	ClassAttendanceTab,
	ClassReportsTab,
	subjectHue,
} from "../components/classes";

export function PageClasses() {
	const navigate = useNavigate();
	const [gradeFilter, setGradeFilter] = useState("all");
	const [newOpen, setNewOpen] = useState(false);

	const { data: classLoads = [], isLoading } = useClassLoads();

	const uniqueGrades = useMemo(
		() => [...new Set(classLoads.map((c) => c.section.gradeLevel))].sort(),
		[classLoads],
	);

	useEffect(() => {
		if (gradeFilter !== "all" && !uniqueGrades.includes(gradeFilter)) {
			setGradeFilter("all");
		}
	}, [uniqueGrades, gradeFilter]);

	const filtered = classLoads.filter((c) =>
		gradeFilter === "all" ? true : c.section.gradeLevel === gradeFilter,
	);

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
								{classLoads.length === 1 ? "class" : "classes"} ·{" "}
								{classLoads.reduce((a, c) => a + c.studentCount, 0)}{" "}
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
					{["all", ...uniqueGrades].map((f) => (
						<button
							key={f}
							onClick={() => setGradeFilter(f)}
							className={`px-3 h-8 rounded-md text-[12.5px] font-semibold transition-colors ${
								gradeFilter === f
									? "bg-navy text-white"
									: "bg-white text-navy border border-line hover:bg-surface"
							}`}
						>
							{f === "all" ? "All" : f}
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

			<CreateClassModal
				open={newOpen}
				onClose={() => setNewOpen(false)}
			/>
		</div>
	);
}

export function PageClassDetail() {
	const navigate = useNavigate();
	const { classId } = useParams({ strict: false }) as { classId: string };
	const [tab, setTab] = useState("overview");

	const [settingsOpen, setSettingsOpen] = useState(false);
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
							<Icon name="arrow-left" size={12} /> Back to My Classes
						</button>
						<div className="flex items-center gap-2 flex-wrap">
							<SubjectChip subject={cls.subject.name} />
							<QuarterBadge quarter={cls.quarter} />
							{cls.roomNumber && (
								<span
									className="pill"
									style={{ background: "#F1F5F9", color: "#334155" }}
								>
									<Icon name="map-pin" size={11} />
									{cls.roomNumber}
								</span>
							)}
							{cls.scheduleTime && (
								<span
									className="pill"
									style={{ background: "#F1F5F9", color: "#334155" }}
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
						<Btn variant="secondary" size="sm" icon="settings" onClick={() => setSettingsOpen(true)}>
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
					{ id: "overview", label: "Overview", icon: "layout-dashboard" },
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
			{tab === "attendance" && <ClassAttendanceTab classId={classId} cls={cls} />}
			{tab === "reports" && (
				<ClassReportsTab
					studentCount={cls.studentCount}
					quarter={cls.quarter}
				/>
			)}

			{cls && (
				<ClassSettingsModal
					open={settingsOpen}
					onClose={() => setSettingsOpen(false)}
					cls={cls}
				/>
			)}
		</div>
	);
}
