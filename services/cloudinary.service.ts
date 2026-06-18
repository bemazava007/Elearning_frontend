// E:\Teach-platform\frontend\services/cloudinary.service.ts
export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
  duration?: number;
}

export interface UploadOptions {
  folder?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
  onProgress?: (percent: number) => void;
}

class CloudinaryService {
  private readonly CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  private readonly UPLOAD_PRESET =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "teach_platform";

  /**
   * Détermine le bon resource_type pour un fichier
   */
  private getResourceType(file: File, requestedType?: string): string {
    if (requestedType && requestedType !== "auto") {
      return requestedType;
    }
    
    // Auto-détection intelligente
    if (file.type === "application/pdf") {
      return "image"; // ✅ CORRECT: Les PDF utilisent 'image'
    }
    if (file.type.startsWith("video/")) {
      return "video";
    }
    if (file.type.startsWith("image/")) {
      return "image";
    }
    return "auto";
  }

  /**
   * Upload avec XMLHttpRequest pour avoir la progression
   */
  private uploadWithXHR(
    file: File,
    options: UploadOptions,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      if (!this.CLOUD_NAME) {
        reject(new Error("Cloudinary Cloud Name non configuré"));
        return;
      }

      const resourceType = this.getResourceType(file, options.resourceType);
      const url = `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/${resourceType}/upload`;

      console.log(`Uploading to: ${url}`);
      console.log(`File type: ${file.type}, Resource type: ${resourceType}`);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", this.UPLOAD_PRESET);
      if (options.folder) {
        formData.append("folder", options.folder);
      }

      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);

      if (options.onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            options.onProgress!(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url: data.url,
            secureUrl: data.secure_url,
            publicId: data.public_id,
            format: data.format,
            bytes: data.bytes,
            duration: data.duration ? Math.round(data.duration) : undefined,
          });
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            console.error("Upload error details:", errorData);
            reject(new Error(errorData.error?.message || `Upload failed: ${xhr.statusText}`));
          } catch {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });
  }

  async uploadFile(
    file: File,
    options?: UploadOptions,
  ): Promise<CloudinaryUploadResult> {
    return this.uploadWithXHR(file, options || {});
  }

  async uploadImage(
    file: File,
    folder?: string,
    onProgress?: (percent: number) => void,
  ): Promise<CloudinaryUploadResult> {
    return this.uploadFile(file, { resourceType: "image", folder, onProgress });
  }

  async uploadVideo(
    file: File,
    folder?: string,
    onProgress?: (percent: number) => void,
  ): Promise<CloudinaryUploadResult> {
    return this.uploadFile(file, { resourceType: "video", folder, onProgress });
  }

  async uploadPdf(
    file: File,
    folder?: string,
    onProgress?: (percent: number) => void,
  ): Promise<CloudinaryUploadResult> {
    // ✅ CORRECT: Ne pas spécifier resourceType, laisser getResourceType() le déterminer
    return this.uploadFile(file, { folder, onProgress });
  }
}

export const cloudinaryService = new CloudinaryService();