import React from 'react';
import { Users, User, UserCheck, Flame, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_COLLABORATORS } from '../services/mockData';

export const FilterBar = ({
  assigneeFilter,
  onAssigneeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  totalTasksCount,
  filteredTasksCount,
  isFirebaseLive,
  onOpenConfig,
}) => {
  const { user } = useAuth();
  const friendCollab = INITIAL_COLLABORATORS.find((c) => c.email.toLowerCase() !== user?.email?.toLowerCase()) || INITIAL_COLLABORATORS[1];

  return (
    <div className="board-subbar">
      {/* Assignee Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className="filter-group">
          <button
            className={`filter-tab ${assigneeFilter === 'all' ? 'active' : ''}`}
            onClick={() => onAssigneeFilterChange('all')}
          >
            <Users size={14} />
            <span>All Tasks</span>
          </button>

          <button
            className={`filter-tab ${assigneeFilter === 'my_tasks' ? 'active' : ''}`}
            onClick={() => onAssigneeFilterChange('my_tasks')}
            title={`Assigned to ${user?.email}`}
          >
            <User size={14} />
            <span>My Tasks</span>
          </button>

          <button
            className={`filter-tab ${assigneeFilter === 'friends_tasks' ? 'active' : ''}`}
            onClick={() => onAssigneeFilterChange('friends_tasks')}
            title={`Assigned to ${friendCollab?.name} (${friendCollab?.email})`}
          >
            <UserCheck size={14} />
            <span>{friendCollab?.name.split(' ')[0]}'s Tasks</span>
          </button>
        </div>

        {/* Priority Filter */}
        <div className="filter-group">
          <button
            className={`filter-tab ${priorityFilter === 'all' ? 'active' : ''}`}
            onClick={() => onPriorityFilterChange('all')}
          >
            All Priority
          </button>
          <button
            className={`filter-tab ${priorityFilter === 'high' ? 'active' : ''}`}
            onClick={() => onPriorityFilterChange('high')}
          >
            High
          </button>
          <button
            className={`filter-tab ${priorityFilter === 'medium' ? 'active' : ''}`}
            onClick={() => onPriorityFilterChange('medium')}
          >
            Medium
          </button>
          <button
            className={`filter-tab ${priorityFilter === 'low' ? 'active' : ''}`}
            onClick={() => onPriorityFilterChange('low')}
          >
            Low
          </button>
        </div>
      </div>

      {/* Task Count Info */}
      <div className="status-pills">
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredTasksCount}</strong> of {totalTasksCount} issues
        </span>
      </div>
    </div>
  );
};
