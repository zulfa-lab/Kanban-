import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Users, User, ChevronDown, Check, UserCheck, ArrowUpDown, ArrowDownWideNarrow, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FilterBar = ({
  assigneeFilter,
  onAssigneeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy = 'default',
  onSortChange,
  totalTasksCount,
  filteredTasksCount,
}) => {
  const { user, users } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setIsSortDropdownOpen(false);
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

  const SORT_OPTIONS = [
    {
      id: 'default',
      label: 'Default Order',
      shortLabel: 'Default',
      badge: null,
      description: 'Urutan asli board',
      icon: <ArrowUpDown size={14} color="var(--text-muted)" />,
    },
    {
      id: 'priority_desc',
      label: 'Priority: High → Low',
      shortLabel: 'High First',
      badge: 'High First',
      badgeColor: '#ef4444',
      description: 'Prioritas tertinggi ke terendah',
      icon: <ArrowDownWideNarrow size={14} color="#ef4444" />,
    },
    {
      id: 'priority_asc',
      label: 'Priority: Low → High',
      shortLabel: 'Low First',
      badge: 'Low First',
      badgeColor: '#10b981',
      description: 'Prioritas terendah ke tertinggi',
      icon: <ArrowDownWideNarrow size={14} style={{ transform: 'rotate(180deg)' }} color="#10b981" />,
    },
    {
      id: 'newest',
      label: 'Terbaru (Newest)',
      shortLabel: 'Newest',
      badge: null,
      description: 'Dibuat paling baru',
      icon: <Clock size={14} color="var(--accent-primary)" />,
    },
    {
      id: 'oldest',
      label: 'Terlama (Oldest)',
      shortLabel: 'Oldest',
      badge: null,
      description: 'Dibuat paling awal',
      icon: <Clock size={14} color="var(--text-muted)" />,
    },
  ];

  const currentSort = SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="board-subbar">
      {/* Assignee Dropdown & Priority Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
        
        {/* Assignee Filter Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className={`filter-dropdown-trigger ${isDropdownOpen ? 'active' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
            <div className="filter-dropdown-menu">
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

        {/* Sort Filter Dropdown */}
        <div ref={sortDropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className={`filter-dropdown-trigger ${isSortDropdownOpen || sortBy !== 'default' ? 'active' : ''}`}
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            style={{
              gap: '0.5rem',
              ...(sortBy !== 'default' ? { color: 'var(--accent-primary)', fontWeight: 700 } : {})
            }}
            title="Urutkan kartu berdasarkan prioritas atau waktu"
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {currentSort.icon}
            </span>
            <span>Sort: {currentSort.shortLabel}</span>
            <ChevronDown
              size={13}
              color="var(--text-muted)"
              style={{
                transform: isSortDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 180ms ease'
              }}
            />
          </button>

          {/* Sort Dropdown Menu */}
          {isSortDropdownOpen && (
            <div 
              className="filter-dropdown-menu" 
              style={{ width: '250px' }}
            >
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '4px 10px 6px'
              }}>
                Urutkan Kartu:
              </div>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`filter-dropdown-item ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      if (onSortChange) onSortChange(opt.id);
                      setIsSortDropdownOpen(false);
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
                      textAlign: 'left',
                      marginBottom: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        {opt.icon}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{opt.label}</span>
                          {opt.badge && (
                            <span style={{
                              fontSize: '0.62rem',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              background: `${opt.badgeColor}22`,
                              color: opt.badgeColor,
                              fontWeight: 700
                            }}>
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {opt.description}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check size={14} color="var(--accent-primary)" />}
                  </button>
                );
              })}
            </div>
          )}
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
