import React from 'react'

interface Props {
    onSelectWithAuction: () => void
    onSelectWithoutAuction: () => void
    onBack: () => void
}

export function IPLModeSelector({ onSelectWithAuction, onSelectWithoutAuction, onBack }: Props) {
    return (
        <div className="ipl-mode-selector" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <button
                className="secondary"
                onClick={onBack}
                style={{ marginBottom: '32px', padding: '10px 20px', fontWeight: '700' }}
            >
                ← BACK
            </button>

            <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                <h1 style={{
                    margin: '0 0 16px 0',
                    fontSize: '2.5rem',
                    fontWeight: '900',
                    color: 'var(--primary)',
                    letterSpacing: '-1px'
                }}>
                    IPL MODE
                </h1>
                <p style={{
                    margin: '0 0 48px 0',
                    fontSize: '1.1rem',
                    color: 'var(--text-muted)',
                    fontWeight: '600'
                }}>
                    Choose how you want to play the Indian Premier League
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div
                        className="card"
                        style={{
                            padding: '32px',
                            background: 'var(--bg-alt)',
                            border: '2px solid var(--card-border)',
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px'
                        }}
                        onClick={onSelectWithAuction}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--primary)'
                            e.currentTarget.style.transform = 'translateY(-4px)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--card-border)'
                            e.currentTarget.style.transform = 'translateY(0)'
                        }}
                    >
                        <div style={{ fontSize: '3rem' }}>🏏</div>
                        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900' }}>WITH AUCTION</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            Build your dream team through an exciting auction process. Bid on players, manage your budget, and create your perfect squad.
                        </p>
                        <button
                            className="primary"
                            style={{ marginTop: 'auto', padding: '14px', fontWeight: '800' }}
                            onClick={(e) => {
                                e.stopPropagation()
                                onSelectWithAuction()
                            }}
                        >
                            START AUCTION
                        </button>
                    </div>

                    <div
                        className="card"
                        style={{
                            padding: '32px',
                            background: 'var(--bg-alt)',
                            border: '2px solid var(--card-border)',
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px'
                        }}
                        onClick={onSelectWithoutAuction}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--primary)'
                            e.currentTarget.style.transform = 'translateY(-4px)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--card-border)'
                            e.currentTarget.style.transform = 'translateY(0)'
                        }}
                    >
                        <div style={{ fontSize: '3rem' }}>⚡</div>
                        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900' }}>SKIP AUCTION</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            Jump straight into the tournament with pre-built teams. Perfect for quick gameplay and focusing on matches.
                        </p>
                        <button
                            className="secondary"
                            style={{ marginTop: 'auto', padding: '14px', fontWeight: '800' }}
                            onClick={(e) => {
                                e.stopPropagation()
                                onSelectWithoutAuction()
                            }}
                        >
                            START TOURNAMENT
                        </button>
                    </div>
                </div>

                <div style={{
                    marginTop: '32px',
                    padding: '16px',
                    background: 'var(--primary-glow)',
                    borderRadius: '12px',
                    border: '1px solid var(--primary)'
                }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        💡 <strong>Tip:</strong> You can play both modes! Each tournament is saved separately.
                    </p>
                </div>
            </div>
        </div>
    )
}
