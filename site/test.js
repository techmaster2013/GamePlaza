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
      const animate = () => { ctx.clearRect(0,0,canvas.width,canvas.height); particles.forEach(p=>{p.x+=p.dx;p.y+=p.dy;if(p.x<0||p.x>canvas.width)p.dx*=-1;if(p.y<0||p.y>canvas.height)p.dy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle="#3b82f6";ctx.fill();});requestAnimationFrame(animate); };
      resize(); make(); animate(); addEventListener("resize",()=>{resize();make();});
    }

    /* Settings / cloak */
    const cloakTitle = localStorage.getItem("gp_cloak_title");
    const cloakIcon = localStorage.getItem("gp_cloak_icon");
    if (cloakTitle) document.title = cloakTitle;
    if (cloakIcon) { let icon=document.querySelector("link[rel~='icon']"); if(!icon){icon=document.createElement("link");icon.rel="icon";document.head.appendChild(icon);} icon.href=cloakIcon; }
    if (localStorage.getItem("gp_mobile_sizer")==="enabled") document.body.classList.add("mobile-sized");

    const updateCounts=()=>{if($("favCount"))$("favCount").textContent=favorites.length;if($("recentCount"))$("recentCount").textContent=recent.length;if($("homeFavoriteCount"))$("homeFavoriteCount").textContent=favorites.length;if($("homeRecentCount"))$("homeRecentCount").textContent=recent.length;if($("homeGameCount"))$("homeGameCount").textContent=allGames.length;};
    const addRecent=(name)=>{recent=[name,...recent.filter(x=>x!==name)].slice(0,20);save("gp_recent",recent);updateCounts();renderHome();};
    const toggleFavorite=(name)=>{favorites=favorites.includes(name)?favorites.filter(x=>x!==name):[...favorites,name];save("gp_favorites",favorites);updateCounts();renderHome();renderGames();};

    const emptyState=(icon,title,text)=>{const b=document.createElement("div");b.className="empty-state";b.innerHTML=`<span>${icon}</span><strong>${title}</strong><small>${text}</small>`;return b;};
    const homeCard=(game)=>{const b=document.createElement("button");b.type="button";b.className="home-game-card";const i=document.createElement("span");i.className="game-icon";i.textContent=favorites.includes(gameName(game))?"⭐":"▶";const t=document.createElement("div");t.className="home-game-info";t.innerHTML=`<strong>${gameName(game)}</strong><small>${game.description||""}</small>`;b.appendChild(i);b.appendChild(t);b.onclick=()=>{addRecent(gameName(game));if(gameUrl(game)!=="#")location.href=gameUrl(game);};return b;};

    function renderHome(){
      const fg=findGame("Crazy Cattle 3D")||allGames[0];
      if($("featured-name")){ $("featured-name").textContent=fg?gameName(fg):"No games found"; $("featured-description").textContent=fg?(fg.description||"Today's featured game from the GamePlaza collection."):""; }
      const rc=$("recent-games"); if(rc){rc.replaceChildren();const gs=recent.map(findGame).filter(Boolean).slice(0,3);if(!gs.length)rc.appendChild(emptyState("⏱","No recently played games yet.","Games you play will appear here."));else gs.forEach(g=>rc.appendChild(homeCard(g)));}
      const nc=$("new-games"); if(nc){nc.replaceChildren();allGames.slice(-3).reverse().forEach(g=>nc.appendChild(homeCard(g)));if(!nc.children.length)nc.appendChild(emptyState("🆕","No games yet.","Nothing new yet."));}
      const fc=$("favorite-games"); if(fc){fc.replaceChildren();const gs=favorites.map(findGame).filter(Boolean).slice(0,3);if(!gs.length)fc.appendChild(emptyState("☆","No favorites yet.","Use the star to favorite a game."));else gs.forEach(g=>fc.appendChild(homeCard(g)));}
    }

    function filtered(){const q=state.query.toLowerCase();return allGames.filter(g=>{const n=gameName(g).toLowerCase();const cat=state.category==="all"||g.category===state.category;const act=state.activity==="all"|| (state.activity==="favorites"?favorites.includes(gameName(g)):recent.includes(gameName(g)));return n.includes(q)&&cat&&act;});}
    function renderGames(){const grid=$("game-grid");if(!grid)return;const list=filtered();grid.replaceChildren();if(!list.length)grid.appendChild(emptyState("🔎","No games found.","Try a different search or category."));else list.forEach(g=>{const btn=document.createElement("button");btn.type="button";btn.className="game-button";if(g.img){const img=document.createElement("img");img.src=g.img;img.alt=gameName(g);btn.appendChild(img);}const title=document.createElement("div");title.className="game-title";title.innerHTML=`${gameName(g)} ${favorites.includes(gameName(g))?"★":"☆"}`;title.onclick=(e)=>{e.stopPropagation();toggleFavorite(gameName(g));};btn.onclick=()=>{addRecent(gameName(g));if(gameUrl(g)!=="#")location.href=gameUrl(g);};btn.appendChild(title);grid.appendChild(btn);});if($("loading"))$("loading").style.display="none";}

    function buildCategories(){const row=$("category-row");if(!row)return;row.replaceChildren();const cats=[...new Set(allGames.map(g=>g.category).filter(Boolean))].sort((a,b)=>(categoryLabels[a]||a).localeCompare(categoryLabels[b]||b));const allBtn=document.createElement("button");allBtn.className="chip";allBtn.id="chip-all";allBtn.textContent="All";allBtn.onclick=()=>{state.category="all";document.querySelectorAll("#category-row .chip").forEach(c=>c.classList.remove("active"));allBtn.classList.add("active");renderGames();};row.appendChild(allBtn);cats.forEach(cat=>{const c=document.createElement("button");c.className="chip";c.textContent=categoryLabels[cat]||cat;c.onclick=()=>{state.category=cat;document.querySelectorAll("#category-row .chip").forEach(ch=>ch.classList.remove("active"));c.classList.add("active");renderGames();};row.appendChild(c);});}
    const search=$("game-search"),clear=$("search-clear");
    if(search)search.oninput=()=>{state.query=search.value.trim();if(clear)clear.hidden=!state.query;renderGames();};
    if(clear)clear.onclick=()=>{search.value="";state.query="";clear.hidden=true;renderGames();search.focus();};
    const setActivity=a=>{state.activity=a;document.querySelectorAll("#activity-row .chip").forEach(c=>c.classList.remove("active"));const id={favorites:"chip-fav",recent:"chip-recent",all:"chip-all"}[a]||"chip-all";const el=$(id);if(el)el.classList.add("active");renderGames();};
    if($("chip-fav"))$("chip-fav").onclick=()=>setActivity("favorites");if($("chip-recent"))$("chip-recent").onclick=()=>setActivity("recent");if($("chip-all"))$("chip-all").onclick=()=>setActivity("all");
    const browse=()=>$("browse")&&$("browse").scrollIntoView({behavior:"smooth",block:"start"});
    const showFav=()=>{browse();setTimeout(()=>setActivity("favorites"),350);};const showRecent=()=>{browse();setTimeout(()=>setActivity("recent"),350);};
    if($("heroBrowse"))$("heroBrowse").onclick=browse;if($("homeAll"))$("homeAll").onclick=()=>{browse();setTimeout(()=>setActivity("all"),350);};if($("homeFavorites"))$("homeFavorites").onclick=showFav;if($("homeRecent"))$("homeRecent").onclick=showRecent;
    const surprise=()=>{if(!allGames.length)return;const g=allGames[Math.floor(Math.random()*allGames.length)];addRecent(gameName(g));if(gameUrl(g)!=="#")location.href=gameUrl(g);};["heroSurprise","luckyButton","featured-play"].forEach(id=>{const el=$(id);if(el)el.onclick=surprise;});

    /* Modal: one authoritative implementation, including automatic startup. */
    const modal=$("updateModal"),panel=modal&&modal.querySelector(".modal-content"),trigger=$("update-trigger"),close=$("closeBtn"),dismiss=$("dismissBtn");
    let previousFocus=null;
    const openModal=()=>{
      if(!modal||modal.classList.contains("active"))return;
      previousFocus=document.activeElement;

      // compute scrollbar compensation to avoid layout shift when hiding scrollbar
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        // preserve existing inline padding-right
        modal.__originalBodyPaddingRight = document.body.style.paddingRight || '';
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      document.body.classList.add("modal-open");
      modal.classList.add("active");
      modal.setAttribute("aria-hidden","false");

      // focus the modal panel for accessibility
      try { if (panel) { panel.focus(); } } catch (e) {}

      // hide the scroll trail while modal is open
      const trail = document.querySelector('.scroll-trail'); if (trail) { trail.style.opacity = '0'; }
    };

    const closeModal=()=>{
      if(!modal||!modal.classList.contains("active"))return;
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden","true");
      document.body.classList.remove("modal-open");

      // restore body padding-right
      if (modal.__originalBodyPaddingRight !== undefined) {
        document.body.style.paddingRight = modal.__originalBodyPaddingRight;
        delete modal.__originalBodyPaddingRight;
      } else {
        document.body.style.paddingRight = '';
      }

      // return focus
      try { if (previousFocus && previousFocus.focus) previousFocus.focus(); } catch (e) {}

      // restore scroll trail visibility
      const trail = document.querySelector('.scroll-trail'); if (trail) { trail.style.opacity = ''; }
    };
    window.GamePlazaModal={open:openModal,close:closeModal};
    if(trigger)trigger.onclick=openModal;if(close)close.onclick=closeModal;if(dismiss)dismiss.onclick=closeModal;
    if(modal)modal.onclick=e=>{if(e.target===modal)closeModal();};
    document.addEventListener("keydown",e=>{if((e.key==="Escape"||e.key==="Esc")&&modal&&modal.classList.contains("active"))closeModal();});

    /* Short blue scroll trail */
    const trail=document.createElement("div");trail.className="scroll-trail";trail.style.transition="height .18s ease, opacity .18s ease";document.body.appendChild(trail);let trailTimer;
    const updateTrail=()=>{
      // if modal is open, don't show trail
      if (modal && modal.classList.contains('active')) {
        trail.style.height = '0px';
        trail.style.opacity = '0';
        return;
      }

      const documentHeight=document.documentElement.scrollHeight-innerHeight;
      const progress=documentHeight>0?scrollY/documentHeight:0;
      const thumbHeight=Math.max(74,innerHeight*(innerHeight/document.documentElement.scrollHeight));
      const thumbTop = Math.max(0, Math.min(innerHeight - thumbHeight, progress*(innerHeight - thumbHeight)));
      trail.style.height = thumbHeight + 'px';
      trail.style.top = thumbTop + 'px';
      trail.style.opacity = '1';
    };
    addEventListener("scroll",()=>{updateTrail();trail.classList.add("scrolling");clearTimeout(trailTimer);trailTimer=setTimeout(()=>{trail.classList.remove("scrolling");if(! (modal && modal.classList.contains('active'))) { trail.style.opacity='0'; }},260);},{passive:true});
    addEventListener("resize",updateTrail,{passive:true});updateTrail();

    if($("backTop"))$("backTop").onclick=()=>scrollTo({top:0,behavior:"smooth"});
    if(search){const title=document.querySelector(".hero h1 .magic-text");if(title){const ot=title.textContent,op=search.placeholder,msgs=[["gameplaza is the best","choose a game already"],["hiiiiiiii","choose a game already"]];const fadeDuration=600;const visibleDuration=10000;title.style.transition=`opacity ${fadeDuration}ms ease`;search.style.transition=`opacity ${fadeDuration}ms ease`;let scheduled=null;function doFlash(){const msg=msgs[Math.floor(Math.random()*msgs.length)];title.style.opacity='0';search.style.opacity='0';setTimeout(()=>{try{title.textContent=msg[0];search.setAttribute('placeholder',msg[1]);}catch(e){}title.style.opacity='1';search.style.opacity='1';setTimeout(()=>{title.style.opacity='0';search.style.opacity='0';setTimeout(()=>{try{title.textContent=ot;search.setAttribute('placeholder',op);}catch(e){}title.style.opacity='1';search.style.opacity='1';scheduleNext();},fadeDuration);},fadeDuration);},fadeDuration);}function scheduleNext(){const delay=7000+Math.random()*23000;scheduled=setTimeout(doFlash,delay);}scheduleNext();window.addEventListener('beforeunload',()=>{if(scheduled)clearTimeout(scheduled);});}};

    buildCategories();renderGames();renderHome();updateCounts();
    /* Always show the update modal when test.html opens. */
    setTimeout(openModal,120);
  });
})();
