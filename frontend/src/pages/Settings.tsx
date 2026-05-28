import React, { useMemo, useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	Icon,
	Avatar,
	Card,
	Modal,
	useToast,
	ComponentWeightBar,
	SectionHeader,
	Btn,
	Switch,
	Field,
	TextInput,
	Select,
	SubjectChip,
	Badge,
	EmptyState,
	Logo,
} from "../components";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — mockData.js has no declaration file
import { SYNC_STATE } from "../data/mockData";
import {
	useClassLoads,
	useUpdateClassLoad,
	CLASS_LOAD_KEYS,
} from "../modules/classrooms/useClassLoads";
import { classLoadsService } from "../modules/classrooms/classLoads.service";
import { DEFAULT_WEIGHTS } from "../shared/constants/grading";
import { useAuthStore } from "../modules/auth/authStore";
import { authService } from "../modules/auth/auth.service";
import { schoolsService } from "../modules/classrooms/schools.service";
import { usePreferencesStore } from "../modules/sync/preferencesStore";
import { useSyncStore } from "../modules/sync/syncStore";
import {
	useDevices,
	useRenameDevice,
	useRevokeDevice,
} from "../modules/auth/useDevices";
import { relativeTime } from "../shared/utils/relativeTime";
import { disconnectSocket } from "../services/socket";
import { db } from "../db";
import type {
	Device,
	DeviceType,
	ClassLoadListItem,
	GradeComponentConfig,
} from "../shared/types";

// ─── Preset avatars ───────────────────────────────────────
const PRESET_AVATARS = [
	"bear",
	"beaver",
	"beaver-2",
	"bunny",
	"bunny-2",
	"bunny-3",
	"capybara",
	"cat",
	"cat-1",
	"deer",
	"dog",
	"fox",
	"hedgehog",
	"koala",
	"koala-2",
	"owl",
	"owl-2",
	"panda",
	"penguin",
];

// ─── Schemas ──────────────────────────────────────────────
const profileSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	position: z.string().optional(),
	employeeNumber: z.string().optional(),
});
type ProfileValues = z.infer<typeof profileSchema>;

const schoolInfoSchema = z.object({
	division: z.string().min(1, "Division is required"),
	district: z.string().optional(),
	address: z.string().optional(),
});
type SchoolInfoValues = z.infer<typeof schoolInfoSchema>;

// ─── Component config localStorage helpers ────────────────
const COMP_CONFIG_KEY = "aralsync:componentConfig";

function loadComponentConfig(id: string): GradeComponentConfig[] | null {
	try {
		const raw = localStorage.getItem(COMP_CONFIG_KEY);
		if (!raw) return null;
		const map = JSON.parse(raw) as Record<string, GradeComponentConfig[]>;
		return map[id] ?? null;
	} catch {
		return null;
	}
}

function saveComponentConfig(id: string, config: GradeComponentConfig[]) {
	try {
		const raw = localStorage.getItem(COMP_CONFIG_KEY);
		const map = raw
			? (JSON.parse(raw) as Record<string, GradeComponentConfig[]>)
			: {};
		map[id] = config;
		localStorage.setItem(COMP_CONFIG_KEY, JSON.stringify(map));
	} catch {}
}

