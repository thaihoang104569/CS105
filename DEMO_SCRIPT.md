# 🎮 KỊCH BẢN DEMO LIVE - Sci-Fi Shooting Range 3D

**Thời gian:** ~15 phút  
**Người dùng:** Giáo viên / Bộ môn Đồ họa Máy Tính

---

## **CHUẨN BỊ TRƯỚC (Pre-Demo)**

- ✅ Mở VS Code → Live Server trên `index.html`
- ✅ Mở trình duyệt ở địa chỉ `http://localhost:5500`
- ✅ Test game load đầy đủ (không lỗi console)
- ✅ Có sẵn file texture để upload (ảnh 512×512 tốt nhất)

---

## **BƯỚC 1: KHỞI ĐỘNG & GIỚI THIỆU TỔNG QUAN (1-2 phút)**

### **Action:**
- Mở trình duyệt
- Game đã sẵn sàng trên màn hình

### **Lời nói:**
```
"Chào cô/thầy. Đây là dự án Sci-Fi Shooting Range 3D - 
một trò chơi bắn súng 3D được xây dựng hoàn toàn bằng Three.js.

Bên trái là bảng điều khiển để test các tính năng.
Phần lớn là canvas 3D ở giữa.
Chúng ta sẽ đi qua từng tính năng một để show cách ứng dụng 
các kỹ thuật đồ họa đã học."
```

---

## **BƯỚC 2: GIỚI THIỆU CÁC HÌNH HỌC 3D (2 phút)**

### **Action:**
1. Nhấn phím **`1`** → Chuyển sang **Panoramic Camera** (góc nhìn rộng)
2. Quan sát scene từ trên cao

### **Lời nói:**
```
"Nhìn vào scene này - đây là toàn bộ môi trường 3D được xây dựng 
bằng các hình hộp (BoxGeometry):

- SÀNG NHỊ (Ground): 240×240 đơn vị - sàn chính
- TƯỜNG × 4: Bao quanh xung quanh 
- TRẦN NHÀ: Phía trên
- CÁC TRỤ TRANG TRÍ: 14 trụ metallic

Những hình trụ (CylinderGeometry) ở phía trên kia là:
- Giá đỡ chiếu sáng
- Vỏ chiếu sáng (projector)
- Ống kính phát sáng

Tất cả các hình này được tạo bằng Three.js geometry API."
```

---

## **BƯỚC 3: GIỚI THIỆU HỆ THỐNG CAMERA (2 phút)**

### **Action:**
1. Nhấn phím **`2`** → Chuyển sang **Third-Person Camera** (nhìn từ phía sau)
2. Quan sát nhân vật xuất hiện giữa màn hình
3. Quan sát dấu **+** (crosshair) ở giữa

### **Lời nói:**
```
"Bây giờ chúng ta chuyển sang camera thứ hai - Third-Person camera.
Camera này theo dõi nhân vật từ phía sau.

Trong code, chúng ta có hai loại camera:
1. PANORAMIC - góc nhìn tự do, không theo player
2. THIRD-PERSON - luôn ở phía sau player

Mỗi camera là một PerspectiveCamera với FOV, near/far khác nhau.
Có thể điều chỉnh những thông số này qua UI bên trái.

Dấu + này gọi là CROSSHAIR - dùng để ngắm bắn."
```

---

## **BƯỚC 4: PHÉP BIẾN ĐỔI HÌNH HỌC - DI CHUYỂN (2 phút)**

### **Action:**
1. Nhấn và giữ phím **`W`** → Nhân vật di chuyển về phía trước
2. Nhấn **`A`** → Di chuyển sang trái
3. Nhấn **`D`** → Di chuyển sang phải
4. Nhấn **`S`** → Lùi lại
5. Quan sát camera luôn theo sát

### **Lời nói:**
```
"Di chuyển bằng WASD - đây là PHÉP TỊNH TIẾN (Translation).

Kỹ thuật:
- W/S: Tính toán vector hướng trước/sau player
- A/D: Tính toán vector trái/phải dựa trên góc yaw
- Mỗi frame (60fps): Cập nhật position += direction × speed

Công thức vector:
  direction = normalize(Vector3(0, 0, -1))
  direction.rotate(yAxis, player.rotation.y)
  player.position += direction × moveSpeed

Camera third-person tự động theo dõi vị trí mới của player."
```

---

## **BƯỚC 5: PHÉP BIẾN ĐỔI HÌNH HỌC - XOAY (1-2 phút)**

### **Action:**
1. **Rê chuột** sang trái/phải trên màn hình → Nhân vật xoay
2. Quan sát nhân vật quay mượt mà
3. Tiếp tục di chuyển (WASD) trong khi xoay

