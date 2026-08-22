import { players, clubs, formations, positionFamily } from './data.js';
import { rngFrom, spinClubSeason, eligibleForSlot, effectiveRating, teamLines, expectedPointsBand, simulateSeason, legacyRating } from './engine.js';

const app = document.querySelector('#app');
const boot = document.querySelector('#boot');
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const modeInfo = {
  archive: ['Open Archive','Every club and era. Build the strongest XI the dial gives you.','◎'],
  club: ['Club Chronicle','Choose one club and draft only from its Spanish top-flight story.','⌂'],
  daily: ['Daily Draft','One shared seed each day. One attempt. Compare fairly.','◇'],
  ranked: ['Ranked Run','Server-issued draws, server simulation, signed result and leaderboard eligibility.','★'],
  blind: ['Blind Scout','Season ratings stay hidden until your XI is locked.','◉'],
  duel: ['Head-to-Head','A live room, the same draws, two independent XIs.','↔'],
  atlas: ['Ratings Atlas','Explore season, Prime, and independent legacy ratings.','▦']
  ,method: ['Method & Sources','See rating evidence, probability logic, calibration limits and ranked integrity.','≋']
};
const fresh = () => ({ screen:'home', mode:'archive', formation:'4-3-3', ratingMode:'season', difficulty:'normal', club:'Barcelona', minYear:1990, lineup:[], offer:null, turn:0, rerolls:1, result:null, seed:String(Date.now()), toast:'', selectedPlayer:null, serverRun:null, verified:false, trophies:[] });
let state = fresh();
let roomState = { code:'', peers:[], connected:false, name:'Manager', progress:{}, send:null, leave:null, role:'host' };

async function api(path, options={}){
  const response=await fetch(path,{...options,headers:{'content-type':'application/json',...(options.headers||{})}});
  const payload=await response.json().catch(()=>({error:{message:'Invalid server response.'}}));
  if(!response.ok)throw new Error(payload.error?.message||`Request failed (${response.status})`);
  return payload;
}

function applyServerRun(run){
  state.serverRun=run;
  state.lineup=(run.picks||[]).map(p=>({slot:p.slot,slotIndex:p.slotIndex,player:p.card}));
  state.offer=run.offer?{club:run.offer.club,season:run.offer.season,players:run.offer.cards,poolSize:run.offer.poolSize}:null;
  state.turn=run.turn||0;
  state.screen=state.lineup.length===11?'review':'draft';
  save();render();
}

function save(){
  const safe = {...state, offer:null, selectedPlayer:null, toast:''};
  localStorage.setItem('la-liga-xi-state-v1', JSON.stringify(safe));
}
function load(){ try { const saved = JSON.parse(localStorage.getItem('la-liga-xi-state-v1')); if(saved) state={...fresh(),...saved,screen:'home'}; } catch {} }
function setState(patch){ state={...state,...patch}; save(); render(); }
function announce(message){ state.toast=message; render(); window.setTimeout(()=>{state.toast='';render()},2200); }

function chrome(content){
  if(state.verified)content=content.replace('Seeded result','✓ Server-verified result');
  content = content
    .replaceAll('Jornada dial', 'Matchday dial')
    .replaceAll('38 jornadas', '38 matches')
    .replaceAll('Simulate 38 jornadas', 'Simulate 38 matches')
    .replaceAll('38-jornada ledger', '38-match ledger')
    .replaceAll('SIX WAYS IN.', 'WAYS TO PLAY.');
  return `<div class="shell"><header class="topbar"><button class="brand" data-action="home" aria-label="La Liga XI home"><span class="brand-mark">XI</span><span class="brand-text display">LA LIGA XI<small>UNOFFICIAL ALL-TIME DRAFT</small></span></button><nav class="top-actions" aria-label="Primary"><button class="nav-button" data-action="leaderboard">Leaderboard</button><button class="nav-button" data-action="profile">Cabinet</button><button class="nav-button" data-action="atlas">Ratings atlas</button><button class="nav-button" data-action="modes">Play</button></nav></header>${content}${state.toast?`<div class="toast" role="status">${esc(state.toast)}</div>`:''}${state.selectedPlayer?drawer(state.selectedPlayer):''}</div>`;
}

function home(){
  return chrome(`<main class="page hero"><section><p class="eyebrow">38 matches. Eleven decisions.</p><h1 class="display">BUILD<br><span>YOUR XI.</span></h1><p class="lede">Spin through Spanish top-flight history, draft one player from each club-season dossier, then test your XI across a complete 38-match campaign.</p><div class="hero-ctas"><button class="primary" data-action="modes">Enter the draft</button><button class="ghost" data-action="atlas">Open ratings atlas</button></div><p class="method-note">Independent fan game. No official crests, kits, portraits, league marks, or publisher ratings are used.</p></section><aside class="dial-stage" aria-label="38-match dial"><div class="dial"><div class="dial-core display">Spin<br>history</div></div><div class="dial-note"><b class="display">VISIBLE ODDS.</b> Every spin explains its eligible pool.</div></aside></main>`);
}

