import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { Board } from './components/Board';
import { TaskModal } from './components/TaskModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ConfigModal } from './components/ConfigModal';
import { LoginScreen } from './components/LoginScreen';
import { UserManagementModal } from './components/UserManagementModal';
import { EditProfileModal } from './components/EditProfileModal';
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
import { Zap } from 'lucide-react';

export function App() {
  const { user, loading, isAdmin } = useAuth();

  // App Theme: 'dark' (default) or 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('jira_lite_theme') || 'dark';
  });

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('all'); // 'all' | 'my_tasks' | 'user:username'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'low'

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedTask, setSelectedTask] = useState(null);
  const [targetColumnStatus, setTargetColumnStatus] = useState('todo');
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Micro-feedback toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync theme attribute on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jira_lite_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Real-time task subscription
  useEffect(() => {
    const unsubscribe = subscribeToTasks(
      (updatedTasks) => {
        setTasks(updatedTasks);
      },
      (error) => {
        addToast('Switched to local storage sync mode', 'warning');
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Filter tasks based on Search, Assignee, Priority
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = t.title?.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesId = t.id?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesId) return false;
      }

      // Assignee filter (Dropdown support)
      if (assigneeFilter === 'my_tasks') {
        const assigned = t.assigned_to?.toLowerCase() || '';
        const isMine =
          assigned === user?.username?.toLowerCase() ||
          (user?.username === 'zulfa' && assigned.includes('zulfa')) ||
          (user?.username === 'alex' && (assigned.includes('friend') || assigned.includes('alex')));
        if (!isMine) return false;
      } else if (assigneeFilter === 'friends_tasks') {
        const assigned = t.assigned_to?.toLowerCase() || '';
        const isMine =
          assigned === user?.username?.toLowerCase() ||
          (user?.username === 'zulfa' && assigned.includes('zulfa')) ||
          (user?.username === 'alex' && (assigned.includes('friend') || assigned.includes('alex')));
        if (isMine || !assigned) return false;
      } else if (assigneeFilter !== 'all') {
        // Specific user selected from dropdown
        const target = assigneeFilter.startsWith('user:') 
          ? assigneeFilter.replace('user:', '').toLowerCase() 
          : assigneeFilter.toLowerCase();
        const assigned = t.assigned_to?.toLowerCase() || '';
        const matches =
          assigned === target ||
          (target === 'alex' && (assigned.includes('friend') || assigned.includes('alex'))) ||
          (target === 'zulfa' && assigned.includes('zulfa'));
        if (!matches) return false;
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
        addToast('Task berhasil dibuat', 'success');
      } else if (modalMode === 'edit' && selectedTask) {
        await updateTask(selectedTask.id, taskData);
        addToast('Task berhasil diperbarui', 'info');
      }
      setIsTaskModalOpen(false);
    } catch (err) {
      console.error('Error saving task:', err);
      addToast('Gagal menyimpan task', 'danger');
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
      addToast(`Dipindahkan ke ${statusLabels[newStatus] || newStatus}`, 'info');
    } catch (err) {
      console.error('Error updating status:', err);
      addToast('Gagal memindahkan task', 'danger');
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
      addToast('Task telah dihapus', 'warning');
      setDeleteTaskId(null);
    } catch (err) {
      console.error('Error deleting task:', err);
      addToast('Gagal menghapus task', 'danger');
    }
  };

  const handleResetTasks = () => {
    const freshTasks = resetDemoTasks();
    setTasks(freshTasks);
    addToast('Board telah direset ke initial sprint tasks', 'success');
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
          Memuat workspace...
        </div>
      </div>
    );
  }

  // Not Logged In Screen -> Render LoginScreen
  if (!user) {
    return <LoginScreen />;
  }

  const deletingTaskObj = tasks.find((t) => t.id === deleteTaskId);

  return (
    <>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateIssueClick={() => handleOpenCreateModal('todo')}
        onOpenConfigClick={() => setIsConfigOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
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
      />

      <Board
        tasks={filteredTasks}
        filterKey={`${assigneeFilter}-${priorityFilter}`}
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

      {/* Admin User Management Modal */}
      {isAdmin && (
        <UserManagementModal
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          onUserAdded={(msg) => addToast(msg, 'success')}
        />
      )}

      {/* Edit Profile & Avatar Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onProfileUpdated={(msg) => addToast(msg, 'success')}
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
