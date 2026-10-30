import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';

export const Column = ({
  status,
  title,
  tasks,
  onTaskClick,
  onAddTask,
  onDragStart,
  onDragEnd,
  onDropTask,
  draggedTaskId,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Only deactivate if leaving the column boundary
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onDropTask(taskId, status);
    }
  };

  return (
    <div
      id={`column-${status}`}
      className={`kanban-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <div className="column-title-wrap">
          <h3 className="column-title">{title}</h3>
          <span className="column-count-chip">{tasks.length}</span>
        </div>

        <button
          className="btn-add-column"
          onClick={() => onAddTask(status)}
          title={`Add task to ${title}`}
          aria-label={`Add task to ${title}`}
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="column-card-list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={onTaskClick}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isDragging={draggedTaskId === task.id}
          />
        ))}

        {isDragOver && (
          <div className="drop-placeholder" />
        )}

        {tasks.length === 0 && !isDragOver && (
          <div style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}>
            No tasks in {title}
          </div>
        )}
      </div>

      <div className="column-footer-add">
        <button
          className="btn-inline-add"
          onClick={() => onAddTask(status)}
        >
          <Plus size={14} />
          <span>Add a task</span>
        </button>
      </div>
    </div>
  );
};
