# Policy #6 — Chính sách Vận chuyển (Shipping & Delivery)

> **Căn cứ**: NĐ 52/2013/NĐ-CP (yêu cầu công bố), NĐ 85/2021/NĐ-CP  

---

## Mục 1: Phạm vi giao hàng
- **Nội địa**: Toàn bộ 63 tỉnh/thành Việt Nam
- **Quốc tế**: Hỗ trợ một số quốc gia (nếu có, thông tin hiển thị trên trang sản phẩm)

## Mục 2: Đơn vị vận chuyển
- Đối tác vận chuyển: GHN, GHTK, và các đơn vị khác tùy thời điểm
- Seller có thể tự vận chuyển (nếu sàn cho phép)
- Thông tin tracking: Cung cấp mã vận đơn để buyer theo dõi trong app

## Mục 3: Thời gian

| Giai đoạn | Thời gian |
|:----------|:---------|
| Seller xác nhận đơn | ≤ 24 giờ |
| Seller gửi hàng cho vận chuyển | ≤ 48 giờ sau xác nhận |
| Giao hàng nội thành | 1-3 ngày |
| Giao hàng liên tỉnh | 3-7 ngày |
| Giao hàng vùng sâu/xa | 5-10 ngày |

> *Thời gian trên là ước tính, có thể thay đổi do thời tiết, lễ tết, hoặc bất khả kháng.*

## Mục 4: Phí vận chuyển
- Tính dựa trên: trọng lượng, kích thước, khoảng cách, đơn vị vận chuyển
- Hiển thị rõ tại trang thanh toán trước khi buyer xác nhận đơn
- Chương trình **miễn phí vận chuyển**: Áp dụng theo voucher, chương trình khuyến mãi, hoặc ngưỡng đơn hàng tối thiểu

## Mục 5: Quản lý rủi ro

| Tình huống | Xử lý |
|:-----------|:------|
| **Hàng thất lạc** | Buyer yêu cầu hỗ trợ → Sàn phối hợp ĐVVC tra soát → Hoàn tiền nếu xác nhận mất |
| **Hàng vỡ/hư hỏng khi vận chuyển** | Buyer chụp ảnh → Tạo yêu cầu đổi trả → Trách nhiệm ĐVVC hoặc bảo hiểm VC |
| **Sai địa chỉ (do buyer)** | Buyer liên hệ ĐVVC sửa địa chỉ → Phí phát sinh do buyer chịu |
| **Giao không thành (buyer không nhận COD)** | Hàng trả về seller → Buyer chịu phí hoàn hàng |

## Mục 6: Chính sách COD (Thu hộ)
- Buyer thanh toán khi nhận hàng
- Nếu buyer **từ chối nhận** không có lý do chính đáng → Hàng trả về seller, buyer chịu phí hoàn hàng
- Buyer lạm dụng từ chối COD nhiều lần → Hạn chế quyền sử dụng COD

---

# Policy #7 — Chính sách Thanh toán (Payment Policy)

> **Căn cứ**: NĐ 52/2013/NĐ-CP, NĐ 117/2025/NĐ-CP  
> **Lưu ý PCI DSS**: CanoX sử dụng cổng thanh toán bên thứ 3 đã đạt PCI DSS  

---

## Mục 1: Phương thức thanh toán hỗ trợ

| Phương thức | Đối tác | Ghi chú |
|:-----------|:--------|:--------|
| **COD** (Thu hộ) | Qua ĐVVC (GHN, GHTK) | Thanh toán khi nhận hàng |
| **Ví điện tử** | MoMo, VNPay | Thanh toán tức thì |
| **QR Code** | PayOS (VietQR) | Quét mã tại app ngân hàng |
| **Thẻ quốc tế** | Stripe (nếu áp dụng) | Visa, Mastercard |
| **Chuyển khoản** | PayOS | Chuyển khoản ngân hàng nội địa |

## Mục 2: Thanh toán an toàn
- CanoX **không lưu trữ** thông tin thẻ ngân hàng/thẻ tín dụng
- Mọi giao dịch thẻ được xử lý bởi **cổng thanh toán bên thứ 3 đã đạt chuẩn PCI DSS**
- Mã hóa TLS 1.2+ cho toàn bộ giao tiếp thanh toán

## Mục 3: Luồng Escrow
1. Buyer thanh toán → Tiền vào **tài khoản trung gian** (sàn giữ)
2. Seller xử lý, giao hàng
3. Buyer xác nhận nhận hàng HOẶC hết thời hạn xác nhận (7-15 ngày)
4. Giải ngân cho seller (trừ commission + thuế khấu trừ nếu áp dụng)

## Mục 4: Hoàn tiền

