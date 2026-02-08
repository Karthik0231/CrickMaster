import React, { useState, useEffect } from 'react'
import { AppState, GameMode, Team, MatchState, AuctionState, MatchConfig } from './state/types'
import { usePersistentState } from './hooks/usePersistentState'
import { MainMenu } from './components/MainMenu'
import { TeamSelector } from './components/TeamSelector'
import { MatchView } from './components/MatchView'
import { AuctionView } from './components/AuctionView'
import { TournamentView } from './components/TournamentView'
import { TeamLineupSelector } from './components/TeamLineupSelector'
import { GlobalHeader } from './components/GlobalHeader'
import { MatchHistory } from './components/MatchHistory'
import { StatsDashboard } from './components/StatsDashboard'
import { MatchSummary } from './components/MatchSummary'
import { IPLModeSelector } from './components/IPLModeSelector'
import { matchReducer, Action as MatchAction } from './state/reducer'
import { tournamentReducer } from './state/tournamentReducer'
import { careerReducer, initialCareerState } from './state/careerReducer'
import { setupNewMatch } from './engine/matchEngine'
import { CareerView } from './components/CareerView'
import { clearGameState } from './state/persistence'

interface MatchSetup {
    homeId: string
    awayId: string
    config: MatchConfig
    matchId?: string
}

