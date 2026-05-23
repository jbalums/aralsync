import { ArrowRight } from "lucide-react";

export function LandingNav() {
	return (
		<header className="sticky top-0 z-30 bg-white backdrop-blur-md border-b border-line/80">
			<div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
				<a href="/" className="flex items-center group">
					<img
						src="/icon.png"
						alt="AralSync"
						style={{ height: "48px", objectFit: "contain" }}
						draggable={false}
					/>
					<img
						src="/wordmark.png"
						alt="AralSync"
						style={{ height: "28px", objectFit: "contain" }}
						draggable={false}
					/>
				</a>
				<nav className="hidden md:flex items-center gap-7 text-[13.5px] text-navy/75 font-medium">
					<a href="#features" className="hover:text-primary tx">
						Features
					</a>
					<a href="#offline" className="hover:text-primary tx">
						Offline-first
					</a>
					<a href="#deped" className="hover:text-primary tx">
						DepEd-ready
					</a>
					<a href="#preview" className="hover:text-primary tx">
						See it
					</a>
					<a href="#faq" className="hover:text-primary tx">
						FAQ
					</a>
				</nav>
				<div className="flex items-center gap-2">
					<a
						href="/signin"
						className="hidden sm:inline-flex h-9 px-3.5 items-center text-[13px] font-semibold text-navy hover:bg-slate-100 rounded-md tx"
					>
						Sign in
					</a>
					<a
						href="/signin?mode=register"
						className="inline-flex h-9 px-3.5 items-center gap-1.5 text-[13px] font-semibold bg-primary text-white rounded-md hover:bg-primary-dark press tx"
					>
						Get started{" "}
						<ArrowRight
							className="w-3.5 h-3.5"
							strokeWidth={1.75}
						/>
					</a>
				</div>
			</div>
		</header>
	);
}
