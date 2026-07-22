import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext();

// Hook مخصص لاستخدام بيانات المستخدم
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');
    const id = localStorage.getItem('userId');
    const tokenAdmin = localStorage.getItem('tokenAdmin');
    if (!token) return null;
    return { id, name, token, isAdmin: !!tokenAdmin };
  });

  // تسجيل الدخول — يحفظ البيانات في الـ state و localStorage
  const login = useCallback((data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('name', data.name || '');
    if (data.id) localStorage.setItem('userId', data.id);
    if (data.isAdmin) {
      localStorage.setItem('tokenAdmin', data.token);
    }
    setUser({
      id: data.id,
      name: data.name,
      token: data.token,
      isAdmin: !!data.isAdmin,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  const isLoggedIn = !!user?.token;
  const isAdmin = !!user?.isAdmin;
  const userName = user?.name || 'Guest';

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      isAdmin,
      userName,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
