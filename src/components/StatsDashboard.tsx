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
                    <table>
                        <thead>
                            <tr>
                                <th>Team</th>
                                <th>Matches</th>
                                <th>Wins</th>
                                <th>Losses</th>
                                <th>Titles</th>
                                <th>Win %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTeams.map(([id, stats]) => {
                                const teamName = state.teams.find(t => t.id === id)?.name || id;
                                const winRate = stats.matches > 0 ? (stats.wins / stats.matches * 100).toFixed(1) : '0';
                                return (
                                    <tr key={id}>
                                        <td className="bold">{teamName}</td>
                                        <td>{stats.matches}</td>
                                        <td className="win">{stats.wins}</td>
                                        <td className="loss">{stats.losses}</td>
                                        <td>{stats.titles}</td>
                                        <td>{winRate}%</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
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
