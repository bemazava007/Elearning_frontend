import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  GraduationCap,
  Loader2,
  X,
  Search,
  Pencil,
  Trash2,
  FolderOpen,
  Layers,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Creation_Module from "../Module/components/Creation_Module";
import ArborescenceModules from "../Module/components/ArborescenceModules";
import Modifier_PublicationFormation from "../Formation/Modifier_PublicationFormation";
import ModifierModule from "../Module/components/ModifierModule"; // 👈 AJOUT

interface FormationAPI {
  id: string;
  titre: string;
  description: string;
  objectifs: string[];
  volet: "BUSINESS" | "FREELANCE";
  niveau: "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE";
  statut: string;
  dureeEstimee: number;
  imageUrl?: string | null;
  previewUrl?: string | null;
  totalInscrits: number;
  noteMoyenne?: number | null;
  createdAt: string;
}

interface ModuleAPI {
  id: string;
  titre: string;
  description: string;
  ordre: number;
  duree: number;
  estGratuit: boolean;
}

interface Props {
  refresh: number;
  onEdit?: (formation: FormationAPI) => void;
  onDelete?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AffichagePublicationFormation({
  refresh,
  onEdit,
  onDelete,
}: Props) {
  const [formations, setFormations] = useState<FormationAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFormation, setSelectedFormation] =
    useState<FormationAPI | null>(null);

  const [search, setSearch] = useState("");
  const [volet, setVolet] = useState("");
  const [niveau, setNiveau] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const [modalView, setModalView] = useState<"detail" | "addModule">("detail");

