import { TournamentState, Team, TournamentFixture, GameMode, MatchState, TournamentStats } from './types'
import { setupNewMatch, simulateMatch } from '../engine/matchEngine'

export type TournamentAction =
    | { type: 'INIT_TOURNAMENT'; payload: { mode: GameMode; teams: Team[]; name: string; userTeamId: string | null; overs?: number; seriesMatches?: number } }
    | { type: 'SIMULATE_NEXT_MATCH' }
    | { type: 'SIMULATE_UNTIL_USER_MATCH' }
    | { type: 'SIMULATE_ALL' }
    | { type: 'RESET_TOURNAMENT' }
    | { type: 'RESTART_TOURNAMENT' }
    | { type: 'REPORT_MATCH_RESULT'; payload: { matchId: string; state: MatchState } }

function updateTournamentStats(currentStats: TournamentStats | undefined, match: MatchState, allTeams: Team[]): TournamentStats {
    const stats: TournamentStats = currentStats ? {
        ...currentStats,
        playerStats: { ...currentStats.playerStats }
    } : {
        playerStats: {},
        topScorers: [],
        topWicketTakers: [],
        topSixHitters: [],
        bestEconomies: [],
        bestStrikeRates: [],
        mvpCandidates: []
    }

    const processInnings = (inn: any, bowlingTeam: Team, battingTeam: Team) => {
        if (!inn) return
        
        const batsmenIds = new Set<string>()
        const bowlersIds = new Set<string>()

        inn.events.forEach((e: any) => {
            // Batting stats
            const strikerId = e.strikerId as string
            batsmenIds.add(strikerId)
            if (!stats.playerStats[strikerId]) {
                stats.playerStats[strikerId] = {
                    runs: 0, balls: 0, wickets: 0, ballsBowled: 0, runsConceded: 0,
                    fours: 0, sixes: 0, notOuts: 1, matches: 0, hundreds: 0, fifties: 0, fiveWkts: 0,
                    highestScore: 0, bestBowling: { wickets: 0, runs: 0 }
                }
            }
            const p = stats.playerStats[strikerId]
            p.runs += e.runs
            p.balls += 1
            if (e.runs === 4) p.fours += 1
            if (e.runs === 6) p.sixes += 1
            
            // Bowling stats
            const bowlerId = e.bowlerId as string
            bowlersIds.add(bowlerId)
            if (!stats.playerStats[bowlerId]) {
                stats.playerStats[bowlerId] = {
                    runs: 0, balls: 0, wickets: 0, ballsBowled: 0, runsConceded: 0,
                    fours: 0, sixes: 0, notOuts: 1, matches: 0, hundreds: 0, fifties: 0, fiveWkts: 0,
                    highestScore: 0, bestBowling: { wickets: 0, runs: 0 }
                }
            }
            const b = stats.playerStats[bowlerId]
            b.ballsBowled += 1
            b.runsConceded += e.runs
            if (e.wicket) b.wickets += 1
        })

        // Update match counts and not outs
        batsmenIds.forEach(id => {
            if (stats.playerStats[id]) stats.playerStats[id].matches += 1
        })
        bowlersIds.forEach(id => {
            if (stats.playerStats[id] && !batsmenIds.has(id)) stats.playerStats[id].matches += 1
        })

        // Handle wickets for not outs
        inn.fallOfWickets.forEach((fow: any) => {
            const bId = fow.batsmanId as string
            if (stats.playerStats[bId]) {
                stats.playerStats[bId].notOuts = 0
            }
        })
    }

    const home = match.homeTeam
    const away = match.awayTeam

    processInnings(match.innings1, match.currentInnings === 1 ? away : home, match.currentInnings === 1 ? home : away)
    processInnings(match.innings2, match.currentInnings === 2 ? away : home, match.currentInnings === 2 ? home : away)

    // After processing, update top lists
    const allPlayers: { id: string, name: string, team: string, s: TournamentStats['playerStats'][string] }[] = []
    
    // Create a lookup for existing player info from leaderboards
    const playerInfoLookup = new Map<string, { name: string, team: string }>()
    if (currentStats) {
        [
            ...currentStats.topScorers,
            ...currentStats.topWicketTakers,
            ...currentStats.topSixHitters,
            ...currentStats.bestEconomies,
            ...currentStats.bestStrikeRates,
            ...currentStats.mvpCandidates
        ].forEach(p => playerInfoLookup.set(p.id, { name: p.name, team: p.team }))
    }

    Object.entries(stats.playerStats).forEach(([id, s]) => {
        // Find player name and team
        let pInfo = home.players.find(p => p.id === id)
        let teamName = home.short
        if (!pInfo) {
            pInfo = away.players.find(p => p.id === id)
            teamName = away.short
        }

        if (pInfo) {
            allPlayers.push({ id, name: pInfo.name, team: teamName, s })
        } else {
            const existing = playerInfoLookup.get(id)
            if (existing) {
                allPlayers.push({ id, name: existing.name, team: existing.team, s })
            } else {
                // Last resort: check all teams in tournament
                for (const t of allTeams) {
                    const p = t.players.find(p => p.id === id)
                    if (p) {
                        allPlayers.push({ id, name: p.name, team: t.short, s })
                        break
                    }
                }
            }
        }
    })

    stats.topScorers = allPlayers
        .sort((a, b) => b.s.runs - a.s.runs)
        .slice(0, 10)
        .map(p => ({ id: p.id, name: p.name, team: p.team, runs: p.s.runs, matches: p.s.matches }))

    stats.topWicketTakers = allPlayers
        .sort((a, b) => b.s.wickets - a.s.wickets)
        .slice(0, 10)
        .map(p => ({ id: p.id, name: p.name, team: p.team, wickets: p.s.wickets, matches: p.s.matches }))

    stats.topSixHitters = allPlayers
        .sort((a, b) => b.s.sixes - a.s.sixes)
        .slice(0, 10)
        .map(p => ({ id: p.id, name: p.name, team: p.team, sixes: p.s.sixes }))

    stats.bestEconomies = allPlayers
        .filter(p => p.s.ballsBowled >= 12) // Minimum 2 overs
        .map(p => ({
            id: p.id,
            name: p.name,
            team: p.team,
            economy: (p.s.runsConceded / (p.s.ballsBowled / 6))
        }))
        .sort((a, b) => a.economy - b.economy)
        .slice(0, 10)

    stats.bestStrikeRates = allPlayers
        .filter(p => p.s.balls >= 20) // Minimum 20 balls faced
        .map(p => ({
            id: p.id,
            name: p.name,
            team: p.team,
            strikeRate: (p.s.runs / p.s.balls) * 100
        }))
        .sort((a, b) => b.strikeRate - a.strikeRate)
        .slice(0, 10)

    stats.mvpCandidates = allPlayers
        .map(p => ({
            id: p.id,
            name: p.name,
            team: p.team,
            points: p.s.runs + (p.s.wickets * 25) + (p.s.sixes * 2) + (p.s.fours * 1)
        }))
        .sort((a, b) => b.points - a.points)
        .slice(0, 10)

    return stats
}

