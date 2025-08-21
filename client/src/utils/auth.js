import { useRef, useEffect } from 'react';
import { apiCall } from './api';

// Centralized logout function
export const logout = async (navigate) => {
  try {
    // Call backend logout endpoint to clear cookies and invalidate tokens
    await apiCall('/api/users/logout', {
      method: 'POST'
    });
  } catch (error) {
    } finally {
    // Clear frontend storage regardless of backend response
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    
    // Redirect to home page
    if (navigate) {
      navigate('/');
    } else {
      window.location.href = '/';
    }
  }
};

// Auto-logout hook
export const useAutoLogout = (timeout = 15 * 60 * 1000) => {
  const timer = useRef();
  
  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        logout(); // Use centralized logout function
      }, timeout);
    };
    
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    resetTimer();
    
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [timeout]);
};
