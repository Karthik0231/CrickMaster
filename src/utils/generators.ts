import { Player, Role, Team } from '../state/types'

const FIRST_NAMES = ['Rahul', 'Virat', 'Rohit', 'Jasprit', 'Hardik', 'Rishabh', 'Shubman', 'Ishan', 'Suryakumar', 'Ravindra', 'Mohammed', 'Shreyas', 'Axar', 'Kuldeep', 'Yuzvendra', 'Sanju', 'Ruturaj', 'Yashasvi', 'Tilak', 'Rinku', 'Jitesh', 'Mukesh', 'Arshdeep', 'Umran', 'Avesh', 'Ravi', 'Shardul', 'Washington', 'Deepak', 'Prasidh']
const LAST_NAMES = ['Sharma', 'Kohli', 'Singh', 'Bumrah', 'Pandya', 'Pant', 'Gill', 'Kishan', 'Yadav', 'Jadeja', 'Shami', 'Iyer', 'Patel', 'Samson', 'Gaikwad', 'Jaiswal', 'Varma', 'Chahal', 'Bishnoi', 'Kumar', 'Chahar', 'Krishna', 'Siraj', 'Thakur', 'Sundar', 'Hooda', 'Tripathi', 'Ahmed', 'Khan', 'Malik']

function randomName(): string {
    return `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateRandomPlayer(id: string, role: Role): Player {
    let bat = 50
    let bowl = 50
    
    // Base stats based on role
    if (role === 'BAT') {
        bat = randomInt(75, 90)
        bowl = randomInt(20, 50)
    } else if (role === 'BOWL') {
        bat = randomInt(10, 40)
        bowl = randomInt(75, 90)
    } else if (role === 'ALL') { // Note: types.ts says 'ALL', usually ALL_ROUNDER? Let's check types.ts again. types.ts says 'ALL' in Role type definition line 8.
        bat = randomInt(65, 85)
        bowl = randomInt(65, 85)
    } else if (role === 'WK') {
        bat = randomInt(70, 88)
        bowl = randomInt(10, 30)
    }

    // Age distribution (weighted towards 20-35)
    const age = randomInt(18, 38)
    
    return {
        id,
        name: randomName(),
        country: 'India', // Default for now
        role,
        age,
        battingRating: bat,
        bowlingRating: bowl,
        fieldingRating: randomInt(60, 95),
        experience: Math.min(100, (age - 18) * 5 + randomInt(0, 20)),
        fitness: randomInt(70, 100),
        form: 0,
        consistency: randomInt(60, 95),
        power: randomInt(50, 98),
        control: randomInt(60, 95),
        value: randomInt(20, 150) / 10, // 2.0 to 15.0 Cr
        career: {
            matches: 0, runs: 0, balls: 0, wickets: 0, ballsBowled: 0, runsConceded: 0,
            fours: 0, sixes: 0, outs: 0, catches: 0, stumpings: 0, fifties: 0, hundreds: 0, fiveWickets: 0
        }
    }
}

export function generateCustomTeam(teamName: string, shortName: string): Team {
    const teamId = `custom-${Date.now()}`
    const players: Player[] = []

    // 15 Player Squad Structure
    // 5 Batsmen
    for (let i = 0; i < 5; i++) players.push(generateRandomPlayer(`${teamId}-bat-${i}`, 'BAT'))
    // 2 WKs
    for (let i = 0; i < 2; i++) players.push(generateRandomPlayer(`${teamId}-wk-${i}`, 'WK'))
    // 3 All-rounders
    for (let i = 0; i < 3; i++) players.push(generateRandomPlayer(`${teamId}-all-${i}`, 'ALL'))
    // 5 Bowlers
    for (let i = 0; i < 5; i++) players.push(generateRandomPlayer(`${teamId}-bowl-${i}`, 'BOWL'))

    // Calculate team ratings
    const avgBat = Math.round(players.reduce((sum, p) => sum + p.battingRating, 0) / players.length)
    const avgBowl = Math.round(players.reduce((sum, p) => sum + p.bowlingRating, 0) / players.length)

    return {
        id: teamId,
        name: teamName,
        short: shortName.toUpperCase().slice(0, 3),
        color: '#4CAF50', // Default green
        battingRating: avgBat,
        bowlingRating: avgBowl,
        players,
        budget: 50, // Initial budget
    }
}