function generateFixtures(teams: Team[], doubleRound: boolean): TournamentFixture[] {
    const fixtures: TournamentFixture[] = []
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            fixtures.push({
                id: `fix-${i}-${j}-1`,
                homeTeamId: teams[i].id,
                awayTeamId: teams[j].id,
                round: 'Group Stage',
                completed: false,
            })
            if (doubleRound) {
                fixtures.push({
                    id: `fix-${j}-${i}-2`,
                    homeTeamId: teams[j].id,
                    awayTeamId: teams[i].id,
                    round: 'Group Stage',
                    completed: false,
                })
            }
        }
    }
    // Shuffle fixtures
    return fixtures.sort(() => Math.random() - 0.5)
}

function updateTable(
    table: TournamentState['table'],
    winnerId: string | undefined,
    team1Id: string,
    team2Id: string,
    stats: {
        t1Runs: number, t1Overs: number,
        t2Runs: number, t2Overs: number
    }
) {
    const t1 = table.find(t => t.teamId === team1Id)!
    const t2 = table.find(t => t.teamId === team2Id)!

    t1.p += 1
    t2.p += 1

    // Update Runs/Overs for NRR
    t1.runsScored += stats.t1Runs
    t1.oversFaced += stats.t1Overs
    t1.runsConceded += stats.t2Runs
    t1.oversBowled += stats.t2Overs

    t2.runsScored += stats.t2Runs
    t2.oversFaced += stats.t2Overs
    t2.runsConceded += stats.t1Runs
    t2.oversBowled += stats.t1Overs

    // Points
    if (winnerId === team1Id) {
        t1.w += 1
        t1.pts += 2
        t2.l += 1
    } else if (winnerId === team2Id) {
        t2.w += 1
        t2.pts += 2
        t1.l += 1
    } else {
        t1.t += 1
        t2.t += 1
        t1.pts += 1
        t2.pts += 1
    }

    // Calculate NRR
    const calcNRR = (entry: typeof t1) => {
        if (entry.oversFaced === 0) return 0
        const runRateFor = entry.runsScored / entry.oversFaced
        const runRateAgainst = entry.runsConceded / entry.oversBowled
        return runRateFor - (isNaN(runRateAgainst) ? 0 : runRateAgainst)
    }

    t1.nrr = calcNRR(t1)
    t2.nrr = calcNRR(t2)
}

