// // E:\Teach-platform\frontend\app\(dashboard)\mentor\sections\PublicationFormation\Formation\Ajout_PublicationFormation.tsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { Plus, X, CheckCircle, Loader2, AlertCircle } from "lucide-react";
// import Link from "next/link";

// import { cloudinaryService } from "@/services/cloudinary.service";
// import { formationService } from "@/services/api.service";

// import AffichagePublicationFormation from "./Affichage_PublicationFormation";

// // ==================== INTERFACES ====================
// interface Module {
//   id: string;
//   titre: string;
//   type: "Vidéo" | "PDF";
//   fileName: string;
//   isPublished: boolean;
// }

// interface Course {
//   id: string;
//   titre: string;
//   description: string;
//   isPublished: boolean;
//   modules: Module[];
//   volet: "BUSINESS" | "FREELANCE";
//   niveau: "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE";
//   dureeEstimee: number;
//   imageUrl?: string | null;
//   previewUrl?: string | null;
//   objectifs: string[];
// }

// interface FormationResponse {
//   id: string;
//   titre: string;
//   description: string;
//   volet: "BUSINESS" | "FREELANCE";
//   niveau: "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE";
//   dureeEstimee: number;
//   imageUrl?: string | null;
//   previewUrl?: string | null;
//   objectifs: string[];
//   isPublished?: boolean;
// }

// interface PublicationFormationProps {
//   courses: Course[];
//   setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
//   onCreated?: () => void;
// }

// interface Toast {
//   type: "success" | "error";
//   message: string;
//   detail?: string;
// }

// // ==================== COMPOSANT ====================
// export default function Ajout_PublicationFormation({
//   courses,
//   setCourses,
//   onCreated,
// }: PublicationFormationProps) {
//   const [showCourseForm, setShowCourseForm] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [toast, setToast] = useState<Toast | null>(null);
//   const [refresh, setRefresh] = useState(0);

//   const [newCourse, setNewCourse] = useState({
//     titre: "",
//     description: "",
//     objectifs: "",
//     volet: "FREELANCE" as "BUSINESS" | "FREELANCE",
//     niveau: "DEBUTANT" as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
//     dureeEstimee: 180,
//     imageFile: null as File | null,
//     videoFile: null as File | null,
//   });

//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(null), 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   const showToast = (
//     type: "success" | "error",
//     message: string,
//     detail?: string,
//   ) => {
//     setToast({ type, message, detail });
//   };

//   const resetForm = () => {
//     setNewCourse({
//       titre: "",
//       description: "",
//       objectifs: "",
//       volet: "FREELANCE",
//       niveau: "DEBUTANT",
//       dureeEstimee: 180,
//       imageFile: null,
//       videoFile: null,
//     });
//   };

//   const handleAddCourse = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const titreClean = newCourse.titre?.trim();
//     const descriptionClean = newCourse.description?.trim();

//     if (!titreClean || titreClean.length < 3) {
//       showToast("error", "Titre invalide", "Min 3 caractères");
//       return;
//     }
//     if (!descriptionClean || descriptionClean.length < 10) {
//       showToast("error", "Description invalide", "Min 10 caractères");
//       return;
//     }

//     setIsSubmitting(true);
//     const tempId = `temp-${Date.now()}`;
//     const objectifsArray = newCourse.objectifs
//       .split(",")
//       .map((o) => o.trim())
//       .filter(Boolean);

//     // UI Optimiste
//     setCourses((prev) => [
//       {
//         id: tempId,
//         titre: titreClean,
//         description: descriptionClean,
//         isPublished: false,
//         modules: [],
//         volet: newCourse.volet,
//         niveau: newCourse.niveau,
//         dureeEstimee: newCourse.dureeEstimee,
//         imageUrl: newCourse.imageFile
//           ? URL.createObjectURL(newCourse.imageFile)
//           : null,
//         previewUrl: newCourse.videoFile
//           ? URL.createObjectURL(newCourse.videoFile)
//           : null,
//         objectifs: objectifsArray,
//       },
//       ...prev,
//     ]);

//     try {
//       let imageUrl: string | null = null;
//       let previewUrl: string | null = null;

