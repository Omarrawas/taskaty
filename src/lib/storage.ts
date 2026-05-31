// Compress image before upload
async function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = (height / width) * maxWidth;
            width = maxWidth;
          } else {
            width = (width / height) * maxWidth;
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to compress image"));
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// Convert file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Upload file using free hosting
export async function uploadChatFile(
  file: File,
  _conversationId: string,
  _userId: string
): Promise<{ url: string; name: string; type: string }> {
  // Validate file size (max 5MB for free hosting)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("حجم الملف يجب أن يكون أقل من 5 ميغابايت");
  }

  // For images, compress and use base64 (stored in Firestore)
  if (file.type.startsWith("image/")) {
    try {
      const compressed = await compressImage(file);
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(compressed);
      });

      return {
        url: base64,
        name: file.name,
        type: file.type,
      };
    } catch (err) {
      // Fallback to original base64
      const base64 = await fileToBase64(file);
      return {
        url: base64,
        name: file.name,
        type: file.type,
      };
    }
  }

  // For non-image files, use base64
  const base64 = await fileToBase64(file);
  return {
    url: base64,
    name: file.name,
    type: file.type,
  };
}

// Get file icon based on type
export function getFileIcon(type: string): string {
  if (type.startsWith("image/")) return "🖼️";
  if (type.includes("pdf")) return "📄";
  if (type.includes("word") || type.includes("document")) return "📝";
  if (type.includes("zip") || type.includes("rar")) return "📦";
  if (type.includes("video")) return "🎬";
  if (type.includes("audio")) return "🎵";
  return "📎";
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Category to default image mapping
const CATEGORY_IMAGES: Record<string, string> = {
  design: "/images/design.jpg",
  programming: "/images/programming.jpg",
  translation: "/images/translation.jpg",
  marketing: "/images/service-4.jpg",
  video: "/images/video.jpg",
  business: "/images/business.jpg",
  education: "/images/education.jpg",
  support: "/images/support.jpg",
};

const DEFAULT_FALLBACK = "/images/design.jpg";

export function getServiceImage(
  images: string[] | null | undefined,
  categorySlug?: string
): string {
  if (images && images.length > 0 && images[0]) return images[0];
  if (categorySlug && CATEGORY_IMAGES[categorySlug]) {
    return CATEGORY_IMAGES[categorySlug];
  }
  return DEFAULT_FALLBACK;
}

// Compress and convert service image to base64
export async function uploadServiceImage(file: File): Promise<string> {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("حجم الصورة يجب أن يكون أقل من 5 ميغابايت");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("يجب أن تكون الصورة بتنسيق صورة");
  }

  try {
    const compressed = await compressImage(file, 800, 0.75);
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(compressed);
    });
    return base64;
  } catch {
    const base64 = await fileToBase64(file);
    return base64;
  }
}
