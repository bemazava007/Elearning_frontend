import { Bell, CheckCircle2, CircleAlert, Clock3 } from "lucide-react";

const notifications = [
	{
		id: 1,
		title: "Nouveau cours disponible",
		description: "Le module Freelance Academy a été mis à jour avec un nouvel exercice.",
		time: "Il y a 12 min",
		icon: Bell,
		iconBg: "bg-indigo-600",
	},
	{
		id: 2,
		title: "Progression enregistrée",
		description: "Votre progression sur le parcours Digital Skills a bien été sauvegardée.",
		time: "Il y a 1 h",
		icon: CheckCircle2,
		iconBg: "bg-emerald-600",
	},
	{
		id: 3,
		title: "Action requise",
		description: "Complétez votre profil pour débloquer les recommandations personnalisées.",
		time: "Aujourd’hui",
		icon: CircleAlert,
		iconBg: "bg-amber-500",
	},
];

export default function NotificationsPage() {
	return (
		<main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
			<div className="mx-auto max-w-4xl space-y-6">
				<header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
							<Bell className="h-5 w-5" />
						</div>
						<div>
							<h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
							<p className="text-sm text-slate-500">
								Suivez les mises à jour importantes de votre espace apprenant.
							</p>
						</div>
					</div>
				</header>

				<section className="grid gap-4">
					{notifications.map((notification) => {
						const Icon = notification.icon;

						return (
							<article
								key={notification.id}
								className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
							>
								<div
									className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${notification.iconBg}`}
								>
									<Icon className="h-5 w-5" />
								</div>

								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<h2 className="text-base font-semibold text-slate-900">
											{notification.title}
										</h2>
										<span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
											<Clock3 className="h-3.5 w-3.5" />
											{notification.time}
										</span>
									</div>
									<p className="mt-2 text-sm leading-6 text-slate-600">
										{notification.description}
									</p>
								</div>
							</article>
						);
					})}
				</section>
			</div>
		</main>
	);
}
