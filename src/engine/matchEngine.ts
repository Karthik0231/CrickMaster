import { computeWeights, chooseOutcome, outcomeRuns } from './probability'
import {
  BallEvent,
  InningsState,
  MatchConfig,
  MatchState,
  Outcome,
  OverPhase,
  Team,
  Player,
  Strategy,
  DismissalType,
  WicketDetails,
} from '../state/types'

function uuid() {
  return Math.random().toString(36).slice(2)
}

function getPlayer(state: MatchState, teamId: string, playerId: string): Player {
  const team = state.homeTeam.id === teamId ? state.homeTeam : state.awayTeam
  return team.players.find((p) => p.id === playerId)!
}

function phaseForBall(balls: number, totalOvers: number): OverPhase {
  const over = Math.floor(balls / 6)
  if (over < 6) return 'Powerplay'
  if (over >= totalOvers - 4) return 'Death'
  return 'Middle'
}

function phaseForInnings(inn: InningsState, config: MatchConfig): OverPhase {
  return phaseForBall(inn.balls, config.overs)
}

function nextBowlerId(team: Team, totalOvers: number, over: number, innings: InningsState): string {
  const isDeath = over >= totalOvers - 5
  const isPowerplay = over < 6
  const maxOversPerBowler = Math.ceil(totalOvers / 5)

  // Filter available bowlers
  const available = team.players.filter(p => {
    if (p.role === 'WK') return false
    if (p.id === innings.currentBowlerId) return false
    const bowled = innings.bowlerOverCounts[p.id] || 0
    return bowled < maxOversPerBowler
  })
  
  // Calculate suitability score
  const scoredBowlers = available.map(p => {
    let score = p.bowlingRating
    const isSpinner = p.name.toLowerCase().includes('spin') || p.role.includes('SPIN')
    
    // Role Bonus
    if (p.role === 'BOWL') score += 10
    if (p.role === 'ALL') score += 5

    // Phase adjustments
    if (isDeath) {
        if (!isSpinner) score += 15 // Pace preferred at death
        if (p.bowlingRating > 85) score += 10 // Best bowlers at death
    } else if (isPowerplay) {
        if (!isSpinner) score += 5 // Pace preferred in PP
        if (p.bowlingRating > 80) score += 5 // Good bowlers start
    } else {
        // Middle overs
        if (isSpinner) score += 15 // Spinners operate in middle
    }

    // Save best pace for death (if in middle overs)
    if (!isDeath && !isPowerplay && !isSpinner && p.bowlingRating > 85 && (innings.bowlerOverCounts[p.id] || 0) < maxOversPerBowler - 1) {
        score -= 15
    }

    return { id: p.id, score }
  })

  // Sort by score
  scoredBowlers.sort((a, b) => b.score - a.score)

  if (scoredBowlers.length === 0) {
     // Fallback: anyone valid (even if consecutive check failed? No, that's illegal)
     // This shouldn't happen with standard squad unless injuries (not implemented)
     return team.players.find(p => p.id !== innings.currentBowlerId)?.id || team.players[0].id
  }

  // Pick top bowler
  return scoredBowlers[0].id
}

function updateRunRate(runs: number, balls: number) {
  const overs = balls / 6
  return overs === 0 ? 0 : +(runs / overs).toFixed(2)
}

function rotateStrike(outcome: Outcome, strikerId: string, nonStrikerId: string) {
  if (outcome === '1' || outcome === '3' || outcome === 'Nb' || outcome === 'Wd') {
    return [nonStrikerId, strikerId] as const
  }
  return [strikerId, nonStrikerId] as const
}

