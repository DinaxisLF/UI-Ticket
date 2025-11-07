import React, { useState, useEffect, createContext, useContext } from "react";
import { authAPI } from "../services/api/auth"; // Import the API service we created

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          // Verify token with backend (optional - you can add this endpoint later)
          setUser(JSON.parse(userData));
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      // Use the API service for login
      const result = await authAPI.login(username, password);

      // Store user data and token
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      setUser(result.user);

      return {
        success: true,
        message: result.message || "Inicio de sesión exitoso",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error al iniciar sesión",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      // Use the API service for registration
      const result = await authAPI.register(userData);

      // Optionally, you can automatically log in the user after registration
      // If you want to do that, you would call login here

      return {
        success: true,
        message: result.message || "Usuario registrado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error al registrar usuario",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Optional: Function to check if username is available
  const checkUsernameAvailability = async (username) => {
    try {
      const result = await authAPI.checkUserExists(username);
      return !result.exists; // Return true if username is available
    } catch (error) {
      console.error("Error checking username:", error);
      return false;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    checkUsernameAvailability,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
