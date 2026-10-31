import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot, 
  serverTimestamp 
} from './firebase';

const LOCAL_STORAGE_CHAT_KEY = 'jira_lite_chat_messages_v1';
const CHAT_INITIALIZED_KEY = 'jira_lite_chat_initialized_v2';
const BROADCAST_CHAT_CHANNEL = 'jira_lite_chat_bus';

// Initial conversation seed for brand new workspace
export const INITIAL_MESSAGES = [
  {
    id: 'msg-init-1',
    channelId: 'general',
    senderId: 'alex',
    senderName: 'Alex Rivera',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    senderRole: 'collaborator',
    senderColor: '#06b6d4',
    text: 'Halo tim! Update sprint kita: fitur Kanban Drag & Drop dan User Management sudah live 🚀',
    taskAttachment: null,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'msg-init-2',
    channelId: 'general',
    senderId: 'zulfa',
    senderName: 'Zulfa',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    senderRole: 'admin',
    senderColor: '#f97316',
    text: 'Mantap Alex! Aku barusan uji coba task ini, animasinya halus banget dan sync realtime bekerja normal.',
    taskAttachment: {
      id: 'task-103',
      title: 'Smooth Drag-and-Drop Kanban interactions',
      status: 'in_progress',
      priority: 'high',
      assigned_to: 'zulfa'
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'msg-init-3',
    channelId: 'general',
    senderId: 'alex',
    senderName: 'Alex Rivera',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    senderRole: 'collaborator',
    senderColor: '#06b6d4',
    text: 'Siap! Sekarang kita bisa mention tiket langsung di sini dan diskusi tanpa perlu buka-tutup tab.',
    taskAttachment: null,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  }
];

// Helper: BroadcastChannel for real-time multi-tab chat
let chatChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    chatChannel = new BroadcastChannel(BROADCAST_CHAT_CHANNEL);
  } catch (err) {
    console.warn('BroadcastChannel not supported for chat:', err);
  }
}

// Web Audio API chime generator
export const playChatChime = () => {
  try {
    const isMuted = localStorage.getItem('jira_chat_sound_muted') === 'true';
    if (isMuted) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.24);
  } catch {
    // AudioContext blocked
  }
};

// Generate consistent channel ID for direct messages between 2 users
export const getDmChannelId = (userA, userB) => {
  const u1 = (userA || '').trim().toLowerCase();
  const u2 = (userB || '').trim().toLowerCase();
  const sorted = [u1, u2].sort();
  return `dm:${sorted[0]}:${sorted[1]}`;
};

// Read local stored messages
export const getStoredMessages = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CHAT_KEY);
    const hasInitialized = localStorage.getItem(CHAT_INITIALIZED_KEY) === 'true';

    if (raw === null) {
      if (!hasInitialized) {
        localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(INITIAL_MESSAGES));
        localStorage.setItem(CHAT_INITIALIZED_KEY, 'true');
        return INITIAL_MESSAGES;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading local chat messages:', err);
    return [];
  }
};

// Save local messages & broadcast to other tabs
export const saveStoredMessages = (messages) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(messages));
    if (chatChannel) {
      chatChannel.postMessage({ type: 'SYNC_CHAT', timestamp: Date.now() });
    }
    window.dispatchEvent(new CustomEvent('jira_chat_local_sync', { detail: messages }));
  } catch (err) {
    console.error('Error saving local chat messages:', err);
  }
};

const saveStoredMessagesSilently = (messages) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(messages));
  } catch {
    // ignore
  }
};

/**
 * Subscribe to chat messages with real-time sync.
 */
