# Kế hoạch frontend - AI Agent chuyển ảnh 2D sang mô hình 3D

## 1. Mục tiêu

Xây dựng giao diện web cho quy trình chuyển ảnh 2D thành mô hình 3D. Trải nghiệm trọng tâm là: người dùng tải ảnh lên, theo dõi tiến trình tạo model, thao tác trực tiếp với model 3D và tải kết quả.

Phạm vi của tài liệu này là kế hoạch frontend; chưa bao gồm mã nguồn triển khai.

## 2. Công nghệ đề xuất

- **React + TypeScript + Vite**: nền tảng phát triển giao diện.
- **Three.js qua React Three Fiber**: hiển thị và điều khiển model 3D.
- **CSS/Tailwind CSS hoặc CSS Modules**: xây dựng giao diện responsive.
- **Mock API trước, API thật sau**: cho phép hoàn thiện UX song song với backend và pipeline AI.

### Lưu ý về định dạng model

Trình duyệt nên xem model ở định dạng **`.glb` hoặc `.gltf`** vì được Three.js hỗ trợ tốt. File **`.blend`** vẫn có thể là đầu ra để người dùng tải về, nhưng không phải định dạng xem trực tiếp chính trên web.

## 3. Hướng thiết kế UI - lấy cảm hứng từ workflow Studio Tripo

### Điều nên kế thừa

- Đặt khu vực tạo model từ ảnh ở vị trí trung tâm ngay khi mở trang.
- Tạo cảm giác sản phẩm 3D chuyên nghiệp bằng dark theme và các lớp glassmorphism tiết chế.
- Dùng CTA nổi bật để người dùng luôn biết bước tiếp theo là tạo model.
- Cung cấp các lựa chọn chất lượng hoặc topology ngay trước khi chạy job.
- Đưa gallery và các bộ lọc model vào một khu vực khám phá riêng.

### Những điểm sẽ làm tốt hơn

- Không dùng nền quá nhiều chi tiết phía sau vùng thao tác: giữ tương phản cao để nội dung và trạng thái job dễ đọc.
- Tách rõ **nhập ảnh**, **thiết lập generation**, **tiến trình** và **kết quả** thay vì dồn tất cả vào một card.
- Đưa 3D Viewer thành nhân vật chính sau khi tạo model, không để gallery chiếm sự chú ý.
- Cho người dùng biết rõ job đang ở đâu, mất bao lâu, có thể huỷ/thử lại hay không và file nào sẵn sàng tải.
- Không sao chép logo, hình ảnh, tên gọi, màu vàng thương hiệu hoặc bố cục chính xác của Tripo.

### Visual direction đề xuất: "Precision Studio"

- **Bảng màu:** nền `#090B12`, panel `#121622`, viền `#2A3142`, chữ chính `#F5F7FB`.
- **Màu nhấn riêng:** tím điện `#7866FF`, cyan `#4EE1D1`, coral `#FF7D6E` chỉ dùng cho cảnh báo/trạng thái.
- **Typography:** sans-serif hiện đại, đậm và rõ ở tiêu đề; chữ mono cho job ID, phần trăm và dữ liệu kỹ thuật.
- **Bề mặt:** panel tối mờ, bóng nhẹ, viền 1px; tránh hiệu ứng blur dày khiến giao diện khó đọc.
- **3D stage:** nền grid/dot gradient rất nhẹ, có shadow mềm dưới model; không sử dụng ảnh hoặc asset của trang tham chiếu.

### Bố cục desktop sau khi có model

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Logo dự án       Projects / Gallery                  Credits / Profile    │
├───────────────┬──────────────────────────────────────────────┬───────────┤
│ SOURCE        │                                              │ INSPECTOR │
│ ảnh đầu vào   │                 3D VIEWER                    │ lighting  │
│ đổi ảnh       │          model + grid + loading state        │ material  │
│ chất lượng    │                                              │ wireframe │
│ tiến trình    │                                              │ camera    │
├───────────────┴──────────────────────────────────────────────┴───────────┤
│ Job complete · 01:42 · GLB ready                     Download GLB / BLEND │
└──────────────────────────────────────────────────────────────────────────┘
```

Trạng thái ban đầu dùng một vùng upload lớn ở trung tâm. Sau khi người dùng chọn ảnh, bố cục chuyển mượt sang workspace ba cột ở trên để model luôn là trọng tâm.

### Gallery

Gallery là trang hoặc drawer riêng, không đặt ngay bên dưới thao tác tạo model. Nội dung gồm ô tìm kiếm, chip lọc, lưới thumbnail và card có thông tin ngắn. Cách này vẫn giữ khả năng khám phá model nhưng không làm phân tán luồng tạo 2D → 3D.

## 4. Luồng trải nghiệm người dùng

```text
Trang chính
  -> Chọn hoặc kéo thả ảnh 2D
  -> Preview ảnh và kiểm tra file
  -> Nhấn Generate 3D
  -> Theo dõi tiến trình theo job
  -> Hiển thị model trong 3D Viewer
  -> Điều khiển model hoặc tải file đầu ra
