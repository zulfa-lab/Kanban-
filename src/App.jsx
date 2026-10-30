import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { Board } from './components/Board';
import { TaskModal } from './components/TaskModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AccessDenied } from './components/AccessDenied';
import { ConfigModal } from './components/ConfigModal';
import { Toast } from './components/Toast';
import { 
  subscribeToTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  reorderTasks, 
  resetDemoTasks 
} from './services/taskService';
import { isFirebaseConfigured } from './services/firebase';
import { INITIAL_COLLABORATORS } from './services/mockData';
import { LogIn, Sparkles, Shield, Zap } from 'lucide-react';

export function App() {
  const { user, loading, isWhitelisted, loginWithGoogle, switchDemoUser } = useAuth();

  // App Theme: 'dark' (default) or 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('jira_lite_theme') || 'dark';
  });

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('all'); // 'all' | 'my_tasks' | 'friends_tasks'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'low'

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedTask, setSelectedTask] = useState(null);
  const [targetColumnStatus, setTargetColumnStatus] = useState('todo');

  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync theme attribute to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jira_lite_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Subscribe to real-time tasks when authenticated
  useEffect(() => {
    if (!user || user.isWhitelisted === false) return;

    const unsubscribe = subscribeToTasks(
      (newTasks) => {
        setTasks(newTasks);
      },
      (err) => {
        addToast('Realtime sync fallback engaged', 'info');
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user]);

  // Filter tasks based on search, assignee, and priority
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search query filter (matches title, description, or id)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = t.title?.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesId = t.id?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesId) return false;
      }

      // Assignee filter
      if (assigneeFilter === 'my_tasks') {
        if (t.assigned_to?.toLowerCase() !== user?.email?.toLowerCase()) return false;
      } else if (assigneeFilter === 'friends_tasks') {
        const friendEmail = INITIAL_COLLABORATORS.find((c) => c.email.toLowerCase() !== user?.email?.toLowerCase())?.email;
        if (t.assigned_to?.toLowerCase() !== friendEmail?.toLowerCase()) return false;
      }

      // Priority filter
      if (priorityFilter !== 'all') {
        if (t.priority !== priorityFilter) return false;
      }

      return true;
    });
  }, [tasks, searchQuery, assigneeFilter, priorityFilter, user]);

  // Handlers for task interactions
  const handleOpenCreateModal = (columnStatus = 'todo') => {
    setModalMode('create');
    setTargetColumnStatus(columnStatus);
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setModalMode('edit');
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (modalMode === 'create') {
        await createTask({
          ...taskData,
          status: targetColumnStatus || taskData.status || 'todo',
        });
        addToast('Task created successfully', 'success');
      } else if (modalMode === 'edit' && selectedTask) {
        await updateTask(selectedTask.id, taskData);
        addToast('Task updated', 'info');
      }
      setIsTaskModalOpen(false);
    } catch (err) {
      console.error('Error saving task:', err);
      addToast('Failed to save task', 'danger');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );

      await updateTask(taskId, { status: newStatus });
      const statusLabels = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
      addToast(`Moved to ${statusLabels[newStatus] || newStatus}`, 'info');
    } catch (err) {
      console.error('Error updating status:', err);
      addToast('Could not move task', 'danger');
    }
  };

  const handleDeleteRequest = (taskId) => {
    setIsTaskModalOpen(false);
    setDeleteTaskId(taskId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTaskId) return;
    try {
      await deleteTask(deleteTaskId);
      setDeleteTaskId(null);
      addToast('Task permanently deleted', 'danger');
    } catch (err) {
      console.error('Error deleting task:', err);
      addToast('Failed to delete task', 'danger');
    }
  };

  const handleResetTasks = () => {
    const fresh = resetDemoTasks();
    setTasks(fresh);
    addToast('Board reset to initial PRD sprint tasks', 'info');
    setIsConfigOpen(false);
  };

  // Loading Screen
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        background: 'var(--bg-app)'
      }}>
        <div className="brand-logo" style={{ width: 48, height: 48 }}>
          <Zap size={24} color="#ffffff" />
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Loading workspace...
        </div>
      </div>
    );
  }

  // Not Logged In Screen
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'radial-gradient(circle at 50% 20%, rgba(249, 115, 22, 0.16) 0%, rgba(12, 10, 9, 1) 75%)'
      }}>
        <div style={{
          maxWidth: 440,
          width: '100%',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <div className="brand-logo" style={{ width: 56, height: 56, borderRadius: 14 }}>
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="9" fill="url(#loginG)" />
              <path d="M12 28V12L20 20L12 28Z" fill="#ffffff" />
              <path d="M28 12V28L20 20L28 12Z" fill="#fb923c" />
              <defs>
                <linearGradient id="loginG" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f97316" />
                  <stop offset="1" stopColor="#ea580c" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Aura Jira-Lite
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.5 }}>
              Personal & Collaborative Work Tracker with Realtime Firestore & Drag-and-Drop
            </p>
          </div>

          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textAlign: 'left'
          }}>
            <Shield size={16} color="#10b981" style={{ flexShrink: 0 }} />
            <span>Restricted Whitelist Access for Project Lead & Authorized Collaborators</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', height: 42 }}
              onClick={loginWithGoogle}
            >
              <LogIn size={16} />
              <span>Sign in with Google</span>
            </button>

            <button
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', height: 42 }}
              onClick={() => switchDemoUser('owner')}
            >
              <Sparkles size={16} color="#f97316" />
              <span>Explore Demo as Zulfa (Lead)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Access Denied Screen (per PRD Section 3.1 & 5.1)
  if (user.isWhitelisted === false) {
    return <AccessDenied />;
  }

  const deletingTaskObj = tasks.find((t) => t.id === deleteTaskId);

  return (
    <>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateIssueClick={() => handleOpenCreateModal('todo')}
        onOpenConfigClick={() => setIsConfigOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <FilterBar
        assigneeFilter={assigneeFilter}
        onAssigneeFilterChange={setAssigneeFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        totalTasksCount={tasks.length}
        filteredTasksCount={filteredTasks.length}
        isFirebaseLive={isFirebaseConfigured}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      <Board
        tasks={filteredTasks}
        onTaskClick={handleOpenEditModal}
        onAddTask={handleOpenCreateModal}
        onUpdateTaskStatus={handleUpdateTaskStatus}
      />

      {/* Task Modal (Create & Edit) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        mode={modalMode}
        initialStatus={targetColumnStatus}
        task={selectedTask}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDeleteRequest={handleDeleteRequest}
      />

      {/* Accidental Delete Guard Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTaskId)}
        taskTitle={deletingTaskObj?.title || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTaskId(null)}
      />

      {/* Firebase Architecture & Sandbox Settings */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onResetTasks={handleResetTasks}
      />

      {/* Micro-Feedback Toasts */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </>
  );
}

export default App;
