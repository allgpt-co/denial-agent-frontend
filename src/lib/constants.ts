/**
 * File upload constants
 */

// Maximum file size per file: 100MB
export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024

// Maximum number of files that can be uploaded in a single request
export const MAX_FILES_PER_UPLOAD = 10

// Maximum total size for all files in a single upload: 500MB
export const MAX_TOTAL_SIZE_BYTES = 500 * 1024 * 1024

// Allowed file types (multimedia and common document types)
export const ALLOWED_CONTENT_TYPES = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/webm',
    // Audio
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/aac',
    'audio/flac',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'text/markdown',
    'text/html',
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-tar',
    'application/gzip',
] as const

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            valid: false,
            error: `File "${file.name}" is too large. Maximum size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`,
        }
    }

    // Check content type (optional - some browsers don't send it correctly)
    if (file.type && !ALLOWED_CONTENT_TYPES.includes(file.type as any)) {
        // Warn but don't block - content type detection can be unreliable
        console.warn(`File "${file.name}" has content type "${file.type}" which is not in the allowed list`)
    }

    return { valid: true }
}

/**
 * Validate multiple files before upload
 */
export function validateFiles(files: File[]): { valid: boolean; error?: string } {
    // Check number of files
    if (files.length > MAX_FILES_PER_UPLOAD) {
        return {
            valid: false,
            error: `Too many files. Maximum ${MAX_FILES_PER_UPLOAD} files allowed per upload`,
        }
    }

    if (files.length === 0) {
        return {
            valid: false,
            error: 'No files selected',
        }
    }

    // Check total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > MAX_TOTAL_SIZE_BYTES) {
        return {
            valid: false,
            error: `Total size of all files (${(totalSize / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed total size (${MAX_TOTAL_SIZE_BYTES / (1024 * 1024)}MB)`,
        }
    }

    // Validate each file
    for (const file of files) {
        const validation = validateFile(file)
        if (!validation.valid) {
            return validation
        }
    }

    return { valid: true }
}
