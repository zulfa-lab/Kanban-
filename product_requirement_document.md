# Product Requirement Document (PRD)
## Personal & Collaborative Work Tracker (Jira-Lite)

| Status | Draft / Ready for Review |
| :--- | :--- |
| **Owner** | Project Lead |
| **Target Launch** | MVP Q4 |
| **Tech Stack** | Vite + React/JS, Firebase (Auth + Firestore), GitHub Pages |

---

## 1. Executive Summary & Objective

Proyek ini bertujuan membangun aplikasi web pelacak pekerjaan (*work tracker*) kolaboratif berbasis papan Kanban yang ringan, cepat, dan mandiri. Sistem mengadaptasi alur kerja esensial Jira tanpa beban konfigurasi enterprise. 

Aplikasi ini di-hosting secara statis tanpa biaya server menggunakan **GitHub Pages**, dengan **Firebase** sebagai penyedia layanan autentikasi identitas dan database terdistribusi waktu nyata (*real-time database*). Akses dibatasi secara eksklusif hanya untuk pemilik proyek dan kolaborator resmi.

---

## 2. User Persona & Problem Statement

### 2.1 Target Users
* **Primary (Owner):** Membutuhkan visibilitas penuh atas daftar tugas harian/mingguan, membagi prioritas kerja, dan memantau status pengerjaan secara real-time.
* **Secondary (Collaborator/Friend):** Perlu melihat tugas yang ditugaskan kepadanya, memindahkan progres pekerjaan, dan memperbarui rincian tugas tanpa friksi pendaftaran akun rumit.

### 2.2 Problem Statement
Platform manajemen proyek modern (Jira, Linear, Asana) sering kali:
* Terlalu kompleks untuk kebutuhan tim mini 2 orang.
* Memiliki batasan kuota workspace/kursi pada skema gratis.
* Menuntut biaya infrastruktur backend jika membangun sistem mandiri dengan Node.js/PostgreSQL.

**Solusi:** Single Page Application (SPA) berbasis client-side terenkripsi akses, tersinkronisasi instan melalui listener WebSocket Firestore, dan 100% berada dalam tier gratis (*zero running cost*).

---

## 3. Scope & Functional Requirements

### 3.1 Otentikasi & Kontrol Akses (Auth & Authorization)
* **Provider:** Google Single Sign-On (SSO) via Firebase Authentication.
* **Access Whitelist:**
  * Hanya email yang secara eksplisit didaftarkan dalam aturan database (*Firestore Security Rules*) yang memiliki izin baca/tulis (`read` & `write`).
  * Pengguna tidak terdaftar yang mencoba login akan otomatis diblokir di layer database dan mendapatkan antarmuka penolakan izin (*Access Denied*).
* **Session Management:** Persistensi token sesi otomatis pada browser klien, dilengkapi tombol *Sign Out*.

### 3.2 Kanban Board Management (Core MVP)
* **Status Lanes:**
  * `To Do` (Antrean tugas baru)
  * `In Progress` (Tugas sedang dikerjakan)
  * `Done` (Pekerjaan yang telah rampung)
* **Drag-and-Drop (DND):**
  * Kemampuan memindahkan kartu status secara visual antar-kolom.
  * Penyusunan ulang urutan vertikal kartu dalam kolom yang sama.
* **Real-time Sync:**
  * Memanfaatkan listener Firestore `onSnapshot`.
  * Saat salah satu pengguna memindahkan/mengedit kartu, perubahan langsung ter-render pada layar pengguna lain tanpa perlu memuat ulang (*refresh*) halaman.

### 3.3 Task Details & Modal CRUD
* **Atribut Data Tiap Tugas:**
  * `id`: UUID / Firestore document ID auto-generated.
  * `title`: Judul tiket (String, wajib diisi).
  * `description`: Rincian teknis / catatan implementasi (Markdown/Text, opsional).
  * `status`: `'todo'` | `'in_progress'` | `'done'`.
  * `priority`: `'low'` | `'medium'` | `'high'`.
  * `assigned_to`: Email pengguna yang ditugaskan.
  * `order`: Urutan posisi kartu dalam kolom (Number/Timestamp).
  * `created_at`: Waktu pembuatan tiket (Server Timestamp).
  * `updated_at`: Waktu modifikasi terakhir (Server Timestamp).
