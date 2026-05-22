import React, { useState } from 'react'
import { MatchState } from '../state/types'
import { Scoreboard } from './Scoreboard'
import { OverHistory } from './OverHistory'
import { CommentaryBox } from './CommentaryBox'
import { Controls } from './Controls'
import { DetailedScorecard } from './DetailedScorecard'
import { Action } from '../state/reducer'
import { ArrowLeft, Activity, FileText, Clock } from 'lucide-react'

interface Props {
  state: MatchState
  dispatch: React.Dispatch<Action>
  appDispatch: React.Dispatch<any>
  onExit: () => void
}

/* ─────────────────────────── shared overlay wrapper ──────────────────────── */
const Overlay = ({ children, zIndex = 1000 }: { children: React.ReactNode; zIndex?: number }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex,
    background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
  }}>
    {children}
  </div>
)

const ModalCard = ({ children, maxWidth = '460px' }: { children: React.ReactNode; maxWidth?: string }) => (
  <div style={{
    background: 'white', borderRadius: '24px', padding: '32px', width: '100%', maxWidth,
    boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid #e2e8f0',
    maxHeight: '90vh', overflowY: 'auto'
  }}>
    {children}
  </div>
)

export function MatchView({ state, dispatch, appDispatch, onExit }: Props) {
  const [viewMode, setViewMode] = useState<'live' | 'scorecard'>('live')
  const inn = state.currentInnings === 1 ? state.innings1 : state.innings2
  const isUserBatting = state.userTeamId === inn?.battingTeamId

  /* ───────── opener selection ───────── */
  const renderSelectionModal = () => {
    if (state.selectionStep !== 'OPENERS' || !inn || !isUserBatting) return null
    const batTeam = state.homeTeam.id === inn.battingTeamId ? state.homeTeam : state.awayTeam
    const [selected, setSelected] = React.useState<string[]>([])
    const toggle = (id: string) => {
      if (selected.includes(id)) setSelected(selected.filter(i => i !== id))
      else if (selected.length < 2) setSelected([...selected, id])
    }
    return (
      <Overlay zIndex={1300}>
        <ModalCard maxWidth="480px">
          <div style={{ marginBottom: '4px', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.15em', color: '#1d4ed8', textTransform: 'uppercase' }}>INNINGS START</div>
          <h2 style={{ margin: '0 0 6px', fontWeight: '900', fontSize: '1.5rem', color: '#0f172a' }}>Select Openers</h2>
          <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.88rem', fontWeight: '500' }}>Pick your striker and non-striker to begin the innings.</p>
          <div style={{ display: 'grid', gap: '8px', marginBottom: '24px', maxHeight: '360px', overflowY: 'auto' }}>
            {batTeam.players.map(p => {
              const isSel = selected.includes(p.id)
              const isFirst = selected[0] === p.id
              return (
                <button key={p.id} onClick={() => toggle(p.id)} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px', borderRadius: '12px', border: `2px solid ${isSel ? '#1d4ed8' : '#e2e8f0'}`,
                  background: isSel ? '#eff6ff' : 'white', cursor: 'pointer', transition: 'all 0.15s ease'
                }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.92rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>{p.role} · Rating {p.battingRating}</div>
                  </div>
                  {isSel && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#1d4ed8', background: '#dbeafe', padding: '2px 8px', borderRadius: '99px' }}>
                        {isFirst ? 'STRIKER' : 'NON-STR'}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          <button
            disabled={selected.length !== 2}
            onClick={() => dispatch({ type: 'SELECT_OPENERS', payload: { strikerId: selected[0], nonStrikerId: selected[1] } })}
            style={{
              width: '100%', padding: '15px', fontSize: '0.88rem', fontWeight: '800',
              borderRadius: '12px', border: 'none', cursor: selected.length === 2 ? 'pointer' : 'not-allowed',
              background: selected.length === 2 ? 'linear-gradient(135deg,#1d4ed8,#2563eb)' : '#e2e8f0',
              color: selected.length === 2 ? 'white' : '#94a3b8',
              boxShadow: selected.length === 2 ? '0 4px 14px rgba(29,78,216,0.3)' : 'none',
              letterSpacing: '0.06em', transition: 'all 0.2s ease'
            }}
          >
            START INNINGS ({selected.length}/2)
          </button>
        </ModalCard>
      </Overlay>
    )
  }

  /* ───────── toss ───────── */
  const renderTossModal = () => {
    if (state.tossStep === 'COMPLETED' || !state.tossStep) return null
    const isWinner = state.toss?.winnerTeamId === state.userTeamId
    return (
      <Overlay zIndex={1200}>
        <ModalCard maxWidth="420px">
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🪙</div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.15em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>THE TOSS</div>

            {state.tossStep === 'PICK_SIDE' ? (
              <>
                <h2 style={{ margin: '0 0 8px', fontWeight: '900', fontSize: '1.5rem', color: '#0f172a' }}>Call the Toss</h2>
                <p style={{ color: '#64748b', marginBottom: '28px', fontSize: '0.85rem' }}>What's your call?</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {['Heads', 'Tails'].map(side => (
                    <button key={side} onClick={() => dispatch({ type: 'PERFORM_TOSS', payload: side as any })} style={{
                      padding: '18px', fontSize: '0.9rem', fontWeight: '800', borderRadius: '14px',
                      border: '2px solid #e2e8f0', background: 'white', color: '#0f172a',
                      cursor: 'pointer', transition: 'all 0.15s ease', letterSpacing: '0.05em'
                    }}>
                      {side === 'Heads' ? '🪙 HEADS' : '🔄 TAILS'}
                    </button>
                  ))}
                </div>
              </>
            ) : isWinner ? (
              <>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669', background: '#f0fdf4', padding: '6px 16px', borderRadius: '99px', display: 'inline-block', marginBottom: '12px', border: '1px solid #bbf7d0' }}>YOU WON THE TOSS!</div>
                <h2 style={{ margin: '0 0 6px', fontWeight: '900', fontSize: '1.4rem', color: '#0f172a' }}>Choose Your Option</h2>
                <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.85rem' }}>What would you like to do first?</p>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <button onClick={() => dispatch({ type: 'CHOOSE_TOSS_DECISION', payload: 'Bat' })} style={{ padding: '16px', fontSize: '0.88rem', fontWeight: '800', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: 'white', cursor: 'pointer', boxShadow: '0 4px 14px rgba(29,78,216,0.3)', letterSpacing: '0.05em' }}>
                    🏏 BAT FIRST
                  </button>
                  <button onClick={() => dispatch({ type: 'CHOOSE_TOSS_DECISION', payload: 'Bowl' })} style={{ padding: '16px', fontSize: '0.88rem', fontWeight: '800', borderRadius: '12px', border: '2px solid #e2e8f0', background: 'white', color: '#0f172a', cursor: 'pointer', letterSpacing: '0.05em' }}>
                    🎳 BOWL FIRST
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#dc2626', background: '#fef2f2', padding: '6px 16px', borderRadius: '99px', display: 'inline-block', marginBottom: '12px', border: '1px solid #fecaca' }}>OPPONENT WON</div>
                <h2 style={{ margin: '0 0 6px', fontWeight: '900', fontSize: '1.3rem', color: '#0f172a' }}>Toss Lost</h2>
                <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.85rem' }}>They decided to <strong>{state.toss?.decision.toLowerCase()}</strong> first.</p>
                <button onClick={() => dispatch({ type: 'CHOOSE_TOSS_DECISION', payload: state.toss?.decision as any })} style={{ width: '100%', padding: '15px', fontSize: '0.88rem', fontWeight: '800', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: 'white', cursor: 'pointer', boxShadow: '0 4px 14px rgba(29,78,216,0.3)', letterSpacing: '0.06em' }}>
                  START MATCH →
                </button>
              </>
            )}
          </div>
        </ModalCard>
      </Overlay>
    )
  }

  /* ───────── next batsman ───────── */
  const renderBatsmanModal = () => {
    if (!state.waitingForBatsman || !inn || !isUserBatting) return null
    const batTeam = state.homeTeam.id === inn.battingTeamId ? state.homeTeam : state.awayTeam
    const outIds = inn.fallOfWickets.map(f => f.batsmanId)
    const remaining = batTeam.players.filter(p => !outIds.includes(p.id) && p.id !== inn.strikerId && p.id !== inn.nonStrikerId)
    return (
      <Overlay zIndex={1000}>
        <ModalCard maxWidth="380px">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef2f2', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', border: '2px solid #fecaca' }}>🏏</div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.12em', color: '#dc2626', textTransform: 'uppercase', marginBottom: '6px' }}>WICKET!</div>
            <h3 style={{ margin: '0 0 4px', fontWeight: '900', fontSize: '1.2rem', color: '#0f172a' }}>Next Batsman</h3>
            <p style={{ color: '#64748b', fontSize: '0.82rem' }}>Select who comes in next</p>
          </div>
          <button
            onClick={() => dispatch({ type: 'AUTO_SELECT_BATSMAN' })}
            style={{ width: '100%', padding: '13px', fontSize: '0.82rem', fontWeight: '800', borderRadius: '10px', border: '2px solid #1d4ed8', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', marginBottom: '14px', letterSpacing: '0.05em' }}
          >
            ↓ NEXT IN LINEUP
          </button>
          <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>OR SELECT MANUALLY</div>
          <div style={{ display: 'grid', gap: '6px' }}>
            {remaining.slice(0, 6).map(p => (
              <button key={p.id} onClick={() => dispatch({ type: 'SELECT_NEXT_BATSMAN', payload: p.id })} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                background: 'white', cursor: 'pointer', transition: 'all 0.15s ease'
              }}>
                <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>
                  {p.name} <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '500' }}>({p.role})</span>
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#1d4ed8' }}>{p.battingRating}</span>
              </button>
            ))}
          </div>
        </ModalCard>
      </Overlay>
    )
  }

  /* ───────── match finished ───────── */
  const renderMatchFinished = () => {
    if (!state.matchCompleted) return null
    return (
      <Overlay zIndex={1100}>
        <ModalCard maxWidth="520px">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🏆</div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.15em', color: '#1d4ed8', textTransform: 'uppercase', marginBottom: '8px' }}>MATCH COMPLETE</div>
            <h1 style={{ margin: '0 0 8px', fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>
              {state.winnerId
                ? `${(state.homeTeam.id === state.winnerId ? state.homeTeam : state.awayTeam).name} Win!`
                : 'Match Tied!'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600', marginBottom: '28px' }}>{state.victoryMargin || 'Both teams finished level'}</p>
            <div style={{ display: 'grid', gap: '10px' }}>
              <button onClick={() => setViewMode('scorecard')} style={{ padding: '14px', fontSize: '0.88rem', fontWeight: '800', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: 'white', cursor: 'pointer', boxShadow: '0 4px 14px rgba(29,78,216,0.28)', letterSpacing: '0.05em' }}>
                VIEW SCORECARD
              </button>
              <button onClick={onExit} style={{ padding: '13px', fontSize: '0.85rem', fontWeight: '700', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', letterSpacing: '0.04em' }}>
                Return to Dashboard
              </button>
            </div>
          </div>
        </ModalCard>
      </Overlay>
    )
  }

  /* ───────── nav bar ───────── */
  const NavBar = () => (
    <div style={{
      background: 'white', borderRadius: '18px', border: '1px solid #e2e8f0',
      padding: '12px 16px', marginBottom: '20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flexWrap: 'wrap'
    }}>
      <button onClick={onExit} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700', transition: 'all 0.15s ease', whiteSpace: 'nowrap' }}>
        <ArrowLeft size={14} /> BACK
      </button>

      <div style={{ textAlign: 'center', flex: 1, minWidth: '140px' }}>
        <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.3px' }}>
          {state.homeTeam.short} <span style={{ color: '#cbd5e1', fontWeight: '300', margin: '0 4px' }}>vs</span> {state.awayTeam.short}
        </div>
        <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#1d4ed8', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '2px' }}>
          {state.config.format} · {state.config.overs} Overs
        </div>
      </div>

      <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px', gap: '2px' }}>
        {[
          { key: 'live', label: 'Live', icon: <Activity size={12} /> },
          { key: 'scorecard', label: 'Card', icon: <FileText size={12} /> }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setViewMode(tab.key as any)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px',
              borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '800',
              background: viewMode === tab.key ? 'white' : 'transparent',
              color: viewMode === tab.key ? '#1d4ed8' : '#64748b',
              boxShadow: viewMode === tab.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease', letterSpacing: '0.04em', whiteSpace: 'nowrap'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 12px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Modals */}
      {renderTossModal()}
      {renderSelectionModal()}
      {renderBatsmanModal()}
      {renderMatchFinished()}

      {/* Nav */}
      <NavBar />

      {/* Content */}
      {viewMode === 'live' && inn ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,0.7fr)',
          gap: '16px',
          alignItems: 'start'
        }}
          className="match-grid"
        >
          {/* Main column */}
          <div style={{ display: 'grid', gap: '16px' }}>
            <Scoreboard state={state} matchDispatch={dispatch} appDispatch={appDispatch} />
            <Controls state={state} dispatch={dispatch} />
          </div>

          {/* Side column */}
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Over history panel */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '3px', height: '14px', background: '#1d4ed8', borderRadius: '2px' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.12em', color: '#475569', textTransform: 'uppercase' }}>Over History</span>
              </div>
              <div style={{ padding: '12px 16px' }}>
                <OverHistory state={state} />
              </div>
            </div>

            {/* Commentary */}
            <CommentaryBox state={state} />
          </div>
        </div>
      ) : viewMode === 'scorecard' ? (
        <DetailedScorecard state={state} />
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🪙</div>
          <div style={{ fontSize: '1rem', fontWeight: '700' }}>Waiting for toss...</div>
        </div>
      )}

      {/* Responsive CSS injected once */}
      <style>{`
        @media (max-width: 768px) {
          .match-grid {
            grid-template-columns: 1fr !important;
          }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        button:hover:not(:disabled) { opacity: 0.88; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
