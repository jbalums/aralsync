export const SUBJECT_HUE: Record<string, string> = {
	Science: "linear-gradient(90deg,#0D9488,#0F766E)",
	Math: "linear-gradient(90deg,#7C3AED,#6D28D9)",
	English: "linear-gradient(90deg,#2563EB,#1D4ED8)",
	Filipino: "linear-gradient(90deg,#D97706,#B45309)",
	"Araling Panlipunan": "linear-gradient(90deg,#DC2626,#B91C1C)",
	MAPEH: "linear-gradient(90deg,#DB2777,#BE185D)",
	TLE: "linear-gradient(90deg,#059669,#047857)",
	"Edukasyon sa Pagpapakatao": "linear-gradient(90deg,#0891B2,#0E7490)",
};

export function subjectHue(name: string): string {
	return SUBJECT_HUE[name] ?? "linear-gradient(90deg,#64748B,#475569)";
}
