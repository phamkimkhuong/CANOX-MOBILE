import { EN_MAP } from "./errorCodes.en";

const VI_MAP: Record<number, string> = {
    // TÀI KHOẢN (200-299)
    208: "Tên đăng nhập đã tồn tại!",
    209: "Email đã tồn tại!",

    // HỆ THỐNG (6000-699)
    6001: "Lỗi máy chủ nội bộ!",
    6005: "Đã xảy ra lỗi không xác định!",

    // ===== OTP (2500-2599) =====
    2500: "Mã OTP đã hết hạn",
    2501: "Mã OTP đã được sử dụng",
    2502: "Vui lòng đợi trước khi gửi lại OTP.",
    2504: "Mã OTP không hợp lệ",
    2505: "Mã OTP đã được sử dụng",
    2509: "Lỗi khi tạo OTP mới",
    2510: "Lỗi khi gửi lại OTP",
    2511: "Không tìm thấy mã OTP cho email này",
    2512: "Mã OTP không khớp, vui lòng nhập lại mã mới nhất đã được gửi tới email của bạn",
    2513: "Mã OTP này đã được sử dụng, vui lòng yêu cầu mã mới",
    2514: "Mã OTP đã hết hạn, vui lòng yêu cầu mã mới",
    2515: "Lỗi khi xác minh OTP",


} as const;
export const getErrorMessageByCode = (code: number, lang: 'vi' | 'en' = 'vi'): string => {
    const errorMaps = {
        vi: VI_MAP,
        en: EN_MAP
    };
    return errorMaps[lang][code] || errorMaps[lang][6005];
};

