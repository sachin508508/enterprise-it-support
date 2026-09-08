import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import * as SecureStore from 'expo-secure-store';

import {
  getCurrentUser,
  login as loginApi,
  LoginUser,
} from '../services/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface AuthContextType {
  user: LoginUser | null;
  isLoading: boolean;
  login: (
    employeeId: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<LoginUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const token =
        await SecureStore.getItemAsync(
          TOKEN_KEY
        );

      if (!token) {
        setIsLoading(false);
        return;
      }

      const response =
        await getCurrentUser();

      setUser(response.user);

      await SecureStore.setItemAsync(
        USER_KEY,
        JSON.stringify(response.user)
      );
    } catch {
      await SecureStore.deleteItemAsync(
        TOKEN_KEY
      );

      await SecureStore.deleteItemAsync(
        USER_KEY
      );

      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(
    employeeId: string,
    password: string
  ) {
    const response =
      await loginApi(
        employeeId,
        password
      );

    await SecureStore.setItemAsync(
      TOKEN_KEY,
      response.access_token
    );

    await SecureStore.setItemAsync(
      USER_KEY,
      JSON.stringify(response.user)
    );

    setUser(response.user);
  }

  async function logout() {
    await SecureStore.deleteItemAsync(
      TOKEN_KEY
    );

    await SecureStore.deleteItemAsync(
      USER_KEY
    );

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}