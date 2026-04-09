import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

const STORAGE_KEY = "token";
const ROLE_KEY = "role";
const CODE_KEY = "employee_code";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || "");
  const [employeeCode, setEmployeeCode] = useState(() => localStorage.getItem(CODE_KEY) || "");

  const applySession = useCallback((data) => {
    localStorage.setItem(STORAGE_KEY, data.access_token);
    localStorage.setItem(ROLE_KEY, data.role);
    if (data.employee_code) {
      localStorage.setItem(CODE_KEY, data.employee_code);
    } else {
      localStorage.removeItem(CODE_KEY);
    }
    setToken(data.access_token);
    setRole(data.role);
    setEmployeeCode(data.employee_code || "");
  }, []);

  const login = useCallback(
    async (username, password) => {
      const { data } = await api.post("/login", { username, password });
      applySession(data);
      return data;
    },
    [applySession]
  );

  const registerFirstAdmin = useCallback(
    async (username, password, confirmPassword) => {
      const { data } = await api.post("/register", {
        username,
        password,
        confirm_password: confirmPassword,
      });
      applySession(data);
      return data;
    },
    [applySession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(CODE_KEY);
    setToken(null);
    setRole("");
    setEmployeeCode("");
  }, []);

  const value = useMemo(
    () => ({
      token,
      role,
      employeeCode,
      isAuthenticated: Boolean(token),
      isAdmin: role === "admin",
      login,
      registerFirstAdmin,
      logout,
    }),
    [token, role, employeeCode, login, registerFirstAdmin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
