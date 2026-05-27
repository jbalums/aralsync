import { useMemo } from "react";
import { StatCard, Card, SectionHeader, Icon, Progress } from "..";
import type { ClassLoadListItem } from "../../shared/types";
import { useAttendanceSummary } from "../../modules/attendance/useAttendance";
import { useQuarterlyGrades } from "../../modules/gradebook/useGradebook";
import { useSyncStore } from "../../modules/sync/syncStore";

interface ClassOverviewTabProps {
	cls: ClassLoadListItem;
}

export function ClassOverviewTab({ cls }: ClassOverviewTabProps) {
	const { data: summaryRows = [] } = useAttendanceSummary(cls.id);
	const { data: quarterlyGrades = [] } = useQuarterlyGrades(cls.id, cls.quarter);
	const queueCount = useSyncStore((s) => s.queueCount);

	const avgRate = useMemo(
		() =>
			summaryRows.length > 0
				? Math.round(summaryRows.reduce((a, r) => a + r.rate, 0) / summaryRows.length)
				: null,
		[summaryRows],
	);

	const avgGrade = useMemo(
		() =>
			quarterlyGrades.length > 0
				? (
						quarterlyGrades.reduce((a, r) => a + r.transmutedGrade, 0) /
						quarterlyGrades.length
					).toFixed(1)
				: null,
		[quarterlyGrades],
	);

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
					value={avgRate !== null ? `${avgRate}%` : "-"}
					color="accent"
					sub={
						summaryRows.length > 0
							? `${summaryRows.length} students tracked`
							: "Not yet taken"
					}
				/>
				<StatCard
					icon="graduation-cap"
					label="Avg grade"
					value={avgGrade ?? "-"}
					color="blue"
					sub={avgGrade ? `${cls.quarter} transmuted` : "No grades yet"}
				/>
				<StatCard
					icon="cloud-off"
					label="Pending sync"
					value={queueCount}
					color="amber"
					sub={queueCount === 0 ? "Up to date" : "Queued for sync"}
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
