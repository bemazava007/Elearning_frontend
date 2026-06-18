// E:\Teach-platform\frontend\app\(dashboard)\mentor\sections\PublicationFormation\Formation\Modifier_PublicationFormation.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  Loader2,
  AlertCircle,
  Pencil,
  ImageIcon,
  Film,
} from "lucide-react";
import { cloudinaryService } from "@/services/cloudinary.service";

// ==================== INTERFACES ====================
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

interface Toast {
  type: "success" | "error";
  message: string;
  detail?: string;
}

interface ModifierProps {
  formation: FormationAPI | null;
  onClose: () => void;
  onUpdated: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ==================== COMPOSANT ====================
export default function Modifier_PublicationFormation({
  formation,
  onClose,
  onUpdated,
}: ModifierProps) {
  const [isLoading, setIsLoading] = useState(false); // GET en cours
  const [isSubmitting, setIsSubmitting] = useState(false); // PATCH en cours
  const [toast, setToast] = useState<Toast | null>(null);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    objectifs: "",
    volet: "FREELANCE" as "BUSINESS" | "FREELANCE",
    niveau: "DEBUTANT" as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
    dureeEstimee: 180,
    imageFile: null as File | null,
    videoFile: null as File | null,
    // URLs actuelles récupérées depuis le GET
    currentImageUrl: null as string | null,
    currentPreviewUrl: null as string | null,
  });

  // ─── GET /formations/:id ──────────────────────────────────────────────────
  // On re-fetch les données fraîches au moment d'ouvrir la modale,
  // pour s'assurer que le formulaire reflète l'état réel en base.
  useEffect(() => {
    if (!formation) return;

    const fetchFormation = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/formations/${formation.id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Erreur ${res.status}`);

        const json = await res.json();
        // Supporte les deux structures : { data: { props: {...} } } ou { data: {...} }
        const d = json.data?.props ?? json.data ?? json;

        setForm({
          titre: d.titre ?? formation.titre,
          description: d.description ?? formation.description,
          objectifs: (d.objectifs ?? formation.objectifs ?? []).join(", "),
          volet: d.volet ?? formation.volet,
          niveau: d.niveau ?? formation.niveau,
          dureeEstimee: Number(d.dureeEstimee) || formation.dureeEstimee,
          imageFile: null,
          videoFile: null,
          currentImageUrl: d.imageUrl ?? formation.imageUrl ?? null,
          currentPreviewUrl: d.previewUrl ?? formation.previewUrl ?? null,
        });
      } catch {
        // Fallback sur les données passées en prop si le GET échoue
        setForm({
          titre: formation.titre,
          description: formation.description,
          objectifs: (formation.objectifs ?? []).join(", "),
          volet: formation.volet,
          niveau: formation.niveau,
          dureeEstimee: formation.dureeEstimee,
          imageFile: null,
          videoFile: null,
          currentImageUrl: formation.imageUrl ?? null,
          currentPreviewUrl: formation.previewUrl ?? null,
        });
        showToast(
          "error",
          "Données chargées depuis le cache",
          "Impossible de contacter le serveur",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormation();
  }, [formation]);

  // Auto-dismiss du toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (!formation) return null;

  const showToast = (
    type: "success" | "error",
    message: string,
    detail?: string,
  ) => {
    setToast({ type, message, detail });
  };

  // ─── PATCH /formations/:id ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const titreClean = form.titre.trim();
    const descriptionClean = form.description.trim();

    if (!titreClean || titreClean.length < 3) {
      showToast("error", "Titre invalide", "Minimum 3 caractères requis");
      return;
    }
    if (!descriptionClean || descriptionClean.length < 10) {
      showToast(
        "error",
        "Description invalide",
        "Minimum 10 caractères requis",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload Cloudinary uniquement si un nouveau fichier est sélectionné
      let imageUrl: string | null = form.currentImageUrl;
      let previewUrl: string | null = form.currentPreviewUrl;

      if (form.imageFile) {
        const imgResult = await cloudinaryService.uploadImage(
          form.imageFile,
          "formations/images",
        );
        imageUrl = imgResult.secureUrl;
      }

      if (form.videoFile) {
        const videoResult = await cloudinaryService.uploadVideo(
          form.videoFile,
          "formations/previews",
        );
        previewUrl = videoResult.secureUrl;
      }

      const objectifsArray = form.objectifs
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

      const payload = {
        titre: titreClean,
        description: descriptionClean,
        volet: form.volet,
        niveau: form.niveau,
        dureeEstimee: form.dureeEstimee,
        objectifs: objectifsArray,
        imageUrl,
        previewUrl,
      };

      const res = await fetch(`${API_URL}/formations/${formation.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message ?? `Erreur ${res.status}`);
      }

      showToast("success", "Formation mise à jour avec succès !");
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1200);
    } catch (error: any) {
      console.error("Erreur PATCH formation :", error);
      showToast(
        "error",
        "Échec de la mise à jour",
        error.message || "Vérifie ta connexion",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== RENDU ====================
  return (
    <>
      {/* ─── TOAST ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[60] flex items-center gap-3 bg-white shadow-xl rounded-2xl px-5 py-4 min-w-[340px] max-w-[420px] border ${
            toast.type === "success"
              ? "border-emerald-200 shadow-emerald-500/10"
              : "border-red-200 shadow-red-500/10"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              toast.type === "success" ? "bg-emerald-100" : "bg-red-100"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="text-emerald-600" size={22} />
            ) : (
              <AlertCircle className="text-red-500" size={22} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`font-bold text-sm ${toast.type === "success" ? "text-emerald-800" : "text-red-700"}`}
            >
              {toast.message}
            </p>
            {toast.detail && (
              <p className="text-xs text-slate-500 mt-0.5">{toast.detail}</p>
            )}
          </div>
          <button
            onClick={() => setToast(null)}
            className="shrink-0 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ─── OVERLAY ───────────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* EN-TÊTE */}
          <div className="flex justify-between items-center p-6 border-b border-cyan-50 sticky top-0 bg-white z-10 rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 flex items-center justify-center">
                <Pencil size={15} className="text-cyan-700" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-cyan-900">
                  Modifier la formation
                </h4>
                <p className="text-[11px] text-cyan-400 mt-0.5 truncate max-w-[260px]">
                  {formation.titre}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* ─── LOADER GET ──────────────────────────────────────────────────── */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={28} className="animate-spin text-cyan-600" />
              <p className="text-xs text-slate-400">Chargement des données…</p>
            </div>
          ) : (
            /* ─── FORMULAIRE PATCH ─────────────────────────────────────────── */
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Titre */}
              <div>
                <label className="block text-[11px] font-bold text-cyan-700 mb-1">
                  Titre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  placeholder="ex: Architecture Clean Code en React"
                  className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-cyan-700 mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Décrivez les compétences acquises..."
                  className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400 h-20 resize-none"
                  required
                />
              </div>

              {/* Objectifs */}
              <div>
                <label className="block text-[11px] font-bold text-cyan-700 mb-1">
                  Objectifs{" "}
                  <span className="text-cyan-400 font-normal">
                    (séparés par des virgules)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.objectifs}
                  onChange={(e) =>
                    setForm({ ...form, objectifs: e.target.value })
                  }
                  placeholder="Ex: Maîtriser Docker, Configurer l'arborescence"
                  className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Volet + Niveau */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-cyan-700 mb-1">
                    Volet
                  </label>
                  <select
                    value={form.volet}
                    onChange={(e) =>
                      setForm({ ...form, volet: e.target.value as any })
                    }
                    className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="FREELANCE">Freelance</option>
                    <option value="BUSINESS">Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-cyan-700 mb-1">
                    Niveau
                  </label>
                  <select
                    value={form.niveau}
                    onChange={(e) =>
                      setForm({ ...form, niveau: e.target.value as any })
                    }
                    className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="DEBUTANT">Débutant</option>
                    <option value="INTERMEDIAIRE">Intermédiaire</option>
                    <option value="AVANCE">Avancé</option>
                  </select>
                </div>
              </div>

              {/* Durée */}
              <div>
                <label className="block text-[11px] font-bold text-cyan-700 mb-1">
                  Durée estimée (minutes)
                </label>
                <input
                  type="number"
                  value={form.dureeEstimee}
                  onChange={(e) =>
                    setForm({ ...form, dureeEstimee: Number(e.target.value) })
                  }
                  min="120"
                  max="6000"
                  className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* Image */}
              <div className="p-3 bg-cyan-50/20 border border-dashed border-cyan-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon size={13} className="text-cyan-600" />
                  <label className="text-[11px] font-bold text-cyan-800">
                    Image de miniature
                  </label>
                </div>
                {/* Aperçu image actuelle */}
                {form.currentImageUrl && !form.imageFile && (
                  <div className="mb-2 flex items-center gap-2">
                    <img
                      src={form.currentImageUrl}
                      alt="actuelle"
                      className="w-14 h-10 object-cover rounded-lg border border-cyan-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="text-[11px] text-slate-400">
                      Image actuelle
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, imageFile: e.target.files?.[0] || null })
                  }
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-900 file:text-white"
                />
                {form.imageFile ? (
                  <p className="text-emerald-600 text-xs mt-1">
                    ✓ {form.imageFile.name}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Laisser vide pour conserver l'image actuelle
                  </p>
                )}
              </div>

              {/* Vidéo */}
              <div className="p-3 bg-cyan-50/20 border border-dashed border-cyan-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Film size={13} className="text-cyan-600" />
                  <label className="text-[11px] font-bold text-cyan-800">
                    Vidéo de prévisualisation
                  </label>
                </div>
                {form.currentPreviewUrl && !form.videoFile && (
                  <p className="text-[11px] text-slate-400 mb-2">
                    ✓ Vidéo actuelle disponible
                  </p>
                )}
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    setForm({ ...form, videoFile: e.target.files?.[0] || null })
                  }
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-900 file:text-white"
                />
                {form.videoFile ? (
                  <p className="text-emerald-600 text-xs mt-1">
                    ✓ {form.videoFile.name}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Laisser vide pour conserver la vidéo actuelle
                  </p>
                )}
              </div>

              {/* BOUTONS */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-cyan-200 text-cyan-700 font-bold rounded-xl hover:bg-cyan-50 transition text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2 text-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Mise à jour…
                    </>
                  ) : (
                    <>
                      <Pencil size={14} />
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
