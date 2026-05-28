// @ts-nocheck
import React, {
	useState,
	useEffect,
	useRef,
	useMemo,
	useCallback,
	createContext,
	useContext,
} from "react";
import * as LucideIcons from "lucide-react";
import { SUBJECT_COLORS } from "../data/mockData";

// Lucide name (kebab-case) → React component (PascalCase)
function lucideName(name) {
	return name
		.split("-")
		.map((w) => w[0].toUpperCase() + w.slice(1))
		.join("");
}

// Icon: thin wrapper over lucide-react so we can keep <Icon name="x"/> call sites.
export function Icon({
	name,
	className = "",
	size = 18,
	strokeWidth = 1.75,
	style,
}: {
	name: string;
	className?: string;
	size?: number;
	strokeWidth?: number;
	style?: React.CSSProperties;
}) {
	const Component = LucideIcons[lucideName(name)] || LucideIcons.Square;
	return (
		<Component
			size={size}
			strokeWidth={strokeWidth}
			className={`inline-flex items-center justify-center ${className}`}
			style={style}
			aria-hidden="true"
		/>
	);
}

// ─── REUSABLE COMPONENTS ─────────────────────────────────

// Avatar: deterministic teal/green/blue palette
export const AVATAR_PALETTE = [
	{ bg: "#CCFBF1", fg: "#0F766E" },
	{ bg: "#D1FAE5", fg: "#047857" },
	{ bg: "#DBEAFE", fg: "#1D4ED8" },
	{ bg: "#FEF3C7", fg: "#92400E" },
	{ bg: "#EDE9FE", fg: "#6D28D9" },
	{ bg: "#FFE4E6", fg: "#9F1239" },
];
export function hashStr(s) {
	let h = 0;
	for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
	return Math.abs(h);
}
export function initialsOf(name) {
	const parts = name.replace(/[.,]/g, "").split(/\s+/).filter(Boolean);
	if (!parts.length) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
export const AVATAR_SIZES = {
	xs: 24,
	sm: 32,
	md: 40,
	lg: 56,
	xl: 80,
	xxl: 120,
	xxxl: 240,
};
export function Avatar({
	name = "",
	size = "md",
	square = false,
	className = "",
	src = "",
}: {
	name?: string;
	size?: keyof typeof AVATAR_SIZES;
	square?: boolean;
	className?: string;
	src?: string;
}) {
	const px = AVATAR_SIZES[size] || 40;
	const pal = AVATAR_PALETTE[hashStr(name) % AVATAR_PALETTE.length];
	const fontPx = Math.max(11, Math.round(px * 0.4));
	const shape = square ? "rounded-md" : "rounded-full";
	if (src) {
		return (
			<img
				src={src}
				alt={name}
				className={`inline-block object-cover ${shape} ${className}`}
				style={{ width: px, height: px }}
				onError={(e) => {
					(e.currentTarget as HTMLImageElement).style.display =
						"none";
				}}
			/>
		);
	}
	return (
		<span
			className={`inline-flex items-center justify-center font-semibold ${shape} ${className}`}
			style={{
				width: px,
				height: px,
				background: pal.bg,
				color: pal.fg,
				fontSize: fontPx,
				letterSpacing: "0.02em",
			}}
			aria-label={name}
		>
			{initialsOf(name)}
		</span>
	);
}

// Badge / status pill
export const BADGE_STYLES = {
	present: { bg: "#D1FAE5", fg: "#065F46", dot: "#10B981", label: "Present" },
	late: { bg: "#FEF3C7", fg: "#78350F", dot: "#F59E0B", label: "Late" },
	absent: { bg: "#FEE2E2", fg: "#7F1D1D", dot: "#EF4444", label: "Absent" },
	excused: { bg: "#EDE9FE", fg: "#4C1D95", dot: "#8B5CF6", label: "Excused" },
	pending: { bg: "#FEF3C7", fg: "#92400E", dot: "#F59E0B", label: "Pending" },
	synced: { bg: "#D1FAE5", fg: "#065F46", dot: "#10B981", label: "Synced" },
	failed: { bg: "#FEE2E2", fg: "#7F1D1D", dot: "#EF4444", label: "Failed" },
	ontrack: {
		bg: "#D1FAE5",
		fg: "#065F46",
		dot: "#10B981",
		label: "On Track",
	},
	atrisk: { bg: "#FEF3C7", fg: "#92400E", dot: "#F59E0B", label: "At Risk" },
	needshelp: {
		bg: "#FEE2E2",
		fg: "#7F1D1D",
		dot: "#EF4444",
		label: "Needs Help",
	},
	passing: { bg: "#D1FAE5", fg: "#065F46", dot: "#10B981", label: "Passing" },
	failing: { bg: "#FEE2E2", fg: "#7F1D1D", dot: "#EF4444", label: "Failing" },
	neutral: { bg: "#F1F5F9", fg: "#334155", dot: "#94A3B8", label: "—" },
	primary: { bg: "#CCFBF1", fg: "#0F766E", dot: "#0F766E", label: "Primary" },
};
export function Badge({
	status = "neutral",
	size = "sm",
	children,
	withDot = true,
	className = "",
}) {
	const s = BADGE_STYLES[status] || BADGE_STYLES.neutral;
	const pad =
		size === "lg" ? "px-2.5 py-1 text-[13px]" : "px-2 py-0.5 text-[11px]";
	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full font-semibold leading-none whitespace-nowrap ${pad} ${className}`}
			style={{ background: s.bg, color: s.fg }}
		>
			{withDot && <span className="dot" style={{ background: s.dot }} />}
			{children ?? s.label}
		</span>
	);
}

// QuarterBadge
export function QuarterBadge({ quarter = "Q3", className = "" }) {
	return (
		<span
			className={`inline-flex items-center gap-1 rounded-full bg-primary-light text-primary-dark font-semibold text-[11px] px-2 py-0.5 ${className}`}
		>
			<span
				className="dot bg-primary"
				style={{ background: "#0F766E" }}
			/>
			{quarter}
		</span>
	);
}

// Card wrapper
export function Card({
	children,
	className = "",
	variant = "base",
	as: Tag = "div",
	...rest
}) {
	const variants = {
		base: "bg-white border border-line shadow-xs",
		elevated: "bg-white shadow-md border border-line/60",
		interactive:
			"bg-white border border-line hover:-translate-y-px hover:shadow-md tx cursor-pointer",
		danger: "bg-white border border-rose-200 shadow-xs",
	};
	return (
		<Tag
			className={`rounded-lg ${variants[variant] || variants.base} ${className}`}
			{...rest}
		>
			{children}
		</Tag>
	);
}

// Modal
export function Modal({
	open,
	onClose,
	title,
	subtitle,
	children,
	footer,
	width = "max-w-lg",
}: {
	open: boolean;
	onClose: () => void;
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	children?: React.ReactNode;
	footer?: React.ReactNode;
	width?: string;
}) {
	useEffect(() => {
		if (!open) return;
		const onKey = (e) => {
			if (e.key === "Escape") onClose && onClose();
		};
		document.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, [open, onClose]);
	if (!open) return null;
	return (
		<div
			className="fixed inset-0 z-[80] flex items-center justify-center p-4 fade-in"
			role="dialog"
			aria-modal="true"
		>
			<div
				className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]"
				onClick={onClose}
			></div>
			<div
				className={`relative w-full ${width} bg-white rounded-xl shadow-xl border border-line modal-anim overflow-hidden`}
			>
				<div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-line">
					<div className="min-w-0">
						<h3 className="text-base font-semibold text-navy truncate">
							{title}
						</h3>
						{subtitle && (
							<p className="text-[13px] text-muted mt-0.5">
								{subtitle}
							</p>
						)}
					</div>
					<button
						className="text-muted hover:text-navy press"
						onClick={onClose}
						aria-label="Close"
					>
						<Icon name="x" size={18} />
					</button>
				</div>
				<div className="px-5 py-4 max-h-[85vh] overflow-y-auto">
					{children}
				</div>
				{footer && (
					<div className="px-5 py-3 bg-surface border-t border-line flex items-center justify-end gap-2">
						{footer}
					</div>
				)}
			</div>
		</div>
	);
}

// Toast system via context
const ToastCtx = createContext(null);
export function useToast() {
	return useContext(ToastCtx);
}
export function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([]);
	const push = useCallback((t) => {
		const id = Math.random().toString(36).slice(2, 9);
		const toast = { id, type: "info", duration: 4200, ...t };
		setToasts((prev) => [...prev, toast]);
		if (toast.duration > 0) {
			setTimeout(
				() => setToasts((prev) => prev.filter((x) => x.id !== id)),
				toast.duration,
			);
		}
		return id;
	}, []);
	const remove = (id) => setToasts((p) => p.filter((x) => x.id !== id));
	return (
		<ToastCtx.Provider value={{ push, remove }}>
			{children}
			<div className="fixed z-[90] right-4 bottom-4 flex flex-col gap-2 max-w-[360px]">
				{toasts.map((t) => {
					const tone =
						{
							success: {
								bg: "#059669",
								border: "#047857",
								fg: "#ffffff",
								icon: "check-circle",
							},
							error: {
								bg: "#DC2626",
								border: "#B91C1C",
								fg: "#ffffff",
								icon: "x-circle",
							},
							warning: {
								bg: "#D97706",
								border: "#B45309",
								fg: "#ffffff",
								icon: "alert-triangle",
							},
							info: {
								bg: "#2563EB",
								border: "#1D4ED8",
								fg: "#ffffff",
								icon: "info",
							},
						}[t.type] || {};
					return (
						<div
							key={t.id}
							className="toast-anim rounded-lg shadow-2xl border-0 px-3.5 py-3 flex items-start gap-3"
							style={{
								background: tone.bg,
								color: tone.fg,
							}}
						>
							<Icon name={tone.icon} size={18} />
							<div className="flex-1 min-w-0">
								{t.title && (
									<div className="font-semibold text-[13px]">
										{t.title}
									</div>
								)}
								<div className="text-[13px]">{t.message}</div>
							</div>
							<button
								className="opacity-70 hover:opacity-100"
								onClick={() => remove(t.id)}
								aria-label="Dismiss"
							>
								<Icon name="x" size={14} />
							</button>
						</div>
					);
				})}
			</div>
		</ToastCtx.Provider>
	);
}

// Empty state
export function EmptyState({
	icon = "inbox",
	title,
	description,
	action,
	className = "",
}) {
	return (
		<div
			className={`flex flex-col items-center text-center py-10 ${className}`}
		>
			<div className="w-14 h-14 rounded-full bg-primary-light/60 flex items-center justify-center mb-3 text-primary">
				<Icon name={icon} size={26} strokeWidth={1.5} />
			</div>
			<h3 className="text-base font-semibold text-navy">{title}</h3>
			{description && (
				<p className="text-[13px] text-muted mt-1 max-w-sm">
					{description}
				</p>
			)}
			{action && <div className="mt-4">{action}</div>}
		</div>
	);
}

// Skeleton
export function Skeleton({ variant = "text", className = "" }) {
	if (variant === "avatar")
		return (
			<div
				className={`skeleton rounded-full ${className || "w-9 h-9"}`}
			/>
		);
	if (variant === "card")
		return (
			<div
				className={`skeleton rounded-lg ${className || "w-full h-28"}`}
			/>
		);
	if (variant === "table-row")
		return <div className={`skeleton h-10 rounded-md ${className}`} />;
	return <div className={`skeleton h-3 rounded ${className || "w-24"}`} />;
}

// Stat Card
export function StatCard({
	icon,
	label,
	value,
	trend,
	color = "primary",
	sub,
}: {
	icon: string;
	label: string;
	value: React.ReactNode;
	trend?: string;
	color?: string;
	sub?: React.ReactNode;
}) {
	const palette = {
		primary: { bg: "#CCFBF1", fg: "#0F766E" },
		accent: { bg: "#D1FAE5", fg: "#047857" },
		blue: { bg: "#DBEAFE", fg: "#1D4ED8" },
		amber: { bg: "#FEF3C7", fg: "#92400E" },
		rose: { bg: "#FEE2E2", fg: "#9F1239" },
		purple: { bg: "#EDE9FE", fg: "#6D28D9" },
	}[color] || { bg: "#CCFBF1", fg: "#0F766E" };
	const trendUp = trend && trend.startsWith("+");
	return (
		<Card className="p-4">
			<div className="flex items-center justify-between">
				<span className="text-[12px] font-medium text-muted tracking-wide uppercase">
					{label}
				</span>
				<span
					className="w-8 h-8 rounded-md flex items-center justify-center"
					style={{ background: palette.bg, color: palette.fg }}
				>
					<Icon name={icon} size={16} />
				</span>
			</div>
			<div className="mt-3 flex items-baseline gap-2">
				<span className="text-[28px] font-semibold text-navy leading-none tracking-tight">
					{value}
				</span>
				{trend && (
					<span
						className={`text-[12px] font-semibold flex items-center gap-0.5 ${trendUp ? "text-emerald-600" : "text-rose-600"}`}
					>
						<Icon
							name={trendUp ? "trending-up" : "trending-down"}
							size={12}
						/>{" "}
						{trend}
					</span>
				)}
			</div>
			{sub && <div className="mt-1 text-[12px] text-muted">{sub}</div>}
		</Card>
	);
}

// Progress bar (single)
export function Progress({
	value = 0,
	max = 100,
	className = "",
	barClass = "bg-primary",
	height = 6,
}) {
	const pct = Math.max(0, Math.min(100, (value / max) * 100));
	return (
		<div
			className={`rounded-full overflow-hidden bg-slate-100 ${className}`}
			style={{ height }}
		>
			<div
				className={`${barClass} h-full tx`}
				style={{ width: `${pct}%` }}
			/>
		</div>
	);
}

// Component weight bar (WW/PT/QA visual)
export function ComponentWeightBar({
	ww = 20,
	pt = 60,
	qa = 20,
	className = "",
	height = 8,
}) {
	return (
		<div
			className={`flex w-full overflow-hidden rounded-full ${className}`}
			style={{ height }}
		>
			<div
				className="bg-blue-400"
				style={{ width: `${ww}%` }}
				title={`WW ${ww}%`}
			/>
			<div
				className="bg-emerald-400"
				style={{ width: `${pt}%` }}
				title={`PT ${pt}%`}
			/>
			<div
				className="bg-indigo-400"
				style={{ width: `${qa}%` }}
				title={`QA ${qa}%`}
			/>
		</div>
	);
}

// Connectivity pill (top-bar)
export function ConnPill({ online }) {
	if (online)
		return (
			<span
				className="pill"
				style={{ background: "#ECFDF5", color: "#065F46" }}
			>
				<span className="dot" style={{ background: "#10B981" }} />
				Online
			</span>
		);
	return (
		<span
			className="pill glow-amber"
			style={{ background: "#FFFBEB", color: "#92400E" }}
		>
			<span className="dot" style={{ background: "#F59E0B" }} />
			Offline
		</span>
	);
}

// AralSync wordmark
export function Logo({
	size = 18,
	withTag = false,
	className = "",
	iconOnly = false,
}) {
	const logoHeight = size + 12;
	return (
		<div className={`flex items-center gap-2 ${className}`}>
			{iconOnly ? (
				<img
					src="/icon.png"
					alt="AralSync"
					style={{
						height: logoHeight,
						width: logoHeight,
						objectFit: "contain",
					}}
					draggable={false}
				/>
			) : (
				<img
					src="/logo.png"
					alt="AralSync"
					style={{ height: logoHeight, objectFit: "contain" }}
					draggable={false}
				/>
			)}
			{withTag && (
				<div className="text-[11px] text-muted mt-1">
					Teach more. Sync seamlessly.
				</div>
			)}
		</div>
	);
}

// Sparkline (CSS bars)
export function Sparkbars({
	values = [],
	height = 28,
	accent = "#0F766E",
	label,
}) {
	const max = Math.max(...values, 100);
	return (
		<div className="flex items-end gap-[3px]" style={{ height }}>
			{values.map((v, i) => (
				<div
					key={i}
					className="rounded-sm"
					style={{
						width: 8,
						height: `${(v / max) * 100}%`,
						background:
							i === values.length - 1 ? accent : "#94A3B8",
						opacity: 0.85,
					}}
				/>
			))}
		</div>
	);
}

// Ring chart (SVG, single value)
export function RingChart({
	percent = 92,
	size = 140,
	stroke = 12,
	color = "#0F766E",
	track = "#E2E8F0",
	label,
}) {
	const r = (size - stroke) / 2;
	const c = 2 * Math.PI * r;
	const dash = (percent / 100) * c;
	return (
		<div
			className="relative inline-flex items-center justify-center"
			style={{ width: size, height: size }}
		>
			<svg width={size} height={size}>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={r}
					fill="none"
					stroke={track}
					strokeWidth={stroke}
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={r}
					fill="none"
					stroke={color}
					strokeWidth={stroke}
					strokeLinecap="round"
					strokeDasharray={`${dash} ${c - dash}`}
					transform={`rotate(-90 ${size / 2} ${size / 2})`}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="text-[28px] font-semibold text-navy leading-none tracking-tight">
					{percent.toFixed(1)}%
				</span>
				{label && (
					<span className="text-[11px] text-muted mt-1 uppercase tracking-wide">
						{label}
					</span>
				)}
			</div>
		</div>
	);
}

// Donut (multi-segment)
export function Donut({ segs = [], size = 140, stroke = 14 }) {
	// segs: [{value,color}, ...] in percent
	const r = (size - stroke) / 2;
	const c = 2 * Math.PI * r;
	let off = 0;
	return (
		<svg width={size} height={size}>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={r}
				fill="none"
				stroke="#F1F5F9"
				strokeWidth={stroke}
			/>
			{segs.map((s, i) => {
				const len = (s.value / 100) * c;
				const dasharray = `${len} ${c - len}`;
				const dashoffset = -off;
				off += len;
				return (
					<circle
						key={i}
						cx={size / 2}
						cy={size / 2}
						r={r}
						fill="none"
						stroke={s.color}
						strokeWidth={stroke}
						strokeLinecap="butt"
						strokeDasharray={dasharray}
						strokeDashoffset={dashoffset}
						transform={`rotate(-90 ${size / 2} ${size / 2})`}
					/>
				);
			})}
		</svg>
	);
}

// Heatmap calendar (jan-2025-like)
export function HeatCalendar({ year = 2025, month = 0, statuses = {} }) {
	// month: 0..11; statuses: { dayNum: 'present'|'late'|'absent'|'excused'|'none' }
	const first = new Date(year, month, 1);
	const dim = new Date(year, month + 1, 0).getDate();
	const startDow = first.getDay();
	const colors = {
		present: "#10B981",
		late: "#F59E0B",
		absent: "#EF4444",
		excused: "#8B5CF6",
		weekend: "#EEF2F6",
		future: "#F1F5F9",
		none: "#F8FAFC",
	};
	const cells = [];
	for (let i = 0; i < startDow; i++) cells.push(<div key={`b${i}`} />);
	for (let d = 1; d <= dim; d++) {
		const s = statuses[d] || "none";
		cells.push(
			<div
				key={d}
				className="rounded-[5px] flex items-end justify-end p-1 text-[10px] font-semibold"
				style={{
					background: colors[s] || colors.none,
					color:
						s === "weekend" || s === "future" || s === "none"
							? "#94A3B8"
							: "rgba(255,255,255,0.92)",
					aspectRatio: "1/1",
				}}
			>
				{d}
			</div>,
		);
	}
	return (
		<div>
			<div className="grid grid-cols-7 gap-1 text-[10px] text-muted mb-1">
				{["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
					<div
						key={i}
						className="text-center font-medium uppercase tracking-wider"
					>
						{d}
					</div>
				))}
			</div>
			<div className="grid grid-cols-7 gap-1">{cells}</div>
		</div>
	);
}

// Subject Tag chip
export function SubjectChip({ subject, className = "" }) {
	const c = SUBJECT_COLORS[subject] || {
		hue: "#0F766E",
		soft: "#CCFBF1",
		ink: "#0F766E",
	};
	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-semibold ${className}`}
			style={{ background: c.soft, color: c.ink }}
		>
			<span
				className="w-1.5 h-1.5 rounded-full"
				style={{ background: c.hue }}
			/>
			{subject}
		</span>
	);
}

