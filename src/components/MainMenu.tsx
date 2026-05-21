import React from 'react'
import { GameMode } from '../state/types'
import { Zap, Trophy, Globe, Swords, User } from 'lucide-react'

interface Props {
  onSelectMode: (mode: GameMode) => void
}

export function MainMenu({ onSelectMode }: Props) {
  const modes: { id: GameMode; label: string; desc: string; icon: React.ReactNode; primary?: boolean }[] = [
    { id: 'Quick', label: 'Quick Match', desc: 'Fast-paced single match action', icon: <Zap size={32} />, primary: true },
    { id: 'IPL', label: 'IPL Season', desc: 'Auction, squad building, and T20 glory', icon: <Trophy size={32} /> },
    { id: 'WorldCup', label: 'World Cup', desc: 'Represent your nation on the big stage', icon: <Globe size={32} /> },
    { id: 'Series', label: 'Bilateral Series', desc: 'Engage in a competitive multi-match series', icon: <Swords size={32} /> },
    { id: 'Career', label: 'Career Mode', desc: 'Start as a rookie and become a legend', icon: <User size={32} /> },
  ]

  return (
    <div className="main-menu" style={{ textAlign: 'center', maxWidth: '800px', margin: '60px auto' }}>
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '900',
          color: 'var(--primary)',
          letterSpacing: '-2px',
          margin: '0 0 12px 0'
        }}>
          CricMaster<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>The ultimate professional cricket management simulation.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {modes.map(mode => (
          <button
            key={mode.id}
            className={`card ${mode.primary ? 'primary' : ''}`}
            onClick={() => onSelectMode(mode.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '32px',
              textAlign: 'left',
              gap: '16px',
              cursor: 'pointer',
              border: '1px solid var(--card-border)',
              background: mode.primary ? 'var(--primary-glow)' : 'var(--bg-glass)',
              backdropFilter: 'blur(10px)',
              boxShadow: 'var(--shadow-md)',
              borderRadius: '16px',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ color: mode.primary ? 'var(--primary)' : 'var(--text-muted)' }}>{mode.icon}</div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '800' }}>{mode.label}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{mode.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
