import React from 'react'
import { MatchState, Strategy } from '../state/types'
import { calculateManOfTheMatch } from '../engine/manOfTheMatch'
import { Action } from '../state/reducer'
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'

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
    const pct = Math.abs(clamped) / 2
    const positive = clamped >= 0
    return (
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.1em', color: '#94a3b8', textTransform: 'uppercase' }}>Momentum</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: '700', color: positive ? '#059669' : '#dc2626' }}>
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {positive ? 'Batter' : 'Bowler'}
          </span>
        </div>
        <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, height: '100%', left: '50%', width: `${pct}%`, background: positive ? 'linear-gradient(90deg,#059669,#10b981)' : 'linear-gradient(90deg,#ef4444,#dc2626)', transform: positive ? 'none' : 'scaleX(-1)', transformOrigin: 'left', borderRadius: '99px', transition: 'width 0.4s ease' }} />
        </div>
      </div>
    )
  }

  const ModeSelector = ({ pid, current, isOpponent, type }: { pid: string; current: Strategy; isOpponent: boolean; type: 'batsman' | 'bowler' }) => {
    if (isOpponent) return (
      <span style={{ fontSize: '0.6rem', fontWeight: '700', padding: '2px 8px', borderRadius: '99px', background: '#f1f5f9', color: '#94a3b8', letterSpacing: '0.05em' }}>
        {current.toUpperCase()}
      </span>
    )
    if (!matchDispatch) return (
      <span style={{ fontSize: '0.6rem', fontWeight: '700', padding: '2px 8px', borderRadius: '99px', background: '#eff6ff', color: '#2563eb' }}>
        {current.toUpperCase()}
      </span>
    )
    return (
      <div style={{ display: 'inline-flex', background: '#f8fafc', borderRadius: '8px', padding: '2px', border: '1px solid #e2e8f0', gap: '2px' }}>
        {(['Defensive', 'Normal', 'Aggressive'] as Strategy[]).map(m => (
          <button
            key={m}
            onClick={() => {
              if (matchDispatch) {
                if (type === 'batsman') matchDispatch({ type: 'CHANGE_BATSMAN_MODE', payload: { batsmanId: pid, strategy: m } })
                else matchDispatch({ type: 'CHANGE_BOWLER_MODE', payload: { bowlerId: pid, strategy: m } })
              }
            }}
            style={{
              padding: '3px 8px', fontSize: '0.6rem', fontWeight: '700', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: current === m ? (m === 'Aggressive' ? '#dc2626' : m === 'Defensive' ? '#2563eb' : '#0f172a') : 'transparent',
              color: current === m ? 'white' : '#94a3b8',
              transition: 'all 0.15s ease', letterSpacing: '0.03em'
            }}
          >
            {m === 'Normal' ? 'NRM' : m.slice(0, 3).toUpperCase()}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' }}>
      {/* Header bar */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.15em', color: '#64748b', textTransform: 'uppercase' }}>
          {(() => {
            const inn = state.currentInnings === 1 ? state.innings1 : state.innings2
            return inn?.intentPhase || 'LIVE'
          })()}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#22c55e', letterSpacing: '0.1em' }}>LIVE</span>
        </div>
        {i2?.requiredRunRate !== undefined && !state.matchCompleted && (
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#f59e0b', letterSpacing: '0.05em' }}>
            RRR {i2.requiredRunRate.toFixed(2)}
          </span>
        )}
      </div>

      <div style={{ padding: '20px' }}>
        {/* Innings scores */}
        <div style={{ display: 'grid', gap: '12px' }}>
          {i1 && (
            <div style={{
              padding: '16px 18px', borderRadius: '14px',
              background: state.currentInnings === 1 ? 'linear-gradient(135deg,#eff6ff,#dbeafe)' : '#f8fafc',
              border: `1.5px solid ${state.currentInnings === 1 ? '#bfdbfe' : '#e2e8f0'}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
                    {state.currentInnings === 1 ? '1ST INNINGS — BATTING' : '1ST INNINGS'}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: state.currentInnings === 1 ? '#0f172a' : '#64748b' }}>
                    {getTeam(state, i1.battingTeamId).name}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '900', lineHeight: 1, color: state.currentInnings === 1 ? '#1d4ed8' : '#94a3b8' }}>
                    {i1.runs}<span style={{ fontSize: '1.1rem', fontWeight: '400', opacity: 0.6 }}>/{i1.wickets}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', marginTop: '2px' }}>
                    {Math.floor(i1.balls / 6)}.{i1.balls % 6} ov · CRR {i1.runRate.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {i2 && (
            <div style={{
              padding: '16px 18px', borderRadius: '14px',
              background: state.currentInnings === 2 ? 'linear-gradient(135deg,#eff6ff,#dbeafe)' : '#f8fafc',
              border: `1.5px solid ${state.currentInnings === 2 ? '#bfdbfe' : '#e2e8f0'}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
                    {state.currentInnings === 2 ? '2ND INNINGS — BATTING' : '2ND INNINGS'}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: state.currentInnings === 2 ? '#0f172a' : '#64748b' }}>
                    {getTeam(state, i2.battingTeamId).name}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '900', lineHeight: 1, color: state.currentInnings === 2 ? '#1d4ed8' : '#94a3b8' }}>
                    {i2.runs}<span style={{ fontSize: '1.1rem', fontWeight: '400', opacity: 0.6 }}>/{i2.wickets}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', marginTop: '2px' }}>
                    {Math.floor(i2.balls / 6)}.{i2.balls % 6} ov · TGT {i2.target}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live batting/bowling panel */}
        {!state.matchCompleted && (() => {
          const inn = state.currentInnings === 1 ? state.innings1! : state.innings2!
          const isUserBatting = state.userTeamId === inn.battingTeamId
          const isUserBowling = state.userTeamId === inn.bowlingTeamId
          const batTeam = getTeam(state, inn.battingTeamId)
          const bowlTeam = getTeam(state, inn.bowlingTeamId)
          const striker = batTeam.players.find(p => p.id === inn.strikerId)
          const nonStriker = batTeam.players.find(p => p.id === inn.nonStrikerId)
          const bowler = bowlTeam.players.find(p => p.id === inn.currentBowlerId)

          const getBatStats = (pid: string) => inn.events.reduce((acc, e) => {
            if (e.strikerId === pid) { acc.r += e.runs; if (e.extraType !== 'Wide') acc.b++ }
            return acc
          }, { r: 0, b: 0 })

          const getBowlStats = (pid: string) => inn.events.reduce((acc, e) => {
            if (e.bowlerId === pid) {
              acc.r += e.runs
              if (e.wicket) acc.w++
              if (e.extraType !== 'Wide' && e.extraType !== 'NoBall') acc.b++
            }
            return acc
          }, { r: 0, w: 0, b: 0 })

          return (
            <div style={{ marginTop: '16px' }}>
              <MomentumBar momentum={state.currentInnings === 1 ? (i1?.momentum || 0) : (i2?.momentum || 0)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                {/* Batting card */}
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
                    BATTING
                  </div>
                  {striker && (
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>{striker.name.split(' ').pop()}*</span>
                          <span style={{ fontSize: '0.6rem', color: '#94a3b8', marginLeft: '4px' }}>STR</span>
                        </div>
                        <span style={{ fontWeight: '900', fontSize: '0.9rem', color: '#1d4ed8' }}>
                          {getBatStats(striker.id).r}<span style={{ fontWeight: '500', fontSize: '0.75rem', color: '#94a3b8' }}>({getBatStats(striker.id).b})</span>
                        </span>
                      </div>
                      <ModeSelector pid={striker.id} current={inn.strikerStrategy || 'Normal'} isOpponent={!isUserBatting} type="batsman" />
                    </div>
                  )}
                  {nonStriker && (
                    <div style={{ paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>{nonStriker.name.split(' ').pop()}</span>
                        <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#64748b' }}>
                          {getBatStats(nonStriker.id).r}<span style={{ fontWeight: '400', fontSize: '0.7rem' }}>({getBatStats(nonStriker.id).b})</span>
                        </span>
                      </div>
                      <ModeSelector pid={nonStriker.id} current={inn.nonStrikerStrategy || 'Normal'} isOpponent={!isUserBatting} type="batsman" />
                    </div>
                  )}
                </div>

                {/* Bowling card */}
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
                    BOWLING
                  </div>
                  {bowler && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>{bowler.name.split(' ').pop()}*</span>
                        <span style={{ fontWeight: '900', fontSize: '0.9rem', color: '#dc2626' }}>
                          {getBowlStats(bowler.id).w}-{getBowlStats(bowler.id).r}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', marginBottom: '8px' }}>
                        {Math.floor(getBowlStats(bowler.id).b / 6)}.{getBowlStats(bowler.id).b % 6} overs
                      </div>
                      <ModeSelector pid={bowler.id} current={inn.bowlingStrategy || 'Normal'} isOpponent={!isUserBowling} type="bowler" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

        {/* Match finished panel */}
        {state.matchCompleted && (
          <div style={{ marginTop: '20px', textAlign: 'center', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', padding: '24px', borderRadius: '16px', border: '2px solid #bfdbfe' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.15em', color: '#2563eb', textTransform: 'uppercase', marginBottom: '6px' }}>MATCH RESULT</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', marginBottom: '4px' }}>
              {state.winnerId ? `${getTeam(state, state.winnerId).name} Win` : 'Match Tied'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', marginBottom: '16px' }}>
              {state.victoryMargin || 'Both teams finished level'}
            </div>
            {mom && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', background: '#0f172a', color: 'white', borderRadius: '30px', fontWeight: '700', fontSize: '0.8rem' }}>
                <Trophy size={14} style={{ color: '#fbbf24' }} />
                {mom.mom.playerName} — Player of the Match
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
