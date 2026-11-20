(()=>{
'use strict';
const db=window.PV_DATA||{matches:[]};const matches=db.matches;const upcoming=db.upcomingFixtures||[];const tournaments=db.tournaments||[];const seasons=['All seasons','2026/27','2025/26','2024/25'];const comps=['All competitions','Warkworth Mixed',"Hibiscus Coast Mens",'Hibiscus Coast Mixed','Tournaments',...tournaments.map(t=>t.name)];const $=s=>document.querySelector(s);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const displayPlayerName=name=>name==='Joy Alinese'?'Joy A.':name;
const res=m=>m.gf>m.ga?'W':m.gf<m.ga?'L':'D';const title={overview:'Overview',current:'2026/27',tournaments:'Tournaments',matches:'Match archive',players:'Players',records:'Records',seasons:'Seasons',awards:'Awards'};const state={page:'overview',currentCompetition:'All competitions',season:'All seasons',competition:'All competitions',search:'',sort:'apps',player:'',match:'',opponent:''};const fmtDate=d=>d?new Date(d+'T12:00:00').toLocaleDateString('en-NZ',{day:'numeric',month:'short',year:'numeric'}):'Date not recorded';const playerInitial=n=>n.split(' ').map(x=>x[0]).slice(0,2).join('');
function competitionMatches(m,selected){
 if(selected==='All competitions')return true;
 if(selected==='Tournaments')return !!m.tournamentId||tournaments.some(t=>t.name===m.competition);
 return m.competition===selected;
}
function filtered(ms=matches){return ms.filter(m=>(state.season==='All seasons'||m.season===state.season)&&competitionMatches(m,state.competition))}
function tournamentById(id){return tournaments.find(t=>t.id===id)}
function tournamentMatches(id){return matches.filter(m=>m.tournamentId===id)}
function tournamentFixtures(id){return upcoming.filter(f=>f.tournamentId===id).sort(fixtureOrder)}
function nzToday(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Pacific/Auckland',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function tournamentStatus(t){const games=tournamentMatches(t.id);if(t.date>=nzToday())return 'Upcoming';return games.length?'Results recorded':'Awaiting results'}
function competitionLabel(name){const t=tournaments.find(t=>t.name===name);return t?t.shortName||t.name:name}

function totals(ms){return {played:ms.length,wins:ms.filter(m=>res(m)==='W').length,draws:ms.filter(m=>res(m)==='D').length,losses:ms.filter(m=>res(m)==='L').length,gf:ms.reduce((a,m)=>a+m.gf,0),ga:ms.reduce((a,m)=>a+m.ga,0),cs:ms.filter(m=>m.ga===0).length,apps:ms.reduce((a,m)=>a+m.players.length,0)}}
function allPlayers(ms){const map=new Map();ms.forEach(m=>m.players.forEach(p=>{const v=map.get(p.name)||{name:p.name,apps:0,goals:0,motm:0,played:[]};v.apps++;v.goals+=p.goals;v.motm+=p.motm;v.played.push(m);map.set(p.name,v)}));return [...map.values()]}
function sortedPlayers(ms,field='goals'){return allPlayers(ms).sort((a,b)=>b[field]-a[field]||b.apps-a.apps||a.name.localeCompare(b.name))}
// Approved square squad portraits. Any player without one retains a matching lavender initials tile.
const playerPortraits=Object.freeze({"Cayden Steffener": "images/players/pfp-cayden-steffener.webp", "Christian Collins": "images/players/pfp-christian-collins.webp", "Connagh Webb": "images/players/pfp-connagh-webb.webp", "Connor Passingham": "images/players/pfp-connor-passingham.webp", "Fabiano Jesus": "images/players/pfp-fabiano-jesus.webp", "Jamison Lawrence": "images/players/pfp-jamison-lawrence.webp", "Jesse Attwood": "images/players/pfp-jesse-attwood.webp", "Max Boundy": "images/players/pfp-max-boundy.webp", "Micah Gibson": "images/players/pfp-micah-gibson.webp", "Oliver Graham": "images/players/pfp-oliver-graham.webp", "Taj Oliver": "images/players/pfp-taj-oliver.webp", "Will Turner": "images/players/pfp-will-turner.webp", "William Healey": "images/players/pfp-william-healey.webp"});
// Club debut is the earliest dated appearance across the entire recorded archive,
// regardless of the active season or competition filters. Same-day fixtures share a date.
function recordedDebut(name){
 const appearances=matches.filter(m=>m.date&&m.players.some(p=>p.name===name));
 if(!appearances.length)return null;
 return appearances.reduce((earliest,m)=>m.date<earliest.date?m:earliest);
}
// The goal-drought stat always uses the full recorded archive, independent of filters.
// A match only counts when the player has at least one recorded goal.
function mostRecentGoalMatch(name){
 const scoring=matches.filter(m=>m.date&&m.players.some(p=>p.name===name&&Number(p.goals)>0));
 if(!scoring.length)return null;
 const lastDate=scoring.reduce((latest,m)=>m.date>latest?m.date:latest,scoring[0].date);
 // Multiple games can be recorded on one date with no verified kickoff order.
 // Include every opponent scored against that day rather than guessing which was last.
 return {date:lastDate,opponents:[...new Set(scoring.filter(m=>m.date===lastDate).map(m=>m.opponent))]};
}
// Count calendar days in New Zealand, rather than 24-hour periods, so daylight-saving
// changes and the viewer's computer timezone cannot create off-by-one results.
function daysSinceNZ(date){
 const dateParts=new Intl.DateTimeFormat('en-NZ',{timeZone:'Pacific/Auckland',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const part=type=>Number(dateParts.find(p=>p.type===type).value);
 const today=Date.UTC(part('year'),part('month')-1,part('day'));
 const [year,month,day]=date.split('-').map(Number);
 return Math.max(0,Math.round((today-Date.UTC(year,month-1,day))/86400000));
}
function goalDroughtMetric(name){
 const last=mostRecentGoalMatch(name);
 const hasUndatedScoredGoal=matches.some(m=>!m.date&&m.players.some(p=>p.name===name&&Number(p.goals)>0));
 const label='Days since last goal';
 if(!last)return metric(label,'—',hasUndatedScoredGoal?'Goal date not recorded':'No goals recorded');
 return metric(label,daysSinceNZ(last.date),`Last scored ${esc(fmtDate(last.date))} · ${last.opponents.map(esc).join(' & ')}`);
}
function playerProfileFacts(name){
 const debut=recordedDebut(name);
 const number=db.shirtNumbersBySeason?.['2026/27']?.[name];
 return `<div class="profile-facts" aria-label="Player information">
  <div class="profile-fact"><div class="profile-fact-label">CLUB DEBUT</div><div class="profile-fact-value">${debut?esc(fmtDate(debut.date)):'Not recorded'}</div><div class="profile-fact-note">${debut?`First recorded appearance · ${esc(debut.season)}`:'No dated appearances in the archive'}</div></div>
  <div class="profile-fact profile-fact-number">${Number.isInteger(number)?`
    <img class="profile-shirt-image" src="images/shirts/2026-27/number-${String(number).padStart(2,'0')}.webp" alt="Palmer Violets 2026/27 shirt, number ${number}" loading="lazy" decoding="async">
    <div class="profile-shirt-season">2026/27</div>`:`<div class="profile-fact-label">SHIRT NUMBER</div><div class="profile-fact-value">Not recorded</div><div class="profile-shirt-season">2026/27</div>`}</div>
 </div>`;
}
function portraitHTML(name,detail=false){
 const src=playerPortraits[name];
 return src
  ? `<img class="player-photo${detail?' profile-photo':''}" src="${src}" alt="${detail?'Portrait of '+esc(name):''}" loading="lazy" decoding="async">`
  : `<span class="player-photo-fallback${detail?' profile-photo':''}" aria-hidden="true"><span>${esc(playerInitial(name))}</span></span>`;
}
function playerNameHTML(name){
 name=displayPlayerName(name);
 const idx=name.indexOf(' ');
 const first=idx<0?name:name.slice(0,idx);
 const last=idx<0?'':name.slice(idx+1);
 return `<span class="player-firstname">${esc(first)}</span><span class="player-lastname">${esc(last)}</span>`;
}
function allOpponents(ms){const map=new Map();ms.forEach(m=>{const v=map.get(m.opponentId)||{name:m.opponentId,ms:[]};v.ms.push(m);map.set(m.opponentId,v)});return [...map.values()].sort((a,b)=>b.ms.length-a.ms.length||a.name.localeCompare(b.name))}
function opts(arr,val){return arr.map(s=>`<option value="${esc(s)}" ${s===val?'selected':''}>${esc(s)}</option>`).join('')}
function filtersHTML(search=false){return `<div class="filters"><select class="select" data-filter="season" aria-label="Filter season">${opts(seasons,state.season)}</select><select class="select" data-filter="competition" aria-label="Filter competition">${opts(comps,state.competition)}</select>${search?`<input class="search" data-filter="search" placeholder="Search ${state.page==='players'?'players':'opponents'}..." value="${esc(state.search)}" aria-label="Search">`:''}</div>`}
function metric(label,num,note=''){return `<div class="metric"><div class="metric-label">${label}</div><div class="metric-num">${num}</div>${note?`<div class="metric-note">${note}</div>`:''}</div>`}
function sectionHeading(label,link='',dest=''){return `<div class="section-head"><h2>${label}</h2>${link?`<a class="small-link" href="#${dest}">${link} ↗</a>`:''}</div>`}
function table(headers,rows,empty='No results found'){return `<div class="table-wrap ${headers.length>2?'responsive-table':''}"><table><thead><tr>${headers.map((h,i)=>`<th ${i>0&&['Apps','Goals','MOTM','GF','GA','P','W','D','L','GD','%'].includes(h)?'class="numeric"':''}>${h}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.join(''):`<tr><td colspan="${headers.length}" class="empty">${empty}</td></tr>`}</tbody></table></div>`}
function tag(m){return `<span class="pill ${res(m)}">${res(m)}</span>`}
// Match-list MOTM portraits come from the actual awarded player(s), never MVP vote totals.
// Unconfirmed awards are clearly pending; older matches with no recorded award use a dash.
function matchMotmPortraits(m){
 if(m.motmStatus==='unconfirmed')return '<span class="match-motm-pending">Pending</span>';
 const winners=m.players.filter(p=>Number(p.motm)>0);
 if(!winners.length)return '<span class="match-motm-none" title="No MOTM award recorded">—</span>';
 const names=winners.map(p=>displayPlayerName(p.name)).join(' & ');
 return `<span class="match-motm-photos${winners.length>1?' match-motm-multiple':''}" role="img" aria-label="MOTM: ${esc(names)}" title="MOTM: ${esc(names)}">${winners.map(p=>`<span class="match-motm-photo">${portraitHTML(p.name)}</span>`).join('')}</span>`;
}
function matchRow(m,detail=true){return `<tr ${detail?`class="rowclick" data-match="${esc(m.id)}" title="View match details"`:''}><td class="match-date-col"><span class="muted mini">${esc(fmtDate(m.date))}</span></td><td class="match-opponent-col"><strong>${esc(m.opponent)}</strong><div class="muted mini">${esc(m.season)}${m.tournamentId?` · ${esc(m.phase)}`:m.phase==='Finals'?' · Finals':''}</div></td><td class="match-comp-col"><span class="competition-cell">${esc(competitionLabel(m.competition))}</span></td><td class="match-motm-col">${matchMotmPortraits(m)}</td><td class="match-score-col numeric"><strong>${m.gf}–${m.ga}</strong> &nbsp;${tag(m)}</td></tr>`}
function matchTable(ms,empty='No results found'){
 return `<div class="match-results-table">${table(['DATE','OPPONENT','COMPETITION','MOTM','SCORE'],ms.map(m=>matchRow(m)),empty)}</div>`;
}
// Current opponent names can differ from the name in historical match results.
// Alias only the two confirmed rebrands; the archive keeps the names used then.
function canonicalFixtureOpponent(name){
 const aliases={"Keep Fat '26":'Keep Fat',Oysters:'Matakana FC'};
 return (aliases[name]||name).toLowerCase();
}
function kickoffOrder(f){
 const m=String(f.kickoff||'').match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
 if(!m)return 2400;
 return (Number(m[1])%12+(m[3].toLowerCase()==='pm'?12:0))*60+Number(m[2]);
}
function fixtureOrder(a,b){return a.date.localeCompare(b.date)||kickoffOrder(a)-kickoffOrder(b)||a.competition.localeCompare(b.competition)}
function fixtureCard(f){
 const opponentId=canonicalFixtureOpponent(f.opponent);
 const historical=matches.filter(m=>canonicalFixtureOpponent(m.opponentId)===opponentId||canonicalFixtureOpponent(m.opponent)===opponentId);
 const h=historical.length?totals(historical):null;
 const details=[f.venue?`<span>${esc(f.venue)}</span>`:'',f.kickoff?`<span>${esc(f.kickoff)}</span>`:'',f.field?`<span class="fixture-field" title="Field">Field ${esc(f.field)}</span>`:''].join('');
 return `<article class="fixture-card"><div class="fixture-top"><span class="fixture-comp">${esc(competitionLabel(f.competition))}</span><span class="fixture-date">${esc(fmtDate(f.date))}</span></div><div class="fixture-match"><img src="logo.png" class="fixture-crest" alt="Palmer Violets badge"><div class="fixture-match-copy"><span class="fixture-label">UPCOMING FIXTURE</span><strong>Palmer Violets <span class="vs">vs</span> ${esc(f.opponent)}</strong></div></div>${details?`<div class="fixture-info">${details}</div>`:''}${h?`<div class="fixture-history"><span>PREVIOUS MEETINGS</span><strong>${h.played} played · ${h.wins}W ${h.draws}D ${h.losses}L</strong><span>Goals: ${h.gf}–${h.ga}</span></div>`:''}</article>`;
}
function upcomingSection(){const fixtures=upcoming.filter(f=>(state.season==='All seasons'||f.season===state.season)&&competitionMatches(f,state.competition)).sort(fixtureOrder);return fixtures.length?`${sectionHeading('Upcoming fixtures')}<div class="fixture-grid">${fixtures.map(fixtureCard).join('')}</div>`:''}
function rowPlayer(p,i){return `<tr class="rowclick" data-player="${esc(p.name)}"><td><span class="rank">${String(i+1).padStart(2,'0')}</span><strong>${esc(displayPlayerName(p.name))}</strong></td><td class="numeric">${p.apps}</td><td class="numeric"><strong>${p.goals}</strong></td><td class="numeric">${p.motm}</td></tr>`}
function recordPlayerRow(p,i,field){
 const columns=field==='goals'?['goals','apps','motm']:field==='apps'?['apps','goals','motm']:['motm','apps','goals'];
 return `<tr class="rowclick" data-player="${esc(p.name)}"><td><span class="rank">${String(i+1).padStart(2,'0')}</span><strong>${esc(displayPlayerName(p.name))}</strong></td>${columns.map((key,j)=>`<td class="numeric${j===0?' record-focus':''}">${j===0?`<strong class="record-value">${p[key]}</strong>`:p[key]}</td>`).join('')}</tr>`;
}
function recordPlayerTable(players,field){
 const headers=field==='goals'?['PLAYER','GOALS','APPS','MOTM']:field==='apps'?['PLAYER','APPS','GOALS','MOTM']:['PLAYER','MOTM','APPS','GOALS'];
 return table(headers,players.map((p,i)=>recordPlayerRow(p,i,field)));
}
function seasonGoalBars(){const bySeason=seasons.slice(1).reverse().map(season=>({season,goals:totals(matches.filter(m=>m.season===season)).gf}));const max=Math.max(1,...bySeason.map(x=>x.goals));return bySeason.map(x=>`<div class="chart-line"><span class="label">${esc(x.season)}</span><div class="chart-track"><div class="chart-fill" style="width:${x.goals/max*100}%"></div></div><b>${x.goals}</b></div>`).join('')}
function overview(){const ms=filtered(),t=totals(ms);const current=matches.filter(m=>m.season==='2026/27');const ct=totals(current);const recent=[...ms].sort((a,b)=>(b.date||'0000').localeCompare(a.date||'0000')).slice(0,5);const leaders=sortedPlayers(ms,'goals').slice(0,6);return `<div class="hero"><img class="hero-logo" src="logo.png" alt="Palmer Violets club badge"><div class="hero-copy"><div class="eyebrow">EST. 2024 <span>✦</span> THE VIOLET ERA</div><h1>Every game.<br>Every goal. <span style="color:#bda5ff">Every Violet.</span></h1><p>The home of Palmer Violets statistics. Three seasons, one club, all the numbers that matter.</p></div><a class="btn hero-action" href="#records">Explore records ↗</a></div>${filtersHTML()}<div class="metrics">${metric('Matches played',t.played,'Across selected competitions')}${metric('Goals scored',t.gf,`${(t.played?t.gf/t.played:0).toFixed(2)} per match`)}${metric('Wins',t.wins,`${(t.played?100*t.wins/t.played:0).toFixed(0)}% win rate`)}${metric('Clean sheets',t.cs,'Matches without conceding')}</div>${sectionHeading('Latest results','View all matches','matches')}<div class="cols"><div class="panel">${matchTable(recent)}</div><div class="panel"><div class="panel-heading"><h3>2026/27 at a glance</h3><span class="tag">CURRENT SEASON</span></div><div class="panel-pad"><div class="metrics" style="grid-template-columns:repeat(2,1fr);gap:10px">${metric('Played',ct.played)}${metric('Wins',ct.wins)}${metric('Goals for',ct.gf)}${metric('Goals against',ct.ga)}</div><div class="badge-note">League and tournament results are combined in the current-season totals. Upcoming tournament games are counted only when played.</div></div></div></div>${sectionHeading('Leading goalscorers','Full leaderboard','records')}<div class="cols">${leaderboardPanel(leaders,'goals','Leading goalscorers','No goals recorded yet','TOP 6')}<div class="panel"><div class="panel-heading"><h3>Club by the numbers</h3></div><div class="charts">${seasonGoalBars()}<p class="footnote">Goals scored by season. Current season figures are ongoing.</p><div class="notice" style="margin:18px 0 0">Statistics are read-only, with results added from our verified match records.</div></div></div></div>`}
// Shared, overflow-proof leaderboards for the Records and 2026/27 pages.
// The list layout deliberately avoids the global min-width applied to match tables.
function leaderboardPanel(players, field, heading, emptyText='No statistics recorded yet', badgeText='TOP 10'){
 const label=field==='goals'?'GOALS':field==='apps'?'APPS':'MOTM';
 const rows=players.map((p,i)=>{
  const isLeader=i===0;
  return `<li class="leader-entry${isLeader?' leader-top':''}">
   <button type="button" class="leader-person" data-player="${esc(p.name)}" aria-label="View ${esc(displayPlayerName(p.name))}'s profile">
    <span class="leader-avatar" aria-hidden="true">${portraitHTML(p.name)}<span class="leader-rank">${String(i+1).padStart(2,'0')}</span></span>
    <span class="leader-name">${esc(displayPlayerName(p.name))}</span>
   </button>
   <span class="leader-total" aria-label="${p[field]} ${label.toLowerCase()}">${p[field]}</span>
  </li>`;
 }).join('');
 return `<section class="panel record-board" aria-label="${esc(heading)} leaderboard">
  <div class="panel-heading"><h3>${esc(heading)}</h3><span class="record-count">${esc(badgeText)}</span></div>
  <div class="leader-header"><span>PLAYER</span><span>${label}</span></div>
  ${rows?`<ol class="leader-list">${rows}</ol>`:`<div class="leader-empty">${esc(emptyText)}</div>`}
 </section>`;
}
// Only Hibiscus Coast Mens matches award MVP vote points; mixed matches award a chosen MOTM only.
// Missing Men's vote records remain pending, independently from official MOTM awards.
const mvpResults=db.mvpVotesByMatch||{};
function mvpResult(m){return m.competition==='Hibiscus Coast Mens'&&Object.prototype.hasOwnProperty.call(mvpResults,m.id)?mvpResults[m.id]:null}
function mvpWeekKey(date){const d=new Date(date+'T12:00:00Z');const day=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-day);return d.toISOString().slice(0,10)}
function mvpSeries(){
 const games=matches.filter(m=>m.season==='2026/27'&&m.competition==='Hibiscus Coast Mens'&&m.date&&mvpResult(m)!==null).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
 const byWeek=new Map();
 for(const m of games){const k=mvpWeekKey(m.date);if(!byWeek.has(k))byWeek.set(k,{key:k,lastDate:m.date,votes:{},games:[]});const week=byWeek.get(k);week.lastDate=m.date;week.games.push(m);for(const [name,amount] of Object.entries(mvpResult(m))){week.votes[name]=(week.votes[name]||0)+amount}}
 const weeks=[...byWeek.values()].sort((a,b)=>a.key.localeCompare(b.key));
 const cumulative=new Map();const members=new Map();
 weeks.forEach((w,i)=>{for(const [name,v] of Object.entries(w.votes)){cumulative.set(name,(cumulative.get(name)||0)+v)}for(const [name,v] of cumulative){if(v>0){if(!members.has(name))members.set(name,Array(weeks.length+1).fill(0));members.get(name)[i+1]=v}}});
 // Cumulative values carry forward for every week, including weeks when a player receives no votes.
 for(const [name,arr] of members){let last=0;for(let i=1;i<arr.length;i++){last=arr[i]||last;arr[i]=last}}
 const players=[...members].map(([name,values])=>({name,values,total:values[values.length-1]||0})).filter(p=>p.total>0).sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name,undefined,{sensitivity:'base'}));
 return {weeks,players,games};
}
function mvpSvg(series,compact=false){
 const players=series.players,weeks=series.weeks;
 const W=compact?440:1060,L=compact?41:64,R=compact?370:976,T=39,H=Math.max(compact?306:336,players.length*40+130),B=H-47;
 const max=Math.max(1,...players.map(p=>p.total));
 const step=Math.max(1,Math.ceil((max+1)/4));const upper=step*4;
 const xFor=i=>L+(R-L)*i/Math.max(1,weeks.length);
 const yFor=n=>B-(B-T)*n/upper;
 const colours=['#AE791D','#7433B3','#118B91','#C74F79','#3979B7','#879331','#A64D31','#C47B37'];
 const grid=Array.from({length:5},(_,i)=>{const val=i*step,y=yFor(val);return `<line x1="${L}" y1="${y}" x2="${R}" y2="${y}" class="mvp-grid-line"/><text x="${L-11}" y="${y+4}" class="mvp-axis" text-anchor="end">${val}</text>`}).join('');
 const labs=[{label:'START',x:L},...weeks.map((w,i)=>({label:new Date(w.lastDate+'T12:00:00Z').toLocaleDateString('en-NZ',{day:'numeric',month:'short'}).toUpperCase(),x:xFor(i+1)}))].map(l=>`<text x="${l.x}" y="${B+28}" class="mvp-axis mvp-x" text-anchor="middle">${esc(l.label)}</text>`).join('');
 const n=players.length;const endpoints=players.map((p,i)=>({index:i,name:p.name,y:yFor(p.total)})).sort((a,b)=>a.y-b.y);
 const space=compact?30:39;const minY=T+20,maxY=B-15;
 for(let i=0;i<endpoints.length;i++){endpoints[i].labelY=Math.max(endpoints[i].y,i?endpoints[i-1].labelY+space:minY)}
 const overflow=endpoints.length?endpoints[endpoints.length-1].labelY-maxY:0;
 if(overflow>0){for(const e of endpoints)e.labelY-=overflow}
 const endpointY=Object.fromEntries(endpoints.map(e=>[e.name,e.labelY]));
 const lines=players.map((p,i)=>{
  const col=colours[i%colours.length];const xy=p.values.map((val,j)=>[xFor(j),yFor(val)]);
  const poly=xy.map(v=>v.map(n=>n.toFixed(1)).join(',')).join(' ');
  const dots=xy.slice(1).map(([x,y],j)=>`<circle cx="${x}" cy="${y}" r="${compact?4:5}" fill="${col}" stroke="#fff" stroke-width="2"><title>${esc(p.name)} · ${p.values[j+1]} points · ${esc(weeks[j].lastDate)}</title></circle>`).join('');
  const last=xy[xy.length-1],src=playerPortraits[p.name],cy=endpointY[p.name],r=compact?13:16;
  const clip=`mvp-avatar-${compact?'mobile':'desktop'}-${i}`;
  const avatar=src?`<defs><clipPath id="${clip}"><circle cx="${last[0]+r+6}" cy="${cy}" r="${r}"/></clipPath></defs><image href="${esc(src)}" x="${last[0]+6}" y="${cy-r}" width="${r*2}" height="${r*2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clip})"/>`:`<circle cx="${last[0]+r+6}" cy="${cy}" r="${r}" fill="#e2c5e8"/><text x="${last[0]+r+6}" y="${cy+4}" text-anchor="middle" font-size="${compact?10:12}" font-weight="900" fill="#51277a">${esc(playerInitial(p.name))}</text>`;
  return `<g class="mvp-series"><polyline points="${poly}" stroke="${col}" stroke-width="${compact?3.4:4}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="${last[0]}" y1="${last[1]}" x2="${last[0]+6}" y2="${cy}" stroke="${col}" stroke-width="1.5" opacity=".5"/>${dots}<a href="#players/${encodeURIComponent(p.name)}" aria-label="${esc(p.name)}: ${p.total} MVP points"><title>${esc(p.name)} · ${p.total} MVP points</title>${avatar}<circle cx="${last[0]+r+6}" cy="${cy}" r="${r}" stroke="${col}" stroke-width="2.5" fill="none"/></a></g>`;
 }).join('');
 return `<svg class="mvp-chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Cumulative MVP points by week: ${esc(players.map(p=>p.name+' '+p.total).join(', '))}"><rect x="0" y="0" width="${W}" height="${H}" fill="#fbf8ff"/>${grid}<line x1="${L}" y1="${T}" x2="${L}" y2="${B}" class="mvp-axis-line"/><line x1="${L}" y1="${B}" x2="${R}" y2="${B}" class="mvp-axis-line"/>${lines}${labs}</svg>`;
}
function mvpTracker(){
 const {players,weeks,games}=mvpSeries();
 const pending=matches.filter(m=>m.season==='2026/27'&&m.competition==='Hibiscus Coast Mens'&&mvpResult(m)===null).length;
 if(!players.length) return `${sectionHeading('MVP Tracker')}<div class="panel panel-pad">No MVP votes recorded yet. Players will appear here after their first vote.</div>`;
 const colours=['#AE791D','#7433B3','#118B91','#C74F79','#3979B7','#879331','#A64D31','#C47B37'];
 const totalVotes=players.reduce((s,p)=>s+p.total,0);
 const legend=players.map((p,i)=>`<button class="mvp-person" type="button" data-player="${esc(p.name)}" aria-label="View ${esc(displayPlayerName(p.name))}'s profile"><span class="mvp-portrait" style="--mvp-player-colour:${colours[i%colours.length]}">${portraitHTML(p.name)}</span><span class="mvp-person-name">${esc(displayPlayerName(p.name))}</span><span class="mvp-person-score">${p.total} <small>pts</small></span></button>`).join('');
 return `<section class="mvp-tracker" aria-label="2026/27 MVP points tracker"><div class="mvp-section-heading"><div><div class="eyebrow">PLAYER OF THE YEAR RACE</div><h2>MVP Tracker<span class="mvp-spark">★</span></h2><p>Cumulative MOTM votes · Hibiscus Coast Men’s only</p></div><div class="mvp-stamp"><strong>${totalVotes}</strong><span>VOTES RECORDED</span></div></div><div class="panel mvp-chart-panel"><div class="mvp-chart-head"><span>2026/27 MVP POINTS OVER TIME</span><span>${games.length} ${games.length===1?'MATCH':'MATCHES'} WITH VOTES</span></div><div class="mvp-chart-wide">${mvpSvg({players,weeks},false)}</div><div class="mvp-chart-compact">${mvpSvg({players,weeks},true)}</div><div class="mvp-chart-legend">${legend}</div><p class="mvp-footnote">Only Hibiscus Coast Men’s matches use MVP voting. Every vote earns 1 point. Mixed matches award a chosen MOTM but no vote points. Lines show cumulative points by week; players appear after their first vote.${pending?` Voting pending for ${pending} HBC Men’s ${pending===1?'match':'matches'}; those points are not assumed to be zero.`:''}</p></div></section>`;
}
function currentSeasonPage(){
 const currentSeason='2026/27';
 const currentMatches=matches.filter(m=>m.season===currentSeason&&competitionMatches(m,state.currentCompetition));
 const currentFixtures=upcoming.filter(f=>f.season===currentSeason&&competitionMatches(f,state.currentCompetition)).sort(fixtureOrder);
 const t=totals(currentMatches);
 const sorted=[...currentMatches].sort((a,b)=>(b.date||'0000').localeCompare(a.date||'0000'));
 const rank=field=>allPlayers(currentMatches).filter(p=>p[field]>0).sort((a,b)=>b[field]-a[field]||a.name.localeCompare(b.name,undefined,{sensitivity:'base'})).slice(0,10);
 const board=(field,heading)=>leaderboardPanel(rank(field),field,heading,field==='motm'?'No MOTM awards recorded yet':'No recorded players yet');
 const choose=`<div class="filters current-filters"><label for="current-comp" class="filter-caption">COMPETITION</label><select id="current-comp" class="select" data-current-competition aria-label="Filter current season competition">${opts(comps,state.currentCompetition)}</select></div>`;
 return `<div class="eyebrow">MATCHDAY CENTRAL · 2026/27</div><h1 class="headline">2026/27<span style="color:var(--purple)">.</span></h1><p class="subtitle">The 2026/27 season in one place: upcoming fixtures, completed results and player leaderboards across league fixtures and one-day tournaments.</p>${choose}<div class="metrics">${metric('Matches',t.played)}${metric('Wins',t.wins)}${metric('Goals scored',t.gf)}${metric('Goal difference',(t.gf-t.ga)>0?'+'+(t.gf-t.ga):t.gf-t.ga)}</div>${sectionHeading('Upcoming fixtures')}<div class="fixture-grid">${currentFixtures.length?currentFixtures.map(fixtureCard).join(''):'<div class="panel panel-pad current-empty">No upcoming fixtures recorded for this competition.</div>'}</div>${tournamentTeasers('2026/27',state.currentCompetition)}${sectionHeading('2026/27 results')}<div class="panel">${matchTable(sorted,'No results recorded in this competition yet.')}</div>${sectionHeading('Season leaderboards')}<p class="current-board-note">2026/27 only · ${esc(state.currentCompetition)} · Equal totals are ordered alphabetically by first name.</p><div class="record-leaderboards current-boards">${board('goals','Golden Boot')}${board('apps','Appearances')}${board('motm','MOTM Awards')}</div>${mvpTracker()}<p class="footnote">These are read-only statistics from verified 2026/27 games. Upcoming fixtures are not counted until their results have been recorded.</p>`;
}
function matchPage(){if(state.match){const m=matches.find(x=>x.id===state.match);if(m)return matchDetail(m)}const ms=filtered().filter(m=>m.opponent.toLowerCase().includes(state.search.toLowerCase())).sort((a,b)=>(b.date||'0000').localeCompare(a.date||'0000'));return `<div class="eyebrow">THE FULL HISTORY</div><h1 class="headline">Match archive<span style="color:var(--purple)">.</span></h1><p class="subtitle">Every recorded Palmer Violets fixture. Select a match to view its line-up, goalscorers and awards.</p>${filtersHTML(true)}<div class="panel">${matchTable(ms)}</div><p class="footnote">${ms.length} matches shown. Historic opponent names are retained, with aliases combined for head-to-head records.</p>`}
function compactPlayer(name,more='',extra=''){
 return `<button type="button" class="squad-person ${extra}" data-player="${esc(name)}" aria-label="View ${esc(displayPlayerName(name))}'s profile"><span class="squad-avatar" aria-hidden="true">${portraitHTML(name)}</span><span class="squad-name">${esc(displayPlayerName(name))}</span>${more}</button>`;
}
function matchDetail(m){
 const sc=m.players.filter(p=>p.goals).sort((a,b)=>b.goals-a.goals||a.name.localeCompare(b.name));
 const motm=m.players.filter(p=>p.motm);
 const scorers=sc.map(p=>`<li class="scorer-entry">${compactPlayer(p.name)}<strong class="scorer-total" aria-label="${p.goals} goals">${p.goals}</strong></li>`);
 if(m.ownGoals) scorers.push(`<li class="scorer-entry scorer-own-goal"><span class="squad-avatar own-goal-avatar" aria-hidden="true">OG</span><span class="squad-name">Opposition own goal</span><strong class="scorer-total">${m.ownGoals}</strong></li>`);
 const scorersHTML=scorers.length?`<ul class="scorer-list">${scorers.join('')}</ul>`:'<p class="lineup-empty">No Palmer Violets goals in this match</p>';
 const motmHTML=m.motmStatus==='unconfirmed'?'<strong>Not confirmed</strong>':motm.length?`<div class="match-motm-list">${motm.map(p=>compactPlayer(p.name,'','motm-person')).join('')}</div>`:'<strong>None awarded</strong>';
 const ordered=[...m.players].sort((a,b)=>b.goals-a.goals||a.name.localeCompare(b.name));
 const showMvp=m.season==='2026/27'&&m.competition==='Hibiscus Coast Mens';
 const voting=mvpResult(m);
 const lineupHTML=ordered.map(p=>`<li class="lineup-entry${showMvp?' lineup-with-mvp':''}"><div class="lineup-player">${compactPlayer(p.name)}</div><span class="lineup-number${p.goals?' has-goals':''}" aria-label="${p.goals} goals">${p.goals||'—'}</span><span class="lineup-number${p.motm?' has-motm':''}" aria-label="${p.motm?'MOTM award':'No MOTM award'}">${p.motm?'★':'—'}</span>${showMvp?`<span class="lineup-number${voting&&voting[p.name]?' has-mvp':''}" aria-label="${voting?((voting[p.name]||0)+' MVP points'):'MVP votes pending'}">${voting?(voting[p.name]||'—'):'—'}</span>`:''}</li>`).join('');
 const votesSorted=voting?Object.entries(voting).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])):[];
 const mvpMatchSummary=showMvp?`<div class="thin-label">MVP POINTS (VOTES)</div><div class="match-mvp-summary">${voting?votesSorted.length?votesSorted.map(([name,pts])=>`<div class="match-mvp-recipient">${compactPlayer(name)}<strong>${pts} pts</strong></div>`).join(''):'No votes awarded':'Voting not recorded yet'}</div>`:'';
 return `<button class="back" data-back="matches">← Back to match archive</button>${m.tournamentId?`<a class="tournament-match-back" href="#tournaments/${encodeURIComponent(m.tournamentId)}">↗ View this tournament</a>`:''}<div class="eyebrow">${esc(m.competition)} <span>✦</span> ${esc(m.season)} ${m.phase==='Finals'?'· FINALS':''}</div><h1 class="headline">Palmer Violets <span class="vs">vs</span> ${esc(m.opponent)}</h1><p class="subtitle">${fmtDate(m.date)} · ${esc(m.phase)} phase</p><div class="panel panel-pad" style="margin-bottom:17px"><div class="result-header"><div><div class="muted mini">FULL TIME</div><div class="score-big">${m.gf} <span class="vs">–</span> ${m.ga}</div></div>${tag(m)}</div></div><div class="split"><div class="panel"><div class="panel-heading"><h3>Goalscorers</h3></div>${scorersHTML}</div><div class="panel"><div class="panel-heading"><h3>Match details</h3></div><div class="panel-pad"><div class="thin-label">MAN OF THE MATCH</div><div class="match-motm-field">${motmHTML}</div><div class="thin-label">RECORDED APPEARANCES</div><p><strong>${m.players.length}</strong></p>${mvpMatchSummary}<div class="thin-label">OPPONENT PROFILE</div><p><button class="back" style="margin:6px 0 0" data-opponent="${esc(m.opponentId)}">View head-to-head →</button></p></div></div></div>${sectionHeading('Match line-up')}<section class="panel lineup-panel" aria-label="Match line-up"><div class="lineup-header${showMvp?' lineup-with-mvp':''}"><span>PLAYER</span><span>GOALS</span><span>MOTM</span>${showMvp?'<span>MVP PTS</span>':''}</div><ul class="lineup-list">${lineupHTML}</ul></section>${showMvp&&!voting?'<p class="footnote">MVP voting for this game has not been recorded yet. Dashes do not mean zero votes.</p>':''}${m.motmStatus==='unconfirmed'?'<p class="footnote">MOTM is awaiting confirmation for this match.</p>':''}`;
}
function playerPage(){if(state.player){return playerDetail(state.player)}const ps=sortedPlayers(filtered(),'apps').filter(p=>(p.name+' '+displayPlayerName(p.name)).toLowerCase().includes(state.search.toLowerCase()));return `<div class="eyebrow">THE PEOPLE BEHIND THE NUMBERS</div><h1 class="headline">Player database<span style="color:var(--purple)">.</span></h1><p class="subtitle">Explore appearances, goals and MOTM awards. Select any player to see their season-by-season breakdown.</p>${filtersHTML(true)}<div class="player-grid">${ps.map(p=>`<button class="player-card" data-player="${esc(p.name)}" aria-label="Open ${esc(displayPlayerName(p.name))} player profile"><span class="player-art">${portraitHTML(p.name)}<span class="player-nameplate">${playerNameHTML(p.name)}</span></span><span class="player-card-info"><span class="player-status">${p.played.some(m=>m.season==='2026/27')?'2026/27 squad':'Club player'}</span><span class="player-stats"><span><b>${p.apps}</b> Apps</span><span><b>${p.goals}</b> Goals</span><span><b>${p.motm}</b> MOTM</span></span></span></button>`).join('')}</div>${ps.length?'':`<div class="empty">No players match those filters.</div>`}`}
function playerDetail(name){const global=sortedPlayers(matches,'apps').find(p=>p.name===name);if(!global)return '<p>No player found.</p>';const ms=filtered().filter(m=>m.players.some(p=>p.name===name));const p=allPlayers(ms).find(player=>player.name===name)||{apps:0,goals:0,motm:0};const stats=seasons.slice(1).map(season=>{const pp=allPlayers(matches.filter(m=>m.season===season)).find(p=>p.name===name);return {season,...(pp||{apps:0,goals:0,motm:0})}});const breakdown=comps.slice(1).filter(c=>c==='Tournaments'||!tournaments.some(t=>t.name===c)).map(competition=>{const pp=allPlayers(matches.filter(m=>competitionMatches(m,competition))).find(p=>p.name===name);return {competition,...(pp||{apps:0,goals:0,motm:0})}});return `<button class="back" data-back="players">← All players</button><div class="detail-head"><div class="profile-portrait">${portraitHTML(name,true)}</div><div class="profile-heading"><div class="eyebrow">PLAYER PROFILE</div><h1>${playerNameHTML(name)}</h1><span class="muted">Palmer Violets FC</span></div></div>${playerProfileFacts(name)}${filtersHTML()}<div class="metrics player-detail-metrics">${metric('Appearances',p.apps)}${metric('Goals',p.goals)}${metric('MOTM awards',p.motm)}${metric('Goals / match',p.apps?(p.goals/p.apps).toFixed(2):'0.00')}${goalDroughtMetric(name)}</div><div class="split" style="margin-top:20px"><div class="panel"><div class="panel-heading"><h3>By season · All competitions</h3></div>${table(['SEASON','APPS','GOALS','MOTM'],stats.map(x=>`<tr><td><strong>${x.season}</strong></td><td class="numeric">${x.apps}</td><td class="numeric">${x.goals}</td><td class="numeric">${x.motm}</td></tr>`))}</div><div class="panel"><div class="panel-heading"><h3>By competition · All seasons</h3></div>${table(['COMPETITION','APPS','GOALS','MOTM'],breakdown.map(x=>`<tr><td><strong>${esc(x.competition)}</strong></td><td class="numeric">${x.apps}</td><td class="numeric">${x.goals}</td><td class="numeric">${x.motm}</td></tr>`))}</div></div>${sectionHeading('Match history')}<div class="panel">${matchTable([...ms].sort((a,b)=>(b.date||'0000').localeCompare(a.date||'0000')))}</div>`}
// Club-wide winning runs are computed from the dated match archive, not from a
// manually maintained record. Same-day fixtures retain their archive sequence.
// This is an all-time record: page-level competition/season filters do not alter it.
function winningStreaks(){
 const dated=matches.map((m,position)=>({m,position})).filter(x=>x.m.date)
  .sort((a,b)=>a.m.date.localeCompare(b.m.date)||a.position-b.position);
 const runs=[];let run=[];
 function flush(){if(run.length){runs.push({games:run,first:run[0].date,last:run[run.length-1].date,wins:run.length,gf:run.reduce((sum,m)=>sum+m.gf,0),ga:run.reduce((sum,m)=>sum+m.ga,0),active:false});run=[]}}
 for(const {m} of dated){if(res(m)==='W')run.push(m);else flush()}
 flush();
 if(runs.length&&dated.length&&res(dated[dated.length-1].m)==='W')runs[runs.length-1].active=true;
 // Equal length: earlier run first, including runs that straddle seasons.
 return runs.sort((a,b)=>b.wins-a.wins||a.first.localeCompare(b.first));
}
function winningStreaksHTML(){
 const top=winningStreaks().slice(0,3);
 if(!top.length)return '<div class="panel panel-pad">No winning streaks recorded yet.</div>';
 return `<div class="win-streaks" aria-label="Three longest winning streaks">${top.map((run,i)=>{
  const rank=1+top.slice(0,i).filter(other=>other.wins>run.wins).length;
  const tied=top.some((other,j)=>i!==j&&other.wins===run.wins);
  const period=run.first===run.last?fmtDate(run.first):`${fmtDate(run.first)} – ${fmtDate(run.last)}`;
  return `<article class="streak-card${i===0?' streak-record':''}${run.active?' streak-active':''}">
   <div class="streak-head">
    <div class="streak-place"><span class="streak-rank">#${rank}${tied?'=':''}</span><span class="streak-wins"><strong>${run.wins}</strong> consecutive wins</span></div>
    <div class="streak-flags">${i===0?'<span class="streak-flag streak-best">CLUB RECORD</span>':''}${run.active?'<span class="streak-flag streak-live">ACTIVE STREAK</span>':''}</div>
   </div>
   <div class="streak-summary"><span>📅 ${esc(period)}</span><span>⚽ ${run.gf} goals scored</span><span>🛡️ ${run.ga} conceded</span></div>
   <div class="streak-list">${run.games.map(m=>`<button class="streak-match" type="button" data-match="${esc(m.id)}" aria-label="${esc(fmtDate(m.date))}, Palmer Violets beat ${esc(m.opponent)}, ${m.gf} to ${m.ga}, open match">
     <time datetime="${esc(m.date)}">${esc(fmtDate(m.date))}</time><span class="streak-opponent">${esc(m.opponent)}</span><span class="streak-result">${m.gf}–${m.ga} <span class="streak-win">W</span></span>
    </button>`).join('')}</div>
  </article>`;
 }).join('')}</div><p class="footnote">All-time club record across competitions and seasons, calculated from completed matches. Same-day games follow the match archive order. Select a result to view its match details.</p>`;
}
function records(){
 const ms=filtered();
 const rank=field=>allPlayers(ms).sort((a,b)=>b[field]-a[field]||a.name.localeCompare(b.name,undefined,{sensitivity:'base'})).slice(0,10);
 const leaders=rank('goals'),apps=rank('apps'),awards=rank('motm');
 const opp=allOpponents(ms);
 const big=[...ms].sort((a,b)=>b.gf-a.gf).slice(0,5);
 if(state.opponent)return opponentPage(state.opponent);
 const rankingTable=(items,field,heading)=>leaderboardPanel(items,field,heading);
 return `<div class="eyebrow">THE RECORD BOOK</div><h1 class="headline">Statistics & records<span style="color:var(--purple)">.</span></h1><p class="subtitle">All-time and filtered leaderboards, standout performances and head-to-head records.</p>${filtersHTML()}<div class="record-leaderboards">${rankingTable(leaders,'goals','Golden Boot')}${rankingTable(apps,'apps','Most Appearances')}${rankingTable(awards,'motm','Most MOTM Awards')}</div><p class="footnote">Ranked by each category only. Equal totals are ordered alphabetically by first name.</p>${sectionHeading('Longest winning streaks')}${winningStreaksHTML()}${sectionHeading('Highest-scoring matches')}<div class="panel">${matchTable(big)}</div>${sectionHeading('Opponent head-to-head')}<div class="panel">${table(['OPPONENT','P','W','D','L','GF','GA'],opp.map(o=>{const t=totals(o.ms);return `<tr class="rowclick" data-opponent="${esc(o.name)}"><td><strong>${esc(o.name)}</strong></td><td class="numeric">${t.played}</td><td class="numeric">${t.wins}</td><td class="numeric">${t.draws}</td><td class="numeric">${t.losses}</td><td class="numeric">${t.gf}</td><td class="numeric">${t.ga}</td></tr>`}))}</div><p class="footnote">Opponent aliases are grouped into one profile. For example, The Playful Puppies and Funky Eh share head-to-head history.</p>`;
}
function opponentPage(name){const ms=filtered().filter(m=>m.opponentId===name),t=totals(ms);return `<button class="back" data-back="records">← All records</button><div class="eyebrow">OPPONENT PROFILE</div><h1 class="headline">${esc(name)}</h1><p class="subtitle">Palmer Violets head-to-head history</p><div class="metrics">${metric('Played',t.played)}${metric('Wins',t.wins)}${metric('Goals for',t.gf)}${metric('Goals against',t.ga)}</div>${sectionHeading('Head-to-head matches')}<div class="panel">${matchTable(ms)}</div>`}
function seasonPage(){const cards=seasons.slice(1).map(s=>{const ms=matches.filter(m=>m.season===s),t=totals(ms),competitions=[...new Set(ms.map(m=>m.competition))];return `<div class="season-card"><div class="eyebrow">${s==='2026/27'?'CURRENT SEASON':'COMPLETED SEASON'}</div><h3>${s}</h3><div class="muted mini">${competitions.map(esc).join(' · ')}</div><div class="big">${t.played}</div><div class="thin-label">MATCHES PLAYED</div><div class="season-stats"><span><b>${t.wins}</b> wins</span><span><b>${t.losses}</b> losses</span><span><b>${t.gf}</b> goals</span></div><p>${s==='2026/27'?'Verified results are shown here as each competition progresses. Tournament matches also count towards season and career statistics.':'Full audited season archive including appearances, scorers and match details.'}</p><button class="btn btn-secondary" data-seasonpage="${s}">Explore season ↗</button></div>`}).join('');return `<div class="eyebrow">OUR JOURNEY SO FAR</div><h1 class="headline">Season archive<span style="color:var(--purple)">.</span></h1><p class="subtitle">From our first Warkworth Mixed campaign to a full calendar of leagues and tournaments in 2026/27.</p><div class="season-cards">${cards}</div><div class="notice" style="margin-top:22px">2025/26 League and Finals are phases of the same <b>Hibiscus Coast Mens</b> competition; their statistics are combined. No separate Finals competition is created. One-day tournaments each have a separate competition record and a dedicated Tournaments page.</div>`}

