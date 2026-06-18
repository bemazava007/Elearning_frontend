// //E:\Teach-platform\frontend\app\(dashboard)\mentor\sections\PublicationFormation\Module\components\Liste_Module.tsx
// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   Plus,
//   Pencil,
//   Trash2,
//   BookOpen,
//   Loader2,
// } from "lucide-react";
// import { moduleService } from "@/services/module.service";

// type Module = {
//   id: string;
//   titre: string;
//   description: string | null;
//   ordre: number;
//   duree: number;
//   image?: string | null;
//   imageUrl?: string | null;
//   estGratuit?: boolean;
//   createdAt?: string;
// };

// interface Props {
//   formationId?: string;
// }

// export default function Liste_Module({ formationId }: Props) {
//   const [modules, setModules] = useState<Module[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchModules = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response: any = formationId
//         ? await moduleService.list(formationId)
//         : await moduleService.list();

//       console.log("📦 Modules API :", response);

//       const modulesData: Module[] = (
//         Array.isArray(response?.data) ? response.data : []
//       ).map((item: any) => ({
//         id: item.props?.id ?? "",
//         titre: item.props?.titre ?? "",
//         description: item.props?.description ?? null,
//         ordre: item.props?.ordre ?? 0,
//         duree: item.props?.duree ?? 0,
//         image: item.props?.image || item.props?.imageUrl || null,
//         estGratuit: item.props?.estGratuit ?? false,
//         createdAt: item.props?.createdAt,
//       }));

//       console.log("✅ Modules transformés :", modulesData);

//       setModules(modulesData);
//     } catch (err: any) {
//       console.error("Erreur lors du chargement des modules :", err);
//       setError(err.message || "Impossible de charger les modules");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchModules();
//   }, [formationId]);

//   return (
//     <div className="p-4">
//       {/* HEADER */}
//       <div className="flex items-center justify-between mb-6">
//         <Link
//           href="/mentor/sections/PublicationFormation"
//           className="flex items-center gap-2 text-gray-600 hover:text-black"
//         >
//           <ArrowLeft size={18} />
//           Retour aux formations
//         </Link>

//         <Link
//           href="/mentor/sections/PublicationFormation/Module/create"
//           className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg"
//         >
//           <Plus size={18} />
//           Ajouter un module
//         </Link>
//       </div>

//       {/* LOADING */}
//       {loading && (
//         <div className="flex justify-center py-10">
//           <Loader2 size={28} className="animate-spin text-emerald-700" />
//         </div>
//       )}

//       {/* ERROR */}
//       {error && (
//         <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-red-500">
//           {error}
//         </div>
//       )}

//       {/* LISTE */}
//       <div className="space-y-4">
//         {modules.map((mod) => {
//           const imageSrc = mod.image || mod.imageUrl || null;

//           return (
//             <div
//               key={mod.id}
//               className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
//             >
//               <div className="flex justify-between items-start gap-4">
//                 <div className="flex-1">
//                   <h2 className="flex items-center gap-2 text-lg font-semibold">
//                     <BookOpen size={18} className="text-emerald-700" />
//                     {mod.ordre}. {mod.titre}
//                   </h2>

//                   {mod.description && (
//                     <p className="mt-2 text-gray-600">{mod.description}</p>
//                   )}

//                   <p className="mt-3 text-sm text-gray-500">
//                     Durée estimée :
//                     <span className="ml-1 font-medium">{mod.duree} min</span>
//                   </p>

//                   {mod.estGratuit && (
//                     <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
//                       Module gratuit
//                     </span>
//                   )}
//                 </div>

//                 {/* IMAGE CLOUDINARY */}
//                 {imageSrc ? (
//                   <img
//                     src={imageSrc}
//                     alt={mod.titre}
//                     className="h-24 w-24 rounded-xl border object-cover"
//                     onError={() =>
//                       console.log("❌ Erreur image Cloudinary :", imageSrc)
//                     }
//                   />
//                 ) : (
//                   <div className="flex h-24 w-24 items-center justify-center rounded-xl border bg-gray-100 text-xs text-gray-400">
//                     Pas d'image
//                   </div>
//                 )}
//               </div>

//               {/* ACTIONS */}
//               <div className="mt-6 flex justify-end gap-4 border-t pt-4">
//                 <Link
//                   href={`/mentor/sections/PublicationFormation/Module/${mod.id}/cours`}
//                   className="flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800"
//                 >
//                   <Plus size={16} />
//                   Ajouter cours
//                 </Link>

//                 <Link
//                   href={`/mentor/sections/PublicationFormation/Module/edit/${mod.id}`}
//                   className="text-orange-500 hover:text-orange-600"
//                 >
//                   <Pencil size={18} />
//                 </Link>

