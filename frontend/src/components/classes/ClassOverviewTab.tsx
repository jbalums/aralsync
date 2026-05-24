import { StatCard, Card, SectionHeader, Icon, Progress } from "..";
import type { ClassLoadListItem } from "../../shared/types";

interface ClassOverviewTabProps {
	cls: ClassLoadListItem;
}

export function ClassOverviewTab({ cls }: ClassOverviewTabProps) {
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
