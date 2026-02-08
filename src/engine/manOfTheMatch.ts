import { MatchState, InningsState } from '../state/types'

interface MOMCandidate {
    playerId: string
    playerName: string
    teamId: string
    runs: number
    wickets: number
    economy: number
    strikeRate: number
    points: number
}

export function calculateManOfTheMatch(state: MatchState): { playerId: string; playerName: string } | null {
    if (!state.matchCompleted || !state.innings1 || !state.innings2) {
        return null
    }

    const candidates: MOMCandidate[] = []

    // Process both innings
    const processInnings = (innings: InningsState, battingTeamId: string, bowlingTeamId: string) => {
        const battingTeam = state.homeTeam.id === battingTeamId ? state.homeTeam : state.awayTeam
        const bowlingTeam = state.homeTeam.id === bowlingTeamId ? state.homeTeam : state.awayTeam

        // Batting performances
        innings.events.forEach(e => {
            if (e.strikerId) {
                let candidate = candidates.find(c => c.playerId === e.strikerId)
                if (!candidate) {
                    const player = battingTeam.players.find(p => p.id === e.strikerId)!
                    candidate = {
                        playerId: e.strikerId,
                        playerName: player.name,
                        teamId: battingTeamId,
                        runs: 0,
                        wickets: 0,
                        economy: 0,
                        strikeRate: 0,
                        points: 0
                    }
                    candidates.push(candidate)
                }
                candidate.runs += e.runs
            }

            // Bowling performances
            if (e.bowlerId) {
                let candidate = candidates.find(c => c.playerId === e.bowlerId)
                if (!candidate) {
                    const player = bowlingTeam.players.find(p => p.id === e.bowlerId)!
                    candidate = {
                        playerId: e.bowlerId,
                        playerName: player.name,
                        teamId: bowlingTeamId,
                        runs: 0,
                        wickets: 0,
                        economy: 0,
                        strikeRate: 0,
                        points: 0
                    }
                    candidates.push(candidate)
                }
                if (e.wicket) {
                    candidate.wickets++
                }
            }
        })
    }

    processInnings(state.innings1, state.innings1.battingTeamId, state.innings1.bowlingTeamId)
    processInnings(state.innings2, state.innings2.battingTeamId, state.innings2.bowlingTeamId)

    // Calculate points for each candidate
    candidates.forEach(c => {
        let points = 0

        // Batting points
        points += c.runs * 1.5 // 1.5 points per run
        if (c.runs >= 50) points += 20 // Bonus for 50
        if (c.runs >= 100) points += 30 // Bonus for 100

        // Bowling points
        points += c.wickets * 25 // 25 points per wicket
        if (c.wickets >= 3) points += 15 // Bonus for 3+ wickets
        if (c.wickets >= 5) points += 25 // Bonus for 5-wicket haul

        // Bonus for match-winning performance
        if (state.winnerId === c.teamId) {
            points += 10
        }

        c.points = points
    })

    // Sort by points and return top performer
    candidates.sort((a, b) => b.points - a.points)

    if (candidates.length === 0) return null

    return {
        playerId: candidates[0].playerId,
        playerName: candidates[0].playerName
    }
}
