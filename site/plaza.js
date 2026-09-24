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
      const animate = () => { ctx.clearRect(0,0,canvas.width,canvas.height); particles.forEach(p=>{p.x+=p.dx;p.y+=p.dy;if(p.x<0||p.x>canvas.width)p.dx*=-1;if(p.y<0||p.y>canvas.height)p.dy*=-1;ctx.fillStyle="rgba(56,167,255,0.5)";ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();});requestAnimationFrame(animate); };
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

    /* Game preview: visual-only embed with a separate Play button. */
    let preview = null;
    const ensurePreview = () => {
      if (preview) return preview;
      const overlay = document.createElement("div");
      overlay.className = "game-preview-overlay";
      overlay.setAttribute("aria-hidden", "true");
      overlay.innerHTML = `
        <div class="game-preview" role="dialog" aria-modal="true" aria-labelledby="gamePreviewTitle" tabindex="-1">
          <div class="game-preview-head"><h2 class="game-preview-title" id="gamePreviewTitle">Game Preview</h2><button class="game-preview-close" type="button" aria-label="Close preview">×</button></div>
          <div class="game-preview-frame-wrap"><iframe class="game-preview-frame" title="Game preview" loading="lazy"></iframe><div class="game-preview-blocker" aria-hidden="true"></div></div>
          <div class="game-preview-actions"><button class="game-preview-play" type="button">▷|| Play Game</button></div>
          <p class="game-preview-note">preview only — the game is not interactive until you press Play Game.</p>
        </div>`;
      document.body.appendChild(overlay);
      const panel = overlay.querySelector(".game-preview");
      const frame = overlay.querySelector(".game-preview-frame");
      const title = overlay.querySelector(".game-preview-title");
      const close = overlay.querySelector(".game-preview-close");
      const play = overlay.querySelector(".game-preview-play");
      const closePreview = () => { overlay.classList.remove("active"); overlay.setAttribute("aria-hidden","true"); frame.src="about:blank"; document.body.classList.remove("modal-open"); };
      const openPreview = (game) => {
        if (!game || gameUrl(game) === "#") return;
        title.textContent = gameName(game);
        frame.src = gameUrl(game);
        play.onclick = () => { addRecent(gameName(game)); location.href = gameUrl(game); };
        overlay.classList.add("active"); overlay.setAttribute("aria-hidden","false"); document.body.classList.add("modal-open");
        try { panel.focus(); } catch (_) {}
      };
      close.onclick = closePreview;
      overlay.onclick = (e) => { if (e.target === overlay) closePreview(); };
      preview = { open: openPreview, close: closePreview };
      return preview;
    };
    const openGamePreview = (game) => ensurePreview().open(game);

    const emptyState=(icon,title,text)=>{const b=document.createElement("div");b.className="empty-state";b.innerHTML=`<span>${icon}</span><strong>${title}</strong><small>${text}</small>`;return b;};
    const homeCard=(game)=>{const b=document.createElement("button");b.type="button";b.className="home-game-card";const i=document.createElement("span");i.className="game-icon";i.textContent=favorites.includes(gameName(game))?"⭐":"☆";i.onclick=e=>{e.stopPropagation();toggleFavorite(gameName(game));};b.appendChild(i);const t=document.createElement("span");t.className="game-name";t.textContent=gameName(game);b.appendChild(t);b.onclick=()=>{openGamePreview(game);};return b;};

    function renderHome(){
      const fg=findGame("Crazy Cattle 3D")||allGames[0];
      if($("featured-name")){ $("featured-name").textContent=fg?gameName(fg):"No games found"; $("featured-description").textContent=fg?(fg.description||"Today's featured game from the GamePlaza collection."):"Browse our game library."; }
      if($("featured-play"))$("featured-play").onclick=()=>{if(fg){addRecent(gameName(fg));location.href=gameUrl(fg);}};
      const rc=$("recent-games"); if(rc){rc.replaceChildren();const gs=recent.map(findGame).filter(Boolean).slice(0,3);if(!gs.length)rc.appendChild(emptyState("⏱","No recently played games yet.","Play a game to see it here."));else gs.forEach(g=>rc.appendChild(homeCard(g)));}
      const nc=$("new-games"); if(nc){nc.replaceChildren();allGames.slice(-3).reverse().forEach(g=>nc.appendChild(homeCard(g)));if(!nc.children.length)nc.appendChild(emptyState("🆕","No games yet.","Check back soon for new games."));}
      const fc=$("favorite-games"); if(fc){fc.replaceChildren();const gs=favorites.map(findGame).filter(Boolean).slice(0,3);if(!gs.length)fc.appendChild(emptyState("☆","No favorites yet.","Use the ⭐ to add games to your favorites."));else gs.forEach(g=>fc.appendChild(homeCard(g)));}
    }

    function filtered(){const q=state.query.toLowerCase();return allGames.filter(g=>{const n=gameName(g).toLowerCase();const cat=state.category==="all"||g.category===state.category;const act=state.activity==="all"||(state.activity==="favorites"&&favorites.includes(gameName(g)))||(state.activity==="recent"&&recent.includes(gameName(g)));return n.includes(q)&&cat&&act;});}
    function renderGames(){const grid=$("game-grid");if(!grid)return;const list=filtered();grid.replaceChildren();if(!list.length)grid.appendChild(emptyState("🔎","No games found.","Try a different search or category."));else list.forEach(g=>{const b=document.createElement("button");b.type="button";b.className="game-button";const i=document.createElement("span");i.className="game-icon";i.textContent=favorites.includes(gameName(g))?"⭐":"☆";i.onclick=e=>{e.stopPropagation();toggleFavorite(gameName(g));};b.appendChild(i);const t=document.createElement("div");t.className="game-title";t.textContent=gameName(g);b.appendChild(t);b.onclick=()=>openGamePreview(g);grid.appendChild(b);});}

    function buildCategories(){const row=$("category-row");if(!row)return;row.replaceChildren();const cats=[...new Set(allGames.map(g=>g.category).filter(Boolean))].sort((a,b)=>(categoryLabels[a]||a).localeCompare(categoryLabels[b]||b));const setCategory=c=>{state.category=c;document.querySelectorAll(".category-row .chip").forEach(x=>x.classList.remove("active"));const e=row.querySelector(`[data-cat="${c}"]`);if(e)e.classList.add("active");renderGames();};const ac=document.createElement("button");ac.type="button";ac.className="chip active";ac.setAttribute("data-cat","all");ac.textContent="All";ac.onclick=()=>setCategory("all");row.appendChild(ac);cats.forEach(c=>{const e=document.createElement("button");e.type="button";e.className="chip";e.setAttribute("data-cat",c);e.textContent=categoryLabels[c]||c;e.onclick=()=>setCategory(c);row.appendChild(e);});}
    const search=$("game-search"),clear=$("search-clear");
    if(search)search.oninput=()=>{state.query=search.value.trim();if(clear)clear.hidden=!state.query;renderGames();};
    if(clear)clear.onclick=()=>{search.value="";state.query="";clear.hidden=true;renderGames();search.focus();};
    const setActivity=a=>{state.activity=a;document.querySelectorAll("#activity-row .chip").forEach(c=>c.classList.remove("active"));const id={favorites:"chip-fav",recent:"chip-recent",all:"chip-all"}[a];if(id)$(id).classList.add("active");renderGames();};
    if($("chip-fav"))$("chip-fav").onclick=()=>setActivity("favorites");if($("chip-recent"))$("chip-recent").onclick=()=>setActivity("recent");if($("chip-all"))$("chip-all").onclick=()=>setActivity("all");
    const browse=()=>$("browse")&&$("browse").scrollIntoView({behavior:"smooth",block:"start"});
    const showFav=()=>{browse();setTimeout(()=>setActivity("favorites"),350);};const showRecent=()=>{browse();setTimeout(()=>setActivity("recent"),350);};
    if($("heroBrowse"))$("heroBrowse").onclick=browse;if($("homeAll"))$("homeAll").onclick=()=>{browse();setTimeout(()=>setActivity("all"),350);};if($("homeFavorites"))$("homeFavorites").onclick=showFav;if($("homeRecent"))$("homeRecent").onclick=showRecent;if($("viewFavorites"))$("viewFavorites").onclick=showFav;if($("viewHistory"))$("viewHistory").onclick=showRecent;
    const surprise=()=>{if(!allGames.length)return;const g=allGames[Math.floor(Math.random()*allGames.length)];openGamePreview(g);};["heroSurprise","luckyButton"].forEach(id=>{if($(id))$(id).onclick=surprise;});

    /* Modal: one authoritative implementation, including automatic startup. */
    const modal=$("updateModal"),panel=modal&&modal.querySelector(".modal-content"),trigger=$("update-trigger"),close=$("closeBtn"),dismiss=$("dismissBtn");
    let previousFocus=null;
    const openModal=()=>{if(!modal)return;previousFocus=document.activeElement;const scrollBarWidth=window.innerWidth-document.documentElement.clientWidth;if(scrollBarWidth>0){modal.__originalBodyPaddingRight=document.body.style.paddingRight||'';document.body.style.paddingRight=`${scrollBarWidth}px`;}document.body.classList.add("modal-open");modal.classList.add("active");modal.setAttribute("aria-hidden","false");try{if(panel)panel.focus();}catch(e){}const trail=document.querySelector('.scroll-trail');if(trail)trail.style.opacity='0';};
    const closeModal=()=>{if(!modal)return;modal.classList.remove("active");modal.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");if(modal.__originalBodyPaddingRight!==undefined){document.body.style.paddingRight=modal.__originalBodyPaddingRight;delete modal.__originalBodyPaddingRight;}else document.body.style.paddingRight='';try{if(previousFocus&&previousFocus.focus)previousFocus.focus();}catch(e){}const trail=document.querySelector('.scroll-trail');if(trail)trail.style.opacity='';};
    window.GamePlazaModal={open:openModal,close:closeModal};
    if(trigger)trigger.onclick=()=>{openModal();};if(close)close.onclick=closeModal;if(dismiss)dismiss.onclick=closeModal;if(modal)modal.onclick=e=>{if(e.target===modal)closeModal();};
    document.addEventListener("keydown",e=>{if((e.key==="Escape"||e.key==="Esc")&&modal&&modal.classList.contains("active"))closeModal();if((e.key==="Escape"||e.key==="Esc")&&preview&&preview.close)preview.close();});

    /* Version history */
    const historyRoot = modal && modal.querySelector(".version-history");
    if (historyRoot) {
      const history = [
        { version: "August 28, 2026", title: "Summer Update", changes: [
          "Switched games and most JavaScript to external files.",
          "Added categories and search improvements.",
          "Added favorites and recently played history.",
          "Renamed update requests to feedback.",
          "Added clear search button and GitHub repo button.",
          "Added coreHZ.",
          "Added Escape-key support for the update modal.",
          "Added changing search/title messages.",
          "Streamlined the Settings page.",
          "Added game preview embeds with a Play Game button.",
          "Added Granny, Angry Birds 2, Run 3, and other game updates.",
          "Fixed osu! and added Roblox via nowgg.fun."
        ]}
      ];
      historyRoot.replaceChildren();
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "version-history-toggle";
      toggle.textContent = "📜 Version History";
      toggle.setAttribute("aria-expanded", "false");
      const list = document.createElement("div");
      list.className = "version-history-list";
      list.hidden = true;
      history.forEach(item => {
        const entry = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = item.version + " — " + item.title;
        const ul = document.createElement("ul");
        item.changes.forEach(change => { const li = document.createElement("li"); li.textContent = change; ul.appendChild(li); });
        entry.append(summary, ul);
        list.appendChild(entry);
      });
      toggle.onclick = () => { list.hidden = !list.hidden; toggle.setAttribute("aria-expanded", String(!list.hidden)); };
      historyRoot.append(toggle, list);
    }

    /* Merged scroll banner */
    const heroTitle = document.querySelector(".hero h1");
    const heroActions = document.querySelector(".hero-actions");
    if (!heroTitle || document.getElementById("scroll-banner")) return;

    const style = document.createElement("style");
    style.textContent = `
      .scroll-banner {
        position: fixed; top:0; left:0; right:0; z-index:9999;
        display:flex; justify-content:center;
        transform:translateY(-110%); opacity:0; pointer-events:none;
        transition:transform .25s ease,opacity .25s ease;
        background:rgba(25,15,38,.94);
        border-bottom:1px solid rgba(123,31,162,.7);
        box-shadow:0 8px 24px rgba(0,0,0,.28);
        backdrop-filter:blur(10px);
      }
      .scroll-banner.visible { transform:translateY(0); opacity:1; pointer-events:auto; }
      .scroll-banner-inner { width:min(1100px,calc(100% - 32px)); min-height:58px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
      .scroll-banner-link { display:inline-flex; align-items:center; gap:10px; color:var(--text,#f9f6ef); font-weight:700; font-size:1.15rem; text-decoration:none; }
      .scroll-banner-icon { width:34px; height:34px; object-fit:contain; border-radius:8px; }
      .scroll-banner-actions { display:flex; align-items:center; gap:10px; }
      .scroll-banner-settings,.scroll-banner-proxy,.scroll-banner-surprise,.scroll-banner-feedback,.hero-settings-button,.hero-proxy-button {
        display:inline-flex; align-items:center; justify-content:center;
        border:2px solid rgba(244,143,177,.6); border-radius:12px;
        padding:13px 24px; color:#fff; background:rgba(244,143,177,.08);
        cursor:pointer; font:inherit; font-size:15px; font-weight:600;
        text-decoration:none; transition:transform .25s ease,box-shadow .25s ease,background .25s ease,border-color .25s ease;
      }
      .scroll-banner-settings:hover,.scroll-banner-proxy:hover,.scroll-banner-surprise:hover,.scroll-banner-feedback:hover,.hero-settings-button:hover,.hero-proxy-button:hover {
        transform:translateY(-3px); border-color:var(--pink,#f48fb1); background:var(--panel-hover,#25163a); box-shadow:0 8px 25px rgba(123,31,162,.35);
      }
      @media(max-width:560px){.scroll-banner-inner{width:calc(100% - 20px)}.scroll-banner-actions{gap:6px}.scroll-banner-settings,.scroll-banner-proxy,.scroll-banner-surprise{padding:8px 10px;font-size:.9rem}}
    `;
    document.head.appendChild(style);

    const banner=document.createElement("header");
    banner.id="scroll-banner"; banner.className="scroll-banner"; banner.setAttribute("aria-label","GamePlaza");
    banner.innerHTML=`
      <div class="scroll-banner-inner">
        <a class="scroll-banner-link" href="#main"><img src="../Normal.png" alt="" class="scroll-banner-icon"><span>GamePlaza</span></a>
        <div class="scroll-banner-actions">
          <a class="scroll-banner-surprise" href="#browse">Surprise Me!</a>
          <a class="scroll-banner-proxy" href="https://techmaster2013.github.io/coreHZ">coreHZ</a>
          <a class="scroll-banner-settings" href="settings.html">Settings</a>
          <a class="scroll-banner-feedback" href="requests.html">Feedback</a>
        </div>
      </div>`;
    document.body.prepend(banner);

    const heroSurprise=document.getElementById("heroSurprise");
    banner.querySelector(".scroll-banner-surprise")?.addEventListener("click",e=>{e.preventDefault();heroSurprise?.click()});

    if(heroActions&&!document.getElementById("hero-settings")){
      const proxy=document.createElement("a"); proxy.id="hero-proxy"; proxy.className="hero-proxy-button"; proxy.href="https://techmaster2013.github.io/coreHZ"; proxy.textContent="coreHZ"; heroActions.appendChild(proxy);
      const settings=document.createElement("a"); settings.id="hero-settings"; settings.className="hero-settings-button"; settings.href="settings.html"; settings.textContent="Settings"; heroActions.appendChild(settings);
    }

    const updateVisibility=()=>banner.classList.toggle("visible",window.scrollY>heroTitle.getBoundingClientRect().bottom);
    window.addEventListener("scroll",updateVisibility,{passive:true}); window.addEventListener("resize",updateVisibility,{passive:true}); updateVisibility();
  };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();

    /* Short blue scroll trail */
    const trail=document.createElement("div");trail.className="scroll-trail";trail.style.transition="height .18s ease, opacity .18s ease";document.body.appendChild(trail);let trailTimer;
    const updateTrail=()=>{if(modal&&modal.classList.contains('active')){trail.style.height='0px';trail.style.opacity='0';return;}const documentHeight=document.documentElement.scrollHeight-innerHeight;const progress=documentHeight>0?scrollY/documentHeight:0;const thumbHeight=Math.max(74,innerHeight*(innerHeight/document.documentElement.scrollHeight));const thumbTop=Math.max(0,Math.min(innerHeight-thumbHeight,progress*(innerHeight-thumbHeight)));trail.style.height=thumbHeight+'px';trail.style.top=thumbTop+'px';trail.style.opacity='1';};
    addEventListener("scroll",()=>{updateTrail();trail.classList.add("scrolling");clearTimeout(trailTimer);trailTimer=setTimeout(()=>{trail.classList.remove("scrolling");if(!(modal&&modal.classList.contains('active')))trail.style.opacity='';},600);},{passive:true});addEventListener("resize",updateTrail,{passive:true});updateTrail();

    if($("backTop"))$("backTop").onclick=()=>scrollTo({top:0,behavior:"smooth"});
    if(search){const title=document.querySelector(".hero h1 .magic-text");if(title){const msgs=[["gameplaza is the best","choose a game already"],["hiiii","welcome to gameplaza!"],["psst","there are hidden games in the search..."]];const rotate=()=>{const m=msgs[Math.floor(Math.random()*msgs.length)];title.textContent=m[0];search.placeholder="🔍 "+m[1];setTimeout(rotate,1E4);};rotate();}}

    buildCategories();renderGames();renderHome();updateCounts();const loading=$("loading");if(loading)loading.hidden=true;setTimeout(openModal,120);
  });
})();
