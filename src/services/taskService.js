import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  getDoc,
  getDocs,
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from './firebase';
import { INITIAL_TASKS } from './mockData';

const LOCAL_STORAGE_KEY = 'jira_lite_tasks_v1';
const BOARD_INITIALIZED_KEY = 'jira_lite_board_initialized_v2';
const BROADCAST_CHANNEL_NAME = 'jira_lite_sync_bus';

// Helper: BroadcastChannel for real-time multi-tab sync in Demo mode
let syncChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (err) {
    console.warn('BroadcastChannel not supported:', err);
  }
}

// Get initial local tasks
const getStoredTasks = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const hasInitialized = localStorage.getItem(BOARD_INITIALIZED_KEY);

    if (raw === null) {
      if (!hasInitialized) {
        // Brand-new workspace, seed initial tasks
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
        localStorage.setItem(BOARD_INITIALIZED_KEY, 'true');
        return INITIAL_TASKS;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading local tasks:', err);
    return [];
  }
};

const saveStoredTasks = (tasks) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    if (syncChannel) {
      syncChannel.postMessage({ type: 'SYNC_TASKS', timestamp: Date.now() });
    }
    window.dispatchEvent(new CustomEvent('jira_local_sync', { detail: tasks }));
  } catch (err) {
    console.error('Error saving local tasks:', err);
  }
};

/**
 * Subscribe to tasks with real-time updates.
 * Returns unsubscribe function.
 */
export const subscribeToTasks = (onTasksUpdated, onError) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'tasks'), orderBy('order', 'asc'));
      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          if (!snapshot.empty) {
            const tasks = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
              // normalize timestamps
              created_at: d.data().created_at?.toDate?.()?.toISOString() || d.data().created_at || new Date().toISOString(),
              updated_at: d.data().updated_at?.toDate?.()?.toISOString() || d.data().updated_at || new Date().toISOString(),
            }));
            localStorage.setItem(BOARD_INITIALIZED_KEY, 'true');
            saveStoredTasks(tasks);
            onTasksUpdated(tasks);
          } else {
            // Check if board was already initialized
            const localInitialized = localStorage.getItem(BOARD_INITIALIZED_KEY) === 'true';
            let cloudInitialized = false;

            try {
              const initDoc = await getDoc(doc(db, 'system_settings', 'board_init'));
              cloudInitialized = initDoc.exists() && initDoc.data()?.initialized;
            } catch {
              // Ignore read error if offline
            }

            if (localInitialized || cloudInitialized) {
              // User has intentionally deleted all tasks: keep the board empty!
              localStorage.setItem(BOARD_INITIALIZED_KEY, 'true');
              saveStoredTasks([]);
              onTasksUpdated([]);
              return;
            }

            // ONLY on brand-new, first run on an uninitialized database:
            const stored = getStoredTasks();
            const tasksToSeed = stored && stored.length > 0 ? stored : INITIAL_TASKS;

            localStorage.setItem(BOARD_INITIALIZED_KEY, 'true');
            try {
              await setDoc(doc(db, 'system_settings', 'board_init'), {
                initialized: true,
                initialized_at: serverTimestamp(),
              });
            } catch (e) {
              console.warn('Setting board_init doc failed:', e);
            }

            tasksToSeed.forEach(async (t) => {
              try {
                await setDoc(doc(db, 'tasks', t.id), {
                  ...t,
                  created_at: serverTimestamp(),
                  updated_at: serverTimestamp(),
                });
              } catch (e) {
                console.warn('Seeding task to Firestore failed:', e);
              }
            });
            saveStoredTasks(tasksToSeed);
            onTasksUpdated(tasksToSeed);
          }
        },
        (error) => {
          console.error('Firestore onSnapshot error, falling back to local sync:', error);
          if (onError) onError(error);
          // Fallback to local storage if Firestore rules reject or network fails
          onTasksUpdated(getStoredTasks());
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Firebase query failed, using local storage mode:', err);
    }
  }

  // Demo / Local Real-time sync listener
  const initial = getStoredTasks();
  onTasksUpdated(initial);

  const handleStorageEvent = (event) => {
    if (event.key === LOCAL_STORAGE_KEY) {
      onTasksUpdated(getStoredTasks());
    }
  };

  const handleCustomEvent = (event) => {
    onTasksUpdated(event.detail || getStoredTasks());
  };

  const handleBroadcast = (event) => {
    if (event.data?.type === 'SYNC_TASKS') {
      onTasksUpdated(getStoredTasks());
    }
  };

  window.addEventListener('storage', handleStorageEvent);
  window.addEventListener('jira_local_sync', handleCustomEvent);
  if (syncChannel) {
    syncChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    window.removeEventListener('storage', handleStorageEvent);
    window.removeEventListener('jira_local_sync', handleCustomEvent);
    if (syncChannel) {
      syncChannel.removeEventListener('message', handleBroadcast);
    }
  };
};

