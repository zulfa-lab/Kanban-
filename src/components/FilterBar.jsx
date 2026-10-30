import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Users, User, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_COLLABORATORS } from '../services/mockData';

export const FilterBar = ({
  assigneeFilter,
  onAssigneeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  totalTasksCount,
  filteredTasksCount,
}) => {
  const { user } = useAuth();
  const friendCollab = INITIAL_COLLABORATORS.find((c) => c.email.toLowerCase() !== user?.email?.toLowerCase()) || INITIAL_COLLABORATORS[1];

  const assigneeRefs = {
    all: useRef(null),
    my_tasks: useRef(null),
    friends_tasks: useRef(null),
  };

  const priorityRefs = {
    all: useRef(null),
    high: useRef(null),
    medium: useRef(null),
    low: useRef(null),
  };

  const [assigneeStyle, setAssigneeStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [priorityStyle, setPriorityStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const updateIndicators = () => {
    const aEl = assigneeRefs[assigneeFilter]?.current;
    if (aEl) {
      setAssigneeStyle({
        left: aEl.offsetLeft,
        width: aEl.offsetWidth,
        opacity: 1,
      });
    }

    const pEl = priorityRefs[priorityFilter]?.current;
    if (pEl) {
      setPriorityStyle({
        left: pEl.offsetLeft,
        width: pEl.offsetWidth,
        opacity: 1,
      });
    }
  };

  useLayoutEffect(() => {
    updateIndicators();
  }, [assigneeFilter, priorityFilter]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicators);
    const timeout = setTimeout(updateIndicators, 60);
    return () => {
      window.removeEventListener('resize', updateIndicators);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="board-subbar">
      {/* Assignee & Priority Filters with Slide Animations */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        
        {/* Assignee Filter with Smooth Sliding Pill */}
        <div className="filter-group">
          <div
            className="sliding-pill"
            style={{
              left: `${assigneeStyle.left}px`,
              width: `${assigneeStyle.width}px`,
              opacity: assigneeStyle.opacity,
            }}
          />

          <button
            ref={assigneeRefs.all}
            className={`filter-tab ${assigneeFilter === 'all' ? 'active' : ''}`}
            onClick={() => onAssigneeFilterChange('all')}
          >
            <Users size={14} />
            <span>All Tasks</span>
          </button>

          <button
            ref={assigneeRefs.my_tasks}
            className={`filter-tab ${assigneeFilter === 'my_tasks' ? 'active' : ''}`}
            onClick={() => onAssigneeFilterChange('my_tasks')}
            title={`Assigned to ${user?.email}`}
          >
            <User size={14} />
            <span>My Tasks</span>
          </button>

          <button
            ref={assigneeRefs.friends_tasks}
            className={`filter-tab ${assigneeFilter === 'friends_tasks' ? 'active' : ''}`}
            onClick={() => onAssigneeFilterChange('friends_tasks')}
            title={`Assigned to ${friendCollab?.name} (${friendCollab?.email})`}
          >
            <UserCheck size={14} />
            <span>{friendCollab?.name.split(' ')[0]}'s Tasks</span>
          </button>
        </div>

        {/* Priority Filter with Smooth Sliding Pill */}
        <div className="filter-group">
          <div
            className="sliding-pill"
            style={{
              left: `${priorityStyle.left}px`,
              width: `${priorityStyle.width}px`,
              opacity: priorityStyle.opacity,
            }}
          />

          <button
            ref={priorityRefs.all}
            className={`filter-tab ${priorityFilter === 'all' ? 'active' : ''}`}
            onClick={() => onPriorityFilterChange('all')}
          >
            All Priority
          </button>
          <button
            ref={priorityRefs.high}
            className={`filter-tab ${priorityFilter === 'high' ? 'active' : ''}`}
            onClick={() => onPriorityFilterChange('high')}
          >
            High
          </button>
          <button
            ref={priorityRefs.medium}
            className={`filter-tab ${priorityFilter === 'medium' ? 'active' : ''}`}
            onClick={() => onPriorityFilterChange('medium')}
          >
            Medium
          </button>
          <button
            ref={priorityRefs.low}
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
