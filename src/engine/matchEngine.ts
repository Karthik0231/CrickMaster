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

// --- Smarter bowler selection with economy tracking & situational awareness ---
function nextBowlerId(team: Team, totalOvers: number, over: number, innings: InningsState): string {
  if (innings.overPlan && innings.overPlan[over]) {
    const plannedId = innings.overPlan[over]
    if (plannedId !== innings.currentBowlerId) return plannedId
  }

  const isDeath = over >= totalOvers - 5
  const isPowerplay = over < 6
  const isLateMiddle = over >= totalOvers - 8 && !isDeath
  const maxOversPerBowler = Math.ceil(totalOvers / 5)

  const available = team.players.filter(p => {
    if (p.role === 'WK') return false
    if (p.id === innings.currentBowlerId) return false
    const bowled = innings.bowlerOverCounts[p.id] || 0
    return bowled < maxOversPerBowler
  })

  // Track economy from events
  const bowlerEconomy: Record<string, number> = {}
  for (const p of team.players) {
    const balls = innings.events.filter(e => e.bowlerId === p.id && e.extraType !== 'Wide' && e.extraType !== 'NoBall').length
    const runs = innings.events.filter(e => e.bowlerId === p.id).reduce((s, e) => s + e.runs, 0)
    if (balls > 0) bowlerEconomy[p.id] = (runs / balls) * 6
  }

  const scoredBowlers = available.map(p => {
    let score = p.bowlingRating
    // Fatigue penalty: avoid overusing same bowler late in match
    const bowledOvers = innings.bowlerOverCounts[p.id] || 0
    const fatigue = bowledOvers / Math.max(1, maxOversPerBowler)
    if (fatigue > 0.75) score -= Math.round((fatigue - 0.75) * 40)
    const isSpinner = p.name.toLowerCase().includes('spin') || p.role.includes('SPIN')
    const economy = bowlerEconomy[p.id]
    const hasBowledBefore = (innings.bowlerOverCounts[p.id] || 0) > 0

    // Economy reward: if already bowled well, trust them in tough phases
    if (hasBowledBefore && economy !== undefined) {
      if (economy < 7) score += 12
      else if (economy < 9) score += 4
      else if (economy > 11) score -= 10
    }

    // Role bonus
    if (p.role === 'BOWL') score += 10
    if (p.role === 'ALL') score += 5

    if (isDeath) {
      if (!isSpinner) score += 15
      if (p.bowlingRating > 85) score += 12
      if (p.yorkerSkill && p.yorkerSkill > 75) score += 10
      if (isSpinner) score -= 8
    } else if (isPowerplay) {
      if (!isSpinner) score += 8
      if (p.bowlingRating > 80) score += 6
      if (p.bouncerSkill && p.bouncerSkill > 75) score += 5
    } else if (isLateMiddle) {
      if (p.variationSkill && p.variationSkill > 70) score += 8
      if (isSpinner) score += 10
    } else {
      if (isSpinner) score += 18
      if (p.variationSkill && p.variationSkill > 70) score += 6
    }

    // Save best pace for death
    if (!isDeath && !isPowerplay && !isSpinner && p.bowlingRating > 85) {
      const bowled = innings.bowlerOverCounts[p.id] || 0
      if (bowled < maxOversPerBowler - 1) score -= 18
    }

    // Momentum-aware: if batting team on fire, throw best bowler
    if ((innings.momentum || 0) > 40 && p.bowlingRating > 82) score += 10

    return { id: p.id, score }
  })

  scoredBowlers.sort((a, b) => b.score - a.score)

  if (scoredBowlers.length === 0) {
    return team.players.find(p => p.id !== innings.currentBowlerId)?.id || team.players[0].id
  }

  // Add slight randomness (top 2) so AI doesn't feel robotic
  if (scoredBowlers.length > 1 && Math.random() < 0.15) {
    return scoredBowlers[1].id
  }

  return scoredBowlers[0].id
}

// Team aggression bias: derive from team ratings and simple heuristics
function teamAggressionBias(state: MatchState, teamId: string) {
  const team = state.homeTeam.id === teamId ? state.homeTeam : state.awayTeam
  const bias = (team.battingRating - team.bowlingRating) / 100
  return Math.max(-0.35, Math.min(0.35, bias))
}

