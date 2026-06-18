"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { apiService } from "@/services/api.service";
import AjoutCours from "./AjoutCours";
import AjoutSupport from "../../Support/AjoutSupport";
import ModifierSupport from "../../Support/ModifierSupport";
import ModificationCours from "./Modification_Cours";
import {
  Plus,
  Pencil,
  Trash2,
  Folder,
  Eye,
  Clock,
  Lock,
  Unlock,
  Loader2,
  ExternalLink,
} from "lucide-react";
import SecurePDFViewer from "./SecurePDFViewer";

// Types
type Support = {
  id: string;
  coursId: string;
  titre: string;
  description: string | null;
  type: string;
  urlFichier: string | null;
  mimeType: string | null;
  tailleMo: number | null;
  dureeSecondes: number | null;
  ordre: number;
  isStreamable: boolean;
  isOfflineAllowed: boolean;
  accessLevel: string;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};

type Cours = {
  id: string;
  ordre: number;
  titre: string;
  description: string | null;
  resume: string | null;
  typeCours: string;
  dureeMinutes: number;
  vueCount: number;
  estGratuit: boolean;
  estDebloque: boolean;
};

export default function AffichageCours({ moduleId }: { moduleId: string }) {
  const [cours, setCours] = useState<Cours[]>([]);
  const [supportsMap, setSupportsMap] = useState<Record<string, Support[]>>({});
  const [loading, setLoading] = useState(true);
  const [openAjout, setOpenAjout] = useState(false);
  const [coursToDelete, setCoursToDelete] = useState<Cours | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedCoursId, setSelectedCoursId] = useState<string | null>(null);
  const [selectedCoursForEdit, setSelectedCoursForEdit] = useState<Cours | null>(null);
  const [supportToEdit, setSupportToEdit] = useState<Support | null>(null);
  const [supportToDelete, setSupportToDelete] = useState<Support | null>(null);
  const [deletingSupport, setDeletingSupport] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<{ url: string; title: string } | null>(null);

  // Pour le portal (évite les erreurs SSR)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (moduleId) charger();
  }, [moduleId]);

  const charger = async () => {
    try {
      setLoading(true);
      const coursRes = await apiService.get<any>(`/cours/module/${moduleId}`);
      const rawList = coursRes?.cours || [];

      const coursList: Cours[] = rawList.map((c: any) => {
        const d = c.props ?? c;
        return {
          id: d.id,
          ordre: Number(d.ordre) || 1,
          titre: d.titre,
          description: d.description ?? null,
          resume: d.resume ?? null,
          typeCours: d.typeCours,
          dureeMinutes: Number(d.dureeMinutes) || 0,
          vueCount: Number(d.vueCount) || 0,
          estGratuit: !!d.estGratuit,
          estDebloque: !!d.estDebloque,
        };
      });
      setCours(coursList);

      if (!coursList.length) {
        setSupportsMap({});
        return;
      }

      const supportsResults = await Promise.all(
        coursList.map((c) => apiService.get<any>(`/supports?coursId=${c.id}`)),
      );

      const map: Record<string, Support[]> = {};
      for (let i = 0; i < coursList.length; i++) {
        const coursItem = coursList[i];
        const raw = supportsResults[i];
        let supportsArray: any[] = [];
        if (raw?.data?.supports && Array.isArray(raw.data.supports))
          supportsArray = raw.data.supports;
        else if (raw?.data?.data && Array.isArray(raw.data.data))
          supportsArray = raw.data.data;
        else if (raw?.data && Array.isArray(raw.data)) supportsArray = raw.data;
        else if (Array.isArray(raw)) supportsArray = raw;
        else if (raw?.supports && Array.isArray(raw.supports))
          supportsArray = raw.supports;
        else if (raw?.items && Array.isArray(raw.items))
          supportsArray = raw.items;
        else if (raw?.results && Array.isArray(raw.results))
          supportsArray = raw.results;

        map[coursItem.id] = supportsArray.map((s: any) => {
          const d = s.props ?? s;
          return {
            id: d.id,
            coursId: d.coursId,
            titre: d.titre,
            description: d.description ?? null,
            type: d.type,
            urlFichier: d.urlFichier,
            mimeType: d.mimeType,
            tailleMo: d.tailleMo,
            dureeSecondes: d.dureeSecondes,
            ordre: d.ordre,
            isStreamable: d.isStreamable,
            isOfflineAllowed: d.isOfflineAllowed,
            accessLevel: d.accessLevel,
            status: d.status,
            version: d.version,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          };
        });
      }
      setSupportsMap(map);
    } catch (error) {
      console.error("Erreur chargement :", error);
      setCours([]);
      setSupportsMap({});
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setOpenAjout(false);
    charger();
  };

  const handleSupportSuccess = () => {
    setSelectedCoursId(null);
    charger();
  };

  const handleEditSuccess = () => {
    setSelectedCoursForEdit(null);
    charger();
  };

  const formatOrdre = (num: number) => String(num).padStart(2, "0");

  const getCardStyle = (index: number) => {
    const styles = [
      { border: "border-l-[#00b074]", bg: "bg-[#eef9f5]", text: "text-[#00b074]" },
      { border: "border-l-[#ffb822]", bg: "bg-[#fff8eb]", text: "text-[#ffb822]" },
      { border: "border-l-[#8c52ff]", bg: "bg-[#f4efff]", text: "text-[#8c52ff]" },
    ];
    return styles[index % styles.length];
  };

  const confirmDelete = (item: Cours) => setCoursToDelete(item);
  const cancelDelete = () => setCoursToDelete(null);

  const handleDelete = async () => {
    if (!coursToDelete?.id) return;
    try {
      setDeleting(true);
      const supportsRes = await apiService.get<any>(`/supports?coursId=${coursToDelete.id}`);
      const supports: { id: string; status?: string }[] = (
        supportsRes?.data ?? supportsRes ?? []
      ).map((s: any) => {
        const d = s.props ?? s;
        return { id: d.id, status: d.status };
      });
      await Promise.all(
        supports
          .filter((s) => !!s.id && s.status !== "ARCHIVE")
          .map((s) => apiService.patch(`/supports/${s.id}`, { status: "ARCHIVE" })),
      );
      await Promise.all(
        supports.filter((s) => !!s.id).map((s) => apiService.delete(`/supports/${s.id}`)),
      );
      await apiService.delete(`/cours/${coursToDelete.id}`);
      setCoursToDelete(null);
      await charger();
    } catch (err) {
      console.error("Erreur suppression", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSupport = async () => {
    if (!supportToDelete) return;
    try {
      setDeletingSupport(true);
      await apiService.delete(`/supports/${supportToDelete.id}`);
      setSupportToDelete(null);
      await charger();
    } catch (err) {
      console.error("Erreur suppression support", err);
    } finally {
      setDeletingSupport(false);
    }
  };

  const getSupportIcon = (type: string) => {
    switch (type) {
      case "VIDEO": return "🎬";
      case "PDF": return "📄";
      case "AUDIO": return "🎧";
      case "TEXT": return "📝";
      case "SLIDES": return "📊";
      case "EXERCICE": return "🛠";
      default: return "📎";
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.round(seconds / 60);
    return `${mins} min`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-100 w-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="mt-3 text-sm text-slate-400 font-medium">Chargement des données...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#f7f9fc] p-6 rounded-2xl w-full antialiased">
      {/* En-tête */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center w-full">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#6366f1] flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1e293b]">Liste des cours</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Gérez les cours de ce module</p>
          </div>
        </div>
        <button
          onClick={() => setOpenAjout(true)}
          className="bg-[#00a86b] hover:bg-[#00945e] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-3" /> Ajouter cours
        </button>
      </div>

      {/* Liste des cours */}
      {cours.length > 0 ? (
        <div className="space-y-5 w-full">
          {cours.map((item, index) => {
            const supports = supportsMap[item.id] || [];
            const style = getCardStyle(index);
            return (
              <div key={item.id} className={`bg-white border border-slate-200/80 rounded-2xl shadow-sm border-l-4 ${style.border} overflow-hidden w-full`}>
                {/* Détails du cours */}
                <div className="p-6 flex flex-col lg:flex-row items-start gap-6 w-full">
                  <div className={`w-full lg:w-48 h-28 rounded-xl ${style.bg} border border-slate-100 flex items-center justify-center shrink-0 relative`}>
                    {item.typeCours === "VIDEO" ? (
                      <div className="w-10 h-10 rounded-full bg-[#1e293b]/90 flex items-center justify-center text-white shadow-lg">
                        <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-12 h-14 rounded-lg bg-white border-2 border-dashed border-amber-300 flex flex-col items-center justify-center p-1">
                        <div className="w-5 h-1 bg-amber-400 rounded-full mb-1" />
                        <div className="w-5 h-0.5 bg-amber-200 rounded-full mb-1" />
                        <div className="w-5 h-0.5 bg-amber-200 rounded-full" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-start gap-3">
                      <span className="text-slate-300 font-bold text-sm pt-0.5">{formatOrdre(item.ordre || index + 1)}</span>
                      <div className="space-y-1.5 flex-1">
                        <h2 className="font-bold text-base text-slate-800 leading-tight">{item.titre}</h2>
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${style.text}`}>
                            {item.typeCours === "VIDEO" ? "📹 VIDÉO" : "📄 DOCUMENT"}
                          </span>
                          <span className="flex items-center gap-1 normal-case font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-300" /> {item.dureeMinutes} min
                          </span>
                          <span className="flex items-center gap-1 normal-case font-medium">
                            <Eye className="w-3.5 h-3.5 text-slate-300" /> {item.vueCount} vues
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 pl-7 leading-relaxed">
                      {item.description || "Aucune description fournie pour ce cours."}
                    </p>
                    {item.resume && (
                      <div className="pl-7 pt-1">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border ${item.estGratuit ? "bg-[#f4fbf7] text-[#147b43] border-[#e1f5e9]" : "bg-[#fffbeb] text-[#b25e00] border-[#fef3c7]"}`}>
                          <span>📝</span>
                          <p><span className="font-bold">Résumé :</span> {item.resume}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col justify-between lg:justify-start items-center lg:items-end w-full lg:w-auto gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${item.estGratuit ? "bg-[#edf8f2] text-[#00a86b] border-[#d2f0e0]" : "bg-[#fff0f0] text-[#ea4335] border-[#ffd5d5]"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.estGratuit ? "bg-[#00a86b]" : "bg-[#ea4335]"}`} />
                        {item.estGratuit ? "Gratuit" : "Payant"}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${item.estDebloque ? "bg-[#edf8f2] text-[#00a86b] border-[#d2f0e0]" : "bg-[#fff0f0] text-[#ea4335] border-[#ffd5d5]"}`}>
                        {item.estDebloque ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {item.estDebloque ? "Débloqué" : "Bloqué"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 lg:mt-6">
                      <button onClick={() => setSelectedCoursForEdit(item)} className="px-3 py-1.5 bg-white text-indigo-600 border border-slate-200/80 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
                        <Pencil className="w-3.5 h-3.5" /> Modifier
                      </button>
                      <button onClick={() => confirmDelete(item)} className="px-3 py-1.5 bg-white text-red-500 border border-slate-200/80 hover:bg-red-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
                        <Trash2 className="w-3.5 h-3.5" /> Supprimer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section des supports */}
                <div className="bg-[#fcfdff] border-t border-slate-100 p-4 mx-3 mb-3 rounded-2xl w-auto">
                  <div className="text-xs font-bold text-slate-700 tracking-wide flex items-center gap-1.5 mb-3 pl-1">
                    <Folder className="w-4 h-4 text-slate-400 fill-current" />
                    Supports ({supports.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                    {supports.map((support) => (
                      <div key={support.id} className="border border-slate-200/60 rounded-xl p-3 bg-white relative group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getSupportIcon(support.type)}</span>
                            <p className="text-xs font-bold text-slate-700 truncate">{support.titre}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setSupportToEdit(support)} className="p-1 text-indigo-500 hover:bg-indigo-50 rounded-md transition" title="Modifier le support">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => setSupportToDelete(support)} className="p-1 text-red-500 hover:bg-red-50 rounded-md transition" title="Supprimer le support">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${support.type === "VIDEO" ? "bg-purple-50 text-purple-600" : "bg-red-50 text-red-500"}`}>
                            {support.type}
                          </span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${support.status === "PUBLISHED" ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"}`}>
                            {support.status}
                          </span>
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">v{support.version}</span>
                        </div>
                        {support.description && (
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{support.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 mt-2">
                          {support.dureeSecondes && <span>⏱ {formatDuration(support.dureeSecondes)}</span>}
                          {support.tailleMo && <span>💾 {support.tailleMo} MB</span>}
                          {support.mimeType && <span className="truncate">📄 {support.mimeType}</span>}
                          <span>🔒 {support.accessLevel}</span>
                          <span>📌 Ordre {support.ordre}</span>
                        </div>
                        
                        {/* Affichage sécurisé des fichiers */}
                        {support.type === "PDF" && support.urlFichier ? (
                          <SecurePDFViewer url={support.urlFichier} title={support.titre} />
                        ) : support.type === "VIDEO" && support.urlFichier ? (
                          <video
                            src={support.urlFichier}
                            controls
                            controlsList="nodownload noplaybackrate"
                            onContextMenu={(e) => e.preventDefault()}
                            className="mt-2 w-full h-auto max-h-45 object-contain rounded-lg"
                          >
                            Votre navigateur ne supporte pas la lecture vidéo.
                          </video>
                        ) : support.urlFichier && (
                          <div className="mt-2 p-2 bg-gray-50 rounded-lg text-center">
                            <p className="text-xs text-gray-500 mb-2">📄 Fichier: {support.titre}</p>
                            <button
                              onClick={() => alert("⛔ Le téléchargement est désactivé pour des raisons de sécurité.")}
                              className="text-xs text-gray-400 cursor-not-allowed"
                              disabled
                            >
                              🔒 Téléchargement désactivé
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setSelectedCoursId(item.id)}
                      className="flex items-center justify-center gap-1.5 border border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-3 text-xs font-bold text-[#00a86b] bg-white transition w-full"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-3" /> Ajouter support
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-dashed border-indigo-200 rounded-3xl bg-[#fbfbfe] flex flex-col items-center justify-center w-full mt-6">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 11m8 4V4" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-indigo-950">Aucun cours pour ce module</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">Commencez par ajouter votre premier cours pour remplir ce module.</p>
          <button onClick={() => setOpenAjout(true)} className="mt-4 bg-[#5046e5] hover:bg-[#4338ca] text-white text-xs font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-2 transition shadow-sm">
            <Plus className="w-4 h-4 stroke-[2.5]" /> Ajouter cours
          </button>
        </div>
      )}

      {/* Portals pour tous les modaux */}
      {mounted && (
        <>
          {openAjout && createPortal(
            <AjoutCours moduleId={moduleId} onClose={() => setOpenAjout(false)} onSuccess={handleSuccess} />,
            document.body
          )}
          
          {selectedCoursId && createPortal(
            <AjoutSupport coursId={selectedCoursId} onClose={() => setSelectedCoursId(null)} onSuccess={handleSupportSuccess} />,
            document.body
          )}
          
          {selectedCoursForEdit && createPortal(
            <ModificationCours
              coursId={selectedCoursForEdit.id}
              initialData={{
                titre: selectedCoursForEdit.titre,
                description: selectedCoursForEdit.description,
                ordre: selectedCoursForEdit.ordre,
                dureeMinutes: selectedCoursForEdit.dureeMinutes,
                typeCours: selectedCoursForEdit.typeCours,
                resume: selectedCoursForEdit.resume,
                estGratuit: selectedCoursForEdit.estGratuit,
              }}
              onClose={() => setSelectedCoursForEdit(null)}
              onSuccess={handleEditSuccess}
            />,
            document.body
          )}
          
          {coursToDelete && createPortal(
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Confirmer la suppression</h3>
                </div>
                <p className="text-slate-600 mb-6">
                  Êtes-vous sûr de vouloir supprimer le cours <strong className="text-red-600">"{coursToDelete.titre}"</strong> ?<br />
                  Cette action est irréversible et supprimera également tous les supports associés.
                </p>
                <div className="flex gap-3 justify-end">
                  <button onClick={cancelDelete} disabled={deleting} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition disabled:opacity-50">Annuler</button>
                  <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition flex items-center gap-2 disabled:opacity-50">
                    {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Suppression...</> : <><Trash2 className="w-4 h-4" /> Supprimer</>}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
          
          {supportToEdit && createPortal(
            <ModifierSupport supportId={supportToEdit.id} onClose={() => setSupportToEdit(null)} onSuccess={() => { setSupportToEdit(null); charger(); }} />,
            document.body
          )}
          
          {supportToDelete && createPortal(
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Supprimer le support</h3>
                </div>
                <p className="text-slate-600 mb-6">
                  Êtes-vous sûr de vouloir supprimer le support <strong className="text-red-600">"{supportToDelete.titre}"</strong> ? Cette action est irréversible.
                </p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setSupportToDelete(null)} disabled={deletingSupport} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition">Annuler</button>
                  <button onClick={handleDeleteSupport} disabled={deletingSupport} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition flex items-center gap-2">
                    {deletingSupport ? <><Loader2 className="w-4 h-4 animate-spin" /> Suppression...</> : <><Trash2 className="w-4 h-4" /> Supprimer</>}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
          
          {/* Modal PDF sécurisé */}
          {selectedPDF && createPortal(
            <SecurePDFViewer url={selectedPDF.url} title={selectedPDF.title} isModal={true} onClose={() => setSelectedPDF(null)} />,
            document.body
          )}
        </>
      )}
    </div>
  );
}