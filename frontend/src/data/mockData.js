// ─── MOCK DATA ─────────────────────────────────────────
// Static, hardcoded fixtures used by every page of the prototype.

export const TEACHER = {
	name: "Maria B. Santos",
	shortName: "Ma'am Maria",
	initials: "MS",
	position: "Teacher III · Grade 7 Adviser",
	school: "Bonifacio National High School",
	division: "Division of Bacolod City",
	district: "Bacolod City District II",
	schoolYear: "2024–2025",
	quarter: "Q3",
	quarterLabel: "3rd Quarter",
	week: "Week 8",
	employeeNo: "2019-0042",
	email: "m.santos@deped.bnhs.ph",
	device: "Maria's iPad Mini",
	isAdmin: true,
	roleLabel: "School Administrator",
};

export const SUBJECT_COLORS = {
	Science: { hue: "#0EA5A4", soft: "#CCFBF1", ink: "#134E4A" },
	Mathematics: { hue: "#2563EB", soft: "#DBEAFE", ink: "#1E3A8A" },
	English: { hue: "#9333EA", soft: "#EDE9FE", ink: "#4C1D95" },
	Filipino: { hue: "#EA580C", soft: "#FFEDD5", ink: "#7C2D12" },
};

export const CLASSES = [
	{
		id: "g7r-sci",
		subject: "Science",
		grade: "Grade 7",
		section: "Rizal",
		room: "Room 104",
		count: 42,
		att: 94.2,
		avgGrade: 86,
		time: "7:30–8:30",
		weights: { ww: 20, pt: 60, qa: 20 },
		prog: { ww: [4, 6], pt: [3, 4], qa: [0, 1] },
	},
	{
		id: "g7b-mat",
		subject: "Mathematics",
		grade: "Grade 7",
		section: "Bonifacio",
		room: "Room 106",
		count: 38,
		att: 88.7,
		avgGrade: 82,
		time: "8:30–9:30",
		weights: { ww: 20, pt: 60, qa: 20 },
		prog: { ww: [3, 6], pt: [2, 4], qa: [0, 1] },
	},
	{
		id: "g8a-eng",
		subject: "English",
		grade: "Grade 8",
		section: "Aguinaldo",
		room: "Room 201",
		count: 35,
		att: 96.1,
		avgGrade: 89,
		time: "10:00–11:00",
		weights: { ww: 25, pt: 50, qa: 25 },
		prog: { ww: [5, 6], pt: [3, 4], qa: [1, 1] },
	},
	{
		id: "g9m-fil",
		subject: "Filipino",
		grade: "Grade 9",
		section: "Mabini",
		room: "Room 305",
		count: 40,
		att: 91.3,
		avgGrade: 84,
		time: "1:00–2:00",
		weights: { ww: 20, pt: 60, qa: 20 },
		prog: { ww: [4, 6], pt: [3, 4], qa: [0, 1] },
	},
];