| Phương thức gốc | Hoàn về | Thời gian |
|:----------------|:--------|:---------|
| Ví điện tử | Ví gốc | 1-3 ngày LV |
| Chuyển khoản / QR | TK ngân hàng gốc | 3-5 ngày LV |
| Thẻ quốc tế | Thẻ gốc | 5-7 ngày LV |
| COD | Ví CanoX hoặc TK ngân hàng buyer cung cấp | 3-5 ngày LV |

---

# Policy #8 — Sản phẩm Cấm & Hạn chế (Prohibited Items)

> **Căn cứ**: NĐ 85/2021/NĐ-CP, Luật TMĐT 2025, Luật Đầu tư 2020 (Phụ lục IV)  

---

## Mục 1: Danh mục hàng cấm kinh doanh

Các sản phẩm sau **NGHIÊM CẤM** đăng bán trên CanoX:

1. **Vũ khí, đạn dược, vật liệu nổ**, trang thiết bị quân sự, công an chuyên dụng
2. **Ma túy** và tiền chất ma túy
3. **Hóa chất độc** nằm trong Công ước Cấm vũ khí hóa học
4. **Thuốc lá điện tử, thuốc lá nung nóng** và linh kiện (cấm từ 01/01/2025)
5. **Pháo nổ** các loại
6. **Đồ chơi nguy hiểm**, ảnh hưởng đến giáo dục nhân cách trẻ em
7. **Động vật hoang dã**, thực vật quý hiếm cấm khai thác
8. **Hàng giả, hàng nhái**, vi phạm sở hữu trí tuệ
9. **Hàng không rõ nguồn gốc**, không nhãn mác, hết hạn sử dụng
10. **Hàng lậu**, hàng nhập khẩu trái phép
11. **Thuốc tân dược** không có giấy phép lưu hành
12. **Thuốc bảo vệ thực vật**, thuốc thú y cấm hoặc chưa được phép sử dụng
13. **Văn hóa phẩm** phản động, đồi trụy, mê tín dị đoan
14. **Phế liệu, phế thải** gây ô nhiễm môi trường
15. **Khoáng sản** đặc biệt, độc hại
16. **Sản phẩm và thiết bị y tế** không có giấy phép

## Mục 2: Sản phẩm hạn chế (cần giấy phép)
- Thực phẩm chức năng: Cần giấy công bố
- Mỹ phẩm: Cần phiếu công bố sản phẩm
- Rượu bia: Tuân thủ Luật Phòng chống tác hại rượu bia
- Thiết bị y tế: Cần giấy phép lưu hành

## Mục 3: Hậu quả vi phạm
- **Gỡ sản phẩm** ngay lập tức
- **Khóa tài khoản** tạm thời hoặc vĩnh viễn
- **Giữ lại tiền** thanh toán liên quan
- **Báo cáo cơ quan chức năng** (Công an, Quản lý thị trường) khi cần thiết
- Seller chịu toàn bộ **trách nhiệm pháp lý** phát sinh

---

# Policy #9 — Chính sách Bảo hành (Warranty Policy)

> **Căn cứ**: Luật BVNTD 2023, NĐ 55/2024/NĐ-CP  

---

## Mục 1: Phạm vi bảo hành

| Ngành hàng | Thời gian bảo hành tối thiểu |
|:-----------|:----------------------------|
| Điện thoại, máy tính, tablet | 12 tháng |
| Đồ gia dụng điện tử | 12 tháng |
| Phụ kiện điện tử (tai nghe, sạc, cáp) | 3-6 tháng |
| Quần áo, giày dép | Theo chính sách seller (thường 7-30 ngày) |
| Thực phẩm | Theo hạn sử dụng |
| Sản phẩm handmade / custom | Theo cam kết seller |

> *Seller có thể mở rộng bảo hành. Thông tin hiển thị trên trang sản phẩm.*

## Mục 2: Hình thức bảo hành
- **Phiếu bảo hành giấy**: Đi kèm sản phẩm, ghi rõ thời hạn và điều kiện
- **E-warranty**: Bảo hành điện tử qua mã đơn hàng trên CanoX
- **Bảo hành hãng**: Bảo hành tại trung tâm bảo hành chính hãng (SP chính hãng)

## Mục 3: Quy trình yêu cầu bảo hành
1. Buyer liên hệ seller qua chat trên CanoX
2. Mô tả lỗi + cung cấp bằng chứng (ảnh/video)
3. Seller xác nhận và hướng dẫn gửi hàng bảo hành
4. Sửa chữa / đổi mới / hoàn tiền (tùy mức độ)
5. Thời gian xử lý: **7-30 ngày** tùy ngành hàng và hình thức bảo hành

## Mục 4: Không áp dụng bảo hành
- Hư hỏng do sử dụng sai cách, tai nạn, thiên tai
- Sản phẩm đã bị sửa chữa bởi bên thứ 3 không được seller ủy quyền
- Hết thời hạn bảo hành
- Không có bằng chứng mua hàng hợp lệ trên CanoX
