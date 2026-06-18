const milestones = [
	{ label: "Fondations du freelancing", progress: 100, tone: "bg-emerald-500", width: "w-full" },
	{ label: "Prospection client", progress: 45, tone: "bg-amber-500", width: "w-[45%]" },
	{ label: "UI/UX design", progress: 15, tone: "bg-indigo-600", width: "w-[15%]" },
];

export default function ProgressionPage() {
	return (
		<main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900">
			<div className="mx-auto max-w-5xl space-y-6">
				<header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h1 className="text-2xl font-bold tracking-tight">Progression</h1>
					<p className="mt-2 text-sm text-slate-500">
						Visualisez l’avancement de vos parcours et les modules déjà validés.
					</p>
				</header>

				<section className="grid gap-4">
					{milestones.map((milestone) => (
						<article
							key={milestone.label}
							className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
						>
							<div className="flex items-center justify-between gap-4">
								<h2 className="text-base font-semibold text-slate-900">{milestone.label}</h2>
								<span className="text-sm font-medium text-slate-500">{milestone.progress}%</span>
							</div>
							<div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
								<div
									className={`h-full rounded-full ${milestone.tone} ${milestone.width}`}
								/>
							</div>
						</article>
					))}
				</section>
			</div>
		</main>
	);
}
