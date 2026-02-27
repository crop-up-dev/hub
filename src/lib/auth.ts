export interface AuthUser {
  id: string;
  email: string;
  password: string; // base64 encoded (demo only)
  displayName: string;
  role: 'user' | 'admin';
  createdAt: number;
  isActive: boolean;
}

const USERS_KEY = 'hub-users';
const SESSION_KEY = 'hub-session';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function encode(password: string): string {
  return btoa(password);
}

function decode(encoded: string): string {
  return atob(encoded);
}

function getUsers(): AuthUser[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return [];
}

function saveUsers(users: AuthUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function seedAdmin() {
  let users = getUsers();
  // Remove any old admin accounts and ensure correct admin exists
  users = users.filter(u => u.id !== 'admin-001' && u.email !== 'cropup4@gmail.com');
  users.push({
    id: 'admin-001',
    email: 'cropup4@gmail.com',
    password: encode('Crop@2026'),
    displayName: 'Admin',
    role: 'admin',
    createdAt: Date.now(),
    isActive: true,
  });
  saveUsers(users);
  console.log('[Auth] Admin seeded. Users:', users.map(u => ({ id: u.id, email: u.email, role: u.role })));
  console.log('[Auth] Current session:', localStorage.getItem(SESSION_KEY));
}

// Seed on module load
seedAdmin();

export function register(email: string, password: string, displayName: string): { success: boolean; error?: string } {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'Email already registered' };
  }
  const user: AuthUser = {
    id: generateId(),
    email: email.toLowerCase().trim(),
    password: encode(password),
    displayName: displayName.trim(),
    role: 'user',
    createdAt: Date.now(),
    isActive: true,
  };
  users.push(user);
  saveUsers(users);
  return { success: true };
}

export function login(email: string, password: string): { success: boolean; error?: string; user?: AuthUser } {
  const users = getUsers();
  const user = users.find(u => u.email === email.toLowerCase().trim());
  if (!user) return { success: false, error: 'Invalid email or password' };
  if (decode(user.password) !== password) return { success: false, error: 'Invalid email or password' };
  if (!user.isActive) return { success: false, error: 'Account is deactivated' };
  localStorage.setItem(SESSION_KEY, user.id);
  return { success: true, user };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): AuthUser | null {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  const users = getUsers();
  return users.find(u => u.id === id) || null;
}

export function getAllUsers(): AuthUser[] {
  return getUsers();
}

export function updateUserRole(userId: string, role: 'user' | 'admin') {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) { user.role = role; saveUsers(users); }
}

export function toggleUserActive(userId: string) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) { user.isActive = !user.isActive; saveUsers(users); }
}

export function deleteUser(userId: string) {
  const users = getUsers().filter(u => u.id !== userId);
  saveUsers(users);
}
