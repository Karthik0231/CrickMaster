import React from 'react'
import { MatchState, Strategy } from '../state/types'
import { calculateManOfTheMatch } from '../engine/manOfTheMatch'
import { Action } from '../state/reducer'

function getTeam(state: MatchState, teamId: string) {
  return state.homeTeam.id === teamId ? state.homeTeam : state.awayTeam
}

interface ScoreboardProps {
  state: MatchState
  matchDispatch?: React.Dispatch<Action>
  appDispatch?: React.Dispatch<any>
}

export function Scoreboard({ state, matchDispatch, appDispatch }: ScoreboardProps) {
  const i1 = state.innings1
  const i2 = state.innings2
  const mom = calculateManOfTheMatch(state)

  const MomentumBar = ({ momentum }: { momentum: number }) => {
    const clamped = Math.max(-100, Math.min(100, momentum))
    return (
      <div className="momentum-container" style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>
          <span>MATCH MOMENTUM</span>
          <span>{momentum > 0 ? 'BATTER ADVANTAGE' : 'BOWLER PRESSURE'}</span>
        </div>
        <div className="momentum-track" style={{ height: '6px', background: 'var(--bg-alt)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              height: '100%',
              left: '50%',
              width: `${Math.abs(clamped) / 2}%`,
              background: clamped >= 0 ? 'var(--success)' : 'var(--danger)',
              transform: clamped >= 0 ? 'none' : 'scaleX(-1)',
              transformOrigin: 'left',
              transition: 'var(--transition)'
            }}
          />
        </div>
      </div>
    )
  }

  const ModeSelector = ({ pid, current, isOpponent, type }: { pid: string; current: Strategy; isOpponent: boolean; type: 'batsman' | 'bowler' }) => {
    if (isOpponent) return <span className="pill" style={{ fontSize: '0.7rem', background: 'var(--bg-alt)', color: 'var(--text-muted)' }}>{current.toUpperCase()}</span>
    if (!appDispatch) return <span className="pill" style={{ color: 'var(--primary)', background: 'var(--primary-glow)' }}>{current.toUpperCase()}</span>

    return (
      <div className="p-mode-controls" style={{ display: 'flex', gap: '2px', background: 'var(--bg-alt)', padding: '2px', borderRadius: '6px' }}>
        {(['Defensive', 'Normal', 'Aggressive'] as Strategy[]).map(m => (
          <button
            key={m}
            className={`mode-mini-btn ${current === m ? 'active' : ''}`}
            style={{
              padding: '4px 8px',
              fontSize: '0.65rem',
              borderRadius: '4px',
              background: current === m ? 'var(--primary)' : 'transparent',
              color: current === m ? 'white' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: current === m ? '700' : '500'
            }}
            onClick={() => {
              if (appDispatch) {
                if (type === 'batsman') {
                  appDispatch({ type: 'CHANGE_BATSMAN_MODE', payload: { batsmanId: pid, strategy: m } })
                } else {
                  appDispatch({ type: 'CHANGE_BOWLER_MODE', payload: { bowlerId: pid, strategy: m } })
                }
              }
            }}
          >
            {m === 'Normal' ? 'NORM' : m.toUpperCase().slice(0, 3)}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="scoreboard card" style={{ padding: '32px', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>Match Status</h3>
          {(() => {
            const inn = state.currentInnings === 1 ? state.innings1 : state.innings2
            return inn && <span className="pill" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: '700' }}>{inn.intentPhase}</span>
          })()}
        </div>
        {i2?.requiredRunRate !== undefined && !state.matchCompleted && (
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>
            RRR: {i2.requiredRunRate.toFixed(2)}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        {i1 && (
          <div className="innings-row" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: state.currentInnings === 1 ? 'var(--text)' : 'var(--text-muted)' }}>{getTeam(state, i1.battingTeamId).name}</span>
              <span style={{ fontSize: '2.5rem', fontWeight: '900', color: state.currentInnings === 1 ? 'var(--primary)' : 'var(--text-muted)' }}>
                {i1.runs}<span style={{ opacity: 0.5, fontSize: '1.5rem', fontWeight: '400' }}>/{i1.wickets}</span>
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>{Math.floor(i1.balls / 6)}.{i1.balls % 6} Overs</span>
              <span>CRR: <span style={{ color: 'var(--text)', fontWeight: '600' }}>{i1.runRate.toFixed(2)}</span></span>
            </div>
          </div>
        )}

        {i2 && (
          <div className="innings-row" style={{ paddingTop: '24px', borderTop: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: state.currentInnings === 2 ? 'var(--text)' : 'var(--text-muted)' }}>{getTeam(state, i2.battingTeamId).name}</span>
              <span style={{ fontSize: '2.5rem', fontWeight: '900', color: state.currentInnings === 2 ? 'var(--primary)' : 'var(--text-muted)' }}>
                {i2.runs}<span style={{ opacity: 0.5, fontSize: '1.5rem', fontWeight: '400' }}>/{i2.wickets}</span>
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>{Math.floor(i2.balls / 6)}.{i2.balls % 6} Overs <span style={{ fontSize: '0.75rem' }}> (TARGET: {i2.target})</span></span>
              <span>CRR: <span style={{ color: 'var(--text)', fontWeight: '600' }}>{i2.runRate.toFixed(2)}</span></span>
            </div>
          </div>
        )}
      </div>

      {!state.matchCompleted && (
        <div style={{ marginTop: '32px', display: 'grid', gap: '20px' }}>
          <MomentumBar momentum={state.currentInnings === 1 ? (i1?.momentum || 0) : (i2?.momentum || 0)} />

          {(() => {
            const inn = state.currentInnings === 1 ? state.innings1! : state.innings2!
            const isUserBatting = state.userTeamId === inn.battingTeamId
            const isUserBowling = state.userTeamId === inn.bowlingTeamId

            const batTeam = getTeam(state, inn.battingTeamId)
            const bowlTeam = getTeam(state, inn.bowlingTeamId)

            const striker = batTeam.players.find(p => p.id === inn.strikerId)
            const nonStriker = batTeam.players.find(p => p.id === inn.nonStrikerId)
            const bowler = bowlTeam.players.find(p => p.id === inn.currentBowlerId)

            const getBatStats = (pid: string) => {
              return inn.events.reduce((acc, e) => {
                if (e.strikerId === pid) {
                  acc.r += e.runs;
                  if (e.extraType !== 'Wide') acc.b++;
                }
                return acc;
              }, { r: 0, b: 0 })
            }

            const getBowlStats = (pid: string) => {
              return inn.events.reduce((acc, e) => {
                if (e.bowlerId === pid) {
                  acc.r += e.runs;
                  if (e.wicket) acc.w++;
                  if (e.extraType !== 'Wide' && e.extraType !== 'NoBall') acc.b++;
                }
                return acc;
              }, { r: 0, w: 0, b: 0 })
            }

            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="card" style={{ padding: '16px', background: 'var(--bg-alt)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', fontWeight: '700' }}>BATTING</div>
                  {striker && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>🏏 {striker.name}*</span>
                        <span style={{ fontWeight: '800', color: 'var(--primary)' }}>{getBatStats(striker.id).r}({getBatStats(striker.id).b})</span>
                      </div>
                      <ModeSelector pid={striker.id} current={inn.strikerStrategy || 'Normal'} isOpponent={!isUserBatting} type="batsman" />
                    </div>
                  )}
                  {nonStriker && (
                    <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{nonStriker.name}</span>
                        <span style={{ fontWeight: '700' }}>{getBatStats(nonStriker.id).r}({getBatStats(nonStriker.id).b})</span>
                      </div>
                      <ModeSelector pid={nonStriker.id} current={inn.nonStrikerStrategy || 'Normal'} isOpponent={!isUserBatting} type="batsman" />
                    </div>
                  )}
                </div>
                <div className="card" style={{ padding: '16px', background: 'var(--bg-alt)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', fontWeight: '700' }}>BOWLING</div>
                  {bowler && (
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>⚾ {bowler.name}</span>
                        <span style={{ fontWeight: '800', color: 'var(--danger)' }}>{getBowlStats(bowler.id).w}-{getBowlStats(bowler.id).r}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Overs: {Math.floor(getBowlStats(bowler.id).b / 6)}.{getBowlStats(bowler.id).b % 6}
                      </div>
                      <div style={{ marginTop: 'auto' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Bowler Intent</div>
                        <ModeSelector pid={bowler.id} current={inn.bowlingStrategy || 'Normal'} isOpponent={!isUserBowling} type="bowler" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {state.matchCompleted && (
        <div style={{ marginTop: '32px', textAlign: 'center', background: 'var(--primary-glow)', padding: '24px', borderRadius: '16px', border: '2px solid var(--primary)' }}>
          <div style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '1.5rem', marginBottom: '4px', textTransform: 'uppercase' }}>
            {state.winnerId
              ? `${getTeam(state, state.winnerId).name} Victory`
              : 'Match Tied'}
          </div>
          <div style={{ color: 'var(--text-muted)', marginBottom: '20px', fontWeight: '600' }}>
            {state.victoryMargin ? state.victoryMargin : 'Both teams finished level'}
          </div>
          {mom && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '10px 20px', background: 'var(--primary)', color: 'white', borderRadius: '30px', fontWeight: '800', fontSize: '0.9rem' }}>
              🏆 PLAYER OF THE MATCH: {mom.playerName}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
