// @ts-nocheck
import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { Card, Icon, Badge, Btn, Field, Select, useToast } from "..";
import type { ClassLoadListItem } from "../../shared/types";
import { useClassLoadStudents } from "../../modules/classrooms/useClassLoads";
import { useClassReport } from "../../modules/gradebook/useGradebook";
import { reportsService } from "../../modules/reports/reports.service";
import { generateSf2Pdf, generateSf2Excel } from "../../modules/reports/sf2";
import { generateSf9Pdf } from "../../modules/reports/sf9";
import { generateSf10Pdf } from "../../modules/reports/sf10";

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTHS = [
	{ label: "January",   value: "01" }, { label: "February",  value: "02" },
	{ label: "March",     value: "03" }, { label: "April",     value: "04" },
	{ label: "May",       value: "05" }, { label: "June",      value: "06" },
	{ label: "July",      value: "07" }, { label: "August",    value: "08" },
	{ label: "September", value: "09" }, { label: "October",   value: "10" },
	{ label: "November",  value: "11" }, { label: "December",  value: "12" },
];

const TONE: Record<string, { bg: string; fg: string }> = {
	primary: { bg: "#CCFBF1", fg: "#0F766E" },
	accent:  { bg: "#D1FAE5", fg: "#047857" },
	blue:    { bg: "#DBEAFE", fg: "#1D4ED8" },
	amber:   { bg: "#FEF3C7", fg: "#92400E" },
	rose:    { bg: "#FFE4E6", fg: "#9F1239" },
	muted:   { bg: "#F1F5F9", fg: "#475569" },
};

const REPORTS = [
	{
		id: "sf2", code: "SF2", title: "Daily Attendance Record",
		desc: "Official DepEd monthly attendance form. Captures daily check-ins and totals.",
		icon: "clipboard-list", tone: "primary",
		note: "Select a month before generating.",
	},
	{
		id: "sf9", code: "SF9", title: "Individual Report Cards",
		desc: "Per-student quarterly grades across all subjects, ready for parent distribution.",
		icon: "file-text", tone: "accent",
		note: "Select a student above.",
	},
	{
		id: "gs", code: "", title: "Class Grade Summary",
		desc: "All students · all components (WW · PT · QA) with final quarterly grades.",
		icon: "graduation-cap", tone: "blue",
	},
	{
		id: "risk", code: "", title: "At-Risk Students Report",
		desc: "Auto-filtered: grade below 75. Includes student names and LRNs.",
		icon: "alert-triangle", tone: "amber",
	},
	{
		id: "honor", code: "", title: "Honor Roll List",
		desc: "Auto-generated honor tiers: With Highest / High / With Honors.",
		icon: "award", tone: "rose",
	},
	{
		id: "sf10", code: "SF10", title: "Learner's Permanent Record",
		desc: "Cumulative academic history per learner. Use at end of school year only.",
		icon: "archive", tone: "muted",
		note: "Select a student above.",
	},
] as const;

