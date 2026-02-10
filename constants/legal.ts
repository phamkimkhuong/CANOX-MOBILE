/**
 * Legal Policy URLs
 * 
 * Source of Truth cho tất cả link chính sách pháp lý.
 * Khi cần đổi URL → chỉ sửa file này, app tự cập nhật.
 * 
 * Căn cứ pháp lý:
 * - NĐ 52/2013/NĐ-CP (TMĐT)
 * - NĐ 85/2021/NĐ-CP (sửa đổi NĐ 52)
 * - Luật TMĐT 2025 (hiệu lực 01/07/2026)
 * - Luật Bảo vệ NTD 2023 (hiệu lực 01/07/2024)
 * - NĐ 117/2025/NĐ-CP (thuế TMĐT, hiệu lực 01/07/2025)
 */

export const LEGAL_BASE_URL = 'https://calatha.com/legal';

// ─────────────────────────────────────────────
// BẮT BUỘC (5 file) — Pháp luật VN + Store Review
// ─────────────────────────────────────────────

export const LEGAL_URLS = {
    /** Quy chế hoạt động sàn TMĐT — NĐ 52/2013 + NĐ 85/2021 + Luật TMĐT 2025 */
    MARKETPLACE_REGULATIONS: `${LEGAL_BASE_URL}/regulations`,

    /** Chính sách bảo mật — NĐ 13/2023 PDPA + App Store/Google Play */
    PRIVACY: `${LEGAL_BASE_URL}/privacy`,

    /** Điều khoản sử dụng (Buyer ToS) — Bộ luật Dân sự 2015 + NĐ 52/2013 */
    TOS: `${LEGAL_BASE_URL}/terms`,

    /** Điều khoản dành cho Seller — NĐ 85/2021 + Luật TMĐT 2025 */
    SELLER_TERMS: 'https://seller.canox.vn/terms',

    /** Chính sách đổi trả & hoàn tiền — Luật Bảo vệ NTD 2023 */
    RETURN: `${LEGAL_BASE_URL}/return-refund`,

    // ─────────────────────────────────────────────
    // Vận hành - Cần thiết - 4 file
    // ─────────────────────────────────────────────

    /** Chính sách vận chuyển — NĐ 52/2013 */
    SHIPPING: `${LEGAL_BASE_URL}/shipping`,

    /** Chính sách thanh toán — NĐ 52/2013 + NĐ 117/2025 (escrow, COD, ví) */
    PAYMENT: `${LEGAL_BASE_URL}/payment`,

    /** Sản phẩm cấm & hạn chế — NĐ 85/2021 + Luật TMĐT 2025 */
    PROHIBITED_ITEMS: `${LEGAL_BASE_URL}/prohibited-items`,

    /** Chính sách bảo hành — Luật Bảo vệ NTD 2023 */
    WARRANTY: `${LEGAL_BASE_URL}/warranty`,
};
