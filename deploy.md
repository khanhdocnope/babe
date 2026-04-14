# 🚀 Hướng Dẫn Triển Khai (Deployment) Lên GitHub

Để hệ thống rút gọn URL hoạt động, bạn cần thực hiện đầy đủ các bước cấu hình dưới đây trên GitHub của mình.

## Bước 1: Tạo Repository và Đẩy Code Lên

1.  Tạo một repository mới trên GitHub (Ví dụ tên: `babe`).
2.  Mở terminal tại thư mục dự án trên máy tính của bạn và chạy các lệnh:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/USER_CUA_BAN/TEN_REPO.git
    git push -u origin main
    ```

## Bước 2: Kích Hoạt GitHub Pages

1.  Truy cập vào Repository trên GitHub.
2.  Vào mục **Settings** -> **Pages**.
3.  Tại phần **Build and deployment**, mục **Branch**, chọn nhánh `main` và thư mục `/(root)`. Nhấn **Save**.
4.  Đợi khoảng 1-2 phút, bạn sẽ nhận được địa chỉ web (VD: `https://username.github.io/babe/`).

## Bước 3: Cấu Hình Quyền Cho GitHub Actions (Rất Quan Trọng ⚠️)

Mặc định, GitHub Actions không có quyền ghi vào repository. Bạn phải cấp quyền để nó có thể tạo file rút gọn link:

1.  Vào mục **Settings** -> **Actions** -> **General**.
2.  Cuộn xuống dưới cùng tìm mục **Workflow permissions**.
3.  Chọn **Read and write permissions**.
4.  Tích chọn ô **Allow GitHub Actions to create and approve pull requests**.
5.  Nhấn **Save**.

## Bước 4: Kiểm Tra Template Issue

Đảm bảo bạn đã có thư mục `.github/ISSUE_TEMPLATE/shorten_link.yml`. Đây là mẫu form để người dùng điền thông tin khi muốn rút gọn link. Hệ thống của bạn đã có sẵn file này.

## Bước 5: Cấu Hình URL (Nếu Cần)

Mở file `index.html`, tìm hàm `getGitHubUrlInfo`. 
*   Nếu bạn dùng tên miền mặc định của GitHub (`github.io`), hệ thống sẽ **tự động** nhận diện.
*   Nếu bạn dùng tên miền tùy chỉnh (Custom Domain), hãy sửa dòng:
    `return "VUI_LONG_THAY_DOI/TEN_REPO";` 
    thành tên của bạn (VD: `khanhdocnope/babe`).

---

### ✅ Hoàn tất!
Bây giờ bạn có thể truy cập trang web của mình, thử rút gọn một liên kết và xem điều kỳ diệu xảy ra trong tab **Actions** và **Issues** của Repository!
