import { useState, useRef } from "react";

const DS = {
  bg:"#f0ede8", surface:"#ffffff", surface2:"#f7f7f5",
  border:"#e8e8e8", border2:"#d0cdc8",
  text:"#222222", text2:"#888888", text3:"#aaaaaa",
  shadow:"0 2px 8px rgba(0,0,0,.06)", shadowHover:"0 6px 20px rgba(0,0,0,.10)",
  radius:12, radiusSm:8,
};
const JC = { director:"#E24B4A", actor:"#378ADD", producer:"#1D9E75", writer:"#BA7517", cine:"#7F77DD", stunt:"#D4537E", rumors:"#059669" };
const GC = { "Sci-Fi":{bg:"#E6F1FB",text:"#0C447C"}, Drama:{bg:"#FAECE7",text:"#4A1B0C"}, Action:{bg:"#FCEBEB",text:"#791F1F"}, Comedy:{bg:"#FAEEDA",text:"#633806"}, Thriller:{bg:"#EEEDFE",text:"#26215C"} };
const GSTRIPE = { "Sci-Fi":"#378ADD", Drama:"#D85A30", Action:"#E24B4A", Comedy:"#BA7517", Thriller:"#7F77DD" };
const EC = { pr:"#639922", badpr:"#E24B4A", tabloid:"#BA7517", connections:"#1D9E75", drama:"#7F77DD" };
const D3F = { standard:[1,1,2,2,3,3], hotstreak:[1,2,3,3,3,3], safebet:[2,2,2,3,3,3], boom:[1,1,1,1,3,3] };

const STUDIOS = [
  {id:"apex",  n:"Apex Pictures",      sub:"Risk Taker",       bids:8,  c:"#E24B4A",aff:"boom",     affL:"Boom or Bust", afxN:"Roll 3 → roll again, add both",      pass:"Leverage: Once per game, retry a failed Film Roll with a new subset."},
  {id:"nova",  n:"Nova Films",          sub:"The Grinder",      bids:14, c:"#378ADD",aff:"standard", affL:"Standard D3",  afxN:"Roll 1 → treat as 2 (min income 2)", pass:"Reliable Output: Once per turn, 5th Crew in subset for eligibility only."},
  {id:"golden",n:"Golden Gate Studios", sub:"Genre Specialist",  bids:11, c:"#BA7517",aff:"hotstreak",affL:"Hot Streak",   afxN:"Roll 3 → draw 1 card immediately",   pass:"Signature Style: Choose 1 genre. Benched Crew with that genre +1 die."},
  {id:"mid",   n:"Midnight Reel",       sub:"Dark Horse",        bids:10, c:"#1D9E75",aff:"safebet",  affL:"Safe Bet",     afxN:"Once per game: reroll, take higher",  pass:"Comeback Kid: When Headhunted, draw 2 cards immediately."},
  {id:"pin",   n:"Pinnacle Studios",    sub:"Power Player",      bids:9,  c:"#7F77DD",aff:"boom",     affL:"Boom or Bust", afxN:"Roll 1 → steal 1 Bid from richest",  pass:"Hostile Takeover: Once per turn, force opponent to reveal their subset."},
  {id:"cent",  n:"Century Films",       sub:"Deep Pockets",      bids:12, c:"#D4537E",aff:"hotstreak",affL:"Hot Streak",   afxN:"Roll 3 → +1 Bid toward Table Bids",  pass:"War Chest: Before income roll, spend Bids to draw that many cards."},
];

const CREW = [
  {id:"c01",t:"director",n:"Staff Director",  g:["Comedy","Drama"],   d:1,r:5, fx:"Gain 2 Bids."},
  {id:"c02",t:"director",n:"Vera Santos",      g:["Drama","Thriller"], d:2,r:7, fx:"Remove 1 Delay from any Movie you own."},
  {id:"c03",t:"director",n:"Marcus Webb",      g:["Action","Sci-Fi"],  d:2,r:6, fx:"Draw 1 card from either deck."},
  {id:"c04",t:"director",n:"Sofia Reyes",      g:["Drama","Thriller"], d:3,r:9, fx:"Your next Film Roll +2 to total."},
  {id:"c05",t:"director",n:"The Legend",       g:["Any"],              d:3,r:10,fx:"Remove all Delays from any Movie in play."},
  {id:"c06",t:"actor",   n:"Background Extra", g:["Comedy","Action"],  d:1,r:4, fx:"Gain 2 Bids."},
  {id:"c07",t:"actor",   n:"The Understudy",   g:["Drama","Comedy"],   d:1,r:5, fx:"Draw 1 Crew card."},
  {id:"c08",t:"actor",   n:"Jamie Cross",      g:["Drama","Thriller"], d:2,r:7, fx:"Steal 1 Bid from opponent."},
  {id:"c09",t:"actor",   n:"Action Hero",      g:["Action","Sci-Fi"],  d:2,r:7, fx:"Your Film Roll this turn +2."},
  {id:"c10",t:"actor",   n:"Rosa Lima",        g:["Sci-Fi","Thriller"],d:3,r:9, fx:"Remove all Bad PR from any Crew."},
  {id:"c11",t:"actor",   n:"The A-Lister",     g:["Any"],              d:3,r:9, fx:"Draw 3 cards from any decks."},
  {id:"c12",t:"producer",n:"Line Producer",    g:["Comedy","Action"],  d:1,r:5, fx:"Gain 2 Bids."},
  {id:"c13",t:"producer",n:"The Financier",    g:["Drama","Sci-Fi"],   d:2,r:7, fx:"Gain 3 Bids."},
  {id:"c14",t:"producer",n:"The Greenlight",   g:["Any"],              d:3,r:7, fx:"SPECIAL: 5th subset slot. Gain 2 Bids."},
  {id:"c15",t:"writer",  n:"Staff Writer",     g:["Comedy","Drama"],   d:1,r:5, fx:"Draw 2 cards."},
  {id:"c16",t:"writer",  n:"Dana Park",        g:["Drama","Sci-Fi"],   d:2,r:7, fx:"Draw 2 Event cards."},
  {id:"c17",t:"writer",  n:"Award Winner",     g:["Drama"],            d:3,r:9, fx:"If in subset when Nominated, draw 2 cards."},
  {id:"c18",t:"cine",    n:"The DP",           g:["Sci-Fi","Drama"],   d:2,r:7, fx:"Your Film Roll this turn +2."},
  {id:"c19",t:"cine",    n:"The Artist",       g:["Sci-Fi","Drama"],   d:3,r:9, fx:"If in Nominated subset: steal 1 Bid per opponent."},
  {id:"c20",t:"stunt",   n:"The Specialist",   g:["Action","Sci-Fi"],  d:2,r:8, fx:"Ignore Bad PR penalties this Film Roll."},
  {id:"c21",t:"stunt",   n:"The Franchise",    g:["Action","Sci-Fi"],  d:3,r:10,fx:"After success: attempt another Film Roll free."},
  {id:"c22",t:"rumors",  n:"Industry Insider", g:["Any"],              d:0,r:0, fx:"PASSIVE: All your Film Rolls +1 to total."},
  {id:"c23",t:"rumors",  n:"The Veteran",      g:["Any"],              d:0,r:0, fx:"PASSIVE: Director eligibility always met."},
  {id:"c24",t:"rumors",  n:"The Fixer",        g:["Any"],              d:0,r:0, fx:"PASSIVE: Bad PR removal succeeds on 3+."},
];

