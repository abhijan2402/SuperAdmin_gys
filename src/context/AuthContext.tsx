import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, LoginCredentials, AuthContextType } from "@/types/auth";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = sessionStorage.getItem("superadmin_user");
    const storedToken = sessionStorage.getItem("superadmin_token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://72.61.232.245:3001/api/auth/login/verify-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      const data = await response.json();

      // Check API response structure
      if (!data.success) {
        throw new Error(data.message || "Invalid credentials");
      }

      // ✅ Extract from actual response structure
      const apiUser = data.data.user;
      const apiToken = data.data.token;

      // Store user and token
      setUser(apiUser);
      setToken(apiToken);

      // Save to sessionStorage
      sessionStorage.setItem("superadmin_user", JSON.stringify(apiUser));
      sessionStorage.setItem("superadmin_token", apiToken);

      toast.success("Login successful!", {
        description: `Welcome back, ${apiUser.full_name || apiUser.email}!`,
      });
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("superadmin_user");
    sessionStorage.removeItem("superadmin_token");
    toast.success("Logged out successfully");
  };

  // Get auth headers for API calls
  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        isLoading,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
