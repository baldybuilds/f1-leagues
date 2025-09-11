export interface F1Track {
  id: string
  name: string
  country: string
  flag: string
  length: number // in km
  laps: number
}

export const F1_2025_TRACKS: F1Track[] = [
  {
    id: 'bahrain',
    name: 'Bahrain International Circuit',
    country: 'Bahrain',
    flag: '🇧🇭',
    length: 5.412,
    laps: 57
  },
  {
    id: 'saudi-arabia',
    name: 'Jeddah Corniche Circuit',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    length: 6.174,
    laps: 50
  },
  {
    id: 'australia',
    name: 'Albert Park Circuit',
    country: 'Australia',
    flag: '🇦🇺',
    length: 5.278,
    laps: 58
  },
  {
    id: 'japan',
    name: 'Suzuka International Racing Course',
    country: 'Japan',
    flag: '🇯🇵',
    length: 5.807,
    laps: 53
  },
  {
    id: 'china',
    name: 'Shanghai International Circuit',
    country: 'China',
    flag: '🇨🇳',
    length: 5.451,
    laps: 56
  },
  {
    id: 'miami',
    name: 'Miami International Autodrome',
    country: 'United States',
    flag: '🇺🇸',
    length: 5.412,
    laps: 57
  },
  {
    id: 'emilia-romagna',
    name: 'Autodromo Enzo e Dino Ferrari',
    country: 'Italy',
    flag: '🇮🇹',
    length: 4.909,
    laps: 63
  },
  {
    id: 'monaco',
    name: 'Circuit de Monaco',
    country: 'Monaco',
    flag: '🇲🇨',
    length: 3.337,
    laps: 78
  },
  {
    id: 'canada',
    name: 'Circuit Gilles-Villeneuve',
    country: 'Canada',
    flag: '🇨🇦',
    length: 4.361,
    laps: 70
  },
  {
    id: 'spain',
    name: 'Circuit de Barcelona-Catalunya',
    country: 'Spain',
    flag: '🇪🇸',
    length: 4.675,
    laps: 66
  },
  {
    id: 'austria',
    name: 'Red Bull Ring',
    country: 'Austria',
    flag: '🇦🇹',
    length: 4.318,
    laps: 71
  },
  {
    id: 'great-britain',
    name: 'Silverstone Circuit',
    country: 'Great Britain',
    flag: '🇬🇧',
    length: 5.891,
    laps: 52
  },
  {
    id: 'hungary',
    name: 'Hungaroring',
    country: 'Hungary',
    flag: '🇭🇺',
    length: 4.381,
    laps: 70
  },
  {
    id: 'belgium',
    name: 'Circuit de Spa-Francorchamps',
    country: 'Belgium',
    flag: '🇧🇪',
    length: 7.004,
    laps: 44
  },
  {
    id: 'netherlands',
    name: 'Circuit Zandvoort',
    country: 'Netherlands',
    flag: '🇳🇱',
    length: 4.259,
    laps: 72
  },
  {
    id: 'italy',
    name: 'Autodromo Nazionale di Monza',
    country: 'Italy',
    flag: '🇮🇹',
    length: 5.793,
    laps: 53
  },
  {
    id: 'azerbaijan',
    name: 'Baku City Circuit',
    country: 'Azerbaijan',
    flag: '🇦🇿',
    length: 6.003,
    laps: 51
  },
  {
    id: 'singapore',
    name: 'Marina Bay Street Circuit',
    country: 'Singapore',
    flag: '🇸🇬',
    length: 5.063,
    laps: 61
  },
  {
    id: 'united-states',
    name: 'Circuit of the Americas',
    country: 'United States',
    flag: '🇺🇸',
    length: 5.513,
    laps: 56
  },
  {
    id: 'mexico',
    name: 'Autódromo Hermanos Rodríguez',
    country: 'Mexico',
    flag: '🇲🇽',
    length: 4.304,
    laps: 71
  },
  {
    id: 'brazil',
    name: 'Autódromo José Carlos Pace',
    country: 'Brazil',
    flag: '🇧🇷',
    length: 4.309,
    laps: 71
  },
  {
    id: 'las-vegas',
    name: 'Las Vegas Street Circuit',
    country: 'United States',
    flag: '🇺🇸',
    length: 6.201,
    laps: 50
  },
  {
    id: 'qatar',
    name: 'Lusail International Circuit',
    country: 'Qatar',
    flag: '🇶🇦',
    length: 5.419,
    laps: 57
  },
  {
    id: 'abu-dhabi',
    name: 'Yas Marina Circuit',
    country: 'Abu Dhabi',
    flag: '🇦🇪',
    length: 5.281,
    laps: 58
  }
]

export const F1_GAMES = [
  { value: 'f1-24', label: 'F1 24' },
  { value: 'f1-25', label: 'F1 25' }
] as const