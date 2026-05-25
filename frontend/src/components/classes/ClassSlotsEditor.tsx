import { useEffect, useRef, useState } from "react";
import { Btn, Icon, TextInput } from "..";
import type { ClassScheduleSlot } from "../../shared/types";

const DAY_OPTIONS = [
	{ label: "Mon", value: 1 },
	{ label: "Tue", value: 2 },
	{ label: "Wed", value: 3 },
	{ label: "Thu", value: 4 },
	{ label: "Fri", value: 5 },
	{ label: "Sat", value: 6 },
];

interface ClassSlotsEditorProps {
	slots: ClassScheduleSlot[];
	defaultRoom: string;
	onChange: (slots: ClassScheduleSlot[]) => void;
}

interface SlotRow {
	key: string;
	days: number[];
	timeStart: string;
	timeEnd: string;
	room: string;
	idsByDay: Record<number, string>;
}

let rowKeySeq = 0;
const nextKey = () => `row-${++rowKeySeq}`;

function signatureOf(slot: ClassScheduleSlot): string {
	return `${slot.timeStart}|${slot.timeEnd}|${slot.room ?? ""}`;
}

function groupSlotsToRows(slots: ClassScheduleSlot[]): SlotRow[] {
	const order: string[] = [];
	const buckets = new Map<string, SlotRow>();
	for (const slot of slots) {
		const sig = signatureOf(slot);
		let row = buckets.get(sig);
		if (!row) {
			row = {
				key: nextKey(),
				days: [],
				timeStart: slot.timeStart,
				timeEnd: slot.timeEnd,
				room: slot.room ?? "",
				idsByDay: {},
			};
			buckets.set(sig, row);
			order.push(sig);
		}
		if (!row.days.includes(slot.dayOfWeek)) {
			row.days.push(slot.dayOfWeek);
		}
		if (slot.id) row.idsByDay[slot.dayOfWeek] = slot.id;
	}
	return order.map((sig) => {
		const row = buckets.get(sig)!;
		row.days.sort((a, b) => a - b);
		return row;
	});
}

function flattenRows(rows: SlotRow[]): ClassScheduleSlot[] {
	const out: ClassScheduleSlot[] = [];
	for (const row of rows) {
		const days = [...row.days].sort((a, b) => a - b);
		for (const d of days) {
			const slot: ClassScheduleSlot = {
				dayOfWeek: d,
				timeStart: row.timeStart,
				timeEnd: row.timeEnd,
				room: row.room,
			};
			const id = row.idsByDay[d];
			if (id) slot.id = id;
			out.push(slot);
		}
	}
	return out;
}

function isRowTimeInvalid(row: SlotRow): string | null {
	if (!row.timeStart || !row.timeEnd) return null;
	const [sh, sm] = row.timeStart.split(":").map(Number);
	const [eh, em] = row.timeEnd.split(":").map(Number);
	if (eh * 60 + em <= sh * 60 + sm) return "End must be after start";
	return null;
}

export function ClassSlotsEditor({
	slots,
	defaultRoom,
	onChange,
}: ClassSlotsEditorProps) {
	const [rows, setRows] = useState<SlotRow[]>(() => groupSlotsToRows(slots));
	const lastEmittedRef = useRef<string>(JSON.stringify(flattenRows(rows)));

	useEffect(() => {
		const incoming = JSON.stringify(slots);
		if (incoming !== lastEmittedRef.current) {
			const grouped = groupSlotsToRows(slots);
			setRows(grouped);
			lastEmittedRef.current = JSON.stringify(flattenRows(grouped));
		}
	}, [slots]);

	const commit = (next: SlotRow[]) => {
		setRows(next);
		const flat = flattenRows(next);
		lastEmittedRef.current = JSON.stringify(flat);
		onChange(flat);
	};

	const updateRow = (idx: number, patch: Partial<SlotRow>) => {
		commit(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
	};

	const toggleDay = (idx: number, day: number) => {
		const row = rows[idx];
		const has = row.days.includes(day);
		const days = has
			? row.days.filter((d) => d !== day)
			: [...row.days, day].sort((a, b) => a - b);
		updateRow(idx, { days });
	};

	const removeRow = (idx: number) => {
		commit(rows.filter((_, i) => i !== idx));
	};

	const addRow = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();
		commit([
			...rows,
			{
				key: nextKey(),
				days: [1],
				timeStart: "",
				timeEnd: "",
				room: "",
				idsByDay: {},
			},
		]);
	};

	return (
		<div className="space-y-2">
			{rows.length === 0 && (
				<div className="text-[12px] text-muted italic px-1 py-2">
					No schedule slots yet. Click "Add schedule slot" to add one.
				</div>
			)}
			{rows.map((row, idx) => {
				const timeError = isRowTimeInvalid(row);
				const noDays = row.days.length === 0;
				return (
					<div
						key={row.key}
						className="rounded-md border border-line bg-white p-2"
					>
						<div className="mb-2">
							<div className="text-[11px] font-semibold text-navy mb-1">
								Days
							</div>
							<div className="flex flex-wrap gap-1.5">
								{DAY_OPTIONS.map((d) => {
									const checked = row.days.includes(d.value);
									return (
										<button
											key={d.value}
											type="button"
											aria-pressed={checked}
											onClick={() => toggleDay(idx, d.value)}
											className={
												"h-8 px-2.5 rounded-md border text-[12px] transition-colors " +
												(checked
													? "border-navy bg-navy/10 text-navy font-semibold"
													: "border-line bg-white text-muted hover:border-navy/40 hover:text-navy")
											}
										>
											{d.label}
										</button>
									);
								})}
							</div>
						</div>
						<div className="grid grid-cols-[1fr_1fr_1.1fr_auto] gap-2 items-end">
							<div>
								<div className="text-[11px] font-semibold text-navy mb-1">
									Start
								</div>
								<TextInput
									type="time"
									value={row.timeStart}
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>,
									) =>
										updateRow(idx, {
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
									value={row.timeEnd}
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>,
									) =>
										updateRow(idx, {
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
									value={row.room}
									placeholder={defaultRoom || "e.g. 207"}
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>,
									) =>
										updateRow(idx, {
											room: e.target.value,
										})
									}
								/>
							</div>
							<button
								type="button"
								onClick={() => removeRow(idx)}
								className="h-9 w-9 flex items-center justify-center rounded-md border border-line bg-white text-muted hover:text-rose-500 hover:border-rose-300"
								aria-label="Remove slot"
							>
								<Icon name="trash-2" size={15} />
							</button>
						</div>
						{noDays && (
							<div className="text-[11px] text-rose-500 mt-1.5 pl-1">
								Pick at least one day
							</div>
						)}
						{timeError && (
							<div className="text-[11px] text-rose-500 mt-1.5 pl-1">
								{timeError}
							</div>
						)}
					</div>
				);
			})}
			<Btn variant="ghost" icon="plus" onClick={addRow}>
				Add schedule slot
			</Btn>
		</div>
	);
}
