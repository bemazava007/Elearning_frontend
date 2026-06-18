"use client";

import React from "react";
import {
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  Trophy,
  Clock,
  GraduationCap,
  Edit3,
  Star,
} from "lucide-react";

const apprenant = {
  nom: "Jean Dupont",
  initiales: "JD",
  niveau: "Apprenant Premium",
  email: "jean@email.com",
  localisation: "Antananarivo, Madagascar",
  inscription: "Janvier 2024",
  bio: "Passionné par le développement web moderne et le design UI/UX.",
  stats: { cours: 12, completes: 8, heures: 124 },
  cours: [
    { nom: "HTML & CSS", progression: 100, statut: "Terminé" },
    { nom: "JavaScript Avancé", progression: 82, statut: "En cours" },
    { nom: "Next.js & TypeScript", progression: 45, statut: "En progression" },
  ],
};

const statutStyle: Record<string, string> = {
  Terminé: "bg-green-100 text-green-700",
  "En cours": "bg-green-50 text-green-600",
  "En progression": "bg-slate-100 text-slate-600",
};

export default function ProfilApprenant() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 mt-24">
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-slate-200">
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-green-200 flex items-center justify-center text-white text-3xl font-bold">
                {apprenant.initiales}
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-800">
                {apprenant.nom}
              </h2>

              <span className="mt-2 px-4 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium flex items-center gap-2">
                <GraduationCap size={16} />
                {apprenant.niveau}
              </span>

              <p className="text-sm text-slate-500 text-center mt-4">
                {apprenant.bio}
              </p>

              <button className="mt-6 w-full bg-green-200 hover:bg-green-200 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition">
                <Edit3 size={16} />
                Modifier le profil
              </button>
            </div>

            <div className="mt-8 space-y-4">
              {[
                { icon: <Mail size={16} />, label: apprenant.email },
                { icon: <MapPin size={16} />, label: apprenant.localisation },
                { icon: <Calendar size={16} />, label: apprenant.inscription },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 text-slate-600 text-sm"
                >
                  <span className="text-green-200">{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </aside>
        <main className="lg:col-span-3 space-y-8 pt-24">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-800">
              Bienvenue, {apprenant.nom}
            </h1>
            <p className="mt-2 text-slate-500">
              Continuez votre apprentissage et atteignez vos objectifs.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <BookOpen size={20} />,
                label: "Cours suivis",
                val: apprenant.stats.cours,
              },
              {
                icon: <Trophy size={20} />,
                label: "Cours terminés",
                val: apprenant.stats.completes,
              },
              {
                icon: <Clock size={20} />,
                label: "Heures d'apprentissage",
                val: apprenant.stats.heures,
              },
            ].map(({ icon, label, val }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
              >
                <div className="flex items-center gap-3 text-green-600 mb-4">
                  {icon}
                  <span className="text-sm font-medium text-slate-500">
                    {label}
                  </span>
                </div>

                <p className="text-4xl font-bold text-slate-800">{val}</p>
              </div>
            ))}
          </div>

          {/* Progression */}
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-800 mb-6">
              Progression des formations
            </h3>

            <div className="space-y-6">
              {apprenant.cours.map((cours) => (
                <div key={cours.nom}>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-700">
                        {cours.nom}
                      </span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${statutStyle[cours.statut]}`}
                      >
                        {cours.statut}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500">
                      {cours.progression}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-200 rounded-full"
                      style={{ width: `${cours.progression}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