// 42 students for Grade 7 - Rizal (Science). First 10 explicit from brief, rest generated deterministically.
export const SEED_STUDENTS = [
	{
		last: "dela Cruz",
		first: "Juan",
		mi: "R",
		lrn: "105432100001",
		att: 96,
		grade: 88,
	},
	{
		last: "Reyes",
		first: "Maria",
		mi: "L",
		lrn: "105432100002",
		att: 100,
		grade: 92,
	},
	{
		last: "Santos",
		first: "Jose",
		mi: "M",
		lrn: "105432100003",
		att: 88,
		grade: 79,
	},
	{
		last: "Gonzales",
		first: "Ana",
		mi: "G",
		lrn: "105432100004",
		att: 92,
		grade: 85,
	},
	{
		last: "Mendoza",
		first: "Carlo",
		mi: "P",
		lrn: "105432100005",
		att: 84,
		grade: 76,
	},
	{
		last: "Villanueva",
		first: "Rosa",
		mi: "V",
		lrn: "105432100006",
		att: 100,
		grade: 95,
	},
	{
		last: "Torres",
		first: "Miguel",
		mi: "A",
		lrn: "105432100007",
		att: 76,
		grade: 75,
	},
	{
		last: "Ramos",
		first: "Liza",
		mi: "D",
		lrn: "105432100008",
		att: 96,
		grade: 90,
	},
	{
		last: "Aquino",
		first: "Pedro",
		mi: "C",
		lrn: "105432100009",
		att: 80,
		grade: 78,
	},
	{
		last: "Bautista",
		first: "Sofia",
		mi: "B",
		lrn: "105432100010",
		att: 100,
		grade: 97,
	},
];
export const EXTRA_LASTS = [
	"Bagong",
	"Castro",
	"Domingo",
	"Estrada",
	"Flores",
	"Garcia",
	"Hernandez",
	"Ignacio",
	"Jaravata",
	"Kabigting",
	"Lopez",
	"Macaraeg",
	"Navarro",
	"Ocampo",
	"Padilla",
	"Quezon",
	"Romero",
	"Sicat",
	"Tolentino",
	"Ubaldo",
	"Vargas",
	"Wenceslao",
	"Ybañez",
	"Zarate",
	"Alvarez",
	"Barangan",
	"Cabrera",
	"Diaz",
	"Encarnacion",
	"Fajardo",
	"Galang",
	"Hilario",
	"Iglesia",
];
export const EXTRA_FIRSTS = [
	"Andres",
	"Beatriz",
	"Cristina",
	"Diego",
	"Elena",
	"Felix",
	"Gabriel",
	"Hannah",
	"Isabela",
	"Joaquin",
	"Katrina",
	"Lorenzo",
	"Manuel",
	"Nicole",
	"Oscar",
	"Patricia",
	"Quintin",
	"Ricardo",
	"Samuel",
	"Therese",
	"Ulysses",
	"Vincent",
	"Wenceslao",
	"Ximena",
	"Yolanda",
	"Zoe",
	"Alon",
	"Bayani",
	"Camilo",
	"Dahlia",
	"Elias",
	"Faith",
	"Gemma",
];
function genStudents() {
	const arr = SEED_STUDENTS.map((s, i) => ({ ...s, n: i + 1 }));
	for (let i = 10; i < 42; i++) {
		const last = EXTRA_LASTS[(i * 7) % EXTRA_LASTS.length];
		const first = EXTRA_FIRSTS[(i * 5 + 3) % EXTRA_FIRSTS.length];
		const mi = String.fromCharCode(65 + ((i * 13) % 26));
		const att = 70 + ((i * 9) % 31); // 70..100
		const grade = 72 + ((i * 11 + 5) % 26); // 72..97
		arr.push({
			last,
			first,
			mi,
			lrn: `1054321000${(i + 1).toString().padStart(2, "0")}`,
			att,
			grade,
			n: i + 1,
		});
	}
	return arr;
}
export const STUDENTS_RIZAL = genStudents();

// Scores for Juan dela Cruz (Science): keep these consistent in gradebook + profile
export const JUAN_SCORES = {
	ww: [
		[8, 10],
		[9, 10],
		[7, 10],
		[10, 10],
	],
	pt: [
		[48, 50],
		[45, 50],
		[47, 50],
	],
	qa: [38, 50],
};

// Today's date / schedule
export const TODAY = {
	weekday: "Tuesday",
	dateLabel: "January 14, 2025",
	schedule: [
		{
			time: "7:30–8:30",
			subject: "Science",
			section: "Grade 7 – Rizal",
			room: "Room 104",
			status: "done",
			classId: "g7r-sci",
		},
		{
			time: "8:30–9:30",
			subject: "Mathematics",
			section: "Grade 7 – Bonifacio",
			room: "Room 106",
			status: "current",
			classId: "g7b-mat",
		},
		{
			time: "10:00–11:00",
			subject: "English",
			section: "Grade 8 – Aguinaldo",
			room: "Room 201",
			status: "upcoming",
			classId: "g8a-eng",
		},
		{
			time: "1:00–2:00",
			subject: "Filipino",
			section: "Grade 9 – Mabini",
			room: "Room 305",
			status: "upcoming",
			classId: "g9m-fil",
		},
	],
};

export const SYNC_STATE = {
	pending: 3,
	lastSync: "3 minutes ago",
	storageUsedMB: 42.3,
	storageCapMB: 2048,
	storageBreakdown: { attendance: 28, grades: 11, other: 3.3 },
	devices: [
		{
			name: "Maria's iPad Mini",
			role: "This device",
			size: "42.3 MB",
			online: true,
			last: "Now",
		},
		{
			name: "Sir Reyes' Laptop",
			role: "LAN peer",
			size: "—",
			online: true,
			last: "5 mins ago",
		},
		{
			name: "Maria's Laptop (home)",
			role: "Cloud",
			size: "—",
			online: false,
			last: "Yesterday 6:14 PM",
		},
	],
	queue: [
		{
			kind: "attendance",
			label: "Attendance · Grade 7 Rizal · Jan 14",
			records: 42,
			status: "pending",
		},
		{
			kind: "grade",
			label: "Grade entry · Juan dela Cruz · WW4",
			records: 1,
			status: "pending",
		},
		{
			kind: "grade",
			label: "Grade entry · Maria Reyes · PT3",
			records: 1,
			status: "pending",
		},
	],
	log: [
		{ ok: true, label: "Synced 42 records", when: "3 mins ago" },
		{ ok: true, label: "Synced 38 records", when: "Yesterday 4:12 PM" },
		{
			ok: false,
			label: "Sync failed (timeout)",
			when: "Yesterday 2:00 PM",
		},
		{ ok: true, label: "Synced 35 records", when: "Yesterday 11:30 AM" },
		{ ok: true, label: "Synced 12 records", when: "Mon 8:02 AM" },
		{ ok: true, label: "Synced 40 records", when: "Mon 7:45 AM" },
		{ ok: true, label: "Backup exported", when: "Sun 6:20 PM" },
		{ ok: true, label: "Synced 22 records", when: "Sun 11:10 AM" },
		{
			ok: false,
			label: "Sync failed (no connection)",
			when: "Sat 3:40 PM",
		},
		{ ok: true, label: "Synced 8 records", when: "Sat 9:00 AM" },
	],
};

