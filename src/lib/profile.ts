export interface UserProfile {
  displayName: string;
  avatar: string; // URL or data URI
  joinedAt: number;
  settings: {
    defaultOrderType: 'market' | 'limit';
    notifications: boolean;
    currency: string;
  };
}

const PROFILE_KEY = 'btc-trading-profile';

const AVATAR_COLORS = [
  'hsl(47, 100%, 50%)',
  'hsl(152, 69%, 46%)',
  'hsl(200, 80%, 55%)',
  'hsl(280, 70%, 60%)',
  'hsl(354, 70%, 54%)',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const DEFAULT_PROFILE: UserProfile = {
  displayName: 'Trader',
  avatar: '',
  joinedAt: Date.now(),
  settings: {
    defaultOrderType: 'market',
    notifications: true,
    currency: 'USD',
  },
};

export function loadProfile(): UserProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (data) {
      const profile = JSON.parse(data);
      // Sync display name with auth user if available
      const sessionId = localStorage.getItem('hub-session');
      if (sessionId) {
        const users = JSON.parse(localStorage.getItem('hub-users') || '[]');
        const authUser = users.find((u: any) => u.id === sessionId);
        if (authUser && authUser.displayName) {
          profile.displayName = authUser.displayName;
        }
      }
      return profile;
    }
  } catch {}
  // Check auth user for default name
  const sessionId = localStorage.getItem('hub-session');
  if (sessionId) {
    try {
      const users = JSON.parse(localStorage.getItem('hub-users') || '[]');
      const authUser = users.find((u: any) => u.id === sessionId);
      if (authUser) {
        return { ...DEFAULT_PROFILE, displayName: authUser.displayName, joinedAt: Date.now() };
      }
    } catch {}
  }
  return { ...DEFAULT_PROFILE, joinedAt: Date.now() };
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
