//E:\Teach-platform\frontend\app\(dashboard)\mentor\sections\PublicationFormation\Module\components\Creation_Module.tsx
"use client";
import React, { useState } from "react";
import { X, Loader2, UploadCloud, Layers, Clock } from "lucide-react";
import { cloudinaryService } from "@/services/cloudinary.service";
import { moduleService } from "@/services/module.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  formationId: string;
  onSuccess?: () => void;
}

export default function Creation_Module({
  isOpen,
  onClose,
  formationId,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    titre: "",
    description: "",
    ordre: 1,
    duree: 60,
    image: null as File | null,
    estGratuit: false,
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSubmit = async () => {
    if (!formationId) {
      alert("Formation invalide");
      return;
    }
    if (!form.titre.trim()) {
      alert("Le titre est obligatoire");
      return;
    }
    if (!form.image) {
      alert("Veuillez sélectionner une image");
      return;
    }

    try {
      setLoading(true);
      setUploadingImage(true);

      // 1. Upload de l'image sur Cloudinary
      const uploadResult = await cloudinaryService.uploadImage(
        form.image,
        `formations/${formationId}/modules`,
      );

      console.log("Image uploadée avec succès :", uploadResult.secureUrl);

      // 2. Données selon ton DTO CreateModuleInputDTO
      const moduleData = {
        formationId,
        titre: form.titre,
        description: form.description || null,
        ordre: form.ordre,
        duree: form.duree,
        image: uploadResult.secureUrl, // ← Correspond à ton DTO
        estGratuit: form.estGratuit,
        prerequisIds: [], // Tableau vide si pas de prérequis
        createurId: "VOTRE_CREATEUR_ID_ICI", // ← IMPORTANT : Remplace par l'ID de l'utilisateur connecté
      };

      // 3. Création via le service
      await moduleService.create(moduleData);

      alert("Module créé avec succès ✅");

      // Reset formulaire
      setForm({
        titre: "",
        description: "",
        ordre: 1,
        duree: 60,
        image: null,
        estGratuit: false,
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Erreur création module:", error);
      alert(
        error.message ||
          "Une erreur est survenue lors de la création du module",
      );
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div>
            <h2 className="font-bold text-lg text-slate-900">
              Créer un nouveau module
            </h2>
            <p className="text-xs text-slate-500">
              Ajouter une étape d'apprentissage à votre formation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Titre */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Titre du module *
            </label>
            <input
              type="text"
              placeholder="Ex: Les bases du développement Freelance"
              className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none transition"
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Description courte
            </label>
            <textarea
              placeholder="Présentez brièvement les compétences ou notions abordées dans ce module..."
              rows={3}
              className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none transition resize-none"
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
                d'affichage
              </label>
              <input
                type="number"
                min={1}
                className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none transition"
                value={form.ordre}
                onChange={(e) =>
                  setForm({ ...form, ordre: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock size={14} className="text-slate-400" /> Durée estimée
                (min)
              </label>
              <input
                type="number"
                min={1}
                className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none transition"
                value={form.duree}
                onChange={(e) =>
                  setForm({ ...form, duree: Number(e.target.value) })
                }
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Illustration du module
            </label>
            <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 text-center hover:bg-slate-100/50 transition relative">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) =>
                  setForm({ ...form, image: e.target.files?.[0] || null })
                }
              />
              <div className="flex flex-col items-center justify-center gap-1">
                <UploadCloud size={24} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-600">
                  {form.image
                    ? form.image.name
                    : "Cliquez pour uploader une image"}
                </span>
                <span className="text-[10px] text-slate-400">
                  PNG, JPG ou WEBP
                </span>
              </div>
            </div>
          </div>

          {/* Checkbox Gratuit */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition select-none">
              <input
                type="checkbox"
                className="w-4 h-4 text-emerald-900 border-slate-300 rounded focus:ring-emerald-800 accent-[#064e3b]"
                checked={form.estGratuit}
                onChange={(e) =>
                  setForm({ ...form, estGratuit: e.target.checked })
                }
              />
              <div>
                <span className="text-sm font-medium text-slate-800 block">
                  Définir comme module gratuit
                </span>
                <span className="text-xs text-slate-500">
                  Permet d'ouvrir ce module en tant qu'aperçu gratuit avant
                  paiement.
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
            disabled={loading || uploadingImage}
            type="button"
            className="px-5 py-2 text-sm font-medium rounded-lg bg-[#064e3b] text-white hover:bg-[#043427] flex items-center gap-2 disabled:opacity-60 transition"
          >
            {(loading || uploadingImage) && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {uploadingImage
              ? "Upload de l'image..."
              : loading
                ? "Création..."
                : "Confirmer et créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
