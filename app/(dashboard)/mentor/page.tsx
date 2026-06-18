"use client";

import { useState } from "react";
import Sidebar from "../../../components/layout/Sidebar";
import PublicationFormation from "./sections/PublicationFormation/Formation/Ajout_PublicationFormation";
import AffichagePublicationFormation from "./sections/PublicationFormation/Formation/Affichage_PublicationFormation";
import { Section } from "./types";

interface Module {
  id: string;
  title: string;
  type: "Vidéo" | "PDF";
  fileName: string;
  isPublished: boolean;
}

interface Course {
  id: string;
  title: string;
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

export default function MentorDashboard() {
  const [activeSection, setActiveSection] = useState<Section>("courses");

  const [courses, setCourses] = useState<Course[]>([]);
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main className="flex-1 p-6">
        {activeSection === "courses" && (
          <PublicationFormation courses={courses} setCourses={setCourses} />
        )}

        {/* 👇 Affichage séparé (ou dans Publication si tu préfères) */}
      </main>
    </div>
  );
}