// ─── CLASS WEIGHT ROW ─────────────────────────────────────
function ClassWeightRow({
	cl,
	resetKey,
}: {
	cl: ClassLoadListItem;
	resetKey: number;
}) {
	const toast = useToast() as {
		push: (t: { type: string; message?: string; title?: string }) => void;
	} | null;
	const [expanded, setExpanded] = useState(false);
	const [components, setComponents] = useState<GradeComponentConfig[]>(
		() =>
			loadComponentConfig(cl.id) ?? [
				{ key: "WW", label: "Written Works", weight: cl.wwWeight },
				{ key: "PT", label: "Performance Tasks", weight: cl.ptWeight },
				{
					key: "QA",
					label: "Quarterly Assessment",
					weight: cl.qaWeight,
				},
			],
	);
	const update = useUpdateClassLoad(cl.id);

	useEffect(() => {
		const saved = loadComponentConfig(cl.id);
		if (saved) setComponents(saved);
	}, [resetKey, cl.id]);

	const totalWeight = components.reduce((s, c) => s + c.weight, 0);
	const totalPct = Math.round(totalWeight * 100);
	const valid = totalPct === 100;

	const wwPct = Math.round(
		(components.find((c) => c.key === "WW")?.weight ?? 0) * 100,
	);
	const ptPct = Math.round(
		(components.find((c) => c.key === "PT")?.weight ?? 0) * 100,
	);
	const qaPct = Math.round(
		(components.find((c) => c.key === "QA")?.weight ?? 0) * 100,
	);

	function addComponent() {
		setComponents((prev) => [
			...prev,
			{ key: crypto.randomUUID(), label: "New Component", weight: 0 },
		]);
	}

	function removeComponent(key: string) {
		if (components.length <= 3) return;
		setComponents((prev) => prev.filter((c) => c.key !== key));
	}

	function updateLabel(key: string, label: string) {
		setComponents((prev) =>
			prev.map((c) => (c.key === key ? { ...c, label } : c)),
		);
	}

	function updateWeight(key: string, pct: number) {
		setComponents((prev) =>
			prev.map((c) => (c.key === key ? { ...c, weight: pct / 100 } : c)),
		);
	}

	async function save() {
		const ww = components.find((c) => c.key === "WW")?.weight ?? 0;
		const pt = components.find((c) => c.key === "PT")?.weight ?? 0;
		const qa = components.find((c) => c.key === "QA")?.weight ?? 0;
		try {
			saveComponentConfig(cl.id, components);
			await update.mutateAsync({ weights: { ww, pt, qa } });
			toast?.push({ type: "success", message: "Weights saved." });
		} catch {
			toast?.push({ type: "error", message: "Failed to save weights." });
		}
	}

	function resetToDeped() {
		setComponents([
			{ key: "WW", label: "Written Works", weight: 0.2 },
			{ key: "PT", label: "Performance Tasks", weight: 0.6 },
			{ key: "QA", label: "Quarterly Assessment", weight: 0.2 },
		]);
	}

	return (
		<div className="border border-line rounded-md p-3">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2 flex-wrap">
					<SubjectChip subject={cl.subject.name} />
					<span className="text-muted text-[11px]">
						{cl.subject.gradeLevel} · {cl.section.name}
					</span>
					<span className="text-muted text-[11px]">
						· {components.length} component
						{components.length !== 1 ? "s" : ""}
					</span>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					<Badge status={valid ? "synced" : "failed"}>
						{totalPct}%
					</Badge>
					<Btn
						variant="ghost"
						size="sm"
						icon={expanded ? "chevron-up" : "chevron-down"}
						onClick={() => setExpanded((e) => !e)}
					/>
				</div>
			</div>

			<ComponentWeightBar
				ww={wwPct}
				pt={ptPct}
				qa={qaPct}
				className="mt-2"
			/>

			{expanded && (
				<div className="mt-3 space-y-1.5 border-t border-line pt-3">
					{components.map((comp) => (
						<div key={comp.key} className="flex items-center gap-2">
							<input
								value={comp.label}
								onChange={(e) =>
									updateLabel(comp.key, e.target.value)
								}
								className="flex-1 h-7 rounded border border-line bg-white px-2 text-[12px] text-navy focus:outline-none focus:ring-1 focus:ring-primary"
								placeholder="Component name"
							/>
							<input
								type="number"
								min={0}
								max={100}
								step={1}
								value={Math.round(comp.weight * 100)}
								onChange={(e) =>
									updateWeight(
										comp.key,
										Math.max(
											0,
											Math.min(
												100,
												Number(e.target.value),
											),
										),
									)
								}
								className="w-14 h-7 rounded border border-line bg-white px-2 text-[12px] font-mono text-navy focus:outline-none focus:ring-1 focus:ring-primary"
							/>
							<span className="text-muted text-[11px]">%</span>
							<Btn
								variant="ghost"
								size="sm"
								icon="x"
								disabled={components.length <= 3}
								onClick={() => removeComponent(comp.key)}
							/>
						</div>
					))}
					<Btn
						variant="ghost"
						size="sm"
						icon="plus"
						onClick={addComponent}
					>
						Add component
					</Btn>
					<div className="flex items-center gap-2 pt-1">
						<Btn
							variant="primary"
							size="sm"
							disabled={!valid || update.isPending}
							onClick={() => void save()}
						>
							{update.isPending ? "Saving…" : "Save"}
						</Btn>
						<Btn
							variant="ghost"
							size="sm"
							icon="rotate-ccw"
							onClick={resetToDeped}
						>
							Reset to DepEd
						</Btn>
					</div>
				</div>
			)}
		</div>
	);
}

