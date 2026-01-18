import { md5 as calculateMd5 } from 'js-md5';
import { devLog } from './logger';

/**
 * Extract file extension from URI or filename
 */
export type ImageExtension = 'jpg' | 'jpeg' | 'png' | 'webp' | 'gif';

export const getFileExtension = (uri: string): ImageExtension => {
    const extension = uri.split('.').pop()?.toLowerCase();

    // Map common extensions
    if (extension === 'jpg' || extension === 'jpeg') return 'jpg';
    if (extension === 'png') return 'png';
    if (extension === 'webp') return 'webp';
    if (extension === 'gif') return 'gif';

    // Default to jpg for unknown types
    return 'jpg';
};

/**
 * Calculate MD5 hash from ArrayBuffer
 */
export const calculateMD5FromArrayBuffer = (arrayBuffer: ArrayBuffer): string => {
    const hash = calculateMd5(arrayBuffer);
    return hash;
};

/**
 * Read file once and return all needed data
 * This ensures MD5 is calculated from the exact same bytes that will be uploaded
 */
export const readFileAsArrayBuffer = async (fileUri: string): Promise<{
    blob: Blob;
    arrayBuffer: ArrayBuffer;
    size: number;
}> => {
    try {
        const response = await fetch(fileUri);
        const blob = await response.blob();

        // Convert blob to ArrayBuffer using FileReader
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result instanceof ArrayBuffer) {
                    resolve(reader.result);
                } else {
                    reject(new Error('FileReader did not return ArrayBuffer'));
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(blob);
        });

        return {
            blob,
            arrayBuffer,
            size: blob.size,
        };
    } catch (error) {
        devLog('[storageUtils] File read error:', error);
        throw new Error('Failed to read file');
    }
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
    };
    return mimeTypes[extension?.toLowerCase()] || 'image/jpeg';
};
