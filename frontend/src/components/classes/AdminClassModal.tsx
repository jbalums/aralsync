// @ts-nocheck
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	Modal,
	Btn,
	Field,
	TextInput,
	Select,
	ComponentWeightBar,
	useToast,
} from "..";
import { gradeLevels } from "../../data/phEducation";
import { GradeLevelCombobox } from "./GradeLevelCombobox";
import { SubjectCombobox } from "./SubjectCombobox";
import { ClassSlotsEditor } from "./ClassSlotsEditor";
import { useAdminFaculty, useAdminCreateClass, useAdminUpdateClass } from "../../modules/admin/useAdmin";
import type { AdminClass, ClassScheduleSlot, FacultyMember, Quarter } from "../../shared/types";

const baseSchema = z
	.object({
		teacherId: z.string().min(1, "Select a teacher"),
		subjectName: z.string().min(1, "Subject name is required"),
		gradeLevel: z.number().int().min(1, "Grade level is required"),
		sectionName: z.string().min(1, "Section name is required"),
		quarter: z.enum(["Q1", "Q2", "Q3", "Q4"]),
		roomNumber: z.string().default(""),
		wwPct: z.coerce.number().int().min(1).max(98),
		ptPct: z.coerce.number().int().min(1).max(98),
		qaPct: z.coerce.number().int().min(1).max(98),
	})
	.refine((d) => d.wwPct + d.ptPct + d.qaPct === 100, {
		message: "Component weights must total 100%",
		path: ["qaPct"],
	});

type FormValues = z.infer<typeof baseSchema>;

interface AdminClassModalProps {
	open: boolean;
	onClose: () => void;
	schoolId: string;
	editing?: AdminClass | null;
}

const TEACHER_ROLES: ReadonlyArray<FacultyMember["role"]> = [
	"school_admin",
	"advisory_teacher",
	"subject_teacher",
];

