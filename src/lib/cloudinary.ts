/**
 * Taqwa Enterprise - Premium Image & Media Upload Engine with Cloudinary
 */

import { isFirebaseConfigured, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export const DEFAULT_PRODUCT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='none'%3E%3Crect width='400' height='300' fill='%23F8FAFC'/%3E%3Crect x='140' y='65' width='120' height='130' rx='12' fill='%23E2E8F0'/%3E%3Cpath d='M155 100C155 91.7157 161.716 85 170 85H230C238.284 85 245 91.7157 245 100V155C245 163.284 238.284 170 230 170H170C161.716 170 155 163.284 155 155V100Z' fill='%23CBD5E1'/%3E%3Ccircle cx='200' cy='125' r='16' fill='%2394A3B8'/%3E%3Cpath d='M194 125L198 129L207 120' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ctext x='200' y='228' font-family='system-ui, -apple-system, sans-serif' font-size='13' font-weight='700' fill='%2364748B' text-anchor='middle'%3ETaqwa Enterprise%3C/text%3E%3Ctext x='200' y='248' font-family='system-ui, -apple-system, sans-serif' font-size='11' font-weight='500' fill='%2394A3B8' text-anchor='middle'%3EFeed &amp; Care%3C/text%3E%3C/svg%3E";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getCachedImageFallback(url: string): string {
  try {
    if (typeof window !== 'undefined' && (window as any).__imageFallbackCache) {
      const cached = (window as any).__imageFallbackCache[url];
      if (cached) return cached;
    }
  } catch {}
  return DEFAULT_PRODUCT_IMAGE;
}

/**
 * Retrieves the active Cloudinary configuration from either Environment Variables (Vercel/Vite)
 * or LocalStorage (configured via Admin Settings).
 */
export function getCloudinaryConfig(): { cloudName: string; uploadPreset: string; isConfigured: boolean } {
  const envCloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || '';
  const envUploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || '';

  let localCloudName = '';
  let localUploadPreset = '';
  try {
    localCloudName = localStorage.getItem('taqwa_cloudinary_cloud_name') || '';
    localUploadPreset = localStorage.getItem('taqwa_cloudinary_upload_preset') || '';
  } catch (e) {
    // LocalStorage safety check
  }

  const cloudName = (envCloudName && envCloudName !== 'MY_CLOUDINARY_CLOUD_NAME' ? envCloudName : localCloudName).trim();
  const uploadPreset = (envUploadPreset && envUploadPreset !== 'MY_CLOUDINARY_UPLOAD_PRESET' ? envUploadPreset : localUploadPreset).trim();

  const isConfigured = Boolean(
    cloudName && 
    uploadPreset && 
    cloudName !== 'MY_CLOUDINARY_CLOUD_NAME' && 
    uploadPreset !== 'MY_CLOUDINARY_UPLOAD_PRESET'
  );

  return {
    cloudName,
    uploadPreset,
    isConfigured
  };
}

/**
 * Checks whether Cloudinary is properly configured.
 */
export function isCloudinaryConfigured(): boolean {
  return getCloudinaryConfig().isConfigured;
}

/**
 * Persists Cloudinary credentials to LocalStorage for instant activation from the Admin UI.
 */
export function saveCloudinaryConfig(cloudName: string, uploadPreset: string): void {
  try {
    if (cloudName.trim()) {
      localStorage.setItem('taqwa_cloudinary_cloud_name', cloudName.trim());
    } else {
      localStorage.removeItem('taqwa_cloudinary_cloud_name');
    }

    if (uploadPreset.trim()) {
      localStorage.setItem('taqwa_cloudinary_upload_preset', uploadPreset.trim());
    } else {
      localStorage.removeItem('taqwa_cloudinary_upload_preset');
    }
  } catch (e) {
    console.error('Failed to persist Cloudinary configuration to localStorage:', e);
  }
}

/**
 * Tests Cloudinary connection by uploading a tiny 1x1 test pixel.
 */
export async function testCloudinaryConnection(cloudName: string, uploadPreset: string): Promise<{ success: boolean; url?: string; message: string }> {
  if (!cloudName.trim() || !uploadPreset.trim()) {
    return {
      success: false,
      message: 'Cloud Name এবং Upload Preset উভয় ফিল্ড পূরণ করা আবশ্যক।'
    };
  }

  try {
    // Create a 1x1 pixel test canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, 0, 1, 1);
    }

    const testBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!testBlob) {
      throw new Error('Test image generation failed.');
    }

    const testFile = new File([testBlob], 'cloudinary_taqwa_test.png', { type: 'image/png' });

    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('upload_preset', uploadPreset.trim());

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName.trim()}/image/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (response.ok && data.secure_url) {
      return {
        success: true,
        url: data.secure_url,
        message: 'Cloudinary সফলভাবে কানেক্ট হয়েছে এবং টেস্ট আপলোড সফল!'
      };
    } else {
      const errMsg = data.error?.message || 'Cloudinary কানেকশন যাচাই করতে ব্যর্থ হয়েছে।';
      return {
        success: false,
        message: errMsg
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'নেটওয়ার্ক এরর। Cloudinary-র সাথে যোগাযোগ করা সম্ভব হয়নি।'
    };
  }
}

