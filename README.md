# 🔗 Babe URL Shortener

Hệ thống rút gọn URL tĩnh (Static URL Shortener) hoạt động 100% trên hạ tầng GitHub (Pages, Actions, và Issues). Giải pháp này hoàn toàn miễn phí, bảo mật và không cần máy chủ riêng.

## ✨ Tính năng nổi bật

- **Serverless & Static:** Chạy hoàn toàn trên GitHub Pages.
- **Tự động hóa:** Sử dụng GitHub Actions để xử lý yêu cầu rút gọn link thông qua GitHub Issues.
- **Tùy chỉnh Alias:** Cho phép người dùng tự chọn bí danh (alias) cho liên kết.
- **Mã QR:** Tự động tạo mã QR cho mỗi liên kết được rút gọn.
- **Giao diện hiện đại:** Hỗ trợ Chế độ tối (Dark Mode) và phong cách thiết kế Glassmorphism chuyên nghiệp.
- **Lịch sử liên kết:** Hiển thị danh sách các liên kết đã tạo gần đây.

## 🚀 Cách thức hoạt động

Dự án này sử dụng một quy trình làm việc độc đáo để duy trì tính chất "tĩnh" nhưng vẫn có khả năng xử lý dữ liệu:

1. **Yêu cầu (Frontend):** Người dùng nhập URL gốc vào form. Hệ thống chuẩn bị một URL dẫn đến trang tạo "New Issue" trên GitHub với các tham số điền sẵn.
2. **Xử lý (GitHub Actions):** Khi Issue được tạo, một workflow (`shorten.yml`) sẽ tự động:
   - Trích xuất URL và Alias từ Issue.
   - Tạo thư mục điều hướng (ví dụ: `s/alias/index.html`) sử dụng thẻ meta refresh để chuyển hướng.
   - Cập nhật cơ sở dữ liệu dạng JSON (`links.json`).
   - Tự động đóng Issue và thông báo thành công.
3. **Hiển thị:** Trang chủ sẽ fetch file `links.json` để cập nhật bảng danh sách liên kết mới nhất.

## 🛠️ Cài đặt và Triển khai

Để sở hữu hệ thống rút gọn URL của riêng bạn, hãy làm theo các bước sau:

1. **Fork Repository này:** Nhấn nút **Fork** ở góc trên bên phải trang web.
2. **Kích hoạt GitHub Pages:**
   - Vào phần **Settings** > **Pages**.
   - Chọn nhánh `main` (hoặc `master`) và thư mục `/ (root)`.
   - Lưu lại và đợi GitHub cung cấp URL (ví dụ: `https://username.github.io/babe/`).
3. **Cấu hình Token (Nếu cần):**
   - Workflow thường cần quyền `contents: write` và `issues: write`. Hãy đảm bảo cấu hình trong `Settings > Actions > General > Workflow permissions` là "Read and write permissions".
4. **Sử dụng:** Truy cập vào URL GitHub Pages của bạn và bắt đầu rút gọn liên kết!

## 📂 Cấu trúc thư mục

```text
├── .github/
│   ├── ISSUE_TEMPLATE/  # Mẫu Issue để người dùng điền thông tin
│   └── workflows/       # GitHub Action xử lý rút gọn link
├── s/                   # (Tự động tạo) Chứa các liên kết đã rút gọn
├── index.html           # Giao diện người dùng chính
├── script.js            # Logic xử lý Frontend
├── style.css            # Ngôn ngữ thiết kế và giao diện
├── links.json           # "Cơ sở dữ liệu" lưu trữ danh sách link
└── qrcode.min.js        # Thư viện tạo mã QR
```

## 📝 Giấy phép

Dự án này là mã nguồn mở. Bạn có thể tự do sử dụng và chỉnh sửa cho mục đích cá nhân hoặc thương mại.