// Grade color (≥90 teal | 85–89 green | 80–84 blue | 75–79 amber | <75 red)
export function gradeColor(g) {
	if (g >= 90) return { bg: "#CCFBF1", fg: "#0F766E" };
	if (g >= 85) return { bg: "#D1FAE5", fg: "#065F46" };
	if (g >= 80) return { bg: "#DBEAFE", fg: "#1D4ED8" };
	if (g >= 75) return { bg: "#FEF3C7", fg: "#92400E" };
	return { bg: "#FEE2E2", fg: "#7F1D1D" };
}
export function studentStatus(att, grade) {
	if (att >= 85 && grade >= 80) return "ontrack";
	if (att < 75 || grade < 75) return "needshelp";
	return "atrisk";
}

// Section header
export function SectionHeader({
	title,
	subtitle,
	right,
}: {
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	right?: React.ReactNode;
}) {
	return (
		<div className="flex items-end justify-between gap-3 flex-wrap mb-3">
			<div>
				<h2 className="text-[16px] font-semibold text-navy tracking-tight mb-0!">
					{title}
				</h2>
				{subtitle && (
					<p className="text-[11px] text-muted mt-0!">{subtitle}</p>
				)}
			</div>
			{right}
		</div>
	);
}

// Pretty Button
export function Btn({
	children,
	variant = "secondary",
	size = "md",
	icon,
	iconRight,
	className = "",
	...rest
}: {
	children?: React.ReactNode;
	variant?: string;
	size?: string;
	icon?: string;
	iconRight?: string;
	className?: string;
	[key: string]: any;
}) {
	const sizes = {
		sm: "h-8 px-3 text-[12px] gap-1.5",
		md: "h-9 px-3.5 text-[13px] gap-2",
		lg: "h-11 px-5 text-[14px] gap-2",
	};
	const variants = {
		primary:
			"bg-primary text-white hover:bg-primary-dark border border-primary-dark/0 shadow-xs",
		secondary: "bg-white text-navy border border-line hover:bg-surface",
		ghost: "text-navy hover:bg-slate-100",
		danger: "bg-rose-500 text-white hover:bg-rose-600",
		soft: "bg-primary-light text-primary-dark hover:bg-primary/15",
		dark: "bg-navy text-white hover:bg-navy/90",
	};
	return (
		<button
			className={`inline-flex items-center justify-center rounded-md font-semibold press tx whitespace-nowrap ${sizes[size]} ${variants[variant]} ${className}`}
			{...rest}
		>
			{icon && (
				<Icon
					name={icon}
					size={size === "sm" ? 14 : size === "lg" ? 18 : 16}
				/>
			)}
			{children}
			{iconRight && (
				<Icon
					name={iconRight}
					size={size === "sm" ? 14 : size === "lg" ? 18 : 16}
				/>
			)}
		</button>
	);
}

