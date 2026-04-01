/**
 * Extract file extension from URI or filename
 */
export type StorageExtension = 'jpg' | 'jpeg' | 'png' | 'webp' | 'gif' | 'mp4' | 'mov' | 'avi';

export const getFileExtension = (uri: string): StorageExtension => {
    const extension = uri.split('.').pop()?.toLowerCase();

    // Image mapping
    if (extension === 'jpg' || extension === 'jpeg') return 'jpg';
    if (extension === 'png') return 'png';
    if (extension === 'webp') return 'webp';
    if (extension === 'gif') return 'gif';

    // Video mapping
    if (extension === 'mp4') return 'mp4';
    if (extension === 'mov') return 'mov';
    if (extension === 'avi') return 'avi';

    // Default to jpg for unknown types
    return 'jpg';
};

/**
 * Get MIME type from extension
 */
export const getMimeType = (extension: string): string => {
    const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        gif: 'image/gif',
        mp4: 'video/mp4',
        mov: 'video/quicktime',
        avi: 'video/x-msvideo',
    };
    return mimeTypes[extension?.toLowerCase()] || 'image/jpeg';
};
