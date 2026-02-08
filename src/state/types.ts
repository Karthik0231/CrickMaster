export type GameMode = 'Quick' | 'Series' | 'IPL' | 'WorldCup' | 'Career'
export type MatchFormat = 'T20' | 'ODI' | 'Test'

export type Outcome = '0' | '1' | '2' | '3' | '4' | '6' | 'W' | 'Wd' | 'Nb'
export type OverPhase = 'Powerplay' | 'Middle' | 'Death'
export type Strategy = 'Defensive' | 'Normal' | 'Aggressive'
export type PitchType = 'Batting' | 'Bowling' | 'Balanced'
export type Role = 'BAT' | 'BOWL' | 'ALL' | 'WK'

export interface PlayerStats {
  matches: number
  runs: number
  balls: number
  wickets: number
  ballsBowled: number
  runsConceded: number
  fours: number
  sixes: number
  outs: number
  catches: number
  stumpings: number
  fifties: number
  hundreds: number
  fiveWickets: number
}

export interface Player {
  id: string
  name: string
  country: string
  role: Role
  age: number
  battingRating: number
  bowlingRating: number
  fieldingRating: number
  experience: number // 0-100
  fitness: number // 0-100
  form: number // -10 to +10
  value: number // Auction value in Cr
  career: PlayerStats
  seasonStats?: PlayerStats
}

export interface Team {
  id: string
  name: string
  short: string
  color: string
  battingRating: number
  bowlingRating: number
  players: Player[]
  budget?: number // For IPL/Career
  points?: number
  nrr?: number
  played?: number
  won?: number
  lost?: number
  tied?: number
}

export type DismissalType = 'Bowled' | 'Caught' | 'LBW' | 'Run Out' | 'Stumped' | 'Hit Wicket'

export interface WicketDetails {
  type: DismissalType
  batsmanId: string
  bowlerId: string
  fielderId?: string
  text: string // e.g., "Kohli c Smith b Starc"
}

export interface BallEvent {
  over: number
  ball: number
  outcome: Outcome
  runs: number
  wicket: boolean
  wicketDetails?: WicketDetails
  extraType?: 'Wide' | 'NoBall'
  strikerId: string
  nonStrikerId: string
  bowlerId: string
  battingStrategy: Strategy
  bowlingStrategy: Strategy
  text: string
}

export interface InningsState {
  battingTeamId: string
  bowlingTeamId: string
  runs: number
  wickets: number
  balls: number
  overs: number
  target?: number
  runRate: number
  requiredRunRate?: number // RRR for chasing team
  events: BallEvent[]
  overOutcomes: Outcome[][]
  strikerId: string
  nonStrikerId: string
  currentBowlerId: string
  nextBatsmanIndex: number // Index in batting order
  battingOrder: string[] // Player IDs
  bowlingOrder: string[] // Player IDs (rotation logic)
  fallOfWickets: { runs: number; wickets: number; ball: number; batsmanId: string; bowlerId: string; type: DismissalType }[]
  partnerships: { batsman1Id: string; batsman2Id: string; runs: number; balls: number }[]
  completed: boolean
  battingStrategy: Strategy
  bowlingStrategy: Strategy
  strikerStrategy?: Strategy // Per-striker mode
  nonStrikerStrategy?: Strategy // Per-non-striker mode
  momentum: number // -100 to +100
  pressure: number // 0-100
  intentPhase: OverPhase
  batsmanSettling: Record<string, { balls: number; settled: number }> // Tracker
  bowlerOverCounts: Record<string, number>
}

export interface Toss {
  winnerTeamId: string
  decision: 'Bat' | 'Bowl'
}

export interface MatchConfig {
  overs: number
  mode: GameMode
  format: MatchFormat
  strategy: Strategy // Batting strategy
  bowlingStrategy: Strategy // Bowling strategy
  pitch: PitchType
  stadium: string
}

