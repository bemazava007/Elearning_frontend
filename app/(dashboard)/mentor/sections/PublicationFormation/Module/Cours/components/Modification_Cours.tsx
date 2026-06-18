"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api.service";

export default function ModificationCours({
  coursId,
  initialData,
  onClose,
  onSuccess,
}: {
  coursId: string;
  initialData: {
    titre: string;
    description: string | null;
    ordre: number;
    dureeMinutes: number;
    typeCours: string;
    resume: string | null;
    estGratuit: boolean;
  };
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    titre: initialData.titre || "",
    description: initialData.description || "",
    ordre: initialData.ordre || 1,
    dureeMinutes: initialData.dureeMinutes || 10,
    typeCours: initialData.typeCours || "THEORIQUE",
    resume: initialData.resume || "",
    estGratuit: initialData.estGratuit || true,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await apiService.patch(`/cours/${coursId}`, {
        titre: form.titre,
        description: form.description || null,
        ordre: Number(form.ordre),
        dureeMinutes: Number(form.dureeMinutes),
        typeCours: form.typeCours,
        resume: form.resume || null,
        estGratuit: form.estGratuit,
      });

      onSuccess();
    } catch (err) {
      console.error("Erreur modification cours", err);
      alert("Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-137.5 max-h-[90vh] overflow-auto">
        <h2 className="text-lg font-bold mb-4">✏️ Modifier le cours</h2>

        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Titre du cours"
          value={form.titre}
          onChange={(e) => handleChange("titre", e.target.value)}
        />

        <textarea
          className="border p-2 w-full mb-2 rounded"
          placeholder="Description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />

        <textarea
          className="border p-2 w-full mb-2 rounded"
          placeholder="Résumé"
          value={form.resume}
          onChange={(e) => handleChange("resume", e.target.value)}
        />

        <input
          type="number"
          className="border p-2 w-full mb-2 rounded"
          placeholder="Ordre"
          value={form.ordre}
          onChange={(e) => handleChange("ordre", Number(e.target.value))}
        />

        <input
          type="number"
          className="border p-2 w-full mb-2 rounded"
          placeholder="Durée (minutes)"
          value={form.dureeMinutes}
          onChange={(e) => handleChange("dureeMinutes", Number(e.target.value))}
        />

        <select
          className="border p-2 w-full mb-2 rounded"
          value={form.typeCours}
          onChange={(e) => handleChange("typeCours", e.target.value)}
        >
          <option value="THEORIQUE">THEORIQUE</option>
          <option value="PRATIQUE">PRATIQUE</option>
          <option value="QUIZ">QUIZ</option>
          <option value="PROJET">PROJET</option>
        </select>

        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={form.estGratuit}
            onChange={(e) => handleChange("estGratuit", e.target.checked)}
          />
          Gratuit
        </label>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </div>
  );
}