function generateDismissal(
  striker: Player,
  bowler: Player,
  state: MatchState,
  battingStrategy: Strategy,
  bowlingStrategy: Strategy,
  phase: OverPhase
): WicketDetails {
  const types: DismissalType[] = ['Caught', 'Bowled', 'LBW']

  if (battingStrategy === 'Aggressive') {
    types.push('Caught', 'Caught', 'Stumped')
  }

  if (phase === 'Death') {
    types.push('Caught', 'Caught', 'Bowled')
  }

  const isPace = !bowler.name.toLowerCase().includes('spin') && bowler.bowlingRating > 75
  if (isPace && battingStrategy === 'Defensive') types.push('LBW', 'Bowled')

  const type = types[Math.floor(Math.random() * types.length)]
  const bowlName = bowler.name.split(' ').pop()
  const batName = striker.name.split(' ').pop()

  const fieldingTeam = state.homeTeam.players.some(p => p.id === bowler.id) ? state.homeTeam : state.awayTeam
  const fielders = fieldingTeam.players.filter(p => p.id !== bowler.id)
  const fielder = fielders[Math.floor(Math.random() * fielders.length)]
  const fielderName = fielder.name.split(' ').pop()

  let text = `${batName} ${type === 'Bowled' ? 'b' : type === 'Caught' ? 'c' : type.toLowerCase()} ${bowlName}`
  if (type === 'Caught') text = `${batName} c ${fielderName} b ${bowlName}`
  if (type === 'Stumped') text = `${batName} st ${fielderName} b ${bowlName}`

  return { type, batsmanId: striker.id, bowlerId: bowler.id, fielderId: fielder.id, text }
}

function updatePressureAndMomentum(event: BallEvent, inn: InningsState, config: MatchConfig) {
  // MOMENTUM ENGINE (-100 to +100)
  if (event.outcome === '4') inn.momentum = Math.min(100, (inn.momentum || 0) + 12)
  else if (event.outcome === '6') inn.momentum = Math.min(100, (inn.momentum || 0) + 18)
  else if (event.outcome === '0') inn.momentum = Math.max(-100, (inn.momentum || 0) - 3)
  else if (event.wicket) inn.momentum = Math.max(-100, (inn.momentum || 0) - 45)

  // Big over check
  const recentEvents = inn.events.slice(-6)
  const overRuns = recentEvents.reduce((acc, e) => acc + e.runs, 0)
  if (overRuns > 15) inn.momentum = Math.min(100, inn.momentum + 25)

  // Partnership bonus
  const activePartnership = inn.partnerships[inn.partnerships.length - 1]
  if (activePartnership && activePartnership.runs > 50 && activePartnership.runs % 50 === 0) {
    inn.momentum = Math.min(100, inn.momentum + 20)
  }

  // PRESSURE ENGINE
  let p = 0
  const totalBalls = config.overs * 6 // Use config.overs directly
  const ballsLeft = totalBalls - inn.balls
  const oversLeft = ballsLeft / 6

  if (inn.target !== undefined) {
    const runsLeft = inn.target - inn.runs
    const rrr = +(runsLeft / (oversLeft || 1)).toFixed(2)
    p += Math.max(0, (rrr - 7) * 10)

    // Chase pressure
    if (ballsLeft < 18 && runsLeft > ballsLeft) p += 60
  }

  p += inn.wickets * 15
  const recentWickets = inn.events.slice(-12).filter(e => e.wicket).length
  p += recentWickets * 25

  // Momentum decay
  inn.momentum *= 0.94

  inn.pressure = Math.min(100, Math.floor(p))
}

function updatePartnership(inn: InningsState, runs: number, balls: boolean, commentary: string[]) {
  if (!inn.partnerships) inn.partnerships = []
  let current = inn.partnerships.find(p =>
    (p.batsman1Id === inn.strikerId && p.batsman2Id === inn.nonStrikerId) ||
    (p.batsman2Id === inn.strikerId && p.batsman1Id === inn.nonStrikerId)
  )

  if (!current) {
    current = { batsman1Id: inn.strikerId, batsman2Id: inn.nonStrikerId, runs: 0, balls: 0 }
    inn.partnerships.push(current)
  }

  const prevRuns = current.runs
  current.runs += runs
  if (balls) current.balls += 1

  // Milestone alerts in commentary
  if (current.runs >= 50 && prevRuns < 50) {
    commentary.push(`MILESTONE: A valuable 50-run partnership is established!`)
  } else if (current.runs >= 100 && prevRuns < 100) {
    commentary.push(`INCREDIBLE: A massive 100-run partnership! The bowling side is under serious pressure now.`)
  }
}

function applyCareer(event: BallEvent, state: MatchState, inn: InningsState) {
  const b = getPlayer(state, inn.battingTeamId, event.strikerId)
  const w = getPlayer(state, inn.bowlingTeamId, event.bowlerId)

  if (event.outcome !== 'Wd') b.career.balls += 1
  b.career.runs += event.runs
  if (event.outcome === '4') b.career.fours += 1
  if (event.outcome === '6') b.career.sixes += 1
  if (event.outcome === 'W') {
    b.career.outs += 1
    w.career.wickets += 1
  }

  if (event.outcome !== 'Wd' && event.outcome !== 'Nb') w.career.ballsBowled += 1
  w.career.runsConceded += event.runs
}

