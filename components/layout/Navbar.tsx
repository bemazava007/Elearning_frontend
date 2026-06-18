"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  if (!isAdminRoute) return null;

  const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Formations", href: "/formations" },
    { name: "Dashboard", href: "/apprenant" },
  ];

  return (
    <>
      {/* Overlay pour mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR NAVBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Header de la Sidebar / Logo de la Plateforme */}
          <div className="relative flex h-16 items-center px-6">
            <div className="relative mx-auto h-30 w-30 mt-2.5">
              <Image
                src="/images/teach.png"
                alt="Teach"
                fill
                sizes="128px"
                className="object-contain object-left"
                priority
              />
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Fermer la navigation"
              title="Fermer la navigation"
              className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Principale */}
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Bouton Menu Mobile (visible lg:hidden) */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Ouvrir la navigation"
        title="Ouvrir la navigation"
        className="fixed bottom-6 right-6 lg:hidden z-30 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
}
