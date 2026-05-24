// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Avatar, Card, Icon, Skeleton } from "..";
import { useClassLoadStudents } from "../../modules/classrooms/useClassLoads";

interface ClassStudentsTabProps {
	classId: string;
}

export function ClassStudentsTab({ classId }: ClassStudentsTabProps) {
	const [q, setQ] = useState("");
	const { data: students = [], isLoading } = useClassLoadStudents(classId);
	const navigate = useNavigate();

	const filtered = students.filter(
		(s) =>
			!q ||
			`${s.lastName} ${s.firstName}`
				.toLowerCase()
				.includes(q.toLowerCase()) ||
			s.lrn.includes(q),
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
						placeholder="Search name or LRN…"
						className="w-full h-9 pl-9 pr-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none"
					/>
				</div>
				<span className="ml-auto text-[12px] text-muted">
					{filtered.length} students
				</span>
			</div>

			{isLoading ? (
				<div className="p-4 space-y-2">
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} className="h-10" />
					))}
				</div>
			) : filtered.length === 0 ? (
				<div className="p-8 text-center text-[13px] text-muted">
					{q
						? "No students match your search."
						: "No students enrolled in this class yet."}
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-[12.5px]">
						<thead className="bg-surface text-muted text-left">
							<tr>
								<th className="px-3 py-2 font-semibold w-12">#</th>
								<th className="px-3 py-2 font-semibold">Student</th>
								<th className="px-3 py-2 font-semibold">LRN</th>
								<th className="px-3 py-2 font-semibold">Gender</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((s, i) => (
								<tr
									key={s.id}
									className="border-t border-line hover:bg-slate-50/40 cursor-pointer"
									onClick={() =>
										void navigate({
											to: "/app/students/$studentId",
											params: { studentId: s.id },
										})
									}
								>
									<td className="px-3 py-2 font-mono text-muted">
										{i + 1}
									</td>
									<td className="px-3 py-2">
										<div className="flex items-center gap-2.5">
											<Avatar
												name={`${s.firstName} ${s.lastName}`}
												size="sm"
											/>
											<span className="font-semibold text-navy">
												{s.lastName}, {s.firstName}
												{s.middleName
													? ` ${s.middleName.slice(0, 1)}.`
													: ""}
											</span>
										</div>
									</td>
									<td className="px-3 py-2 font-mono text-muted">
										{s.lrn}
									</td>
									<td className="px-3 py-2 text-muted">{s.gender}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</Card>
	);
}
