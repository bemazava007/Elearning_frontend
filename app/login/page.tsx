"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const loginResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        },
      );

      const loginPayload = await loginResponse.json().catch(() => null);

      if (!loginResponse.ok) {
        throw new Error(
          loginPayload?.error ?? "Email ou mot de passe invalide.",
        );
      }

      const profileResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/me`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const profilePayload = await profileResponse.json().catch(() => null);

      if (!profileResponse.ok) {
        throw new Error(
          profilePayload?.error ??
            "Connexion réussie, mais profil inaccessible.",
        );
      }

      const role = profilePayload?.role;

      toast.success("Connexion réussie");

      if (role === "ADMIN") {
        router.push("/admin");
        return;
      }

      if (role === "MENTOR" || role === "PEDAGOGIQUE" || role === "FORMATEUR") {
        router.push("/mentor");
        return;
      }

      router.push("/apprenant/formations");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Une erreur est survenue.";

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden font-sans antialiased bg-[#05070f]">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/Fond6.jpg"
          alt="Background"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-br from-[#05070f]/20 via-[#05070f]/10 to-[#05070f]/20" />
      </div>

      <main className="relative z-10 flex h-full items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 p-4 lg:p-8">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-3xl sm:p-8">
          <div className="mb-6 text-center">
            <div className="relative mx-auto mb-1 h-28 w-28 drop-shadow-[0_16px_24px_rgba(30,64,175,0.24)]">
              <Image
                src="/images/teach.png"
                alt="Teach"
                fill
                sizes="(max-width: 768px) 112px, 112px"
                className="object-contain"
                priority
              />
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Se connecter
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Entrez vos identifiants pour accéder à votre espace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold tracking-[0.24em] text-gray-400"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="h-12 rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 text-white placeholder:text-gray-400 shadow-sm transition focus-visible:ring-2 focus-visible:ring-[#14b8a6]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold tracking-[0.24em] text-gray-400"
                >
                  Mot de passe
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-2xl border border-white/10 bg-white/5 pl-10 pr-11 text-white shadow-sm transition focus-visible:ring-2 focus-visible:ring-[#14b8a6]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium text-gray-300"
              >
                Se souvenir de moi
              </label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#14b8a6] hover:bg-[#11d8c3] text-white font-bold rounded-2xl text-xs tracking-widest transition-all active:scale-[0.98] mt-4 shadow-xl shadow-teal-900/20 disabled:opacity-70"
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-300">
            Pas encore de compte ?{" "}
            <Link
              href="/inscription"
              className="font-semibold text-[#14b8a6] transition hover:underline"
            >
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
