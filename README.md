# FORM / STUDIO

Frontend demo cho ứng dụng chuyển ảnh 2D thành mô hình 3D, giao diện tiếng Việt lấy cảm hứng từ mockup đã chốt.

## Chạy tại máy

```sh
npm install
npm run dev
```

Mở địa chỉ Vite in trong terminal. Kiểm tra bản build bằng `npm run build`.

## Tính năng

- Upload/kéo thả PNG, JPG, WEBP tối đa 10 MB; kiểm tra định dạng, dung lượng và giải mã ảnh.
- Bốn mẫu 3D dựng bằng Three.js: robot, bình gốm, tên lửa, thỏ.
- Mô phỏng job theo các bước, chất lượng nhanh/chi tiết, tuỳ chọn texture, huỷ tác vụ.
- Viewer 3D thật: orbit, pan, zoom, reset, fullscreen, ảnh PNG.
- Vật liệu xem trước, ánh sáng, background, wireframe, grid, auto-rotate.
- Nhập GLB độc lập tối đa 50 MB; xuất GLB, OBJ hình học, STL hình học.
- Gallery lọc/tìm kiếm, thư viện job với localStorage, mở lại mẫu và xác nhận xoá.
- Responsive, nhãn truy cập, focus bàn phím và modal có focus trap.

## Giới hạn demo

Chưa gọi AI: ảnh người dùng không được chuyển thành mesh. Kết quả là model mẫu được chọn. Chất lượng ảnh và texture là cấu hình job demo, chưa thay đổi hình học sinh ra. Import GLB hiện chỉ tồn tại trong phiên làm việc; thư viện lưu metadata của job mẫu, không lưu file của người dùng. Xuất .blend cần backend Blender; UI hướng dẫn nhập GLB vào Blender. OBJ không kèm MTL/texture. STL cần kiểm tra và sửa mesh trước khi in 3D.

Font tải từ Google Fonts, có sans-serif dự phòng. Dependencies được bundle vào build, không phụ thuộc CDN runtime cho Three.js hoặc React.

## Cấu trúc

- `src/main.jsx`: UI, quản lý job, thư viện, modal và thao tác file.
- `src/scene.js`: Three.js scene, procedural models, controls, import/export.
- `src/style.css`: thiết kế và responsive.

API tích hợp sau: thay bộ đếm demo bằng `POST /jobs` và polling/SSE, tải URL GLB kết quả vào viewer, chuyển thư viện sang backend. Không đưa khoá API bí mật vào frontend.
