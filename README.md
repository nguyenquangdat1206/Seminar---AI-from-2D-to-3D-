# Seminar — AI từ ảnh 2D sang mô hình 3D

Repository chung được chia theo phần việc để frontend và backend phát triển độc lập.

```text
frontend/              Giao diện React + Vite, viewer Three.js
  src/                 Mã nguồn giao diện và viewer
  package.json         Dependencies và scripts của frontend
  package-lock.json    Khoá phiên bản dependencies frontend
  plan-frontend.md     Kế hoạch giao diện
  README.md            Tính năng và giới hạn bản demo
backend/               Khu vực dành cho API và tích hợp AI
  README.md            Phạm vi backend dự kiến
.gitignore             Quy tắc bỏ qua file sinh ra và cấu hình riêng
```

## Chạy frontend

Từ thư mục gốc repository:

```sh
cd frontend
npm install
npm run dev
```

Kiểm tra bản build bằng `npm run build` trong `frontend/`.

Chi tiết: [frontend/README.md](frontend/README.md).

## Backend

Chưa triển khai backend. Thành viên phụ trách thêm mã nguồn, dependencies và cấu hình trong `backend/`. Xem [backend/README.md](backend/README.md).

Frontend hiện mô phỏng quy trình AI; ảnh tải lên chưa được chuyển thành mô hình 3D thật.

## Quy ước làm việc

- Thay đổi giao diện, viewer và dependencies JavaScript trong `frontend/`.
- Thay đổi API, xử lý job và tích hợp model AI trong `backend/`.
- Thống nhất hợp đồng API giữa hai phần trước khi tích hợp.
- Không commit dependencies đã cài, file build, môi trường ảo hoặc file `.env` chứa bí mật. Có thể commit `.env.example` với giá trị mẫu.

Việc tách thư mục giảm chồng chéo mã nguồn; các thay đổi trên cùng một file vẫn cần phối hợp khi merge.
