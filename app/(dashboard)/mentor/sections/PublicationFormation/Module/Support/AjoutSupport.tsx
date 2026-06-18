"use client";

import { useState, useRef } from "react";
import { apiService } from "@/services/api.service";
import { cloudinaryService } from "@/services/cloudinary.service";
import {
  X,
  Loader2,
  Video,
  Shield,
  Layers,
  Upload,
  FileCheck,
} from "lucide-react";

type AjoutSupportProps = {
  coursId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AjoutSupport({
  coursId,
  onClose,
  onSuccess,
}: AjoutSupportProps) {
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    type: "VIDEO",
    urlFichier: "",
    mimeType: "",
    tailleMo: "",
    dureeSecondes: "",
    ordre: "1",
    accessLevel: "FREE",
    createurId: "system-admin",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const tempUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        const duration = Math.round(video.duration);
        URL.revokeObjectURL(tempUrl);
        resolve(duration);
      };
      video.onerror = () => {
        URL.revokeObjectURL(tempUrl);
        resolve(0);
      };
      video.src = tempUrl;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Validation taille fichier (max 100MB pour éviter les timeouts)
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      setError("Fichier trop volumineux. Maximum 100MB.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const sizeMo = +(file.size / (1024 * 1024)).toFixed(2);
      setFormData((prev) => ({
        ...prev,
        tailleMo: sizeMo.toString(),
        mimeType: file.type,
      }));

      let durationSec = 0;
      if (file.type.startsWith("video/")) {
        durationSec = await getVideoDuration(file);
        setFormData((prev) => ({
          ...prev,
          dureeSecondes: durationSec.toString(),
          type: "VIDEO",
        }));
      }

      let uploadResult;
      if (file.type.startsWith("video/")) {
        uploadResult = await cloudinaryService.uploadVideo(
          file,
          "supports/videos",
          (percent) => setUploadProgress(percent),
        );
        setFormData((prev) => ({ ...prev, type: "VIDEO" }));
      } else if (file.type === "application/pdf") {
        uploadResult = await cloudinaryService.uploadPdf(
          file,
          "supports/pdf",
          (percent) => setUploadProgress(percent),
        );
        setFormData((prev) => ({ ...prev, type: "PDF" }));
      } else if (file.type.startsWith("image/")) {
        uploadResult = await cloudinaryService.uploadImage(
          file,
          "supports/images",
          (percent) => setUploadProgress(percent),
        );
        setFormData((prev) => ({ ...prev, type: "IMAGE" }));
      } else {
        uploadResult = await cloudinaryService.uploadFile(file, {
          folder: "supports/others",
          resourceType: "auto",
          onProgress: (percent) => setUploadProgress(percent),
        });
        setFormData((prev) => ({ ...prev, type: "DOCUMENT" }));
      }

      if (uploadResult.duration) {
        durationSec = uploadResult.duration;
        setFormData((prev) => ({
          ...prev,
          dureeSecondes: durationSec.toString(),
        }));
      }

      setFormData((prev) => ({
        ...prev,
        urlFichier: uploadResult.secureUrl,
      }));
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Erreur upload. Vérifiez votre connexion ou la configuration Cloudinary.",
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.urlFichier) {
      setError("Veuillez téléverser un fichier.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      titre: formData.titre,
      description: formData.description.trim() || null,
      type: formData.type,
      urlFichier: formData.urlFichier,
      mimeType: formData.mimeType.trim() || null,
      tailleMo: formData.tailleMo ? parseFloat(formData.tailleMo) : null,
      dureeSecondes:
        (formData.type === "VIDEO" || formData.type === "AUDIO") &&
        formData.dureeSecondes
          ? Number(formData.dureeSecondes)
          : null,
      ordre: Number(formData.ordre) || 1,
      accessLevel: formData.accessLevel,
      coursId: coursId,
    };

    try {
      await apiService.post("/supports", payload);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Erreur lors de la création du support.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* En-tête */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00a86b] flex items-center justify-center">
              <svg
                className="w-5 h-5 stroke-[2.5]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Ajouter un support
              </h3>
              <p className="text-[11px] text-slate-400">
                Upload direct Cloudinary – progression réelle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading || submitting}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-5 flex-1 text-sm"
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
              ⚠️ {error}
            </div>
          )}

          {/* Zone d'upload */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Fichier du support
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="video/*,application/pdf,image/*,audio/*"
            />
            <div
              onClick={() =>
                !uploading && !submitting && fileInputRef.current?.click()
              }
              className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
                formData.urlFichier
                  ? "border-emerald-200 bg-emerald-50/30"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
              } ${uploading || submitting ? "opacity-60 pointer-events-none" : ""}`}
            >
              {uploading ? (
                <div className="text-center w-full">
                  <Loader2 className="w-8 h-8 animate-spin text-[#00a86b] mx-auto" />
                  <p className="text-sm font-semibold mt-2">
                    Téléversement vers Cloudinary...
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                    <div
                      className="bg-[#00a86b] h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {uploadProgress}% - Merci de patienter
                  </p>
                </div>
              ) : formData.urlFichier ? (
                <>
                  <FileCheck className="w-8 h-8 text-[#00a86b]" />
                  <p className="text-sm font-bold text-emerald-700">
                    Fichier chargé avec succès !
                  </p>
                  {formData.dureeSecondes && (
                    <p className="text-xs text-emerald-600">
                      ⏱ Durée :{" "}
                      {Math.round(Number(formData.dureeSecondes) / 60)} min
                    </p>
                  )}
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-600">
                    Cliquez pour sélectionner un fichier
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Vidéo, PDF, image, audio… (max 100MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Titre */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">Titre *</label>
            <input
              type="text"
              name="titre"
              required
              value={formData.titre}
              onChange={handleChange}
              disabled={uploading || submitting}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-[#00a86b] disabled:bg-slate-50"
            />
          </div>

          {/* Type et Ordre */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                <Video className="w-4 h-4 inline mr-1" /> Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={uploading || submitting}
                className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-green-500/20"
              >
                <option value="VIDEO">📹 VIDÉO</option>
                <option value="AUDIO">🎧 AUDIO</option>
                <option value="TEXT">📝 TEXT</option>
                <option value="PDF">📕 PDF</option>
                <option value="SLIDES">📊 SLIDES</option>
                <option value="EXERCICE">🛠 EXERCICE</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                <Layers className="w-4 h-4 inline mr-1" /> Ordre
              </label>
              <input
                type="number"
                name="ordre"
                required
                min="1"
                value={formData.ordre}
                onChange={handleChange}
                disabled={uploading || submitting}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-green-500/20 disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* URL fichier */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              URL fichier *
            </label>
            <input
              type="url"
              name="urlFichier"
              required
              value={formData.urlFichier}
              onChange={handleChange}
              disabled={uploading || submitting}
              className="w-full px-3 py-2 border rounded-xl disabled:bg-slate-50"
              placeholder="Remplie automatiquement après upload"
            />
          </div>

          {/* Métadonnées */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700">
                Mime-Type
              </label>
              <input
                type="text"
                name="mimeType"
                value={formData.mimeType}
                onChange={handleChange}
                disabled={uploading || submitting}
                className="w-full px-3 py-2 border rounded-xl disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700">
                Taille (Mo)
              </label>
              <input
                type="number"
                name="tailleMo"
                step="0.01"
                value={formData.tailleMo}
                onChange={handleChange}
                disabled={uploading || submitting}
                className="w-full px-3 py-2 border rounded-xl disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700">
                Durée (sec)
              </label>
              <input
                type="number"
                name="dureeSecondes"
                value={formData.dureeSecondes}
                onChange={handleChange}
                disabled={uploading || submitting}
                className="w-full px-3 py-2 border rounded-xl disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Accès */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              <Shield className="w-4 h-4 inline mr-1" /> Accès
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["FREE", "PREMIUM", "VIP"].map((level) => (
                <label
                  key={level}
                  className={`border rounded-xl p-3 flex items-center justify-center font-bold text-xs cursor-pointer transition uppercase ${
                    formData.accessLevel === level
                      ? "border-[#00a86b] bg-[#eef9f5] text-[#00a86b]"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  } ${uploading || submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    name="accessLevel"
                    value={level}
                    checked={formData.accessLevel === level}
                    onChange={handleChange}
                    disabled={uploading || submitting}
                    className="sr-only"
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              disabled={uploading || submitting}
              className="w-full px-3 py-2 border rounded-xl resize-none disabled:bg-slate-50"
              placeholder="Optionnel"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading || submitting}
              className="px-4 py-2 border rounded-xl text-slate-500 hover:bg-slate-50 text-xs disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={uploading || submitting || !formData.urlFichier}
              className="px-5 py-2 bg-[#00a86b] hover:bg-[#00945e] text-white font-bold rounded-xl flex items-center gap-1.5 text-xs shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sauvegarde...
                </>
              ) : (
                "Sauvegarder"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}