// ─── SETTINGS ────────────────────────────────────────────
export function PageSettings() {
	const [sub, setSub] = useState("profile");
	const [clearOpen, setClearOpen] = useState(false);
	const [avatarPreview, setAvatarPreview] = useState<string>("");
	const [showAvatarPicker, setShowAvatarPicker] = useState(false);
	const [notif1, setNotif1] = useState(true);
	const [notif2, setNotif2] = useState(true);
	const [notif3, setNotif3] = useState(false);
	const avatarInputRef = useRef<HTMLInputElement>(null);
	const toast = useToast() as {
		push: (t: { type: string; message?: string; title?: string }) => void;
	} | null;

	// Auth
	const user = useAuthStore((s) => s.user);
	const updateUser = useAuthStore((s) => s.updateUser);
	const clearAuth = useAuthStore((s) => s.clearAuth);
	const navigate = useNavigate();

	// Devices
	const { data: devices, isLoading: isDevicesLoading } = useDevices();
	const renameDeviceMut = useRenameDevice();
	const revokeDeviceMut = useRevokeDevice();
	const lanPeers = useSyncStore((s) => s.lanPeers);
	const lanPeerIds = useMemo(
		() => new Set(lanPeers.map((p) => p.deviceId)),
		[lanPeers],
	);
	const [renameDevice, setRenameDevice] = useState<Device | null>(null);
	const [revokeTarget, setRevokeTarget] = useState<Device | null>(null);
	const [renameValue, setRenameValue] = useState("");
	const [nowTick, setNowTick] = useState(0);
	useEffect(() => {
		if (sub !== "devices") return;
		const id = setInterval(() => setNowTick((t) => t + 1), 30_000);
		return () => clearInterval(id);
	}, [sub]);
	// nowTick is read to keep relativeTime fresh; reference it to placate the linter.
	void nowTick;

	async function handleRevokeDevice(target: Device): Promise<void> {
		try {
			const result = await revokeDeviceMut.mutateAsync(target.deviceId);
			setRevokeTarget(null);
			if (result.revokedSelf) {
				disconnectSocket();
				const refreshToken = (await db.users.get(user?.id ?? ""))
					?.refreshToken;
				if (refreshToken)
					await authService.logout(refreshToken).catch(() => {});
				await clearAuth();
				void navigate({ to: "/signin" });
				return;
			}
			toast?.push({
				type: "success",
				message: `Revoked ${target.name}.`,
			});
		} catch {
			toast?.push({ type: "error", message: "Failed to revoke device." });
		}
	}

	async function handleRenameDevice(
		target: Device,
		name: string,
	): Promise<void> {
		const trimmed = name.trim();
		if (!trimmed || trimmed === target.name) {
			setRenameDevice(null);
			return;
		}
		try {
			await renameDeviceMut.mutateAsync({
				deviceId: target.deviceId,
				name: trimmed,
			});
			setRenameDevice(null);
			toast?.push({ type: "success", message: "Device renamed." });
		} catch {
			toast?.push({ type: "error", message: "Failed to rename device." });
		}
	}

	function deviceIcon(type: DeviceType): string {
		switch (type) {
			case "tablet":
				return "tablet";
			case "phone":
				return "smartphone";
			case "laptop":
				return "laptop";
			case "desktop":
				return "monitor";
			default:
				return "hard-drive";
		}
	}

	// Sync preferences
	const {
		autoSync,
		syncInterval,
		wifiOnly,
		backgroundSync,
		setAutoSync,
		setSyncInterval,
		setWifiOnly,
		setBackgroundSync,
		showTransmutationTable,
		setShowTransmutationTable,
	} = usePreferencesStore();

	// Grading config
	const { data: classLoads, isLoading: isClassLoadsLoading } =
		useClassLoads();
	const [gradingResetKey, setGradingResetKey] = useState(0);

	const DEPED_PRESET: GradeComponentConfig[] = [
		{ key: "WW", label: "Written Works", weight: 0.2 },
		{ key: "PT", label: "Performance Tasks", weight: 0.6 },
		{ key: "QA", label: "Quarterly Assessment", weight: 0.2 },
	];
	const LANG_PRESET: GradeComponentConfig[] = [
		{ key: "WW", label: "Written Works", weight: 0.25 },
		{ key: "PT", label: "Performance Tasks", weight: 0.5 },
		{ key: "QA", label: "Quarterly Assessment", weight: 0.25 },
	];

	async function applyPresetToAll(preset: GradeComponentConfig[]) {
		if (!classLoads?.length) return;
		const ww = preset.find((c) => c.key === "WW")?.weight ?? 0;
		const pt = preset.find((c) => c.key === "PT")?.weight ?? 0;
		const qa = preset.find((c) => c.key === "QA")?.weight ?? 0;
		try {
			classLoads.forEach((cl) => saveComponentConfig(cl.id, preset));
			await Promise.all(
				classLoads.map((cl) =>
					classLoadsService.update(cl.id, {
						weights: { ww, pt, qa },
					}),
				),
			);
			await queryClient.invalidateQueries({
				queryKey: CLASS_LOAD_KEYS.all,
			});
			setGradingResetKey((k) => k + 1);
			toast?.push({
				type: "success",
				message: "Preset applied to all classes.",
			});
		} catch {
			toast?.push({ type: "error", message: "Failed to apply preset." });
		}
	}

	// Profile form
	const {
		register,
		handleSubmit,
		reset: resetProfile,
		formState: { errors, isSubmitting },
	} = useForm<ProfileValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: user?.name ?? "",
			position: user?.position ?? "",
			employeeNumber: user?.employeeNumber ?? "",
		},
	});

	// School query + form
	const queryClient = useQueryClient();
	const { data: schoolData, isLoading: isSchoolLoading } = useQuery({
		queryKey: ["school", user?.schoolId],
		queryFn: () => schoolsService.getById(user!.schoolId!),
		enabled: !!user?.schoolId,
	});

	const {
		register: registerSchool,
		handleSubmit: handleSchoolSubmit,
		reset: resetSchool,
		formState: {
			errors: schoolErrors,
			isSubmitting: isSchoolSubmitting,
			isDirty: isSchoolDirty,
		},
	} = useForm<SchoolInfoValues>({
		resolver: zodResolver(schoolInfoSchema),
		defaultValues: { division: "", district: "", address: "" },
	});

	useEffect(() => {
		if (schoolData) {
			resetSchool({
				division: schoolData.division,
				district: schoolData.district ?? "",
				address: schoolData.address ?? "",
			});
		}
	}, [schoolData, resetSchool]);

	// ── Avatar handler ─────────────────────────────────────
	function handleAvatarFile(file: File) {
		const canvas = document.createElement("canvas");
		canvas.width = 128;
		canvas.height = 128;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const objectUrl = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			const scale = Math.max(128 / img.width, 128 / img.height);
			const w = img.width * scale;
			const h = img.height * scale;
			ctx.drawImage(img, (128 - w) / 2, (128 - h) / 2, w, h);
			setAvatarPreview(canvas.toDataURL("image/jpeg", 0.85));
			URL.revokeObjectURL(objectUrl);
		};
		img.src = objectUrl;
	}

	// ── Profile save ───────────────────────────────────────
	async function onProfileSave(values: ProfileValues) {
		try {
			const payload = {
				...values,
				...(avatarPreview ? { avatarUrl: avatarPreview } : {}),
			};
			const updated = await authService.updateProfile(payload);
			await updateUser(updated);
			toast?.push({
				type: "success",
				message: "Profile saved · will sync.",
			});
		} catch {
			toast?.push({ type: "error", message: "Failed to save profile." });
		}
	}

	// ── School save ────────────────────────────────────────
	async function onSchoolSave(values: SchoolInfoValues) {
		if (!user?.schoolId) return;
		try {
			await schoolsService.updateInfo(user.schoolId, values);
			await queryClient.invalidateQueries({
				queryKey: ["school", user.schoolId],
			});
			toast?.push({ type: "success", message: "School info saved." });
		} catch {
			toast?.push({
				type: "error",
				message: "Failed to save school info.",
			});
		}
	}

	const nav = [
		{ id: "profile", label: "Profile", icon: "user" },
		{ id: "school", label: "School info", icon: "building-2" },
		{ id: "grading", label: "Grading config", icon: "graduation-cap" },
		{ id: "sync", label: "Sync preferences", icon: "refresh-cw" },
		{ id: "storage", label: "Storage & data", icon: "hard-drive" },
		{ id: "notif", label: "Notifications", icon: "bell" },
		{ id: "devices", label: "Devices", icon: "tablet" },
		{ id: "about", label: "About", icon: "info" },
	];

	const displayAvatarSrc = avatarPreview || user?.avatarUrl || "";

	return (
		<div className="page-anim grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
			{/* Sub-nav */}
			<Card className="p-2 self-start sticky lg:top-20 max-h-[calc(100vh-96px)] overflow-y-auto">
				{nav.map((n) => {
					const active = sub === n.id;
					return (
						<button
							key={n.id}
							onClick={() => setSub(n.id)}
							className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-[13px] font-medium tx ${active ? "bg-primary-light/70 text-primary-dark" : "text-navy/80 hover:bg-slate-50"}`}
						>
							<Icon
								name={n.icon}
								size={15}
								className={
									active ? "text-primary" : "text-muted"
								}
							/>
							<span>{n.label}</span>
						</button>
					);
				})}
			</Card>

			<div className="space-y-5">
				{/* ── Profile ────────────────────────────────── */}
				{sub === "profile" && (
					<Card className="p-5">
						<SectionHeader
							title="Profile"
							subtitle="How you appear in reports and to other teachers"
						/>
						<form onSubmit={handleSubmit(onProfileSave)}>
							<div className="flex items-start gap-4 flex-wrap">
								<button
									type="button"
									className="relative group shrink-0"
									onClick={() => setShowAvatarPicker(true)}
									title="Change photo"
								>
									<Avatar
										name={user?.name ?? ""}
										src={displayAvatarSrc}
										size="xxxl"
									/>
									<span className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 tx flex items-center justify-center">
										<Icon
											name="camera"
											size={32}
											className="text-white"
										/>
									</span>
								</button>
								<input
									ref={avatarInputRef}
									type="file"
									accept="image/*"
									className="sr-only"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) handleAvatarFile(file);
									}}
								/>
								<div className="flex-1 min-w-[260px] grid grid-cols-1 sm:grid-cols-2 gap-3">
									<Field
										label="Full name"
										required
										error={errors.name?.message}
									>
										<TextInput {...register("name")} />
									</Field>
									<Field label="Email">
										<TextInput
											value={user?.email ?? ""}
											readOnly
											className="opacity-60 cursor-not-allowed"
										/>
									</Field>
									<Field
										label="Position"
										error={errors.position?.message}
									>
										<TextInput {...register("position")} />
									</Field>
									<Field
										label="Employee number"
										error={errors.employeeNumber?.message}
									>
										<TextInput
											{...register("employeeNumber")}
										/>
									</Field>
								</div>
							</div>
							<div className="mt-5 flex items-center justify-end gap-2">
								<Btn
									type="button"
									variant="ghost"
									onClick={() => {
										resetProfile({
											name: user?.name ?? "",
											position: user?.position ?? "",
											employeeNumber:
												user?.employeeNumber ?? "",
										});
										setAvatarPreview("");
									}}
								>
									Discard
								</Btn>
								<Btn
									type="submit"
									variant="primary"
									icon="save"
									disabled={isSubmitting}
								>
									{isSubmitting ? "Saving…" : "Save changes"}
								</Btn>
							</div>
						</form>
					</Card>
				)}

				{/* ── School Info ─────────────────────────────── */}
				{sub === "school" && (
					<Card className="p-5">
						<SectionHeader
							title="School information"
							subtitle="Used on SF2 / SF9 forms"
						/>
						{!user?.schoolId ? (
							<p className="text-[13px] text-muted py-4">
								No school is linked to your account.
							</p>
						) : isSchoolLoading ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{[...Array(4)].map((_, i) => (
									<div
										key={i}
										className="h-9 rounded-md bg-slate-100 animate-pulse"
									/>
								))}
							</div>
						) : (
							<form onSubmit={handleSchoolSubmit(onSchoolSave)}>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<Field label="School name">
										<TextInput
											value={schoolData?.name ?? ""}
											readOnly
											disabled
											className="opacity-60 cursor-not-allowed"
										/>
									</Field>
									<Field label="School ID">
										<TextInput
											value={schoolData?.schoolId ?? ""}
											readOnly
											disabled
											className="opacity-60 cursor-not-allowed"
										/>
									</Field>
									<Field
										label="Division"
										required
										error={schoolErrors.division?.message}
									>
										<TextInput
											{...registerSchool("division")}
										/>
									</Field>
									<Field
										label="District"
										error={schoolErrors.district?.message}
									>
										<TextInput
											{...registerSchool("district")}
										/>
									</Field>
									<Field
										label="Address"
										error={schoolErrors.address?.message}
										className="sm:col-span-2"
									>
										<TextInput
											{...registerSchool("address")}
										/>
									</Field>
								</div>
								<div className="mt-5 flex items-center justify-end gap-2">
									<Btn
										type="button"
										variant="ghost"
										onClick={() =>
											resetSchool({
												division:
													schoolData?.division ?? "",
												district:
													schoolData?.district ?? "",
												address:
													schoolData?.address ?? "",
											})
										}
									>
										Discard
									</Btn>
									<Btn
										type="submit"
										variant="primary"
										icon="save"
										disabled={
											isSchoolSubmitting || !isSchoolDirty
										}
									>
										{isSchoolSubmitting
											? "Saving…"
											: "Save"}
									</Btn>
								</div>
							</form>
						)}
					</Card>
				)}

				{/* ── Grading config ──────────────────────────── */}
				{sub === "grading" && (
					<Card className="p-5">
						<SectionHeader
							title="Grading configuration"
							subtitle="Configure component weights per class load · min 3 components"
						/>
						<div className="space-y-2 mt-1">
							{isClassLoadsLoading && (
								<div className="space-y-2">
									{[...Array(3)].map((_, i) => (
										<div
											key={i}
											className="h-14 rounded-md bg-slate-100 animate-pulse"
										/>
									))}
								</div>
							)}
							{classLoads?.map((cl) => (
								<ClassWeightRow
									key={cl.id}
									cl={cl}
									resetKey={gradingResetKey}
								/>
							))}
							{!isClassLoadsLoading && !classLoads?.length && (
								<EmptyState
									icon="graduation-cap"
									title="No class loads"
									description="Create a class load to configure grading weights."
									action={null}
								/>
							)}
						</div>
						<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
							<Card className="p-4 bg-surface/70">
								<div className="text-[12px] font-semibold text-navy">
									DepEd default preset
								</div>
								<div className="text-[11.5px] text-muted mt-1">
									WW 20% · PT 60% · QA 20%
								</div>
								<ComponentWeightBar
									ww={20}
									pt={60}
									qa={20}
									className="mt-2"
								/>
								<Btn
									variant="soft"
									size="sm"
									className="mt-3"
									disabled={!classLoads?.length}
									onClick={() =>
										void applyPresetToAll(DEPED_PRESET)
									}
								>
									Apply to all classes
								</Btn>
							</Card>
							<Card className="p-4 bg-surface/70">
								<div className="text-[12px] font-semibold text-navy">
									Language preset
								</div>
								<div className="text-[11.5px] text-muted mt-1">
									WW 25% · PT 50% · QA 25%
								</div>
								<ComponentWeightBar
									ww={25}
									pt={50}
									qa={25}
									className="mt-2"
								/>
								<Btn
									variant="soft"
									size="sm"
									className="mt-3"
									disabled={!classLoads?.length}
									onClick={() =>
										void applyPresetToAll(LANG_PRESET)
									}
								>
									Apply to all classes
								</Btn>
							</Card>
						</div>
						<Switch
							value={showTransmutationTable}
							onChange={setShowTransmutationTable}
							label="Show transmutation table on grade entry"
							hint="Helpful when computing raw → transmuted scores during grading."
						/>
					</Card>
				)}

				{/* ── Sync preferences (persisted) ────────────── */}
				{sub === "sync" && (
					<Card className="p-5">
						<SectionHeader
							title="Sync preferences"
							subtitle="When and how AralSync uploads"
						/>
						<div className="space-y-1.5 divide-y divide-line">
							<Switch
								value={autoSync}
								onChange={setAutoSync}
								label="Auto-sync"
								hint="Upload pending records as soon as you regain connection."
							/>
							<div className="pt-3 pb-2 flex items-center justify-between gap-3">
								<div>
									<div className="text-[13.5px] font-medium text-navy">
										Sync interval
									</div>
									<div className="text-[12px] text-muted">
										How often AralSync checks for new
										records.
									</div>
								</div>
								<Select
									value={syncInterval}
									onChange={(
										e: React.ChangeEvent<HTMLSelectElement>,
									) =>
										setSyncInterval(
											e.target.value as
												| "1"
												| "5"
												| "15"
												| "manual",
										)
									}
									className="!h-9 max-w-[160px]"
								>
									<option value="1">Every 1 minute</option>
									<option value="5">Every 5 minutes</option>
									<option value="15">Every 15 minutes</option>
									<option value="manual">Manual only</option>
								</Select>
							</div>
							<Switch
								value={wifiOnly}
								onChange={setWifiOnly}
								label="WiFi only"
								hint="Pause sync over mobile data to save load allowance."
							/>
							<Switch
								value={backgroundSync}
								onChange={setBackgroundSync}
								label="Background sync"
								hint="Continue syncing when app is backgrounded."
							/>
						</div>
					</Card>
				)}

				{/* ── Storage & data (mock — untouched) ──────── */}
				{sub === "storage" && (
					<div className="space-y-5">
						<Card className="p-5">
							<SectionHeader title="Storage usage" />
							<div className="text-[26px] font-semibold text-navy font-mono leading-none">
								{(SYNC_STATE as any).storageUsedMB}
								<span className="text-[14px] text-muted">
									{" "}
									MB / 2 GB
								</span>
							</div>
							<div className="mt-3 h-2 rounded-full overflow-hidden bg-slate-100 flex">
								<div
									style={{
										width: "1.4%",
										background: "#0F766E",
									}}
								/>
								<div
									style={{
										width: "0.55%",
										background: "#10B981",
									}}
								/>
								<div
									style={{
										width: "0.18%",
										background: "#6366F1",
									}}
								/>
							</div>
							<div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
								<span className="flex items-center gap-1.5">
									<span className="w-2.5 h-2.5 rounded-sm bg-primary" />{" "}
									Attendance · 28 MB
								</span>
								<span className="flex items-center gap-1.5">
									<span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />{" "}
									Grades · 11 MB
								</span>
								<span className="flex items-center gap-1.5">
									<span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />{" "}
									Other · 3.3 MB
								</span>
							</div>
						</Card>
						<Card className="p-5">
							<SectionHeader
								title="Backups & data"
								subtitle="Schedule automatic exports"
							/>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<Field label="Auto-backup schedule">
									<Select defaultValue="weekly">
										<option>Daily at 6pm</option>
										<option value="weekly">
											Weekly on Sunday
										</option>
										<option>Manual only</option>
									</Select>
								</Field>
								<Field label="Backup destination">
									<Select>
										<option>This device</option>
										<option>USB drive</option>
										<option>DepEd Cloud</option>
									</Select>
								</Field>
							</div>
							<div className="mt-4 flex items-center gap-2">
								<Btn variant="secondary" icon="archive">
									Export all data (.zip)
								</Btn>
								<Btn
									variant="ghost"
									icon="trash-2"
									onClick={() => setClearOpen(true)}
								>
									Clear local cache
								</Btn>
							</div>
						</Card>
					</div>
				)}

				{/* ── Notifications ───────────────────────────── */}
				{sub === "notif" && (
					<Card className="p-5">
						<SectionHeader
							title="Notifications"
							subtitle="What you want to be alerted about"
						/>
						<div className="divide-y divide-line">
							<Switch
								value={notif1}
								onChange={setNotif1}
								label="Sync complete"
								hint="When records have finished uploading."
							/>
							<Switch
								value={notif2}
								onChange={setNotif2}
								label="Sync failed"
								hint="If a sync didn't complete for any reason."
							/>
							<Switch
								value={notif3}
								onChange={setNotif3}
								label="Pending records reminder"
								hint="Periodic nudge when records sit in queue for >24h."
							/>
						</div>
					</Card>
				)}

				{/* ── Devices ─────────────────────────────────── */}
				{sub === "devices" && (
					<Card className="p-5">
						<SectionHeader
							title="Devices"
							subtitle="Paired with your account"
						/>
						{isDevicesLoading ? (
							<div className="space-y-2">
								{[...Array(3)].map((_, i) => (
									<div
										key={i}
										className="h-14 rounded-md bg-slate-100 animate-pulse"
									/>
								))}
							</div>
						) : !devices || devices.length === 0 ? (
							<p className="text-[13px] text-muted py-4">
								No paired devices.
							</p>
						) : (
							<>
								<ul className="divide-y divide-line">
									{devices.map((d) => {
										const online =
											d.current ||
											lanPeerIds.has(d.deviceId);
										return (
											<li
												key={d.deviceId}
												className="flex items-center gap-3 py-3"
											>
												<span className="relative w-10 h-10 rounded-md bg-surface inline-flex items-center justify-center">
													<Icon
														name={deviceIcon(
															d.type,
														)}
														size={18}
														className="text-navy/70"
													/>
													{online && (
														<span
															className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
															title="Online"
														/>
													)}
												</span>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 min-w-0">
														<div className="text-[13px] font-semibold text-navy truncate">
															{d.name}
														</div>
														{d.current && (
															<Badge
																status="primary"
																withDot={false}
															>
																This device
															</Badge>
														)}
													</div>
													<div className="text-[11px] text-muted">
														{online
															? "Online now"
															: `last seen ${relativeTime(d.lastSeenAt)}`}
													</div>
												</div>
												<div className="flex items-center gap-1">
													<Btn
														variant="ghost"
														size="sm"
														icon="pencil"
														onClick={() => {
															setRenameDevice(d);
															setRenameValue(
																d.name,
															);
														}}
													>
														Rename
													</Btn>
													<Btn
														variant="ghost"
														size="sm"
														icon="x"
														onClick={() =>
															setRevokeTarget(d)
														}
													>
														Revoke
													</Btn>
												</div>
											</li>
										);
									})}
								</ul>
								<p className="mt-4 text-[11.5px] text-muted">
									Sign in on another device to pair it.
								</p>
							</>
						)}
					</Card>
				)}

				{/* ── About ───────────────────────────────────── */}
				{sub === "about" && (
					<Card className="p-5">
						<SectionHeader title="About AralSync" />
						<div className="flex items-start gap-4">
							<Logo size={20} />
							<div className="flex-1">
								<div className="text-[13px] text-muted">
									v1.0.0 · Beta
								</div>
								<p className="text-[13px] text-navy mt-2 max-w-md leading-relaxed">
									Built for Philippine public school teachers.
									Designed to keep classroom records flowing -
									even on patchy connections - and to align
									with the DepEd grading framework out of the
									box.
								</p>
								<div className="mt-3 flex items-center gap-2">
									<Btn
										variant="secondary"
										size="sm"
										icon="git-commit"
									>
										View changelog
									</Btn>
									<Btn
										variant="ghost"
										size="sm"
										icon="message-square"
									>
										Send feedback
									</Btn>
								</div>
								<div className="mt-4 text-[11px] text-muted">
									© 2026 AralSync · Teach more. Sync
									seamlessly.
								</div>
							</div>
						</div>
					</Card>
				)}
			</div>

			{/* ── Avatar picker modal ──────────────────────── */}
			<Modal
				open={showAvatarPicker}
				onClose={() => setShowAvatarPicker(false)}
				title="Choose an avatar"
				width="max-w-xl"
			>
				<div className="space-y-4">
					<button
						type="button"
						className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-slate-300 hover:border-primary hover:bg-primary-light/30 tx text-[13px] font-medium text-navy/70 hover:text-primary"
						onClick={() => {
							setShowAvatarPicker(false);
							avatarInputRef.current?.click();
						}}
					>
						<Icon name="upload" size={16} />
						Upload a photo
					</button>

					<div className="flex items-center gap-2 text-[11px] text-muted uppercase tracking-wide">
						<span className="flex-1 border-t border-slate-200" />
						<span>Or pick one</span>
						<span className="flex-1 border-t border-slate-200" />
					</div>

					<div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
						{PRESET_AVATARS.map((name) => {
							const src = `/avatars/${name}.png`;
							const isSelected =
								(avatarPreview || user?.avatarUrl) === src;
							return (
								<div
									key={name}
									title={name}
									onClick={() => {
										setAvatarPreview(src);
										setShowAvatarPicker(false);
									}}
									className={`rounded-full overflow-hidden aspect-square border-2 hover:scale-125 duration-400 transition-all cursor-pointer ${isSelected ? "border-primary shadow-md" : "border-transparent hover:border-primary/40"}`}
								>
									<img
										src={src}
										alt={name}
										className="w-full h-full object-cover"
									/>
								</div>
							);
						})}
					</div>
				</div>
			</Modal>

			{/* ── Clear cache modal ────────────────────────── */}
			<Modal
				open={clearOpen}
				onClose={() => setClearOpen(false)}
				title="Clear local cache?"
				subtitle="Pending records will be lost. Synced data on the cloud stays."
				footer={
					<>
						<Btn
							variant="ghost"
							onClick={() => setClearOpen(false)}
						>
							Cancel
						</Btn>
						<Btn
							variant="danger"
							icon="trash-2"
							onClick={() => {
								setClearOpen(false);
								toast?.push({
									type: "warning",
									title: "Cache cleared",
									message: "42.3 MB freed locally.",
								});
							}}
						>
							Yes, clear cache
						</Btn>
					</>
				}
			>
				<div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-[12.5px] text-rose-800 flex items-start gap-2">
					<Icon name="alert-triangle" size={14} />
					<span>
						<span className="font-semibold">
							3 records are still pending sync.
						</span>{" "}
						Clearing the cache will discard them. Sync first if you
						need to keep them.
					</span>
				</div>
			</Modal>

			{/* ── Rename device modal ─────────────────────── */}
			<Modal
				open={renameDevice !== null}
				onClose={() => setRenameDevice(null)}
				title="Rename device"
				subtitle="Pick a name you'll recognize later."
				footer={
					<>
						<Btn
							variant="ghost"
							onClick={() => setRenameDevice(null)}
						>
							Cancel
						</Btn>
						<Btn
							variant="primary"
							icon="save"
							disabled={
								renameDeviceMut.isPending ||
								renameValue.trim().length === 0
							}
							onClick={() =>
								renameDevice &&
								void handleRenameDevice(
									renameDevice,
									renameValue,
								)
							}
						>
							{renameDeviceMut.isPending ? "Saving…" : "Save"}
						</Btn>
					</>
				}
			>
				<Field label="Device name">
					<TextInput
						autoFocus
						value={renameValue}
						maxLength={60}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setRenameValue(e.target.value)
						}
						onKeyDown={(
							e: React.KeyboardEvent<HTMLInputElement>,
						) => {
							if (e.key === "Enter" && renameDevice) {
								e.preventDefault();
								void handleRenameDevice(
									renameDevice,
									renameValue,
								);
							}
						}}
					/>
				</Field>
			</Modal>

			{/* ── Revoke device modal ─────────────────────── */}
			<Modal
				open={revokeTarget !== null}
				onClose={() => setRevokeTarget(null)}
				title={
					revokeTarget?.current
						? "Sign out this device?"
						: "Revoke device?"
				}
				subtitle={
					revokeTarget?.current
						? "You'll be signed out here and will need to sign in again."
						: "The device will need to sign in again to access your account."
				}
				footer={
					<>
						<Btn
							variant="ghost"
							onClick={() => setRevokeTarget(null)}
						>
							Cancel
						</Btn>
						<Btn
							variant="danger"
							icon="x"
							disabled={revokeDeviceMut.isPending}
							onClick={() =>
								revokeTarget &&
								void handleRevokeDevice(revokeTarget)
							}
						>
							{revokeDeviceMut.isPending
								? "Revoking…"
								: revokeTarget?.current
									? "Sign out"
									: "Revoke"}
						</Btn>
					</>
				}
			>
				{revokeTarget && (
					<div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-[12.5px] text-rose-800 flex items-start gap-2">
						<Icon name="alert-triangle" size={14} />
						<span>
							<span className="font-semibold">
								{revokeTarget.name}
							</span>{" "}
							will lose access on its next request. Pending
							records on that device may not sync.
						</span>
					</div>
				)}
			</Modal>
		</div>
	);
}
