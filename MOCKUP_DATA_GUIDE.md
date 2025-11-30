# 📊 Mock Data Guide - Home Builder Platform

คู่มือการเพิ่มข้อมูลทดสอบและการทดสอบหน้าต่างๆ ในระบบ

---

## 🎯 วิธีการเพิ่มข้อมูล Mock Data

### ขั้นตอนที่ 1: สร้าง Firebase Authentication Users

ก่อนเพิ่มข้อมูลใน Firestore คุณต้องสร้าง users ใน Firebase Authentication ก่อน:

1. เปิด Firebase Console → Authentication → Users
2. คลิก "Add User" และสร้าง users ต่อไปนี้:

| Email | Password | Role |
|-------|----------|------|
| `admin@homebuilder.com` | `password123` | Admin |
| `staff1@homebuilder.com` | `password123` | Staff |
| `staff2@homebuilder.com` | `password123` | Staff |
| `client1@example.com` | `password123` | Client |
| `client2@example.com` | `password123` | Client |

> ⚠️ **หมายเหตุ:** คุณต้องคัดลอก UID ของแต่ละ user แล้วแก้ไขในไฟล์ `src/pages/SeedMockData.jsx` ให้ตรงกับ UID ที่ได้

### ขั้นตอนที่ 2: รัน Development Server

```bash
npm run dev
```

### ขั้นตอนที่ 3: เข้าหน้า Seed Mock Data

เปิด browser และไปที่:
```
http://localhost:5173/seed-mock-data
```

### ขั้นตอนที่ 4: กดปุ่ม Seed Mock Data

- คลิกปุ่ม "Seed Mock Data" เพื่อเพิ่มข้อมูลทดสอบลง Firestore
- รอจนกว่า process จะเสร็จสมบูรณ์
- ตรวจสอบ execution log ด้านล่าง

---

## 📱 หน้าทั้งหมดในระบบและวิธีทดสอบ

### 1. 🔐 Login Page (`/login`)

**URL:** `http://localhost:5173/login`

**คุณสมบัติ:**
- Login ด้วย Email/Password
- Login ด้วย Google OAuth
- ลิงก์ไปหน้า Register

**วิธีทดสอบ:**
```
✓ ลอง login ด้วย: admin@homebuilder.com / password123
✓ ตรวจสอบว่า redirect ไป Dashboard หลัง login สำเร็จ
✓ ทดสอบ error handling เมื่อใส่ password ผิด
```

**Mock Data ที่เกี่ยวข้อง:**
- Users in Firebase Authentication

---

### 2. 📝 Register Page (`/register`)

**URL:** `http://localhost:5173/register`

**คุณสมบัติ:**
- สร้าง account ใหม่
- ตั้งค่า Full Name, Email, Password
- Default role เป็น "client"
- ลิงก์ไปหน้า Login

**วิธีทดสอบ:**
```
✓ สร้าง account ใหม่
✓ ตรวจสอบว่า user ถูกสร้างใน Firestore collection "users"
✓ ตรวจสอบว่า redirect ไป Dashboard หลัง register สำเร็จ
```

---

### 3. 🏠 Dashboard Page (`/`)

**URL:** `http://localhost:5173/`

**คุณสมบัติ:**
- แสดงรายการโปรเจคตาม role:
  - **Admin:** เห็นทุกโปรเจค + สามารถสร้างโปรเจคใหม่
  - **Staff:** เห็นเฉพาะโปรเจคที่ถูก assign
  - **Client:** เห็นเฉพาะโปรเจคของตัวเอง
- Card แสดงชื่อโปรเจค, โค้ด, สถานที่, สถานะ
- Bottom Navigation Bar (Mobile)

**วิธีทดสอบ:**

#### ทดสอบแบบ Admin:
```
1. Login ด้วย: admin@homebuilder.com
2. ควรเห็นโปรเจคทั้งหมด 3 โปรเจค:
   - Modern Loft House (HBP-2024-001)
   - Tropical Villa (HBP-2024-002)
   - Cozy Townhouse (HBP-2024-003)
3. ควรมีปุ่ม "+" สำหรับสร้างโปรเจคใหม่
4. ทดสอบสร้างโปรเจคใหม่
```

#### ทดสอบแบบ Staff:
```
1. Login ด้วย: staff1@homebuilder.com
2. ควรเห็นเฉพาะโปรเจคที่ถูก assign (2 โปรเจค)
3. ไม่มีปุ่มสร้างโปรเจคใหม่
```