function commentaryFor(event: BallEvent, striker: Player, bowler: Player): string {
  const base = `${event.over}.${event.ball}: `
  if (event.wicket && event.wicketDetails) return `${base}OUT! ${event.wicketDetails.text}`
  const bowlerName = bowler.name.split(' ').pop()
  const batName = striker.name.split(' ').pop()
  const o = event.outcome
  if (o === '0') return `${base}${bowlerName} to ${batName}, solid defense, no run.`
  if (o === '4') return `${base}FOUR! Magnificently timed through the gap by ${batName}!`
  if (o === '6') return `${base}SIX! Put away into the stands with absolute power!`
  if (o === 'Wd') return `${base}Wide ball, ${bowlerName} missing the mark.`
  if (o === 'Nb') return `${base}No Ball! Free hit coming up.`
  return `${base}${event.runs} run${event.runs > 1 ? 's' : ''}, good rotation of strike by ${batName}.`
}

function initialInnings(batId: string, bowlId: string, batOrder: string[], bowlOrder: string[]): InningsState {
  return {
    battingTeamId: batId,
    bowlingTeamId: bowlId,
    runs: 0,
    wickets: 0,
    balls: 0,
    overs: 0,
    runRate: 0,
    events: [],
    overOutcomes: [],
    strikerId: batOrder[0],
    nonStrikerId: batOrder[1],
    currentBowlerId: bowlOrder[0],
    nextBatsmanIndex: 2,
    battingOrder: batOrder,
    bowlingOrder: bowlOrder,
    fallOfWickets: [],
    partnerships: [],
    completed: false,
    battingStrategy: 'Normal',
    bowlingStrategy: 'Normal',
    strikerStrategy: 'Normal',
    nonStrikerStrategy: 'Normal',
    momentum: 0,
    pressure: 0,
    intentPhase: 'Powerplay',
    batsmanSettling: {},
    bowlerOverCounts: {}
  }
}

export function setupNewMatch(params: {
  home: Team
  away: Team
  config: MatchConfig
}): { initState: MatchState } {
  const tossWinner = Math.random() < 0.5 ? params.home : params.away
  const tossLoser = tossWinner.id === params.home.id ? params.away : params.home
  const decision: 'Bat' | 'Bowl' = Math.random() < 0.5 ? 'Bat' : 'Bowl'
  const firstBat = decision === 'Bat' ? tossWinner : tossLoser
  const firstBowl = decision === 'Bat' ? tossLoser : tossWinner

  const innings1 = initialInnings(
    firstBat.id,
    firstBowl.id,
    firstBat.players.map(p => p.id),
    firstBowl.players.map(p => p.id)
  )

  innings1.currentBowlerId = nextBowlerId(firstBowl, params.config.overs, 0, innings1)

  const state: MatchState = {
    id: uuid(),
    config: params.config,
    homeTeam: params.home,
    awayTeam: params.away,
    userTeamId: null,
    toss: { winnerTeamId: tossWinner.id, decision },
    innings1,
    innings2: undefined,
    currentInnings: 1,
    commentary: [],
    matchCompleted: false,
  }
  return { initState: state }
}

export function getAIStrategy(inn: InningsState, config: MatchConfig, isStriker: boolean): Strategy {
  const totalBalls = config.overs * 6 // Use config.overs directly
  const ballsLeft = totalBalls - inn.balls
  const oversLeft = ballsLeft / 6
  const wicketsLeft = 10 - inn.wickets

  if (inn.target === undefined) {
    if (inn.intentPhase === 'Powerplay' && wicketsLeft > 8) return 'Aggressive'
    if (inn.intentPhase === 'Death' && wicketsLeft > 3) return 'Aggressive'
    if (wicketsLeft < 3 && ballsLeft > 18) return 'Defensive'
    return 'Normal'
  }

  const runsNeeded = inn.target - inn.runs
  const rrr = runsNeeded / (oversLeft || 1)
  const currentRR = inn.runs / (inn.balls / 6 || 1)

  // 1. Desperation / High RRR
  if (rrr > 10) return 'Aggressive'

  // 2. Ahead of the rate (Comfortable chase)
  if (rrr < 6) {
    // If running out of wickets, be defensive to survive
    if (wicketsLeft < 4) return 'Defensive'
    // Otherwise cruise
    return 'Normal'
  }

  // 3. Falling behind
  if (rrr > currentRR + 2) return 'Aggressive'

  // 4. Last pair desperation
  if (wicketsLeft < 2 && rrr > 8) return 'Aggressive'

  // 5. Consolidate if lost wickets recently or just stabilizing
  if (wicketsLeft < 4 && rrr < 8) return 'Defensive'

  return 'Normal'
}

