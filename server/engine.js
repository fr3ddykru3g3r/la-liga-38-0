export const ENGINE_VERSION = 'laliga-xi-2.0';

export const formations = {
  '4-3-3':['GK','RB','CB','CB','LB','CM','CM','CM','RW','ST','LW'],
  '4-4-2':['GK','RB','CB','CB','LB','RM','CM','CM','LM','ST','ST'],
  '4-2-3-1':['GK','RB','CB','CB','LB','CDM','CDM','RW','CAM','LW','ST'],
  '4-5-1':['GK','RB','CB','CB','LB','RM','CM','CDM','CM','LM','ST'],
  '4-1-4-1':['GK','RB','CB','CB','LB','CDM','RM','CM','CM','LM','ST'],
  '4-3-1-2':['GK','RB','CB','CB','LB','CM','CDM','CM','CAM','ST','ST'],
  '4-1-2-1-2':['GK','RB','CB','CB','LB','CDM','CM','CM','CAM','ST','ST'],
  '4-4-1-1':['GK','RB','CB','CB','LB','RM','CM','CM','LM','CAM','ST'],
  '4-2-2-2':['GK','RB','CB','CB','LB','CDM','CDM','CAM','CAM','ST','ST'],
  '3-4-3':['GK','CB','CB','CB','RM','CM','CM','LM','RW','ST','LW'],
  '3-5-2':['GK','CB','CB','CB','RWB','CM','CDM','CM','LWB','ST','ST'],
  '5-4-1':['GK','RWB','CB','CB','CB','LWB','RM','CM','CM','LM','ST'],
  '5-3-2':['GK','RWB','CB','CB','CB','LWB','CM','CM','CM','ST','ST'],
};

const opponents = [
  ['Title rival',91,90,91],['Elite contender',89,88,89],['Champions League side',87,87,88],['High press',86,85,87],['Possession side',85,87,84],['Counter threat',87,83,84],['European hopeful',84,84,85],['Set-piece specialists',83,81,86],['Mid-table control',82,83,82],['Direct runners',84,79,81],['Deep block',78,79,85],['Technical climbers',81,84,78],['Derby battlers',81,80,82],['Newly promoted',79,78,78],['Low-block survivors',76,78,82],['Open-game merchants',82,78,76],['Relegation scrap',77,76,79],['Youth project',79,80,75],['Final-day fighters',78,77,78],
].map(([name,attack,midfield,defence])=>({name,attack,midfield,defence}));

export const family = p => p==='GK'?'gk':['RB','LB','CB','RWB','LWB'].includes(p)?'def':['CDM','CM','CAM','RM','LM'].includes(p)?'mid':'att';
export function fit(card,slot){const i=card.positions.indexOf(slot);if(i===0)return 1;if(i===1)return .98;if(i>1)return .96;return card.positions.some(p=>family(p)===family(slot)) ? 0.91 : 0;}
export const effective = (card,slot,mode='season') => Math.round((mode==='prime'?card.prime:card.rating)*fit(card,slot));

function hash32(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0;}
export function rng(seed){let a=hash32(seed)||1;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function poisson(lambda,random){const limit=Math.exp(-Math.max(.01,lambda));let product=1,count=0;do{count++;product*=random()}while(product>limit&&count<14);return count-1;}

export function lineStrength(picks,mode){const g={gk:[],def:[],mid:[],att:[]};for(const p of picks)g[family(p.slot)].push(effective(p.card,p.slot,mode));const mean=x=>x.reduce((a,b)=>a+b,0)/x.length;const lines={goalkeeping:mean(g.gk),defence:mean(g.def),midfield:mean(g.mid),attack:mean(g.att)};lines.overall=.12*lines.goalkeeping+.29*lines.defence+.30*lines.midfield+.29*lines.attack;lines.balance=Math.min(lines.goalkeeping,lines.defence,lines.midfield,lines.attack);return Object.fromEntries(Object.entries(lines).map(([k,v])=>[k,Math.round(v*10)/10]));}

export function simulate(picks,mode,seed){const random=rng(seed),lines=lineStrength(picks,mode),schedule=opponents.flatMap(o=>[{o,home:true},{o,home:false}]);for(let i=schedule.length-1;i;i--){const j=Math.floor(random()*(i+1));[schedule[i],schedule[j]]=[schedule[j],schedule[i]]}let wins=0,draws=0,losses=0,gfTotal=0,gaTotal=0;const matches=schedule.map(({o,home},i)=>{const edge=home?.10:-.10,pen=Math.max(0,lines.overall-lines.balance)*.012;const xf=Math.max(.18,Math.min(4.4,Math.exp(Math.log(1.34)+.019*(lines.attack-o.defence)+.007*(lines.midfield-o.midfield)-pen+edge)));const xa=Math.max(.12,Math.min(3.8,Math.exp(Math.log(1.05)+.018*(o.attack-lines.defence)+.006*(o.midfield-lines.midfield)-.006*(lines.goalkeeping-82)-edge)));const shared=poisson(.08,random),gf=poisson(Math.max(.05,xf-.08),random)+shared,ga=poisson(Math.max(.05,xa-.08),random)+shared;gfTotal+=gf;gaTotal+=ga;const result=gf>ga?'W':gf===ga?'D':'L';if(result==='W')wins++;else if(result==='D')draws++;else losses++;return{match:i+1,opponent:o.name,home,goalsFor:gf,goalsAgainst:ga,result,xgFor:+xf.toFixed(2),xgAgainst:+xa.toFixed(2)}});return{seed,lines,matches,wins,draws,losses,goalsFor:gfTotal,goalsAgainst:gaTotal,goalDifference:gfTotal-gaTotal,points:wins*3+draws,finish:wins*3+draws>=86?1:wins*3+draws>=76?2:wins*3+draws>=68?4:wins*3+draws>=59?6:wins*3+draws>=50?9:wins*3+draws>=42?14:18};}

export function legalGroups(cards,slots,picks,filters={}){const used=new Set(picks.map(p=>p.card.playerId)),groups=new Map();for(const card of cards){if(used.has(card.playerId)||filters.club&&card.club!==filters.club||filters.minYear&&Number(card.season.slice(0,4))<filters.minYear||!slots.some(s=>fit(card,s)>0))continue;const key=`${card.club}|${card.season}`;if(!groups.has(key))groups.set(key,{club:card.club,season:card.season,cards:[]});groups.get(key).cards.push(card)}return[...groups.values()];}
