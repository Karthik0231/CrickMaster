import React, { useState } from 'react'
import { MatchState, Team, Player, Strategy } from '../state/types'
import { Action } from '../state/reducer'
import { Scoreboard } from './Scoreboard'
import { Controls } from './Controls'
import { CommentaryBox } from './CommentaryBox'
import { DetailedScorecard } from './DetailedScorecard'
import { Trophy, Play, Clipboard, BarChart2, Info, User, ArrowLeft } from 'lucide-react'

interface Props {
  state: MatchState
  dispatch: React.Dispatch<Action>
  appDispatch: React.Dispatch<any>
  onExit: () => void
}

type TabMode = 'game' | 'scorecard' | 'stats' | 'info'

export function MatchView({ state, dispatch, appDispatch, onExit }: Props) {
  const [activeTab, setActiveTab] = useState<TabMode>('game')
  const [selectedOpeners, setSelectedOpeners] = useState<string[]>([])
  const inn = state.currentInnings === 1 ? state.innings1 : state.innings2
  const isUserBatting = state.userTeamId === inn?.battingTeamId

  const handleBatsmanSelect = (pid: string) => {
    dispatch({ type: 'SELECT_NEXT_BATSMAN', payload: pid })
  }

  const renderSelectionModal = () => {
    if (state.selectionStep !== 'OPENERS' || !inn || !isUserBatting) return null

    const batTeam = state.homeTeam.id === inn.battingTeamId ? state.homeTeam : state.awayTeam

    const togglePlayer = (id: string) => {
      if (selectedOpeners.includes(id)) setSelectedOpeners(selectedOpeners.filter(i => i !== id))
      else if (selectedOpeners.length < 2) setSelectedOpeners([...selectedOpeners, id])
    }

    return (
      <div className="modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(16px)',
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '24px', boxShadow: 'var(--shadow-lg)' }}>
          <h2 style={{ marginBottom: '8px', fontWeight: '900', color: 'var(--primary)', fontSize: '1.2rem' }}>SELECT OPENERS</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.85rem' }}>Pick your striker and non-striker to start the innings.</p>

          <div style={{ display: 'grid', gap: '8px', maxHeight: '50vh', overflowY: 'auto', marginBottom: '24px' }}>
            {batTeam.players.map(p => {
              const isSelected = selectedOpeners.includes(p.id)
              return (
                <div
                  key={p.id}
                  onClick={() => togglePlayer(p.id)}
                  style={{ 
                    display: 'flex', justifyContent: 'space-between', padding: '12px',
                    background: isSelected ? 'var(--primary-glow)' : 'var(--bg)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--card-border)'}`,
                    borderRadius: '10px', cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.role} • Rating: {p.battingRating}</div>
                  </div>
                  {isSelected && <span style={{ color: 'var(--primary)', fontWeight: '900' }}>✓</span>}
                </div>
              )
            })}
          </div>

          <button
            className="primary"
            style={{ width: '100%', padding: '14px', borderRadius: '10px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800' }}
            disabled={selectedOpeners.length !== 2}
            onClick={() => dispatch({ type: 'SELECT_OPENERS', payload: { strikerId: selectedOpeners[0], nonStrikerId: selectedOpeners[1] } })}
          >
            START INNINGS ({selectedOpeners.length}/2)
          </button>
        </div>
      </div>
    )
  }

  const renderTossModal = () => {
    if (state.tossStep === 'COMPLETED' || !state.tossStep) return null
    const isWinner = state.toss?.winnerTeamId === state.userTeamId

    return (
      <div className="modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 66, 165, 0.95)', backdropFilter: 'blur(20px)',
        zIndex: 1900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '32px', background: 'white' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '900', letterSpacing: '0.2em', marginBottom: '12px' }}>THE TOSS</div>
          
          {state.tossStep === 'PICK_SIDE' ? (
            <>
              <h2 style={{ marginBottom: '24px', fontWeight: '900' }}>Heads or Tails?</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button style={{ padding: '20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800' }} onClick={() => dispatch({ type: 'PERFORM_TOSS', payload: 'Heads' })}>HEADS</button>
                <button style={{ padding: '20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800' }} onClick={() => dispatch({ type: 'PERFORM_TOSS', payload: 'Tails' })}>TAILS</button>
              </div>
            </>
          ) : (
            <>
              {isWinner ? (
                <>
                  <h2 style={{ color: 'var(--success)', marginBottom: '8px', fontWeight: '900' }}>YOU WON THE TOSS!</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>What would you like to do first?</p>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <button style={{ padding: '16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800' }} onClick={() => dispatch({ type: 'CHOOSE_TOSS_DECISION', payload: 'Bat' })}>BAT FIRST</button>
                    <button style={{ padding: '16px', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800' }} onClick={() => dispatch({ type: 'CHOOSE_TOSS_DECISION', payload: 'Bowl' })}>BOWL FIRST</button>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ color: 'var(--danger)', marginBottom: '8px', fontWeight: '900' }}>OPPONENT WON THE TOSS</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>They decided to {state.toss?.decision.toLowerCase()} first.</p>
                  <button style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800' }} onClick={() => dispatch({ type: 'CHOOSE_TOSS_DECISION', payload: state.toss?.decision as any })}>
                    CONTINUE
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  const renderBatsmanModal = () => {
    if (!state.waitingForBatsman || !inn || !isUserBatting) return null
    const batTeam = state.homeTeam.id === inn.battingTeamId ? state.homeTeam : state.awayTeam
    const outIds = inn.fallOfWickets.map(f => f.batsmanId)
    const remaining = batTeam.players.filter(p => !outIds.includes(p.id) && p.id !== inn.strikerId && p.id !== inn.nonStrikerId)

    return (
      <div className="modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(16px)',
        zIndex: 1800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '8px', fontWeight: '900' }}>WICKET!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.85rem' }}>Select next batsman to continue</p>

          <button
            style={{ width: '100%', padding: '14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', marginBottom: '16px', fontWeight: '800' }}
            onClick={() => dispatch({ type: 'AUTO_SELECT_BATSMAN' })}
          >
            NEXT IN LINEUP
          </button>

          <div style={{ display: 'grid', gap: '8px' }}>
            {remaining.slice(0, 4).map(p => (
              <div
                key={p.id}
                onClick={() => handleBatsmanSelect(p.id)}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', padding: '12px',
                  background: 'var(--bg)', border: '1px solid var(--card-border)', borderRadius: '10px', cursor: 'pointer'
                }}
              >
                <span style={{ fontWeight: '700' }}>{p.name}</span>
                <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{p.battingRating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderMatchFinished = () => {
    if (!state.matchCompleted) return null
    return (
      <div className="modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 66, 165, 0.98)', backdropFilter: 'blur(20px)',
        zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '32px' }}>
          <Trophy size={64} color="var(--accent)" style={{ marginBottom: '16px' }} />
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '8px' }}>MATCH FINISHED</h1>
          <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '32px' }}>{state.victoryMargin}</p>

          <div style={{ display: 'grid', gap: '12px' }}>
            <button
              className="primary"
              style={{ width: '100%', padding: '16px', borderRadius: '12px', fontWeight: '800' }}
              onClick={onExit}
            >
              RETURN TO DASHBOARD
            </button>
            <button
              style={{ padding: '14px', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--card-border)', borderRadius: '12px', fontWeight: '700' }}
              onClick={() => setActiveTab('scorecard')}
            >
              VIEW SCORECARD
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="match-container-fixed">
      {renderSelectionModal()}
      {renderTossModal()}
      {renderBatsmanModal()}
      {renderMatchFinished()}

      {/* Fixed Header */}
      <div className="match-header-fixed">
        <button onClick={onExit} style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
          <ArrowLeft size={20} /> <span className="mobile-hide">QUIT</span>
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.8, textTransform: 'uppercase' }}>{state.config.stadium}</div>
          <div style={{ fontSize: '0.85rem', fontWeight: '900' }}>{state.homeTeam.short} vs {state.awayTeam.short}</div>
        </div>
        <div style={{ width: '40px' }}></div> {/* Spacer */}
      </div>

      {/* Tab Navigation */}
      <div className="match-tabs-fixed">
        <button className={`tab-btn-fixed ${activeTab === 'game' ? 'active' : ''}`} onClick={() => setActiveTab('game')}>
          <Play /> GAME
        </button>
        <button className={`tab-btn-fixed ${activeTab === 'scorecard' ? 'active' : ''}`} onClick={() => setActiveTab('scorecard')}>
          <Clipboard /> SCORECARD
        </button>
        <button className={`tab-btn-fixed ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
          <BarChart2 /> STATS
        </button>
        <button className={`tab-btn-fixed ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
          <Info /> INFO
        </button>
      </div>

      {/* Main Content Area */}
      <div className="match-content-fixed">
        {activeTab === 'game' && inn && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <Scoreboard state={state} matchDispatch={dispatch} appDispatch={appDispatch} />
            <CommentaryBox state={state} />
          </div>
        )}

        {activeTab === 'scorecard' && (
          <DetailedScorecard state={state} />
        )}

        {activeTab === 'stats' && (
          <div className="card">
            <h3 style={{ fontWeight: '900', marginBottom: '16px' }}>Match Stats</h3>
            <p style={{ color: 'var(--text-muted)' }}>Detailed statistics will be available soon.</p>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="card">
            <h3 style={{ fontWeight: '900', marginBottom: '16px' }}>Match Information</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Format</span>
                <span style={{ fontWeight: '800' }}>{state.config.format} ({state.config.overs} Overs)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Pitch</span>
                <span style={{ fontWeight: '800' }}>{state.config.pitch}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Boundaries</span>
                <span style={{ fontWeight: '800' }}>{state.config.boundarySize}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Controls for Game Tab */}
      {activeTab === 'game' && !state.matchCompleted && (
        <div className="fixed-bottom-bar">
          <Controls state={state} dispatch={dispatch} />
        </div>
      )}
    </div>
  )
}
