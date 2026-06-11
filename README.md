<!-- Banner -->

<p align="center">
  <a href="https://www.uit.edu.vn/" title="Trường Đại học Công nghệ Thông tin">
    <img src="https://i.imgur.com/WmMnSRt.png" alt="Trường Đại học Công nghệ Thông tin | University of Information Technology">
  </a>
</p>

<h1 align="center"><b>Đồ họa máy tính</b></h1>
<h2 align="center"><b>Sci-Fi Shooting Range 3D</b></h2>

## THÀNH VIÊN NHÓM

| STT | MSSV     | Họ và Tên         |
| --- | -------- | ----------------- |
| 1   | 23520070 | Phạm Ngô Quốc Anh |
| 2   | 23520514 | Đoàn Thái Hoàng   |

## GIỚI THIỆU MÔN HỌC

* **Tên môn học:** Đồ họa máy tính
* **Mã môn học:** CS105.Q22
* **Năm học:** HK2 (2025 - 2026)
* **Giảng viên:** Cáp Phạm Đình Thăng

## MÔ TẢ DỰ ÁN

Đây là đồ án môn học xây dựng một **sân tập bắn súng 3D phong cách khoa học viễn tưởng (Sci-Fi Shooting Range)** sử dụng thư viện **Three.js**. Người chơi có thể điều khiển nhân vật, thay đổi góc nhìn camera, điều chỉnh ánh sáng, thay đổi texture môi trường và bắn hạ các mục tiêu trong không gian 3D tương tác.

Mục tiêu của dự án:

* Áp dụng kiến thức về đồ họa 3D, phép biến đổi hình học, camera, vật liệu và ánh sáng.
* Thực hành làm việc với mô hình 3D, texture, animation và tương tác người dùng.
* Tìm hiểu quy trình phát triển ứng dụng đồ họa web bằng Three.js và ES Modules.

---

## CẤU TRÚC DỰ ÁN

```text
gamebansung/
│
├── index.html              # Trang web chính
├── main.js                 # Khởi tạo Three.js và vòng lặp chính
├── camera.js               # Quản lý các chế độ camera
├── gameplay.js             # Điều khiển nhân vật, bắn đạn, va chạm
├── lighting.js             # Hệ thống ánh sáng
├── environment.js          # Xây dựng môi trường và các đối tượng trong cảnh
├── css/
│   └── style.css           # Giao diện người dùng (HUD)
└── assets/
    ├── models/             # Các mô hình FBX
    └── textures/           # Texture sử dụng trong dự án
```

---

## CÁC TÍNH NĂNG CHÍNH

### 1. Hệ thống camera

* **Camera Panoramic (Mode 1):** Góc nhìn tự do, cho phép di chuyển bằng WASD và xoay góc nhìn bằng chuột.
* **Camera Third-Person (Mode 2):** Camera theo sau nhân vật từ góc nhìn phía sau.
* Chuyển đổi giữa hai chế độ bằng phím **1** và **2**.

### 2. Nhân vật và Animation

* Mô hình nhân vật được tải từ các tệp FBX.
* Hỗ trợ animation cho các trạng thái:

  * Idle
  * Chạy tiến
  * Chạy lùi
  * Di chuyển sang trái
  * Di chuyển sang phải
* Sử dụng `AnimationMixer` để chuyển đổi animation mượt mà.
* Hiển thị mô hình thay thế tạm thời trong khi dữ liệu FBX đang được tải.

### 3. Điều khiển nhân vật

* **W**: Tiến
* **S**: Lùi
* **A**: Sang trái
* **D**: Sang phải
* Chuột dùng để xoay góc nhìn khi Pointer Lock được kích hoạt.
* Giới hạn góc nhìn theo trục dọc để tránh lật ngược camera.

### 4. Hệ thống bắn đạn

* Nhấn giữ chuột trái để bắn liên tục.
* Có thời gian hồi chiêu giữa các phát bắn.
* Đạn được biểu diễn bằng các vật thể phát sáng màu vàng.
* Hướng bắn được xác định theo hướng ngắm của người chơi.
* Hệ thống kiểm tra va chạm với mục tiêu theo khoảng cách.
* Mục tiêu bị bắn trúng sẽ phát hiệu ứng và bị loại khỏi cảnh.

### 5. Hệ thống ánh sáng

* **AmbientLight:** Ánh sáng nền cho toàn bộ cảnh.
* **DirectionalLight:** Nguồn sáng chính mô phỏng ánh nắng hoặc đèn chiếu.
* **PointLight:** Bổ sung ánh sáng cục bộ cho môi trường.
* **Muzzle Flash:** Hiệu ứng lóe sáng ngắn tại đầu nòng súng khi bắn.

### 6. Môi trường 3D

* Sàn và trần có thể thay đổi texture.
* Hệ thống tường bao quanh sân tập.
* Các chi tiết trang trí theo phong cách khoa học viễn tưởng:

  * Cột năng lượng
  * Đường viền phát sáng
  * Tháp điều khiển trung tâm
  * Drone bay tuần tra
  * Hệ thống hạt (particle effects)
  * Thùng hàng và thùng nhiên liệu
  * Robot tuần tra

### 7. Mục tiêu (Targets)

* Tổng cộng 20 mục tiêu được bố trí trong sân tập.
* Mỗi mục tiêu bao gồm:

  * Bệ đỡ
  * Giáp bảo vệ
  * Lõi năng lượng
  * Vòng phát sáng