function modes(){
  return chrome(`<main class="page"><div class="section-head"><div><p class="eyebrow">Choose the argument</p><h1 class="display">SIX WAYS IN.</h1></div><p>The loop stays clean: draw a club-season, make one call, fill the tactical board, then survive 38 matches.</p></div><div class="mode-grid">${Object.entries(modeInfo).map(([key,[name,desc,icon]],i)=>`<button class="mode-card ${state.mode===key?'selected':''}" data-mode="${key}" data-index="0${i+1}"><span class="mode-icon">${icon}</span><h3>${name}</h3><p>${desc}</p></button>`).join('')}</div></main>`);
}

function setup(){
  const info=modeInfo[state.mode];
  return chrome(`<main class="page"><div class="section-head"><div><p class="eyebrow">${esc(info[0])}</p><h1 class="display">SET THE RULES.</h1></div><button class="ghost" data-action="modes">← Modes</button></div><div class="setup-layout"><section class="panel"><div class="panel-body"><div class="panel-title">Formation</div><div class="choice-row">${Object.keys(formations).map(f=>`<button class="choice ${state.formation===f?'selected':''}" data-formation="${f}">${f}</button>`).join('')}</div><div class="panel-title">Rating lens</div><div class="choice-row"><button class="choice ${state.ratingMode==='season'?'selected':''}" data-rating-mode="season">Season — that exact campaign</button><button class="choice ${state.ratingMode==='prime'?'selected':''}" data-rating-mode="prime">Prime — career-best card</button></div><div class="panel-title">Difficulty</div><div class="choice-row">${[['easy','Easy · 3 rerolls'],['normal','Normal · 1 reroll'],['hard','Hard · no rerolls']].map(([k,t])=>`<button class="choice ${state.difficulty===k?'selected':''}" data-difficulty="${k}">${t}</button>`).join('')}</div>${state.mode==='club'?`<div class="field"><label for="club">Club chronicle</label><select id="club" data-field="club">${clubs.map(c=>`<option ${state.club===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div>`:''}<div class="field"><label for="era">Earliest season</label><select id="era" data-field="minYear">${[1990,2000,2010,2020].map(y=>`<option value="${y}" ${state.minYear===y?'selected':''}>${y}s onward</option>`).join('')}</select></div><button class="primary big-spin" data-action="start">Start drafting →</button></div></section><aside class="panel"><div class="mini-pitch">${formationSlots(state.formation).map(slot=>`<span class="mini-slot" style="left:${slot.x}%;top:${slot.y}%">${slot.slot}</span>`).join('')}</div><div class="panel-body rules"><div class="rule"><span>Slots</span><b>11</b></div><div class="rule"><span>Season</span><b>38 matches</b></div><div class="rule"><span>Maximum</span><b>114 points</b></div><div class="rule"><span>Duplicate identity</span><b>Blocked</b></div><div class="rule"><span>Draws</span><b>Legal pools only</b></div></div></aside></div></main>`);
}

function formationSlots(name){
  const slots=formations[name]; const groups={gk:[],def:[],mid:[],att:[]}; slots.forEach((slot,index)=>groups[positionFamily(slot)].push({slot,index}));
  const ys={gk:88,def:67,mid:43,att:18}; const output=[];
  Object.entries(groups).forEach(([family,items])=>items.forEach((item,i)=>output.push({...item,x:(i+1)*100/(items.length+1),y:ys[family]})));
  return output.sort((a,b)=>a.index-b.index);
}
function openSlotEntries(){ return formations[state.formation].map((slot,slotIndex)=>({slot,slotIndex})).filter(entry=>!state.lineup.some(p=>p.slotIndex===entry.slotIndex)); }
function openSlots(){ return openSlotEntries().map(x=>x.slot); }
function filters(){return {club:state.mode==='club'?state.club:null,minYear:state.minYear};}
function currentCandidates(){
  if(!state.offer)return[]; const ids=state.lineup.map(p=>p.player.playerId); const slots=openSlots();
  return state.offer.players.filter(p=>slots.some(slot=>eligibleForSlot(p,slot,ids))).sort((a,b)=>(state.ratingMode==='prime'?b.prime-a.prime:b.rating-a.rating));
}
async function spin(){
  if(state.mode==='ranked'){
    try{const payload=await api(`/api/v1/runs/${state.serverRun.id}/spin`,{method:'POST',body:JSON.stringify({expectedVersion:state.serverRun.version})});applyServerRun(payload.run);}
    catch(error){announce(error.message)}
    return;
  }
  const random=rngFrom(`${state.seed}|spin|${state.turn}|${state.rerolls}`); const spun=spinClubSeason(players,openSlots(),state.lineup.map(p=>p.player.playerId),filters(),random);
  if(!spun)return announce('No legal club-seasons remain for this rule set.');
  state.offer={...spun.result,poolSize:spun.poolSize}; state.turn++; save(); render();
  requestAnimationFrame(()=>document.querySelector('.round-dial')?.classList.add('spinning'));
}
async function choosePlayer(id){
  if(state.mode==='ranked'){
    try{const payload=await api(`/api/v1/runs/${state.serverRun.id}/pick`,{method:'POST',body:JSON.stringify({expectedVersion:state.serverRun.version,cardId:id})});applyServerRun(payload.run);}
    catch(error){announce(error.message)}
    return;
  }
  const player=currentCandidates().find(p=>p.id===id); if(!player)return;
  const remaining=openSlotEntries().map(entry=>({...entry,score:effectiveRating(player,entry.slot,state.ratingMode)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  if(!remaining.length)return announce('That player cannot fill a remaining slot.');
  state.lineup=[...state.lineup,{slot:remaining[0].slot,slotIndex:remaining[0].slotIndex,player}]; state.offer=null;
  if(roomState.send) roomState.send({type:'progress',name:roomState.name,picks:state.lineup.length});
  if(state.lineup.length===11){ state.screen='review'; }
  save(); render();
}
function reroll(){ if(state.rerolls<=0)return; state.rerolls--; state.offer=null; save(); spin(); }

function draft(){
  const candidates=currentCandidates(); const lines=state.lineup.length?teamLines(state.lineup,state.ratingMode):{goalkeeping:0,defence:0,midfield:0,attack:0,overall:0,balance:0}; const band=state.lineup.length>=4?expectedPointsBand(lines):null;
  return chrome(`<main class="page"><div class="section-head"><div><p class="eyebrow">${esc(modeInfo[state.mode][0])} · pick ${state.lineup.length+1}/11</p><h1 class="display">DRAFT ARENA.</h1></div><button class="ghost" data-action="restart">Restart</button></div><div class="draft-grid"><aside class="panel jornada-panel"><div class="panel-body"><div class="panel-title">Jornada dial · ${38-state.lineup.length} ticks alive</div><div class="round-dial"><strong class="display">${String(state.lineup.length+1).padStart(2,'0')}</strong><span>decision</span></div><div class="spin-meta">${state.offer?`${state.offer.poolSize} legal club-seasons were eligible. Uniform draw; ratings never weight the dial.`:`The dial excludes squads that cannot fill an open role.`}</div><button class="primary big-spin" data-action="spin" ${state.offer?'disabled':''}>${state.offer?'Dossier opened':'Spin legal pool'}</button>${state.offer&&state.rerolls>0?`<button class="ghost big-spin" data-action="reroll">Reroll · ${state.rerolls} left</button>`:''}</div></aside><section><div aria-live="polite">${state.offer?`<article class="dossier"><span class="stamp">CLUB-SEASON DOSSIER</span><h2 class="display">${esc(state.offer.club)}</h2><p>${esc(state.offer.season)} · ${candidates.length} eligible players</p></article><div class="candidates">${candidates.map(playerCard).join('')}</div>`:`<div class="empty-dossier"><div><b>NO DOSSIER ON THE DESK</b><p>Spin when you are ready to make the next call.</p></div></div>`}</div></section><aside class="panel squad-panel"><div class="pitch">${formationSlots(state.formation).map(slot=>{const exact=state.lineup.find(p=>p.slotIndex===slot.index);return `<button class="pitch-slot ${exact?'filled':''}" style="left:${slot.x}%;top:${slot.y}%" ${exact?`data-player="${exact.player.id}"`:''}><span><b>${exact?esc(exact.player.name):slot.slot}</b><small>${exact?`${slot.slot} · ${state.difficulty==='hard'||state.mode==='blind'?'??':effectiveRating(exact.player,slot.slot,state.ratingMode)}`:'OPEN'}</small></span></button>`}).join('')}</div><div class="panel-body"><div class="meters">${[['GK',lines.goalkeeping],['DEF',lines.defence],['MID',lines.midfield],['ATT',lines.attack]].map(([n,v])=>`<div class="meter"><b>${v?Math.round(v):'—'}</b><span>${n}</span></div>`).join('')}</div><div class="draft-log">OVR ${lines.overall?Math.round(lines.overall):'—'} · Balance ${lines.balance?Math.round(lines.balance):'—'}${band?` · forecast ${band[0]}–${band[1]} pts`:''}<br>${state.lineup.slice(-3).map(p=>esc(p.player.name)).join(' · ')||'No selections yet'}</div></div></aside></div></main>`);
}
function playerCard(p){
  const visible=state.difficulty!=='hard'&&state.mode!=='blind'; const rating=state.ratingMode==='prime'?p.prime:p.rating; const slots=openSlots().filter(s=>effectiveRating(p,s,state.ratingMode)>0).sort((a,b)=>effectiveRating(p,b,state.ratingMode)-effectiveRating(p,a,state.ratingMode));
  return `<button class="player-card" data-pick="${p.id}"><span class="rating display">${visible?rating:'??'}</span><h3>${esc(p.name)}</h3><p>${esc(p.club)} · ${esc(p.season)}</p><div class="tags">${p.positions.map(x=>`<span class="tag">${x}</span>`).join('')}<span class="tag fit">best open: ${slots[0]||'—'}</span></div><span class="sr-only">Select ${esc(p.name)}, ${esc(p.season)}, rating ${visible?rating:'hidden'}</span></button>`;
}

function review(){
  const lines=teamLines(state.lineup,state.ratingMode), band=expectedPointsBand(lines);
  return chrome(`<main class="page"><div class="section-head"><div><p class="eyebrow">XI locked · forecast ${band[0]}–${band[1]} points</p><h1 class="display">THE TEAM SHEET.</h1></div><button class="ghost" data-action="restart">Discard XI</button></div><div class="setup-layout"><section class="panel"><div class="pitch">${formationSlots(state.formation).map(slot=>{const p=state.lineup.find(x=>x.slotIndex===slot.index);return `<button class="pitch-slot filled" data-player="${p.player.id}" style="left:${slot.x}%;top:${slot.y}%"><span><b>${esc(p.player.name)}</b><small>${p.slot} · ${effectiveRating(p.player,p.slot,state.ratingMode)}</small></span></button>`}).join('')}</div></section><aside class="panel"><div class="panel-body"><div class="panel-title">Independent strength model</div><div class="rules">${Object.entries(lines).map(([k,v])=>`<div class="rule"><span>${esc(k)}</span><b>${Math.round(v)}</b></div>`).join('')}</div><p class="method-note">The forecast is a range, not a promise. Ratings, positional fit, line balance, home advantage, opponent profiles and seeded Poisson scorelines all affect the run.</p><button class="primary big-spin" data-action="simulate">Simulate 38 jornadas</button></div></aside></div></main>`);
}
async function doSimulate(){
  if(state.mode==='ranked'){
    try{const payload=await api(`/api/v1/runs/${state.serverRun.id}/lock`,{method:'POST',body:JSON.stringify({expectedVersion:state.serverRun.version})});const cosmetic=simulateSeason(state.lineup,state.ratingMode,payload.result.seed);state.result={...cosmetic,...payload.result,goldenBoot:cosmetic.goldenBoot,playerOfSeason:cosmetic.playerOfSeason};state.verified=true;state.trophies=payload.trophies||[];state.screen='result';save();render();}
    catch(error){announce(error.message)}
    return;
  }
  const seed=state.mode==='daily'?new Date().toISOString().slice(0,10):`${state.seed}|season|${Date.now()}`; state.result=simulateSeason(state.lineup,state.ratingMode,seed);state.screen='result';save();render();if(roomState.send)roomState.send({type:'result',name:roomState.name,points:state.result.points,record:`${state.result.wins}-${state.result.draws}-${state.result.losses}`});
}
function result(){
  const r=state.result; return chrome(`<main class="page"><div class="section-head"><div><p class="eyebrow">Seeded result · ${esc(state.formation)} · ${esc(state.ratingMode)}</p><h1 class="display">SEASON COMPLETE.</h1></div></div><div class="result-hero"><section class="scoreboard"><div class="record display">${r.wins}-${r.draws}-${r.losses}</div><div class="points">${r.points} / 114 POINTS</div><div class="scoreboard-grid"><div><b>${r.finish}${r.finish===1?'st':r.finish===2?'nd':r.finish===3?'rd':'th'}</b><span>finish</span></div><div><b>${r.goalsFor}</b><span>goals for</span></div><div><b>${r.goalsAgainst}</b><span>against</span></div><div><b>${Math.round(r.lines.overall)}</b><span>overall</span></div><div><b>${Math.round(r.lines.balance)}</b><span>balance</span></div><div><b>${r.seed.slice(-8)}</b><span>seed proof</span></div></div></section><aside class="panel"><div class="panel-body"><div class="panel-title">38-jornada ledger</div><div class="timeline">${r.matches.map(m=>`<button class="match ${m.result}" title="J${m.jornada}: ${m.goalsFor}-${m.goalsAgainst} vs ${m.opponent}">${m.result}</button>`).join('')}</div><div class="awards"><div class="award"><span>Golden Boot</span><b>${esc(r.goldenBoot.player.name)}</b><p>${r.goldenBoot.goals} goals</p></div><div class="award"><span>Player of season</span><b>${esc(r.playerOfSeason.player.name)}</b><p>${r.playerOfSeason.goals}G · ${r.playerOfSeason.assists}A</p></div></div><div class="result-actions"><button class="primary" data-action="share">Copy result</button><button class="ghost" data-action="restart">Draft again</button><button class="ghost" data-action="home">Home</button></div></div></aside></div></main>`);
}

function atlas(){
  const q=state.atlasQuery||'', club=state.atlasClub||'', pos=state.atlasPos||''; const list=players.filter(p=>(!q||p.name.toLowerCase().includes(q.toLowerCase()))&&(!club||p.club===club)&&(!pos||p.positions.includes(pos))).slice(0,180);
  return chrome(`<main class="page"><div class="section-head"><div><p class="eyebrow">Transparent rating layers</p><h1 class="display">RATINGS ATLAS.</h1></div><p>Season is the selected campaign. Prime is the best card in our starter archive. Legacy blends a player’s best three archived seasons.</p></div><div class="atlas-toolbar"><input aria-label="Search players" placeholder="Search a player" value="${esc(q)}" data-atlas="query"><select aria-label="Filter club" data-atlas="club"><option value="">All clubs</option>${clubs.map(c=>`<option ${club===c?'selected':''}>${esc(c)}</option>`).join('')}</select><select aria-label="Filter position" data-atlas="pos"><option value="">All positions</option>${['GK','RB','CB','LB','CDM','CM','CAM','RW','ST','LW'].map(p=>`<option ${pos===p?'selected':''}>${p}</option>`).join('')}</select></div><div class="atlas-wrap"><table class="atlas-table"><thead><tr><th>Player</th><th>Club-season</th><th>Role</th><th>Season</th><th>Prime</th><th>Legacy</th></tr></thead><tbody>${list.map(p=>`<tr data-player="${p.id}" tabindex="0"><td><b>${esc(p.name)}</b></td><td>${esc(p.club)} · ${p.season}</td><td>${p.positions.join(' / ')}</td><td>${p.rating}</td><td>${p.prime}</td><td>${legacyRating(p.playerId,players)}</td></tr>`).join('')}</tbody></table></div><p class="method-note">Starter archive: independent editorial ratings for gameplay, with confidence tier A or B. They are not official La Liga, club, player-association, or video-game publisher ratings.</p></main>`);
}
function drawer(p){
  const history=players.filter(x=>x.playerId===p.playerId).sort((a,b)=>a.season.localeCompare(b.season));
  return `<div class="drawer-backdrop" data-action="close-drawer"><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="player-title"><button class="drawer-close" data-action="close-drawer" aria-label="Close">×</button><p class="eyebrow">Player rating dossier</p><h2 id="player-title" class="display">${esc(p.name)}</h2><p>${p.positions.join(' · ')} · Prime ${p.prime} · Legacy ${legacyRating(p.playerId,players)}</p><div class="history">${history.map(h=>`<div class="history-row"><b>${esc(h.club)}</b><span>${h.season}</span><strong>${h.rating}</strong></div>`).join('')}</div><div class="method-note"><b>How to read this</b><p>Season rating describes that club campaign. Prime is the highest independent rating attached to the player. Legacy is 70% peak, 20% next-best and 10% third-best available card. Sparse history falls back to the known card and is labelled as an editorial estimate.</p></div></aside></div>`;
}

let leaderboardData=null,profileData=null,remoteError='';
function leaderboardScreen(){
  const rows=leaderboardData?.entries||[];
  return chrome(`<main class="page"><div class="section-head"><div><p class="eyebrow">Ranked runs only · server-verified</p><h1 class="display">LEADERBOARD.</h1></div><p>Ordered by points, wins, goal difference, then earliest completion. Browser-submitted scores never enter this table.</p></div>${remoteError?`<div class="panel"><div class="panel-body">${esc(remoteError)}</div></div>`:!leaderboardData?`<div class="empty-dossier"><b>Loading verified runs…</b></div>`:`<div class="atlas-wrap"><table class="atlas-table"><thead><tr><th>Rank</th><th>Manager</th><th>Result</th><th>XI</th><th>Rules</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td><b>${i+1}</b></td><td>${esc(r.display_name||'Manager')} <span class="verified">✓ server</span></td><td><b>${r.points}</b> pts · ${r.wins}-${r.draws}-${r.losses} · ${r.goal_difference>0?'+':''}${r.goal_difference}</td><td>${r.xi_rating}</td><td>${esc(r.formation)} · ${esc(r.rating_mode)}</td></tr>`).join('')||`<tr><td colspan="5">No verified seasons yet. The first ranked run sets the board.</td></tr>`}</tbody></table></div>`}</main>`);
}
async function loadLeaderboard(){try{remoteError='';leaderboardData=await api('/api/v1/leaderboard');render()}catch(error){remoteError=error.message;leaderboardData={entries:[]};render()}}