export interface MatchState {
  id: string
  config: MatchConfig
  homeTeam: Team
  awayTeam: Team
  userTeamId: string | null // Who is the human player?
  toss?: Toss
  innings1?: InningsState
  innings2?: InningsState
  currentInnings: 1 | 2
  commentary: string[]
  matchCompleted: boolean
  winnerId?: string
  victoryMargin?: string
  momId?: string
  waitingForBatsman?: boolean // UI Control Flow
}

export interface TournamentFixture {
  id: string
  homeTeamId: string
  awayTeamId: string
  round: string // "Group A", "Final", etc.
  completed: boolean
  winnerId?: string
  result?: string
}

export interface TournamentState {
  id: string
  mode: GameMode
  name: string
  userTeamId: string | null // The team selected by the user
  teams: Team[]
  fixtures: TournamentFixture[]
  currentRoundIndex: number
  status: 'IN_PROGRESS' | 'COMPLETED'
  stage: 'Group' | 'Knockout' | 'Semi Final' | 'Final'
  overs: number
  table: {
    teamId: string
    p: number
    w: number
    l: number
    t: number
    nrr: number
    pts: number
    runsScored: number
    oversFaced: number
    runsConceded: number
    oversBowled: number
  }[]
}

export interface AuctionPlayer extends Player {
  basePrice: number
  soldPrice?: number
  soldToTeamId?: string
  isUnsold?: boolean
  isOverseas?: boolean
  reAuctioned?: boolean
}

export interface AuctionState {
  isActive: boolean
  pool: AuctionPlayer[]
  unsoldPool: AuctionPlayer[] // For re-auctioning
  currentPlayerIndex: number
  currentBid: number
  currentBidderId: string | null
  activeBidderIds: string[] // Teams currently in for this player
  noBidCounter: number // 0: Normal, 1: Going once, 2: Going twice
  status: 'Waiting' | 'Bidding' | 'GoingOnce' | 'GoingTwice' | 'Sold' | 'Unsold'
  isUnsoldRound: boolean
  teams: Team[]
  completed: boolean
  log: string[]
}

export interface CareerPlayerUpgrade {
  playerId: string
  type: 'BAT' | 'BOWL' | 'FITNESS'
  cost: number
  increase: number
}

export interface CareerSeason {
  year: number
  won: number
  lost: number
  points: number
  standing: number
}

export interface CareerState {
  isActive: boolean
  userTeamId: string
  balance: number // In Crores
  level: number
  experience: number
  seasons: CareerSeason[]
  currentSeason: number
  squad: Team
  transferMarket: Player[]
  isSeasonStarted: boolean
}

export interface MatchHistoryEntry {
  matchId: string
  mode: GameMode
  teams: {
    home: { id: string; name: string; score: string }
    away: { id: string; name: string; score: string }
  }
  result: string
  winnerId?: string
  momId?: string
  date: string
  tournamentId?: string
  overs: number
  format: MatchFormat
  fullState?: MatchState // Persistent scorecard data
}

export interface GlobalStats {
  playerStats: Record<string, PlayerStats> // Combined stats across all modes/seasons
  teamStats: Record<string, {
    wins: number
    losses: number
    titles: number
    highestScore: number
    lowestScore: number
    matches: number
  }>
}

export interface AppState {
  // Navigation & UI
  activeMode: GameMode | null
  activeScreen: 'Home' | 'Match' | 'MatchSummary' | 'Tournament' | 'Auction' | 'Career' | 'History' | 'Stats' | 'Settings' | 'TeamSelect'

  // Persistent Data
  currentMatch: MatchState | null
  activeTournamentId: string | null
  tournaments: TournamentState[]
  matchHistory: MatchHistoryEntry[]
  globalStats: GlobalStats
  career: CareerState | null
  auction: AuctionState | null

  // Global Setup
  teams: Team[] // Global team pool (read-only base)
  userTeamId: string | null
}
