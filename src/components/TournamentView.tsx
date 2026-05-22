import React, { useState } from 'react'
import {
  Trophy, Star, ArrowLeft, ChevronRight, Play, FastForward,
  TrendingUp, TrendingDown, Minus, Zap, Target, Award,
  BarChart2, Users, Circle, CheckCircle2, Clock, Shield
} from 'lucide-react'
import { TournamentState, Team, TournamentFixture } from '../state/types'

interface Props {
  state: TournamentState
  userTeamId: string | null
  onPlayMatch: (mId: string) => void
  onSimulateMatch: (mId: string) => void
  onSimulateToUserMatch?: () => void
  onBack: () => void
}

/* ─── helpers ─── */
const clr = {
  bg: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  text: '#0f172a',
  muted: '#64748b',
  faint: '#94a3b8',
  blue: '#1d4ed8',
  blueMid: '#2563eb',
  blueLight: '#eff6ff',
  blueBorder: '#bfdbfe',
  green: '#059669',
  greenLight: '#f0fdf4',
  greenBorder: '#bbf7d0',
  red: '#dc2626',
  redLight: '#fef2f2',
  redBorder: '#fecaca',
  amber: '#d97706',
  amberLight: '#fffbeb',
  amberBorder: '#fde68a',
  purple: '#7c3aed',
  purpleLight: '#f5f3ff',
  purpleBorder: '#ddd6fe',
  gold: '#f59e0b',
  goldLight: '#fef3c7',
  goldBorder: '#fde68a',
  dark: '#0f172a',
  darkMid: '#1e293b',
  slate: '#334155',
}

const pill = (bg: string, color: string, border: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', padding: '2px 9px',
  borderRadius: '99px', background: bg, color, border: `1px solid ${border}`,
  fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase' as const
})

const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: clr.white, borderRadius: '16px', border: `1px solid ${clr.border}`,
  overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', ...extra
})

const sectionHead = (label: string, accent: string, sub?: React.ReactNode) => (
  <div style={{ background: clr.bg, borderBottom: `1px solid ${clr.border}`, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '3px', height: '14px', background: accent, borderRadius: '2px' }} />
      <span style={{ fontSize: '0.68rem', fontWeight: '800', letterSpacing: '0.12em', color: clr.slate, textTransform: 'uppercase' }}>{label}</span>
    </div>
    {sub}
  </div>
)

