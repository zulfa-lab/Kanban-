import React, { useState } from 'react';
import { Column } from './Column';

export const Board = ({
  tasks,
  filterKey,
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
  const todoTasks = tasks
    .filter((t) => t.status === 'todo')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const inProgressTasks = tasks
    .filter((t) => t.status === 'in_progress')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const doneTasks = tasks
    .filter((t) => t.status === 'done')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

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
