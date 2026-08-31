import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser || savedUser === "undefined") {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Failed to load saved user:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Login
  const login = (data) => {
    if (!data?.token || !data?.user) {
      console.error("Invalid login response");
      return false;
    }

    // Store token separately
    localStorage.setItem("token", data.token);

    // Store only user information
    localStorage.setItem("user", JSON.stringify(data.user));

    // Update React state immediately
    setUser(data.user);

    return true;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