export function getAIBowlingStrategy(inn: InningsState, config: MatchConfig): Strategy {
  const wicketsLeft = 10 - inn.wickets
  const momentum = inn.momentum || 0
  const totalBalls = config.overs * 6
  const ballsLeft = totalBalls - inn.balls
  
  // 1. First Innings (Restriction)
  if (inn.target === undefined) {
    if (inn.intentPhase === 'Death') return 'Defensive' // Restrict runs at death
    if (inn.intentPhase === 'Powerplay') return 'Aggressive' // Look for early wickets
    if (wicketsLeft > 7 || momentum < -30) return 'Aggressive' // Wicket hunting
    return 'Normal'
  }

  // 2. Second Innings (Defending Target)
  const oversLeft = ballsLeft / 6
  const rrr = (inn.target - inn.runs) / (oversLeft || 1)

  // Death Overs Defending
  if (ballsLeft <= 30) {
      if (rrr > 12) return 'Defensive' // They need a miracle, just don't bowl wides
      if (rrr > 8) return 'Defensive' // Tight bowling
      return 'Aggressive' // They are cruising, need wickets desperately
  }

  if (rrr < 6) return 'Aggressive' // They are cruising, attack!
  if (rrr > 10) return 'Defensive' // Pressure is on them, keep it tight

  return 'Normal'
}

