export interface Club {
  id: string;
  name: string;
  short: string;
  city: string;
  c1: string;
  c2: string;
  ink?: string;
}

export const CLUBS: Club[] = [
  { id: "real-madrid", name: "Real Madrid", short: "RMA", city: "Madrid", c1: "#ffffff", c2: "#febe10", ink: "#1a1a2e" },
  { id: "barcelona", name: "FC Barcelona", short: "BAR", city: "Barcelona", c1: "#a50044", c2: "#004d98" },
  { id: "atletico-madrid", name: "Atlético Madrid", short: "ATM", city: "Madrid", c1: "#cb3524", c2: "#262e62" },
  { id: "valencia", name: "Valencia CF", short: "VAL", city: "Valencia", c1: "#f5f5f5", c2: "#ee3524", ink: "#1a1a2e" },
  { id: "sevilla", name: "Sevilla FC", short: "SEV", city: "Seville", c1: "#f43333", c2: "#ffffff" },
  { id: "villarreal", name: "Villarreal CF", short: "VIL", city: "Villarreal", c1: "#ffe667", c2: "#005187", ink: "#1a1a2e" },
  { id: "athletic-club", name: "Athletic Club", short: "ATH", city: "Bilbao", c1: "#ee2523", c2: "#ffffff" },
  { id: "real-sociedad", name: "Real Sociedad", short: "RSO", city: "San Sebastián", c1: "#0067b1", c2: "#ffffff" },
  { id: "real-betis", name: "Real Betis", short: "BET", city: "Seville", c1: "#00954c", c2: "#ffffff" },
  { id: "celta-vigo", name: "Celta de Vigo", short: "CEL", city: "Vigo", c1: "#8ac3ee", c2: "#ffffff", ink: "#12314d" },
  { id: "espanyol", name: "RCD Espanyol", short: "ESP", city: "Barcelona", c1: "#007fc8", c2: "#ffffff" },
  { id: "deportivo", name: "Deportivo La Coruña", short: "DEP", city: "A Coruña", c1: "#0072bc", c2: "#ffffff" },
  { id: "osasuna", name: "CA Osasuna", short: "OSA", city: "Pamplona", c1: "#0a346f", c2: "#d81e05" },
  { id: "mallorca", name: "RCD Mallorca", short: "MLL", city: "Palma", c1: "#e20613", c2: "#000000" },
  { id: "malaga", name: "Málaga CF", short: "MAL", city: "Málaga", c1: "#0a5796", c2: "#ffffff" },
  { id: "getafe", name: "Getafe CF", short: "GET", city: "Getafe", c1: "#005999", c2: "#ffffff" },
  { id: "levante", name: "Levante UD", short: "LEV", city: "Valencia", c1: "#004f9e", c2: "#c8102e" },
  { id: "rayo-vallecano", name: "Rayo Vallecano", short: "RAY", city: "Madrid", c1: "#ffffff", c2: "#e53027", ink: "#1a1a2e" },
  { id: "alaves", name: "Deportivo Alavés", short: "ALA", city: "Vitoria-Gasteiz", c1: "#0761af", c2: "#ffffff" },
  { id: "sporting-gijon", name: "Sporting Gijón", short: "SPG", city: "Gijón", c1: "#fbba00", c2: "#d2001c", ink: "#3a2400" },
  { id: "las-palmas", name: "UD Las Palmas", short: "LPA", city: "Las Palmas", c1: "#ffe400", c2: "#004b9b", ink: "#243010" },
  { id: "girona", name: "Girona FC", short: " GIR", city: "Girona", c1: "#d81a21", c2: "#ffffff" },
  { id: "eibar", name: "SD Eibar", short: "EIB", city: "Eibar", c1: "#8d1b3d", c2: "#8b8d90" },
  { id: "elche", name: "Elche CF", short: "ELC", city: "Elche", c1: "#00963f", c2: "#ffffff" },
  { id: "cadiz", name: "Cádiz CF", short: "CAD", city: "Cádiz", c1: "#ffe500", c2: "#0a3a82", ink: "#333300" },
  { id: "leganes", name: "CD Leganés", short: "LEG", city: "Leganés", c1: "#005ca9", c2: "#ffffff" },
  { id: "huesca", name: "SD Huesca", short: "HUE", city: "Huesca", c1: "#1d3f94", c2: "#ffffff" },
  { id: "granada", name: "Granada CF", short: "GRA", city: "Granada", c1: "#c8102e", c2: "#ffffff" },
  { id: "almeria", name: "UD Almería", short: "ALM", city: "Almería", c1: "#d71920", c2: "#ffffff" },
  { id: "valladolid", name: "Real Valladolid", short: "VLL", city: "Valladolid", c1: "#75208b", c2: "#ffffff" },
  { id: "zaragoza", name: "Real Zaragoza", short: "ZAR", city: "Zaragoza", c1: "#ffffff", c2: "#0055a5", ink: "#1a1a2e" },
  { id: "racing-santander", name: "Racing Santander", short: "RAC", city: "Santander", c1: "#ffffff", c2: "#007b3e", ink: "#1a1a2e" },
  { id: "tenerife", name: "CD Tenerife", short: "TEN", city: "Santa Cruz", c1: "#ffffff", c2: "#0a3a82", ink: "#1a1a2e" },
  { id: "numancia", name: "CD Numancia", short: "NUM", city: "Soria", c1: "#c8102e", c2: "#0a3a82" },
  { id: "recreativo", name: "Recreativo Huelva", short: "REC", city: "Huelva", c1: "#ffffff", c2: "#0055a5", ink: "#1a1a2e" },
  { id: "murcia", name: "Real Murcia", short: "MUR", city: "Murcia", c1: "#c8102e", c2: "#ffffff" },
  { id: "gimnastic", name: "Gimnàstic Tarragona", short: "GIM", city: "Tarragona", c1: "#c8102e", c2: "#ffffff" },
  { id: "xerez", name: "Xerez CD", short: "XEZ", city: "Jerez", c1: "#0055a5", c2: "#ffffff" },
  { id: "albacete", name: "Albacete Balompié", short: "ALB", city: "Albacete", c1: "#ffffff", c2: "#0a3a82", ink: "#1a1a2e" },
  { id: "compostela", name: "SD Compostela", short: "COM", city: "Santiago", c1: "#0055a5", c2: "#ffffff" },
  { id: "merida", name: "CP Mérida", short: "MER", city: "Mérida", c1: "#c8102e", c2: "#0a3a82" },
  { id: "extremadura", name: "CF Extremadura", short: "EXT", city: "Almendralejo", c1: "#c8102e", c2: "#0a3a82" },
  { id: "salamanca", name: "UD Salamanca", short: "SAL", city: "Salamanca", c1: "#0a3a82", c2: "#ffffff" },
  { id: "oviedo", name: "Real Oviedo", short: "OVI", city: "Oviedo", c1: "#0055a5", c2: "#ffffff" },
];

export const clubById = new Map(CLUBS.map((c) => [c.id, c]));
