// @ts-nocheck
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
import { useCreateClassLoad } from "../../modules/classrooms/useClassLoads";
import { gradeLevels } from "../../data/phEducation";
import { GradeLevelCombobox } from "./GradeLevelCombobox";
import { SubjectCombobox } from "./SubjectCombobox";

const createSchema = z
	.object({
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

type CreateFormValues = z.infer<typeof createSchema>;

interface CreateClassModalProps {
	open: boolean;
	onClose: () => void;
}

export function CreateClassModal({ open, onClose }: CreateClassModalProps) {
	const toast = useToast();
	const createMutation = useCreateClassLoad();

	const {
		register,
		handleSubmit,
		watch,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<CreateFormValues>({
		resolver: zodResolver(createSchema),
		defaultValues: {
			wwPct: 20,
			ptPct: 60,
			qaPct: 20,
			quarter: "Q1",
			gradeLevel: 7,
		},
	});

	const [ww, pt, qa] = watch(["wwPct", "ptPct", "qaPct"]);
	const weightSum =
		(parseFloat(ww) ?? 0) + (parseFloat(pt) ?? 0) + (parseFloat(qa) ?? 0);

	const selectedGradeId = watch("gradeLevel");
	const subjectNameValue = watch("subjectName") ?? "";
	const selectedGradeLevel = gradeLevels.find(
		(g) => g.value === selectedGradeId,
	);
	const suggestedSubjects = selectedGradeLevel?.subjects ?? [];

	const handleClose = () => {
		onClose();
		reset();
	};

	const onSubmit = async (values: CreateFormValues) => {
		try {
			await createMutation.mutateAsync({
				subjectName: values.subjectName,
				gradeLevel: values.gradeLevel,
				sectionName: values.sectionName,
				quarter: values.quarter,
				roomNumber: values.roomNumber,
				weights: {
					ww: values.wwPct / 100,
					pt: values.ptPct / 100,
					qa: values.qaPct / 100,
				},
			});
			toast.push({
				type: "success",
				title: "Class created",
				message: "You can now take attendance and enter grades.",
			});
			handleClose();
		} catch (err: unknown) {
			const msg = (err as { response?: { data?: { message?: string } } })
				?.response?.data?.message;
			toast.push({
				type: "error",
				title: "Failed to create class",
				message: msg ?? "Please try again.",
			});
		}
	};

	return (
		<Modal
			open={open}
			onClose={handleClose}
			title="Create a new class load"
			subtitle="Fill in to add a new section to your assignments"
			width="max-w-2xl"
			footer={
				<>
					<Btn variant="ghost" onClick={handleClose}>
						Cancel
					</Btn>
					<Btn
						variant="primary"
						icon="plus"
						onClick={() => void handleSubmit(onSubmit)()}
						disabled={isSubmitting || createMutation.isPending}
					>
						{isSubmitting || createMutation.isPending
							? "Creating…"
							: "Create class"}
					</Btn>
				</>
			}
		>
			<form className="grid grid-cols-2 gap-3" noValidate>
				<div>
					<Field
						label="Grade level"
						required
						error={errors.gradeLevel?.message}
					>
						<GradeLevelCombobox
							value={selectedGradeId}
							onChange={(value) =>
								setValue("gradeLevel", value, {
									shouldValidate: true,
								})
							}
						/>
					</Field>
					{selectedGradeLevel && (
						<p className="text-[11px] text-muted mt-1 leading-snug">
							{selectedGradeLevel.description}
						</p>
					)}
				</div>
				<Field
					label="Subject name"
					required
					error={errors.subjectName?.message}
				>
					<SubjectCombobox
						value={subjectNameValue}
						onChange={(v) =>
							setValue("subjectName", v, { shouldValidate: true })
						}
						subjects={suggestedSubjects}
						placeholder="e.g. Science"
					/>
				</Field>

				<Field
					label="Section name"
					required
					error={errors.sectionName?.message}
				>
					<TextInput
						placeholder="e.g. Mabini"
						{...register("sectionName")}
					/>
				</Field>
				<Field label="Room" error={errors.roomNumber?.message}>
					<TextInput
						placeholder="e.g. Room 207"
						{...register("roomNumber")}
					/>
				</Field>
				<Field label="Quarter" required error={errors.quarter?.message}>
					<Select {...register("quarter")}>
						{(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => (
							<option key={q}>{q}</option>
						))}
					</Select>
				</Field>

				<div className="col-span-2 mt-2">
					<div className="text-[12px] font-semibold text-navy mb-2">
						Component weights{" "}
						<span className="text-muted font-normal">
							(must total 100%)
						</span>
					</div>
					<div className="grid grid-cols-3 gap-3">
						<Field
							label="Written Works %"
							required
							error={errors.wwPct?.message}
						>
							<TextInput
								type="number"
								min={1}
								max={98}
								{...register("wwPct")}
							/>
						</Field>
						<Field
							label="Performance Tasks %"
							required
							error={errors.ptPct?.message}
						>
							<TextInput
								type="number"
								min={1}
								max={98}
								{...register("ptPct")}
							/>
						</Field>
						<Field
							label="Quarterly Assessment %"
							required
							error={errors.qaPct?.message}
						>
							<TextInput
								type="number"
								min={1}
								max={98}
								{...register("qaPct")}
							/>
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
						className={`text-[11px] mt-1 font-mono ${weightSum === 100 ? "text-emerald-600" : "text-red-500"}`}
					>
						Sum: {weightSum}%{" "}
						{weightSum === 100 ? "✓" : "(must be 100%)"}
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
