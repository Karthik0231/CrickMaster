import { Team, GameMode } from '../state/types'

// International team IDs
const INTERNATIONAL_TEAM_IDS = ['ind', 'aus', 'eng', 'pak', 'nz', 'rsa', 'sl', 'ban']

// IPL team IDs
const IPL_TEAM_IDS = ['csk', 'mi', 'rcb', 'kkr', 'rr', 'srh', 'dc', 'pbks', 'gt', 'lsg']

export function filterTeamsByMode(teams: Team[], mode: GameMode | null): Team[] {
    if (!mode || mode === 'Quick' || mode === 'Series') {
        // For Quick and Series, show international teams
        return teams.filter(t => INTERNATIONAL_TEAM_IDS.includes(t.id))
    }

    if (mode === 'IPL' || mode === 'Career') {
        // For IPL and Career, show IPL teams
        return teams.filter(t => IPL_TEAM_IDS.includes(t.id))
    }

    if (mode === 'WorldCup') {
        // For World Cup, show international teams
        return teams.filter(t => INTERNATIONAL_TEAM_IDS.includes(t.id))
    }

    return teams
}

export function getTeamsByIds(teams: Team[], ids: string[]): Team[] {
    return teams.filter(t => ids.includes(t.id))
}
