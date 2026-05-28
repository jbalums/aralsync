// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Icon, Logo, Avatar, Dropdown, ConnPill } from "../components";
import { useSyncStore } from "../modules/sync/syncStore";
import { useAuthStore } from "../modules/auth/authStore";
import { db } from "../db";
import type { School } from "../shared/types";
import { schoolsService } from "../modules/classrooms/schools.service";

// ─── APP SHELL: SIDEBAR + TOPBAR + MOBILE NAV ────────────

export const NAV_GROUPS = [
	{
		label: "Main",
		items: [
			{ id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
			{ id: "classes", label: "My Classes", icon: "book-marked" },
			{ id: "students", label: "Students", icon: "users" },
			{ id: "attendance", label: "Attendance", icon: "clipboard-check" },
			{ id: "schedules", label: "Schedules", icon: "calendar-days" },
		],
	},
	{
		label: "Academics",
		items: [
			{ id: "gradebook", label: "Gradebook", icon: "graduation-cap" },
			{ id: "reports", label: "Reports", icon: "file-text" },
		],
	},
	{
		label: "Admin",
		adminOnly: true,
		items: [
			{
				id: "admin",
				label: "Admin Console",
				icon: "shield-check",
				badge: "PRO",
			},
		],
	},
	{
		label: "System",
		items: [
			{ id: "sync", label: "Sync Center", icon: "refresh-cw" },
			{ id: "settings", label: "Settings", icon: "settings" },
		],
	},
];

const ROLE_LABELS: Record<string, string> = {
	super_admin: "Super Administrator",
	school_admin: "School Administrator",
	advisory_teacher: "Advisory Teacher",
	subject_teacher: "Subject Teacher",
};

export const MOBILE_TABS = [
	{ id: "dashboard", label: "Home", icon: "home" },
	{ id: "classes", label: "Classes", icon: "book-marked" },
	{ id: "attendance", label: "Attendance", icon: "clipboard-check" },
	{ id: "gradebook", label: "Gradebook", icon: "graduation-cap" },
	{ id: "more", label: "More", icon: "more-horizontal" },
];

export function Sidebar({ route, setRoute, online, onClose = () => {} }) {
	const user = useAuthStore((s) => s.user);
	const isAdmin =
		user?.role === "super_admin" || user?.role === "school_admin";
	const queueCount = useSyncStore((s) => s.queueCount);
	const lastSyncAt = useSyncStore((s) => s.lastSyncAt);
	const [school, setSchool] = useState<School | null>(null);
	useEffect(() => {
		if (!user?.schoolId) {
			setSchool(null);
			return;
		}
		db.schools.get(user.schoolId).then(async (cached) => {
			if (cached) {
				setSchool(cached);
				return;
			}
			if (!online) return;
			try {
				const remote = await schoolsService.getById(user.schoolId);
				await db.schools.put(remote);
				setSchool(remote);
			} catch {
				// silently ignore — school block stays hidden
			}
		});
	}, [user?.schoolId, online]);
	const lastSyncLabel = lastSyncAt
		? new Date(lastSyncAt).toLocaleTimeString()
		: "Never";
	return (
		<aside className="h-full w-[248px] shrink-0 bg-white border-r border-line flex flex-col">
			<div className="px-4 h-16 border-b border-line flex items-center justify-between">
				<div className="flex items-center gap-2">
					<img
						src="/icon.png"
						alt="AralSync"
						style={{ height: 44, objectFit: "contain" }}
						draggable={false}
					/>
					<img
						src="/wordmark.png"
						alt="AralSync"
						style={{ height: 32, objectFit: "contain" }}
						draggable={false}
					/>
				</div>
				{onClose && (
					<button
						className="lg:hidden text-muted p-1"
						onClick={onClose}
						aria-label="Close menu"
					>
						<Icon name="x" size={18} />
					</button>
				)}
			</div>

			{school && (
				<div className="px-4 py-2.5 border-b border-line bg-surface/50 flex flex-col items-center justify-center">
					<div className="flex flex-col items-center gap-2 min-w-0">
						<span className="text-[12px] font-semibold text-navy truncate px-1 break-after-all whitespace-break-spaces text-center">
							{school.name}
						</span>
					</div>
					<p className="text-[10px] text-muted mt-0.5 truncate pl-5.5">
						{school.division}
					</p>
				</div>
			)}

			<div className="flex-1 overflow-y-auto py-3 px-3">
				{NAV_GROUPS.filter((g) => !g.adminOnly || isAdmin).map(
					(group) => (
						<div key={group.label} className="mb-4">
							<div className="px-2 mb-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-light">
								{group.label}
							</div>
							<div className="flex flex-col gap-0.5">
								{group.items.map((item) => {
									const isActive = route === item.id;
									return (
										<button
											key={item.id}
											onClick={() => setRoute(item.id)}
											className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13.5px] font-medium tx text-left relative ${isActive ? "bg-primary-light/70 text-primary-dark" : "text-navy/80 hover:bg-slate-50"}`}
										>
											{isActive && (
												<span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary"></span>
											)}
											<Icon
												name={item.icon}
												size={16}
												className={
													isActive
														? "text-primary"
														: "text-muted"
												}
											/>
											<span className="flex-1">
												{item.label}
											</span>
											{item.id === "sync" &&
												queueCount > 0 && (
													<span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
														{queueCount}
													</span>
												)}
											{item.badge && (
												<span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-br from-primary to-emerald-500 text-white tracking-wide">
													{item.badge}
												</span>
											)}
										</button>
									);
								})}
							</div>
						</div>
					),
				)}

				{user?.role === "super_admin" && (
					<div className="mb-4">
						<div className="px-2 mb-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-light">
							Owner
						</div>
						<div className="flex flex-col gap-0.5">
							{(() => {
								const isActive = route === "owner";
								return (
									<button
										onClick={() => setRoute("owner")}
										className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13.5px] font-medium tx text-left relative ${isActive ? "bg-primary-light/70 text-primary-dark" : "text-navy/80 hover:bg-slate-50"}`}
									>
										{isActive && (
											<span className="absolute left-0 top-1.5 bottom-1.5 w-0.75 rounded-r bg-primary"></span>
										)}
										<Icon
											name="globe-2"
											size={16}
											className={
												isActive
													? "text-primary"
													: "text-muted"
											}
										/>
										<span className="flex-1">
											Owner Dashboard
										</span>
									</button>
								);
							})()}
						</div>
					</div>
				)}
			</div>

			<div className="px-3 pb-3 border-t border-line pt-3 flex flex-col gap-3">
				{/* Sync badge */}
				<button
					onClick={() => setRoute("sync")}
					className="rounded-md border border-line bg-surface/60 hover:bg-white p-2.5 text-left tx"
				>
					<div className="flex items-center gap-2">
						<span
							className="dot pulse-dot"
							style={{
								background: queueCount ? "#F59E0B" : "#10B981",
								width: 9,
								height: 9,
							}}
						/>
						<span className="text-[12px] font-semibold text-navy">
							{queueCount} pending sync
						</span>
						<Icon
							name="chevron-right"
							size={14}
							className="ml-auto text-muted"
						/>
					</div>
					<div className="text-[11px] text-muted mt-1">
						Last sync · {lastSyncLabel}
					</div>
				</button>

				{/* Teacher card */}
				<div className="rounded-md border border-line bg-white p-2.5 flex items-center gap-2.5">
					<div className="relative">
						<Avatar name={user?.name ?? ""} src={user?.avatarUrl ?? ""} size="sm" />
						{isAdmin && (
							<span
								className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-primary to-emerald-500 inline-flex items-center justify-center border-2 border-white"
								title="Administrator"
							>
								<Icon
									name="shield"
									size={8}
									className="text-white"
								/>
							</span>
						)}
					</div>
					<div className="min-w-0 flex flex-col">
						<div className="text-[12.5px] font-semibold text-navy truncate flex items-center gap-1.5">
							{user?.name ?? ""}
						</div>
						<div className="text-[11px] text-muted truncate">
							{ROLE_LABELS[user?.role ?? ""] ?? user?.email ?? ""}
						</div>
					</div>
					<button
						className="text-muted hover:text-navy"
						aria-label="Account"
					>
						<Icon name="chevron-up" size={14} />
					</button>
				</div>
			</div>
		</aside>
	);
}

