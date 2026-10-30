export const INITIAL_COLLABORATORS = [
  {
    name: 'Zulfa',
    username: 'zulfa',
    role: 'Administrator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    color: '#f97316'
  },
  {
    name: 'Alex Rivera',
    username: 'alex',
    role: 'Collaborator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    color: '#06b6d4'
  }
];

export const INITIAL_TASKS = [
  {
    id: 'task-101',
    title: 'Setup Autentikasi Pengguna & Role Admin vs User',
    description: 'Konfigurasi akun admin (zulfa / zulfa123) dan kemampuan admin untuk menambahkan pengguna baru tanpa memerlukan email.',
    status: 'done',
    priority: 'high',
    assigned_to: 'zulfa',
    order: 0,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'task-102',
    title: 'Implement Firestore Realtime onSnapshot sync',
    description: 'Hubungkan koleksi task ke listener reaktif Firestore. Saat kartu dipindahkan, state di semua browser terupdate secara instan.',
    status: 'done',
    priority: 'high',
    assigned_to: 'alex',
    order: 1,
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'task-103',
    title: 'Smooth Drag-and-Drop Kanban interactions',
    description: 'Pointer drag handles, animated ghost cards, dynamic column highlight rings, dan pengurutan vertikal di To Do, In Progress, dan Done.',
    status: 'in_progress',
    priority: 'high',
    assigned_to: 'zulfa',
    order: 0,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'task-104',
    title: 'Animasi Slide pada Filter All Tasks, My Tasks, dan Temenku',
    description: 'Indikator pill oranye yang meluncur halus (slide) antar tab assignee dan level prioritas dengan cubic-bezier motion.',
    status: 'in_progress',
    priority: 'medium',
    assigned_to: 'alex',
    order: 1,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'task-105',
    title: 'Task CRUD Modal dengan Markdown Notes dan Delete Guard',
    description: 'Jira-inspired modal untuk edit judul, catatan teknis Markdown, pemilihan prioritas, dan dialog konfirmasi hapus.',
    status: 'todo',
    priority: 'medium',
    assigned_to: 'zulfa',
    order: 0,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'task-106',
    title: 'Kelola Akun Anggota Tim oleh Admin',
    description: 'Admin dapat menambahkan pengguna baru ke workspace, menentukan peran (User/Admin), serta menghapus akun anggota.',
    status: 'todo',
    priority: 'low',
    assigned_to: 'alex',
    order: 1,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];
