import { MatchState, Strategy, InningsState } from './types'
import { setupNewMatch, simulateOver, simulateMatch, initializeInningsAfterToss } from '../engine/matchEngine'
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
  | { type: 'CHANGE_BATSMAN_MODE'; payload: { batsmanId: string; strategy: Strategy } }
  | { type: 'CHANGE_BOWLER_MODE'; payload: { bowlerId: string; strategy: Strategy } }
  | { type: 'PERFORM_TOSS'; payload: 'Heads' | 'Tails' }
  | { type: 'CHOOSE_TOSS_DECISION'; payload: 'Bat' | 'Bowl' }
  | { type: 'SELECT_OPENERS'; payload: { strikerId: string; nonStrikerId: string } }
  | { type: 'UPDATE_OVER_PLAN'; payload: { over: number; bowlerId: string } }
  | { type: 'RESET' }

export function matchReducer(state: MatchState, action: Action): MatchState {
  if (action.type === 'INIT') return action.payload
  if (action.type === 'UPDATE_OVER_PLAN') {
    const inn = state.currentInnings === 1 ? state.innings1! : state.innings2!
    const updatedInn = {
      ...inn,
      overPlan: { ...inn.overPlan, [action.payload.over]: action.payload.bowlerId }
    }
    // If we are updating the CURRENT over's bowler, update currentBowlerId too
    const currentOver = Math.floor(inn.balls / 6)
    if (action.payload.over === currentOver) {
      updatedInn.currentBowlerId = action.payload.bowlerId
    }

    return state.currentInnings === 1
      ? { ...state, innings1: updatedInn }
      : { ...state, innings2: updatedInn }
  }
  if (action.type === 'SELECT_OPENERS') {
    const inn = state.innings1!
    return {
      ...state,
      innings1: {
        ...inn,
        strikerId: action.payload.strikerId,
        nonStrikerId: action.payload.nonStrikerId,
      },
      selectionStep: 'COMPLETED'
    }
  }
  if (action.type === 'PERFORM_TOSS') {
    const isHeads = Math.random() < 0.5
    const userWon = (action.payload === 'Heads' && isHeads) || (action.payload === 'Tails' && !isHeads)
    const winnerId = userWon ? state.userTeamId! : (state.homeTeam.id === state.userTeamId ? state.awayTeam.id : state.homeTeam.id)
    
    // If AI won, it decides automatically
    if (!userWon) {
      const decision: 'Bat' | 'Bowl' = Math.random() < 0.5 ? 'Bat' : 'Bowl'
      const updatedState = { ...state, toss: { winnerTeamId: winnerId, decision } }
      return initializeInningsAfterToss(updatedState, decision)
    }

    return { ...state, toss: { winnerTeamId: winnerId, decision: 'Bat' }, tossStep: 'DECIDE' }
  }

  if (action.type === 'CHOOSE_TOSS_DECISION') {
    return initializeInningsAfterToss(state, action.payload)
  }

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

    case 'CHANGE_BATSMAN_MODE': {
      const { batsmanId, strategy } = action.payload
      const updatedInn = { ...inn }
      
      // Update specific batsman strategy
      if (updatedInn.strikerId === batsmanId) {
        updatedInn.strikerStrategy = strategy
      } else if (updatedInn.nonStrikerId === batsmanId) {
        updatedInn.nonStrikerStrategy = strategy
      }

      // Also update global batting strategy if it matches the striker (for UI consistency)
      if (updatedInn.strikerId === batsmanId) {
        updatedInn.battingStrategy = strategy
      }

      return state.currentInnings === 1
        ? { ...state, innings1: updatedInn }
        : { ...state, innings2: updatedInn }
    }

    case 'CHANGE_BOWLER_MODE': {
      const { bowlerId, strategy } = action.payload
      const updatedInn = { ...inn }
      
      // Update bowling strategy (effectively current bowler's strategy)
      if (updatedInn.currentBowlerId === bowlerId) {
        updatedInn.bowlingStrategy = strategy
      }

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