/**
 * Create a new task
 */
export const createTask = async (taskData) => {
  const newTask = {
    title: taskData.title.trim(),
    description: taskData.description?.trim() || '',
    status: taskData.status || 'todo',
    priority: taskData.priority || 'medium',
    assigned_to: taskData.assigned_to || '',
    order: typeof taskData.order === 'number' ? taskData.order : Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  localStorage.setItem(BOARD_INITIALIZED_KEY, 'true');
  // Always update local storage first so tasks are never lost on reload
  const tasks = getStoredTasks();
  const id = `task-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`;
  const created = { id, ...newTask };
  saveStoredTasks([created, ...tasks]);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...newTask,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      return { id: docRef.id, ...newTask };
    } catch (err) {
      console.warn('Firestore addDoc failed, saved locally:', err);
    }
  }

  return created;
};

/**
 * Update an existing task
 */
export const updateTask = async (taskId, updates) => {
  const sanitizedUpdates = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // Always update local storage first
  const tasks = getStoredTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...sanitizedUpdates };
    saveStoredTasks(tasks);
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'tasks', taskId);
      await updateDoc(docRef, {
        ...updates,
        updated_at: serverTimestamp(),
      });
      return;
    } catch (err) {
      console.warn('Firestore updateDoc failed, updated locally:', err);
    }
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId) => {
  localStorage.setItem(BOARD_INITIALIZED_KEY, 'true');
  // Always update local storage first
  const tasks = getStoredTasks();
  const filtered = tasks.filter((t) => t.id !== taskId);
  saveStoredTasks(filtered);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(
        doc(db, 'system_settings', 'board_init'),
        { initialized: true, updated_at: serverTimestamp() },
        { merge: true }
      );
      const docRef = doc(db, 'tasks', taskId);
      await deleteDoc(docRef);
      return;
    } catch (err) {
      console.warn('Firestore deleteDoc failed, deleted locally:', err);
    }
  }
};

/**
 * Batch update order and status for moved / reordered tasks
 */
export const reorderTasks = async (updatedTasksList) => {
  // Always update local storage first
  const allTasks = getStoredTasks();
  const updateMap = new Map(updatedTasksList.map((t) => [t.id, t]));
  const merged = allTasks.map((t) => {
    if (updateMap.has(t.id)) {
      const updated = updateMap.get(t.id);
      return { ...t, status: updated.status, order: updated.order, updated_at: new Date().toISOString() };
    }
    return t;
  });
  saveStoredTasks(merged);

  if (isFirebaseConfigured && db) {
    try {
      // Fire parallel updateDoc promises
      const updatePromises = updatedTasksList.map((t) => {
        const docRef = doc(db, 'tasks', t.id);
        return updateDoc(docRef, {
          status: t.status,
          order: t.order,
          updated_at: serverTimestamp(),
        });
      });
      await Promise.all(updatePromises);
      return;
    } catch (err) {
      console.warn('Firestore batch update failed, updated locally:', err);
    }
  }
};

/**
 * Clear all tasks completely (Empty board)
 */
export const clearAllTasks = async () => {
  localStorage.setItem(BOARD_INITIALIZED_KEY, 'true');
  saveStoredTasks([]);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'system_settings', 'board_init'), {
        initialized: true,
        cleared_at: serverTimestamp(),
      });
      const snap = await getDocs(collection(db, 'tasks'));
      const deletePromises = snap.docs.map((d) => deleteDoc(doc(db, 'tasks', d.id)));
      await Promise.all(deletePromises);
    } catch (err) {
      console.warn('Clear all tasks in Firestore failed:', err);
    }
  }
  return [];
};

/**
 * Reset all tasks to initial demo sprint tasks
 */
export const resetDemoTasks = async () => {
  localStorage.setItem(BOARD_INITIALIZED_KEY, 'true');
  saveStoredTasks(INITIAL_TASKS);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'system_settings', 'board_init'), {
        initialized: true,
        seeded_at: serverTimestamp(),
      });
      const snap = await getDocs(collection(db, 'tasks'));
      const deletePromises = snap.docs.map((d) => deleteDoc(doc(db, 'tasks', d.id)));
      await Promise.all(deletePromises);

      const seedPromises = INITIAL_TASKS.map((t) =>
        setDoc(doc(db, 'tasks', t.id), {
          ...t,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        })
      );
      await Promise.all(seedPromises);
    } catch (err) {
      console.warn('Reset demo tasks in Firestore failed:', err);
    }
  }
  return INITIAL_TASKS;
};
