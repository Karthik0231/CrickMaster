import React, { useState } from 'react';
import { AppState, MatchHistoryEntry } from '../state/types';

import { DetailedScorecard } from './DetailedScorecard';

interface Props {
    state: AppState;
    navigate: (screen: AppState['activeScreen']) => void;
}

export function MatchHistory({ state, navigate }: Props) {
    const [filterMode, setFilterMode] = useState<string>('All');
    const [selectedMatch, setSelectedMatch] = useState<MatchHistoryEntry | null>(null);

    const filteredHistory = state.matchHistory.filter(h =>
        filterMode === 'All' || h.mode === filterMode
    );

    return (
        <div className="match-history-container card">
            <div className="history-header">
                <h2>Match History</h2>
                <div className="filters">
                    <label>Filter Mode:</label>
                    <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)}>
                        <option value="All">All Modes</option>
                        <option value="Quick">Quick Match</option>
                        <option value="IPL">IPL</option>
                        <option value="WorldCup">World Cup</option>
                        <option value="Career">Career</option>
                    </select>
                </div>
            </div>

            <div className="history-list">
                {filteredHistory.length === 0 ? (
                    <div className="empty-state">No matches played yet.</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Mode</th>
                                <th>Teams</th>
                                <th>Result</th>
                                <th>Format</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.map((entry) => (
                                <tr key={entry.matchId} className="history-row">
                                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                                    <td><span className={`badge mode-${entry.mode}`}>{entry.mode}</span></td>
                                    <td>
                                        <div className="match-teams">
                                            <span>{entry.teams.home.name} ({entry.teams.home.score})</span>
                                            <span className="vs">vs</span>
                                            <span>{entry.teams.away.name} ({entry.teams.away.score})</span>
                                        </div>
                                    </td>
                                    <td className="bold">{entry.result}</td>
                                    <td>{entry.format} ({entry.overs} ov)</td>
                                    <td>
                                        {entry.fullState && (
                                            <button
                                                className="btn-link"
                                                onClick={() => setSelectedMatch(entry)}
                                                style={{ color: 'var(--primary)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                Scorecard
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedMatch && selectedMatch.fullState && (
                <div className="scorecard-modal-overlay" style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(255,255,255,0.98)',
                    zIndex: 2000, overflowY: 'auto', padding: '40px 20px'
                }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <button
                            onClick={() => setSelectedMatch(null)}
                            className="secondary"
                            style={{ marginBottom: '20px', position: 'sticky', top: '0', zIndex: 10 }}
                        >
                            ← BACK TO HISTORY
                        </button>
                        <DetailedScorecard state={selectedMatch.fullState} />
                    </div>
                </div>
            )}
        </div>
    );
}
