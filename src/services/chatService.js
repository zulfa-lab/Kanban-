import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from './firebase';

const LOCAL_STORAGE_CHAT_KEY = 'jira_lite_chat_messages_v1';
const CHAT_INITIALIZED_KEY = 'jira_lite_chat_initialized_v1';
const BROADCAST_CHAT_CHANNEL = 'jira_lite_chat_bus';

// Initial conversation seed to make the chat lively right away
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

// Helper: BroadcastChannel for real-time multi-tab chat in Sandbox mode
let chatChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    chatChannel = new BroadcastChannel(BROADCAST_CHAT_CHANNEL);
  } catch (err) {
    console.warn('BroadcastChannel not supported for chat:', err);
  }
}

// Web Audio API synthesizer for pleasant chime sound (zero external audio file dependency)
export const playChatChime = () => {
  try {
    const isMuted = localStorage.getItem('jira_chat_sound_muted') === 'true';
    if (isMuted) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First note (587.33 Hz - D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08); // slide to A5

    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.24);
  } catch {
    // AudioContext blocked or user hasn't interacted yet
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
    const hasInitialized = localStorage.getItem(CHAT_INITIALIZED_KEY);

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
const saveStoredMessages = (messages) => {
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

/**
 * Subscribe to chat messages with real-time sync (Firestore or LocalStorage + BroadcastChannel).
 */
export const subscribeToChatMessages = (onMessagesUpdated, onError) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'chat_messages'), orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          if (!snapshot.empty) {
            const messages = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }));
            onMessagesUpdated(messages);
          } else {
            // First time in Firestore: seed initial messages
            const local = getStoredMessages();
            for (const msg of local) {
              try {
                const { id: _id, ...data } = msg;
                await addDoc(collection(db, 'chat_messages'), data);
              } catch (e) {
                console.warn('Could not seed initial message to Firestore:', e);
              }
            }
            onMessagesUpdated(local);
          }
        },
        (error) => {
          console.warn('Firestore chat listener error, falling back to local storage:', error);
          if (onError) onError(error);
          onMessagesUpdated(getStoredMessages());
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn('Error setting up Firestore chat listener:', err);
      if (onError) onError(err);
    }
  }

  // Local BroadcastChannel / Storage mode
  onMessagesUpdated(getStoredMessages());

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

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('jira_chat_local_sync', handleCustomSync);
    if (chatChannel) {
      chatChannel.removeEventListener('message', handleBroadcastMessage);
    }
  };
};

/**
 * Send a new chat message.
 */
export const sendChatMessage = async ({ channelId, sender, text, taskAttachment = null }) => {
  if (!text.trim() && !taskAttachment) return null;

  const newMessage = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
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

  // Try saving to Firestore if available
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'chat_messages'), {
        ...newMessage,
        serverCreatedAt: serverTimestamp(),
      });
      newMessage.id = docRef.id;
    } catch (err) {
      console.warn('Failed to save chat message to Firestore, storing locally:', err);
    }
  }

  // Always keep LocalStorage in sync
  const current = getStoredMessages();
  const updated = [...current, newMessage];
  saveStoredMessages(updated);

  return newMessage;
};
