import { useReducer, useEffect, useCallback } from 'react';
import { AppState } from '../state/types';
import { gameReducer, GameAction } from '../state/gameReducer';
import { loadGameState, defaultAppState, saveGameState } from '../state/persistence';

export function usePersistentState() {
    const [state, dispatch] = useReducer(gameReducer, defaultAppState, (initial) => {
        const saved = loadGameState();
        return { ...initial, ...saved };
    });

    // Auto-save on every state change
    useEffect(() => {
        saveGameState(state);
    }, [state]);

    const navigate = useCallback((screen: AppState['activeScreen']) => {
        dispatch({ type: 'NAVIGATE', payload: screen });
    }, []);

    const setMode = useCallback((mode: AppState['activeMode']) => {
        dispatch({ type: 'SET_MODE', payload: mode });
    }, []);

    return {
        state,
        dispatch,
        navigate,
        setMode
    };
}
