import React from 'react'
import { MatchState, Team } from '../state/types'
import { DetailedScorecard } from './DetailedScorecard'

interface Props {
    state: MatchState
    onExit: () => void
    onViewTable?: () => void
    onDashboard?: () => void
}

export function MatchSummary({ state, onExit, onViewTable, onDashboard }: Props) {
    const [showDetailed, setShowDetailed] = React.useState(false)

    const winner = state.winnerId === state.homeTeam.id ? state.homeTeam : state.awayTeam
    const resultText = state.victoryMargin
        ? `${winner.name} won by ${state.victoryMargin}`
        : 'Match Drawn'

    return (
        <div className="match-summary-overlay" style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(255,255,255,0.98)',
            zIndex: 1000, overflowY: 'auto', padding: '40px 20px'
        }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>

                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '8px' }}>MATCH FINISHED</h1>
                    <div style={{ fontSize: '1.2rem', fontWeight: '600', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '2px' }}>
                        {state.config.format} • {state.config.stadium}
                    </div>
                </header>

                <div className="card result-card" style={{
                    textAlign: 'center', padding: '40px', border: 'none',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.05)', marginBottom: '32px',
                    background: 'linear-gradient(135deg, #fff 0%, #f8faff 100%)'
                }}>
                    <h2 style={{ fontSize: '2rem', color: 'var(--primary)', margin: '0 0 24px 0' }}>{resultText}</h2>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{state.innings1?.runs}/{state.innings1?.wickets}</div>
                            <div style={{ fontWeight: '700', opacity: 0.6 }}>{state.homeTeam.short}</div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '300', opacity: 0.3 }}>VS</div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{state.innings2?.runs || 0}/{state.innings2?.wickets || 0}</div>
                            <div style={{ fontWeight: '700', opacity: 0.6 }}>{state.awayTeam.short}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                    <button className="primary" onClick={() => setShowDetailed(true)} style={{ height: '60px', fontSize: '1rem' }}>
                        VIEW FULL SCORECARD
                    </button>

                    {onViewTable && (
                        <button className="secondary" onClick={onViewTable} style={{ height: '60px', fontSize: '1rem' }}>
                            POINTS TABLE
                        </button>
                    )}

                    {onDashboard && (
                        <button className="secondary" onClick={onDashboard} style={{ height: '60px', fontSize: '1rem' }}>
                            TOURNAMENT HUB
                        </button>
                    )}

                    <button className="secondary" onClick={onExit} style={{ height: '60px', fontSize: '1rem', border: '2px solid var(--primary)', color: 'var(--primary)' }}>
                        CONTINUE →
                    </button>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontWeight: '600', cursor: 'pointer', opacity: 0.6 }}>
                        Exit to Main Menu
                    </button>
                </div>

                {showDetailed && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#fff', zIndex: 1100, overflowY: 'auto', padding: '20px' }}>
                        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                            <button
                                onClick={() => setShowDetailed(false)}
                                className="secondary"
                                style={{ marginBottom: '20px', position: 'sticky', top: '0', zIndex: 10 }}
                            >
                                ← BACK TO SUMMARY
                            </button>
                            <DetailedScorecard state={state} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