const EVENTS = [
  {id:"e01",t:"pr",          n:"Golden Buzz",     fx:"+1 die on all Film Rolls."},
  {id:"e02",t:"pr",          n:"Star Power",       fx:"Tier up: Entry→Mid, Mid→Star."},
  {id:"e03",t:"pr",          n:"Method Acting",    fx:"+1 die. Cannot be Film Sabotaged."},
  {id:"e04",t:"pr",          n:"Critics Darling",  fx:"+2 to Critical rolls only."},
  {id:"e05",t:"pr",          n:"Award Favorite",   fx:"If Nominated: gain 3 Bids."},
  {id:"e06",t:"badpr",       n:"Paparazzi Bait",   fx:"-1 die to Film Rolls (min 0)."},
  {id:"e07",t:"badpr",       n:"Public Meltdown",  fx:"Cannot enter any Film Roll subset."},
  {id:"e08",t:"badpr",       n:"Contract Dispute", fx:"Pay 1 Bid per turn or discard."},
  {id:"e09",t:"badpr",       n:"Scandal Piece",    fx:"Effect roll requirement +2."},
  {id:"e10",t:"tabloid",     n:"Walk of Fame",      fx:"One Crew permanently +1 die."},
  {id:"e11",t:"tabloid",     n:"Rival Offer",       fx:"Sabotage Window: auto-steal 1 Crew from subset.",sub:"headhunt"},
  {id:"e12",t:"tabloid",     n:"Press Junket",      fx:"Remove all Bad PR from your Crew."},
  {id:"e13",t:"tabloid",     n:"Bomb Scare",        fx:"Place 1 Delay on any opponent Movie."},
  {id:"e14",t:"tabloid",     n:"Directors Cut",     fx:"Attempt a Film Roll this turn for free."},
  {id:"e15",t:"tabloid",     n:"Streaming Deal",    fx:"Gain Bids = Film Value. +1 Delay."},
  {id:"e16",t:"connections", n:"Lucky Break",       fx:"+3 to any roll.", sub:"instant"},
  {id:"e17",t:"connections", n:"Overtime",          fx:"+2 to Film Roll.", sub:"film only"},
  {id:"e18",t:"connections", n:"Studio Pressure",   fx:"-3 to any roll.", sub:"instant"},
  {id:"e19",t:"drama",       n:"Thats a Wrap",      fx:"Remove one Crew from rolling player's subset.", sub:"sabotage"},
  {id:"e20",t:"drama",       n:"Power Play",        fx:"Card Interrupt OR Film Sabotage.", sub:"either"},
  {id:"e21",t:"drama",       n:"Final Cut",         fx:"Film Roll total -5 after dice.", sub:"sabotage"},
  {id:"e22",t:"drama",       n:"Not On My Watch",   fx:"Cancel any Crew or PR being played.", sub:"interrupt"},
];

const MOVIES = [
  {id:"m01",title:"Neon Requiem",    genre:"Sci-Fi",  prod:17,crit:22,fin:6, req:{director:1,actor:1,writer:1},            fx:"Draw 1 card."},
  {id:"m02",title:"Coffee and Rain", genre:"Drama",   prod:17,crit:22,fin:5, req:{director:1,actor:1,writer:1},            fx:"All opponents gain 1 Bid."},
  {id:"m03",title:"Midnight in Rome",genre:"Comedy",  prod:16,crit:21,fin:5, req:{director:1,actor:1,producer:1},          fx:"Draw 2 cards."},
  {id:"m04",title:"Last Goodbye",    genre:"Drama",   prod:23,crit:29,fin:5, req:{director:1,actor:2,writer:1},            fx:"Opponents discard 1 card."},
  {id:"m05",title:"Boom Town",       genre:"Action",  prod:24,crit:31,fin:7, req:{director:1,actor:2,producer:1,writer:1}, fx:"Steal 1 Bid from each opponent."},
  {id:"m06",title:"The Collapse",    genre:"Thriller",prod:25,crit:32,fin:8, req:{director:1,actor:1,writer:1,cine:1},     fx:"Look at top 3 cards of any deck."},
  {id:"m07",title:"Digital Ghost",   genre:"Sci-Fi",  prod:23,crit:30,fin:7, req:{director:1,actor:1,writer:1,producer:1}, fx:"Remove all Delays from any Movie."},
  {id:"m08",title:"Iron Soul",       genre:"Action",  prod:26,crit:34,fin:8, req:{director:1,actor:2,producer:1,stunt:1},  fx:"Roll income die again, gain amount."},
];

const uid     = () => Math.random().toString(36).slice(2,9);
const shuffle = a => { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=0|Math.random()*(i+1);[b[i],b[j]]=[b[j],b[i]];} return b; };
const rollD6  = () => (Math.random()*6|0)+1;
const rollD3  = t  => { const f=D3F[t]||D3F.standard; return f[Math.random()*6|0]; };
const rollNd6 = n  => Array.from({length:Math.max(1,n)},rollD6);

function checkElig(movie, lot) {
  const hasVet = lot.some(c=>c.id==="c23");
  const need   = {...movie.req};
  if (hasVet && need.director) delete need.director;
  const have   = {};
  lot.filter(c=>c.t!=="rumors").forEach(c=>{ have[c.t]=(have[c.t]||0)+1; });
  return Object.entries(need).every(([t,n])=>(have[t]||0)>=n);
}

function subsetDiceInfo(subset, lot, movie) {
  let totalDice = 0;
  subset.forEach(c => {
    let d = c.d;
    if (c.pr) {
      if (["e01","e02","e03"].includes(c.pr.id)) d++;
      if (c.pr.id==="e06") d = Math.max(0, d-1);
    }
    totalDice += d;
  });
  const mg      = movie.genre;
  const inSub   = subset.filter(c=>c.g&&(c.g.includes(mg)||c.g.includes("Any"))).length;
  const bench   = lot.filter(c=>c.t==="rumors"&&(c.g.includes(mg)||c.g.includes("Any"))).length;
  const matches = Math.min(inSub+bench, 4);
  return { totalDice, genreBonus:matches>=4?3:matches>=3?2:matches>=2?1:0, passiveBonus:lot.some(c=>c.id==="c22")?1:0 };
}

