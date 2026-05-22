import React, { useState } from 'react'
import { Trophy, Star, Zap, TrendingUp, Award, Shield, Target, BarChart2, Users, Play, FastForward, ArrowLeft, Crown, Flame, Wind } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'fixtures'>('overview')

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

  const upcomingFixtures = fixtures.filter(f => !f.completed)
  const completedFixtures = fixtures.filter(f => f.completed)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F1EB',
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&family=Playfair+Display:wght@700;900&display=swap');

        * { box-sizing: border-box; }

        .tv-root {
          min-height: 100vh;
          background: #F4F1EB;
          font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
        }

        .tv-topbar {
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          height: 64px;
          position: sticky;
          top: 0;
          z-index: 100;
          gap: 16px;
        }
        .tv-topbar-left { display: flex; align-items: center; gap: 16px; min-width: 0; }
        .tv-back-btn {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .tv-back-btn:hover { background: rgba(255,255,255,0.15); }
        .tv-title-group { display: flex; flex-direction: column; min-width: 0; }
        .tv-main-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          line-height: 1;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tv-sub-title {
          font-size: 0.68rem;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 2px;
        }
        .tv-topbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .tv-status-badge {
          display: flex; align-items: center; gap: 6px;
          background: #22c55e;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .tv-status-badge.completed { background: #6366f1; }
        .tv-status-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #fff;
          animation: tvpulse 1.4s infinite;
        }
        @keyframes tvpulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

        .tv-winner-banner {
          background: linear-gradient(110deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          padding: 48px 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .tv-winner-banner::before {
          content: '';
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E");
        }
        .tv-winner-trophy-row {
          display: flex; align-items: center; justify-content: center; gap: 20px;
          margin-bottom: 12px; flex-wrap: wrap;
        }
        .tv-winner-text {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.5rem, 4vw, 3rem);
          font-weight: 900;
          color: #FFD700;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .tv-winner-sub { font-size: 0.95rem; color: rgba(255,255,255,0.5); font-weight: 500; }

        .tv-tabs {
          background: #fff;
          border-bottom: 1px solid #e5e0d8;
          display: flex;
          padding: 0 24px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .tv-tab {
          display: flex; align-items: center; gap: 7px;
          padding: 15px 20px;
          font-size: 0.76rem; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase;
          color: #999; cursor: pointer;
          border-bottom: 3px solid transparent;
          white-space: nowrap;
          background: none; border-top: none; border-left: none; border-right: none;
          transition: color 0.15s;
          flex-shrink: 0;
        }
        .tv-tab.active { color: #111; border-bottom-color: #111; }
        .tv-tab:hover { color: #444; }

        .tv-body { padding: 24px; max-width: 1400px; margin: 0 auto; }

        .tv-section-label {
          font-size: 0.65rem; font-weight: 800;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: #999; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .tv-section-label::after { content: ''; flex: 1; height: 1px; background: #e5e0d8; }

        .tv-mvp-strip {
          background: #111;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 28px;
        }
        .tv-mvp-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .tv-mvp-title {
          font-size: 0.7rem; font-weight: 800; color: #FFD700;
          letter-spacing: 0.14em; text-transform: uppercase;
          display: flex; align-items: center; gap: 8px;
        }
        .tv-mvp-leader { font-size: 0.72rem; color: rgba(255,255,255,0.45); font-weight: 500; }
        .tv-mvp-leader strong { color: #fff; font-weight: 800; }
        .tv-mvp-cards {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
        }
        @media (max-width: 900px) { .tv-mvp-cards { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 540px) { .tv-mvp-cards { grid-template-columns: repeat(2, 1fr); } }
        .tv-mvp-card {
          padding: 22px 14px;
          text-align: center;
          border-right: 1px solid rgba(255,255,255,0.05);
          position: relative;
        }
        .tv-mvp-card:last-child { border-right: none; }
        .tv-mvp-rank {
          position: absolute; top: 10px; left: 12px;
          font-size: 1.8rem; font-weight: 900;
          color: rgba(255,255,255,0.04);
          font-family: 'Playfair Display', serif; line-height: 1;
        }
        .tv-mvp-badge {
          display: inline-block;
          background: #FFD700; color: #000;
          font-size: 0.52rem; font-weight: 900; letter-spacing: 0.1em;
          padding: 2px 7px; border-radius: 4px; margin-bottom: 7px; text-transform: uppercase;
        }
        .tv-mvp-name { font-size: 0.85rem; font-weight: 800; color: #fff; margin-bottom: 1px; }
        .tv-mvp-team { font-size: 0.62rem; color: rgba(255,255,255,0.38); font-weight: 600; margin-bottom: 12px; }
        .tv-mvp-pts { font-size: 2rem; font-weight: 900; color: #fff; line-height: 1; }
        .tv-mvp-pts-label { font-size: 0.58rem; color: rgba(255,255,255,0.3); font-weight: 700; text-transform: uppercase; margin-top: 3px; letter-spacing: 0.1em; }

        .tv-overview-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 28px;
        }
        @media (max-width: 1024px) { .tv-overview-grid { grid-template-columns: 1fr; } }

        .tv-card {
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid #e8e3da;
          margin-bottom: 20px;
        }
        .tv-card-head {
          padding: 16px 20px;
          border-bottom: 1px solid #f2ede4;
          display: flex; align-items: center; justify-content: space-between;
        }
        .tv-card-title {
          font-size: 0.7rem; font-weight: 800;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #111; display: flex; align-items: center; gap: 8px;
        }
        .tv-card-icon {
          width: 26px; height: 26px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
        }

        .tv-standings-table { width: 100%; border-collapse: collapse; }
        .tv-standings-table thead tr { background: #faf8f4; }
        .tv-standings-table th {
          padding: 11px 14px;
          font-size: 0.62rem; font-weight: 800; color: #bbb;
          text-transform: uppercase; letter-spacing: 0.1em; text-align: left;
        }
        .tv-standings-table th:first-child { padding-left: 20px; }
        .tv-standings-table th:last-child { padding-right: 20px; text-align: right; }
        .tv-standings-row { border-bottom: 1px solid #f5f1eb; transition: background 0.1s; }
        .tv-standings-row:hover { background: #faf8f4; }
        .tv-standings-row.is-user { background: #fffbf0; }
        .tv-standings-row td { padding: 13px 14px; font-size: 0.86rem; }
        .tv-standings-row td:first-child { padding-left: 20px; }
        .tv-standings-row td:last-child { padding-right: 20px; text-align: right; }
        .tv-rank-num {
          display: inline-flex; align-items: center; justify-content: center;
          width: 22px; height: 22px; border-radius: 6px;
          font-size: 0.7rem; font-weight: 900;
          background: #f0ebe2; color: #777;
          margin-right: 10px; flex-shrink: 0;
        }
        .tv-rank-num.top { background: #FFD700; color: #000; }
        .tv-team-name { font-weight: 800; color: #111; }
        .tv-you-pill {
          display: inline-block;
          background: #111; color: #fff;
          font-size: 0.52rem; font-weight: 900; letter-spacing: 0.1em;
          padding: 2px 6px; border-radius: 4px; margin-left: 7px; vertical-align: middle;
        }
        .tv-nrr-pos { color: #16a34a; font-weight: 800; }
        .tv-nrr-neg { color: #dc2626; font-weight: 800; }
        .tv-pts-val { font-weight: 900; font-size: 1rem; color: #111; }

        .tv-fixture-list { padding: 14px; display: flex; flex-direction: column; gap: 10px; }
        .tv-fixture-card {
          border: 1px solid #ede8de;
          border-radius: 14px;
          padding: 18px;
          background: #faf8f4;
          transition: box-shadow 0.15s;
        }
        .tv-fixture-card:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
        .tv-fixture-card.is-user-game { border-color: #111; background: #fff; }
        .tv-fixture-round {
          font-size: 0.6rem; font-weight: 800; letter-spacing: 0.12em;
          text-transform: uppercase; color: #bbb; margin-bottom: 12px;
        }
        .tv-fixture-matchup {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .tv-fixture-team { text-align: center; flex: 1; }
        .tv-fixture-team-short {
          font-size: 1.3rem; font-weight: 900; color: #111;
          font-family: 'Playfair Display', serif;
        }
        .tv-fixture-team-name { font-size: 0.62rem; color: #aaa; font-weight: 600; margin-top: 2px; }
        .tv-fixture-vs { font-size: 0.68rem; font-weight: 900; color: #ddd; letter-spacing: 0.08em; padding: 0 12px; }
        .tv-fixture-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .tv-btn-play {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          background: #111; color: #fff;
          border: none; border-radius: 10px; padding: 11px;
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.07em;
          cursor: pointer; transition: background 0.15s;
        }
        .tv-btn-play:hover { background: #333; }
        .tv-btn-sim {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          background: transparent; color: #111;
          border: 1.5px solid #ddd; border-radius: 10px; padding: 11px;
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
          cursor: pointer; transition: border-color 0.15s, background 0.15s;
        }
        .tv-btn-sim:hover { border-color: #111; }
        .tv-sim-all-btn {
          display: flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 6px 12px;
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em;
          cursor: pointer; transition: background 0.15s;
          white-space: nowrap;
        }
        .tv-sim-all-btn:hover { background: rgba(255,255,255,0.18); color: #fff; }

        .tv-stats-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;
        }
        @media (max-width: 768px) { .tv-stats-grid { grid-template-columns: 1fr; } }
        .tv-stats-grid-3 {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px;
        }
        @media (max-width: 900px) { .tv-stats-grid-3 { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px) { .tv-stats-grid-3 { grid-template-columns: 1fr; } }

        .tv-stat-row {
          padding: 13px 20px; border-bottom: 1px solid #f5f1eb;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .tv-stat-row:last-child { border-bottom: none; }
        .tv-stat-player-name { font-size: 0.86rem; font-weight: 800; color: #111; }
        .tv-stat-player-team { font-size: 0.62rem; color: #bbb; font-weight: 600; }
        .tv-stat-big { font-size: 1.4rem; font-weight: 900; flex-shrink: 0; }
        .tv-orange { color: #f97316; }
        .tv-purple { color: #a855f7; }
        .tv-green { color: #16a34a; }
        .tv-blue { color: #3b82f6; }
        .tv-progress-bar { height: 3px; background: #f0ebe2; border-radius: 2px; margin-top: 6px; max-width: 120px; }
        .tv-progress-fill { height: 100%; border-radius: 2px; }

        .tv-allround-table { width: 100%; border-collapse: collapse; }
        .tv-allround-table th {
          padding: 12px 18px; font-size: 0.62rem; font-weight: 800; color: #bbb;
          text-transform: uppercase; letter-spacing: 0.1em;
          background: #faf8f4; text-align: left; border-bottom: 1px solid #f0ebe2;
          white-space: nowrap;
        }
        .tv-allround-table td {
          padding: 12px 18px; font-size: 0.84rem; border-bottom: 1px solid #f8f5f0;
        }
        .tv-allround-table tr:hover td { background: #faf8f4; }
        .tv-allround-pts { font-weight: 900; color: #111; }

        .tv-result-card {
          border: 1px solid #ede8de; border-radius: 12px;
          padding: 14px 18px; background: #faf8f4;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          margin-bottom: 8px;
        }
        .tv-result-teams { font-size: 0.85rem; font-weight: 800; color: #111; }
        .tv-result-score { font-size: 0.68rem; color: #aaa; font-weight: 600; margin-top: 2px; }
        .tv-result-winner-tag {
          background: #111; color: #fff;
          font-size: 0.58rem; font-weight: 800; letter-spacing: 0.08em;
          padding: 4px 10px; border-radius: 6px; white-space: nowrap; text-transform: uppercase;
          flex-shrink: 0;
        }

        .tv-fixtures-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
          margin-bottom: 28px;
        }

        @media (max-width: 600px) {
          .tv-topbar { padding: 0 16px; height: 58px; }
          .tv-body { padding: 16px; }
          .tv-tabs { padding: 0 12px; }
          .tv-tab { padding: 13px 14px; font-size: 0.7rem; gap: 5px; }
          .tv-winner-banner { padding: 36px 16px; }
        }
      `}</style>

      <div className="tv-root">
        {/* Top Bar */}
        <div className="tv-topbar">
          <div className="tv-topbar-left">
            <button className="tv-back-btn" onClick={onBack}>
              <ArrowLeft size={13} /> Back
            </button>
            <div className="tv-title-group">
              <div className="tv-main-title">{state.name}</div>
              <div className="tv-sub-title">{state.mode} · Season 2026</div>
            </div>
          </div>
          <div className="tv-topbar-right">
            {onSimulateToUserMatch && (
              <button className="tv-sim-all-btn" onClick={onSimulateToUserMatch}>
                <FastForward size={11} /> Skip to My Match
              </button>
            )}
            <div className={`tv-status-badge ${state.status === 'COMPLETED' ? 'completed' : ''}`}>
              {state.status !== 'COMPLETED' && <div className="tv-status-dot" />}
              {state.status === 'COMPLETED' ? 'Completed' : 'Live'}
            </div>
          </div>
        </div>

        {/* Winner Banner */}
        {state.status === 'COMPLETED' && (
          <div className="tv-winner-banner">
            <div className="tv-winner-trophy-row">
              <Trophy size={36} color="#FFD700" />
              <div className="tv-winner-text">{winnerText}</div>
              <Trophy size={36} color="#FFD700" />
            </div>
            <div className="tv-winner-sub">Congratulations to the champions!</div>
          </div>
        )}

        {/* Tabs */}
        <div className="tv-tabs">
          {(['overview', 'stats', 'fixtures'] as const).map(tab => (
            <button
              key={tab}
              className={`tv-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && <Shield size={12} />}
              {tab === 'stats' && <BarChart2 size={12} />}
              {tab === 'fixtures' && <Zap size={12} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="tv-body">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <>
              {state.stats && state.stats.mvpCandidates.length > 0 && (
                <div className="tv-mvp-strip">
                  <div className="tv-mvp-header">
                    <div className="tv-mvp-title">
                      <Star size={13} fill="#FFD700" color="#FFD700" /> MVP Race
                    </div>
                    {state.stats.mvpCandidates[0] && (
                      <div className="tv-mvp-leader">
                        Leader: <strong>{state.stats.mvpCandidates[0].name}</strong>
                      </div>
                    )}
                  </div>
                  <div className="tv-mvp-cards">
                    {state.stats.mvpCandidates.slice(0, 5).map((p, i) => (
                      <div className="tv-mvp-card" key={p.id}>
                        <div className="tv-mvp-rank">{i + 1}</div>
                        {i === 0 && <div className="tv-mvp-badge">MVP</div>}
                        <div className="tv-mvp-name">{p.name}</div>
                        <div className="tv-mvp-team">{p.team}</div>
                        <div className="tv-mvp-pts">{Math.round(p.points)}</div>
                        <div className="tv-mvp-pts-label">points</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="tv-overview-grid">
                <div>
                  <div className="tv-section-label"><Shield size={11} /> Points Table</div>
                  <div className="tv-card">
                    <table className="tv-standings-table">
                      <thead>
                        <tr>
                          <th>Team</th>
                          <th>P</th>
                          <th>W</th>
                          <th>L</th>
                          <th>NRR</th>
                          <th>Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((s, idx) => {
                          const team = getTeam(s.teamId)
                          const isUser = s.teamId === userTeamId
                          return (
                            <tr key={s.teamId} className={`tv-standings-row${isUser ? ' is-user' : ''}`}>
                              <td style={{ display: 'flex', alignItems: 'center' }}>
                                <span className={`tv-rank-num ${idx < 4 ? 'top' : ''}`}>{idx + 1}</span>
                                <span className="tv-team-name">{team.name}</span>
                                {isUser && <span className="tv-you-pill">YOU</span>}
                              </td>
                              <td style={{ fontWeight: 600, color: '#666' }}>{s.p}</td>
                              <td style={{ fontWeight: 700, color: '#16a34a' }}>{s.w}</td>
                              <td style={{ fontWeight: 700, color: '#dc2626' }}>{s.l}</td>
                              <td className={s.nrr >= 0 ? 'tv-nrr-pos' : 'tv-nrr-neg'}>
                                {s.nrr > 0 ? '+' : ''}{s.nrr.toFixed(3)}
                              </td>
                              <td className="tv-pts-val">{s.pts}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <div className="tv-section-label"><Zap size={11} /> Upcoming Fixtures</div>
                  <div className="tv-card">
                    <div className="tv-fixture-list">
                      {upcomingFixtures.slice(0, 5).map(f => {
                        const home = getTeam(f.homeTeamId)
                        const away = getTeam(f.awayTeamId)
                        const isUserGame = f.homeTeamId === userTeamId || f.awayTeamId === userTeamId
                        return (
                          <div key={f.id} className={`tv-fixture-card${isUserGame ? ' is-user-game' : ''}`}>
                            {isUserGame && (
                              <div style={{ fontSize: '0.58rem', fontWeight: 900, color: '#111', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Crown size={10} /> Your Match
                              </div>
                            )}
                            {f.round && <div className="tv-fixture-round">{f.round}</div>}
                            <div className="tv-fixture-matchup">
                              <div className="tv-fixture-team">
                                <div className="tv-fixture-team-short">{home.short}</div>
                                <div className="tv-fixture-team-name">{home.name}</div>
                              </div>
                              <div className="tv-fixture-vs">VS</div>
                              <div className="tv-fixture-team">
                                <div className="tv-fixture-team-short">{away.short}</div>
                                <div className="tv-fixture-team-name">{away.name}</div>
                              </div>
                            </div>
                            <div className="tv-fixture-btns">
                              <button className="tv-btn-play" onClick={() => onPlayMatch(f.id)}>
                                <Play size={11} /> Play
                              </button>
                              <button className="tv-btn-sim" onClick={() => onSimulateMatch(f.id)}>
                                <FastForward size={11} /> Simulate
                              </button>
                            </div>
                          </div>
                        )
                      })}
                      {upcomingFixtures.length === 0 && (
                        <div style={{ padding: '36px', textAlign: 'center', color: '#ccc', fontWeight: 600, fontSize: '0.88rem' }}>
                          All fixtures completed!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── STATS ── */}
          {activeTab === 'stats' && state.stats && (
            <>
              <div className="tv-section-label"><Award size={11} /> Batting &amp; Bowling Leaders</div>
              <div className="tv-stats-grid">
                <div className="tv-card">
                  <div className="tv-card-head">
                    <div className="tv-card-title">
                      <div className="tv-card-icon" style={{ background: '#fff7ed' }}>
                        <Flame size={13} color="#f97316" />
                      </div>
                      Orange Cap · Top Scorers
                    </div>
                  </div>
                  {state.stats.topScorers.slice(0, 5).map((p) => {
                    const max = state.stats!.topScorers[0]?.runs || 1
                    return (
                      <div className="tv-stat-row" key={p.id}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="tv-stat-player-name">{p.name}</div>
                          <div className="tv-stat-player-team">{p.team} · {p.matches} matches</div>
                          <div className="tv-progress-bar">
                            <div className="tv-progress-fill" style={{ width: `${(p.runs / max) * 100}%`, background: '#f97316' }} />
                          </div>
                        </div>
                        <div className="tv-stat-big tv-orange">{p.runs}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="tv-card">
                  <div className="tv-card-head">
                    <div className="tv-card-title">
                      <div className="tv-card-icon" style={{ background: '#faf5ff' }}>
                        <Target size={13} color="#a855f7" />
                      </div>
                      Purple Cap · Top Wickets
                    </div>
                  </div>
                  {state.stats.topWicketTakers.slice(0, 5).map((p) => {
                    const max = state.stats!.topWicketTakers[0]?.wickets || 1
                    return (
                      <div className="tv-stat-row" key={p.id}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="tv-stat-player-name">{p.name}</div>
                          <div className="tv-stat-player-team">{p.team} · {p.matches} matches</div>
                          <div className="tv-progress-bar">
                            <div className="tv-progress-fill" style={{ width: `${(p.wickets / max) * 100}%`, background: '#a855f7' }} />
                          </div>
                        </div>
                        <div className="tv-stat-big tv-purple">{p.wickets}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="tv-section-label"><TrendingUp size={11} /> Specialist Records</div>
              <div className="tv-stats-grid-3">
                <div className="tv-card">
                  <div className="tv-card-head">
                    <div className="tv-card-title">
                      <div className="tv-card-icon" style={{ background: '#eff6ff' }}>
                        <Zap size={13} color="#3b82f6" />
                      </div>
                      Most Sixes
                    </div>
                  </div>
                  {state.stats.topSixHitters.slice(0, 3).map(p => (
                    <div className="tv-stat-row" key={p.id}>
                      <span className="tv-stat-player-name">{p.name}</span>
                      <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#3b82f6' }}>{p.sixes}</span>
                    </div>
                  ))}
                </div>

                <div className="tv-card">
                  <div className="tv-card-head">
                    <div className="tv-card-title">
                      <div className="tv-card-icon" style={{ background: '#f0fdf4' }}>
                        <Wind size={13} color="#16a34a" />
                      </div>
                      Best Economy
                    </div>
                  </div>
                  {state.stats.bestEconomies.slice(0, 3).map(p => (
                    <div className="tv-stat-row" key={p.id}>
                      <span className="tv-stat-player-name">{p.name}</span>
                      <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#16a34a' }}>{p.economy.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="tv-card">
                  <div className="tv-card-head">
                    <div className="tv-card-title">
                      <div className="tv-card-icon" style={{ background: '#fff7ed' }}>
                        <TrendingUp size={13} color="#f97316" />
                      </div>
                      Best Strike Rate
                    </div>
                  </div>
                  {state.stats.bestStrikeRates.slice(0, 3).map(p => (
                    <div className="tv-stat-row" key={p.id}>
                      <span className="tv-stat-player-name">{p.name}</span>
                      <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#f97316' }}>{p.strikeRate.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="tv-section-label"><Users size={11} /> All-Round Performers</div>
              <div className="tv-card">
                <div style={{ overflowX: 'auto' }}>
                  <table className="tv-allround-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Player</th>
                        <th>Runs</th>
                        <th>Balls</th>
                        <th>SR</th>
                        <th>Wkts</th>
                        <th>Econ</th>
                        <th>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.stats.mvpCandidates.slice(0, 10).map((p, idx) => {
                        const s = state.stats!.playerStats[p.id]
                        if (!s) return null
                        return (
                          <tr key={p.id}>
                            <td style={{ color: '#ccc', fontWeight: 700, fontSize: '0.78rem' }}>{idx + 1}</td>
                            <td>
                              <div style={{ fontWeight: 800, color: '#111' }}>{p.name}</div>
                              <div style={{ fontSize: '0.62rem', color: '#a855f7', fontWeight: 700 }}>{p.team}</div>
                            </td>
                            <td style={{ fontWeight: 700 }}>{s.runs}</td>
                            <td style={{ color: '#bbb' }}>{s.balls}</td>
                            <td style={{ fontWeight: 600 }}>{s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(1) : '0.0'}</td>
                            <td style={{ fontWeight: 700, color: '#16a34a' }}>{s.wickets}</td>
                            <td style={{ color: '#bbb' }}>{s.ballsBowled > 0 ? (s.runsConceded / (s.ballsBowled / 6)).toFixed(2) : '0.00'}</td>
                            <td className="tv-allround-pts">{Math.round(p.points)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── FIXTURES ── */}
          {activeTab === 'fixtures' && (
            <>
              {upcomingFixtures.length > 0 && (
                <>
                  <div className="tv-section-label"><Zap size={11} /> Upcoming ({upcomingFixtures.length})</div>
                  <div className="tv-fixtures-grid">
                    {upcomingFixtures.map(f => {
                      const home = getTeam(f.homeTeamId)
                      const away = getTeam(f.awayTeamId)
                      const isUserGame = f.homeTeamId === userTeamId || f.awayTeamId === userTeamId
                      return (
                        <div key={f.id} className={`tv-fixture-card${isUserGame ? ' is-user-game' : ''}`}>
                          {isUserGame && (
                            <div style={{ fontSize: '0.58rem', fontWeight: 900, color: '#111', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Crown size={10} /> Your Match
                            </div>
                          )}
                          {f.round && <div className="tv-fixture-round">{f.round}</div>}
                          <div className="tv-fixture-matchup">
                            <div className="tv-fixture-team">
                              <div className="tv-fixture-team-short">{home.short}</div>
                              <div className="tv-fixture-team-name">{home.name}</div>
                            </div>
                            <div className="tv-fixture-vs">VS</div>
                            <div className="tv-fixture-team">
                              <div className="tv-fixture-team-short">{away.short}</div>
                              <div className="tv-fixture-team-name">{away.name}</div>
                            </div>
                          </div>
                          <div className="tv-fixture-btns">
                            <button className="tv-btn-play" onClick={() => onPlayMatch(f.id)}>
                              <Play size={11} /> Play
                            </button>
                            <button className="tv-btn-sim" onClick={() => onSimulateMatch(f.id)}>
                              <FastForward size={11} /> Simulate
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {completedFixtures.length > 0 && (
                <>
                  <div className="tv-section-label"><Trophy size={11} /> Results ({completedFixtures.length})</div>
                  <div>
                    {completedFixtures.map(f => {
                      const home = getTeam(f.homeTeamId)
                      const away = getTeam(f.awayTeamId)
                      const winner = f.winnerId ? getTeam(f.winnerId) : null
                      return (
                        <div key={f.id} className="tv-result-card">
                          <div style={{ minWidth: 0 }}>
                            {f.round && <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#ccc', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{f.round}</div>}
                            <div className="tv-result-teams">{home.short} vs {away.short}</div>
                            <div className="tv-result-score">{home.name} · {away.name}</div>
                          </div>
                          {winner && <div className="tv-result-winner-tag">{winner.short} Won</div>}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {upcomingFixtures.length === 0 && completedFixtures.length === 0 && (
                <div style={{ padding: '60px', textAlign: 'center', color: '#ccc', fontWeight: 600 }}>
                  No fixtures found.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}