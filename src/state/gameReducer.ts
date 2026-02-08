import { AppState, GameMode, MatchState, Team, TournamentState } from './types';
import { defaultAppState, saveGameState } from './persistence';

export type GameAction =
    | { type: 'NAVIGATE'; payload: AppState['activeScreen'] }
    | { type: 'SET_MODE'; payload: GameMode | null }
    | { type: 'START_MATCH'; payload: MatchState }
    | { type: 'EXIT_MATCH' }
    | { type: 'FINISH_MATCH'; payload: MatchState }
    | { type: 'EXIT_MATCH_SUMMARY' }
    | { type: 'INIT_TOURNAMENT'; payload: TournamentState }
    | { type: 'UPDATE_TOURNAMENT'; payload: TournamentState }
    | { type: 'SET_ACTIVE_TOURNAMENT'; payload: string | null }
    | { type: 'SET_USER_TEAM'; payload: string }
    | { type: 'START_AUCTION'; payload: any }
    | { type: 'UPDATE_AUCTION'; payload: any }
    | { type: 'START_CAREER'; payload: any }
    | { type: 'UPDATE_CAREER'; payload: any }
    | { type: 'RESET_ALL' }
    | { type: 'LOAD_STATE'; payload: Partial<AppState> }
    | { type: 'CHANGE_BATSMAN_MODE'; payload: { batsmanId: string; strategy: any } }
    | { type: 'CHANGE_BOWLER_MODE'; payload: { bowlerId: string; strategy: any } }
    | { type: 'AUTO_SELECT_BATSMAN' }
    | { type: 'SELECT_NEXT_BATSMAN'; payload: string };