```

Các trạng thái giao diện cần hỗ trợ:

- `idle`: chưa có ảnh được chọn.
- `uploading`: đang tải ảnh lên.
- `analyzing`: đang phân tích ảnh.
- `generating`: đang sinh model 3D.
- `processing`: đang hậu xử lý model.
- `completed`: model đã sẵn sàng.
- `failed`: quá trình thất bại, hiển thị lỗi và lựa chọn thử lại.

## 5. Cấu trúc giao diện

### Header

- Tên dự án.
- Chỉ báo trạng thái dịch vụ hoặc AI pipeline.

### Khu tải ảnh

- Kéo thả hoặc chọn ảnh từ máy tính.
- Kiểm tra định dạng và dung lượng tệp.
- Preview ảnh.
- Nút xoá/chọn ảnh khác.
- Nút **Generate 3D**.

### Khu tiến trình

- Liệt kê các bước: Uploading, Analyzing image, Generating 3D, Processing model, Done.
- Hiển thị phần trăm khi backend cung cấp.
- Hiển thị lỗi dễ hiểu và nút thử lại khi cần.

### 3D Viewer

- Canvas hiển thị model.
- Loading overlay khi model đang tải.
- Rotate, zoom và pan.
- Reset camera.
- Bật/tắt wireframe.
- Thay đổi background hoặc lighting nếu cần.

### Kết quả và tải file

- Tên job và thời gian xử lý.
- Các định dạng có thể tải: `.glb`, `.gltf`, `.blend` khi có.
- Nút tải file tương ứng.

### Mở rộng sau

- Danh sách các job gần đây.
- Lịch sử model đã tạo.
- Đăng nhập và lưu model theo người dùng.

## 6. Cấu trúc component dự kiến

```text
App
├── AppHeader
├── ImageUploadPanel
│   ├── Dropzone
│   └── ImagePreview
├── GenerationStatus
├── ModelViewer
│   ├── SceneControls
│   ├── LightingControls
│   └── ViewerToolbar
├── OutputDownloads
└── RecentJobs (giai đoạn sau)
```

## 7. Hợp đồng API cần thống nhất với backend

| Mục đích | API đề xuất | Kết quả cần dùng ở frontend |
| --- | --- | --- |
| Tạo job | `POST /jobs` | `jobId`, trạng thái ban đầu |
| Theo dõi job | `GET /jobs/:jobId` | trạng thái, phần trăm, thông báo lỗi, URL model |
| Tải model | `GET /jobs/:jobId/download?format=glb\|gltf\|blend` | file đầu ra |

Giai đoạn đầu có thể dùng polling định kỳ cho `GET /jobs/:jobId`. Khi hệ thống ổn định, có thể chuyển sang SSE hoặc WebSocket để tiến trình cập nhật thời gian thực.

## 8. Lộ trình triển khai

1. Khởi tạo project và dựng layout/trang chính.
2. Hoàn thiện upload, preview và validation file với mock API.
3. Xây dựng UI tiến trình cho toàn bộ workflow tạo model.
4. Tích hợp 3D Viewer cho file `.glb/.gltf`, gồm điều khiển camera và wireframe.
5. Kết nối API backend thật, xử lý lỗi và retry.
6. Hoàn thiện responsive, accessibility, empty/loading/error states.
7. Kiểm thử với ảnh lỗi, job chậm, model lớn và link tải bị hỏng.

## 9. Kết quả mong đợi của giai đoạn frontend đầu tiên

Một giao diện hoàn chỉnh về trải nghiệm, sử dụng mock data/API, cho phép nhóm kiểm tra và chốt UX trước khi backend và AI pipeline hoàn thiện. Khi backend sẵn sàng, frontend chỉ cần thay lớp gọi API và kết nối URL model thực tế.
