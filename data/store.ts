import { AppState, Event, Guest, User, PaymentStatus, EventVisibility } from '../types';

const STORAGE_KEY = 'nova_events_db';
export const STORE_UPDATE_EVENT = 'nova-store-update';

const INITIAL_STATE: AppState = {
  users: [],
  events: [],
  guests: []
};

export const getStore = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : INITIAL_STATE;
};

export const saveStore = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(STORE_UPDATE_EVENT, { detail: state }));
};

// User Management
export const registerUser = (user: Omit<User, 'id' | 'joinDate'>): User | null => {
  const store = getStore();
  if (store.users.find(u => u.email === user.email)) return null;

  const newUser: User = {
    ...user,
    id: `u-${Date.now()}`,
    joinDate: new Date().toISOString(),
    isVerified: true
  };

  store.users.push(newUser);
  saveStore(store);
  return newUser;
};

export const loginUser = (email: string, password?: string): User | null => {
  const store = getStore();
  const user = store.users.find(u => u.email === email && (!password || u.password === password));
  return user || null;
};

export const updateProfile = (userId: string, updates: Partial<User>): User | null => {
  const store = getStore();
  const index = store.users.findIndex(u => u.id === userId);
  if (index !== -1) {
    store.users[index] = { ...store.users[index], ...updates };
    saveStore(store);
    return store.users[index];
  }
  return null;
};

// Event & Guest Management
export const addEvent = (event: Omit<Event, 'id'>): Event => {
  const store = getStore();
  const eventId = `e-${Date.now()}`;
  const newEvent = { ...event, id: eventId } as Event;
  store.events.push(newEvent);
  saveStore(store);
  return newEvent;
};

export const addGuest = (guest: Guest) => {
  const store = getStore();
  store.guests.push(guest);
  saveStore(store);
};

export const updateGuestStatus = (guestId: string, updates: Partial<Guest>) => {
  const store = getStore();
  const index = store.guests.findIndex(g => g.id === guestId);
  if (index !== -1) {
    store.guests[index] = { ...store.guests[index], ...updates };
    saveStore(store);
  }
};