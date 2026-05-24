// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { Icon } from "..";
import { gradeLevels } from "../../data/phEducation";

const JHS_SHS_LEVELS = gradeLevels.filter((g) => g.value >= 7);

interface GradeLevelComboboxProps {
	value: number;
	onChange: (value: number) => void;
}

export function GradeLevelCombobox({ value, onChange }: GradeLevelComboboxProps) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const ref = useRef(null);

	const selected = JHS_SHS_LEVELS.find((g) => g.value === value);
	const filtered = query.trim()
		? JHS_SHS_LEVELS.filter((g) =>
				g.label.toLowerCase().includes(query.toLowerCase()),
			)
		: JHS_SHS_LEVELS;

	useEffect(() => {
		if (!open) return;
		const onMouse = (e) => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		};
		const onKey = (e) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", onMouse);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onMouse);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	return (
		<div className="relative" ref={ref}>
			<div
				className="w-full h-9 px-3 text-[13px] rounded-md border border-line bg-white hover:border-slate-300 tx flex items-center gap-2 cursor-pointer select-none"
				onClick={() => {
					setOpen((o) => !o);
					setQuery("");
				}}
			>
				<span
					className={`flex-1 truncate ${selected ? "text-navy" : "text-muted-light"}`}
				>
					{selected ? selected.label : "Select grade level"}
				</span>
				<Icon
					name="chevron-down"
					size={14}
					className={`text-muted shrink-0 tx ${open ? "rotate-180" : ""}`}
				/>
			</div>
			{open && (
				<div className="absolute z-50 w-full mt-1 bg-white border border-line rounded-md shadow-lg overflow-hidden">
					<div className="p-2 border-b border-line">
						<input
							autoFocus
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search grade levels…"
							className="w-full h-8 px-2.5 text-[12px] rounded border border-line focus:border-primary focus:outline-none"
						/>
					</div>
					<div className="max-h-52 overflow-y-auto">
						{filtered.length === 0 ? (
							<div className="px-3 py-3 text-[12px] text-muted text-center">
								No results
							</div>
						) : (
							filtered.map((g) => (
								<button
									key={g.id}
									type="button"
									onClick={() => {
										onChange(g.value);
										setOpen(false);
										setQuery("");
									}}
									className={`w-full text-left px-3 py-2 text-[13px] hover:bg-surface flex items-center justify-between gap-2 ${
										value === g.value
											? "bg-primary-light text-primary-dark font-semibold"
											: "text-navy"
									}`}
								>
									{g.label}
									{value === g.value && <Icon name="check" size={13} />}
								</button>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}