* **Operasi CRUD:**
  * **Create:** Modal formulir pembuatan tiket baru (default status masuk ke `To Do`).
  * **Read/Detail:** Klik pada kartu untuk membuka detail task modal.
  * **Update:** Pengeditan langsung pada judul, deskripsi, level prioritas, dan assignee.
  * **Delete:** Aksi hapus tiket dengan dialog konfirmasi pencegah klik tidak sengaja.

### 3.4 Filter & Quick Navigation
* Filter instan berdasarkan *Assignee*:
  * "All Tasks"
  * "My Tasks" (sesuai email yang login)
  * "Friend's Tasks"
* Visual badge penanda prioritas:
  * 🔴 High: Aksen merah
  * 🟡 Medium: Aksen kuning
  * 🟢 Low: Aksen hijau/abu-abu

---

## 4. Technical Architecture

### 4.1 System Diagram
```text
+-----------------------------------------------------------+
|                      Client Browser                       |
|   (React / Vite Single Page App on GitHub Pages)          |
+-----------------------------------------------------------+
            |                               |
 (Auth via OAuth SDK)              (Realtime CRUD via WebSockets)
            v                               v
+-----------------------+       +---------------------------+
| Firebase Auth         |       | Cloud Firestore           |
| (Google Sign-In)      |       | - Security Rules:         |
|                       |       |   Whitelist 2 Emails      |
+-----------------------+       +---------------------------+
```

### 4.2 Skema Data Firestore (`tasks` Collection)

| Field | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | `string` | Auto-generated document ID |
| `title` | `string` | Judul singkat tugas |
| `description` | `string` | Deskripsi atau catatan detail pekerjaan |
| `status` | `string` | `'todo'` \| `'in_progress'` \| `'done'` |
| `priority` | `string` | `'low'` \| `'medium'` \| `'high'` |
| `assigned_to` | `string` | Email pelaksana tugas |
| `order` | `number` | Indeks urutan kartu di dalam kolom |
| `created_at` | `timestamp` | Waktu pembuatan tiket |
| `updated_at` | `timestamp` | Waktu modifikasi terakhir |

---

## 5. Security & Deployment Strategy

### 5.1 Firestore Security Rules
Aturan keamanan diterapkan langsung di cloud Firestore untuk mencegah modifikasi tidak sah:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.email in ["emailkamu@gmail.com", "emailtemen@gmail.com"]);
    }
  }
}
```

### 5.2 CI/CD & GitHub Pages Deployment
* **Automated Build:** Menggunakan GitHub Actions workflow.
* **Secrets Management:** Kunci publik Firebase disimpan di *GitHub Repository Secrets* (`VITE_FIREBASE_API_KEY`, dll.) dan diinjeksikan saat tahapan `npm run build`.
* **Path Routing:** Konfigurasi `vite.config.js` menyertakan `base: '/<nama-repo>/'` untuk mencegah kesalahan resolusi aset statis (CSS/JS 404).

---

## 6. Non-Functional Requirements (NFR)

* **Performance:**
  * Ukuran bundle statis awal < 300 kB (gzipped).
  * Latensi sinkronisasi antar-pengguna < 500 ms saat kondisi jaringan stabil.
* **Usability:** Antarmuka responsif pada resolusi desktop/laptop, serta memiliki *horizontal scroll* yang rapi saat dibuka pada peramban mobile.
* **Cost & Maintenance:** 100% menggunakan kuota gratis (Firebase Spark Plan & GitHub Pages gratis) tanpa kewajiban perawatan server.

---

## 7. Roadmap & Milestone MVP

1. **Sprint 1 (Setup & Auth):** Inisialisasi Vite repo, setup Firebase Auth Google, validasi security rules whitelist.
2. **Sprint 2 (Kanban & CRUD):** Pembuatan UI kolom board, integrasi penambahan tugas, edit detail, dan hapus tugas.
3. **Sprint 3 (Drag & Drop + Realtime):** Implementasi interaksi drag-and-drop antar-kolom dan pengikatan Firestore `onSnapshot`.
4. **Sprint 4 (Deploy & Testing):** Konfigurasi workflow GitHub Actions, deployment ke GitHub Pages, dan cross-testing antar-akun.