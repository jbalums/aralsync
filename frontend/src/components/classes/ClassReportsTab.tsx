import { Card, Icon, Badge, Btn } from "..";

interface ClassReportsTabProps {
	studentCount: number;
	quarter: string;
}

export function ClassReportsTab({ studentCount, quarter }: ClassReportsTabProps) {
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
								{r.code && <Badge status="primary">{r.code}</Badge>}
							</div>
							<p className="text-[12px] text-muted mt-0.5">{r.desc}</p>
							<div className="mt-3 flex items-center gap-2">
								<Btn variant="secondary" size="sm" icon="eye">
									Preview
								</Btn>
								<Btn variant="primary" size="sm" icon="download">
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
