// @ts-nocheck
import React, {
	useState,
	useEffect,
	useMemo,
	useRef,
	useCallback,
	Fragment,
} from "react";
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

// ─── ATTENDANCE — the core page ──────────────────────────

export function PageAttendance({
	online,
	pending,
	setPending,
	selectedClassId,
	setSelectedClass,
}) {
	const cls = useMemo(
		() => CLASSES.find((c) => c.id === selectedClassId) || CLASSES[0],
		[selectedClassId],
	);
	const allStudents = STUDENTS_RIZAL; // we use the rich Rizal section roster as the live class
	// limit to actual class size
	const roster = useMemo(
		() => allStudents.slice(0, cls.count),
		[cls.count, allStudents],
	);
	const toast = useToast();
	const [session, setSession] = useState("AM");
	const [marks, setMarks] = useState(() => seedMarks(roster));
	const [focusIdx, setFocusIdx] = useState(0);
	const [saved, setSaved] = useState(false);
	const [summaryOpen, setSummaryOpen] = useState(false);

	// when class changes, reseed marks
	useEffect(() => {
		setMarks(seedMarks(roster));
		setSaved(false);
	}, [cls.id]);

	function seedMarks(list) {
		// start most as Present (pre-suggest from previous days), some unmarked
		const m = {};
		list.forEach((s, i) => {
			// Seed about 60% Present, then a few late/absent/excused and ~ unmarked rest
			if (i < 32) m[s.lrn] = "present";
			else if (i === 32) m[s.lrn] = "late";
			else if (i === 33) m[s.lrn] = "late";
			else if (i === 34) m[s.lrn] = "absent";
			else if (i === 35) m[s.lrn] = "excused";
			else if (i === 36) m[s.lrn] = "excused";
			// remaining unmarked
		});
		return m;
	}

	const tally = useMemo(() => {
		const t = { present: 0, late: 0, absent: 0, excused: 0, unmarked: 0 };
		roster.forEach((s) => {
			const m = marks[s.lrn];
			if (m) t[m]++;
			else t.unmarked++;
		});
		return t;
	}, [marks, roster]);

	const total = roster.length;
	const markedPct = total ? ((total - tally.unmarked) / total) * 100 : 0;

	const setMark = (lrn, status) => {
		setMarks((prev) => ({
			...prev,
			[lrn]: prev[lrn] === status ? undefined : status,
		}));
		setSaved(false);
	};

	const bulkMarkRemainingPresent = () => {
		setMarks((prev) => {
			const next = { ...prev };
			roster.forEach((s) => {
				if (!next[s.lrn]) next[s.lrn] = "present";
			});
			return next;
		});
		setSaved(false);
		toast.push({
			type: "info",
			message: `Marked ${tally.unmarked} unmarked students as Present`,
		});
	};

	const clearAll = () => {
		setMarks({});
		setSaved(false);
	};

	// Keyboard shortcuts
	useEffect(() => {
		const handler = (e) => {
			if (
				e.target &&
				(e.target.tagName === "INPUT" ||
					e.target.tagName === "TEXTAREA" ||
					e.target.tagName === "SELECT")
			)
				return;
			const k = e.key.toLowerCase();
			if (k === "arrowdown") {
				e.preventDefault();
				setFocusIdx((i) => Math.min(roster.length - 1, i + 1));
			} else if (k === "arrowup") {
				e.preventDefault();
				setFocusIdx((i) => Math.max(0, i - 1));
			} else if (["p", "l", "a", "e"].includes(k)) {
				const map = {
					p: "present",
					l: "late",
					a: "absent",
					e: "excused",
				};
				const s = roster[focusIdx];
				if (s) setMark(s.lrn, map[k]);
			} else if (k === " ") {
				e.preventDefault();
				const s = roster[focusIdx];
				if (s)
					setMark(
						s.lrn,
						marks[s.lrn] === "present" ? undefined : "present",
					);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [focusIdx, roster, marks]);

	const handleSave = () => {
		setSaved(true);
		setPending((p) => p + (online ? 0 : 1));
		toast.push({
			type: "success",
			title: "Attendance saved",
			message: online
				? `${total} records uploaded to cloud.`
				: `${total} records saved locally — will sync when online.`,
		});
		if (online) {
			setTimeout(
				() =>
					toast.push({ type: "info", message: "Synced to cloud ✓" }),
				800,
			);
		}
	};

	const c = SUBJECT_COLORS[cls.subject];

	return (
		<div className="page-anim flex flex-col gap-3 -m-4 sm:-m-6 -mt-4 sm:-mt-6 relative">
			{/* Sticky top bar */}
			<div className="sticky -top-10 z-20 bg-blue-200 border-b border-line px-4 sm:px-6 py-3">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-3 flex-wrap">
						<div className="relative">
							<Select
								value={cls.id}
								onChange={(e) =>
									setSelectedClass(e.target.value)
								}
								className="h-10 pr-9 font-semibold text-[13px] min-w-[260px]"
							>
								{CLASSES.map((cc) => (
									<option key={cc.id} value={cc.id}>
										{cc.subject} · {cc.grade} – {cc.section}
									</option>
								))}
							</Select>
						</div>
						<span className="hidden md:inline-flex items-center gap-1.5 text-[12px] text-muted">
							<Icon name="calendar" size={14} /> {TODAY.weekday},{" "}
							{TODAY.dateLabel}
						</span>
						<div className="inline-flex rounded-md border border-line bg-white overflow-hidden">
							{["AM", "PM"].map((s) => (
								<button
									key={s}
									onClick={() => setSession(s)}
									className={`px-3 h-9 text-[12.5px] font-semibold tx ${session === s ? "bg-navy text-white" : "text-navy hover:bg-surface"}`}
								>
									{s} session
								</button>
							))}
						</div>
					</div>
					<div className="flex items-center gap-2">
						<span
							className="pill"
							style={{
								background: online ? "#ECFDF5" : "#FFFBEB",
								color: online ? "#065F46" : "#92400E",
							}}
						>
							<span
								className="dot"
								style={{
									background: online ? "#10B981" : "#F59E0B",
								}}
							/>
							{online
								? "Online — auto-sync on save"
								: "Offline — saving locally"}
						</span>
						<div className="flex items-center gap-2">
							<Btn
								variant="secondary"
								icon="list"
								onClick={() => setSummaryOpen(true)}
							>
								Summary
							</Btn>
							<Btn
								variant="primary"
								icon={saved ? "check-circle" : "save"}
								onClick={handleSave}
							>
								{saved
									? online
										? "Synced"
										: "Saved locally"
									: "Save & Sync"}
							</Btn>
						</div>
					</div>
				</div>

				{/* Progress bar (segmented) */}
				<div className="mt-3 flex flex-col gap-2">
					<div className="flex items-center justify-between text-[12px] text-muted">
						<span>
							<span className="font-semibold text-navy">
								{total - tally.unmarked}
							</span>{" "}
							of {total} marked ·{" "}
							<span className="font-mono">
								{markedPct.toFixed(0)}%
							</span>
						</span>
						<div className="flex items-center gap-3 flex-wrap">
							<span className="flex items-center gap-1 font-semibold">
								<span
									className="dot"
									style={{ background: "#10B981" }}
								/>
								{tally.present}{" "}
								<span className="text-muted font-normal">
									Present
								</span>
							</span>
							<span className="flex items-center gap-1 font-semibold">
								<span
									className="dot"
									style={{ background: "#F59E0B" }}
								/>
								{tally.late}{" "}
								<span className="text-muted font-normal">
									Late
								</span>
							</span>
							<span className="flex items-center gap-1 font-semibold">
								<span
									className="dot"
									style={{ background: "#EF4444" }}
								/>
								{tally.absent}{" "}
								<span className="text-muted font-normal">
									Absent
								</span>
							</span>
							<span className="flex items-center gap-1 font-semibold">
								<span
									className="dot"
									style={{ background: "#8B5CF6" }}
								/>
								{tally.excused}{" "}
								<span className="text-muted font-normal">
									Excused
								</span>
							</span>
						</div>
					</div>
					<div className="flex w-full h-2 rounded-full overflow-hidden bg-slate-100">
						<div
							style={{
								width: `${(tally.present / total) * 100}%`,
								background: "#10B981",
							}}
						/>
						<div
							style={{
								width: `${(tally.late / total) * 100}%`,
								background: "#F59E0B",
							}}
						/>
						<div
							style={{
								width: `${(tally.absent / total) * 100}%`,
								background: "#EF4444",
							}}
						/>
						<div
							style={{
								width: `${(tally.excused / total) * 100}%`,
								background: "#8B5CF6",
							}}
						/>
					</div>
				</div>

				{/* Bulk action bar */}
				{tally.unmarked > 0 && (
					<div className="mt-3 flex items-center justify-between gap-2 bg-primary-light/40 border border-primary-light rounded-md px-3 py-2">
						<div className="text-[12.5px] text-primary-dark">
							<span className="font-semibold">
								{tally.unmarked} students unmarked
							</span>{" "}
							— common shortcut:
						</div>
						<div className="flex items-center gap-2">
							<Btn
								size="sm"
								variant="soft"
								icon="check"
								onClick={bulkMarkRemainingPresent}
							>
								Mark remaining as Present
							</Btn>
							<Btn
								size="sm"
								variant="ghost"
								icon="rotate-ccw"
								onClick={clearAll}
							>
								Clear all
							</Btn>
						</div>
					</div>
				)}
			</div>

			{/* Body: Roster + sidebar (lg) */}
			<div className="px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 pb-32 lg:pb-8 relative">
				{/* Roster list */}
				<div>
					<Card className="overflow-hidden">
						<div className="px-4 py-3 border-b border-line flex items-center gap-2 bg-surface/50">
							<SubjectChip subject={cls.subject} />
							<span className="text-[13px] font-semibold text-navy">
								{cls.grade} – {cls.section}
							</span>
							<span className="text-[12px] text-muted">
								· {cls.room} · {cls.time}
							</span>
							<span className="ml-auto text-[12px] text-muted">
								{total} students · alphabetical by last name
							</span>
						</div>
						<ul className="divide-y divide-line">
							{[...roster]
								.sort((a, b) => a.last.localeCompare(b.last))
								.map((s, idx) => {
									const mark = marks[s.lrn];
									const isFocus = focusIdx === idx;
									return (
										<li
											key={s.lrn}
											onClick={() => setFocusIdx(idx)}
											className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 min-h-[64px] tx ${idx % 2 === 1 ? "bg-slate-50/40" : ""} ${isFocus ? "ring-2 ring-primary/40 ring-inset" : ""}`}
										>
											<span className="w-6 text-center text-[11px] font-mono text-muted">
												{idx + 1}
											</span>
											<Avatar
												name={`${s.first} ${s.last}`}
												size="md"
											/>
											<div className="flex-1 min-w-0">
												<div className="text-[14px] font-semibold text-navy leading-tight truncate">
													{s.last}, {s.first} {s.mi}.
												</div>
												<div className="text-[11px] text-muted font-mono">
													LRN ••• {s.lrn.slice(-4)} ·
													Att {s.att}%
												</div>
											</div>
											{/* Status buttons */}
											<div className="flex items-center gap-1.5">
												{[
													{
														v: "present",
														i: "check",
														t: "P",
													},
													{
														v: "late",
														i: "clock-3",
														t: "L",
													},
													{
														v: "absent",
														i: "x",
														t: "A",
													},
													{
														v: "excused",
														i: "shield-check",
														t: "E",
													},
												].map((b) => {
													const active = mark === b.v;
													const tone =
														BADGE_STYLES[b.v];
													return (
														<button
															key={b.v}
															onClick={(e) => {
																e.stopPropagation();
																setMark(
																	s.lrn,
																	b.v,
																);
															}}
															className={`w-10 h-10 sm:w-11 sm:h-11 rounded-md border press tx flex flex-col items-center justify-center text-[10px] font-bold ${active ? "shadow-sm" : "border-line bg-white hover:bg-surface"}`}
															style={
																active
																	? {
																			background:
																				tone.bg,
																			color: tone.fg,
																			borderColor:
																				tone.dot,
																		}
																	: {}
															}
															aria-label={`Mark ${b.v}`}
															title={`${b.v} (${b.t})`}
														>
															<Icon
																name={b.i}
																size={14}
															/>
															<span className="mt-0.5">
																{b.t}
															</span>
														</button>
													);
												})}
											</div>
										</li>
									);
								})}
						</ul>
					</Card>
					<Card className="mt-4 p-4">
						<div className="flex items-center justify-between gap-3 max-w-screen-2xl mx-auto">
							<div className="flex items-center gap-2 text-[12.5px] text-muted">
								<Icon
									name="alert-circle"
									size={14}
									className="text-amber-600"
								/>
								<span>
									<span className="font-semibold text-navy">
										{tally.unmarked}
									</span>{" "}
									unmarked
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Btn
									variant="ghost"
									icon="list"
									onClick={() => setSummaryOpen(true)}
								>
									Summary
								</Btn>
								<Btn
									variant="primary"
									size="lg"
									icon={saved ? "check-circle" : "save"}
									onClick={handleSave}
								>
									{saved
										? online
											? "Synced"
											: "Saved locally"
										: "Save & Sync"}
								</Btn>
							</div>
						</div>
					</Card>
				</div>

				{/* Sidebar (desktop) */}
				<aside className="hidden lg:flex flex-col gap-4 sticky top-[200px] self-start">
					<Card className="p-4">
						<SectionHeader
							title="Live summary"
							subtitle="Updates as you mark"
						/>
						<div className="grid grid-cols-2 gap-2">
							{[
								{ k: "present", v: tally.present },
								{ k: "late", v: tally.late },
								{ k: "absent", v: tally.absent },
								{ k: "excused", v: tally.excused },
							].map((r) => {
								const s = BADGE_STYLES[r.k];
								return (
									<div
										key={r.k}
										className="rounded-md p-3"
										style={{
											background: s.bg,
											color: s.fg,
										}}
									>
										<div className="text-[11px] uppercase tracking-wider font-semibold">
											{s.label}
										</div>
										<div className="text-[24px] font-semibold mt-1 leading-none">
											{r.v}
										</div>
									</div>
								);
							})}
						</div>
						<div className="mt-3 rounded-md border border-dashed border-line p-3 text-[12px] text-muted text-center">
							<span className="font-semibold text-navy">
								{tally.unmarked}
							</span>{" "}
							still unmarked
						</div>
					</Card>

					<Card className="p-4">
						<SectionHeader
							title="Quick shortcuts"
							subtitle="Hover focuses a row · then press"
						/>
						<ul className="space-y-1.5 text-[12.5px]">
							{[
								{
									k: "P",
									label: "Mark Present",
									tone: "present",
								},
								{ k: "L", label: "Mark Late", tone: "late" },
								{
									k: "A",
									label: "Mark Absent",
									tone: "absent",
								},
								{
									k: "E",
									label: "Mark Excused",
									tone: "excused",
								},
								{
									k: "↑/↓",
									label: "Move between students",
									tone: "neutral",
								},
								{
									k: "Space",
									label: "Toggle present",
									tone: "neutral",
								},
							].map((r, i) => (
								<li
									key={i}
									className="flex items-center justify-between"
								>
									<span className="text-navy">{r.label}</span>
									<kbd className="font-mono text-[11px] px-1.5 py-0.5 rounded border border-line bg-white text-navy">
										{r.k}
									</kbd>
								</li>
							))}
						</ul>
					</Card>

					<Card className="p-4">
						<SectionHeader
							title="Saving offline"
							subtitle="What happens when you save"
						/>
						<ul className="space-y-2 text-[12.5px]">
							<li className="flex items-start gap-2">
								<Icon
									name="hard-drive"
									size={14}
									className="text-primary mt-0.5"
								/>
								Saved instantly to your device
							</li>
							<li className="flex items-start gap-2">
								<Icon
									name="refresh-cw"
									size={14}
									className="text-primary mt-0.5"
								/>
								Queued for sync — even mid-class
							</li>
							<li className="flex items-start gap-2">
								<Icon
									name="cloud-upload"
									size={14}
									className="text-primary mt-0.5"
								/>
								Uploads when connection returns
							</li>
						</ul>
					</Card>
				</aside>
			</div>

			<Modal
				open={summaryOpen}
				onClose={() => setSummaryOpen(false)}
				title="Attendance summary"
				subtitle={`${cls.subject} · ${cls.grade} – ${cls.section} · ${TODAY.dateLabel} (${session})`}
			>
				<div className="grid grid-cols-4 gap-3 mb-4">
					{["present", "late", "absent", "excused"].map((k) => {
						const s = BADGE_STYLES[k];
						return (
							<div
								key={k}
								className="rounded-md p-3 text-center"
								style={{ background: s.bg, color: s.fg }}
							>
								<div className="text-[11px] uppercase tracking-wider font-semibold">
									{s.label}
								</div>
								<div className="text-[24px] font-semibold mt-1 leading-none">
									{tally[k]}
								</div>
							</div>
						);
					})}
				</div>
				<div className="max-h-[300px] overflow-y-auto border border-line rounded-md">
					<table className="w-full text-[12.5px]">
						<thead className="bg-surface">
							<tr className="text-left text-muted">
								<th className="px-3 py-2 font-semibold">#</th>
								<th className="px-3 py-2 font-semibold">
									Student
								</th>
								<th className="px-3 py-2 font-semibold">LRN</th>
								<th className="px-3 py-2 font-semibold text-right">
									Status
								</th>
							</tr>
						</thead>
						<tbody>
							{[...roster]
								.sort((a, b) => a.last.localeCompare(b.last))
								.map((s, i) => {
									const m = marks[s.lrn];
									return (
										<tr
											key={s.lrn}
											className="border-t border-line/70"
										>
											<td className="px-3 py-2 font-mono text-muted">
												{i + 1}
											</td>
											<td className="px-3 py-2 text-navy">
												{s.last}, {s.first} {s.mi}.
											</td>
											<td className="px-3 py-2 font-mono text-muted">
												{s.lrn}
											</td>
											<td className="px-3 py-2 text-right">
												{m ? (
													<Badge status={m} />
												) : (
													<span className="text-muted">
														—
													</span>
												)}
											</td>
										</tr>
									);
								})}
						</tbody>
					</table>
				</div>
			</Modal>
		</div>
	);
}