// Smart match-winning situation logic with risk/reward
function getMatchWinningStrategy(state: MatchState): Strategy {
  const inn = state.currentInnings === 2 ? state.innings2 : state.innings1
  if (!inn) return 'Normal'

  const config = state.config
  const totalBalls = config.overs * 6
  const ballsLeft = totalBalls - inn.balls
  const oversLeft = ballsLeft / 6
  const wicketsLeft = 10 - inn.wickets

  if (state.currentInnings === 2 && inn.target) {
    const runsNeeded = inn.target - inn.runs
    const ballsNeeded = runsNeeded > 0 ? runsNeeded : 0
    const runRateNeeded = oversLeft > 0 ? ballsNeeded / oversLeft : 0
    const currentRunRate = inn.runs / (inn.balls / 6) || 0

    if (runsNeeded <= 20 && ballsLeft > 30) return 'Defensive'
    if (runRateNeeded > currentRunRate + 3 && wicketsLeft < 4) return 'Aggressive'
    if (wicketsLeft <= 2 && runRateNeeded > 12) return 'Aggressive'
    if (runsNeeded > 50 && wicketsLeft > 5) return 'Normal'
  }

  return 'Normal'
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

  if (bowler.variationSkill && bowler.variationSkill > 75) types.push('Stumped', 'LBW')
  if (bowler.bouncerSkill && bowler.bouncerSkill > 75) types.push('Caught', 'Caught')

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
  // --- MOMENTUM ENGINE ---
  if (event.outcome === '4') inn.momentum = Math.min(100, (inn.momentum || 0) + 14)
  else if (event.outcome === '6') inn.momentum = Math.min(100, (inn.momentum || 0) + 22)
  else if (event.outcome === '0') inn.momentum = Math.max(-100, (inn.momentum || 0) - 5)
  else if (event.outcome === '1') inn.momentum = Math.max(-100, Math.min(100, (inn.momentum || 0) + 2))
  else if (event.wicket) inn.momentum = Math.max(-100, (inn.momentum || 0) - 55)

  const recentDots = inn.events.slice(-4).filter(e => e.outcome === '0' && !e.wicket).length
  if (recentDots >= 3) inn.momentum = Math.max(-100, (inn.momentum || 0) - 12)

  const recentBounds = inn.events.slice(-3).filter(e => e.outcome === '4' || e.outcome === '6').length
  if (recentBounds >= 2) inn.momentum = Math.min(100, (inn.momentum || 0) + 15)

  const recentEvents = inn.events.slice(-6)
  const overRuns = recentEvents.reduce((acc, e) => acc + e.runs, 0)
  if (overRuns > 18) inn.momentum = Math.min(100, inn.momentum + 30)
  else if (overRuns === 0) inn.momentum = Math.max(-100, inn.momentum - 20)

  const activePartnership = inn.partnerships[inn.partnerships.length - 1]
  if (activePartnership && activePartnership.runs > 50 && activePartnership.runs % 50 === 0) {
    inn.momentum = Math.min(100, inn.momentum + 20)
  }

  // --- PRESSURE ENGINE ---
  let p = 0
  const totalBalls = config.overs * 6
  const ballsLeft = totalBalls - inn.balls
  const oversLeft = ballsLeft / 6

  if (inn.target !== undefined) {
    const runsLeft = inn.target - inn.runs
    const rrr = +(runsLeft / (oversLeft || 1)).toFixed(2)

    if (rrr > 6) p += Math.max(0, (rrr - 6) * 12)
    if (rrr > 12) p += (rrr - 12) * 18

    if (ballsLeft < 18 && runsLeft > ballsLeft) p += 70
    if (ballsLeft < 6 && runsLeft > 6) p += 40
  }

  p += inn.wickets * 12
  if (inn.wickets >= 7) p += (inn.wickets - 6) * 20

  const recentWickets = inn.events.slice(-12).filter(e => e.wicket).length
  p += recentWickets * 30

  inn.momentum *= 0.92
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

// --- Richer, situation-aware commentary ---
function commentaryFor(event: BallEvent, striker: Player, bowler: Player): string {
  const base = `${event.over}.${event.ball}: `
  if (event.wicket && event.wicketDetails) return `${base}OUT! ${event.wicketDetails.text}`

  const bowlerName = bowler.name.split(' ').pop()
  const batName = striker.name.split(' ').pop()
  const o = event.outcome

  const dotLines = [
    `${bowlerName} beats ${batName} outside off, no run.`,
    `Solid defense from ${batName}, no damage.`,
    `${bowlerName} hits the deck hard — ${batName} digs it out.`,
    `Tight line from ${bowlerName}, beaten on the inside edge.`,
    `${batName} goes back and plays it safely, dot ball.`,
  ]
  const fourLines = [
    `FOUR! ${batName} creams it through cover — exquisite timing!`,
    `FOUR! Pulled off the hips with authority by ${batName}!`,
    `FOUR! Driven gloriously through mid-off!`,
    `FOUR! ${batName} cuts hard, races to the boundary!`,
  ]
  const sixLines = [
    `SIX! ${batName} clears the ropes with contemptuous ease!`,
    `SIX! Massive heave over midwicket — that's in the stands!`,
    `SIX! ${batName} murders ${bowlerName} over long-on!`,
    `SIX! Absolutely smoked — goes the distance easily!`,
  ]

  if (o === '0') return `${base}${dotLines[Math.floor(Math.random() * dotLines.length)]}`
  if (o === '4') return `${base}${fourLines[Math.floor(Math.random() * fourLines.length)]}`
  if (o === '6') return `${base}${sixLines[Math.floor(Math.random() * sixLines.length)]}`
  if (o === 'Wd') return `${base}Wide ball — ${bowlerName} spraying it down the leg side.`
  if (o === 'Nb') return `${base}No Ball! Front foot gone — free hit incoming!`
  if (o === '2') return `${base}Pushed into the gap — ${batName} and partner work hard for 2!`
  if (o === '3') return `${base}THREE! Excellent running between the wickets!`
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
    bowlerOverCounts: {},
    overPlan: {}
  }
}