const trophyNames={first_whistle:'First Whistle',century_club:'Century Club',unbeaten:'Unbeaten',perfect_114:'Perfect 114',iron_curtain:'Iron Curtain',era_mixer:'Era Mixer'};
function profileScreen(){
  const trophies=profileData?.trophies||[],runs=profileData?.runs||[];
  return chrome(`<main class="page"><div class="section-head"><div><p class="eyebrow">Your verified history</p><h1 class="display">TROPHY CABINET.</h1></div><p>No account is needed for casual play. Sign in with ChatGPT to save server-authoritative ranked runs.</p></div>${remoteError?`<div class="panel"><div class="panel-body"><p>${esc(remoteError)}</p><a class="primary inline-link" href="/signin-with-chatgpt?return_to=%2F">Sign in with ChatGPT</a></div></div>`:!profileData?`<div class="empty-dossier"><b>Opening your cabinet…</b></div>`:`<div class="profile-grid"><section class="panel"><div class="panel-body"><div class="panel-title">Manager profile</div><div class="field"><label for="display-name">Display name</label><input id="display-name" maxlength="24" value="${esc(profileData.profile.display_name)}"></div><button class="ghost" data-action="save-profile">Save name</button><a class="nav-button inline-link" href="/signout-with-chatgpt?return_to=%2F">Sign out</a></div></section><section class="panel"><div class="panel-body"><div class="panel-title">What your XI has proved</div><div class="trophy-grid">${Object.entries(trophyNames).map(([id,name])=>{const won=trophies.find(t=>t.trophy_id===id);return `<article class="trophy ${won?'earned':''}"><span>${won?'◆':'◇'}</span><b>${name}</b><small>${won?`Earned ${new Date(won.earned_at).toLocaleDateString()}`:'Locked'}</small></article>`}).join('')}</div></div></section></div><section class="panel recent-runs"><div class="panel-body"><div class="panel-title">Recent verified seasons</div>${runs.map(r=>`<div class="run-row"><b>${r.points} pts</b><span>${r.wins}-${r.draws}-${r.losses}</span><span>${r.formation} · ${r.rating_mode}</span></div>`).join('')||'<p>Complete a Ranked Run to begin your history.</p>'}</div></section>`}</main>`);
}
async function loadProfile(){try{remoteError='';profileData=await api('/api/v1/me');render()}catch(error){remoteError=error.message;profileData=null;render()}}

