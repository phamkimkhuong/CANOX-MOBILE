# 🏢 SHOP IDENTITY & CORPORATE PROFILE API SPECIFICATION

> **Phiên bản**: 1.0.0
> **Mục đích**: Tài liệu đặc tả cấu trúc dữ liệu API cho phần **Định danh & Hồ sơ năng lực** của Gian hàng Chính hãng (Official Store/Brand Mall).
> **Đối tượng**: Backend Developers, Database Designers.

---

## 1. TỔNG QUAN NGHIỆP VỤ

Khi người dùng truy cập vào một Brand Store (VD: Samsung, Unilever, Sunhouse), hệ thống cần hiển thị ngay lập tức các thông tin xác thực doanh nghiệp để xây dựng niềm tin (Trust).

API này **KHÔNG** trả về danh sách sản phẩm, voucher hay banner quảng cáo. Nó chỉ tập trung trả về **Hồ Sơ Doanh Nghiệp** (Corporate Profile).

### Mục tiêu trả lời các câu hỏi của User:
1.  **Who**: Đây là Shop nào? Có phải chính hãng (Official) không?
2.  **Trust**: Công ty này có thật không? Hoạt động bao lâu rồi?
3.  **Legal**: Pháp nhân chịu trách nhiệm là ai? Mã số thuế là gì?
4.  **Where**: Trụ sở ở đâu?
5.  **Support**: Hãng sẽ hỗ trợ kỹ thuật và bảo hành cho tôi như thế nào sau khi mua?

---

## 2. API ENDPOINTS DESIGN

Để tối ưu hóa hiệu suất (Caching & Performance), hồ sơ gian hàng được chia làm 2 API riêng biệt:

1.  **Identity API (Cache 24h)**: `/api/v1/public/shops/{shopId}/identity`
    *   Chứa: Identity, Legal, Brand Story, Support.
    *   Tần suất thay đổi: Cực thấp.
2.  **Stats API (Real-time/Snapshot)**: `/api/v1/public/shops/{shopId}/stats`
    *   Chứa: Rating, Follower, Response Rate.
    *   Tần suất thay đổi: Liên tục.

---

## 3. DATA SCHEMA & RESPONSE STRUCTURE

### 3.1. Tổng quan cấu trúc JSON
```json
{
  "code": 200,
  "success": true,
  "data": {
    "identity": { ... },       // Nhận diện thương hiệu (Visual)
    "legal": { ... },          // Pháp lý & Công ty (Trust)
    "brandStory": { ... },     // Câu chuyện thương hiệu (Widget)
    "support": { ... }         // Chăm sóc khách hàng & Bảo hành (CSKH)
  }
}
```

### 3.2. Chi tiết từng khối dữ liệu

#### A. Nhóm Identity (Nhận diện thương hiệu)
*Mục đích: Giúp giao diện App hiển thị đúng "màu cờ sắc áo" của thương hiệu.*

| Field Name | Type | Required | Description | Business Logic |
|:---|:---|:---|:---|:---|
| `shopName` | String | YES | Tên hiển thị của Shop | VD: "Samsung Official Store" |
| `slug` | String | YES | URL thân thiện | VD: `samsung-vina` (để làm DeepLink) |
| `logoUrl` | String | YES | URL ảnh Logo (Avatar) | Nên là ảnh vuông, min 500x500px |
| `coverDesktopUrl` | String | YES | Ảnh bìa (Desktop/Tablet) | Tỷ lệ 16:9 hoặc 3:1. Dùng cho Web hoặc màn hình gập (Fold). |
| `coverMobileUrl` | String | YES | Ảnh bìa (Mobile optimized) | Tỷ lệ 3:4 hoặc 4:3. Luôn ưu tiên hiển thị trên App. |
| `tagline` | String | NO | Khẩu hiệu thương hiệu | VD: "Khơi nguồn cảm hứng, kiến tạo tương lai" |

> **Thiết kế Safe Zone**: Nội dung quan trọng (Text/Logo) trên ảnh bìa phải nằm trong vùng trung tâm 60%, tránh các mép trên/dưới để không bị che bởi Back Button, Search Bar hoặc Navigation Bar của App.