export function setupNewMatch(params: {
  home: Team
  away: Team
  config: MatchConfig
  userTeamId?: string | null
}): { initState: MatchState } {
  const isUserInvolved = params.userTeamId !== null && params.userTeamId !== undefined

  const state: MatchState = {
    id: uuid(),
    config: params.config,
    homeTeam: params.home,
    awayTeam: params.away,
    userTeamId: params.userTeamId || null,
    tossStep: isUserInvolved ? 'PICK_SIDE' : 'COMPLETED',
    currentInnings: 1,
    commentary: [],
    matchCompleted: false,
  }

  if (!isUserInvolved) {
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

    state.toss = { winnerTeamId: tossWinner.id, decision }
    state.innings1 = innings1
    state.tossStep = 'COMPLETED'
  }

  return { initState: state }
}

// --- Sophisticated AI batting strategy with settling, panic, composure ---
export function getAIStrategy(state: MatchState, isStriker: boolean): Strategy {
  const inn = state.currentInnings === 1 ? state.innings1! : state.innings2!
  const config = state.config
  const totalBalls = config.overs * 6
  const ballsLeft = totalBalls - inn.balls
  const oversLeft = ballsLeft / 6
  const wicketsLeft = 10 - inn.wickets

  const playerId = isStriker ? inn.strikerId : inn.nonStrikerId
  const player = getPlayer(state, inn.battingTeamId, playerId)

  const faced = inn.batsmanSettling[playerId]?.balls || 0
  const isSet = faced >= 20
  const isNew = faced <= 7
  const isTailender = player.battingRating < 50

  const pressure = inn.pressure || 0
  const momentum = inn.momentum || 0
  const bias = teamAggressionBias(state, inn.battingTeamId)

  let base: Strategy = 'Normal'

  if (inn.target === undefined) {
    // First innings
    if (inn.intentPhase === 'Powerplay') {
      if (isTailender) base = 'Defensive'
      else if (wicketsLeft > 7) base = 'Aggressive'
      else if (wicketsLeft > 4 && isSet) base = 'Aggressive'
      else base = 'Normal'
    } else if (inn.intentPhase === 'Middle') {
      if (wicketsLeft < 4 && ballsLeft > 36) base = 'Defensive'
      else if (isTailender && wicketsLeft < 3) base = 'Aggressive'
      else if (isNew && wicketsLeft < 6) base = 'Defensive'
      else if (isSet && momentum > 20) base = 'Aggressive'
      else base = 'Normal'
    } else if (inn.intentPhase === 'Death') {
      if (isTailender && wicketsLeft < 2) base = 'Aggressive'
      else if (wicketsLeft > 3) base = 'Aggressive'
      else if (wicketsLeft > 1 && isSet) base = 'Aggressive'
      else if (wicketsLeft <= 1) base = 'Normal'
      else base = 'Aggressive'
    }

    if (wicketsLeft < 4 && ballsLeft > 30) base = 'Defensive'
  } else {
    // Chase logic
    const runsNeeded = inn.target - inn.runs
    const rrr = runsNeeded / (oversLeft || 1)
    const crr = inn.runs / (inn.balls / 6 || 1)
    const rrrGap = rrr - crr

    if (rrr > 18 || (rrr > 14 && ballsLeft < 18)) base = 'Aggressive'
    else if (rrr < 5 && runsNeeded > 20 && wicketsLeft > 4) base = isNew ? 'Defensive' : 'Normal'
    else if (rrr < crr - 2 && wicketsLeft > 4 && runsNeeded < 30) base = 'Defensive'
    else if (rrrGap > 3) {
      if (isSet && wicketsLeft > 3) base = 'Aggressive'
      else if (isNew && wicketsLeft < 5) base = 'Normal'
      else if (wicketsLeft > 5) base = 'Aggressive'
      else base = 'Normal'
    }

    if (wicketsLeft < 2 && runsNeeded > 8) base = 'Aggressive'
    if (pressure > 70 && isNew && !isTailender) base = 'Defensive'
    if (momentum > 50 && isSet && rrrGap <= 1) base = 'Aggressive'
  }

  // Apply pitch and boundary modifiers
  if (config.pitch === 'Flat') {
    if (base === 'Normal' && config.boundarySize === 'Short') base = 'Aggressive'
    if (base === 'Defensive' && config.boundarySize === 'Short' && momentum > 10) base = 'Normal'
  }

  // Apply team bias
  if (bias > 0.12) {
    if (base === 'Normal') base = 'Aggressive'
    else if (base === 'Defensive') base = 'Normal'
  } else if (bias < -0.12) {
    if (base === 'Normal') base = 'Defensive'
    else if (base === 'Aggressive') base = 'Normal'
  }

  return base
}

