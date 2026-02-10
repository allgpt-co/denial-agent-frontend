/**
 * File upload constants
 */
export declare const MAX_FILE_SIZE_BYTES: number;
export declare const MAX_FILES_PER_UPLOAD = 10;
export declare const MAX_TOTAL_SIZE_BYTES: number;
export declare const ALLOWED_CONTENT_TYPES: readonly ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp", "image/svg+xml", "video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/x-ms-wmv", "video/webm", "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/aac", "audio/flac", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/plain", "text/csv", "text/markdown", "text/html", "application/zip", "application/x-rar-compressed", "application/x-tar", "application/gzip"];
/**
 * Validate file before upload
 */
export declare function validateFile(file: File): {
    valid: boolean;
    error?: string;
};
/**
 * Validate multiple files before upload
 */
export declare function validateFiles(files: File[]): {
    valid: boolean;
    error?: string;
};
//# sourceMappingURL=constants.d.ts.map