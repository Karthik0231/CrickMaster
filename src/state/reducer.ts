import { MatchState, Strategy, InningsState } from './types'
import { setupNewMatch, simulateOver, simulateMatch } from '../engine/matchEngine'
import { TEAMS } from '../data/teams'

// Default dummy state to satisfy Types
export const initialMatchState: MatchState = setupNewMatch({
  home: TEAMS.India,
  away: TEAMS.Australia,
  config: {
    overs: 20,
    mode: 'Quick',
    format: 'T20',
    strategy: 'Normal',
    bowlingStrategy: 'Normal',
    pitch: 'Balanced',
    stadium: 'Generic Stadium'
  }
}).initState

export type Action =
  | { type: 'INIT'; payload: MatchState }
  | { type: 'RUN_OVER' }
  | { type: 'SIMULATE_MATCH' }
  | { type: 'SELECT_NEXT_BATSMAN'; payload: string } // Player ID
  | { type: 'AUTO_SELECT_BATSMAN' }
  | { type: 'SELECT_BOWLER'; payload: string } // Player ID
  | { type: 'CHANGE_STRATEGY'; payload: { batting?: Strategy; bowling?: Strategy } }
  | { type: 'RESET' }

export function matchReducer(state: MatchState, action: Action): MatchState {
  const inn = state.currentInnings === 1 ? state.innings1 : state.innings2
  if (!inn) return state

  switch (action.type) {
    case 'CHANGE_STRATEGY': {
      const updatedInn = { ...inn }
      if (action.payload.batting) {
        updatedInn.battingStrategy = action.payload.batting
        updatedInn.strikerStrategy = action.payload.batting
        updatedInn.nonStrikerStrategy = action.payload.batting
      }
      if (action.payload.bowling) {
        updatedInn.bowlingStrategy = action.payload.bowling
      }
      return state.currentInnings === 1
        ? { ...state, innings1: updatedInn }
        : { ...state, innings2: updatedInn }
    }

    case 'INIT':
      return action.payload

    case 'RUN_OVER': {
      if (state.matchCompleted || state.waitingForBatsman) return state
      const result = simulateOver(state)
      return result.state
    }

    case 'SIMULATE_MATCH': {
      if (state.matchCompleted || state.waitingForBatsman) return state
      return simulateMatch(state)
    }

    case 'SELECT_NEXT_BATSMAN': {
      const batsmanId = action.payload
      const updatedInn = {
        ...inn,
        strikerId: batsmanId,
        nextBatsmanIndex: inn.nextBatsmanIndex + 1
      }
      return state.currentInnings === 1
        ? { ...state, innings1: updatedInn, waitingForBatsman: false }
        : { ...state, innings2: updatedInn, waitingForBatsman: false }
    }

    case 'AUTO_SELECT_BATSMAN': {
      const batTeam = state.homeTeam.id === inn.battingTeamId ? state.homeTeam : state.awayTeam
      const remaining = batTeam.players.filter(p =>
        !inn.fallOfWickets.some(f => f.batsmanId === p.id) &&
        p.id !== inn.strikerId &&
        p.id !== inn.nonStrikerId
      )
      const best = remaining.sort((a, b) => b.battingRating - a.battingRating)[0]
      if (!best) return { ...state, waitingForBatsman: false }

      const updatedInn = {
        ...inn,
        strikerId: best.id,
        nextBatsmanIndex: inn.nextBatsmanIndex + 1
      }
      return state.currentInnings === 1
        ? { ...state, innings1: updatedInn, waitingForBatsman: false }
        : { ...state, innings2: updatedInn, waitingForBatsman: false }
    }

    case 'SELECT_BOWLER': {
      const updatedInn = { ...inn, currentBowlerId: action.payload }
      return state.currentInnings === 1
        ? { ...state, innings1: updatedInn }
        : { ...state, innings2: updatedInn }
    }

    case 'RESET': {
      const fresh = setupNewMatch({
        home: state.homeTeam,
        away: state.awayTeam,
        config: state.config,
      })
      return { ...fresh.initState, userTeamId: state.userTeamId }
    }

    default:
      return state
  }
}
