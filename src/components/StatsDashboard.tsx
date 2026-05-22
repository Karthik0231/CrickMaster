import React from 'react';
import { AppState } from '../state/types';

interface Props {
    state: AppState;
}

export function StatsDashboard({ state }: Props) {
    const { globalStats } = state;
    const teamStats = Object.entries(globalStats.teamStats);
    const sortedTeams = [...teamStats].sort((a, b) => b[1].wins - a[1].wins);

    return (
        <div className="stats-dashboard card">
            <h2>Global Statistics Dashboard</h2>

            <div className="stats-grid">
                <section className="stats-card">
                    <h3>Team Performance (All Time)</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Team</th>
                                    <th>P</th>
                                    <th className="win">W</th>
                                    <th className="loss">L</th>
                                    <th>T</th>
                                    <th>%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTeams.map(([id, stats]) => {
                                    const team = state.teams.find(t => t.id === id);
                                    const teamName = team?.short || id;
                                    const winRate = stats.matches > 0 ? (stats.wins / stats.matches * 100).toFixed(0) : '0';
                                    return (
                                        <tr key={id}>
                                            <td style={{ fontWeight: '800' }}>{teamName}</td>
                                            <td>{stats.matches}</td>
                                            <td className="win" style={{ fontWeight: '700', color: 'var(--success)' }}>{stats.wins}</td>
                                            <td className="loss" style={{ fontWeight: '700', color: 'var(--danger)' }}>{stats.losses}</td>
                                            <td>{stats.titles}</td>
                                            <td style={{ fontWeight: '800', color: 'var(--primary)' }}>{winRate}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="stats-card records">
                    <h3>Highs & Lows</h3>
                    <div className="records-grid">
                        <div className="record-item">
                            <span>Total Matches Played</span>
                            <span className="value">{state.matchHistory.length}</span>
                        </div>
                        <div className="record-item">
                            <span>Active Tournaments</span>
                            <span className="value">{state.tournaments.filter(t => !t.fixtures.every(f => f.completed)).length}</span>
                        </div>
                    </div>
                </section>
            </div>

            <div className="player-stats-section">
                {/* Player stats logic will be expanded in Phase 2/3 */}
                <p className="note">Note: Individual player statistical tracking across all tournaments is being aggregated in the background.</p>
            </div>
        </div>
    );
}