export function gameReducer(state: AppState, action: GameAction): AppState {
    let newState: AppState;

    switch (action.type) {
        case 'NAVIGATE':
            newState = { ...state, activeScreen: action.payload };
            break;

        case 'SET_MODE': {
            const mode = action.payload;
            let screen: AppState['activeScreen'] = 'Home';
            if (mode === 'Career') screen = 'Career';
            if (mode === 'Quick' || mode === 'Series' || mode === 'WorldCup' || mode === 'IPL') screen = 'TeamSelect';

            // Find existing in-progress tournament for this mode to resume
            const existingTournament = state.tournaments
                .filter(t => t.mode === mode && t.status === 'IN_PROGRESS')
                .pop();

            // Validate: if we have an activeTournamentId but it doesn't match this mode, clear it
            let validTournamentId = existingTournament ? existingTournament.id : null;
            if (state.activeTournamentId) {
                const currentTournament = state.tournaments.find(t => t.id === state.activeTournamentId);
                if (currentTournament && currentTournament.mode !== mode) {
                    // Mode mismatch - clear the tournament
                    validTournamentId = null;
                }
            }

            newState = {
                ...state,
                activeMode: mode,
                activeScreen: existingTournament ? 'Tournament' : screen,
                activeTournamentId: validTournamentId
            };
            break;
        }

        case 'START_MATCH':
            newState = { ...state, currentMatch: action.payload, activeScreen: 'Match' };
            break;

        case 'CHANGE_BATSMAN_MODE': {
            if (!state.currentMatch) return state
            const { batsmanId, strategy } = action.payload
            const match = state.currentMatch
            const inn = match.currentInnings === 1 ? match.innings1 : match.innings2
            if (!inn) return state

            newState = {
                ...state,
                currentMatch: {
                    ...match, // Keep other match state
                    innings1: match.currentInnings === 1 ? { ...inn, strikerStrategy: inn.strikerId === batsmanId ? strategy : inn.strikerStrategy, nonStrikerStrategy: inn.nonStrikerId === batsmanId ? strategy : inn.nonStrikerStrategy } : match.innings1,
                    innings2: match.currentInnings === 2 ? { ...inn, strikerStrategy: inn.strikerId === batsmanId ? strategy : inn.strikerStrategy, nonStrikerStrategy: inn.nonStrikerId === batsmanId ? strategy : inn.nonStrikerStrategy } : match.innings2
                }
            }
            break
        }

        case 'CHANGE_BOWLER_MODE': {
            if (!state.currentMatch) return state
            const { bowlerId, strategy } = action.payload
            const match = state.currentMatch
            const inn = match.currentInnings === 1 ? match.innings1 : match.innings2
            if (!inn) return state

            newState = {
                ...state,
                currentMatch: {
                    ...match,
                    innings1: match.currentInnings === 1 ? { ...inn, bowlingStrategy: inn.currentBowlerId === bowlerId ? strategy : inn.bowlingStrategy } : match.innings1,
                    innings2: match.currentInnings === 2 ? { ...inn, bowlingStrategy: inn.currentBowlerId === bowlerId ? strategy : inn.bowlingStrategy } : match.innings2
                }
            }
            break
        }

        case 'EXIT_MATCH': {
            const isTournamentMode = state.activeMode === 'IPL' || state.activeMode === 'WorldCup' || state.activeMode === 'Series';
            newState = {
                ...state,
                currentMatch: null,
                activeScreen: isTournamentMode ? 'Tournament' : 'Home'
            };
            break;
        }

        case 'EXIT_MATCH_SUMMARY': {
            const isTournamentMode = state.activeMode === 'IPL' || state.activeMode === 'WorldCup' || state.activeMode === 'Series';
            newState = {
                ...state,
                currentMatch: null,
                activeScreen: isTournamentMode ? 'Tournament' : 'Home'
            };
            break;
        }

        case 'FINISH_MATCH': {
            const match = action.payload;

            // 1. Determine Man of the Match
            const calculateMOM = (m: MatchState) => {
                const scorers: Record<string, number> = {};
                const addPoints = (id: string, pts: number) => {
                    scorers[id] = (scorers[id] || 0) + pts;
                };

                // Batting points
                [m.innings1, m.innings2].forEach(inn => {
                    if (!inn) return;
                    inn.events.forEach(e => {
                        addPoints(e.strikerId, e.runs);
                        if (e.wicket) addPoints(e.bowlerId, 25);
                    });
                });

                const sorted = Object.entries(scorers).sort((a, b) => b[1] - a[1]);
                return sorted[0]?.[0] || m.homeTeam.players[0].id;
            };

            const momId = calculateMOM(match);

            const historyEntry = {
                matchId: match.id,
                mode: match.config.mode,
                teams: {
                    home: { id: match.homeTeam.id, name: match.homeTeam.name, score: `${match.innings1?.runs}/${match.innings1?.wickets}` },
                    away: { id: match.awayTeam.id, name: match.awayTeam.name, score: match.innings2 ? `${match.innings2.runs}/${match.innings2.wickets}` : 'DNB' }
                },
                result: match.victoryMargin ? `${match.winnerId === match.homeTeam.id ? match.homeTeam.short : match.awayTeam.short} won by ${match.victoryMargin}` : 'Tied',
                winnerId: match.winnerId,
                momId,
                date: new Date().toISOString(),
                tournamentId: state.activeTournamentId || undefined,
                overs: match.config.overs,
                format: match.config.format,
                fullState: match // Save everything for history
            };

            const updatedHistory = [historyEntry, ...state.matchHistory];

            // Update Global Stats
            const updatedStats = { ...state.globalStats };

            const updateTeamStats = (teamId: string, runs: number) => {
                const stat = updatedStats.teamStats[teamId] || { wins: 0, losses: 0, titles: 0, highestScore: 0, lowestScore: 999, matches: 0 };
                if (runs > stat.highestScore) stat.highestScore = runs;
                if (runs < stat.lowestScore || stat.lowestScore === 999) stat.lowestScore = runs;
                updatedStats.teamStats[teamId] = stat;
            };

            if (match.innings1) updateTeamStats(match.innings1.battingTeamId, match.innings1.runs);
            if (match.innings2) updateTeamStats(match.innings2.battingTeamId, match.innings2.runs);

            if (match.winnerId) {
                const teamStat = updatedStats.teamStats[match.winnerId];
                teamStat.wins++;
                teamStat.matches++;

                const loserId = match.winnerId === match.homeTeam.id ? match.awayTeam.id : match.homeTeam.id;
                const loserStat = updatedStats.teamStats[loserId];
                loserStat.losses++;
                loserStat.matches++;
            }

            newState = {
                ...state,
                matchHistory: updatedHistory,
                globalStats: updatedStats,
                currentMatch: match, // Keep it for summary
                activeScreen: 'MatchSummary'
            };
            break;
        }

        case 'INIT_TOURNAMENT':
            newState = {
                ...state,
                tournaments: [...state.tournaments, action.payload],
                activeTournamentId: action.payload.id,
                activeScreen: 'Tournament'
            };
            break;

        case 'UPDATE_TOURNAMENT':
            newState = {
                ...state,
                tournaments: state.tournaments.map(t => t.id === action.payload.id ? action.payload : t)
            };
            break;

        case 'SET_ACTIVE_TOURNAMENT':
            newState = { ...state, activeTournamentId: action.payload };
            break;

        case 'SET_USER_TEAM':
            newState = { ...state, userTeamId: action.payload };
            break;

        case 'START_AUCTION':
            newState = { ...state, auction: action.payload, activeScreen: 'Auction' };
            break;

        case 'UPDATE_AUCTION':
            newState = { ...state, auction: action.payload };
            break;

        case 'START_CAREER':
            newState = { ...state, career: action.payload, activeScreen: 'Career' };
            break;

        case 'UPDATE_CAREER':
            newState = { ...state, career: action.payload };
            break;

        case 'RESET_ALL':
            newState = defaultAppState;
            break;

        case 'LOAD_STATE':
            newState = { ...state, ...action.payload };
            break;

        default:
            return state;
    }

    saveGameState(newState);
    return newState;
}
