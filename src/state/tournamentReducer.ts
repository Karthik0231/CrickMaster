import { TournamentState, Team, TournamentFixture, GameMode, MatchState } from './types'
import { setupNewMatch, simulateMatch } from '../engine/matchEngine'

export type TournamentAction =
    | { type: 'INIT_TOURNAMENT'; payload: { mode: GameMode; teams: Team[]; name: string; userTeamId: string | null; overs?: number } }
    | { type: 'SIMULATE_NEXT_MATCH' }
    | { type: 'SIMULATE_UNTIL_USER_MATCH' }
    | { type: 'SIMULATE_ALL' }
    | { type: 'RESET_TOURNAMENT' }
    | { type: 'RESTART_TOURNAMENT' }
    | { type: 'REPORT_MATCH_RESULT'; payload: { matchId: string; state: MatchState } }

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

function progressTournament(fixtures: TournamentFixture[], table: any[]): { updatedFixtures: TournamentFixture[], newStage: 'Group' | 'Knockout' | 'Semi Final' | 'Final' } {
    const updatedFixtures = [...fixtures];
    let newStage: 'Group' | 'Knockout' | 'Semi Final' | 'Final' = 'Group';

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
            const { mode, teams, name, userTeamId, overs } = action.payload
            const fixtures = generateFixtures(teams, mode === 'IPL')
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

            tableUpdate.sort((a: any, b: any) => b.pts - a.pts || (b.nrr - a.nrr))

            const { updatedFixtures, newStage } = progressTournament(newFixtures, tableUpdate);
            const isFinished = updatedFixtures.every(f => f.completed) && updatedFixtures.some(f => f.round === 'Final')

            return {
                ...state,
                fixtures: updatedFixtures,
                table: tableUpdate,
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

            tableUpdate.sort((a: any, b: any) => b.pts - a.pts || (b.nrr - a.nrr))

            const { updatedFixtures: finalFixtures, newStage } = progressTournament(newFixtures, tableUpdate);
            const isFinished = finalFixtures.every(f => f.completed) && finalFixtures.some(f => f.round === 'Final')

            return {
                ...state,
                fixtures: finalFixtures,
                table: tableUpdate,
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
            const fixtures = generateFixtures(state.teams, state.mode === 'IPL')
            const table = state.teams.map(t => ({
                teamId: t.id,
                p: 0, w: 0, l: 0, t: 0, nrr: 0, pts: 0,
                runsScored: 0, oversFaced: 0, runsConceded: 0, oversBowled: 0
            }))
            return {
                ...state,
                fixtures,
                table,
                currentRoundIndex: 0
            }
        }

        case 'RESET_TOURNAMENT':
            return null

        default:
            return state
    }
}
