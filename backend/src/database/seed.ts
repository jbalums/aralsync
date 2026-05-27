import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "./connection";
import { School } from "./models/School.model";
import { SchoolYear } from "./models/SchoolYear.model";
import { User } from "./models/User.model";
import { Section } from "./models/Section.model";
import { Subject } from "./models/Subject.model";
import { Student } from "./models/Student.model";
import { ClassLoad } from "./models/ClassLoad.model";
import { Role, Quarter } from "../shared/types";

const SEED_PASSWORD = "123password";

async function clearCollections(): Promise<void> {
	await Promise.all([
		ClassLoad.deleteMany({}),
		Student.deleteMany({}),
		Section.deleteMany({}),
		Subject.deleteMany({}),
		User.deleteMany({}),
		SchoolYear.deleteMany({}),
		School.deleteMany({}),
	]);
	console.log("Collections cleared.");
}

async function seed(): Promise<void> {
	await connectDB();
	await clearCollections();

	const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

	// ── 1. School ──────────────────────────────────────────────────────────────
	const school = await School.create({
		name: "Rizal National High School",
		schoolId: "301034",
		division: "Division of Laguna",
		district: "Calamba District 1",
		address: "Brgy. Real, Calamba City, Laguna",
	});

	// ── 2. School Year ─────────────────────────────────────────────────────────
	const schoolYear = await SchoolYear.create({
		schoolId: school._id,
		label: "2026",
		startDate: new Date("2024-08-05"),
		endDate: new Date("2025-04-04"),
		isActive: true,
	});

	// ── 3. Users (all 4 roles) ─────────────────────────────────────────────────
	const [superAdmin, schoolAdmin, advisoryTeacher, subjectTeacher] =
		await Promise.all([
			User.create({
				email: "superadmin@aralsync.dev",
				passwordHash,
				fullName: "Maria Santos",
				employeeNumber: "SA-0001",
				position: "System Administrator",
				schoolId: school._id,
				role: Role.SUPER_ADMIN,
			}),
			User.create({
				email: "schooladmin@aralsync.dev",
				passwordHash,
				fullName: "Juan dela Cruz",
				employeeNumber: "EMP-0001",
				position: "School Principal",
				schoolId: school._id,
				role: Role.SCHOOL_ADMIN,
			}),
			User.create({
				email: "advisory@aralsync.dev",
				passwordHash,
				fullName: "Ana Reyes",
				employeeNumber: "EMP-0002",
				position: "Grade 7 Advisory Teacher",
				schoolId: school._id,
				role: Role.ADVISORY_TEACHER,
			}),
			User.create({
				email: "subject@aralsync.dev",
				passwordHash,
				fullName: "Ben Flores",
				employeeNumber: "EMP-0003",
				position: "Mathematics & Science Teacher",
				schoolId: school._id,
				role: Role.SUBJECT_TEACHER,
			}),
		]);

	// ── 4. Sections ────────────────────────────────────────────────────────────
	const [sectionRizal, sectionBonifacio] = await Promise.all([
		Section.create({
			schoolId: school._id,
			schoolYearId: schoolYear._id,
			gradeLevel: 7,
			name: "Rizal",
			adviserId: advisoryTeacher._id,
		}),
		Section.create({
			schoolId: school._id,
			schoolYearId: schoolYear._id,
			gradeLevel: 8,
			name: "Bonifacio",
			adviserId: advisoryTeacher._id,
		}),
	]);

	// ── 5. Subjects ────────────────────────────────────────────────────────────
	const subjects = await Subject.insertMany([
		{
			schoolId: school._id,
			name: "Filipino",
			gradeLevel: 7,
			description: "Filipino Language and Literature",
		},
		{
			schoolId: school._id,
			name: "English",
			gradeLevel: 7,
			description: "English Language Arts",
		},
		{
			schoolId: school._id,
			name: "Mathematics",
			gradeLevel: 7,
			description: "Grade 7 Mathematics",
		},
		{
			schoolId: school._id,
			name: "Science",
			gradeLevel: 7,
			description: "Grade 7 Science",
		},
		{
			schoolId: school._id,
			name: "Araling Panlipunan",
			gradeLevel: 7,
			description: "Philippine History and Social Studies",
		},
		{
			schoolId: school._id,
			name: "MAPEH",
			gradeLevel: 7,
			description: "Music, Arts, P.E., and Health",
		},
		{
			schoolId: school._id,
			name: "Values Education",
			gradeLevel: 7,
			description: "Edukasyon sa Pagpapakatao (EsP)",
		},
		{
			schoolId: school._id,
			name: "TLE",
			gradeLevel: 7,
			description: "Technology and Livelihood Education",
		},
		{
			schoolId: school._id,
			name: "Filipino",
			gradeLevel: 8,
			description: "Filipino Language and Literature",
		},
		{
			schoolId: school._id,
			name: "English",
			gradeLevel: 8,
			description: "English Language Arts",
		},
		{
			schoolId: school._id,
			name: "Mathematics",
			gradeLevel: 8,
			description: "Grade 8 Mathematics",
		},
		{
			schoolId: school._id,
			name: "Science",
			gradeLevel: 8,
			description: "Grade 8 Science",
		},
	]);

	const grade7 = subjects.filter((s) => s.gradeLevel === 7);
	const [filipino7, english7, math7, science7] = grade7;

	// ── 6. Students ────────────────────────────────────────────────────────────
	// Grade 7 - Rizal (12 students)
	const rizalStudents = [
		{
			lrn: "100000000001",
			lastName: "Aquino",
			firstName: "Liza",
			middleName: "M",
			gender: "F",
			birthday: new Date("2012-03-14"),
			guardian: {
				name: "Rosa Aquino",
				relationship: "Mother",
				contactNumber: "09171234001",
			},
		},
		{
			lrn: "100000000002",
			lastName: "Batungbakal",
			firstName: "Carlo",
			middleName: "D",
			gender: "M",
			birthday: new Date("2012-07-22"),
			guardian: {
				name: "Pedro Batungbakal",
				relationship: "Father",
				contactNumber: "09171234002",
			},
		},
		{
			lrn: "100000000003",
			lastName: "Cruz",
			firstName: "Sophia",
			middleName: "L",
			gender: "F",
			birthday: new Date("2012-11-03"),
			guardian: {
				name: "Elena Cruz",
				relationship: "Mother",
				contactNumber: "09171234003",
			},
		},
		{
			lrn: "100000000004",
			lastName: "Dela Torre",
			firstName: "Miguel",
			middleName: "A",
			gender: "M",
			birthday: new Date("2012-01-18"),
			guardian: {
				name: "Jose Dela Torre",
				relationship: "Father",
				contactNumber: "09171234004",
			},
		},
		{
			lrn: "100000000005",
			lastName: "Espiritu",
			firstName: "Hannah",
			middleName: "R",
			gender: "F",
			birthday: new Date("2012-05-09"),
			guardian: {
				name: "Gloria Espiritu",
				relationship: "Mother",
				contactNumber: "09171234005",
			},
		},
		{
			lrn: "100000000006",
			lastName: "Fernandez",
			firstName: "Nico",
			middleName: "T",
			gender: "M",
			birthday: new Date("2012-09-27"),
			guardian: {
				name: "Tomas Fernandez",
				relationship: "Father",
				contactNumber: "09171234006",
			},
		},
		{
			lrn: "100000000007",
			lastName: "Garcia",
			firstName: "Alyssa",
			middleName: "V",
			gender: "F",
			birthday: new Date("2012-12-15"),
			guardian: {
				name: "Virgie Garcia",
				relationship: "Mother",
				contactNumber: "09171234007",
			},
		},
		{
			lrn: "100000000008",
			lastName: "Hernandez",
			firstName: "Josh",
			middleName: "C",
			gender: "M",
			birthday: new Date("2012-04-30"),
			guardian: {
				name: "Carmen Hernandez",
				relationship: "Mother",
				contactNumber: "09171234008",
			},
		},
		{
			lrn: "100000000009",
			lastName: "Ilagan",
			firstName: "Trisha",
			middleName: "B",
			gender: "F",
			birthday: new Date("2012-08-12"),
			guardian: {
				name: "Berto Ilagan",
				relationship: "Father",
				contactNumber: "09171234009",
			},
		},
		{
			lrn: "100000000010",
			lastName: "Jimenez",
			firstName: "Marco",
			middleName: "S",
			gender: "M",
			birthday: new Date("2012-02-06"),
			guardian: {
				name: "Sonia Jimenez",
				relationship: "Mother",
				contactNumber: "09171234010",
			},
		},
		{
			lrn: "100000000011",
			lastName: "Katipunan",
			firstName: "Rina",
			middleName: "P",
			gender: "F",
			birthday: new Date("2012-06-19"),
			guardian: {
				name: "Pablo Katipunan",
				relationship: "Father",
				contactNumber: "09171234011",
			},
		},
		{
			lrn: "100000000012",
			lastName: "Lopez",
			firstName: "Kevin",
			middleName: "G",
			gender: "M",
			birthday: new Date("2012-10-24"),
			guardian: {
				name: "Gina Lopez",
				relationship: "Mother",
				contactNumber: "09171234012",
			},
		},
	];

	// Grade 8 - Bonifacio (8 students)
	const bonifacioStudents = [
		{
			lrn: "200000000001",
			lastName: "Macapagal",
			firstName: "Diana",
			middleName: "F",
			gender: "F",
			birthday: new Date("2011-04-05"),
			guardian: {
				name: "Fidel Macapagal",
				relationship: "Father",
				contactNumber: "09181234001",
			},
		},
		{
			lrn: "200000000002",
			lastName: "Navarro",
			firstName: "Patrick",
			middleName: "R",
			gender: "M",
			birthday: new Date("2011-08-17"),
			guardian: {
				name: "Rita Navarro",
				relationship: "Mother",
				contactNumber: "09181234002",
			},
		},
		{
			lrn: "200000000003",
			lastName: "Ocampo",
			firstName: "Jade",
			middleName: "N",
			gender: "F",
			birthday: new Date("2011-12-01"),
			guardian: {
				name: "Noel Ocampo",
				relationship: "Father",
				contactNumber: "09181234003",
			},
		},
		{
			lrn: "200000000004",
			lastName: "Padilla",
			firstName: "Ryan",
			middleName: "C",
			gender: "M",
			birthday: new Date("2011-03-23"),
			guardian: {
				name: "Celia Padilla",
				relationship: "Mother",
				contactNumber: "09181234004",
			},
		},
		{
			lrn: "200000000005",
			lastName: "Quizon",
			firstName: "Sarah",
			middleName: "A",
			gender: "F",
			birthday: new Date("2011-07-11"),
			guardian: {
				name: "Andres Quizon",
				relationship: "Father",
				contactNumber: "09181234005",
			},
		},
		{
			lrn: "200000000006",
			lastName: "Ramos",
			firstName: "Luis",
			middleName: "E",
			gender: "M",
			birthday: new Date("2011-11-29"),
			guardian: {
				name: "Edna Ramos",
				relationship: "Mother",
				contactNumber: "09181234006",
			},
		},
		{
			lrn: "200000000007",
			lastName: "Santos",
			firstName: "Kyla",
			middleName: "M",
			gender: "F",
			birthday: new Date("2011-02-14"),
			guardian: {
				name: "Mario Santos",
				relationship: "Father",
				contactNumber: "09181234007",
			},
		},
		{
			lrn: "200000000008",
			lastName: "Torres",
			firstName: "Anton",
			middleName: "B",
			gender: "M",
			birthday: new Date("2011-06-08"),
			guardian: {
				name: "Bella Torres",
				relationship: "Mother",
				contactNumber: "09181234008",
			},
		},
	];

	await Student.insertMany([
		...rizalStudents.map((s) => ({
			...s,
			sectionId: sectionRizal._id,
			schoolId: school._id,
		})),
		...bonifacioStudents.map((s) => ({
			...s,
			sectionId: sectionBonifacio._id,
			schoolId: school._id,
		})),
	]);

	// ── 7. Class Loads (4 subjects × 4 quarters = 16 loads) ───────────────────
	// Advisory teacher: Filipino + English in Grade 7 - Rizal (M/W/F)
	// Subject teacher:  Math + Science in Grade 7 - Rizal (T/Th)
	const classLoadDefs = [
		{
			teacherId: advisoryTeacher._id,
			subjectId: filipino7._id,
			sectionId: sectionRizal._id,
			roomNumber: "Room 101",
			schedule: {
				dayOfWeek: [1, 3, 5],
				timeStart: "07:30",
				timeEnd: "08:30",
			},
		},
		{
			teacherId: advisoryTeacher._id,
			subjectId: english7._id,
			sectionId: sectionRizal._id,
			roomNumber: "Room 101",
			schedule: {
				dayOfWeek: [1, 3, 5],
				timeStart: "08:30",
				timeEnd: "09:30",
			},
		},
		{
			teacherId: subjectTeacher._id,
			subjectId: math7._id,
			sectionId: sectionRizal._id,
			roomNumber: "Room 102",
			schedule: {
				dayOfWeek: [2, 4],
				timeStart: "07:30",
				timeEnd: "09:00",
			},
		},
		{
			teacherId: subjectTeacher._id,
			subjectId: science7._id,
			sectionId: sectionRizal._id,
			roomNumber: "Room 102",
			schedule: {
				dayOfWeek: [2, 4],
				timeStart: "09:00",
				timeEnd: "10:30",
			},
		},
	];

	const quarters = Object.values(Quarter);

	await ClassLoad.insertMany(
		quarters.flatMap((quarter) =>
			classLoadDefs.map((def) => ({
				...def,
				schoolYearId: schoolYear._id,
				quarter,
				weights: { ww: 0.2, pt: 0.6, qa: 0.2 },
			})),
		),
	);

	// ── Summary ────────────────────────────────────────────────────────────────
	console.log("\nSeed complete!\n");
	console.log(`School      : ${school.name} (schoolId: ${school.schoolId})`);
	console.log(`School Year : ${schoolYear.label}`);
	console.log("\nUser Accounts (password for all: password123)");
	console.log(`  super_admin        → ${superAdmin.email}`);
	console.log(`  school_admin       → ${schoolAdmin.email}`);
	console.log(`  advisory_teacher   → ${advisoryTeacher.email}`);
	console.log(`  subject_teacher    → ${subjectTeacher.email}`);
	console.log("\nSections");
	console.log(`  Grade 7 - ${sectionRizal.name}      (12 students)`);
	console.log(`  Grade 8 - ${sectionBonifacio.name} (8 students)`);
	console.log("\nSubjects     : 8 × Grade 7, 4 × Grade 8");
	console.log(
		`Class Loads  : ${classLoadDefs.length} subjects × ${quarters.length} quarters = ${classLoadDefs.length * quarters.length} records`,
	);

	await mongoose.disconnect();
}

seed().catch((err: unknown) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
