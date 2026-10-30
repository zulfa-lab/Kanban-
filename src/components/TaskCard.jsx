import React from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Helper to format relative time
const formatRelativeTime = (isoString) => {
  if (!isoString) return 'Just now';
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
};

export const TaskCard = ({ task, onClick, onDragStart, onDragEnd, isDragging }) => {
  const { users } = useAuth();
  const assignedUser = users?.find(
    (u) =>
      u.username?.toLowerCase() === task.assigned_to?.toLowerCase() ||
      (task.assigned_to?.includes('zulfa') && u.username === 'zulfa') ||
      (task.assigned_to?.includes('friend') && u.username === 'alex')
  );

  // Priority config
  const priorityConfig = {
    high: { label: 'High', class: 'high' },
    medium: { label: 'Medium', class: 'medium' },
    low: { label: 'Low', class: 'low' },
  }[task.priority] || { label: 'Medium', class: 'medium' };

  // Generate initials
  const initials = assignedUser
    ? assignedUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : task.assigned_to ? task.assigned_to[0].toUpperCase() : '?';

  return (
    <div
      id={`task-card-${task.id}`}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(task);
        }
      }}
    >
      <div className="task-card-header">
        <span className="task-id-badge">{task.id.startsWith('task-') ? `JIRA-${task.id.replace('task-', '')}` : task.id.slice(0, 8)}</span>
        <span className={`priority-badge ${priorityConfig.class}`}>
          {priorityConfig.label}
        </span>
      </div>

      <h4 className="task-card-title">{task.title}</h4>

      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-footer">
        <div className="task-card-time" title={`Updated: ${new Date(task.updated_at || task.created_at).toLocaleString()}`}>
          <Clock size={12} />
          <span>{formatRelativeTime(task.updated_at || task.created_at)}</span>
        </div>

        <div className="assignee-avatar-wrap" title={`Assigned to: ${assignedUser ? `${assignedUser.name} (@${assignedUser.username})` : (task.assigned_to || 'Unassigned')}`}>
          {assignedUser?.avatar ? (
            <img 
              src={assignedUser.avatar} 
              alt={assignedUser.name} 
              className="assignee-avatar" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="assignee-initials" 
            style={{ 
              display: assignedUser?.avatar ? 'none' : 'flex',
              background: assignedUser?.role === 'admin' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : undefined
            }}
          >
            {initials}
          </div>
        </div>
      </div>
    </div>
  );
};
