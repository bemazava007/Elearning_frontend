"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  // FolderOpen,
  Layers,
  FileText,
  Video,
  Trash2,
  Edit3,
  // CheckCircle,
  X,
  // UploadCloud,
  // ChevronRight,
  GraduationCap,
  // Eye,
  BookOpen,
} from "lucide-react";

// --- TYPES ---
interface Module {
  id: string;
  title: string;
  pdfName: string;
  videoUrl: string;
}

interface Formation {
  id: string;
  title: string;
  description: string;
  volet: "Business" | "Freelance";
  level: "Débutant" | "Intermédiaire" | "Avancé";
  price: number;
  modulesCount: number;
  modules: Module[];
}

// --- DONNÉES PAR DÉFAUT DU TABLEAU DE BORD ---
const INITIAL_FORMATIONS: Formation[] = [
  {
    id: "FORM-001",
    title: "Lancer et développer votre business en ligne",
    description: "De l'idée à la mise en place d'un business digital rentable.",
    volet: "Business",
    level: "Intermédiaire",
    price: 300000,
    modulesCount: 4,
    modules: [
      {
        id: "M-1",
        title: "Introduction au Business Digital",
        pdfName: "Introduction_Business.pdf",
        videoUrl: "https://vimeo.com/... ",
      },
      {
        id: "M-2",
        title: "Étude de marché et personas",
        pdfName: "Personas_Market.pdf",
        videoUrl: "https://vimeo.com/... ",
      },
    ],
  },
  {
    id: "FORM-002",
    title: "Devenir freelance et trouver vos clients",
    description:
      "Maîtrisez les compétences pour vivre de vos talents en freelance.",
    volet: "Freelance",
    level: "Débutant",
    price: 350000,
    modulesCount: 4,
    modules: [
      {
        id: "M-3",
        title: "État des lieux du freelancing",
        pdfName: "Freelance_Guide.pdf",
        videoUrl: "",
      },
    ],
  },
];

