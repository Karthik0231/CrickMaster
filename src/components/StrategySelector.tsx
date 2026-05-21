import React from 'react'
import { Strategy } from '../state/types'
import { Shield, Scale, Zap } from 'lucide-react'

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
            <div className="strategy-info" style={{ marginTop: '12px' }}>
                {currentStrategy === 'Defensive' && (
                    <small style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}><Shield size={14} color="var(--primary)" /> Defensive: Lower risk, fewer boundaries/wickets</small>
                )}
                {currentStrategy === 'Normal' && (
                    <small style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}><Scale size={14} color="var(--primary)" /> Normal: Balanced approach</small>
                )}
                {currentStrategy === 'Aggressive' && (
                    <small style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}><Zap size={14} color="var(--primary)" /> Aggressive: High risk/reward, more boundaries/wickets</small>
                )}
            </div>
        </div>
    )
}