#### ทดสอบแบบ Client:
```
1. Login ด้วย: client1@example.com
2. ควรเห็นเฉพาะโปรเจคของตัวเอง (2 โปรเจค)
3. ชื่อหน้าเป็น "My Home" แทน "Projects"
```

**Mock Data ที่เกี่ยวข้อง:**
- `projects` collection (3 projects)
- แต่ละ project มี: projectName, projectCode, location, totalPrice, status, ownerId, assignedStaffIds

---

### 4. 🏗️ Project Details Page (`/projects/:id`)

**URL:** `http://localhost:5173/projects/{project-id}`

**คุณสมบัติ:**
- 3 Tabs:
  - **Installments:** แสดงงวดชำระเงิน, อัพโหลดสลิป
  - **Memos:** Change requests (memo, add order, deduct order)
  - **Settings:** (Admin only) Generate invite link, Manage staff

**วิธีทดสอบ:**

#### Tab: Installments
```
✓ ควรเห็น 5 งวด
✓ งวดที่ 1-2 มีสถานะ "paid" พร้อมลิงก์ดูสลิป
✓ งวดที่ 3 สถานะ "ready_to_pay" และมีปุ่ม Upload Slip
✓ งวดที่ 4-5 สถานะ "pending"
✓ ทดสอบอัพโหลดสลิปในงวดที่ 3
```

**Mock Installments:**
| Sequence | Title | Amount | Status | Due Date |
|----------|-------|--------|--------|----------|
| 1 | Down Payment (10%) | 10% ของราคารวม | paid | 2024-01-20 |
| 2 | Foundation Complete (20%) | 20% ของราคารวม | paid | 2024-03-01 |
| 3 | Structure Complete (30%) | 30% ของราคารวม | ready_to_pay | 2024-05-15 |
| 4 | Interior Work (25%) | 25% ของราคารวม | pending | 2024-07-01 |
| 5 | Final Payment (15%) | 15% ของราคารวม | pending | 2024-09-01 |

#### Tab: Memos
```
✓ ควรเห็น 4 change requests
✓ 2 approved, 2 draft
✓ มีทั้ง add_order, deduct_order, และ memo
✓ ทดสอบสร้าง change request ใหม่
✓ ตรวจสอบว่า price impact แสดงสีถูกต้อง (เพิ่ม=แดง, ลด=เขียว)
```

**Mock Change Requests:**
1. **Change floor tiles to premium marble** (add_order, +250,000฿, approved)
2. **Remove guest bedroom balcony** (deduct_order, -80,000฿, approved)
3. **Note: Parking space orientation** (memo, no price, draft)
4. **Add smart home system** (add_order, +450,000฿, draft)

#### Tab: Settings (Admin only)
```
✓ ทดสอบสร้าง invite link
✓ ทดสอบคัดลอก invite link
✓ ทดสอบเพิ่ม staff ด้วย email
✓ ทดสอบลบ staff ออกจากโปรเจค
```

**Mock Data ที่เกี่ยวข้อง:**
- `projects/{projectId}/installments` subcollection (5 installments per project)
- `projects/{projectId}/change_requests` subcollection (4 requests per project)

---

### 5. 💌 Invite Page (`/invite/:token`)

**URL:** `http://localhost:5173/invite/{invite-token}`

**คุณสมบัติ:**
- แสดงข้อมูลโปรเจคที่ถูกเชิญ
- ตรวจสอบว่า invite link ยังใช้งานได้
- รองรับทั้งกรณี logged in และยังไม่ได้ login
- Accept invite และ assign client เข้าโปรเจค

**วิธีทดสอบ:**
```
1. Login เป็น Admin
2. ไปที่ Project Details > Settings tab
3. สร้าง invite link
4. Copy invite URL
5. Logout
6. เปิด invite URL ในแท็บใหม่
7. ควรเห็นข้อมูลโปรเจคพร้อมปุ่ม Accept
8. ทดสอบ accept invite (ต้อง login ก่อน)
9. ตรวจสอบว่า user ถูก assign เป็น owner ของโปรเจค
```

**Mock Data ที่เกี่ยวข้อง:**
- `invites` collection (จะถูกสร้างเมื่อ admin generate invite link)

---

### 6. 🌱 Seed Mock Data Page (`/seed-mock-data`)

**URL:** `http://localhost:5173/seed-mock-data`