* Khi bị bắn trúng:

  * Lõi năng lượng phát sáng.
  * Các thành phần mở rộng và thu lại.
  * Mục tiêu biến mất sau hiệu ứng.
* Điểm số được cập nhật theo thời gian thực.

### 8. Giao diện người dùng (HUD)

#### Bảng điều khiển

* Chọn texture sàn:

  * Digital Grid
  * Brick
  * Metal
  * Ảnh tùy chỉnh
* Điều chỉnh vị trí camera.
* Điều chỉnh thông số Near/Far.
* Điều chỉnh cường độ ánh sáng.
* Nút **Restart Game** để khởi động lại trò chơi.

#### HUD trong trò chơi

* Hiển thị số mục tiêu đã tiêu diệt.
* Hiển thị tâm ngắm ở chế độ Third-Person.
* Hiển thị hướng dẫn điều khiển cơ bản.

### 9. Tính năng bổ sung

* Phím **P** để tạm dừng hoặc tiếp tục trò chơi.
* Con lăn chuột để thay đổi góc nhìn (FOV).
* Tự động cập nhật renderer khi thay đổi kích thước cửa sổ.

---

## CÔNG NGHỆ SỬ DỤNG

| Thành phần       | Mô tả                                  |
| ---------------- | -------------------------------------- |
| Three.js         | Thư viện đồ họa 3D trên nền WebGL      |
| ES Modules       | Tổ chức mã nguồn theo module           |
| FBXLoader        | Tải mô hình FBX                        |
| TextureLoader    | Tải texture                            |
| AnimationMixer   | Quản lý animation                      |
| Raycaster        | Xác định hướng bắn và kiểm tra va chạm |
| Pointer Lock API | Hỗ trợ điều khiển góc nhìn bằng chuột  |
| HTML/CSS         | Xây dựng giao diện điều khiển          |

---

## HƯỚNG DẪN CHẠY DỰ ÁN

> Dự án không yêu cầu build. Chỉ cần chuẩn bị tài nguyên và chạy thông qua một web server cục bộ.

### Bước 1: Tải mô hình nhân vật (FBX)

Do dung lượng lớn nên các file mô hình nhân vật FBX không được lưu trực tiếp trong repository.

1. Truy cập thư mục Google Drive:

   https://drive.google.com/drive/u/0/folders/162QQ3TBmSIooeRTdNzsmWf2eKg07p-W6

2. Tải toàn bộ các file FBX trong thư mục.

3. Trong thư mục dự án, tạo cấu trúc:

   ```text
   assets/
   └── models/
   ```

4. Sao chép toàn bộ các file FBX đã tải vào thư mục `assets/models/`.

Ví dụ:

```text
assets/
└── models/
    ├── Rifle_Idle.fbx
    ├── Rifle_Run.fbx
    ├── Run_Left.fbx
    ├── Run_Right.fbx
    └── Run_Backward.fbx
```

> **Lưu ý:** Nếu không thực hiện bước này, trò chơi vẫn chạy bình thường nhưng nhân vật sẽ được hiển thị bằng mô hình hình khối (placeholder) thay vì mô hình nhân vật đầy đủ.

---

### Bước 2: Chạy web server

#### Cách 1: Visual Studio Code + Live Server

1. Mở thư mục dự án bằng VS Code.
2. Cài đặt extension **Live Server**.
3. Mở file `index.html`.
4. Chọn **Open with Live Server**.

#### Cách 2: Python

```bash
cd gamebansung
python -m http.server 8000
```

Sau đó truy cập:

```text
http://localhost:8000
```

#### Cách 3: Node.js

```bash
npx serve
```

hoặc

```bash
npx http-server
```

Sau đó truy cập địa chỉ được hiển thị trên terminal.

---

### Bước 3: Chờ tải tài nguyên

- Khi trò chơi khởi động, hệ thống sẽ tải các texture và mô hình FBX.
- Quá trình tải có thể mất vài giây tùy cấu hình máy và tốc độ ổ cứng.
- Sau khi hoàn tất, nhân vật và toàn bộ môi trường 3D sẽ xuất hiện trong màn chơi.

---

### Bước 4: Trải nghiệm trò chơi

| Phím | Chức năng |
|--------|------------|
| W | Di chuyển tiến |
| S | Di chuyển lùi |
| A | Di chuyển trái |
| D | Di chuyển phải |
| Chuột | Ngắm |
| Chuột trái | Bắn |
| 1 | Camera Panoramic |
| 2 | Camera Third-Person |
| P | Tạm dừng/Tiếp tục |

1. Chọn chế độ camera bằng phím **1** hoặc **2**.
2. Click vào màn hình để kích hoạt Pointer Lock.
3. Di chuyển bằng WASD.
4. Sử dụng chuột để ngắm mục tiêu.
5. Giữ chuột trái để bắn.
6. Thay đổi texture sàn và ánh sáng bằng bảng điều khiển bên trái.

---

### Lưu ý

- Không mở trực tiếp bằng `file://`.
- Luôn chạy thông qua web server để tránh lỗi CORS.
- Nếu mô hình nhân vật không xuất hiện, hãy kiểm tra lại thư mục `assets/models/` và các file FBX.
- Dự án được tối ưu cho máy tính sử dụng chuột và bàn phím.

