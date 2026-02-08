import React, { useState } from 'react'
import { CareerState, Team, Player } from '../state/types'
import { TEAMS } from '../data/teams'

interface Props {
    state: CareerState
    onStartCareer: (team: Team) => void
    onUpgradePlayer: (upgrade: any) => void
    onBack: () => void
}

export function CareerView({ state, onStartCareer, onUpgradePlayer, onBack }: Props) {
    const [selectedTeam, setSelectedTeam] = useState(Object.values(TEAMS)[0])

    if (!state.isActive) {
        return (
            <div className="career-setup card">
                <h2>Start Your Career</h2>
                <div className="setup-container">
                    <p>Choose a team to manage and take them to glory!</p>
                    <select
                        value={selectedTeam.id}
                        onChange={(e) => setSelectedTeam(Object.values(TEAMS).find(t => t.id === e.target.value)!)}
                    >
                        {Object.values(TEAMS).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                    <button className="primary" onClick={() => onStartCareer(selectedTeam)}>Start Legacy</button>
                    <button onClick={onBack}>Back</button>
                </div>
            </div>
        )
    }

    return (
        <div className="career-dashboard">
            <header className="career-header card">
                <div className="team-info">
                    <h1>{state.squad.name} Dashboard</h1>
                    <p>Season {state.currentSeason} | Level {state.level}</p>
                </div>
                <div className="balance-info">
                    <h2 className="balance">₹{state.balance} Cr</h2>
                    <button onClick={onBack}>Main Menu</button>
                </div>
            </header>

            <div className="career-grid">
                <section className="squad-section card">
                    <h3>Squad Management</h3>
                    <div className="squad-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Player</th>
                                    <th>Bat</th>
                                    <th>Bowl</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.squad.players.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.name}</td>
                                        <td>{p.battingRating}</td>
                                        <td>{p.bowlingRating}</td>
                                        <td>
                                            <button
                                                className="btn-sm"
                                                onClick={() => onUpgradePlayer({ playerId: p.id, type: 'BAT', cost: 10, increase: 2 })}
                                                disabled={state.balance < 10}
                                            >
                                                +Bat (10Cr)
                                            </button>
                                            <button
                                                className="btn-sm"
                                                onClick={() => onUpgradePlayer({ playerId: p.id, type: 'BOWL', cost: 10, increase: 2 })}
                                                disabled={state.balance < 10}
                                            >
                                                +Bowl (10Cr)
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="next-match-section card">
                    <h3>Season Progress</h3>
                    <div className="stats-box">
                        <div className="stat-item">
                            <span>Seasons Played</span>
                            <span>{state.seasons.length}</span>
                        </div>
                    </div>
                    <p className="hint">Win matches in other modes to earn credits for your career team!</p>
                </section>
            </div>
        </div>
    )
}
