import React from 'react'
import { MatchState } from '../state/types'

const ballStyle = (o: string): React.CSSProperties => {
  const base: React.CSSProperties = {
    width: '26px', height: '26px', borderRadius: '50%', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem',
    fontWeight: '800', flexShrink: 0, lineHeight: 1
  }
  if (o === 'W') return { ...base, background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fecaca' }
  if (o === '6') return { ...base, background: '#fef3c7', color: '#d97706', border: '1.5px solid #fde68a' }
  if (o === '4') return { ...base, background: '#eff6ff', color: '#2563eb', border: '1.5px solid #bfdbfe' }
  if (o === 'Wd' || o === 'Nb') return { ...base, background: '#f5f3ff', color: '#7c3aed', border: '1.5px solid #ddd6fe' }
  if (o === '0') return { ...base, background: '#f8fafc', color: '#94a3b8', border: '1.5px solid #e2e8f0' }
  return { ...base, background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #bbf7d0' }
}

export function OverHistory({ state }: { state: MatchState }) {
  const inn = state.currentInnings === 1 ? state.innings1 : state.innings2
  const outcomes = inn?.overOutcomes ?? []

  return (
    <div>
      {outcomes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600' }}>
          No overs bowled yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
          {[...outcomes].reverse().map((over, ridx) => {
            const idx = outcomes.length - 1 - ridx
            const overRuns = over.reduce((acc, o) => {
              if (o === 'W' || o === 'Wd' || o === 'Nb') return acc
              const n = parseInt(o)
              return acc + (isNaN(n) ? 0 : n)
            }, 0)
            const isLatest = ridx === 0
            return (
              <div
                key={idx}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', borderRadius: '10px',
                  background: isLatest ? '#eff6ff' : 'transparent',
                  border: isLatest ? '1px solid #bfdbfe' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '0.6rem', fontWeight: '800', color: isLatest ? '#1d4ed8' : '#94a3b8', width: '28px', flexShrink: 0, letterSpacing: '0.02em' }}>
                  Ov {idx + 1}
                </span>
                <div style={{ display: 'flex', gap: '3px', flex: 1, flexWrap: 'wrap' }}>
                  {over.map((o, i) => (
                    <span key={i} style={ballStyle(o)}>{o === 'Wd' ? 'W̃' : o === 'Nb' ? 'NB' : o}</span>
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isLatest ? '#1d4ed8' : '#475569', flexShrink: 0, minWidth: '28px', textAlign: 'right' }}>
                  {overRuns}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