// One-day tournaments are stored independently from leagues, but each completed match is
// part of the main archive with its own season, competition and tournamentId.
function tournamentTeasers(season,selectedCompetition='All competitions'){
 const events=tournaments.filter(t=>t.season===season&&(selectedCompetition==='All competitions'||selectedCompetition==='Tournaments'||selectedCompetition===t.name));
 if(!events.length)return '';
 return `<section class="tournament-teasers" aria-label="Season tournaments"><div class="section-head"><h2>One-day tournaments</h2><a class="small-link" href="#tournaments">All tournaments ↗</a></div><div class="tournament-teaser-grid">${events.map(t=>`<a class="tournament-teaser" href="#tournaments/${encodeURIComponent(t.id)}"><span class="tournament-teaser-symbol">✦</span><span class="tournament-teaser-copy"><span class="mini muted">${esc(fmtDate(t.date))} · ${esc(t.season)}</span><strong>${esc(t.name)}</strong><span class="mini">${esc(tournamentStatus(t))} · View tournament →</span></span></a>`).join('')}</div></section>`;
}
function tournamentsPage(){
 if(state.tournament){const t=tournamentById(state.tournament);if(t)return tournamentDetail(t)}
 const events=[...tournaments].sort((a,b)=>b.date.localeCompare(a.date));
 return `<div class="eyebrow">THE ONE-DAY COLLECTION</div><h1 class="headline">Tournaments<span style="color:var(--purple)">.</span></h1><p class="subtitle">Every one-day tournament has its own competition record, match list and player statistics. Games also contribute to that season and the club's all-time totals.</p>${events.length?`<div class="tournament-list">${events.map(t=>{
  const played=tournamentMatches(t.id),stats=totals(played);
  return `<a class="tournament-event" href="#tournaments/${encodeURIComponent(t.id)}"><div class="tournament-event-badge"><span>✦</span><small>PV</small></div><div class="tournament-event-main"><div class="eyebrow">${esc(t.season)} · ${esc(t.format||'Tournament')}</div><h2>${esc(t.name)}</h2><div class="tournament-event-meta"><span>◷ ${esc(fmtDate(t.date))}</span>${t.location?`<span>◉ ${esc(t.location)}</span>`:''}</div></div><div class="tournament-event-right"><span class="tournament-status ${tournamentStatus(t)==='Upcoming'?'tournament-upcoming':''}">${esc(tournamentStatus(t))}</span>${t.finish?`<span class="tournament-finish">${esc(t.finish)}</span>`:''}<span class="tournament-event-stats">${stats.played} played · ${stats.gf} goals</span><span class="tournament-view">Explore →</span></div></a>`;
 }).join('')}</div>`:`<div class="panel panel-pad">No tournaments have been registered yet.</div>`}<p class="footnote">Tournaments are distinct from the Warkworth Mixed, Hibiscus Coast Men’s and Hibiscus Coast Mixed leagues. Results are never counted twice.</p>`;
}
function tournamentDetail(t){
 const played=[...tournamentMatches(t.id)].sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
 const future=tournamentFixtures(t.id);
 const stats=totals(played);
 const leaders=allPlayers(played).sort((a,b)=>b.goals-a.goals||a.name.localeCompare(b.name,undefined,{sensitivity:'base'})).filter(p=>p.goals>0).slice(0,10);
 const apps=allPlayers(played).sort((a,b)=>b.apps-a.apps||a.name.localeCompare(b.name,undefined,{sensitivity:'base'})).slice(0,10);
 return `<a class="back" href="#tournaments">← All tournaments</a><div class="tournament-detail-hero"><div class="tournament-detail-symbol">✦<span>PV</span></div><div><div class="eyebrow">TOURNAMENT RECORD · ${esc(t.season)}</div><h1 class="headline">${esc(t.name)}<span style="color:var(--purple)">.</span></h1><div class="tournament-detail-facts"><span>◷ ${esc(fmtDate(t.date))}</span>${t.location?`<span>◉ ${esc(t.location)}</span>`:''}${t.venue?`<span>⌖ ${esc(t.venue)}</span>`:''}<span class="tournament-status ${tournamentStatus(t)==='Upcoming'?'tournament-upcoming':''}">${esc(tournamentStatus(t))}</span>${t.finish?`<span class="tournament-finish">${esc(t.finish)}</span>`:''}</div></div></div><div class="metrics tournament-metrics">${metric('Matches played',stats.played)}${metric('Wins',stats.wins)}${metric('Goals scored',stats.gf)}${metric('Goals conceded',stats.ga)}</div>${future.length?`${sectionHeading('Scheduled matches')}<div class="fixture-grid">${future.map(fixtureCard).join('')}</div>`:''}${!played.length&&!future.length?`<div class="tournament-placeholder"><div class="tournament-placeholder-icon">▦</div><div><h3>Match schedule coming soon</h3><p>Opponents and kickoff times haven't been confirmed yet. When the tournament games are recorded, they'll appear here and in the 2026/27 season and all-time leaderboards.</p></div></div>`:''}${played.length?`${sectionHeading('Tournament results')}<div class="panel">${matchTable(played)}</div><div class="record-leaderboards tournament-boards">${leaderboardPanel(leaders,'goals','Tournament goals','No goals recorded','TOP SCORERS')}${leaderboardPanel(apps,'apps','Tournament appearances','No appearances recorded','APPEARANCES')}</div>`:''}<p class="footnote">All completed matches in this tournament count once toward each player's season and all-time appearances, goals and MOTM awards. MVP voting points remain exclusive to Hibiscus Coast Men’s league matches.</p>`;
}

