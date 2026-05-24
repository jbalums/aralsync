// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { Icon } from "..";

interface SubjectComboboxProps {
	value: string;
	onChange: (value: string) => void;
	subjects: string[];
	placeholder: string;
}

export function SubjectCombobox({
	value,
	onChange,
	subjects,
	placeholder,
}: SubjectComboboxProps) {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);

	const filtered = subjects.length
		? value.trim()
			? subjects.filter((s) =>
					s.toLowerCase().includes(value.toLowerCase()),
				)
			: subjects
		: [];

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
			<input
				value={value}
				onChange={(e) => {
					onChange(e.target.value);
					if (subjects.length > 0) setOpen(true);
				}}
				onFocus={() => {
					if (subjects.length > 0) setOpen(true);
				}}
				placeholder={placeholder}
				className="w-full h-9 px-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none tx placeholder:text-muted-light"
			/>
			{open && filtered.length > 0 && (
				<div className="absolute z-50 w-full mt-1 bg-white border border-line rounded-md shadow-lg overflow-hidden">
					<div className="max-h-52 overflow-y-auto">
						{filtered.map((s) => (
							<button
								key={s}
								type="button"
								onClick={() => {
									onChange(s);
									setOpen(false);
								}}
								className={`w-full text-left px-3 py-2 text-[13px] hover:bg-surface flex items-center justify-between gap-2 ${
									value === s
										? "bg-primary-light text-primary-dark font-semibold"
										: "text-navy"
								}`}
							>
								{s}
								{value === s && <Icon name="check" size={13} />}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
