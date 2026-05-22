import { Team, Player, Role } from '../state/types'

const createPlayer = (
  id: string,
  name: string,
  country: string,
  role: Role,
  bat: number,
  bowl: number,
  field: number,
  age?: number
): Player => {
  const isSubContinent = ['India', 'Pakistan', 'Sri Lanka', 'Bangladesh', 'Afghanistan'].includes(country)
  
  // Base attributes
  const power = role === 'BAT' ? bat + 5 : (role === 'ALL' ? bat : bat - 15)
  const control = role === 'BOWL' ? bowl + 5 : (role === 'ALL' ? bowl : bowl - 15)
  const timing = role === 'BAT' ? bat + 5 : (role === 'ALL' ? bat - 5 : bat - 20)
  
  return {
    id,
    name,
    country,
    role,
    age: age || (20 + Math.floor(Math.random() * 15)),
    battingRating: bat,
    bowlingRating: bowl,
    fieldingRating: field,
    experience: 30 + Math.floor(Math.random() * 60),
    fitness: 85 + Math.floor(Math.random() * 15),
    form: Math.floor(Math.random() * 10) - 2,
    consistency: 60 + Math.floor(Math.random() * 30),
    
    // Detailed Attributes
    power: Math.min(100, Math.max(20, power + (Math.random() * 20 - 10))),
    control: Math.min(100, Math.max(20, control + (Math.random() * 20 - 10))),
    timing: Math.min(100, Math.max(20, timing + (Math.random() * 20 - 10))),
    temperament: 40 + Math.floor(Math.random() * 50),
    strikeRotation: 50 + Math.floor(Math.random() * 40),
    spinPlay: (isSubContinent ? 70 : 50) + Math.floor(Math.random() * 30),
    pacePlay: (isSubContinent ? 50 : 70) + Math.floor(Math.random() * 30),
    
    yorkerSkill: role === 'BOWL' ? 40 + Math.floor(Math.random() * 50) : 10 + Math.floor(Math.random() * 30),
    variationSkill: role === 'BOWL' || role === 'ALL' ? 50 + Math.floor(Math.random() * 40) : 10 + Math.floor(Math.random() * 30),
    bouncerSkill: role === 'BOWL' ? 40 + Math.floor(Math.random() * 50) : 5 + Math.floor(Math.random() * 20),
    pressureHandling: 40 + Math.floor(Math.random() * 50),
    
    value: Math.floor(Math.random() * 15) + 0.5,
    career: {
      matches: 0, runs: 0, balls: 0, wickets: 0, ballsBowled: 0,
      runsConceded: 0, fours: 0, sixes: 0, outs: 0, catches: 0,
      stumpings: 0, fifties: 0, hundreds: 0, fiveWickets: 0,
    },
  }
}

