"use client";

import { useSearchParams } from "next/navigation";
import AffichageCours from "./components/AffichageCours";

export default function Page() {
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("moduleId") || "";

  return (
    <AffichageCours
      moduleId={moduleId}
      moduleTitre="Gestion des cours"
      onAddCours={() => {}}
      onEditCours={() => {}}
      onDeleteCours={() => {}}
    />
  );
}