//       if (newCourse.imageFile) {
//         const imgResult = await cloudinaryService.uploadImage(
//           newCourse.imageFile,
//           "formations/images",
//         );
//         imageUrl = imgResult.secureUrl;
//       }

//       if (newCourse.videoFile) {
//         const videoResult = await cloudinaryService.uploadVideo(
//           newCourse.videoFile,
//           "formations/previews",
//         );
//         previewUrl = videoResult.secureUrl;
//       }

//       const payload = {
//         titre: titreClean,
//         description: descriptionClean,
//         volet: newCourse.volet,
//         niveau: newCourse.niveau,
//         dureeEstimee: newCourse.dureeEstimee,
//         objectifs: objectifsArray,
//         imageUrl,
//         previewUrl,
//       };

//       // ✅ Correction du typage ici
//       const data = (await formationService.create(
//         payload,
//       )) as FormationResponse;

//       // Mise à jour
//       setCourses((prev) =>
//         prev.map((c) =>
//           c.id === tempId
//             ? {
//                 ...c,
//                 id: data.id,
//                 titre: data.titre,
//                 description: data.description,
//                 volet: data.volet,
//                 niveau: data.niveau,
//                 dureeEstimee: Number(data.dureeEstimee),
//                 imageUrl: data.imageUrl || imageUrl,
//                 previewUrl: data.previewUrl || previewUrl,
//                 objectifs: data.objectifs || objectifsArray,
//                 isPublished: data.isPublished ?? false,
//               }
//             : c,
//         ),
//       );

//       showToast("success", "Formation créée avec succès !");
//       setShowCourseForm(false);
//       resetForm();
//       if (onCreated) onCreated();
//     } catch (error: any) {
//       console.error("Erreur création :", error);
//       setCourses((prev) => prev.filter((c) => c.id !== tempId));
//       showToast(
//         "error",
//         "Échec de création",
//         error.message || "Vérifie ta connexion",
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-6 relative">
//       {/* TOAST */}
//       {toast && (
//         <div
//           className={`fixed top-6 right-6 z-50 flex items-center gap-3 bg-white shadow-xl rounded-2xl px-5 py-4 min-w-[340px] max-w-[420px] border ${
//             toast.type === "success"
//               ? "border-emerald-200 shadow-emerald-500/10"
//               : "border-red-200 shadow-red-500/10"
//           }`}
//         >
//           <div
//             className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
//               toast.type === "success" ? "bg-emerald-100" : "bg-red-100"
//             }`}
//           >
//             {toast.type === "success" ? (
//               <CheckCircle className="text-emerald-600" size={22} />
//             ) : (
//               <AlertCircle className="text-red-500" size={22} />
//             )}
//           </div>
//           <div className="flex-1 min-w-0">
//             <p
//               className={`font-bold text-sm ${
//                 toast.type === "success" ? "text-emerald-800" : "text-red-700"
//               }`}
//             >
//               {toast.message}
//             </p>
//             {toast.detail && <p className="text-xs mt-0.5">{toast.detail}</p>}
//           </div>
//           <button
//             onClick={() => setToast(null)}
//             className="shrink-0 text-slate-400 hover:text-slate-600"
//           >
//             <X size={16} />
//           </button>
//         </div>
//       )}

//       {/* HEADER */}
//       <div className="flex justify-between items-center">
//         <h3 className="font-bold text-sm text-cyan-900">
//           Formations disponibles{" "}
//           <Link
//             href="/mentor/sections/PublicationFormation/Module"
//             className="text-cyan-600 hover:text-cyan-800 underline underline-offset-2 font-medium transition-colors"
//           >
//             Voir la liste de module
//           </Link>
//         </h3>
//         <button
//           onClick={() => setShowCourseForm(true)}
//           className="bg-cyan-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-cyan-950 transition flex items-center gap-1.5 shadow-sm"
//         >
//           <Plus size={16} /> Nouvelle Formation
//         </button>
//       </div>