export interface CompressionStats {
  originalSize: string;
  compressedSize: string;
  savings: string;
  isCompressed: boolean;
}

export interface CompressionResult {
  file: Blob | File;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  originalSizeFormatted: string;
  compressedSizeFormatted: string;
  savingsPercent: string;
  compressed: boolean;
}

/**
 * Intelligent Image Compressor & Composer.
 * Automatically analyzes image dimensions and file size. If size or resolution is high
 * (e.g. 2MB - 15MB mobile camera photos), scales resolution smoothly (max 1200x1200px)
 * and runs multi-tier quality tuning to compose a compact, high-clarity image (< 250KB)
 * perfectly optimized for Firestore document storage and instant mobile store loading.
 */
export async function smartCompressImage(
  file: File | Blob,
  maxWidth = 1200,
  maxHeight = 1200,
  initialQuality = 0.82
): Promise<CompressionResult> {
  const originalSize = file.size;
  const originalSizeFormatted = formatFileSize(originalSize);

  // If not a standard compressable raster image (e.g., SVG or animated GIF), return uncompressed
  if (!file.type.startsWith('image/') || file.type.includes('gif') || file.type.includes('svg')) {
    const dataUrl = await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve((r.result as string) || '');
      r.readAsDataURL(file);
    });
    return {
      file,
      dataUrl,
      originalSize,
      compressedSize: originalSize,
      originalSizeFormatted,
      compressedSizeFormatted: originalSizeFormatted,
      savingsPercent: '0%',
      compressed: false
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Downscale large dimensions while strictly preserving aspect ratio
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
          const fallbackDataUrl = (event.target?.result as string) || '';
          resolve({
            file,
            dataUrl: fallbackDataUrl,
            originalSize,
            compressedSize: originalSize,
            originalSizeFormatted,
            compressedSizeFormatted: originalSizeFormatted,
            savingsPercent: '0%',
            compressed: false
          });
          return;
        }

        // Apply high-quality bicubic rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressWithQuality = (q: number): Promise<Blob | null> => {
          return new Promise((resBlob) => {
            canvas.toBlob(resBlob, 'image/jpeg', q);
          });
        };

        const executeCompression = async () => {
          // Tier 1 compression (Initial pass)
          let blob = await compressWithQuality(initialQuality);

          // Tier 2: If image is still over 280KB, compose with finer quality factor
          if (blob && blob.size > 280 * 1024) {
            const tier2 = await compressWithQuality(0.72);
            if (tier2 && tier2.size < blob.size) blob = tier2;
          }

          // Tier 3: If still over 240KB, compress with optimal 0.62 quality
          if (blob && blob.size > 240 * 1024) {
            const tier3 = await compressWithQuality(0.62);
            if (tier3 && tier3.size < blob.size) blob = tier3;
          }

          const finalBlob = blob || file;
          const compressedSize = finalBlob.size;
          const compressedSizeFormatted = formatFileSize(compressedSize);
          const ratioNum = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));
          const savingsPercent = `${ratioNum}%`;

          const blobReader = new FileReader();
          blobReader.onloadend = () => {
            resolve({
              file: finalBlob,
              dataUrl: (blobReader.result as string) || '',
              originalSize,
              compressedSize,
              originalSizeFormatted,
              compressedSizeFormatted,
              savingsPercent,
              compressed: originalSize > compressedSize
            });
          };
          blobReader.readAsDataURL(finalBlob);
        };

        executeCompression();
      };

      img.onerror = () => {
        resolve({
          file,
          dataUrl: (event.target?.result as string) || '',
          originalSize,
          compressedSize: originalSize,
          originalSizeFormatted,
          compressedSizeFormatted: originalSizeFormatted,
          savingsPercent: '0%',
          compressed: false
        });
      };
      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      resolve({
        file,
        dataUrl: '',
        originalSize,
        compressedSize: originalSize,
        originalSizeFormatted,
        compressedSizeFormatted: originalSizeFormatted,
        savingsPercent: '0%',
        compressed: false
      });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Backward compatibility alias for compressImage
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<Blob | File> {
  const result = await smartCompressImage(file, maxWidth, maxHeight, quality);
  return result.file;
}

export interface UploadOptions {
  onProgress?: (percent: number) => void;
  compress?: boolean;
  folder?: string;
  onCompression?: (stats: CompressionStats) => void;
}

/**
 * Uploads an image using Firestore as the primary permanent cloud storage.
 * If the image is large, it automatically composes/compresses it using smart canvas algorithms.
 * Redundantly syncs across Firestore, Server cache, and Cloudinary (if configured).
 */
