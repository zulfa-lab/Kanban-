import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Minus, 
  Send, 
  Paperclip, 
  Volume2, 
  VolumeX, 
  Hash, 
  ExternalLink, 
  CheckCheck,
  Layers,
  Search,
  MessageCircle
} from 'lucide-react';
import { 
  subscribeToChatMessages, 
  sendChatMessage, 
  playChatChime, 
  getDmChannelId 
} from '../services/chatService';

export const TeamChat = ({ tasks = [], onOpenTask, user, users = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState('general');
  const [inputText, setInputText] = useState('');
  const [selectedTaskAttachment, setSelectedTaskAttachment] = useState(null);
  const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(false);
  const [taskPickerSearch, setTaskPickerSearch] = useState('');
  const [isSoundMuted, setIsSoundMuted] = useState(() => {
    return localStorage.getItem('jira_chat_sound_muted') === 'true';
  });

  // Unread tracker: { [channelId]: count }
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  // Subscribe to real-time chat messages
  useEffect(() => {
    const unsubscribe = subscribeToChatMessages((allMessages) => {
      // Check if new message arrived from someone else
      if (allMessages.length > prevMessagesLengthRef.current && prevMessagesLengthRef.current > 0) {
        const latest = allMessages[allMessages.length - 1];
        const isFromMe = user && (latest.senderId === user.username || latest.senderId === user.id);

        if (!isFromMe) {
          playChatChime();

          // Increment unread if window is closed or on different channel
          if (!isOpen || activeChannelId !== latest.channelId) {
            setUnreadCounts((prev) => ({
              ...prev,
              [latest.channelId]: (prev[latest.channelId] || 0) + 1,
              _total: (prev._total || 0) + 1
            }));
          }
        }
      }

      prevMessagesLengthRef.current = allMessages.length;
      setMessages(allMessages);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isOpen, activeChannelId, user]);

  // Scroll to bottom when messages update or channel switches
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeChannelId, isOpen, isMinimized]);

  // Clear unread count for current channel when opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCounts((prev) => {
        const currentChannelUnread = prev[activeChannelId] || 0;
        const newTotal = Math.max(0, (prev._total || 0) - currentChannelUnread);
        return {
          ...prev,
          [activeChannelId]: 0,
          _total: newTotal
        };
      });
    }
  }, [isOpen, activeChannelId]);

  // Toggle sound mute setting
  const toggleSound = () => {
    const next = !isSoundMuted;
    setIsSoundMuted(next);
    localStorage.setItem('jira_chat_sound_muted', String(next));
  };

  // Filter messages for active channel
  const currentMessages = messages.filter((m) => {
    if (activeChannelId === 'general') {
      return !m.channelId || m.channelId === 'general';
    }
    return m.channelId === activeChannelId;
  });

  // Other team members available for Direct Messaging
  const directMessageUsers = users.filter((u) => u.username !== user?.username);

  // Active channel details
  const activeDmUser = activeChannelId !== 'general' 
    ? users.find((u) => getDmChannelId(user?.username, u.username) === activeChannelId)
    : null;

  // Handle sending message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedTaskAttachment) return;

    const payload = {
      channelId: activeChannelId,
      sender: user || { username: 'guest', name: 'Guest User' },
      text: inputText,
      taskAttachment: selectedTaskAttachment,
    };

    setInputText('');
    setSelectedTaskAttachment(null);
    setIsTaskPickerOpen(false);

    await sendChatMessage(payload);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Filter tasks for task picker popover
  const filteredTasksForPicker = tasks.filter((t) => {
    if (!taskPickerSearch.trim()) return true;
    const q = taskPickerSearch.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.id?.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q)
    );
  });

  const totalUnread = unreadCounts._total || 0;

  return (
    <>
      {/* Floating Messenger Toggle Trigger Button */}
      {!isOpen && (
        <button
          id="btn-team-chat-trigger"
          className="team-chat-trigger-btn"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          title="Buka Live Team Chat"
          aria-label="Open Team Chat"
        >
          <div className="chat-trigger-icon-wrap">
            <MessageSquare size={22} className="chat-trigger-icon" />
            <span className="chat-online-pulse" />
          </div>

          <span className="chat-trigger-label">Team Chat</span>

          {totalUnread > 0 && (
            <span className="chat-unread-badge animate-bounce">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </button>
      )}

      {/* Floating Chat Widget Window */}
      {isOpen && (
        <div 
          className={`team-chat-window ${isMinimized ? 'minimized' : ''}`}
          role="region"
          aria-label="Live Team Messenger"
        >
          {/* Header */}
          <div className="team-chat-header">
            <div className="chat-header-info">
              {activeChannelId === 'general' ? (
                <div className="chat-header-channel">
                  <div className="channel-icon-circle">
                    <Hash size={16} />
                  </div>
                  <div>
                    <div className="channel-title">#general</div>
                    <div className="channel-subtitle">Sprint & Team Standup</div>
                  </div>
                </div>
              ) : (
                <div className="chat-header-channel">
                  <div className="user-avatar-small-wrap">
                    {activeDmUser?.avatar ? (
                      <img 
                        src={activeDmUser.avatar} 
                        alt={activeDmUser.name} 
                        className="user-avatar-small"
                      />
                    ) : (
                      <div 
                        className="user-avatar-small-fallback"
                        style={{ background: activeDmUser?.color || 'var(--accent-primary)' }}
                      >
                        {activeDmUser?.name ? activeDmUser.name[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="user-online-dot" />
                  </div>
                  <div>
                    <div className="channel-title">{activeDmUser?.name || 'Collaborator'}</div>
                    <div className="channel-subtitle">
                      @{activeDmUser?.username} • {activeDmUser?.role === 'admin' ? 'Admin' : 'Member'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="chat-header-actions">
              {/* Sound notification toggle */}
              <button
                type="button"
                className="chat-header-btn"
                onClick={toggleSound}
                title={isSoundMuted ? 'Nyalakan Efek Suara' : 'Matikan Efek Suara'}
              >
                {isSoundMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              {/* Minimize / Expand */}
              <button
                type="button"
                className="chat-header-btn"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Perbesar Chat' : 'Minimalkan'}
              >
                <Minus size={15} />
              </button>

              {/* Close */}
              <button
                type="button"
                className="chat-header-btn"
                onClick={() => setIsOpen(false)}
                title="Tutup Chat"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Channel / DM Selector Tabs */}
              <div className="team-chat-tabs">
                <button
                  type="button"
                  className={`chat-tab-pill ${activeChannelId === 'general' ? 'active' : ''}`}
                  onClick={() => setActiveChannelId('general')}
                >
                  <Hash size={13} />
                  <span>general</span>
                  {(unreadCounts['general'] || 0) > 0 && (
                    <span className="tab-unread-dot" />
                  )}
                </button>

                {directMessageUsers.map((u) => {
                  const dmId = getDmChannelId(user?.username, u.username);
                  const isAct = activeChannelId === dmId;
                  const unread = unreadCounts[dmId] || 0;

                  return (
                    <button
                      key={u.username}
                      type="button"
                      className={`chat-tab-pill ${isAct ? 'active' : ''}`}
                      onClick={() => setActiveChannelId(dmId)}
                      title={`Direct Message ke ${u.name}`}
                    >
                      <span className="tab-user-status-dot" />
                      <span>{u.name.split(' ')[0]}</span>
                      {unread > 0 && <span className="tab-unread-dot" />}
                    </button>
                  );
                })}
              </div>

              {/* Messages Body */}
              <div className="team-chat-messages-scroll">
                {currentMessages.length === 0 ? (
                  <div className="chat-empty-state">
                    <MessageCircle size={32} style={{ opacity: 0.35, marginBottom: 8 }} />
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>
                      Belum ada obrolan di sini
                    </p>
                    <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>
                      Mulai diskusi atau sematkan tiket task dengan tombol task di bawah.
                    </span>
                  </div>
                ) : (
                  currentMessages.map((msg) => {
                    const isMe = user && (msg.senderId === user.username || msg.senderId === user.id);
                    const formattedTime = msg.createdAt 
                      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';

                    return (
                      <div 
                        key={msg.id} 
                        className={`chat-message-row ${isMe ? 'message-out' : 'message-in'}`}
                      >
                        {!isMe && (
                          <div className="message-avatar-wrap">
                            {msg.senderAvatar ? (
                              <img 
                                src={msg.senderAvatar} 
                                alt={msg.senderName} 
                                className="chat-msg-avatar" 
                              />
                            ) : (
                              <div 
                                className="chat-msg-avatar-fallback"
                                style={{ background: msg.senderColor || 'var(--accent-primary)' }}
                              >
                                {msg.senderName ? msg.senderName[0].toUpperCase() : 'U'}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="message-bubble-wrapper">
                          {!isMe && (
                            <div className="message-sender-meta">
                              <span className="message-sender-name">{msg.senderName}</span>
                              {msg.senderRole === 'admin' && (
                                <span className="message-role-tag">Admin</span>
                              )}
                            </div>
                          )}

                          <div className="chat-bubble">
                            {msg.text && (
                              <p className="chat-bubble-text">{msg.text}</p>
                            )}

                            {/* Embedded Interactive Task Card Attachment */}
                            {msg.taskAttachment && (
                              <div 
                                className="chat-task-attachment-card"
                                onClick={() => {
                                  if (onOpenTask) {
                                    onOpenTask(msg.taskAttachment.id);
                                  }
                                }}
                                title="Klik untuk membuka detail task ini"
                              >
                                <div className="attachment-card-top">
                                  <span className="attachment-key">
                                    {msg.taskAttachment.id.startsWith('task-') 
                                      ? `JIRA-${msg.taskAttachment.id.replace('task-', '')}` 
                                      : msg.taskAttachment.id.slice(0, 8)}
                                  </span>
                                  <span className={`attachment-status-pill status-${msg.taskAttachment.status}`}>
                                    {msg.taskAttachment.status === 'in_progress' ? 'In Progress' : (msg.taskAttachment.status === 'done' ? 'Done' : 'To Do')}
                                  </span>
                                </div>
                                <div className="attachment-card-title">
                                  {msg.taskAttachment.title}
                                </div>
                                <div className="attachment-card-footer">
                                  <span>Buka tiket di Kanban</span>
                                  <ExternalLink size={12} />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="message-time-stamp">
                            <span>{formattedTime}</span>
                            {isMe && <CheckCheck size={13} style={{ color: 'var(--accent-primary)', marginLeft: 3 }} />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Task Picker Dropdown Popover */}
              {isTaskPickerOpen && (
                <div className="task-picker-popover">
                  <div className="task-picker-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700 }}>
                      <Layers size={14} color="var(--accent-primary)" />
                      <span>Sematkan Tiket Task</span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-icon" 
                      style={{ width: 22, height: 22 }}
                      onClick={() => setIsTaskPickerOpen(false)}
                    >
                      <X size={13} />
                    </button>
                  </div>

                  <div className="task-picker-search-wrap">
                    <Search size={13} style={{ opacity: 0.5 }} />
                    <input
                      type="text"
                      className="task-picker-search-input"
                      placeholder="Cari task..."
                      value={taskPickerSearch}
                      onChange={(e) => setTaskPickerSearch(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="task-picker-list">
                    {filteredTasksForPicker.length === 0 ? (
                      <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Tidak ada task ditemukan
                      </div>
                    ) : (
                      filteredTasksForPicker.map((t) => (
                        <div
                          key={t.id}
                          className="task-picker-item"
                          onClick={() => {
                            setSelectedTaskAttachment(t);
                            setIsTaskPickerOpen(false);
                            inputRef.current?.focus();
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="attachment-key" style={{ fontSize: '0.7rem' }}>
                              {t.id.startsWith('task-') ? `JIRA-${t.id.replace('task-', '')}` : t.id.slice(0, 8)}
                            </span>
                            <span className={`attachment-status-pill status-${t.status}`} style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                              {t.status === 'in_progress' ? 'In Progress' : (t.status === 'done' ? 'Done' : 'To Do')}
                            </span>
                          </div>
                          <div className="task-picker-item-title">{t.title}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="team-chat-input-container">
                {/* Selected Task preview chip */}
                {selectedTaskAttachment && (
                  <div className="attached-task-chip">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                      <Layers size={13} color="var(--accent-primary)" />
                      <span className="attached-task-title">
                        {selectedTaskAttachment.id.startsWith('task-') 
                          ? `JIRA-${selectedTaskAttachment.id.replace('task-', '')}: ` 
                          : ''}{selectedTaskAttachment.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="attached-task-remove-btn"
                      onClick={() => setSelectedTaskAttachment(null)}
                      title="Hapus sematan task"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <form className="chat-input-form" onSubmit={handleSendMessage}>
                  <button
                    type="button"
                    className={`chat-attach-btn ${selectedTaskAttachment || isTaskPickerOpen ? 'active' : ''}`}
                    onClick={() => setIsTaskPickerOpen(!isTaskPickerOpen)}
                    title="Sematkan kartu Task ke percakapan"
                  >
                    <Paperclip size={16} />
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    className="chat-text-input"
                    placeholder={
                      activeChannelId === 'general'
                        ? 'Kirim pesan ke #general...'
                        : `Kirim pesan ke ${activeDmUser?.name || 'teman'}...`
                    }
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />

                  <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={!inputText.trim() && !selectedTaskAttachment}
                    title="Kirim pesan (Enter)"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