export const TEAMS: Record<string, Team> = {
  // ========== INTERNATIONAL TEAMS ==========
  // Ratings based on ICC T20I rankings 2026 — India #1, England #2, Australia #3, NZ #4, SA #5

  India: {
    id: 'ind', name: 'India', short: 'IND', color: '#0055ff',
    battingRating: 96, bowlingRating: 93,
    players: [
      // Abhishek Sharma: ICC T20I batting rank #1 (875 pts), explosive left-handed opener
      createPlayer('ind1', 'Abhishek Sharma', 'India', 'ALL', 96, 68, 85, 25),
      // Ishan Kishan: ICC T20I batting rank #2 (871 pts), T20 WC 2026 star
      createPlayer('ind2', 'Ishan Kishan', 'India', 'WK', 95, 10, 85, 26),
      // Suryakumar Yadav: Captain, ICC batting rank #7, elite T20 batter
      createPlayer('ind3', 'Suryakumar Yadav', 'India', 'BAT', 97, 15, 90, 34),
      // Tilak Varma: ICC batting rank #6, rising T20 star
      createPlayer('ind4', 'Tilak Varma', 'India', 'BAT', 92, 20, 86, 22),
      // Sanju Samson: WK-batter, excellent T20 record
      createPlayer('ind5', 'Sanju Samson', 'India', 'WK', 91, 10, 87, 30),
      // Hardik Pandya: ICC all-rounder rank #2, premier all-rounder
      createPlayer('ind6', 'Hardik Pandya', 'India', 'ALL', 88, 87, 92, 31),
      // Axar Patel: ICC T20 bowling rank #4, key spin all-rounder
      createPlayer('ind7', 'Axar Patel', 'India', 'ALL', 78, 88, 86, 31),
      // Shivam Dube: Hard-hitting left-hander, T20 WC squad
      createPlayer('ind8', 'Shivam Dube', 'India', 'ALL', 86, 68, 78, 31),
      // Varun Chakravarthy: ICC bowling rank #2, mystery spinner
      createPlayer('ind9', 'Varun Chakravarthy', 'India', 'BOWL', 22, 92, 72, 33),
      // Jasprit Bumrah: ICC bowling rank #6, world-class pacer
      createPlayer('ind10', 'Jasprit Bumrah', 'India', 'BOWL', 25, 98, 82, 31),
      // Kuldeep Yadav: Top wrist-spinner, Asia Cup 2025 star
      createPlayer('ind11', 'Kuldeep Yadav', 'India', 'BOWL', 22, 91, 72, 30),
      // Arshdeep Singh: Left-arm pacer, excellent in powerplay & death
      createPlayer('ind12', 'Arshdeep Singh', 'India', 'BOWL', 12, 88, 72, 26),
      // Virat Kohli: Veteran, still elite T20 batter
      createPlayer('ind13', 'Virat Kohli', 'India', 'BAT', 96, 30, 95, 37),
      // Rohit Sharma: Veteran opener, T20 WC winning captain legacy
      createPlayer('ind14', 'Rohit Sharma', 'India', 'BAT', 93, 20, 80, 38),
      // Nitish Kumar Reddy: Emerging pace-hitting all-rounder
      createPlayer('ind15', 'Nitish Kumar Reddy', 'India', 'ALL', 82, 72, 80, 22),
    ],
  },

  England: {
    id: 'eng', name: 'England', short: 'ENG', color: '#002366',
    battingRating: 91, bowlingRating: 89,
    players: [
      // Jos Buttler: ICC batting rank #8, captain & top finisher
      createPlayer('eng1', 'Jos Buttler', 'England', 'WK', 93, 10, 86, 35),
      // Phil Salt: ICC batting rank #4, explosive opener
      createPlayer('eng2', 'Phil Salt', 'England', 'WK', 92, 10, 84, 28),
      // Jacob Bethell: ICC batting rank #16, rising star of England T20s
      createPlayer('eng3', 'Jacob Bethell', 'England', 'ALL', 88, 72, 85, 22),
      // Harry Brook: Aggressive middle-order batter
      createPlayer('eng4', 'Harry Brook', 'England', 'BAT', 91, 18, 86, 27),
      // Liam Livingstone: Hard-hitting all-rounder
      createPlayer('eng5', 'Liam Livingstone', 'England', 'ALL', 84, 74, 84, 32),
      // Ben Stokes: Elite all-rounder
      createPlayer('eng6', 'Ben Stokes', 'England', 'ALL', 86, 84, 91, 35),
      // Sam Curran: Useful all-rounder
      createPlayer('eng7', 'Sam Curran', 'England', 'ALL', 74, 87, 82, 27),
      // Adil Rashid: ICC bowling rank #4, top leg-spinner
      createPlayer('eng8', 'Adil Rashid', 'England', 'BOWL', 28, 91, 72, 37),
      // Jofra Archer: World-class pace bowler
      createPlayer('eng9', 'Jofra Archer', 'England', 'BOWL', 32, 93, 76, 30),
      // Mark Wood: Express pacer
      createPlayer('eng10', 'Mark Wood', 'England', 'BOWL', 22, 91, 74, 35),
      // Chris Woakes: Reliable pace all-rounder
      createPlayer('eng11', 'Chris Woakes', 'England', 'BOWL', 58, 88, 80, 36),
      // Joe Root: Versatile batting anchor
      createPlayer('eng12', 'Joe Root', 'England', 'BAT', 88, 38, 88, 35),
      // Jonny Bairstow: Power hitter
      createPlayer('eng13', 'Jonny Bairstow', 'England', 'BAT', 87, 10, 82, 36),
      // Brydon Carse: Pace bowling all-rounder
      createPlayer('eng14', 'Brydon Carse', 'England', 'ALL', 68, 86, 78, 29),
      // Reece Topley: Left-arm pacer
      createPlayer('eng15', 'Reece Topley', 'England', 'BOWL', 16, 84, 70, 31),
    ],
  },

  Australia: {
    id: 'aus', name: 'Australia', short: 'AUS', color: '#ffcc00',
    battingRating: 91, bowlingRating: 93,
    players: [
      // Travis Head: Destructive opener, T20 WC 2026 semi-finalist
      createPlayer('aus1', 'Travis Head', 'Australia', 'BAT', 96, 42, 82, 31),
      // Matthew Short: T20I opener, consistent performer
      createPlayer('aus2', 'Matthew Short', 'Australia', 'ALL', 86, 72, 80, 28),
      // Steve Smith: Experienced middle-order
      createPlayer('aus3', 'Steve Smith', 'Australia', 'BAT', 88, 22, 90, 36),
      // Glenn Maxwell: Elite T20 all-rounder
      createPlayer('aus4', 'Glenn Maxwell', 'Australia', 'ALL', 93, 78, 95, 36),
      // Tim David: Power hitter, T20 specialist
      createPlayer('aus5', 'Tim David', 'Australia', 'BAT', 89, 10, 82, 29),
      // Josh Inglis: WK-batter
      createPlayer('aus6', 'Josh Inglis', 'Australia', 'WK', 85, 10, 88, 29),
      // Cameron Green: Premium all-rounder (KKR IPL 2026 record buy)
      createPlayer('aus7', 'Cameron Green', 'Australia', 'ALL', 86, 82, 89, 26),
      // Pat Cummins: Elite pace all-rounder, captain
      createPlayer('aus8', 'Pat Cummins', 'Australia', 'BOWL', 64, 95, 87, 32),
      // Mitchell Starc: World-class left-arm pacer
      createPlayer('aus9', 'Mitchell Starc', 'Australia', 'BOWL', 52, 94, 82, 36),
      // Adam Zampa: ICC bowling rank #7, top leg-spinner
      createPlayer('aus10', 'Adam Zampa', 'Australia', 'BOWL', 18, 91, 76, 33),
      // Josh Hazlewood: Precision pace bowler
      createPlayer('aus11', 'Josh Hazlewood', 'Australia', 'BOWL', 12, 93, 82, 34),
      // Spencer Johnson: Left-arm pace, IPL 2026 GT
      createPlayer('aus12', 'Spencer Johnson', 'Australia', 'BOWL', 18, 84, 72, 29),
      // Mathew Short (bat only alt): back-up slot
      createPlayer('aus13', 'Jake Fraser-McGurk', 'Australia', 'BAT', 93, 10, 82, 23),
      // Alex Carey: WK back-up
      createPlayer('aus14', 'Alex Carey', 'Australia', 'WK', 80, 10, 86, 34),
      // Nathan Ellis: Death bowling specialist
      createPlayer('aus15', 'Nathan Ellis', 'Australia', 'BOWL', 14, 85, 74, 30),
    ],
  },

  Pakistan: {
    id: 'pak', name: 'Pakistan', short: 'PAK', color: '#00a651',
    battingRating: 86, bowlingRating: 88,
    players: [
      // Sahibzada Farhan: ICC batting rank #3, explosive opener
      createPlayer('pak1', 'Sahibzada Farhan', 'Pakistan', 'BAT', 91, 10, 82, 27),
      // Babar Azam: Elite batter, former world #1
      createPlayer('pak2', 'Babar Azam', 'Pakistan', 'BAT', 94, 20, 90, 31),
      // Mohammad Rizwan: WK-batter, T20 specialist
      createPlayer('pak3', 'Mohammad Rizwan', 'Pakistan', 'WK', 90, 10, 86, 32),
      // Usman Khan: Aggressive top-order batter
      createPlayer('pak4', 'Usman Khan', 'Pakistan', 'BAT', 84, 10, 78, 26),
      // Shadab Khan: Leg-spin all-rounder
      createPlayer('pak5', 'Shadab Khan', 'Pakistan', 'ALL', 72, 84, 82, 26),
      // Iftikhar Ahmed: Finisher all-rounder
      createPlayer('pak6', 'Iftikhar Ahmed', 'Pakistan', 'ALL', 80, 70, 76, 34),
      // Mohammad Nawaz: Slow left-arm all-rounder
      createPlayer('pak7', 'Mohammad Nawaz', 'Pakistan', 'ALL', 70, 80, 74, 30),
      // Shaheen Afridi: World-class left-arm pacer
      createPlayer('pak8', 'Shaheen Afridi', 'Pakistan', 'BOWL', 38, 94, 77, 25),
      // Haris Rauf: Express pacer
      createPlayer('pak9', 'Haris Rauf', 'Pakistan', 'BOWL', 22, 90, 72, 31),
      // Naseem Shah: Young express pacer
      createPlayer('pak10', 'Naseem Shah', 'Pakistan', 'BOWL', 28, 88, 74, 22),
      // Abrar Ahmed: Mystery spin
      createPlayer('pak11', 'Abrar Ahmed', 'Pakistan', 'BOWL', 20, 84, 70, 25),
      // Fakhar Zaman: Explosive left-handed opener
      createPlayer('pak12', 'Fakhar Zaman', 'Pakistan', 'BAT', 88, 10, 80, 34),
      // Imad Wasim: Left-arm spin all-rounder
      createPlayer('pak13', 'Imad Wasim', 'Pakistan', 'ALL', 74, 78, 78, 36),
      // Saim Ayub: Young top-order batter
      createPlayer('pak14', 'Saim Ayub', 'Pakistan', 'BAT', 86, 16, 80, 22),
      // Mohammad Hasnain: Express pace
      createPlayer('pak15', 'Mohammad Hasnain', 'Pakistan', 'BOWL', 18, 84, 70, 25),
    ],
  },

  NewZealand: {
    id: 'nz', name: 'New Zealand', short: 'NZ', color: '#000000',
    battingRating: 89, bowlingRating: 88,
    players: [
      // Tim Seifert: ICC batting rank #9, T20 WC 2026 star WK-batter
      createPlayer('nz1', 'Tim Seifert', 'New Zealand', 'WK', 88, 10, 84, 29),
      // Kane Williamson: Veteran top-order anchor
      createPlayer('nz2', 'Kane Williamson', 'New Zealand', 'BAT', 92, 26, 88, 34),
      // Finn Allen: Explosive opener
      createPlayer('nz3', 'Finn Allen', 'New Zealand', 'WK', 88, 10, 82, 26),
      // Devon Conway: Top-order left-hander
      createPlayer('nz4', 'Devon Conway', 'New Zealand', 'BAT', 87, 10, 83, 33),
      // Daryl Mitchell: Hard-hitting all-rounder
      createPlayer('nz5', 'Daryl Mitchell', 'New Zealand', 'ALL', 86, 74, 86, 33),
      // Glenn Phillips: Attacking all-rounder
      createPlayer('nz6', 'Glenn Phillips', 'New Zealand', 'ALL', 88, 70, 90, 28),
      // Rachin Ravindra: Elegant left-handed all-rounder
      createPlayer('nz7', 'Rachin Ravindra', 'New Zealand', 'ALL', 86, 72, 84, 25),
      // Mitchell Santner: Left-arm spin all-rounder, NZ T20 captain
      createPlayer('nz8', 'Mitchell Santner', 'New Zealand', 'ALL', 72, 84, 86, 33),
      // Trent Boult: World-class left-arm swing pacer
      createPlayer('nz9', 'Trent Boult', 'New Zealand', 'BOWL', 32, 91, 79, 37),
      // Lockie Ferguson: Express right-arm pacer
      createPlayer('nz10', 'Lockie Ferguson', 'New Zealand', 'BOWL', 22, 90, 74, 34),
      // Tim Southee: Experienced right-arm pacer
      createPlayer('nz11', 'Tim Southee', 'New Zealand', 'BOWL', 48, 88, 76, 37),
      // Ish Sodhi: Leg-spin bowler
      createPlayer('nz12', 'Ish Sodhi', 'New Zealand', 'BOWL', 24, 86, 71, 33),
      // James Neesham: Big-hitting all-rounder
      createPlayer('nz13', 'James Neesham', 'New Zealand', 'ALL', 78, 78, 83, 35),
      // Mark Chapman: Versatile middle-order batter
      createPlayer('nz14', 'Mark Chapman', 'New Zealand', 'BAT', 80, 16, 81, 31),
      // Adam Milne: Pace bowler
      createPlayer('nz15', 'Adam Milne', 'New Zealand', 'BOWL', 16, 84, 72, 33),
    ],
  },

  SouthAfrica: {
    id: 'rsa', name: 'South Africa', short: 'RSA', color: '#007a4d',
    battingRating: 89, bowlingRating: 91,
    players: [
      // Aiden Markram: Captain, ICC batting rank #5 (755 pts in 2024 rankings)
      createPlayer('rsa1', 'Aiden Markram', 'South Africa', 'ALL', 90, 70, 90, 30),
      // Dewald Brevis: ICC batting rank #8 (2026), explosive young talent
      createPlayer('rsa2', 'Dewald Brevis', 'South Africa', 'BAT', 91, 10, 85, 22),
      // Reeza Hendricks: Consistent opener
      createPlayer('rsa3', 'Reeza Hendricks', 'South Africa', 'BAT', 84, 10, 80, 35),
      // Heinrich Klaasen: Destructive WK-batter
      createPlayer('rsa4', 'Heinrich Klaasen', 'South Africa', 'WK', 92, 10, 84, 33),
      // David Miller: Explosive finisher
      createPlayer('rsa5', 'David Miller', 'South Africa', 'BAT', 88, 10, 91, 35),
      // Tristan Stubbs: Hard-hitting middle-order
      createPlayer('rsa6', 'Tristan Stubbs', 'South Africa', 'BAT', 84, 16, 88, 25),
      // Marco Jansen: All-rounder — tall left-arm pacer who can bat
      createPlayer('rsa7', 'Marco Jansen', 'South Africa', 'ALL', 72, 87, 82, 25),
      // Corbin Bosch: ICC bowling rank #5 all-rounder
      createPlayer('rsa8', 'Corbin Bosch', 'South Africa', 'ALL', 74, 84, 80, 30),
      // Kagiso Rabada: World-class pace bowler
      createPlayer('rsa9', 'Kagiso Rabada', 'South Africa', 'BOWL', 32, 95, 84, 31),
      // Anrich Nortje: Express pacer
      createPlayer('rsa10', 'Anrich Nortje', 'South Africa', 'BOWL', 22, 92, 76, 32),
      // Tabraiz Shamsi: Left-arm wrist-spinner
      createPlayer('rsa11', 'Tabraiz Shamsi', 'South Africa', 'BOWL', 22, 88, 70, 36),
      // Keshav Maharaj: Left-arm orthodox spinner
      createPlayer('rsa12', 'Keshav Maharaj', 'South Africa', 'BOWL', 38, 86, 76, 35),
      // Quinton de Kock: Veteran WK-batter
      createPlayer('rsa13', 'Quinton de Kock', 'South Africa', 'WK', 90, 10, 86, 33),
      // Rassie van der Dussen: Reliable middle-order batter
      createPlayer('rsa14', 'Rassie van der Dussen', 'South Africa', 'BAT', 85, 16, 87, 36),
      // Gerald Coetzee: Young right-arm fast bowler (up 14 spots recently)
      createPlayer('rsa15', 'Gerald Coetzee', 'South Africa', 'BOWL', 28, 86, 78, 24),
    ],
  },

  SriLanka: {
    id: 'sl', name: 'Sri Lanka', short: 'SL', color: '#003da5',
    battingRating: 84, bowlingRating: 86,
    players: [
      // Pathum Nissanka: ICC batting rank #5, consistent opening batter
      createPlayer('sl1', 'Pathum Nissanka', 'Sri Lanka', 'BAT', 88, 10, 82, 27),
      // Kusal Mendis: Attacking WK-batter, captain
      createPlayer('sl2', 'Kusal Mendis', 'Sri Lanka', 'WK', 88, 10, 84, 29),
      // Kusal Perera: ICC batting rank #9, aggressive left-handed WK-batter
      createPlayer('sl3', 'Kusal Perera', 'Sri Lanka', 'WK', 85, 10, 80, 35),
      // Charith Asalanka: Middle-order left-hander
      createPlayer('sl4', 'Charith Asalanka', 'Sri Lanka', 'ALL', 82, 70, 82, 27),
      // Wanindu Hasaranga: Premier leg-spin all-rounder
      createPlayer('sl5', 'Wanindu Hasaranga', 'Sri Lanka', 'ALL', 74, 90, 84, 27),
      // Dhananjaya de Silva: Versatile all-rounder
      createPlayer('sl6', 'Dhananjaya de Silva', 'Sri Lanka', 'ALL', 80, 78, 80, 33),
      // Dasun Shanaka: Hard-hitting all-rounder
      createPlayer('sl7', 'Dasun Shanaka', 'Sri Lanka', 'ALL', 76, 76, 81, 33),
      // Maheesh Theekshana: Mystery off-spin
      createPlayer('sl8', 'Maheesh Theekshana', 'Sri Lanka', 'BOWL', 26, 88, 74, 24),
      // Matheesha Pathirana: Slinger pacer, KKR IPL 2026
      createPlayer('sl9', 'Matheesha Pathirana', 'Sri Lanka', 'BOWL', 18, 92, 72, 22),
      // Dilshan Madushanka: Left-arm pacer
      createPlayer('sl10', 'Dilshan Madushanka', 'Sri Lanka', 'BOWL', 22, 86, 73, 24),
      // Nuwan Thushara: Right-arm pacer
      createPlayer('sl11', 'Nuwan Thushara', 'Sri Lanka', 'BOWL', 14, 84, 71, 27),
      // Dunith Wellalage: Left-arm spin all-rounder
      createPlayer('sl12', 'Dunith Wellalage', 'Sri Lanka', 'ALL', 72, 82, 78, 23),
      // Sadeera Samarawickrama: Young batter
      createPlayer('sl13', 'Sadeera Samarawickrama', 'Sri Lanka', 'BAT', 80, 10, 77, 28),
      // Eshan Malinga: Young pacer (rising talent)
      createPlayer('sl14', 'Eshan Malinga', 'Sri Lanka', 'BOWL', 18, 82, 70, 21),
      // Chamika Karunaratne: Pace all-rounder
      createPlayer('sl15', 'Chamika Karunaratne', 'Sri Lanka', 'ALL', 70, 74, 74, 28),
    ],
  },

  Bangladesh: {
    id: 'ban', name: 'Bangladesh', short: 'BAN', color: '#006a4e',
    battingRating: 80, bowlingRating: 82,
    players: [
      // Litton Das: WK-batter, opener
      createPlayer('ban1', 'Litton Das', 'Bangladesh', 'WK', 84, 10, 81, 30),
      // Tanzid Hasan: Aggressive young opener
      createPlayer('ban2', 'Tanzid Hasan', 'Bangladesh', 'BAT', 82, 10, 78, 23),
      // Towhid Hridoy: Rising middle-order batter
      createPlayer('ban3', 'Towhid Hridoy', 'Bangladesh', 'BAT', 80, 16, 77, 25),
      // Shakib Al Hasan: All-time great all-rounder
      createPlayer('ban4', 'Shakib Al Hasan', 'Bangladesh', 'ALL', 84, 86, 85, 38),
      // Mahmudullah: Veteran finisher
      createPlayer('ban5', 'Mahmudullah', 'Bangladesh', 'ALL', 78, 70, 80, 39),
      // Mehidy Hasan Miraz: Spin all-rounder
      createPlayer('ban6', 'Mehidy Hasan Miraz', 'Bangladesh', 'ALL', 72, 82, 80, 27),
      // Mushfiqur Rahim: Veteran WK-batter
      createPlayer('ban7', 'Mushfiqur Rahim', 'Bangladesh', 'WK', 82, 10, 82, 37),
      // Mustafizur Rahman: ICC bowling rank #9, left-arm pacer with variations
      createPlayer('ban8', 'Mustafizur Rahman', 'Bangladesh', 'BOWL', 24, 88, 72, 29),
      // Taskin Ahmed: Express right-arm pacer
      createPlayer('ban9', 'Taskin Ahmed', 'Bangladesh', 'BOWL', 22, 84, 74, 30),
      // Shoriful Islam: Left-arm pace all-rounder
      createPlayer('ban10', 'Shoriful Islam', 'Bangladesh', 'BOWL', 20, 80, 70, 23),
      // Tanzim Hasan Sakib: Young right-arm pacer
      createPlayer('ban11', 'Tanzim Hasan Sakib', 'Bangladesh', 'BOWL', 18, 78, 67, 22),
      // Rishad Hossain: Leg-spin all-rounder
      createPlayer('ban12', 'Rishad Hossain', 'Bangladesh', 'ALL', 62, 80, 72, 21),
      // Nasum Ahmed: Left-arm orthodox spinner
      createPlayer('ban13', 'Nasum Ahmed', 'Bangladesh', 'BOWL', 26, 76, 70, 28),
      // Afif Hossain: Lower-order hitting all-rounder
      createPlayer('ban14', 'Afif Hossain', 'Bangladesh', 'ALL', 74, 66, 76, 25),
      // Hasan Mahmud: Right-arm pace bowler
      createPlayer('ban15', 'Hasan Mahmud', 'Bangladesh', 'BOWL', 18, 76, 68, 25),
    ],
  },

  // ========== IPL 2026 TEAMS ==========
  // Squads based on IPL 2026 official rosters

  CSK: {
    id: 'csk', name: 'Chennai Super Kings', short: 'CSK', color: '#ffff00',
    battingRating: 87, bowlingRating: 85,
    players: [
      // Ruturaj Gaikwad: Captain, elegant opener
      createPlayer('csk1', 'Ruturaj Gaikwad', 'India', 'BAT', 91, 10, 86, 28),
      // Sanju Samson: Acquired from RR, powerful WK-batter
      createPlayer('csk2', 'Sanju Samson', 'India', 'WK', 91, 10, 87, 30),
      // Ayush Mhatre: Young aggressive opener
      createPlayer('csk3', 'Ayush Mhatre', 'India', 'BAT', 84, 10, 78, 19),
      // Dewald Brevis: ICC T20 batting rank #8, South African power-hitter
      createPlayer('csk4', 'Dewald Brevis', 'South Africa', 'BAT', 91, 10, 85, 22),
      // Shivam Dube: Explosive left-handed all-rounder
      createPlayer('csk5', 'Shivam Dube', 'India', 'ALL', 86, 68, 78, 31),
      // MS Dhoni: Legend WK-finisher
      createPlayer('csk6', 'MS Dhoni', 'India', 'WK', 82, 10, 92, 44),
      // Kartik Sharma: Uncapped WK-batter (₹14.2 cr, big auction buy)
      createPlayer('csk7', 'Kartik Sharma', 'India', 'WK', 78, 10, 76, 22),
      // Prashant Veer: Uncapped big-hitting all-rounder (₹14.2 cr buy)
      createPlayer('csk8', 'Prashant Veer', 'India', 'ALL', 76, 74, 74, 22),
      // Akeal Hosein: Left-arm spin all-rounder (West Indies)
      createPlayer('csk9', 'Akeal Hosein', 'West Indies', 'ALL', 52, 90, 86, 31),
      // Noor Ahmad: Afghanistan left-arm wrist-spinner
      createPlayer('csk10', 'Noor Ahmad', 'Afghanistan', 'BOWL', 18, 87, 72, 20),
      // Khaleel Ahmed: Left-arm swing bowler
      createPlayer('csk11', 'Khaleel Ahmed', 'India', 'BOWL', 20, 83, 71, 27),
      // Nathan Ellis: Australian death-bowling specialist
      createPlayer('csk12', 'Nathan Ellis', 'Australia', 'BOWL', 14, 85, 74, 30),
      // Matt Henry: New Zealand swing pacer
      createPlayer('csk13', 'Matt Henry', 'New Zealand', 'BOWL', 26, 84, 72, 33),
      // Anshul Kamboj: Young right-arm pacer
      createPlayer('csk14', 'Anshul Kamboj', 'India', 'BOWL', 16, 80, 70, 23),
      // Sarfaraz Khan: Aggressive middle-order batter
      createPlayer('csk15', 'Sarfaraz Khan', 'India', 'BAT', 82, 10, 72, 27),
    ],
  },

  RCB: {
    id: 'rcb', name: 'Royal Challengers Bengaluru', short: 'RCB', color: '#ec1c24',
    battingRating: 92, bowlingRating: 83,
    // RCB: Defending IPL 2025 champions
    players: [
      // Virat Kohli: Icon player, batting great
      createPlayer('rcb1', 'Virat Kohli', 'India', 'BAT', 96, 30, 95, 37),
      // Rajat Patidar: Captain, RCB's IPL 2025 title-winning skipper
      createPlayer('rcb2', 'Rajat Patidar', 'India', 'BAT', 88, 10, 80, 31),
      // Phil Salt: ICC batting rank #4, explosive opener
      createPlayer('rcb3', 'Phil Salt', 'England', 'WK', 92, 10, 84, 28),
      // Jacob Bethell: ICC batting rank #16, rising England all-rounder
      createPlayer('rcb4', 'Jacob Bethell', 'England', 'ALL', 88, 72, 85, 22),
      // Devdutt Padikkal: Left-handed middle-order batter
      createPlayer('rcb5', 'Devdutt Padikkal', 'India', 'BAT', 82, 10, 78, 25),
      // Venkatesh Iyer: Power-hitting all-rounder (acquired from KKR)
      createPlayer('rcb6', 'Venkatesh Iyer', 'India', 'ALL', 84, 70, 81, 30),
      // Krunal Pandya: Left-arm spin all-rounder
      createPlayer('rcb7', 'Krunal Pandya', 'India', 'ALL', 78, 82, 81, 34),
      // Tim David: Aggressive middle-order finisher
      createPlayer('rcb8', 'Tim David', 'Singapore', 'BAT', 89, 10, 82, 29),
      // Romario Shepherd: West Indian pace all-rounder
      createPlayer('rcb9', 'Romario Shepherd', 'West Indies', 'ALL', 76, 82, 77, 30),
      // Josh Hazlewood: Australian precision pacer
      createPlayer('rcb10', 'Josh Hazlewood', 'Australia', 'BOWL', 14, 93, 82, 34),
      // Bhuvneshwar Kumar: Veteran swing bowler
      createPlayer('rcb11', 'Bhuvneshwar Kumar', 'India', 'BOWL', 38, 87, 77, 35),
      // Yash Dayal: Left-arm pacer
      createPlayer('rcb12', 'Yash Dayal', 'India', 'BOWL', 16, 82, 71, 27),
      // Nuwan Thushara: Sri Lanka right-arm pacer
      createPlayer('rcb13', 'Nuwan Thushara', 'Sri Lanka', 'BOWL', 14, 84, 71, 27),
      // Vicky Ostwal: Young left-arm finger spinner
      createPlayer('rcb14', 'Vicky Ostwal', 'India', 'BOWL', 22, 78, 72, 22),
      // Jitesh Sharma: Backup WK-batter finisher
      createPlayer('rcb15', 'Jitesh Sharma', 'India', 'WK', 80, 10, 80, 30),
    ],
  },

  MI: {
    id: 'mi', name: 'Mumbai Indians', short: 'MI', color: '#0044ff',
    battingRating: 93, bowlingRating: 90,
    players: [
      // Rohit Sharma: Iconic opener
      createPlayer('mi1', 'Rohit Sharma', 'India', 'BAT', 93, 20, 80, 38),
      // Suryakumar Yadav: T20 No.1 batter (ICC rank #7/captain)
      createPlayer('mi2', 'Suryakumar Yadav', 'India', 'BAT', 97, 15, 90, 34),
      // Ishan Kishan: ICC batting rank #2 (2026 T20 WC), WK-batter
      createPlayer('mi3', 'Ishan Kishan', 'India', 'WK', 95, 10, 85, 26),
      // Tilak Varma: ICC batting rank #6, left-handed dasher
      createPlayer('mi4', 'Tilak Varma', 'India', 'BAT', 92, 20, 86, 22),
      // Hardik Pandya: Captain, ICC all-rounder rank #2
      createPlayer('mi5', 'Hardik Pandya', 'India', 'ALL', 88, 87, 92, 31),
      // Sherfane Rutherford: West Indian power-hitter (acquired from GT)
      createPlayer('mi6', 'Sherfane Rutherford', 'West Indies', 'BAT', 84, 10, 82, 27),
      // Naman Dhir: Young all-rounder
      createPlayer('mi7', 'Naman Dhir', 'India', 'ALL', 74, 66, 76, 25),
      // Jasprit Bumrah: ICC bowling rank #6, world-class pacer
      createPlayer('mi8', 'Jasprit Bumrah', 'India', 'BOWL', 25, 98, 82, 31),
      // Trent Boult: New Zealand left-arm swing pacer
      createPlayer('mi9', 'Trent Boult', 'New Zealand', 'BOWL', 32, 91, 79, 37),
      // Gerald Coetzee: South Africa pace (recently up 14 spots in ICC rankings)
      createPlayer('mi10', 'Gerald Coetzee', 'South Africa', 'BOWL', 28, 87, 79, 24),
      // Deepak Chahar: Right-arm swing pacer
      createPlayer('mi11', 'Deepak Chahar', 'India', 'BOWL', 42, 87, 76, 32),
      // Reece Topley: Left-arm English pacer
      createPlayer('mi12', 'Reece Topley', 'England', 'BOWL', 16, 84, 70, 31),
      // Robin Minz: Young wicketkeeper
      createPlayer('mi13', 'Robin Minz', 'India', 'WK', 72, 10, 74, 21),
      // Will Jacks: England batting all-rounder (if in squad)
      createPlayer('mi14', 'Will Jacks', 'England', 'ALL', 88, 76, 85, 26),
      // Nehal Wadhera: Middle-order batter
      createPlayer('mi15', 'Nehal Wadhera', 'India', 'BAT', 78, 10, 76, 24),
    ],
  },

  KKR: {
    id: 'kkr', name: 'Kolkata Knight Riders', short: 'KKR', color: '#3a225d',
    battingRating: 91, bowlingRating: 89,
    // KKR: 3-time IPL champions, Cameron Green record buy (₹25.2 cr)
    players: [
      // Phil Salt: Moved to RCB; Quinton de Kock opens for KKR
      createPlayer('kkr1', 'Quinton de Kock', 'South Africa', 'WK', 90, 10, 86, 33),
      // Sunil Narine: All-time KKR great, opening batting all-rounder
      createPlayer('kkr2', 'Sunil Narine', 'West Indies', 'ALL', 85, 88, 76, 36),
      // Cameron Green: Record overseas buy (₹25.2 cr), pace all-rounder
      createPlayer('kkr3', 'Cameron Green', 'Australia', 'ALL', 86, 82, 89, 26),
      // Angkrish Raghuvanshi: Young explosive batter
      createPlayer('kkr4', 'Angkrish Raghuvanshi', 'India', 'BAT', 82, 10, 78, 19),
      // Venkatesh Iyer: Moved to RCB; Rinku Singh bats here
      createPlayer('kkr5', 'Rinku Singh', 'India', 'BAT', 90, 10, 86, 27),
      // Andre Russell: Legendary hard-hitting all-rounder
      createPlayer('kkr6', 'Andre Russell', 'West Indies', 'ALL', 93, 87, 86, 37),
      // Rahmanullah Gurbaz: Afghanistan aggressive WK-batter
      createPlayer('kkr7', 'Rahmanullah Gurbaz', 'Afghanistan', 'WK', 86, 10, 78, 23),
      // Moeen Ali: England spin batting all-rounder
      createPlayer('kkr8', 'Moeen Ali', 'England', 'ALL', 80, 82, 77, 39),
      // Mitchell Starc: World-class left-arm pacer
      createPlayer('kkr9', 'Mitchell Starc', 'Australia', 'BOWL', 52, 94, 82, 36),
      // Matheesha Pathirana: SL slinger pacer (₹18 cr buy)
      createPlayer('kkr10', 'Matheesha Pathirana', 'Sri Lanka', 'BOWL', 18, 92, 72, 22),
      // Varun Chakravarthy: ICC bowling rank #2, mystery spinner
      createPlayer('kkr11', 'Varun Chakravarthy', 'India', 'BOWL', 22, 92, 72, 33),
      // Harshit Rana: Young right-arm pacer
      createPlayer('kkr12', 'Harshit Rana', 'India', 'BOWL', 26, 85, 76, 23),
      // Blessing Muzarabani: Zimbabwe tall pacer (replaced Mustafizur)
      createPlayer('kkr13', 'Blessing Muzarabani', 'Zimbabwe', 'BOWL', 18, 83, 72, 27),
      // Manish Pandey: Experienced middle-order batter
      createPlayer('kkr14', 'Manish Pandey', 'India', 'BAT', 78, 10, 79, 35),
      // Ramandeep Singh: Punjabi all-rounder
      createPlayer('kkr15', 'Ramandeep Singh', 'India', 'ALL', 76, 62, 86, 28),
    ],
  },

  RR: {
    id: 'rr', name: 'Rajasthan Royals', short: 'RR', color: '#254aa5',
    battingRating: 88, bowlingRating: 89,
    players: [
      // Yashasvi Jaiswal: Explosive left-handed opener
      createPlayer('rr1', 'Yashasvi Jaiswal', 'India', 'BAT', 92, 10, 82, 23),
      // Jos Buttler: ICC batting rank #8, WK-batter
      createPlayer('rr2', 'Jos Buttler', 'England', 'WK', 93, 10, 86, 35),
      // Riyan Parag: Captain (or lead batter), aggressive right-hander
      createPlayer('rr3', 'Riyan Parag', 'India', 'ALL', 90, 70, 82, 23),
      // Dhruv Jurel: Young WK-batter with flair
      createPlayer('rr4', 'Dhruv Jurel', 'India', 'WK', 84, 10, 86, 24),
      // Shimron Hetmyer: West Indian power-finisher
      createPlayer('rr5', 'Shimron Hetmyer', 'West Indies', 'BAT', 88, 10, 82, 28),
      // Rovman Powell: Hard-hitting West Indian middle-order
      createPlayer('rr6', 'Rovman Powell', 'West Indies', 'BAT', 86, 22, 82, 31),
      // Wanindu Hasaranga: Premium leg-spin all-rounder
      createPlayer('rr7', 'Wanindu Hasaranga', 'Sri Lanka', 'ALL', 74, 90, 84, 27),
      // Ravichandran Ashwin: Veteran off-spin all-rounder
      createPlayer('rr8', 'Ravichandran Ashwin', 'India', 'ALL', 67, 88, 81, 39),
      // Trent Boult: Left-arm new-ball specialist
      createPlayer('rr9', 'Trent Boult', 'New Zealand', 'BOWL', 32, 91, 79, 37),
      // Yuzvendra Chahal: Leg-spin bowler
      createPlayer('rr10', 'Yuzvendra Chahal', 'India', 'BOWL', 24, 89, 71, 34),
      // Avesh Khan: Right-arm pace bowler
      createPlayer('rr11', 'Avesh Khan', 'India', 'BOWL', 16, 85, 72, 28),
      // Maheesh Theekshana: Mystery off-spin
      createPlayer('rr12', 'Maheesh Theekshana', 'Sri Lanka', 'BOWL', 26, 88, 74, 24),
      // Nandre Burger: South Africa left-arm pacer
      createPlayer('rr13', 'Nandre Burger', 'South Africa', 'BOWL', 20, 84, 74, 29),
      // Sandeep Sharma: Right-arm swing pacer
      createPlayer('rr14', 'Sandeep Sharma', 'India', 'BOWL', 22, 86, 70, 32),
      // Karun Nair: Experienced middle-order batter
      createPlayer('rr15', 'Karun Nair', 'India', 'BAT', 80, 10, 78, 32),
    ],
  },

  SRH: {
    id: 'srh', name: 'Sunrisers Hyderabad', short: 'SRH', color: '#ff822a',
    battingRating: 93, bowlingRating: 86,
    players: [
      // Travis Head: Destructive SRH opener
      createPlayer('srh1', 'Travis Head', 'Australia', 'BAT', 96, 42, 82, 31),
      // Abhishek Sharma: ICC T20I batting rank #1 (875 pts), SRH all-rounder
      createPlayer('srh2', 'Abhishek Sharma', 'India', 'ALL', 96, 68, 80, 25),
      // Vaibhav Suryavanshi: Sensational young batter, IPL 2026 Orange Cap leader
      createPlayer('srh3', 'Vaibhav Suryavanshi', 'India', 'BAT', 90, 10, 78, 14),
      // Nitish Kumar Reddy: Exciting all-rounder
      createPlayer('srh4', 'Nitish Kumar Reddy', 'India', 'ALL', 84, 72, 81, 22),
      // Heinrich Klaasen: Destructive WK-finisher
      createPlayer('srh5', 'Heinrich Klaasen', 'South Africa', 'WK', 92, 10, 84, 33),
      // Aiden Markram: South Africa captain & all-rounder
      createPlayer('srh6', 'Aiden Markram', 'South Africa', 'ALL', 90, 70, 90, 30),
      // Liam Livingstone: Hard-hitting all-rounder (₹13 cr SRH buy)
      createPlayer('srh7', 'Liam Livingstone', 'England', 'ALL', 84, 74, 84, 32),
      // Pat Cummins: Captain & elite pace all-rounder
      createPlayer('srh8', 'Pat Cummins', 'Australia', 'BOWL', 64, 95, 87, 32),
      // Harshal Patel: Death-over specialist (joined from PBKS)
      createPlayer('srh9', 'Harshal Patel', 'India', 'BOWL', 42, 87, 76, 34),
      // Brydon Carse: England pace all-rounder
      createPlayer('srh10', 'Brydon Carse', 'England', 'ALL', 68, 86, 78, 29),
      // Washington Sundar: Batting all-rounder off-spin
      createPlayer('srh11', 'Washington Sundar', 'India', 'ALL', 72, 80, 81, 25),
      // Shivam Mavi: Right-arm pace
      createPlayer('srh12', 'Shivam Mavi', 'India', 'BOWL', 28, 82, 72, 26),
      // Zeeshan Ansari: Left-arm wrist-spinner
      createPlayer('srh13', 'Zeeshan Ansari', 'India', 'BOWL', 20, 78, 68, 23),
      // Jaydev Unadkat: Left-arm swing pacer
      createPlayer('srh14', 'Jaydev Unadkat', 'India', 'BOWL', 32, 79, 73, 33),
      // Harsh Dubey: Finger-spin all-rounder
      createPlayer('srh15', 'Harsh Dubey', 'India', 'ALL', 62, 76, 70, 24),
    ],
  },

  DC: {
    id: 'dc', name: 'Delhi Capitals', short: 'DC', color: '#004c93',
    battingRating: 88, bowlingRating: 87,
    players: [
      // KL Rahul: Anchor WK-batter, DC captain
      createPlayer('dc1', 'KL Rahul', 'India', 'WK', 89, 10, 88, 32),
      // Jake Fraser-McGurk: Explosive Australian opener
      createPlayer('dc2', 'Jake Fraser-McGurk', 'Australia', 'BAT', 93, 10, 82, 23),
      // Abishek Porel: Young WK-batter
      createPlayer('dc3', 'Abishek Porel', 'India', 'WK', 82, 10, 81, 22),
      // Pathum Nissanka: ICC batting rank #5, elegant opener
      createPlayer('dc4', 'Pathum Nissanka', 'Sri Lanka', 'BAT', 88, 10, 82, 27),
      // Tristan Stubbs: Hard-hitting South African middle-order
      createPlayer('dc5', 'Tristan Stubbs', 'South Africa', 'BAT', 84, 16, 88, 25),
      // Axar Patel: ICC T20 bowling rank #4, spin all-rounder
      createPlayer('dc6', 'Axar Patel', 'India', 'ALL', 78, 88, 86, 31),
      // Ashutosh Sharma: Big-hitting middle-order uncapped Indian
      createPlayer('dc7', 'Ashutosh Sharma', 'India', 'BAT', 84, 10, 76, 26),
      // Karun Nair: Experienced batter (retained)
      createPlayer('dc8', 'Karun Nair', 'India', 'BAT', 80, 10, 78, 32),
      // Kuldeep Yadav: Premium left-arm wrist-spinner
      createPlayer('dc9', 'Kuldeep Yadav', 'India', 'BOWL', 22, 91, 72, 30),
      // Mitchell Starc: Left-arm new-ball pacer (retained)
      createPlayer('dc10', 'Mitchell Starc', 'Australia', 'BOWL', 52, 94, 82, 36),
      // Mukesh Kumar: Right-arm seam bowler
      createPlayer('dc11', 'Mukesh Kumar', 'India', 'BOWL', 16, 84, 71, 31),
      // T Natarajan: Left-arm yorker specialist
      createPlayer('dc12', 'T Natarajan', 'India', 'BOWL', 22, 85, 71, 34),
      // Sameer Rizvi: Young attacking batter
      createPlayer('dc13', 'Sameer Rizvi', 'India', 'ALL', 78, 62, 76, 21),
      // Vipraj Nigam: Off-spin bowling all-rounder
      createPlayer('dc14', 'Vipraj Nigam', 'India', 'ALL', 64, 76, 70, 22),
      // Khaleel Ahmed: Left-arm swing bowler (if with DC)
      createPlayer('dc15', 'Ajay Mandal', 'India', 'ALL', 66, 74, 71, 22),
    ],
  },

  PBKS: {
    id: 'pbks', name: 'Punjab Kings', short: 'PBKS', color: '#ed1b24',
    battingRating: 86, bowlingRating: 85,
    players: [
      // Prabhsimran Singh: Explosive opener (retained)
      createPlayer('pbks1', 'Prabhsimran Singh', 'India', 'WK', 86, 10, 82, 24),
      // Shashank Singh: Hard-hitting all-rounder (retained)
      createPlayer('pbks2', 'Shashank Singh', 'India', 'ALL', 87, 66, 77, 33),
      // Shreyas Iyer: Captain & top-order right-hander
      createPlayer('pbks3', 'Shreyas Iyer', 'India', 'BAT', 88, 16, 87, 30),
      // Josh Inglis: Australian WK-batter
      createPlayer('pbks4', 'Josh Inglis', 'Australia', 'WK', 85, 10, 88, 29),
      // Glenn Maxwell: Elite T20 all-rounder
      createPlayer('pbks5', 'Glenn Maxwell', 'Australia', 'ALL', 93, 78, 95, 36),
      // Nehal Wadhera: Middle-order right-hander
      createPlayer('pbks6', 'Nehal Wadhera', 'India', 'BAT', 78, 10, 76, 24),
      // Harpreet Brar: Left-arm spin all-rounder
      createPlayer('pbks7', 'Harpreet Brar', 'India', 'ALL', 72, 82, 76, 29),
      // Azmatullah Omarzai: Afghanistan pace all-rounder
      createPlayer('pbks8', 'Azmatullah Omarzai', 'Afghanistan', 'ALL', 80, 80, 81, 25),
      // Kagiso Rabada: World-class pace bowler
      createPlayer('pbks9', 'Kagiso Rabada', 'South Africa', 'BOWL', 32, 95, 84, 31),
      // Arshdeep Singh: Left-arm pacer, India T20I regular
      createPlayer('pbks10', 'Arshdeep Singh', 'India', 'BOWL', 12, 88, 72, 26),
      // Yuzvendra Chahal: Leg-spin bowler (if at PBKS)
      createPlayer('pbks11', 'Rahul Chahar', 'India', 'BOWL', 22, 80, 70, 26),
      // Vidwath Kaverappa: Karnataka pacer
      createPlayer('pbks12', 'Vidwath Kaverappa', 'India', 'BOWL', 16, 78, 66, 26),
      // Rilee Rossouw: South African power hitter
      createPlayer('pbks13', 'Rilee Rossouw', 'South Africa', 'BAT', 86, 10, 82, 35),
      // David Payne: Left-arm English pacer
      createPlayer('pbks14', 'David Payne', 'England', 'BOWL', 18, 83, 70, 32),
      // Nishant Sindhu: Pace all-rounder
      createPlayer('pbks15', 'Nishant Sindhu', 'India', 'ALL', 68, 76, 74, 23),
    ],
  },

  GT: {
    id: 'gt', name: 'Gujarat Titans', short: 'GT', color: '#1c2e4a',
    battingRating: 88, bowlingRating: 89,
    players: [
      // Shubman Gill: Captain & top-order batter
      createPlayer('gt1', 'Shubman Gill', 'India', 'BAT', 93, 10, 86, 25),
      // B Sai Sudharsan: Elegant left-handed batter (retained)
      createPlayer('gt2', 'B Sai Sudharsan', 'India', 'BAT', 90, 10, 82, 23),
      // Wriddhiman Saha: Veteran WK-batter
      createPlayer('gt3', 'Wriddhiman Saha', 'India', 'WK', 76, 10, 80, 40),
      // Jos Buttler: Moved to RR; Kumar Kushagra here
      createPlayer('gt4', 'Kumar Kushagra', 'India', 'WK', 78, 10, 78, 21),
      // David Miller: Explosive South African finisher (retained)
      createPlayer('gt5', 'David Miller', 'South Africa', 'BAT', 88, 10, 91, 35),
      // Shahrukh Khan: Big-hitting finisher (retained)
      createPlayer('gt6', 'Shahrukh Khan', 'India', 'BAT', 78, 42, 76, 29),
      // Rashid Khan: ICC T20 bowling rank #1 (753 pts), world's best leg-spinner
      createPlayer('gt7', 'Rashid Khan', 'Afghanistan', 'ALL', 76, 98, 95, 26),
      // Kagiso Rabada: World-class pacer (retained)
      createPlayer('gt8', 'Kagiso Rabada', 'South Africa', 'BOWL', 32, 95, 84, 31),
      // Washington Sundar: If at GT — Gurnoor Brar retained
      createPlayer('gt9', 'Gurnoor Brar', 'India', 'ALL', 68, 80, 77, 24),
      // Noor Ahmad: Left-arm wrist-spinner (if at GT)
      createPlayer('gt10', 'Manav Suthar', 'India', 'BOWL', 20, 80, 70, 23),
      // Glenn Phillips: Aggressive New Zealand all-rounder (retained)
      createPlayer('gt11', 'Glenn Phillips', 'New Zealand', 'ALL', 88, 70, 90, 28),
      // Ishant Sharma: Veteran right-arm pacer (retained)
      createPlayer('gt12', 'Ishant Sharma', 'India', 'BOWL', 24, 80, 73, 37),
      // Rahul Tewatia: Finisher all-rounder (retained)
      createPlayer('gt13', 'Rahul Tewatia', 'India', 'ALL', 76, 70, 76, 32),
      // Jayant Yadav: Right-arm off-spin all-rounder (retained)
      createPlayer('gt14', 'Jayant Yadav', 'India', 'ALL', 64, 78, 74, 33),
      // Arshad Khan: Left-arm pace (retained)
      createPlayer('gt15', 'Arshad Khan', 'India', 'BOWL', 18, 78, 70, 23),
    ],
  },

  LSG: {
    id: 'lsg', name: 'Lucknow Super Giants', short: 'LSG', color: '#00a7e1',
    battingRating: 87, bowlingRating: 86,
    players: [
      // Rishabh Pant: World-class WK-batter
      createPlayer('lsg1', 'Rishabh Pant', 'India', 'WK', 93, 10, 84, 27),
      // Nicholas Pooran: West Indian WK-batter, power-hitter (retained)
      createPlayer('lsg2', 'Nicholas Pooran', 'West Indies', 'WK', 92, 10, 85, 29),
      // David Miller: South African finisher (if at LSG)
      createPlayer('lsg3', 'Quinton de Kock', 'South Africa', 'WK', 90, 10, 86, 33),
      // KL Rahul: If at DC; Ayush Badoni here
      createPlayer('lsg4', 'Ayush Badoni', 'India', 'BAT', 80, 16, 76, 25),
      // Mitchell Marsh: Australian pace all-rounder
      createPlayer('lsg5', 'Mitchell Marsh', 'Australia', 'ALL', 88, 80, 83, 33),
      // Krunal Pandya: Left-arm spin all-rounder (if at LSG)
      createPlayer('lsg6', 'Himmat Singh', 'India', 'BAT', 78, 10, 76, 25),
      // Ravi Bishnoi: Leg-spin bowler (retained)
      createPlayer('lsg7', 'Ravi Bishnoi', 'India', 'BOWL', 22, 87, 76, 24),
      // Mayank Yadav: Express right-arm pacer (retained)
      createPlayer('lsg8', 'Mayank Yadav', 'India', 'BOWL', 12, 88, 67, 23),
      // Mohsin Khan: Left-arm pacer (retained)
      createPlayer('lsg9', 'Mohsin Khan', 'India', 'BOWL', 20, 81, 69, 26),
      // Avesh Khan: Right-arm pace (if at RR; Shamar Joseph here)
      createPlayer('lsg10', 'Shamar Joseph', 'West Indies', 'BOWL', 20, 84, 71, 24),
      // Matt Henry: New Zealand right-arm swing pacer
      createPlayer('lsg11', 'Matt Henry', 'New Zealand', 'BOWL', 26, 84, 72, 33),
      // Deepak Hooda: All-round batter
      createPlayer('lsg12', 'Deepak Hooda', 'India', 'ALL', 78, 70, 76, 30),
      // Devdutt Padikkal: If moved — Abdul Samad here
      createPlayer('lsg13', 'Abdul Samad', 'India', 'BAT', 78, 16, 76, 23),
      // Arshdeep Singh: If at PBKS — Yash Thakur here
      createPlayer('lsg14', 'Yash Thakur', 'India', 'BOWL', 16, 79, 67, 26),
      // David Payne or R Sai Kishore (GT) — Manimaran Siddharth
      createPlayer('lsg15', 'R Sai Kishore', 'India', 'BOWL', 24, 79, 72, 27),
    ],
  },

  WestIndies: {
    id: 'wi', name: 'West Indies', short: 'WI', color: '#7b0031',
    battingRating: 87, bowlingRating: 88,
    players: [
      // Brandon King: Aggressive opener
      createPlayer('wi1', 'Brandon King', 'West Indies', 'BAT', 85, 10, 80, 30),
      // Evin Lewis: Hard-hitting left-handed opener
      createPlayer('wi2', 'Evin Lewis', 'West Indies', 'BAT', 87, 10, 78, 33),
      // Nicholas Pooran: Captain, ICC WI T20 backbone
      createPlayer('wi3', 'Nicholas Pooran', 'West Indies', 'WK', 94, 10, 84, 29),
      // Rovman Powell: Hard-hitting middle-order vice-captain
      createPlayer('wi4', 'Rovman Powell', 'West Indies', 'BAT', 86, 22, 82, 31),
      // Shimron Hetmyer: Explosive left-hander
      createPlayer('wi5', 'Shimron Hetmyer', 'West Indies', 'BAT', 88, 10, 82, 28),
      // Andre Russell: Premier T20 all-rounder in the world
      createPlayer('wi6', 'Andre Russell', 'West Indies', 'ALL', 93, 87, 86, 37),
      // Jason Holder: Experienced pace all-rounder
      createPlayer('wi7', 'Jason Holder', 'West Indies', 'ALL', 76, 84, 81, 33),
      // Romario Shepherd: Pace all-rounder
      createPlayer('wi8', 'Romario Shepherd', 'West Indies', 'ALL', 76, 82, 77, 30),
      // Akeal Hosein: Left-arm spin, ICC bowling rank #3 (2024)
      createPlayer('wi9', 'Akeal Hosein', 'West Indies', 'BOWL', 50, 90, 86, 31),
      // Alzarri Joseph: Right-arm express pacer
      createPlayer('wi10', 'Alzarri Joseph', 'West Indies', 'BOWL', 32, 88, 79, 28),
      // Gudakesh Motie: Left-arm orthodox spinner
      createPlayer('wi11', 'Gudakesh Motie', 'West Indies', 'BOWL', 22, 85, 76, 29),
      // Matthew Forde: ICC bowling rank #8, rising pace talent
      createPlayer('wi12', 'Matthew Forde', 'West Indies', 'BOWL', 20, 87, 74, 25),
      // Shamar Joseph: Express right-arm pacer
      createPlayer('wi13', 'Shamar Joseph', 'West Indies', 'BOWL', 20, 84, 71, 24),
      // Kyle Mayers: Hard-hitting top-order all-rounder
      createPlayer('wi14', 'Kyle Mayers', 'West Indies', 'ALL', 84, 76, 80, 32),
      // Shai Hope: Reliable WK-batter
      createPlayer('wi15', 'Shai Hope', 'West Indies', 'WK', 86, 10, 88, 31),
    ],
  },

  Afghanistan: {
    id: 'afg', name: 'Afghanistan', short: 'AFG', color: '#00589b',
    battingRating: 84, bowlingRating: 93,
    players: [
      // Rahmanullah Gurbaz: Explosive WK-batter opener
      createPlayer('afg1', 'Rahmanullah Gurbaz', 'Afghanistan', 'WK', 90, 10, 82, 23),
      // Ibrahim Zadran: Stylish top-order batter
      createPlayer('afg2', 'Ibrahim Zadran', 'Afghanistan', 'BAT', 88, 10, 84, 23),
      // Hazratullah Zazai: Aggressive left-handed opener
      createPlayer('afg3', 'Hazratullah Zazai', 'Afghanistan', 'BAT', 86, 10, 72, 27),
      // Gulbadin Naib: Versatile all-rounder captain
      createPlayer('afg4', 'Gulbadin Naib', 'Afghanistan', 'ALL', 80, 78, 85, 33),
      // Azmatullah Omarzai: Pace-hitting all-rounder
      createPlayer('afg5', 'Azmatullah Omarzai', 'Afghanistan', 'ALL', 80, 80, 81, 25),
      // Mohammad Nabi: Veteran off-spin all-rounder
      createPlayer('afg6', 'Mohammad Nabi', 'Afghanistan', 'ALL', 78, 84, 85, 40),
      // Najibullah Zadran: Explosive left-handed finisher
      createPlayer('afg7', 'Najibullah Zadran', 'Afghanistan', 'BAT', 84, 10, 80, 32),
      // Rashid Khan: ICC T20 bowling rank #1 (753 pts), elite leg-spinner
      createPlayer('afg8', 'Rashid Khan', 'Afghanistan', 'ALL', 74, 98, 95, 26),
      // Mujeeb Ur Rahman: ICC bowling rank #10, mystery right-arm spinner
      createPlayer('afg9', 'Mujeeb Ur Rahman', 'Afghanistan', 'BOWL', 36, 90, 72, 24),
      // Noor Ahmad: Left-arm wrist-spinner, top talent
      createPlayer('afg10', 'Noor Ahmad', 'Afghanistan', 'BOWL', 20, 88, 74, 20),
      // Naveen-ul-Haq: Right-arm pace
      createPlayer('afg11', 'Naveen-ul-Haq', 'Afghanistan', 'BOWL', 26, 87, 81, 25),
      // Fazalhaq Farooqi: Left-arm pacer, T20 specialist
      createPlayer('afg12', 'Fazalhaq Farooqi', 'Afghanistan', 'BOWL', 16, 92, 74, 24),
      // Karim Janat: Useful all-rounder
      createPlayer('afg13', 'Karim Janat', 'Afghanistan', 'ALL', 76, 76, 76, 26),
      // Fareed Ahmad: Left-arm pacer
      createPlayer('afg14', 'Fareed Ahmad', 'Afghanistan', 'BOWL', 16, 82, 69, 22),
      // Sediqullah Atal: Young opener showing promise
      createPlayer('afg15', 'Sediqullah Atal', 'Afghanistan', 'BAT', 80, 10, 76, 21),
    ],
  },
}
