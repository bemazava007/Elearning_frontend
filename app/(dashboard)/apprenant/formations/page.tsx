"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Loader2,
  Search,
  Clock,
  BarChart,
  User,
  BookOpen,
  Briefcase,
  UserCircle,
} from "lucide-react";
import ApprenantSidebar from "@/components/layout/ApprenantSidebar"; // Ajuste le chemin si nécessaire

interface Formation {
  id: string;
  titre: string;
  description: string;
  objectifs: string[];
  volet: "BUSINESS" | "FREELANCE";
  niveau: "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE";
  dureeEstimee: number;
  imageUrl?: string;
  totalInscrits: number;
  noteMoyenne?: number;
}

interface UserProfile {
  id: string;
  email: string;
  role: string;
  volet?: "BUSINESS" | "FREELANCE";
  accountType?: "BUSINESS" | "FREELANCE";
}

type Section = "dashboard" | "formations" | "chat" | "calendar" | "progression";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ApprenantFormationsPage() {
  const router = useRouter();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [niveau, setNiveau] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [userVolet, setUserVolet] = useState<"BUSINESS" | "FREELANCE" | null>(
    null,
  );
  const [activeSection, setActiveSection] = useState<Section>("formations");

  // Rediriger vers la page correspondante si l'utilisateur clique sur une autre section
  useEffect(() => {
    if (activeSection !== "formations") {
      router.push(
        `/apprenant/${activeSection === "dashboard" ? "" : activeSection}`,
      );
    }
  }, [activeSection, router]);

  // Récupérer le profil utilisateur pour connaître son type (volet)
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/user/me`, { credentials: "include" });
      if (!res.ok) throw new Error("Impossible de récupérer le profil");
      const data: UserProfile = await res.json();
      const volet = data.volet || data.accountType;
      if (!volet || (volet !== "BUSINESS" && volet !== "FREELANCE")) {
        throw new Error("Type de compte non reconnu");
      }
      setUserVolet(volet);
      return volet;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);

  // Charger les formations filtrées par volet + niveau + recherche
  const fetchFormations = useCallback(
    async (
      currentPage: number,
      searchTerm: string,
      niveauFilter: string,
      volet: string,
    ) => {
      if (!volet) return;
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        params.append("page", String(currentPage));
        params.append("limit", "12");
        params.append("volet", volet);
        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        if (niveauFilter) params.append("niveau", niveauFilter);

        const res = await fetch(`${API_URL}/formations?${params.toString()}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Erreur ${res.status}`);

        const json = await res.json();
        const items = json.data ?? [];
        const normalized: Formation[] = items.map((f: any) => {
          const d = f.props ?? f;
          return {
            id: d.id,
            titre: d.titre,
            description: d.description,
            objectifs: d.objectifs || [],
            volet: d.volet,
            niveau: d.niveau,
            dureeEstimee: Number(d.dureeEstimee) || 0,
            imageUrl: d.imageUrl,
            totalInscrits: Number(d.totalInscrits) || 0,
            noteMoyenne: d.noteMoyenne,
          };
        });
        setFormations(normalized);
        setTotalPages(json.totalPages ?? 1);
        setTotal(json.total ?? 0);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Initialisation : récupérer le volet puis charger les formations
  useEffect(() => {
    let volet: "BUSINESS" | "FREELANCE" | null = null;
    fetchUserProfile().then((v) => {
      volet = v;
      if (volet) fetchFormations(page, search, niveau, volet);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recharger quand page, recherche ou filtre niveau change
  useEffect(() => {
    if (userVolet) {
      fetchFormations(page, search, niveau, userVolet);
    }
  }, [page, search, niveau, userVolet, fetchFormations]);

  // Debounce sur la recherche (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userVolet) {
        setPage(1);
        fetchFormations(1, search, niveau, userVolet);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, niveau, userVolet, fetchFormations]);

  const formatDuree = (minutes: number) => {
    const mins = Number(minutes);
    if (!mins || isNaN(mins)) return "—";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
  };

  const getNiveauLabel = (niveau: string) => {
    if (niveau === "INTERMEDIAIRE") return "Intermédiaire";
    if (niveau === "AVANCE") return "Avancé";
    return "Débutant";
  };

  const handleCardClick = (formationId: string) => {
    router.push(`/apprenant/formations/${formationId}`);
  };

  if (!userVolet && !error && loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ApprenantSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-emerald-700" />
              Mes formations
            </h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              <span>Formations destinées au volet :</span>
              {userVolet === "FREELANCE" ? (
                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  <UserCircle size={14} /> Freelance
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  <Briefcase size={14} /> Business
                </span>
              )}
            </p>
          </div>

          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <select
              value={niveau}
              onChange={(e) => setNiveau(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Tous les niveaux</option>
              <option value="DEBUTANT">Débutant</option>
              <option value="INTERMEDIAIRE">Intermédiaire</option>
              <option value="AVANCE">Avancé</option>
            </select>
          </div>

          {/* Grille des formations */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
            </div>
          ) : formations.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">
                Aucune formation{" "}
                {userVolet === "FREELANCE" ? "Freelance" : "Business"}{" "}
                disponible
                {niveau && (
                  <span> pour le niveau {getNiveauLabel(niveau)}</span>
                )}
                .
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {formations.map((formation) => (
                  <div
                    key={formation.id}
                    onClick={() => handleCardClick(formation.id)}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative h-40 bg-slate-100">
                      {formation.imageUrl ? (
                        <img
                          src={formation.imageUrl}
                          alt={formation.titre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <BookOpen className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-bold shadow-sm">
                        {formation.volet === "FREELANCE" ? (
                          <span className="text-purple-700">Freelance</span>
                        ) : (
                          <span className="text-blue-700">Business</span>
                        )}
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 line-clamp-1">
                        {formation.titre}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {formation.description || "Aucune description"}
                      </p>

                      {/* Métadonnées */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuree(formation.dureeEstimee)}
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart className="w-3 h-3" />
                          {getNiveauLabel(formation.niveau)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {formation.totalInscrits} inscrits
                        </span>
                      </div>

                      {formation.noteMoyenne && (
                        <div className="mt-2 flex items-center gap-1">
                          <span className="text-amber-500 text-xs">★</span>
                          <span className="text-xs font-medium text-slate-600">
                            {formation.noteMoyenne.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    ← Précédent
                  </button>
                  <span className="text-sm text-slate-500">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