export function simulateBall(state: MatchState, isInteractive: boolean = true): { event: BallEvent; innings: InningsState } {
  const inn = state.currentInnings === 1 ? state.innings1! : state.innings2!
  const isUserBatting = state.userTeamId === inn.battingTeamId
  const isUserBowling = state.userTeamId === inn.bowlingTeamId

  // Update Settling Tracker
  if (!inn.batsmanSettling[inn.strikerId]) inn.batsmanSettling[inn.strikerId] = { balls: 0, settled: 0 }
  if (!inn.batsmanSettling[inn.nonStrikerId]) inn.batsmanSettling[inn.nonStrikerId] = { balls: 0, settled: 0 }

  const strikerSettled = inn.batsmanSettling[inn.strikerId]

  // Intent Phase Update
  inn.intentPhase = phaseForInnings(inn, state.config)

  // CRITICAL: Re-evaluate AI strategy EVERY BALL (not just once per over)
  // This makes the AI dynamic and responsive to match situation
  if (!isUserBatting) {
    // AI re-calculates batting strategy based on current match situation
    const newStrikerStrat = getAIStrategy(inn, state.config, true)
    const newNonStrikerStrat = getAIStrategy(inn, state.config, false)

    inn.strikerStrategy = newStrikerStrat
    inn.nonStrikerStrategy = newNonStrikerStrat
  }

  if (!isUserBowling) {
    // AI re-calculates bowling strategy based on current match situation
    inn.bowlingStrategy = getAIBowlingStrategy(inn, state.config)
  }

  // Use current strategies for this ball
  let sStrat = inn.strikerStrategy || 'Normal'
  let bowlStrat = inn.bowlingStrategy || 'Normal'

  const striker = getPlayer(state, inn.battingTeamId, inn.strikerId)
  const bowler = getPlayer(state, inn.bowlingTeamId, inn.currentBowlerId)
  const batTeam = state.homeTeam.id === inn.battingTeamId ? state.homeTeam : state.awayTeam
  const bowlTeam = state.homeTeam.id === inn.bowlingTeamId ? state.homeTeam : state.awayTeam

  const weights = computeWeights({
    batsman: striker,
    bowler,
    battingTeam: batTeam,
    bowlingTeam: bowlTeam,
    phase: inn.intentPhase,
    battingStrategy: sStrat,
    bowlingStrategy: bowlStrat,
    pitch: state.config.pitch,
    pressure: inn.pressure || 0,
    momentum: inn.momentum || 0,
    settledLevel: strikerSettled.settled
  })

  // STRATEGY TUNING (PHASE 8)
  // If Normal strategy, slightly boost singles (Outcome 1) to keep board moving
  if (sStrat === 'Normal') {
    weights['1'] *= 1.15;
    weights['0'] *= 0.9; // Reduce dot balls
  }

  // If Aggressive, reduce wicket chance slightly to prevent instant collapse
  if (sStrat === 'Aggressive') {
    weights['W'] *= 0.85;
  }

  const out = chooseOutcome(weights)
  const runs = outcomeRuns(out)
  const isExtra = out === 'Wd' || out === 'Nb'
  const event: BallEvent = {
    over: Math.floor(inn.balls / 6),
    ball: (inn.balls % 6) + 1,
    outcome: out,
    runs,
    wicket: out === 'W',
    extraType: out === 'Wd' ? 'Wide' : out === 'Nb' ? 'NoBall' : undefined,
    strikerId: striker.id,
    nonStrikerId: inn.nonStrikerId,
    bowlerId: bowler.id,
    battingStrategy: sStrat,
    bowlingStrategy: bowlStrat,
    text: '',
  }

  if (event.wicket) {
    event.wicketDetails = generateDismissal(striker, bowler, state, sStrat, bowlStrat, inn.intentPhase)
  }

  if (!isExtra) {
    strikerSettled.balls += 1
    const settleSpeed = sStrat === 'Defensive' ? 8 : sStrat === 'Aggressive' ? 2 : 5
    strikerSettled.settled = Math.min(100, strikerSettled.settled + settleSpeed)
  }

  event.text = commentaryFor(event, striker, bowler)
  applyCareer(event, state, inn)
  inn.events.push(event)
  updatePressureAndMomentum(event, inn, state.config)
  updatePartnership(inn, runs, !isExtra, state.commentary)

  const overIdx = Math.floor(inn.balls / 6)
  if (!inn.overOutcomes[overIdx]) inn.overOutcomes[overIdx] = []
  inn.overOutcomes[overIdx].push(out)
  inn.runs += runs

  if (out === 'W') {
    inn.wickets += 1
    inn.fallOfWickets.push({
      runs: inn.runs,
      wickets: inn.wickets,
      ball: inn.balls,
      batsmanId: striker.id,
      bowlerId: bowler.id,
      type: event.wicketDetails?.type || 'Bowled'
    })

    if (isInteractive && isUserBatting && inn.nextBatsmanIndex < 11) {
      state.waitingForBatsman = true
    } else if (inn.nextBatsmanIndex < 11) {
      const remaining = batTeam.players.filter(p => !inn.fallOfWickets.some(f => f.batsmanId === p.id) && p.id !== inn.strikerId && p.id !== inn.nonStrikerId)
      const best = remaining.sort((a, b) => b.battingRating - a.battingRating)[0]
      inn.strikerId = best.id
      inn.nextBatsmanIndex += 1
    }
  } else {
    const [s, n] = rotateStrike(out, inn.strikerId, inn.nonStrikerId)
    const oldS = inn.strikerId
    inn.strikerId = s
    inn.nonStrikerId = n

    if (s !== oldS) {
      const tmp = inn.strikerStrategy
      inn.strikerStrategy = inn.nonStrikerStrategy
      inn.nonStrikerStrategy = tmp
    }
  }

  if (!isExtra) {
    inn.balls += 1
    if (inn.balls % 6 === 0) {
      inn.bowlerOverCounts[bowler.id] = (inn.bowlerOverCounts[bowler.id] || 0) + 1
    }
  }
  inn.runRate = updateRunRate(inn.runs, inn.balls)
  return { event, innings: inn }
}

