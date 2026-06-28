"use client";

import { useEffect, useState } from "react";
import { Note } from "@/types";
import { getNotes } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { FileText, Tag, Loader2 } from "lucide-react";

export function NoteList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const data = await getNotes();
      setNotes(data.notes);
    } catch (e) {
      console.error("Failed to load notes:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto chat-scrollbar p-4 space-y-3">
      {notes.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-text-muted mx-auto mb-2" />
          <p className="text-text-muted">Belum ada catatan</p>
        </div>
      ) : (
        notes.map((note) => (
          <div key={note.id} className="card space-y-2">
            <h3 className="text-sm font-semibold text-text">{note.title}</h3>
            <p className="text-xs text-text-muted line-clamp-3">{note.content}</p>
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {note.tags.map((tag) => (
                  <span key={tag} className="badge-primary text-[10px]">
                    <Tag className="w-2 h-2 inline mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-[10px] text-text-muted">{formatDateTime(note.createdAt)}</p>
          </div>
        ))
      )}
    </div>
  );
}
