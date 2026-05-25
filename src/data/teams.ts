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

  // INDIA — Openers: SKY, Abhishek | Top/Mid: Tilak, Rinku | WK: Samson | All: Hardik, Axar, Washington, Shivam | Bowlers: Bumrah, Varun | Bench: Ishan, Harshit, Kuldeep, Arshdeep
  India: {
    id: 'ind', name: 'India', short: 'IND', color: '#0055ff',
    battingRating: 92, bowlingRating: 91,
    players: [
      // ── Playing XI ──
      createPlayer('ind1', 'Suryakumar Yadav',    'India', 'BAT',  95, 15, 88, 35), // 1 - opener / anchor
      createPlayer('ind2', 'Abhishek Sharma',     'India', 'ALL',  89, 68, 80, 25), // 2 - opener all-rounder
      createPlayer('ind3', 'Tilak Varma',         'India', 'BAT',  88, 20, 84, 23), // 3
      createPlayer('ind4', 'Rinku Singh',         'India', 'BAT',  86, 10, 82, 28), // 4 - finisher
      createPlayer('ind5', 'Sanju Samson',        'India', 'WK',   90, 10, 85, 31), // 5 - WK
      createPlayer('ind6', 'Hardik Pandya',       'India', 'ALL',  88, 85, 92, 32), // 6 - all-rounder
      createPlayer('ind7', 'Shivam Dube',         'India', 'ALL',  87, 62, 75, 32), // 7 - all-rounder
      createPlayer('ind8', 'Axar Patel',          'India', 'ALL',  78, 86, 86, 32), // 8 - spin all-rounder
      createPlayer('ind9', 'Washington Sundar',   'India', 'ALL',  74, 82, 82, 27), // 9 - spin all-rounder
      createPlayer('ind10', 'Varun Chakaravarthy','India', 'BOWL', 22, 90, 72, 34), // 10 - spinner
      createPlayer('ind11', 'Jasprit Bumrah',     'India', 'BOWL', 25, 98, 82, 32), // 11 - ace pacer
      // ── Bench ──
      createPlayer('ind12', 'Ishan Kishan',       'India', 'WK',   88, 10, 82, 27),
      createPlayer('ind13', 'Kuldeep Yadav',      'India', 'BOWL', 24, 92, 72, 31),
      createPlayer('ind14', 'Harshit Rana',       'India', 'BOWL', 18, 84, 74, 24),
      createPlayer('ind15', 'Arshdeep Singh',     'India', 'BOWL', 15, 88, 72, 27),
    ],
  },

  // AUSTRALIA — Openers: Head, Maxwell | Top/Mid: Smith, Marsh, Tim David | WK: Inglis | All: Green, Stoinis, Connolly | Bowlers: Zampa, Kuhnemann | Bench: Renshaw, Bartlett, Dwarshuis, Ellis
  Australia: {
    id: 'aus', name: 'Australia', short: 'AUS', color: '#ffcc00',
    battingRating: 90, bowlingRating: 90,
    players: [
      // ── Playing XI ──
      createPlayer('aus8',  'Travis Head',       'Australia', 'BAT',  94, 20, 82, 32), // 1 - aggressive opener
      createPlayer('aus11', 'Glenn Maxwell',     'Australia', 'ALL',  92, 76, 95, 37), // 2 - opener all-rounder
      createPlayer('aus15', 'Steve Smith',       'Australia', 'BAT',  88, 20, 90, 37), // 3
      createPlayer('aus1',  'Mitchell Marsh',    'Australia', 'ALL',  90, 78, 82, 34), // 4 - all-rounder
      createPlayer('aus4',  'Tim David',         'Australia', 'BAT',  88, 10, 80, 30), // 5 - finisher
      createPlayer('aus9',  'Josh Inglis',       'Australia', 'WK',   86, 10, 86, 31), // 6 - WK
      createPlayer('aus6',  'Cameron Green',     'Australia', 'ALL',  86, 80, 88, 27), // 7
      createPlayer('aus13', 'Marcus Stoinis',    'Australia', 'ALL',  86, 78, 80, 36), // 8
      createPlayer('aus3',  'Cooper Connolly',   'Australia', 'ALL',  80, 72, 80, 22), // 9
      createPlayer('aus14', 'Adam Zampa',        'Australia', 'BOWL', 18, 90, 74, 34), // 10 - spinner
      createPlayer('aus10', 'Matthew Kuhnemann', 'Australia', 'BOWL', 18, 80, 70, 29), // 11 - spinner
      // ── Bench ──
      createPlayer('aus12', 'Matthew Renshaw',   'Australia', 'BAT',  80, 18, 82, 30),
      createPlayer('aus2',  'Xavier Bartlett',   'Australia', 'BOWL', 18, 84, 74, 28),
      createPlayer('aus5',  'Ben Dwarshuis',     'Australia', 'BOWL', 16, 82, 72, 31),
      createPlayer('aus7',  'Nathan Ellis',      'Australia', 'BOWL', 15, 86, 74, 31),
    ],
  },

  // ENGLAND — Openers: Salt, Buttler | Top/Mid: Brook, Duckett, Jacks | WK: Banton | All: Curran, Dawson, Bethell | Bowlers: Archer, Rashid | Bench: Ahmed, Overton, Tongue, Wood
  England: {
    id: 'eng', name: 'England', short: 'ENG', color: '#002366',
    battingRating: 89, bowlingRating: 87,
    players: [
      // ── Playing XI ──
      createPlayer('eng13', 'Phil Salt',      'England', 'WK',   90, 10, 84, 30), // 1 - WK opener
      createPlayer('eng6',  'Jos Buttler',    'England', 'WK',   92, 10, 86, 36), // 2 - WK opener
      createPlayer('eng1',  'Harry Brook',    'England', 'BAT',  90, 15, 86, 27), // 3
      createPlayer('eng9',  'Ben Duckett',    'England', 'BAT',  86, 10, 82, 31), // 4
      createPlayer('eng10', 'Will Jacks',     'England', 'ALL',  88, 74, 84, 27), // 5 - all-rounder
      createPlayer('eng4',  'Tom Banton',     'England', 'WK',   84, 10, 80, 27), // 6 - 3rd WK / batter
      createPlayer('eng7',  'Sam Curran',     'England', 'ALL',  78, 84, 82, 28), // 7
      createPlayer('eng5',  'Jacob Bethell',  'England', 'ALL',  82, 72, 82, 22), // 8
      createPlayer('eng8',  'Liam Dawson',    'England', 'ALL',  72, 82, 78, 36), // 9
      createPlayer('eng3',  'Jofra Archer',   'England', 'BOWL', 25, 92, 76, 31), // 10 - ace pacer
      createPlayer('eng12', 'Adil Rashid',    'England', 'BOWL', 22, 88, 72, 38), // 11 - spinner
      // ── Bench ──
      createPlayer('eng2',  'Rehan Ahmed',    'England', 'ALL',  72, 82, 76, 22),
      createPlayer('eng11', 'Jamie Overton',  'England', 'ALL',  68, 82, 78, 32),
      createPlayer('eng14', 'Josh Tongue',    'England', 'BOWL', 16, 84, 70, 28),
      createPlayer('eng15', 'Luke Wood',      'England', 'BOWL', 18, 84, 70, 31),
    ],
  },

  // PAKISTAN — Openers: Babar, Saim | Top/Mid: Fakhar, Farhan | WK: Usman Khan | All: Salman, Shadab, Nawaz | Bowlers: Shaheen, Naseem, Abrar | Bench: Faheem, Nafay, Mirza, Tariq
  Pakistan: {
    id: 'pak', name: 'Pakistan', short: 'PAK', color: '#00a651',
    battingRating: 86, bowlingRating: 88,
    players: [
      // ── Playing XI ──
      createPlayer('pak3',  'Babar Azam',       'Pakistan', 'BAT',  95, 20, 90, 31), // 1 - anchor opener
      createPlayer('pak11', 'Saim Ayub',        'Pakistan', 'BAT',  84, 15, 80, 24), // 2 - opener
      createPlayer('pak5',  'Fakhar Zaman',     'Pakistan', 'BAT',  86, 10, 78, 36), // 3
      createPlayer('pak10', 'Sahibzada Farhan', 'Pakistan', 'WK',   82, 10, 76, 29), // 4 - WK
      createPlayer('pak14', 'Usman Khan',       'Pakistan', 'WK',   80, 10, 74, 30), // 5 - 2nd WK / batter
      createPlayer('pak1',  'Salman Agha',      'Pakistan', 'ALL',  82, 72, 82, 32), // 6 - all-rounder
      createPlayer('pak13', 'Shadab Khan',      'Pakistan', 'ALL',  72, 84, 82, 27), // 7
      createPlayer('pak7',  'Mohammad Nawaz',   'Pakistan', 'ALL',  72, 78, 74, 32), // 8
      createPlayer('pak12', 'Shaheen Afridi',   'Pakistan', 'BOWL', 28, 92, 76, 26), // 9 - ace pacer
      createPlayer('pak9',  'Naseem Shah',      'Pakistan', 'BOWL', 20, 88, 74, 23), // 10
      createPlayer('pak2',  'Abrar Ahmed',      'Pakistan', 'BOWL', 18, 86, 72, 27), // 11 - spinner
      // ── Bench ──
      createPlayer('pak4',  'Faheem Ashraf',    'Pakistan', 'ALL',  72, 76, 76, 32),
      createPlayer('pak6',  'Khawaja Nafay',    'Pakistan', 'BAT',  76, 10, 72, 23),
      createPlayer('pak8',  'Salman Mirza',     'Pakistan', 'BOWL', 12, 78, 68, 25),
      createPlayer('pak15', 'Usman Tariq',      'Pakistan', 'BOWL', 14, 78, 68, 26),
    ],
  },

  // NEW ZEALAND — Openers: Conway, Phillips | Top/Mid: Ravindra, D.Mitchell | WK: Allen | All: Santner, Neesham, McConchie | Bowlers: Ferguson, Sodhi, Henry | Bench: Seifert, Jamieson, Duffy, Chapman
  NewZealand: {
    id: 'nz', name: 'New Zealand', short: 'NZ', color: '#000000',
    battingRating: 87, bowlingRating: 87,
    players: [
      // ── Playing XI ──
      createPlayer('nz4',  'Devon Conway',    'New Zealand', 'BAT',  88, 10, 84, 34), // 1 - opener
      createPlayer('nz11', 'Glenn Phillips',  'New Zealand', 'ALL',  88, 68, 90, 29), // 2 - opener all-rounder
      createPlayer('nz12', 'Rachin Ravindra', 'New Zealand', 'ALL',  86, 72, 84, 27), // 3
      createPlayer('nz9',  'Daryl Mitchell',  'New Zealand', 'ALL',  84, 72, 84, 35), // 4
      createPlayer('nz2',  'Finn Allen',      'New Zealand', 'WK',   86, 10, 80, 27), // 5 - WK
      createPlayer('nz3',  'Mark Chapman',    'New Zealand', 'BAT',  82, 16, 82, 31), // 6
      createPlayer('nz1',  'Mitchell Santner','New Zealand', 'ALL',  72, 86, 86, 34), // 7 - spin all-rounder
      createPlayer('nz10', 'James Neesham',   'New Zealand', 'ALL',  78, 76, 80, 35), // 8
      createPlayer('nz6',  'Lockie Ferguson', 'New Zealand', 'BOWL', 18, 88, 74, 35), // 9 - pace
      createPlayer('nz14', 'Ish Sodhi',       'New Zealand', 'BOWL', 20, 84, 72, 33), // 10 - spinner
      createPlayer('nz7',  'Matt Henry',      'New Zealand', 'BOWL', 20, 86, 74, 34), // 11 - pace
      // ── Bench ──
      createPlayer('nz13', 'Tim Seifert',     'New Zealand', 'WK',   84, 10, 82, 31),
      createPlayer('nz8',  'Kyle Jamieson',   'New Zealand', 'BOWL', 28, 84, 76, 31),
      createPlayer('nz5',  'Jacob Duffy',     'New Zealand', 'BOWL', 14, 82, 72, 31),
      createPlayer('nz15', 'Cole McConchie',  'New Zealand', 'ALL',  70, 76, 78, 34),
    ],
  },

  // SOUTH AFRICA — Openers: de Kock, Markram | Top/Mid: Brevis, Miller, Stubbs | WK: Rickelton | All: Jansen, Linde, Bosch | Bowlers: Rabada, Nortje | Bench: Maharaj, Ngidi, Maphaka, Smith
  SouthAfrica: {
    id: 'rsa', name: 'South Africa', short: 'RSA', color: '#007a4d',
    battingRating: 88, bowlingRating: 90,
    players: [
      // ── Playing XI ──
      createPlayer('rsa4',  'Quinton de Kock',  'South Africa', 'WK',   90, 10, 86, 33), // 1 - WK opener
      createPlayer('rsa1',  'Aiden Markram',    'South Africa', 'ALL',  88, 68, 88, 31), // 2 - opener all-rounder
      createPlayer('rsa3',  'Dewald Brevis',    'South Africa', 'BAT',  86, 16, 84, 23), // 3
      createPlayer('rsa9',  'David Miller',     'South Africa', 'BAT',  88, 10, 88, 37), // 4 - finisher
      createPlayer('rsa15', 'Tristan Stubbs',   'South Africa', 'BAT',  86, 18, 86, 25), // 5
      createPlayer('rsa13', 'Ryan Rickelton',   'South Africa', 'WK',   84, 10, 82, 29), // 6 - 2nd WK
      createPlayer('rsa5',  'Marco Jansen',     'South Africa', 'ALL',  70, 86, 82, 26), // 7
      createPlayer('rsa6',  'George Linde',     'South Africa', 'ALL',  72, 80, 78, 34), // 8
      createPlayer('rsa2',  'Corbin Bosch',     'South Africa', 'ALL',  72, 80, 78, 31), // 9
      createPlayer('rsa12', 'Kagiso Rabada',    'South Africa', 'BOWL', 24, 94, 82, 31), // 10 - ace pacer
      createPlayer('rsa11', 'Anrich Nortje',    'South Africa', 'BOWL', 20, 90, 76, 32), // 11
      // ── Bench ──
      createPlayer('rsa7',  'Keshav Maharaj',   'South Africa', 'BOWL', 26, 84, 76, 36),
      createPlayer('rsa10', 'Lungi Ngidi',      'South Africa', 'BOWL', 18, 86, 74, 30),
      createPlayer('rsa8',  'Kwena Maphaka',    'South Africa', 'BOWL', 14, 82, 72, 20),
      createPlayer('rsa14', 'Jason Smith',      'South Africa', 'ALL',  74, 74, 78, 30),
    ],
  },

  // SRI LANKA — Openers: Nissanka, K.Mendis | Top/Mid: Asalanka, Kamindu | WK: K.J.Perera | All: Shanaka, Wellalage, Hemantha | Bowlers: Pathirana, Theekshana, Chameera | Bench: Mishara, Liyanage, Rathnayake, Malinga
  SriLanka: {
    id: 'sl', name: 'Sri Lanka', short: 'SL', color: '#003da5',
    battingRating: 84, bowlingRating: 85,
    players: [
      // ── Playing XI ──
      createPlayer('sl2',  'Pathum Nissanka',        'Sri Lanka', 'BAT',  86, 10, 82, 28), // 1 - opener
      createPlayer('sl4',  'Kusal Mendis',           'Sri Lanka', 'WK',   88, 10, 82, 30), // 2 - WK opener
      createPlayer('sl7',  'Charith Asalanka',       'Sri Lanka', 'ALL',  84, 68, 82, 29), // 3
      createPlayer('sl5',  'Kamindu Mendis',         'Sri Lanka', 'ALL',  82, 72, 80, 27), // 4
      createPlayer('sl6',  'Kusal Janith Perera',    'Sri Lanka', 'WK',   82, 10, 78, 36), // 5 - 2nd WK
      createPlayer('sl1',  'Dasun Shanaka',          'Sri Lanka', 'ALL',  78, 74, 80, 35), // 6 - captain all-rounder
      createPlayer('sl8',  'Janith Liyanage',        'Sri Lanka', 'BAT',  78, 18, 78, 30), // 7
      createPlayer('sl11', 'Dunith Wellalage',       'Sri Lanka', 'ALL',  74, 82, 78, 23), // 8 - spin all-rounder
      createPlayer('sl14', 'Matheesha Pathirana',    'Sri Lanka', 'BOWL', 12, 90, 74, 23), // 9 - ace pacer
      createPlayer('sl12', 'Maheesh Theekshana',     'Sri Lanka', 'BOWL', 18, 88, 72, 25), // 10 - spinner
      createPlayer('sl13', 'Dushmantha Chameera',    'Sri Lanka', 'BOWL', 20, 86, 74, 34), // 11
      // ── Bench ──
      createPlayer('sl3',  'Kamil Mishara',          'Sri Lanka', 'WK',   76, 10, 74, 24),
      createPlayer('sl9',  'Pavan Rathnayake',       'Sri Lanka', 'BAT',  74, 10, 74, 22),
      createPlayer('sl10', 'Dushan Hemantha',        'Sri Lanka', 'ALL',  70, 78, 76, 30),
      createPlayer('sl15', 'Eshan Malinga',          'Sri Lanka', 'BOWL', 12, 80, 70, 24),
    ],
  },

  // BANGLADESH — Openers: Tanzid, Litton | Top/Mid: Towhid, Parvez | WK: Jaker | All: Mehidy, Afif, Mahedi | Bowlers: Mustafizur, Taskin, Rishad | Bench: Nasum, Tanzim, Shoriful, Shamim
  Bangladesh: {
    id: 'ban', name: 'Bangladesh', short: 'BAN', color: '#006a4e',
    battingRating: 80, bowlingRating: 82,
    players: [
      // ── Playing XI ──
      createPlayer('ban4',  'Tanzid Hasan',        'Bangladesh', 'BAT',  80, 10, 76, 25), // 1 - opener
      createPlayer('ban1',  'Litton Das',          'Bangladesh', 'WK',   84, 10, 80, 31), // 2 - WK opener
      createPlayer('ban5',  'Towhid Hridoy',       'Bangladesh', 'BAT',  82, 14, 76, 25), // 3
      createPlayer('ban3',  'Parvez Hossain Emon', 'Bangladesh', 'BAT',  78, 10, 74, 24), // 4
      createPlayer('ban7',  'Jaker Ali',           'Bangladesh', 'WK',   76, 10, 76, 27), // 5 - 2nd WK
      createPlayer('ban2',  'Mehidy Hasan Miraz',  'Bangladesh', 'ALL',  78, 82, 80, 28), // 6 - spin all-rounder
      createPlayer('ban6',  'Afif Hossain',        'Bangladesh', 'ALL',  74, 66, 76, 27), // 7
      createPlayer('ban8',  'Mahedi Hasan',        'Bangladesh', 'ALL',  70, 80, 76, 30), // 8
      createPlayer('ban11', 'Mustafizur Rahman',   'Bangladesh', 'BOWL', 20, 86, 72, 30), // 9 - ace pacer
      createPlayer('ban13', 'Taskin Ahmed',        'Bangladesh', 'BOWL', 20, 84, 74, 31), // 10
      createPlayer('ban9',  'Rishad Hossain',      'Bangladesh', 'BOWL', 30, 82, 72, 23), // 11 - leg-spinner
      // ── Bench ──
      createPlayer('ban10', 'Nasum Ahmed',         'Bangladesh', 'BOWL', 24, 78, 70, 30),
      createPlayer('ban12', 'Tanzim Hasan Sakib',  'Bangladesh', 'BOWL', 16, 80, 70, 23),
      createPlayer('ban14', 'Shoriful Islam',      'Bangladesh', 'BOWL', 18, 80, 70, 25),
      createPlayer('ban15', 'Shamim Hossain',      'Bangladesh', 'ALL',  72, 60, 74, 25),
    ],
  },

  // ========== IPL TEAMS ==========

  // CSK — Openers: Ruturaj, Ayush | Top/Mid: Brevis, Dube | WK: Dhoni, Samson | All: Overton, Gopal | Bowlers: Noor, Khaleel, Chahar | Bench: Urvil, Kamboj, Mukesh, Ellis
  CSK: {
    id: 'csk', name: 'Chennai Super Kings', short: 'CSK', color: '#ffff00',
    battingRating: 87, bowlingRating: 86,
    players: [
      // ── Playing XI ──
      createPlayer('csk1',  'Ruturaj Gaikwad', 'India',        'BAT',  90, 10, 85, 29), // 1 - opener
      createPlayer('csk2',  'Ayush Mhatre',    'India',        'BAT',  74, 10, 74, 21), // 2 - opener
      createPlayer('csk5',  'Dewald Brevis',   'South Africa', 'BAT',  84, 14, 82, 23), // 3
      createPlayer('csk7',  'Shivam Dube',     'India',        'ALL',  88, 62, 75, 32), // 4 - all-rounder
      createPlayer('csk3',  'MS Dhoni',        'India',        'WK',   82, 10, 94, 44), // 5 - WK finisher
      createPlayer('csk4',  'Sanju Samson',    'India',        'WK',   90, 10, 85, 31), // 6 - 2nd WK
      createPlayer('csk8',  'Jamie Overton',   'England',      'ALL',  72, 82, 78, 31), // 7 - pace all-rounder
      createPlayer('csk12', 'Shreyas Gopal',   'India',        'ALL',  62, 78, 74, 32), // 8 - spin all-rounder
      createPlayer('csk9',  'Noor Ahmad',      'Afghanistan',  'BOWL', 18, 88, 74, 21), // 9 - spinner
      createPlayer('csk10', 'Khaleel Ahmed',   'India',        'BOWL', 18, 82, 70, 29), // 10
      createPlayer('csk15', 'Rahul Chahar',    'India',        'BOWL', 20, 80, 70, 26), // 11 - leg-spinner
      // ── Bench ──
      createPlayer('csk6',  'Urvil Patel',     'India',        'WK',   74, 10, 72, 26),
      createPlayer('csk11', 'Anshul Kamboj',   'India',        'BOWL', 16, 78, 70, 24),
      createPlayer('csk13', 'Mukesh Choudhary','India',        'BOWL', 14, 78, 68, 29),
      createPlayer('csk14', 'Nathan Ellis',    'Australia',    'BOWL', 15, 86, 74, 31),
    ],
  },

  // RCB — Openers: Kohli, Salt | Top/Mid: Patidar, Tim David | WK: Jitesh | All: Krunal, Bethell, Shepherd | Bowlers: Hazlewood, Bhuvneshwar, Dayal | Bench: Padikkal, Swapnil, Thushara, Suyash
  RCB: {
    id: 'rcb', name: 'Royal Challengers Bengaluru', short: 'RCB', color: '#ec1c24',
    battingRating: 90, bowlingRating: 86,
    players: [
      // ── Playing XI ──
      createPlayer('rcb2',  'Virat Kohli',         'India',       'BAT',  96, 20, 94, 37), // 1 - anchor opener
      createPlayer('rcb4',  'Phil Salt',           'England',     'WK',   90, 10, 84, 30), // 2 - WK opener
      createPlayer('rcb1',  'Rajat Patidar',       'India',       'BAT',  86, 10, 80, 32), // 3
      createPlayer('rcb8',  'Tim David',           'Australia',   'BAT',  88, 10, 80, 30), // 4 - finisher
      createPlayer('rcb5',  'Jitesh Sharma',       'India',       'WK',   84, 10, 80, 32), // 5 - 2nd WK
      createPlayer('rcb6',  'Krunal Pandya',       'India',       'ALL',  76, 80, 80, 35), // 6 - spin all-rounder
      createPlayer('rcb10', 'Jacob Bethell',       'England',     'ALL',  82, 72, 82, 22), // 7
      createPlayer('rcb9',  'Romario Shepherd',    'West Indies', 'ALL',  78, 80, 76, 31), // 8 - pace all-rounder
      createPlayer('rcb11', 'Josh Hazlewood',      'Australia',   'BOWL', 16, 92, 80, 35), // 9 - ace pacer
      createPlayer('rcb13', 'Bhuvneshwar Kumar',   'India',       'BOWL', 32, 86, 74, 36), // 10
      createPlayer('rcb12', 'Yash Dayal',          'India',       'BOWL', 16, 82, 70, 28), // 11
      // ── Bench ──
      createPlayer('rcb3',  'Devdutt Padikkal',    'India',       'BAT',  82, 10, 78, 26),
      createPlayer('rcb7',  'Swapnil Singh',       'India',       'ALL',  58, 74, 72, 34),
      createPlayer('rcb14', 'Nuwan Thushara',      'Sri Lanka',   'BOWL', 12, 82, 70, 26),
      createPlayer('rcb15', 'Suyash Sharma',       'India',       'BOWL', 18, 78, 68, 22),
    ],
  },

  // MI — Openers: Rohit, SKY | Top/Mid: Tilak, Hardik | WK: Rickelton | All: Santner, Bosch, Jacks | Bowlers: Bumrah, Boult, Chahar | Bench: Robin, Raj, Dhir, Markande
  MI: {
    id: 'mi', name: 'Mumbai Indians', short: 'MI', color: '#0044ff',
    battingRating: 91, bowlingRating: 88,
    players: [
      // ── Playing XI ──
      createPlayer('mi2',  'Rohit Sharma',      'India',        'BAT',  92, 20, 82, 39), // 1 - opener
      createPlayer('mi3',  'Suryakumar Yadav',  'India',        'BAT',  96, 15, 86, 35), // 2 - opener
      createPlayer('mi4',  'Tilak Varma',       'India',        'BAT',  88, 20, 84, 23), // 3
      createPlayer('mi1',  'Hardik Pandya',     'India',        'ALL',  88, 85, 92, 32), // 4 - all-rounder captain
      createPlayer('mi5',  'Ryan Rickelton',    'South Africa', 'WK',   84, 10, 82, 29), // 5 - WK
      createPlayer('mi14', 'Will Jacks',        'England',      'ALL',  88, 74, 84, 27), // 6
      createPlayer('mi8',  'Mitchell Santner',  'New Zealand',  'ALL',  72, 86, 86, 34), // 7 - spin all-rounder
      createPlayer('mi9',  'Corbin Bosch',      'South Africa', 'ALL',  72, 80, 78, 31), // 8
      createPlayer('mi11', 'Jasprit Bumrah',    'India',        'BOWL', 25, 98, 82, 32), // 9 - ace pacer
      createPlayer('mi12', 'Trent Boult',       'New Zealand',  'BOWL', 22, 90, 78, 37), // 10
      createPlayer('mi13', 'Deepak Chahar',     'India',        'BOWL', 36, 84, 74, 33), // 11 - swing pacer
      // ── Bench ──
      createPlayer('mi6',  'Robin Minz',        'India',        'WK',   76, 10, 76, 23),
      createPlayer('mi7',  'Raj Bawa',          'India',        'ALL',  72, 72, 76, 23),
      createPlayer('mi10', 'Naman Dhir',        'India',        'ALL',  74, 60, 76, 25),
      createPlayer('mi15', 'Mayank Markande',   'India',        'BOWL', 18, 78, 68, 28),
    ],
  },

  // KKR — Openers: Narine, Allen | Top/Mid: Raghuvanshi, Rinku, Powell | WK: — | All: Rahane, Green, Roy | Bowlers: Varun, Pathirana, Rana | Bench: Manish, Anukul, Umran, Vaibhav
  KKR: {
    id: 'kkr', name: 'Kolkata Knight Riders', short: 'KKR', color: '#3a225d',
    battingRating: 89, bowlingRating: 89,
    players: [
      // ── Playing XI ──
      createPlayer('kkr9',  'Sunil Narine',         'West Indies', 'ALL',  84, 88, 78, 38), // 1 - opener all-rounder
      createPlayer('kkr14', 'Finn Allen',           'New Zealand', 'WK',   86, 10, 80, 27), // 2 - WK opener
      createPlayer('kkr1',  'Ajinkya Rahane',       'India',       'BAT',  82, 10, 88, 38), // 3
      createPlayer('kkr2',  'Angkrish Raghuvanshi', 'India',       'BAT',  80, 10, 76, 21), // 4
      createPlayer('kkr7',  'Rinku Singh',          'India',       'BAT',  86, 10, 82, 28), // 5 - finisher
      createPlayer('kkr8',  'Rovman Powell',        'West Indies', 'BAT',  84, 15, 80, 32), // 6
      createPlayer('kkr13', 'Cameron Green',        'Australia',   'ALL',  86, 80, 88, 27), // 7 - pace all-rounder
      createPlayer('kkr6',  'Ramandeep Singh',      'India',       'ALL',  76, 62, 82, 28), // 8
      createPlayer('kkr12', 'Varun Chakaravarthy',  'India',       'BOWL', 22, 90, 72, 34), // 9 - mystery spinner
      createPlayer('kkr15', 'Matheesha Pathirana',  'Sri Lanka',   'BOWL', 12, 90, 74, 23), // 10 - ace pacer
      createPlayer('kkr4',  'Harshit Rana',         'India',       'BOWL', 18, 84, 74, 24), // 11
      // ── Bench ──
      createPlayer('kkr5',  'Manish Pandey',        'India',       'BAT',  78, 10, 80, 36),
      createPlayer('kkr3',  'Anukul Roy',           'India',       'ALL',  68, 74, 74, 27),
      createPlayer('kkr10', 'Umran Malik',          'India',       'BOWL', 12, 84, 68, 26),
      createPlayer('kkr11', 'Vaibhav Arora',        'India',       'BOWL', 15, 80, 68, 28),
    ],
  },

  // RR — Openers: Jaiswal, Parag | Top/Mid: Hetmyer, Jurel | WK: Ferreira | All: Jadeja, Curran, Dubey | Bowlers: Archer, Bishnoi, Maphaka | Bench: Suryavanshi, Sandeep, Deshpande, Milne
  RR: {
    id: 'rr', name: 'Rajasthan Royals', short: 'RR', color: '#254aa5',
    battingRating: 88, bowlingRating: 87,
    players: [
      // ── Playing XI ──
      createPlayer('rr8',  'Yashasvi Jaiswal',  'India',        'BAT',  90, 10, 82, 24), // 1 - opener
      createPlayer('rr10', 'Riyan Parag',       'India',        'ALL',  86, 68, 82, 24), // 2 - opener all-rounder
      createPlayer('rr7',  'Shimron Hetmyer',   'West Indies',  'BAT',  86, 10, 80, 29), // 3 - finisher
      createPlayer('rr9',  'Dhruv Jurel',       'India',        'WK',   84, 10, 84, 24), // 4 - WK
      createPlayer('rr3',  'Donovan Ferreira',  'South Africa', 'WK',   78, 12, 78, 27), // 5 - 2nd WK
      createPlayer('rr1',  'Ravindra Jadeja',   'India',        'ALL',  80, 88, 98, 37), // 6 - ace all-rounder
      createPlayer('rr2',  'Sam Curran',        'England',      'ALL',  80, 84, 80, 28), // 7
      createPlayer('rr5',  'Shubham Dubey',     'India',        'BAT',  76, 10, 72, 25), // 8
      createPlayer('rr11', 'Jofra Archer',      'England',      'BOWL', 25, 92, 76, 31), // 9 - ace pacer
      createPlayer('rr14', 'Ravi Bishnoi',      'India',        'BOWL', 20, 86, 74, 25), // 10 - leg-spinner
      createPlayer('rr13', 'Kwena Maphaka',     'South Africa', 'BOWL', 14, 82, 72, 20), // 11
      // ── Bench ──
      createPlayer('rr6',  'Vaibhav Suryavanshi','India',       'BAT',  72, 10, 70, 19),
      createPlayer('rr4',  'Sandeep Sharma',    'India',        'BOWL', 20, 84, 68, 33),
      createPlayer('rr12', 'Tushar Deshpande',  'India',        'BOWL', 16, 80, 70, 30),
      createPlayer('rr15', 'Adam Milne',        'New Zealand',  'BOWL', 14, 82, 70, 34),
    ],
  },

  // SRH — Openers: Head, Abhishek | Top/Mid: Nitish, Klaasen | WK: Ishan | All: Cummins, Livingstone, Carse | Bowlers: Harshal, Mavi, Unadkat | Bench: Aniket, Kamindu, Malinga, Ansari
  SRH: {
    id: 'srh', name: 'Sunrisers Hyderabad', short: 'SRH', color: '#ff822a',
    battingRating: 91, bowlingRating: 86,
    players: [
      // ── Playing XI ──
      createPlayer('srh2',  'Travis Head',        'Australia',  'BAT',  94, 20, 82, 32), // 1 - aggressive opener
      createPlayer('srh3',  'Abhishek Sharma',    'India',      'ALL',  89, 68, 80, 25), // 2 - opener all-rounder
      createPlayer('srh7',  'Nitish Kumar Reddy', 'India',      'ALL',  84, 72, 80, 22), // 3 - all-rounder
      createPlayer('srh6',  'Heinrich Klaasen',   'South Africa','WK',  92, 10, 84, 34), // 4 - WK finisher
      createPlayer('srh5',  'Ishan Kishan',       'India',      'WK',   88, 10, 82, 27), // 5 - 2nd WK
      createPlayer('srh1',  'Pat Cummins',        'Australia',  'BOWL', 62, 92, 86, 33), // 6 - captain all-rounder
      createPlayer('srh14', 'Liam Livingstone',   'England',    'ALL',  84, 72, 82, 32), // 7
      createPlayer('srh10', 'Brydon Carse',       'England',    'ALL',  68, 82, 76, 30), // 8
      createPlayer('srh9',  'Harshal Patel',      'India',      'BOWL', 38, 86, 74, 35), // 9
      createPlayer('srh15', 'Shivam Mavi',        'India',      'BOWL', 18, 80, 70, 27), // 10
      createPlayer('srh11', 'Jaydev Unadkat',     'India',      'BOWL', 28, 78, 72, 35), // 11
      // ── Bench ──
      createPlayer('srh4',  'Aniket Verma',       'India',      'BAT',  76, 10, 72, 23),
      createPlayer('srh8',  'Kamindu Mendis',     'Sri Lanka',  'ALL',  82, 72, 80, 27),
      createPlayer('srh12', 'Eshan Malinga',      'Sri Lanka',  'BOWL', 12, 80, 70, 24),
      createPlayer('srh13', 'Zeeshan Ansari',     'India',      'BOWL', 14, 76, 68, 25),
    ],
  },

  // DC — Openers: KL Rahul, Duckett | Top/Mid: Nissanka, Miller, Stubbs | WK: Porel | All: Axar, Nigam | Bowlers: Kuldeep, Starc, Natarajan | Bench: Nitish Rana, Nair, Vipraj, Ngidi
  DC: {
    id: 'dc', name: 'Delhi Capitals', short: 'DC', color: '#004c93',
    battingRating: 88, bowlingRating: 88,
    players: [
      // ── Playing XI ──
      createPlayer('dc6',  'KL Rahul',          'India',        'WK',   88, 10, 88, 34), // 1 - WK opener
      createPlayer('dc13', 'Ben Duckett',        'England',      'BAT',  86, 10, 82, 31), // 2 - opener
      createPlayer('dc14', 'Pathum Nissanka',    'Sri Lanka',    'BAT',  86, 10, 82, 28), // 3
      createPlayer('dc12', 'David Miller',       'South Africa', 'BAT',  88, 10, 88, 37), // 4 - finisher
      createPlayer('dc10', 'Tristan Stubbs',     'South Africa', 'BAT',  86, 18, 86, 25), // 5
      createPlayer('dc2',  'Abishek Porel',      'India',        'WK',   80, 10, 80, 23), // 6 - 2nd WK
      createPlayer('dc4',  'Axar Patel',         'India',        'ALL',  78, 86, 86, 32), // 7 - spin all-rounder
      createPlayer('dc11', 'Vipraj Nigam',       'India',        'ALL',  70, 72, 74, 22), // 8
      createPlayer('dc7',  'Kuldeep Yadav',      'India',        'BOWL', 24, 92, 72, 31), // 9 - spinner
      createPlayer('dc8',  'Mitchell Starc',     'Australia',    'BOWL', 30, 92, 80, 36), // 10 - ace pacer
      createPlayer('dc9',  'T Natarajan',        'India',        'BOWL', 18, 84, 70, 35), // 11 - yorker specialist
      // ── Bench ──
      createPlayer('dc1',  'Nitish Rana',        'India',        'BAT',  82, 18, 78, 31),
      createPlayer('dc5',  'Karun Nair',         'India',        'BAT',  78, 10, 80, 34),
      createPlayer('dc3',  'Ashutosh Sharma',    'India',        'BAT',  82, 10, 74, 26),
      createPlayer('dc15', 'Lungi Ngidi',        'South Africa', 'BOWL', 18, 86, 74, 30),
    ],
  },

  // PBKS — Openers: Prabhsimran, Priyansh | Top/Mid: Iyer, Shashank, Nehal | WK: — | All: Stoinis, Omarzai, Jansen | Bowlers: Chahal, Arshdeep, Ferguson | Bench: Brar, Owen, Musheer, Bartlett
  PBKS: {
    id: 'pbks', name: 'Punjab Kings', short: 'PBKS', color: '#ed1b24',
    battingRating: 87, bowlingRating: 86,
    players: [
      // ── Playing XI ──
      createPlayer('pbks1', 'Prabhsimran Singh', 'India',       'WK',   84, 10, 80, 25), // 1 - WK opener
      createPlayer('pbks2', 'Priyansh Arya',     'India',       'BAT',  78, 10, 74, 23), // 2 - opener
      createPlayer('pbks3', 'Shreyas Iyer',      'India',       'BAT',  88, 15, 86, 31), // 3 - anchor
      createPlayer('pbks4', 'Shashank Singh',    'India',       'BAT',  84, 15, 76, 34), // 4
      createPlayer('pbks5', 'Nehal Wadhera',     'India',       'BAT',  80, 10, 76, 25), // 5
      createPlayer('pbks6', 'Marcus Stoinis',    'Australia',   'ALL',  86, 78, 80, 36), // 6 - pace all-rounder
      createPlayer('pbks7', 'Azmatullah Omarzai','Afghanistan', 'ALL',  80, 82, 80, 25), // 7
      createPlayer('pbks8', 'Marco Jansen',      'South Africa','ALL',  70, 86, 82, 26), // 8 - tall pacer all-rounder
      createPlayer('pbks10','Yuzvendra Chahal',  'India',       'BOWL', 22, 88, 70, 35), // 9 - leg-spinner
      createPlayer('pbks11','Arshdeep Singh',    'India',       'BOWL', 15, 88, 72, 27), // 10 - swing pacer
      createPlayer('pbks15','Lockie Ferguson',   'New Zealand', 'BOWL', 18, 88, 74, 35), // 11 - pace
      // ── Bench ──
      createPlayer('pbks9', 'Harpreet Brar',     'India',       'ALL',  70, 80, 76, 30),
      createPlayer('pbks13','Mitchell Owen',     'Australia',   'ALL',  76, 70, 76, 23),
      createPlayer('pbks12','Musheer Khan',      'India',       'ALL',  72, 68, 74, 21),
      createPlayer('pbks14','Xavier Bartlett',   'Australia',   'BOWL', 18, 84, 74, 28),
    ],
  },

  // GT — Openers: Gill, Buttler | Top/Mid: Sudharsan, Phillips | WK: Kushagra | All: Sundar, Tewatia, Rashid | Bowlers: Rabada, Siraj, Krishna | Bench: Anuj, Shahrukh, Ishant, Sai Kishore
  GT: {
    id: 'gt', name: 'Gujarat Titans', short: 'GT', color: '#1c2e4a',
    battingRating: 88, bowlingRating: 90,
    players: [
      // ── Playing XI ──
      createPlayer('gt1',  'Shubman Gill',       'India',   'BAT',  92, 10, 86, 26), // 1 - opener / captain
      createPlayer('gt5',  'Jos Buttler',        'England', 'WK',   92, 10, 86, 36), // 2 - WK opener
      createPlayer('gt2',  'Sai Sudharsan',      'India',   'BAT',  88, 10, 82, 24), // 3
      createPlayer('gt7',  'Glenn Phillips',     'New Zealand','ALL',88, 68, 90, 29), // 4 - all-rounder
      createPlayer('gt3',  'Kumar Kushagra',     'India',   'WK',   76, 10, 74, 22), // 5 - 2nd WK
      createPlayer('gt6',  'Washington Sundar',  'India',   'ALL',  74, 82, 82, 27), // 6 - spin all-rounder
      createPlayer('gt9',  'Rahul Tewatia',      'India',   'ALL',  76, 66, 76, 33), // 7 - finisher
      createPlayer('gt14', 'Rashid Khan',        'Afghanistan','ALL',74, 98, 95, 27), // 8 - ace spinner all-rounder
      createPlayer('gt10', 'Kagiso Rabada',      'South Africa','BOWL',24,94,82, 31), // 9 - ace pacer
      createPlayer('gt11', 'Mohammed Siraj',     'India',   'BOWL', 16, 88, 75, 32), // 10
      createPlayer('gt12', 'Prasidh Krishna',    'India',   'BOWL', 18, 84, 72, 30), // 11
      // ── Bench ──
      createPlayer('gt4',  'Anuj Rawat',         'India',   'WK',   78, 10, 76, 26),
      createPlayer('gt8',  'Shahrukh Khan',      'India',   'BAT',  80, 30, 76, 30),
      createPlayer('gt13', 'Ishant Sharma',      'India',   'BOWL', 22, 78, 70, 37),
      createPlayer('gt15', 'Sai Kishore',        'India',   'BOWL', 20, 82, 72, 29),
    ],
  },

  // LSG — Openers: Pant, Pooran | Top/Mid: Markram, Breetzke, Samad | WK: Inglis | All: Marsh, Hasaranga, Shahbaz | Bowlers: Shami, Mayank, Avesh | Bench: Badoni, Mohsin, Digvesh, Khan
  LSG: {
    id: 'lsg', name: 'Lucknow Super Giants', short: 'LSG', color: '#00a7e1',
    battingRating: 88, bowlingRating: 87,
    players: [
      // ── Playing XI ──
      createPlayer('lsg5',  'Rishabh Pant',      'India',        'WK',   90, 10, 82, 28), // 1 - WK opener
      createPlayer('lsg6',  'Nicholas Pooran',   'West Indies',  'WK',   92, 10, 84, 30), // 2 - WK opener
      createPlayer('lsg3',  'Aiden Markram',     'South Africa', 'ALL',  88, 68, 88, 31), // 3 - all-rounder
      createPlayer('lsg4',  'Matthew Breetzke',  'South Africa', 'BAT',  82, 10, 78, 27), // 4
      createPlayer('lsg1',  'Abdul Samad',       'India',        'BAT',  80, 15, 74, 25), // 5 - finisher
      createPlayer('lsg15', 'Josh Inglis',       'Australia',    'WK',   86, 10, 86, 31), // 6 - 3rd WK / batter
      createPlayer('lsg7',  'Mitchell Marsh',    'Australia',    'ALL',  90, 78, 82, 34), // 7 - pace all-rounder
      createPlayer('lsg14', 'Wanindu Hasaranga', 'Sri Lanka',    'ALL',  72, 88, 82, 28), // 8 - spin all-rounder
      createPlayer('lsg13', 'Mohammed Shami',    'India',        'BOWL', 24, 90, 74, 35), // 9 - ace pacer
      createPlayer('lsg9',  'Mayank Yadav',      'India',        'BOWL', 12, 88, 68, 24), // 10 - express pace
      createPlayer('lsg10', 'Avesh Khan',        'India',        'BOWL', 16, 84, 70, 29), // 11
      // ── Bench ──
      createPlayer('lsg2',  'Ayush Badoni',      'India',        'BAT',  80, 15, 76, 26),
      createPlayer('lsg8',  'Shahbaz Ahmed',     'India',        'ALL',  74, 76, 78, 31),
      createPlayer('lsg11', 'Mohsin Khan',       'India',        'BOWL', 16, 80, 68, 27),
      createPlayer('lsg12', 'Digvesh Rathi',     'India',        'BOWL', 14, 76, 68, 25),
    ],
  },

  // WEST INDIES — Openers: Hope, Powell | Top/Mid: King, Hetmyer, Rutherford | WK: Charles | All: Holder, Chase, Shepherd | Bowlers: Hosein, Motie, Joseph | Bench: Forde, Seales, Sampson, Romario
  WestIndies: {
    id: 'wi', name: 'West Indies', short: 'WI', color: '#7b0031',
    battingRating: 86, bowlingRating: 86,
    players: [
      // ── Playing XI ──
      createPlayer('wi1',  'Shai Hope',          'West Indies', 'WK',   86, 10, 88, 32), // 1 - WK opener
      createPlayer('wi11', 'Rovman Powell',      'West Indies', 'BAT',  86, 15, 84, 32), // 2 - opener
      createPlayer('wi9',  'Brandon King',       'West Indies', 'BAT',  84, 10, 78, 31), // 3
      createPlayer('wi2',  'Shimron Hetmyer',    'West Indies', 'BAT',  86, 10, 80, 29), // 4 - finisher
      createPlayer('wi12', 'Sherfane Rutherford','West Indies', 'BAT',  82, 10, 80, 27), // 5
      createPlayer('wi3',  'Johnson Charles',    'West Indies', 'WK',   80, 10, 75, 36), // 6 - 2nd WK
      createPlayer('wi6',  'Jason Holder',       'West Indies', 'ALL',  76, 82, 82, 34), // 7 - pace all-rounder
      createPlayer('wi4',  'Roston Chase',       'West Indies', 'ALL',  74, 78, 84, 33), // 8 - spin all-rounder
      createPlayer('wi15', 'Romario Shepherd',   'West Indies', 'ALL',  78, 80, 76, 31), // 9
      createPlayer('wi7',  'Akeal Hosein',       'West Indies', 'BOWL', 40, 88, 84, 32), // 10 - spinner
      createPlayer('wi10', 'Gudakesh Motie',     'West Indies', 'BOWL', 20, 84, 75, 30), // 11 - spinner
      // ── Bench ──
      createPlayer('wi5',  'Matthew Forde',      'West Indies', 'ALL',  72, 80, 76, 23),
      createPlayer('wi8',  'Shamar Joseph',      'West Indies', 'BOWL', 18, 86, 72, 25),
      createPlayer('wi14', 'Jayden Seales',      'West Indies', 'BOWL', 16, 84, 72, 24),
      createPlayer('wi13', 'Quentin Sampson',    'West Indies', 'BAT',  74, 10, 72, 23),
    ],
  },

  // AFGHANISTAN — Openers: Gurbaz, Ibrahim | Top/Mid: Atal, Gulbadin, Omarzai | WK: Rahimi | All: Rashid, Nabi, Kamal | Bowlers: Farooqi, Noor, Mujeeb | Bench: Ahmadzai, Darwish, Sharifi, Sediq
  Afghanistan: {
    id: 'afg', name: 'Afghanistan', short: 'AFG', color: '#00589b',
    battingRating: 84, bowlingRating: 91,
    players: [
      // ── Playing XI ──
      createPlayer('afg6',  'Rahmanullah Gurbaz',    'Afghanistan', 'WK',   88, 10, 80, 24), // 1 - WK opener
      createPlayer('afg14', 'Ibrahim Zadran',        'Afghanistan', 'BAT',  86, 10, 82, 24), // 2 - opener
      createPlayer('afg4',  'Sediqullah Atal',       'Afghanistan', 'BAT',  80, 10, 76, 23), // 3
      createPlayer('afg10', 'Gulbadin Naib',         'Afghanistan', 'ALL',  80, 75, 85, 35), // 4 - all-rounder
      createPlayer('afg11', 'Azmatullah Omarzai',    'Afghanistan', 'ALL',  82, 82, 80, 25), // 5
      createPlayer('afg7',  'Mohammad Ishaq Rahimi', 'Afghanistan', 'WK',   74, 10, 74, 23), // 6 - 2nd WK
      createPlayer('afg9',  'Mohammad Nabi',         'Afghanistan', 'ALL',  78, 82, 85, 41), // 7 - veteran all-rounder
      createPlayer('afg1',  'Rashid Khan',           'Afghanistan', 'ALL',  74, 98, 95, 27), // 8 - ace spinner
      createPlayer('afg5',  'Fazalhaq Farooqi',      'Afghanistan', 'BOWL', 14, 90, 72, 25), // 9 - ace pacer
      createPlayer('afg2',  'Noor Ahmad',            'Afghanistan', 'BOWL', 18, 88, 74, 21), // 10 - chinaman
      createPlayer('afg12', 'Mujeeb Ur Rahman',      'Afghanistan', 'BOWL', 34, 88, 72, 24), // 11 - mystery spinner
      // ── Bench ──
      createPlayer('afg8',  'Shahidullah Kamal',     'Afghanistan', 'ALL',  72, 72, 74, 25),
      createPlayer('afg3',  'Abdullah Ahmadzai',     'Afghanistan', 'BOWL', 12, 78, 68, 22),
      createPlayer('afg13', 'Darwish Rasooli',       'Afghanistan', 'BAT',  78, 12, 74, 26),
      createPlayer('afg15', 'Zia Ur Rahman Sharifi', 'Afghanistan', 'BOWL', 12, 78, 68, 24),
    ],
  },

  // IRELAND — Openers: Stirling, Tucker | Top/Mid: H.Tector, J.Tector, Rock | WK: Moor | All: Adair, Delany | Bowlers: McBrine, McCarthy, Hand | Bench: Chopra, Young, Lyne, Grassi
  Ireland: {
    id: 'ire', name: 'Ireland', short: 'IRE', color: '#1e90ff',
    battingRating: 78, bowlingRating: 82,
    players: [
      // ── Playing XI ──
      createPlayer('ire1',  'Paul Stirling',  'Ireland', 'BAT',  84, 10, 80, 34), // 1 - opener
      createPlayer('ire5',  'Lorcan Tucker',  'Ireland', 'WK',   80, 10, 76, 25), // 2 - WK opener
      createPlayer('ire6',  'Harry Tector',   'Ireland', 'BAT',  78, 10, 74, 24), // 3
      createPlayer('ire11', 'Jack Tector',    'Ireland', 'BAT',  74, 10, 70, 22), // 4
      createPlayer('ire12', 'Neil Rock',      'Ireland', 'BAT',  72, 10, 68, 30), // 5
      createPlayer('ire14', 'Peter Moor',     'Ireland', 'WK',   72, 10, 68, 27), // 6 - 2nd WK
      createPlayer('ire4',  'Mark Adair',     'Ireland', 'ALL',  72, 76, 75, 29), // 7 - pace all-rounder
      createPlayer('ire8',  'Gareth Delany',  'Ireland', 'ALL',  70, 68, 70, 27), // 8
      createPlayer('ire2',  'Andrew McBrine', 'Ireland', 'BOWL', 28, 80, 74, 31), // 9 - spinner
      createPlayer('ire3',  'Barry McCarthy', 'Ireland', 'BOWL', 22, 82, 70, 28), // 10 - pacer
      createPlayer('ire9',  'Fionn Hand',     'Ireland', 'BOWL', 20, 78, 68, 26), // 11
      // ── Bench ──
      createPlayer('ire7',  'Varun Chopra',   'Ireland', 'BAT',  76, 10, 72, 36),
      createPlayer('ire10', 'Craig Young',    'Ireland', 'BOWL', 18, 80, 70, 28),
      createPlayer('ire13', 'Jordan Lyne',    'Ireland', 'BOWL', 16, 76, 66, 25),
      createPlayer('ire15', 'Jamie Grassi',   'Ireland', 'BOWL', 14, 74, 64, 26),
    ],
  },

  // ZIMBABWE — Openers: Ervine, Madhevere | Top/Mid: Kaia, Williams, Burl | WK: Chakabva | All: Chigumbura, Kasuza | Bowlers: Muzarabani, Ngarava, Mavuta | Bench: Nyauchi, Chatara, Chivanga, Shumba
  Zimbabwe: {
    id: 'zim', name: 'Zimbabwe', short: 'ZIM', color: '#ffcc00',
    battingRating: 74, bowlingRating: 78,
    players: [
      // ── Playing XI ──
      createPlayer('zim1',  'Craig Ervine',        'Zimbabwe', 'BAT',  82, 10, 78, 33), // 1 - opener / captain
      createPlayer('zim7',  'Wessly Madhevere',    'Zimbabwe', 'BAT',  74, 10, 72, 28), // 2 - opener
      createPlayer('zim6',  'Innocent Kaia',       'Zimbabwe', 'BAT',  72, 10, 70, 26), // 3
      createPlayer('zim4',  'Sean Williams',       'Zimbabwe', 'ALL',  76, 72, 74, 33), // 4 - all-rounder
      createPlayer('zim12', 'Ryan Burl',           'Zimbabwe', 'ALL',  72, 74, 72, 28), // 5 - spin all-rounder
      createPlayer('zim5',  'Regis Chakabva',      'Zimbabwe', 'WK',   78, 10, 74, 32), // 6 - WK
      createPlayer('zim8',  'Elton Chigumbura',    'Zimbabwe', 'ALL',  70, 68, 70, 36), // 7
      createPlayer('zim11', 'Kevin Kasuza',        'Zimbabwe', 'BAT',  68, 10, 66, 24), // 8
      createPlayer('zim2',  'Blessing Muzarabani', 'Zimbabwe', 'BOWL', 24, 84, 72, 28), // 9 - ace pacer
      createPlayer('zim3',  'Richard Ngarava',     'Zimbabwe', 'BOWL', 26, 82, 74, 27), // 10
      createPlayer('zim9',  'Brandon Mavuta',      'Zimbabwe', 'BOWL', 20, 80, 70, 25), // 11 - spinner
      // ── Bench ──
      createPlayer('zim10', 'Victor Nyauchi',      'Zimbabwe', 'BOWL', 22, 78, 72, 26),
      createPlayer('zim14', 'Tendai Chatara',      'Zimbabwe', 'BOWL', 20, 76, 70, 31),
      createPlayer('zim13', 'Tanaka Chivanga',     'Zimbabwe', 'BOWL', 18, 76, 68, 23),
      createPlayer('zim15', 'Milton Shumba',       'Zimbabwe', 'BAT',  66, 10, 64, 27),
    ],
  },

  // UGANDA — Openers: Opio, Masaba | Top/Mid: Khan, Ssozi | WK: Ssozi | All: Nakrani, Kyewuta | Bowlers: Nsubuga, Bukaka, Omondi | Bench: Mukasa, Ssesazi, Miyagi, Ouma
  Uganda: {
    id: 'uga', name: 'Uganda', short: 'UGA', color: '#000000',
    battingRating: 68, bowlingRating: 74,
    players: [
      // ── Playing XI ──
      createPlayer('uga1',  'Aaron Opio',        'Uganda', 'BAT',  76, 10, 72, 29), // 1 - opener
      createPlayer('uga5',  'Brian Masaba',      'Uganda', 'BAT',  72, 10, 68, 31), // 2 - opener
      createPlayer('uga13', 'Bilal Azhar Khan',  'Uganda', 'BAT',  70, 10, 68, 29), // 3
      createPlayer('uga6',  'Rishi Ssozi',       'Uganda', 'WK',   74, 10, 70, 28), // 4 - WK
      createPlayer('uga4',  'Riazat Ali Khan',   'Uganda', 'ALL',  70, 68, 70, 26), // 5 - all-rounder
      createPlayer('uga14', 'Dinesh Nakrani',    'Uganda', 'ALL',  68, 66, 68, 30), // 6
      createPlayer('uga7',  'Roger Mukasa',      'Uganda', 'BAT',  68, 10, 66, 30), // 7
      createPlayer('uga9',  'Simon Ssesazi',     'Uganda', 'BAT',  66, 10, 64, 33), // 8
      createPlayer('uga2',  'Cosmas Kyewuta',    'Uganda', 'BOWL', 20, 80, 70, 27), // 9 - spinner
      createPlayer('uga3',  'Frank Nsubuga',     'Uganda', 'BOWL', 22, 76, 72, 28), // 10
      createPlayer('uga8',  'Kyomi Bukaka',      'Uganda', 'BOWL', 18, 74, 68, 25), // 11
      // ── Bench ──
      createPlayer('uga11', 'Juma Miyagi',       'Uganda', 'BAT',  64, 10, 62, 28),
      createPlayer('uga10', 'Alphonce Omondi',   'Uganda', 'BOWL', 16, 72, 66, 26),
      createPlayer('uga12', 'Henry Ssekamanya',  'Uganda', 'BOWL', 14, 70, 64, 27),
      createPlayer('uga15', 'Wycliffe Ouma',     'Uganda', 'BOWL', 12, 68, 62, 32),
    ],
  },

  // NAMIBIA — Openers: Erasmus, Baard | Top/Mid: Green, Wiese | WK: Smit | All: Frylinck, Ya France | Bowlers: Trumpelmann, Kotze, Lohmann | Bench: Brassell, van Buuren, Lungameni, Williams
  Namibia: {
    id: 'nam', name: 'Namibia', short: 'NAM', color: '#009ddc',
    battingRating: 66, bowlingRating: 72,
    players: [
      // ── Playing XI ──
      createPlayer('nam1',  'Gerhard Erasmus',    'Namibia', 'BAT',  78, 10, 74, 30), // 1 - opener / captain
      createPlayer('nam7',  'Stephan Baard',      'Namibia', 'BAT',  68, 10, 66, 31), // 2 - opener
      createPlayer('nam5',  'Zane Green',         'Namibia', 'BAT',  70, 10, 68, 27), // 3
      createPlayer('nam4',  'David Wiese',        'Namibia', 'ALL',  74, 72, 74, 38), // 4 - pace all-rounder
      createPlayer('nam8',  'BvR Smit',           'Namibia', 'WK',   72, 10, 70, 29), // 5 - WK
      createPlayer('nam3',  'Jan Frylinck',       'Namibia', 'ALL',  72, 74, 72, 32), // 6
      createPlayer('nam11', 'Pikky Ya France',    'Namibia', 'ALL',  68, 68, 68, 34), // 7 - spin all-rounder
      createPlayer('nam10', 'Jack Brassell',      'Namibia', 'BAT',  66, 10, 64, 25), // 8
      createPlayer('nam2',  'Ruben Trumpelmann',  'Namibia', 'BOWL', 18, 76, 70, 28), // 9 - ace pacer
      createPlayer('nam6',  'Jaco Kotze',         'Namibia', 'BOWL', 16, 74, 68, 28), // 10
      createPlayer('nam9',  'Deon Lohmann',       'Namibia', 'BOWL', 14, 72, 66, 26), // 11
      // ── Bench ──
      createPlayer('nam14', 'Craig Williams',     'Namibia', 'BAT',  62, 10, 60, 36),
      createPlayer('nam12', 'Esti van Buuren',    'Namibia', 'BOWL', 12, 70, 64, 26),
      createPlayer('nam13', 'Tangeni Lungameni',  'Namibia', 'BAT',  64, 10, 62, 28),
      createPlayer('nam15', 'Evan Jones',         'Namibia', 'BOWL', 10, 68, 62, 27),
    ],
  },
};