export function TopBar({
	route,
	setRoute,
	online,
	onMenu,
	breadcrumbExtra = undefined,
}) {
	const titles = {
		dashboard: { title: "Dashboard", crumb: ["Home", "Dashboard"] },
		classes: { title: "My Classes", crumb: ["Home", "My Classes"] },
		students: { title: "Students", crumb: ["Home", "Students"] },
		attendance: { title: "Attendance", crumb: ["Home", "Attendance"] },
		gradebook: { title: "Gradebook", crumb: ["Home", "Gradebook"] },
		reports: { title: "Reports", crumb: ["Home", "Reports"] },
		sync: {
			title: "Sync Center",
			crumb: ["Home", "System", "Sync Center"],
		},
		settings: { title: "Settings", crumb: ["Home", "System", "Settings"] },
		"class-detail": {
			title: "Class Details",
			crumb: ["Home", "My Classes", "Class Details"],
		},
		"student-profile": {
			title: "Student Profile",
			crumb: ["Home", "Students", "Student Profile"],
		},
		schedules: { title: "Schedules", crumb: ["Home", "Schedules"] },
		admin: { title: "Admin Console", crumb: ["Home", "Admin", "Console"] },
		owner: {
			title: "Owner Dashboard",
			crumb: ["Home", "Owner", "Dashboard"],
		},
	};
	const t = titles[route] || { title: "AralSync", crumb: ["Home"] };
	const user = useAuthStore((s) => s.user);
	const isAdmin =
		user?.role === "super_admin" || user?.role === "school_admin";
	const [notifsOpen, setNotifsOpen] = useState(false);
	const unread = 0;

	return (
		<header className="h-16 bg-white border-b border-line px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
			<div className="flex items-center gap-3 min-w-0">
				<button
					className="lg:hidden p-1.5 rounded-md hover:bg-slate-100"
					onClick={onMenu}
					aria-label="Menu"
				>
					<Icon name="menu" size={20} />
				</button>
				<div className="min-w-0">
					<h1 className="text-[18px] font-semibold tracking-tight text-navy truncate">
						{breadcrumbExtra?.title || t.title}
					</h1>
					<div className="hidden sm:flex items-center gap-1.5 text-[11.5px] text-muted">
						{(breadcrumbExtra?.crumb || t.crumb).map(
							(c, i, arr) => (
								<React.Fragment key={i}>
									<span
										className={
											i === arr.length - 1
												? "text-navy/70 font-medium"
												: ""
										}
									>
										{c}
									</span>
									{i < arr.length - 1 && (
										<Icon
											name="chevron-right"
											size={11}
											className="text-muted-light"
										/>
									)}
								</React.Fragment>
							),
						)}
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2 sm:gap-3">
				<div className="hidden sm:flex items-center">
					<ConnPill online={online} />
				</div>

				<div className="relative">
					<button
						className="relative w-9 h-9 rounded-md hover:bg-slate-100 flex items-center justify-center"
						onClick={() => setNotifsOpen((o) => !o)}
						aria-label="Notifications"
					>
						<Icon name="bell" size={18} />
						{unread > 0 && (
							<span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
								{unread}
							</span>
						)}
					</button>
					{notifsOpen && (
						<div className="absolute right-0 top-full mt-2 w-[320px] bg-white border border-line rounded-lg shadow-lg modal-anim z-40">
							<div className="px-4 py-2.5 border-b border-line flex items-center justify-between">
								<span className="text-[13px] font-semibold text-navy">
									Notifications
								</span>
								<button className="text-[11px] text-primary font-semibold">
									Mark all read
								</button>
							</div>
							<div className="max-h-[300px] overflow-y-auto">
								<div className="px-4 py-6 text-center text-[12px] text-muted">
									No notifications
								</div>
							</div>
							<div className="px-4 py-2 text-center">
								<button className="text-[12px] text-muted hover:text-navy">
									View all activity
								</button>
							</div>
						</div>
					)}
				</div>

				<Dropdown
					align="right"
					trigger={
						<button
							className="flex items-center gap-2 hover:bg-slate-100 rounded-md px-1 py-1 tx"
							aria-label="Account"
						>
							<div className="relative">
								<Avatar name={user?.name ?? ""} src={user?.avatarUrl ?? ""} size="sm" />
								{isAdmin && (
									<span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-gradient-to-br from-primary to-emerald-500 inline-flex items-center justify-center border-2 border-white">
										<Icon
											name="shield"
											size={6}
											className="text-white"
										/>
									</span>
								)}
							</div>
							<Icon
								name="chevron-down"
								size={14}
								className="text-muted hidden sm:inline"
							/>
						</button>
					}
					items={[
						{
							render: () => {
								return (
									<div className="px-4 py-3 flex flex-col items-center justify-center">
										<div className="mb-2">
											<Avatar
												name={user?.name ?? ""}
												src={user?.avatarUrl ?? ""}
												size="lg"
											/>
										</div>
										<div className="text-sm font-semibold text-navy">
											{user?.name ?? ""}
										</div>
										<div className="text-xs text-muted">
											{ROLE_LABELS[user?.role ?? ""] ??
												user?.email ??
												""}
										</div>
									</div>
								);
							},
						},
						{ separator: true },
						...(isAdmin
							? [
									{
										label: "Admin Console",
										icon: "shield-check",
										onClick: () => setRoute("admin"),
									},
								]
							: []),
						{
							label: "Schedules",
							icon: "calendar-days",
							onClick: () => setRoute("schedules"),
						},
						{
							label: "Profile & School",
							icon: "id-card",
							onClick: () => setRoute("settings"),
						},
						{
							label: "Sync Center",
							icon: "refresh-cw",
							onClick: () => setRoute("sync"),
						},
						{
							label: "Settings",
							icon: "settings",
							onClick: () => setRoute("settings"),
						},
						{ separator: true },
						{
							label: "Sign out",
							icon: "log-out",
							onClick: async () => {
								const { clearAuth } = useAuthStore.getState();
								await clearAuth();
								window.location.href = "/login";
							},
						},
					]}
				/>
			</div>
		</header>
	);
}

