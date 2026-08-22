import { RAW1 } from './data/raw/p1.ts';
import { RAW2 } from './data/raw/p2.ts';
import { RAW3 } from './data/raw/p3.ts';
import { RAW4 } from './data/raw/p4.ts';
import { RAW5 } from './data/raw/p5.ts';

// Curated fan-game starter archive. Ratings are an independent editorial model,
// not official league or publisher data. IDs are stable for deterministic games.
const rows = `
Barcelona|2008/09|Víctor Valdés|GK|88|91
Barcelona|2008/09|Dani Alves|RB/RWB|93|94
Barcelona|2010/11|Gerard Piqué|CB|91|93
Barcelona|2010/11|Carles Puyol|CB|92|94
Barcelona|2014/15|Jordi Alba|LB/LWB|90|92
Barcelona|2008/09|Sergio Busquets|CDM/CM|89|94
Barcelona|2009/10|Xavi Hernández|CM|96|96
Barcelona|2010/11|Andrés Iniesta|CM/CAM|96|96
Barcelona|2014/15|Lionel Messi|RW/ST/CAM|99|99
Barcelona|2015/16|Luis Suárez|ST|96|96
Barcelona|2014/15|Neymar|LW/RW|93|95
Barcelona|1996/97|Ronaldo Nazário|ST|97|98
Barcelona|2004/05|Ronaldinho|LW/CAM|95|96
Barcelona|1993/94|Romário|ST|95|95
Barcelona|2022/23|Marc-André ter Stegen|GK|93|93
Barcelona|2022/23|Ronald Araújo|CB/RB|90|91
Real Madrid|2001/02|Iker Casillas|GK|91|95
Real Madrid|2002/03|Míchel Salgado|RB|87|89
Real Madrid|2016/17|Sergio Ramos|CB|94|95
Real Madrid|2006/07|Fabio Cannavaro|CB|92|95
Real Madrid|2002/03|Roberto Carlos|LB/LWB|94|96
Real Madrid|2016/17|Casemiro|CDM/CM|91|93
Real Madrid|2002/03|Zinedine Zidane|CM/CAM|96|97
Real Madrid|2013/14|Luka Modrić|CM|93|96
Real Madrid|2016/17|Gareth Bale|RW/LW|93|95
Real Madrid|2021/22|Karim Benzema|ST|97|97
Real Madrid|2011/12|Cristiano Ronaldo|LW/ST|98|99
Real Madrid|2000/01|Raúl|ST/CAM|94|95
Real Madrid|2023/24|Jude Bellingham|CM/CAM|94|95
Real Madrid|2023/24|Antonio Rüdiger|CB|91|92
Real Madrid|2023/24|Dani Carvajal|RB|92|92
Real Madrid|2023/24|Ferland Mendy|LB|88|89
Atlético Madrid|2013/14|Thibaut Courtois|GK|93|95
Atlético Madrid|2013/14|Juanfran|RB|88|90
Atlético Madrid|2013/14|Diego Godín|CB|94|95
Atlético Madrid|2015/16|José María Giménez|CB|90|92
Atlético Madrid|2020/21|Renan Lodi|LB/LWB|86|88
Atlético Madrid|2013/14|Gabi|CM/CDM|91|92
Atlético Madrid|2020/21|Koke|CM/LM|91|92
Atlético Madrid|2015/16|Saúl Ñíguez|CM/LM|89|91
Atlético Madrid|2013/14|Arda Turan|LW/CAM|90|91
Atlético Madrid|2015/16|Antoine Griezmann|ST/CAM|93|95
Atlético Madrid|2013/14|Diego Costa|ST|93|94
Atlético Madrid|2020/21|Luis Suárez|ST|91|96
Atlético Madrid|1995/96|José Luis Caminero|CM/CAM|92|92
Atlético Madrid|2020/21|Marcos Llorente|CM/RM|91|92
Valencia|2001/02|Santiago Cañizares|GK|92|93
Valencia|2003/04|Curro Torres|RB|86|87
Valencia|2003/04|Roberto Ayala|CB|93|94
Valencia|2001/02|Mauricio Pellegrino|CB|89|90
Valencia|2003/04|Amedeo Carboni|LB|87|89
Valencia|2001/02|David Albelda|CDM/CM|91|92
Valencia|2003/04|Rubén Baraja|CM|92|93
Valencia|2003/04|Pablo Aimar|CAM/CM|91|93
Valencia|2003/04|Francisco Rufete|RW/RM|87|88
Valencia|2006/07|David Villa|ST|93|95
Valencia|2003/04|Vicente Rodríguez|LW/LM|92|93
Valencia|2018/19|Dani Parejo|CM|91|92
Valencia|2008/09|David Silva|CAM/LW|91|95
Valencia|2018/19|José Gayà|LB|88|90
Deportivo|1999/00|Jacques Songo'o|GK|89|90
Deportivo|1999/00|Manuel Pablo|RB|89|90
Deportivo|2001/02|Nourredine Naybet|CB|90|91
Deportivo|1999/00|Donato|CB/CDM|90|92
Deportivo|2001/02|Joan Capdevila|LB|87|91
Deportivo|1999/00|Mauro Silva|CDM|93|94
Deportivo|1999/00|Fran González|LM/CM|91|92
Deportivo|2001/02|Juan Carlos Valerón|CAM/CM|93|94
Deportivo|2003/04|Víctor Sánchez|RM/RW|87|88
Deportivo|2003/04|Walter Pandiani|ST|88|90
Deportivo|2001/02|Diego Tristán|ST|92|93
Deportivo|1999/00|Roy Makaay|ST|89|93
Sevilla|2022/23|Yassine Bounou|GK|91|92
Sevilla|2019/20|Jesús Navas|RB/RM|90|91
Sevilla|2019/20|Jules Koundé|CB/RB|89|93
Sevilla|2019/20|Diego Carlos|CB|90|91
Sevilla|2019/20|Sergio Reguilón|LB|87|89
Sevilla|2006/07|Christian Poulsen|CDM/CM|89|90
Sevilla|2019/20|Éver Banega|CM/CAM|91|92
Sevilla|2015/16|Steven Nzonzi|CM/CDM|89|91
Sevilla|2006/07|Jesús Navas|RW/RM|88|91
Sevilla|2015/16|Kevin Gameiro|ST|89|90
Sevilla|2006/07|Frédéric Kanouté|ST|92|93
Sevilla|2006/07|Adriano Correia|LW/LB|87|89
Villarreal|2007/08|Diego López|GK|90|91
Villarreal|2007/08|Ángel López|RB|85|86
Villarreal|2020/21|Raúl Albiol|CB|89|92
Villarreal|2007/08|Gonzalo Rodríguez|CB|88|90
Villarreal|2020/21|Pervis Estupiñán|LB|87|89
Villarreal|2007/08|Marcos Senna|CDM/CM|93|94
Villarreal|2007/08|Santi Cazorla|CM/LM|89|92
Villarreal|2005/06|Juan Román Riquelme|CAM/CM|94|95
Villarreal|2020/21|Samuel Chukwueze|RW|86|89
Villarreal|2020/21|Gerard Moreno|ST/RW|91|92
Villarreal|2007/08|Robert Pirès|LW/LM|88|94
Villarreal|2004/05|Diego Forlán|ST|92|94
Real Sociedad|2022/23|Álex Remiro|GK|88|89
Real Sociedad|2002/03|Aitor López Rekarte|RB|85|86
Real Sociedad|2022/23|Robin Le Normand|CB|89|90
Real Sociedad|2002/03|Igor Jauregi|CB|86|87
Real Sociedad|2022/23|Aihen Muñoz|LB|85|86
Real Sociedad|2002/03|Xabi Alonso|CM/CDM|91|95
Real Sociedad|2022/23|Mikel Merino|CM|90|92
Real Sociedad|2022/23|David Silva|CAM/CM|89|95
Real Sociedad|2022/23|Takefusa Kubo|RW/CAM|89|91
Real Sociedad|2002/03|Darko Kovačević|ST|90|91
Real Sociedad|2002/03|Nihat Kahveci|ST/RW|91|92
Real Sociedad|2012/13|Antoine Griezmann|LW/ST|88|95
Athletic Club|2011/12|Gorka Iraizoz|GK|87|88
Athletic Club|2023/24|Óscar de Marcos|RB/RM|87|88
Athletic Club|2023/24|Dani Vivian|CB|89|90
Athletic Club|2011/12|Fernando Amorebieta|CB|87|88
Athletic Club|2023/24|Yuri Berchiche|LB|88|89
Athletic Club|2011/12|Javi Martínez|CDM/CB|91|93
Athletic Club|2023/24|Oihan Sancet|CAM/CM|89|91
Athletic Club|2011/12|Ander Herrera|CM/CAM|89|92
Athletic Club|2023/24|Iñaki Williams|RW/ST|90|91
Athletic Club|2011/12|Fernando Llorente|ST|91|92
Athletic Club|2023/24|Nico Williams|LW/RW|91|93
Athletic Club|1997/98|Julen Guerrero|CAM/CM|91|93
Real Betis|2021/22|Claudio Bravo|GK|88|92
Real Betis|2021/22|Héctor Bellerín|RB|86|90
Real Betis|2004/05|Juanito|CB|89|90
Real Betis|2021/22|Marc Bartra|CB|87|90
Real Betis|2021/22|Álex Moreno|LB/LWB|88|89
Real Betis|2004/05|Marcos Assunção|CDM/CM|90|91
Real Betis|2021/22|Guido Rodríguez|CDM/CM|89|90
Real Betis|2021/22|Nabil Fekir|CAM/RW|91|92
Real Betis|2004/05|Joaquín|RW/RM|92|93
Real Betis|2021/22|Borja Iglesias|ST|88|89
Real Betis|2004/05|Edu|LW/ST|88|89
Real Betis|1996/97|Finidi George|RW|90|91
Mallorca|1998/99|Carlos Roa|GK|91|92
Mallorca|1998/99|Olaizola|RB|84|85
Mallorca|2000/01|Miguel Ángel Nadal|CB/CDM|89|92
Mallorca|1998/99|Marcelino Elena|CB|88|89
Mallorca|2023/24|Jaume Costa|LB|84|86
Mallorca|1998/99|Vicente Engonga|CM/CDM|88|89
Mallorca|2002/03|Ariel Ibagaza|CAM/CM|90|91
Mallorca|1998/99|Jovan Stanković|LM/LW|87|88
Mallorca|2002/03|Samuel Eto'o|ST|91|96
Mallorca|1998/99|Dani García Lara|ST|88|89
Mallorca|2023/24|Vedat Muriqi|ST|87|88
Mallorca|2002/03|Albert Riera|LW/LM|86|89
`.trim().split('\n');

