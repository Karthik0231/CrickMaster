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
    const bowlerId = e.target.value
    const currentOver = Math.floor(inn.balls / 6)
    dispatch({ type: 'UPDATE_OVER_PLAN', payload: { over: currentOver, bowlerId } })
  }

  const handlePlanOver = (over: number, bowlerId: string) => {
    dispatch({ type: 'UPDATE_OVER_PLAN', payload: { over, bowlerId } })
  }

  const bowlingTeam = state.homeTeam.id === inn.bowlingTeamId ? state.homeTeam : state.awayTeam
  const availableBowlers = bowlingTeam.players.filter(p => p.role !== 'BAT' && p.role !== 'WK')

  const currentOver = Math.floor(inn.balls / 6)
  const remainingOvers = Array.from({ length: Math.min(5, state.config.overs - currentOver) }, (_, i) => currentOver + i)

  const setStrategy = (type: 'batting' | 'bowling', val: Strategy) => {
    dispatch({ type: 'CHANGE_STRATEGY', payload: { [type]: val } })
  }

  return (
    <div className="controls-container card" style={{ padding: '24px', borderTop: '4px solid var(--primary)' }}>
      {/* Bowling Plan Section */}
      {isUserBowling && (
        <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--card-border)' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Bowler Planning (Next 5 Overs)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {remainingOvers.map(overNum => {
              const plannedId = inn.overPlan[overNum] || ''
              return (
                <div key={overNum} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '800' }}>OVER {overNum + 1}</div>
                  <select
                    value={plannedId || (overNum === currentOver ? inn.currentBowlerId : '')}
                    onChange={(e) => handlePlanOver(overNum, e.target.value)}
                    style={{
                      background: overNum === currentOver ? 'var(--primary-glow)' : 'var(--bg-alt)',
                      color: 'var(--text)',
                      border: `1px solid ${overNum === currentOver ? 'var(--primary)' : 'var(--card-border)'}`,
                      padding: '6px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="" disabled>Select</option>
                    {availableBowlers.map(p => {
                      const bowled = inn.bowlerOverCounts[p.id] || 0
                      const maxOvers = Math.ceil(state.config.overs / 5)
                      const isMaxed = bowled >= maxOvers
                      return (
                        <option key={p.id} value={p.id} disabled={isMaxed}>
                          {p.name.split(' ').pop()} ({bowled}/{maxOvers})
                        </option>
                      )
                    })}
                  </select>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Strategy Section */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--card-border)' }}>
         <div style={{ flex: 1 }}>
             <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>
                 BATTING STRATEGY {isUserBatting ? '' : '(AI CONTROLLED)'}
             </label>
             {isUserBatting ? (
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
             ) : (
                 <div className="pill" style={{ 
                     display: 'block', 
                     textAlign: 'center',
                     padding: '8px', 
                     background: 'var(--bg-alt)', 
                     color: 'var(--text-muted)',
                     fontSize: '0.8rem',
                     fontWeight: '600'
                 }}>
                     {/* Show Granular Strategy if available, else standard */}
                     {inn.strikerStrategy && inn.nonStrikerStrategy 
                        ? `STRIKER: ${inn.strikerStrategy} | NON-STRIKER: ${inn.nonStrikerStrategy}` 
                        : 'AI DECIDING...'}
                 </div>
             )}
         </div>
         
         <div style={{ flex: 1 }}>
             <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>
                 BOWLING STRATEGY {isUserBowling ? '' : '(AI CONTROLLED)'}
             </label>
             {isUserBowling ? (
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
             ) : (
                 <div className="pill" style={{ 
                     display: 'block', 
                     textAlign: 'center',
                     padding: '8px', 
                     background: 'var(--bg-alt)', 
                     color: 'var(--text-muted)',
                     fontSize: '0.8rem',
                     fontWeight: '600'
                 }}>
                     {inn.bowlingStrategy ? inn.bowlingStrategy.toUpperCase() : 'AI DECIDING...'}
                 </div>
             )}
         </div>
      </div>

      <div className="match-actions" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>

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
