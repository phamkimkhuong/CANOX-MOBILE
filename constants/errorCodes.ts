import { EN_MAP } from "./errorCodes.en";

const VI_MAP: Record<number, string> = {
    // TÀI KHOẢN (200-299)
    208: "Tên đăng nhập đã tồn tại!",
    209: "Email đã tồn tại!",

    // HỆ THỐNG (6000-699)
    6001: "Lỗi máy chủ nội bộ!",
    6005: "Đã xảy ra lỗi không xác định!",


} as const;
export const getErrorMessageByCode = (code: number, lang: 'vi' | 'en' = 'vi'): string => {
    const errorMaps = {
        vi: VI_MAP,
        en: EN_MAP
    };
    return errorMaps[lang][code] || errorMaps[lang][6005];
};

