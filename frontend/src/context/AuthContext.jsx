import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi, getAccessToken, setAccessToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    const token = response.data.accessToken;

    setAccessToken(token);
    setUser(response.data.user);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    return response.data;
  };

  const register = async (data) => {
    return authApi.register(data);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const loadUser = async () => {
    if (!getAccessToken()) {
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.me();
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    } catch {
      try {
        const response = await authApi.refreshToken();
        setAccessToken(response.data.accessToken);

        const meResponse = await authApi.me();
        setUser(meResponse.data.user);
        localStorage.setItem("user", JSON.stringify(meResponse.data.user));
      } catch {
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem("user");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        authenticated: Boolean(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
