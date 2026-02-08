import { Team, Player, CareerPlayerUpgrade, CareerSeason, CareerState } from './types'
export type CareerAction =
    | { type: 'START_CAREER'; payload: { team: Team } }
    | { type: 'UPGRADE_PLAYER'; payload: CareerPlayerUpgrade }
    | { type: 'EARN_REWARD'; payload: number }
    | { type: 'END_SEASON'; payload: CareerSeason }

export const initialCareerState: CareerState = {
    isActive: false,
    userTeamId: '',
    balance: 50,
    level: 1,
    experience: 0,
    seasons: [],
    currentSeason: 2026,
    squad: {} as Team,
    transferMarket: [],
    isSeasonStarted: false
}

export function careerReducer(state: CareerState, action: CareerAction): CareerState {
    switch (action.type) {
        case 'START_CAREER':
            return {
                ...state,
                isActive: true,
                userTeamId: action.payload.team.id,
                squad: action.payload.team,
                balance: 50,
                isSeasonStarted: true
            }

        case 'UPGRADE_PLAYER': {
            const { playerId, type, cost, increase } = action.payload
            if (state.balance < cost) return state

            const updatedPlayers = state.squad.players.map(p => {
                if (p.id === playerId) {
                    if (type === 'BAT') return { ...p, battingRating: Math.min(99, p.battingRating + increase) }
                    if (type === 'BOWL') return { ...p, bowlingRating: Math.min(99, p.bowlingRating + increase) }
                    if (type === 'FITNESS') return { ...p, fitness: Math.min(100, p.fitness + increase) }
                }
                return p
            })

            return {
                ...state,
                balance: state.balance - cost,
                squad: { ...state.squad, players: updatedPlayers }
            }
        }

        case 'EARN_REWARD':
            return { ...state, balance: state.balance + action.payload }

        case 'END_SEASON':
            return {
                ...state,
                seasons: [...state.seasons, action.payload],
                currentSeason: state.currentSeason + 1,
                balance: state.balance + 20 // Season bonus
            }

        default:
            return state
    }
}