### **Lời nói:**
```
"Khi rê chuột - đây là PHÉP QUAY (Rotation).

Kỹ thuật:
- Theo dõi mouse delta: ΔX từ vị trí cũ đến mới
- Xoay quanh trục Y: player.rotation.y += ΔX × sensitivity
- Camera third-person tự động điều chỉnh góc nhìn

Công thức:
  rotation = AxisAngle(axis: (0, 1, 0), angle: mouseX)
  applyRotation(player, rotation)

Di chuyển + Xoay cùng lúc → tạo cảm giác điều khiển tự nhiên."
```

---

## **BƯỚC 6: CHIẾU SÁNG - AMBIENT LIGHT (1-2 phút)**

### **Action:**
1. Quan sát hiện tại scene sáng, có độ sâu
2. Kéo slider **Ambient Intensity** từ 0.68 → 0 (tối hoàn)
3. Lưu ý: Tất cả object vẫn còn hình dáng nhưng rất tối
4. Kéo slider lên 1.2 (sáng tối đa)
5. Quan sát scene rất sáng, mất độ sâu bóng

### **Lời nói:**
```
"Đây là AMBIENT LIGHT - ánh sáng môi trường.

Tác dụng: Chiếu sáng toàn phần, tránh vùng tối đen.

Công thức (Phong Model):
  L_ambient = k_a × I_a
  
Khi Ambient = 0: Tối tăm, chỉ thấy bóng
Khi Ambient = 1.2: Quá sáng, mất cảm giác chiều sâu

Giá trị tối ưu: 0.6-0.8 để có cân bằng sáng tối."
```

---

## **BƯỚC 7: CHIẾU SÁNG - DIRECTIONAL LIGHT & BÓNG ĐỔ (2-3 phút)**

### **Action:**
1. Đặt **Ambient Intensity = 0.6** (bình thường)
2. Kéo slider **Directional Intensity** từ 0.92 → 1.5 (cao nhất)
3. Quan sát: Bóng nhân vật, bóng tường, bóng trụ rõ rệt
4. Kéo xuống 0 → Không còn bóng
5. Quan sát sự khác biệt

### **Lời nói:**
```
"Đây là DIRECTIONAL LIGHT - ánh sáng định hướng từ (40, 45, 30).

Tác dụng:
- Tạo bóng đổ (Shadow Mapping)
- Đồ họa chi tiết, cảm giác sâu hơn

Kỹ thuật Shadow Mapping:
1. Render từ perspective của light source
2. Lưu depth map (độ sâu từ light)
3. So sánh fragment depth với depth map
   - Nếu depth > depth_map → Điểm bị bóng
   - Nếu depth ≤ depth_map → Điểm sáng

Cấu hình: Shadow map 4096×4096 pixels (độ phân giải cao)

PCF (Percentage-Closer Filtering): Làm mềm cạnh bóng → Soft Shadows.

Di chuyển nhân vật → quan sát bóng thay đổi theo vị trí."
```

---

## **BƯỚC 8: CHIẾU SÁNG - POINT LIGHT (1 phút)**

### **Action:**
1. Quan sát slider **Point Intensity** = 0.6
2. Kéo slider từ 0 → 1.5 → quan sát ánh sáng từ trên xuống
3. Để ý ánh sáng xanh dương nhạt từ trên (tâm trần)

### **Lời nó:**
```
"Đây là POINT LIGHT - ánh sáng phát ra từ một điểm.

Vị trí: (0, 25, 0) - tâm trần nhà
Màu: Xanh dương (0xd9f0ff) → tone lạnh
Phạm vi: 160 đơn vị

Tác dụng:
- Bổ sung sáng từ phía trên
- Tạo cảm giác tone màu

Công thức giảm cường độ theo khoảng cách:
  I = I_0 / (1 + kd + kd²)
  d = khoảng cách từ điểm

Ba loại light kết hợp: Ambient + Directional + Point
→ Tạo ra lighting chuyên nghiệp."
```

---

## **BƯỚC 9: HIỆU ỨNG PHÁT QUANG - EMISSIVE MATERIALS (1 phút)**

### **Action:**
1. Nhìn lên trần nhà
2. Quan sát 8 panel sáng phát quang (phát sáng tự do)
3. Giảm Ambient light → Panel vẫn sáng (vì emissive)

### **Lời nói:**
```
"Các panel trên trần này là EMISSIVE MATERIALS - vật liệu tự phát sáng.

Material properties:
  - emissive: 0xffffff (màu phát sáng)
  - emissiveIntensity: 1.5 (độ mạnh)

Tác dụng:
- Panel tự phát sáng độc lập từ lighting
- Không ảnh hưởng bóng đổ
- Tạo cảm giác sci-fi

Sử dụng cho: Đèn, màn hình, neon signs, v.v."
```

---

## **BƯỚC 10: TEXTURE MAPPING - PRESETS (2-3 phút)**

