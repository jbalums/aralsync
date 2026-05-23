import { ArrowLeft } from "lucide-react";

interface Props {
	title: string;
	subtitle?: string;
	version: string;
	effectiveDate: string;
	children: React.ReactNode;
}

export function LegalLayout({
	title,
	subtitle,
	version,
	effectiveDate,
	children,
}: Props) {
	return (
		<div className="min-h-screen bg-white">
			<header className="sticky top-0 z-30 bg-white border-b border-slate-200">
				<div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
					<a href="/" className="flex items-center">
						<img
							src="/icon.png"
							alt="AralSync"
							style={{ height: "36px", objectFit: "contain" }}
							draggable={false}
						/>
						<img
							src="/wordmark.png"
							alt="AralSync"
							style={{ height: "22px", objectFit: "contain" }}
							draggable={false}
						/>
					</a>
					<a
						href="/"
						className="flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
					>
						<ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
						Back to home
					</a>
				</div>
			</header>

			<main className="max-w-3xl mx-auto px-6 py-14 pb-24">
				<div className="mb-10 pb-8 border-b border-slate-200">
					<h1 className="text-3xl font-bold text-navy mb-2">
						{title}
					</h1>
					{subtitle && (
						<p className="text-[15px] text-slate-500 mb-3">
							{subtitle}
						</p>
					)}
					<div className="flex items-center gap-3 text-[12.5px] text-slate-400 font-medium">
						<span>Version {version}</span>
						<span>·</span>
						<span>Effective {effectiveDate}</span>
						<span>·</span>
						<span>AralSync </span>
					</div>
				</div>
				{children}
			</main>

			<footer className="border-t border-slate-200 bg-slate-50">
				<div className="max-w-3xl mx-auto px-6 py-8 text-[12px] text-slate-400 flex items-center justify-between flex-wrap gap-3">
					<span>© 2026 AralSync · Philippines</span>
					<div className="flex items-center gap-5">
						<a
							href="/privacy"
							className="hover:text-slate-700 transition-colors"
						>
							Privacy Policy
						</a>
						<a
							href="/terms"
							className="hover:text-slate-700 transition-colors"
						>
							Terms of Service
						</a>
						<a
							href="/data-policy"
							className="hover:text-slate-700 transition-colors"
						>
							Data Policy
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}

// ── Shared prose primitives ────────────────────────────────────────────────

export function Sec({
	id,
	num,
	title,
	children,
}: {
	id?: string;
	num: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section id={id} className="mb-10">
			<h2 className="text-[17px] font-bold text-navy mb-4 pb-2 border-b border-slate-200">
				<span className="text-slate-400 font-normal mr-2">{num}.</span>
				{title}
			</h2>
			{children}
		</section>
	);
}

export function Sub({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="mb-5">
			<h3 className="text-[14.5px] font-semibold text-navy mb-2">
				{title}
			</h3>
			{children}
		</div>
	);
}

export function P({ children }: { children: React.ReactNode }) {
	return (
		<p className="text-[14.5px] text-slate-600 leading-relaxed mb-3">
			{children}
		</p>
	);
}

export function Ul({ children }: { children: React.ReactNode }) {
	return (
		<ul className="list-disc list-outside ml-5 space-y-1.5 text-[14.5px] text-slate-600 mb-4">
			{children}
		</ul>
	);
}

export function Ol({ children }: { children: React.ReactNode }) {
	return (
		<ol className="list-decimal list-outside ml-5 space-y-1.5 text-[14.5px] text-slate-600 mb-4">
			{children}
		</ol>
	);
}

export function LegalTable({
	heads,
	rows,
}: {
	heads: string[];
	rows: string[][];
}) {
	return (
		<div className="overflow-x-auto my-4 rounded-lg border border-slate-200">
			<table className="w-full text-[13px]">
				<thead className="bg-slate-50">
					<tr>
						{heads.map((h) => (
							<th
								key={h}
								className="text-left px-4 py-2.5 font-semibold text-navy border-b border-slate-200"
							>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, i) => (
						<tr
							key={i}
							className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
						>
							{row.map((cell, j) => (
								<td
									key={j}
									className="px-4 py-2.5 text-slate-600 align-top"
								>
									{cell}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function Note({ children }: { children: React.ReactNode }) {
	return (
		<div className="my-4 px-4 py-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg text-[13.5px] text-blue-800 leading-relaxed">
			{children}
		</div>
	);
}

export function Placeholder({ children }: { children: React.ReactNode }) {
	return (
		<span className="inline-block px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[12px] font-mono font-medium">
			{children}
		</span>
	);
}
