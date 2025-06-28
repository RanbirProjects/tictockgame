import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';

const GameContext = createContext();

const initialState = {
  games: [],
  currentGame: null,
  loading: false,
  error: null
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_GAMES':
      return {
        ...state,
        games: action.payload,
        loading: false
      };
    case 'SET_CURRENT_GAME':
      return {
        ...state,
        currentGame: action.payload,
        loading: false
      };
    case 'UPDATE_GAME':
      return {
        ...state,
        currentGame: action.payload,
        games: state.games.map(game => 
          game._id === action.payload._id ? action.payload : game
        ),
        loading: false
      };
    case 'ADD_GAME':
      return {
        ...state,
        games: [action.payload, ...state.games],
        loading: false
      };
    case 'REMOVE_GAME':
      return {
        ...state,
        games: state.games.filter(game => game._id !== action.payload),
        loading: false
      };
    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Create a new game
  const createGame = async (gameType = 'single') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const res = await axios.post('http://localhost:5001/api/games', { gameType });
      dispatch({ type: 'ADD_GAME', payload: res.data });
      return { success: true, game: res.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create game';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  // Get user's games
  const getGames = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const res = await axios.get('http://localhost:5001/api/games');
      dispatch({ type: 'SET_GAMES', payload: res.data });
      return { success: true, games: res.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch games';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  // Get a specific game
  const getGame = async (gameId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const res = await axios.get(`http://localhost:5001/api/games/${gameId}`);
      dispatch({ type: 'SET_CURRENT_GAME', payload: res.data });
      return { success: true, game: res.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch game';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  // Make a move in the game
  const makeMove = async (gameId, row, col) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const res = await axios.put(`http://localhost:5001/api/games/${gameId}/move`, {
        row,
        col
      });
      dispatch({ type: 'UPDATE_GAME', payload: res.data });
      return { success: true, game: res.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to make move';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  // Join a multiplayer game
  const joinGame = async (gameId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const res = await axios.put(`http://localhost:5001/api/games/${gameId}/join`);
      dispatch({ type: 'UPDATE_GAME', payload: res.data });
      return { success: true, game: res.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to join game';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  // Delete a game
  const deleteGame = async (gameId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      await axios.delete(`http://localhost:5001/api/games/${gameId}`);
      dispatch({ type: 'REMOVE_GAME', payload: gameId });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete game';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Clear current game
  const clearCurrentGame = () => {
    dispatch({ type: 'SET_CURRENT_GAME', payload: null });
  };

  return (
    <GameContext.Provider
      value={{
        games: state.games,
        currentGame: state.currentGame,
        loading: state.loading,
        error: state.error,
        createGame,
        getGames,
        getGame,
        makeMove,
        joinGame,
        deleteGame,
        clearError,
        clearCurrentGame
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 