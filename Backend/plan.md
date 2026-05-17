# Tổng quan Dự án: Ecommerce Car Backend

Tài liệu này tổng hợp lại toàn bộ những chức năng đã được xây dựng thành công và lộ trình sắp tới để hoàn thiện hệ thống Backend cho nền tảng Thương mại Điện tử bán Xe hơi.

---

## 🟢 Những gì ĐÃ LÀM ĐƯỢC (Hoàn thành 100%)

Hệ thống đã xây dựng xong toàn bộ nền tảng (Foundation), Xác thực (Auth) và Cốt lõi sản phẩm (Product Core) với kiến trúc chuẩn Modular Monolith.

### 1. Nền tảng & Bảo mật (Base Setup & Security)
- **Kiến trúc:** Cấu trúc theo chuẩn Service Layer & Repository Pattern, giúp code dễ maintain và scale.
- **Xử lý Lỗi (Error Handling):** Xây dựng class `AppError` và middleware bắt lỗi tập trung (Centralized Error Handler).
- **Rate Limiting:** Sử dụng Redis để giới hạn request (chống spam login, đăng ký, gửi OTP).
- **Authentication & Authorization:**
  - Login/Register kèm xác thực Email (Gửi mã OTP qua Mailtrap).
  - Quản lý phân quyền (Role-based) cho User thường và Admin.
  - Sử dụng JWT Access Token và Refresh Token.
  - **Bảo mật cao cấp:** Refresh Token Rotation (lưu trong Redis, tự xoay vòng, tự hủy mọi session nếu phát hiện bị lấy cắp token).
  - Chức năng Logout (xóa Redis, xóa Cookie) và Quên mật khẩu (OTP).

### 2. Phase 1: Core Catalog (Quản lý Danh mục)
Xây dựng nền tảng dữ liệu ít thay đổi để làm cơ sở cho sản phẩm chính.
- **Module Brand (Thương hiệu):** CRUD, tự động sinh `slug` từ tên.
- **Module Category (Kiểu dáng/Phân khúc):** CRUD, tự động sinh `slug`.
- **Module Banner:** Quản lý quảng cáo, slider trên trang chủ.
- **Module Post:** Quản lý bài viết blog, review xe.
*(Tất cả API thao tác sửa đổi đều được bảo vệ bởi quyền Admin)*

### 3. Phase 2: Car Management (Quản lý Sản phẩm Xe)
Đây là module phức tạp và quan trọng nhất của dự án.
- **Tích hợp Cloudinary:** Upload ảnh an toàn, tự động cấu hình qua Multer. Cung cấp API upload 1 ảnh (logo) hoặc nhiều ảnh cùng lúc (car images).
- **Thiết kế Database Tối ưu (MongoDB):** 
  - Mảng `images` và `features` được nhúng trực tiếp (Embedded Documents) vào `Car` Schema thay vì tạo bảng rời -> Tốc độ truy vấn cực nhanh.
  - Tự động sinh `slug`, thiết lập các khóa tham chiếu tới `Brand` và `Category`.
  - Đánh `Indexes` đầy đủ cho `price`, `year`, `fuel_type`, `brand_id`, v.v.
- **Advanced Filtering & Pagination:**
  - Viết logic tìm kiếm nâng cao: lọc theo giá (`minPrice`, `maxPrice`), search text (`regex`), lọc theo bất kỳ thuộc tính nào.
  - Hỗ trợ Sắp xếp (Sort theo giá, mới nhất, bán chạy) và Phân trang (Pagination).
- **Homepage APIs:** Tách riêng các API để Frontend gọi cho trang chủ: Xe nổi bật (`/featured`), Xe mới (`/newest`), Xe bán chạy (`/best-sellers`).
Hỗ trợ theo slug
---

## 🟡 Những gì SẮP TỚI SẼ LÀM (Lộ trình tiếp theo)

### Phase 3: Order & Checkout (Quy trình Mua hàng)
Đây là bước biến người xem thành khách hàng.
1. **Module Order & Order Item:** 
   - Thiết kế Database cho Đơn đặt cọc / Giỏ hàng xe.
   - Lưu trữ trạng thái đơn hàng: `pending`, `confirmed`, `shipping`, `completed`, `cancelled`.
2. **Xử lý Transaction (Giao dịch Mongoose):**
   - Đảm bảo tính toàn vẹn: Khi khách đặt hàng thành công, phải giảm `stock` của xe đi tương ứng và tăng `sold_count` lên. Nếu có lỗi giữa chừng, tự động rollback (hủy) toàn bộ thay đổi.
3. **Thanh toán (Payment Method):**
   - Xử lý luồng tạo thông tin phương thức thanh toán (`cash` hoặc `banking`).

### Phase 4: User Interactions (Tương tác Cộng đồng)
Giúp trang web có tính xác thực và sống động hơn.
1. **Module Review:**
   - Cho phép người dùng đánh giá (rating 1-5 sao) và bình luận vào chiếc xe đã mua/quan tâm.
2. **Aggregation Pipeline:**
   - Sử dụng công cụ gộp nhóm (Aggregation) của MongoDB để tự động tính toán tổng số lượt đánh giá và số điểm Rating trung bình của mỗi chiếc xe.

### Phase 5: Hoàn thiện & Triển khai
- Kiểm tra lại toàn bộ validation.
- Làm sạch code, chuẩn hóa Response trả về cho Frontend (CORS, Headers).
- Hỗ trợ tạo file cấu hình Docker nếu cần chạy hệ thống thực tế.

---

> Kế hoạch này được thiết kế bám sát vào yêu cầu thiết kế Database gốc, đảm bảo tính ứng dụng cao và phù hợp để mang đi deploy thành một dự án thực tế!
