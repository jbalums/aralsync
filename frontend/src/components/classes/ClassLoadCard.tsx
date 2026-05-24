import React from "react";
import { Avatar, Card, Btn, QuarterBadge, Icon, SubjectChip, ComponentWeightBar } from "..";
import type { ClassLoadListItem } from "../../shared/types";
import { subjectHue } from "./subjectColors";

interface ClassLoadCardProps {
	load: ClassLoadListItem;
	onView: () => void;
	onAttendance: () => void;
}

export function ClassLoadCard({ load, onView, onAttendance }: ClassLoadCardProps) {
	const hue = subjectHue(load.subject.name);
	void hue;

	return (
		<Card
			variant="interactive"
			className="overflow-hidden border border-primary/30 shadow-md"
			onClick={onView}
		>
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
