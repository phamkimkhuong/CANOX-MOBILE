import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';

// ============================================
// CACHE UTILITIES
// ============================================

/**
 * Format bytes to human readable string
 */
export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 KB';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Get size of a directory recursively (Asynchronous & Non-blocking)
 */
const getDirectorySizeAsync = async (dirUri: string): Promise<number> => {
    try {
        const dirInfo = await FileSystem.getInfoAsync(dirUri);
        if (!dirInfo.exists || !dirInfo.isDirectory) {
            return 0;
        }

        let totalSize = 0;
        const filenames = await FileSystem.readDirectoryAsync(dirUri);

        for (const filename of filenames) {
            const fileUri = `${dirUri}${dirUri.endsWith('/') ? '' : '/'}${filename}`;
            const fileInfo = await FileSystem.getInfoAsync(fileUri);

            if (fileInfo.exists) {
                if (fileInfo.isDirectory) {
                    totalSize += await getDirectorySizeAsync(fileUri);
                } else {
                    totalSize += fileInfo.size || 0;
                }
            }
        }

        return totalSize;
    } catch {
        return 0;
    }
};

/**
 * Calculate total cache size
 */
export const calculateCacheSize = async (): Promise<number> => {
    try {
        let totalSize = 0;

        // 1. Get cache directory size
        if (FileSystem.cacheDirectory) {
            totalSize += await getDirectorySizeAsync(FileSystem.cacheDirectory);
        }

        // 2. Scan specific folders in document directory
        const docDir = FileSystem.documentDirectory;
        if (docDir) {
            const cacheFolders = ['cache', 'tmp', 'ImageCache'];
            for (const folder of cacheFolders) {
                const folderUri = `${docDir}${folder}`;
                const folderInfo = await FileSystem.getInfoAsync(folderUri);
                if (folderInfo.exists && folderInfo.isDirectory) {
                    totalSize += await getDirectorySizeAsync(folderUri);
                }
            }
        }

        return totalSize;
    } catch {
        return 0;
    }
};

/**
 * Clear all app cache
 */
export const clearAllCache = async (): Promise<boolean> => {
    try {
        // 1. Clear expo-image cache
        await Image.clearDiskCache();
        await Image.clearMemoryCache();

        // 2. Clear cache directory contents
        if (FileSystem.cacheDirectory) {
            const files = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
            for (const file of files) {
                try {
                    await FileSystem.deleteAsync(`${FileSystem.cacheDirectory}${file}`, { idempotent: true });
                } catch {
                    // Skip files that can't be deleted
                }
            }
        }

        return true;
    } catch {
        return false;
    }
};

/**
 * Get formatted cache size string
 */
export const getFormattedCacheSize = async (): Promise<string> => {
    const size = await calculateCacheSize();
    return formatBytes(size);
};
