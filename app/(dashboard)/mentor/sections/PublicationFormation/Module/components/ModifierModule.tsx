"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  UploadCloud,
  Layers,
  Clock,
  Pencil,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cloudinaryService } from "@/services/cloudinary.service";
import { moduleService } from "@/services/module.service";

interface Props {
  moduleId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type Toast = { type: "success" | "error"; message: string; detail?: string };

export default function ModifierModule({
  moduleId,
  onClose,
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    ordre: 1,
    duree: 60,
    estGratuit: false,
    newImage: null as File | null,
    currentImageUrl: null as string | null,
  });

  // Charger les données du module
  useEffect(() => {
    const fetchModule = async () => {
      setIsLoading(true);
      try {
        const res: any = await moduleService.getById(moduleId);
        const d = res?.props ?? res?.data?.props ?? res?.data ?? res;

        setForm({
          titre: d.titre ?? "",
          description: d.description ?? "",
          ordre: Number(d.ordre) || 1,
          duree: Number(d.duree) || 60,
          estGratuit: !!d.estGratuit,
          newImage: null,
          currentImageUrl: d.image || d.imageUrl || null,
        });
      } catch (err: any) {
        showToast("error", "Impossible de charger le module", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchModule();
  }, [moduleId]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (
    type: "success" | "error",
    message: string,
    detail?: string,
  ) => {
    setToast({ type, message, detail });
  };

  // Mettre à jour le module
  const handleSubmit = async () => {
    if (!form.titre.trim()) {
      showToast("error", "Titre requis", "Veuillez saisir un titre");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = form.currentImageUrl;

      if (form.newImage) {
        setUploadingImage(true);
        const uploadResult = await cloudinaryService.uploadImage(
          form.newImage,
          `modules/images`,
        );
        imageUrl = uploadResult.secureUrl;
        setUploadingImage(false);
      }

      await moduleService.update(moduleId, {
        titre: form.titre.trim(),
        description: form.description.trim() || null,
        ordre: form.ordre,
        duree: form.duree,
        estGratuit: form.estGratuit,
        ...(imageUrl && { image: imageUrl }),
      });

      showToast("success", "Module mis à jour avec succès !");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      showToast(
        "error",
        "Échec de la mise à jour",
        err.message || "Vérifie ta connexion",
      );
    } finally {
      setIsSubmitting(false);
      setUploadingImage(false);
    }
  };

  return (
    <>
      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-70 flex items-center gap-3 bg-white shadow-xl rounded-2xl px-5 py-4 min-w-[320px] max-w-105 border ${
            toast.type === "success" ? "border-emerald-200" : "border-red-200"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              toast.type === "success" ? "bg-emerald-100" : "bg-red-100"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="text-emerald-600" size={20} />
            ) : (
              <AlertCircle className="text-red-500" size={20} />
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
            className="text-slate-400 hover:text-slate-600 shrink-0"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white w-full max-w-lg rounded-xl border border-slate-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Pencil size={14} className="text-emerald-700" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">
                  Modifier le module
                </h2>
                <p className="text-xs text-slate-500">
                  Modifiez les informations du module
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* LOADER GET */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={26} className="animate-spin text-emerald-600" />
              <p className="text-xs text-slate-400">Chargement du module…</p>
            </div>
          ) : (
            <>
              {/* BODY */}
              <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                {/* Titre */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Titre du module <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Les bases du développement Freelance"
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 outline-none transition"
                    value={form.titre}
                    onChange={(e) =>
                      setForm({ ...form, titre: e.target.value })
                    }
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Description courte
                  </label>
                  <textarea
                    placeholder="Présentez brièvement les compétences abordées..."
                    rows={3}
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 outline-none transition resize-none"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                {/* Ordre & Durée */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Layers size={14} className="text-slate-400" /> Ordre
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-emerald-700 outline-none transition"
                      value={form.ordre}
                      onChange={(e) =>
                        setForm({ ...form, ordre: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" /> Durée (min)
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-emerald-700 outline-none transition"
                      value={form.duree}
                      onChange={(e) =>
                        setForm({ ...form, duree: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                {/* Image */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Illustration du module
                  </label>
                  {form.currentImageUrl && !form.newImage && (
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={form.currentImageUrl}
                        alt="actuelle"
                        className="w-16 h-12 object-cover rounded-lg border border-slate-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <span className="text-xs text-slate-400">
                        Image actuelle
                      </span>
                    </div>
                  )}
                  <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 text-center hover:bg-slate-100/50 transition relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          newImage: e.target.files?.[0] || null,
                        })
                      }
                    />
                    <div className="flex flex-col items-center justify-center gap-1">
                      <UploadCloud size={22} className="text-slate-400" />
                      <span className="text-xs font-medium text-slate-600">
                        {form.newImage
                          ? form.newImage.name
                          : "Cliquez pour changer l'image"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Laisser vide pour conserver l'image actuelle
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gratuit */}
                <div className="pt-1">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-emerald-700"
                      checked={form.estGratuit}
                      onChange={(e) =>
                        setForm({ ...form, estGratuit: e.target.checked })
                      }
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-800 block">
                        Module gratuit
                      </span>
                      <span className="text-xs text-slate-500">
                        Accessible en aperçu avant paiement
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={onClose}
                  type="button"
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || uploadingImage}
                  type="button"
                  className="px-5 py-2 text-sm font-medium rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 flex items-center gap-2 disabled:opacity-60 transition"
                >
                  {(isSubmitting || uploadingImage) && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  {uploadingImage
                    ? "Upload image…"
                    : isSubmitting
                      ? "Mise à jour…"
                      : "Enregistrer"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
