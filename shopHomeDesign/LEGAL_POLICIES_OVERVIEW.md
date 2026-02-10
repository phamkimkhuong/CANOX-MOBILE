# CanoX — Tài liệu Chính sách Pháp lý (Legal Policies)

> **Phiên bản**: 1.0  
> **Ngày tạo**: 2026-02-10  
> **Cập nhật lần cuối**: 2026-02-10  
> **Trạng thái**: DRAFT — Cần review bởi luật sư trước khi public  

---

## 1. Tổng quan

CanoX là sàn giao dịch thương mại điện tử (marketplace) mô hình B2C/C2C, hoạt động tại Việt Nam. Tài liệu này là **bản thiết kế nội dung** (content blueprint) cho toàn bộ chính sách pháp lý cần triển khai trên app và website.

### 1.1 Căn cứ pháp lý chính

| # | Văn bản | Số hiệu | Hiệu lực | Nội dung liên quan |
|:--|:--------|:--------|:---------|:-------------------|
| 1 | NĐ về TMĐT | 52/2013/NĐ-CP | 01/07/2013 | Quy chế sàn, đăng ký BCT, quyền & nghĩa vụ |
| 2 | NĐ sửa đổi NĐ 52 | 85/2021/NĐ-CP | 01/01/2022 | Gỡ vi phạm 24h, thông tin seller, phân định trách nhiệm logistics |
| 3 | Luật TMĐT | Luật số 60/2025/QH15 | 01/07/2026 | VNeID seller, thuật toán xếp hạng, livestream, affiliate |
| 4 | Luật Bảo vệ NTD | Luật số 19/2023/QH15 | 01/07/2024 | Giao dịch từ xa, điều khoản vô hiệu, khởi kiện tập thể |
| 5 | NĐ hướng dẫn Luật BVNTD | 55/2024/NĐ-CP | 01/07/2024 | Chi tiết quy trình đổi trả, thu hồi SP khuyết tật |
| 6 | NĐ Bảo vệ DLCN (PDPA VN) | 13/2023/NĐ-CP | 01/07/2023 | Thu thập, xử lý, lưu trữ dữ liệu cá nhân |
| 7 | NĐ thuế TMĐT | 117/2025/NĐ-CP | 01/07/2025 | Sàn khấu trừ VAT+TNCN tại nguồn cho hộ/cá nhân KD |
| 8 | NĐ quản lý Internet | 147/2024/NĐ-CP | 25/12/2024 | Xác thực TK mạng xã hội, livestream thương mại |
| 9 | Luật Quảng cáo sửa đổi | Luật số 75/2025/QH15 | 01/01/2026 | KOL gắn nhãn #ads, xác minh SP trước quảng bá |
| 10 | Bộ luật Dân sự | 91/2015/QH13 | 01/01/2017 | Hợp đồng, escrow, năng lực hành vi |

### 1.2 Cấu trúc Policy (9 file)

🔴 **BẮT BUỘC (Pháp luật VN + Store Review)** — 5 file
1. [Quy chế hoạt động sàn TMĐT](./POLICY_01_REGULATIONS.md)
2. [Chính sách bảo mật (Privacy)](./POLICY_02_PRIVACY.md)
3. [Điều khoản sử dụng (Buyer ToS)](./POLICY_03_TOS.md)
4. [Điều khoản Seller (Seller Agreement)](./POLICY_04_SELLER.md)
5. [Chính sách đổi trả & hoàn tiền](./POLICY_05_RETURN.md)

🟡 **CẦN THIẾT (Vận hành)** — 4 file
6. [Chính sách vận chuyển](./POLICY_06_09_OPERATIONAL.md)
7. [Chính sách thanh toán](./POLICY_06_09_OPERATIONAL.md#policy-7--chính-sách-thanh-toán-payment-policy)
8. [Sản phẩm cấm & hạn chế](./POLICY_06_09_OPERATIONAL.md#policy-8--sản-phẩm-cấm--hạn-chế-prohibited-items)
9. [Chính sách bảo hành](./POLICY_06_09_OPERATIONAL.md#policy-9--chính-sách-bảo-hành-warranty-policy)

### 1.3 Các mục đã gộp (không tách file riêng)

| Nội dung | Gộp vào | Lý do |
|:---------|:--------|:------|
| Tax Policy (NĐ 117/2025) | #1 Quy chế hoạt động + #4 Seller Agreement | Trách nhiệm khấu trừ thuộc sàn, nghĩa vụ thuế thuộc seller |
| Seller Performance & Ranking | #1 Quy chế hoạt động (mục thuật toán xếp hạng) | Luật TMĐT 2025 yêu cầu công khai trong quy chế |

### 1.4 Các mục tạm hoãn (chưa triển khai tính năng)

| Nội dung | Căn cứ | Khi nào cần |
|:---------|:-------|:-----------|
| Livestream Guidelines | NĐ 147/2024 + Luật TMĐT 2025 | Khi CanoX triển khai livestream |
| Content & Advertising (KOL) | Luật QC sửa đổi 75/2025 | Khi CanoX có affiliate/KOL |

---

## 2. Lưu ý quan trọng

1. **Đăng ký Bộ Công Thương**: Quy chế hoạt động (#1) phải nộp qua [online.gov.vn](https://online.gov.vn) và được duyệt trước khi hoạt động chính thức.
2. **Ngôn ngữ**: Tất cả policy phải có bản tiếng Việt (bắt buộc) và tiếng Anh (khuyến nghị).
3. **Cập nhật**: Khi sửa đổi policy, phải thông báo người dùng qua push notification / email / in-app banner trước ít nhất 5 ngày làm việc.
4. **Lưu trữ phiên bản**: Giữ lại tất cả phiên bản cũ để đối chứng khi có tranh chấp.
5. **App Store**: Privacy Policy phải có URL truy cập được công khai (không cần đăng nhập) — yêu cầu bởi cả Apple App Store và Google Play.

---