# Backend

Thư mục dành cho server API và tích hợp AI. Hiện chưa có server chạy được; công nghệ backend sẽ do nhóm phụ trách lựa chọn.

## Phạm vi dự kiến

- Nhận và kiểm tra ảnh upload.
- Tạo job, theo dõi trạng thái, xử lý hàng đợi và lỗi.
- Gọi model/API Image-to-3D.
- Lưu file model và trả URL GLB cho frontend.
- Cung cấp tải model; chuyển đổi sang `.blend` nếu triển khai Blender ở backend.

## Hợp đồng API đề xuất

- `POST /jobs`: nhận ảnh, trả `jobId`.
- `GET /jobs/:jobId`: trả trạng thái, tiến trình, lỗi và URL model.
- `GET /jobs/:jobId/download?format=glb`: tải file đầu ra; thêm định dạng khi backend hỗ trợ.

Giữ dependencies, cấu hình và test backend trong thư mục này. Khi triển khai, bổ sung hướng dẫn cài đặt, biến môi trường và lệnh chạy vào README này. Không đưa khoá API bí mật vào frontend hoặc Git.
