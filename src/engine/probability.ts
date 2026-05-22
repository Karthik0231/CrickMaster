import { Outcome, OverPhase, Player, Team, Strategy, PitchType, ShotIntent, DeliveryPlan, ExecutionQuality, BoundarySize } from '../state/types'

export interface BallContext {
  batsman: Player
  bowler: Player
  battingTeam: Team
  bowlingTeam: Team
  phase: OverPhase
  requiredRR?: number
  currentRR: number
  wicketsInHand: number
  ballsLeft: number
  battingStrategy: Strategy
  bowlingStrategy: Strategy
  pitch: PitchType
  boundarySize: BoundarySize
  pressure: number // 0-100
  momentum: number // -100 to +100
  batsmanBallsFaced: number
  dotsInARow: number
  isUserBatting: boolean
  isUserBowling: boolean
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
    'W': 1.5,
    'Wd': 1.5,
    'Nb': 0.5,
  }
}

// --- STEP 1: BOWLER CHOOSES DELIVERY PLAN ---
function chooseDeliveryPlan(ctx: BallContext): DeliveryPlan {
  const { bowler, phase, bowlingStrategy, pitch, pressure } = ctx
  const isSpinner = bowler.name.toLowerCase().includes('spin') || bowler.role === 'ALL'
  
  const rand = Math.random() * 100
  
  if (phase === 'Death') {
    if (bowlingStrategy === 'Aggressive') {
      if (rand < 40) return 'Yorker'
      if (rand < 60) return 'WideYorker'
      if (rand < 80) return 'Bouncer'
      return 'Slower'
    } else {
      if (rand < 50) return 'WideYorker'
      if (rand < 80) return 'Yorker'
      return 'Slower'
    }
  }

  if (phase === 'Powerplay') {
    if (bowlingStrategy === 'Aggressive') {
      if (rand < 60) return 'FullAttacking'
      if (rand < 90) return 'GoodLength'
      return 'Bouncer'
    }
    return 'GoodLength'
  }

  // Middle Overs
  if (isSpinner) {
    if (bowlingStrategy === 'Aggressive') return rand < 70 ? 'SpinAttacking' : 'SpinDefensive'
    return rand < 70 ? 'SpinDefensive' : 'SpinAttacking'
  }

  if (bowlingStrategy === 'Defensive') return 'BackOfLength'
  return 'GoodLength'
}

// --- STEP 2: BATTER CHOOSES SHOT INTENT ---
function chooseShotIntent(ctx: BallContext, delivery: DeliveryPlan): ShotIntent {
  const { batsman, battingStrategy, phase, requiredRR, wicketsInHand, batsmanBallsFaced, pressure } = ctx
  const isSet = batsmanBallsFaced >= 20
  const isNew = batsmanBallsFaced <= 7
  
  const rand = Math.random() * 100

  // Desperation logic
  if (requiredRR && requiredRR > 15 && ctx.ballsLeft < 18) return 'Desperation'
  if (battingStrategy === 'Aggressive' && phase === 'Death') return 'Slog'

  if (battingStrategy === 'Defensive') {
    if (isNew || pressure > 70) return 'Defend'
    return rand < 60 ? 'Single' : 'Gap'
  }

  if (battingStrategy === 'Aggressive') {
    if (isSet || phase === 'Powerplay') return rand < 60 ? 'Lofted' : 'Slog'
    return rand < 50 ? 'ControlledBoundary' : 'Lofted'
  }

  // Normal / Balanced
  if (isNew) return rand < 70 ? 'Defend' : 'Single'
  if (isSet) return rand < 40 ? 'Gap' : (rand < 80 ? 'ControlledBoundary' : 'Lofted')
  
  return rand < 50 ? 'Single' : 'Gap'
}

// --- STEP 3: EXECUTION QUALITY ---
function evaluateExecution(skill: number, intent: string, pressure: number): ExecutionQuality {
  let score = skill + (Math.random() * 40 - 20) - (pressure / 4)
  if (score > 85) return 'Perfect'
  if (score > 65) return 'Good'
  if (score > 40) return 'Average'
  return 'Poor'
}

