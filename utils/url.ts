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
 * Example: path = "public/image/123", extension = ".png", size = "_thumb"
 * → "https://cdn.../public/image/123_thumb.png"
 */
export const toSizedImageUrl = (
    basePath: string | null | undefined,
    extension: string | null | undefined,
    size: string = '' // '_thumb', '_medium', '_large', or '' for original
): string | undefined => {
    if (!basePath || !extension) return undefined;

    const base = (CDN_BASE_URL || '').replace(/\/$/, '');
    const cleanPath = basePath.replace(/^\/+/, '');
    const cleanExt = extension.startsWith('.') ? extension : `.${extension}`;
    // console.log("Xem đường dẫn có đúng không", `${base}/${cleanPath}${size}${cleanExt}`);
    return `${base}/${cleanPath}${size}${cleanExt}`;
};