function methodology(){
  return chrome(`<main class="page"><div class="section-head"><div><p class="eyebrow">Methodology · engine ${esc('2.0')}</p><h1 class="display">SHOW THE WORK.</h1></div><p>A strong XI improves the range; it never guarantees a result.</p></div><div class="method-grid"><section class="panel"><div class="panel-body"><div class="panel-title">Ratings</div><p>Season ratings are independent editorial estimates for a specific club campaign. Career peak is the highest represented season. Legacy is 70% best, 20% second and 10% third.</p><p><b>Current evidence status:</b> partial editorial archive. It is not yet a complete, statistically sourced La Liga database.</p></div></section><section class="panel"><div class="panel-body"><div class="panel-title">Season engine</div><p>Formation-adjusted player ratings form goalkeeper, defence, midfield and attack units. Unit gaps create a balance penalty. Home advantage and opponent profiles produce expected goals, then a seeded correlated-Poisson model creates each score.</p></div></section><section class="panel"><div class="panel-body"><div class="panel-title">Ranked integrity</div><p>The server owns every ranked draw, validates every card and slot, blocks duplicate identities, simulates the season and stores a signed receipt. LocalStorage and browser-edited scores cannot enter the leaderboard.</p></div></section><section class="panel"><div class="panel-body"><div class="panel-title">Source ledger</div><p>CC0 OpenFootball results are the calibration base. The public Wyscout 2017/18 event set is used for validation with attribution. Older cards stay labelled editorial until a licensed, redistribution-safe player dataset is secured.</p><a href="https://github.com/fr3ddykru3g3r/la-liga-38-0/blob/main/data/sources.json" target="_blank" rel="noreferrer">Open source ledger →</a></div></section></div></main>`);
}

