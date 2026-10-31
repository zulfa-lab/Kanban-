import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot 
} from './firebase';

const PRESENCE_BUS = 'jira_lite_presence_bus';
const HEARTBEAT_INTERVAL_MS = 20000; // 20s heartbeat
const ONLINE_EXPIRY_MS = 45000; // 45s cutoff before marking offline

let presenceChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    presenceChannel = new BroadcastChannel(PRESENCE_BUS);
  } catch (err) {
    console.warn('BroadcastChannel not supported for presence:', err);
  }
}

/**
 * Start presence tracking for the logged in user.
 * Returns unsubscribe/cleanup function.
 */
export const startPresenceTracking = (currentUser, onPresenceMapChange) => {
  const currentUsername = currentUser?.username?.toLowerCase();
  const presenceMap = {}; // { [username]: timestamp }
  let firestoreUnsubscribe = null;
  let heartbeatTimer = null;
  let sweepTimer = null;

  const emitOnlineMap = () => {
    const now = Date.now();
    const result = {};

    // Current user is always online locally
    if (currentUsername) {
      result[currentUsername] = true;
    }

    Object.entries(presenceMap).forEach(([uname, info]) => {
      if (info && info.status === 'online' && now - info.lastActive < ONLINE_EXPIRY_MS) {
        result[uname] = true;
      }
    });

    onPresenceMapChange(result);
  };

  // 1. Send heartbeat to keep status alive
  const sendHeartbeat = async (status = 'online') => {
    if (!currentUsername) return;

    const now = Date.now();
    const payload = {
      username: currentUsername,
      status,
      lastActive: now,
    };

    // Broadcast locally across browser tabs
    if (presenceChannel) {
      presenceChannel.postMessage({ type: 'PRESENCE_UPDATE', ...payload });
    }

    // Persist to Cloud Firestore
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'system_presence', currentUsername), payload);
      } catch {
        // ignore offline / network delay
      }
    }
  };

  // Immediate first heartbeat
  if (currentUsername) {
    sendHeartbeat('online');
    heartbeatTimer = setInterval(() => {
      sendHeartbeat('online');
    }, HEARTBEAT_INTERVAL_MS);
  }

  // 2. Listen to local broadcast heartbeats
  const handleLocalBroadcast = (e) => {
    if (e.data && e.data.type === 'PRESENCE_UPDATE') {
      const uname = e.data.username?.toLowerCase();
      if (uname) {
        presenceMap[uname] = {
          status: e.data.status,
          lastActive: e.data.lastActive || Date.now(),
        };
        emitOnlineMap();
      }
    }
  };

  if (presenceChannel) {
    presenceChannel.addEventListener('message', handleLocalBroadcast);
  }

  // 3. Listen to Firestore Cloud presence collection
  if (isFirebaseConfigured && db) {
    try {
      firestoreUnsubscribe = onSnapshot(
        collection(db, 'system_presence'),
        (snapshot) => {
          snapshot.docs.forEach((d) => {
            const data = d.data();
            const uname = (data.username || d.id).toLowerCase();
            presenceMap[uname] = {
              status: data.status || 'online',
              lastActive: data.lastActive || Date.now(),
            };
          });
          emitOnlineMap();
        },
        (err) => {
          console.warn('Firestore presence listener warning:', err);
        }
      );
    } catch (err) {
      console.warn('Failed to setup presence listener:', err);
    }
  }

  // 4. Periodic sweep timer to automatically mark users offline after 45s of silence
  sweepTimer = setInterval(() => {
    emitOnlineMap();
  }, 10000);

  // 5. Handle tab/window close
  const handleUnload = () => {
    if (currentUsername) {
      sendHeartbeat('offline');
    }
  };
  window.addEventListener('beforeunload', handleUnload);

  // Initial emission
  emitOnlineMap();

  // Cleanup
  return () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (sweepTimer) clearInterval(sweepTimer);
    window.removeEventListener('beforeunload', handleUnload);

    if (presenceChannel) {
      presenceChannel.removeEventListener('message', handleLocalBroadcast);
    }
    if (typeof firestoreUnsubscribe === 'function') {
      firestoreUnsubscribe();
    }

    if (currentUsername) {
      sendHeartbeat('offline');
    }
  };
};
