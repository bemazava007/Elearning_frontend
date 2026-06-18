"use client";

import { useState, useEffect } from "react";
import { Eye, Shield, X } from "lucide-react";
import { createPortal } from "react-dom";

interface SecurePDFViewerProps {
  url: string;
  title: string;
  isModal?: boolean;
  onClose?: () => void;
}

export default function SecurePDFViewer({
  url,
  title,
  isModal = false,
  onClose,
}: SecurePDFViewerProps) {
  const [loading, setLoading] = useState(true);

  const displayUrl =
    `${url.split("?")[0]}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;

  useEffect(() => {
    const blockKeyboardShortcuts = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Ctrl + S
      if ((e.ctrlKey || e.metaKey) && key === "s") {
        e.preventDefault();
        return false;
      }

      // Ctrl + P
      if ((e.ctrlKey || e.metaKey) && key === "p") {
        e.preventDefault();
        return false;
      }

      // Ctrl + U
      if ((e.ctrlKey || e.metaKey) && key === "u") {
        e.preventDefault();
        return false;
      }

      // Ctrl + Shift + I
      if (
        (e.ctrlKey && e.shiftKey && key === "i") ||
        (e.ctrlKey && e.shiftKey && key === "j") ||
        (e.ctrlKey && e.shiftKey && key === "c")
      ) {
        e.preventDefault();
        return false;
      }

      // F12
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }
    };

    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const blockCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const blockDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const blockSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener("keydown", blockKeyboardShortcuts);
    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("dragstart", blockDrag);
    document.addEventListener("selectstart", blockSelectStart);

    return () => {
      document.removeEventListener("keydown", blockKeyboardShortcuts);
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("dragstart", blockDrag);
      document.removeEventListener("selectstart", blockSelectStart);
    };
  }, []);

  // ==========================
  // MODE MODAL
  // ==========================

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div
          className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
          style={{
            height: "90vh",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <div className="flex items-center gap-2">
              <Shield size={16} />
              <span className="text-sm font-semibold">
                Document sécurisé
              </span>
              <span className="text-xs opacity-80">
                • {title}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* PDF */}
          <div
            className="flex-1 overflow-auto bg-gray-100 select-none"
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500">
                    Chargement du document...
                  </p>
                </div>
              </div>
            )}

            <iframe
              src={displayUrl}
              title={title}
              className="w-full h-full border-0"
              style={{
                minHeight: "100%",
              }}
              onLoad={() => setLoading(false)}
            />
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-100 border-t text-center">
            <p className="text-[11px] text-gray-500 flex items-center justify-center gap-2">
              <span>🔒</span>
              Document sécurisé - Téléchargement et impression désactivés
              <span>🔒</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================
  // MODE BOUTON
  // ==========================

  const [showModal, setShowModal] = useState(false);

  if (showModal) {
    return createPortal(
      <SecurePDFViewer
        url={url}
        title={title}
        isModal={true}
        onClose={() => setShowModal(false)}
      />,
      document.body
    );
  }

  return (
    <button
      onClick={() => setShowModal(true)}
      className="mt-2 w-full py-2.5 bg-gradient-to-r from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-emerald-200 shadow-sm"
    >
      <Eye size={14} />
      Lire le document
      <Shield
        size={10}
        className="text-emerald-500"
      />
    </button>
  );
}