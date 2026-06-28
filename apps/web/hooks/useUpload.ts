"use client";
import { useState, useCallback } from "react";
import { apiRequest } from "../lib/utils";
import { compressImage } from "../lib/compress";

interface UploadResult {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
}

export function useUpload(token: string) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = useCallback(async (
        file: File,
        type: "image" | "file" | "voice"
    ): Promise<UploadResult | null> => {
        setIsUploading(true);
        setError(null);

        try {
            if (file.size > 10 * 1024 * 1024) throw new Error("File terlalu besar (max 10MB)");

            let blob: Blob = file;
            if (type === "image" && file.type.startsWith("image/")) {
                blob = await compressImage(file, { maxSizeKB: 500 });
            }

            if (blob.size > 500 * 1024) throw new Error("Gagal kompress (max 500KB)");

            const formData = new FormData();
            formData.append("file", new File([blob], file.name, { type: file.type }));

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Upload gagal");
            }

            return await res.json();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Upload gagal");
            return null;
        } finally {
            setIsUploading(false);
        }
    }, [token]);

    return { upload, isUploading, error };
}