**คุณสมบัติ:**
- หน้าสำหรับ populate ข้อมูล mock
- แสดงสรุปข้อมูลที่จะถูกสร้าง
- Real-time execution log
- แสดง test credentials

**วิธีใช้งาน:**
```
1. เข้าหน้านี้ก่อนการทดสอบครั้งแรก
2. กดปุ่ม "Seed Mock Data"
3. รอจนกว่า process จะเสร็จ
4. ตรวจสอบ log ว่าข้อมูลถูกสร้างสมบูรณ์
```

---

## 📊 สรุปข้อมูล Mock Data

### Users (5 users)
```
1. Admin User (admin@homebuilder.com) - role: admin
2. Somchai Builder (staff1@homebuilder.com) - role: staff
3. Nattaya Designer (staff2@homebuilder.com) - role: staff
4. Anan Sukhum (client1@example.com) - role: client
5. Suda Bangkok (client2@example.com) - role: client
```

### Projects (3 projects)
```
1. Modern Loft House (HBP-2024-001)
   - Location: Sukhumvit 101, Bangkok
   - Price: 8,500,000฿
   - Owner: client-001
   - Staff: staff-001, staff-002

2. Tropical Villa (HBP-2024-002)
   - Location: Phuket, Thailand
   - Price: 12,000,000฿
   - Owner: client-002
   - Staff: staff-001

3. Cozy Townhouse (HBP-2024-003)
   - Location: Chiang Mai, Thailand
   - Price: 4,500,000฿
   - Owner: client-001
   - Staff: staff-002
```

### Installments (5 per project = 15 total)
- Down Payment (10%)
- Foundation Complete (20%)
- Structure Complete (30%)
- Interior Work (25%)
- Final Payment (15%)

### Change Requests (4 per project = 12 total)
- 2 approved, 2 draft
- Mix of add_order, deduct_order, and memo types

---

## 🧪 Checklist การทดสอบทั้งหมด

### Authentication
- [ ] Login ด้วย email/password
- [ ] Login ด้วย Google
- [ ] Register account ใหม่
- [ ] Logout
- [ ] Private routes redirect ไป /login

### Dashboard
- [ ] Admin เห็นทุกโปรเจค
- [ ] Staff เห็นเฉพาะโปรเจคที่ assign
- [ ] Client เห็นเฉพาะโปรเจคของตัวเอง
- [ ] Admin สร้างโปรเจคใหม่ได้
- [ ] กดที่ project card แล้ว navigate ไป project details

### Project Details - Installments
- [ ] แสดงงวดทั้งหมดถูกต้อง
- [ ] แสดง status แต่ละงวดถูกต้อง
- [ ] อัพโหลดสลิปได้
- [ ] View สลิปที่อัพโหลดแล้ว
- [ ] สถานะเปลี่ยนเป็น paid หลังอัพโหลด

### Project Details - Memos
- [ ] แสดง change requests ทั้งหมด
- [ ] สร้าง change request ใหม่ได้
- [ ] แสดง price impact ถูกต้อง (สี)
- [ ] แสดง status ถูกต้อง

### Project Details - Settings
- [ ] Generate invite link (Admin)
- [ ] Copy invite link
- [ ] เพิ่ม staff ด้วย email
- [ ] แสดงรายการ staff
- [ ] ลบ staff ออก

### Invite System
- [ ] Invite link ใช้งานได้
- [ ] แสดงข้อมูลโปรเจคถูกต้อง
- [ ] Accept invite สำเร็จ
- [ ] Client ถูก assign เป็น owner
- [ ] Invite link ใช้ได้แค่ครั้งเดียว

---

## 🔧 Troubleshooting

### ปัญหา: ไม่เห็นโปรเจค
- ตรวจสอบว่า user ถูก assign ถูกต้อง (ownerId, assignedStaffIds)
- ตรวจสอบ role ใน Firestore users collection

### ปัญหา: อัพโหลดสลิปไม่ได้
- ตรวจสอบ Firebase Storage rules
- ตรวจสอบว่า Firebase Storage ถูก enable

### ปัญหา: Invite link ไม่ทำงาน
- ตรวจสอบว่า invite document ถูกสร้างใน Firestore
- ตรวจสอบ projectId ถูกต้อง
- ตรวจสอบ status เป็น "pending"

---

## 📞 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ console log ใน browser
2. ตรวจสอบ Firestore rules
3. ตรวจสอบ Firebase Authentication settings

---

**Happy Testing! 🚀**