function initGame(studioId) {
  const studio   = STUDIOS.find(s=>s.id===studioId);
  const aiStudio = STUDIOS.filter(s=>s.id!==studioId)[Math.random()*5|0];
  const crewDeck  = shuffle([...CREW]).map(c=>({...c,uid:uid()}));
  const eventDeck = shuffle([...EVENTS]).map(e=>({...e,uid:uid()}));
  const movieDeck = shuffle([...MOVIES]).map(m=>({...m,delays:0,uid:uid()}));
  return {
    turn:1, maxTurns:12, phase:"income",
    human:{ studio, hand:crewDeck.splice(0,5), lot:[], movies:[], released:[], bids:studio.bids, ap:3 },
    ai:   { studio:aiStudio, hand:crewDeck.splice(0,5), lot:[], movies:[], released:[], bids:aiStudio.bids },
    crewDeck, eventDeck, movieDeck, centerRow:movieDeck.splice(0,2),
    activeBid:null, activeFilmRoll:null,
    log:[`Turn 1 — roll your income die.`,`Opponent: ${aiStudio.n}.`,`You are ${studio.n} (${studio.sub}). Bids: ${studio.bids}.`,`Welcome to Reel Deal!`],
  };
}

async function getAIDecision(g) {
  const eligible = g.ai.movies.filter(m=>checkElig(m,g.ai.lot));
  const prompt = `You are ${g.ai.studio.n} in Reel Deal. Respond with valid JSON only.
Turn ${g.turn}/${g.maxTurns}. Bids: ${g.ai.bids}.
Lot: ${g.ai.lot.map(c=>`${c.uid}:${c.n}(${c.t},${c.d}d)`).join(",")||"empty"}
Hand: ${g.ai.hand.map(c=>`${c.uid}:${c.n}[${c.t}]`).join(",")||"empty"}
Movies: ${g.ai.movies.map(m=>`${m.uid}:${m.title}(prod=${m.prod+m.delays},d=${m.delays})`).join(",")||"none"}
Eligible: ${eligible.map(m=>`${m.uid}:${m.title}`).join(",")||"none"}
Center: ${g.centerRow.map(m=>`${m.uid}:${m.title}(${m.genre},fin=${m.fin})`).join(";")||"empty"}
Opponent bids: ${g.human.bids}
Return: {"die":"standard|hotstreak|safebet|boom","playCrewUids":[],"filmRollMovieUid":null,"filmRollSubsetUids":[],"drawMovie":false,"movieBidAmount":0,"say":"one sentence"}`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:prompt}]})
    });
    const data = await res.json();
    return JSON.parse((data.content?.find(b=>b.type==="text")?.text||"{}").replace(/```json|```/g,"").trim());
  } catch { return {die:"standard",playCrewUids:[],filmRollMovieUid:null,filmRollSubsetUids:[],drawMovie:false,movieBidAmount:0,say:"Steady as she goes."}; }
}

