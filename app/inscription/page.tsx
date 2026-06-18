"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Award,
  Briefcase,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  UserCircle,
} from "lucide-react";

// ─── Types ─────────────────────────────────────
type Volet = "BUSINESS" | "FREELANCE";

interface FormData {
  prenom: string;
  nom: string;
  email: string;
  volet: Volet;
  password: string;
  dateNaissance: string;
  telephone: string;
  adresse: string;
}

interface RegisterPayload extends FormData {
  dateNaissance: string;
  cin: string;
  adresse: string;
  pseudo: string;
  telephone: string;
}

// ─── API ─────────────────────────────────────

async function registerUser(apiBaseUrl: string, data: RegisterPayload) {
  console.log("Données envoyées :", JSON.stringify(data, null, 2));

  try {
    const res = await fetch(`${apiBaseUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json().catch(() => null);

    // LOG DU RESULTAT BACKEND
    console.log("Réponse API register :", result);

    if (!res.ok) {
      const errorMessage = result?.message || "Erreur serveur";
      console.log("❌ Erreur API :", result);
      throw new Error(errorMessage);
    }

    console.log("Inscription réussie :", result);

    return result;
  } catch (error) {
    console.log("Erreur fetch :", error);
    throw error;
  }
}
// ─── PAGE ─────────────────────────────────────

export default function InscriptionPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    prenom: "",
    nom: "",
    email: "",
    volet: "BUSINESS",
    password: "",
    dateNaissance: "2000-01-01",
    telephone: "",
    adresse: "",
  });

  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/['"]/g, "").trim();

  const buildCin = (email: string) => {
    const normalizedEmail = email.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    return `TEMP${normalizedEmail.slice(0, 12)}${Date.now().toString().slice(-4)}`;
  };
  const update =
    <K extends keyof FormData>(field: K) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setFormData((current) => ({
        ...current,
        [field]: value,
      }));
    };

  const setVolet = (volet: Volet) => {
    setFormData((current) => ({
      ...current,
      volet,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitError(null);

    const payload: RegisterPayload = {
      ...formData,
      cin: buildCin(formData.email),
      pseudo: formData.email.split("@")[0],
    };

    try {
      const result = await registerUser(apiBaseUrl, payload);

      toast.success(result?.message ?? "Inscription réussie");
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur serveur";

      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center font-sans">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/fond6.jpg"
          alt="Background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 h-full flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-5xl max-h-fit bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col lg:flex-row">
          <div className="lg:w-5/12 bg-white/5 backdrop-blur-2xl p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 shrink-0">
            <div className="justify-items-center">
              <Image
                src="/images/teach.png"
                alt="Teach Logo"
                width={170}
                height={60}
                className="brightness-125 mb-2"
                priority
              />

              <h2 className="text-4xl lg:text-4xl font-light leading-tight text-white tracking-tighter mb-2">
                Rejoignez <span className="font-semibold text-[#14b8a6]">Teach</span>
              </h2>
              <p className="text-gray-300 text-sm lg:text-base leading-relaxed max-w-xs">
                L{"'"}accélérateur de compétences pour la nouvelle génération
                d{"'"}entrepreneurs à Madagascar.
              </p>
            </div>

            <div className="space-y-4 mt-8 hidden sm:block">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="w-10 h-10 rounded-xl bg-[#14b8a6]/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-[#14b8a6]" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wider text-white font-medium">
                    Qualité
                  </p>

                  <p className="text-xs text-gray-300">Formations certifiées</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="w-10 h-10 rounded-xl bg-[#14b8a6]/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-[#14b8a6]" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wider text-white font-medium">
                    Expertise
                  </p>

                  <p className="text-xs text-gray-300">Certificats reconnus</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-7/12 p-6 lg:p-8 flex flex-col justify-center">
            <div className="mb-4">
              <h2 className="text-2xl lg:text-3xl font-semibold text-white">
                Créer un compte
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Commencez votre parcours dès aujourd{"'"}hui
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs tracking-[0.2em] text-gray-300 ml-1">
                    Prénom
                  </label>
                  <div className="relative group">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#14b8a6] transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Prénom"
                      required
                      value={formData.prenom}
                      onChange={update("prenom")}
                      className="w-full rounded-2xl border border-white/15 bg-white/10 pl-11 py-3 text-sm text-white placeholder:text-gray-400 outline-none transition-all focus:border-[#14b8a6]/60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs tracking-[0.2em] text-gray-300 ml-1">
                    Nom
                  </label>
                  <div className="relative group">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#14b8a6] transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Nom"
                      required
                      value={formData.nom}
                      onChange={update("nom")}
                      className="w-full rounded-2xl border border-white/15 bg-white/10 pl-11 py-3 text-sm text-white placeholder:text-gray-400 outline-none transition-all focus:border-[#14b8a6]/60"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs tracking-[0.2em] text-gray-300 ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#14b8a6] transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="vous@exemple.com"
                    required
                    value={formData.email}
                    onChange={update("email")}
                    className="w-full rounded-2xl border border-white/15 bg-white/10 pl-11 py-3 text-sm text-white placeholder:text-gray-400 outline-none transition-all focus:border-[#14b8a6]/60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs tracking-[0.2em] text-gray-300 ml-1">
                  Volet
                </label>
                <div className="flex rounded-2xl border border-white/10 bg-black/20 p-1">
                  <button
                    type="button"
                    onClick={() => setVolet("BUSINESS")}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
                      formData.volet === "BUSINESS"
                        ? "bg-[#14b8a6] text-white shadow-lg shadow-teal-500/20"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Briefcase size={14} />
                    Business
                  </button>
                  <button
                    type="button"
                    onClick={() => setVolet("FREELANCE")}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
                      formData.volet === "FREELANCE"
                        ? "bg-[#14b8a6] text-white shadow-lg shadow-teal-500/20"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <UserCircle size={14} />
                    Freelance
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs tracking-[0.2em] text-gray-300 ml-1">
                    Téléphone
                  </label>
                  <div className="relative group">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#14b8a6] transition-colors"
                    />
                    <input
                      type="tel"
                      placeholder="+261 32 XX XX XX"
                      value={formData.telephone}
                      onChange={update("telephone")}
                      className="w-full rounded-2xl border border-white/15 bg-white/10 pl-11 py-3 text-sm text-white placeholder:text-gray-400 outline-none transition-all focus:border-[#14b8a6]/60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs tracking-[0.2em] text-gray-300 ml-1">
                    Adresse
                  </label>
                  <div className="relative group">
                    <MapPin
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#14b8a6] transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Votre adresse"
                      value={formData.adresse}
                      onChange={update("adresse")}
                      className="w-full rounded-2xl border border-white/15 bg-white/10 pl-11 py-3 text-sm text-white placeholder:text-gray-400 outline-none transition-all focus:border-[#14b8a6]/60"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs tracking-[0.2em] text-gray-300 ml-1">
                  Mot de passe
                </label>
                <div className="relative group">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#14b8a6] transition-colors"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={update("password")}
                    className="w-full rounded-2xl border border-white/15 bg-white/10 pl-11 pr-12 py-3 text-sm text-white placeholder:text-gray-400 outline-none transition-all focus:border-[#14b8a6]/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 h-12 w-full rounded-2xl bg-[#14b8a6] text-xs font-bold tracking-widest text-white shadow-xl shadow-teal-900/20 transition-all hover:bg-[#11d8c3] active:scale-[0.98] disabled:opacity-70"
              >
                {isSubmitting ? "Création en cours..." : "Créer mon compte"}
              </button>

            </form>

            <p className="mt-6 text-center text-sm tracking-wide text-gray-300">
              Déjà membre ?
              <Link
                href="/login"
                className="ml-1 font-bold text-[#14b8a6] transition-colors hover:text-white"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>

      <p className="absolute bottom-4 left-8 z-20 text-[11.5px] text-[#1a3a30]/50">
        © 2026 Teach. Tous droits réservés.
      </p>
    </div>
  );
}
