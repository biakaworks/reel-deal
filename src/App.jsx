import { useState, useCallback, useRef } from "react";

// ════════════════════════════════════════════════════════
// GAME DATA
// ════════════════════════════════════════════════════════

const D3F = { standard:[1,1,2,2,3,3], hotstreak:[1,2,3,3,3,3], safebet:[2,2,2,3,3,3], boom:[1,1,1,1,3,3] };
const JC = { director:"#E24B4A", actor:"#378ADD", producer:"#1D9E75", writer:"#BA7517", cine:"#7F77DD", stunt:"#D4537E", rumors:"#059669" };
const GC = { "Sci-Fi":["#E6F1FB","#0C447C"], Drama:["#FAECE7","#4A1B0C"], Action:["#FCEBEB","#791F1F"], Comedy:["#FAEEDA","#633806"], Thriller:["#EEEDFE","#26215C"] };

const STUDIOS = [
  { id:"apex",   n:"Apex Pictures",       sub:"Risk Taker",       bids:8,  c:"#E24B4A", aff:"boom",     affL:"Boom or Bust",  afxN:"Roll 3 → roll again, add both",       pass:"Leverage: Once per game, retry a failed Film Roll with a new subset." },
  { id:"nova",   n:"Nova Films",           sub:"The Grinder",      bids:14, c:"#378ADD", aff:"standard", affL:"Standard D3",   afxN:"Roll 1 → treat as 2 (min income 2)",  pass:"Reliable Output: Once per turn, declare a 5th Crew in subset for eligibility (no dice)." },
  { id:"golden", n:"Golden Gate Studios",  sub:"Genre Specialist",  bids:11, c:"#BA7517", aff:"hotstreak",affL:"Hot Streak",    afxN:"Roll 3 → draw 1 card immediately",    pass:"Signature Style: Choose 1 genre. Benched Crew with that genre give +1 die." },
  { id:"mid",    n:"Midnight Reel",        sub:"Dark Horse",        bids:10, c:"#1D9E75", aff:"safebet",  affL:"Safe Bet",      afxN:"Once per game: reroll, take higher",   pass:"Comeback Kid: When Headhunted, draw 2 cards immediately." },
  { id:"pin",    n:"Pinnacle Studios",     sub:"Power Player",      bids:9,  c:"#7F77DD", aff:"boom",     affL:"Boom or Bust",  afxN:"Roll 1 → steal 1 Bid from richest",   pass:"Hostile Takeover: Once per turn, force opponent to reveal their Film Roll subset." },
  { id:"cent",   n:"Century Films",        sub:"Deep Pockets",      bids:12, c:"#D4537E", aff:"hotstreak",affL:"Hot Streak",    afxN:"Roll 3 → +1 Bid toward Table Bids",   pass:"War Chest: Before income roll, spend Bids to draw that many cards." },
];

const CREW = [
  {id:"c01",t:"director",n:"Staff Director",   g:["Comedy","Drama"],   d:1,r:5,  fx:"Gain 2 Bids."},
  {id:"c02",t:"director",n:"Vera Santos",       g:["Drama","Thriller"], d:2,r:7,  fx:"Remove 1 Delay from any Movie you own."},
  {id:"c03",t:"director",n:"Marcus Webb",       g:["Action","Sci-Fi"],  d:2,r:6,  fx:"Draw 1 card from either deck."},
  {id:"c04",t:"director",n:"Sofia Reyes",       g:["Drama","Thriller"], d:3,r:9,  fx:"Your next Film Roll +2 to total."},
  {id:"c05",t:"director",n:"The Legend",        g:["Any"],              d:3,r:10, fx:"Remove all Delays from any Movie in play."},
  {id:"c06",t:"actor",   n:"Background Extra",  g:["Comedy","Action"],  d:1,r:4,  fx:"Gain 2 Bids."},
  {id:"c07",t:"actor",   n:"The Understudy",    g:["Drama","Comedy"],   d:1,r:5,  fx:"Draw 1 Crew card."},
  {id:"c08",t:"actor",   n:"Jamie Cross",       g:["Drama","Thriller"], d:2,r:7,  fx:"Steal 1 Bid from opponent."},
  {id:"c09",t:"actor",   n:"Action Hero",       g:["Action","Sci-Fi"],  d:2,r:7,  fx:"Your Film Roll this turn +2."},
  {id:"c10",t:"actor",   n:"Rosa Lima",         g:["Sci-Fi","Thriller"],d:3,r:9,  fx:"Remove all Bad PR from any Crew."},
  {id:"c11",t:"actor",   n:"The A-Lister",      g:["Any"],              d:3,r:9,  fx:"Draw 3 cards from any decks."},
  {id:"c12",t:"producer",n:"Line Producer",     g:["Comedy","Action"],  d:1,r:5,  fx:"Gain 2 Bids."},
  {id:"c13",t:"producer",n:"The Financier",     g:["Drama","Sci-Fi"],   d:2,r:7,  fx:"Gain 3 Bids."},
  {id:"c14",t:"producer",n:"The Greenlight",    g:["Any"],              d:3,r:7,  fx:"SPECIAL: 5th subset slot for eligibility. Gain 2 Bids."},
  {id:"c15",t:"writer",  n:"Staff Writer",      g:["Comedy","Drama"],   d:1,r:5,  fx:"Draw 2 cards."},
  {id:"c16",t:"writer",  n:"Dana Park",         g:["Drama","Sci-Fi"],   d:2,r:7,  fx:"Draw 2 Event cards."},
  {id:"c17",t:"writer",  n:"Award Winner",      g:["Drama"],            d:3,r:9,  fx:"If in subset when Nominated, draw 2 cards."},
  {id:"c18",t:"cine",    n:"The DP",            g:["Sci-Fi","Drama"],   d:2,r:7,  fx:"Your Film Roll this turn +2."},
  {id:"c19",t:"cine",    n:"The Artist",        g:["Sci-Fi","Drama"],   d:3,r:9,  fx:"If in Nominated subset: steal 1 Bid from each opponent."},
  {id:"c20",t:"stunt",   n:"The Specialist",    g:["Action","Sci-Fi"],  d:2,r:8,  fx:"Ignore Bad PR dice penalties this Film Roll."},
  {id:"c21",t:"stunt",   n:"The Franchise",     g:["Action","Sci-Fi"],  d:3,r:10, fx:"After Film Roll success: attempt another for free."},
  {id:"c22",t:"rumors",  n:"Industry Insider",  g:["Any"],              d:0,r:0,  fx:"PASSIVE: All your Film Rolls +1 to total."},
  {id:"c23",t:"rumors",  n:"The Veteran",       g:["Any"],              d:0,r:0,  fx:"PASSIVE: Director eligibility always met."},
  {id:"c24",t:"rumors",  n:"The Fixer",         g:["Any"],              d:0,r:0,  fx:"PASSIVE: Bad PR removal succeeds on 3+."},
];