#### B. Nhóm Legal & Corporate (Pháp lý & Công ty)
*Mục đích: Xác thực pháp nhân, trả lời câu hỏi "Công ty này có thật không?". Bắt buộc với Shop Mall/Official.*

| Field Name | Type | Required | Description | Business Logic |
|:---|:---|:---|:---|:---|
| `isOfficial` | Boolean | YES | Cờ đánh dấu chính hãng | `true` -> Hiển thị dấu tích xanh hoặc badge "Official" |
| `isMall` | Boolean | YES | Cờ đánh dấu thuộc Mall | `true` -> Hiển thị badge "Mall" |
| `companyName` | String | YES | Tên đầy đủ trên GPKD | VD: "CÔNG TY TNHH ĐIỆN TỬ SAMSUNG VINA". Cần hiển thị rõ ràng ở phần Info. |
| `taxId` | String | YES | Mã số thuế | Bắt buộc hiển thị theo luật TMĐT. |
| `registrationNumber`| String | NO | Số giấy phép ĐKKD | Có thể ẩn, hiển thị khi bấm vào "Xem chi tiết". |
| `headquarters` | String | YES | Địa chỉ đăng ký KD | Địa chỉ trụ sở chính (trên giấy tờ). KHÔNG phải địa chỉ kho hàng. |
| `foundedYear` | Integer | NO | Năm thành lập | VD: `2010`. Dùng để tính "Thâm niên hoạt động". |

#### C. Nhóm Brand Story (Câu chuyện thương hiệu - Widget Based)
*Mục đích: Cho phép Thương hiệu tự cấu hình thứ tự và loại nội dung hiển thị (Video, Text, Ảnh) để cá nhân hóa phong cách, tránh hiện tượng "trăm Shop như một".*

| Field Name | Type | Required | Description | Business Logic |
|:---|:---|:---|:---|:---|
| `brandStory.sections` | Array | YES | Danh sách các khối nội dung | Frontend render theo mảng `order`. |

**Các loại Section hỗ trợ (`type`):**
1. `TEXT_BLOCK`: Khối văn bản thuần (Plain text). Bố cục Native ổn định nhất.
2. `RICH_TEXT`: Văn bản có định dạng (Cấu trúc JSON Spans). Cho phép tùy chỉnh màu sắc thương hiệu.
3. `IMAGE_HERO`: Một ảnh banner lớn duy nhất trong Story.
4. `VIDEO_INTRO`: Video giới thiệu ngắn (Direct Link MP4).
5. `GALLERY_GRID`: Lưới ảnh (Dùng cho Chứng nhận, Giải thưởng, Showroom).
6. `TIMELINE`: Lịch sử hình thành (Dưới dạng các node thời gian).

**Đặc tả chi tiết Data theo từng `type`:**

| Type | Data Schema (JSON) | Description |
|:---|:---|:---|
| `TEXT_BLOCK` | `{ "title": "String", "content": "String" }` | Văn bản thuần. |
| `RICH_TEXT` | `{ "spans": [ { "text": "String", "style": { "bold": "Bool", "color": { "light": "Hex", "dark": "Hex" }, "size": "Int" } } ] }` | Hỗ trợ màu sắc theo Theme (Light/Dark) để tránh lỗi hiển thị trên nền tối. |
| `IMAGE_HERO` | `{ "thumbnailUrl": "Url", "originalUrl": "Url", "aspectRatio": "Float", "clickAction": { ... } }` | Banner lớn. `aspectRatio` = Width / Height. |
| `VIDEO_INTRO` | `{ "url": "String", "posterUrl": "String", "duration": "Integer", "isAutoplay": "Boolean", "isMuted": "Boolean", "controls": "Boolean", "aspectRatio": "Float" }` | Video MP4. `aspectRatio` = Width / Height. |
| `GALLERY_GRID` | `{ "columnCount": "Integer", "items": [ { "thumbnailUrl": "Url", "originalUrl": "Url", "clickAction": { ... } } ] }` | Lưới ảnh hỗ trợ cấu hình số cột (1-4). |
| `TIMELINE` | `{ "items": [ { "year": "String", "title": "String", "description": "String" } ] }` | Danh sách các cột mốc lịch sử. |