export async function uploadImage(
  file: File,
  options: UploadOptions = {}
): Promise<string> {
  const { onProgress, compress = true, folder = 'taqwa_enterprise', onCompression } = options;
  
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  // Validate file type
  if (!isImage && !isVideo) {
    throw new Error('কেবলমাত্র ছবি (JPG, PNG, WebP, GIF, SVG) অথবা ভিডিও ফাইল আপলোড করা যাবে।');
  }

  // Validate file size (50MB video, 25MB image)
  const MAX_SIZE_MB = isVideo ? 50 : 25;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`ফাইল সাইজ খুব বড়। সর্বোচ্চ অনুমোদিত সাইজ ${MAX_SIZE_MB}MB.`);
  }

  if (onProgress) onProgress(15);

  // 1. Smart Image Compression (Composed if image size is high)
  let fileToUpload: File | Blob = file;
  let compressedDataUrl = '';
  let compressionStats: CompressionStats | null = null;

  if (compress && isImage) {
    try {
      const compResult = await smartCompressImage(file);
      fileToUpload = compResult.file;
      compressedDataUrl = compResult.dataUrl;

      compressionStats = {
        originalSize: compResult.originalSizeFormatted,
        compressedSize: compResult.compressedSizeFormatted,
        savings: compResult.savingsPercent,
        isCompressed: compResult.compressed
      };

      if (onCompression) {
        onCompression(compressionStats);
      }

      console.log(`[IMAGE COMPOSED] Original: ${compResult.originalSizeFormatted} -> Compressed: ${compResult.compressedSizeFormatted} (${compResult.savingsPercent} savings)`);
    } catch (err) {
      console.warn('Image composition/compression skipped, using original file.', err);
    }
  }

  if (onProgress) onProgress(40);

  // Prepare deterministic unique Document ID for Firestore
  const cleanName = (file.name || 'product_image').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  const imageDocId = `tqw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanName}`;
  const publicFilename = `${imageDocId}.jpg`;
  const preferredUrl = `/uploads/${publicFilename}`;

  // Ensure we have dataUrl for Firestore
  if (!compressedDataUrl) {
    try {
      compressedDataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onloadend = () => res((r.result as string) || '');
        r.onerror = rej;
        r.readAsDataURL(fileToUpload);
      });
    } catch {}
  }

  // 2. Primary Storage: Firestore Database ('uploaded_images' collection)
  if (isFirebaseConfigured && db && compressedDataUrl) {
    try {
      await setDoc(doc(db, 'uploaded_images', imageDocId), {
        id: imageDocId,
        filename: file.name || publicFilename,
        dataUrl: compressedDataUrl,
        mimeType: 'image/jpeg',
        size: fileToUpload.size,
        originalSize: file.size,
        compressed: compressionStats?.isCompressed ?? false,
        createdAt: new Date().toISOString()
      });
      console.log(`[FIRESTORE STORAGE] Image successfully stored into Firestore: ${imageDocId} (${formatFileSize(fileToUpload.size)})`);
    } catch (fsErr) {
      console.warn('[FIRESTORE STORAGE] Direct client Firestore save warning:', fsErr);
    }
  }

  if (onProgress) onProgress(65);

  // Cache in browser memory for instant Zero-Latency rendering
  try {
    if (typeof window !== 'undefined' && compressedDataUrl) {
      (window as any).__imageFallbackCache = (window as any).__imageFallbackCache || {};
      (window as any).__imageFallbackCache[preferredUrl] = compressedDataUrl;
      (window as any).__imageFallbackCache[`/api/images/${imageDocId}`] = compressedDataUrl;
    }
  } catch {}

  const { cloudName, uploadPreset, isConfigured } = getCloudinaryConfig();

  // 3. Cloudinary Upload if explicitly configured
  if (isConfigured) {
    try {
      const clUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const endpointType = isVideo ? 'video' : 'auto';
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${endpointType}/upload`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            const percent = 65 + Math.round((e.loaded / e.total) * 30);
            onProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.secure_url) {
                console.log('[CLOUDINARY] Upload success:', response.secure_url);
                resolve(response.secure_url);
              } else {
                reject(new Error('Cloudinary response missing secure_url'));
              }
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error(`Cloudinary status: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Cloudinary network error'));

        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('upload_preset', uploadPreset);
        if (folder) {
          formData.append('folder', folder);
        }
        xhr.send(formData);
      });

      if (onProgress) onProgress(100);
      return clUrl;
    } catch (cloudinaryErr) {
      console.warn('Cloudinary upload skipped, continuing with Firestore & Server storage:', cloudinaryErr);
    }
  }

  // 4. Server-Side Asset Storage & Sync (/api/upload)
  try {
    if (onProgress) onProgress(80);

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: compressedDataUrl,
        filename: publicFilename,
        docId: imageDocId
      })
    });

    if (uploadRes.ok) {
      const data = await uploadRes.json();
      if (onProgress) onProgress(100);
      if (data.url) {
        return data.url;
      }
    }
  } catch (serverErr) {
    console.warn('Server upload endpoint offline, using Firestore / DataURL fallback:', serverErr);
  }

  if (onProgress) onProgress(100);
  return compressedDataUrl || preferredUrl;
}
