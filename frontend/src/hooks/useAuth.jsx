import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      fullName
      role
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { refetch } = useQuery(ME_QUERY, {
    skip: !localStorage.getItem('token'),
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
        setIsAuthenticated(true);
      }
      setLoading(false);
    },
    onError: () => {
      logout();
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
    }
  }, []);

  const [loginMutation] = useMutation(LOGIN_MUTATION);

  const login = async (email, password) => {
    try {
      const { data } = await loginMutation({
        variables: { input: { email, password } }
      });

      if (data?.login?.token) {
        localStorage.setItem('token', data.login.token);
        setUser(data.login.user);
        setIsAuthenticated(true);
        try {
          await refetch();
        } catch (e) {}
        return { success: true };
      }
      return { success: false, error: 'Connexion échouée' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      isAuthenticated: false,
      user: null,
      loading: false,
      login: async () => ({ success: false }),
      logout: () => {}
    };
  }
  return context;
}