//       {/* MODAL */}
//       {showCourseForm && (
//         <div
//           className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//           onClick={() => {
//             setShowCourseForm(false);
//             resetForm();
//           }}
//         >
//           <div
//             className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex justify-between items-center p-6 border-b border-cyan-50 sticky top-0 bg-white z-10 rounded-t-2xl">
//               <div>
//                 <h4 className="font-bold text-sm text-cyan-900">
//                   Créer une nouvelle formation
//                 </h4>
//                 <p className="text-[11px] text-cyan-400 mt-0.5">
//                   Remplissez les informations ci-dessous
//                 </p>
//               </div>
//               <button
//                 onClick={() => {
//                   setShowCourseForm(false);
//                   resetForm();
//                 }}
//                 className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 transition"
//               >
//                 <X size={16} />
//               </button>
//             </div>

//             <form onSubmit={handleAddCourse} className="p-6 space-y-4">
//               {/* Tous les champs du formulaire restent identiques à ta version */}
//               {/* ... (je garde tout pour que tu puisses copier-coller directement) */}

//               <div>
//                 <label className="block text-[11px] font-bold text-cyan-700 mb-1">
//                   Titre <span className="text-red-400">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={newCourse.titre}
//                   onChange={(e) =>
//                     setNewCourse({ ...newCourse, titre: e.target.value })
//                   }
//                   placeholder="ex: Architecture Clean Code en React"
//                   className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-[11px] font-bold text-cyan-700 mb-1">
//                   Description <span className="text-red-400">*</span>
//                 </label>
//                 <textarea
//                   value={newCourse.description}
//                   onChange={(e) =>
//                     setNewCourse({ ...newCourse, description: e.target.value })
//                   }
//                   placeholder="Décrivez les compétences acquises..."
//                   className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400 h-20 resize-none"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-[11px] font-bold text-cyan-700 mb-1">
//                   Objectifs <span className="text-red-400">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={newCourse.objectifs}
//                   onChange={(e) =>
//                     setNewCourse({ ...newCourse, objectifs: e.target.value })
//                   }
//                   placeholder="Ex: Maîtriser Docker, Configurer l'arborescence"
//                   className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400"
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-[11px] font-bold text-cyan-700 mb-1">
//                     Volet
//                   </label>
//                   <select
//                     value={newCourse.volet}
//                     onChange={(e) =>
//                       setNewCourse({
//                         ...newCourse,
//                         volet: e.target.value as any,
//                       })
//                     }
//                     className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400"
//                   >
//                     <option value="FREELANCE">Freelance</option>
//                     <option value="BUSINESS">Business</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-[11px] font-bold text-cyan-700 mb-1">
//                     Niveau
//                   </label>
//                   <select
//                     value={newCourse.niveau}
//                     onChange={(e) =>
//                       setNewCourse({
//                         ...newCourse,
//                         niveau: e.target.value as any,
//                       })
//                     }
//                     className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400"
//                   >
//                     <option value="DEBUTANT">Débutant</option>
//                     <option value="INTERMEDIAIRE">Intermédiaire</option>
//                     <option value="AVANCE">Avancé</option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-[11px] font-bold text-cyan-700 mb-1">
//                   Durée estimée (minutes)
//                 </label>
//                 <input
//                   type="number"
//                   value={newCourse.dureeEstimee}
//                   onChange={(e) =>
//                     setNewCourse({
//                       ...newCourse,
//                       dureeEstimee: Number(e.target.value),
//                     })
//                   }
//                   min="120"
//                   max="6000"
//                   className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400"
//                   required
//                 />
//               </div>

//               {/* Image et Vidéo inputs */}
//               <div className="p-3 bg-cyan-50/20 border border-dashed border-cyan-200 rounded-xl">
//                 <label className="block text-[11px] font-bold text-cyan-800 mb-1">
//                   🖼️ Image de miniature
//                 </label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) =>
//                     setNewCourse({
//                       ...newCourse,
//                       imageFile: e.target.files?.[0] || null,
//                     })
//                   }
//                   className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-900 file:text-white"
//                 />
//                 {newCourse.imageFile && (
//                   <p className="text-emerald-600 text-xs mt-1">
//                     ✓ {newCourse.imageFile.name}
//                   </p>
//                 )}
//               </div>

