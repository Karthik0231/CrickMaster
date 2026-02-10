import { AppState, GlobalStats } from './types';
import { TEAMS } from '../data/teams';

const STORAGE_KEY = 'cricmaster_data';

export const initialGlobalStats: GlobalStats = {
    playerStats: {},
    teamStats: Object.values(TEAMS).reduce((acc, team) => ({
        ...acc,
        [team.id]: {
            wins: 0,
            losses: 0,
            titles: 0,
            highestScore: 0,
            lowestScore: 9999,
            matches: 0
        }
    }), {})
};

export const defaultAppState: AppState = {
    activeMode: null,
    activeScreen: 'Home',
    currentMatch: null,
    activeTournamentId: null,
    tournaments: [],
    matchHistory: [],
    globalStats: initialGlobalStats,
    career: null,
    auction: null,
    teams: Object.values(TEAMS),
    userTeamId: null,
};

export function saveGameState(state: AppState) {
    try {
        const serializedState = JSON.stringify({
            currentMode: state.activeMode,
            activeScreen: state.activeScreen,
            activeTournamentId: state.activeTournamentId,
            tournaments: state.tournaments,
            matchHistory: state.matchHistory,
            globalStats: state.globalStats,
            career: state.career,
            auction: state.auction,
            teams: state.teams,
            userTeamId: state.userTeamId,
            currentMatch: state.currentMatch
        });
        localStorage.setItem(STORAGE_KEY, serializedState);
    } catch (err) {
        console.error('Could not save game state', err);
    }
}

export function loadGameState(): Partial<AppState> {
    try {
        const serializedState = localStorage.getItem(STORAGE_KEY);
        if (serializedState === null) {
            return {};
        }
        const saved = JSON.parse(serializedState);

        // Basic schema validation
        if (typeof saved !== 'object' || saved === null) {
            console.error('Corrupted save state: Not an object');
            return {};
        }

        // Validate tournaments array
        if (!Array.isArray(saved.tournaments)) {
            console.warn('Corrupted save state: Tournaments not an array. Resetting tournaments.');
            saved.tournaments = [];
            saved.activeTournamentId = null;
        }

        // Validate activeMode
        if (saved.currentMode && !['Quick', 'IPL', 'WorldCup', 'Series', 'Career', 'Practice'].includes(saved.currentMode)) {
            console.warn('Invalid active mode in save. Resetting to Home.');
            saved.currentMode = null;
            saved.activeScreen = 'Home';
        }

        // Validate activeTournamentId matches a valid tournament
        let validTournamentId = saved.activeTournamentId;
        if (validTournamentId && Array.isArray(saved.tournaments)) {
            const tournament = saved.tournaments.find((t: any) => t.id === validTournamentId);
            if (!tournament) {
                console.warn('Active tournament ID does not match any tournament. Clearing.');
                validTournamentId = null;
            } else if (saved.currentMode && tournament.mode !== saved.currentMode) {
                console.warn('Active tournament mode does not match current mode. Clearing.');
                validTournamentId = null;
            }
        }

        return {
            activeMode: saved.currentMode,
            activeScreen: saved.activeScreen,
            activeTournamentId: validTournamentId,
            tournaments: saved.tournaments,
            matchHistory: Array.isArray(saved.matchHistory) ? saved.matchHistory : [], // Ensure history is array
            globalStats: saved.globalStats || initialGlobalStats,
            career: saved.career,
            auction: saved.auction,
            teams: Array.isArray(saved.teams) ? saved.teams : undefined,
            userTeamId: saved.userTeamId,
            currentMatch: saved.currentMatch
        };
    } catch (err) {
        console.error('Could not load game state', err);
        return {};
    }
}

export function clearGameState() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
}
