import React, { useState } from 'react'
import { MatchState, InningsState, Team } from '../state/types'
import { outcomeRuns } from '../engine/probability'
import { calculateManOfTheMatch } from '../engine/manOfTheMatch'
import { Award, Star, Zap } from 'lucide-react'

interface PlayerMatchStats {
  id: string; name: string; runs: number; balls: number;
  fours: number; sixes: number; out: boolean; dismissalText: string
}
interface BowlerMatchStats {
  id: string; name: string; overs: number; balls: number;
  runs: number; wickets: number; maidens: number
}

function calculateStats(innings: InningsState, battingTeam: Team, bowlingTeam: Team) {
  const batsmen: Record<string, PlayerMatchStats> = {}
  const bowlers: Record<string, BowlerMatchStats> = {}
  battingTeam.players.forEach(p => { batsmen[p.id] = { id: p.id, name: p.name, runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissalText: 'did not bat' } })
  bowlingTeam.players.forEach(p => { bowlers[p.id] = { id: p.id, name: p.name, overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0 } })
  innings.battingOrder.forEach(id => { if (batsmen[id]) batsmen[id].dismissalText = 'not out' })
  innings.events.forEach(e => {
    const batter = batsmen[e.strikerId]
    if (batter) {
      if (e.extraType !== 'Wide') batter.balls++
      batter.runs += e.runs
      if (e.runs === 4) batter.fours++
      if (e.runs === 6) batter.sixes++
      if (e.wicket && e.wicketDetails) { batter.out = true; batter.dismissalText = e.wicketDetails.text }
    }
    const bowler = bowlers[e.bowlerId]
    if (bowler) {
      if (e.extraType !== 'Wide' && e.extraType !== 'NoBall') bowler.balls++
      bowler.runs += e.runs
      if (e.wicket) bowler.wickets++
    }
  })
  Object.values(bowlers).forEach(b => { b.overs = Math.floor(b.balls / 6) + (b.balls % 6) / 10 })
  return { batsmen, bowlers }
}

