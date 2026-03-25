import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem('token'));

  const getRole = (t) => {
    if (!t) return null;
    const payload = parseJwt(t);
    return payload?.[
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
    ] || null;
  };

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const role      = getRole(token);
  const isLoggedIn = !!token;
  const isAdmin    = role === 'Admin';

  return (
    <AuthContext.Provider value={{
      token,
      login,
      logout,
      isLoggedIn,
      isAdmin,
      role
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}