function getMatchStatsForNRR(match: MatchState) {
    // Determine runs and effective overs for both teams
    // Innings 1 is always home batting first (in this simple model? No, toss matters)

    const i1 = match.innings1!
    const i2 = match.innings2!

    // Identify who batted in Innings 1 and 2
    const bat1Id = i1.battingTeamId
    const bat2Id = i2.battingTeamId

    // Helper to get effective overs
    // If all out, use full quota (e.g. 20). Else use actual overs.
    const getEffectiveOvers = (inn: typeof i1) => {
        if (inn.wickets >= 10) return match.config.overs
        // Convert overs (e.g. 19.3) to decimal for NRR (19 + 3/6 = 19.5)
        const oversFull = Math.floor(inn.overs)
        const balls = Math.round((inn.overs - oversFull) * 10)
        return oversFull + (balls / 6)
    }

    // However, for the team batting SECOND, if they win, their overs faced is just what they took.
    // If they lose, it's what they took (or full if all out).
    // The standard rule:
    // "If a team is bowled out, the total overs they could have faced is used."
    // "If a team chases the target, the actual overs used is used."

    const bat1EffectiveOvers = match.config.overs // Team 1 deemed to face full quota if all out or time up

    // Second innings:
    // If they win (chased target), use actual overs.
    // If they lose (didn't chase), treat as full quota.

    let bat2EffectiveOvers = 0
    if (match.winnerId === bat2Id) {
        // Won batting second (chased target) - use actual overs
        const totalBalls = i2.balls
        bat2EffectiveOvers = Math.floor(totalBalls / 6) + (totalBalls % 6 / 6)
    } else {
        // Lost batting second - deemed to face full quota
        bat2EffectiveOvers = match.config.overs
    }

    // We need to map this back to Home and Away
    const isHomeBatFirst = bat1Id === match.homeTeam.id

    if (isHomeBatFirst) {
        return {
            t1Runs: i1.runs, t1Overs: bat1EffectiveOvers, // Home
            t2Runs: i2.runs, t2Overs: bat2EffectiveOvers  // Away
        }
    } else {
        return {
            t1Runs: i2.runs, t1Overs: bat2EffectiveOvers, // Home (Batting 2nd)
            t2Runs: i1.runs, t2Overs: bat1EffectiveOvers  // Away (Batting 1st)
        }
    }
}

