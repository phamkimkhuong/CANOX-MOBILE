/**
 * URL Utilities
 * Shared app-wide to create URL from path
 */
const CDN_BASE_URL = process.env.EXPO_PUBLIC_CDN_BASE_URL;
/**
 * Convert relative path to full URL
 * @param path - Path from API (can be null, relative path, or full URL)
 * @param placeholder - Default image when path is null/undefined
 */
export const toPublicUrl = (
    path: string | null | undefined,
    placeholder: string = 'https://via.placeholder.com/300'
): string => {
    if (!path) return placeholder;
    // Already full URL → keep as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    // Relative path → append to CDN base URL
    const base = (CDN_BASE_URL || '').replace(/\/$/, ''); // Remove trailing slash
    const cleanPath = path.replace(/^\/+/, ''); // Remove leading slash
    // console.log("Xem đường dẫn có đúng không", `${base}/${cleanPath}`);
    return `${base}/${cleanPath}`;
};

/**
 * Create image URL with size suffix
 * Supports two formats:
 * 1. Legacy: basePath + extension (size is appended to basePath)
 * 2. New: template string with '*' placeholder (e.g. "path_*.png")
 */
export const toSizedImageUrl = (
    basePathOrTemplate: string | null | undefined,
    extension: string | null | undefined = null,
    size: string = '' // 'thumb', 'medium', 'large', or ''
): string | undefined => {
    if (!basePathOrTemplate) {
        return undefined;
    }

    // Handle full URLs
    if (basePathOrTemplate.startsWith('http://') || basePathOrTemplate.startsWith('https://')) {
        return basePathOrTemplate;
    }

    const base = (CDN_BASE_URL || '').replace(/\/$/, '');
    if (!base) return undefined;

    let finalPath = basePathOrTemplate.replace(/^\/+/, '');

    // Template with '*'
    if (finalPath.includes('*')) {
        // If size is empty (original), use 'orig' suffix
        // Example: "image_*.jpg" -> original should be "image_orig.jpg"
        if (!size || size === 'orig') {
            finalPath = finalPath.replace('*', 'orig');
        } else {
            // Remove leading underscore from size if the template already has one before '*'
            // New logic: just replace '*' with the size string
            const cleanSize = size.startsWith('_') ? size.substring(1) : size;
            finalPath = finalPath.replace('*', cleanSize);
        }
    }
    // Legacy Format: basePath + extension
    else if (extension) {
        const cleanExt = extension.startsWith('.') ? extension : `.${extension}`;
        // In legacy, size usually starts with '_' (e.g. '_thumb')
        const legacySize = size && !size.startsWith('_') ? `_${size}` : size;
        finalPath = `${finalPath}${legacySize}${cleanExt}`;
    }

    return `${base}/${finalPath}`;
};

/**
 * Alias for buildImageUrl to maintain compatibility with existing code
 */
export const buildImageUrl = (
    path: string | null | undefined,
    extension: string | null | undefined = null,
    size: string = 'thumb'
): string => {
    // Standardize sizes: if user passes '_thumb', we treat it as 'thumb'
    const cleanSize = size.startsWith('_') ? size.substring(1) : size;
    return toSizedImageUrl(path, extension, cleanSize) ?? 'https://via.placeholder.com/300';
};
