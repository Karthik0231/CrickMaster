import React from 'react'
import { Action } from '../state/reducer'
import { MatchState, Strategy } from '../state/types'

export function Controls({ state, dispatch }: { state: MatchState; dispatch: React.Dispatch<Action> }) {
  const canRunOver =
    !state.matchCompleted &&
    ((state.currentInnings === 1 && state.innings1 && state.innings1.balls < state.config.overs * 6 && state.innings1.wickets < 10) ||
      (state.currentInnings === 2 && state.innings2 && state.innings2.balls < state.config.overs * 6 && state.innings2.wickets < 10 && (state.innings2.target ? state.innings2.runs < state.innings2.target : true)))

  const canSimulate = !state.matchCompleted
  const canReset = true

  const inn = state.currentInnings === 1 ? state.innings1! : state.innings2!
  const isUserBowling = state.userTeamId === inn.bowlingTeamId
  const isUserBatting = state.userTeamId === inn.battingTeamId

  const handleBowlerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SELECT_BOWLER', payload: e.target.value })
  }

  const bowlingTeam = state.homeTeam.id === inn.bowlingTeamId ? state.homeTeam : state.awayTeam
  const availableBowlers = bowlingTeam.players.filter(p => p.role !== 'BAT' && p.role !== 'WK')

  const setStrategy = (type: 'batting' | 'bowling', val: Strategy) => {
    dispatch({ type: 'CHANGE_STRATEGY', payload: { [type]: val } })
  }

  return (
    <div className="controls-container card" style={{ padding: '24px', borderTop: '4px solid var(--primary)' }}>
      {/* Strategy Section */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--card-border)' }}>
         {isUserBatting && (
             <div style={{ flex: 1 }}>
                 <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>BATTING STRATEGY</label>
                 <div style={{ display: 'flex', gap: '8px' }}>
                     {['Defensive', 'Normal', 'Aggressive'].map((s) => (
                         <button
                             key={s}
                             className={`strategy-btn ${inn.battingStrategy === s ? 'active' : ''}`}
                             onClick={() => setStrategy('batting', s as Strategy)}
                             style={{
                                 flex: 1,
                                 padding: '8px',
                                 fontSize: '0.8rem',
                                 background: inn.battingStrategy === s ? 'var(--primary)' : 'transparent',
                                 color: inn.battingStrategy === s ? 'white' : 'var(--text)',
                                 border: `1px solid ${inn.battingStrategy === s ? 'var(--primary)' : 'var(--card-border)'}`,
                                 borderRadius: '4px',
                                 cursor: 'pointer'
                             }}
                         >
                             {s}
                         </button>
                     ))}
                 </div>
             </div>
         )}
         
         {isUserBowling && (
             <div style={{ flex: 1 }}>
                 <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>BOWLING STRATEGY</label>
                 <div style={{ display: 'flex', gap: '8px' }}>
                     {['Defensive', 'Normal', 'Aggressive'].map((s) => (
                         <button
                             key={s}
                             className={`strategy-btn ${inn.bowlingStrategy === s ? 'active' : ''}`}
                             onClick={() => setStrategy('bowling', s as Strategy)}
                             style={{
                                 flex: 1,
                                 padding: '8px',
                                 fontSize: '0.8rem',
                                 background: inn.bowlingStrategy === s ? 'var(--primary)' : 'transparent',
                                 color: inn.bowlingStrategy === s ? 'white' : 'var(--text)',
                                 border: `1px solid ${inn.bowlingStrategy === s ? 'var(--primary)' : 'var(--card-border)'}`,
                                 borderRadius: '4px',
                                 cursor: 'pointer'
                             }}
                         >
                             {s}
                         </button>
                     ))}
                 </div>
             </div>
         )}

         {/* AI Status if not user's turn */}
         {!isUserBatting && !isUserBowling && (
             <div style={{ flex: 1, opacity: 0.7 }}>
                 <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>AI STRATEGY</label>
                 <div style={{ fontSize: '0.9rem' }}>
                    Batting: <strong>{inn.battingStrategy}</strong> | Bowling: <strong>{inn.bowlingStrategy}</strong>
                 </div>
             </div>
         )}
      </div>

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