  // Cache des modules par formationId
  const modulesCache = useRef<Record<string, ModuleAPI[]>>({});
  const [cachedModules, setCachedModules] = useState<ModuleAPI[]>([]);
  const [moduleRefresh, setModuleRefresh] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    formationId: string;
    formationTitre: string;
  } | null>(null);
  const [editFormation, setEditFormation] = useState<FormationAPI | null>(null);

  // 👇 AJOUT : état pour la modification d'un module
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  // 👇 AJOUT : modal de confirmation suppression d'un module
  const [deleteModuleModal, setDeleteModuleModal] = useState<{
    open: boolean;
    moduleId: string;
    moduleTitre: string;
  } | null>(null);

  // ─── FETCH MODULES (avec cache) ───────────────────────────────────────────
  const fetchModulesForFormation = useCallback(
    async (formationId: string, force = false) => {
      if (!force && modulesCache.current[formationId]) {
        setCachedModules(modulesCache.current[formationId]);
        return;
      }
      try {
        const res = await fetch(
          `${API_URL}/formations/${formationId}/modules`,
          { credentials: "include" },
        );
        if (!res.ok) throw new Error();
        const json = await res.json();

        const normalized: ModuleAPI[] = (json.data?.modules ?? json.data ?? [])
          .map((m: any) => {
            const t = m.props ?? m;
            return {
              id: t.id,
              titre: t.titre,
              description: t.description,
              ordre: Number(t.ordre) || 1,
              duree: Number(t.duree) || 0,
              estGratuit: !!t.estGratuit,
            };
          })
          .sort((a: ModuleAPI, b: ModuleAPI) => a.ordre - b.ordre);

        modulesCache.current[formationId] = normalized;
        setCachedModules(normalized);
      } catch {
        setCachedModules([]);
      }
    },
    [],
  );

  // Préchargement au hover sur une card
  const handleCardHover = useCallback(
    (formationId: string) => {
      if (!modulesCache.current[formationId]) {
        fetchModulesForFormation(formationId);
      }
    },
    [fetchModulesForFormation],
  );

  // Ouverture de la modale : modules déjà en cache = affichage instantané
  const handleOpenDetail = useCallback(
    (f: FormationAPI) => {
      setModalView("detail");
      setSelectedFormation(f);
      const cached = modulesCache.current[f.id];
      if (cached) {
        setCachedModules(cached);
      } else {
        setCachedModules([]);
        fetchModulesForFormation(f.id);
      }
    },
    [fetchModulesForFormation],
  );

  // Invalidation du cache après ajout / modification / suppression d'un module
  const invalidateModuleCache = useCallback(() => {
    if (selectedFormation) {
      delete modulesCache.current[selectedFormation.id];
      fetchModulesForFormation(selectedFormation.id, true);
    }
    setModuleRefresh((n) => n + 1);
  }, [selectedFormation, fetchModulesForFormation]);

  const handleModuleSuccess = useCallback(() => {
    invalidateModuleCache();
    setModalView("detail");
  }, [invalidateModuleCache]);

  // 👇 AJOUT : suppression d'un module
  const handleDeleteModule = async () => {
    if (!deleteModuleModal) return;
    const { moduleId } = deleteModuleModal;
    try {
      const res = await fetch(`${API_URL}/module/${moduleId}`, {
        // ← singulier
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Échec de la suppression du module");
      invalidateModuleCache();
      setDeleteModuleModal(null);
    } catch (err: any) {
      setError(`Erreur suppression module : ${err.message}`);
      setDeleteModuleModal(null);
    }
  };

  // ─── FETCH FORMATIONS ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchFormations(page, search, volet, niveau);
  }, [page, volet, niveau, refresh]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchFormations(1, search, volet, niveau);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchFormations = async (
    currentPage: number,
    currentSearch: string,
    currentVolet: string,
    currentNiveau: string,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append("page", String(currentPage));
      params.append("limit", "12");
      if (currentSearch) params.append("search", currentSearch);
      if (currentVolet) params.append("volet", currentVolet);
      if (currentNiveau) params.append("niveau", currentNiveau);

      const res = await fetch(`${API_URL}/formations?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const json = JSON.parse(await res.text());

      const normalized = (json.data ?? []).map((f: any) => {
        const p = f.props;
        return {
          id: p.id,
          titre: p.titre,
          description: p.description,
          objectifs: p.objectifs || [],
          volet: p.volet,
          niveau: p.niveau,
          statut: p.statut,
          dureeEstimee: Number(p.dureeEstimee) || 0,
          imageUrl: p.imageUrl,
          previewUrl: p.previewUrl,
          totalInscrits: Number(p.totalInscrits) || 0,
          noteMoyenne: p.noteMoyenne,
          createdAt: p.createdAt,
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
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    const { formationId } = deleteModal;
    setDeleteModal(null);
    try {
      const res = await fetch(`${API_URL}/formations/${formationId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Échec de la suppression");
      onDelete ? onDelete() : fetchFormations(page, search, volet, niveau);
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    }
  };

  const getNiveauLabel = (n: string) => {
    if (n === "INTERMEDIAIRE") return "Intermédiaire";
    if (n === "AVANCE") return "Avancé";
    return "Débutant";
  };
  const getVoletLabel = (v: string) =>
    v === "BUSINESS" ? "Business" : "Freelance";
  const formatDuree = (minutes: number) => {
    const mins = Number(minutes);
    if (!mins || isNaN(mins)) return "—";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
  };

  const handleCloseModal = () => {
    if (modalView === "addModule") {
      setModalView("detail");
    } else {
      setSelectedFormation(null);
      setCachedModules([]);
    }
  };

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
      {/* HEADER et FILTRES — inchangés, on saute pour la lisibilité */}
      <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm tracking-wide uppercase">
          <GraduationCap size={18} />
          TEACH — Catalogue des Publications
        </div>
        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
          {total} formation(s) enregistrée(s)
        </span>
      </div>

      <div className="p-4 bg-white border-b border-slate-200">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-900 bg-slate-50"
              placeholder="Rechercher une formation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-900 bg-slate-50"
            value={volet}
            onChange={(e) => {
              setVolet(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tous les volets</option>
            <option value="FREELANCE">Freelance</option>
            <option value="BUSINESS">Business</option>
          </select>
          <select
            className="p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-900 bg-slate-50"
            value={niveau}
            onChange={(e) => {
              setNiveau(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tous les niveaux</option>
            <option value="DEBUTANT">Débutant</option>
            <option value="INTERMEDIAIRE">Intermédiaire</option>
            <option value="AVANCE">Avancé</option>
          </select>
        </div>
      </div>

      {/* loading / error / liste formations — inchangé, on saute pour la modale */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-emerald-900 w-7 h-7" />
        </div>
      )}
      {error && !loading && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium">
          ⚠️ {error}
        </div>
      )}
      {!loading && !error && (
        <>
          {formations.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <GraduationCap
                size={40}
                className="mx-auto mb-2 opacity-25 text-emerald-900"
              />
              <p className="text-xs font-medium">
                Aucune publication disponible
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
              {formations.map((f) => (
                <div
                  key={`formation-${f.id}`}
                  onMouseEnter={() => handleCardHover(f.id)}
                  onClick={() => handleOpenDetail(f)}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-slate-300 transition duration-150 group relative flex flex-col justify-between"
                >
                  {/* ... contenu carte formation inchangé ... */}
                  <div className="relative h-36 bg-slate-50 border-b border-slate-100">
                    {f.imageUrl ? (
                      <img
                        src={f.imageUrl}
                        alt={f.titre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <GraduationCap size={28} className="text-slate-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditFormation(f);
                          if (onEdit) onEdit(f);
                        }}
                        className="p-1.5 bg-white text-slate-700 rounded-md border border-slate-200 hover:bg-slate-50 transition"
                        title="Modifier"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteModal({
                            open: true,
                            formationId: f.id,
                            formationTitre: f.titre,
                          });
                        }}
                        className="p-1.5 bg-white text-red-600 rounded-md border border-red-100 hover:bg-red-50 transition"
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 text-xs line-clamp-1 mb-1">
                        {f.titre || "Sans titre"}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                        {f.description || "Aucune description fournie."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        {getVoletLabel(f.volet)}
                      </span>
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {getNiveauLabel(f.niveau)}
                      </span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-950 px-2 py-0.5 rounded-md font-medium">
                        ⏱ {formatDuree(f.dureeEstimee)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 py-6 bg-white border-t border-slate-200">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium disabled:opacity-40 hover:bg-slate-50 transition"
              >
                ← Précédent
              </button>
              <span className="text-xs text-slate-500 font-medium">
                Page {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium disabled:opacity-40 hover:bg-slate-50 transition"
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}

      {/* MODALE CONFIRMATION SUPPRESSION FORMATION (inchangée) */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
          <div className="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-sm mx-4">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 size={17} className="text-red-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">
                  Supprimer la formation
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cette action est irréversible. La formation et tout son
                  contenu seront définitivement supprimés.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2.5 mb-4 border border-slate-100">
              <p className="text-[11px] text-slate-400 mb-0.5">
                Formation concernée
              </p>
              <p className="text-xs font-medium text-slate-800 truncate">
                {deleteModal.formationTitre}
              </p>
            </div>
            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 text-xs bg-red-700 text-red-50 rounded-lg font-medium hover:bg-red-800 transition flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE PRINCIPALE (aperçu + modules) avec boutons Modifier/Supprimer sur chaque module */}
      {selectedFormation && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER DYNAMIQUE */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                {modalView === "addModule" ? (
                  <button
                    onClick={() => setModalView("detail")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-900 transition"
                  >
                    <ChevronLeft size={15} />
                    Retour aux modules
                  </button>
                ) : (
                  <>
                    <Layers size={16} className="text-emerald-900" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Aperçu Structure Pédagogique
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── VUE DÉTAIL ── */}
            {modalView === "detail" && (
              <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto divide-y md:divide-y-0 md:divide-x divide-slate-200">
                {/* GAUCHE : infos formation (inchangé) */}
                <div className="p-6 flex flex-col justify-between bg-white">
                  <div>
                    {selectedFormation.imageUrl ? (
                      <img
                        src={selectedFormation.imageUrl}
                        alt={selectedFormation.titre}
                        className="h-44 w-full object-cover rounded-lg border border-slate-100 mb-4"
                      />
                    ) : (
                      <div className="h-44 w-full bg-slate-50 border border-dashed rounded-lg border-slate-200 flex items-center justify-center mb-4">
                        <GraduationCap size={36} className="text-slate-300" />
                      </div>
                    )}
                    <h2 className="font-bold text-lg text-slate-800 mb-2 leading-tight">
                      {selectedFormation.titre}
                    </h2>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold uppercase">
                        {getVoletLabel(selectedFormation.volet)}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {getNiveauLabel(selectedFormation.niveau)}
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-950 px-2 py-0.5 rounded-md font-semibold">
                        ⏱ {formatDuree(selectedFormation.dureeEstimee)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                      {selectedFormation.description}
                    </p>
                    {selectedFormation.objectifs?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                          Compétences cibles
                        </p>
                        <ul className="space-y-1.5">
                          {selectedFormation.objectifs.map((obj, i) => (
                            <li
                              key={`obj-${i}`}
                              className="text-xs text-slate-600 flex items-start gap-2"
                            >
                              <span className="text-emerald-700 font-bold mt-0.5">
                                ✓
                              </span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-slate-100 mt-6">
                    <button
                      className="w-full py-2.5 bg-emerald-900 text-white rounded-lg font-semibold text-xs hover:bg-emerald-950 transition"
                      onClick={() => {
                        setSelectedFormation(null);
                        setCachedModules([]);
                      }}
                    >
                      Fermer l&apos;aperçu
                    </button>
                  </div>
                </div>

                {/* DROITE : modules avec boutons Modifier / Supprimer */}
                <div className="p-6 bg-slate-50/50 flex flex-col max-h-[calc(90vh-60px)] overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Modules de la formation
                    </h3>
                    <button
                      onClick={() => setModalView("addModule")}
                      className="flex items-center gap-1.5 bg-emerald-900 text-white hover:bg-emerald-950 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition"
                    >
                      <FolderOpen size={12} />
                      Ajouter un module
                    </button>
                  </div>

                  {cachedModules.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">
                      Aucun module pour cette formation
                    </p>
                  ) : (
                    <div className="space-y-2 overflow-y-auto">
                      {cachedModules.map((m) => (
                        <div
                          key={m.id}
                          className="p-3 border border-slate-200 rounded-lg bg-white hover:border-emerald-600/40 hover:bg-slate-50 transition group"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900 transition">
                              {m.titre}
                            </h4>
                            <div className="flex items-center gap-2">
                              {m.estGratuit ? (
                                <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                                  Gratuit
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  Premium
                                </span>
                              )}
                              {/* 👇 BOUTON MODIFIER */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingModuleId(m.id);
                                }}
                                className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                                title="Modifier le module"
                              >
                                <Pencil size={13} />
                              </button>
                              {/* 👇 BOUTON SUPPRIMER */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteModuleModal({
                                    open: true,
                                    moduleId: m.id,
                                    moduleTitre: m.titre,
                                  });
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-md transition"
                                title="Supprimer le module"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {m.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                              {m.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                            <p className="text-[10px] text-slate-400">
                              ⏱ {m.duree} min
                            </p>
                            <span
                              className="text-[10px] text-emerald-800 font-medium opacity-0 group-hover:opacity-100 transition flex items-center gap-1 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/mentor/sections/PublicationFormation/Module/Cours?moduleId=${m.id}`,
                                );
                              }}
                            >
                              Gérer les cours →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── VUE AJOUT MODULE (inchangée) ── */}
            {modalView === "addModule" && (
              <div className="flex-1 overflow-y-auto">
                <Creation_Module
                  isOpen={true}
                  formationId={selectedFormation.id}
                  onClose={() => setModalView("detail")}
                  onSuccess={handleModuleSuccess}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALE DE MODIFICATION D'UN MODULE */}
      {editingModuleId && (
        <ModifierModule
          moduleId={editingModuleId}
          onClose={() => setEditingModuleId(null)}
          onSuccess={() => {
            setEditingModuleId(null);
            invalidateModuleCache(); // recharge les modules après modification
          }}
        />
      )}

      {/* MODALE DE CONFIRMATION SUPPRESSION D'UN MODULE */}
      {deleteModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
          <div className="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-sm mx-4">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 size={17} className="text-red-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">
                  Supprimer le module
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cette action supprimera également tous les cours associés à ce
                  module.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2.5 mb-4 border border-slate-100">
              <p className="text-[11px] text-slate-400 mb-0.5">
                Module concerné
              </p>
              <p className="text-xs font-medium text-slate-800 truncate">
                {deleteModuleModal.moduleTitre}
              </p>
            </div>
            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setDeleteModuleModal(null)}
                className="px-4 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteModule}
                className="px-4 py-1.5 text-xs bg-red-700 text-red-50 rounded-lg font-medium hover:bg-red-800 transition flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE MODIFICATION FORMATION (inchangée) */}
      {editFormation && (
        <Modifier_PublicationFormation
          formation={editFormation}
          onClose={() => setEditFormation(null)}
          onUpdated={() => {
            setEditFormation(null);
            fetchFormations(page, search, volet, niveau);
          }}
        />
      )}
    </div>
  );
}
