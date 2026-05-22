import React, { useState } from 'react'
import { MatchState, InningsState, Team } from '../state/types'
import { outcomeRuns } from '../engine/probability'
import { calculateManOfTheMatch } from '../engine/manOfTheMatch'

interface PlayerMatchStats {
  id: string
  name: string
  runs: number
  balls: number
  fours: number
  sixes: number
  out: boolean
  dismissalText: string
}

interface BowlerMatchStats {
  id: string
  name: string
  overs: number
  balls: number
  runs: number
  wickets: number
  maidens: number
}

function calculateStats(innings: InningsState, battingTeam: Team, bowlingTeam: Team) {
  const batsmen: Record<string, PlayerMatchStats> = {}
  const bowlers: Record<string, BowlerMatchStats> = {}

  battingTeam.players.forEach(p => {
    batsmen[p.id] = { id: p.id, name: p.name, runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissalText: 'did not bat' }
  })

  bowlingTeam.players.forEach(p => {
    bowlers[p.id] = { id: p.id, name: p.name, overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0 }
  })

  innings.battingOrder.forEach(id => {
    if (batsmen[id]) batsmen[id].dismissalText = 'not out'
  })

  innings.events.forEach(e => {
    const batter = batsmen[e.strikerId]
    if (batter) {
      if (e.extraType !== 'Wide') batter.balls++
      batter.runs += e.runs
      if (e.runs === 4) batter.fours++
      if (e.runs === 6) batter.sixes++
      if (e.wicket && e.wicketDetails) {
        batter.out = true
        batter.dismissalText = e.wicketDetails.text
      }
    }
    const bowler = bowlers[e.bowlerId]
    if (bowler) {
      if (e.extraType !== 'Wide' && e.extraType !== 'NoBall') bowler.balls++
      bowler.runs += e.runs
      if (e.wicket) bowler.wickets++
    }
  })

  Object.values(bowlers).forEach(b => {
    b.overs = Math.floor(b.balls / 6) + (b.balls % 6) / 10
  })

  return { batsmen, bowlers }
}