function multiplayer(){
  return chrome(`<main class="page"><div class="section-head"><div><p class="eyebrow">Peer room · casual host authority</p><h1 class="display">HEAD-TO-HEAD.</h1></div><p>Same legal draw sequence, separate picks, results revealed when each manager finishes. No account required.</p></div><div class="room"><section class="panel"><div class="panel-body"><div class="field"><label for="manager">Manager name</label><input id="manager" maxlength="24" value="${esc(roomState.name)}" data-room="name"></div><div class="field"><label for="room-code">Room code</label><input id="room-code" maxlength="6" value="${esc(roomState.code)}" data-room="code" placeholder="CORTES"></div><div class="choice-row"><button class="primary" data-action="create-room">Create room</button><button class="ghost" data-action="join-room">Join room</button></div><p class="method-note">Network rooms use encrypted WebRTC data channels with a public signalling layer when available. A same-device BroadcastChannel fallback is included for testing. This casual mode validates deterministic draws on every peer; it is not a ranked anti-cheat service.</p></div></section><aside class="panel"><div class="panel-body"><div class="panel-title">Room</div><div class="room-code display">${roomState.code||'------'}</div><div class="peer-list"><div class="peer"><b>${esc(roomState.name)}</b><span class="status-dot">● ${roomState.connected?'ready':'offline'}</span></div>${roomState.peers.map(p=>`<div class="peer"><b>${esc(p)}</b><span>${roomState.progress[p]?.points??`${roomState.progress[p]?.picks||0}/11`}</span></div>`).join('')}</div><button class="primary big-spin" data-action="start-duel" ${!roomState.connected?'disabled':''}>Enter shared draft</button></div></aside></div></main>`);
}

