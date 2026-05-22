import React, { useState } from 'react'
import { Team, GameMode, PitchType, BoundarySize } from '../state/types'
import { filterTeamsByMode } from '../utils/teamFilters'

interface Props {
  mode: GameMode
  teams: Team[]
  onStart: (homeId: string, awayId: string, overs: number, seriesMatches?: number, userTeamId?: string, configOverride?: any) => void
  onBack: () => void
}

export function TeamSelector({ mode, teams, onStart, onBack }: Props) {
  const filteredTeams = filterTeamsByMode(teams, mode)

  const [homeId, setHomeId] = useState(filteredTeams[0]?.id || '')
  const [awayId, setAwayId] = useState(filteredTeams[1]?.id || '')
  const [userSide, setUserSide] = useState<'home' | 'away'>('home')
  const [overs, setOvers] = useState(20)
  const [seriesMatches, setSeriesMatches] = useState(3)
  const [pitch, setPitch] = useState<PitchType>('Balanced')
  const [boundarySize, setBoundarySize] = useState<BoundarySize>('Normal')

  // Ensure userSide is always home for WC/IPL
  React.useEffect(() => {
    if (mode === 'WorldCup' || mode === 'IPL') {
      setUserSide('home')
    }
  }, [mode])

  const getTeam = (id: string) => filteredTeams.find(t => t.id === id)
  const userTeamId = userSide === 'home' ? homeId : awayId

  const handleStartMatch = () => {
    const config = {
      overs,
      mode,
      format: overs === 50 ? 'ODI' : 'T20' as any,
      strategy: 'Normal' as any,
      bowlingStrategy: 'Normal' as any,
      pitch,
      boundarySize,
      stadium: 'Generic Stadium'
    }
    onStart(homeId, awayId, overs, mode === 'Series' ? seriesMatches : undefined, userTeamId, config as any)
  }

  return (
    <div className="team-selector card">
      <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '24px' }}>
        {mode === 'Series' ? 'Setup Bilateral Series' : mode === 'WorldCup' ? 'Select Your Team' : 'Match Setup'}
      </h2>

      <div className="selector-row grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
        <div className="team-col card" style={{ padding: '16px', background: 'var(--bg-alt)' }}>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '800' }}>
            {(mode === 'WorldCup' || mode === 'IPL') ? 'Your Team' : 'Home Team'}
          </h3>
          <select value={homeId} onChange={(e) => setHomeId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', fontWeight: '700' }}>
            {filteredTeams.map(t => (
              <option key={t.id} value={t.id} disabled={(mode !== 'WorldCup' && mode !== 'IPL') && t.id === awayId}>{t.name}</option>
            ))}
          </select>
          <div style={{ marginTop: '12px', fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>
            Rating: {getTeam(homeId)?.battingRating}
          </div>
        </div>

        <div className="vs" style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-muted)' }}>VS</div>

        {mode !== 'WorldCup' && mode !== 'IPL' ? (
          <div className="team-col card" style={{ padding: '16px', background: 'var(--bg-alt)' }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '800' }}>Away Team</h3>
            <select value={awayId} onChange={(e) => setAwayId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', fontWeight: '700' }}>
              {filteredTeams.map(t => (
                <option key={t.id} value={t.id} disabled={t.id === homeId}>{t.name}</option>
              ))}
            </select>
            <div style={{ marginTop: '12px', fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>
              Rating: {getTeam(awayId)?.battingRating}
            </div>
          </div>
        ) : (
          <div className="team-col card" style={{ padding: '16px', background: 'var(--bg-alt)', opacity: 0.7 }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '800' }}>Opponents</h3>
            <div style={{ padding: '12px', fontWeight: '700' }}>Tournament Fixtures</div>
            <div style={{ marginTop: '12px', fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)' }}>
              Auto-Generated
            </div>
          </div>
        )}
      </div>

      <div className="advanced-options card" style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="option">
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Match Overs</label>
          <select value={overs} onChange={(e) => setOvers(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', fontWeight: '600' }}>
            <option value={2}>2 Overs</option>
            <option value={5}>5 Overs</option>
            <option value={10}>10 Overs</option>
            <option value={20}>20 Overs (T20)</option>
            <option value={50}>50 Overs (ODI)</option>
          </select>
        </div>

        <div className="option">
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Pitch Condition</label>
          <select value={pitch} onChange={(e) => setPitch(e.target.value as any)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', fontWeight: '600' }}>
            <option value="Balanced">Balanced</option>
            <option value="Flat">Flat (Batting)</option>
            <option value="Slow">Slow (Spin)</option>
            <option value="Seaming">Seaming (Pace)</option>
            <option value="Turning">Turning (Spin)</option>
          </select>
        </div>

        <div className="option">
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Boundary Size</label>
          <select value={boundarySize} onChange={(e) => setBoundarySize(e.target.value as any)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', fontWeight: '600' }}>
            <option value="Short">Short</option>
            <option value="Normal">Normal</option>
            <option value="Large">Large</option>
          </select>
        </div>

        {mode === 'Series' && (
          <div className="option">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Series Length</label>
            <select value={seriesMatches} onChange={(e) => setSeriesMatches(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', fontWeight: '600' }}>
              <option value={3}>Best of 3</option>
              <option value={5}>Best of 5</option>
            </select>
          </div>
        )}
      </div>

      <div className="actions" style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ padding: '12px 32px', flex: '1 1 auto' }}>BACK</button>
        <button
          className="primary"
          onClick={handleStartMatch}
          disabled={!homeId || (mode !== 'WorldCup' && mode !== 'IPL' && !awayId)}
          style={{ padding: '12px 48px', fontSize: '1.1rem', flex: '2 1 auto' }}
        >
          {(mode === 'WorldCup' || mode === 'IPL') ? `START ${mode}` : 'START MATCH'}
        </button>
      </div>
    </div>
  )
}
