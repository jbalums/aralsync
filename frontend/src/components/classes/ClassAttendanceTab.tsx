import { useMemo, useState } from "react";
import { Avatar, Card, Icon, SectionHeader, Skeleton } from "..";
import type { ClassLoadListItem, Session } from "../../shared/types";
import { useClassLoadStudents } from "../../modules/classrooms/useClassLoads";
import {
	useAttendanceSummary,
	useAttendanceByDate,
} from "../../modules/attendance/useAttendance";

interface ClassAttendanceTabProps {
	classId: string;
	cls: ClassLoadListItem;
}

const STATUS_COLORS: Record<string, string> = {
	present: "bg-emerald-50 text-emerald-700",
	late: "bg-amber-50 text-amber-700",
	absent: "bg-rose-50 text-rose-700",
	excused: "bg-slate-100 text-slate-600",
};

const RATE_COLOR = (rate: number) => {
	if (rate >= 90) return "bg-emerald-50 text-emerald-700";
	if (rate >= 75) return "bg-amber-50 text-amber-700";
	return "bg-rose-50 text-rose-700";
};

export function ClassAttendanceTab({ classId, cls }: ClassAttendanceTabProps) {
	const [view, setView] = useState<"summary" | "byDate">("summary");
	const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
	const [session, setSession] = useState<Session>("AM");

	const { data: students = [], isLoading: studentsLoading } =
		useClassLoadStudents(classId);
	const { data: summaryRows = [], isLoading: summaryLoading } =
		useAttendanceSummary(classId);
	const { data: dayRecords = [], isLoading: dayLoading } =
		useAttendanceByDate(classId, date, session);

	const studentMap = useMemo(
		() => new Map(students.map((s) => [s.id, s])),
		[students],
	);

	const classAvgRate =
		summaryRows.length > 0
			? Math.round(
					summaryRows.reduce((a, r) => a + r.rate, 0) / summaryRows.length,
				)
			: 0;

	const perfectCount = summaryRows.filter((r) => r.rate === 100).length;
	const atRiskCount = summaryRows.filter((r) => r.rate < 85).length;

	const sortedSummary = useMemo(
		() => [...summaryRows].sort((a, b) => a.rate - b.rate),
		[summaryRows],
	);

	const isLoading = studentsLoading || summaryLoading;

	return (
		<div className="space-y-4">
			{/* View toggle */}
			<div className="flex items-center gap-2">
				<button
					onClick={() => setView("summary")}
					className={`px-3 h-8 rounded-md text-[12.5px] font-semibold transition-colors ${
						view === "summary"
							? "bg-navy text-white"
							: "bg-white text-navy border border-line hover:bg-surface"
					}`}
				>
					Summary
				</button>
				<button
					onClick={() => setView("byDate")}
					className={`px-3 h-8 rounded-md text-[12.5px] font-semibold transition-colors ${
						view === "byDate"
							? "bg-navy text-white"
							: "bg-white text-navy border border-line hover:bg-surface"
					}`}
				>
					By Date
				</button>
			</div>

			{view === "summary" && (
				<>
					{/* Class-level stats */}
					{summaryRows.length > 0 && (
						<div className="flex items-center gap-3 flex-wrap">
							<div className="rounded-md border border-line bg-white px-4 py-2.5 flex items-center gap-2.5">
								<Icon name="check-circle" size={14} className="text-emerald-600" />
								<span className="text-[12.5px] text-muted">Class avg</span>
								<span
									className={`pill text-[11.5px] font-semibold ${RATE_COLOR(classAvgRate)}`}
								>
									{classAvgRate}%
								</span>
							</div>
							<div className="rounded-md border border-line bg-white px-4 py-2.5 flex items-center gap-2.5">
								<Icon name="star" size={14} className="text-amber-500" />
								<span className="text-[12.5px] text-muted">Perfect attendance</span>
								<span className="pill text-[11.5px] font-semibold bg-emerald-50 text-emerald-700">
									{perfectCount}
								</span>
							</div>
							<div className="rounded-md border border-line bg-white px-4 py-2.5 flex items-center gap-2.5">
								<Icon name="alert-triangle" size={14} className="text-rose-500" />
								<span className="text-[12.5px] text-muted">At risk (&lt;85%)</span>
								<span className="pill text-[11.5px] font-semibold bg-rose-50 text-rose-700">
									{atRiskCount}
								</span>
							</div>
						</div>
					)}

					<Card className="overflow-hidden">
						<div className="px-4 py-3 border-b border-line">
							<SectionHeader
								title="Attendance summary"
								subtitle={`${cls.quarter} · all sessions · sorted by rate`}
							/>
						</div>

						{isLoading ? (
							<div className="p-4 space-y-2">
								{[1, 2, 3, 4, 5].map((i) => (
									<Skeleton key={i} className="h-10" />
								))}
							</div>
						) : summaryRows.length === 0 ? (
							<div className="p-10 text-center">
								<Icon
									name="clipboard-check"
									size={28}
									className="text-muted mx-auto mb-2"
								/>
								<p className="text-[13px] text-muted">
									No attendance recorded yet for this class.
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-[12.5px]">
									<thead className="bg-surface text-muted text-left">
										<tr>
											<th className="px-3 py-2 font-semibold w-10">#</th>
											<th className="px-3 py-2 font-semibold">Student</th>
											<th className="px-3 py-2 font-semibold text-right">
												Present
											</th>
											<th className="px-3 py-2 font-semibold text-right">
												Late
											</th>
											<th className="px-3 py-2 font-semibold text-right">
												Absent
											</th>
											<th className="px-3 py-2 font-semibold text-right">
												Excused
											</th>
											<th className="px-3 py-2 font-semibold text-right">
												Total
											</th>
											<th className="px-3 py-2 font-semibold text-right">
												Rate
											</th>
										</tr>
									</thead>
									<tbody>
										{sortedSummary.map((row, i) => {
											const student = studentMap.get(row.studentId);
											const name = student
												? `${student.lastName}, ${student.firstName}${student.middleName ? ` ${student.middleName.slice(0, 1)}.` : ""}`
												: row.studentId;
											return (
												<tr
													key={row.studentId}
													className="border-t border-line hover:bg-slate-50/40"
												>
													<td className="px-3 py-2 font-mono text-muted">
														{i + 1}
													</td>
													<td className="px-3 py-2">
														<div className="flex items-center gap-2.5">
															{student && (
																<Avatar
																	name={`${student.firstName} ${student.lastName}`}
																	size="sm"
																/>
															)}
															<span className="font-semibold text-navy">
																{name}
															</span>
														</div>
													</td>
													<td className="px-3 py-2 text-right text-emerald-700 font-mono">
														{row.present}
													</td>
													<td className="px-3 py-2 text-right text-amber-700 font-mono">
														{row.late}
													</td>
													<td className="px-3 py-2 text-right text-rose-700 font-mono">
														{row.absent}
													</td>
													<td className="px-3 py-2 text-right text-slate-600 font-mono">
														{row.excused}
													</td>
													<td className="px-3 py-2 text-right text-muted font-mono">
														{row.total}
													</td>
													<td className="px-3 py-2 text-right">
														<span
															className={`pill text-[11.5px] font-semibold ${RATE_COLOR(row.rate)}`}
														>
															{row.rate}%
														</span>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</Card>
				</>
			)}

			{view === "byDate" && (
				<>
					{/* Controls */}
					<Card className="p-4">
						<div className="flex flex-wrap items-center gap-3">
							<div className="flex items-center gap-2">
								<Icon name="calendar" size={14} className="text-muted" />
								<input
									type="date"
									value={date}
									onChange={(e) => setDate(e.target.value)}
									className="h-9 px-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none"
								/>
							</div>
							<div className="flex items-center gap-1 rounded-md border border-line overflow-hidden">
								{(["AM", "PM"] as Session[]).map((s) => (
									<button
										key={s}
										onClick={() => setSession(s)}
										className={`px-4 h-9 text-[12.5px] font-semibold transition-colors ${
											session === s
												? "bg-navy text-white"
												: "bg-white text-navy hover:bg-surface"
										}`}
									>
										{s}
									</button>
								))}
							</div>
							{!dayLoading && (
								<span className="ml-auto text-[12px] text-muted">
									{dayRecords.length} record
									{dayRecords.length !== 1 ? "s" : ""}
								</span>
							)}
						</div>
					</Card>

					<Card className="overflow-hidden">
						{dayLoading || studentsLoading ? (
							<div className="p-4 space-y-2">
								{[1, 2, 3, 4, 5].map((i) => (
									<Skeleton key={i} className="h-10" />
								))}
							</div>
						) : dayRecords.length === 0 ? (
							<div className="p-10 text-center">
								<Icon
									name="calendar-x"
									size={28}
									className="text-muted mx-auto mb-2"
								/>
								<p className="text-[13px] text-muted">
									No attendance recorded for this date and session.
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-[12.5px]">
									<thead className="bg-surface text-muted text-left">
										<tr>
											<th className="px-3 py-2 font-semibold w-10">#</th>
											<th className="px-3 py-2 font-semibold">Student</th>
											<th className="px-3 py-2 font-semibold">Status</th>
										</tr>
									</thead>
									<tbody>
										{dayRecords.map((rec, i) => {
											const student = studentMap.get(rec.studentId);
											const name = student
												? `${student.lastName}, ${student.firstName}${student.middleName ? ` ${student.middleName.slice(0, 1)}.` : ""}`
												: rec.studentId;
											return (
												<tr
													key={rec.id}
													className="border-t border-line hover:bg-slate-50/40"
												>
													<td className="px-3 py-2 font-mono text-muted">
														{i + 1}
													</td>
													<td className="px-3 py-2">
														<div className="flex items-center gap-2.5">
															{student && (
																<Avatar
																	name={`${student.firstName} ${student.lastName}`}
																	size="sm"
																/>
															)}
															<span className="font-semibold text-navy">
																{name}
															</span>
														</div>
													</td>
													<td className="px-3 py-2">
														<span
															className={`pill text-[11.5px] capitalize font-semibold ${STATUS_COLORS[rec.status] ?? "bg-slate-100 text-slate-600"}`}
														>
															{rec.status}
														</span>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</Card>
				</>
			)}
		</div>
	);
}