async function connectRoom(role){
  roomState.name=(document.querySelector('[data-room="name"]')?.value||'Manager').slice(0,24); roomState.code=(document.querySelector('[data-room="code"]')?.value||Math.random().toString(36).slice(2,8)).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6); roomState.role=role;
  const channel=new BroadcastChannel(`la-liga-xi-${roomState.code}`); const receive=payload=>onRoomMessage(payload); channel.onmessage=e=>receive(e.data); roomState.send=payload=>channel.postMessage(payload); roomState.leave=()=>channel.close(); roomState.connected=true;
  roomState.send({type:'hello',name:roomState.name}); render();
  try{
    const {default:Peer}=await import('https://esm.sh/peerjs@1.5.5?bundle');
    const peer=role==='host'?new Peer(`jxi-${roomState.code.toLowerCase()}`):new Peer(); const connections=[];
    const wire=conn=>{connections.push(conn);conn.on('data',data=>onRoomMessage(data));conn.on('open',()=>{roomState.send({type:'hello',name:roomState.name});render()})};
    if(role==='host')peer.on('connection',wire);else peer.on('open',()=>wire(peer.connect(`jxi-${roomState.code.toLowerCase()}`,{reliable:true})));
    const localSend=roomState.send;roomState.send=payload=>{localSend(payload);connections.filter(c=>c.open).forEach(c=>c.send(payload))};
    const oldLeave=roomState.leave;roomState.leave=()=>{oldLeave();connections.forEach(c=>c.close());peer.destroy()};
  }catch{ announce('Online signalling unavailable; local room fallback is ready.'); }
  roomState.send({type:'hello',name:roomState.name}); render();
}
function onRoomMessage(msg){
  if(!msg||typeof msg!=='object')return;
  if(msg.type==='hello'&&msg.name!==roomState.name){const name=String(msg.name).slice(0,24),isNew=!roomState.peers.includes(name);roomState.peers=[...new Set([...roomState.peers,name])];if(isNew)roomState.send?.({type:'hello',name:roomState.name});}
  if(msg.type==='progress')roomState.progress[msg.name]={picks:Number(msg.picks)||0};
  if(msg.type==='result')roomState.progress[msg.name]={points:`${Number(msg.points)||0} pts · ${String(msg.record).slice(0,12)}`};
  render();
}