const slug = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const curatedPlayers = rows.map((row, index) => {
  const [club, season, name, positions, rating, prime] = row.split('|');
  return {
    id: `${slug(name)}-${slug(club)}-${season.slice(0, 4)}`,
    playerId: slug(name), club, season, name,
    positions: positions.split('/'), rating: Number(rating), prime: Number(prime),
    tier: index % 9 === 0 ? 'B' : 'A'
  };
});

const clubNames = {
  'real-madrid':'Real Madrid','barcelona':'Barcelona','atletico-madrid':'Atlético Madrid',
  'valencia':'Valencia','sevilla':'Sevilla','villarreal':'Villarreal','athletic-club':'Athletic Club',
  'deportivo':'Deportivo','real-sociedad':'Real Sociedad','real-betis':'Real Betis',
  'celta-vigo':'Celta de Vigo','espanyol':'RCD Espanyol','osasuna':'CA Osasuna','mallorca':'RCD Mallorca',
  'malaga':'Málaga CF','getafe':'Getafe CF','levante':'Levante UD','rayo-vallecano':'Rayo Vallecano',
  'alaves':'Deportivo Alavés','sporting-gijon':'Sporting Gijón','las-palmas':'UD Las Palmas',
  'girona':'Girona FC','eibar':'SD Eibar','elche':'Elche CF','cadiz':'Cádiz CF','leganes':'CD Leganés',
  'huesca':'SD Huesca','granada':'Granada CF','almeria':'UD Almería','valladolid':'Real Valladolid',
  'zaragoza':'Real Zaragoza','racing-santander':'Racing Santander','xerez':'Xerez CD',
  'albacete':'Albacete Balompié','oviedo':'Real Oviedo'
};
const normalizePosition = position => ({AM:'CAM',DM:'CDM',FW:'ST',F:'ST',FC:'ST',M:'CM',MF:'CM',FB:'RB'}[position] || position);
const rawArchive = Object.entries({...RAW1,...RAW2,...RAW3,...RAW4,...RAW5}).flatMap(([key, squad], groupIndex) => {
  const [clubId, yearText] = key.split('|');
  if (!clubNames[clubId]) return [];
  const year = Number(yearText) >= 90 ? 1900 + Number(yearText) : 2000 + Number(yearText);
  const season = `${year}/${String((year + 1) % 100).padStart(2,'0')}`;
  return squad.map((record, cardIndex) => {
    const [name, positionText, ratingText] = record.split('|');
    const positions = positionText.split('/').map(normalizePosition);
    return { id:`${slug(name)}-${clubId}-${year}`, playerId:slug(name), club:clubNames[clubId], season, name, positions, rating:Number(ratingText), prime:0, tier:groupIndex < 120 ? 'A' : 'B', cardIndex };
  });
});
const peakByPlayer = new Map();
for (const player of [...rawArchive,...curatedPlayers]) peakByPlayer.set(player.playerId,Math.max(peakByPlayer.get(player.playerId)||0,player.rating,player.prime||0));
for (const player of rawArchive) player.prime=peakByPlayer.get(player.playerId);

