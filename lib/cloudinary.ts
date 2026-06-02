import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000,
})

export { cloudinary }

// ============================================================
// UPLOAD CONFIGURATION PRESETS
// ============================================================

export const UPLOAD_CONFIGS = {
  avatar: {
    folder: 'campusconnect/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_size_bytes: 2 * 1024 * 1024, // 2MB
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  },
  notes: {
    folder: 'campusconnect/notes',
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'doc', 'docx', 'ppt', 'pptx'],
    max_size_bytes: 10 * 1024 * 1024, // 10MB
    transformation: [],
  },
  chatImage: {
    folder: 'campusconnect/chat-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    max_size_bytes: 5 * 1024 * 1024, // 5MB
    transformation: [
      { width: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  },
  noticeImage: {
    folder: 'campusconnect/notices',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_size_bytes: 5 * 1024 * 1024, // 5MB
    transformation: [
      { width: 800, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  },
} as const

export type UploadType = keyof typeof UPLOAD_CONFIGS

// ============================================================
// UPLOAD FUNCTION
// ============================================================

/**
 * Uploads a file buffer to Cloudinary and returns the secure URL.
 * @param fileBuffer - The file as a Node.js Buffer
 * @param fileName - Original filename (used for public_id generation)
 * @param type - Upload preset key from UPLOAD_CONFIGS
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
  type: UploadType,
  mimeType: string = 'application/octet-stream'
): Promise<string> {
  const config = UPLOAD_CONFIGS[type]
  const base64 = `data:${mimeType};base64,${fileBuffer.toString('base64')}`
  const publicId = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  if (fileBuffer.length > 10 * 1024 * 1024) {
    const result = await cloudinary.uploader.upload_large(base64, {
      folder: config.folder,
      public_id: publicId,
      resource_type: 'auto',
      chunk_size: 6000000,
      timeout: 300000,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any // Cast to any because the typings for upload_large are incomplete (returns UploadStream union)
    return result.secure_url
  } else {
    const result = await cloudinary.uploader.upload(base64, {
      folder: config.folder,
      public_id: publicId,
      resource_type: 'auto',
      timeout: 120000,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformation: config.transformation as any, // Cloudinary types are complex and require any here
    })
    return result.secure_url
  }
}

// ============================================================
// FILE VALIDATION
// ============================================================

/**
 * Validates a file against the upload preset constraints.
 * Check size and extension before sending to Cloudinary.
 */
export function validateFile(
  file: File,
  type: UploadType
): { valid: boolean; error?: string } {
  const config = UPLOAD_CONFIGS[type]

  if (file.size > config.max_size_bytes) {
    const maxMB = config.max_size_bytes / (1024 * 1024)
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxMB}MB.`,
    }
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !(config.allowed_formats as readonly string[]).includes(ext)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed formats: ${config.allowed_formats.join(', ')}.`,
    }
  }

  return { valid: true }
}
