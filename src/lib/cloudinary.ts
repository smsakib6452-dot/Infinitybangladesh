/**
 * Cloudinary Storage & Upload Service for Infinity Bangladesh
 * 
 * Supports direct unsigned uploads to Cloudinary CDN via the REST API endpoint:
 * https://api.cloudinary.com/v1_1/:cloud_name/image/upload
 * 
 * Cloudinary Configuration:
 * Configure via VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env
 */

export const CLOUDINARY_CLOUD_NAME =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME) || '';

export const CLOUDINARY_UPLOAD_PRESET =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET) || '';

export const CLOUDINARY_UPLOAD_URL = CLOUDINARY_CLOUD_NAME
  ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
  : '';

export interface CloudinaryUploadResponse {
  asset_id?: string;
  public_id: string;
  version?: number;
  version_id?: string;
  signature?: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
  created_at?: string;
  tags?: string[];
  bytes?: number;
  type?: string;
  etag?: string;
  placeholder?: boolean;
  url: string;
  secure_url: string;
  original_filename?: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  tags?: string[];
  uploadPreset?: string;
}

/**
 * Checks whether Cloudinary configuration is available.
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}

/**
 * Normalizes an image URL and adds cache-busting version or timestamp if applicable.
 * Guarantees that multi-device browser caches and CDNs immediately serve the fresh image.
 */
export function getFreshImageUrl(url?: string, versionOrTimestamp?: number | string): string {
  if (!url) return '';

  // Data URIs, Blob URLs, and local relative paths do not need Cloudinary transformation
  if (url.startsWith('data:') || url.startsWith('blob:') || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return url;
  }

  // For Cloudinary URLs:
  if (url.includes('cloudinary.com')) {
    // If the URL already contains an explicit version tag /v\d+/, Cloudinary versioning is active
    if (/\/v\d+\//.test(url)) {
      return url;
    }
    // If version or timestamp is provided, insert version parameter into the Cloudinary path
    if (versionOrTimestamp && url.includes('/upload/')) {
      const parts = url.split('/upload/');
      return `${parts[0]}/upload/v${versionOrTimestamp}/${parts[1]}`;
    }
    // If no version tag exists in the raw Cloudinary URL, inject a timestamp version to prevent stale browser/CDN caching
    if (url.includes('/upload/')) {
      const parts = url.split('/upload/');
      const ts = Math.floor(Date.now() / (1000 * 60 * 30)); // 30-min freshness window
      return `${parts[0]}/upload/v${ts}/${parts[1]}`;
    }
  }

  return url;
}

/**
 * Uploads a File, Blob, or base64 data URI directly to Cloudinary using unsigned upload.
 * 
 * @param file - File object, Blob, or base64 data URL string (e.g. data:image/png;base64,...)
 * @param options - Optional folder and tags for organization
 * @returns Promise<CloudinaryUploadResponse>
 */
export async function uploadToCloudinary(
  file: File | Blob | string,
  options?: CloudinaryUploadOptions
): Promise<CloudinaryUploadResponse> {
  const cloudName = CLOUDINARY_CLOUD_NAME;
  const uploadPreset = options?.uploadPreset || CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary cloud name or upload preset is missing.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  if (options?.folder) {
    formData.append('folder', options.folder);
  }

  if (options?.tags && options.tags.length > 0) {
    formData.append('tags', options.tags.join(','));
  }

  const uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const response = await fetch(uploadEndpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Prevent browser caching of upload POST
        'Cache-Control': 'no-cache'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg =
        data.error?.message || `Cloudinary upload failed with status ${response.status} (${response.statusText})`;
      console.error('Cloudinary upload error response:', data);
      throw new Error(errorMsg);
    }

    if (!data.secure_url) {
      throw new Error('Upload succeeded but no secure_url was returned by Cloudinary.');
    }

    // Ensure secure_url contains explicit version if returned
    if (data.version && data.secure_url.includes('/upload/') && !data.secure_url.includes(`/v${data.version}/`)) {
      const parts = data.secure_url.split('/upload/');
      data.secure_url = `${parts[0]}/upload/v${data.version}/${parts[1]}`;
    }

    return data as CloudinaryUploadResponse;
  } catch (err: any) {
    console.error('Cloudinary direct upload exception:', err);
    throw new Error(err.message || 'Failed to upload image to Cloudinary.');
  }
}

/**
 * Utility to inject Cloudinary optimization and transformation flags (auto format, auto quality, sizing)
 */
export function optimizeCloudinaryUrl(
  url: string,
  transformations?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'thumb' | 'limit' | 'scale';
    quality?: 'auto' | 'auto:good' | 'auto:eco' | 'auto:best' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const transforms: string[] = [];
  const format = transformations?.format || 'auto';
  const quality = transformations?.quality || 'auto';

  transforms.push(`f_${format}`);
  transforms.push(`q_${quality}`);

  if (transformations?.width) {
    transforms.push(`w_${transformations.width}`);
  }
  if (transformations?.height) {
    transforms.push(`h_${transformations.height}`);
  }
  if (transformations?.crop) {
    transforms.push(`c_${transformations.crop}`);
  }

  const transformString = transforms.join(',');
  return `${parts[0]}/upload/${transformString}/${parts[1]}`;
}
