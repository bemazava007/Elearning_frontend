import Link from "next/link";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0B132B] text-slate-400 border-t border-slate-800 px-6 md:px-12 py-12 text-sm">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
        {/* Colonne Description */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-white text-lg tracking-tight uppercase">
            TEACH <span className="text-blue-500">Platform</span>
          </h3>
          <p className="leading-relaxed text-slate-400 text-xs md:text-sm max-w-sm">
            Plateforme E-learning innovante dédiée au freelancing et à
            l&apos;entrepreneuriat digital. Développez vos compétences dès
            aujourd&apos;hui.
          </p>
        </div>

        {/* Colonne Liens Utiles */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-white mb-4 text-xs tracking-wider uppercase opacity-80">
              Liens
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm">
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Formations
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-xs tracking-wider uppercase opacity-80">
              Légal
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Colonne Contact */}
        <div className="space-y-4">
          <h4 className="font-bold text-white text-xs tracking-wider uppercase opacity-80">
            Contact
          </h4>
          <a
            href="mailto:support@teach.com"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-xl text-xs font-medium text-blue-400 hover:bg-slate-800 hover:text-blue-300 transition-all cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            support@teach.com
          </a>
        </div>
      </div>

      {/* Bas du Footer */}
      <div className="text-center mt-12 pt-8 border-t border-slate-800/80 text-[10px] md:text-xs font-medium tracking-widest uppercase text-slate-500">
        © 2026 Teach Platform • Tous droits réservés
      </div>
    </footer>
  );
}
