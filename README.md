# Aura Jira-Lite (Personal & Collaborative Work Tracker)

Aura Jira-Lite adalah aplikasi manajemen pekerjaan (*work tracker*) kolaboratif berbasis papan Kanban yang ringan, cepat, dan mandiri. Sistem ini mengadaptasi alur kerja esensial Jira tanpa kompleksitas atau biaya infrastruktur server (*zero running cost*).

Aplikasi ini dibangun menggunakan **Vite + React**, **Firebase (Auth & Firestore)**, dan di-hosting secara statis melalui **GitHub Pages**.

---

## 🚀 Fitur Utama

- **Papan Kanban Interaktif (Core MVP):**
  - 3 Kolom Status: `To Do`, `In Progress`, `Done`.
  - Kemampuan Drag-and-Drop (DND) kartu visual antar-kolom dan penyusunan urutan vertikal.
  - Quick add tiket langsung di tiap header kolom.
- **Sinkronisasi Waktu Nyata (Real-time Sync):**
  - Menggunakan listener Cloud Firestore `onSnapshot`.
  - Dilengkapi *BroadcastChannel & Local Storage Reactive Fallback* untuk demo multi-tab instan tanpa jeda konfigurasi.
- **Otentikasi & Keamanan Whitelist (Security Access Control):**
  - Google SSO melalui Firebase Authentication.
  - Enforce Whitelist Email (hanya kolaborator terdaftar yang memiliki izin akses).
  - Tampilan **Access Denied** otomatis untuk pengunjung di luar daftar whitelist.
- **Detail Tugas & Manajemen CRUD:**
  - Form pembuatan tiket dengan validasi.
  - Modal detail dengan preview catatan teknis Markdown.
  - Pilihan Prioritas visual (🔴 High, 🟡 Medium, 🟢 Low).
  - Dialog konfirmasi hapus tiket untuk mencegah klik tidak sengaja.
- **Pencarian Cepat & Filter Instan:**
  - Filter Assignee: `All Tasks`, `My Tasks`, dan `Friend's Tasks`.
  - Filter Level Prioritas.
  - Live Search judul dan deskripsi dengan keyboard shortcut (`⌘K` atau `/`).
  - Shortcut `C` untuk membuat issue baru seketika.
- **Desain & Tema:**
  - Dark Mode (default) & Light Mode toggle.
  - Glassmorphism & Micro-animations modern (desain terinspirasi Jira Software Cloud & Linear).

---

## 🛠️ Panduan Menjalankan Secara Lokal

### 1. Menjalankan Development Server
```bash
npm install
npm run dev
```
Buka browser pada alamat: [http://localhost:5173/](http://localhost:5173/)

Aplikasi langsung siap digunakan dalam mode **Sandbox Demo Mode** (dengan 2 persona: Project Lead & Collaborator).

---

## 🔒 Konfigurasi Firebase (Produksi)

Untuk menghubungkan database cloud Firebase Anda sendiri:

1. Buat proyek baru di [Firebase Console](https://console.firebase.google.com/).
2. Aktifkan **Authentication** dengan provider **Google**.
3. Buat database **Cloud Firestore**.
4. Terapkan aturan keamanan (*Firestore Security Rules*) berikut di tab Rules:

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

5. Buat file `.env` di direktori utama proyek (lihat contoh pada `.env.example`):
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_WHITELIST_EMAILS=emailkamu@gmail.com,emailtemen@gmail.com
```

---

## 🌐 Deployment ke GitHub Pages (CI/CD)

Proyek ini telah dilengkapi dengan workflow GitHub Actions otomatis di [`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml).

1. Buka repositori GitHub Anda -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Tambahkan rahasia (*Repository Secrets*) sesuai variabel di atas (`VITE_FIREBASE_API_KEY`, dll.).
3. Buka **Settings** -> **Pages** -> pilih Source: **GitHub Actions**.
4. Setiap push ke branch `main`, GitHub Actions akan otomatis melakukan build dan deploy.

---

## 📂 Struktur File

- [`DESIGN.md`](file:///DESIGN.md) : Spesifikasi desain visual, design tokens, dan UI/UX guidelines.
- [`product_requirement_document.md`](file:///product_requirement_document.md) : Dokumen spesifikasi kebutuhan produk (PRD).
- [`src/context/AuthContext.jsx`](file:///src/context/AuthContext.jsx) : Otentikasi Google SSO, Whitelist validator, dan demo persona.
- [`src/services/taskService.js`](file:///src/services/taskService.js) : Realtime Firestore sync dan local fallback.
- [`src/components/Board.jsx`](file:///src/components/Board.jsx) : Komponen Kanban board 3 kolom dengan drag-and-drop.
- [`src/components/TaskModal.jsx`](file:///src/components/TaskModal.jsx) : Modal form create & edit tiket dengan Markdown preview.
- [`src/components/AccessDenied.jsx`](file:///src/components/AccessDenied.jsx) : Antarmuka penolakan akses untuk email non-whitelist.
- [`src/index.css`](file:///src/index.css) : Token CSS dan design system kustom.
