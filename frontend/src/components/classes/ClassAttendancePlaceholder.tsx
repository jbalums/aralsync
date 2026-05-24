import { Card, Icon } from "..";

export function ClassAttendancePlaceholder() {
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
