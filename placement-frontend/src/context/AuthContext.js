import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch { return {}; }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch { /* corrupted storage — ignore */ }
    }
    setLoading(false);
  }, []);

  const loginUser = (tok, userData) => {
    const decoded = decodeJWT(tok);
    // Merge decoded JWT claims into the user object so student_id etc. are available
    const enriched = {
      ...userData,
      student_id:  decoded.student_id  || decoded.studentId  || null,
      user_id:     decoded.user_id     || decoded.userId      || decoded.id || null,
      // Prefer explicit role passed in from the API response, fall back to JWT claim
      role:        userData.role       || decoded.role        || null,
    };
    localStorage.setItem('token', tok);
    localStorage.setItem('user', JSON.stringify(enriched));
    setToken(tok);
    setUser(enriched);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAdmin          = () => user?.role === 'admin';
  const isStudent        = () => user?.role === 'student';
  const isPlacementOfficer = () => user?.role === 'placement_officer';
  const isFaculty        = () => ['faculty', 'hod'].includes(user?.role);
  const canManage        = () => ['admin', 'placement_officer', 'hod'].includes(user?.role);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      loginUser, logoutUser, updateUser,
      isAdmin, isStudent, isPlacementOfficer, isFaculty, canManage,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