function progressTournament(fixtures: TournamentFixture[], table: any[], mode: GameMode): { updatedFixtures: TournamentFixture[], newStage: 'Group' | 'Knockout' | 'Semi Final' | 'Final' } {
    const updatedFixtures = [...fixtures];
    let newStage: 'Group' | 'Knockout' | 'Semi Final' | 'Final' = 'Group';

    // Series Mode: No knockouts, just linear progression
    if (mode === 'Series') {
        const allCompleted = updatedFixtures.every(f => f.completed);
        return { updatedFixtures, newStage: allCompleted ? 'Final' : 'Group' };
    }

    const allGroupDone = updatedFixtures.filter(f => f.round === 'Group Stage').every(f => f.completed);

    if (allGroupDone && !updatedFixtures.some(f => f.round === 'Semi Final')) {
        newStage = 'Semi Final';
        const top4 = table.slice(0, 4);
        if (top4.length === 4) {
            updatedFixtures.push({ id: `SF1-${Date.now()}`, homeTeamId: top4[0].teamId, awayTeamId: top4[3].teamId, round: 'Semi Final', completed: false });
            updatedFixtures.push({ id: `SF2-${Date.now()}`, homeTeamId: top4[1].teamId, awayTeamId: top4[2].teamId, round: 'Semi Final', completed: false });
        }
    } else {
        const sfs = updatedFixtures.filter(f => f.round === 'Semi Final');
        if (sfs.length === 2) {
            newStage = 'Semi Final';
            if (sfs.every(f => f.completed) && !updatedFixtures.some(f => f.round === 'Final')) {
                newStage = 'Final';
                updatedFixtures.push({ id: `FINAL-${Date.now()}`, homeTeamId: sfs[0].winnerId!, awayTeamId: sfs[1].winnerId!, round: 'Final', completed: false });
            } else if (updatedFixtures.some(f => f.round === 'Final')) {
                newStage = 'Final';
            }
        }
    }
    return { updatedFixtures, newStage };
}