export const ACTIVITY = [
	{
		icon: "check-circle",
		text: "Attendance saved — Grade 7 Rizal",
		when: "7:45 AM",
		tone: "primary",
	},
	{
		icon: "pencil-line",
		text: "Grade entered — Juan dela Cruz · WW4",
		when: "Yesterday",
		tone: "muted",
	},
	{
		icon: "cloud-upload",
		text: "Synced 12 records to cloud",
		when: "8:02 AM",
		tone: "accent",
	},
	{
		icon: "user-plus",
		text: "Added student — Sofia Bautista",
		when: "Mon",
		tone: "muted",
	},
	{
		icon: "message-square",
		text: "Note added — Carlo Mendoza (Academic)",
		when: "Mon",
		tone: "warning",
	},
	{
		icon: "cloud-off",
		text: "Working offline · 3 records queued",
		when: "Sun PM",
		tone: "warning",
	},
];

export const NOTIFICATIONS = [
	{
		id: 1,
		text: "3 attendance records queued for sync",
		when: "now",
		unread: true,
	},
	{
		id: 2,
		text: "Quarter 3 ends in 11 school days",
		when: "today",
		unread: true,
	},
	{
		id: 3,
		text: "Carlo Mendoza tagged At Risk (76 grade)",
		when: "yest",
		unread: false,
	},
];

export const STUDENT_NOTES = [
	{
		id: 1,
		date: "Jan 13",
		cat: "Academic",
		text: "Discussed Q3 expectations and PT2 makeup. Will submit by Friday.",
	},
	{
		id: 2,
		date: "Jan 09",
		cat: "Behavioral",
		text: "Excellent contribution during group activity on Newton’s laws.",
	},
	{
		id: 3,
		date: "Dec 18",
		cat: "Health",
		text: "Brought medical certificate — flu, absent Dec 16–17.",
	},
];

// Calendar (January 2025) — heatmap statuses for Juan dela Cruz
function makeJanCalendar() {
	// Jan 1, 2025 is Wednesday (col index 3, Sun=0)
	const days = [];
	for (let d = 1; d <= 31; d++) {
		const dow = new Date(2025, 0, d).getDay();
		let status = "none";
		if (dow === 0 || dow === 6) status = "weekend";
		else if (d <= 14) {
			// pattern: present most, late on d=6, absent on d=10, excused on d=8
			if (d === 6) status = "late";
			else if (d === 10) status = "absent";
			else if (d === 8) status = "excused";
			else status = "present";
		} else if (d === 14) status = "present";
		else status = "future";
	}
	return days;
}

// Attendance log for class (last 12 sessions) — for class detail Attendance tab
export const ATTENDANCE_LOG = [
	{ date: "Jan 14", present: 38, late: 2, absent: 1, excused: 1, pct: 95.2 },
	{ date: "Jan 13", present: 37, late: 3, absent: 2, excused: 0, pct: 92.9 },
	{ date: "Jan 10", present: 40, late: 1, absent: 1, excused: 0, pct: 97.6 },
	{ date: "Jan 09", present: 39, late: 0, absent: 2, excused: 1, pct: 97.6 },
	{ date: "Jan 08", present: 36, late: 4, absent: 2, excused: 0, pct: 90.5 },
	{ date: "Jan 07", present: 38, late: 2, absent: 1, excused: 1, pct: 95.2 },
	{ date: "Jan 06", present: 40, late: 1, absent: 1, excused: 0, pct: 97.6 },
	{ date: "Dec 20", present: 35, late: 3, absent: 3, excused: 1, pct: 90.5 },
	{ date: "Dec 19", present: 39, late: 1, absent: 2, excused: 0, pct: 95.2 },
	{ date: "Dec 18", present: 40, late: 2, absent: 0, excused: 0, pct: 100.0 },
	{ date: "Dec 17", present: 37, late: 1, absent: 3, excused: 1, pct: 90.5 },
	{ date: "Dec 16", present: 36, late: 4, absent: 2, excused: 0, pct: 95.2 },
];

// 4-week sparkline data per class
export const SPARKLINES = {
	"g7r-sci": [92, 95, 93, 94],
	"g7b-mat": [85, 88, 90, 89],
	"g8a-eng": [95, 97, 96, 96],
	"g9m-fil": [88, 91, 92, 91],
};
