import React from 'react'
import { Action } from '../state/reducer'
import { MatchState } from '../state/types'

export function Controls({ state, dispatch }: { state: MatchState; dispatch: React.Dispatch<Action> }) {
  const canRunOver =
    !state.matchCompleted &&
    ((state.currentInnings === 1 && state.innings1 && state.innings1.balls < state.config.overs * 6 && state.innings1.wickets < 10) ||
      (state.currentInnings === 2 && state.innings2 && state.innings2.balls < state.config.overs * 6 && state.innings2.wickets < 10 && (state.innings2.target ? state.innings2.runs < state.innings2.target : true)))

  const canSimulate = !state.matchCompleted
  const canReset = true

  const inn = state.currentInnings === 1 ? state.innings1! : state.innings2!
  const isUserBowling = state.userTeamId === inn.bowlingTeamId

  const handleBowlerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SELECT_BOWLER', payload: e.target.value })
  }

  const bowlingTeam = state.homeTeam.id === inn.bowlingTeamId ? state.homeTeam : state.awayTeam
  const availableBowlers = bowlingTeam.players.filter(p => p.role !== 'BAT' && p.role !== 'WK')

  return (
    <div className="controls-container card" style={{ padding: '24px', borderTop: '4px solid var(--primary)' }}>
      <div className="match-actions" style={{ display: 'grid', gridTemplateColumns: isUserBowling ? '2fr 1fr 1fr 1fr' : '2fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>

        <button
          className="primary"
          style={{ padding: '16px', fontSize: '1rem', letterSpacing: '0.05em' }}
          disabled={!canRunOver}
          onClick={() => dispatch({ type: 'RUN_OVER' })}
        >
          {inn.balls % 6 === 0 && inn.balls > 0 ? 'NEXT OVER' : 'RUN OVER'}
        </button>

        <button
          className="secondary"
          style={{ padding: '16px' }}
          disabled={!canSimulate}
          onClick={() => dispatch({ type: 'SIMULATE_MATCH' })}
        >
          AUTO-PLAY
        </button>

        {isUserBowling && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800' }}>SELECT BOWLER</label>
            <select
              value={inn.currentBowlerId}
              onChange={handleBowlerSelect}
              disabled={state.matchCompleted}
              style={{
                background: 'var(--bg-alt)',
                color: 'var(--text)',
                border: '1px solid var(--card-border)',
                padding: '8px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {availableBowlers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        <button
          style={{ padding: '16px', color: 'var(--danger)', background: 'transparent', border: 'none', fontSize: '0.8rem' }}
          disabled={!canReset}
          onClick={() => dispatch({ type: 'RESET' })}
        >
          RESET
        </button>
      </div>
    </div>
  )
}