export function DetailedScorecard({ state }: { state: MatchState }) {
  const [activeTab, setActiveTab] = useState<'inn1' | 'inn2' | 'history'>('inn1')

  const isInn2 = activeTab === 'inn2'
  const innings = isInn2 ? state.innings2 : state.innings1
  const batTeamId = isInn2 ? state.innings2?.battingTeamId : state.innings1?.battingTeamId
  const battingTeam = state.homeTeam.id === batTeamId ? state.homeTeam : state.awayTeam
  const bowlingTeam = state.homeTeam.id === batTeamId ? state.awayTeam : state.homeTeam

  if (activeTab === 'inn2' && !state.innings2) {
    return <div className="scorecard-empty card">Innings 2 not started</div>
  }

  if (activeTab === 'history') {
    return (
      <div className="detailed-scorecard">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} state={state} />
        <OverHistoryTab state={state} />
      </div>
    )
  }

  if (!innings) return <div>No Data</div>

  const { batsmen, bowlers } = calculateStats(innings, battingTeam, bowlingTeam)

  const battingOrderList = innings.battingOrder
    .map(id => batsmen[id])
    .filter(b => b && (b.balls > 0 || b.out || b.id === innings.strikerId || b.id === innings.nonStrikerId))

  const didNotBat = battingTeam.players.filter(p =>
    !innings.battingOrder.includes(p.id) ||
    (batsmen[p.id] && batsmen[p.id].balls === 0 && !batsmen[p.id].out && p.id !== innings.strikerId && p.id !== innings.nonStrikerId)
  )

  const activeBowlers = Object.values(bowlers).filter(b => b.balls > 0 || b.id === innings.currentBowlerId)

  const overRuns = innings.overOutcomes.map(over => over.reduce((acc, out) => acc + outcomeRuns(out), 0))
  const maxRuns = Math.max(...overRuns, 10)

  return (
    <div className="detailed-scorecard" style={{ display: 'grid', gap: '20px' }}>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} state={state} />

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '900' }}>{battingTeam.short} INNINGS</h2>
          <div style={{ fontWeight: '800' }}>{innings.runs}/{innings.wickets} ({Math.floor(innings.balls / 6)}.{innings.balls % 6})</div>
        </div>
        
        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table>
            <thead>
              <tr>
                <th>Batter</th>
                <th style={{ textAlign: 'right' }}>R</th>
                <th style={{ textAlign: 'right' }}>B</th>
                <th style={{ textAlign: 'right' }}>SR</th>
              </tr>
            </thead>
            <tbody>
              {battingOrderList.map(b => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: '800', fontSize: '0.85rem' }}>{b.name}{b.id === innings.strikerId || b.id === innings.nonStrikerId ? '*' : ''}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{b.dismissalText || 'not out'}</div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '900' }}>{b.runs}</td>
                  <td style={{ textAlign: 'right', fontSize: '0.75rem' }}>{b.balls}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--primary)', fontSize: '0.75rem' }}>
                    {b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', background: 'var(--bg-alt)', borderBottom: '1px solid var(--card-border)' }}>
          <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)' }}>BOWLING</h3>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table>
            <thead>
              <tr>
                <th>Bowler</th>
                <th style={{ textAlign: 'right' }}>O</th>
                <th style={{ textAlign: 'right' }}>R</th>
                <th style={{ textAlign: 'right' }}>W</th>
                <th style={{ textAlign: 'right' }}>Econ</th>
              </tr>
            </thead>
            <tbody>
              {activeBowlers.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: '800', fontSize: '0.85rem' }}>{b.name}{b.id === innings.currentBowlerId ? '*' : ''}</td>
                  <td style={{ textAlign: 'right' }}>{Math.floor(b.balls / 6)}.{b.balls % 6}</td>
                  <td style={{ textAlign: 'right' }}>{b.runs}</td>
                  <td style={{ textAlign: 'right', fontWeight: '900', color: 'var(--secondary)' }}>{b.wickets}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700', fontSize: '0.75rem' }}>
                    {b.balls > 0 ? ((b.runs / b.balls) * 6).toFixed(2) : '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="partnerships-section" style={{ marginTop: '20px', padding: '0 20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Partnerships</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
          {innings.partnerships?.map((p, i) => {
            const b1 = battingTeam.players.find(pl => pl.id === p.batsman1Id)
            const b2 = battingTeam.players.find(pl => pl.id === p.batsman2Id)
            return (
              <div key={i} style={{ padding: '16px', background: 'var(--bg-alt)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{b1?.name.split(' ').pop()} & {b2?.name.split(' ').pop()}</div>
                <div style={{ fontWeight: '800', color: 'var(--primary)' }}>{p.runs} <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>({p.balls})</span></div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="fow-section">
        <h3>Fall of Wickets</h3>
        <p>
          {innings.fallOfWickets.map((f, i) => (
            <span key={i}>
              {f.runs}-{f.wickets} ({battingTeam.players.find(p => p.id === f.batsmanId)?.name.split(' ').pop()}, {Math.floor(f.ball / 6)}.{f.ball % 6} ov)
              {i < innings.fallOfWickets.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}

function Tabs({ activeTab, setActiveTab, state }: { activeTab: string; setActiveTab: (t: any) => void; state: MatchState }) {
  return (
    <div className="tabs">
      <button className={activeTab === 'inn1' ? 'active' : ''} onClick={() => setActiveTab('inn1')}>
        {state.homeTeam.short} Innings
      </button>
      {state.innings2 && (
        <button className={activeTab === 'inn2' ? 'active' : ''} onClick={() => setActiveTab('inn2')}>
          {state.awayTeam.short} Innings
        </button>
      )}
      <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
        Over History
      </button>
    </div>
  )
}

function OverHistoryTab({ state }: { state: MatchState }) {
  const i1 = state.innings1!
  const i2 = state.innings2

  return (
    <div className="over-history-tab">
      <div className="history-grid">
        <div className="inn-col">
          <h3>{state.homeTeam.short}</h3>
          {(i1.overOutcomes || []).map((over, idx) => (
            <div key={idx} className="history-row">
              <span className="ov-label">Ov {idx + 1}</span>
              <div className="ball-bubbles">
                {over.map((out, bi) => <span key={bi} className={`bubble b-${out}`}>{out}</span>)}
              </div>
              <span className="ov-runs">={over.reduce((acc, o) => acc + outcomeRuns(o), 0)}</span>
            </div>
          ))}
        </div>
        {i2 && (
          <div className="inn-col">
            <h3>{state.awayTeam.short}</h3>
            {(i2.overOutcomes || []).map((over, idx) => (
              <div key={idx} className="history-row">
                <span className="ov-label">Ov {idx + 1}</span>
                <div className="ball-bubbles">
                  {over.map((out, bi) => <span key={bi} className={`bubble b-${out}`}>{out}</span>)}
                </div>
                <span className="ov-runs">={over.reduce((acc, o) => acc + outcomeRuns(o), 0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