//               <div className="p-3 bg-cyan-50/20 border border-dashed border-cyan-200 rounded-xl">
//                 <label className="block text-[11px] font-bold text-cyan-800 mb-1">
//                   🎬 Vidéo de prévisualisation
//                 </label>
//                 <input
//                   type="file"
//                   accept="video/*"
//                   onChange={(e) =>
//                     setNewCourse({
//                       ...newCourse,
//                       videoFile: e.target.files?.[0] || null,
//                     })
//                   }
//                   className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-900 file:text-white"
//                 />
//                 {newCourse.videoFile && (
//                   <p className="text-emerald-600 text-xs mt-1">
//                     ✓ {newCourse.videoFile.name}
//                   </p>
//                 )}
//               </div>

//               <div className="flex gap-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowCourseForm(false);
//                     resetForm();
//                   }}
//                   className="flex-1 py-2.5 border border-cyan-200 text-cyan-700 font-bold rounded-xl hover:bg-cyan-50"
//                 >
//                   Annuler
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="flex-1 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <Loader2 size={16} className="animate-spin" /> Création en
//                       cours...
//                     </>
//                   ) : (
//                     "✅ Créer la formation"
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* LISTE */}
//       <div className="pt-6 border-t border-cyan-100">
//         <AffichagePublicationFormation refresh={refresh} />
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

import { cloudinaryService } from "@/services/cloudinary.service";
import { formationService } from "@/services/api.service";

import AffichagePublicationFormation from "./Affichage_PublicationFormation";

// Types (identiques à l’original)
interface Module {
  id: string;
  titre: string;
  type: "Vidéo" | "PDF";
  fileName: string;
  isPublished: boolean;
}

interface Course {
  id: string;
  titre: string;
  description: string;
  isPublished: boolean;
  modules: Module[];
  volet: "BUSINESS" | "FREELANCE";
  niveau: "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE";
  dureeEstimee: number;
  imageUrl?: string | null;
  previewUrl?: string | null;
  objectifs: string[];
}

interface FormationResponse {
  id: string;
  titre: string;
  description: string;
  volet: "BUSINESS" | "FREELANCE";
  niveau: "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE";
  dureeEstimee: number;
  imageUrl?: string | null;
  previewUrl?: string | null;
  objectifs: string[];
  isPublished?: boolean;
}

interface PublicationFormationProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  onCreated?: () => void;
}

interface Toast {
  type: "success" | "error";
  message: string;
  detail?: string;
}