const EVENTS = [
  {id:"e01",t:"pr",     n:"Golden Buzz",       fx:"+1 die on all Film Rolls.",         v:"plus_die"},
  {id:"e02",t:"pr",     n:"Star Power",         fx:"Tier up: Entry→Mid, Mid→Star.",     v:"tier_up"},
  {id:"e03",t:"pr",     n:"Method Acting",      fx:"+1 die. Cannot be Film Sabotaged.", v:"plus_die_safe"},
  {id:"e04",t:"pr",     n:"Critics Darling",    fx:"+2 to Critical rolls only.",        v:"crit_plus2"},
  {id:"e05",t:"pr",     n:"Award Favorite",     fx:"If Nominated: gain 3 Bids.",        v:"nom_bids"},
  {id:"e06",t:"badpr",  n:"Paparazzi Bait",     fx:"-1 die to Film Rolls (min 0).",     v:"minus_die"},
  {id:"e07",t:"badpr",  n:"Public Meltdown",    fx:"Cannot enter any Film Roll subset.", v:"no_subset"},
  {id:"e08",t:"badpr",  n:"Contract Dispute",   fx:"Pay 1 Bid per turn or discard.",    v:"bid_drain"},
  {id:"e09",t:"badpr",  n:"Scandal Piece",      fx:"Effect roll requirement +2.",        v:"roll_plus2"},
  {id:"e10",t:"tabloid",n:"Walk of Fame",        fx:"One Crew permanently +1 die."},
  {id:"e11",t:"tabloid",n:"Rival Offer",         fx:"Sabotage Window: steal 1 Crew from subset auto.",sub:"headhunt"},
  {id:"e12",t:"tabloid",n:"Press Junket",        fx:"Remove all Bad PR from your Crew."},
  {id:"e13",t:"tabloid",n:"Bomb Scare",          fx:"Place 1 Delay on any opponent Movie."},
  {id:"e14",t:"tabloid",n:"Directors Cut",       fx:"Attempt a Film Roll this turn for free."},
  {id:"e15",t:"tabloid",n:"Streaming Deal",      fx:"Gain Bids = Film Value. +1 Delay on that Movie."},
  {id:"e16",t:"connections",n:"Lucky Break",     fx:"+3 to any roll.",   sub:"instant"},
  {id:"e17",t:"connections",n:"Overtime",        fx:"+2 to Film Roll.",  sub:"film only"},
  {id:"e18",t:"connections",n:"Studio Pressure", fx:"-3 to any roll.",   sub:"instant"},
  {id:"e19",t:"drama",  n:"Thats a Wrap",        fx:"Remove one Crew from subset.",sub:"sabotage"},
  {id:"e20",t:"drama",  n:"Power Play",          fx:"Card Interrupt OR Film Sabotage.",sub:"either"},
  {id:"e21",t:"drama",  n:"Final Cut",           fx:"Film Roll total -5 after dice.",sub:"sabotage"},
  {id:"e22",t:"drama",  n:"Not On My Watch",     fx:"Cancel any Crew or PR being played.",sub:"interrupt"},
];

const MOVIES = [
  {id:"m01",title:"Neon Requiem",    genre:"Sci-Fi",  prod:17,crit:22,fin:6, req:{director:1,actor:1,writer:1},           fx:"Draw 1 card."},
  {id:"m02",title:"Coffee and Rain", genre:"Drama",   prod:17,crit:22,fin:5, req:{director:1,actor:1,writer:1},           fx:"All opponents gain 1 Bid."},
  {id:"m03",title:"Midnight in Rome",genre:"Comedy",  prod:16,crit:21,fin:5, req:{director:1,actor:1,producer:1},         fx:"Draw 2 cards."},
  {id:"m04",title:"Last Goodbye",    genre:"Drama",   prod:23,crit:29,fin:5, req:{director:1,actor:2,writer:1},           fx:"Opponents discard 1 card."},
  {id:"m05",title:"Boom Town",       genre:"Action",  prod:24,crit:31,fin:7, req:{director:1,actor:2,producer:1,writer:1},fx:"Steal 1 Bid from each opponent."},
  {id:"m06",title:"The Collapse",    genre:"Thriller",prod:25,crit:32,fin:8, req:{director:1,actor:1,writer:1,cine:1},    fx:"Look at top 3 cards of any deck."},
  {id:"m07",title:"Digital Ghost",   genre:"Sci-Fi",  prod:23,crit:30,fin:7, req:{director:1,actor:1,writer:1,producer:1},fx:"Remove all Delays from any Movie."},
  {id:"m08",title:"Iron Soul",       genre:"Action",  prod:26,crit:34,fin:8, req:{director:1,actor:2,producer:1,stunt:1}, fx:"Roll income die again and gain that amount."},
];

// ════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════

const uid = () => Math.random().toString(36).slice(2,9);
const shuffle = a => { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=0|Math.random()*(i+1);[b[i],b[j]]=[b[j],b[i]];} return b; };
const rollD6 = () => (Math.random()*6|0)+1;
const rollD3 = t => { const f=D3F[t]||D3F.standard; return f[Math.random()*6|0]; };
const rollNd6 = n => Array.from({length:Math.max(1,n)},rollD6);

function checkElig(movie, lot) {
  const hasVet = lot.some(c=>c.id==="c23");
  const need = {...movie.req};
  if (hasVet && need.director) delete need.director;
  const have = {};
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
      if (c.pr.id==="e07") d = 0; // public meltdown in subset (shouldn't happen but guard)
    }
    totalDice += d;
  });
  const mGenre = movie.genre;
  const inSub = subset.filter(c=>c.g&&(c.g.includes(mGenre)||c.g.includes("Any"))).length;
  const benched = lot.filter(c=>c.t==="rumors"&&(c.g.includes(mGenre)||c.g.includes("Any"))).length;
  const matches = Math.min(inSub+benched, 4);
  const genreBonus = matches>=4?3:matches>=3?2:matches>=2?1:0;
  const passiveBonus = lot.some(c=>c.id==="c22") ? 1 : 0;
  return { totalDice, genreBonus, passiveBonus, matches, total: totalDice };
}

function initGame(studioId) {
  const studio = STUDIOS.find(s=>s.id===studioId);
  const others = STUDIOS.filter(s=>s.id!==studioId);
  const aiStudio = others[Math.random()*others.length|0];
  const crewDeck  = shuffle([...CREW]).map(c=>({...c,uid:uid()}));
  const eventDeck = shuffle([...EVENTS]).map(e=>({...e,uid:uid()}));
  const movieDeck = shuffle([...MOVIES]).map(m=>({...m,delays:0,uid:uid()}));
  const hHand = crewDeck.splice(0,5);
  const aHand = crewDeck.splice(0,5);
  const centerRow = movieDeck.splice(0,2);
  return {
    turn:1, maxTurns:12, phase:"income",
    human:{ studio, hand:hHand, lot:[], movies:[], released:[], bids:studio.bids, ap:3 },
    ai:   { studio:aiStudio, hand:aHand, lot:[], movies:[], released:[], bids:aiStudio.bids, sigGenre:"Drama" },
    crewDeck, eventDeck, movieDeck, centerRow,
    activeBid:null, activeFilmRoll:null,
    log:[
      `Welcome to Reel Deal!`,
      `You are ${studio.n} — ${studio.sub}. Starting Bids: ${studio.bids}.`,
      `Opponent: ${aiStudio.n} — ${aiStudio.sub}.`,
      `Turn 1: Roll your income die to begin.`,
    ],
  };
}

// ════════════════════════════════════════════════════════
// AI ENGINE  (Claude API)
// ════════════════════════════════════════════════════════

