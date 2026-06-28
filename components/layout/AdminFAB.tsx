"use client";

import { useState } from "react";
import { Plus, X, UserPlus, KeyRound } from "lucide-react";
import Link from "next/link";

export function AdminFAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {isOpen && (
        <div className="absolute bottom-14 right-0 space-y-2 animate-slide-up">
          <Link
            href="/papan-skor/pengaturan/"
            className="flex items-center gap-2 bg-surface border border-surface-light rounded-xl px-4 py-3 text-sm text-text shadow-lg"
          >
            <KeyRound className="w-4 h-4 text-primary" />
            Reset Kode
          </Link>
          <button
            onClick={() => {
              alert("Fitur tambah kontak akan dibuka");
            }}
            className="flex items-center gap-2 bg-surface border border-surface-light rounded-xl px-4 py-3 text-sm text-text shadow-lg"
          >
            <UserPlus className="w-4 h-4 text-success" />
            Tambah Kontak
          </button>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </button>
    </div>
  );
}
