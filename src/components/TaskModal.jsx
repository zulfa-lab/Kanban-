import React, { useState, useEffect } from 'react';
import { X, Trash2, Eye, Edit3, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TaskModal = ({
  isOpen,
  mode = 'create', // 'create' | 'edit'
  initialStatus = 'todo',
  task = null,
  onClose,
  onSave,
  onDeleteRequest,
}) => {
  const { users } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [isPreviewDesc, setIsPreviewDesc] = useState(false);
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (task && mode === 'edit') {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'medium');
      let assigned = task.assigned_to || '';
      if (assigned.includes('zulfa')) assigned = 'zulfa';
      else if (assigned.includes('friend') || assigned.includes('alex')) assigned = 'alex';
      setAssignedTo(assigned);
    } else {
      setTitle('');
      setDescription('');
      setStatus(initialStatus);
      setPriority('medium');
      setAssignedTo(users[0]?.username || 'zulfa');
    }
    setTitleError('');
    setIsPreviewDesc(false);
  }, [task, mode, initialStatus, isOpen, users]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSubmit(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, title, description, status, priority, assignedTo]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Task title is required');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigned_to: assignedTo,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>{mode === 'create' ? 'Create New Issue' : `Issue ${task?.id ? (task.id.startsWith('task-') ? `JIRA-${task.id.replace('task-', '')}` : task.id.slice(0, 8)) : ''}`}</span>
          </div>

          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className="modal-body">
            {/* Title field */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-title-input">
                <span>Title <strong style={{ color: '#ef4444' }}>*</strong></span>
                {titleError && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{titleError}</span>}
              </label>
              <input
                id="task-title-input"
                type="text"
                className="form-input"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError('');
                }}
                autoFocus
              />
            </div>

            {/* Description field with Markdown preview toggle */}
            <div className="form-group">
              <div className="form-label">
                <span>Description & Technical Notes</span>
                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600
                  }}
                  onClick={() => setIsPreviewDesc(!isPreviewDesc)}
                >
                  {isPreviewDesc ? <Edit3 size={12} /> : <Eye size={12} />}
                  <span>{isPreviewDesc ? 'Edit raw text' : 'Preview notes'}</span>
                </button>
              </div>

              {isPreviewDesc ? (
                <div style={{
                  minHeight: 100,
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  color: description.trim() ? 'var(--text-primary)' : 'var(--text-muted)'
                }}>
                  {description.trim() || 'No description provided.'}
                </div>
              ) : (
                <textarea
                  className="form-textarea"
                  placeholder="Add implementation notes, acceptance criteria, or context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              )}
            </div>

            {/* Status Picker */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="segmented-picker">
                <button
                  type="button"
                  className={`segmented-option ${status === 'todo' ? 'selected' : ''}`}
                  onClick={() => setStatus('todo')}
                >
                  To Do
                </button>
                <button
                  type="button"
                  className={`segmented-option ${status === 'in_progress' ? 'selected' : ''}`}
                  onClick={() => setStatus('in_progress')}
                >
                  In Progress
                </button>
                <button
                  type="button"
                  className={`segmented-option ${status === 'done' ? 'selected' : ''}`}
                  onClick={() => setStatus('done')}
                >
                  Done
                </button>
              </div>
            </div>

            {/* Priority Picker */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <div className="segmented-picker">
                <button
                  type="button"
                  className={`segmented-option ${priority === 'low' ? 'selected' : ''}`}
                  onClick={() => setPriority('low')}
                >
                  Low
                </button>
                <button
                  type="button"
                  className={`segmented-option ${priority === 'medium' ? 'selected' : ''}`}
                  onClick={() => setPriority('medium')}
                >
                  Medium
                </button>
                <button
                  type="button"
                  className={`segmented-option ${priority === 'high' ? 'selected' : ''}`}
                  onClick={() => setPriority('high')}
                >
                  High
                </button>
              </div>
            </div>

            {/* Assignee Selector */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-assignee-select">Assignee</label>
              <select
                id="task-assignee-select"
                className="form-select"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Unassigned (Belum Ditugaskan)</option>
                {users.map((u) => (
                  <option key={u.username} value={u.username}>
                    {u.name} (@{u.username}) {u.role === 'admin' ? '— Admin' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Timestamps if editing */}
            {mode === 'edit' && task?.created_at && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                </div>
                {task.updated_at && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} />
                    <span>Updated: {new Date(task.updated_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            {mode === 'edit' ? (
              <button
                type="button"
                className="btn-danger"
                onClick={() => onDeleteRequest(task.id)}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tip: Press <kbd style={{ fontFamily: 'var(--font-mono)' }}>Ctrl+Enter</kbd> to save
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {mode === 'create' ? 'Create Issue' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
