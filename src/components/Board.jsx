import React, { useState } from 'react';
import { Column } from './Column';

const PRIORITY_WEIGHTS = {
  high: 3,
  medium: 2,
  low: 1,
};

const sortTasks = (taskList, sortOrder) => {
  return [...taskList].sort((a, b) => {
    if (sortOrder === 'priority_desc') {
      const pDiff = (PRIORITY_WEIGHTS[b.priority] || 0) - (PRIORITY_WEIGHTS[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      return (a.order || 0) - (b.order || 0);
    }
    if (sortOrder === 'priority_asc') {
      const pDiff = (PRIORITY_WEIGHTS[a.priority] || 0) - (PRIORITY_WEIGHTS[b.priority] || 0);
      if (pDiff !== 0) return pDiff;
      return (a.order || 0) - (b.order || 0);
    }
    if (sortOrder === 'newest') {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }
    if (sortOrder === 'oldest') {
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    }
    // 'default' (manual drag order)
    return (a.order || 0) - (b.order || 0);
  });
};

export const Board = ({
  tasks,
  filterKey,
  sortBy = 'default',
  onTaskClick,
  onAddTask,
  onUpdateTaskStatus,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const handleDragStart = (e, task) => {
    setDraggedTaskId(task.id);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDropTask = (taskId, targetStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status !== targetStatus) {
      onUpdateTaskStatus(taskId, targetStatus);
    }
  };

  // Group and sort tasks by column
  const todoTasks = sortTasks(
    tasks.filter((t) => t.status === 'todo'),
    sortBy
  );

  const inProgressTasks = sortTasks(
    tasks.filter((t) => t.status === 'in_progress'),
    sortBy
  );

  const doneTasks = sortTasks(
    tasks.filter((t) => t.status === 'done'),
    sortBy
  );

  return (
    <main className="board-container">
      <div className="board-columns-grid">
        <Column
          status="todo"
          title="To Do"
          tasks={todoTasks}
          filterKey={filterKey}
          onTaskClick={onTaskClick}
          onAddTask={onAddTask}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDropTask={handleDropTask}
          draggedTaskId={draggedTaskId}
        />

        <Column
          status="in_progress"
          title="In Progress"
          tasks={inProgressTasks}
          filterKey={filterKey}
          onTaskClick={onTaskClick}
          onAddTask={onAddTask}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDropTask={handleDropTask}
          draggedTaskId={draggedTaskId}
        />

        <Column
          status="done"
          title="Done"
          tasks={doneTasks}
          filterKey={filterKey}
          onTaskClick={onTaskClick}
          onAddTask={onAddTask}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDropTask={handleDropTask}
          draggedTaskId={draggedTaskId}
        />
      </div>
    </main>
  );
};
