"use client";

import { useState, useEffect, useRef } from "react";
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
  Pencil,
} from "lucide-react";

type ModifierSupportProps = {
  supportId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ModifierSupport({
  supportId,
  onClose,
  onSuccess,
}: ModifierSupportProps) {
  const [loading, setLoading] = useState(true);
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
  });

  useEffect(() => {
    const fetchSupport = async () => {
      try {
        setLoading(true);
        const res = await apiService.get<any>(`/supports/${supportId}`);
        console.log("📥 Réponse brute GET /supports/:id", res);
        const data = res?.support ?? res?.data?.support ?? res;
        console.log("📦 Données normalisées du support:", data);
        if (data && data.id) {
          setFormData({
            titre: data.titre || "",
            description: data.description || "",
            type: data.type || "VIDEO",
            urlFichier: data.urlFichier || "",
            mimeType: data.mimeType || "",
            tailleMo: data.tailleMo?.toString() || "",
            dureeSecondes: data.dureeSecondes?.toString() || "",
            ordre: data.ordre?.toString() || "1",
            accessLevel: data.accessLevel || "FREE",
          });
        } else {
          setError("Structure de données inattendue");
        }
      } catch (err: any) {
        console.error("❌ Erreur fetchSupport:", err);
        if (err?.status === 401 || err?.message?.includes("401")) {
          setError("Session expirée, veuillez vous reconnecter.");
        } else {
          setError(err?.message || "Impossible de charger les données");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSupport();
  }, [supportId]);

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

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const sizeMo = +(file.size / (1024 * 1024)).toFixed(2);

      let durationSec = 0;
      let newType = formData.type;

      if (file.type.startsWith("video/")) {
        durationSec = await getVideoDuration(file);
        newType = "VIDEO";
      } else if (file.type === "application/pdf") {
        newType = "PDF";
      } else if (file.type.startsWith("image/")) {
        newType = "IMAGE";
      } else {
        newType = "DOCUMENT";
      }

      let uploadResult;
      if (file.type.startsWith("video/")) {
        uploadResult = await cloudinaryService.uploadVideo(
          file,
          "supports/videos",
          (percent) => setUploadProgress(percent),
        );
      } else if (file.type === "application/pdf") {
        uploadResult = await cloudinaryService.uploadPdf(
          file,
          "supports/pdf",
          (percent) => setUploadProgress(percent),
        );
      } else if (file.type.startsWith("image/")) {
        uploadResult = await cloudinaryService.uploadImage(
          file,
          "supports/images",
          (percent) => setUploadProgress(percent),
        );
      } else {
        uploadResult = await cloudinaryService.uploadFile(file, {
          folder: "supports/others",
          resourceType: "raw",
          onProgress: (percent) => setUploadProgress(percent),
        });
      }

      // Durée finale : Cloudinary est prioritaire sur l'extraction locale
      if (uploadResult.duration) {
        durationSec = uploadResult.duration;
      }

      // ✅ Un seul setFormData groupé — pas de race condition
      setFormData((prev) => ({
        ...prev,
        type: newType,
        mimeType: file.type,
        tailleMo: sizeMo.toString(),
        dureeSecondes: durationSec
          ? durationSec.toString()
          : prev.dureeSecondes,
        urlFichier: uploadResult.secureUrl,
      }));

      console.log("🆕 Upload terminé:", uploadResult.secureUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur upload fichier");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.urlFichier) {
      setError("Veuillez fournir une URL de fichier (upload ou manuelle)");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      titre: formData.titre,
      description: formData.description.trim() || null,
      ordre: Number(formData.ordre) || 1,
      accessLevel: formData.accessLevel,
      urlFichier: formData.urlFichier,
      // ✅ Champs manquants — ajoutés ici
      type: formData.type,
      mimeType: formData.mimeType.trim() || null,
      tailleMo: formData.tailleMo ? parseFloat(formData.tailleMo) : null,
      dureeSecondes:
        (formData.type === "VIDEO" || formData.type === "AUDIO") &&
        formData.dureeSecondes
          ? Number(formData.dureeSecondes)
          : null,
    };
    // ...
    console.log("🔵 Envoi PATCH pour supportId:", supportId);
    console.log("📦 Payload envoyé:", payload);

    try {
      const response = await apiService.patch(
        `/supports/${supportId}`,
        payload,
      );
      console.log("✅ Réponse PATCH reçue:", response);
      // Petite pause pour laisser le backend persister
      setTimeout(() => {
        console.log("🔄 Appel onSuccess() après 300ms");
        onSuccess();
      }, 300);
    } catch (err: any) {
      console.error("❌ Erreur PATCH:", err);
      setError(err?.message || "Erreur lors de la modification");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Chargement du support...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* En-tête */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Modifier le support
              </h3>
              <p className="text-[11px] text-slate-400">
                Mettez à jour les informations
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

          {formData.type === "VIDEO" && formData.urlFichier && !uploading && (
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                Aperçu actuel
              </label>
              <video
                src={formData.urlFichier}
                controls
                className="w-full rounded-lg border border-slate-200 max-h-[200px] object-contain bg-black/5"
              />
              <p className="text-[10px] text-slate-400">
                Vidéo actuelle (sera remplacée si vous en uploadez une nouvelle)
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Nouveau fichier (optionnel)
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
                uploading
                  ? "opacity-60 pointer-events-none"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
              }`}
            >
              {uploading ? (
                <div className="text-center w-full">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                  <p className="text-sm font-semibold mt-2">
                    Upload en cours...
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {uploadProgress}%
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-600">
                    Cliquez pour remplacer le fichier
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Laissez vide pour conserver le fichier actuel
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">Titre *</label>
            <input
              type="text"
              name="titre"
              required
              value={formData.titre}
              onChange={handleChange}
              disabled={uploading || submitting}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                <Video className="w-4 h-4" /> Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={uploading || submitting}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20"
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
              <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Ordre
              </label>
              <input
                type="number"
                name="ordre"
                required
                min="1"
                value={formData.ordre}
                onChange={handleChange}
                disabled={uploading || submitting}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              URL du fichier *
            </label>
            <input
              type="url"
              name="urlFichier"
              required
              value={formData.urlFichier}
              onChange={handleChange}
              disabled={uploading || submitting}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700">
                Mime-Type
              </label>
              <input
                type="text"
                value={formData.mimeType}
                disabled
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 text-slate-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700">
                Taille (Mo)
              </label>
              <input
                type="text"
                value={formData.tailleMo}
                disabled
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 text-slate-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700">
                Durée (sec)
              </label>
              <input
                type="text"
                value={formData.dureeSecondes}
                disabled
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Accès
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["FREE", "PREMIUM", "VIP"].map((level) => (
                <label
                  key={level}
                  className={`border rounded-xl p-3 flex items-center justify-center font-bold text-xs cursor-pointer transition uppercase ${
                    formData.accessLevel === level
                      ? "border-indigo-600 bg-indigo-50 text-indigo-600"
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
            />
          </div>

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
              disabled={uploading || submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
