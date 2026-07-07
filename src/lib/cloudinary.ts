/**
 * Taqwa Enterprise - Premium Image Upload Engine with Cloudinary & Local Sandbox Fallback
 */

/**
 * Compresses an image file using an HTML Canvas.
 * Returns a compressed Blob or the original File if compression fails or isn't applicable.
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<Blob | File> {
  if (!file.type.startsWith('image/') || file.type.includes('gif')) {
    return file; // Don't compress non-images or GIFs to preserve animation
  }
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export interface UploadOptions {
  onProgress?: (percent: number) => void;
  compress?: boolean;
}

/**
 * Uploads a file to Cloudinary if configured in the environment.
 * Otherwise, falls back gracefully to a simulated upload with progress bar
 * and converts the file to a local DataURL to ensure full offline-first functionality.
 */
export async function uploadImage(
  file: File,
  options: UploadOptions = {}
): Promise<string> {
  const { onProgress, compress = true } = options;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed for this upload channel.');
  }

  // Validate file size (10MB maximum safety check)
  const MAX_SIZE_MB = 10;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`File is too large. Maximum allowed size is ${MAX_SIZE_MB}MB.`);
  }

  // 1. Client-Side Compression using Canvas
  let fileToUpload: File | Blob = file;
  if (compress) {
    try {
      fileToUpload = await compressImage(file);
    } catch (err) {
      console.warn('Image compression failed, using original file instead.', err);
    }
  }

  const cloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET;

  // 2. Real Cloudinary Upload if configuration exists
  if (
    cloudName &&
    uploadPreset &&
    cloudName !== "MY_CLOUDINARY_CLOUD_NAME" &&
    uploadPreset !== "MY_CLOUDINARY_UPLOAD_PRESET" &&
    cloudName.trim() !== "" &&
    uploadPreset.trim() !== ""
  ) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.secure_url) {
              resolve(response.secure_url);
            } else {
              reject(new Error('Cloudinary server response did not include a secure_url.'));
            }
          } catch (err) {
            reject(new Error('Failed to parse Cloudinary response JSON.'));
          }
        } else {
          try {
            const errResponse = JSON.parse(xhr.responseText);
            reject(new Error(errResponse.error?.message || 'Cloudinary upload failed.'));
          } catch {
            reject(new Error(`Cloudinary upload failed with status code ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network connection error during Cloudinary upload.'));

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('upload_preset', uploadPreset);
      xhr.send(formData);
    });
  }

  // 3. Sandboxed local uploader fallback (progress bar simulated + base64 generated)
  return new Promise((resolve) => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      if (onProgress) {
        onProgress(Math.min(currentProgress, 100));
      }
      if (currentProgress >= 100) {
        clearInterval(interval);
        
        // Convert to base64 DataURL so it persists inside local memory during the session
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        const tempFile = fileToUpload instanceof Blob 
          ? new File([fileToUpload], file.name, { type: file.type }) 
          : fileToUpload;
        reader.readAsDataURL(tempFile);
      }
    }, 150);
  });
}
