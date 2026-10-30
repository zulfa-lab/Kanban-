export const INITIAL_COLLABORATORS = [
  {
    name: 'Zulfa Nashihin',
    email: 'zulfa.dev@gmail.com',
    role: 'Project Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    color: '#f97316'
  },
  {
    name: 'Alex Rivera',
    email: 'friend.collab@gmail.com',
    role: 'Collaborator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    color: '#06b6d4'
  }
];

export const INITIAL_TASKS = [
  {
    id: 'task-101',
    title: 'Setup Firebase Auth with Google SSO and Whitelist Rules',
    description: 'Configure OAuth consent screen, enable Google Sign-In in Firebase Console, and enforce Firestore security rules matching whitelist emails (zulfa.dev@gmail.com & friend.collab@gmail.com).',
    status: 'done',
    priority: 'high',
    assigned_to: 'zulfa.dev@gmail.com',
    order: 0,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'task-102',
    title: 'Implement Firestore Realtime onSnapshot sync',
    description: 'Bind tasks collection to reactive listener. When any team member moves a card, update state across client browsers instantaneously with <500ms latency.',
    status: 'done',
    priority: 'high',
    assigned_to: 'friend.collab@gmail.com',
    order: 1,
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'task-103',
    title: 'Smooth Drag-and-Drop Kanban interactions',
    description: 'Add pointer drag handles, animated ghost cards, dynamic column highlight rings, and fluid vertical reordering inside To Do, In Progress, and Done lanes.',
    status: 'in_progress',
    priority: 'high',
    assigned_to: 'zulfa.dev@gmail.com',
    order: 0,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'task-104',
    title: 'Quick Filter navigation for My Tasks & Friend Tasks',
    description: 'Filter instant board view by logged-in user email or collaborator email, combined with search query and priority badges.',
    status: 'in_progress',
    priority: 'medium',
    assigned_to: 'friend.collab@gmail.com',
    order: 1,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'task-105',
    title: 'Task CRUD Modal with Markdown Notes and Delete Guard',
    description: 'Create Jira-inspired modal allowing inline title editing, Markdown note preview, priority selector (High, Medium, Low), and two-step delete dialog.',
    status: 'todo',
    priority: 'medium',
    assigned_to: 'zulfa.dev@gmail.com',
    order: 0,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'task-106',
    title: 'Configure GitHub Actions CI/CD to GitHub Pages',
    description: 'Create `.github/workflows/deploy.yml` with secrets injection for VITE_FIREBASE_* and verify base path routing.',
    status: 'todo',
    priority: 'low',
    assigned_to: 'friend.collab@gmail.com',
    order: 1,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];
