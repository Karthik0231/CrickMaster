import { Outcome, OverPhase, Player, Team, Strategy, PitchType } from '../state/types'

export interface BallContext {
  batsman: Player
  bowler: Player
  battingTeam: Team
  bowlingTeam: Team
  phase: OverPhase
  requiredRR?: number
  battingStrategy: Strategy
  bowlingStrategy: Strategy
  pitch: PitchType
  pressure: number // 0-100
  momentum: number // -100 to +100
  settledLevel: number // 0-100
}

type Weights = Record<Outcome, number>

export function outcomeRuns(outcome: Outcome) {
  if (outcome === 'W') return 0
  if (outcome === 'Wd') return 1
  if (outcome === 'Nb') return 1
  return parseInt(outcome, 10)
}

function baseWeights(): Weights {
  return {
    '0': 35,
    '1': 25,
    '2': 8,
    '3': 1,
    '4': 10,
    '6': 4,
    'W': 3,
    'Wd': 1.5,
    'Nb': 0.5,
  }
}

function applyStrategy(w: Weights, ctx: BallContext) {
  // BATTING STRATEGY (Per-batsman)
  if (ctx.battingStrategy === 'Defensive') {
    w['4'] *= 0.60
    w['6'] *= 0.50
    w['W'] *= 0.65
    w['0'] *= 1.20
  } else if (ctx.battingStrategy === 'Aggressive') {
    w['4'] *= 1.45
    w['6'] *= 1.60
    w['W'] *= 1.35
    w['0'] *= 0.75
  }

  // BOWLING STRATEGY
  if (ctx.bowlingStrategy === 'Defensive') {
    w['4'] *= 0.75
    w['6'] *= 0.75
    w['W'] *= 0.80
  } else if (ctx.bowlingStrategy === 'Aggressive') {
    w['W'] *= 1.25
    w['4'] *= 1.10
    w['6'] *= 1.15
  }
}

function applyPhase(w: Weights, phase: OverPhase) {
  if (phase === 'Powerplay') {
    w['4'] *= 1.30
    w['6'] *= 1.25
    w['W'] *= 1.10
  } else if (phase === 'Death') {
    w['6'] *= 1.75
    w['W'] *= 1.40
    w['0'] *= 0.65
  }
}

function applyPressureAndMomentum(w: Weights, ctx: BallContext) {
  // Pressure impact: higher pressure -> more wickets for low experience
  const expFactor = ctx.batsman.experience / 100
  // Professional players (exp > 80) handle pressure 2x better
  const pressureEffect = (ctx.pressure / 100) * (2.0 - expFactor * 1.5)

  w['W'] *= (1 + Math.max(0, pressureEffect))
  w['4'] *= (1 - Math.max(0, pressureEffect * 0.5))
  w['6'] *= (1 - Math.max(0, pressureEffect * 0.7))

  // MOMENTUM ENGINE (-100 to +100)
  const m = ctx.momentum / 100
  if (m > 0) { // Batting team has momentum
    w['4'] *= (1 + m * 0.6)
    w['6'] *= (1 + m * 0.8)
    w['W'] *= (1 - m * 0.4)
    w['1'] *= (1 + m * 0.2) // Better strike rotation
  } else if (m < 0) { // Bowling momentum
    const am = Math.abs(m)
    w['W'] *= (1 + am * 0.8)
    w['0'] *= (1 + am * 0.3)
    w['4'] *= (1 - am * 0.5)
  }
}

function applySettling(w: Weights, settled: number) {
  const s = settled / 100

  // If not settled (initial balls is dangerous)
  if (s < 0.15) {
    w['W'] *= (2.0 - s) // 2x risk on ball 1
    w['4'] *= 0.5
    w['6'] *= 0.3
  } else if (s > 0.7) {
    w['W'] *= 0.7
    w['4'] *= (1.4 + s * 0.3)
    w['6'] *= (1.5 + s * 0.5)
  }
}

function applySkills(w: Weights, ctx: BallContext) {
  const batRating = ctx.batsman.battingRating
  const bowlRating = ctx.bowler.bowlingRating
  // Reduced skill impact for better balance (was too strong)
  const diff = (batRating - bowlRating) / 10 // scale of -10 to +10 usually

  // Reduced multipliers from 0.5/0.6/0.45 to 0.25/0.3/0.25 for better balance
  w['4'] *= (1 + diff * 0.25) // 2.5% change per point of diff (was 5%)
  w['6'] *= (1 + diff * 0.3)  // 3% change per point (was 6%)
  w['W'] *= (1 - diff * 0.25) // 2.5% change per point (was 4.5%)

  // Elite batsmen (90+) get a "Mastery" bonus (reduced from 0.85/1.15)
  if (batRating >= 90) {
    w['0'] *= 0.90  // Less reduction in dots (was 0.85)
    w['1'] *= 1.10  // Less bonus to singles (was 1.15)
  }
}

function applyPitch(w: Weights, pitch: PitchType) {
  if (pitch === 'Batting') {
    w['4'] *= 1.20
    w['W'] *= 0.80
  } else if (pitch === 'Bowling') {
    w['W'] *= 1.30
    w['4'] *= 0.80
  }
}

export function computeWeights(ctx: BallContext): Weights {
  const w = baseWeights()

  applyStrategy(w, ctx)
  applyPhase(w, ctx.phase)
  applySettling(w, ctx.settledLevel)
  applyPressureAndMomentum(w, ctx)
  applySkills(w, ctx)
  applyPitch(w, ctx.pitch)

  // Cleanup: Ensure no negative or zero weights
  for (const k of Object.keys(w) as Outcome[]) {
    w[k] = Math.max(0.05, w[k])
  }
  return w
}

export function chooseOutcome(w: Weights): Outcome {
  const entries = Object.entries(w) as [Outcome, number][]
  const total = entries.reduce((a, [, v]) => a + v, 0)
  const r = Math.random() * total
  let acc = 0
  for (const [out, wt] of entries) {
    acc += wt
    if (r <= acc) return out
  }
  return '0'
}
