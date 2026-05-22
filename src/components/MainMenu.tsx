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
  ]

  return (
    <div className="main-menu" style={{ textAlign: 'center', maxWidth: '1000px', margin: '40px auto' }}>
      <div style={{ marginBottom: '64px' }}>
        <h1 style={{
          fontSize: '4.5rem',
          fontWeight: '900',
          color: 'var(--primary)',
          letterSpacing: '-3px',
          margin: '0 0 16px 0',
          textTransform: 'uppercase'
        }}>
          CricMaster<span style={{ color: 'var(--accent)' }}>Pro</span>
        </h1>
        <div style={{ display: 'inline-block', padding: '8px 24px', background: 'var(--primary-glow)', borderRadius: '100px', color: 'var(--primary)', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
          ADVANCED GAMEPLAY EDITION 2026
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {modes.map(mode => (
          <button
            key={mode.id}
            className="card mode-card"
            onClick={() => onSelectMode(mode.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '40px',
              textAlign: 'left',
              gap: '20px',
              cursor: 'pointer',
              border: '1px solid var(--card-border)',
              background: 'white',
              boxShadow: 'var(--shadow-sm)',
              borderRadius: '24px',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ 
              color: 'var(--primary)', 
              background: 'var(--primary-glow)', 
              width: '64px', 
              height: '64px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: '16px',
              marginBottom: '8px'
            }}>
              {mode.icon}
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', fontWeight: '900', color: 'var(--text)' }}>{mode.label}</h3>
              <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.6', fontWeight: '500' }}>{mode.desc}</p>
            </div>
            <div style={{ position: 'absolute', bottom: '20px', right: '32px', fontSize: '1.5rem', opacity: 0.1, fontWeight: '900' }}>
               {mode.id.toUpperCase()}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
