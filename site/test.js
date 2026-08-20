(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);
    const allGames = Array.isArray(window.games) ? window.games : [];
    const categoryLabels = window.CATEGORY_LABELS || {};

    const readArray = (key) => { try { const v = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(v) ? v : []; } catch (_) { return []; } };
    const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };
    let favorites = readArray("gp_favorites");
    let recent = readArray("gp_recent");
    let state = { query: "", category: "all", activity: "all" };

    const gameName = (g) => g && (g.label || g.name) || "Unknown";
    const gameUrl = (g) => g && g.url || "#";
    const findGame = (name) => allGames.find((g) => gameName(g) === name);

    /* Particles */
    const canvas = $("particles");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      let particles = [];
      const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
      const make = () => { particles = Array.from({length:60}, () => ({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*2+1,dx:(Math.random()-.5)*.5,dy:(Math.random()-.5)*.5})); };
      const animate = () => { ctx.clearRect(0,0,canvas.width,canvas.height); particles.forEach(p=>{p.x+=p.dx;p.y+=p.dy;if(p.x<0||p.x>canvas.width)p.dx*=-1;if(p.y<0||p.y>canvas.height)p.dy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle="rgba(244,143,177,.55)";ctx.fill();});requestAnimationFrame(animate); };
      resize(); make(); animate(); addEventListener("resize",()=>{resize();make();});
    }

    /* Settings / cloak */
    const cloakTitle = localStorage.getItem("gp_cloak_title");
    const cloakIcon = localStorage.getItem("gp_cloak_icon");
    if (cloakTitle) document.title = cloakTitle;
    if (cloakIcon) { let icon=document.querySelector("link[rel~='icon']"); if(!icon){icon=document.createElement("link");icon.rel="icon";document.head.appendChild(icon);} icon.href=cloakIcon; }
    if (localStorage.getItem("gp_mobile_sizer")==="enabled") document.body.classList.add("mobile-sized");

    const updateCounts=()=>{if($("favCount"))$("favCount").textContent=favorites.length;if($("recentCount"))$("recentCount").textContent=recent.length;if($("homeFavoriteCount"))$("homeFavoriteCount").textContent=`${favorites.length} game${favorites.length===1?"":"s"}`;if($("homeRecentCount"))$("homeRecentCount").textContent=`${recent.length} game${recent.length===1?"":"s"}`;if($("homeGameCount"))$("homeGameCount").textContent=`${allGames.length} games`;};
    const addRecent=(name)=>{recent=[name,...recent.filter(x=>x!==name)].slice(0,20);save("gp_recent",recent);updateCounts();renderHome();};
    const toggleFavorite=(name)=>{favorites=favorites.includes(name)?favorites.filter(x=>x!==name):[...favorites,name];save("gp_favorites",favorites);updateCounts();renderHome();renderGames();};

    const emptyState=(icon,title,text)=>{const b=document.createElement("div");b.className="empty-state";b.innerHTML=`<span>${icon}</span><strong>${title}</strong><small>${text}</small>`;return b;};
    const homeCard=(game)=>{const b=document.createElement("button");b.type="button";b.className="home-game-card";const i=document.createElement("span");i.className="game-icon";i.textContent=favorites.includes(gameName(game))?"★":"🎮";const t=document.createElement("strong");t.textContent=gameName(game);const c=document.createElement("small");c.textContent=categoryLabels[game.category]||game.category||"Game";b.append(i,t,c);b.onclick=()=>{addRecent(gameName(game));if(gameUrl(game)!=="#")location.href=gameUrl(game);};return b;};

    function renderHome(){
      const fg=findGame("Crazy Cattle 3D")||allGames[0];
      if($("featured-name")){ $("featured-name").textContent=fg?gameName(fg):"No games found"; $("featured-description").textContent=fg?(fg.description||"Today's featured game from the GamePlaza collection."):"The game library is empty."; $("featured-play").onclick=()=>{if(fg){addRecent(gameName(fg));if(gameUrl(fg)!=="#")location.href=gameUrl(fg);}}; }
      const rc=$("recent-games"); if(rc){rc.replaceChildren();const gs=recent.map(findGame).filter(Boolean).slice(0,3);if(!gs.length)rc.appendChild(emptyState("⏱","No recently played games yet.","Games you play will appear here."));else gs.forEach(g=>rc.appendChild(homeCard(g)));}
      const nc=$("new-games"); if(nc){nc.replaceChildren();allGames.slice(-3).reverse().forEach(g=>nc.appendChild(homeCard(g)));if(!nc.children.length)nc.appendChild(emptyState("🆕","No games yet.","Add games to games.js to see them here."));}
      const fc=$("favorite-games"); if(fc){fc.replaceChildren();const gs=favorites.map(findGame).filter(Boolean).slice(0,3);if(!gs.length)fc.appendChild(emptyState("☆","No favorites yet.","Use the ☆ on a game below to add it here."));else gs.forEach(g=>fc.appendChild(homeCard(g)));}
    }

    function filtered(){const q=state.query.toLowerCase();return allGames.filter(g=>{const n=gameName(g).toLowerCase();const cat=state.category==="all"||g.category===state.category;const act=state.activity==="all"||(state.activity==="favorites"&&favorites.includes(gameName(g)))||(state.activity==="recent"&&recent.includes(gameName(g)));return cat&&act&&(!q||n.includes(q));});}
    function renderGames(){const grid=$("game-grid");if(!grid)return;const list=filtered();grid.replaceChildren();if(!list.length)grid.appendChild(emptyState("🔎","No games found.","Try a different search or filter."));else list.forEach(game=>{const b=document.createElement("button");b.type="button";if(game.img){const img=document.createElement("img");img.src=game.img;img.alt=gameName(game);img.loading="lazy";b.appendChild(img);}const title=document.createElement("div");title.className="game-title";title.append(document.createTextNode(gameName(game)+" "));const fav=document.createElement("span");fav.className="favorite-toggle";fav.textContent=favorites.includes(gameName(game))?"★":"☆";fav.title=favorites.includes(gameName(game))?"Remove favorite":"Add favorite";fav.setAttribute("role","button");fav.tabIndex=0;const favClick=e=>{e.preventDefault();e.stopPropagation();toggleFavorite(gameName(game));};fav.onclick=favClick;fav.onkeydown=e=>{if(e.key==="Enter"||e.key===" ")favClick(e);};title.appendChild(fav);b.appendChild(title);b.onclick=()=>{addRecent(gameName(game));if(gameUrl(game)!=="#")location.href=gameUrl(game);};grid.appendChild(b);});if($("loading"))$("loading").style.display="none";}

    function buildCategories(){const row=$("category-row");if(!row)return;row.replaceChildren();const cats=[...new Set(allGames.map(g=>g.category).filter(Boolean))].sort((a,b)=>(categoryLabels[a]||a).localeCompare(categoryLabels[b]||b));const add=(v,label)=>{const c=document.createElement("button");c.type="button";c.className="chip"+(state.category===v?" active":"");c.textContent=label;c.onclick=()=>{state.category=v;row.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));c.classList.add("active");renderGames();};row.appendChild(c);};add("all","All");cats.forEach(c=>add(c,categoryLabels[c]||c));}
    const search=$("game-search"),clear=$("search-clear");
    if(search)search.oninput=()=>{state.query=search.value.trim();if(clear)clear.hidden=!state.query;renderGames();};
    if(clear)clear.onclick=()=>{search.value="";state.query="";clear.hidden=true;renderGames();search.focus();};
    const setActivity=a=>{state.activity=a;document.querySelectorAll("#activity-row .chip").forEach(c=>c.classList.remove("active"));const id={favorites:"chip-fav",recent:"chip-recent",all:"chip-all"}[a];if($(id))$(id).classList.add("active");renderGames();};
    if($("chip-fav"))$("chip-fav").onclick=()=>setActivity("favorites");if($("chip-recent"))$("chip-recent").onclick=()=>setActivity("recent");if($("chip-all"))$("chip-all").onclick=()=>setActivity("all");
    const browse=()=>$("browse")&&$("browse").scrollIntoView({behavior:"smooth",block:"start"});
    const showFav=()=>{browse();setTimeout(()=>setActivity("favorites"),350);};const showRecent=()=>{browse();setTimeout(()=>setActivity("recent"),350);};
    if($("heroBrowse"))$("heroBrowse").onclick=browse;if($("homeAll"))$("homeAll").onclick=()=>{browse();setTimeout(()=>setActivity("all"),350);};if($("homeFavorites"))$("homeFavorites").onclick=showFav;if($("viewFavorites"))$("viewFavorites").onclick=showFav;if($("homeRecent"))$("homeRecent").onclick=showRecent;if($("viewHistory"))$("viewHistory").onclick=showRecent;
    const surprise=()=>{if(!allGames.length)return;const g=allGames[Math.floor(Math.random()*allGames.length)];addRecent(gameName(g));if(gameUrl(g)!=="#")location.href=gameUrl(g);};["heroSurprise","luckyButton"].forEach(id=>{if($(id))$(id).onclick=surprise;});

    /* Modal: one authoritative implementation, including automatic startup. */
    const modal=$("updateModal"),panel=modal&&modal.querySelector(".modal-content"),trigger=$("update-trigger"),close=$("closeBtn"),dismiss=$("dismissBtn");
    let previousFocus=null;
    const openModal=()=>{if(!modal)return;previousFocus=document.activeElement;modal.classList.add("active");modal.setAttribute("aria-hidden","false");modal.style.display="flex";document.body.classList.add("modal-open");document.body.style.overflow="hidden";if(panel)setTimeout(()=>panel.focus(),0);};
    const closeModal=()=>{if(!modal)return;modal.classList.remove("active");modal.setAttribute("aria-hidden","true");modal.style.display="none";document.body.classList.remove("modal-open");document.body.style.overflow="";if(previousFocus&&previousFocus.focus)setTimeout(()=>previousFocus.focus(),0);};
    window.GamePlazaModal={open:openModal,close:closeModal};
    if(trigger)trigger.onclick=openModal;if(close)close.onclick=closeModal;if(dismiss)dismiss.onclick=closeModal;
    if(modal)modal.onclick=e=>{if(e.target===modal)closeModal();};
    document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});

    /* Short blue scroll trail */
    const trail=document.createElement("div");trail.className="scroll-trail";document.body.appendChild(trail);let trailTimer;
    addEventListener("scroll",()=>{trail.classList.add("scrolling");clearTimeout(trailTimer);trailTimer=setTimeout(()=>trail.classList.remove("scrolling"),180);},{passive:true});

    if($("backTop"))$("backTop").onclick=()=>scrollTo({top:0,behavior:"smooth"});
    if(search){const title=document.querySelector(".hero h1 .magic-text");if(title){const ot=title.textContent,op=search.placeholder,msgs=[["gameplaza is the best","choose a game already"],["hiiiiiiiii","what are you playing?"],["welcome to the plaza","find something fun..."]];const schedule=()=>setTimeout(()=>{const m=msgs[Math.floor(Math.random()*msgs.length)];title.textContent=m[0];search.placeholder=m[1];setTimeout(()=>{title.textContent=ot;search.placeholder=op;schedule();},4500);},18000+Math.random()*18000);schedule();}}

    buildCategories();renderGames();renderHome();updateCounts();
    /* Always show the update modal when test.html opens. */
    setTimeout(openModal,120);
  });
})();