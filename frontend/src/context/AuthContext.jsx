import {createContext, useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext ();

export const AuthProvider = ({children}) => {
  const navigate = useNavigate ();
  const [user, setUser] = useState (() => {
    const saved = localStorage.getItem ('user');
    return saved ? JSON.parse (saved) : null;
  });

  const [loading, setLoading] = useState (true);

  // Load user from localStorage on refresh
  useEffect (() => {
    const token = localStorage.getItem ('token');
    const storedUser = localStorage.getItem ('user');

    if (token && storedUser && storedUser !== 'undefined') {
      try {
        setUser (JSON.parse (storedUser));
      } catch (err) {
        console.error ('Failed to parse stored user:', err);
        localStorage.removeItem ('user');
        localStorage.removeItem ('token');
      }
    }

    setLoading (false);
  }, []);

  const login = data => {
    setUser (data);
    localStorage.setItem ('user', JSON.stringify (data));
  };

  const logout = async () => {
    try {
      // optional: call backend logout if you have one
      // await api.post("/auth/logout");

      localStorage.removeItem ('token');
      localStorage.removeItem ('user');

      setUser (null);
    } catch (err) {
      console.error ('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{user, setUser, login, logout, loading}}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext (AuthContext);