function awardPortrait(name){return `<span class="award-portrait" aria-hidden="true">${portraitHTML(name)}</span>`;}
function awardWinner(name,staticName=false){
 if(!name)return '<span class="award-tbd">Not recorded yet</span>';
 const label=esc(displayPlayerName(name));
 return staticName
  ? `<span class="award-person-static">${awardPortrait(name)}<span class="award-player-static">${label}</span></span>`
  : `<button type="button" class="award-person" data-player="${esc(name)}" aria-label="View ${label}'s profile">${awardPortrait(name)}<span class="award-player">${label}<span aria-hidden="true"> ↗</span></span></button>`;
}
function awardsPage(){
 const seasonsInOrder=['2026/27','2025/26','2024/25'];
 const cards=seasonsInOrder.map(season=>{
  const ms=matches.filter(m=>m.season===season);
  const winners=(db.awards||{})[season]||{};
  const ps=sortedPlayers(ms,'goals');
  const topScore=ps.length?ps[0].goals:0;
  const leaders=ps.filter(p=>p.goals===topScore && topScore>0);
  const current=season==='2026/27';
  const competition=[...new Set(ms.map(m=>m.competition))].join(' · ');
  const pots=winners.playerOfTheSeason;
  const gots=winners.goalOfTheSeason;
  const goalPlayer=gots?(typeof gots==='string'?gots:gots.player||''):'';
  const goalDesc=gots && typeof gots==='object' && gots.description?`<span class="award-meta">${esc(gots.description)}</span>`:'';
  const scorerLabel=leaders.length?leaders.map(p=>awardWinner(p.name)).join(''):'<span class="award-tbd">No goals recorded</span>';
  return `<article class="award-season"><div class="award-season-head"><div><div class="eyebrow">${current?'CURRENT SEASON':'SEASON HONOURS'}</div><h2>${esc(season)}</h2><div class="muted mini">${esc(competition)}</div></div><span class="award-status ${current?'ongoing':''}">${current?'In progress':'Completed'}</span></div><div class="award-trio"><div class="award-tile"><div class="award-symbol">♛</div><div class="award-category">PLAYER OF THE SEASON</div>${awardWinner(pots)}<p>Chosen end-of-season award</p></div><div class="award-tile"><div class="award-symbol">✦</div><div class="award-category">GOAL OF THE SEASON</div>${awardWinner(goalPlayer)}${goalDesc}<p>Chosen end-of-season goal</p></div><div class="award-tile award-golden"><div class="award-symbol">⚽</div><div class="award-category">TOP SCORER</div><div class="award-winners">${scorerLabel}</div><div class="award-score">${topScore} <span>${topScore===1?'goal':'goals'}${current?' · so far':''}</span></div><p>${current?'Current leading goalscorer':'Calculated from verified matches'}</p></div></div></article>`;
 }).join('');
 return `<div class="eyebrow">THE VIOLET HONOURS BOARD</div><h1 class="headline">Season awards<span style="color:var(--purple)">.</span></h1><p class="subtitle">Three awards for every season: Player of the Season, Goal of the Season, and Top Scorer. The goalscoring award uses verified match statistics; voted awards are listed when confirmed.</p><div class="awards-list">${cards}</div><p class="footnote">2026/27 is ongoing, so its leading scorer is provisional. League and Finals matches contribute together to the 2025/26 Hibiscus Coast Mens tally.</p>`;
}

