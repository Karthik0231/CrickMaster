import React from 'react';
import { AppState } from '../state/types';

interface Props {
    state: AppState;
    onNavigate: (screen: AppState['activeScreen']) => void;
    onRestartMatch: () => void;
    onRestartTournament: () => void;
    onResetAll: () => void;
}

export function GlobalHeader({ state, onNavigate, onRestartMatch, onRestartTournament, onResetAll }: Props) {
    const isInMatch = !!state.currentMatch;
    const isInTournament = !!state.activeTournamentId;

    return (
        <header className="global-header">
            <div className="header-logo" onClick={() => onNavigate('Home')}>
                <h1>CricMaster <span>Pro</span></h1>
            </div>

            <nav className="header-nav">
                <button
                    className={state.activeScreen === 'Home' ? 'active' : ''}
                    onClick={() => onNavigate('Home')}
                >
                    Home
                </button>

                {isInMatch && (
                    <button
                        className={state.activeScreen === 'Match' ? 'active' : ''}
                        onClick={() => onNavigate('Match')}
                    >
                        Resume Match
                    </button>
                )}

                {isInTournament && (
                    <button
                        className={state.activeScreen === 'Tournament' ? 'active' : ''}
                        onClick={() => onNavigate('Tournament')}
                    >
                        Tournament
                    </button>
                )}

                <button
                    className={state.activeScreen === 'History' ? 'active' : ''}
                    onClick={() => onNavigate('History')}
                >
                    History
                </button>

                <button
                    className={state.activeScreen === 'Stats' ? 'active' : ''}
                    onClick={() => onNavigate('Stats')}
                >
                    Statistics
                </button>
            </nav>

            <div className="header-actions">
                <div className="dropdown">
                    <button className="dropdown-btn">Settings ⚙️</button>
                    <div className="dropdown-content">
                        {isInMatch && <button onClick={onRestartMatch}>Restart Match</button>}
                        {isInTournament && <button onClick={onRestartTournament}>Restart Tournament</button>}
                        <button onClick={() => onNavigate('Settings')}>Global Settings</button>
                        <button className="danger" onClick={onResetAll}>Reset All Data</button>
                    </div>
                </div>
            </div>
        </header>
    );
}
