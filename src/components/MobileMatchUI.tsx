import React, { useState } from 'react'
import { MatchState, Strategy, Team } from '../state/types'
import { Action } from '../state/reducer'
import { OverHistory } from './OverHistory'
import { CommentaryBox } from './CommentaryBox'
import { DetailedScorecard } from './DetailedScorecard'

interface Props {
  state: MatchState
  dispatch: React.Dispatch<Action>
  appDispatch: React.Dispatch<any>
}

export function MobileMatchUI({ state, dispatch, appDispatch }: Props) {
  const [activeTab, setActiveTab] = useState<'match' | 'scorecard' | 'plan'>('match')
  
  const inn = state.currentInnings === 1 ? state.innings1! : state.innings2!
  const isUserBatting = state.userTeamId === inn.battingTeamId
  const isUserBowling = state.userTeamId === inn.bowlingTeamId

  const home = state.homeTeam
  const away = state.awayTeam
  const i1 = state.innings1
  const i2 = state.innings2

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

  const batTeam = state.homeTeam.id === inn.battingTeamId ? state.homeTeam : state.awayTeam
  const bowlTeam = state.homeTeam.id === inn.bowlingTeamId ? state.homeTeam : state.awayTeam
  const striker = batTeam.players.find(p => p.id === inn.strikerId)
  const nonStriker = batTeam.players.find(p => p.id === inn.nonStrikerId)
  const bowler = bowlTeam.players.find(p => p.id === inn.currentBowlerId)

  const getStatusText = () => {
    if (state.matchCompleted) return state.victoryMargin || 'MATCH FINISHED'
    if (state.currentInnings === 1) return `First Innings: ${home.short} vs ${away.short}`
    const runsNeeded = (i2?.target || 0) - (i2?.runs || 0)
    const ballsLeft = (state.config.overs * 6) - (i2?.balls || 0)
    return `${runsNeeded} runs needed from ${ballsLeft} balls`
  }

  const ModeSelector = ({ pid, current, isOpponent, type }: { pid: string; current: Strategy; isOpponent: boolean; type: 'batsman' | 'bowler' }) => {
    if (isOpponent) return (
      <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase', background: 'var(--primary-glow)', padding: '2px 6px', borderRadius: '4px' }}>
        {current}
      </div>
    )

    return (
      <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '2px', borderRadius: '8px' }}>
        {(['Defensive', 'Normal', 'Aggressive'] as Strategy[]).map(m => (
          <button
            key={m}
            style={{
              flex: 1,
              padding: '6px 4px',
              fontSize: '0.65rem',
              borderRadius: '6px',
              background: current === m ? 'var(--primary)' : 'transparent',
              color: current === m ? 'white' : 'var(--text-muted)',
              border: 'none',
              fontWeight: '800',
              boxShadow: current === m ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none'
            }}
            onClick={() => {
              if (type === 'batsman') {
                dispatch({ type: 'CHANGE_BATSMAN_MODE', payload: { batsmanId: pid, strategy: m } })
              } else {
                dispatch({ type: 'CHANGE_BOWLER_MODE', payload: { bowlerId: pid, strategy: m } })
              }
            }}
          >
            {m === 'Defensive' ? 'DEF' : m === 'Normal' ? 'NORM' : 'AGG'}
          </button>
        ))}
      </div>
    )
  }

  const TeamStrategySelector = () => {
    const isBatting = isUserBatting
    const currentStrategy = isBatting ? inn.battingStrategy : inn.bowlingStrategy
    
    return (
      <div className="card" style={{ padding: '10px', marginBottom: '12px', background: 'var(--bg-alt)', border: '1px dashed var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase' }}>
            Team {isBatting ? 'Batting' : 'Bowling'} Intent (Universal)
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['Defensive', 'Normal', 'Aggressive'] as Strategy[]).map(s => (
            <button
              key={s}
              style={{
                flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900',
                background: currentStrategy === s ? 'var(--primary)' : 'white',
                color: currentStrategy === s ? 'white' : 'var(--text-muted)',
                border: '1px solid var(--card-border)',
                boxShadow: currentStrategy === s ? '0 4px 8px var(--primary-glow)' : 'none'
              }}
              onClick={() => dispatch({ type: 'CHANGE_STRATEGY', payload: { [isBatting ? 'batting' : 'bowling']: s } })}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const BowlingPlanSection = () => {
    if (!isUserBowling) return null
    const bowlingTeam = state.homeTeam.id === inn.bowlingTeamId ? state.homeTeam : state.awayTeam
    const availableBowlers = bowlingTeam.players.filter(p => p.role !== 'BAT' && p.role !== 'WK')
    const currentOver = Math.floor(inn.balls / 6)
    const remainingOvers = Array.from({ length: Math.min(5, state.config.overs - currentOver) }, (_, i) => currentOver + i)

    return (
      <div className="card" style={{ padding: '16px', background: '#f8fafc' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '900', textTransform: 'uppercase' }}>Over Planning</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {remainingOvers.map(overNum => {
            const plannedId = inn.overPlan[overNum] || ''
            return (
              <div key={overNum} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '800', textAlign: 'center' }}>OV {overNum + 1}</div>
                <select
                  value={plannedId || (overNum === currentOver ? inn.currentBowlerId : '')}
                  onChange={(e) => dispatch({ type: 'UPDATE_OVER_PLAN', payload: { over: overNum, bowlerId: e.target.value } })}
                  style={{
                    background: overNum === currentOver ? 'var(--primary-glow)' : 'white',
                    color: 'var(--text)',
                    border: `1px solid ${overNum === currentOver ? 'var(--primary)' : 'var(--card-border)'}`,
                    padding: '4px',
                    borderRadius: '6px',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    width: '100%'
                  }}
                >
                  <option value="" disabled>Select</option>
                  {availableBowlers.map(p => {
                    const bowled = inn.bowlerOverCounts[p.id] || 0
                    const maxOvers = Math.ceil(state.config.overs / 5)
                    return <option key={p.id} value={p.id} disabled={bowled >= maxOvers}>{p.name.split(' ').pop()} ({bowled})</option>
                  })}
                </select>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-match-ui" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      maxHeight: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #1e40af 0%, #3b82f6 30%, #f1f5f9 100%)',
      padding: 'env(safe-area-inset-top) 0 0 0',
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100
    }}>
      {/* Header Area - Comprehensive Team Scores */}
      <div style={{ padding: '12px 20px 20px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: home.color, borderRadius: '50%', border: '2px solid white' }}></div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '900', fontSize: '0.7rem' }}>{home.short}</div>
              <div style={{ fontWeight: '900', fontSize: '0.9rem' }}>
                {i1?.battingTeamId === home.id ? `${i1.runs}/${i1.wickets}` : (i2?.battingTeamId === home.id ? `${i2.runs}/${i2.wickets}` : 'YTB')}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', lineHeight: '1' }}>
              {inn.runs}/{inn.wickets}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', opacity: 0.8 }}>
              OV {Math.floor(inn.balls / 6)}.{inn.balls % 6}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: 'row-reverse' }}>
            <div style={{ width: '32px', height: '32px', background: away.color, borderRadius: '50%', border: '2px solid white' }}></div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '900', fontSize: '0.7rem' }}>{away.short}</div>
              <div style={{ fontWeight: '900', fontSize: '0.9rem' }}>
                {i1?.battingTeamId === away.id ? `${i1.runs}/${i1.wickets}` : (i2?.battingTeamId === away.id ? `${i2.runs}/${i2.wickets}` : 'YTB')}
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ 
          textAlign: 'center', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', 
          padding: '6px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800'
        }}>
          {getStatusText()}
        </div>
      </div>

      {/* Main Container */}
      <div style={{ 
        flex: 1, background: 'white', borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
        padding: '16px', display: 'flex', flexDirection: 'column', overflowY: 'hidden', boxShadow: '0 -12px 40px rgba(0,0,0,0.15)'
      }}>
        
        {/* Tab Navigation */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '16px' }}>
          {['match', 'scorecard', 'plan'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? 'var(--primary)' : '#64748b',
                fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase',
                boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {tab === 'match' ? 'Live' : tab === 'scorecard' ? 'Scorecard' : 'Plan'}
            </button>
          ))}
        </div>

        {activeTab === 'match' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'hidden' }}>
            {/* Action Button */}
            <button 
              onClick={() => dispatch({ type: 'RUN_OVER' })}
              className="primary" 
              style={{ width: '100%', padding: '20px', borderRadius: '16px', fontSize: '1.3rem', fontWeight: '900', marginBottom: '16px', textTransform: 'uppercase' }}
              disabled={state.matchCompleted || state.waitingForBatsman}
            >
              {inn.balls % 6 === 0 && inn.balls > 0 ? 'NEXT OVER' : 'CONTINUE OVER'}
            </button>

            {/* Universal Team Strategy */}
            <TeamStrategySelector />

            {/* Players Info */}
            <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {striker && (
                  <div className="card" style={{ padding: '10px', background: 'var(--primary-glow)', border: '1px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '900', fontSize: '0.8rem', color: 'var(--primary)' }}>{striker.name.split(' ').pop()}*</span>
                      <span style={{ fontWeight: '900', fontSize: '0.9rem' }}>{getBatStats(striker.id).r}({getBatStats(striker.id).b})</span>
                    </div>
                    <ModeSelector pid={striker.id} current={inn.strikerStrategy || 'Normal'} isOpponent={!isUserBatting} type="batsman" />
                  </div>
                )}
                {nonStriker && (
                  <div className="card" style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '800', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{nonStriker.name.split(' ').pop()}</span>
                      <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{getBatStats(nonStriker.id).r}({getBatStats(nonStriker.id).b})</span>
                    </div>
                    <ModeSelector pid={nonStriker.id} current={inn.nonStrikerStrategy || 'Normal'} isOpponent={!isUserBatting} type="batsman" />
                  </div>
                )}
              </div>
              {bowler && (
                <div className="card" style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '900', fontSize: '0.85rem' }}>{bowler.name}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--danger)' }}>
                      {getBowlStats(bowler.id).w}-{getBowlStats(bowler.id).r} ({Math.floor(getBowlStats(bowler.id).b/6)}.{getBowlStats(bowler.id).b%6})
                    </div>
                  </div>
                  <div style={{ width: '100px' }}>
                    <ModeSelector pid={bowler.id} current={inn.bowlingStrategy || 'Normal'} isOpponent={!isUserBowling} type="bowler" />
                  </div>
                </div>
              )}
            </div>

            {/* Commentary & Over History */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
              <div className="card" style={{ flex: 1, padding: '12px', background: '#f8fafc', overflowY: 'auto' }}>
                 <CommentaryBox state={state} />
              </div>
              <div className="card" style={{ padding: '8px', background: '#f8fafc' }}>
                <OverHistory state={state} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scorecard' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <DetailedScorecard state={state} />
          </div>
        )}

        {activeTab === 'plan' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {isUserBowling ? (
              <BowlingPlanSection />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Planning is only available when your team is bowling.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