function decorateTables(){document.querySelectorAll('.responsive-table').forEach(wrap=>{const heads=[...wrap.querySelectorAll('thead th')].map(th=>th.textContent.trim());wrap.querySelectorAll('tbody tr').forEach(row=>[...row.querySelectorAll('td')].forEach((cell,i)=>{cell.dataset.label=heads[i]||''}))})}
function render(){const fragment=(location.hash.slice(1)||'overview').split('/'),page=title[fragment[0]]?fragment[0]:'overview';state.page=page; if(page==='players')state.player=decodeURIComponent(fragment[1]||'');else state.player='';if(page==='matches')state.match=decodeURIComponent(fragment[1]||'');else state.match='';if(page==='records')state.opponent=decodeURIComponent(fragment[1]||'');else state.opponent='';if(page==='tournaments')state.tournament=decodeURIComponent(fragment[1]||'');else state.tournament='';$('#crumb').textContent=title[page].toUpperCase();document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.dataset.page===page));$('#app').innerHTML=`<div class="content">${({overview,current:currentSeasonPage,tournaments:tournamentsPage,matches:matchPage,players:playerPage,records,seasons:seasonPage,awards:awardsPage})[page]()}</div>`;decorateTables();document.title=title[page]+' — Palmer Violets';}
window.addEventListener('hashchange',()=>{state.search='';render();window.scrollTo({top:0,behavior:'instant'})});document.addEventListener('click',e=>{const player=e.target.closest('[data-player]');const match=e.target.closest('[data-match]');const opp=e.target.closest('[data-opponent]');const back=e.target.closest('[data-back]');const sp=e.target.closest('[data-seasonpage]');if(player){location.hash='#players/'+encodeURIComponent(player.dataset.player)}else if(match){location.hash='#matches/'+encodeURIComponent(match.dataset.match)}else if(opp){location.hash='#records/'+encodeURIComponent(opp.dataset.opponent)}else if(back){location.hash='#'+back.dataset.back}else if(sp){state.season=sp.dataset.seasonpage;state.competition='All competitions';location.hash='#matches'}});document.addEventListener('change',e=>{if(e.target.matches('[data-current-competition]')){state.currentCompetition=e.target.value;render();return}if(e.target.matches('[data-filter]')){state[e.target.dataset.filter]=e.target.value;render()}});document.addEventListener('input',e=>{if(e.target.matches('[data-filter="search"]')){let pos=e.target.selectionStart;state.search=e.target.value;render();const el=$('[data-filter="search"]');if(el){el.focus();el.setSelectionRange(pos,pos)}}});render();
})();
