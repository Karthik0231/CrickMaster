import React, { useState } from 'react'
import { CareerState, Team, Player } from '../state/types'
import { TEAMS } from '../data/teams'
import { generateCustomTeam } from '../utils/generators'

interface Props {
    state: CareerState
    onStartCareer: (team: Team) => void
    onUpgradePlayer: (upgrade: any) => void
    onBack: () => void
    onStartSeason?: () => void
    onContinueSeason?: () => void
    activeSeasonId?: string
}

export function CareerView({ state, onStartCareer, onUpgradePlayer, onBack, onStartSeason, onContinueSeason, activeSeasonId }: Props) {
    const [selectedTeamId, setSelectedTeamId] = useState<string>(Object.values(TEAMS)[0].id)
    const [isCustom, setIsCustom] = useState(false)
    const [customName, setCustomName] = useState('')
    const [customShort, setCustomShort] = useState('')

    const handleStart = () => {
        if (isCustom) {
            if (!customName || !customShort) {
                alert("Please enter team details")
                return
            }
            const newTeam = generateCustomTeam(customName, customShort)
            onStartCareer(newTeam)
        } else {
            const team = Object.values(TEAMS).find(t => t.id === selectedTeamId)
            if (team) onStartCareer(team)
        }
    }

    if (!state.isActive) {
        return (
            <div className="career-setup card">
                <h2>Start Your Career</h2>
                <div className="setup-container">
                    <p>Choose a team to manage and take them to glory!</p>
                    
                    <div className="input-group" style={{ marginBottom: '16px' }}>
                        <label>
                            <input 
                                type="radio" 
                                checked={!isCustom} 
                                onChange={() => setIsCustom(false)} 
                            /> Existing Team
                        </label>
                        <label style={{ marginLeft: '16px' }}>
                            <input 
                                type="radio" 
                                checked={isCustom} 
                                onChange={() => setIsCustom(true)} 
                            /> Create Custom Team
                        </label>
                    </div>

                    {!isCustom ? (
                        <select
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
                        >
                            {Object.values(TEAMS).map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    ) : (
                        <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                            <input 
                                type="text" 
                                placeholder="Team Name (e.g. Bangalore Blasters)" 
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                            />
                            <input 
                                type="text" 
                                placeholder="Short Name (e.g. BLR)" 
                                value={customShort}
                                onChange={(e) => setCustomShort(e.target.value)}
                                maxLength={3}
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>
                    )}

                    <button className="primary" onClick={handleStart}>Start Legacy</button>
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
                                    <th>Role</th>
                                    <th>Bat</th>
                                    <th>Bowl</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.squad.players.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.name}</td>
                                        <td>{p.role}</td>
                                        <td>{p.battingRating}</td>
                                        <td>{p.bowlingRating}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    className="btn-sm"
                                                    onClick={() => onUpgradePlayer({ playerId: p.id, type: 'BAT', cost: 10, increase: 2 })}
                                                    disabled={state.balance < 10}
                                                    title="Train Batting (10 Cr)"
                                                >
                                                    +Bat
                                                </button>
                                                <button
                                                    className="btn-sm"
                                                    onClick={() => onUpgradePlayer({ playerId: p.id, type: 'BOWL', cost: 10, increase: 2 })}
                                                    disabled={state.balance < 10}
                                                    title="Train Bowling (10 Cr)"
                                                >
                                                    +Bowl
                                                </button>
                                            </div>
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
                        <div className="stat-item">
                            <span>Current Status</span>
                            <span>{state.isSeasonStarted ? 'In Progress' : 'Pre-Season'}</span>
                        </div>
                    </div>
                    
                    <div style={{ marginTop: '24px' }}>
                        {!state.isSeasonStarted ? (
                            <button className="primary" style={{ width: '100%' }} onClick={onStartSeason}>
                                Start Season {state.currentSeason}
                            </button>
                        ) : (
                            <button className="primary" style={{ width: '100%' }} onClick={onContinueSeason}>
                                Continue Season
                            </button>
                        )}
                    </div>

                    <p className="hint" style={{ marginTop: '16px' }}>
                        Win matches to earn budget. Train players to improve ratings.
                    </p>
                </section>
            </div>
        </div>
    )
}
