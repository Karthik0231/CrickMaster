import React from 'react'
import { Action } from '../state/reducer'
import { MatchState, Strategy } from '../state/types'
import { Play, FastForward, RotateCcw, ChevronRight } from 'lucide-react'

export function Controls({ state, dispatch }: { state: MatchState; dispatch: React.Dispatch<Action> }) {
  const canRunOver =
    !state.matchCompleted &&
    ((state.currentInnings === 1 && state.innings1 && state.innings1.balls < state.config.overs * 6 && state.innings1.wickets < 10) ||
      (state.currentInnings === 2 && state.innings2 && state.innings2.balls < state.config.overs * 6 && state.innings2.wickets < 10 && (state.innings2.target ? state.innings2.runs < state.innings2.target : true)))

  const inn = state.currentInnings === 1 ? state.innings1! : state.innings2!
  const isUserBowling = state.userTeamId === inn.bowlingTeamId
  const isUserBatting = state.userTeamId === inn.battingTeamId
  const bowlingTeam = state.homeTeam.id === inn.bowlingTeamId ? state.homeTeam : state.awayTeam
  const availableBowlers = bowlingTeam.players.filter(p => p.role !== 'BAT' && p.role !== 'WK')
  const currentOver = Math.floor(inn.balls / 6)
  const remainingOvers = Array.from({ length: Math.min(5, state.config.overs - currentOver) }, (_, i) => currentOver + i)

  const setStrategy = (type: 'batting' | 'bowling', val: Strategy) => {
    dispatch({ type: 'CHANGE_STRATEGY', payload: { [type]: val } })
  }

  const stratBtn = (label: string, active: boolean, onClick: () => void, color: string) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        flex: 1, padding: '8px 4px', fontSize: '0.7rem', fontWeight: '700',
        borderRadius: '8px', border: `1.5px solid ${active ? color : '#e2e8f0'}`,
        background: active ? color : 'white', color: active ? 'white' : '#64748b',
        cursor: 'pointer', transition: 'all 0.15s ease', letterSpacing: '0.04em'
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {/* Section header */}
      <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '3px', height: '14px', background: '#1d4ed8', borderRadius: '2px' }} />
        <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.12em', color: '#475569', textTransform: 'uppercase' }}>Match Controls</span>
      </div>

      <div style={{ padding: '18px 20px', display: 'grid', gap: '16px' }}>
        {/* Bowling plan */}
        {isUserBowling && (
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Bowler Plan — Next {remainingOvers.length} Overs
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(remainingOvers.length, 5)}, 1fr)`, gap: '6px' }}>
              {remainingOvers.map(overNum => {
                const plannedId = inn.overPlan[overNum] || ''
                const isCurrent = overNum === currentOver
                return (
                  <div key={overNum} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.55rem', fontWeight: '800', color: isCurrent ? '#1d4ed8' : '#94a3b8', textTransform: 'uppercase', textAlign: 'center' }}>
                      OV {overNum + 1}{isCurrent ? ' ●' : ''}
                    </div>
                    <select
                      value={plannedId || (isCurrent ? inn.currentBowlerId : '')}
                      onChange={e => dispatch({ type: 'UPDATE_OVER_PLAN', payload: { over: overNum, bowlerId: e.target.value } })}
                      style={{
                        width: '100%', padding: '6px 4px', fontSize: '0.65rem', fontWeight: '700',
                        borderRadius: '8px', border: `1.5px solid ${isCurrent ? '#1d4ed8' : '#e2e8f0'}`,
                        background: isCurrent ? '#eff6ff' : '#f8fafc', color: '#0f172a',
                        cursor: 'pointer', outline: 'none', textOverflow: 'ellipsis'
                      }}
                    >
                      <option value="" disabled>Pick</option>
                      {availableBowlers.map(p => {
                        const bowled = inn.bowlerOverCounts[p.id] || 0
                        const maxOvers = Math.ceil(state.config.overs / 5)
                        return (
                          <option key={p.id} value={p.id} disabled={bowled >= maxOvers}>
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

        {/* Strategy controls */}
        <div className="controls-strategy-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Batting {!isUserBatting && <span style={{ color: '#e2e8f0' }}>· AI</span>}
            </div>
            {isUserBatting ? (
              <div style={{ display: 'flex', gap: '4px' }}>
                {stratBtn('DEF', inn.battingStrategy === 'Defensive', () => setStrategy('batting', 'Defensive'), '#2563eb')}
                {stratBtn('NRM', inn.battingStrategy === 'Normal', () => setStrategy('batting', 'Normal'), '#0f172a')}
                {stratBtn('AGG', inn.battingStrategy === 'Aggressive', () => setStrategy('batting', 'Aggressive'), '#dc2626')}
              </div>
            ) : (
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                {inn.strikerStrategy || 'Normal'} / {inn.nonStrikerStrategy || 'Normal'}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Bowling {!isUserBowling && <span style={{ color: '#e2e8f0' }}>· AI</span>}
            </div>
            {isUserBowling ? (
              <div style={{ display: 'flex', gap: '4px' }}>
                {stratBtn('DEF', inn.bowlingStrategy === 'Defensive', () => setStrategy('bowling', 'Defensive'), '#2563eb')}
                {stratBtn('NRM', inn.bowlingStrategy === 'Normal', () => setStrategy('bowling', 'Normal'), '#0f172a')}
                {stratBtn('AGG', inn.bowlingStrategy === 'Aggressive', () => setStrategy('bowling', 'Aggressive'), '#dc2626')}
              </div>
            ) : (
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                {inn.bowlingStrategy || 'Normal'}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="controls-action-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px', alignItems: 'center' }}>
          <button
            disabled={!canRunOver}
            onClick={() => dispatch({ type: 'RUN_OVER' })}
            style={{
              padding: '14px', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.06em',
              borderRadius: '12px', border: 'none', cursor: canRunOver ? 'pointer' : 'not-allowed',
              background: canRunOver ? 'linear-gradient(135deg,#1d4ed8,#2563eb)' : '#e2e8f0',
              color: canRunOver ? 'white' : '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              boxShadow: canRunOver ? '0 4px 12px rgba(29,78,216,0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Play size={14} fill={canRunOver ? 'white' : '#94a3b8'} />
            {inn.balls % 6 === 0 && inn.balls > 0 ? 'NEXT OVER' : 'RUN OVER'}
          </button>

          <button
            disabled={state.matchCompleted}
            onClick={() => dispatch({ type: 'SIMULATE_MATCH' })}
            style={{
              padding: '14px 16px', fontSize: '0.75rem', fontWeight: '700',
              borderRadius: '12px', border: '1.5px solid #e2e8f0',
              background: 'white', color: '#475569', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <FastForward size={14} />
            AUTO
          </button>

          <button
            onClick={() => dispatch({ type: 'RESET' })}
            style={{
              padding: '14px 14px', fontSize: '0.75rem', fontWeight: '700',
              borderRadius: '12px', border: '1.5px solid #fee2e2',
              background: '#fff5f5', color: '#ef4444', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .controls-strategy-grid {
            grid-template-columns: 1fr !important;
          }
          .controls-action-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