export default function ReelDeal() {
  const [screen,    setScreen]    = useState("setup");
  const [gs,        setGs]        = useState(null);
  const [picked,    setPicked]    = useState(null);
  const [sel,       setSel]       = useState([]);
  const [bidAmt,    setBidAmt]    = useState(1);
  const [aiThinking,setAiThinking]= useState(false);
  const [lastRoll,  setLastRoll]  = useState(null);
  const aiLock = useRef(false);

  const addLog = (msg, g) => ({...g, log:[msg,...(g.log||[])].slice(0,25)});

  async function runAITurn(g) {
    if (aiLock.current) return;
    aiLock.current = true; setAiThinking(true);
    let g2 = {...g};
    const dec = await getAIDecision(g2);
    const dType = ["standard","hotstreak","safebet","boom"].includes(dec.die)?dec.die:"standard";
    const income = rollD3(dType);
    g2.ai = {...g2.ai, bids:g2.ai.bids+income};
    g2 = addLog(`${g2.ai.studio.n}: +${income} Bids (${dType}). ${dec.say||""}`, g2);
    (dec.playCrewUids||[]).slice(0,2).forEach(u=>{
      const i=g2.ai.hand.findIndex(c=>c.uid===u);
      if(i!==-1){const card=g2.ai.hand[i];g2.ai={...g2.ai,hand:g2.ai.hand.filter((_,j)=>j!==i),lot:[...g2.ai.lot,card]};g2=addLog(`${g2.ai.studio.n}: Plays ${card.n}.`,g2);}
    });
    if(dec.filmRollMovieUid&&(dec.filmRollSubsetUids||[]).length>0){
      const mi=g2.ai.movies.findIndex(m=>m.uid===dec.filmRollMovieUid);
      if(mi!==-1){const movie=g2.ai.movies[mi];const subset=dec.filmRollSubsetUids.map(u=>g2.ai.lot.find(c=>c.uid===u)).filter(Boolean);
        if(subset.length>0&&checkElig(movie,g2.ai.lot)){
          const{totalDice,genreBonus,passiveBonus}=subsetDiceInfo(subset,g2.ai.lot,movie);
          const rolls=rollNd6(totalDice);const total=rolls.reduce((a,b)=>a+b,0)+genreBonus+passiveBonus;const thresh=movie.prod+movie.delays;
          g2=addLog(`${g2.ai.studio.n}: Film Roll "${movie.title}" [${rolls.join(",")}]+${genreBonus+passiveBonus}=${total} vs ${thresh}`,g2);
          if(total>=movie.crit){g2.ai={...g2.ai,bids:g2.ai.bids+movie.fin,movies:g2.ai.movies.filter((_,j)=>j!==mi),released:[...g2.ai.released,{...movie,nominated:true}]};g2=addLog(`🌟 NOMINATED! "${movie.title}" +${movie.fin} Bids.`,g2);}
          else if(total>=thresh){g2.ai={...g2.ai,bids:g2.ai.bids+movie.fin,movies:g2.ai.movies.filter((_,j)=>j!==mi),released:[...g2.ai.released,{...movie,nominated:false}]};g2=addLog(`✅ "${movie.title}" released. +${movie.fin} Bids.`,g2);}
          else{const nm=g2.ai.movies.map((m,j)=>j===mi?{...m,delays:m.delays+1}:m);if(movie.delays+1>=3){const p=Math.floor(movie.fin/2);g2.ai={...g2.ai,bids:Math.max(0,g2.ai.bids-p),movies:g2.ai.movies.filter((_,j)=>j!==mi)};g2=addLog(`💥 BOMB! "${movie.title}" -${p} Bids.`,g2);}else{g2.ai={...g2.ai,movies:nm};g2=addLog(`❌ Failed. "${movie.title}" delay ${nm[mi].delays}.`,g2);}}
        }
      }
    }
    if(dec.drawMovie&&dec.movieBidAmount>0&&g2.movieDeck.length>0){
      const movie={...g2.movieDeck[0],delays:0};g2.movieDeck=g2.movieDeck.slice(1);
      const aiBid=Math.min(dec.movieBidAmount,g2.ai.bids);g2.ai={...g2.ai,bids:g2.ai.bids-aiBid,movies:[...g2.ai.movies,movie]};
      g2=addLog(`${g2.ai.studio.n}: Wins "${movie.title}" at ${aiBid} Bids.`,g2);
      while(g2.centerRow.length<2&&g2.movieDeck.length>0){g2.centerRow=[...g2.centerRow,{...g2.movieDeck[0],delays:0}];g2.movieDeck=g2.movieDeck.slice(1);}
    }
    const nt=g2.turn+1;
    g2=nt>g2.maxTurns?{...g2,phase:"endgame"}:addLog(`Turn ${nt} — your move.`,{...g2,turn:nt,phase:"income",human:{...g2.human,ap:3}});
    setGs(g2);setAiThinking(false);aiLock.current=false;
  }

  function score(p){const film=p.released.reduce((s,m)=>s+m.fin,0);return{film,bids:Math.floor(p.bids/2),total:film+Math.floor(p.bids/2)};}

  function rollIncome(dt){setGs(g=>{const v=rollD3(dt);setLastRoll({v,t:dt});setTimeout(()=>setLastRoll(null),1800);return addLog(`You roll ${dt} → +${v} Bids (${g.human.bids+v} total).`,{...g,phase:"actions",human:{...g.human,bids:g.human.bids+v,ap:3}});});}
  function drawCrew(){setGs(g=>{if(g.human.ap<1||!g.crewDeck.length)return g;const c=g.crewDeck[0];return addLog(`Drew ${c.n}.`,{...g,human:{...g.human,hand:[...g.human.hand,c],ap:g.human.ap-1},crewDeck:g.crewDeck.slice(1)});});}
  function drawEvent(){setGs(g=>{if(g.human.ap<1||!g.eventDeck.length)return g;const c=g.eventDeck[0];return addLog(`Drew ${c.n}.`,{...g,human:{...g.human,hand:[...g.human.hand,c],ap:g.human.ap-1},eventDeck:g.eventDeck.slice(1)});});}
  function playCrew(cu){setGs(g=>{if(g.human.ap<1)return g;const i=g.human.hand.findIndex(c=>c.uid===cu);if(i===-1)return g;const card=g.human.hand[i];if(!["director","actor","producer","writer","cine","stunt","rumors"].includes(card.t))return g;return addLog(`${card.n} joins your Studio Lot.`,{...g,human:{...g.human,hand:g.human.hand.filter((_,j)=>j!==i),lot:[...g.human.lot,card],ap:g.human.ap-1}});});}
  function drawMovieBid(){setGs(g=>{if(g.human.ap<1||!g.movieDeck.length)return g;const movie={...g.movieDeck[0],delays:0};setBidAmt(1);return{...addLog(`You draw "${movie.title}". Table Bid opens!`,{...g,movieDeck:g.movieDeck.slice(1),human:{...g.human,ap:g.human.ap-1}}),phase:"table_bid",activeBid:{movie,currentBid:0,aiBid:0,aiRaised:false}};});}
  function submitBid(amount){setGs(g=>{if(!g.activeBid)return g;const bid=Math.max(1,amount);if(bid>g.human.bids)return addLog("Not enough Bids!",g);let g2=addLog(`You bid ${bid} on "${g.activeBid.movie.title}".`,g);const mv=g.activeBid.movie;const aiMax=Math.floor(g2.ai.bids*.6);const shouldRaise=mv.fin+(checkElig(mv,g2.ai.lot)?3:1)>bid+1&&bid+1<=aiMax&&!g.activeBid.aiRaised;if(shouldRaise){const r=Math.min(bid+(Math.random()*2|0)+1,aiMax);g2=addLog(`${g2.ai.studio.n} raises to ${r}!`,g2);setBidAmt(r+1);return{...g2,activeBid:{...g2.activeBid,currentBid:r,aiBid:r,aiRaised:true}};}
    g2=addLog(`You win "${mv.title}" at ${bid} Bids!`,g2);g2={...g2,human:{...g2.human,bids:g2.human.bids-bid,movies:[...g2.human.movies,mv]},activeBid:null,phase:"actions"};while(g2.centerRow.length<2&&g2.movieDeck.length>0){g2.centerRow=[...g2.centerRow,{...g2.movieDeck[0],delays:0}];g2.movieDeck=g2.movieDeck.slice(1);}return g2;});}
  function foldBid(){setGs(g=>{if(!g.activeBid)return g;const wb=g.activeBid.aiBid||1;let g2=addLog(`You fold. ${g.ai.studio.n} wins at ${wb} Bids.`,g);g2={...g2,ai:{...g2.ai,bids:g2.ai.bids-wb,movies:[...g2.ai.movies,g.activeBid.movie]},activeBid:null,phase:"actions"};while(g2.centerRow.length<2&&g2.movieDeck.length>0){g2.centerRow=[...g2.centerRow,{...g2.movieDeck[0],delays:0}];g2.movieDeck=g2.movieDeck.slice(1);}return g2;});}
  function claimCenter(mu){setGs(g=>{if(g.human.ap<1)return g;const i=g.centerRow.findIndex(m=>m.uid===mu);if(i===-1)return g;const mv=g.centerRow[i];return addLog(`Claimed "${mv.title}" from Center Row.`,{...g,human:{...g.human,ap:g.human.ap-1,movies:[...g.human.movies,mv]},centerRow:g.centerRow.filter((_,j)=>j!==i)});});}
  function startFilmRoll(mu){setGs(g=>{if(g.human.ap<2)return addLog("Need 2 AP.",g);const mv=g.human.movies.find(m=>m.uid===mu);if(!mv)return g;if(!checkElig(mv,g.human.lot))return addLog("Eligibility not met.",g);setSel([]);return{...g,phase:"film_declare",activeFilmRoll:{movie:mv}};});}
  function toggleSubset(cu){setSel(s=>s.includes(cu)?s.filter(u=>u!==cu):s.length<4?[...s,cu]:s);}
  function confirmSubset(){setGs(g=>{if(!g.activeFilmRoll||!sel.length)return g;const mv=g.activeFilmRoll.movie;const subset=sel.map(u=>g.human.lot.find(c=>c.uid===u)).filter(Boolean);const{totalDice,genreBonus,passiveBonus}=subsetDiceInfo(subset,g.human.lot,mv);const rolls=rollNd6(totalDice);const total=rolls.reduce((a,b)=>a+b,0)+genreBonus+passiveBonus;const thresh=mv.prod+mv.delays;let g2=addLog(`Film Roll: [${rolls.join(",")}]+${genreBonus+passiveBonus}=${total} vs ${thresh} (crit ${mv.crit})`,g);setSel([]);if(total>=mv.crit){g2=addLog(`🌟 NOMINATED! "${mv.title}" earns ${mv.fin} Bids.`,g2);return{...g2,phase:"actions",activeFilmRoll:null,human:{...g2.human,bids:g2.human.bids+mv.fin,movies:g2.human.movies.filter(m=>m.uid!==mv.uid),released:[...g2.human.released,{...mv,nominated:true}],ap:g2.human.ap-2}};}if(total>=thresh){g2=addLog(`✅ "${mv.title}" released! +${mv.fin} Bids.`,g2);return{...g2,phase:"actions",activeFilmRoll:null,human:{...g2.human,bids:g2.human.bids+mv.fin,movies:g2.human.movies.filter(m=>m.uid!==mv.uid),released:[...g2.human.released,{...mv,nominated:false}],ap:g2.human.ap-2}};}const d=mv.delays+1;if(d>=3){const p=Math.floor(mv.fin/2);g2=addLog(`💥 BOMB! -${p} Bids.`,g2);return{...g2,phase:"actions",activeFilmRoll:null,human:{...g2.human,bids:Math.max(0,g2.human.bids-p),movies:g2.human.movies.filter(m=>m.uid!==mv.uid),ap:g2.human.ap-2}};}g2=addLog(`❌ Failed (${total}<${thresh}). Delay ${d}.`,g2);return{...g2,phase:"actions",activeFilmRoll:null,human:{...g2.human,movies:g2.human.movies.map(m=>m.uid===mv.uid?{...m,delays:d}:m),ap:g2.human.ap-2}};});}
  function endTurn(){setGs(g=>{const g2=addLog("You end your turn.",{...g,phase:"ai_thinking"});setTimeout(()=>runAITurn(g2),700);return g2;});}

  // ── STYLE HELPERS ──
  const card  = (ex={}) => ({background:DS.surface,border:`1px solid ${DS.border}`,borderRadius:DS.radius,overflow:"hidden",boxShadow:DS.shadow,...ex});
  const pill  = (bg,color,ex={}) => ({display:"inline-block",background:bg,color,fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,letterSpacing:.3,...ex});
  const btn   = (on=true,c=DS.text) => ({background:on?c:DS.surface,color:on?"#fff":DS.text2,border:`1px solid ${on?c:DS.border2}`,borderRadius:DS.radiusSm,padding:"7px 12px",fontSize:11,fontWeight:600,cursor:on?"pointer":"not-allowed",transition:"all .15s",fontFamily:"inherit"});
  const stat  = (v,l,c=DS.text) => (<div style={{textAlign:"center",background:DS.surface2,borderRadius:5,padding:"4px 0",flex:1}}><div style={{fontSize:15,fontWeight:600,color:c,lineHeight:1}}>{v}</div><div style={{fontSize:8,color:DS.text3,letterSpacing:.5,marginTop:1}}>{l}</div></div>);

  // ── CARD COMPONENTS ──
  function CrewMini({c,onClick,selected,dimmed}) {
    const col=JC[c.t]||"#888"; const isR=c.t==="rumors";
    return <div onClick={onClick} style={{...card({width:106,cursor:onClick?"pointer":"default",opacity:dimmed?.4:1,border:`1.5px solid ${selected?col:DS.border}`,boxShadow:selected?`0 0 0 3px ${col}22,${DS.shadow}`:DS.shadow,transform:selected?"translateY(-2px)":"none"})}}>
      <div style={{height:4,background:col}}/>
      <div style={{padding:"6px 8px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
          <span style={{fontSize:8,fontWeight:700,color:col,letterSpacing:.4}}>{c.t.toUpperCase()}</span>
          {isR?<span style={{...pill(col+"18",col),fontSize:7,padding:"1px 4px"}}>P</span>:<div style={{display:"flex",gap:2}}>{Array(c.d).fill(0).map((_,i)=><span key={i} style={{width:8,height:8,borderRadius:2,background:col,opacity:.7,display:"inline-block"}}/>)}</div>}
        </div>
        <div style={{fontSize:11,fontWeight:500,color:DS.text,lineHeight:1.2,marginBottom:isR?0:2}}>{c.n}</div>
        {!isR&&<div style={{fontSize:8,color:DS.text3}}>r{c.r}+</div>}
        {c.pr&&<div style={{fontSize:8,color:c.pr.t==="badpr"?"#E24B4A":"#639922",marginTop:2,fontWeight:500}}>{c.pr.n}</div>}
      </div>
    </div>;
  }

  function MovieMini({m,onClick,owned,compact}) {
    const gc=GC[m.genre]||{bg:"#f0f0f0",text:"#333"};const stripe=GSTRIPE[m.genre]||"#888";
    const gcMap={director:"#E24B4A",actor:"#378ADD",producer:"#1D9E75",writer:"#BA7517",cine:"#7F77DD",stunt:"#D4537E"};
    const canRoll=owned&&checkElig(m,gs?.human?.lot||[]);
    return <div onClick={onClick} style={{...card({width:compact?118:134,cursor:onClick?"pointer":"default",position:"relative",border:`1.5px solid ${canRoll?"#1D9E7566":DS.border}`,boxShadow:canRoll?`0 0 0 2px #1D9E7522,${DS.shadow}`:DS.shadow})}}>
      {m.delays>0&&<div style={{position:"absolute",top:5,right:5,background:"#FF9800",color:"#fff",fontSize:8,fontWeight:700,padding:"1px 5px",borderRadius:3,zIndex:1}}>D{m.delays}</div>}
      <div style={{height:4,background:stripe}}/>
      <div style={{padding:"7px 8px"}}>
        <span style={pill(gc.bg,gc.text,{marginBottom:5,display:"inline-block"})}>{m.genre}</span>
        <div style={{fontSize:11,fontWeight:500,color:DS.text,lineHeight:1.2,margin:"4px 0 7px"}}>{m.title}</div>
        <div style={{display:"flex",gap:3,marginBottom:6}}>{stat(m.prod+m.delays,"PROD")}{stat(m.crit,"CRIT","#BA7517")}{stat(m.fin,"BIDS","#1D9E75")}</div>
        <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>{Object.entries(m.req).flatMap(([t,n])=>Array(n).fill(t)).map((t,i)=><span key={i} style={{background:gcMap[t]+"20",color:gcMap[t],fontSize:7,padding:"1px 4px",borderRadius:3,fontWeight:600}}>{t.slice(0,3)}</span>)}</div>
        {canRoll&&<div style={{marginTop:5,fontSize:9,color:"#1D9E75",fontWeight:500}}>✓ Ready to roll</div>}
      </div>
    </div>;
  }

  // ═══════════════════════════════════════════════
  // SETUP SCREEN
  // ═══════════════════════════════════════════════
  if (screen==="setup") return (
    <div style={{minHeight:"100vh",background:DS.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40}}>
      <div style={{fontSize:10,letterSpacing:4,color:DS.text3,fontWeight:600,marginBottom:10}}>REEL DEAL</div>
      <h1 style={{fontSize:40,fontWeight:700,color:DS.text,marginBottom:6,letterSpacing:-1,fontFamily:"Georgia,serif"}}>Choose Your Studio</h1>
      <p style={{color:DS.text2,fontSize:13,marginBottom:40}}>2 players · 12 turns · you vs AI</p>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",maxWidth:920,marginBottom:44}}>
        {STUDIOS.map(s=>(
          <div key={s.id} onClick={()=>setPicked(s.id)} style={{...card({width:142,cursor:"pointer",border:`2px solid ${picked===s.id?s.c:DS.border}`,boxShadow:picked===s.id?`0 0 0 4px ${s.c}22,${DS.shadow}`:DS.shadow,transform:picked===s.id?"translateY(-3px)":"none"}),padding:"16px 14px"}}>
            <div style={{width:32,height:4,background:s.c,borderRadius:2,marginBottom:10}}/>
            <div style={{fontSize:13,fontWeight:600,color:DS.text,marginBottom:2}}>{s.n}</div>
            <div style={{fontSize:10,color:DS.text3,marginBottom:10}}>{s.sub}</div>
            <div style={{fontSize:10,color:DS.text2,marginBottom:5}}>Start: <strong>{s.bids} Bids</strong></div>
            <div style={{...pill(s.c+"15",s.c,{fontSize:9,marginBottom:7}),display:"block",borderRadius:4}}>{s.affL}</div>
            <div style={{fontSize:9,color:DS.text3,lineHeight:1.4}}>{s.pass}</div>
          </div>
        ))}
      </div>
      {picked&&<button onClick={()=>{setGs(initGame(picked));setScreen("game");}} style={{...btn(true,DS.text),padding:"12px 40px",fontSize:14,borderRadius:DS.radiusSm}}>Start Game →</button>}
    </div>
  );

  if (!gs) return null;

  // ═══════════════════════════════════════════════
  // END SCREEN
  // ═══════════════════════════════════════════════
  if (gs.phase==="endgame") {
    const hs=score(gs.human),as=score(gs.ai),youWin=hs.total>=as.total;
    return (
      <div style={{minHeight:"100vh",background:DS.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32}}>
        <div style={{fontSize:10,letterSpacing:4,color:DS.text3,marginBottom:10}}>GUILD AWARDS</div>
        <h1 style={{fontSize:40,fontWeight:700,color:DS.text,fontFamily:"Georgia,serif",marginBottom:8}}>{youWin?"You Win! 🎬":"Opponent Wins"}</h1>
        <p style={{color:youWin?"#1D9E75":"#E24B4A",fontSize:14,marginBottom:40,fontWeight:500}}>{youWin?`${gs.human.studio.n} leads the company.`:`${gs.ai.studio.n} proved their worth.`}</p>
        <div style={{display:"flex",gap:20,marginBottom:40,flexWrap:"wrap",justifyContent:"center"}}>
          {[{p:gs.human,s:hs,you:true},{p:gs.ai,s:as,you:false}].map(({p,s,you})=>(
            <div key={p.studio.id} style={{...card({minWidth:210,textAlign:"center",border:`2px solid ${you&&youWin?p.studio.c:DS.border}`}),padding:24}}>
              <div style={{...pill(p.studio.c+"15",p.studio.c,{fontSize:10,letterSpacing:1,marginBottom:8}),display:"inline-block"}}>{you?"YOU":"OPPONENT"}</div>
              <div style={{fontSize:16,fontWeight:600,color:DS.text,marginBottom:16,fontFamily:"Georgia,serif"}}>{p.studio.n}</div>
              {[["Films released",p.released.length],["Nominated",p.released.filter(m=>m.nominated).length],["Film pts",s.film],["Bid pts",s.bids]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:12}}>
                  <span style={{color:DS.text2}}>{l}</span><span style={{color:DS.text,fontWeight:500}}>{v}</span>
                </div>
              ))}
              <div style={{fontSize:28,fontWeight:700,color:p.studio.c,marginTop:14}}>{s.total} pts</div>
            </div>
          ))}
        </div>
        <button onClick={()=>{setGs(null);setScreen("setup");setSel([]);setPicked(null);}} style={{...btn(true,DS.text),padding:"10px 28px"}}>Play Again</button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // GAME BOARD
  // ═══════════════════════════════════════════════
  const g=gs, inActions=g.phase==="actions"&&g.human.ap>0;
  const phInfo={income:{label:"Income Roll",c:"#BA7517",bg:"#FAEEDA"},actions:{label:`Actions — ${g.human.ap} AP`,c:"#1D9E75",bg:"#E1F5EE"},table_bid:{label:"Table Bid",c:"#378ADD",bg:"#E6F1FB"},film_declare:{label:"Declare Subset",c:"#E24B4A",bg:"#FCEBEB"},ai_thinking:{label:"AI thinking…",c:DS.text2,bg:DS.surface2}};
  const ph=phInfo[g.phase]||{label:g.phase,c:DS.text2,bg:DS.surface2};
  const subPrev=g.phase==="film_declare"&&sel.length>0&&g.activeFilmRoll?(()=>{const subset=sel.map(u=>g.human.lot.find(c=>c.uid===u)).filter(Boolean);const{totalDice,genreBonus,passiveBonus}=subsetDiceInfo(subset,g.human.lot,g.activeFilmRoll.movie);const thresh=g.activeFilmRoll.movie.prod+g.activeFilmRoll.movie.delays;return{totalDice,genreBonus,passiveBonus,thresh,max:totalDice*6+genreBonus+passiveBonus};})():null;

  return (
    <div style={{minHeight:"100vh",background:DS.bg,display:"flex",flexDirection:"column",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",fontSize:12,color:DS.text}}>

      {/* HEADER */}
      <div style={{background:DS.surface,borderBottom:`1px solid ${DS.border}`,padding:"10px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:DS.text,letterSpacing:-.5}}>Reel Deal</span>
          <span style={pill(g.human.studio.c+"15",g.human.studio.c,{fontSize:10,fontWeight:600})}>{g.human.studio.n}</span>
        </div>
        <div style={{display:"flex",gap:20,alignItems:"center"}}>
          {[["TURN",`${g.turn}/${g.maxTurns}`,g.turn>=10?"#E24B4A":DS.text],[`YOUR BIDS`,g.human.bids,g.human.studio.c],["OPPONENT",g.ai.bids,DS.text2]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:8,color:DS.text3,letterSpacing:1}}>{l}</div></div>
          ))}
          <div style={{background:ph.bg,color:ph.c,border:`1px solid ${ph.c}44`,borderRadius:DS.radiusSm,padding:"5px 12px",fontSize:10,fontWeight:600}}>{ph.label}</div>
        </div>
      </div>

      <div style={{display:"flex",flex:1}}>

        {/* LEFT */}
        <div style={{width:210,background:DS.surface,borderRight:`1px solid ${DS.border}`,padding:14,overflowY:"auto",flexShrink:0,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{border:`1.5px solid ${g.ai.studio.c}44`,borderRadius:DS.radius,overflow:"hidden"}}>
            <div style={{height:4,background:g.ai.studio.c}}/>
            <div style={{padding:"10px 12px"}}>
              <div style={{fontSize:11,fontWeight:600,color:DS.text,marginBottom:1}}>{g.ai.studio.n}</div>
              <div style={{fontSize:9,color:DS.text3,marginBottom:10}}>{g.ai.studio.sub}</div>
              <div style={{display:"flex",gap:6}}>
                {[["BIDS",g.ai.bids,g.ai.studio.c],["FILMS",g.ai.released.length,"#BA7517"],["CREW",g.ai.lot.length,DS.text2]].map(([l,v,c])=>(
                  <div key={l} style={{flex:1,textAlign:"center",background:DS.surface2,borderRadius:5,padding:"5px 0"}}>
                    <div style={{fontSize:14,fontWeight:600,color:c}}>{v}</div>
                    <div style={{fontSize:7,color:DS.text3,letterSpacing:.5}}>{l}</div>
                  </div>
                ))}
              </div>
              {aiThinking&&<div style={{marginTop:8,textAlign:"center",fontSize:9,color:DS.text3}}>⏳ thinking…</div>}
            </div>
          </div>
          {g.ai.lot.length>0&&<div><div style={{fontSize:8,letterSpacing:1.5,color:DS.text3,fontWeight:600,marginBottom:6}}>OPPONENT LOT</div>{g.ai.lot.map(c=><div key={c.uid} style={{background:DS.surface2,border:`1px solid ${DS.border}`,borderRadius:5,padding:"3px 8px",marginBottom:2,display:"flex",justifyContent:"space-between"}}><span style={{color:DS.text2,fontSize:9}}>{c.n}</span><span style={{color:JC[c.t]||DS.text3,fontSize:8,fontWeight:600}}>{c.t==="rumors"?"P":`${c.d}◆`}</span></div>)}</div>}
          {g.ai.movies.length>0&&<div><div style={{fontSize:8,letterSpacing:1.5,color:DS.text3,fontWeight:600,marginBottom:6}}>IN PRODUCTION</div>{g.ai.movies.map(m=><div key={m.uid} style={{background:DS.surface2,border:`1px solid ${DS.border}`,borderRadius:5,padding:"4px 8px",marginBottom:2}}><div style={{fontSize:9,color:DS.text2,fontWeight:500}}>{m.title}</div><div style={{fontSize:8,color:DS.text3}}>P:{m.prod+m.delays}{m.delays>0&&<span style={{color:"#FF9800",marginLeft:3}}>D{m.delays}</span>}</div></div>)}</div>}
          <div>
            <div style={{fontSize:8,letterSpacing:1.5,color:DS.text3,fontWeight:600,marginBottom:8}}>CENTER ROW</div>
            {g.centerRow.length===0&&<div style={{color:DS.text3,fontSize:10,fontStyle:"italic"}}>Empty</div>}
            {g.centerRow.map(m=><div key={m.uid} style={{marginBottom:8}}><MovieMini m={m} compact onClick={inActions?()=>claimCenter(m.uid):null}/>{inActions&&<div style={{fontSize:8,color:"#1D9E75",marginTop:2,textAlign:"center",fontWeight:500}}>Claim — 1 AP</div>}</div>)}
            <div style={{fontSize:8,color:DS.text3,textAlign:"center"}}>Deck: {g.movieDeck.length} remaining</div>
          </div>
        </div>

        {/* CENTER */}
        <div style={{flex:1,padding:"16px 20px",overflowY:"auto",display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <div style={{fontSize:8,letterSpacing:1.5,color:DS.text3,fontWeight:600,marginBottom:8}}>YOUR STUDIO LOT</div>
            {g.human.lot.length===0&&<div style={{color:DS.text3,fontSize:11,fontStyle:"italic"}}>No crew yet — play cards from your hand.</div>}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{g.human.lot.map(c=><CrewMini key={c.uid} c={c} onClick={g.phase==="film_declare"&&c.t!=="rumors"&&c.pr?.id!=="e07"?()=>toggleSubset(c.uid):null} selected={sel.includes(c.uid)} dimmed={g.phase==="film_declare"&&c.t!=="rumors"&&c.pr?.id==="e07"}/>)}</div>
            {g.phase==="film_declare"&&<div style={{marginTop:6,fontSize:9,color:DS.text2}}>Click crew cards to add to your subset (max 4). Rumors contribute passively.</div>}
          </div>
          {subPrev&&<div style={{background:"#E1F5EE",border:"1px solid #1D9E7533",borderRadius:DS.radiusSm,padding:"10px 14px"}}>
            <div style={{fontSize:9,color:"#1D9E75",fontWeight:600,marginBottom:4}}>SUBSET PREVIEW</div>
            <div style={{fontSize:12,color:DS.text}}><strong>{subPrev.totalDice}d6</strong> + <span style={{color:"#BA7517"}}>+{subPrev.genreBonus+subPrev.passiveBonus} bonus</span> · Max: <strong style={{color:subPrev.max>=g.activeFilmRoll?.movie?.crit?"#BA7517":subPrev.max>=subPrev.thresh?"#1D9E75":"#E24B4A"}}>{subPrev.max}</strong> vs threshold <strong>{subPrev.thresh}</strong></div>
          </div>}
          {g.human.movies.length>0&&<div><div style={{fontSize:8,letterSpacing:1.5,color:DS.text3,fontWeight:600,marginBottom:8}}>YOUR MOVIES IN PRODUCTION</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{g.human.movies.map(m=><MovieMini key={m.uid} m={m} owned onClick={inActions&&g.human.ap>=2?()=>startFilmRoll(m.uid):null}/>)}</div></div>}
          {g.human.released.length>0&&<div><div style={{fontSize:8,letterSpacing:1.5,color:DS.text3,fontWeight:600,marginBottom:6}}>RELEASED FILMS</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{g.human.released.map(m=><div key={m.uid} style={{background:DS.surface,border:`1px solid ${m.nominated?"#BA751744":DS.border}`,borderRadius:6,padding:"5px 10px",display:"flex",alignItems:"center",gap:6,boxShadow:DS.shadow}}>{m.nominated&&<span style={{color:"#BA7517"}}>★</span>}<span style={{color:DS.text2,fontSize:10,fontWeight:500}}>{m.title}</span><span style={{color:"#1D9E75",fontSize:10,fontWeight:600}}>+{m.fin}</span></div>)}</div></div>}
          <div style={{...card(),padding:"12px 14px",marginTop:"auto"}}>
            <div style={{fontSize:8,letterSpacing:1.5,color:DS.text3,fontWeight:600,marginBottom:8}}>GAME LOG</div>
            <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:130,overflowY:"auto"}}>
              {(g.log||[]).map((msg,i)=><div key={i} style={{fontSize:10,color:i===0?DS.text:DS.text3,borderLeft:`2px solid ${i===0?g.human.studio.c:DS.border}`,paddingLeft:7,lineHeight:1.4}}>{msg}</div>)}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{width:256,background:DS.surface,borderLeft:`1px solid ${DS.border}`,padding:14,display:"flex",flexDirection:"column",gap:10,overflowY:"auto",flexShrink:0}}>

          {g.phase==="income"&&<div style={{...card(),padding:12}}>
            <div style={{fontSize:9,color:DS.text2,fontWeight:600,letterSpacing:1,marginBottom:8}}>CHOOSE YOUR INCOME DIE</div>
            {["standard","hotstreak","safebet","boom"].map(dt=>{
              const L={standard:"Standard D3",hotstreak:"Hot Streak",safebet:"Safe Bet",boom:"Boom or Bust"};
              const N={standard:"1·1·2·2·3·3 — avg 2.0",hotstreak:"1·2·3·3·3·3 — avg 2.5",safebet:"2·2·2·3·3·3 — avg 2.5",boom:"1·1·1·1·3·3 — risky"};
              const isAff=g.human.studio.aff===dt;
              return <button key={dt} onClick={()=>rollIncome(dt)} style={{width:"100%",background:isAff?g.human.studio.c+"12":DS.surface2,border:`1px solid ${isAff?g.human.studio.c:DS.border}`,borderRadius:6,padding:"8px 10px",marginBottom:4,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all .1s"}}>
                <div><div style={{fontSize:10,fontWeight:600,color:isAff?g.human.studio.c:DS.text}}>{L[dt]}{isAff&&<span style={{fontSize:8,color:g.human.studio.c,marginLeft:5}}>★</span>}</div><div style={{fontSize:8,color:DS.text3,marginTop:1}}>{N[dt]}</div></div>
                <span style={{fontSize:9,color:"#1D9E75",fontWeight:700}}>Roll →</span>
              </button>;
            })}
            {lastRoll&&<div style={{background:DS.surface2,border:`1px solid ${DS.border}`,borderRadius:6,padding:10,textAlign:"center",marginTop:6}}><div style={{fontSize:32,fontWeight:700,color:DS.text}}>{lastRoll.v}</div><div style={{fontSize:9,color:DS.text3}}>{lastRoll.t} die</div></div>}
          </div>}

          {g.phase==="table_bid"&&g.activeBid&&<div style={{...card(),padding:12}}>
            <div style={{fontSize:9,color:DS.text2,fontWeight:600,letterSpacing:1,marginBottom:6}}>TABLE BID</div>
            <div style={{fontSize:12,fontWeight:600,color:DS.text,marginBottom:2}}>{g.activeBid.movie.title}</div>
            <div style={{fontSize:10,color:DS.text2,marginBottom:10}}>Current: <strong style={{color:"#BA7517"}}>{g.activeBid.currentBid} Bids</strong>{g.activeBid.aiRaised&&<span style={{color:"#E24B4A",marginLeft:6,fontSize:9}}>↑ raised</span>}</div>
            <input type="range" min={g.activeBid.currentBid+1} max={Math.min(g.human.bids,30)} value={bidAmt} onChange={e=>setBidAmt(+e.target.value)} style={{width:"100%",marginBottom:6,accentColor:g.human.studio.c}}/>
            <div style={{textAlign:"center",fontSize:20,fontWeight:700,color:DS.text,marginBottom:10}}>{bidAmt} Bids</div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>submitBid(bidAmt)} style={{...btn(true,"#378ADD"),flex:1}}>Raise / Call</button>
              <button onClick={foldBid} style={{...btn(false),flex:1}}>Fold</button>
            </div>
          </div>}

          {g.phase==="film_declare"&&g.activeFilmRoll&&<div style={{...card(),padding:12}}>
            <div style={{fontSize:9,color:DS.text2,fontWeight:600,letterSpacing:1,marginBottom:4}}>FILM ROLL — SELECT SUBSET</div>
            <div style={{fontSize:11,fontWeight:500,color:DS.text,marginBottom:4}}>{g.activeFilmRoll.movie.title}</div>
            <div style={{fontSize:9,color:DS.text2,marginBottom:8}}>Click crew in your lot. Selected: <strong>{sel.length}</strong>/4</div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={confirmSubset} disabled={!sel.length} style={{...btn(sel.length>0,"#E24B4A"),flex:1}}>Roll the Dice</button>
              <button onClick={()=>{setSel([]);setGs(g2=>({...g2,phase:"actions",activeFilmRoll:null}));}} style={{...btn(false),flex:"0 0 52px",fontSize:10}}>Back</button>
            </div>
          </div>}

          {g.phase==="actions"&&<div style={{...card(),padding:12}}>
            <div style={{fontSize:9,color:DS.text2,fontWeight:600,letterSpacing:1,marginBottom:8}}>ACTIONS — {g.human.ap} AP left</div>
            {[{l:"Draw Crew Card",cost:"1 AP",fn:drawCrew,dis:g.human.ap<1||!g.crewDeck.length},{l:"Draw Event Card",cost:"1 AP",fn:drawEvent,dis:g.human.ap<1||!g.eventDeck.length},{l:"Draw Movie (triggers bid)",cost:"1 AP",fn:drawMovieBid,dis:g.human.ap<1||!g.movieDeck.length}].map(({l,cost,fn,dis})=>(
              <button key={l} onClick={!dis?fn:undefined} disabled={dis} style={{width:"100%",background:dis?DS.surface2:DS.surface,color:dis?DS.text3:DS.text,border:`1px solid ${dis?DS.border:DS.border2}`,borderRadius:5,padding:"7px 10px",fontSize:10,cursor:dis?"not-allowed":"pointer",marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all .1s"}}>
                <span>{l}</span><span style={{color:dis?DS.text3:"#1D9E75",fontSize:9,fontWeight:600}}>{cost}</span>
              </button>
            ))}
            <button onClick={endTurn} style={{...btn(true,DS.text),width:"100%",padding:"8px",marginTop:6}}>End Turn →</button>
          </div>}

          <div style={{...card(),padding:10}}>
            <div style={{fontSize:8,letterSpacing:1.5,color:DS.text3,fontWeight:600,marginBottom:8}}>SCORE</div>
            {[{p:g.human,you:true},{p:g.ai,you:false}].map(({p,you})=>{const s=score(p);return(
              <div key={p.studio.id} style={{marginBottom:you?8:0,paddingBottom:you?8:0,borderBottom:you?`1px solid ${DS.border}`:"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:2}}>
                  <span style={{fontSize:10,color:p.studio.c,fontWeight:600}}>{you?"You":p.studio.n}</span>
                  <span style={{fontSize:16,fontWeight:700,color:DS.text}}>{s.total}</span>
                </div>
                <div style={{fontSize:8,color:DS.text3}}>Films: {s.film} · Bids: {s.bids}</div>
              </div>
            );})}
          </div>

          <div>
            <div style={{fontSize:8,letterSpacing:1.5,color:DS.text3,fontWeight:600,marginBottom:8}}>YOUR HAND ({g.human.hand.length})</div>
            {g.human.hand.length===0&&<div style={{color:DS.text3,fontSize:10,fontStyle:"italic"}}>Empty</div>}
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {g.human.hand.map(c=>{const isCrew=["director","actor","producer","writer","cine","stunt","rumors"].includes(c.t);const col=isCrew?(JC[c.t]||"#888"):(EC[c.t]||"#888");return(
                <div key={c.uid} style={{...card({border:`1px solid ${col}22`}),padding:"8px 10px",display:"flex",gap:8,alignItems:"flex-start"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:8,color:col,fontWeight:700,marginBottom:2}}>{isCrew?`${c.t.toUpperCase()}${c.t!=="rumors"?` · ${c.d}◆ · r${c.r}+`:" · PASSIVE"}`:`${c.t.toUpperCase()}${c.sub?` · ${c.sub}`:""}`}</div>
                    <div style={{fontSize:11,fontWeight:500,color:DS.text,marginBottom:2,lineHeight:1.2}}>{c.n}</div>
                    <div style={{fontSize:9,color:DS.text2,lineHeight:1.3}}>{c.fx}</div>
                  </div>
                  {isCrew&&inActions&&<button onClick={()=>playCrew(c.uid)} style={{...btn(true,col),padding:"3px 8px",fontSize:8,whiteSpace:"nowrap",flexShrink:0}}>Play</button>}
                </div>
              );})}
            </div>
          </div>

        </div>
      </div>
      <style>{`*{box-sizing:border-box} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:${DS.bg}} ::-webkit-scrollbar-thumb{background:${DS.border2};border-radius:2px} button:hover:not(:disabled){filter:brightness(.96)}`}</style>
    </div>
  );
}