export const subscribeToChatMessages = (onMessagesUpdated, onError) => {
  let unsubscribeFirestore = null;

  // 1. Initial immediate emit from local storage cache
  onMessagesUpdated(getStoredMessages());

  // 2. Set up local listeners (always active concurrently)
  const handleStorageChange = (e) => {
    if (e.key === LOCAL_STORAGE_CHAT_KEY) {
      onMessagesUpdated(getStoredMessages());
    }
  };

  const handleCustomSync = (e) => {
    if (e.detail) {
      onMessagesUpdated(e.detail);
    } else {
      onMessagesUpdated(getStoredMessages());
    }
  };

  const handleBroadcastMessage = (e) => {
    if (e.data && e.data.type === 'SYNC_CHAT') {
      onMessagesUpdated(getStoredMessages());
    }
  };

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('jira_chat_local_sync', handleCustomSync);
  if (chatChannel) {
    chatChannel.addEventListener('message', handleBroadcastMessage);
  }

  // 3. Connect to Firestore Cloud Database if configured
  if (isFirebaseConfigured && db) {
    try {
      const chatCol = collection(db, 'chat_messages');
      unsubscribeFirestore = onSnapshot(
        chatCol,
        async (snapshot) => {
          if (!snapshot.empty) {
            const cloudMessages = snapshot.docs.map((d) => {
              const data = d.data();
              let ts = data.createdAt;
              if (data.serverCreatedAt?.toDate) {
                ts = data.serverCreatedAt.toDate().toISOString();
              }
              return {
                ...data,
                id: d.id, // Primary key is always Firestore document ID
                createdAt: ts || new Date().toISOString(),
              };
            });

            // Sort chronologically ascending
            cloudMessages.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

            localStorage.setItem(CHAT_INITIALIZED_KEY, 'true');
            saveStoredMessagesSilently(cloudMessages);
            onMessagesUpdated(cloudMessages);
          } else {
            // Snapshot is empty: check if intentionally cleared or brand new
            const localInitialized = localStorage.getItem(CHAT_INITIALIZED_KEY) === 'true';
            let cloudInitialized = false;

            try {
              const initDoc = await getDoc(doc(db, 'system_settings', 'chat_init'));
              cloudInitialized = initDoc.exists() && initDoc.data()?.initialized;
            } catch {
              // ignore offline error
            }

            if (localInitialized || cloudInitialized) {
              // User has intentionally cleared/deleted all messages! Do NOT resurrect initial messages!
              localStorage.setItem(CHAT_INITIALIZED_KEY, 'true');
              saveStoredMessagesSilently([]);
              onMessagesUpdated([]);
              return;
            }

            // ONLY on brand-new workspace: seed initial messages once
            localStorage.setItem(CHAT_INITIALIZED_KEY, 'true');
            try {
              await setDoc(doc(db, 'system_settings', 'chat_init'), {
                initialized: true,
                initialized_at: serverTimestamp(),
              });
            } catch (e) {
              console.warn('Setting chat_init doc failed:', e);
            }

            for (const msg of INITIAL_MESSAGES) {
              try {
                await setDoc(doc(db, 'chat_messages', msg.id), msg);
              } catch (e) {
                console.warn('Could not seed initial message to Firestore:', e);
              }
            }
            saveStoredMessagesSilently(INITIAL_MESSAGES);
            onMessagesUpdated(INITIAL_MESSAGES);
          }
        },
        (error) => {
          console.warn('Firestore chat listener error:', error);
          if (onError) onError(error);
          onMessagesUpdated(getStoredMessages());
        }
      );
    } catch (err) {
      console.warn('Error setting up Firestore chat listener:', err);
      if (onError) onError(err);
    }
  }

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('jira_chat_local_sync', handleCustomSync);
    if (chatChannel) {
      chatChannel.removeEventListener('message', handleBroadcastMessage);
    }
    if (typeof unsubscribeFirestore === 'function') {
      unsubscribeFirestore();
    }
  };
};

/**
 * Send a new chat message.
 */
export const sendChatMessage = async ({ messageId, channelId, sender, text, taskAttachment = null }) => {
  if (!text.trim() && !taskAttachment) return null;

  const id = messageId || ('msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6));
  const newMessage = {
    id,
    channelId: channelId || 'general',
    senderId: sender.username || sender.id || 'anonymous',
    senderName: sender.name || sender.username || 'User',
    senderAvatar: sender.avatar || null,
    senderRole: sender.role || 'user',
    senderColor: sender.color || '#f97316',
    text: text.trim(),
    taskAttachment: taskAttachment ? {
      id: taskAttachment.id,
      title: taskAttachment.title,
      status: taskAttachment.status,
      priority: taskAttachment.priority,
      assigned_to: taskAttachment.assigned_to || ''
    } : null,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(CHAT_INITIALIZED_KEY, 'true');

  // 1. Immediately store in local storage & broadcast
  const current = getStoredMessages();
  const exists = current.some((m) => m.id === newMessage.id);
  const updated = exists 
    ? current.map((m) => m.id === newMessage.id ? newMessage : m) 
    : [...current, newMessage];
  saveStoredMessages(updated);

  // 2. Persist to Firestore Cloud Database
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'chat_messages', newMessage.id), {
        ...newMessage,
        serverCreatedAt: serverTimestamp(),
      });
      // Mark system settings initialized
      try {
        await setDoc(doc(db, 'system_settings', 'chat_init'), { initialized: true });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Failed to save chat message to Cloud Firestore:', err);
      throw err;
    }
  }

  return newMessage;
};

/**
 * Delete a specific chat message.
 */
export const deleteChatMessage = async (messageId) => {
  if (!messageId) return false;

  localStorage.setItem(CHAT_INITIALIZED_KEY, 'true');

  // 1. Remove from local storage cache & broadcast
  const current = getStoredMessages();
  const updated = current.filter((m) => m.id !== messageId);
  saveStoredMessages(updated);

  // 2. Delete document in Firestore Cloud Database
  if (isFirebaseConfigured && db) {
    try {
      // Direct doc deletion by document ID
      await deleteDoc(doc(db, 'chat_messages', messageId));

      // Also scan and delete any document with matching data.id to resolve legacy mismatches
      try {
        const snap = await getDocs(collection(db, 'chat_messages'));
        snap.forEach(async (d) => {
          if (d.id === messageId || d.data().id === messageId) {
            await deleteDoc(doc(db, 'chat_messages', d.id));
          }
        });
      } catch {
        // ignore
      }

      try {
        await setDoc(doc(db, 'system_settings', 'chat_init'), { initialized: true });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Failed to delete chat message in Cloud Firestore:', err);
      throw err;
    }
  }

  return true;
};

/**
 * Clear all chat messages (Admin only).
 * Permanently wipes chat history and prevents default initial messages from re-seeding.
 */
export const clearAllChatMessages = async () => {
  localStorage.setItem(CHAT_INITIALIZED_KEY, 'true');
  saveStoredMessages([]);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'system_settings', 'chat_init'), {
        initialized: true,
        cleared_at: serverTimestamp(),
      });

      const snap = await getDocs(collection(db, 'chat_messages'));
      const deletions = snap.docs.map((d) => deleteDoc(doc(db, 'chat_messages', d.id)));
      await Promise.all(deletions);
    } catch (err) {
      console.error('Failed to clear all chat messages in Cloud Firestore:', err);
      throw err;
    }
  }

  return true;
};
