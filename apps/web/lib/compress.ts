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
    const { maxWidth = 1280, maxHeight = 1280, quality = 0.8, maxSizeKB = 500 } = options;
    if (file.size <= maxSizeKB * 1024) return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        img.onload = () => {
            let { width, height } = img;
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(img.src);

            let currentQuality = quality;
            const compress = () => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) { reject(new Error("Compression failed")); return; }
                        if (blob.size <= maxSizeKB * 1024 || currentQuality <= 0.3) {
                            resolve(blob);
                        } else {
                            currentQuality = Math.max(0.3, currentQuality - 0.1);
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
