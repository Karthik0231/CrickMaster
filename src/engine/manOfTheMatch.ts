import { MatchState, InningsState } from '../state/types'

interface MOMCandidate {
    playerId: string
    playerName: string
    teamId: string
    runs: number
    balls: number
    wickets: number
    economy: number
    strikeRate: number
    points: number
    fantasyPoints: number
}

export function calculateManOfTheMatch(state: MatchState) {
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
                        balls: 0,
                        wickets: 0,
                        economy: 0,
                        strikeRate: 0,
                        points: 0,
                        fantasyPoints: 0
                    }
                    candidates.push(candidate)
                }
                candidate.runs += e.runs
                if (e.outcome !== 'Wd') {
                    candidate.balls += 1
                }
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
                        balls: 0,
                        wickets: 0,
                        economy: 0,
                        strikeRate: 0,
                        points: 0,
                        fantasyPoints: 0
                    }
                    candidates.push(candidate)
                }
                if (e.wicket && (!e.wicketDetails || e.wicketDetails.type !== 'Run Out')) {
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
        let fantasyPoints = 0

        if (c.balls > 0) {
            c.strikeRate = (c.runs / c.balls) * 100
        }

        // Batting points
        points += c.runs * 1.5
        fantasyPoints += c.runs
        if (c.runs >= 50) { points += 20; fantasyPoints += 25; }
        if (c.runs >= 100) { points += 30; fantasyPoints += 50; }
        if (c.strikeRate > 150 && c.balls >= 10) fantasyPoints += 15;

        // Bowling points
        points += c.wickets * 25
        fantasyPoints += c.wickets * 25
        if (c.wickets >= 3) { points += 15; fantasyPoints += 15; }
        if (c.wickets >= 5) { points += 25; fantasyPoints += 25; }

        // Bonus for match-winning performance
        if (state.winnerId === c.teamId) {
            points += 10
        }

        c.points = points
        c.fantasyPoints = fantasyPoints
    })

    if (candidates.length === 0) return null

    // Player of the Match
    const momCandidates = [...candidates].sort((a, b) => b.points - a.points)
    const mom = momCandidates[0]

    // Super Striker (Min 10 balls)
    const strikerCandidates = [...candidates].filter(c => c.balls >= 10).sort((a, b) => b.strikeRate - a.strikeRate)
    const superStriker = strikerCandidates.length > 0 ? strikerCandidates[0] : null

    // Game Changer
    const gameChangerCandidates = [...candidates].sort((a, b) => b.fantasyPoints - a.fantasyPoints)
    // Try to give Game Changer to someone else if possible
    let gameChanger = gameChangerCandidates[0]
    if (gameChanger.playerId === mom.playerId && gameChangerCandidates.length > 1) {
        gameChanger = gameChangerCandidates[1]
    }

    return {
        mom: {
            playerId: mom.playerId,
            playerName: mom.playerName,
            prize: 100000 // ₹1 Lakh
        },
        superStriker: superStriker ? {
            playerId: superStriker.playerId,
            playerName: superStriker.playerName,
            prize: 100000 // ₹1 Lakh
        } : null,
        gameChanger: {
            playerId: gameChanger.playerId,
            playerName: gameChanger.playerName,
            prize: 100000 // ₹1 Lakh
        }
    }
}
