import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "@tanstack/react-router";
import { authService } from "../modules/auth/auth.service";
import { useAuthStore } from "../modules/auth/authStore";

const schema = z.object({
	email: z.string().min(1, "Email is required").email("Invalid email"),
	password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

function generateDeviceId(): string {
	return btoa(`${navigator.userAgent}-${Date.now()}`).slice(0, 32);
}

export default function SignIn() {
	const navigate = useNavigate();
	const { setAuth } = useAuthStore();
	const [serverError, setServerError] = useState("");
	const [showPassword, setShowPassword] = useState(false);

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
			const result = await authService.login({
				...values,
				deviceId: generateDeviceId(),
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
			setServerError(msg ?? "Invalid email or password.");
		}
	};

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
							id="polyA"
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
							id="polyB"
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

					{/* Big hex top-right */}
					<polygon
						points="640,80 740,140 740,260 640,320 540,260 540,140"
						fill="url(#polyA)"
						stroke="rgba(167,243,208,0.35)"
						strokeWidth="1.2"
					>
						<animateTransform
							attributeName="transform"
							type="rotate"
							from="0 640 200"
							to="360 640 200"
							dur="60s"
							repeatCount="indefinite"
						/>
					</polygon>

					{/* Triangle mid-left */}
					<polygon
						points="60,440 220,400 160,560"
						fill="url(#polyB)"
						stroke="rgba(255,255,255,0.25)"
						strokeWidth="1"
					>
						<animateTransform
							attributeName="transform"
							type="rotate"
							from="360 140 480"
							to="0 140 480"
							dur="45s"
							repeatCount="indefinite"
						/>
					</polygon>

					{/* Small hex bottom-left */}
					<polygon
						points="120,820 180,855 180,925 120,960 60,925 60,855"
						fill="none"
						stroke="rgba(167,243,208,0.45)"
						strokeWidth="1.2"
					/>

					{/* Diamond mid-right */}
					<polygon
						points="700,560 760,640 700,720 640,640"
						fill="none"
						stroke="rgba(255,255,255,0.28)"
						strokeWidth="1"
					>
						<animateTransform
							attributeName="transform"
							type="rotate"
							from="0 700 640"
							to="360 700 640"
							dur="50s"
							repeatCount="indefinite"
						/>
					</polygon>

					{/* Pentagon bottom-right */}
					<polygon
						points="560,780 640,760 680,830 620,890 540,860"
						fill="url(#polyA)"
						stroke="rgba(167,243,208,0.25)"
						strokeWidth="1"
					/>

					{/* Tiny dots */}
					<circle cx="420" cy="180" r="3" fill="#a7f3d0" />
					<circle cx="320" cy="700" r="2.5" fill="#a7f3d0" />
					<circle cx="500" cy="500" r="2" fill="#ffffff" opacity="0.6" />
					<circle cx="220" cy="280" r="2" fill="#ffffff" opacity="0.5" />
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
						Welcome back
					</div>
					<h1 className="text-[40px] font-bold tracking-tight leading-[1.05] mt-3 max-w-md">
						Teach more.
						<br />
						Sync seamlessly.
					</h1>
					<p className="mt-4 text-white/75 text-[15px] max-w-md leading-relaxed">
						Pick up where you left off - your attendance, grades,
						and schedules are right where you saved them, online or
						off.
					</p>
				</div>

				<div className="relative text-[12px] text-white/45">
					© {new Date().getFullYear()} AralSync
				</div>
			</aside>

			{/* Form panel */}
			<main className="relative flex flex-col items-center justify-center px-6 py-12 bg-surface min-h-screen lg:min-h-0 overflow-hidden">
				{/* Subtle polygon accents */}
				<svg
					className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
					viewBox="0 0 600 900"
					preserveAspectRatio="xMidYMid slice"
					aria-hidden="true"
				>
					<polygon
						points="500,60 560,100 560,180 500,220 440,180 440,100"
						fill="none"
						stroke="rgba(16,185,129,0.18)"
						strokeWidth="1"
					/>
					<polygon
						points="60,760 130,740 150,810 90,840"
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
				</svg>
				{/* Mobile logo */}
				<div className="lg:hidden mb-8 relative">
					<img
						src="/logo.png"
						alt="AralSync"
						style={{ height: 38, objectFit: "contain" }}
						draggable={false}
					/>
				</div>

				<div className="relative w-full max-w-[380px]">
					<h2 className="text-[24px] font-bold text-navy tracking-tight">
						Sign in to your account
					</h2>
					<p className="mt-1 text-sm text-muted">
						New here?{" "}
						<Link
							to="/register"
							className="text-primary font-medium hover:underline"
						>
							Create an account
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
								autoFocus
								{...register("email")}
								className={`h-[42px] px-3 rounded-lg border text-[14px] bg-white outline-none transition-all
                  focus:border-primary focus:ring-4 focus:ring-primary/10
                  ${errors.email ? "border-red-400" : "border-line"}`}
							/>
							{errors.email && (
								<span className="text-[12px] text-red-500">
									{errors.email.message}
								</span>
							)}
						</div>

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
									autoComplete="current-password"
									{...register("password")}
									className={`h-[42px] w-full px-3 pr-10 rounded-lg border text-[14px] bg-white outline-none transition-all
                    focus:border-primary focus:ring-4 focus:ring-primary/10
                    ${errors.password ? "border-red-400" : "border-line"}`}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
									tabIndex={-1}
								>
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
										{showPassword ? (
											<>
												<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
												<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
												<line
													x1="1"
													y1="1"
													x2="23"
													y2="23"
												/>
											</>
										) : (
											<>
												<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
												<circle cx="12" cy="12" r="3" />
											</>
										)}
									</svg>
								</button>
							</div>
							{errors.password && (
								<span className="text-[12px] text-red-500">
									{errors.password.message}
								</span>
							)}
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							className="mt-2 h-[42px] rounded-lg bg-primary text-white text-[14px] font-semibold
                hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{isSubmitting ? "Signing in…" : "Sign in"}
						</button>
					</form>
				</div>
			</main>
		</div>
	);
}
