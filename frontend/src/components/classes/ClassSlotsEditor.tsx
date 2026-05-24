import { Btn, Icon, Select, TextInput } from "..";
import type { ClassScheduleSlot } from "../../shared/types";

const DAY_OPTIONS = [
	{ label: "Monday", value: 1 },
	{ label: "Tuesday", value: 2 },
	{ label: "Wednesday", value: 3 },
	{ label: "Thursday", value: 4 },
	{ label: "Friday", value: 5 },
	{ label: "Saturday", value: 6 },
];

interface ClassSlotsEditorProps {
	slots: ClassScheduleSlot[];
	defaultRoom: string;
	onChange: (slots: ClassScheduleSlot[]) => void;
}

function isSlotInvalid(slot: ClassScheduleSlot): string | null {
	if (!slot.timeStart || !slot.timeEnd) return null;
	const [sh, sm] = slot.timeStart.split(":").map(Number);
	const [eh, em] = slot.timeEnd.split(":").map(Number);
	if (eh * 60 + em <= sh * 60 + sm) return "End must be after start";
	return null;
}

export function ClassSlotsEditor({
	slots,
	defaultRoom,
	onChange,
}: ClassSlotsEditorProps) {
	const updateSlot = (idx: number, patch: Partial<ClassScheduleSlot>) => {
		const next = slots.map((s, i) => (i === idx ? { ...s, ...patch } : s));
		onChange(next);
	};

	const removeSlot = (idx: number) => {
		onChange(slots.filter((_, i) => i !== idx));
	};

	const addSlot = (e) => {
		e.preventDefault();
		e.stopPropagation();
		onChange([
			...slots,
			{ dayOfWeek: 1, timeStart: "", timeEnd: "", room: "" },
		]);
	};

	return (
		<div className="space-y-2">
			{slots.length === 0 && (
				<div className="text-[12px] text-muted italic px-1 py-2">
					No schedule slots yet. Click "Add schedule slot" to add one.
				</div>
			)}
			{slots.map((slot, idx) => {
				const error = isSlotInvalid(slot);
				return (
					<div
						key={slot.id ?? `new-${idx}`}
						className="rounded-md border border-line bg-white p-2"
					>
						<div className="grid grid-cols-[1.2fr_1fr_1fr_1.1fr_auto] gap-2 items-end">
							<div>
								<div className="text-[11px] font-semibold text-navy mb-1">
									Day
								</div>
								<Select
									value={slot.dayOfWeek}
									onChange={(
										e: React.ChangeEvent<HTMLSelectElement>,
									) =>
										updateSlot(idx, {
											dayOfWeek: Number(e.target.value),
										})
									}
								>
									{DAY_OPTIONS.map((d) => (
										<option key={d.value} value={d.value}>
											{d.label}
										</option>
									))}
								</Select>
							</div>
							<div>
								<div className="text-[11px] font-semibold text-navy mb-1">
									Start
								</div>
								<TextInput
									type="time"
									value={slot.timeStart}
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>,
									) =>
										updateSlot(idx, {
											timeStart: e.target.value,
										})
									}
								/>
							</div>
							<div>
								<div className="text-[11px] font-semibold text-navy mb-1">
									End
								</div>
								<TextInput
									type="time"
									value={slot.timeEnd}
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>,
									) =>
										updateSlot(idx, {
											timeEnd: e.target.value,
										})
									}
								/>
							</div>
							<div>
								<div className="text-[11px] font-semibold text-navy mb-1">
									Room
								</div>
								<TextInput
									value={slot.room ?? ""}
									placeholder={defaultRoom || "e.g. 207"}
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>,
									) =>
										updateSlot(idx, {
											room: e.target.value,
										})
									}
								/>
							</div>
							<button
								type="button"
								onClick={() => removeSlot(idx)}
								className="h-9 w-9 flex items-center justify-center rounded-md border border-line bg-white text-muted hover:text-rose-500 hover:border-rose-300"
								aria-label="Remove slot"
							>
								<Icon name="trash-2" size={15} />
							</button>
						</div>
						{error && (
							<div className="text-[11px] text-rose-500 mt-1.5 pl-1">
								{error}
							</div>
						)}
					</div>
				);
			})}
			<Btn variant="ghost" icon="plus" onClick={addSlot}>
				Add schedule slot
			</Btn>
		</div>
	);
}