export function tournamentReducer(state: TournamentState | null, action: TournamentAction): TournamentState | null {
    switch (action.type) {
        case 'INIT_TOURNAMENT': {
            const { mode, teams, name, userTeamId, overs, seriesMatches } = action.payload
            let fixtures: TournamentFixture[] = []

            if (mode === 'Series' && seriesMatches && teams.length === 2) {
                for (let i = 0; i < seriesMatches; i++) {
                    fixtures.push({
                        id: `series-match-${i + 1}`,
                        homeTeamId: teams[0].id,
                        awayTeamId: teams[1].id,
                        round: `Match ${i + 1}`,
                        completed: false
                    })
                }
            } else {
                fixtures = generateFixtures(teams, mode === 'IPL')
            }

            const table = teams.map(t => ({
                teamId: t.id,
                p: 0, w: 0, l: 0, t: 0, nrr: 0, pts: 0,
                runsScored: 0, oversFaced: 0, runsConceded: 0, oversBowled: 0
            }))

            return {
                id: Math.random().toString(36),
                mode,
                name,
                userTeamId,
                teams,
                fixtures,
                currentRoundIndex: 0,
                status: 'IN_PROGRESS',
                stage: 'Group',
                overs: overs ?? 20, // Use provided overs, fallback to 20 only if undefined
                table
            }
        }


        case 'REPORT_MATCH_RESULT': {
            if (!state) return null
            const { matchId, state: matchState } = action.payload

            // Validate match state is complete
            if (!matchState.matchCompleted) {
                console.warn('Attempted to report incomplete match result');
                return state;
            }

            // Find fixture by ID or by team match
            const fixtureIdx = state.fixtures.findIndex(f =>
                f.id === matchId ||
                (matchId === 'current' && !f.completed && f.homeTeamId === matchState.homeTeam.id && f.awayTeamId === matchState.awayTeam.id) ||
                (!f.completed && f.homeTeamId === matchState.homeTeam.id && f.awayTeamId === matchState.awayTeam.id)
            );

            if (fixtureIdx === -1) {
                console.warn('Could not find fixture for match result');
                return state;
            }

            const fixture = state.fixtures[fixtureIdx]
            if (fixture.completed) {
                console.warn('Fixture already completed');
                return state;
            }

            const home = state.teams.find(t => t.id === fixture.homeTeamId)!
            const away = state.teams.find(t => t.id === fixture.awayTeamId)!

            const winnerId = matchState.winnerId
            const resultText = winnerId
                ? `${winnerId === home.id ? home.short : away.short} won`
                : 'Tie'

            const newFixtures = [...state.fixtures]
            newFixtures[fixtureIdx] = {
                ...fixture,
                completed: true,
                winnerId,
                result: resultText
            }

            const stats = getMatchStatsForNRR(matchState)
            const tableUpdate = JSON.parse(JSON.stringify(state.table))
            updateTable(tableUpdate, winnerId, home.id, away.id, stats)

            const updatedTournamentStats = updateTournamentStats(state.stats, matchState, state.teams)

            tableUpdate.sort((a: any, b: any) => b.pts - a.pts || (b.nrr - a.nrr))

            const { updatedFixtures, newStage } = progressTournament(newFixtures, tableUpdate, state.mode);
            const isFinished = updatedFixtures.every(f => f.completed) && (state.mode === 'Series' || updatedFixtures.some(f => f.round === 'Final'))

            return {
                ...state,
                fixtures: updatedFixtures,
                table: tableUpdate,
                stats: updatedTournamentStats,
                stage: newStage,
                status: isFinished ? 'COMPLETED' : 'IN_PROGRESS'
            }
        }

        case 'SIMULATE_NEXT_MATCH': {
            if (!state) return null
            const matchIdx = state.fixtures.findIndex(f => !f.completed)
            if (matchIdx === -1) return state

            const fixture = state.fixtures[matchIdx]
            const home = state.teams.find(t => t.id === fixture.homeTeamId)!
            const away = state.teams.find(t => t.id === fixture.awayTeamId)!

            const { initState } = setupNewMatch({
                home,
                away,
                config: {
                    overs: state.overs,
                    mode: state.mode,
                    format: 'T20',
                    strategy: 'Normal',
                    bowlingStrategy: 'Normal',
                    pitch: 'Balanced',
                    stadium: 'Generic'
                }
            })

            const matchState = simulateMatch(initState)

            const newFixtures = [...state.fixtures]
            newFixtures[matchIdx] = {
                ...fixture,
                completed: true,
                winnerId: matchState.winnerId,
                result: matchState.winnerId
                    ? `${matchState.winnerId === home.id ? home.short : away.short} won`
                    : 'Tie'
            }

            const stats = getMatchStatsForNRR(matchState)
            const tableUpdate = JSON.parse(JSON.stringify(state.table))
            updateTable(tableUpdate, matchState.winnerId, home.id, away.id, stats)

            const updatedTournamentStats = updateTournamentStats(state.stats, matchState, state.teams)

            tableUpdate.sort((a: any, b: any) => b.pts - a.pts || (b.nrr - a.nrr))

            const { updatedFixtures: finalFixtures, newStage } = progressTournament(newFixtures, tableUpdate, state.mode);
            const isFinished = finalFixtures.every(f => f.completed) && (state.mode === 'Series' || finalFixtures.some(f => f.round === 'Final'))

            return {
                ...state,
                fixtures: finalFixtures,
                table: tableUpdate,
                stats: updatedTournamentStats,
                stage: newStage,
                status: isFinished ? 'COMPLETED' : 'IN_PROGRESS'
            }
        }

        case 'SIMULATE_UNTIL_USER_MATCH': {
            if (!state || !state.userTeamId) return state
            let currentState = state

            while (true) {
                const nextMatchIdx = currentState.fixtures.findIndex(f => !f.completed)
                if (nextMatchIdx === -1) break

                const nextMatch = currentState.fixtures[nextMatchIdx]
                const isUserInvolved = nextMatch.homeTeamId === state.userTeamId || nextMatch.awayTeamId === state.userTeamId

                // Stop if user is involved
                if (isUserInvolved) break

                // Otherwise simulate
                currentState = tournamentReducer(currentState, { type: 'SIMULATE_NEXT_MATCH' })!
            }
            return currentState
        }

        case 'RESTART_TOURNAMENT': {
            if (!state) return null
            let fixtures: TournamentFixture[] = []
            if (state.mode === 'Series' && state.teams.length === 2) {
                 // Regenerate series fixtures
                 const matchCount = state.fixtures.length // Preserve original length
                 for (let i = 0; i < matchCount; i++) {
                    fixtures.push({
                        id: `series-match-${i + 1}`,
                        homeTeamId: state.teams[0].id,
                        awayTeamId: state.teams[1].id,
                        round: `Match ${i + 1}`,
                        completed: false
                    })
                }
            } else {
                fixtures = generateFixtures(state.teams, state.mode === 'IPL')
            }

            const table = state.teams.map(t => ({
                teamId: t.id,
                p: 0, w: 0, l: 0, t: 0, nrr: 0, pts: 0,
                runsScored: 0, oversFaced: 0, runsConceded: 0, oversBowled: 0
            }))
            return {
                ...state,
                fixtures,
                table,
                currentRoundIndex: 0,
                status: 'IN_PROGRESS',
                stage: 'Group'
            }
        }

        case 'RESET_TOURNAMENT':
            return null

        default:
            return state
    }
}
