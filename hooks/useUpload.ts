"use client";

import { useState, useCallback } from "react";
import { compressImage } from "@/lib/compress";
import { uploadFile } from "@/lib/api";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "audio/webm",
  "audio/ogg",
];

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(
    async (file: File, type: "image" | "file" | "voice" = "image") => {
      // Validate mime type
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(
          `Tipe file tidak didukung. Format yang diizinkan: ${ALLOWED_TYPES.map((t) => t.split("/")[1]).join(", ")}`
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File terlalu besar (max 10MB)");
      }

      let blob: Blob = file;

      if (type === "image" && file.type.startsWith("image/")) {
        blob = await compressImage(file, { maxSizeKB: 500 });
      }

      if (blob.size > 500 * 1024) {
        throw new Error("Gagal kompress (max 500KB setelah kompress)");
      }

      const compressedFile = new File([blob], file.name, {
        type: file.type,
      });

      setIsUploading(true);
      setProgress(50);

      try {
        const result = await uploadFile(compressedFile);
        setProgress(100);
        return result;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  return { upload, isUploading, progress };
}
