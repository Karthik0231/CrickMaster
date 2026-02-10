import React from 'react'
import { TournamentState, Team, TournamentFixture } from '../state/types'

interface Props {
  state: TournamentState
  userTeamId: string | null
  onPlayMatch: (mId: string) => void
  onSimulateMatch: (mId: string) => void
  onSimulateToUserMatch?: () => void
  onBack: () => void
}

export function TournamentView({ state, userTeamId, onPlayMatch, onSimulateMatch, onSimulateToUserMatch, onBack }: Props) {
  const standings = state.table || []
  const fixtures = state.fixtures || []

  const getTeam = (id: string) => state.teams.find(t => t.id === id) || { name: 'Unknown', short: 'UNK' }

  let winnerText = ''
  let winnerTeamId = ''

  if (state.status === 'COMPLETED') {
    if (state.mode === 'Series') {
      const winner = state.table[0]
      if (winner) {
        winnerTeamId = winner.teamId
        winnerText = `${getTeam(winnerTeamId).name} Wins the Series!`
      }
    } else {
      const finalMatch = state.fixtures.find(f => f.round === 'Final')
      if (finalMatch && finalMatch.winnerId) {
        winnerTeamId = finalMatch.winnerId
        winnerText = `${getTeam(winnerTeamId).name} are Champions!`
      }
    }
  }

  return (
    <div className="tournament-view" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {state.status === 'COMPLETED' && (
        <div style={{
          background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)',
          padding: '40px',
          borderRadius: '16px',
          marginBottom: '40px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(253, 185, 49, 0.4)',
          color: '#333'
        }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: '0 0 16px 0', textTransform: 'uppercase' }}>🏆 {winnerText} 🏆</h1>
          <p style={{ fontSize: '1.2rem', fontWeight: '700' }}>Congratulations to the winning team!</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <button className="secondary" onClick={onBack} style={{ padding: '10px 20px', fontWeight: '700' }}>← BACK TO MENU</button>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-1px' }}>{state.name.toUpperCase()}</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: '600' }}>{state.mode} • Season 2026</p>
          {state.mode === 'Series' && state.teams.length === 2 && (
            <div style={{ marginTop: '8px', fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)' }}>
               Series Score: {getTeam(state.teams[0].id).short} <span style={{ color: 'var(--primary)' }}>{state.table.find(t => t.teamId === state.teams[0].id)?.w || 0}</span> - <span style={{ color: 'var(--primary)' }}>{state.table.find(t => t.teamId === state.teams[1].id)?.w || 0}</span> {getTeam(state.teams[1].id).short}
            </div>
          )}
        </div>
      </div>

      <div className="tournament-layout" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px' }}>
        <div className="standings-col">
          <div className="card" style={{ padding: '0', overflow: 'hidden', background: 'white', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--card-border)', background: 'var(--bg-alt)' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', letterSpacing: '0.05em' }}>POINTS TABLE</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-alt)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                    <th style={{ padding: '16px 24px' }}>Team</th>
                    <th style={{ padding: '16px' }}>P</th>
                    <th style={{ padding: '16px' }}>W</th>
                    <th style={{ padding: '16px' }}>L</th>
                    <th style={{ padding: '16px' }}>NRR</th>
                    <th style={{ padding: '16px 24px' }}>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, idx) => {
                    const team = getTeam(s.teamId)
                    const isUser = s.teamId === userTeamId
                    return (
                      <tr key={s.teamId} style={{
                        borderBottom: '1px solid var(--card-border)',
                        background: isUser ? 'var(--primary-glow)' : 'transparent',
                        transition: 'var(--transition)'
                      }}>
                        <td style={{ padding: '16px 24px', fontWeight: '800' }}>
                          <span style={{ color: 'var(--text-muted)', marginRight: '12px', fontSize: '0.8rem' }}>{idx + 1}</span>
                          {team.name}
                          {isUser && <span style={{ marginLeft: '8px', fontSize: '0.65rem', background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>YOU</span>}
                        </td>
                        <td style={{ padding: '16px', fontWeight: '600' }}>{s.p}</td>
                        <td style={{ padding: '16px', fontWeight: '600', color: 'var(--success)' }}>{s.w}</td>
                        <td style={{ padding: '16px', fontWeight: '600', color: 'var(--danger)' }}>{s.l}</td>
                        <td style={{ padding: '16px', color: s.nrr >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }}>
                          {s.nrr > 0 ? '+' : ''}{s.nrr.toFixed(3)}
                        </td>
                        <td style={{ padding: '16px 24px', fontWeight: '900', color: 'var(--primary)', fontSize: '1.1rem' }}>{s.pts}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="fixtures-col">
          <div className="card" style={{ padding: '0', overflow: 'hidden', background: 'white', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--card-border)', background: 'var(--bg-alt)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', letterSpacing: '0.05em' }}>UPCOMING FIXTURES</h3>
              {onSimulateToUserMatch && (
                <button
                  className="primary"
                  onClick={onSimulateToUserMatch}
                  style={{ fontSize: '0.7rem', padding: '6px 12px' }}
                >
                  SIMULATE TO MY MATCH →
                </button>
              )}
            </div>
            <div style={{ padding: '20px', display: 'grid', gap: '16px' }}>
              {fixtures.filter(f => !f.completed).slice(0, 5).map(f => {
                const home = getTeam(f.homeTeamId)
                const away = getTeam(f.awayTeamId)
                return (
                  <div key={f.id} className="card" style={{
                    padding: '24px',
                    background: 'var(--bg-alt)',
                    border: '1px solid var(--card-border)',
                    boxShadow: 'none'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontWeight: '900', fontSize: '1.1rem' }}>{home.short}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>HOME</div>
                      </div>
                      <div style={{ fontWeight: '900', color: 'var(--primary)', padding: '0 20px', fontSize: '0.9rem', opacity: 0.5 }}>VS</div>
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontWeight: '900', fontSize: '1.1rem' }}>{away.short}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>AWAY</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <button className="primary" onClick={() => onPlayMatch(f.id)} style={{ padding: '12px', fontWeight: '800' }}>PLAY</button>
                      <button className="secondary" onClick={() => onSimulateMatch(f.id)} style={{ padding: '12px', fontWeight: '700' }}>SIMULATE</button>
                    </div>
                  </div>
                )
              })}
              {fixtures.filter(f => !f.completed).length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  All fixtures completed!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