const byCard = new Map();
for (const player of [...rawArchive,...curatedPlayers]) {
  const key=`${player.playerId}|${player.club}|${player.season}`;
  const existing=byCard.get(key);
  if(!existing || player.rating>existing.rating) byCard.set(key,{...player,prime:peakByPlayer.get(player.playerId)});
}
export const players = [...byCard.values()].map(p => ({...p, club: p.club === 'Mallorca' ? 'RCD Mallorca' : p.club}));

export const clubs = [...new Set(players.map(p => p.club))].sort();
export const seasons = [...new Set(players.map(p => p.season))].sort();

export const opponentProfiles = [
  ['Title rival', 91, 90, 91], ['Elite contender', 89, 88, 89], ['Champions League side', 87, 87, 88],
  ['High press', 86, 85, 87], ['Possession side', 85, 87, 84], ['Counter threat', 87, 83, 84],
  ['European hopeful', 84, 84, 85], ['Set-piece specialists', 83, 81, 86], ['Mid-table control', 82, 83, 82],
  ['Direct runners', 84, 79, 81], ['Deep block', 78, 79, 85], ['Technical climbers', 81, 84, 78],
  ['Derby battlers', 81, 80, 82], ['Newly promoted', 79, 78, 78], ['Low-block survivors', 76, 78, 82],
  ['Open-game merchants', 82, 78, 76], ['Relegation scrap', 77, 76, 79], ['Youth project', 79, 80, 75],
  ['Final-day fighters', 78, 77, 78]
].map(([name, attack, midfield, defence], i) => ({ id: i + 1, name, attack, midfield, defence, goalkeeping: Math.round((defence + midfield) / 2) }));

export const formations = {
  '4-3-3': ['GK','RB','CB','CB','LB','CM','CM','CM','RW','ST','LW'],
  '4-4-2': ['GK','RB','CB','CB','LB','RM','CM','CM','LM','ST','ST'],
  '4-2-3-1': ['GK','RB','CB','CB','LB','CDM','CDM','RW','CAM','LW','ST'],
  '3-5-2': ['GK','CB','CB','CB','RWB','CM','CDM','CM','LWB','ST','ST'],
  '4-1-2-1-2': ['GK','RB','CB','CB','LB','CDM','CM','CM','CAM','ST','ST'],
  '5-3-2': ['GK','RWB','CB','CB','CB','LWB','CM','CM','CM','ST','ST']
};

export const positionFamily = pos => pos === 'GK' ? 'gk' : ['RB','LB','CB','RWB','LWB'].includes(pos) ? 'def' : ['CDM','CM','CAM','RM','LM'].includes(pos) ? 'mid' : 'att';
