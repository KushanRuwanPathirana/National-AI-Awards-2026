import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount / token change
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data.user);
      } catch {
        // Token invalid or expired
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = useCallback((userData, authToken) => {
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const verifyEmailOTP = useCallback(async (otp, email) => {
    const res = await api.post('/auth/verify-otp', { otp, email });
    const verifiedUser = res.data.data.user;
    setUser(verifiedUser);
    return verifiedUser;
  }, []);

  const resendVerificationOTP = useCallback(async (email) => {
    await api.post('/auth/resend-otp', { email });
  }, []);

  const updateUserLocal = useCallback((updatedUserData) => {
    setUser(updatedUserData);
  }, []);

  const isAuthenticated = !!user && !!token;
  const isEmailVerified = user?.isEmailVerified;
  const isAdmin     = user?.role === 'admin';
  const isJudge     = user?.role === 'judge';
  const isCandidate = user?.role === 'candidate';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        verifyEmailOTP,
        resendVerificationOTP,
        updateUserLocal,
        isAuthenticated,
        isEmailVerified,
        isAdmin,
        isJudge,
        isCandidate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};

export default AuthContext;