export default function Ajout_PublicationFormation({
  courses,
  setCourses,
  onCreated,
}: PublicationFormationProps) {
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [refresh, setRefresh] = useState(0);

  // États de progression
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);

  const [newCourse, setNewCourse] = useState({
    titre: "",
    description: "",
    objectifs: "",
    volet: "FREELANCE" as "BUSINESS" | "FREELANCE",
    niveau: "DEBUTANT" as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
    dureeEstimee: 180,
    imageFile: null as File | null,
    videoFile: null as File | null,
  });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (
    type: "success" | "error",
    message: string,
    detail?: string,
  ) => {
    setToast({ type, message, detail });
  };

  const resetForm = () => {
    setNewCourse({
      titre: "",
      description: "",
      objectifs: "",
      volet: "FREELANCE",
      niveau: "DEBUTANT",
      dureeEstimee: 180,
      imageFile: null,
      videoFile: null,
    });
    setImageProgress(0);
    setVideoProgress(0);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    const titreClean = newCourse.titre?.trim();
    const descriptionClean = newCourse.description?.trim();

    if (!titreClean || titreClean.length < 3) {
      showToast("error", "Titre invalide", "Min 3 caractères");
      return;
    }
    if (!descriptionClean || descriptionClean.length < 10) {
      showToast("error", "Description invalide", "Min 10 caractères");
      return;
    }

    setIsSubmitting(true);
    const tempId = `temp-${Date.now()}`;
    const objectifsArray = newCourse.objectifs
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    // 1. Upload image (si présente)
    let imageUrl: string | null = null;
    if (newCourse.imageFile) {
      setUploadingImage(true);
      setImageProgress(0);
      try {
        const imgResult = await cloudinaryService.uploadImage(
          newCourse.imageFile,
          "formations/images",
          (percent) => setImageProgress(percent),
        );
        imageUrl = imgResult.secureUrl;
      } catch (err: any) {
        showToast("error", "Erreur upload image", err.message);
        setUploadingImage(false);
        setIsSubmitting(false);
        return;
      } finally {
        setUploadingImage(false);
      }
    }

    // 2. Upload vidéo (si présente)
    let previewUrl: string | null = null;
    if (newCourse.videoFile) {
      setUploadingVideo(true);
      setVideoProgress(0);
      try {
        const videoResult = await cloudinaryService.uploadVideo(
          newCourse.videoFile,
          "formations/previews",
          (percent) => setVideoProgress(percent),
        );
        previewUrl = videoResult.secureUrl;
      } catch (err: any) {
        showToast("error", "Erreur upload vidéo", err.message);
        setUploadingVideo(false);
        setIsSubmitting(false);
        return;
      } finally {
        setUploadingVideo(false);
      }
    }

    // 3. Mise à jour optimiste de l’UI
    setCourses((prev) => [
      {
        id: tempId,
        titre: titreClean,
        description: descriptionClean,
        isPublished: false,
        modules: [],
        volet: newCourse.volet,
        niveau: newCourse.niveau,
        dureeEstimee: newCourse.dureeEstimee,
        imageUrl:
          imageUrl ||
          (newCourse.imageFile
            ? URL.createObjectURL(newCourse.imageFile)
            : null),
        previewUrl:
          previewUrl ||
          (newCourse.videoFile
            ? URL.createObjectURL(newCourse.videoFile)
            : null),
        objectifs: objectifsArray,
      },
      ...prev,
    ]);

    try {
      const payload = {
        titre: titreClean,
        description: descriptionClean,
        volet: newCourse.volet,
        niveau: newCourse.niveau,
        dureeEstimee: newCourse.dureeEstimee,
        objectifs: objectifsArray,
        imageUrl,
        previewUrl,
      };

      const data = (await formationService.create(
        payload,
      )) as FormationResponse;

      setCourses((prev) =>
        prev.map((c) =>
          c.id === tempId
            ? {
                ...c,
                id: data.id,
                titre: data.titre,
                description: data.description,
                volet: data.volet,
                niveau: data.niveau,
                dureeEstimee: Number(data.dureeEstimee),
                imageUrl: data.imageUrl || imageUrl,
                previewUrl: data.previewUrl || previewUrl,
                objectifs: data.objectifs || objectifsArray,
                isPublished: data.isPublished ?? false,
              }
            : c,
        ),
      );

      showToast("success", "Formation créée avec succès !");
      setShowCourseForm(false);
      resetForm();
      if (onCreated) onCreated();
    } catch (error: any) {
      console.error("Erreur création :", error);
      setCourses((prev) => prev.filter((c) => c.id !== tempId));
      showToast(
        "error",
        "Échec de création",
        error.message || "Vérifie ta connexion",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast (identique) */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 bg-white shadow-xl rounded-2xl px-5 py-4 min-w-[340px] max-w-[420px] border ${
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
              className={`font-bold text-sm ${
                toast.type === "success" ? "text-emerald-800" : "text-red-700"
              }`}
            >
              {toast.message}
            </p>
            {toast.detail && <p className="text-xs mt-0.5">{toast.detail}</p>}
          </div>
          <button
            onClick={() => setToast(null)}
            className="shrink-0 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-sm text-cyan-900">
          Formations disponibles{" "}
          <Link
            href="/mentor/sections/PublicationFormation/Module"
            className="text-cyan-600 hover:text-cyan-800 underline underline-offset-2 font-medium transition-colors"
          >
            Voir la liste de module
          </Link>
        </h3>
        <button
          onClick={() => setShowCourseForm(true)}
          className="bg-cyan-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-cyan-950 transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={16} /> Nouvelle Formation
        </button>
      </div>

      {/* MODAL */}
      {showCourseForm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowCourseForm(false);
            resetForm();
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-cyan-50 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h4 className="font-bold text-sm text-cyan-900">
                  Créer une nouvelle formation
                </h4>
                <p className="text-[11px] text-cyan-400 mt-0.5">
                  Remplissez les informations ci-dessous
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCourseForm(false);
                  resetForm();
                }}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="p-6 space-y-4">
              {/* Titre */}
              <div>
                <label className="block text-[11px] font-bold text-cyan-700 mb-1">
                  Titre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newCourse.titre}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, titre: e.target.value })
                  }
                  placeholder="ex: Architecture Clean Code en React"
                  className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400"
                  required
                  disabled={uploadingImage || uploadingVideo || isSubmitting}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-cyan-700 mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                  placeholder="Décrivez les compétences acquises..."
                  className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400 h-20 resize-none"
                  required
                  disabled={uploadingImage || uploadingVideo || isSubmitting}
                />
              </div>

              {/* Objectifs */}
              <div>
                <label className="block text-[11px] font-bold text-cyan-700 mb-1">
                  Objectifs <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newCourse.objectifs}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, objectifs: e.target.value })
                  }
                  placeholder="Ex: Maîtriser Docker, Configurer l'arborescence"
                  className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400"
                  required
                  disabled={uploadingImage || uploadingVideo || isSubmitting}
                />
              </div>

              {/* Volet & Niveau */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-cyan-700 mb-1">
                    Volet
                  </label>
                  <select
                    value={newCourse.volet}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        volet: e.target.value as any,
                      })
                    }
                    className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400"
                    disabled={uploadingImage || uploadingVideo || isSubmitting}
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
                    value={newCourse.niveau}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        niveau: e.target.value as any,
                      })
                    }
                    className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400"
                    disabled={uploadingImage || uploadingVideo || isSubmitting}
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
                  value={newCourse.dureeEstimee}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      dureeEstimee: Number(e.target.value),
                    })
                  }
                  min="120"
                  max="6000"
                  className="w-full bg-cyan-50/40 border border-cyan-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400"
                  required
                  disabled={uploadingImage || uploadingVideo || isSubmitting}
                />
              </div>

              {/* Image miniature avec progression */}
              <div className="p-3 bg-cyan-50/20 border border-dashed border-cyan-200 rounded-xl">
                <label className="block text-[11px] font-bold text-cyan-800 mb-1">
                  🖼️ Image de miniature
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      imageFile: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-900 file:text-white"
                  disabled={uploadingImage || uploadingVideo || isSubmitting}
                />
                {uploadingImage && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-cyan-700">
                      <span>Upload en cours...</span>
                      <span>{imageProgress}%</span>
                    </div>
                    <div className="w-full bg-cyan-100 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-cyan-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${imageProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {newCourse.imageFile && !uploadingImage && (
                  <p className="text-emerald-600 text-xs mt-1">
                    ✓ {newCourse.imageFile.name}
                  </p>
                )}
              </div>

              {/* Vidéo preview avec progression */}
              <div className="p-3 bg-cyan-50/20 border border-dashed border-cyan-200 rounded-xl">
                <label className="block text-[11px] font-bold text-cyan-800 mb-1">
                  🎬 Vidéo de prévisualisation
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      videoFile: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-900 file:text-white"
                  disabled={uploadingImage || uploadingVideo || isSubmitting}
                />
                {uploadingVideo && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-cyan-700">
                      <span>Upload vidéo...</span>
                      <span>{videoProgress}%</span>
                    </div>
                    <div className="w-full bg-cyan-100 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-cyan-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {newCourse.videoFile && !uploadingVideo && (
                  <p className="text-emerald-600 text-xs mt-1">
                    ✓ {newCourse.videoFile.name}
                  </p>
                )}
              </div>

              {/* Boutons d’action */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCourseForm(false);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 border border-cyan-200 text-cyan-700 font-bold rounded-xl hover:bg-cyan-50"
                  disabled={uploadingImage || uploadingVideo || isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage || uploadingVideo || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Création en
                      cours...
                    </>
                  ) : uploadingImage || uploadingVideo ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Upload en
                      cours...
                    </>
                  ) : (
                    "✅ Créer la formation"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des formations */}
      <div className="pt-6 border-t border-cyan-100">
        <AffichagePublicationFormation refresh={refresh} />
      </div>
    </div>
  );
}
