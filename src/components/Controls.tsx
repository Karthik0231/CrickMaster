import React from 'react'
import { Action } from '../state/reducer'
import { MatchState, Strategy } from '../state/types'

export function Controls({ state, dispatch }: { state: MatchState; dispatch: React.Dispatch<Action> }) {
  const inn = state.currentInnings === 1 ? state.innings1 : state.innings2
  if (!inn) return null

  const isUserBatting = state.userTeamId === inn.battingTeamId
  const isUserBowling = state.userTeamId === inn.bowlingTeamId

  const handleSimBall = () => dispatch({ type: 'RUN_BALL' })
  const handleSimOver = () => dispatch({ type: 'RUN_OVER' })

  const setBatStrat = (s: Strategy) => {
    dispatch({ type: 'CHANGE_BATSMAN_MODE', payload: { batsmanId: inn.strikerId, strategy: s } })
    dispatch({ type: 'CHANGE_BATSMAN_MODE', payload: { batsmanId: inn.nonStrikerId, strategy: s } })
  }

  const setBowlStrat = (s: Strategy) => {
    dispatch({ type: 'CHANGE_BOWLER_MODE', payload: { bowlerId: inn.currentBowlerId, strategy: s } })
  }

  return (
    <div style={{ width: '100%', display: 'grid', gap: '16px' }}>
      {/* Strategy Toggle */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {isUserBatting && ['Defensive', 'Normal', 'Aggressive'].map(s => (
          <button
            key={s}
            onClick={() => setBatStrat(s as Strategy)}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
              background: inn.strikerStrategy === s ? 'var(--primary)' : 'var(--bg)',
              color: inn.strikerStrategy === s ? 'white' : 'var(--text-muted)',
              fontSize: '0.75rem', fontWeight: '800', transition: '0.2s'
            }}
          >
            {s.toUpperCase()}
          </button>
        ))}
        {isUserBowling && ['Defensive', 'Normal', 'Aggressive'].map(s => (
          <button
            key={s}
            onClick={() => setBowlStrat(s as Strategy)}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
              background: inn.bowlingStrategy === s ? 'var(--danger)' : 'var(--bg)',
              color: inn.bowlingStrategy === s ? 'white' : 'var(--text-muted)',
              fontSize: '0.75rem', fontWeight: '800', transition: '0.2s'
            }}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
        <button
          onClick={handleSimBall}
          disabled={state.waitingForBatsman || state.matchCompleted}
          style={{
            padding: '16px', borderRadius: '12px', border: '2px solid var(--primary)',
            background: 'white', color: 'var(--primary)', fontWeight: '900', fontSize: '0.9rem'
          }}
        >
          BALL
        </button>
        <button
          onClick={handleSimOver}
          disabled={state.waitingForBatsman || state.matchCompleted}
          style={{
            padding: '16px', borderRadius: '12px', border: 'none',
            background: 'var(--primary)', color: 'white', fontWeight: '900', fontSize: '0.9rem',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}
        >
          CONTINUE OVER
        </button>
      </div>
    </div>
  )
}
