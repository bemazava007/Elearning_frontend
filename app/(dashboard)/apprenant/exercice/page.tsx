"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileText,
  HelpCircle,
  Hourglass,
} from "lucide-react";

// --- TYPES ---
interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

// --- DONNÉES SIMULÉES DE L'EXAMEN (LIÉ AU MODULE FINAL) ---
const EXERCISE_QUESTIONS: Question[] = [
  {
    id: 1,
    questionText:
      "Quelle est la première étape indispensable avant de concevoir un produit ou service ?",
    options: [
      "Créer un logo et une charte graphique professionnelle",
      "Valider le besoin et le problème réel auprès du marché cible",
      "Louer des bureaux et recruter une équipe technique",
      "Établir un plan de communication sur les réseaux sociaux",
    ],
    correctAnswerIndex: 1,
  },
  {
    id: 2,
    questionText: "Qu'est-ce qu'un MVP dans le jargon entrepreneurial ?",
    options: [
      "Le client le plus rentable (Most Valuable Person)",
      "Une stratégie de publicité à fort budget",
      "Une version minimale viable du produit pour tester le marché rapidement",
      "Le statut juridique d'une jeune entreprise",
    ],
    correctAnswerIndex: 2,
  },
  {
    id: 3,
    questionText:
      "Pourquoi la peur du rejet pousse-t-elle souvent les débutants à faire une erreur sur les tarifs ?",
    options: [
      "Ils fixent des prix trop élevés",
      "Ils sous-évaluent leurs prix, ce qui dégrade la valeur perçue",
      "Ils refusent d'afficher publiquement leurs tarifs",
      "Ils proposent uniquement des produits gratuits",
    ],
    correctAnswerIndex: 1,
  },
];

export default function ExercicePage() {
  // --- ÉTATS ---
  const [hasReadModule, setHasReadModule] = useState<boolean | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Chronomètre : 5 minutes (300 secondes)
  const [timeLeft, setTimeLeft] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(true);

  // --- EFFETS ---
  useEffect(() => {
    const checkModuleValidation = () => {
      const validated =
        localStorage.getItem("last_module_read_validated") || "true";
      setHasReadModule(validated === "true");
    };
    checkModuleValidation();
  }, []);

  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerActive, isSubmitted]);

  // --- ACTIONS ---
  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex,
    });
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    setIsTimerActive(false);
    // Ici, vous pouvez ajouter l'appel API pour envoyer `selectedAnswers` au backend pour le mentor
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- SÉCURITÉ : BLOCAGE SI LE MODULE N'EST PAS LU ---
  if (hasReadModule === false) {
    return (
      <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl p-6 border border-slate-200 shadow-xl text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 mb-2">
            Accès Restreint
          </h2>
          <p className="text-slate-500 text-xs leading-relaxed mb-6">
            Vous ne pouvez pas passer cet examen sans avoir lu attentivement le
            contenu du module et regardé les supports pédagogiques associés.
          </p>
          <Link
            href="/apprenant/formations"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Retourner au module
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = EXERCISE_QUESTIONS[currentQuestionIndex];
  const totalQuestions = EXERCISE_QUESTIONS.length;
  const isQuestionAnswered =
    selectedAnswers[currentQuestionIndex] !== undefined;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-12">
      {/* HEADER DE L'EXERCICE */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center border border-cyan-100">
              <FileText className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800">
                Évaluation Continue
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">
                Les fondamentaux de l'entrepreneuriat
              </p>
            </div>
          </div>

          {/* CHRONOMÈTRE */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all ${
              timeLeft < 60 && !isSubmitted
                ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <Clock
              className={`w-4 h-4 ${timeLeft < 60 && !isSubmitted ? "text-rose-500" : "text-slate-400"}`}
            />
            <span>{isSubmitted ? "Terminé" : formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-8">
        {!isSubmitted ? (
          /* --- ZONE DE JEU : EN COURS DE RÉPONSE --- */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Barre de Progression */}
            <div className="h-1 bg-slate-100">
              <div
                className="h-full bg-cyan-500 transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                }}
              />
            </div>

            <div className="p-6">
              {/* Entête de Question */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-md">
                  Question {currentQuestionIndex + 1} sur {totalQuestions}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Choix unique
                </span>
              </div>

              {/* Texte de la Question */}
              <h2 className="text-base font-bold text-slate-800 leading-snug mb-6">
                {currentQuestion.questionText}
              </h2>

              {/* Options de réponses */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected =
                    selectedAnswers[currentQuestionIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-4 rounded-xl border text-xs font-medium transition-all flex items-start gap-3 group ${
                        isSelected
                          ? "bg-cyan-50/70 border-cyan-500 text-cyan-900 shadow-2xs"
                          : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] border transition-all ${
                          isSelected
                            ? "bg-cyan-600 border-cyan-600 text-white"
                            : "bg-white border-slate-300 text-slate-400 group-hover:border-slate-400"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="pt-0.5">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() =>
                  setCurrentQuestionIndex(currentQuestionIndex - 1)
                }
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Précédent
              </button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  disabled={!isQuestionAnswered}
                  onClick={() =>
                    setCurrentQuestionIndex(currentQuestionIndex + 1)
                  }
                  className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Suivant <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  disabled={
                    Object.keys(selectedAnswers).length < totalQuestions
                  }
                  onClick={handleSubmitQuiz}
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" /> Soumettre mes réponses
                </button>
              )}
            </div>
          </div>
        ) : (
          /* --- ÉCRAN DE SUCCÈS : EN ATTENTE DE CORRECTION PAR LE MENTOR --- */
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl text-center max-w-xl mx-auto">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">
              Exercice envoyé avec succès !
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Vos réponses ont été bien enregistrées et transmises à votre
              mentor. Vous recevrez une notification dès que la correction et le
              score seront disponibles.
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <Hourglass
                  className="w-5 h-5 text-amber-500 animate-spin"
                  style={{ animationDuration: "3s" }}
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700">
                  Statut de l'exercice
                </h4>
                <p className="text-[11px] text-slate-400">
                  En attente de correction par le mentor
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Link
                href="/apprenant/formations"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-6 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Retourner aux formations
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
