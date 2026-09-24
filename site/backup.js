/* Particles */
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.onresize = resize;

let particles = [];
for (let i = 0; i < 60; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    dx: (Math.random() - 0.5) * 0.5,
    dy: (Math.random() - 0.5) * 0.5
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "#3b82f6";
    ctx.fill();
  });
  requestAnimationFrame(animate);
}
animate();

/* GLOBAL SETTINGS APPLY */
window.addEventListener("load", () => {
  const title = localStorage.getItem("gp_cloak_title");
  const icon  = localStorage.getItem("gp_cloak_icon");
  const sizer = localStorage.getItem("gp_mobile_sizer");

  if (title) document.title = title;

  if (icon) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = icon;
  }

  if (sizer === "enabled") {
    document.body.style.width = "480px";
  }

  const modal = document.getElementById("updateModal");
  if (modal) modal.classList.add("active");
});

/* INDEX PAGE LOGIC */
if (document.getElementById("game-grid")) {
  let favorites = JSON.parse(localStorage.getItem("gp_favorites") || "[]");
  let recent    = JSON.parse(localStorage.getItem("gp_recent") || "[]");
  let allGames  = [];

  // Load games directly from games.js (no fetch)
  allGames = window.games || [];

  buildCategories(allGames);
  renderGames(allGames);

  function renderGames(list) {
    const grid = document.getElementById("game-grid");
    grid.innerHTML = "";

    list.forEach(game => {
      const btn = document.createElement("button");

      if (game.img) {
        const img = document.createElement("img");
        img.src = game.img;
        btn.appendChild(img);
      }

      const gameName = game.name || game.label || "Unknown";

      const title = document.createElement("div");
      title.className = "game-title";
      title.innerHTML = `${gameName} ${favorites.includes(gameName) ? "★" : "☆"}`;

      title.onclick = (e) => {
        e.stopPropagation();
        toggleFavorite(gameName);
      };

      btn.onclick = () => {
        addRecent(gameName);
        window.location.href = game.url;
      };

      btn.appendChild(title);
      grid.appendChild(btn);
    });

    updateCounts();

    const loading = document.getElementById("loading");
    if (loading) loading.style.display = "none";
  }

  function toggleFavorite(name) {
    const gameName = name || "";
    if (favorites.includes(gameName)) {
      favorites = favorites.filter(x => x !== gameName);
    } else {
      favorites.push(gameName);
    }
    localStorage.setItem("gp_favorites", JSON.stringify(favorites));
    renderGames(allGames);
  }

  function addRecent(name) {
    recent = recent.filter(x => x !== name);
    recent.unshift(name);
    recent = recent.slice(0, 20);
    localStorage.setItem("gp_recent", JSON.stringify(recent));
    updateCounts();
  }

  function updateCounts() {
    const favEl    = document.getElementById("favCount");
    const recentEl = document.getElementById("recentCount");
    if (favEl)    favEl.textContent    = favorites.length;
    if (recentEl) recentEl.textContent = recent.length;
  }

  function buildCategories(games) {
    const row = document.getElementById("category-row");
    if (!row) return;

    const cats = [...new Set(games.map(g => g.category).filter(Boolean))];
    row.innerHTML = "";

    const allChip = document.createElement("div");
    allChip.className = "chip";
    allChip.textContent = "All";
    allChip.onclick = () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      allChip.classList.add('active');
      renderGames(allGames);
    };
    row.appendChild(allChip);

    cats.forEach(cat => {
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.textContent = cat;
      chip.onclick = () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderGames(allGames.filter(g => g.category === cat));
      };
      row.appendChild(chip);
    });
  }

  const searchInput = document.getElementById("game-search");
  const searchClear = document.getElementById("search-clear");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();

      renderGames(
        allGames.filter(g => {
          const gameName = (g.name || g.label || "").toLowerCase();
          return gameName.includes(q);
        })
      );

      // show/hide clear button if present
      if (searchClear) {
        searchClear.hidden = !e.target.value;
      }
    });
  }

  if (searchClear) {
    searchClear.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      searchClear.hidden = true;

      // Re-render the full game list
      renderGames(allGames);

      if (searchInput) searchInput.focus();
    });
  }
  const chipFav    = document.getElementById("chip-fav");
  const chipRecent = document.getElementById("chip-recent");
  const chipAll    = document.getElementById("chip-all");

  if (chipFav) {
    chipFav.onclick = () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chipFav.classList.add('active');
      renderGames(allGames.filter(g => favorites.includes(g.name || g.label)));
    };
  }

  if (chipRecent) {
    chipRecent.onclick = () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chipRecent.classList.add('active');
      renderGames(allGames.filter(g => recent.includes(g.name || g.label)));
    };
  }

  if (chipAll) {
    chipAll.onclick = () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chipAll.classList.add('active');
      renderGames(allGames);
    };
  }

  const trigger = document.getElementById("update-trigger");
  const modal   = document.getElementById("updateModal");
  const close   = document.getElementById("closeBtn");
  const dismiss = document.getElementById("dismissBtn");

  if (trigger && modal) trigger.onclick = () => modal.classList.add("active");
  if (close && modal)   close.onclick   = () => modal.classList.remove("active");
  if (dismiss && modal) dismiss.onclick = () => modal.classList.remove("active");

  if (modal) {
    modal.onclick = (e) => {
      if (e.target.id === "updateModal") {
        modal.classList.remove("active");
      }
    };
  }

  // allow ESC to close the update modal when visible
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      const m = document.getElementById('updateModal');
      if (m && m.classList.contains('active')) {
        m.classList.remove('active');
      }
    }
  });

  const surpriseBtn = document.getElementById("surprise-btn");
  if (surpriseBtn) {
    surpriseBtn.onclick = () => {
      surpriseBtn.classList.add("flash");
      setTimeout(() => surpriseBtn.classList.remove("flash"), 400);

      if (allGames.length > 0) {
        const random = allGames[Math.floor(Math.random() * allGames.length)];
        if (random && random.url) {
          addRecent(random.name || random.label || "Unknown");
          window.location.href = random.url;
        }
      }
    };
  }

  const backTop = document.getElementById("backTop");
  if (backTop) {
    backTop.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Occasionally change the on-page title (the H1 text) and the search placeholder
  // to playful messages, then revert after a short time. Adds fade in/out and an extra message.
  (function playfulTextFlasher() {
    const pageTitleEl = document.querySelector('h1 .magic-text');
    if (!pageTitleEl || !searchInput) return;

    const originalTitle = pageTitleEl.textContent;
    const originalPlaceholder = searchInput.getAttribute('placeholder') || '';
    const messages = [
      { title: 'gameplaza is the best', placeholder: 'choose a game already' },
      { title: 'hiiiiiiiii', placeholder: 'choose a game already' }
    ];

    const fadeDuration = 600; // ms for fade in/out
    const visibleDuration = 10000; // ms message stays visible (10s)

    // ensure elements have transition
    pageTitleEl.style.transition = `opacity ${fadeDuration}ms ease`;
    searchInput.style.transition = `opacity ${fadeDuration}ms ease`;

    let scheduled = null;

    function doFlash() {
      const msg = messages[Math.floor(Math.random() * messages.length)];

      // fade out
      pageTitleEl.style.opacity = '0';
      searchInput.style.opacity = '0';

      setTimeout(() => {
        try {
          pageTitleEl.textContent = msg.title;
          searchInput.setAttribute('placeholder', msg.placeholder);
        } catch (e) {}

        // fade in
        pageTitleEl.style.opacity = '1';
        searchInput.style.opacity = '1';

        // stay visible for visibleDuration, then revert with fade
        setTimeout(() => {
          pageTitleEl.style.opacity = '0';
          searchInput.style.opacity = '0';

          setTimeout(() => {
            try {
              pageTitleEl.textContent = originalTitle;
              searchInput.setAttribute('placeholder', originalPlaceholder);
            } catch (e) {}

            pageTitleEl.style.opacity = '1';
            searchInput.style.opacity = '1';

            scheduleNext();
          }, fadeDuration);
        }, visibleDuration);
      }, fadeDuration);
    }

    function scheduleNext() {
      const delay = 7000 + Math.random() * 23000; // between 7s and 30s
      scheduled = setTimeout(doFlash, delay);
    }

    scheduleNext();

    // clean-up in case page navigates away (not strictly necessary here)
    window.addEventListener('beforeunload', () => {
      if (scheduled) clearTimeout(scheduled);
    });
  })();
}