// --- AI bowling strategy that reacts to momentum and match situations ---
export function getAIBowlingStrategy(state: MatchState): Strategy {
  const inn = state.currentInnings === 1 ? state.innings1! : state.innings2!
  const config = state.config
  const ballsLeft = (config.overs * 6) - inn.balls
  const oversLeft = ballsLeft / 6
  const wicketsLeft = 10 - inn.wickets
  const momentum = inn.momentum || 0

  if (state.currentInnings === 2 && inn.target) {
    const runsNeeded = inn.target - inn.runs

    if (runsNeeded <= 15 && ballsLeft < 24 && wicketsLeft > 3) return 'Aggressive'
    if ((runsNeeded / (oversLeft || 1)) > 15 && ballsLeft < 30) return 'Defensive'
    if (runsNeeded > 50 && ballsLeft > 30) return 'Defensive'
  }

  if (momentum > 60) return 'Defensive'
  if (momentum < -30 && wicketsLeft > 3) return 'Aggressive'

  if (inn.target !== undefined) {
    const runsNeeded = inn.target - inn.runs
    const rrr = runsNeeded / (oversLeft || 1)

    if (rrr > 12 && ballsLeft < 36) return 'Defensive'
    if (rrr < 6 && wicketsLeft > 5) return 'Aggressive'
    if (ballsLeft < 18 && runsNeeded < 30) return 'Aggressive'
  }

  if (inn.intentPhase === 'Powerplay' && wicketsLeft > 8) return 'Aggressive'
  if (inn.intentPhase === 'Death') return 'Defensive'

  if (config.pitch === 'Seaming' || config.pitch === 'Turning') return 'Aggressive'
  if (config.pitch === 'Flat') return 'Defensive'

  return 'Normal'
}

