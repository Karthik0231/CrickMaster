import React from 'react'
import { MatchState, Strategy } from '../state/types'
import { calculateManOfTheMatch } from '../engine/manOfTheMatch'
import { Action } from '../state/reducer'
import { Trophy, User } from 'lucide-react'

function getTeam(state: MatchState, teamId: string) {
  return state.homeTeam.id === teamId ? state.homeTeam : state.awayTeam
}

interface ScoreboardProps {
  state: MatchState
  matchDispatch?: React.Dispatch<Action>
  appDispatch?: React.Dispatch<any>
}

export function Scoreboard({ state, matchDispatch, appDispatch }: ScoreboardProps) {
  const inn = state.currentInnings === 1 ? state.innings1 : state.innings2
  if (!inn) return null

  const batTeam = getTeam(state, inn.battingTeamId)
  const bowlTeam = getTeam(state, inn.bowlingTeamId)
  const striker = batTeam.players.find(p => p.id === inn.strikerId)
  const nonStriker = batTeam.players.find(p => p.id === inn.nonStrikerId)
  const bowler = bowlTeam.players.find(p => p.id === inn.currentBowlerId)

  const getBatStats = (pid: string) => {
    return (inn.events || []).reduce((acc, e) => {
      if (e.strikerId === pid) {
        acc.r += e.runs;
        if (e.extraType !== 'Wide') acc.b++;
        if (e.runs === 4) acc.fours++;
        if (e.runs === 6) acc.sixes++;
      }
      return acc;
    }, { r: 0, b: 0, fours: 0, sixes: 0 })
  }

  const getBowlStats = (pid: string) => {
    return (inn.events || []).reduce((acc, e) => {
      if (e.bowlerId === pid) {
        acc.r += e.runs;
        if (e.wicket) acc.w++;
        if (e.extraType !== 'Wide' && e.extraType !== 'NoBall') acc.b++;
      }
      return acc;
    }, { r: 0, w: 0, b: 0 })
  }

  const runsNeeded = inn.target !== undefined ? (inn.target - inn.runs) : 0
  const ballsLeft = (state.config.overs * 6) - inn.balls
  const rrr = ballsLeft > 0 ? ((runsNeeded / ballsLeft) * 6).toFixed(2) : '0.00'

  return (
    <div className="match-scoreboard-mobile" style={{ display: 'grid', gap: '12px' }}>
      <div className="card" style={{ padding: '16px', background: 'white', border: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>🏠</div>
            <div style={{ fontWeight: '900', fontSize: '1.1rem' }}>{state.homeTeam.name.slice(0, 3).toUpperCase()}</div>
          </div>
          <div style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '900', color: 'var(--text-muted)' }}>VS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: 'row-reverse' }}>
            <div style={{ width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>✈️</div>
            <div style={{ fontWeight: '900', fontSize: '1.1rem' }}>{state.awayTeam.name.slice(0, 3).toUpperCase()}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '8px 0', borderTop: '1px solid #f1f5f9' }}>
           <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--primary)', lineHeight: 1 }}>
             {inn.runs}/{inn.wickets}
           </div>
           <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '4px' }}>
             OVERS: {Math.floor(inn.balls / 6)}.{inn.balls % 6} ({state.config.overs})
           </div>
        </div>

        {inn.target !== undefined && (
          <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', textAlign: 'center', marginTop: '10px' }}>
            NEED {runsNeeded} RUNS FROM {ballsLeft} BALLS (RRR: {rrr})
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '12px', background: 'white' }}>
        <div style={{ display: 'grid', gap: '8px' }}>
          {[striker, nonStriker].filter(Boolean).map((p, i) => {
            const stats = getBatStats(p!.id)
            const isStriker = i === 0
            return (
              <div key={p!.id} className="player-status-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderRadius: '8px', margin: 0, border: isStriker ? '1px solid var(--primary)' : '1px solid var(--card-border)', background: isStriker ? 'var(--primary-glow)' : 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ color: 'var(--primary)' }}><User size={16} /></div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{p!.name}{isStriker ? '*' : ''}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>4s: {stats.fours} • 6s: {stats.sixes}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '900', fontSize: '1.1rem' }}>{stats.r}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({stats.b})</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {bowler && (
        <div className="card" style={{ padding: '12px', background: 'white' }}>
          <div className="player-status-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderRadius: '8px', margin: 0, border: '1px solid #ef4444', background: '#fef2f2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ color: '#ef4444' }}>⚾</div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{bowler.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ECON: {getBowlStats(bowler.id).b > 0 ? ((getBowlStats(bowler.id).r / (getBowlStats(bowler.id).b / 6))).toFixed(2) : '0.00'}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#ef4444' }}>
                {getBowlStats(bowler.id).w}-{getBowlStats(bowler.id).r}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                ({Math.floor(getBowlStats(bowler.id).b / 6)}.{getBowlStats(bowler.id).b % 6})
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