//                 <button
//                   type="button"
//                   className="text-red-500 hover:text-red-600"
//                 >
//                   <Trash2 size={18} />
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* EMPTY */}
//       {!loading && modules.length === 0 && !error && (
//         <div className="py-16 text-center text-gray-500">
//           <BookOpen size={48} className="mx-auto mb-4 opacity-40" />
//           <p>Aucun module trouvé pour le moment</p>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Loader2,
} from "lucide-react";
import { moduleService } from "@/services/module.service";
import ModifierModule from "./ModifierModule";

type Module = {
  id: string;
  titre: string;
  description: string | null;
  ordre: number;
  duree: number;
  image?: string | null;
  imageUrl?: string | null;
  estGratuit?: boolean;
  createdAt?: string;
};

interface Props {
  formationId?: string;
}

export default function Liste_Module({ formationId }: Props) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editModuleId, setEditModuleId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    id: string;
    titre: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);

      const response: any = formationId
        ? await moduleService.list(formationId)
        : await moduleService.list();

      const modulesData: Module[] = (
        Array.isArray(response?.data) ? response.data : []
      ).map((item: any) => ({
        id: item.props?.id ?? item.id ?? "",
        titre: item.props?.titre ?? item.titre ?? "",
        description: item.props?.description ?? item.description ?? null,
        ordre: item.props?.ordre ?? item.ordre ?? 0,
        duree: item.props?.duree ?? item.duree ?? 0,
        image: item.props?.image || item.props?.imageUrl || item.image || null,
        estGratuit: item.props?.estGratuit ?? item.estGratuit ?? false,
        createdAt: item.props?.createdAt ?? item.createdAt,
      }));

      setModules(modulesData);
    } catch (err: any) {
      setError(err.message || "Impossible de charger les modules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [formationId]);

  const handleDelete = async () => {
    if (!deleteModal?.id) return;
    try {
      setDeleting(true);
      await moduleService.delete(deleteModal.id);
      setDeleteModal(null);
      await fetchModules();
    } catch (err: any) {
      console.error("Erreur suppression module :", err);
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/mentor/sections/PublicationFormation"
          className="flex items-center gap-2 text-gray-600 hover:text-black"
        >
          <ArrowLeft size={18} />
          Retour aux formations
        </Link>

        <Link
          href="/mentor/sections/PublicationFormation/Module/create"
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} />
          Ajouter un module
        </Link>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 size={28} className="animate-spin text-emerald-700" />
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-red-500">
          {error}
        </div>
      )}

      {/* LISTE */}
      <div className="space-y-4">
        {modules.map((mod) => {
          const imageSrc = mod.image || mod.imageUrl || null;

          return (
            <div
              key={mod.id}
              className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <BookOpen size={18} className="text-emerald-700" />
                    {mod.ordre}. {mod.titre}
                  </h2>

                  {mod.description && (
                    <p className="mt-2 text-gray-600">{mod.description}</p>
                  )}

                  <p className="mt-3 text-sm text-gray-500">
                    Durée estimée :
                    <span className="ml-1 font-medium">{mod.duree} min</span>
                  </p>

                  {mod.estGratuit && (
                    <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                      Module gratuit
                    </span>
                  )}
                </div>

                {/* IMAGE */}
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={mod.titre}
                    className="h-24 w-24 rounded-xl border object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl border bg-gray-100 text-xs text-gray-400">
                    Pas d'image
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                <Link
                  href={`/mentor/sections/PublicationFormation/Module/${mod.id}/cours`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition"
                >
                  <Plus size={14} />
                  Ajouter cours
                </Link>

                <button
                  onClick={() => setEditModuleId(mod.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
                >
                  <Pencil size={14} />
                  Modifier
                </button>

                <button
                  onClick={() =>
                    setDeleteModal({ id: mod.id, titre: mod.titre })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 size={14} />
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY */}
      {!loading && modules.length === 0 && !error && (
        <div className="py-16 text-center text-gray-500">
          <BookOpen size={48} className="mx-auto mb-4 opacity-40" />
          <p>Aucun module trouvé pour le moment</p>
        </div>
      )}

      {/* MODALE MODIFICATION - CORRECTED */}
      {editModuleId && (
        <ModifierModule
          moduleId={editModuleId}
          onClose={() => setEditModuleId(null)}
          onSuccess={() => {
            setEditModuleId(null);
            fetchModules();
          }}
        />
      )}

      {/* MODALE SUPPRESSION */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">
                  Supprimer le module
                </p>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                  Cette action est irréversible et supprimera tous les cours
                  associés.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg px-3 py-2.5 mb-4 border border-slate-100">
              <p className="text-[11px] text-slate-400 mb-0.5">
                Module concerné
              </p>
              <p className="text-xs font-medium text-slate-800 truncate">
                {deleteModal.titre}
              </p>
            </div>

            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
                className="px-4 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-1.5 text-xs bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                    Suppression…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer définitivement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
