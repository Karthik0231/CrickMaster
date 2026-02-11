import React, { useState } from 'react';
import { AppState } from '../state/types';

interface Props {
    state: AppState;
    onNavigate: (screen: AppState['activeScreen']) => void;
    onRestartMatch: () => void;
    onRestartTournament: () => void;
    onResetAll: () => void;
}

export function GlobalHeader({
    state,
    onNavigate,
    onRestartMatch,
    onRestartTournament,
    onResetAll
}: Props) {

    const [menuOpen, setMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const isInMatch = !!state.currentMatch;
    const isInTournament = !!state.activeTournamentId;

    const handleNavigate = (screen: AppState['activeScreen']) => {
        onNavigate(screen);
        setMenuOpen(false);
    };

    return (
        <>
            <header className="global-header">
                <div className="header-container">

                    <div className="header-logo" onClick={() => handleNavigate('Home')}>
                        CricMaster <span>Pro</span>
                    </div>

                    <div
                        className="hamburger"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        ☰
                    </div>

                    <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
                        <button
                            className={state.activeScreen === 'Home' ? 'active' : ''}
                            onClick={() => handleNavigate('Home')}
                        >
                            Home
                        </button>

                        {isInMatch && (
                            <button
                                className={state.activeScreen === 'Match' ? 'active' : ''}
                                onClick={() => handleNavigate('Match')}
                            >
                                Resume Match
                            </button>
                        )}

                        {isInTournament && (
                            <button
                                className={state.activeScreen === 'Tournament' ? 'active' : ''}
                                onClick={() => handleNavigate('Tournament')}
                            >
                                Tournament
                            </button>
                        )}

                        <button
                            className={state.activeScreen === 'History' ? 'active' : ''}
                            onClick={() => handleNavigate('History')}
                        >
                            History
                        </button>

                        <button
                            className={state.activeScreen === 'Stats' ? 'active' : ''}
                            onClick={() => handleNavigate('Stats')}
                        >
                            Statistics
                        </button>

                        {/* Mobile Settings */}
                        <div className="mobile-settings">
                            <button
                                className="settings-btn"
                                onClick={() => setSettingsOpen(!settingsOpen)}
                            >
                                Settings ⚙️
                            </button>

                            {settingsOpen && (
                                <div className="dropdown-content mobile-dropdown">
                                    {isInMatch && <button onClick={onRestartMatch}>Restart Match</button>}
                                    {isInTournament && <button onClick={onRestartTournament}>Restart Tournament</button>}
                                    <button onClick={() => handleNavigate('Settings')}>Global Settings</button>
                                    <button className="danger" onClick={onResetAll}>Reset All Data</button>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Desktop Settings */}
                    <div className="header-actions desktop-only">
                        <div className="dropdown">
                            <button
                                className="dropdown-btn"
                                onClick={() => setSettingsOpen(!settingsOpen)}
                            >
                                ⚙️
                            </button>

                            {settingsOpen && (
                                <div className="dropdown-content">
                                    {isInMatch && <button onClick={onRestartMatch}>Restart Match</button>}
                                    {isInTournament && <button onClick={onRestartTournament}>Restart Tournament</button>}
                                    <button onClick={() => onNavigate('Settings')}>Global Settings</button>
                                    <button className="danger" onClick={onResetAll}>Reset All Data</button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </header>

            {/* CSS in Same Page */}
            <style>{`
                .global-header {
                    width: 100%;
                    background: #0f172a;
                    color: white;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                }

                .header-container {
                    max-width: 1200px;
                    margin: auto;
                    padding: 0 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 70px;
                }

                .header-logo {
                    font-size: 22px;
                    font-weight: bold;
                    cursor: pointer;
                }

                .header-logo span {
                    color: #22c55e;
                }

                .header-nav {
                    display: flex;
                    gap: 20px;
                    align-items: center;
                }

                .header-nav button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 15px;
                    cursor: pointer;
                    padding: 8px 10px;
                    transition: 0.3s;
                }

                .header-nav button:hover {
                    color: #22c55e;
                }

                .header-nav .active {
                    color: #22c55e;
                    border-bottom: 2px solid #22c55e;
                }

                .header-actions {
                    position: relative;
                }

                .dropdown-btn {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: white;
                }

                .dropdown-content {
                    position: absolute;
                    right: 0;
                    top: 40px;
                    background: #1e293b;
                    border-radius: 8px;
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    min-width: 180px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }

                .dropdown-content button {
                    background: none;
                    border: none;
                    padding: 8px;
                    text-align: left;
                    color: white;
                    cursor: pointer;
                }

                .dropdown-content button:hover {
                    background: rgba(255,255,255,0.1);
                }

                .danger {
                    color: #ef4444;
                }

                .hamburger {
                    display: none;
                    font-size: 22px;
                    cursor: pointer;
                }

                @media (max-width: 900px) {
                    .header-nav {
                        position: absolute;
                        top: 70px;
                        left: 0;
                        width: 100%;
                        background: #0f172a;
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 20px;
                        display: none;
                    }

                    .header-nav.open {
                        display: flex;
                    }

                    .header-nav button {
                        width: 100%;
                        padding: 12px 0;
                    }

                    .hamburger {
                        display: block;
                    }

                    .desktop-only {
                        display: none;
                    }

                    .mobile-settings {
                        width: 100%;
                    }

                    .mobile-dropdown {
                        position: relative;
                        top: 0;
                        margin-top: 10px;
                    }
                }
            `}</style>
        </>
    );
}
