import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "@tanstack/react-router";
import { authService } from "../modules/auth/auth.service";
import { useAuthStore } from "../modules/auth/authStore";
import { getOrCreateDeviceId, getUserAgent } from "../shared/utils/deviceId";

const schema = z
	.object({
		name: z.string().min(2, "Full name is required"),
		email: z.string().min(1, "Email is required").email("Invalid email"),
		schoolId: z.string().min(1, "School ID is required"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirm: z.string(),
	})
	.refine((d) => d.password === d.confirm, {
		message: "Passwords do not match",
		path: ["confirm"],
	});
type FormValues = z.infer<typeof schema>;

export default function Register() {
	const navigate = useNavigate();
	const { setAuth } = useAuthStore();
	const [serverError, setServerError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
	});

	const onSubmit = async (values: FormValues) => {
		setServerError("");
		try {
			const result = await authService.register({
				name: values.name,
				email: values.email,
				schoolId: values.schoolId,
				password: values.password,
				deviceId: getOrCreateDeviceId(),
				userAgent: getUserAgent(),
			});
			await setAuth(
				result.user,
				result.tokens.accessToken,
				result.tokens.refreshToken,
			);
			void navigate({ to: "/app/dashboard" });
		} catch (err: unknown) {
			const msg = (err as { response?: { data?: { message?: string } } })
				?.response?.data?.message;
			setServerError(msg ?? "Registration failed. Please try again.");
		}
	};

	const EyeIcon = ({ visible }: { visible: boolean }) => (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			{visible ? (
				<>
					<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
					<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
					<line x1="1" y1="1" x2="23" y2="23" />
				</>
			) : (
				<>
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
					<circle cx="12" cy="12" r="3" />
				</>
			)}
		</svg>
	);

	return (
		<div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
			{/* Brand panel */}
			<aside
				className="relative hidden lg:flex flex-col justify-between p-10 text-white overflow-hidden"
				style={{
					background:
						"linear-gradient(140deg, #003f13 0%, #0a4426eb 45%, #10b941c7 110%)",
				}}
			>
				{/* Grid overlay */}
				<div
					className="absolute inset-0 opacity-20"
					style={{
						backgroundImage:
							"linear-gradient(rgba(15,118,110,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(15,118,110,0.12) 1px,transparent 1px)",
						backgroundSize: "28px 28px",
					}}
				/>

				{/* Glow blobs */}
				<div
					className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full blur-3xl opacity-40 pointer-events-none"
					style={{
						background:
							"radial-gradient(circle, #10b981 0%, transparent 70%)",
					}}
				/>
				<div
					className="absolute -bottom-40 -right-24 w-[480px] h-[480px] rounded-full blur-3xl opacity-30 pointer-events-none"
					style={{
						background:
							"radial-gradient(circle, #34d399 0%, transparent 70%)",
					}}
				/>

				{/* Floating polygon graphics */}
				<svg
					className="absolute inset-0 w-full h-full pointer-events-none"
					viewBox="0 0 800 1000"
					preserveAspectRatio="xMidYMid slice"
					aria-hidden="true"
				>
					<defs>
						<linearGradient
							id="rPolyA"
							x1="0%"
							y1="0%"
							x2="100%"
							y2="100%"
						>
							<stop
								offset="0%"
								stopColor="#a7f3d0"
								stopOpacity="0.35"
							/>
							<stop
								offset="100%"
								stopColor="#10b981"
								stopOpacity="0.05"
							/>
						</linearGradient>
						<linearGradient
							id="rPolyB"
							x1="0%"
							y1="0%"
							x2="100%"
							y2="100%"
						>
							<stop
								offset="0%"
								stopColor="#ffffff"
								stopOpacity="0.18"
							/>
							<stop
								offset="100%"
								stopColor="#ffffff"
								stopOpacity="0"
							/>
						</linearGradient>
					</defs>

					{/* Hex top-left */}
					<polygon
						points="120,100 200,150 200,250 120,300 40,250 40,150"
						fill="url(#rPolyA)"
						stroke="rgba(167,243,208,0.35)"
						strokeWidth="1.2"
					>
						<animateTransform
							attributeName="transform"
							type="rotate"
							from="0 120 200"
							to="360 120 200"
							dur="60s"
							repeatCount="indefinite"
						/>
					</polygon>

					{/* Triangle top-right */}
					<polygon
						points="700,80 760,200 620,180"
						fill="url(#rPolyB)"
						stroke="rgba(255,255,255,0.25)"
						strokeWidth="1"
					>
						<animateTransform
							attributeName="transform"
							type="rotate"
							from="360 690 150"
							to="0 690 150"
							dur="45s"
							repeatCount="indefinite"
						/>
					</polygon>

					{/* Diamond mid-left */}
					<polygon
						points="60,520 130,600 60,680 -10,600"
						fill="none"
						stroke="rgba(255,255,255,0.28)"
						strokeWidth="1"
					>
						<animateTransform
							attributeName="transform"
							type="rotate"
							from="0 60 600"
							to="360 60 600"
							dur="50s"
							repeatCount="indefinite"
						/>
					</polygon>

					{/* Small hex mid-right */}
					<polygon
						points="700,460 760,495 760,565 700,600 640,565 640,495"
						fill="none"
						stroke="rgba(167,243,208,0.45)"
						strokeWidth="1.2"
					/>

					{/* Pentagon bottom-center */}
					<polygon
						points="380,820 460,800 500,870 440,930 360,900"
						fill="url(#rPolyA)"
						stroke="rgba(167,243,208,0.25)"
						strokeWidth="1"
					/>

					{/* Tiny dots */}
					<circle cx="500" cy="280" r="3" fill="#a7f3d0" />
					<circle cx="240" cy="660" r="2.5" fill="#a7f3d0" />
					<circle cx="600" cy="700" r="2" fill="#ffffff" opacity="0.6" />
					<circle cx="340" cy="380" r="2" fill="#ffffff" opacity="0.5" />
				</svg>

				<div className="relative">
					<Link to="/">
						<img
							src="/logo.png"
							alt="AralSync"
							style={{ height: 88, objectFit: "contain" }}
							draggable={false}
						/>
					</Link>
				</div>

				<div className="relative">
					<div className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.18em] uppercase text-emerald-200/90">
						<span className="inline-block w-2 h-2 rotate-45 bg-emerald-300/80" />
						Get started
					</div>
					<h1 className="text-[40px] font-bold tracking-tight leading-[1.05] mt-3 max-w-md">
						Teach more.
						<br />
						Sync seamlessly.
					</h1>
					<p className="mt-4 text-white/75 text-[15px] max-w-md leading-relaxed">
						Set up your classroom in minutes - attendance, grades,
						and schedules, all offline-ready from day one.
					</p>
				</div>

				<div className="relative text-[12px] text-white/45">
					© {new Date().getFullYear()} AralSync
				</div>
			</aside>

			{/* Form panel */}
			<main className="relative flex flex-col items-center justify-center px-6 py-12 bg-surface min-h-screen lg:min-h-0 overflow-hidden">
				{/* Background lift — soft mesh blobs */}
				<div
					aria-hidden="true"
					className="hidden lg:block absolute -top-24 -left-20 w-[320px] h-[320px] rounded-full blur-3xl opacity-50 pointer-events-none"
					style={{
						background:
							"radial-gradient(circle, #ccfbf1 0%, transparent 70%)",
					}}
				/>
				<div
					aria-hidden="true"
					className="hidden lg:block absolute -bottom-32 -right-24 w-[360px] h-[360px] rounded-full blur-3xl opacity-25 pointer-events-none"
					style={{
						background:
							"radial-gradient(circle, #10b981 0%, transparent 70%)",
					}}
				/>

				{/* Subtle polygon accents */}
				<svg
					className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
					viewBox="0 0 600 900"
					preserveAspectRatio="xMidYMid slice"
					aria-hidden="true"
				>
					<polygon
						points="500,60 560,100 560,180 500,220 440,180 440,100"
						fill="none"
						stroke="rgba(16,185,129,0.22)"
						strokeWidth="1.5"
					/>
					<polygon
						points="60,760 130,740 150,810 90,840"
						fill="none"
						stroke="rgba(16,185,129,0.2)"
						strokeWidth="1.5"
					/>
					<polygon
						points="540,420 580,455 565,510 515,500 505,455"
						fill="none"
						stroke="rgba(16,185,129,0.15)"
						strokeWidth="1"
					/>
					<circle
						cx="540"
						cy="780"
						r="3"
						fill="rgba(16,185,129,0.35)"
					/>
					<circle
						cx="80"
						cy="120"
						r="2.5"
						fill="rgba(16,185,129,0.35)"
					/>
					<circle
						cx="120"
						cy="500"
						r="2"
						fill="rgba(16,185,129,0.25)"
					/>
				</svg>

				{/* Mini animated illustration card — grade cell */}
				<div
					aria-hidden="true"
					className="hidden xl:block absolute top-10 right-10 w-[280px] float-anim"
				>
					<div className="bg-white border border-line rounded-lg shadow-md p-4">
						<div className="flex items-center justify-between mb-3">
							<div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted">
								Written Works — Q1
							</div>
							<div className="text-[10px] text-muted">Science 7</div>
						</div>
						<div className="grid grid-cols-3 gap-2">
							<div className="rounded-md border border-line bg-surface/60 px-2 py-2 text-center">
								<div className="text-[9px] text-muted mb-0.5">
									WW1
								</div>
								<div className="text-[12px] font-semibold text-navy">
									17/20
								</div>
							</div>
							<div className="rounded-md border border-line bg-surface/60 px-2 py-2 text-center">
								<div className="text-[9px] text-muted mb-0.5">
									WW2
								</div>
								<div className="text-[12px] font-semibold text-navy">
									19/20
								</div>
							</div>
							<div className="relative rounded-md border border-primary/40 bg-primary/5 px-2 py-2 text-center">
								<div className="text-[9px] text-muted mb-0.5">
									WW3
								</div>
								<div className="relative h-[14px]">
									<span className="anim-grade-empty absolute inset-0 grid place-items-center text-[12px] font-semibold text-muted">
										__
									</span>
									<span className="anim-grade-fill absolute inset-0 grid place-items-center text-[12px] font-semibold text-primary">
										18/20
									</span>
								</div>
							</div>
						</div>
						<div className="mt-3 pt-3 border-t border-line/70 flex items-center justify-between">
							<span className="text-[10px] text-muted">
								Q1 Grade
							</span>
							<span
								className="anim-chip-rise inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-bold"
								style={{
									backgroundColor: "#CCFBF1",
									color: "#0F766E",
								}}
							>
								91
							</span>
						</div>
					</div>
				</div>
				{/* Mobile logo */}
				<div className="lg:hidden mb-8">
					<img
						src="/logo.png"
						alt="AralSync"
						style={{ height: 38, objectFit: "contain" }}
						draggable={false}
					/>
				</div>

				<div className="relative w-full max-w-95">
					<h2 className="text-[24px] font-bold text-navy tracking-tight">
						Create your account
					</h2>
					<p className="mt-1 text-sm text-muted">
						Already have one?{" "}
						<Link
							to="/login"
							className="text-primary font-medium hover:underline"
						>
							Sign in
						</Link>
					</p>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="mt-8 flex flex-col gap-4"
						noValidate
					>
						{serverError && (
							<div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
								{serverError}
							</div>
						)}

						{/* Full name */}
						<div className="flex flex-col gap-1">
							<label
								htmlFor="name"
								className="text-[13px] font-medium text-navy"
							>
								Full name
							</label>
							<input
								id="name"
								type="text"
								autoComplete="name"
								autoFocus
								{...register("name")}
								className={`h-10.5 px-3 rounded-lg border text-[14px] bg-white outline-none transition-all
                  focus:border-primary focus:ring-4 focus:ring-primary/10
                  ${errors.name ? "border-red-400" : "border-line"}`}
							/>
							{errors.name && (
								<span className="text-[12px] text-red-500">
									{errors.name.message}
								</span>
							)}
						</div>

						{/* Email */}
						<div className="flex flex-col gap-1">
							<label
								htmlFor="email"
								className="text-[13px] font-medium text-navy"
							>
								Email address
							</label>
							<input
								id="email"
								type="email"
								autoComplete="email"
								{...register("email")}
								className={`h-10.5 px-3 rounded-lg border text-[14px] bg-white outline-none transition-all
                  focus:border-primary focus:ring-4 focus:ring-primary/10
                  ${errors.email ? "border-red-400" : "border-line"}`}
							/>
							{errors.email && (
								<span className="text-[12px] text-red-500">
									{errors.email.message}
								</span>
							)}
						</div>

						{/* School ID */}
						<div className="flex flex-col gap-1">
							<label
								htmlFor="schoolId"
								className="text-[13px] font-medium text-navy"
							>
								School ID
							</label>
							<input
								id="schoolId"
								type="text"
								{...register("schoolId")}
								className={`h-10.5 px-3 rounded-lg border text-[14px] bg-white outline-none transition-all
                  focus:border-primary focus:ring-4 focus:ring-primary/10
                  ${errors.schoolId ? "border-red-400" : "border-line"}`}
							/>
							{errors.schoolId && (
								<span className="text-[12px] text-red-500">
									{errors.schoolId.message}
								</span>
							)}
						</div>

						{/* Password */}
						<div className="flex flex-col gap-1">
							<label
								htmlFor="password"
								className="text-[13px] font-medium text-navy"
							>
								Password
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									autoComplete="new-password"
									{...register("password")}
									className={`h-10.5 w-full px-3 pr-10 rounded-lg border text-[14px] bg-white outline-none transition-all
                    focus:border-primary focus:ring-4 focus:ring-primary/10
                    ${errors.password ? "border-red-400" : "border-line"}`}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
									tabIndex={-1}
								>
									<EyeIcon visible={showPassword} />
								</button>
							</div>
							{errors.password && (
								<span className="text-[12px] text-red-500">
									{errors.password.message}
								</span>
							)}
						</div>

						{/* Confirm password */}
						<div className="flex flex-col gap-1">
							<label
								htmlFor="confirm"
								className="text-[13px] font-medium text-navy"
							>
								Confirm password
							</label>
							<div className="relative">
								<input
									id="confirm"
									type={showConfirm ? "text" : "password"}
									autoComplete="new-password"
									{...register("confirm")}
									className={`h-10.5 w-full px-3 pr-10 rounded-lg border text-[14px] bg-white outline-none transition-all
                    focus:border-primary focus:ring-4 focus:ring-primary/10
                    ${errors.confirm ? "border-red-400" : "border-line"}`}
								/>
								<button
									type="button"
									onClick={() => setShowConfirm((v) => !v)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
									tabIndex={-1}
								>
									<EyeIcon visible={showConfirm} />
								</button>
							</div>
							{errors.confirm && (
								<span className="text-[12px] text-red-500">
									{errors.confirm.message}
								</span>
							)}
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							className="mt-2 h-10.5 rounded-lg bg-primary text-white text-[14px] font-semibold
                hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{isSubmitting ? "Creating account…" : "Create account"}
						</button>
					</form>
				</div>
			</main>
		</div>
	);
}
