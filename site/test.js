(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);
    const allGames = Array.isArray(window.games) ? window.games : [];
    const categoryLabels = window.CATEGORY_LABELS || {};

    const readArray = (key) => {
      try {
        const value = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(value) ? value : [];
      } catch (_) {
        return [];
      }
    };
    const save = (key, value) => {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
    };

    let favorites = readArray("gp_favorites");
    let recent = readArray("gp_recent");
    let state = { query: "", category: "all", activity: "all" };

    const gameName = (game) => game && (game.label || game.name) || "Unknown";
    const gameUrl = (game) => game && game.url || "#";
    const findGame = (name) => allGames.find((game) => gameName(game) === name);

    /* Particles */
    const canvas = $("particles");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      let particles = [];
      const makeParticles = () => {
        particles = Array.from({ length: 60 }, () => ({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 2 + 1,
          dx: (Math.random() - 0.5) * 0.5,
          dy: (Math.random() - 0.5) * 0.5
        }));
      };
      const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
          p.x += p.dx; p.y += p.dy;
          if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(244,143,177,.55)";
          ctx.fill();
        });
        requestAnimationFrame(animate);
      };
      resize(); makeParticles(); animate();
      window.addEventListener("resize", () => { resize(); makeParticles(); });
    }

    /* Settings / cloak */
    const cloakTitle = localStorage.getItem("gp_cloak_title");
    const cloakIcon = localStorage.getItem("gp_cloak_icon");
    if (cloakTitle) document.title = cloakTitle;
    if (cloakIcon) {
      let icon = document.querySelector("link[rel~='icon']");
      if (!icon) { icon = document.createElement("link"); icon.rel = "icon"; document.head.appendChild(icon); }
      icon.href = cloakIcon;
    }
    if (localStorage.getItem("gp_mobile_sizer") === "enabled") document.body.classList.add("mobile-sized");

    const updateCounts = () => {
      if ($("favCount")) $("favCount").textContent = favorites.length;
      if ($("recentCount")) $("recentCount").textContent = recent.length;
      if ($("homeFavoriteCount")) $("homeFavoriteCount").textContent = `${favorites.length} game${favorites.length === 1 ? "" : "s"}`;
      if ($("homeRecentCount")) $("homeRecentCount").textContent = `${recent.length} game${recent.length === 1 ? "" : "s"}`;
      if ($("homeGameCount")) $("homeGameCount").textContent = `${allGames.length} games`;
    };

    const addRecent = (name) => {
      recent = [name, ...recent.filter((item) => item !== name)].slice(0, 20);
      save("gp_recent", recent);
      updateCounts();
      renderHome();
    };

    const toggleFavorite = (name) => {
      favorites = favorites.includes(name) ? favorites.filter((item) => item !== name) : [...favorites, name];
      save("gp_favorites", favorites);
      updateCounts();
      renderHome();
      renderGames();
    };

    const createHomeGameCard = (game) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "home-game-card";
      const icon = document.createElement("span");
      icon.className = "game-icon";
      icon.textContent = favorites.includes(gameName(game)) ? "★" : "🎮";
      const title = document.createElement("strong");
      title.textContent = gameName(game);
      const category = document.createElement("small");
      category.textContent = categoryLabels[game.category] || game.category || "Game";
      card.append(icon, title, category);
      card.addEventListener("click", () => {
        addRecent(gameName(game));
        if (gameUrl(game) !== "#") window.location.href = gameUrl(game);
      });
      return card;
    };

    const emptyState = (icon, title, text) => {
      const box = document.createElement("div");
      box.className = "empty-state";
      box.innerHTML = `<span>${icon}</span><strong>${title}</strong><small>${text}</small>`;
      return box;
    };

    const renderHome = () => {
      const featured = $("featured-name");
      const featuredDescription = $("featured-description");
      const featuredPlay = $("featured-play");
      const featuredGame = findGame("Crazy Cattle 3D") || allGames[0];
      if (featuredGame && featured) {
        featured.textContent = gameName(featuredGame);
        featuredDescription.textContent = featuredGame.description || "Today's featured game from the GamePlaza collection.";
        featuredPlay.onclick = () => { addRecent(gameName(featuredGame)); if (gameUrl(featuredGame) !== "#") window.location.href = gameUrl(featuredGame); };
      } else if (featured) {
        featured.textContent = "No games found";
        featuredDescription.textContent = "The game library is empty.";
      }

      const recentContainer = $("recent-games");
      if (recentContainer) {
        recentContainer.replaceChildren();
        const games = recent.map(findGame).filter(Boolean).slice(0, 3);
        if (!games.length) recentContainer.appendChild(emptyState("⏱", "No recently played games yet.", "Games you play will appear here."));
        else games.forEach((game) => recentContainer.appendChild(createHomeGameCard(game)));
      }

      const newContainer = $("new-games");
      if (newContainer) {
        newContainer.replaceChildren();
        allGames.slice(-3).reverse().forEach((game) => newContainer.appendChild(createHomeGameCard(game)));
        if (!newContainer.children.length) newContainer.appendChild(emptyState("🆕", "No games yet.", "Add games to games.js to see them here."));
      }

      const favoriteContainer = $("favorite-games");
      if (favoriteContainer) {
        favoriteContainer.replaceChildren();
        const games = favorites.map(findGame).filter(Boolean).slice(0, 3);
        if (!games.length) favoriteContainer.appendChild(emptyState("☆", "No favorites yet.", "Use the ☆ on a game below to add it here."));
        else games.forEach((game) => favoriteContainer.appendChild(createHomeGameCard(game)));
      }
    };

    const getFilteredGames = () => {
      const query = state.query.toLowerCase();
      return allGames.filter((game) => {
        const name = gameName(game).toLowerCase();
        const categoryOK = state.category === "all" || game.category === state.category;
        const activityOK = state.activity === "all" ||
          (state.activity === "favorites" && favorites.includes(gameName(game))) ||
          (state.activity === "recent" && recent.includes(gameName(game)));
        return categoryOK && activityOK && (!query || name.includes(query));
      });
    };

    const setActivity = (activity) => {
      state.activity = activity;
      document.querySelectorAll("#activity-row .chip").forEach((chip) => chip.classList.remove("active"));
      const map = { favorites: "chip-fav", recent: "chip-recent", all: "chip-all" };
      const chip = $(map[activity]);
      if (chip) chip.classList.add("active");
      renderGames();
    };

    const renderGames = () => {
      const grid = $("game-grid");
      if (!grid) return;
      const list = getFilteredGames();
      grid.replaceChildren();
      if (!list.length) {
        grid.appendChild(emptyState("🔎", "No games found.", "Try a different search or filter."));
      } else {
        list.forEach((game) => {
          const btn = document.createElement("button");
          btn.type = "button";
          const img = game.img ? document.createElement("img") : null;
          if (img) { img.src = game.img; img.alt = gameName(game); img.loading = "lazy"; btn.appendChild(img); }
          const title = document.createElement("div");
          title.className = "game-title";
          title.textContent = gameName(game) + " ";
          const favorite = document.createElement("span");
          favorite.className = "favorite-toggle";
          favorite.textContent = favorites.includes(gameName(game)) ? "★" : "☆";
          favorite.title = favorites.includes(gameName(game)) ? "Remove favorite" : "Add favorite";
          favorite.setAttribute("role", "button");
          favorite.tabIndex = 0;
          const favoriteHandler = (event) => { event.preventDefault(); event.stopPropagation(); toggleFavorite(gameName(game)); };
          favorite.addEventListener("click", favoriteHandler);
          favorite.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") favoriteHandler(event); });
          title.appendChild(favorite);
          btn.appendChild(title);
          btn.addEventListener("click", () => { addRecent(gameName(game)); if (gameUrl(game) !== "#") window.location.href = gameUrl(game); });
          grid.appendChild(btn);
        });
      }
      const loading = $("loading");
      if (loading) loading.style.display = "none";
    };

    const buildCategories = () => {
      const row = $("category-row");
      if (!row) return;
      row.replaceChildren();
      const categories = [...new Set(allGames.map((game) => game.category).filter(Boolean))].sort((a,b) => (categoryLabels[a] || a).localeCompare(categoryLabels[b] || b));
      const addChip = (value, label) => {
        const chip = document.createElement("button");
        chip.type = "button"; chip.className = "chip"; chip.textContent = label;
        if (state.category === value) chip.classList.add("active");
        chip.addEventListener("click", () => { state.category = value; document.querySelectorAll("#category-row .chip").forEach((c) => c.classList.remove("active")); chip.classList.add("active"); renderGames(); });
        row.appendChild(chip);
      };
      addChip("all", "All");
      categories.forEach((category) => addChip(category, categoryLabels[category] || category));
    };

    /* Search */
    const search = $("game-search");
    const clear = $("search-clear");
    if (search) search.addEventListener("input", () => { state.query = search.value.trim(); if (clear) clear.hidden = !state.query; renderGames(); });
    if (clear) clear.addEventListener("click", () => { search.value = ""; state.query = ""; clear.hidden = true; renderGames(); search.focus(); });

    /* Activity */
    if ($("chip-fav")) $("chip-fav").addEventListener("click", () => setActivity("favorites"));
    if ($("chip-recent")) $("chip-recent").addEventListener("click", () => setActivity("recent"));
    if ($("chip-all")) $("chip-all").addEventListener("click", () => setActivity("all"));

    const goToBrowse = () => { const browse = $("browse"); if (browse) browse.scrollIntoView({ behavior: "smooth", block: "start" }); };
    const showFavorites = () => { goToBrowse(); setTimeout(() => setActivity("favorites"), 350); };
    const showRecent = () => { goToBrowse(); setTimeout(() => setActivity("recent"), 350); };
    if ($("heroBrowse")) $("heroBrowse").addEventListener("click", goToBrowse);
    if ($("homeAll")) $("homeAll").addEventListener("click", () => { goToBrowse(); setTimeout(() => setActivity("all"), 350); });
    if ($("homeFavorites")) $("homeFavorites").addEventListener("click", showFavorites);
    if ($("viewFavorites")) $("viewFavorites").addEventListener("click", showFavorites);
    if ($("homeRecent")) $("homeRecent").addEventListener("click", showRecent);
    if ($("viewHistory")) $("viewHistory").addEventListener("click", showRecent);

    /* Surprise Me */
    const surpriseMe = () => {
      if (!allGames.length) return;
      const game = allGames[Math.floor(Math.random() * allGames.length)];
      addRecent(gameName(game));
      if (gameUrl(game) !== "#") window.location.href = gameUrl(game);
    };
    ["heroSurprise", "luckyButton"].forEach((id) => { if ($(id)) $(id).addEventListener("click", surpriseMe); });

    /* Update modal */
    const modal = $("updateModal");
    const modalContent = modal ? modal.querySelector(".modal-content") : null;
    const openModal = () => {
      if (!modal) return;
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => { if (modalContent) modalContent.focus(); });
    };
    const closeModal = () => {
      if (!modal) return;
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      const trigger = $("update-trigger");
      if (trigger) trigger.focus();
    };
    if ($("update-trigger")) $("update-trigger").addEventListener("click", openModal);
    if ($("closeBtn")) $("closeBtn").addEventListener("click", closeModal);
    if ($("dismissBtn")) $("dismissBtn").addEventListener("click", closeModal);
    if (modal) modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && modal && !modal.hidden) closeModal(); });

    /* Back to top */
    if ($("backTop")) $("backTop").addEventListener("click", () => window.scrollTo({ top:0, behavior:"smooth" }));

    /* Playful text */
    if (search) {
      const title = document.querySelector(".hero h1 .magic-text");
      if (title) {
        const originalTitle = title.textContent;
        const originalPlaceholder = search.placeholder;
        const messages = [["gameplaza is the best","choose a game already"],["hiiiiiiiii","what are you playing?"],["welcome to the plaza","find something fun..."]];
        const schedule = () => setTimeout(() => {
          const message = messages[Math.floor(Math.random() * messages.length)];
          title.textContent = message[0]; search.placeholder = message[1];
          setTimeout(() => { title.textContent = originalTitle; search.placeholder = originalPlaceholder; schedule(); }, 4500);
        }, 18000 + Math.random() * 18000);
        schedule();
      }
    }

    buildCategories();
    renderGames();
    renderHome();
    updateCounts();
  });
})();