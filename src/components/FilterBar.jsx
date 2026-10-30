import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Users, User, ChevronDown, Check, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FilterBar = ({
  assigneeFilter,
  onAssigneeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  totalTasksCount,
  filteredTasksCount,
}) => {
  const { user, users } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Priority indicator refs and animation
  const priorityRefs = {
    all: useRef(null),
    high: useRef(null),
    medium: useRef(null),
    low: useRef(null),
  };

  const [priorityStyle, setPriorityStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const updateIndicators = () => {
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
  }, [priorityFilter]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicators);
    const timeout = setTimeout(updateIndicators, 60);
    return () => {
      window.removeEventListener('resize', updateIndicators);
      clearTimeout(timeout);
    };
  }, []);

  // Find selected user if filtered by a specific collaborator
  const selectedUser = users.find((u) => 
    assigneeFilter === `user:${u.username}` || 
    assigneeFilter === u.username
  );

  // Other users (excluding currently logged in user)
  const otherUsers = users.filter((u) => u.username !== user?.username);

  // Label and Icon for active trigger button
  const getActiveFilterInfo = () => {
    if (assigneeFilter === 'all') {
      return {
        label: 'All Tasks',
        icon: <Users size={14} color="var(--accent-primary)" />,
      };
    }
    if (assigneeFilter === 'my_tasks') {
      return {
        label: `My Tasks (${user?.name?.split(' ')[0] || user?.username})`,
        icon: user?.avatar ? (
          <img src={user.avatar} alt="Me" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <User size={14} color="var(--accent-primary)" />
        ),
      };
    }
    if (assigneeFilter === 'friends_tasks') {
      const friend = otherUsers[0] || { name: 'Teman' };
      return {
        label: `${friend.name?.split(' ')[0]}'s Tasks`,
        icon: <UserCheck size={14} color="var(--accent-primary)" />,
      };
    }
    if (selectedUser) {
      return {
        label: `${selectedUser.name?.split(' ')[0]}'s Tasks`,
        icon: selectedUser.avatar ? (
          <img src={selectedUser.avatar} alt={selectedUser.name} style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <User size={14} color="var(--accent-primary)" />
        ),
      };
    }
    return {
      label: 'All Tasks',
      icon: <Users size={14} color="var(--accent-primary)" />,
    };
  };

  const activeInfo = getActiveFilterInfo();

  return (
    <div className="board-subbar">
      {/* Assignee Dropdown & Priority Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
        
        {/* Assignee Filter Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="filter-dropdown-trigger"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              height: 34,
              padding: '0 0.85rem',
              background: 'var(--bg-surface)',
              border: isDropdownOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: isDropdownOpen ? '0 0 12px var(--accent-glow)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {activeInfo.icon}
            </span>
            <span>{activeInfo.label}</span>
            <ChevronDown 
              size={13} 
              color="var(--text-muted)" 
              style={{
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 180ms ease'
              }}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              className="filter-dropdown-menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: 230,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.4rem',
                zIndex: 60,
                animation: 'slideUp 160ms cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Option 1: All Tasks */}
              <button
                type="button"
                className={`filter-dropdown-item ${assigneeFilter === 'all' ? 'active' : ''}`}
                onClick={() => {
                  onAssigneeFilterChange('all');
                  setIsDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: assigneeFilter === 'all' ? 'rgba(249, 115, 22, 0.12)' : 'transparent',
                  color: assigneeFilter === 'all' ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontWeight: assigneeFilter === 'all' ? 700 : 500,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={14} color={assigneeFilter === 'all' ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  <span>All Tasks</span>
                </div>
                {assigneeFilter === 'all' && <Check size={14} color="var(--accent-primary)" />}
              </button>

              {/* Option 2: My Tasks */}
              <button
                type="button"
                className={`filter-dropdown-item ${assigneeFilter === 'my_tasks' ? 'active' : ''}`}
                onClick={() => {
                  onAssigneeFilterChange('my_tasks');
                  setIsDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: assigneeFilter === 'my_tasks' ? 'rgba(249, 115, 22, 0.12)' : 'transparent',
                  color: assigneeFilter === 'my_tasks' ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontWeight: assigneeFilter === 'my_tasks' ? 700 : 500,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Me" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <User size={14} color={assigneeFilter === 'my_tasks' ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  )}
                  <span>My Tasks (@{user?.username})</span>
                </div>
                {assigneeFilter === 'my_tasks' && <Check size={14} color="var(--accent-primary)" />}
              </button>

              {/* Collaborators Section Divider */}
              {otherUsers.length > 0 && (
                <>
                  <div style={{
                    height: 1,
                    background: 'var(--border-subtle)',
                    margin: '4px 6px'
                  }} />
                  <div style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '4px 10px 2px'
                  }}>
                    Anggota Tim:
                  </div>

                  {otherUsers.map((collab) => {
                    const isSelected = 
                      assigneeFilter === `user:${collab.username}` || 
                      assigneeFilter === collab.username ||
                      (assigneeFilter === 'friends_tasks' && otherUsers[0]?.username === collab.username);

                    return (
                      <button
                        key={collab.id || collab.username}
                        type="button"
                        className={`filter-dropdown-item ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          onAssigneeFilterChange(`user:${collab.username}`);
                          setIsDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          background: isSelected ? 'rgba(249, 115, 22, 0.12)' : 'transparent',
                          color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {collab.avatar ? (
                            <img src={collab.avatar} alt={collab.name} style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              background: collab.role === 'admin' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'var(--bg-card)',
                              color: collab.role === 'admin' ? '#ffffff' : 'var(--text-secondary)',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid var(--border-subtle)'
                            }}>
                              {collab.name ? collab.name[0].toUpperCase() : 'U'}
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{collab.name}</span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>@{collab.username}</span>
                          </div>
                        </div>
                        {isSelected && <Check size={14} color="var(--accent-primary)" />}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
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