/* SETTINGS PAGE LOGIC */
if (document.title.includes("Settings")) {
  const clearFav    = document.getElementById("clearFav");
  const clearRecent = document.getElementById("clearRecent");
  const cloakGoogle = document.getElementById("cloakGoogle");
  const cloakCustom = document.getElementById("cloakCustom");
  const cloakTitle  = document.getElementById("cloakTitle");
  const cloakIcon   = document.getElementById("cloakIcon");
  const applyCustom = document.getElementById("applyCustom");
  const mobileSizer = document.getElementById("mobileSizer");
  const antiDeledao = document.getElementById("antiDeledao");

  window.addEventListener("load", () => {
    if (mobileSizer)
      mobileSizer.checked = localStorage.getItem("gp_mobile_sizer") === "enabled";

    if (antiDeledao)
      antiDeledao.checked = localStorage.getItem("gp_deledao") === "enabled";

    const t = localStorage.getItem("gp_cloak_title");
    if (cloakGoogle)
      cloakGoogle.checked = t === "Google";
    if (cloakCustom)
      cloakCustom.checked = t && t !== "Google";
  });

  if (clearFav) {
    clearFav.onclick = () => {
      localStorage.removeItem("gp_favorites");
      alert("Favorites cleared!");
    };
  }

  if (clearRecent) {
    clearRecent.onclick = () => {
      localStorage.removeItem("gp_recent");
      alert("Recently Played cleared!");
    };
  }

  if (cloakGoogle) {
    cloakGoogle.onchange = () => {
      if (cloakGoogle.checked) {
        localStorage.setItem("gp_cloak_title", "Google");
        localStorage.setItem("gp_cloak_icon", "https://www.google.com/favicon.ico");
      } else {
        localStorage.removeItem("gp_cloak_title");
        localStorage.removeItem("gp_cloak_icon");
      }
    };
  }

  if (applyCustom) {
    applyCustom.onclick = () => {
      const t = cloakTitle ? cloakTitle.value : "";
      const i = cloakIcon ? cloakIcon.value : "";
      if (t) localStorage.setItem("gp_cloak_title", t);
      if (i) localStorage.setItem("gp_cloak_icon", i);
      alert("Custom cloak applied!");
    };
  }

  if (mobileSizer) {
    mobileSizer.onchange = () => {
      if (mobileSizer.checked)
        localStorage.setItem("gp_mobile_sizer", "enabled");
      else
        localStorage.removeItem("gp_mobile_sizer");
    };
  }

  if (antiDeledao) {
    antiDeledao.onchange = () => {
      if (antiDeledao.checked)
        localStorage.setItem("gp_deledao", "enabled");
      else
        localStorage.removeItem("gp_deledao");
    };
  }

  window.cloakBlank = function () {
    window.location.replace("about:blank");
  };
}


