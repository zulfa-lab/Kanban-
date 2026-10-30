import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { INITIAL_COLLABORATORS } from '../services/mockData';

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
  const collaborator = INITIAL_COLLABORATORS.find((c) => c.email.toLowerCase() === task.assigned_to?.toLowerCase());

  // Priority color config
  const priorityConfig = {
    high: { label: 'High', class: 'high', icon: '🔴' },
    medium: { label: 'Medium', class: 'medium', icon: '🟡' },
    low: { label: 'Low', class: 'low', icon: '🟢' },
  }[task.priority] || { label: 'Medium', class: 'medium', icon: '🟡' };

  // Generate initials
  const initials = collaborator
    ? collaborator.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
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

        <div className="assignee-avatar-wrap" title={`Assigned to: ${task.assigned_to || 'Unassigned'}`}>
          {collaborator?.avatar ? (
            <img 
              src={collaborator.avatar} 
              alt={collaborator.name} 
              className="assignee-avatar" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="assignee-initials" 
            style={{ display: collaborator?.avatar ? 'none' : 'flex' }}
          >
            {initials}
          </div>
        </div>
      </div>
    </div>
  );
};
