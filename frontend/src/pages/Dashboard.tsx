// @ts-nocheck
import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
	Icon,
	Avatar,
	Badge,
	Card,
	useToast,
	Skeleton,
	StatCard,
	Progress,
	ConnPill,
	Sparkbars,
	RingChart,
	SubjectChip,
	SectionHeader,
	Btn,
	BADGE_STYLES,
} from "../components";
import { SUBJECT_COLORS } from "../data/mockData";
import { useDashboardSummary } from "../modules/dashboard/useDashboard";
import { useWeeklySchedule } from "../modules/schedules/useSchedules";
import { useAuthStore } from "../modules/auth/authStore";
import { useSyncStore } from "../modules/sync/syncStore";
import { useAppContext } from "../app/AppContext";

// ─── helpers ─────────────────────────────────────────────

function greet() {
	const h = new Date().getHours();
	if (h < 12) return "Good morning";
	if (h < 18) return "Good afternoon";
	return "Good evening";
}

function todayWeekday() {
	return new Date().toLocaleDateString("en-PH", { weekday: "long" });
}

function todayDateLabel() {
	return new Date().toLocaleDateString("en-PH", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

function isoWeekNum(d = new Date()) {
	const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	const dow = date.getUTCDay() || 7;
	date.setUTCDate(date.getUTCDate() + 4 - dow);
	const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
	return Math.ceil(
		((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
	);
}

function fmtTime(h, m) {
	const period = h < 12 ? "AM" : "PM";
	const h12 = h % 12 || 12;
	return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function scheduleTimeStr(startH, startM, durMin) {
	const endTotal = startH * 60 + startM + durMin;
	return `${fmtTime(startH, startM)}–${fmtTime(Math.floor(endTotal / 60), endTotal % 60)}`;
}

function resolveStatus(startH, startM, durMin) {
	const cur = new Date().getHours() * 60 + new Date().getMinutes();
	const start = startH * 60 + startM;
	const end = start + durMin;
	if (cur > end) return "done";
	if (cur >= start) return "current";
	return "upcoming";
}

function timeAgo(iso) {
	const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
	if (diff < 60) return "Just now";
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	return `${Math.floor(diff / 86400)}d ago`;
}

function fmtLastSync(iso) {
	if (!iso) return "Never";
	const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
	if (diff < 60) return "Just now";
	if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
	return new Date(iso).toLocaleTimeString("en-PH", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

const ACTIVITY_ICONS = {
	attendance: "clipboard-check",
	grade: "graduation-cap",
	sync: "refresh-cw",
};
const FALLBACK_COLOR = { hue: "#64748B", soft: "#F1F5F9", ink: "#334155" };

// ─── DASHBOARD ───────────────────────────────────────────

export function PageDashboard() {
	const toast = useToast();
	const user = useAuthStore((s) => s.user);
	const { lastSyncAt, lanPeers } = useSyncStore();
	const online = useSyncStore((s) => s.isOnline);
	const pending = useSyncStore((s) => s.queueCount);
	const navigate = useNavigate();
	const { setSelectedClassId } = useAppContext();

	const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
	const { data: weeklySchedule = [] } = useWeeklySchedule();

	// Derived values with safe fallbacks
	const classLoads = summary?.classLoads ?? [];
	const todayAgg = summary?.todayAggregate ?? {
		present: 0,
		late: 0,
		absent: 0,
		excused: 0,
		total: 0,
	};
	const activity = summary?.recentActivity ?? [];

	const totalStudents = classLoads.reduce((a, c) => a + c.studentCount, 0);
	const avgAttendance =
		classLoads.length > 0
			? classLoads
					.filter((c) => c.todayAttendanceRate !== null)
					.reduce((sum, c) => sum + (c.todayAttendanceRate ?? 0), 0) /
				Math.max(
					classLoads.filter((c) => c.todayAttendanceRate !== null)
						.length,
					1,
				)
			: 0;
	const avgGrade =
		classLoads.length > 0
			? classLoads
					.filter((c) => c.avgGrade !== null)
					.reduce((sum, c) => sum + (c.avgGrade ?? 0), 0) /
				Math.max(
					classLoads.filter((c) => c.avgGrade !== null).length,
					1,
				)
			: 0;

	const todayPresent = todayAgg.present + todayAgg.late;
	const todayTotal = todayAgg.total;
	const pctOf = (n) =>
		todayTotal > 0 ? Math.round((n / todayTotal) * 100) : 0;

	// Today's schedule: filter by current day-of-week and map to display shape
	const todayDow = new Date().getDay(); // 0=Sun, 1=Mon ... 6=Sat
	const todayBlocks = weeklySchedule
		.filter((b) => b.dayOfWeek === todayDow)
		.map((b) => ({
			id: b.id,
			time: scheduleTimeStr(b.startH, b.startM, b.durMin),
			subject: b.title,
			section: b.section,
			room: b.room,
			status: resolveStatus(b.startH, b.startM, b.durMin),
			classId: b.classLoadId ?? b.id,
		}));

	// Next upcoming session for hero subtitle
	const nextSession = todayBlocks.find((b) => b.status === "upcoming");
	const activeQuarter = classLoads[0]?.quarter ?? "Q1";
	const shortName = user?.name?.split(" ")[0] ?? "Teacher";
	const deviceLabel = user?.deviceId?.slice(0, 8) ?? "This device";

	const openAttendance = () => {
		void navigate({ to: "/app/attendance" });
	};
	const openGradebook = () => {
		const first = classLoads[0];
		if (first) setSelectedClassId(first.id);
		void navigate({ to: "/app/gradebook" });
	};
	const setRoute = (segment) => {
		void navigate({ to: `/app/${segment}` });
	};
	const setSelectedClass = (id) => setSelectedClassId(id);
	const openClassDetail = (id) => {
		setSelectedClassId(id);
		void navigate({ to: "/app/classes/$classId", params: { classId: id } });
	};

	return (
		<div className="page-anim space-y-5">
			{/* HERO */}
			<Card className="p-5 sm:p-6 relative overflow-hidden">
				<div className="absolute inset-0 grid-bg opacity-60" />
				<div className="relative flex items-start justify-between gap-4 flex-wrap">
					<div>
						<div className="text-[12px] font-semibold text-primary uppercase tracking-[0.16em]">
							{todayWeekday()} · {activeQuarter} Week{" "}
							{isoWeekNum()} · {todayDateLabel()}
						</div>
						<h2 className="text-[26px] sm:text-[30px] font-semibold tracking-tight text-navy mt-1.5">
							{greet()}, {shortName}.
						</h2>
						<p className="text-[14px] text-muted mt-1.5 max-w-xl">
							{summaryLoading ? (
								<Skeleton className="h-4 w-72" />
							) : (
								<>
									You&apos;re teaching{" "}
									<span className="text-navy font-semibold">
										{classLoads.length}{" "}
										{classLoads.length === 1
											? "class"
											: "classes"}
									</span>{" "}
									today across{" "}
									<span className="text-navy font-semibold">
										{totalStudents} students
									</span>
									.
									{nextSession ? (
										<>
											{" "}
											Your next session is{" "}
											<span className="text-navy font-semibold">
												{nextSession.subject}
											</span>{" "}
											at{" "}
											<span className="text-navy font-semibold">
												{nextSession.time.split("–")[0]}
											</span>{" "}
											in{" "}
											<span className="text-navy font-semibold">
												{nextSession.room || "TBA"}
											</span>
											.
										</>
									) : todayBlocks.length > 0 ? (
										<> All sessions for today are done.</>
									) : (
										<> No classes scheduled for today.</>
									)}
								</>
							)}
						</p>
						<div className="mt-4 flex items-center gap-2 flex-wrap">
							<Btn
								variant="primary"
								icon="clipboard-check"
								onClick={openAttendance}
							>
								Take attendance now
							</Btn>
							<Btn
								variant="secondary"
								icon="graduation-cap"
								onClick={openGradebook}
							>
								Continue grading
							</Btn>
							<span className="hidden sm:inline-flex items-center text-[12px] text-muted ml-2">
								<Icon name="info" size={13} className="mr-1" />{" "}
								Tip: press{" "}
								<kbd className="mx-1 px-1.5 py-0.5 rounded border border-line bg-white text-[10px] font-mono">
									P
								</kbd>{" "}
								on any student row to mark present.
							</span>
						</div>
					</div>
					<div className="hidden sm:flex flex-col items-end gap-2.5">
						<Badge status="primary">
							<Icon name="cloud" size={12} />{" "}
							{online
								? "Online · auto-syncing"
								: "Offline · saving locally"}
						</Badge>
						<Card
							variant="elevated"
							className="px-4 py-3 flex items-center gap-3 bg-white/95 backdrop-blur"
						>
							<span className="w-10 h-10 rounded-md bg-primary text-white inline-flex items-center justify-center">
								<Icon
									name="refresh-cw"
									size={18}
									className={pending ? "spin-slow" : ""}
								/>
							</span>
							<div>
								<div className="text-[12px] text-muted">
									Last sync
								</div>
								<div className="text-[14px] font-semibold text-navy">
									{fmtLastSync(lastSyncAt)}
								</div>
							</div>
							<span className="w-px h-8 bg-line mx-1" />
							<div>
								<div className="text-[12px] text-muted">
									Pending
								</div>
								<div className="text-[14px] font-semibold text-amber-600">
									{pending} records
								</div>
							</div>
						</Card>
					</div>
				</div>
			</Card>

			{/* STAT ROW */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
				{summaryLoading ? (
					<>
						{[0, 1, 2, 3].map((i) => (
							<Skeleton key={i} className="h-24 rounded-xl" />
						))}
					</>
				) : (
					<>
						<StatCard
							icon="users"
							label="Students today"
							value={
								todayTotal > 0
									? `${todayPresent}/${todayTotal}`
									: `${totalStudents}`
							}
							color="primary"
							sub={`Across ${classLoads.length} section${classLoads.length !== 1 ? "s" : ""}`}
						/>
						<StatCard
							icon="check-circle"
							label="Avg attendance"
							value={
								avgAttendance > 0
									? `${Math.round(avgAttendance)}%`
									: "—"
							}
							color="accent"
							sub={activeQuarter + " · today"}
						/>
						<StatCard
							icon="graduation-cap"
							label="Avg grade"
							value={avgGrade > 0 ? avgGrade.toFixed(1) : "—"}
							color="blue"
							sub={`${activeQuarter} · ${classLoads.length} class${classLoads.length !== 1 ? "es" : ""}`}
						/>
						<StatCard
							icon="cloud-off"
							label="Pending sync"
							value={pending}
							color="amber"
							sub={
								online ? "Will sync shortly" : "Working offline"
							}
						/>
					</>
				)}
			</div>

			{/* MAIN GRID */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
				{/* Today's Schedule */}
				<Card className="lg:col-span-2 p-5">
					<SectionHeader
						title="Today's Schedule"
						subtitle={`${todayWeekday()}, ${todayDateLabel()}`}
						right={
							<Btn
								size="sm"
								variant="ghost"
								iconRight="arrow-right"
								onClick={() => setRoute("classes")}
							>
								Manage classes
							</Btn>
						}
					/>
					<div className="flex flex-col">
						{todayBlocks.length === 0 ? (
							<div className="py-8 text-center text-[13px] text-muted">
								<Icon
									name="calendar"
									size={28}
									className="mx-auto mb-2 opacity-30"
								/>
								No classes scheduled for today.
							</div>
						) : (
							todayBlocks.map((s, i) => {
								const c =
									SUBJECT_COLORS[s.subject] ?? FALLBACK_COLOR;
								const isCurrent = s.status === "current";
								const isDone = s.status === "done";
								return (
									<div
										key={s.id}
										className={`flex items-stretch gap-4 py-3.5 ${i > 0 ? "border-t border-line" : ""} ${isCurrent ? "bg-primary-light/30 -mx-5 px-5" : ""} relative`}
									>
										{isCurrent && (
											<span className="absolute left-0 top-3 bottom-3 w-0.75 rounded-r bg-primary" />
										)}
										<div className="w-20 shrink-0 flex flex-col items-start justify-center">
											<div className="text-[12px] font-mono font-semibold text-navy tracking-tight">
												{s.time.split("–")[0]}
											</div>
											<div className="text-[10px] text-muted">
												to {s.time.split("–")[1]}
											</div>
										</div>
										<span
											className="w-1 rounded-full"
											style={{ background: c.hue }}
										/>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 flex-wrap">
												<SubjectChip
													subject={s.subject}
												/>
												{isCurrent && (
													<span
														className="pill"
														style={{
															background:
																"#FFFBEB",
															color: "#92400E",
														}}
													>
														<span className="dot bg-amber-500 pulse-dot" />
														In progress
													</span>
												)}
												{isDone && (
													<span
														className="pill"
														style={{
															background:
																"#ECFDF5",
															color: "#065F46",
														}}
													>
														<span className="dot bg-emerald-500" />
														Attendance saved
													</span>
												)}
											</div>
											<div className="text-[14px] font-semibold text-navy mt-1.5">
												{s.section}
											</div>
											<div className="text-[12px] text-muted flex items-center gap-1 mt-0.5">
												<Icon
													name="map-pin"
													size={12}
												/>
												{s.room || "TBA"}
											</div>
										</div>
										<div className="hidden sm:flex items-center">
											{isDone ? (
												<Btn
													variant="ghost"
													size="sm"
													icon="eye"
													onClick={() =>
														openClassDetail(
															s.classId,
														)
													}
												>
													View
												</Btn>
											) : (
												<Btn
													variant={
														isCurrent
															? "primary"
															: "secondary"
													}
													size="sm"
													icon="clipboard-check"
													onClick={() => {
														setSelectedClass(
															s.classId,
														);
														openAttendance();
													}}
												>
													Take attendance
												</Btn>
											)}
										</div>
									</div>
								);
							})
						)}
					</div>
				</Card>

				{/* Today's Attendance */}
				<Card className="p-5">
					<SectionHeader
						title="Today's Attendance"
						subtitle="All sections, combined"
					/>
					{summaryLoading ? (
						<Skeleton className="h-40" />
					) : (
						<>
							<div className="flex items-center gap-4">
								<RingChart
									percent={
										todayTotal > 0
											? (todayPresent / todayTotal) * 100
											: 0
									}
									size={130}
									color="#0F766E"
									label="Present"
								/>
								<div className="flex-1 space-y-2.5">
									{[
										{
											k: "present",
											v: pctOf(todayAgg.present),
										},
										{ k: "late", v: pctOf(todayAgg.late) },
										{
											k: "absent",
											v: pctOf(todayAgg.absent),
										},
										{
											k: "excused",
											v: pctOf(todayAgg.excused),
										},
									].map((r, i) => {
										const s = BADGE_STYLES[r.k];
										return (
											<div
												key={i}
												className="flex items-center gap-2 text-[12.5px]"
											>
												<span
													className="dot"
													style={{
														background: s.dot,
														width: 9,
														height: 9,
													}}
												/>
												<span className="text-navy font-medium flex-1 capitalize">
													{r.k}
												</span>
												<span className="font-mono font-semibold text-navy">
													{r.v}%
												</span>
											</div>
										);
									})}
								</div>
							</div>
							<div className="text-[12px] text-muted mt-4 text-center bg-surface rounded-md py-2">
								{todayTotal > 0 ? (
									<>
										<span className="font-semibold text-navy">
											{todayPresent} of {todayTotal}
										</span>{" "}
										students present today
									</>
								) : (
									<span>
										No attendance recorded yet today
									</span>
								)}
							</div>
						</>
					)}
				</Card>

				{/* Sync Status */}
				<Card className="p-5 lg:col-span-1">
					<SectionHeader
						title="Sync Status"
						right={
							<Badge status={online ? "synced" : "pending"}>
								{online ? "Connected" : "Offline"}
							</Badge>
						}
					/>
					<div className="flex items-center gap-4">
						<div
							className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${online && pending ? "bg-primary" : "bg-amber-500"}`}
						>
							<Icon
								name={online ? "refresh-cw" : "cloud-off"}
								size={28}
								className={online && pending ? "spin-slow" : ""}
							/>
						</div>
						<div>
							<div className="text-[24px] font-semibold text-navy leading-none">
								{pending}
							</div>
							<div className="text-[12px] text-muted mt-1">
								records pending
							</div>
							<div className="text-[12px] text-muted">
								Last sync · {fmtLastSync(lastSyncAt)}
							</div>
						</div>
					</div>
					<div className="mt-4 flex items-center gap-2 text-[11px] text-muted">
						<span
							className="pill"
							style={{ background: "#F1F5F9", color: "#334155" }}
						>
							<Icon name="tablet" size={10} /> {deviceLabel}
						</span>
						{lanPeers > 0 && (
							<span
								className="pill"
								style={{
									background: "#EDE9FE",
									color: "#4C1D95",
								}}
							>
								<Icon name="wifi" size={10} /> {lanPeers} LAN
								peer{lanPeers !== 1 ? "s" : ""}
							</span>
						)}
					</div>
					<Btn
						variant={online ? "primary" : "soft"}
						className="w-full mt-4"
						icon="cloud-upload"
						onClick={() =>
							toast.push({
								type: "success",
								title: "Sync started",
								message: `Uploading ${pending} pending records…`,
							})
						}
					>
						{online ? "Sync Now" : "Will sync when online"}
					</Btn>
				</Card>

				{/* Gradebook Progress */}
				<Card className="p-5 lg:col-span-2">
					<SectionHeader
						title="Gradebook Progress"
						subtitle={`${activeQuarter} · component entries completed`}
						right={
							<Btn
								size="sm"
								variant="ghost"
								iconRight="arrow-right"
								onClick={openGradebook}
							>
								Open gradebook
							</Btn>
						}
					/>
					{summaryLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{[0, 1].map((i) => (
								<Skeleton key={i} className="h-28 rounded-md" />
							))}
						</div>
					) : classLoads.length === 0 ? (
						<div className="py-6 text-center text-[13px] text-muted">
							No class loads found. Create a class to get started.
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{classLoads.map((c) => {
								const { ww, pt, qa } = c.gradebookProgress;
								const wwPct =
									ww[1] > 0 ? (ww[0] / ww[1]) * 100 : 0;
								const ptPct =
									pt[1] > 0 ? (pt[0] / pt[1]) * 100 : 0;
								const qaPct =
									qa[1] > 0 ? (qa[0] / qa[1]) * 100 : 0;
								return (
									<div
										key={c.id}
										className="border border-line rounded-md p-3.5"
									>
										<div className="flex items-center gap-2 mb-3">
											<SubjectChip subject={c.subject} />
											<span className="text-[12px] text-muted">
												{c.gradeLevel} · {c.section}
											</span>
										</div>
										{[
											{
												label: "WW",
												n: ww,
												pct: wwPct,
												color: "bg-teal-500",
											},
											{
												label: "PT",
												n: pt,
												pct: ptPct,
												color: "bg-emerald-500",
											},
											{
												label: "QA",
												n: qa,
												pct: qaPct,
												color: "bg-indigo-500",
											},
										].map((row, i) => (
											<div
												key={i}
												className="flex items-center gap-2 mb-1.5 last:mb-0"
											>
												<span className="w-7 text-[11px] font-semibold text-muted">
													{row.label}
												</span>
												<Progress
													value={row.pct}
													className="flex-1"
													barClass={row.color}
												/>
												<span className="text-[11px] font-mono text-muted w-10 text-right">
													{row.n[0]}/{row.n[1]}
												</span>
											</div>
										))}
									</div>
								);
							})}
						</div>
					)}
				</Card>

				{/* Recent Activity */}
				<Card className="p-5">
					<SectionHeader title="Recent Activity" />
					{summaryLoading ? (
						<div className="space-y-3">
							{[0, 1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-10" />
							))}
						</div>
					) : activity.length === 0 ? (
						<div className="py-6 text-center text-[13px] text-muted">
							No recent activity yet.
						</div>
					) : (
						<div className="space-y-3">
							{activity.slice(0, 6).map((a, i) => {
								const tones = {
									primary: "bg-primary-light text-primary",
									accent: "bg-emerald-100 text-emerald-700",
									warning: "bg-amber-100 text-amber-700",
									muted: "bg-slate-100 text-slate-600",
								};
								return (
									<div
										key={i}
										className="flex items-start gap-3"
									>
										<span
											className={`w-7 h-7 shrink-0 rounded-md inline-flex items-center justify-center ${tones[a.tone] ?? tones.muted}`}
										>
											<Icon
												name={
													ACTIVITY_ICONS[a.type] ??
													"activity"
												}
												size={14}
											/>
										</span>
										<div className="flex-1 min-w-0">
											<div className="text-[13px] text-navy">
												{a.label}
											</div>
											<div className="text-[11px] text-muted mt-0.5">
												{timeAgo(a.when)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</Card>

				{/* Class Performance Sparklines */}
				<Card className="p-5 lg:col-span-2">
					<SectionHeader
						title="Class performance — last 4 weeks"
						subtitle="Attendance trend per class"
						right={
							<div className="flex items-center gap-3 text-[11px] text-muted">
								<span className="flex items-center gap-1">
									<span className="w-2 h-2 rounded-sm bg-slate-400" />{" "}
									Prior weeks
								</span>
								<span className="flex items-center gap-1">
									<span className="w-2 h-2 rounded-sm bg-primary" />{" "}
									Latest
								</span>
							</div>
						}
					/>
					{summaryLoading ? (
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
							{[0, 1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-24 rounded-md" />
							))}
						</div>
					) : classLoads.length === 0 ? (
						<div className="py-6 text-center text-[13px] text-muted">
							No class loads to display.
						</div>
					) : (
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
							{classLoads.map((c) => {
								const trend = c.weeklyTrend.map((v) => v ?? 0);
								const latestRate =
									c.todayAttendanceRate ??
									c.weeklyTrend
										.filter(Boolean)
										.slice(-1)[0] ??
									0;
								return (
									<div
										key={c.id}
										className="rounded-md border border-line p-3.5 hover:shadow-md tx cursor-pointer"
										onClick={() => openClassDetail(c.id)}
									>
										<div className="flex items-center justify-between">
											<SubjectChip subject={c.subject} />
											<span className="text-[13px] font-semibold text-navy font-mono">
												{latestRate > 0
													? `${latestRate}%`
													: "—"}
											</span>
										</div>
										<div className="text-[12px] text-muted mt-1">
											{c.gradeLevel} · {c.section}
										</div>
										<div className="mt-3 flex items-end justify-between">
											<Sparkbars
												values={trend}
												height={30}
											/>
											<div className="text-right">
												<div className="text-[10px] text-muted uppercase tracking-wider">
													avg gr.
												</div>
												<div className="text-[14px] font-semibold text-navy">
													{c.avgGrade != null
														? c.avgGrade
														: "—"}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}
