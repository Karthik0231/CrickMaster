import React, { useState } from 'react'
import { Team, Player } from '../state/types'

interface Props {
    team: Team
    onConfirm: (playingXI: string[], battingOrder: string[], captain: string) => void
    onCancel: () => void
}

export function TeamLineupSelector({ team, onConfirm, onCancel }: Props) {
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
        team.players.slice(0, 11).map(p => p.id)
    )
    const [battingOrder, setBattingOrder] = useState<string[]>(
        team.players.slice(0, 11).map(p => p.id)
    )
    const [captain, setCaptain] = useState<string>(team.players[0].id)

    const togglePlayer = (playerId: string) => {
        if (selectedPlayers.includes(playerId)) {
            // Unselecting: Just remove it
            setSelectedPlayers(selectedPlayers.filter(id => id !== playerId))
            setBattingOrder(battingOrder.filter(id => id !== playerId))
            if (captain === playerId) setCaptain(selectedPlayers[0] || '')
        } else {
            // Selecting: Only allow if < 11
            if (selectedPlayers.length < 11) {
                setSelectedPlayers([...selectedPlayers, playerId])
                setBattingOrder([...battingOrder, playerId])
            }
        }
    }

    const moveBattingOrder = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...battingOrder]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex >= 0 && targetIndex < newOrder.length) {
            [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]]
            setBattingOrder(newOrder)
        }
    }

    const getPlayer = (id: string) => team.players.find(p => p.id === id)!

    const handleConfirm = () => {
        if (selectedPlayers.length === 11) {
            onConfirm(selectedPlayers, battingOrder, captain)
        }
    }

    const autoSelectBest = () => {
        // Auto-select best 11: top batsmen, WK, all-rounders, bowlers
        const sorted = [...team.players].sort((a, b) => {
            // Prioritize WK, then batting rating
            if (a.role === 'WK' && b.role !== 'WK') return -1
            if (b.role === 'WK' && a.role !== 'WK') return 1
            return b.battingRating - a.battingRating
        })

        const best11 = sorted.slice(0, 11).map(p => p.id)
        setSelectedPlayers(best11)

        // Auto batting order: best batsmen first
        const ordered = best11.sort((a, b) => {
            const pA = getPlayer(a)
            const pB = getPlayer(b)
            return pB.battingRating - pA.battingRating
        })
        setBattingOrder(ordered)
        setCaptain(ordered[0])
    }

    return (
        <div className="team-lineup-selector card">
            <h2>Select Playing XI - {team.name}</h2>

            <div className="lineup-actions">
                <button onClick={autoSelectBest} className="auto-btn">Auto Select Best XI</button>
                <span className="selected-count">{selectedPlayers.length}/11 selected</span>
            </div>

            <div className="lineup-grid">
                <div className="player-pool">
                    <h3>Squad ({team.players.length})</h3>
                    <div className="player-list">
                        {team.players.map(player => (
                            <div
                                key={player.id}
                                className={`player-card ${selectedPlayers.includes(player.id) ? 'selected' : ''}`}
                                onClick={() => togglePlayer(player.id)}
                            >
                                <div className="player-name">{player.name}</div>
                                <div className="player-stats">
                                    <span className="role">{player.role}</span>
                                    <span>Bat: {player.battingRating}</span>
                                    <span>Bowl: {player.bowlingRating}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="batting-order">
                    <h3>Batting Order</h3>
                    <div className="order-list">
                        {battingOrder.map((playerId, index) => {
                            const player = getPlayer(playerId)
                            return (
                                <div key={playerId} className="order-item">
                                    <span className="order-num">{index + 1}</span>
                                    <span className="order-name">{player.name}</span>
                                    <div className="order-controls">
                                        <button
                                            onClick={() => moveBattingOrder(index, 'up')}
                                            disabled={index === 0}
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() => moveBattingOrder(index, 'down')}
                                            disabled={index === battingOrder.length - 1}
                                        >
                                            ↓
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="captain-selector">
                        <label>Captain:</label>
                        <select value={captain} onChange={(e) => setCaptain(e.target.value)}>
                            {selectedPlayers.map(id => {
                                const p = getPlayer(id)
                                return <option key={id} value={id}>{p.name}</option>
                            })}
                        </select>
                    </div>
                </div>
            </div>

            <div className="lineup-footer">
                <button onClick={onCancel}>Cancel</button>
                <button
                    onClick={handleConfirm}
                    disabled={selectedPlayers.length !== 11}
                    className="primary"
                >
                    Confirm Team
                </button>
            </div>
        </div>
    )
}