export default function AdminFormationsPage() {
  const [formations, setFormations] = useState<Formation[]>(INITIAL_FORMATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVolet, setSelectedVolet] = useState("Tous");

  // --- ÉTATS DES MODALS ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(
    null,
  );

  // --- ÉTATS DU FORMULAIRE ---
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formVolet, setFormVolet] = useState<"Business" | "Freelance">(
    "Business",
  );
  const [formLevel, setFormLevel] = useState<
    "Débutant" | "Intermédiaire" | "Avancé"
  >("Débutant");
  const [formPrice, setFormPrice] = useState("");
  const [formModules, setFormModules] = useState<Module[]>([]);

  // Éléments temporaires pour ajouter un module dans le formulaire
  const [tempModuleTitle, setTempModuleTitle] = useState("");
  const [tempPdfName, setTempPdfName] = useState("");
  const [tempVideoUrl, setTempVideoUrl] = useState("");

  // --- FILTRES ---
  const filteredFormations = formations.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVolet = selectedVolet === "Tous" || f.volet === selectedVolet;
    return matchesSearch && matchesVolet;
  });

  // --- ACTIONS ---
  const openCreateModal = () => {
    setEditingFormation(null);
    setFormTitle("");
    setFormDescription("");
    setFormVolet("Business");
    setFormLevel("Débutant");
    setFormPrice("");
    setFormModules([]);
    setIsFormModalOpen(true);
  };

  const openEditModal = (formation: Formation) => {
    setEditingFormation(formation);
    setFormTitle(formation.title);
    setFormDescription(formation.description);
    setFormVolet(formation.volet);
    setFormLevel(formation.level);
    setFormPrice(formation.price.toString());
    setFormModules(formation.modules);
    setIsFormModalOpen(true);
  };

  const handleDeleteFormation = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
      setFormations(formations.filter((f) => f.id !== id));
    }
  };

  const handleAddModuleToForm = () => {
    if (!tempModuleTitle) return;
    const newModule: Module = {
      id: "M-" + Date.now(),
      title: tempModuleTitle,
      pdfName: tempPdfName || "Aucun fichier",
      videoUrl: tempVideoUrl || "Aucun lien video",
    };
    setFormModules([...formModules, newModule]);
    setTempModuleTitle("");
    setTempPdfName("");
    setTempVideoUrl("");
  };

  const handleRemoveModuleFromForm = (id: string) => {
    setFormModules(formModules.filter((m) => m.id !== id));
  };

  const handleSaveFormation = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingFormation) {
      // Modification
      setFormations(
        formations.map((f) =>
          f.id === editingFormation.id
            ? {
                ...f,
                title: formTitle,
                description: formDescription,
                volet: formVolet,
                level: formLevel,
                price: Number(formPrice),
                modules: formModules,
                modulesCount: formModules.length,
              }
            : f,
        ),
      );
    } else {
      // Création
      const newFormation: Formation = {
        id: "FORM-" + (formations.length + 1).toString().padStart(3, "0"),
        title: formTitle,
        description: formDescription,
        volet: formVolet,
        level: formLevel,
        price: Number(formPrice),
        modulesCount: formModules.length,
        modules: formModules,
      };
      setFormations([...formations, newFormation]);
    }
    setIsFormModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans antialiased">
      {/* HEADER DU BACK-OFFICE */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-cyan-600 p-2 rounded-xl text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              TEACH SYSTEM
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Espace Back-Office Admin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-xs font-bold text-slate-700">
              Adeline Raoliarivao
            </span>
            <span className="text-[9px] bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded-md font-bold">
              Administrateur Principal
            </span>
          </div>
        </div>
      </header>

      {/* ZONE DE CONTENU GLOBAL */}
      <main className="max-w-7xl mx-auto p-6 md:p-8">
        {/* TITRE ET ACTION PRINCIPALE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Gestion des Formations
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configurez les offres, intégrez les chapitres sous forme de PDF et
              liez les cours vidéo de vos mentors.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs h-11 px-5 rounded-xl transition-all shadow-md shadow-cyan-100 shrink-0"
          >
            <Plus className="w-4 h-4" /> Créer une nouvelle formation
          </button>
        </div>

        {/* STATISTIQUES RAPIDES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-lg">
              {formations.length}
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Formations au total
              </span>
              <span className="text-sm font-black text-slate-800">
                Catalogue Actif
              </span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
              {formations.filter((f) => f.volet === "Business").length}
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Volet Business
              </span>
              <span className="text-sm font-black text-slate-800">
                Entrepreneuriat
              </span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
              {formations.filter((f) => f.volet === "Freelance").length}
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Volet Freelance
              </span>
              <span className="text-sm font-black text-slate-800">
                Indépendants
              </span>
            </div>
          </div>
        </div>

        {/* BARRE DE RECHERCHE ET FILTRE SYNCHRONISÉ */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par ID ou nom de cours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500/60 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {["Tous", "Business", "Freelance"].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedVolet(category)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedVolet === category
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {category === "Tous" ? "Tous les volets" : category}
              </button>
            ))}
          </div>
        </div>

        {/* TABLEAU DE STRUCTURE PROFESSIONNEL */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">ID Code</th>
                  <th className="py-4 px-6">Désignation de la formation</th>
                  <th className="py-4 px-6">Volet</th>
                  <th className="py-4 px-6">Niveau d{"'"}entrée</th>
                  <th className="py-4 px-6">Volume modules</th>
                  <th className="py-4 px-6">Tarif Global</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredFormations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-slate-400 font-bold"
                    >
                      Aucun enregistrement ne correspond à vos critères.
                    </td>
                  </tr>
                ) : (
                  filteredFormations.map((f) => (
                    <tr
                      key={f.id}
                      className="hover:bg-slate-50/40 transition-colors group"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-slate-500 text-[11px]">
                        {f.id}
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <span className="block font-bold text-slate-900 line-clamp-1 group-hover:text-cyan-600 transition-colors">
                          {f.title}
                        </span>
                        <span className="block text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {f.description}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${f.volet === "Business" ? "bg-cyan-50 text-cyan-700 border border-cyan-100" : "bg-teal-50 text-teal-700 border border-teal-100"}`}
                        >
                          {f.volet}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span>{f.level}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-900">
                            {f.modulesCount} supports
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-black text-slate-900">
                        {new Intl.NumberFormat("fr-FR").format(f.price)} Ar
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => openEditModal(f)}
                            className="p-2 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 text-slate-600 hover:text-cyan-600 rounded-lg transition-all"
                            title="Modifier la structure"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFormation(f.id)}
                            className="p-2 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 rounded-lg transition-all"
                            title="Supprimer la ligne"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL CONFIGURATEUR GÉANT (AJOUT / MODIFICATION) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsFormModalOpen(false)}
          />

          <form
            onSubmit={handleSaveFormation}
            className="bg-white w-full max-w-4xl h-full sm:h-[90vh] sm:rounded-2xl shadow-2xl relative overflow-hidden flex flex-col z-10 border border-slate-200 animate-scaleUp"
          >
            {/* Header Modal */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  {editingFormation
                    ? "Éditeur de catalogue"
                    : "Nouveau configurateur de cours"}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  Renseignez la structure globale, puis ajoutez ou modifiez ses
                  fiches PDF par ligne.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="bg-white hover:bg-slate-100 border border-slate-200 p-1.5 rounded-lg text-slate-500 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulaire Scrollable */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* SECTION 1 : CONFIGURATION GLOBALE */}
              <div>
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-3">
                  1. Informations Générales
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Titre de la formation
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Devenir freelance et trouver vos clients"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500/60 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Description courte ou accroche
                    </label>
                    <textarea
                      required
                      placeholder="Description du parcours..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500/60 focus:outline-none transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Volet sectoriel
                    </label>
                    <select
                      value={formVolet}
                      onChange={(e) => setFormVolet(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white focus:border-cyan-500/60 focus:outline-none"
                    >
                      <option value="Business">Volet Business</option>
                      <option value="Freelance">Volet Freelance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Niveau d{"'"}admission
                    </label>
                    <select
                      value={formLevel}
                      onChange={(e) => setFormLevel(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white focus:border-cyan-500/60 focus:outline-none"
                    >
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Avancé">Avancé</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Prix de la formation (Ariary)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Ex: 300000"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500/60 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2 : AJOUT DES MODULES ET UPLOAD SUPPORTS */}
              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-3">
                  2. Gestion des supports (PDF & Vidéo)
                </h4>

                {/* Petit formulaire interne pour packager un module */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-3 mb-4">
                  <span className="block text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    Nouveau support par ligne
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        placeholder="Nom du chapitre / titre du module"
                        value={tempModuleTitle}
                        onChange={(e) => setTempModuleTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Nom_Fichier_Support.pdf"
                          value={tempPdfName}
                          onChange={(e) => setTempPdfName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-[11px]"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Lien URL vidéo (Vimeo/Drive)"
                          value={tempVideoUrl}
                          onChange={(e) => setTempVideoUrl(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddModuleToForm}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 h-[34px]"
                    >
                      <Plus className="w-3.5 h-3.5" /> Injecter la ligne
                    </button>
                  </div>
                </div>

                {/* Sommaire des modules en cours de création */}
                <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                  Sommaire dynamique de la formation
                </span>
                <div className="space-y-1.5">
                  {formModules.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs">
                      Aucun module injecté pour le moment dans ce parcours.
                    </div>
                  ) : (
                    formModules.map((mod, index) => (
                      <div
                        key={mod.id}
                        className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-3 pr-4 truncate">
                          <span className="w-5 h-5 rounded bg-slate-100 text-slate-500 font-mono text-[10px] flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <div className="truncate">
                            <span className="block font-bold text-slate-800 truncate">
                              {mod.title}
                            </span>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium mt-0.5">
                              <span className="flex items-center gap-0.5 text-cyan-600">
                                <FileText className="w-3 h-3" /> {mod.pdfName}
                              </span>
                              {mod.videoUrl && (
                                <span className="flex items-center gap-0.5 text-slate-500">
                                  <Video className="w-3 h-3" /> Vidéo liée
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveModuleFromForm(mod.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-100"
              >
                Sauvegarder les modifications
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
