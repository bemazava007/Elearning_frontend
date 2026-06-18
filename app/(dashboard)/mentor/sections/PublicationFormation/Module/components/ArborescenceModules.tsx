"use client";

import React, { useEffect, useState } from "react";
import { FolderOpen, Loader2, BookOpen } from "lucide-react";

interface ModuleAPI {
  id: string;
  titre: string;
  description: string;
  ordre: number;
  duree: number;
  estGratuit: boolean;
}

interface Props {
  formationId: string | null;
  refresh?: number; // 👈 IMPORTANT pour reload après création module
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ArborescenceModules({ formationId, refresh }: Props) {
  const [modules, setModules] = useState<ModuleAPI[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!formationId) return;

    const fetchModules = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_URL}/formations/${formationId}/modules`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!res.ok) throw new Error("Erreur API modules");

        const json = await res.json();

        const raw: any[] = Array.isArray(json.data?.modules)
          ? json.data.modules
          : [];

        const mapped: ModuleAPI[] = raw.map((m) => ({
          id: m.id,
          titre: m.titre,
          description: m.description ?? "",
          ordre: Number(m.ordre) || 1,
          duree: Number(m.duree) || 0,
          estGratuit: Boolean(m.estGratuit),
        }));

        mapped.sort((a, b) => a.ordre - b.ordre);
        setModules(mapped);
      } catch (err) {
        console.error("Modules error:", err);
        setModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [formationId, refresh]);
  if (!formationId) {
    return (
      <div className="text-center text-slate-400 py-10">
        <FolderOpen className="mx-auto mb-2" />
        <p className="text-xs">Sélectionnez une formation</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3 border-b pb-2">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-emerald-900" />
          <span className="text-xs font-bold">Modules</span>
        </div>

        <span className="text-[11px] text-slate-500">{modules.length}</span>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-emerald-900" />
        </div>
      ) : modules.length === 0 ? (
        <p className="text-xs text-slate-400 text-center">
          Aucun module pour cette formation
        </p>
      ) : (
        <div className="space-y-2 overflow-y-auto">
          {modules.map((m) => (
            <div key={m.id} className="p-3 border rounded-lg bg-slate-50">
              <div className="flex justify-between">
                <h4 className="text-xs font-semibold">{m.titre}</h4>
                {m.estGratuit && (
                  <span className="text-[10px] text-green-600">Gratuit</span>
                )}
              </div>

              <p className="text-[11px] text-slate-500">{m.description}</p>

              <div className="text-[10px] text-slate-400 flex gap-1 mt-1">
                <BookOpen size={12} />
                {m.duree} min
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
