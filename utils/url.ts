/**
 * URL Utilities
 * Dùng chung cho toàn bộ app để tạo URL từ path
 */
const CDN_BASE_URL = process.env.EXPO_PUBLIC_CDN_BASE_URL;
/**
 * Chuyển đổi path relative thành full URL
 * @param path - Path từ API (có thể là null, relative path, hoặc full URL)
 * @param placeholder - Ảnh mặc định khi path null/undefined
 */
export const toPublicUrl = (
    path: string | null | undefined,
    placeholder: string = 'https://via.placeholder.com/300'
): string => {
    if (!path) return placeholder;
    // Đã là full URL → giữ nguyên
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    // Relative path → ghép với CDN base URL
    const base = (CDN_BASE_URL || '').replace(/\/$/, ''); // Loại bỏ trailing slash
    const cleanPath = path.replace(/^\/+/, ''); // Loại bỏ leading slash
    // console.log("Xem đường dẫn có đúng không", `${base}/${cleanPath}`);
    return `${base}/${cleanPath}`;
};

/**
 * Tạo URL cho ảnh với size suffix
 * Ví dụ: path = "public/image/123", extension = ".png", size = "_thumb"
 * → "https://cdn.../public/image/123_thumb.png"
 */
export const toSizedImageUrl = (
    basePath: string | null | undefined,
    extension: string | null | undefined,
    size: string = '' // '_thumb', '_medium', '_large', hoặc '' cho original
): string | undefined => {
    if (!basePath || !extension) return undefined;

    const base = (CDN_BASE_URL || '').replace(/\/$/, '');
    const cleanPath = basePath.replace(/^\/+/, '');
    const cleanExt = extension.startsWith('.') ? extension : `.${extension}`;
    // console.log("Xem đường dẫn có đúng không", `${base}/${cleanPath}${size}${cleanExt}`);
    return `${base}/${cleanPath}${size}${cleanExt}`;
};