export function simulateOver(state: MatchState, isInteractive: boolean = true): { state: MatchState; outcomes: Outcome[] } {
  const inn = state.currentInnings === 1 ? state.innings1! : state.innings2!
  const outcomes: Outcome[] = []
  const startOver = Math.floor(inn.balls / 6)

  while (Math.floor(inn.balls / 6) === startOver && !inn.completed && (isInteractive ? !state.waitingForBatsman : true)) {
    const { event } = simulateBall(state, isInteractive)
    outcomes.push(event.outcome)
    if (inn.wickets >= 10 || (state.currentInnings === 2 && inn.target !== undefined && inn.runs >= inn.target) || inn.balls >= state.config.overs * 6) {
      inn.completed = true
      break
    }
    if (state.waitingForBatsman) break
  }

  inn.overs = Math.floor(inn.balls / 6) + (inn.balls % 6 ? (inn.balls % 6) / 6 : 0)

  if (!inn.completed && (inn.balls % 6 === 0) && !state.waitingForBatsman) {
    const [s, n] = [inn.nonStrikerId, inn.strikerId]
    inn.strikerId = s
    inn.nonStrikerId = n

    const tmp = inn.strikerStrategy
    inn.strikerStrategy = inn.nonStrikerStrategy
    inn.nonStrikerStrategy = tmp

    const bowlTeam = state.homeTeam.id === inn.bowlingTeamId ? state.homeTeam : state.awayTeam
    inn.currentBowlerId = nextBowlerId(bowlTeam, state.config.overs, Math.floor(inn.balls / 6), inn)
  }

  let commentary = [...state.commentary]
  const newEvents = inn.events.slice(-outcomes.length)
  newEvents.forEach(e => commentary.push(e.text))

  let nextState: MatchState = { ...state, commentary }
  if (state.currentInnings === 1) nextState.innings1 = inn
  else nextState.innings2 = inn

  if (state.currentInnings === 1 && inn.completed && !nextState.innings2) {
    nextState = startSecondInnings(nextState)
  } else if (state.currentInnings === 2 && inn.completed) {
    nextState.matchCompleted = true
    const result = determineWinner(nextState)
    nextState.winnerId = result.winnerId
    nextState.victoryMargin = result.margin
  }

  return { state: nextState, outcomes }
}

function determineWinner(state: MatchState): { winnerId?: string; margin?: string } {
  const inn1 = state.innings1!
  const inn2 = state.innings2!
  if (inn2.runs >= inn2.target!) {
    const wkts = 10 - inn2.wickets
    return { winnerId: inn2.battingTeamId, margin: `${wkts} wicket${wkts !== 1 ? 's' : ''}` }
  }
  if (inn1.runs > inn2.runs) {
    const runs = inn1.runs - inn2.runs
    return { winnerId: inn1.battingTeamId, margin: `${runs} run${runs !== 1 ? 's' : ''}` }
  }
  if (inn1.runs === inn2.runs) return { winnerId: undefined, margin: 'Match Tied' }
  return { winnerId: undefined }
}

export function startSecondInnings(state: MatchState): MatchState {
  const i1 = state.innings1!
  const batId = i1.bowlingTeamId
  const bowlId = i1.battingTeamId
  const batTeam = state.homeTeam.id === batId ? state.homeTeam : state.awayTeam
  const bowlTeam = state.homeTeam.id === bowlId ? state.homeTeam : state.awayTeam
  const innings2 = initialInnings(batId, bowlId, batTeam.players.map(p => p.id), bowlTeam.players.map(p => p.id))
  innings2.target = i1.runs + 1
  innings2.currentBowlerId = nextBowlerId(bowlTeam, state.config.overs, 0, innings2)
  return { ...state, innings2, currentInnings: 2 }
}

export function simulateMatch(state: MatchState): MatchState {
  let s = { ...state }
  // Ensure we are in a clean, non-interactive state for full simulation
  s.waitingForBatsman = false

  while (!s.innings1?.completed) {
    if (s.innings1!.wickets >= 10 || s.innings1!.balls >= s.config.overs * 6) {
      s.innings1 = { ...s.innings1!, completed: true }
      break
    }
    // Call simulateOver with isInteractive = false to prevent waiting for batsman selection
    const result = simulateOver(s, false)
    s = result.state
  }

  if (!s.innings2) s = startSecondInnings(s)

  while (!s.innings2?.completed) {
    if (s.innings2!.wickets >= 10 || s.innings2!.balls >= s.config.overs * 6 || s.innings2!.runs >= s.innings2!.target!) {
      s.innings2 = { ...s.innings2!, completed: true }
      break
    }
    // Call simulateOver with isInteractive = false
    const result = simulateOver(s, false)
    s = result.state
  }

  s.matchCompleted = true
  const res = determineWinner(s)
  s.winnerId = res.winnerId
  s.victoryMargin = res.margin
  return s
}
