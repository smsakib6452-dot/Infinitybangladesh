/**
 * Storage Service Abstraction for Infinity Bangladesh
 * Handles secure file validation, MIME type checking, and cloud storage upload orchestration via Cloudinary.
 */

import { uploadToCloudinary, isCloudinaryConfigured } from '../cloudinary';
import { isValidPermanentUrl } from '../utils/mediaSanitizer';

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  url?: string;
  fileName?: string;
  fileSize?: string;
  publicId?: string;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'application/pdf'
];

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB (Cloudinary supports generous uploads)
const MAX_PDF_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export class StorageService {
  /**
   * Validates file size and MIME type before processing
   */
  static validateFile(file: File): UploadValidationResult {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file format (${file.type}). Only JPG, PNG, WebP, GIF, SVG, and PDF files are allowed.`
      };
    }

    const isPdf = file.type === 'application/pdf';
    const limit = isPdf ? MAX_PDF_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;

    if (file.size > limit) {
      const limitMb = Math.round(limit / (1024 * 1024));
      return {
        valid: false,
        error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is ${limitMb} MB.`
      };
    }

    return { valid: true };
  }

  /**
   * Uploads file directly to Cloudinary cloud storage and returns the permanent CDN HTTPS URL
   */
  static async uploadFile(file: File | Blob | string, fileName?: string): Promise<UploadResult> {
    if (file instanceof File) {
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
    }

    try {
      const result = await uploadToCloudinary(file);
      if (result.placeholder || !result.secure_url || !isValidPermanentUrl(result.secure_url)) {
        return {
          success: false,
          error: 'Cloud uploads are locked during Phase 1.1 containment.'
        };
      }
      const name =
        fileName ||
        (file instanceof File ? file.name : result.original_filename || 'uploaded-image.jpg');
      const sizeStr = result.bytes
        ? `${(result.bytes / 1024).toFixed(1)} KB`
        : file instanceof File
        ? `${(file.size / 1024).toFixed(1)} KB`
        : undefined;

      return {
        success: true,
        fileUrl: result.secure_url,
        url: result.secure_url,
        fileName: name,
        fileSize: sizeStr,
        publicId: result.public_id
      };
    } catch (err: any) {
      console.error('StorageService upload error:', err);
      return {
        success: false,
        error: err.message || 'Failed to upload image to cloud storage.'
      };
    }
  }

  /**
   * Uploads a base64 data URI string directly to Cloudinary
   */
  static async uploadBase64(dataUrl: string, fileName?: string): Promise<UploadResult> {
    return this.uploadFile(dataUrl, fileName);
  }

  /**
   * Checks if cloud storage provider is configured
   */
  static isCloudConfigured(): boolean {
    return isCloudinaryConfigured();
  }
}
