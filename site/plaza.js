// GLOBAL SETTINGS APPLY
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

// INDEX PAGE LOGIC
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

      const title = document.createElement("div");
      title.className = "game-title";
      title.innerHTML = `${game.name} ${favorites.includes(game.name) ? "★" : "☆"}`;
      title.onclick = (e) => {
        e.stopPropagation();
        toggleFavorite(game.name);
      };

      btn.appendChild(title);

      btn.onclick = () => {
        addRecent(game.name);
        window.location.href = game.url;
      };

      grid.appendChild(btn);
    });

    updateCounts();
  }

  function toggleFavorite(name) {
    if (favorites.includes(name)) {
      favorites = favorites.filter(x => x !== name);
    } else {
      favorites.push(name);
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
    allChip.onclick = () => renderGames(allGames);
    row.appendChild(allChip);

    cats.forEach(cat => {
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.textContent = cat;
      chip.onclick = () => renderGames(allGames.filter(g => g.category === cat));
      row.appendChild(chip);
    });
  }

  const searchInput = document.getElementById("game-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      renderGames(allGames.filter(g => g.name.toLowerCase().includes(q)));
    });
  }

  const chipFav    = document.getElementById("chip-fav");
  const chipRecent = document.getElementById("chip-recent");
  const chipAll    = document.getElementById("chip-all");

  if (chipFav) {
    chipFav.onclick = () =>
      renderGames(allGames.filter(g => favorites.includes(g.name)));
  }

  if (chipRecent) {
    chipRecent.onclick = () =>
      renderGames(allGames.filter(g => recent.includes(g.name)));
  }

  if (chipAll) {
    chipAll.onclick = () => renderGames(allGames);
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
}

// SETTINGS PAGE LOGIC
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