export function AdminClassModal({
	open,
	onClose,
	schoolId,
	editing,
}: AdminClassModalProps) {
	const toast = useToast();
	const isEdit = Boolean(editing);
	const facultyQuery = useAdminFaculty(schoolId);
	const createMutation = useAdminCreateClass(schoolId);
	const updateMutation = useAdminUpdateClass(schoolId);
	const [slots, setSlots] = useState<ClassScheduleSlot[]>([]);

	const {
		register,
		handleSubmit,
		watch,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(baseSchema),
		defaultValues: {
			teacherId: "",
			subjectName: "",
			gradeLevel: 7,
			sectionName: "",
			quarter: "Q1",
			roomNumber: "",
			wwPct: 20,
			ptPct: 60,
			qaPct: 20,
		},
	});

	useEffect(() => {
		if (!open) return;
		if (editing) {
			reset({
				teacherId: editing.teacher.id,
				subjectName: editing.subject.name,
				gradeLevel: editing.subject.gradeLevel || editing.section.gradeLevel || 7,
				sectionName: editing.section.name,
				quarter: editing.quarter,
				roomNumber: editing.roomNumber ?? "",
				wwPct: Math.round((editing.weights?.ww ?? 0.2) * 100),
				ptPct: Math.round((editing.weights?.pt ?? 0.6) * 100),
				qaPct: Math.round((editing.weights?.qa ?? 0.2) * 100),
			});
			setSlots([]);
		} else {
			reset({
				teacherId: "",
				subjectName: "",
				gradeLevel: 7,
				sectionName: "",
				quarter: "Q1",
				roomNumber: "",
				wwPct: 20,
				ptPct: 60,
				qaPct: 20,
			});
			setSlots([]);
		}
	}, [open, editing, reset]);

	const [ww, pt, qa] = watch(["wwPct", "ptPct", "qaPct"]);
	const weightSum = (Number(ww) || 0) + (Number(pt) || 0) + (Number(qa) || 0);

	const selectedGradeId = watch("gradeLevel");
	const subjectNameValue = watch("subjectName") ?? "";
	const selectedGradeLevel = gradeLevels.find((g) => g.value === selectedGradeId);
	const suggestedSubjects = selectedGradeLevel?.subjects ?? [];

	const teachers = (facultyQuery.data ?? []).filter((m) =>
		TEACHER_ROLES.includes(m.role),
	);

	const handleClose = () => {
		onClose();
		reset();
		setSlots([]);
	};

	const validSlots = slots.filter((s) => {
		if (!s.timeStart || !s.timeEnd) return false;
		const [sh, sm] = s.timeStart.split(":").map(Number);
		const [eh, em] = s.timeEnd.split(":").map(Number);
		return eh * 60 + em > sh * 60 + sm;
	});

	const onSubmit = async (values: FormValues) => {
		try {
			const weights = {
				ww: values.wwPct / 100,
				pt: values.ptPct / 100,
				qa: values.qaPct / 100,
			};

			if (isEdit && editing) {
				await updateMutation.mutateAsync({
					classId: editing.id,
					payload: {
						roomNumber: values.roomNumber,
						quarter: values.quarter as Quarter,
						slots: validSlots.length ? validSlots : undefined,
						weights,
					},
				});
				toast.push({
					type: "success",
					title: "Class updated",
					message: `${editing.subject.name} · ${editing.section.name}`,
				});
			} else {
				await createMutation.mutateAsync({
					teacherId: values.teacherId,
					subjectName: values.subjectName,
					gradeLevel: values.gradeLevel,
					sectionName: values.sectionName,
					quarter: values.quarter as Quarter,
					roomNumber: values.roomNumber,
					slots: validSlots.length ? validSlots : undefined,
					weights,
				});
				toast.push({
					type: "success",
					title: "Class created",
					message: "The class is now visible to the assigned teacher.",
				});
			}
			handleClose();
		} catch (err: unknown) {
			const msg = (err as { response?: { data?: { message?: string } } })?.response
				?.data?.message;
			toast.push({
				type: "error",
				title: isEdit ? "Failed to update class" : "Failed to create class",
				message: msg ?? "Please try again.",
			});
		}
	};

	const pending =
		isSubmitting || createMutation.isPending || updateMutation.isPending;

	return (
		<Modal
			open={open}
			onClose={handleClose}
			title={isEdit ? "Edit class" : "Create a new class"}
			subtitle={
				isEdit
					? "Update schedule, room, quarter, or grading weights"
					: "Assign a teacher and configure the class"
			}
			width="max-w-2xl"
			footer={
				<>
					<Btn variant="ghost" onClick={handleClose}>
						Cancel
					</Btn>
					<Btn
						variant="primary"
						icon={isEdit ? "save" : "plus"}
						onClick={() => void handleSubmit(onSubmit)()}
						disabled={pending}
					>
						{pending
							? isEdit
								? "Saving…"
								: "Creating…"
							: isEdit
								? "Save changes"
								: "Create class"}
					</Btn>
				</>
			}
		>
			<form className="grid grid-cols-2 gap-3" noValidate>
				<div className="col-span-2">
					<Field label="Assigned teacher" required error={errors.teacherId?.message}>
						<Select
							{...register("teacherId")}
							disabled={isEdit}
						>
							<option value="">
								{facultyQuery.isLoading ? "Loading faculty…" : "Select a teacher"}
							</option>
							{teachers.map((t) => (
								<option key={t.id} value={t.id}>
									{t.name} · {t.role.replace("_", " ")}
								</option>
							))}
						</Select>
					</Field>
					{isEdit && (
						<p className="text-[11px] text-muted mt-1 leading-snug">
							Use "Reassign teacher" from the row menu to change the teacher.
						</p>
					)}
				</div>

				<div>
					<Field label="Grade level" required error={errors.gradeLevel?.message}>
						<GradeLevelCombobox
							value={selectedGradeId}
							onChange={(value) =>
								setValue("gradeLevel", value, { shouldValidate: true })
							}
							disabled={isEdit}
						/>
					</Field>
					{selectedGradeLevel && (
						<p className="text-[11px] text-muted mt-1 leading-snug">
							{selectedGradeLevel.description}
						</p>
					)}
				</div>
				<Field label="Subject name" required error={errors.subjectName?.message}>
					<SubjectCombobox
						value={subjectNameValue}
						onChange={(v) => setValue("subjectName", v, { shouldValidate: true })}
						subjects={suggestedSubjects}
						placeholder="e.g. Science"
						disabled={isEdit}
					/>
				</Field>

				<Field label="Section name" required error={errors.sectionName?.message}>
					<TextInput
						placeholder="e.g. Mabini"
						{...register("sectionName")}
						disabled={isEdit}
					/>
				</Field>
				<Field label="Room" error={errors.roomNumber?.message}>
					<TextInput placeholder="e.g. Room 207" {...register("roomNumber")} />
				</Field>
				<Field label="Quarter" required error={errors.quarter?.message}>
					<Select {...register("quarter")}>
						{(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => (
							<option key={q}>{q}</option>
						))}
					</Select>
				</Field>

				<div className="col-span-2 mt-1">
					<div className="text-[12px] font-semibold text-navy mb-2">
						Schedule{" "}
						<span className="text-muted font-normal">
							(optional — leave blank to add later)
						</span>
					</div>
					<ClassSlotsEditor
						slots={slots}
						defaultRoom={watch("roomNumber") ?? ""}
						onChange={setSlots}
					/>
				</div>

				<div className="col-span-2 mt-2">
					<div className="text-[12px] font-semibold text-navy mb-2">
						Component weights{" "}
						<span className="text-muted font-normal">(must total 100%)</span>
					</div>
					<div className="grid grid-cols-3 gap-3">
						<Field label="Written Works %" required error={errors.wwPct?.message}>
							<TextInput type="number" min={1} max={98} {...register("wwPct")} />
						</Field>
						<Field
							label="Performance Tasks %"
							required
							error={errors.ptPct?.message}
						>
							<TextInput type="number" min={1} max={98} {...register("ptPct")} />
						</Field>
						<Field
							label="Quarterly Assessment %"
							required
							error={errors.qaPct?.message}
						>
							<TextInput type="number" min={1} max={98} {...register("qaPct")} />
						</Field>
					</div>
					<ComponentWeightBar
						ww={ww ?? 0}
						pt={pt ?? 0}
						qa={qa ?? 0}
						height={10}
						className="mt-3"
					/>
					<div
						className={`text-[11px] mt-1 font-mono ${
							weightSum === 100 ? "text-emerald-600" : "text-red-500"
						}`}
					>
						Sum: {weightSum}% {weightSum === 100 ? "✓" : "(must be 100%)"}
					</div>
					{errors.qaPct?.message && (
						<p className="text-[12px] text-red-500 mt-1">
							{errors.qaPct.message}
						</p>
					)}
				</div>
			</form>
		</Modal>
	);
}