async function getAIDecision(g) {
  const eligible = g.ai.movies.filter(m=>checkElig(m,g.ai.lot));
  const prompt = `You are ${g.ai.studio.n} (${g.ai.studio.sub}) in Reel Deal, a competitive movie studio card game. Respond with valid JSON only, no markdown fences.

GAME STATE — Turn ${g.turn}/${g.maxTurns}
Your Bids: ${g.ai.bids}
Your Lot: ${g.ai.lot.map(c=>`${c.uid}:${c.n}(${c.t},${c.d}d)`).join(", ")||"empty"}
Your Hand: ${g.ai.hand.map(c=>`${c.uid}:${c.n}[${c.t}]`).join(", ")||"empty"}
Your Movies: ${g.ai.movies.map(m=>`${m.uid}:${m.title}(${m.genre},prod=${m.prod+m.delays},delays=${m.delays})`).join(", ")||"none"}
Eligible Film Rolls: ${eligible.map(m=>`${m.uid}:${m.title}`).join(", ")||"none"}
Center Row: ${g.centerRow.map(m=>`${m.uid}:${m.title}(${m.genre},fin=${m.fin},req=${Object.entries(m.req).map(([k,v])=>k+"x"+v).join("+")})`).join("; ")||"empty"}
Opponent: ${g.human.bids} Bids, lot=${g.human.lot.length} crew, movies=${g.human.movies.length}, released=${g.human.released.length}
Movie Deck remaining: ${g.movieDeck.length}

STRATEGY TIPS:
- Prioritize film rolls if you have eligible movies
- Play crew cards to build your lot
- Draw a movie if you have enough bids and crew to support it
- A movie needs matching crew types in your lot to be eligible for film roll

REQUIRED JSON format:
{
  "die": "standard|hotstreak|safebet|boom",
  "playCrewUids": ["uid"],
  "filmRollMovieUid": "uid or null",
  "filmRollSubsetUids": ["uid","uid"],
  "drawMovie": true|false,
  "movieBidAmount": 0,
  "say": "one sentence flavor"
}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true"
},
      body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:600, messages:[{role:"user",content:prompt}] })
    });
    const data = await res.json();
    const txt = data.content?.find(b=>b.type==="text")?.text || "{}";
    return JSON.parse(txt.replace(/```json|```/g,"").trim());
  } catch {
    return { die:"standard", playCrewUids:[], filmRollMovieUid:null, filmRollSubsetUids:[], drawMovie:false, movieBidAmount:0, say:"Keeping it steady." };
  }
}

// ════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════

export default function ReelDeal() {
  const [screen, setScreen] = useState("setup");
  const [gs, setGs]         = useState(null);
  const [pickedStudio, setPickedStudio] = useState(null);
  const [sel, setSel]       = useState([]);    // subset selection uids
  const [bidAmt, setBidAmt] = useState(1);
  const [aiThinking, setAiThinking] = useState(false);
  const [lastRoll, setLastRoll] = useState(null);
  const aiLock = useRef(false);

  // ── state helpers ──
  const addLog = (msg, g) => ({...g, log:[msg,...(g.log||[])].slice(0,30)});

  // ── AI TURN ──
  async function runAITurn(g) {
    if (aiLock.current) return;
    aiLock.current = true;
    setAiThinking(true);
    let g2 = {...g};

    const dec = await getAIDecision(g2);

    // Income roll
    const dType = ["standard","hotstreak","safebet","boom"].includes(dec.die) ? dec.die : "standard";
    const income = rollD3(dType);
    g2.ai = {...g2.ai, bids: g2.ai.bids+income};
    g2 = addLog(`${g2.ai.studio.n}: Rolls ${g2.ai.studio.affL} → +${income} Bids. ${dec.say||""}`, g2);

    // Play crew from hand
    const toPlay = (dec.playCrewUids||[]).slice(0,2);
    toPlay.forEach(u => {
      const i = g2.ai.hand.findIndex(c=>c.uid===u);
      if (i!==-1) {
        const card = g2.ai.hand[i];
        g2.ai = {...g2.ai, hand:g2.ai.hand.filter((_,j)=>j!==i), lot:[...g2.ai.lot,card]};
        g2 = addLog(`${g2.ai.studio.n}: Plays ${card.n} (${card.t}) into Studio Lot.`, g2);
      }
    });

    // Film Roll
    if (dec.filmRollMovieUid && (dec.filmRollSubsetUids||[]).length>0) {
      const mi = g2.ai.movies.findIndex(m=>m.uid===dec.filmRollMovieUid);
      if (mi!==-1) {
        const movie = g2.ai.movies[mi];
        const subset = dec.filmRollSubsetUids.map(u=>g2.ai.lot.find(c=>c.uid===u)).filter(Boolean);
        if (subset.length>0 && checkElig(movie,g2.ai.lot)) {
          const {totalDice,genreBonus,passiveBonus} = subsetDiceInfo(subset,g2.ai.lot,movie);
          const rolls = rollNd6(totalDice);
          const total = rolls.reduce((a,b)=>a+b,0)+genreBonus+passiveBonus;
          const thresh = movie.prod+movie.delays;
          g2 = addLog(`${g2.ai.studio.n}: Film Roll "${movie.title}" — [${rolls.join(",")}]+${genreBonus+passiveBonus} = ${total} vs ${thresh}`, g2);
          if (total >= movie.crit) {
            g2.ai = {...g2.ai, bids:g2.ai.bids+movie.fin, movies:g2.ai.movies.filter((_,j)=>j!==mi), released:[...g2.ai.released,{...movie,nominated:true}]};
            g2 = addLog(`🌟 NOMINATED! ${g2.ai.studio.n} releases "${movie.title}" — earns ${movie.fin} Bids.`, g2);
          } else if (total >= thresh) {
            g2.ai = {...g2.ai, bids:g2.ai.bids+movie.fin, movies:g2.ai.movies.filter((_,j)=>j!==mi), released:[...g2.ai.released,{...movie,nominated:false}]};
            g2 = addLog(`✅ ${g2.ai.studio.n} releases "${movie.title}" — earns ${movie.fin} Bids.`, g2);
          } else {
            const nm = g2.ai.movies.map((m,j)=>j===mi?{...m,delays:m.delays+1}:m);
            if (movie.delays+1 >= 3) {
              const pen = Math.floor(movie.fin/2);
              g2.ai = {...g2.ai, bids:Math.max(0,g2.ai.bids-pen), movies:g2.ai.movies.filter((_,j)=>j!==mi)};
              g2 = addLog(`💥 BOX OFFICE BOMB! "${movie.title}" bombed. ${g2.ai.studio.n} loses ${pen} Bids.`, g2);
            } else {
              g2.ai = {...g2.ai, movies:nm};
              g2 = addLog(`❌ ${g2.ai.studio.n}: Roll failed. "${movie.title}" Delay: ${nm[mi].delays}.`, g2);
            }
          }
        }
      }
    }

    // Draw movie
    if (dec.drawMovie && dec.movieBidAmount>0 && g2.movieDeck.length>0) {
      const movie = {...g2.movieDeck[0], delays:0};
      g2.movieDeck = g2.movieDeck.slice(1);
      const aiBid = Math.min(dec.movieBidAmount, g2.ai.bids);
      // Human can't respond during AI turn (simplification)
      g2.ai = {...g2.ai, bids:g2.ai.bids-aiBid, movies:[...g2.ai.movies,movie]};
      g2 = addLog(`${g2.ai.studio.n}: Draws & wins "${movie.title}" at ${aiBid} Bids.`, g2);
      while (g2.centerRow.length<2 && g2.movieDeck.length>0) {
        g2.centerRow = [...g2.centerRow, {...g2.movieDeck[0],delays:0}];
        g2.movieDeck = g2.movieDeck.slice(1);
      }
    }

    // Advance turn
    const newTurn = g2.turn+1;
    if (newTurn > g2.maxTurns) {
      g2 = {...g2, phase:"endgame"};
    } else {
      g2 = addLog(`Turn ${newTurn} begins — your move.`, {...g2, turn:newTurn, phase:"income", human:{...g2.human,ap:3}});
    }

    setGs(g2);
    setAiThinking(false);
    aiLock.current = false;
  }

  // ── SCORING ──
  function score(p) {
    const film = p.released.reduce((s,m)=>s+m.fin,0);
    const bids = Math.floor(p.bids/2);
    const nom  = p.released.filter(m=>m.nominated).length;
    return { film, bids, nom, total: film+bids };
  }

  // ── HUMAN ACTION HANDLERS ──
  function rollIncome(dieType) {
    setGs(g => {
      const v = rollD3(dieType);
      setLastRoll({v, t:dieType});
      setTimeout(()=>setLastRoll(null), 1800);
      const g2 = addLog(`You roll ${g.human.studio.affL} die → ${v} Bids (${g.human.bids+v} total).`, g);
      return {...g2, phase:"actions", human:{...g2.human, bids:g2.human.bids+v, ap:3}};
    });
  }

  function drawCrew() {
    setGs(g => {
      if (g.human.ap<1 || !g.crewDeck.length) return g;
      const card = g.crewDeck[0];
      return addLog(`Drew ${card.n} (${card.t}).`, {...g, human:{...g.human, hand:[...g.human.hand,card], ap:g.human.ap-1}, crewDeck:g.crewDeck.slice(1)});
    });
  }

  function drawEvent() {
    setGs(g => {
      if (g.human.ap<1 || !g.eventDeck.length) return g;
      const card = g.eventDeck[0];
      return addLog(`Drew ${card.n} (${card.t}).`, {...g, human:{...g.human, hand:[...g.human.hand,card], ap:g.human.ap-1}, eventDeck:g.eventDeck.slice(1)});
    });
  }

  function playCrew(cuid) {
    setGs(g => {
      if (g.human.ap<1) return g;
      const i = g.human.hand.findIndex(c=>c.uid===cuid);
      if (i===-1) return g;
      const card = g.human.hand[i];
      const crewTypes = ["director","actor","producer","writer","cine","stunt","rumors"];
      if (!crewTypes.includes(card.t)) return g;
      return addLog(`${card.n} joins your Studio Lot.`, {...g, human:{...g.human, hand:g.human.hand.filter((_,j)=>j!==i), lot:[...g.human.lot,card], ap:g.human.ap-1}});
    });
  }

  function drawMovieTriggerBid() {
    setGs(g => {
      if (g.human.ap<1 || !g.movieDeck.length) return g;
      const movie = {...g.movieDeck[0], delays:0};
      setBidAmt(1);
      const g2 = addLog(`You draw "${movie.title}" (${movie.genre}). Table Bid opens — you must open first!`, {...g, movieDeck:g.movieDeck.slice(1), human:{...g.human,ap:g.human.ap-1}});
      return {...g2, phase:"table_bid", activeBid:{movie, currentBid:0, aiBid:0, humanBid:0, aiRaised:false}};
    });
  }

  function submitBid(amount) {
    setGs(g => {
      if (!g.activeBid) return g;
      const bid = Math.max(1, amount);
      if (bid > g.human.bids) return addLog("Not enough Bids!", g);
      let g2 = addLog(`You bid ${bid} on "${g.activeBid.movie.title}".`, g);
      const movie = g.activeBid.movie;
      // AI counter-bid logic
      const aiValue = movie.fin + (checkElig(movie,g2.ai.lot)?3:1);
      const aiMax   = Math.floor(g2.ai.bids*0.6);
      const shouldRaise = aiValue > bid+1 && bid+1 <= aiMax && !g.activeBid.aiRaised;
      if (shouldRaise) {
        const raise = Math.min(bid + (Math.random()*2|0) + 1, aiMax);
        g2 = addLog(`${g2.ai.studio.n} raises to ${raise}!`, g2);
        setBidAmt(raise+1);
        return {...g2, activeBid:{...g2.activeBid, currentBid:raise, aiBid:raise, humanBid:bid, aiRaised:true}};
      }
      // Human wins
      g2 = addLog(`You win "${movie.title}" at ${bid} Bids!`, g2);
      g2 = {...g2, human:{...g2.human, bids:g2.human.bids-bid, movies:[...g2.human.movies,movie]}, activeBid:null, phase:"actions"};
      while (g2.centerRow.length<2 && g2.movieDeck.length>0) {
        g2.centerRow=[...g2.centerRow,{...g2.movieDeck[0],delays:0}];
        g2.movieDeck=g2.movieDeck.slice(1);
      }
      return g2;
    });
  }

  function foldBid() {
    setGs(g => {
      if (!g.activeBid) return g;
      const ab = g.activeBid;
      const winBid = ab.aiBid || 1;
      let g2 = addLog(`You fold. ${g.ai.studio.n} wins "${ab.movie.title}" at ${winBid} Bids.`, g);
      g2 = {...g2, ai:{...g2.ai, bids:g2.ai.bids-winBid, movies:[...g2.ai.movies,ab.movie]}, activeBid:null, phase:"actions"};
      while (g2.centerRow.length<2 && g2.movieDeck.length>0) {
        g2.centerRow=[...g2.centerRow,{...g2.movieDeck[0],delays:0}];
        g2.movieDeck=g2.movieDeck.slice(1);
      }
      return g2;
    });
  }

  function claimCenter(muid) {
    setGs(g => {
      if (g.human.ap<1) return g;
      const i = g.centerRow.findIndex(m=>m.uid===muid);
      if (i===-1) return g;
      const movie = g.centerRow[i];
      return addLog(`Claimed "${movie.title}" from Center Row.`, {...g, human:{...g.human,ap:g.human.ap-1,movies:[...g.human.movies,movie]}, centerRow:g.centerRow.filter((_,j)=>j!==i)});
    });
  }

  function startFilmRoll(muid) {
    setGs(g => {
      if (g.human.ap<2) return addLog("Need 2 AP for a Film Roll.",g);
      const movie = g.human.movies.find(m=>m.uid===muid);
      if (!movie) return g;
      if (!checkElig(movie, g.human.lot)) return addLog("You don't meet eligibility requirements for this movie.",g);
      setSel([]);
      return {...g, phase:"film_declare", activeFilmRoll:{movie}};
    });
  }

  function toggleSubset(cuid) {
    setSel(s => s.includes(cuid) ? s.filter(u=>u!==cuid) : s.length<4 ? [...s,cuid] : s);
  }

  function confirmSubset() {
    setGs(g => {
      if (!g.activeFilmRoll || !sel.length) return g;
      const movie = g.activeFilmRoll.movie;
      const subset = sel.map(u=>g.human.lot.find(c=>c.uid===u)).filter(Boolean);
      const {totalDice,genreBonus,passiveBonus} = subsetDiceInfo(subset,g.human.lot,movie);
      const rolls = rollNd6(totalDice);
      const rawTotal = rolls.reduce((a,b)=>a+b,0);
      const total = rawTotal+genreBonus+passiveBonus;
      const thresh = movie.prod+movie.delays;
      let g2 = addLog(`Film Roll: [${rolls.join(",")}] +${genreBonus+passiveBonus} bonus = ${total} (need ${thresh}, crit ${movie.crit})`, g);
      setSel([]);
      if (total >= movie.crit) {
        g2 = addLog(`🌟 NOMINATED! "${movie.title}" earns ${movie.fin} Bids. Critical success!`, g2);
        return {...g2, phase:"actions", activeFilmRoll:null,
          human:{...g2.human, bids:g2.human.bids+movie.fin, movies:g2.human.movies.filter(m=>m.uid!==movie.uid), released:[...g2.human.released,{...movie,nominated:true}], ap:g2.human.ap-2}};
      } else if (total >= thresh) {
        g2 = addLog(`✅ "${movie.title}" released! You earn ${movie.fin} Bids.`, g2);
        return {...g2, phase:"actions", activeFilmRoll:null,
          human:{...g2.human, bids:g2.human.bids+movie.fin, movies:g2.human.movies.filter(m=>m.uid!==movie.uid), released:[...g2.human.released,{...movie,nominated:false}], ap:g2.human.ap-2}};
      } else {
        const delays = movie.delays+1;
        if (delays>=3) {
          const pen = Math.floor(movie.fin/2);
          g2 = addLog(`💥 BOX OFFICE BOMB! "${movie.title}" discarded. Lose ${pen} Bids.`, g2);
          return {...g2, phase:"actions", activeFilmRoll:null,
            human:{...g2.human, bids:Math.max(0,g2.human.bids-pen), movies:g2.human.movies.filter(m=>m.uid!==movie.uid), ap:g2.human.ap-2}};
        }
        g2 = addLog(`❌ Roll failed (${total} < ${thresh}). Delay token: ${delays}. New threshold: ${thresh+1}.`, g2);
        return {...g2, phase:"actions", activeFilmRoll:null,
          human:{...g2.human, movies:g2.human.movies.map(m=>m.uid===movie.uid?{...m,delays}:m), ap:g2.human.ap-2}};
      }
    });
  }

  function endTurn() {
    setGs(g => {
      const g2 = addLog("You end your turn.", {...g, phase:"ai_thinking"});
      setTimeout(()=>runAITurn(g2), 700);
      return g2;
    });
  }

  // ════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ════════════════════════════════════════════════════════

  const S = { // style shortcuts
    card: (extra={}) => ({borderRadius:8,border:"1px solid #2a2a2a",background:"#141414",overflow:"hidden",flexShrink:0,...extra}),
    pill: (bg,c) => ({display:"inline-block",background:bg,color:c,fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:20,fontFamily:"sans-serif"}),
    btn: (on=true,accent="#1565C0") => ({background:on?accent:"#1a1a1a",color:on?"#fff":"#444",border:`1px solid ${on?accent+"88":"#2a2a2a"}`,borderRadius:6,padding:"6px 10px",fontSize:11,fontWeight:600,cursor:on?"pointer":"not-allowed",fontFamily:"sans-serif",transition:"all .15s"}),
  };

  function MiniCrew({c, onClick, selected, dimmed}) {
    const col = JC[c.t]||"#888";
    return (
      <div onClick={onClick} style={{...S.card(), width:98, cursor:onClick?"pointer":"default", opacity:dimmed?.4:1, border:`1.5px solid ${selected?col:"#2a2a2a"}`, boxShadow:selected?`0 0 10px ${col}44`:"none", transition:"all .15s"}}>
        <div style={{height:3,background:col}}/>
        <div style={{padding:"5px 7px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
            <span style={{fontSize:8,fontWeight:700,color:col,fontFamily:"sans-serif"}}>{c.t.slice(0,3).toUpperCase()}</span>
            {c.t!=="rumors"?<span style={{fontSize:8,color:"#444",fontFamily:"sans-serif"}}>{c.d}◆</span>:<span style={{fontSize:7,color:col,fontFamily:"sans-serif"}}>P</span>}
          </div>
          <div style={{fontSize:10,fontWeight:500,color:"#eee",lineHeight:1.2,fontFamily:"sans-serif"}}>{c.n}</div>
          {c.pr&&<div style={{fontSize:8,color:c.pr.t==="badpr"?"#E24B4A":"#639922",marginTop:2,fontFamily:"sans-serif"}}>{c.pr.n}</div>}
        </div>
      </div>
    );
  }

  function MovieCard({m, onClick, owned, small}) {
    const [gb,gt] = GC[m.genre]||["#222","#aaa"];
    const gcMap = {director:"#E24B4A",actor:"#378ADD",producer:"#1D9E75",writer:"#BA7517",cine:"#7F77DD",stunt:"#D4537E"};
    const stripeC = {Sci:"#378ADD",Dra:"#D85A30",Act:"#E24B4A",Com:"#BA7517",Thr:"#7F77DD"}[m.genre.slice(0,3)]||"#888";
    const canRoll = owned && checkElig(m, gs?.human?.lot||[]);
    return (
      <div onClick={onClick} style={{...S.card(), width:small?110:128, cursor:onClick?"pointer":"default", border:`1.5px solid ${owned?"#333":"#1a1a1a"}`, position:"relative"}}>
        {m.delays>0&&<div style={{position:"absolute",top:4,right:4,background:"#FF9800",color:"#000",fontSize:8,fontWeight:700,padding:"1px 4px",borderRadius:3,fontFamily:"sans-serif",zIndex:1}}>D{m.delays}</div>}
        <div style={{height:3,background:stripeC}}/>
        <div style={{padding:"7px 8px"}}>
          <span style={S.pill(gb,gt)}>{m.genre}</span>
          <div style={{fontSize:small?10:11,fontWeight:500,color:"#fff",margin:"4px 0 6px",lineHeight:1.2,fontFamily:"sans-serif"}}>{m.title}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2,marginBottom:5}}>
            {[["P",m.prod+m.delays,"#ccc"],["C",m.crit,"#BA7517"],["$",m.fin,"#1D9E75"]].map(([l,v,c])=>(
              <div key={l} style={{textAlign:"center",background:"#0a0a0a",borderRadius:3,padding:"2px 0"}}>
                <div style={{fontSize:13,fontWeight:600,color:c,lineHeight:1,fontFamily:"sans-serif"}}>{v}</div>
                <div style={{fontSize:7,color:"#444",fontFamily:"sans-serif"}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
            {Object.entries(m.req).flatMap(([t,n])=>Array(n).fill(t)).map((t,i)=>(
              <span key={i} style={{background:gcMap[t]+"22",color:gcMap[t],fontSize:7,padding:"1px 3px",borderRadius:2,fontFamily:"sans-serif"}}>{t.slice(0,3)}</span>
            ))}
          </div>
          {canRoll&&<div style={{marginTop:4,fontSize:8,color:"#1D9E75",fontFamily:"sans-serif"}}>✓ eligible — click to roll</div>}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // SETUP SCREEN
  // ════════════════════════════════════════════════════════

  if (screen==="setup") return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,fontFamily:"Georgia,serif"}}>
      <div style={{fontSize:10,letterSpacing:4,color:"#444",fontFamily:"sans-serif",marginBottom:12}}>REEL DEAL</div>
      <h1 style={{fontSize:44,fontWeight:700,color:"#fff",marginBottom:6,letterSpacing:-1}}>Choose Your Studio</h1>
      <p style={{color:"#555",fontSize:13,marginBottom:40,fontFamily:"sans-serif"}}>2 players · 12 turns · You vs AI opponent</p>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",maxWidth:860,marginBottom:40}}>
        {STUDIOS.map(s=>(
          <div key={s.id} onClick={()=>setPickedStudio(s.id)}
            style={{background:pickedStudio===s.id?s.c+"15":"#111",border:`2px solid ${pickedStudio===s.id?s.c:"#222"}`,borderRadius:12,padding:"18px 16px",width:134,cursor:"pointer",transition:"all .2s",boxShadow:pickedStudio===s.id?`0 0 20px ${s.c}33`:"none"}}>
            <div style={{width:28,height:4,background:s.c,borderRadius:2,marginBottom:10}}/>
            <div style={{fontSize:12,fontWeight:600,color:"#fff",marginBottom:3,fontFamily:"sans-serif"}}>{s.n}</div>
            <div style={{fontSize:10,color:"#666",marginBottom:10,fontFamily:"sans-serif"}}>{s.sub}</div>
            <div style={{fontSize:10,color:"#555",marginBottom:4,fontFamily:"sans-serif"}}>Start: <span style={{color:"#aaa"}}>{s.bids} Bids</span></div>
            <div style={{fontSize:9,color:s.c,marginBottom:6,fontFamily:"sans-serif"}}>{s.affL} affinity</div>
            <div style={{fontSize:9,color:"#444",lineHeight:1.4,fontFamily:"sans-serif"}}>{s.pass}</div>
          </div>
        ))}
      </div>
      {pickedStudio&&(
        <button onClick={()=>{setGs(initGame(pickedStudio));setScreen("game");}}
          style={{background:"#fff",color:"#111",border:"none",borderRadius:8,padding:"12px 40px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",letterSpacing:.5}}>
          START GAME →
        </button>
      )}
    </div>
  );

  if (!gs) return null;

  // ════════════════════════════════════════════════════════
  // END SCREEN
  // ════════════════════════════════════════════════════════

  if (gs.phase==="endgame") {
    const hs = score(gs.human), as = score(gs.ai);
    const youWin = hs.total >= as.total;
    return (
      <div style={{minHeight:"100vh",background:"#050508",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif",padding:32}}>
        <div style={{fontSize:10,letterSpacing:4,color:"#444",marginBottom:12}}>GUILD AWARDS CEREMONY</div>
        <h1 style={{fontSize:38,fontWeight:700,color:"#fff",marginBottom:8,fontFamily:"Georgia,serif"}}>{youWin?"You Win! 🎬":"Opponent Wins"}</h1>
        <p style={{color:"#FFD700",fontSize:14,marginBottom:40}}>{youWin?`${gs.human.studio.n} takes the head of the company.`:`${gs.ai.studio.n} proved their studio's worth.`}</p>
        <div style={{display:"flex",gap:20,marginBottom:40,flexWrap:"wrap",justifyContent:"center"}}>
          {[{p:gs.human,s:hs,you:true},{p:gs.ai,s:as,you:false}].map(({p,s,you})=>(
            <div key={p.studio.id} style={{background:"#111",border:`2px solid ${you&&youWin?p.studio.c:"#2a2a2a"}`,borderRadius:12,padding:24,minWidth:200,textAlign:"center"}}>
              <div style={{fontSize:10,color:p.studio.c,letterSpacing:2,marginBottom:4}}>{you?"YOU":"OPPONENT"}</div>
              <div style={{fontSize:16,fontWeight:600,color:"#fff",marginBottom:16,fontFamily:"Georgia,serif"}}>{p.studio.n}</div>
              {[["Films released",p.released.length],["Nominated",p.released.filter(m=>m.nominated).length],["Film pts",s.film],["Bid pts",s.bids]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:11,color:"#666"}}>
                  <span>{l}</span><span style={{color:"#aaa"}}>{v}</span>
                </div>
              ))}
              <div style={{fontSize:28,fontWeight:700,color:p.studio.c,marginTop:12}}>{s.total} pts</div>
            </div>
          ))}
        </div>
        <button onClick={()=>{setGs(null);setScreen("setup");setSel([]);setPickedStudio(null);}}
          style={{background:"#fff",color:"#111",border:"none",borderRadius:8,padding:"10px 28px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
          Play Again
        </button>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // GAME BOARD
  // ════════════════════════════════════════════════════════

  const g = gs;
  const inActions = g.phase==="actions" && g.human.ap>0;
  const phaseLabels = {income:"INCOME ROLL",actions:`YOUR ACTIONS — ${g.human.ap} AP`,table_bid:"TABLE BID",film_declare:"DECLARE SUBSET",ai_thinking:"AI THINKING..."};

  // Subset preview
  const subsetPreview = g.phase==="film_declare" && sel.length>0 && g.activeFilmRoll ? (() => {
    const subset = sel.map(u=>g.human.lot.find(c=>c.uid===u)).filter(Boolean);
    const {totalDice,genreBonus,passiveBonus} = subsetDiceInfo(subset,g.human.lot,g.activeFilmRoll.movie);
    const thresh = g.activeFilmRoll.movie.prod+g.activeFilmRoll.movie.delays;
    const max = totalDice*6+genreBonus+passiveBonus;
    return {totalDice,genreBonus,passiveBonus,thresh,max};
  })() : null;

  return (
    <div style={{minHeight:"100vh",background:"#050508",color:"#fff",fontFamily:"sans-serif",display:"flex",flexDirection:"column",fontSize:12}}>

      {/* ── HEADER ── */}
      <div style={{background:"#0d0d0d",borderBottom:"1px solid #1a1a1a",padding:"8px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10}}>
          <span style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:"#FFD700",letterSpacing:-.5}}>REEL DEAL</span>
          <span style={{background:g.human.studio.c,color:"#fff",fontSize:9,padding:"2px 8px",borderRadius:4,fontWeight:700}}>{g.human.studio.n}</span>
        </div>
        <div style={{display:"flex",gap:24,alignItems:"center"}}>
          <div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:g.turn>=10?"#E24B4A":"#FFD700"}}>{g.turn}/{g.maxTurns}</div><div style={{fontSize:8,color:"#444",letterSpacing:1}}>TURN</div></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:g.human.studio.c}}>{g.human.bids}</div><div style={{fontSize:8,color:"#444",letterSpacing:1}}>YOUR BIDS</div></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:"#888"}}>{g.ai.bids}</div><div style={{fontSize:8,color:"#444",letterSpacing:1}}>OPPONENT</div></div>
          <div style={{background:g.phase==="ai_thinking"?"#E24B4A22":"#1a1a1a",border:`1px solid ${g.phase==="ai_thinking"?"#E24B4A44":"#222"}`,borderRadius:6,padding:"4px 10px",fontSize:10,color:g.phase==="ai_thinking"?"#E24B4A":"#aaa",fontWeight:600}}>
            {phaseLabels[g.phase]||g.phase.toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{display:"flex",flex:1}}>

        {/* ── LEFT: AI + CENTER ROW ── */}
        <div style={{width:220,background:"#080808",borderRight:"1px solid #1a1a1a",padding:12,overflowY:"auto",flexShrink:0,display:"flex",flexDirection:"column",gap:10}}>

          {/* AI panel */}
          <div style={{background:"#111",border:`1px solid ${g.ai.studio.c}33`,borderRadius:8,padding:10}}>
            <div style={{height:2,background:g.ai.studio.c,borderRadius:1,marginBottom:8}}/>
            <div style={{fontSize:11,fontWeight:500,color:"#fff"}}>{g.ai.studio.n}</div>
            <div style={{fontSize:9,color:"#555",marginBottom:8}}>{g.ai.studio.sub}</div>
            <div style={{display:"flex",gap:8}}>
              {[["BIDS",g.ai.bids,g.ai.studio.c],["FILMS",g.ai.released.length,"#FFD700"],["CREW",g.ai.lot.length,"#888"]].map(([l,v,c])=>(
                <div key={l} style={{flex:1,textAlign:"center",background:"#0a0a0a",borderRadius:4,padding:"4px 0"}}>
                  <div style={{fontSize:14,fontWeight:600,color:c}}>{v}</div>
                  <div style={{fontSize:7,color:"#444"}}>{l}</div>
                </div>
              ))}
            </div>
            {aiThinking&&<div style={{marginTop:8,textAlign:"center",fontSize:9,color:"#E24B4A",animation:"pulse 1s infinite"}}>⏳ thinking...</div>}
          </div>

          {/* AI lot preview */}
          {g.ai.lot.length>0&&(
            <div>
              <div style={{fontSize:8,letterSpacing:1,color:"#333",marginBottom:5}}>OPPONENT LOT</div>
              {g.ai.lot.map(c=>(
                <div key={c.uid} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:4,padding:"3px 7px",marginBottom:2,display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"#777",fontSize:9}}>{c.n}</span>
                  <span style={{color:JC[c.t]||"#555",fontSize:8}}>{c.t==="rumors"?"P":`${c.d}d`}</span>
                </div>
              ))}
            </div>
          )}

          {/* AI movies */}
          {g.ai.movies.length>0&&(
            <div>
              <div style={{fontSize:8,letterSpacing:1,color:"#333",marginBottom:5}}>OPPONENT MOVIES</div>
              {g.ai.movies.map(m=>(
                <div key={m.uid} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:4,padding:"3px 7px",marginBottom:2}}>
                  <span style={{color:"#666",fontSize:9}}>{m.title}</span>
                  {m.delays>0&&<span style={{color:"#FF9800",fontSize:8,marginLeft:4}}>D:{m.delays}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Center row */}
          <div>
            <div style={{fontSize:8,letterSpacing:1,color:"#333",marginBottom:5}}>CENTER ROW</div>
            {g.centerRow.length===0&&<div style={{color:"#333",fontSize:9,fontStyle:"italic"}}>Empty</div>}
            {g.centerRow.map(m=>(
              <div key={m.uid} style={{marginBottom:6}}>
                <MovieCard m={m} small onClick={inActions?()=>claimCenter(m.uid):null} />
                {inActions&&<div style={{fontSize:8,color:"#555",marginTop:2,textAlign:"center"}}>Claim for 1 AP</div>}
              </div>
            ))}
            <div style={{fontSize:8,color:"#2a2a2a",textAlign:"center"}}>Deck: {g.movieDeck.length} remaining</div>
          </div>

        </div>

        {/* ── CENTER: YOUR STUDIO ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",padding:"14px 16px",gap:12}}>

          {/* Your lot */}
          <div>
            <div style={{fontSize:8,letterSpacing:2,color:"#333",marginBottom:8}}>YOUR STUDIO LOT</div>
            {g.human.lot.length===0&&<div style={{color:"#2a2a2a",fontSize:11,fontStyle:"italic"}}>No crew yet. Play cards from your hand.</div>}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {g.human.lot.map(c=>(
                <MiniCrew key={c.uid} c={c}
                  onClick={g.phase==="film_declare"&&c.t!=="rumors"&&c.pr?.id!=="e07"?()=>toggleSubset(c.uid):null}
                  selected={sel.includes(c.uid)}
                  dimmed={g.phase==="film_declare"&&c.t!=="rumors"&&c.pr?.id==="e07"} />
              ))}
            </div>
            {g.phase==="film_declare"&&<div style={{marginTop:6,fontSize:9,color:"#555"}}>Click crew cards to add to your subset (max 4). Rumors contribute passively.</div>}
          </div>

          {/* Subset preview */}
          {subsetPreview&&(
            <div style={{background:"#0d1a0d",border:"1px solid #1D9E7533",borderRadius:8,padding:10}}>
              <div style={{fontSize:9,color:"#1D9E75",marginBottom:4}}>SUBSET PREVIEW</div>
              <div style={{fontSize:11,color:"#aaa"}}>Dice: <strong style={{color:"#fff"}}>{subsetPreview.totalDice}d6</strong> + bonus <strong style={{color:"#BA7517"}}>{subsetPreview.genreBonus+subsetPreview.passiveBonus}</strong> &nbsp;|&nbsp; Max: <strong style={{color:"#4FC3F7"}}>{subsetPreview.max}</strong> vs threshold <strong style={{color:subsetPreview.max>=g.activeFilmRoll?.movie?.crit?"#FFD700":subsetPreview.max>=subsetPreview.thresh?"#1D9E75":"#E24B4A"}}>{subsetPreview.thresh}</strong></div>
            </div>
          )}

          {/* Your movies */}
          {g.human.movies.length>0&&(
            <div>
              <div style={{fontSize:8,letterSpacing:2,color:"#333",marginBottom:8}}>YOUR MOVIES IN PRODUCTION</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {g.human.movies.map(m=>(
                  <MovieCard key={m.uid} m={m} owned
                    onClick={inActions&&g.human.ap>=2&&g.phase==="actions"?()=>startFilmRoll(m.uid):null} />
                ))}
              </div>
            </div>
          )}

          {/* Released */}
          {g.human.released.length>0&&(
            <div>
              <div style={{fontSize:8,letterSpacing:2,color:"#333",marginBottom:6}}>RELEASED FILMS</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {g.human.released.map(m=>(
                  <div key={m.uid} style={{background:"#111",border:`1px solid ${m.nominated?"#FFD70033":"#1a1a1a"}`,borderRadius:6,padding:"4px 10px"}}>
                    {m.nominated&&<span style={{color:"#FFD700",marginRight:4}}>★</span>}
                    <span style={{color:"#aaa",fontSize:10}}>{m.title}</span>
                    <span style={{color:"#1D9E75",marginLeft:8,fontSize:10}}>+{m.fin}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game log */}
          <div style={{background:"#080808",border:"1px solid #111",borderRadius:8,padding:10,maxHeight:160,overflowY:"auto"}}>
            <div style={{fontSize:8,letterSpacing:2,color:"#2a2a2a",marginBottom:6}}>GAME LOG</div>
            {(g.log||[]).map((msg,i)=>(
              <div key={i} style={{fontSize:10,color:i===0?"#bbb":"#444",borderLeft:`2px solid ${i===0?g.human.studio.c:"#1a1a1a"}`,paddingLeft:7,marginBottom:3,lineHeight:1.4}}>{msg}</div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: ACTION PANEL + HAND ── */}
        <div style={{width:264,background:"#080808",borderLeft:"1px solid #1a1a1a",padding:12,display:"flex",flexDirection:"column",gap:10,overflowY:"auto",flexShrink:0}}>

          {/* Income roll */}
          {g.phase==="income"&&(
            <div style={{background:"#111",borderRadius:8,padding:10}}>
              <div style={{fontSize:9,color:"#888",marginBottom:8,letterSpacing:1}}>CHOOSE YOUR INCOME DIE</div>
              {(["standard","hotstreak","safebet","boom"]).map(dt=>{
                const L={standard:"Standard D3",hotstreak:"Hot Streak",safebet:"Safe Bet",boom:"Boom or Bust"};
                const N={standard:"1,1,2,2,3,3 · avg 2.0",hotstreak:"1,2,3,3,3,3 · avg 2.5",safebet:"2,2,2,3,3,3 · avg 2.5",boom:"1,1,1,1,3,3 · risky"};
                const isAff = g.human.studio.aff===dt;
                return (
                  <button key={dt} onClick={()=>rollIncome(dt)}
                    style={{width:"100%",background:isAff?g.human.studio.c+"18":"#0d0d0d",border:`1px solid ${isAff?g.human.studio.c:"#222"}`,borderRadius:6,padding:"7px 9px",marginBottom:4,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all .1s"}}>
                    <div>
                      <div style={{fontSize:10,fontWeight:600,color:isAff?g.human.studio.c:"#ccc"}}>{L[dt]} {isAff&&<span style={{fontSize:8,color:g.human.studio.c}}>★</span>}</div>
                      <div style={{fontSize:8,color:"#444",marginTop:1}}>{N[dt]}</div>
                    </div>
                    <span style={{fontSize:9,color:"#4FC3F7",fontWeight:700}}>ROLL</span>
                  </button>
                );
              })}
              {lastRoll&&(
                <div style={{background:"#1a1a1a",borderRadius:6,padding:8,textAlign:"center",marginTop:6}}>
                  <div style={{fontSize:28,fontWeight:700,color:"#FFD700"}}>{lastRoll.v}</div>
                  <div style={{fontSize:8,color:"#555"}}>{lastRoll.t} die</div>
                </div>
              )}
            </div>
          )}

          {/* Table bid */}
          {g.phase==="table_bid"&&g.activeBid&&(
            <div style={{background:"#111",borderRadius:8,padding:10}}>
              <div style={{fontSize:9,color:"#888",marginBottom:6}}>TABLE BID — CIRCULAR</div>
              <div style={{fontSize:12,fontWeight:500,color:"#fff",marginBottom:2}}>{g.activeBid.movie.title}</div>
              <div style={{fontSize:9,color:"#555",marginBottom:10}}>
                Current bid: <span style={{color:"#FFD700"}}>{g.activeBid.currentBid} Bids</span>
                {g.activeBid.aiRaised&&<span style={{color:"#E24B4A",marginLeft:6}}>↑ opponent raised</span>}
              </div>
              <input type="range" min={g.activeBid.currentBid+1} max={Math.min(g.human.bids,30)} value={bidAmt}
                onChange={e=>setBidAmt(+e.target.value)} style={{width:"100%",marginBottom:5}}/>
              <div style={{textAlign:"center",fontSize:18,fontWeight:700,color:"#FFD700",marginBottom:10}}>{bidAmt} Bids</div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>submitBid(bidAmt)} style={{...S.btn(true,"#1565C0"),flex:1}}>RAISE / CALL</button>
                <button onClick={foldBid} style={{...S.btn(false),flex:1}}>FOLD</button>
              </div>
            </div>
          )}

          {/* Film roll declare */}
          {g.phase==="film_declare"&&g.activeFilmRoll&&(
            <div style={{background:"#111",borderRadius:8,padding:10}}>
              <div style={{fontSize:9,color:"#888",marginBottom:4}}>FILM ROLL — {g.activeFilmRoll.movie.title.toUpperCase()}</div>
              <div style={{fontSize:9,color:"#555",marginBottom:8}}>Select up to 4 Crew from your Studio Lot. Rumors are passive and auto-contribute.</div>
              <div style={{fontSize:9,color:"#aaa",marginBottom:8}}>Selected: <strong style={{color:"#fff"}}>{sel.length}</strong>/4</div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={confirmSubset} disabled={!sel.length}
                  style={{...S.btn(sel.length>0,"#E24B4A"),flex:1}}>ROLL THE DICE</button>
                <button onClick={()=>{setSel([]);setGs(g2=>({...g2,phase:"actions",activeFilmRoll:null}));}}
                  style={{...S.btn(false),flex:"0 0 56px"}}>Back</button>
              </div>
            </div>
          )}

          {/* Actions */}
          {g.phase==="actions"&&(
            <div style={{background:"#111",borderRadius:8,padding:10}}>
              <div style={{fontSize:9,color:"#888",marginBottom:7}}>AP ACTIONS — {g.human.ap} remaining</div>
              {[
                {l:"Draw Crew Card",cost:1,fn:drawCrew,dis:g.human.ap<1||!g.crewDeck.length},
                {l:"Draw Event Card",cost:1,fn:drawEvent,dis:g.human.ap<1||!g.eventDeck.length},
                {l:`Draw Movie (triggers Table Bid)`,cost:1,fn:drawMovieTriggerBid,dis:g.human.ap<1||!g.movieDeck.length},
              ].map(({l,cost,fn,dis})=>(
                <button key={l} onClick={!dis?fn:null} disabled={dis}
                  style={{width:"100%",background:"#0d0d0d",color:dis?"#333":"#bbb",border:`1px solid ${dis?"#1a1a1a":"#2a2a2a"}`,borderRadius:5,padding:"6px 8px",fontSize:10,cursor:dis?"not-allowed":"pointer",marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all .1s"}}>
                  <span>{l}</span><span style={{color:dis?"#2a2a2a":"#4FC3F7",fontSize:9,fontWeight:700}}>{cost}AP</span>
                </button>
              ))}
              <button onClick={endTurn}
                style={{width:"100%",background:"#0d1a2d",color:"#FFD700",border:"1px solid #FFD70022",borderRadius:6,padding:"8px",fontSize:11,cursor:"pointer",fontWeight:700,marginTop:6}}>
                END TURN →
              </button>
            </div>
          )}

          {/* Score tracker */}
          <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:8,padding:10}}>
            <div style={{fontSize:8,letterSpacing:1,color:"#2a2a2a",marginBottom:6}}>SCORE ESTIMATE</div>
            {[{p:g.human,you:true},{p:g.ai,you:false}].map(({p,you})=>{
              const s = score(p);
              return (
                <div key={p.studio.id} style={{marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:9,color:p.studio.c,fontWeight:600}}>{you?"You":p.studio.n}</span>
                    <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{s.total}</span>
                  </div>
                  <div style={{fontSize:8,color:"#444"}}>Films:{s.film} + Bids:{s.bids}</div>
                </div>
              );
            })}
          </div>

          {/* Hand */}
          <div>
            <div style={{fontSize:8,letterSpacing:1,color:"#2a2a2a",marginBottom:6}}>YOUR HAND ({g.human.hand.length} cards)</div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {g.human.hand.length===0&&<div style={{color:"#2a2a2a",fontSize:10,fontStyle:"italic"}}>Hand empty</div>}
              {g.human.hand.map(c=>{
                const isCrew=["director","actor","producer","writer","cine","stunt","rumors"].includes(c.t);
                const evC={"pr":"#639922","badpr":"#E24B4A","tabloid":"#BA7517","connections":"#1D9E75","drama":"#7F77DD"};
                const col = isCrew ? (JC[c.t]||"#888") : (evC[c.t]||"#888");
                return (
                  <div key={c.uid} style={{background:"#0d0d0d",border:`1px solid ${col}22`,borderRadius:6,padding:"7px 8px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:8,color:col,fontWeight:700,marginBottom:2}}>
                        {isCrew?`${c.t.toUpperCase()}${c.t!=="rumors"?` · ${c.d}◆ · r${c.r}+`:" · PASSIVE"}`:`${c.t.toUpperCase()}${c.sub?` — ${c.sub}`:""}`}
                      </div>
                      <div style={{fontSize:10,fontWeight:500,color:"#ddd",marginBottom:2,lineHeight:1.2}}>{c.n}</div>
                      <div style={{fontSize:9,color:"#555",lineHeight:1.3}}>{c.fx}</div>
                    </div>
                    {isCrew&&inActions&&(
                      <button onClick={()=>playCrew(c.uid)} style={{...S.btn(true),padding:"3px 7px",fontSize:8,whiteSpace:"nowrap",flexShrink:0}}>PLAY</button>
                    )}
                    {!isCrew&&<div style={{fontSize:8,color:"#2a2a2a",whiteSpace:"nowrap",flexShrink:0,alignSelf:"flex-end"}}>0AP</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}} * { box-sizing:border-box; } ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#050508} ::-webkit-scrollbar-thumb{background:#222;border-radius:2px}`}</style>
    </div>
  );
}
