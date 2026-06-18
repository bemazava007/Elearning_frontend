// E:\Teach-platform\frontend\components\layout\Sidebar.tsx
"use client";

import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  BookOpen,
  FileText,
} from "lucide-react";
import { Section } from "../../app/(dashboard)/mentor/types";

type SidebarLinkProps = {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
};

function SidebarLink({ icon, label, active, onClick }: SidebarLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
        active
          ? "bg-cyan-900 text-white shadow-md shadow-cyan-950/20"
          : "text-cyan-700 hover:bg-cyan-50 text-cyan-950"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface SidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
}

export default function Sidebar({
  activeSection,
  setActiveSection,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-cyan-100 flex flex-col shadow-sm">
      <div className="p-6 border-b border-cyan-50">
        <div className="flex items-center gap-2.5 text-emerald-600 font-extrabold text-xl tracking-tight">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-cyan-200">
            M
          </div>
          <span>Espace Mentor</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        <SidebarLink
          icon={<LayoutDashboard size={19} />}
          label="Vue d'ensemble"
          active={activeSection === "stats"}
          onClick={() => setActiveSection("stats")}
        />
        <SidebarLink
          icon={<FileText size={19} />}
          label="Suivi des Réponses"
          active={activeSection === "responses"}
          onClick={() => setActiveSection("responses")}
        />
        <SidebarLink
          icon={<MessageSquare size={19} />}
          label="Chat Apprenants"
          active={activeSection === "chat"}
          onClick={() => setActiveSection("chat")}
        />
        <SidebarLink
          icon={<Calendar size={19} />}
          label="Rendez-vous & Lives"
          active={activeSection === "calendar"}
          onClick={() => setActiveSection("calendar")}
        />
        <SidebarLink
          icon={<BookOpen size={19} />}
          label="Publier Formations"
          active={activeSection === "courses"}
          onClick={() => setActiveSection("courses")}
        />
      </nav>

      <div className="p-4 border-t border-cyan-50 bg-cyan-50/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white flex items-center justify-center font-bold text-sm">
            AR
          </div>
          <div>
            <p className="font-bold text-sm text-cyan-900">Adeline Mentor</p>
            <p className="text-xs text-emerald-600 font-medium">
              Formatrice Principale
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
