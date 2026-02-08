import React from 'react'
import { Strategy } from '../state/types'

interface Props {
    label: string
    currentStrategy: Strategy
    onStrategyChange: (strategy: Strategy) => void
    disabled?: boolean
}

export function StrategySelector({ label, currentStrategy, onStrategyChange, disabled }: Props) {
    const strategies: Strategy[] = ['Defensive', 'Normal', 'Aggressive']

    return (
        <div className="strategy-selector card">
            <h4>{label}</h4>
            <div className="strategy-options">
                {(['Defensive', 'Normal', 'Aggressive'] as Strategy[]).map(s => (
                    <button
                        key={s}
                        className={`mode-mini-btn ${currentStrategy === s ? 'active' : ''}`}
                        onClick={() => onStrategyChange(s)}
                        disabled={disabled}
                    >
                        {s}
                    </button>
                ))}
            </div>
            <div className="strategy-info">
                {currentStrategy === 'Defensive' && (
                    <small>🛡️ Defensive: Lower risk, fewer boundaries/wickets</small>
                )}
                {currentStrategy === 'Normal' && (
                    <small>⚖️ Normal: Balanced approach</small>
                )}
                {currentStrategy === 'Aggressive' && (
                    <small>⚡ Aggressive: High risk/reward, more boundaries/wickets</small>
                )}
            </div>
        </div>
    )
}
