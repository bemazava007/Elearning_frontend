"use client";

import { useState } from "react";
// import Link from "next/link";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  ChevronRight,
  TrendingUp,
  Flame,
  Calendar,
  X,
  Video,
  User,
  Bell,
} from "lucide-react";

export default function FormationsPage() {
  // Gestion de l'ouverture de la section des rendez-vous (Modale)
  const [isRdvOpen, setIsRdvOpen] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);

  const stats = [
    { label: "Cours suivis", value: 12, icon: BookOpen },
    { label: "En cours", value: 4, icon: Clock },
    { label: "Terminées", value: 8, icon: CheckCircle },
    { label: "Certificats", value: 5, icon: Award },
  ];

  const courses = [
    { title: "Marketing Digital", progress: 78, status: "En cours" },
    { title: "Freelance Business", progress: 100, status: "Terminé" },
    { title: "UI/UX Design", progress: 56, status: "En cours" },
    { title: "Next.js", progress: 34, status: "Débutant" },
  ];

  // Données du rendez-vous avec l'URL Google Meet directe envoyée par le mentor
  const appointment = {
    title: "Suivi individuel & Coaching",
    mentor: "Jean-Marc (Mentor)",
    date: "Mardi 2 Juin 2026",
    time: "14:00 - 14:45",
    meetUrl: "https://meet.google.com/abc-defg-hij", // <-- Lien de la réunion visible et cliquable
  };

  const handleRdvClick = () => {
    setIsRdvOpen(true);
    setHasNotification(false); // Efface le point de notification dès l'ouverture
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 mt-2">Suivez votre progression et vos achievements</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#14b8a6]/10 flex items-center justify-center">
                    <Icon size={20} className="text-[#14b8a6]" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Progression Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Progression des formations</h3>

              <div className="space-y-4">
                {courses.map((course, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{course.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{course.progress}% complété</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        course.status === 'Terminé' 
                          ? 'bg-emerald-50 text-emerald-700'
                          : course.status === 'En cours'
                          ? 'bg-[#14b8a6]/10 text-[#14b8a6]'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {course.status}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-[#14b8a6] to-emerald-400 transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-6 w-full flex items-center justify-center gap-2 bg-[#14b8a6] hover:bg-[#11d8c3] text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                Voir toutes les formations
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Sidebar - RDV & Quick Actions */}
          <div className="space-y-6">
            {/* Rendez-vous Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#14b8a6]/10 flex items-center justify-center">
                  <Calendar size={18} className="text-[#14b8a6]" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Prochain RDV</h4>
                {hasNotification && (
                  <div className="w-2 h-2 rounded-full bg-red-500 ml-auto animate-pulse"></div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Suivi Coaching</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{appointment.mentor}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs text-slate-600 flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    {appointment.date}
                  </p>
                  <p className="text-xs text-slate-600 flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    {appointment.time}
                  </p>
                </div>

                <button
                  onClick={handleRdvClick}
                  className="w-full flex items-center justify-center gap-2 bg-[#14b8a6]/10 hover:bg-[#14b8a6]/20 text-[#14b8a6] font-semibold py-2.5 rounded-lg transition-colors text-xs"
                >
                  <Video size={14} />
                  Voir le lien
                </button>
              </div>
            </div>

            {/* Quick Access */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h4 className="font-bold text-slate-900 text-sm mb-4">Accès rapide</h4>
              <div className="space-y-2">
                <a href="/formations" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-sm text-slate-600 hover:text-[#14b8a6] group">
                  <BookOpen size={16} className="group-hover:text-[#14b8a6]" />
                  Mes formations
                  <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                </a>
                <a href="/apprenant/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-sm text-slate-600 hover:text-[#14b8a6] group">
                  <User size={16} className="group-hover:text-[#14b8a6]" />
                  Mon profil
                  <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                </a>
                <a href="/apprenant/notifications" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-sm text-slate-600 hover:text-[#14b8a6] group">
                  <Bell size={16} className="group-hover:text-[#14b8a6]" />
                  Notifications
                  <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Modale d'affichage du Rendez-vous */}
      {isRdvOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm border border-slate-200 shadow-xl relative">
            {/* Bouton pour fermer la fenêtre */}
            <button
              onClick={() => setIsRdvOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
              aria-label="Fermer la fenêtre"
              title="Fermer la fenêtre"
            >
              <X size={20} />
            </button>

            {/* Contenu */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{appointment.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{appointment.mentor}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Calendar size={16} className="text-slate-400" />
                  {appointment.date}
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Clock size={16} className="text-slate-400" />
                  {appointment.time}
                </div>
              </div>

              {/* Lien Google Meet */}
              <a
                href={appointment.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#14b8a6] hover:bg-[#11d8c3] text-white font-semibold py-3 rounded-lg transition-colors text-sm"
              >
                <Video size={16} />
                Rejoindre la réunion
              </a>

              <p className="text-xs text-slate-500 text-center break-all">{appointment.meetUrl}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
