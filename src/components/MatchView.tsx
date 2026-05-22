import React, { useState } from 'react'
import { MatchState } from '../state/types'
import { Scoreboard } from './Scoreboard'
import { OverHistory } from './OverHistory'
import { CommentaryBox } from './CommentaryBox'
import { Controls } from './Controls'
import { DetailedScorecard } from './DetailedScorecard'
import { Action } from '../state/reducer'
import { MobileMatchUI } from './MobileMatchUI'

interface Props {
  state: MatchState
  dispatch: React.Dispatch<Action>
  appDispatch: React.Dispatch<any>
  onExit: () => void
}

export function MatchView({ state, dispatch, appDispatch, onExit }: Props) {
  const [viewMode, setViewMode] = useState<'live' | 'scorecard'>('live')
  const inn = state.currentInnings === 1 ? state.innings1 : state.innings2
  const isUserBatting = state.userTeamId === inn?.battingTeamId

  const isMobile = window.innerWidth <= 768;

  React.useEffect(() => {
    if (isMobile && viewMode === 'live') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobile, viewMode]);

  const handleBatsmanSelect = (pid: string) => {
    dispatch({ type: 'SELECT_NEXT_BATSMAN', payload: pid })
  }

  const renderSelectionModal = () => {
    if (state.selectionStep !== 'OPENERS' || !inn || !isUserBatting) return null

    const batTeam = state.homeTeam.id === inn.battingTeamId ? state.homeTeam : state.awayTeam
    const [selected, setSelected] = useState<string[]>([])

    const togglePlayer = (id: string) => {
      if (selected.includes(id)) setSelected(selected.filter(i => i !== id))
      else if (selected.length < 2) setSelected([...selected, id])
    }

    return (
      <div className="modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)',
        zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '32px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--primary-glow)' }}>
          <h2 style={{ marginBottom: '8px', fontWeight: '900', color: 'var(--primary)' }}>SELECT OPENERS</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontWeight: '600' }}>Pick your striker and non-striker to start the innings.</p>

          <div style={{ display: 'grid', gap: '10px', maxHeight: '400px', overflowY: 'auto', marginBottom: '32px', padding: '4px' }}>
            {batTeam.players.map(p => {
              const isSelected = selected.includes(p.id)
              return (
                <button
                  key={p.id}
                  className={isSelected ? 'primary' : ''}
                  style={{ 
                    justifyContent: 'space-between', 
                    padding: '16px',
                    background: isSelected ? 'var(--primary)' : 'var(--bg-alt)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--card-border)'}`
                  }}
                  onClick={() => togglePlayer(p.id)}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '800' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{p.role} • Rating: {p.battingRating}</div>
                  </div>
                  {isSelected && <span style={{ fontSize: '1.2rem' }}>✓</span>}
                </button>
              )
            })}
          </div>

          <button
            className="primary"
            style={{ width: '100%', padding: '16px' }}
            disabled={selected.length !== 2}
            onClick={() => dispatch({ type: 'SELECT_OPENERS', payload: { strikerId: selected[0], nonStrikerId: selected[1] } })}
          >
            START INNINGS ({selected.length}/2)
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
        background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)',
        zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <div className="card" style={{ maxWidth: '450px', width: '100%', textAlign: 'center', padding: '40px', boxShadow: 'var(--shadow-lg)', border: '2px solid var(--primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '900', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>THE TOSS</div>
          
          {state.tossStep === 'PICK_SIDE' ? (
            <>
              <h2 style={{ marginBottom: '32px', fontWeight: '900' }}>Heads or Tails?</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <button className="primary" style={{ padding: '24px', fontSize: '1.2rem' }} onClick={() => dispatch({ type: 'PERFORM_TOSS', payload: 'Heads' })}>HEADS</button>
                <button className="primary" style={{ padding: '24px', fontSize: '1.2rem' }} onClick={() => dispatch({ type: 'PERFORM_TOSS', payload: 'Tails' })}>TAILS</button>
              </div>
            </>
          ) : (
            <>
              {isWinner ? (
                <>
                  <h2 style={{ color: 'var(--success)', marginBottom: '8px', fontWeight: '900' }}>YOU WON THE TOSS!</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontWeight: '600' }}>What would you like to do first?</p>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <button className="primary" style={{ padding: '20px', fontSize: '1.1rem' }} onClick={() => dispatch({ type: 'CHOOSE_TOSS_DECISION', payload: 'Bat' })}>BAT FIRST</button>
                    <button className="secondary" style={{ padding: '20px', fontSize: '1.1rem' }} onClick={() => dispatch({ type: 'CHOOSE_TOSS_DECISION', payload: 'Bowl' })}>BOWL FIRST</button>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ color: 'var(--danger)', marginBottom: '8px', fontWeight: '900' }}>OPPONENT WON THE TOSS</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontWeight: '600' }}>They have decided to {state.toss?.decision.toLowerCase()} first.</p>
                  <button className="primary" style={{ width: '100%', padding: '20px' }} onClick={() => dispatch({ type: 'CHOOSE_TOSS_DECISION', payload: state.toss?.decision as any })}>
                    START MATCH
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
        background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--primary)' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '8px', fontWeight: '900' }}>WICKET!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontWeight: '500' }}>Select next batsman to continue the innings</p>

          <button
            className="primary"
            style={{ width: '100%', padding: '16px', marginBottom: '16px', fontSize: '1rem', fontWeight: '700' }}
            onClick={() => dispatch({ type: 'AUTO_SELECT_BATSMAN' })}
          >
            NEXT IN LINEUP
          </button>

          <div style={{ marginBottom: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
            Or Select Manually:
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {remaining.slice(0, 5).map(p => (
              <button
                key={p.id}
                className=""
                style={{ 
                  justifyContent: 'space-between', 
                  padding: '16px', 
                  fontWeight: '700',
                  background: 'var(--bg-alt)',
                  border: '1px solid var(--card-border)'
                }}
                onClick={() => handleBatsmanSelect(p.id)}
              >
                <span>{p.name} <span style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: '500' }}>({p.role})</span></span>
                <span style={{ color: 'var(--primary)' }}>{p.battingRating}</span>
              </button>
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
        background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)',
        zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <div className="card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '48px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--primary)' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '8px' }}>MATCH FINISHED</h1>
          <p style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '32px' }}>{state.victoryMargin}</p>

          <div style={{ display: 'grid', gap: '16px' }}>
            <button
              className="primary"
              style={{ padding: '20px', fontSize: '1.1rem' }}
              onClick={onExit}
            >
              RETURN TO DASHBOARD
            </button>
            {/* <button
              style={{ padding: '16px', background: 'var(--bg-alt)', color: 'var(--text)', border: '1px solid var(--card-border)' }}
              onClick={() => setViewMode('scorecard')}
            >
              VIEW DETAILED SCORECARD
            </button> */}
          </div>
        </div>
      </div>
    )
  }

  if (isMobile && viewMode === 'live' && inn) {
    return (
      <div className="match-view-container">
        {renderTossModal()}
        {renderSelectionModal()}
        {renderBatsmanModal()}
        {renderMatchFinished()}
        <MobileMatchUI state={state} dispatch={dispatch} appDispatch={appDispatch} />
      </div>
    )
  }

  return (
    <div className="match-view-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px' }}>
      {renderTossModal()}
      {renderSelectionModal()}
      {renderBatsmanModal()}
      {renderMatchFinished()}

      <div className="match-nav" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '32px', background: 'white',
        padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--card-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <button className="secondary" onClick={onExit} style={{ padding: '10px 20px', fontWeight: '700' }}>← BACK</button>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
            {state.homeTeam.short} <span style={{ color: 'var(--text-muted)', fontWeight: '400', margin: '0 8px' }}>VS</span> {state.awayTeam.short}
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', letterSpacing: '0.15em', marginTop: '4px', fontWeight: '800', textTransform: 'uppercase' }}>
            {state.config.format} CRICKET • {state.config.overs} OVERS
          </div>
        </div>

        <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
          <button className={viewMode === 'live' ? 'active' : ''} style={{ fontSize: '0.85rem', fontWeight: '800' }} onClick={() => setViewMode('live')}>LIVE</button>
          <button className={viewMode === 'scorecard' ? 'active' : ''} style={{ fontSize: '0.85rem', fontWeight: '800' }} onClick={() => setViewMode('scorecard')}>SCORECARD</button>
        </div>
      </div>

      {viewMode === 'live' && inn ? (
        <div className="match-layout grid-2" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
          <div className="main-match-col" style={{ display: 'grid', gap: '32px', alignContent: 'start' }}>
            <Scoreboard state={state} matchDispatch={dispatch} appDispatch={appDispatch} />
            <Controls state={state} dispatch={dispatch} />
          </div>
          <div className="side-match-col" style={{ display: 'grid', gap: '32px', gridTemplateRows: 'auto 1fr' }}>
            <div className="card" style={{ padding: '24px', background: 'white' }}>
              <h4 style={{ margin: '0 0 16px 0', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.1em' }}>Over History</h4>
              <OverHistory state={state} />
            </div>
            <CommentaryBox state={state} />
          </div>
        </div>
      ) : viewMode === 'scorecard' ? (
        <div className="scorecard-container">
          <DetailedScorecard state={state} />
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
          Waiting for toss...
        </div>
      )}
    </div>
  )
}
