import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        error: null
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token header
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        setAuthToken(state.token);
        try {
          const res = await axios.get('http://localhost:5001/api/auth/profile');
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: res.data, token: state.token }
          });
        } catch (error) {
          dispatch({ type: 'AUTH_FAIL', payload: error.response?.data?.message || 'Authentication failed' });
          setAuthToken(null);
        }
      } else {
        dispatch({ type: 'AUTH_FAIL', payload: null });
      }
    };

    loadUser();
  }, [state.token]);

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const res = await axios.post('http://localhost:5001/api/auth/register', userData);
      setAuthToken(res.data.token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: res.data.user, token: res.data.token }
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const res = await axios.post('http://localhost:5001/api/auth/login', userData);
      setAuthToken(res.data.token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: res.data.user, token: res.data.token }
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  // Logout user
  const logout = () => {
    setAuthToken(null);
    dispatch({ type: 'LOGOUT' });
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const res = await axios.put('http://localhost:5001/api/auth/profile', userData);
      dispatch({ type: 'UPDATE_USER', payload: res.data });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: state.error,
        register,
        login,
        logout,
        updateProfile,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 