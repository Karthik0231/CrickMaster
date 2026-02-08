import { AuctionState, Team, AuctionPlayer, Role } from './types'

export type AuctionAction =
  | { type: 'START_AUCTION'; teams: Team[]; pool: AuctionPlayer[] }
  | { type: 'PLACE_BID'; teamId: string; amount: number }
  | { type: 'TEAM_PASS'; teamId: string } // Team leaves bidding for current player
  | { type: 'INCREMENT_HAMMER' } // Once -> Twice -> Sold
  | { type: 'FINALIZE_SALE' }
  | { type: 'MARK_UNSOLD' }
  | { type: 'NEXT_PLAYER' }
  | { type: 'START_UNSOLD_ROUND' }
  | { type: 'END_AUCTION' }

export const initialAuctionState: AuctionState = {
  isActive: false,
  pool: [],
  unsoldPool: [],
  currentPlayerIndex: -1,
  currentBid: 0,
  currentBidderId: null,
  activeBidderIds: [],
  noBidCounter: 0,
  status: 'Waiting',
  isUnsoldRound: false,
  teams: [],
  completed: false,
  log: []
}

// Bid Slab Logic
export function getNextBid(currentBid: number): number {
  const cr = 10000000
  if (currentBid < 2 * cr) return currentBid + 1000000 // 10L
  if (currentBid < 5 * cr) return currentBid + 2500000 // 25L
  return currentBid + 5000000 // 50L
}

export function auctionReducer(state: AuctionState, action: AuctionAction): AuctionState {
  switch (action.type) {
    case 'START_AUCTION':
      return {
        ...initialAuctionState,
        isActive: true,
        teams: action.teams.map(t => ({ ...t, budget: 800000000, players: [] })), // 80 Cr
        pool: action.pool,
        currentPlayerIndex: 0,
        currentBid: action.pool[0].basePrice,
        currentBidderId: null,
        activeBidderIds: action.teams.map(t => t.id),
        status: 'Bidding'
      }

    case 'PLACE_BID':
      return {
        ...state,
        currentBid: action.amount,
        currentBidderId: action.teamId,
        noBidCounter: 0,
        status: 'Bidding',
        log: [`${action.teamId} bid ₹${(action.amount / 10000000).toFixed(2)} Cr`, ...state.log]
      }

    case 'TEAM_PASS':
      const newActiveBidders = state.activeBidderIds.filter(id => id !== action.teamId)
      return {
        ...state,
        activeBidderIds: newActiveBidders,
        log: [`${action.teamId} passed`, ...state.log]
      }

    case 'INCREMENT_HAMMER':
      const nextCounter = state.noBidCounter + 1
      let nextStatus = state.status
      if (nextCounter === 1) nextStatus = 'GoingOnce'
      else if (nextCounter === 2) nextStatus = 'GoingTwice'

      return {
        ...state,
        noBidCounter: nextCounter,
        status: nextStatus as any
      }

    case 'FINALIZE_SALE': {
      const player = (state.isUnsoldRound ? state.unsoldPool : state.pool)[state.currentPlayerIndex]
      const teamId = state.currentBidderId!
      const amount = state.currentBid

      const updatedTeams = state.teams.map(t => {
        if (t.id === teamId) {
          return {
            ...t,
            budget: (t.budget || 0) - amount,
            players: [...t.players, { ...player, soldPrice: amount, soldToTeamId: teamId }]
          }
        }
        return t
      })

      const logMsg = `SOLD! ${player.name} to ${teamId} for ₹${(amount / 10000000).toFixed(2)} Cr`

      return {
        ...state,
        teams: updatedTeams,
        status: 'Sold',
        log: [logMsg, ...state.log]
      }
    }

    case 'MARK_UNSOLD': {
      const player = (state.isUnsoldRound ? state.unsoldPool : state.pool)[state.currentPlayerIndex]
      return {
        ...state,
        unsoldPool: state.isUnsoldRound ? state.unsoldPool : [...state.unsoldPool, { ...player, isUnsold: true }],
        status: 'Unsold',
        log: [`UNSOLD: ${player.name}`, ...state.log]
      }
    }

    case 'NEXT_PLAYER': {
      const pool = state.isUnsoldRound ? state.unsoldPool : state.pool
      const nextIndex = state.currentPlayerIndex + 1

      if (nextIndex >= pool.length) {
        if (!state.isUnsoldRound && state.unsoldPool.length > 0) {
          return { ...state, status: 'Waiting' } // Trigger manual start of unsold round?
        }
        return { ...state, completed: true, isActive: false }
      }

      const nextPlayer = pool[nextIndex]
      const basePrice = state.isUnsoldRound ? Math.floor(nextPlayer.basePrice * 0.8) : nextPlayer.basePrice

      return {
        ...state,
        currentPlayerIndex: nextIndex,
        currentBid: basePrice,
        currentBidderId: null,
        activeBidderIds: state.teams.map(t => t.id),
        noBidCounter: 0,
        status: 'Bidding'
      }
    }

    case 'START_UNSOLD_ROUND':
      return {
        ...state,
        isUnsoldRound: true,
        currentPlayerIndex: 0,
        currentBid: Math.floor(state.unsoldPool[0].basePrice * 0.8),
        currentBidderId: null,
        activeBidderIds: state.teams.map(t => t.id),
        noBidCounter: 0,
        status: 'Bidding',
        log: ['--- STARTING UNSOLD ROUND (80% Base Price) ---', ...state.log]
      }

    case 'END_AUCTION':
      return {
        ...state,
        completed: true,
        isActive: false
      }

    default:
      return state
  }
}