export default function App() {
    const { state: appState, dispatch, navigate, setMode } = usePersistentState();
    const [tentativeMatch, setTentativeMatch] = useState<MatchSetup | null>(null)
    const [showLineup, setShowLineup] = useState(false)
    const [showIPLModeSelector, setShowIPLModeSelector] = useState(false)

    // Handlers
    const handleModeSelect = (mode: GameMode) => {
        if (appState.currentMatch && !appState.currentMatch.matchCompleted) {
            if (!window.confirm("A match is currently in progress. Switching modes will pause this match. Continue?")) {
                return;
            }
        }
        setMode(mode);
        dispatch({ type: 'SET_USER_TEAM', payload: '' });

        // Auto-trigger auction setup if entering IPL fresh AND no existing tournament to resume
        if (mode === 'IPL') {
            // Logic moved to handleStartMatchSetup to ensure team selection
        }
    }

    const handleBackToMain = () => {
        dispatch({ type: 'SET_USER_TEAM', payload: '' });
        setMode(null as any);
        navigate('Home');
        setShowIPLModeSelector(false); // Reset IPL selector
    }

    const handleStartMatchSetup = (homeId: string, awayId: string, overs: number, seriesMatches?: number, userTeamId?: string, matchId?: string) => {
        // userTeamId is critical for WC and IPL
        if (userTeamId) {
            dispatch({ type: 'SET_USER_TEAM', payload: userTeamId });
        }
        const config: MatchConfig = {
            overs,
            mode: appState.activeMode || 'Quick',
            format: overs === 20 ? 'T20' : 'ODI',
            strategy: 'Normal',
            bowlingStrategy: 'Normal',
            pitch: 'Balanced',
            stadium: 'Generic Stadium'
        }

        // Only INIT tournament if we are NOT already in one
        if (appState.activeMode === 'Series' && seriesMatches) {
            const homeTeam = appState.teams.find(t => t.id === homeId)!
            const awayTeam = appState.teams.find(t => t.id === awayId)!
            const tState = tournamentReducer(null, {
                type: 'INIT_TOURNAMENT',
                payload: { mode: 'Series', teams: [homeTeam, awayTeam], name: `${homeTeam.short} vs ${awayTeam.short} Series`, userTeamId: appState.userTeamId, overs }
            })!
            dispatch({ type: 'INIT_TOURNAMENT', payload: tState });
        } else if (appState.activeMode === 'WorldCup' && !appState.activeTournamentId) {
            // World Cup Mode: Initialize with User Team + Auto-generated opponents
            const userTeam = appState.teams.find(t => t.id === userTeamId)! // Use the selected userTeamId
            const otherTeams = appState.teams
                .filter(t => t.id !== userTeamId && ['ind', 'aus', 'eng', 'pak', 'nz', 'rsa', 'sl', 'ban', 'wi', 'afg'].includes(t.id))
                .sort((a, b) => b.battingRating - a.battingRating)
                .slice(0, 7) // Select top 7 opponents for an 8 team tournament

            const wcTeams = [userTeam, ...otherTeams]

            const tState = tournamentReducer(null, {
                type: 'INIT_TOURNAMENT',
                payload: { mode: 'WorldCup', teams: wcTeams, name: 'World Cup 2027', userTeamId: userTeam.id, overs }
            })!
            dispatch({ type: 'INIT_TOURNAMENT', payload: tState });
        } else if (appState.activeMode === 'IPL' && !appState.activeTournamentId && !appState.auction) {
            // IPL Mode Entry: Show mode selector (auction vs direct)
            if (userTeamId) {
                dispatch({ type: 'SET_USER_TEAM', payload: userTeamId });
                setShowIPLModeSelector(true);
                return; // Don't proceed to match setup
            }
        } else {
            // This covers Quick Match, IPL matches (if tournament already active), and playing matches in Series/WC once initialized
            setTentativeMatch({ homeId, awayId, config, matchId })
            setShowLineup(true)
        }
    }

    const handleStartFinalMatch = (home: Team, away: Team, config: MatchConfig, matchId?: string) => {
        const { initState } = setupNewMatch({ home, away, config })
        const stateWithUser = { ...initState, userTeamId: appState.userTeamId, id: matchId || `${config.mode}_${Date.now()}` }
        dispatch({ type: 'START_MATCH', payload: stateWithUser });
        setTentativeMatch(null)
        setShowLineup(false)
    }

    const handleFinishMatch = () => {
        if (!appState.currentMatch) return;
        if (appState.activeTournamentId) {
            const tournament = appState.tournaments.find(t => t.id === appState.activeTournamentId);
            if (tournament) {
                const updatedT = tournamentReducer(tournament, {
                    type: 'REPORT_MATCH_RESULT',
                    payload: { matchId: appState.currentMatch.id, state: appState.currentMatch }
                });
                if (updatedT) dispatch({ type: 'UPDATE_TOURNAMENT', payload: updatedT });
            }
        }
        dispatch({ type: 'FINISH_MATCH', payload: appState.currentMatch });
    }

    const handleRestartTournament = () => {
        if (!appState.activeTournamentId) return;
        if (window.confirm("Restart this tournament? All current points and fixtures will be reset.")) {
            const tournament = appState.tournaments.find(t => t.id === appState.activeTournamentId);
            if (tournament) {
                const updatedT = tournamentReducer(tournament, { type: 'RESTART_TOURNAMENT' });
                if (updatedT) dispatch({ type: 'UPDATE_TOURNAMENT', payload: updatedT });
            }
        }
    }

    const handleRestartMatch = () => {
        if (!appState.currentMatch) return;
        if (window.confirm("Restart current match? Current score will be lost.")) {
            const { homeTeam, awayTeam, config } = appState.currentMatch;
            handleStartFinalMatch(homeTeam, awayTeam, config);
        }
    }

    const handleResetAll = () => {
        if (window.confirm("Are you sure? This will delete ALL match history, stats, and tournament progress.")) {
            clearGameState();
            window.location.reload();
        }
    }

    // IPL/Auction Handlers
    const handleStartAuction = (explicitUserTeamId?: string) => {
        const teamId = explicitUserTeamId || appState.userTeamId;
        const iplTeams = appState.teams.filter(t => ['csk', 'mi', 'rcb', 'kkr', 'rr', 'srh', 'dc', 'pbks', 'gt', 'lsg'].includes(t.id))
        const pool = iplTeams.flatMap(t => t.players.map(p => ({ ...p, basePrice: 2000000 }))) // Simplified pool
        dispatch({ type: 'START_AUCTION', payload: { isActive: true, pool, teams: iplTeams, userTeamId: teamId, completed: false, status: 'Bidding' } as any });
    }

    const handleAuctionFinish = (updatedTeams: Team[]) => {
        const tState = tournamentReducer(null, {
            type: 'INIT_TOURNAMENT',
            payload: { mode: 'IPL', teams: updatedTeams, name: 'IPL 2026', userTeamId: appState.userTeamId }
        })!
        dispatch({ type: 'UPDATE_AUCTION', payload: { completed: true, teams: updatedTeams } });
        dispatch({ type: 'INIT_TOURNAMENT', payload: tState });
    }

    const handleIPLWithAuction = () => {
        setShowIPLModeSelector(false);
        handleStartAuction(appState.userTeamId || undefined);
    }

    const handleIPLWithoutAuction = () => {
        setShowIPLModeSelector(false);
        // Start IPL tournament directly without auction
        const iplTeams = appState.teams.filter(t => ['csk', 'mi', 'rcb', 'kkr', 'rr', 'srh', 'dc', 'pbks', 'gt', 'lsg'].includes(t.id))
        const tState = tournamentReducer(null, {
            type: 'INIT_TOURNAMENT',
            payload: { mode: 'IPL', teams: iplTeams, name: 'IPL 2026', userTeamId: appState.userTeamId, overs: 20 } // IPL is T20 format
        })!
        dispatch({ type: 'INIT_TOURNAMENT', payload: tState });
    }

    // Career Handlers
    const handleStartCareer = (team: Team) => {
        const cState = careerReducer(initialCareerState, { type: 'START_CAREER', payload: { team } });
        dispatch({ type: 'UPDATE_CAREER', payload: cState });
    }

    const handleUpgradePlayer = (upgrade: any) => {
        if (!appState.career) return;
        const updatedC = careerReducer(appState.career, { type: 'UPGRADE_PLAYER', payload: upgrade });
        dispatch({ type: 'UPDATE_CAREER', payload: updatedC });
    }

    const renderContent = () => {
        const { activeScreen, activeMode, currentMatch, auction, career, tournaments, activeTournamentId, teams, userTeamId } = appState;

        // 1. Match Overlay - Highest Priority
        if (activeScreen === 'Match' && currentMatch) {
            return <MatchView state={currentMatch} dispatch={(a) => dispatch({ type: 'START_MATCH', payload: matchReducer(currentMatch, a) })} appDispatch={dispatch} onExit={handleFinishMatch} />
        }

        // 2. Global Screens
        if (activeScreen === 'MatchSummary' && currentMatch) {
            return (
                <MatchSummary
                    state={currentMatch}
                    onExit={() => dispatch({ type: 'EXIT_MATCH_SUMMARY' })}
                    onViewTable={activeTournamentId ? () => navigate('Tournament') : undefined}
                    onDashboard={activeTournamentId ? () => navigate('Tournament') : undefined}
                />
            )
        }
        if (activeScreen === 'History') return <MatchHistory state={appState} navigate={navigate} />
        if (activeScreen === 'Stats') return <StatsDashboard state={appState} />

        // 3. Lineup Setup
        if (showLineup && tentativeMatch) {
            const tournament = tournaments.find(t => t.id === activeTournamentId);
            let home = tournament?.teams.find(t => t.id === tentativeMatch.homeId) || teams.find(t => t.id === tentativeMatch.homeId);
            let away = tournament?.teams.find(t => t.id === tentativeMatch.awayId) || teams.find(t => t.id === tentativeMatch.awayId);

            if (home && away) {
                return (
                    <TeamLineupSelector
                        team={home}
                        onConfirm={(xi, order) => handleStartFinalMatch(
                            { ...home!, players: order.map(id => home!.players.find(p => p.id === id)!) },
                            { ...away!, players: away!.players.slice(0, 11) },
                            tentativeMatch.config,
                            tentativeMatch.matchId
                        )}
                        onCancel={() => setShowLineup(false)}
                    />
                )
            }
        }

        // 4. Mode-Specific Routing
        if (activeMode === 'WorldCup' || activeMode === 'IPL' || activeMode === 'Series') {
            const tournament = tournaments.find(t => t.id === activeTournamentId);

            // STRICT ROUTING GUARD: If on Tournament screen but tournament invalid/mismatch, force back
            if (activeScreen === 'Tournament') {
                if (!tournament || tournament.mode !== activeMode) {
                    // Invalid state detected, fallback to setup
                    console.warn(`Routing Mismatch: Screen=${activeScreen}, Mode=${activeMode}, TournID=${activeTournamentId}`);
                    // We can't dispatch here directly inside render, but we can render the fallback logic
                    // Ideally we should dispatch an adjustment, but rendering TeamSelector is safe.
                    return <TeamSelector mode={activeMode} teams={teams} onStart={handleStartMatchSetup} onBack={handleBackToMain} />;
                }
                return (
                    <TournamentView
                        state={tournament}
                        userTeamId={userTeamId}
                        onPlayMatch={(id) => handleStartMatchSetup(
                            tournament.fixtures.find(f => f.id === id)!.homeTeamId,
                            tournament.fixtures.find(f => f.id === id)!.awayTeamId,
                            20,
                            undefined,
                            userTeamId || undefined,
                            id
                        )}
                        onSimulateMatch={() => dispatch({ type: 'UPDATE_TOURNAMENT', payload: tournamentReducer(tournament, { type: 'SIMULATE_NEXT_MATCH' })! })}
                        onSimulateToUserMatch={() => dispatch({ type: 'UPDATE_TOURNAMENT', payload: tournamentReducer(tournament, { type: 'SIMULATE_UNTIL_USER_MATCH' })! })}
                        onBack={() => navigate('Home')}
                    />
                )
            }

            if (activeScreen === 'TeamSelect') {
                return <TeamSelector mode={activeMode} teams={teams} onStart={handleStartMatchSetup} onBack={handleBackToMain} />
            }
        }

        if (activeMode === 'Career') {
            return <CareerView state={career || initialCareerState} onStartCareer={handleStartCareer} onUpgradePlayer={handleUpgradePlayer} onBack={handleBackToMain} />
        }

        // 5. IPL Mode Selector (before auction)
        if (showIPLModeSelector && activeMode === 'IPL') {
            return (
                <IPLModeSelector
                    onSelectWithAuction={handleIPLWithAuction}
                    onSelectWithoutAuction={handleIPLWithoutAuction}
                    onBack={handleBackToMain}
                />
            )
        }

        // 6. Auction Flow (IPL Specific Sub-screen)
        if (activeMode === 'IPL' && activeScreen === 'Auction' && auction) {
            return <AuctionView teams={auction.teams} pool={auction.pool} userTeamId={userTeamId!} onFinish={handleAuctionFinish} />
        }

        // 6. Home Screen / Resume Dashboard
        const activeTournaments = tournaments.filter(t => t.status === 'IN_PROGRESS');

        return (
            <div className="home-container">
                {activeTournaments.length > 0 && (
                    <div className="resume-section card" style={{ marginBottom: '32px', border: '2px solid var(--primary)' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase' }}>Active Seasons</h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {activeTournaments.map(t => (
                                <button
                                    key={t.id}
                                    className="secondary"
                                    style={{ justifyContent: 'space-between', padding: '16px' }}
                                    onClick={() => {
                                        dispatch({ type: 'SET_MODE', payload: t.mode });
                                        dispatch({ type: 'SET_ACTIVE_TOURNAMENT', payload: t.id });
                                        navigate('Tournament');
                                    }}
                                >
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: '800' }}>{t.name}</div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.mode} • Round {t.currentRoundIndex + 1}</div>
                                    </div>
                                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>RESUME →</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <MainMenu onSelectMode={handleModeSelect} />
            </div>
        )
    }

    return (
        <div className="app-layout">
            <GlobalHeader state={appState} onNavigate={navigate} onRestartMatch={handleRestartMatch} onRestartTournament={handleRestartTournament} onResetAll={handleResetAll} />
            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    )
}
