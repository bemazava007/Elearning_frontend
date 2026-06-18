"use client";

import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Calendar,
  LineChart,
  User,
} from "lucide-react";

type Section = "dashboard" | "formations" | "chat" | "calendar" | "progression";

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function SidebarLink({ icon, label, active, onClick }: SidebarLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
        active
          ? "bg-emerald-900 text-white shadow-md shadow-emerald-950/20"
          : "text-emerald-700 hover:bg-emerald-50 text-emerald-950"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface ApprenantSidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
}

export default function ApprenantSidebar({
  activeSection,
  setActiveSection,
}: ApprenantSidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-emerald-100 flex flex-col shadow-sm">
      <div className="p-6 border-b border-emerald-50">
        <div className="flex items-center gap-2.5 text-emerald-600 font-extrabold text-xl tracking-tight">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-200">
            A
          </div>
          <span>Espace Apprenant</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        <SidebarLink
          icon={<LayoutDashboard size={19} />}
          label="Tableau de bord"
          active={activeSection === "dashboard"}
          onClick={() => setActiveSection("dashboard")}
        />
        <SidebarLink
          icon={<BookOpen size={19} />}
          label="Mes formations"
          active={activeSection === "formations"}
          onClick={() => setActiveSection("formations")}
        />
        <SidebarLink
          icon={<MessageSquare size={19} />}
          label="Messagerie"
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
          icon={<LineChart size={19} />}
          label="Ma progression"
          active={activeSection === "progression"}
          onClick={() => setActiveSection("progression")}
        />
      </nav>

      <div className="p-4 border-t border-emerald-50 bg-emerald-50/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-sm">
            JD
          </div>
          <div>
            <p className="font-bold text-sm text-emerald-900">Jean Dupont</p>
            <p className="text-xs text-teal-600 font-medium">Apprenant</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