export function initializeInningsAfterToss(state: MatchState, decision: 'Bat' | 'Bowl'): MatchState {
  if (!state.toss) return state

  const tossWinner = state.homeTeam.id === state.toss.winnerTeamId ? state.homeTeam : state.awayTeam
  const tossLoser = state.homeTeam.id === state.toss.winnerTeamId ? state.awayTeam : state.homeTeam

  const firstBat = decision === 'Bat' ? tossWinner : tossLoser
  const firstBowl = decision === 'Bat' ? tossLoser : tossWinner

  const innings1 = initialInnings(
    firstBat.id,
    firstBowl.id,
    firstBat.players.map(p => p.id),
    firstBowl.players.map(p => p.id)
  )
  innings1.currentBowlerId = nextBowlerId(firstBowl, state.config.overs, 0, innings1)

  const isUserBatting = state.userTeamId === firstBat.id

  return {
    ...state,
    toss: { ...state.toss, decision },
    innings1,
    tossStep: 'COMPLETED',
    selectionStep: isUserBatting ? 'OPENERS' : 'COMPLETED'
  }
}

export function simulateBall(state: MatchState, isInteractive: boolean = true): { event: BallEvent, innings: InningsState } {
  const inn = state.currentInnings === 1 ? state.innings1! : state.innings2!
  const isUserBatting = state.userTeamId === inn.battingTeamId
  const isUserBowling = state.userTeamId === inn.bowlingTeamId

  if (!inn.batsmanSettling[inn.strikerId]) inn.batsmanSettling[inn.strikerId] = { balls: 0, settled: 0, dotsInARow: 0 }
  if (!inn.batsmanSettling[inn.nonStrikerId]) inn.batsmanSettling[inn.nonStrikerId] = { balls: 0, settled: 0, dotsInARow: 0 }

  const strikerSettled = inn.batsmanSettling[inn.strikerId]
  inn.intentPhase = phaseForInnings(inn, state.config)

  if (!isUserBatting) {
    inn.strikerStrategy = getAIStrategy(state, true)
    inn.nonStrikerStrategy = getAIStrategy(state, false)
  }

  if (!isUserBowling) {
    inn.bowlingStrategy = getAIBowlingStrategy(state)
  }

  let sStrat = inn.strikerStrategy || 'Normal'
  let bowlStrat = inn.bowlingStrategy || 'Normal'

  const striker = getPlayer(state, inn.battingTeamId, inn.strikerId)
  const bowler = getPlayer(state, inn.bowlingTeamId, inn.currentBowlerId)
  const batTeam = state.homeTeam.id === inn.battingTeamId ? state.homeTeam : state.awayTeam
  const bowlTeam = state.homeTeam.id === inn.bowlingTeamId ? state.homeTeam : state.awayTeam

  const totalBalls = state.config.overs * 6
  const ballsLeft = totalBalls - inn.balls
  const oversLeft = ballsLeft / 6
  const runsNeeded = inn.target !== undefined ? inn.target - inn.runs : undefined
  const requiredRR = runsNeeded !== undefined ? +(runsNeeded / (oversLeft || 1)).toFixed(2) : undefined
  const currentRR = inn.balls > 0 ? +(inn.runs / (inn.balls / 6)).toFixed(2) : 0

  const weights = computeWeights({
    batsman: striker,
    bowler,
    battingTeam: batTeam,
    bowlingTeam: bowlTeam,
    phase: inn.intentPhase,
    requiredRR,
    currentRR,
    wicketsInHand: 10 - inn.wickets,
    ballsLeft,
    battingStrategy: sStrat,
    bowlingStrategy: bowlStrat,
    pitch: state.config.pitch,
    boundarySize: state.config.boundarySize || 'Normal',
    pressure: inn.pressure || 0,
    momentum: inn.momentum || 0,
    batsmanBallsFaced: strikerSettled.balls,
    dotsInARow: strikerSettled.dotsInARow,
    isUserBatting,
    isUserBowling
  })

  // ── BOWLER vs BATSMAN IMPACT ──────────────────────────────────────────────
  // Stronger bowler vs weaker batsman = notably more wicket chance.
  // Both sides apply so a strong batsman also resists a weak bowler.
  const bowlerAdv = (bowler.bowlingRating || 50) - (striker.battingRating || 50)
  const bowlerAdvFactor = Math.max(-30, Math.min(30, bowlerAdv)) / 100
  // Raised from 0.6 → 1.2 so quality mismatch really shows up
  weights['W'] = (weights['W'] || 1) * (1 + bowlerAdvFactor * 1.2)

  // ── BOUNDARY SIZE ─────────────────────────────────────────────────────────
  if (state.config.boundarySize === 'Short') {
    weights['4'] *= 1.08   // was 1.15 — realistic small-ground bonus
    weights['6'] *= 1.10   // was 1.20
  } else if (state.config.boundarySize === 'Large') {
    weights['4'] *= 0.82   // was 0.85
    weights['6'] *= 0.65   // was 0.70
  }

  // ── STRATEGY TUNING ───────────────────────────────────────────────────────

  // Normal: keep scoreboard ticking, modest dot reduction
  if (sStrat === 'Normal') {
    weights['1'] *= 1.15   // was 1.20
    weights['0'] *= 0.90   // was 0.85
    weights['W'] *= 0.95   // was 0.90 — slight vulnerability restored
  }

  // Aggressive: boundaries up, but real dismissal risk — key realism fix
  if (sStrat === 'Aggressive') {
    weights['4'] *= 1.10   // was 1.15
    weights['6'] *= 1.05   // was 1.10
    weights['W'] *= 1.18   // was 0.88 → CRITICAL FIX: aggression = real wicket risk
    weights['0'] *= 0.82   // was 0.80
  }

  // Defensive: protect wicket, run singles, much fewer boundaries
  if (sStrat === 'Defensive') {
    weights['0'] *= 1.20   // was 1.30
    weights['1'] *= 1.20   // was 1.25
    weights['4'] *= 0.65   // was 0.60
    weights['6'] *= 0.35   // was 0.30
    weights['W'] *= 0.72   // was 0.60 → more realistic: even defensive batsmen get out
  }

  // ── PRESSURE EFFECT ───────────────────────────────────────────────────────
  // Scaled back so it doesn't stack catastrophically with other multipliers
  const pressureFactor = (inn.pressure || 0) / 100
  if (pressureFactor > 0.5) {
    weights['W'] *= (1 + pressureFactor * 0.28)   // was 0.40
    weights['0'] *= (1 + pressureFactor * 0.14)   // was 0.20
  }

  // ── MOMENTUM EFFECTS ──────────────────────────────────────────────────────
  const momentum = inn.momentum || 0

  // Negative momentum: bowling team in control
  if (momentum < -30) {
    weights['W'] *= 1.20
    weights['0'] *= 1.15
    weights['4'] *= 0.85
    weights['6'] *= 0.80
  }

  // Positive momentum: batting flowing — reduced wicket chance but not eliminated
  if (momentum > 40) {
    weights['4'] *= 1.07   // was 1.12
    weights['6'] *= 1.05   // was 1.08
    weights['W'] *= 0.88   // was 0.82 — momentum doesn't make you invincible
  }

  // ── NEW BATSMAN VULNERABILITY ─────────────────────────────────────────────
  // Smoother curve: starts at ~28% extra risk at ball 0, fades to 0 by ball 8
  const ballsFaced = strikerSettled.balls
  if (ballsFaced < 8) {
    weights['W'] *= (1.28 - ballsFaced * 0.04)   // was (1.50 - faced * 0.06)
    weights['4'] *= 0.78   // was 0.75
    weights['6'] *= 0.52   // was 0.50
    weights['0'] *= 1.15   // was 1.20
  }

  // ── SETTLED BATSMAN REWARD ────────────────────────────────────────────────
  if (ballsFaced >= 20) {
    weights['W'] *= 0.87   // was 0.85 — slightly higher; even set batsmen get out
    weights['4'] *= 1.08   // was 1.10
    if (sStrat === 'Aggressive') weights['6'] *= 1.12   // was 1.15
  }

  // ── LAST OVER DESPERATION ─────────────────────────────────────────────────
  // Toned down dramatically — the old 2.2x sixes multiplier caused 25+ run overs
  if (ballsLeft <= 6 && runsNeeded !== undefined && runsNeeded > 8) {
    weights['6'] *= 1.55   // was 2.20
    weights['4'] *= 1.25   // was 1.60
    weights['W'] *= 1.45   // was 1.30 — desperation = more risk
    weights['0'] *= 0.55   // was 0.40
    weights['1'] *= 0.80   // was 0.70
  }

  // ── HAT-TRICK BALL ────────────────────────────────────────────────────────
  const lastTwoBalls = inn.events.slice(-2)
  if (lastTwoBalls.length === 2 && lastTwoBalls.every(e => e.wicket)) {
    weights['W'] *= 1.50
    weights['0'] *= 1.20
  }

  // ── DEATH OVER PHASE ──────────────────────────────────────────────────────
  if (inn.intentPhase === 'Death') {
    weights['2'] *= 0.82   // was 0.80
    weights['3'] *= 0.65   // was 0.60
    if (sStrat !== 'Defensive') {
      weights['4'] *= 1.06   // was 1.10
      weights['6'] *= 1.08   // was 1.15
    }
  }

  // ── BOWLER QUALITY FLOOR ──────────────────────────────────────────────────
  // Ensures even average bowlers (rating 60-70) take wickets at realistic rates.
  // Without this, weak bowling attacks never take wickets vs strong batting.
  const bowlerQualityBoost = Math.max(0, (bowler.bowlingRating - 60) / 100)
  weights['W'] = Math.max(weights['W'] || 1, (weights['W'] || 1) * (1 + bowlerQualityBoost * 0.3))

  // ── WICKETS DROUGHT CORRECTION ────────────────────────────────────────────
  // If no wicket in last 30 balls, gradually increase wicket probability.
  // This prevents long stretches where opposition just never falls — a key realism fix.
  const ballsSinceLastWicket = inn.events.length - [...inn.events].reverse().findIndex(e => e.wicket)
  const wicketDrought = inn.events.some(e => e.wicket)
    ? inn.events.length - [...inn.events].map((e, i) => e.wicket ? i : -1).filter(i => i >= 0).pop()!
    : inn.events.length
  if (wicketDrought > 30) {
    const droughtBoost = Math.min(0.60, (wicketDrought - 30) * 0.02)   // +2% per ball after 30, capped at +60%
    weights['W'] = (weights['W'] || 1) * (1 + droughtBoost)
  }

  // ── INNINGS WICKET DISTRIBUTION FIX ──────────────────────────────────────
  // Real T20: avg 6-8 wickets per innings. If only 2-3 have fallen by over 15,
  // increase wicket weight to pull back toward realistic distribution.
  const currentOver = Math.floor(inn.balls / 6)
  const expectedWicketsByNow = (currentOver / state.config.overs) * 7   // expect ~7 total
  const wicketDeficit = expectedWicketsByNow - inn.wickets
  if (wicketDeficit > 1.5 && currentOver > 6) {
    const deficitBoost = Math.min(0.45, wicketDeficit * 0.10)
    weights['W'] = (weights['W'] || 1) * (1 + deficitBoost)
  }

  // ── PARTNERSHIP BREAK PRESSURE ────────────────────────────────────────────
  // Long partnerships in real cricket are eventually broken. After 60-ball
  // partnership, increase wicket chance to simulate that natural breakthrough.
  const activePartnership = inn.partnerships[inn.partnerships.length - 1]
  if (activePartnership && activePartnership.balls > 60) {
    const partnershipStrain = Math.min(0.35, (activePartnership.balls - 60) * 0.008)
    weights['W'] = (weights['W'] || 1) * (1 + partnershipStrain)
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

    if (out === '0') {
      strikerSettled.dotsInARow += 1
    } else {
      strikerSettled.dotsInARow = 0
    }
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
      const remaining = batTeam.players.filter(p =>
        !inn.fallOfWickets.some(f => f.batsmanId === p.id) &&
        p.id !== inn.strikerId &&
        p.id !== inn.nonStrikerId
      )
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
  s.waitingForBatsman = false

  while (!s.innings1?.completed) {
    if (s.innings1!.wickets >= 10 || s.innings1!.balls >= s.config.overs * 6) {
      s.innings1 = { ...s.innings1!, completed: true }
      break
    }
    const result = simulateOver(s, false)
    s = result.state
  }

  if (!s.innings2) s = startSecondInnings(s)

  while (!s.innings2?.completed) {
    if (s.innings2!.wickets >= 10 || s.innings2!.balls >= s.config.overs * 6 || s.innings2!.runs >= s.innings2!.target!) {
      s.innings2 = { ...s.innings2!, completed: true }
      break
    }
    const result = simulateOver(s, false)
    s = result.state
  }

  s.matchCompleted = true
  const res = determineWinner(s)
  s.winnerId = res.winnerId
  s.victoryMargin = res.margin
  return s
}