const thStyle: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: '0.6rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', background: '#f8fafc' }
const thRight: React.CSSProperties = { ...thStyle, textAlign: 'right' }
const tdStyle: React.CSSProperties = { padding: '11px 12px', borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem', color: '#0f172a' }
const tdRight: React.CSSProperties = { ...tdStyle, textAlign: 'right' }

export function DetailedScorecard({ state }: { state: MatchState }) {
  const [activeTab, setActiveTab] = useState<'inn1' | 'inn2' | 'history'>('inn1')

  const isInn2 = activeTab === 'inn2'
  const innings = isInn2 ? state.innings2 : state.innings1
  const batTeamId = isInn2 ? state.innings2?.battingTeamId : state.innings1?.battingTeamId
  const battingTeam = state.homeTeam.id === batTeamId ? state.homeTeam : state.awayTeam
  const bowlingTeam = state.homeTeam.id === batTeamId ? state.awayTeam : state.homeTeam

  const TabBar = () => (
    <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
      {[
        { key: 'inn1', label: `${state.homeTeam.short} Innings` },
        ...(state.innings2 ? [{ key: 'inn2', label: `${state.awayTeam.short} Innings` }] : []),
        { key: 'history', label: 'Over History' }
      ].map(t => (
        <button
          key={t.key}
          onClick={() => setActiveTab(t.key as any)}
          style={{
            flex: 1, padding: '9px 8px', fontSize: '0.72rem', fontWeight: '700',
            borderRadius: '9px', border: 'none', cursor: 'pointer', letterSpacing: '0.03em',
            background: activeTab === t.key ? 'white' : 'transparent',
            color: activeTab === t.key ? '#1d4ed8' : '#64748b',
            boxShadow: activeTab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s ease', whiteSpace: 'nowrap'
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )

  if (activeTab === 'history') {
    const i1 = state.innings1!
    const i2 = state.innings2
    const ballStyle = (o: string): React.CSSProperties => {
      const base: React.CSSProperties = { width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: '800', flexShrink: 0 }
      if (o === 'W') return { ...base, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }
      if (o === '6') return { ...base, background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }
      if (o === '4') return { ...base, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }
      if (o === 'Wd' || o === 'Nb') return { ...base, background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }
      if (o === '0') return { ...base, background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0' }
      return { ...base, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }
    }
    const renderInningsHistory = (inn: InningsState, teamName: string) => (
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{teamName}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {(inn.overOutcomes || []).map((over, idx) => {
            const runs = over.reduce((acc, o) => acc + outcomeRuns(o), 0)
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#94a3b8', width: '28px', flexShrink: 0 }}>Ov {idx + 1}</span>
                <div style={{ display: 'flex', gap: '2px', flex: 1, flexWrap: 'wrap' }}>
                  {over.map((o, bi) => <span key={bi} style={ballStyle(o)}>{o === 'Wd' ? 'W̃' : o === 'Nb' ? 'NB' : o}</span>)}
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', flexShrink: 0 }}>{runs}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
    return (
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <TabBar />
        <div style={{ display: 'grid', gridTemplateColumns: i2 ? '1fr 1fr' : '1fr', gap: '20px' }}>
          {renderInningsHistory(i1, state.homeTeam.short)}
          {i2 && renderInningsHistory(i2, state.awayTeam.short)}
        </div>
      </div>
    )
  }

  if (activeTab === 'inn2' && !state.innings2) {
    return (
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '20px' }}>
        <TabBar />
        <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>2nd innings not started yet</div>
      </div>
    )
  }

  if (!innings) return null

  const { batsmen, bowlers } = calculateStats(innings, battingTeam, bowlingTeam)
  const battingOrderList = innings.battingOrder.map(id => batsmen[id]).filter(b => b && (b.balls > 0 || b.out || b.id === innings.strikerId || b.id === innings.nonStrikerId))
  const didNotBat = battingTeam.players.filter(p => !innings.battingOrder.includes(p.id) || (batsmen[p.id] && batsmen[p.id].balls === 0 && !batsmen[p.id].out && p.id !== innings.strikerId && p.id !== innings.nonStrikerId))
  const activeBowlers = Object.values(bowlers).filter(b => b.balls > 0 || b.id === innings.currentBowlerId)
  const overRuns = innings.overOutcomes.map(over => over.reduce((acc, out) => acc + outcomeRuns(out), 0))
  const maxRuns = Math.max(...overRuns, 10)

  return (
    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <TabBar />

      {/* Summary header */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', borderRadius: '16px', padding: '20px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
            {battingTeam.name}
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: '900', color: 'white', lineHeight: 1 }}>
            {innings.runs}<span style={{ fontWeight: '400', fontSize: '1.4rem', color: '#64748b' }}>/{innings.wickets}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            {innings.balls === 0 ? '0.0' : `${Math.floor(innings.balls / 6)}.${innings.balls % 6}`} overs · CRR {innings.runRate?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'right' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pressure</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#f59e0b' }}>{Math.floor(innings.pressure || 0)}<span style={{ fontSize: '1rem', fontWeight: '500', color: '#64748b' }}>%</span></div>
        </div>
      </div>

      {/* Awards section */}
      {state.matchCompleted && (() => {
        const awards = calculateManOfTheMatch(state)
        if (!awards) return null
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            <div style={{ padding: '16px', background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '6px' }}>
                <Award size={12} style={{ color: '#d97706' }} />
                <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#b45309', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Player of Match</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0f172a', marginBottom: '2px' }}>{awards.mom.playerName}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#d97706' }}>₹{awards.mom.prize.toLocaleString()}</div>
            </div>
            {awards.superStriker && (
              <div style={{ padding: '16px', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '6px' }}>
                  <Zap size={12} style={{ color: '#dc2626' }} />
                  <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#b91c1c', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Super Striker</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0f172a', marginBottom: '2px' }}>{awards.superStriker.playerName}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#dc2626' }}>₹{awards.superStriker.prize.toLocaleString()}</div>
              </div>
            )}
            {awards.gameChanger && (
              <div style={{ padding: '16px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '6px' }}>
                  <Star size={12} style={{ color: '#2563eb' }} />
                  <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#1d4ed8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Game Changer</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0f172a', marginBottom: '2px' }}>{awards.gameChanger.playerName}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb' }}>₹{awards.gameChanger.prize.toLocaleString()}</div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Run chart */}
      {overRuns.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Run Chart</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '64px', padding: '0 2px' }}>
            {overRuns.map((runs, i) => {
              const hasWicket = innings.fallOfWickets.some(f => Math.floor(f.ball / 6) === i)
              const h = Math.max(8, (runs / maxRuns) * 100)
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', height: '100%', justifyContent: 'flex-end' }}>
                  <div
                    title={`Over ${i + 1}: ${runs} runs${hasWicket ? ' (W)' : ''}`}
                    style={{
                      width: '100%', borderRadius: '3px 3px 0 0',
                      height: `${h}%`, minHeight: '4px',
                      background: hasWicket ? 'linear-gradient(180deg,#dc2626,#fca5a5)' : runs >= 12 ? 'linear-gradient(180deg,#1d4ed8,#3b82f6)' : 'linear-gradient(180deg,#64748b,#94a3b8)',
                      transition: 'height 0.3s ease'
                    }}
                  />
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '0.55rem', color: '#cbd5e1', fontWeight: '600' }}>Ov 1</span>
            <span style={{ fontSize: '0.55rem', color: '#cbd5e1', fontWeight: '600' }}>Ov {overRuns.length}</span>
          </div>
        </div>
      )}

      {/* Batting table */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#1d4ed8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Batting</div>
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Batter</th>
                  <th style={{ ...thStyle, color: '#94a3b8', fontWeight: '500', fontSize: '0.6rem' }}>Dismissal</th>
                  <th style={thRight}>R</th>
                  <th style={thRight}>B</th>
                  <th style={thRight}>4s</th>
                  <th style={thRight}>6s</th>
                  <th style={thRight}>SR</th>
                </tr>
              </thead>
              <tbody>
                {battingOrderList.map((b, idx) => {
                  const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0'
                  const isActive = b.id === innings.strikerId || b.id === innings.nonStrikerId
                  return (
                    <tr key={b.id} style={{ background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ ...tdStyle, fontWeight: '700' }}>
                        {b.name.split(' ').length > 1 ? `${b.name.split(' ')[0][0]}. ${b.name.split(' ').pop()}` : b.name}
                        {isActive && <span style={{ marginLeft: '4px', color: '#1d4ed8', fontSize: '0.7rem' }}>*</span>}
                      </td>
                      <td style={{ ...tdStyle, color: b.out ? '#dc2626' : '#16a34a', fontStyle: 'italic', fontSize: '0.75rem' }}>{b.dismissalText}</td>
                      <td style={{ ...tdRight, fontWeight: '900', color: b.runs >= 50 ? '#d97706' : '#0f172a', fontSize: '0.9rem' }}>{b.runs}</td>
                      <td style={tdRight}>{b.balls}</td>
                      <td style={{ ...tdRight, color: '#2563eb', fontWeight: '700' }}>{b.fours}</td>
                      <td style={{ ...tdRight, color: '#d97706', fontWeight: '700' }}>{b.sixes}</td>
                      <td style={{ ...tdRight, color: parseFloat(sr) >= 150 ? '#dc2626' : parseFloat(sr) >= 100 ? '#059669' : '#64748b', fontWeight: '700' }}>{sr}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        {didNotBat.length > 0 && (
          <div style={{ marginTop: '8px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.75rem', border: '1px solid #f1f5f9' }}>
            <span style={{ fontWeight: '700', color: '#94a3b8', marginRight: '4px' }}>DNB:</span>
            <span style={{ fontWeight: '600', color: '#64748b' }}>{didNotBat.map(p => p.name.split(' ').pop()).join(', ')}</span>
          </div>
        )}
      </div>

      {/* Bowling table */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#dc2626', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Bowling</div>
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '320px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Bowler</th>
                  <th style={thRight}>O</th>
                  <th style={thRight}>M</th>
                  <th style={thRight}>R</th>
                  <th style={thRight}>W</th>
                  <th style={thRight}>Econ</th>
                </tr>
              </thead>
              <tbody>
                {activeBowlers.map((b, idx) => {
                  const econ = b.balls > 0 ? ((b.runs / b.balls) * 6).toFixed(1) : '0.0'
                  return (
                    <tr key={b.id} style={{ background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ ...tdStyle, fontWeight: '700' }}>
                        {b.name.split(' ').length > 1 ? `${b.name.split(' ')[0][0]}. ${b.name.split(' ').pop()}` : b.name}
                        {b.id === innings.currentBowlerId && <span style={{ marginLeft: '4px', color: '#dc2626', fontSize: '0.7rem' }}>*</span>}
                      </td>
                      <td style={tdRight}>{b.overs.toFixed(1)}</td>
                      <td style={tdRight}>{b.maidens}</td>
                      <td style={tdRight}>{b.runs}</td>
                      <td style={{ ...tdRight, fontWeight: '900', color: b.wickets >= 3 ? '#dc2626' : b.wickets >= 1 ? '#d97706' : '#64748b' }}>{b.wickets}</td>
                      <td style={{ ...tdRight, color: parseFloat(econ) <= 6 ? '#059669' : parseFloat(econ) >= 10 ? '#dc2626' : '#64748b', fontWeight: '700' }}>{econ}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Partnerships */}
      {innings.partnerships && innings.partnerships.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Partnerships</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
            {innings.partnerships.map((p, i) => {
              const b1 = battingTeam.players.find(pl => pl.id === p.batsman1Id)
              const b2 = battingTeam.players.find(pl => pl.id === p.batsman2Id)
              return (
                <div key={i} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>
                    {b1?.name.split(' ').pop()} & {b2?.name.split(' ').pop()}
                  </div>
                  <div style={{ fontWeight: '900', color: '#1d4ed8', fontSize: '0.9rem' }}>
                    {p.runs} <span style={{ fontSize: '0.65rem', fontWeight: '500', color: '#94a3b8' }}>({p.balls}b)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Fall of wickets */}
      {innings.fallOfWickets.length > 0 && (
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#dc2626', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Fall of Wickets</div>
          <div style={{ padding: '12px 14px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca', fontSize: '0.75rem', lineHeight: '1.8', color: '#64748b', fontWeight: '600' }}>
            {innings.fallOfWickets.map((f, i) => (
              <span key={i}>
                <span style={{ color: '#dc2626', fontWeight: '800' }}>{f.runs}-{f.wickets}</span>
                {' '}({battingTeam.players.find(p => p.id === f.batsmanId)?.name.split(' ').pop()}, {Math.floor(f.ball / 6)}.{f.ball % 6} ov)
                {i < innings.fallOfWickets.length - 1 && <span style={{ color: '#e2e8f0', margin: '0 4px' }}>·</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