/* Firestore changelog sync */
(async () => {
  try {
    const [{ initializeApp }, { getFirestore, doc, getDoc }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js")
    ]);
    const app = initializeApp({
      apiKey: "AIzaSyDAd_RUXKRdXICgvtprC3i7_PST_BxmtE",
      authDomain: "gplaza-feedback.firebaseapp.com",
      projectId: "gplaza-feedback",
      storageBucket: "gplaza-feedback.firebasestorage.app",
      messagingSenderId: "311535800676",
      appId: "1:311535800676:web:44bbebd348b5e3e9e66a71"
    }, "gameplaza-changelog");
    const db = getFirestore(app);
    const snap = await getDoc(doc(db, "changelog", "main"));
    if (!snap.exists()) return;
    const data = snap.data();
    const current = data.current;
    const escapeHtml = value => { const d=document.createElement("div"); d.textContent=value ?? ""; return d.innerHTML; };
    const sectionHtml = item => {
      const out=[];
      if(item.notes) out.push("<h3>Update Notes</h3><p>"+escapeHtml(String(item.notes)).replace(/\n/g,"<br>")+"</p>");
      [["Features Added",item.features],["New Games",item.newGames],["Known Bugs",item.bugs]].forEach(([h,v])=>{
        if(Array.isArray(v)&&v.length) out.push("<h3>"+h+"</h3><ul>"+v.map(x=>"<li>"+escapeHtml(String(x))+"</li>").join("")+"</ul>");
      });
      if(item.releaseDate) out.push("<p><strong>Release Date:</strong> "+escapeHtml(String(item.releaseDate))+"</p>");
      return out.join("");
    };
    const modal=document.getElementById("updateModal");
    if(current && modal){
      const title=modal.querySelector(".modal-header h2");
      const body=modal.querySelector(".modal-body");
      if(title) title.textContent=current.title||"Update";
      if(body) body.innerHTML=sectionHtml(current);
    }
    const root=document.getElementById("versionHistory");
    const history=Array.isArray(data.history)?data.history:[];
    if(root && history.length){
      root.innerHTML="";
      const toggle=document.createElement("button");
      toggle.type="button";
      toggle.className="version-history-toggle";
      toggle.textContent="📜 Version History";
      toggle.setAttribute("aria-expanded","false");
      const list=document.createElement("div");
      list.className="version-history-list";
      list.hidden=true;
      history.forEach(item=>{
        const details=document.createElement("details");
        const summary=document.createElement("summary");
        summary.textContent=(item.version||"Previous")+" — "+(item.title||"Update");
        const body=document.createElement("div");
        body.className="history-entry";
        body.innerHTML=sectionHtml(item);
        details.append(summary,body);
        list.appendChild(details);
      });
      toggle.onclick=()=>{list.hidden=!list.hidden;toggle.setAttribute("aria-expanded",String(!list.hidden));};
      root.append(toggle,list);
    }
  } catch(error) {
    console.warn("GamePlaza changelog sync unavailable; using local changelog.", error);
  }
})();