export function MobileTabBar({ route, setRoute, openMore }) {
	return (
		<nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-line h-16 grid grid-cols-5 px-1 safe-bot">
			{MOBILE_TABS.map((t) => {
				const active = t.id !== "more" && route === t.id;
				return (
					<button
						key={t.id}
						className={`flex flex-col items-center justify-center gap-0.5 ${active ? "text-primary" : "text-muted"} press`}
						onClick={() =>
							t.id === "more" ? openMore() : setRoute(t.id)
						}
					>
						<Icon name={t.icon} size={20} />
						<span className="text-[10px] font-semibold tracking-wide">
							{t.label}
						</span>
					</button>
				);
			})}
		</nav>
	);
}

export function MoreSheet({ open, onClose, setRoute }) {
	if (!open) return null;
	const user = useAuthStore((s) => s.user);
	const isAdmin =
		user?.role === "super_admin" || user?.role === "school_admin";
	const items = [
		{ id: "students", label: "Students", icon: "users" },
		{ id: "schedules", label: "Schedules", icon: "calendar-days" },
		{ id: "reports", label: "Reports", icon: "file-text" },
		...(isAdmin
			? [{ id: "admin", label: "Admin Console", icon: "shield-check" }]
			: []),
		{ id: "sync", label: "Sync Center", icon: "refresh-cw" },
		{ id: "settings", label: "Settings", icon: "settings" },
	];
	return (
		<div className="lg:hidden fixed inset-0 z-[60]">
			<div
				className="absolute inset-0 bg-black/40"
				onClick={onClose}
			></div>
			<div className="absolute bottom-0 inset-x-0 bg-white rounded-t-xl p-4 modal-anim border-t border-line pb-8">
				<div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
				<div className="grid grid-cols-2 gap-3">
					{items.map((it) => (
						<button
							key={it.id}
							onClick={() => {
								onClose();
								setRoute(it.id);
							}}
							className="flex items-center gap-3 p-3 rounded-md border border-line bg-surface hover:bg-white press tx"
						>
							<span className="w-8 h-8 rounded-md bg-primary-light text-primary inline-flex items-center justify-center">
								<Icon name={it.icon} size={16} />
							</span>
							<span className="text-[13px] font-semibold text-navy">
								{it.label}
							</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