function classifyLabel(c: string | null): string {
	if (c === "withHighestHonors") return "With Highest Honors";
	if (c === "withHighHonors")    return "With High Honors";
	if (c === "withHonors")        return "With Honors";
	return "-";
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ClassReportsTabProps {
	classId: string;
	cls: ClassLoadListItem;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ClassReportsTab({ classId, cls }: ClassReportsTabProps) {
	const toast = useToast();

	const [selectedMonth, setSelectedMonth] = useState(
		() => String(new Date().getMonth() + 1).padStart(2, "0"),
	);
	const [selectedStudentId, setSelectedStudentId] = useState("");
	const [loading, setLoading] = useState<Record<string, boolean>>({});

	const setL = (id: string, v: boolean) =>
		setLoading((prev) => ({ ...prev, [id]: v }));

	const { data: students = [] } = useClassLoadStudents(classId);
	const { data: classReport }   = useClassReport(classId, cls.quarter);

	const atRiskStudents = useMemo(
		() => (classReport?.rows ?? []).filter((r) => r.transmutedGrade < 75),
		[classReport],
	);
	const honorRollStudents = useMemo(
		() => (classReport?.rows ?? []).filter((r) => r.transmutedGrade >= 90),
		[classReport],
	);

	// ── Handlers ───────────────────────────────────────────────────────────────

	async function handleSf2(format: "pdf" | "excel") {
		const key = `sf2-${format}`;
		setL(key, true);
		try {
			const month = `${new Date().getFullYear()}-${selectedMonth}`;
			const data = await reportsService.getSf2Sheet(classId, month);
			format === "pdf" ? generateSf2Pdf(data) : generateSf2Excel(data);
			toast?.push({ type: "success", title: "SF2 ready", message: `Downloaded as ${format.toUpperCase()}` });
		} catch {
			toast?.push({ type: "error", message: "Failed to generate SF2. Check API connection." });
		} finally {
			setL(key, false);
		}
	}

	async function handleSf9() {
		if (!selectedStudentId) {
			toast?.push({ type: "warning", message: "Select a student first." });
			return;
		}
		setL("sf9", true);
		try {
			const data = await reportsService.getReportCard(selectedStudentId, cls.schoolYearId);
			generateSf9Pdf(data);
			toast?.push({ type: "success", title: "SF9 ready", message: "Report card downloaded." });
		} catch {
			toast?.push({ type: "error", message: "Failed to generate SF9." });
		} finally {
			setL("sf9", false);
		}
	}

	async function handleSf10() {
		if (!selectedStudentId) {
			toast?.push({ type: "warning", message: "Select a student first." });
			return;
		}
		setL("sf10", true);
		try {
			const data = await reportsService.getReportCard(selectedStudentId, cls.schoolYearId);
			generateSf10Pdf(data);
			toast?.push({ type: "success", title: "SF10 ready", message: "Permanent record downloaded." });
		} catch {
			toast?.push({ type: "error", message: "Failed to generate SF10." });
		} finally {
			setL("sf10", false);
		}
	}

	function handleClassGradeSummaryExcel() {
		if (!classReport?.rows.length) {
			toast?.push({ type: "warning", message: "Compute grades first to generate this report." });
			return;
		}
		const header = [
			"Rank", "Last Name", "First Name", "LRN",
			"WW Weighted", "PT Weighted", "QA Weighted",
			"Initial Grade", "Transmuted Grade", "Classification",
		];
		const rows = classReport.rows.map((r) => [
			r.rank,
			r.student.lastName,
			r.student.firstName,
			r.student.lrn,
			r.wwWeighted,
			r.ptWeighted,
			r.qaWeighted,
			r.initialGrade,
			r.transmutedGrade,
			classifyLabel(r.classification),
		]);
		const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Class Grades");
		XLSX.writeFile(wb, `ClassGrades_${cls.subject.name}_${cls.quarter}.xlsx`);
		toast?.push({ type: "success", message: "Class grade summary downloaded." });
	}

	function handleAtRiskPdf() {
		if (!atRiskStudents.length) {
			toast?.push({ type: "info", message: "No at-risk students." });
			return;
		}
		const rows = atRiskStudents
			.map(
				(r, i) =>
					`<tr><td>${i + 1}</td><td>${r.student.lastName}, ${r.student.firstName}</td><td>${r.student.lrn}</td><td>${r.transmutedGrade}</td></tr>`,
			)
			.join("");
		const html = `<html><head><title>At-Risk Students</title><style>body{font-family:Arial;font-size:12px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px}</style></head><body><h2>At-Risk Students Report</h2><p>${cls.subject.name} · ${cls.section.gradeLevel} – ${cls.section.name} · ${cls.quarter}</p><table><tr><th>#</th><th>Name</th><th>LRN</th><th>Grade</th></tr>${rows}</table></body></html>`;
		const w = window.open("", "_blank");
		if (w) { w.document.write(html); w.document.close(); w.print(); }
	}

	function handleHonorRollPdf() {
		if (!honorRollStudents.length) {
			toast?.push({ type: "info", message: "No honor roll students." });
			return;
		}
		const rows = honorRollStudents
			.map(
				(r) =>
					`<tr><td>${r.rank}</td><td>${r.student.lastName}, ${r.student.firstName}</td><td>${r.student.lrn}</td><td>${r.transmutedGrade}</td><td>${classifyLabel(r.classification)}</td></tr>`,
			)
			.join("");
		const html = `<html><head><title>Honor Roll</title><style>body{font-family:Arial;font-size:12px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px}</style></head><body><h2>Honor Roll</h2><p>${cls.subject.name} · ${cls.section.gradeLevel} – ${cls.section.name} · ${cls.quarter}</p><table><tr><th>Rank</th><th>Name</th><th>LRN</th><th>Grade</th><th>Classification</th></tr>${rows}</table></body></html>`;
		const w = window.open("", "_blank");
		if (w) { w.document.write(html); w.document.close(); w.print(); }
	}

	// ── Render ─────────────────────────────────────────────────────────────────

	return (
		<div className="space-y-5">
			{/* Selectors */}
			<Card className="p-4 sm:p-5">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<Field label="Month (for SF2)">
						<Select
							value={selectedMonth}
							onChange={(e) => setSelectedMonth(e.target.value)}
						>
							{MONTHS.map((m) => (
								<option key={m.value} value={m.value}>{m.label}</option>
							))}
						</Select>
					</Field>
					<Field label="Student (for SF9 / SF10)">
						<Select
							value={selectedStudentId}
							onChange={(e) => setSelectedStudentId(e.target.value)}
							disabled={students.length === 0}
						>
							<option value="">Select student…</option>
							{students.map((s) => (
								<option key={s.id} value={s.id}>
									{s.lastName}, {s.firstName}
								</option>
							))}
						</Select>
					</Field>
				</div>

				{/* Stats row */}
				{classReport && (
					<div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
						<div className="rounded-md border border-line bg-surface p-3 text-center">
							<div className="text-[10px] uppercase text-muted font-semibold tracking-wide">Class Avg</div>
							<div className="text-[22px] font-bold text-navy font-mono mt-0.5">
								{classReport.stats.classAvg.toFixed(1)}
							</div>
						</div>
						<div className="rounded-md border border-line bg-surface p-3 text-center">
							<div className="text-[10px] uppercase text-muted font-semibold tracking-wide">Passing</div>
							<div className="text-[22px] font-bold text-emerald-700 font-mono mt-0.5">
								{classReport.stats.passingPct}%
							</div>
						</div>
						<div className="rounded-md border border-line bg-surface p-3 text-center">
							<div className="text-[10px] uppercase text-muted font-semibold tracking-wide">At Risk</div>
							<div className="text-[22px] font-bold text-rose-600 font-mono mt-0.5">
								{atRiskStudents.length}
							</div>
						</div>
						<div className="rounded-md border border-line bg-surface p-3 text-center">
							<div className="text-[10px] uppercase text-muted font-semibold tracking-wide">Honor Roll</div>
							<div className="text-[22px] font-bold text-amber-600 font-mono mt-0.5">
								{honorRollStudents.length}
							</div>
						</div>
					</div>
				)}
			</Card>

			{/* Report cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{REPORTS.map((r) => {
					const t = TONE[r.tone] ?? TONE.muted;
					return (
						<Card key={r.id} className="p-4 sm:p-5">
							<div className="flex items-start gap-3">
								<span
									className="w-11 h-11 rounded-md inline-flex items-center justify-center shrink-0"
									style={{ background: t.bg, color: t.fg }}
								>
									<Icon name={r.icon} size={20} />
								</span>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 flex-wrap">
										<h3 className="text-[15px] font-semibold text-navy">{r.title}</h3>
										{r.code && <Badge status="primary">{r.code}</Badge>}
									</div>
									<p className="text-[12.5px] text-muted mt-1 leading-relaxed">{r.desc}</p>
									{r.note && (
										<p className="text-[11.5px] text-amber-700 mt-2 inline-flex items-center gap-1">
											<Icon name="info" size={11} />{r.note}
										</p>
									)}
									<div className="mt-4 flex items-center gap-2 flex-wrap">
										<ReportActions
											id={r.id}
											loading={loading}
											onSf2Pdf={() => void handleSf2("pdf")}
											onSf2Excel={() => void handleSf2("excel")}
											onSf9={() => void handleSf9()}
											onSf10={() => void handleSf10()}
											onGradeSummary={() => handleClassGradeSummaryExcel()}
											onAtRisk={() => handleAtRiskPdf()}
											onHonorRoll={() => handleHonorRollPdf()}
										/>
									</div>
								</div>
							</div>
						</Card>
					);
				})}
			</div>

			{/* Class report preview table */}
			{classReport && classReport.rows.length > 0 && (
				<Card className="overflow-hidden">
					<div className="px-4 py-3 border-b border-line flex items-center justify-between">
						<h3 className="text-[14px] font-semibold text-navy">
							Class report · {cls.subject.name} · {cls.quarter}
						</h3>
						<span className="text-[11px] text-muted">
							{classReport.rows.length} students
						</span>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full text-[12px]">
							<thead className="bg-surface border-b border-line">
								<tr>
									<th className="px-3 py-2 text-left text-muted font-semibold">Rank</th>
									<th className="px-3 py-2 text-left text-muted font-semibold">Name</th>
									<th className="px-3 py-2 text-right text-muted font-semibold">Initial</th>
									<th className="px-3 py-2 text-right text-muted font-semibold">Grade</th>
									<th className="px-3 py-2 text-left text-muted font-semibold">Classification</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-line">
								{classReport.rows.map((r) => (
									<tr
										key={r.student.id}
										className={
											r.transmutedGrade < 75
												? "bg-rose-50"
												: r.transmutedGrade >= 90
													? "bg-amber-50"
													: ""
										}
									>
										<td className="px-3 py-2 font-mono text-muted">{r.rank}</td>
										<td className="px-3 py-2 font-semibold text-navy">
											{r.student.lastName}, {r.student.firstName}
										</td>
										<td className="px-3 py-2 font-mono text-right text-muted">
											{r.initialGrade}
										</td>
										<td
											className={`px-3 py-2 font-mono text-right font-bold ${r.transmutedGrade < 75 ? "text-rose-600" : "text-navy"}`}
										>
											{r.transmutedGrade}
										</td>
										<td className="px-3 py-2 text-[11px] text-muted">
											{classifyLabel(r.classification)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>
			)}
		</div>
	);
}

// ── ReportActions ─────────────────────────────────────────────────────────────

function ReportActions({
	id, loading,
	onSf2Pdf, onSf2Excel, onSf9, onSf10,
	onGradeSummary, onAtRisk, onHonorRoll,
}: {
	id: string;
	loading: Record<string, boolean>;
	onSf2Pdf: () => void;
	onSf2Excel: () => void;
	onSf9: () => void;
	onSf10: () => void;
	onGradeSummary: () => void;
	onAtRisk: () => void;
	onHonorRoll: () => void;
}) {
	if (id === "sf2") return (
		<>
			<Btn variant="primary" size="sm" icon="file-text" onClick={onSf2Pdf} disabled={loading["sf2-pdf"]}>
				{loading["sf2-pdf"] ? "Building…" : "PDF"}
			</Btn>
			<Btn variant="secondary" size="sm" icon="file-spreadsheet" onClick={onSf2Excel} disabled={loading["sf2-excel"]}>
				{loading["sf2-excel"] ? "Building…" : "Excel"}
			</Btn>
		</>
	);
	if (id === "sf9") return (
		<Btn variant="primary" size="sm" icon="download" onClick={onSf9} disabled={loading["sf9"]}>
			{loading["sf9"] ? "Building…" : "Download PDF"}
		</Btn>
	);
	if (id === "gs") return (
		<Btn variant="secondary" size="sm" icon="file-spreadsheet" onClick={onGradeSummary}>
			Excel
		</Btn>
	);
	if (id === "risk") return (
		<Btn variant="secondary" size="sm" icon="printer" onClick={onAtRisk}>
			Print / PDF
		</Btn>
	);
	if (id === "honor") return (
		<Btn variant="secondary" size="sm" icon="printer" onClick={onHonorRoll}>
			Print / PDF
		</Btn>
	);
	if (id === "sf10") return (
		<Btn variant="primary" size="sm" icon="download" onClick={onSf10} disabled={loading["sf10"]}>
			{loading["sf10"] ? "Building…" : "Download PDF"}
		</Btn>
	);
	return null;
}
