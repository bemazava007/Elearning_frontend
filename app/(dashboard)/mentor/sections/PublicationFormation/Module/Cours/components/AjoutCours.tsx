"use client";

import { useState } from "react";
import { apiService } from "@/services/api.service";

export default function AjoutCours({
  moduleId,
  onClose,
  onSuccess,
}: {
  moduleId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    titre: "",
    description: "",
    ordre: 1,
    dureeMinutes: 10,
    typeCours: "THEORIQUE",
    resume: "",
    estGratuit: true,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await apiService.post("/cours", {
        moduleId,
        titre: form.titre,
        description: form.description || null,
        ordre: Number(form.ordre),
        dureeMinutes: Number(form.dureeMinutes),
        typeCours: form.typeCours,
        resume: form.resume || null,
        estGratuit: form.estGratuit,
        createurId: "1", // ⚠️ remplacer par user connecté
      });

      onSuccess();
    } catch (err) {
      console.error("Erreur création cours", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-[550px]">
        <h2 className="text-lg font-bold mb-4">➕ Ajouter un cours</h2>

        {/* TITRE */}
        <input
          className="border p-2 w-full mb-2"
          placeholder="Titre du cours"
          value={form.titre}
          onChange={(e) => handleChange("titre", e.target.value)}
        />

        {/* DESCRIPTION */}
        <textarea
          className="border p-2 w-full mb-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />

        {/* RESUME */}
        <textarea
          className="border p-2 w-full mb-2"
          placeholder="Résumé"
          value={form.resume}
          onChange={(e) => handleChange("resume", e.target.value)}
        />

        {/* ORDRE */}
        <input
          type="number"
          className="border p-2 w-full mb-2"
          placeholder="Ordre"
          value={form.ordre}
          onChange={(e) => handleChange("ordre", Number(e.target.value))}
        />

        {/* DUREE */}
        <input
          type="number"
          className="border p-2 w-full mb-2"
          placeholder="Durée (minutes)"
          value={form.dureeMinutes}
          onChange={(e) => handleChange("dureeMinutes", Number(e.target.value))}
        />

        {/* TYPE COURS */}
        <select
          className="border p-2 w-full mb-2"
          value={form.typeCours}
          onChange={(e) => handleChange("typeCours", e.target.value)}
        >
          <option value="THEORIQUE">THEORIQUE</option>
          <option value="PRATIQUE">PRATIQUE</option>
          <option value="QUIZ">QUIZ</option>
          <option value="PROJET">PROJET</option>
        </select>

        {/* GRATUIT */}
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={form.estGratuit}
            onChange={(e) => handleChange("estGratuit", e.target.checked)}
          />
          Gratuit
        </label>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1">
            Annuler
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-1 rounded"
          >
            {loading ? "Création..." : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