// Dropdown menu
export function Dropdown({ trigger, items, align = "right" }) {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);
	useEffect(() => {
		if (!open) return;
		const onClick = (e) => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", onClick);
		return () => document.removeEventListener("mousedown", onClick);
	}, [open]);
	return (
		<div className="relative" ref={ref}>
			<span onClick={() => setOpen((o) => !o)}>{trigger}</span>
			{open && (
				<div
					className={`absolute top-full mt-1.5 ${align === "right" ? "right-0" : "left-0"} min-w-[180px] bg-white border border-line rounded-md shadow-lg py-1 z-30 modal-anim`}
				>
					{items.map((it, i) => {
						if (it.render) {
							return it.render();
						}
						if (it.separator)
							return (
								<div
									key={i}
									className="my-1 border-t border-line"
								/>
							);
						return (
							<button
								key={i}
								onClick={() => {
									setOpen(false);
									it.onClick && it.onClick();
								}}
								className="w-full text-left px-3 py-1.5 text-[13px] hover:bg-surface flex items-center gap-2 text-navy"
							>
								{it.icon && (
									<Icon
										name={it.icon}
										size={14}
										className="text-muted"
									/>
								)}
								<span className="flex-1">{it.label}</span>
								{it.right && (
									<span className="text-[11px] text-muted">
										{it.right}
									</span>
								)}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}

// Tabs (underline)
export function Tabs({ tabs, active, onChange, className = "" }) {
	return (
		<div
			className={`flex items-center gap-1 border-b border-line overflow-x-auto no-scrollbar ${className}`}
		>
			{tabs.map((t) => (
				<button
					key={t.id}
					onClick={() => onChange(t.id)}
					className={`px-3 py-2.5 text-[13px] font-semibold border-b-2 -mb-px whitespace-nowrap tx ${active === t.id ? "tab-active" : "border-transparent text-muted hover:text-navy"}`}
				>
					{t.icon && (
						<Icon
							name={t.icon}
							size={14}
							className="inline mr-1.5 align-[-2px]"
						/>
					)}
					{t.label}
					{typeof t.count === "number" && (
						<span className="ml-1.5 inline-flex items-center text-[11px] font-semibold px-1.5 py-[1px] rounded-full bg-slate-100 text-muted">
							{t.count}
						</span>
					)}
				</button>
			))}
		</div>
	);
}

// Switch
export function Switch({
	value,
	onChange,
	label,
	hint,
}: {
	value: boolean;
	onChange: (v: boolean) => void;
	label: React.ReactNode;
	hint?: string;
}) {
	return (
		<label className="flex items-start justify-between gap-3 py-2 cursor-pointer">
			<div className="min-w-0">
				<div className="text-[13.5px] font-medium text-navy">
					{label}
				</div>
				{hint && (
					<div className="text-[12px] text-muted mt-0.5">{hint}</div>
				)}
			</div>
			<button
				type="button"
				onClick={() => onChange(!value)}
				className={`relative inline-flex w-10 h-6 flex-shrink-0 rounded-full tx ${value ? "bg-primary" : "bg-slate-300"}`}
				aria-pressed={value}
			>
				<span
					className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow tx ${value ? "translate-x-4" : ""}`}
				/>
			</button>
		</label>
	);
}

// Field group
export function Field({
	label,
	hint,
	children,
	required,
	error,
	className,
}: {
	label: React.ReactNode;
	hint?: string;
	children: React.ReactNode;
	required?: boolean;
	error?: string;
	className?: string;
}) {
	return (
		<label className={`block ${className ?? ""}`}>
			<div className="text-[12px] font-semibold text-navy mb-1.5">
				{label}
				{required && <span className="text-rose-500 ml-0.5">*</span>}
			</div>
			{children}
			{error && (
				<div className="text-[11px] text-rose-500 mt-1">{error}</div>
			)}
			{hint && <div className="text-[11px] text-muted mt-1">{hint}</div>}
		</label>
	);
}
export const TextInput = React.forwardRef<
	HTMLInputElement,
	React.InputHTMLAttributes<HTMLInputElement> & { className?: string }
>(({ className = "", ...rest }, ref) => (
	<input
		ref={ref}
		className={`w-full h-9 px-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none tx placeholder:text-muted-light ${className}`}
		{...rest}
	/>
));
export function Select({ className = "", children, ...rest }) {
	return (
		<div className="relative">
			<select
				className={`w-full h-9 pl-3 pr-9 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none tx appearance-none ${className}`}
				{...rest}
			>
				{children}
			</select>
			<span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
				<Icon name="chevron-down" size={14} />
			</span>
		</div>
	);
}