### **Action:**
1. Chọn dropdown **"Floor Texture"** = "Digital Grid" (mặc định)
2. Quan sát sàn hiển thị lưới xanh sci-fi
3. Giải thích: "Đây là texture gồm pixels được vẽ trên canvas, lặp 16×16 lần"

4. Chọn **"Brick"**
5. Sàn hiển thị hoa văn gạch đỏ nâu
6. Giải thích: "Texture khác nhau, material vẫn chung"

7. Chọn **"Metal Sheet"**
8. Sàn hiển thị sợi kim loại
9. Quan sát: Phản xạ sáng khác nhau (metalness khác)

### **Lời nói:**
```
"Texture Mapping - ánh xạ hình ảnh lên bề mặt.

Ba loại texture có sẵn được vẽ trên canvas 512×512:
1. Digital Grid: Lưới xanh
2. Brick: Gạch đỏ
3. Metal Sheet: Sợi kim loại

Cấu hình:
  - texture.repeat.set(16, 16) → Lặp 16 lần theo X, Y
  - texture.wrapS/T = RepeatWrapping → Khi lặp không bị xạ cạnh
  - texture.anisotropy = 8 → Bộ lọc tốt khi nhìn từ góc

Material properties:
  - Grid: metalness = 0.1 (ít bóng)
  - Brick: metalness = 0.1 (đất sét)
  - Metal: metalness = 0.3 (kim loại)

Ánh sáng phản xạ khác nhau tùy metalness.
"
```

---

## **BƯỚC 11: TEXTURE MAPPING - CUSTOM UPLOAD (2 phút)**

### **Action:**
1. Click button **"Choose File"** ở "Custom Image"
2. Chọn ảnh từ máy (có sẵn ảnh test: `assets/textures/images.png` hoặc upload ảnh khác)
3. Sàn tự động hiển thị ảnh mới
4. Quan sát lặp 16×16 lần trên sàn

### **Lời nói:**
```
"Upload custom texture - người dùng có thể chọn ảnh riêng.

Kỹ thuật:
1. File input → Đọc file từ máy
2. URL.createObjectURL() → Tạo URL cục bộ
3. TextureLoader.load() → Load ảnh
4. Cấu hình repeat wrapping
5. Gán vào material.map
6. material.needsUpdate = true → Cập nhật GPU

Lợi ích:
- Người dùng có thể test texture riêng
- Không cần server upload
- Xử lý hoàn toàn trên client-side

UV Coordinates:
- Mỗi đỉnh của geometry có tọa độ (u, v)
- Texture được ánh xạ dựa trên tọa độ này
- Repeat wrapping: u,v mod 1 cho phép lặp liền mạch."
```

---

## **BƯỚC 12: GAMEPLAY - NGẮM & BẮN (2-3 phút)**

### **Action:**
1. Quay lại **Camera Third-Person** (phím `2`)
2. **Rê chuột** để ngắm (xoay camera)
3. Đảm bảo có target (màu neon) trên scene
4. Nhấn **chuột trái (click)** để bắn

### **Lời nói:**
```
"Gameplay - Ngắm & Bắn:

Xử lý Input:
- Mouse move: Tính ΔX, ΔY → xoay camera
- Mouse click: Raycast từ camera → kiểm tra có trúng target không

Raycast Algorithm:
1. Tạo ray từ camera qua crosshair
2. Kiểm tra intersection với tất cả targets
3. Nếu trúng: Activate hit effect

Mỗi lần bắn:
- Phát quang muzzle flash (ánh sáng bật tắt)
- Target nếu bị trúng sẽ animate biến mất
- Score tăng lên
"
```

---

## **BƯỚC 13: ANIMATION - MUZZLE FLASH (1 phút)**

### **Action:**
1. Bắn vài lần (click chuột)
2. Quan sát ánh sáng bật tắt ở mũi súng (muzzle)
3. Hiệu ứng chớp vàng/trắng

### **Lời nói:**
```
"Muzzle Flash - hiệu ứng khi bắn:

Kỹ thuật:
- PointLight bật lên với cường độ cao (2.5)
- Giữ 100ms (0.1 giây)
- Tự động tắt đi

Công thức time-based:
  startTime = now()
  if (elapsed < duration):
    light.intensity = maxIntensity
  else:
    light.intensity = 0

Tạo cảm giác bắn súng chân thực.
"
```

---

## **BƯỚC 14: ANIMATION - TARGET DISAPPEAR (1 phút)**

### **Action:**
1. Bắn trúng target (quan sát xem target có chạm không)
2. Target sẽ nhỏ dần và biến mất
3. Quan sát scale animation (từ 1.0 → 0.0)

