import React, { useEffect, useRef } from 'react'
import { MatchState } from '../state/types'
import { MessageSquare } from 'lucide-react'

function getCommentaryStyle(text: string): { accent: string; bg: string; dot: string } {
  const lower = text.toLowerCase()
  if (lower.includes('wicket') || lower.includes('out') || lower.includes('caught') || lower.includes('bowled') || lower.includes('lbw'))
    return { accent: '#dc2626', bg: '#fef2f2', dot: '#ef4444' }
  if (lower.includes('six') || lower.includes('6'))
    return { accent: '#d97706', bg: '#fffbeb', dot: '#f59e0b' }
  if (lower.includes('four') || lower.includes('boundary') || lower.includes('4'))
    return { accent: '#2563eb', bg: '#eff6ff', dot: '#3b82f6' }
  if (lower.includes('maiden') || lower.includes('dot'))
    return { accent: '#7c3aed', bg: '#f5f3ff', dot: '#8b5cf6' }
  return { accent: '#475569', bg: '#f8fafc', dot: '#94a3b8' }
}

export function CommentaryBox({ state }: { state: MatchState }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [state.commentary.length])

  const recent = [...state.commentary].reverse().slice(0, 20).reverse()

  return (
    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', height: '100%', minHeight: '260px' }}>
      <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#1d4ed8', borderRadius: '2px' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.12em', color: '#475569', textTransform: 'uppercase' }}>Commentary</span>
        </div>
        <span style={{ fontSize: '0.6rem', fontWeight: '700', color: '#94a3b8' }}>{state.commentary.length} events</span>
      </div>

      <div
        ref={ref}
        style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '5px', scrollBehavior: 'smooth' }}
      >
        {state.commentary.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#cbd5e1' }}>
            <MessageSquare size={28} style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>Match commentary will appear here</div>
          </div>
        ) : (
          state.commentary.map((c, i) => {
            const isLatest = i === state.commentary.length - 1
            const style = getCommentaryStyle(c)
            return (
              <div
                key={i}
                style={{
                  padding: '8px 12px', borderRadius: '10px',
                  background: isLatest ? style.bg : 'transparent',
                  borderLeft: isLatest ? `3px solid ${style.accent}` : '3px solid transparent',
                  fontSize: '0.78rem', fontWeight: isLatest ? '600' : '500',
                  color: isLatest ? '#0f172a' : '#64748b',
                  lineHeight: '1.5', transition: 'all 0.3s ease'
                }}
              >
                {isLatest && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: style.dot, display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} />
                )}
                {c}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