function render(){
  let html; if(state.screen==='home')html=home();else if(state.screen==='modes')html=modes();else if(state.screen==='setup')html=setup();else if(state.screen==='draft')html=draft();else if(state.screen==='review')html=review();else if(state.screen==='result')html=result();else if(state.screen==='atlas')html=atlas();else if(state.screen==='multiplayer')html=multiplayer();else if(state.screen==='leaderboard')html=leaderboardScreen();else if(state.screen==='profile')html=profileScreen();else if(state.screen==='methodology')html=methodology();else html=home(); app.innerHTML=html;app.hidden=false;
}

app.addEventListener('click', async event=>{
  const el=event.target.closest('button,[data-mode],[data-player],[data-pick],tr[data-player]'); if(!el)return;
  const action=el.dataset.action;
  if(action==='home')setState({screen:'home',selectedPlayer:null});
  if(action==='modes')setState({screen:'modes',selectedPlayer:null});
  if(action==='atlas')setState({screen:'atlas',selectedPlayer:null});
  if(action==='leaderboard'){leaderboardData=null;remoteError='';setState({screen:'leaderboard',selectedPlayer:null});await loadLeaderboard();}
  if(action==='profile'){profileData=null;remoteError='';setState({screen:'profile',selectedPlayer:null});await loadProfile();}
  if(action==='methodology')setState({screen:'methodology',selectedPlayer:null});
  if(el.dataset.mode){ if(el.dataset.mode==='atlas')setState({screen:'atlas',mode:'atlas'});else if(el.dataset.mode==='method')setState({screen:'methodology',mode:'method'});else if(el.dataset.mode==='duel')setState({screen:'multiplayer',mode:'duel'});else setState({screen:'setup',mode:el.dataset.mode}); }
  if(el.dataset.formation)setState({formation:el.dataset.formation});
  if(el.dataset.ratingMode)setState({ratingMode:el.dataset.ratingMode});
  if(el.dataset.difficulty)setState({difficulty:el.dataset.difficulty,rerolls:el.dataset.difficulty==='easy'?3:el.dataset.difficulty==='normal'?1:0});
  if(action==='start'){
    if(state.mode==='ranked'){
      try{const payload=await api('/api/v1/runs',{method:'POST',body:JSON.stringify({mode:'ranked_archive',formation:state.formation,ratingMode:state.ratingMode,club:null,minYear:state.minYear})});applyServerRun(payload.run);}
      catch(error){announce(error.message)}
    }else{const seed=state.mode==='daily'?new Date().toISOString().slice(0,10):String(Date.now());setState({screen:'draft',lineup:[],offer:null,turn:0,result:null,seed,verified:false,trophies:[]});}
  }
  if(action==='spin')await spin(); if(action==='reroll')reroll(); if(el.dataset.pick)await choosePlayer(el.dataset.pick);
  if(el.dataset.player){ const p=players.find(x=>x.id===el.dataset.player);if(p)setState({selectedPlayer:p}); }
  if(action==='close-drawer'){ event.stopPropagation();setState({selectedPlayer:null}); }
  if(action==='restart'){ if(confirm('Discard this run and return to setup?'))setState({...fresh(),screen:'setup',mode:state.mode,formation:state.formation,ratingMode:state.ratingMode,difficulty:state.difficulty,club:state.club,minYear:state.minYear}); }
  if(action==='simulate')await doSimulate();
  if(action==='share'){ const text=`LA LIGA XI — ${state.result.points}/114 pts, ${state.result.wins}-${state.result.draws}-${state.result.losses}, ${state.formation}, ${state.ratingMode} ratings.`; await navigator.clipboard?.writeText(text);announce('Result copied to clipboard.'); }
  if(action==='save-profile'){try{await api('/api/v1/me',{method:'PATCH',body:JSON.stringify({displayName:document.querySelector('#display-name')?.value})});await loadProfile();announce('Profile updated.')}catch(error){announce(error.message)}}
  if(action==='create-room')await connectRoom('host'); if(action==='join-room')await connectRoom('guest');
  if(action==='start-duel'){ state.mode='duel';state.screen='setup';state.seed=`duel|${roomState.code}`;render(); }
});
app.addEventListener('change',event=>{const el=event.target;if(el.dataset.field)setState({[el.dataset.field]:el.dataset.field==='minYear'?Number(el.value):el.value});if(el.dataset.atlas==='club'){state.atlasClub=el.value;render()}if(el.dataset.atlas==='pos'){state.atlasPos=el.value;render()}if(el.dataset.room==='name')roomState.name=el.value;if(el.dataset.room==='code')roomState.code=el.value.toUpperCase();});
app.addEventListener('input',event=>{if(event.target.dataset.atlas==='query'){state.atlasQuery=event.target.value;render();}});
app.addEventListener('keydown',event=>{const row=event.target.closest('tr[data-player]');if(row&&(event.key==='Enter'||event.key===' ')){event.preventDefault();const p=players.find(x=>x.id===row.dataset.player);if(p)setState({selectedPlayer:p});}});

load();
Promise.race([document.fonts?.ready||Promise.resolve(),new Promise(r=>setTimeout(r,1800))]).then(()=>{document.documentElement.classList.remove('fonts-loading');document.documentElement.classList.add('fonts-ready');boot.remove();render();});
