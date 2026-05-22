import React from 'react'
import { MatchState, Strategy } from '../state/types'
import { Action } from '../state/reducer'
import { OverHistory } from './OverHistory'
import { CommentaryBox } from './CommentaryBox'

interface Props {
  state: MatchState
  dispatch: React.Dispatch<Action>
  appDispatch: React.Dispatch<any>
}

export function MobileMatchUI({ state, dispatch, appDispatch }: Props) {
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
    if (isOpponent) return <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{current}</span>

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

  return (
    <div className="mobile-match-ui" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      maxHeight: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #1e40af 0%, #3b82f6 30%, #f1f5f9 100%)',
      padding: 'env(safe-area-inset-top) 0 0 0',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100
    }}>
      {/* Header Area - Team Info & Main Score */}
      <div style={{ padding: '16px 20px 24px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: home.color, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.8)', margin: '0 auto 4px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}></div>
            <div style={{ fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase' }}>{home.short}</div>
          </div>
          
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: '1', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              {inn.runs}/{inn.wickets}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', opacity: 0.9, marginTop: '4px' }}>
              {Math.floor(inn.balls / 6)}.{inn.balls % 6} <span style={{ opacity: 0.6 }}>OVERS</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: away.color, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.8)', margin: '0 auto 4px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}></div>
            <div style={{ fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase' }}>{away.short}</div>
          </div>
        </div>
        
        <div style={{ 
          textAlign: 'center', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', 
          padding: '8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800'
        }}>
          {getStatusText()}
        </div>
      </div>

      {/* Main Action Area */}
      <div style={{ 
        flex: 1, 
        background: 'white', 
        borderTopLeftRadius: '32px', 
        borderTopRightRadius: '32px',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'hidden',
        boxShadow: '0 -12px 40px rgba(0,0,0,0.15)'
      }}>
        {/* Central Button */}
        <button 
          onClick={() => dispatch({ type: 'RUN_OVER' })}
          className="primary" 
          style={{ 
            width: '100%', padding: '24px', borderRadius: '20px', fontSize: '1.5rem', 
            fontWeight: '900', marginBottom: '24px', boxShadow: '0 12px 24px var(--primary-glow)',
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}
          disabled={state.matchCompleted || state.waitingForBatsman}
        >
          {inn.balls % 6 === 0 && inn.balls > 0 ? 'NEXT OVER' : 'CONTINUE OVER'}
        </button>

        {/* Player Stats & Strategy */}
        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
          {/* Batsmen Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {striker && (
              <div className="card" style={{ padding: '12px', background: 'var(--primary-glow)', border: '1px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '900', fontSize: '0.85rem', color: 'var(--primary)' }}>{striker.name.split(' ').pop()}*</span>
                  <span style={{ fontWeight: '900', fontSize: '1rem' }}>{getBatStats(striker.id).r}</span>
                </div>
                <ModeSelector pid={striker.id} current={inn.strikerStrategy || 'Normal'} isOpponent={!isUserBatting} type="batsman" />
              </div>
            )}
            {nonStriker && (
              <div className="card" style={{ padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{nonStriker.name.split(' ').pop()}</span>
                  <span style={{ fontWeight: '800', fontSize: '1rem' }}>{getBatStats(nonStriker.id).r}</span>
                </div>
                <ModeSelector pid={nonStriker.id} current={inn.nonStrikerStrategy || 'Normal'} isOpponent={!isUserBatting} type="batsman" />
              </div>
            )}
          </div>

          {/* Bowler Row */}
          {bowler && (
            <div className="card" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '4px' }}>CURRENT BOWLER</div>
                <div style={{ fontWeight: '900', fontSize: '1rem' }}>{bowler.name}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--danger)', marginTop: '2px' }}>
                  {getBowlStats(bowler.id).w}-{getBowlStats(bowler.id).r} <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>({Math.floor(getBowlStats(bowler.id).b/6)}.{getBowlStats(bowler.id).b%6})</span>
                </div>
              </div>
              <div style={{ width: '120px' }}>
                <ModeSelector pid={bowler.id} current={inn.bowlingStrategy || 'Normal'} isOpponent={!isUserBowling} type="bowler" />
              </div>
            </div>
          )}
        </div>

        {/* Info Tabs / Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
          <div className="card" style={{ flex: 1, padding: '16px', background: '#f8fafc', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
             <h4 style={{ margin: '0 0 12px 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '900', textTransform: 'uppercase' }}>Recent Commentary</h4>
             <div style={{ flex: 1, overflowY: 'auto' }}>
                <CommentaryBox state={state} />
             </div>
          </div>
          
          <div className="card" style={{ padding: '12px', background: '#f8fafc' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '900', textTransform: 'uppercase' }}>Over History</h4>
            <OverHistory state={state} />
          </div>
        </div>
      </div>
    </div>
  )
}
