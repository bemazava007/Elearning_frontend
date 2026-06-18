export type Section = "stats" | "chat" | "calendar" | "courses" | "responses";

export interface Learner {
  id: string;
  name: string;
  status: "Actif" | "En attente";
}

export interface Module {
  /* ... ton interface Module */
}
export interface Course {
  /* ... */
}
export interface QuestionAnswer {
  /* ... */
}
export interface ModuleExerciseResponse {
  /* ... */
}
export interface CourseProgress {
  /* ... */
}
export interface StudentProgressMap {
  /* ... */
}

// Ajoute les autres interfaces ici...
export interface Module {
  id: string;
  title: string;
  type: "Vidéo" | "PDF";
  fileName: string;
  isPublished: boolean;
}

export interface Course {
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
