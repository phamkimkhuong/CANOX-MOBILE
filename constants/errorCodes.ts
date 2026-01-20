import { EN_MAP } from "./errorCodes.en";

const VI_MAP: Record<number, string> = {
    // TÀI KHOẢN (200-299)
    208: "Tên đăng nhập đã tồn tại!",
    209: "Email đã tồn tại!",
    220: "Mật khẩu cũ không đúng",
    500: "Đã xảy ra lỗi. Vui lòng thử lại sau!",

    // HỆ THỐNG (6000-699)
    6001: "Lỗi máy chủ nội bộ!",
    6005: "Đã xảy ra lỗi. Vui lòng thử lại sau!", // 404 Bad request
    6006: "Đã xảy ra lỗi. Vui lòng thử lại sau!", // Invalid response structure from server

    1000: "Không tìm thấy người dùng",
    1001: "Email này chưa được đăng ký trong hệ thống",
    1002: "Người dùng đã tồn tại",
    1003: "Thông tin đăng nhập không hợp lệ",
    1004: "Truy cập bị từ chối",
    1005: "Không có quyền truy cập",
    1006: "Người dùng không có đủ quyền",
    1007: "Tài khoản người dùng đã bị khóa",
    1008: "Tài khoản người dùng đã bị vô hiệu hóa",
    1009: "Mật khẩu đã hết hạn",
    1010: "Tài khoản người dùng đã bị vô hiệu hóa",
    1011: "Tài khoản người dùng đã bị khóa",
    1012: "Tài khoản người dùng đã bị xóa",
    1013: "Tài khoản người dùng đang chờ xác minh",

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
    3001: "Giá trị đơn hàng quá lớn. Hãy giảm số lượng sản phẩm trong đơn đặt hàng!",



    // GIỎ HÀNG & KHO (9400-9499)
    9402: "Sản phẩm đã hết hàng hoặc không đủ số lượng yêu cầu!",
} as const;

export const getErrorMessageByCode = (code: number, lang: 'vi' | 'en' = 'vi'): string | undefined => {
    const errorMaps = {
        vi: VI_MAP,
        en: EN_MAP
    };
    return errorMaps[lang][code];
};

