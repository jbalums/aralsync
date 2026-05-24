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
import { useUpdateClassLoad } from "../../modules/classrooms/useClassLoads";
import type { ClassLoadDetail, ClassScheduleSlot } from "../../shared/types";
import { ClassSlotsEditor } from "./ClassSlotsEditor";

const settingsSchema = z
	.object({
		roomNumber: z.string().default(""),
		quarter: z.enum(["Q1", "Q2", "Q3", "Q4"]),
		wwPct: z.coerce.number().int().min(1).max(98),
		ptPct: z.coerce.number().int().min(1).max(98),
		qaPct: z.coerce.number().int().min(1).max(98),
	})
	.refine((d) => d.wwPct + d.ptPct + d.qaPct === 100, {
		message: "Component weights must total 100%",
		path: ["qaPct"],
	});

type SettingsFormValues = z.infer<typeof settingsSchema>;

function hydrateSlots(cls: ClassLoadDetail): ClassScheduleSlot[] {
	if (cls.slots?.length) {
		return cls.slots.map((s) => ({ ...s }));
	}
	const legacy = cls.schedule;
	if (legacy?.dayOfWeek?.length && legacy.timeStart && legacy.timeEnd) {
		return legacy.dayOfWeek.map((day) => ({
			dayOfWeek: day,
			timeStart: legacy.timeStart,
			timeEnd: legacy.timeEnd,
			room: cls.roomNumber ?? "",
		}));
	}
	return [];
}

interface ClassSettingsModalProps {
	open: boolean;
	onClose: () => void;
	cls: ClassLoadDetail;
}

export function ClassSettingsModal({ open, onClose, cls }: ClassSettingsModalProps) {
	const toast = useToast();
	const updateMutation = useUpdateClassLoad(cls.id);
	const [slots, setSlots] = useState<ClassScheduleSlot[]>(() => hydrateSlots(cls));

	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<SettingsFormValues>({
		resolver: zodResolver(settingsSchema),
		defaultValues: {
			roomNumber: cls.roomNumber ?? "",
			quarter: cls.quarter,
			wwPct: Math.round(cls.wwWeight * 100),
			ptPct: Math.round(cls.ptWeight * 100),
			qaPct: Math.round(cls.qaWeight * 100),
		},
	});

	useEffect(() => {
		if (open) {
			reset({
				roomNumber: cls.roomNumber ?? "",
				quarter: cls.quarter,
				wwPct: Math.round(cls.wwWeight * 100),
				ptPct: Math.round(cls.ptWeight * 100),
				qaPct: Math.round(cls.qaWeight * 100),
			});
			setSlots(hydrateSlots(cls));
		}
	}, [open]);

	const [ww, pt, qa] = watch(["wwPct", "ptPct", "qaPct"]);
	const weightSum =
		(parseFloat(ww) ?? 0) + (parseFloat(pt) ?? 0) + (parseFloat(qa) ?? 0);

	const handleClose = () => {
		onClose();
	};

	const slotsValid = slots.every((s) => {
		if (!s.timeStart || !s.timeEnd) return false;
		const [sh, sm] = s.timeStart.split(":").map(Number);
		const [eh, em] = s.timeEnd.split(":").map(Number);
		return eh * 60 + em > sh * 60 + sm;
	});

	const onSubmit = async (values: SettingsFormValues) => {
		if (!slotsValid) {
			toast.push({
				type: "error",
				title: "Invalid schedule",
				message: "Each slot needs a valid start and end time.",
			});
			return;
		}
		try {
			await updateMutation.mutateAsync({
				roomNumber: values.roomNumber,
				quarter: values.quarter,
				weights: {
					ww: values.wwPct / 100,
					pt: values.ptPct / 100,
					qa: values.qaPct / 100,
				},
				slots,
			});
			toast.push({
				type: "success",
				title: "Class updated",
				message: "Settings saved and schedule synced.",
			});
			handleClose();
		} catch (err: unknown) {
			const msg = (err as { response?: { data?: { message?: string } } })
				?.response?.data?.message;
			toast.push({
				type: "error",
				title: "Failed to save",
				message: msg ?? "Please try again.",
			});
		}
	};

	return (
		<Modal
			open={open}
			onClose={handleClose}
			title="Class settings"
			subtitle={`${cls.subject.name} · ${cls.section.gradeLevel} – ${cls.section.name}`}
			width="max-w-2xl"
			footer={
				<>
					<Btn variant="ghost" onClick={handleClose}>
						Cancel
					</Btn>
					<Btn
						variant="primary"
						icon="save"
						onClick={() => void handleSubmit(onSubmit)()}
						disabled={isSubmitting || updateMutation.isPending}
					>
						{isSubmitting || updateMutation.isPending
							? "Saving…"
							: "Save settings"}
					</Btn>
				</>
			}
		>
			<form className="grid grid-cols-2 gap-3" noValidate>
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

				<div className="col-span-2">
					<div className="text-[12px] font-semibold text-navy mb-2">
						Schedule slots{" "}
						<span className="text-muted font-normal">
							(add one row per meeting day/time)
						</span>
					</div>
					<ClassSlotsEditor
						slots={slots}
						defaultRoom={watch("roomNumber") ?? cls.roomNumber ?? ""}
						onChange={setSlots}
					/>
				</div>

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