export function TournamentView({ state, userTeamId, onPlayMatch, onSimulateMatch, onSimulateToUserMatch, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'fixtures' | 'stats'>('overview')

  const standings = state.table || []
  const fixtures = state.fixtures || []
  const upcoming = fixtures.filter(f => !f.completed)
  const completed = fixtures.filter(f => f.completed)

  const getTeam = (id: string) => state.teams.find(t => t.id === id) || { name: 'Unknown', short: 'UNK' }

  let winnerTeamId = ''
  let winnerText = ''
  if (state.status === 'COMPLETED') {
    if (state.mode === 'Series') {
      const winner = state.table[0]
      if (winner) { winnerTeamId = winner.teamId; winnerText = `${getTeam(winnerTeamId).name} Wins the Series!` }
    } else {
      const finalMatch = state.fixtures.find(f => f.round === 'Final')
      if (finalMatch?.winnerId) { winnerTeamId = finalMatch.winnerId; winnerText = `${getTeam(winnerTeamId).name} are Champions!` }
    }
  }

  /* ─── champion banner ─── */
  const ChampionBanner = () => (
    <div style={{
      background: 'linear-gradient(135deg,#78350f 0%,#b45309 40%,#d97706 70%,#f59e0b 100%)',
      borderRadius: '20px', padding: '32px 24px', marginBottom: '24px', textAlign: 'center',
      boxShadow: '0 8px 32px rgba(217,119,6,0.35)', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 70%)' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🏆</div>
        <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: '8px' }}>TOURNAMENT COMPLETE</div>
        <h1 style={{ margin: '0 0 4px', fontSize: 'clamp(1.2rem, 5vw, 2rem)', fontWeight: '900', color: 'white', lineHeight: 1.1 }}>{winnerText}</h1>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontWeight: '600', fontSize: '0.85rem' }}>Congratulations to the winning team!</p>
      </div>
    </div>
  )

  /* ─── top nav ─── */
  const Header = () => (
    <div style={{ background: clr.white, borderRadius: '18px', border: `1px solid ${clr.border}`, padding: '14px 18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '10px', border: `1.5px solid ${clr.border}`, background: clr.white, color: clr.muted, cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
        <ArrowLeft size={13} /> BACK
      </button>
      <div style={{ flex: 1, minWidth: '120px' }}>
        <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.3rem)', fontWeight: '900', color: clr.dark, letterSpacing: '-0.5px', lineHeight: 1 }}>{state.name.toUpperCase()}</div>
        <div style={{ fontSize: '0.62rem', fontWeight: '800', color: clr.blue, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '3px' }}>{state.mode} · Season 2026</div>
      </div>
      <div style={{ display: 'flex', gap: '2px', background: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
        {([
          { key: 'overview', label: 'Overview', icon: <BarChart2 size={12} /> },
          { key: 'fixtures', label: 'Fixtures', icon: <Clock size={12} /> },
          { key: 'stats', label: 'Stats', icon: <TrendingUp size={12} /> }
        ] as const).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 11px',
            borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '800',
            background: activeTab === t.key ? clr.white : 'transparent',
            color: activeTab === t.key ? clr.blue : clr.faint,
            boxShadow: activeTab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s', whiteSpace: 'nowrap'
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
    </div>
  )

  /* ─── standings table ─── */
  const StandingsTable = () => (
    <div style={card()}>
      {sectionHead('Points Table', clr.blue)}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '380px' }}>
          <thead>
            <tr style={{ background: clr.bg }}>
              {['#', 'Team', 'P', 'W', 'L', 'NRR', 'Pts'].map((h, i) => (
                <th key={h} style={{ padding: i === 0 ? '11px 10px 11px 16px' : i === 1 ? '11px 12px' : '11px 12px', textAlign: i > 1 ? 'center' : 'left', fontSize: '0.6rem', fontWeight: '800', color: clr.faint, letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: `1px solid ${clr.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((s, idx) => {
              const team = getTeam(s.teamId)
              const isUser = s.teamId === userTeamId
              const qualify = idx < 4
              return (
                <tr key={s.teamId} style={{ background: isUser ? clr.blueLight : idx % 2 === 0 ? clr.white : '#fafbfc', borderBottom: `1px solid ${clr.borderLight}`, transition: 'background 0.15s' }}>
                  <td style={{ padding: '13px 10px 13px 16px', fontWeight: '800', fontSize: '0.78rem', color: qualify ? clr.blue : clr.faint }}>{idx + 1}</td>
                  <td style={{ padding: '13px 12px', fontWeight: '800', fontSize: '0.88rem', color: clr.dark }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: isUser ? clr.blue : clr.bg, border: `1.5px solid ${isUser ? clr.blue : clr.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: '900', color: isUser ? 'white' : clr.muted, flexShrink: 0 }}>
                        {team.short?.slice(0, 3)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', color: clr.dark, fontSize: '0.85rem', lineHeight: 1 }}>{team.name}</div>
                        {isUser && <span style={{ ...pill(clr.blue, 'white', clr.blue), marginTop: '3px' }}>YOU</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '13px 12px', textAlign: 'center', fontWeight: '600', fontSize: '0.82rem', color: clr.muted }}>{s.p}</td>
                  <td style={{ padding: '13px 12px', textAlign: 'center', fontWeight: '700', fontSize: '0.82rem', color: clr.green }}>{s.w}</td>
                  <td style={{ padding: '13px 12px', textAlign: 'center', fontWeight: '700', fontSize: '0.82rem', color: clr.red }}>{s.l}</td>
                  <td style={{ padding: '13px 12px', textAlign: 'center', fontWeight: '700', fontSize: '0.82rem', color: s.nrr >= 0 ? clr.green : clr.red }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                      {s.nrr >= 0.01 ? <TrendingUp size={11} /> : s.nrr <= -0.01 ? <TrendingDown size={11} /> : <Minus size={11} />}
                      {s.nrr > 0 ? '+' : ''}{s.nrr.toFixed(3)}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px 13px 12px', textAlign: 'center', fontWeight: '900', fontSize: '1rem', color: clr.blue }}>{s.pts}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  /* ─── MVP leaderboard ─── */
  const MVPLeaderboard = () => {
    if (!state.stats?.mvpCandidates?.length) return null
    return (
      <div style={card()}>
        {sectionHead('MVP Race', clr.gold, (
          state.stats.mvpCandidates[0] && (
            <span style={pill(clr.goldLight, clr.amber, clr.goldBorder)}>
              Leader: {state.stats.mvpCandidates[0].name}
            </span>
          )
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1px', background: clr.border }}>
          {state.stats.mvpCandidates.slice(0, 5).map((p, i) => (
            <div key={p.id} style={{ background: clr.white, padding: '18px 14px', textAlign: 'center', position: 'relative' }}>
              {i === 0 && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: clr.gold, color: clr.dark, padding: '1px 6px', borderRadius: '4px', fontSize: '0.55rem', fontWeight: '900', letterSpacing: '0.04em' }}>MVP</div>
              )}
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: i === 0 ? clr.goldLight : clr.bg, border: `2px solid ${i === 0 ? clr.goldBorder : clr.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '0.75rem', fontWeight: '900', color: i === 0 ? clr.amber : clr.muted }}>
                {i + 1}
              </div>
              <div style={{ fontWeight: '900', fontSize: '0.82rem', color: clr.dark, lineHeight: 1.2 }}>{p.name}</div>
              <div style={{ fontSize: '0.62rem', color: clr.blue, fontWeight: '800', margin: '3px 0 10px', letterSpacing: '0.04em' }}>{p.team}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: clr.dark, lineHeight: 1 }}>{Math.round(p.points)}</div>
              <div style={{ fontSize: '0.55rem', color: clr.faint, fontWeight: '700', marginTop: '3px', textTransform: 'uppercase' }}>pts</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ─── fixture card ─── */
  const FixtureCard = ({ f, showActions = true }: { f: TournamentFixture; showActions?: boolean }) => {
    const home = getTeam(f.homeTeamId)
    const away = getTeam(f.awayTeamId)
    const isUserMatch = f.homeTeamId === userTeamId || f.awayTeamId === userTeamId
    return (
      <div style={{
        borderRadius: '14px', border: `1.5px solid ${isUserMatch && !f.completed ? clr.blueBorder : clr.border}`,
        background: isUserMatch && !f.completed ? clr.blueLight : clr.white,
        padding: '16px', transition: 'all 0.15s'
      }}>
        {(f.round || isUserMatch) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            {f.round && <span style={pill(clr.bg, clr.muted, clr.border)}>{f.round}</span>}
            {isUserMatch && !f.completed && <span style={pill(clr.blue, 'white', clr.blue)}>YOUR MATCH</span>}
            {f.completed && <span style={pill(clr.greenLight, clr.green, clr.greenBorder)}>
              <CheckCircle2 size={9} style={{ marginRight: '3px' }} /> Completed
            </span>}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '12px', marginBottom: showActions && !f.completed ? '14px' : '0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: clr.bg, border: `1.5px solid ${clr.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: '0.65rem', fontWeight: '900', color: clr.slate }}>
              {home.short?.slice(0, 3)}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: '900', color: clr.dark }}>{home.short}</div>
            <div style={{ fontSize: '0.6rem', color: clr.faint, fontWeight: '600' }}>HOME</div>
            {f.completed && f.winnerId === f.homeTeamId && <div style={{ fontSize: '0.6rem', color: clr.green, fontWeight: '800', marginTop: '3px' }}>WON</div>}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '900', color: clr.faint, letterSpacing: '0.1em' }}>VS</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: clr.bg, border: `1.5px solid ${clr.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: '0.65rem', fontWeight: '900', color: clr.slate }}>
              {away.short?.slice(0, 3)}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: '900', color: clr.dark }}>{away.short}</div>
            <div style={{ fontSize: '0.6rem', color: clr.faint, fontWeight: '600' }}>AWAY</div>
            {f.completed && f.winnerId === f.awayTeamId && <div style={{ fontSize: '0.6rem', color: clr.green, fontWeight: '800', marginTop: '3px' }}>WON</div>}
          </div>
        </div>
        {showActions && !f.completed && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button onClick={() => onPlayMatch(f.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '11px', fontSize: '0.75rem', fontWeight: '800', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg,${clr.blue},${clr.blueMid})`, color: 'white', cursor: 'pointer', letterSpacing: '0.05em', boxShadow: '0 3px 10px rgba(29,78,216,0.25)' }}>
              <Play size={12} fill="white" /> PLAY
            </button>
            <button onClick={() => onSimulateMatch(f.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '11px', fontSize: '0.75rem', fontWeight: '800', borderRadius: '10px', border: `1.5px solid ${clr.border}`, background: clr.white, color: clr.muted, cursor: 'pointer', letterSpacing: '0.05em' }}>
              <FastForward size={12} /> SIM
            </button>
          </div>
        )}
      </div>
    )
  }

  /* ─── stat leaderboard row ─── */
  const LeaderRow = ({ rank, name, team, value, color }: { rank: number; name: string; team: string; value: React.ReactNode; color: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', borderBottom: `1px solid ${clr.borderLight}` }}>
      <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: rank === 1 ? clr.goldLight : clr.bg, border: `1px solid ${rank === 1 ? clr.goldBorder : clr.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: '900', color: rank === 1 ? clr.amber : clr.faint, flexShrink: 0 }}>{rank}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: '800', color: clr.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
        <div style={{ fontSize: '0.62rem', color: clr.faint, fontWeight: '700' }}>{team}</div>
      </div>
      <div style={{ fontSize: '1rem', fontWeight: '900', color, flexShrink: 0 }}>{value}</div>
    </div>
  )

  /* ─── overview tab ─── */
  const OverviewTab = () => (
    <div style={{ display: 'grid', gap: '18px' }}>
      {/* quick summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {[
          { label: 'Matches Played', value: completed.length, icon: <CheckCircle2 size={16} color={clr.green} />, bg: clr.greenLight, border: clr.greenBorder },
          { label: 'Remaining', value: upcoming.length, icon: <Clock size={16} color={clr.blue} />, bg: clr.blueLight, border: clr.blueBorder },
          { label: 'Teams', value: state.teams.length, icon: <Users size={16} color={clr.purple} />, bg: clr.purpleLight, border: clr.purpleBorder },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '14px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: '900', color: clr.dark, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.62rem', fontWeight: '700', color: clr.muted, marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <MVPLeaderboard />
      <StandingsTable />

      {/* Recent results */}
      {completed.length > 0 && (
        <div style={card()}>
          {sectionHead('Recent Results', clr.green)}
          <div style={{ padding: '14px', display: 'grid', gap: '8px' }}>
            {completed.slice(-4).reverse().map(f => <FixtureCard key={f.id} f={f} showActions={false} />)}
          </div>
        </div>
      )}
    </div>
  )

  /* ─── fixtures tab ─── */
  const FixturesTab = () => (
    <div style={{ display: 'grid', gap: '18px' }}>
      {upcoming.length > 0 && (
        <div style={card()}>
          {sectionHead('Upcoming Fixtures', clr.blue, onSimulateToUserMatch && (
            <button onClick={onSimulateToUserMatch} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: `1.5px solid ${clr.blueBorder}`, background: clr.blueLight, color: clr.blue, fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
              <FastForward size={11} /> SIM TO MY MATCH
            </button>
          ))}
          <div style={{ padding: '14px', display: 'grid', gap: '8px' }}>
            {upcoming.map(f => <FixtureCard key={f.id} f={f} />)}
          </div>
          {upcoming.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: clr.faint, fontSize: '0.85rem', fontWeight: '600' }}>All fixtures completed!</div>
          )}
        </div>
      )}
      {completed.length > 0 && (
        <div style={card()}>
          {sectionHead('Completed', clr.green)}
          <div style={{ padding: '14px', display: 'grid', gap: '8px' }}>
            {completed.slice().reverse().map(f => <FixtureCard key={f.id} f={f} showActions={false} />)}
          </div>
        </div>
      )}
    </div>
  )

  /* ─── stats tab ─── */
  const StatsTab = () => {
    if (!state.stats) return <div style={{ textAlign: 'center', padding: '60px', color: clr.faint, fontWeight: '600' }}>Stats will appear once matches are played.</div>
    const { topScorers, topWicketTakers, topSixHitters, bestEconomies, bestStrikeRates, mvpCandidates, playerStats } = state.stats
    return (
      <div style={{ display: 'grid', gap: '18px' }}>
        {/* Orange + Purple cap */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          <div style={card()}>
            {sectionHead('Orange Cap — Top Scorers', '#f97316')}
            <div>
              {topScorers.slice(0, 5).map((p, i) => (
                <LeaderRow key={p.id} rank={i + 1} name={p.name} team={p.team} value={<>{p.runs} <span style={{ fontSize: '0.65rem', color: clr.faint, fontWeight: '500' }}>runs</span></>} color="#f97316" />
              ))}
            </div>
          </div>
          <div style={card()}>
            {sectionHead('Purple Cap — Top Wickets', clr.purple)}
            <div>
              {topWicketTakers.slice(0, 5).map((p, i) => (
                <LeaderRow key={p.id} rank={i + 1} name={p.name} team={p.team} value={<>{p.wickets} <span style={{ fontSize: '0.65rem', color: clr.faint, fontWeight: '500' }}>wkts</span></>} color={clr.purple} />
              ))}
            </div>
          </div>
        </div>

        {/* Three mini leaderboards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {[
            { title: 'Most Sixes', accent: clr.amber, data: topSixHitters.slice(0, 3).map(p => ({ id: p.id, name: p.name, team: p.team, val: `${p.sixes} 6s` })) },
            { title: 'Best Economy', accent: clr.green, data: bestEconomies.slice(0, 3).map(p => ({ id: p.id, name: p.name, team: p.team, val: p.economy.toFixed(2) })) },
            { title: 'Best Strike Rate', accent: clr.red, data: bestStrikeRates.slice(0, 3).map(p => ({ id: p.id, name: p.name, team: p.team, val: p.strikeRate.toFixed(1) })) },
          ].map(sec => (
            <div key={sec.title} style={card()}>
              {sectionHead(sec.title, sec.accent)}
              <div>
                {sec.data.map((p, i) => (
                  <LeaderRow key={p.id} rank={i + 1} name={p.name} team={p.team} value={p.val} color={sec.accent} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* All-round performers */}
        <div style={card()}>
          {sectionHead('Top Performers — All Round', clr.blue)}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
              <thead>
                <tr style={{ background: clr.bg, borderBottom: `1px solid ${clr.border}` }}>
                  {['Player', 'Runs', 'Balls', 'SR', 'Wkts', 'Econ', 'Pts'].map((h, i) => (
                    <th key={h} style={{ padding: i === 0 ? '10px 10px 10px 16px' : '10px', textAlign: i > 0 ? 'center' : 'left', fontSize: '0.6rem', fontWeight: '800', color: clr.faint, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mvpCandidates.slice(0, 10).map((p, idx) => {
                  const s = playerStats[p.id]
                  if (!s) return null
                  const sr = s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(1) : '–'
                  const econ = s.ballsBowled > 0 ? (s.runsConceded / (s.ballsBowled / 6)).toFixed(2) : '–'
                  return (
                    <tr key={p.id} style={{ background: idx % 2 === 0 ? clr.white : '#fafbfc', borderBottom: `1px solid ${clr.borderLight}` }}>
                      <td style={{ padding: '13px 10px 13px 16px' }}>
                        <div style={{ fontWeight: '800', fontSize: '0.85rem', color: clr.dark }}>{p.name}</div>
                        <div style={{ fontSize: '0.62rem', color: clr.blue, fontWeight: '700' }}>{p.team}</div>
                      </td>
                      <td style={{ padding: '13px 10px', textAlign: 'center', fontWeight: '700', color: clr.dark, fontSize: '0.82rem' }}>{s.runs}</td>
                      <td style={{ padding: '13px 10px', textAlign: 'center', color: clr.muted, fontSize: '0.82rem' }}>{s.balls}</td>
                      <td style={{ padding: '13px 10px', textAlign: 'center', fontWeight: '700', color: clr.muted, fontSize: '0.82rem' }}>{sr}</td>
                      <td style={{ padding: '13px 10px', textAlign: 'center', fontWeight: '800', color: s.wickets > 0 ? clr.purple : clr.faint, fontSize: '0.82rem' }}>{s.wickets}</td>
                      <td style={{ padding: '13px 10px', textAlign: 'center', color: clr.muted, fontSize: '0.82rem' }}>{econ}</td>
                      <td style={{ padding: '13px 16px 13px 10px', textAlign: 'center', fontWeight: '900', color: clr.blue, fontSize: '0.88rem' }}>{Math.round(p.points)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '14px 12px', fontFamily: 'system-ui,-apple-system,sans-serif', background: clr.bg, minHeight: '100vh' }}>
      {state.status === 'COMPLETED' && <ChampionBanner />}
      <Header />
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'fixtures' && <FixturesTab />}
      {activeTab === 'stats' && <StatsTab />}
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        button:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }
        button:active:not(:disabled) { transform: translateY(0); }
        @media (max-width: 480px) {
          table { font-size: 0.78rem; }
        }
      `}</style>
    </div>
  )
}