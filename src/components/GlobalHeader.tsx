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
                    background: white;
                    color: var(--text);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    border-bottom: 1px solid var(--card-border);
                }

                .header-container {
                    max-width: 1400px;
                    margin: auto;
                    padding: 0 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 72px;
                }

                .header-logo {
                    font-size: 24px;
                    font-weight: 900;
                    cursor: pointer;
                    letter-spacing: -1px;
                }

                .header-logo span {
                    color: var(--primary);
                }

                .header-nav {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .header-nav button {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-weight: 700;
                    cursor: pointer;
                    padding: 10px 16px;
                    transition: 0.2s;
                    border-radius: 8px;
                }

                .header-nav button:hover {
                    color: var(--primary);
                    background: var(--primary-glow);
                }

                .header-nav .active {
                    color: var(--primary);
                    background: var(--primary-glow);
                }

                .header-actions {
                    position: relative;
                }

                .dropdown-btn {
                    background: none;
                    border: 1px solid var(--card-border);
                    font-size: 1.1rem;
                    cursor: pointer;
                    color: var(--text);
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: 0.2s;
                }
                
                .dropdown-btn:hover {
                    background: #f8fafc;
                }

                .dropdown-content {
                    position: absolute;
                    top: 50px;
                    right: 0;
                    background: white;
                    box-shadow: var(--shadow-lg);
                    border-radius: 12px;
                    padding: 8px;
                    min-width: 220px;
                    border: 1px solid var(--card-border);
                }

                .dropdown-content button {
                    display: block;
                    width: 100%;
                    text-align: left;
                    padding: 12px 16px;
                    border: none;
                    background: none;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    border-radius: 6px;
                    color: var(--text);
                }

                .dropdown-content button:hover {
                    background: #f1f5f9;
                    color: var(--primary);
                }

                .dropdown-content .danger {
                    color: var(--danger);
                }

                .dropdown-content .danger:hover {
                    background: #fef2f2;
                    color: var(--danger);
                }

                .hamburger {
                    display: none;
                    font-size: 28px;
                    cursor: pointer;
                    color: var(--text);
                }

                .mobile-settings {
                    display: none;
                }

                @media (max-width: 1024px) {
                    .desktop-only {
                        display: none;
                    }

                    .hamburger {
                        display: block;
                    }

                    .header-nav {
                        position: fixed;
                        top: 72px;
                        left: 0;
                        right: 0;
                        background: white;
                        flex-direction: column;
                        padding: 24px;
                        gap: 16px;
                        box-shadow: 0 10px 15px rgba(0,0,0,0.1);
                        border-bottom: 1px solid var(--card-border);
                        display: none;
                    }

                    .header-nav.open {
                        display: flex;
                    }

                    .header-nav button {
                        width: 100%;
                        text-align: left;
                        font-size: 1rem;
                    }

                    .mobile-settings {
                        display: block;
                        width: 100%;
                        border-top: 1px solid var(--card-border);
                        padding-top: 16px;
                    }
                    
                    .mobile-dropdown {
                        position: relative;
                        top: 10px;
                        width: 100%;
                        box-shadow: none;
                        border: 1px solid var(--card-border);
                    }
                }
            `}</style>
        </>
    );
}
