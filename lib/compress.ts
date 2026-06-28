interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.8,
    maxSizeKB = 500,
  } = options;

  if (file.size <= maxSizeKB * 1024) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      let currentQuality = quality;
      const compress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Compression failed"));
              return;
            }

            if (blob.size <= maxSizeKB * 1024 || currentQuality <= 0.3) {
              resolve(blob);
            } else {
              currentQuality -= 0.1;
              compress();
            }
          },
          "image/jpeg",
          currentQuality
        );
      };

      compress();
    };

    img.onerror = () => reject(new Error("Image load failed"));
    img.src = URL.createObjectURL(file);
  });
}

export function useUpload() {
  const upload = async (file: File, type: "image" | "file" | "voice" = "image") => {
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

    const formData = new FormData();
    formData.append(
      "file",
      new File([blob], file.name, { type: file.type })
    );

    const token = localStorage.getItem("chat_token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/upload`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );

    return res.json();
  };

  return { upload };
}