export function computeWeights(ctx: BallContext): Weights {
  const { batsman, bowler, pitch, pressure, batsmanBallsFaced, dotsInARow } = ctx
  const w = baseWeights()
  
  // 1. Choose Delivery & Shot
  const delivery = chooseDeliveryPlan(ctx)
  const shot = chooseShotIntent(ctx, delivery)
  
  // 2. Evaluate Execution
  const bowlerExec = evaluateExecution(bowler.bowlingRating, delivery, pressure)
  const batterExec = evaluateExecution(batsman.battingRating, shot, pressure)
  
  // 3. Apply Modifiers based on Matchup
  
  // Dot Ball Pressure Logic: After 3 dots, batsman becomes restless (Higher Aggression/Risk)
  if (dotsInARow >= 3) {
    w['4'] *= 1.5
    w['6'] *= 1.8
    w['W'] *= 1.4 // Higher risk of throwing it away
    w['0'] *= 0.7
  }

  // Set Status Rules
  if (batsmanBallsFaced <= 7) { // New
    w['W'] *= 1.8
    w['0'] *= 1.4
    w['4'] *= 0.6
    w['6'] *= 0.4
  } else if (batsmanBallsFaced >= 20) { // Set
    w['W'] *= 0.6
    w['0'] *= 0.7
    w['4'] *= 1.4
    w['6'] *= 1.5
    w['1'] *= 1.2 // Better rotation
  }

  // Pressure in Low Chases: If required RR is very low (< 4), but pressure is rising (wickets lost)
  // Batters might "freeze", increasing dot ball probability
  if (ctx.requiredRR && ctx.requiredRR < 4 && pressure > 50) {
    w['0'] *= 1.3
    w['1'] *= 0.8
    w['W'] *= 1.2 // Panic sets in
  }

  // Shot vs Delivery Matchup
  if (shot === 'Defend') {
    w['W'] *= 0.3
    w['0'] *= 3.0
    w['4'] *= 0.05
    w['6'] *= 0
  } else if (shot === 'Slog') {
    w['W'] *= 2.5
    w['6'] *= 3.0
    w['4'] *= 1.5
    w['0'] *= 0.5
  }

  // Matchup Logic: Finishers vs Part-timers at the end
  const isFinisher = batsman.battingRating > 80 && batsman.power > 80
  const isPartTimer = bowler.bowlingRating < 75
  if (isFinisher && isPartTimer && ctx.phase === 'Death') {
    w['6'] *= 1.5
    w['4'] *= 1.3
    w['0'] *= 0.6
  }

  // Execution Impact - Making it even more decisive
  if (batterExec === 'Perfect') {
    w['4'] *= 2.5
    w['6'] *= 3.0
    w['W'] *= 0.1
    w['0'] *= 0.4
  } else if (batterExec === 'Poor') {
    w['W'] *= 4.0
    w['0'] *= 2.5
    w['4'] *= 0.1
    w['6'] *= 0.05
  }

  if (bowlerExec === 'Perfect') {
    w['W'] *= 2.5
    w['0'] *= 2.5
    w['4'] *= 0.2
    w['6'] *= 0.1
  } else if (bowlerExec === 'Poor') {
    w['4'] *= 2.5
    w['6'] *= 2.0
    w['W'] *= 0.4
    w['0'] *= 0.5
  }

  // Pitch Impact
  if (pitch === 'Flat') {
    w['4'] *= 1.3; w['6'] *= 1.3; w['W'] *= 0.7
  } else if (pitch === 'Turning') {
    if (bowler.role === 'ALL' || bowler.name.toLowerCase().includes('spin')) {
      w['W'] *= 1.6; w['0'] *= 1.3; w['4'] *= 0.7
    }
  } else if (pitch === 'Seaming') {
    if (bowler.role === 'BOWL' && !bowler.name.toLowerCase().includes('spin')) {
      w['W'] *= 1.6; w['0'] *= 1.3; w['4'] *= 0.7
    }
  }

  // Boundary Size
  if (ctx.boundarySize === 'Short') {
    w['4'] *= 1.2; w['6'] *= 1.4
  } else if (ctx.boundarySize === 'Large') {
    w['4'] *= 0.8; w['6'] *= 0.7; w['2'] *= 1.4
  }

  // Cleanup: Ensure no negative or zero weights
  for (const k of Object.keys(w) as Outcome[]) {
    w[k] = Math.max(0.01, w[k])
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