**Định nghĩa `clickAction` (Strictly Typed):**

| Action Type | Payload Structure | Description |
|:---|:---|:---|
| `INTERNAL_ROUTE` | `{ "screen": "Enum", "params": "Map" }` | Điều hướng nội bộ. Xem bảng **Navigation Registry** bên dưới. |
| `EXTERNAL_WEB` | `{ "url": "String" }` | Mở link ngoài qua Browser/WebView. |
| `VIEW_IMAGE` | `{ "imageUrl": "String", "zoomable": "Boolean" }` | Xem ảnh phóng to (Native Lightbox). |

**Bảng Navigation Registry (Internal Screens):**

| Screen Name | Mandatory Params | Description |
|:---|:---|:---|
| `PRODUCT_DETAIL` | `{ "id": "String" }` | Trang chi tiết sản phẩm. |
| `PRODUCT_LIST` | `{ "collectionId": "String" }` | Danh sách sản phẩm theo bộ sưu tập. |
| `CATEGORY_DETAIL`| `{ "categoryId": "Integer" }` | Trang danh mục sản phẩm (ID là số nguyên). |
| `VOUCHER_HUNT` | `{ "campaignId": "String" }` | Trang săn mã giảm giá. |

**Cấu trúc mẫu một Section (`TIMELINE` ví dụ):**
```json
{
  "type": "TIMELINE",
  "name": "brand_history",
  "title": "Hành trình phát triển",
  "order": 1,
  "data": {
    "items": [
      { "year": "1996", "title": "Khởi đầu", "description": "Gia nhập thị trường Việt Nam" },
      { "year": "2010", "title": "Đột phá", "description": "Xây dựng nhà máy SEVT lớn nhất thế giới" }
    ]
  }
}
```

#### D. Nhóm Support (Chăm sóc khách hàng & Hỗ trợ trực tiếp)
*Mục đích: Cung cấp kênh liên hệ trực tiếp của Hãng để hỗ trợ kỹ thuật và bảo hành (không thay thế kênh xử lý khiếu nại của Sàn).*

| Field Name | Type | Required | Description | Business Logic |
|:---|:---|:---|:---|:---|
| `hotline` | String | NO | Hotline hỗ trợ kỹ thuật | Tư vấn lắp đặt, hướng dẫn sử dụng sản phẩm. |
| `supportEmail` | String | NO | Email hỗ trợ bảo hành | Tiếp nhận thông tin bảo hành chính hãng từ thương hiệu. |
| `workingHoursDisplay` | String | NO | Giờ làm việc (Hiển thị) | VD: "Thứ 2 - Thứ 7 (08:00 - 20:00)". |
| `operatingHours` | Array | NO | Cấu hình giờ (Static) | Mảng 7 ngày. Mỗi ngày gồm `day` (1-7), `open` (số phút từ 0h), `close` (số phút từ 0h). |
| `holidays` | Array | NO | Danh sách ngày nghỉ lễ | Mảng các chuỗi ngày `YYYY-MM-DD`. |
| `returnPolicyUrl` | String | NO | Link chính sách riêng | Link dẫn đến trang bảo hành/đổi trả riêng của thương hiệu. |

---

## 3.3. [NEW] API STATS

**Endpoint**: `/api/v1/public/shops/{shopId}/stats`

| Field Name | Type | Description | Business Logic |
|:---|:---|:---|:---|
| `rating` | Float | Điểm đánh giá TB | Mặc định `null` cho Shop mới. UI hiển thị "Mới" hoặc "Chưa có". |
| `reviewCount` | Integer | Tổng số đánh giá | Mặc định `0`. |
| `followerCount` | Integer | Số người theo dõi | Mặc định `0`. |
| `responseRate` | Integer | Tỷ lệ phản hồi chat | Mặc định `null` nếu chưa có tương tác. UI hiển thị "-". |
| `joinedDate` | Date | Ngày tham gia sàn | Dùng để tính "Thâm niên". |