### **Lời nói:**
```
"Target Disappear Animation:

Kỹ thuật:
1. Khi bị bắn trúng:
   - startTime = now()
   - duration = 300ms
   
2. Mỗi frame:
   - elapsed = now() - startTime
   - progress = elapsed / duration  (0 → 1)
   - target.scale = (1 - progress, 1 - progress, 1 - progress)
   
3. Khi progress >= 1:
   - scene.remove(target)
   - Cleanup memory

Sử dụng requestAnimationFrame để mượt 60fps.
"
```

---

## **BƯỚC 15: ĐIỀU CHỈNH CAMERA (1-2 phút)**

### **Action:**
1. Kéo slider **camX** từ -60 → +60 → quan sát camera di chuyển
2. Kéo slider **camY** → Thay đổi độ cao
3. Kéo slider **camZ** → Thay đổi khoảng cách

### **Lời nói:**
```
"Camera Position Control:

Công thức cập nhật:
  camera.position.set(
    parseFloat(camX.value),
    parseFloat(camY.value),
    parseFloat(camZ.value)
  )

Mỗi slider có range:
- X: -60 → +60
- Y: 5 → 80
- Z: -60 → +60

Khi thay đổi:
- camera.updateProjectionMatrix()
- Cập nhật ma trận phép chiếu

Điều chỉnh Near/Far Plane:
- Near: 0.1 → 50 (mặt phẳng cắt gần)
- Far: 50 → 300 (mặt phẳng cắt xa)

Công thức Perspective Projection:
  zclip = (-far - near) / (far - near) × z + (-2 × far × near) / (far - near)
  x_screen = x_clip / w_clip
  y_screen = y_clip / w_clip
"
```

---

## **BƯỚC 16: RESTART & SCORE (30 giây)**

### **Action:**
1. Quan sát **"Targets Eliminated: X"** ở sidebar
2. Bắn vài target → Score tăng
3. Click button **"Restart Game"**
4. Score reset về 0, targets respawn

### **Lời nói:**
```
"Restart & Score Management:

UI Update:
- Mỗi lần bắn trúng: onScore callback
- UI element textContent = score.toString()
- DOM update tự động

Restart Function:
- Xóa tất cả targets khỏi scene
- Tạo targets mới
- Score = 0
- Camera reset
"
```

---

## **BƯỚC 17: TỔNG KẾT (1 phút)**

### **Lời nói:**
```
"Tổng kết các kỹ thuật đã ứng dụng:

✅ GEOMETRY & MODELING:
   - BoxGeometry: Sàn, tường, trụ
   - CylinderGeometry: Giá đỡ, casing, lens
   - Model FBX: Nhân vật 3D

✅ CAMERA & PROJECTION:
   - Perspective Camera (2 loại)
   - Adjust near/far/position
   - Matrix projection

✅ AFFINE TRANSFORMATIONS:
   - Translation: Di chuyển (WASD)
   - Rotation: Xoay nhân vật & camera (mouse)
   - Scaling: Kích thước geometry

✅ LIGHTING & SHADOWS:
   - Ambient Light: Chiếu sáng toàn phần
   - Directional Light: Ánh sáng định hướng + Shadow Mapping (4096×4096)
   - Point Light: Ánh sáng điểm
   - Emissive Materials: Vật liệu tự phát sáng
   - Soft Shadows: PCF

✅ TEXTURE MAPPING:
   - Canvas texture presets (Grid, Brick, Metal)
   - Custom image upload
   - UV wrapping & repeating
   - Anisotropic filtering

✅ ANIMATION:
   - Character movement (frame-based)
   - Camera follow (smooth)
   - Muzzle flash (time-based)
   - Target disappear (scale animation)

✅ INTERACTIVE:
   - Mouse & Keyboard input
   - Raycast collision detection
   - Real-time UI updates
   - Game state management

Tất cả sử dụng Three.js + WebGL + JavaScript ES Modules.
"
```

---

## **NOTES TẠI CHỖ**

| Phần | Nếu có lỗi | Khắc phục |
|------|-----------|---------|
| Game không load | Check console (F12) | Live Server phải chạy |
| Texture không hiện | Check assets path | Đảm bảo folder `assets/` đủ files |
| Bóng không rõ | Directional = 0 | Tăng slider directional intensity |
| FPS thấp | Shadow map quá cao | Giảm shadow map resolution |
| Target không bị bắn | Raycast không hit | Kiểm tra camera third-person |

---

## **TIPS THÊM**

1. **Nếu muốn show code**: Mở DevTools (F12) → Console → xem error/log
2. **Nếu muốn slow-mo**: Thay `moveSpeed = 0.3` → `0.1` ở gameplay.js
3. **Nếu quá sáng/tối**: Điều chỉnh slider Ambient/Directional
4. **Nếu muốn tăng số target**: Edit `environment.js` hàm `createTargets()`

---

**Kết thúc script demo.**  
*Thời gian tổng cộng: 15-20 phút (tùy theo tốc độ thuyết trình + Q&A)*
