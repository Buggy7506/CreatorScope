export type AuthUser = {
  id?: string;
  name: string;
  email: string;
};

const TOKEN_KEY = 'creatorscope_token';
const USER_KEY = 'creatorscope_user';

export const saveAuth = (token: string, user?: AuthUser) => {
  localStorage.setItem(TOKEN_KEY, token);

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = (): AuthUser | null => {
  const stored = localStorage.getItem(USER_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('token');
};
