// @ts-nocheck
import { useEffect } from "react";
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
import type { ClassLoadDetail } from "../../shared/types";

const settingsSchema = z
	.object({
		roomNumber: z.string().default(""),
		quarter: z.enum(["Q1", "Q2", "Q3", "Q4"]),
		wwPct: z.coerce.number().int().min(1).max(98),
		ptPct: z.coerce.number().int().min(1).max(98),
		qaPct: z.coerce.number().int().min(1).max(98),
		timeStart: z.string().default(""),
		timeEnd: z.string().default(""),
		dayOfWeek: z.array(z.number().int().min(1).max(6)).default([]),
	})
	.refine((d) => d.wwPct + d.ptPct + d.qaPct === 100, {
		message: "Component weights must total 100%",
		path: ["qaPct"],
	});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const DAY_LABELS = [
	{ label: "Mon", value: 1 },
	{ label: "Tue", value: 2 },
	{ label: "Wed", value: 3 },
	{ label: "Thu", value: 4 },
	{ label: "Fri", value: 5 },
	{ label: "Sat", value: 6 },
];

interface ClassSettingsModalProps {
	open: boolean;
	onClose: () => void;
	cls: ClassLoadDetail;
}

export function ClassSettingsModal({ open, onClose, cls }: ClassSettingsModalProps) {
	const toast = useToast();
	const updateMutation = useUpdateClassLoad(cls.id);

	const {
		register,
		handleSubmit,
		watch,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<SettingsFormValues>({
		resolver: zodResolver(settingsSchema),
		defaultValues: {
			roomNumber: cls.roomNumber ?? "",
			quarter: cls.quarter,
			wwPct: Math.round(cls.wwWeight * 100),
			ptPct: Math.round(cls.ptWeight * 100),
			qaPct: Math.round(cls.qaWeight * 100),
			timeStart: cls.schedule?.timeStart ?? "",
			timeEnd: cls.schedule?.timeEnd ?? "",
			dayOfWeek: cls.schedule?.dayOfWeek ?? [],
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
				timeStart: cls.schedule?.timeStart ?? "",
				timeEnd: cls.schedule?.timeEnd ?? "",
				dayOfWeek: cls.schedule?.dayOfWeek ?? [],
			});
		}
	}, [open]);

	const [ww, pt, qa] = watch(["wwPct", "ptPct", "qaPct"]);
	const weightSum =
		(parseFloat(ww) ?? 0) + (parseFloat(pt) ?? 0) + (parseFloat(qa) ?? 0);
	const selectedDays = watch("dayOfWeek") ?? [];

	const toggleDay = (v: number) => {
		const current = selectedDays;
		setValue(
			"dayOfWeek",
			current.includes(v)
				? current.filter((d) => d !== v)
				: [...current, v].sort(),
			{ shouldValidate: true },
		);
	};

	const handleClose = () => {
		onClose();
	};

	const onSubmit = async (values: SettingsFormValues) => {
		try {
			await updateMutation.mutateAsync({
				roomNumber: values.roomNumber,
				quarter: values.quarter,
				weights: {
					ww: values.wwPct / 100,
					pt: values.ptPct / 100,
					qa: values.qaPct / 100,
				},
				schedule: {
					dayOfWeek: values.dayOfWeek,
					timeStart: values.timeStart,
					timeEnd: values.timeEnd,
				},
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

				<Field label="Time start" error={errors.timeStart?.message}>
					<TextInput type="time" {...register("timeStart")} />
				</Field>
				<Field label="Time end" error={errors.timeEnd?.message}>
					<TextInput type="time" {...register("timeEnd")} />
				</Field>

				<div className="col-span-2">
					<div className="text-[12px] font-semibold text-navy mb-2">
						Days of week
					</div>
					<div className="flex gap-2 flex-wrap">
						{DAY_LABELS.map(({ label, value }) => {
							const active = selectedDays.includes(value);
							return (
								<button
									key={value}
									type="button"
									onClick={() => toggleDay(value)}
									className={`px-3 h-8 rounded-md text-[12.5px] font-semibold transition-colors border ${
										active
											? "bg-navy text-white border-navy"
											: "bg-white text-navy border-line hover:bg-surface"
									}`}
								>
									{label}
								</button>
							);
						})}
					</div>
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
