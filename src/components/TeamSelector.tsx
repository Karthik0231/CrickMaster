import React, { useState } from 'react'
import { Team, GameMode } from '../state/types'
import { filterTeamsByMode } from '../utils/teamFilters'

interface Props {
  mode: GameMode
  teams: Team[]
  onStart: (homeId: string, awayId: string, overs: number, seriesMatches?: number, userTeamId?: string) => void
  onBack: () => void
}

export function TeamSelector({ mode, teams, onStart, onBack }: Props) {
  const filteredTeams = filterTeamsByMode(teams, mode)

  const [homeId, setHomeId] = useState(filteredTeams[0]?.id || '')
  const [awayId, setAwayId] = useState(filteredTeams[1]?.id || '')
  const [userSide, setUserSide] = useState<'home' | 'away'>('home')
  const [overs, setOvers] = useState(20)
  const [seriesMatches, setSeriesMatches] = useState(3)

  // Ensure userSide is always home for WC/IPL
  React.useEffect(() => {
    if (mode === 'WorldCup' || mode === 'IPL') {
      setUserSide('home')
    }
  }, [mode])

  const getTeam = (id: string) => filteredTeams.find(t => t.id === id)
  const userTeamId = userSide === 'home' ? homeId : awayId

  return (
    <div className="team-selector card">
      <h2>{mode === 'Series' ? 'Setup Bilateral Series' : mode === 'WorldCup' ? 'Select Your Team' : 'Quick Match Setup'}</h2>

      <div className="selector-row">
        <div className="team-col">
          <h3>{(mode === 'WorldCup' || mode === 'IPL') ? 'Your Team' : 'Home Team'}</h3>
          <select value={homeId} onChange={(e) => setHomeId(e.target.value)}>
            {filteredTeams.map(t => (
              <option key={t.id} value={t.id} disabled={(mode !== 'WorldCup' && mode !== 'IPL') && t.id === awayId}>{t.name}</option>
            ))}
          </select>
          <div className="team-preview">
            <p>Rating: {getTeam(homeId)?.battingRating}</p>
          </div>
        </div>

        <div className="vs">VS</div>

        {mode !== 'WorldCup' && mode !== 'IPL' && (
          <div className="team-col">
            <h3>Away Team</h3>
            <select value={awayId} onChange={(e) => setAwayId(e.target.value)}>
              {filteredTeams.map(t => (
                <option key={t.id} value={t.id} disabled={t.id === homeId}>{t.name}</option>
              ))}
            </select>
            <div className="team-preview">
              <p>Rating: {getTeam(awayId)?.battingRating}</p>
            </div>
          </div>
        )}
        {(mode === 'WorldCup' || mode === 'IPL') && (
          <div className="team-col" style={{ opacity: 0.5 }}>
            <h3>Opponents</h3>
            <p>Tournament Fixtures</p>
            <div className="team-preview">
              <p>Auto-Generated</p>
            </div>
          </div>
        )}
      </div>

      {mode !== 'WorldCup' && mode !== 'IPL' && (
        <div className="user-team-picker">
          <h3>Select Your Team</h3>
          <div className="side-pills">
            <button className={userSide === 'home' ? 'active' : ''} onClick={() => setUserSide('home')}>Home ({getTeam(homeId)?.short})</button>
            <button className={userSide === 'away' ? 'active' : ''} onClick={() => setUserSide('away')}>Away ({getTeam(awayId)?.short})</button>
          </div>
        </div>
      )}

      <div className="options-row">
        <div className="option">
          <label>Match Overs: </label>
          <select value={overs} onChange={(e) => setOvers(Number(e.target.value))}>
            <option value={2}>2 (Super Short)</option>
            <option value={5}>5 (Blitz)</option>
            <option value={10}>10 (Short)</option>
            <option value={20}>20 (T20)</option>
            <option value={50}>50 (ODI)</option>
          </select>
        </div>

        {mode === 'Series' && (
          <div className="option">
            <label>Matches: </label>
            <select value={seriesMatches} onChange={(e) => setSeriesMatches(Number(e.target.value))}>
              <option value={3}>Best of 3</option>
              <option value={5}>Best of 5</option>
            </select>
          </div>
        )}
      </div>

      <div className="actions">
        <button onClick={onBack}>Back</button>
        <button
          className="primary"
          onClick={() => onStart(homeId, awayId, overs, mode === 'Series' ? seriesMatches : undefined, userTeamId)}
          disabled={!homeId || (mode !== 'WorldCup' && mode !== 'IPL' && !awayId)}
        >
          {(mode === 'WorldCup' || mode === 'IPL') ? `Start ${mode === 'WorldCup' ? 'World Cup' : 'IPL'}` : 'Start'}
        </button>
      </div>
    </div>
  )
}