> **Developer Note (Mobile)**: Cần áp dụng **Optimistic UI**. Khi User bấm Follow, App lập tức đổi trạng thái nút và tự động `+1` số lượng hiển thị.

---

## 3.5. USER INTERACTION API

**Endpoint**: `/api/v1/user/interactions/shop?shopId={shopId}`

| Field Name | Type | Description |
|:---|:---|:---|
| `isFollowed` | Boolean | Trạng thái Follow của chính User đang login. |
| `isBlocked` | Boolean | Trạng thái chặn của User đối với Shop này. |

---

## 3.4. CHIẾN LƯỢC MỞ RỘNG & AN TOÀN DỮ LIỆU (Safety & Extension Strategy)

Để đảm bảo Mobile App không bị Crash khi hệ thống bổ sung các loại Widget mới trong tương lai, API quy định các nguyên tắc sau:

1.  **Cơ chế Fallback (Bắt buộc phía Client)**:
    *   Nếu App gặp một `type` chưa có trong bộ giải mã (VD: `MAP_LOCATION`), App **KHÔNG ĐƯỢC CRASH**.
    *   Hành vi: Bỏ qua (Skip) phần tử đó và tiếp tục render các Section tiếp theo. Thuật ngữ kỹ thuật: *Unknown Type Graceful Degradation*.

2.  **Versioning cho Brand Story**:
    *   Toàn bộ khối `brandStory` sẽ đi kèm một trường `version` (Integer).
    *   Giúp Frontend biết nên sử dụng bộ Parser nào nếu cấu trúc dữ liệu có sự thay đổi lớn về sau.

3.  **Validate tại Backend**:
    *   Backend phải kiểm tra tính hợp lệ của JSONB trước khi lưu. Đảm bảo mọi section bắt buộc phải có `type`, `order` và nội dung `data` tối thiểu không được null.

4.  **Trạng thái Rỗng (Empty States)**:
    *   **brandStory**: Nếu không có section nào, trả về mảng `sections: []`. App sẽ ẩn tab "Câu chuyện thương hiệu" hoặc hiển thị nội dung mặc định của sàn.
    *   **coverUrl**: Nếu Shop chưa upload cover, trả về `null`. App sử dụng ảnh placeholder mặc định hoặc gradient màu theo logo.
    *   **Hotline/Email**: Nếu để trống, App sẽ ẩn các nút tương ứng trong phần liên hệ, không để khoảng trắng vô nghĩa.

---

## 4. EXAMPLE JSON RESPONSE

