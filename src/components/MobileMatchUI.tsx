import React from 'react'
import { MatchState, Strategy } from '../state/types'
import { Action } from '../state/reducer'
import { Scoreboard } from './Scoreboard'
import { OverHistory } from './OverHistory'
import { CommentaryBox } from './CommentaryBox'

interface Props {
  state: MatchState
  dispatch: React.Dispatch<Action>
  appDispatch: React.Dispatch<any>
}

export function MobileMatchUI({ state, dispatch, appDispatch }: Props) {
  const [playMode, setPlayMode] = React.useState<'FullOver' | 'BallByBall'>('FullOver')
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
      {/* Scoreboard Area */}
      <div style={{ 
        padding: '16px 16px 20px', 
        background: 'transparent', 
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: '32px', height: '32px', background: home.color, borderRadius: '50%', border: '2px solid white' }}></div>
             <span style={{ fontWeight: '900', fontSize: '1rem' }}>{home.short}: {i1?.battingTeamId === home.id ? i1.runs : (i2?.battingTeamId === home.id ? i2.runs : '0')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <span style={{ fontWeight: '900', fontSize: '1rem' }}>{away.short}: {i1?.battingTeamId === away.id ? i1.runs : (i2?.battingTeamId === away.id ? i2.runs : '0')}</span>
             <div style={{ width: '32px', height: '32px', background: away.color, borderRadius: '50%', border: '2px solid white' }}></div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '4px' }}>
            {inn.runs}/{inn.wickets} <span style={{ fontSize: '1rem', opacity: 0.8 }}>({Math.floor(inn.balls / 6)}.{inn.balls % 6} ov)</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', opacity: 0.9 }}>
            {getStatusText()}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        background: 'white', 
        borderTopLeftRadius: '30px', 
        borderTopRightRadius: '30px',
        padding: '24px 16px',
        overflowY: 'auto',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.1)'
      }}>
        {/* Play Mode Toggle */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
           <button 
             onClick={() => setPlayMode('FullOver')}
             style={{ 
               flex: 1, padding: '10px', borderRadius: '8px', border: 'none', 
               background: playMode === 'FullOver' ? 'white' : 'transparent', 
               color: playMode === 'FullOver' ? 'var(--text)' : '#64748b',
               fontWeight: '800',
               boxShadow: playMode === 'FullOver' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
             }}
           >
             Full Over
           </button>
           <button 
             onClick={() => setPlayMode('BallByBall')}
             style={{ 
               flex: 1, padding: '10px', borderRadius: '8px', border: 'none', 
               background: playMode === 'BallByBall' ? 'white' : 'transparent', 
               color: playMode === 'BallByBall' ? 'var(--text)' : '#64748b',
               fontWeight: '800',
               boxShadow: playMode === 'BallByBall' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
             }}
           >
             Ball By Ball
           </button>
        </div>

        {/* Big Action Button */}
        <button 
          onClick={() => dispatch({ type: playMode === 'FullOver' ? 'RUN_OVER' : 'RUN_BALL' })}
          className="primary" 
          style={{ 
            width: '100%', padding: '20px', borderRadius: '16px', fontSize: '1.2rem', 
            fontWeight: '900', marginBottom: '24px', boxShadow: '0 8px 20px var(--primary-glow)'
          }}
        >
          {playMode === 'FullOver' ? (inn.balls % 6 === 0 && inn.balls > 0 ? 'NEXT OVER' : 'CONTINUE OVER') : 'PLAY BALL'}
        </button>

        {/* Player Cards */}
        <div style={{ display: 'grid', gap: '12px' }}>
          {/* Striker */}
          {striker && (
            <div className="card" style={{ padding: '12px', border: '1px solid var(--primary-glow)', background: 'var(--primary-glow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></div>
                  <span style={{ fontWeight: '800' }}>{striker.name}*</span>
                </div>
                <span style={{ fontWeight: '900' }}>{getBatStats(striker.id).r} ({getBatStats(striker.id).b})</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['Block', 'Rotate', 'Strike', 'Loft'].map(action => (
                  <button 
                    key={action}
                    style={{ 
                      flex: 1, padding: '8px 4px', fontSize: '0.7rem', borderRadius: '8px', 
                      background: 'white', border: '1px solid var(--card-border)', fontWeight: '700'
                    }}
                    onClick={() => {
                      const strategy = action === 'Block' ? 'Defensive' : (action === 'Loft' ? 'Aggressive' : 'Normal')
                      dispatch({ type: 'CHANGE_BATSMAN_MODE', payload: { batsmanId: striker.id, strategy: strategy as Strategy } })
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Non-Striker */}
          {nonStriker && (
            <div className="card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>{nonStriker.name}</span>
                <span style={{ fontWeight: '800' }}>{getBatStats(nonStriker.id).r} ({getBatStats(nonStriker.id).b})</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['Block', 'Rotate', 'Strike', 'Loft'].map(action => (
                  <button 
                    key={action}
                    style={{ flex: 1, padding: '8px 4px', fontSize: '0.7rem', borderRadius: '8px', background: '#f8fafc', border: 'none', color: '#94a3b8' }}
                    disabled
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bowler */}
          {bowler && (
            <div className="card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></div>
                   <span style={{ fontWeight: '800' }}>{bowler.name}</span>
                </div>
                <span style={{ fontWeight: '900' }}>{getBowlStats(bowler.id).w}-{getBowlStats(bowler.id).r} ({Math.floor(getBowlStats(bowler.id).b/6)}.{getBowlStats(bowler.id).b%6})</span>
              </div>
            </div>
          )}
        </div>

        {/* Over History & Commentary */}
        <div style={{ marginTop: '24px' }}>
           <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>Recent Commentary</h4>
           <CommentaryBox state={state} />
        </div>
      </div>
    </div>
  )
}