```json
{
  "code": 200,
  "success": true,
  "data": {
    "identity": {
      "shopId": "uuid-v4-samsung-vina",
      "shopName": "Samsung Official Store",
      "slug": "samsung-official",
      "logoUrl": "https://cdn.san.com/shops/samsung/logo_2024.png",
      "coverDesktopUrl": "https://cdn.san.com/shops/samsung/cover_desktop.jpg",
      "coverMobileUrl": "https://cdn.san.com/shops/samsung/cover_mobile.jpg",
      "tagline": "Inspire the World, Create the Future",
    },
    "legal": {
      "isOfficial": true,
      "isMall": true,
      "companyName": "CÔNG TY TNHH ĐIỆN TỬ SAMSUNG VINA",
      "taxId": "0300900999",
      "registrationNumber": "411043000888",
      "headquarters": "Số 2, đường Hải Triều, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
      "foundedYear": 1996
    },
    "brandStory": {
      "version": 1,
      "sections": [
        {
          "type": "VIDEO_INTRO",
          "order": 1,
          "data": {
            "url": "https://cdn.san.com/shops/samsung/intro_video.mp4",
            "poster": "https://cdn.san.com/shops/samsung/video_poster.jpg",
            "duration": 45,
            "isAutoplay": true,
            "isMuted": true,
            "controls": false,
            "aspectRatio": 1.77
          }
        },
        {
          "type": "RICH_TEXT",
          "order": 2,
          "data": {
            "spans": [
              { 
                "text": "SAMSUNG VINA", 
                "style": { 
                  "bold": true, 
                  "color": { "light": "#034EA2", "dark": "#5B9BD5" }, 
                  "size": 18 
                } 
              },
              { "text": " cam kết mang đến những sản phẩm công nghệ đỉnh cao, kiến tạo tương lai tốt đẹp cho người Việt." }
            ]
          }
        },
        {
          "type": "GALLERY_GRID",
          "order": 3,
          "title": "Chứng nhận & Giải thưởng",
          "data": {
            "columnCount": 2,
            "items": [
              {
                "thumbnailUrl": "https://cdn.san.com/cert/iso9001_thumb.jpg",
                "originalUrl": "https://cdn.san.com/cert/iso9001_full.jpg",
                "clickAction": {
                  "type": "VIEW_IMAGE",
                  "payload": { "imageUrl": "https://cdn.san.com/cert/iso9001_full.jpg", "zoomable": true }
                }
              },
              {
                "thumbnailUrl": "https://cdn.san.com/cert/top1_brand_thumb.jpg",
                "originalUrl": "https://cdn.san.com/cert/top1_brand_full.jpg",
                "clickAction": {
                  "type": "EXTERNAL_WEB",
                  "payload": { "url": "https://news.samsung.com/vn/top-brand-2023" }
                }
              },
              {
                "thumbnailUrl": "https://cdn.san.com/shops/samsung/banner_thumb.jpg",
                "originalUrl": "https://cdn.san.com/shops/samsung/banner_full.jpg",
                "clickAction": {
                  "type": "INTERNAL_ROUTE",
                  "payload": {
                    "screen": "PRODUCT_LIST",
                    "params": { "collectionId": "summer-2024" }
                  }
                }
              }
            ]
          }
        },
        {
          "type": "TIMELINE",
          "order": 4,
          "title": "Cột mốc lịch sử",
          "data": {
            "items": [
              { "year": "1996", "title": "Gia nhập", "description": "Chính thức có mặt tại VN" },
              { "year": "2024", "title": "Kỷ nguyên AI", "description": "Dẫn đầu xu hướng Galaxy AI" }
            ]
          }
        }
      ]
    },
    "support": {
      "hotline": "1800 588 889",
      "supportEmail": "cskh@samsung.com",
      "workingHoursDisplay": "Thứ 2 - Thứ 7 (08:00 - 20:00)",
      "operatingHours": [
        { "day": 1, "open": 480, "close": 1200 },
        { "day": 2, "open": 480, "close": 1200 },
        { "day": 3, "open": 480, "close": 1200 },
        { "day": 4, "open": 480, "close": 1200 },
        { "day": 5, "open": 480, "close": 1200 },
        { "day": 6, "open": 480, "close": 1200 },
        { "day": 7, "open": null, "close": null }
      ],
      "holidays": ["2026-05-01", "2026-05-02"],
      "returnPolicyUrl": "https://samsung.com/vn/support/return-policy"
    }
  }
}
```

### 4.2. Example Response for Stats API
```json
{
  "code": 200,
  "success": true,
  "data": {
    "rating": 4.9,
    "reviewCount": 15420,
    "followerCount": 850000,
    "responseRate": 99,
    "joinedDate": "2018-05-20T00:00:00Z"
  }
}

### 4.3. Example Response for Interaction API
```json
{
  "code": 200,
  "success": true,
  "data": {
    "isFollowed": true,
    "isBlocked": false
  }
}
```
```

---

---

## 5. DATABASE MAPPING SUGGESTION (Tham khảo)

Dưới đây là gợi ý map các trường trên vào bảng `shops` và `shop_profiles` trong Database:

**Table `shops` (Thông tin cơ bản)**
- `id` (PK)
- `name`
- `slug`
- `status`
- `is_official` (Boolean)
- `is_mall` (Boolean)
- `rating_avg`
- `response_rate`

**Table `shop_profiles` (Thông tin mở rộng - Quan hệ 1:1 với shops)**
- `shop_id` (FK)
- `company_name` (Legal Name)
- `tax_id`
- `address_registration` (Headquarters)
- `founded_year`
- `logo_url`
- `cover_mobile_url`
- `brand_story_json` (JSONB - Lưu object chứa version và mảng các sections)
- `support_hotline`
- `support_email`
- `meta_data` (JSONB - Lưu các settings khác)

---
