(function () {
  "use strict";

  const games = window.games || window.__games || [];
  const getGameCategory = window.getGameCategory || ((game) => (game && game.category) || "arcade");
  const CATEGORY_LABELS = window.CATEGORY_LABELS || { all: "All" };
  const RECENT_GAMES_KEY = "barnical-recent-games";
  const THEME_KEY = "barnical-theme";
  const SORT_KEY = "barnical-sort-mode";
  const LIKES_STORAGE_KEY = "barnical-anonymous-likes";
  const MAX_RECENT_GAMES = 8;
  const POPULARITY_PATH = "barnical/game-popularity";
  const LIKES_PATH = "barnical/game-likes";
  const PRESENCE_PATH = "barnical/presence";
  const NUMBER_FORMAT = new Intl.NumberFormat();
  const THEME_OPTIONS = {
    ember: {
      label: "Ember",
      bodyClass: "",
    },
    forest: {
      label: "Forest",
      bodyClass: "",
    },
    ocean: {
      label: "Ocean",
      bodyClass: "",
    },
    ink: {
      label: "Ink",
      bodyClass: "",
    },
    discord: {
      label: "Discord",
      bodyClass: "",
    },
    evil: {
      label: "Evil",
      bodyClass: "",
    }
  };

  const ICONS = {
    all: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    arcade: '<rect x="3" y="8" width="18" height="9" rx="4"/><circle cx="7" cy="11" r="0.6"/><circle cx="7" cy="14" r="0.6"/><circle cx="5.5" cy="12.5" r="0.6"/><circle cx="8.5" cy="12.5" r="0.6"/><circle cx="16" cy="11.5" r="1"/><circle cx="19" cy="13.5" r="1"/>',
    action: '<polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2"/>',
    puzzle: '<path d="M9 4h4a1.5 1.5 0 0 1 0 3 1.5 1.5 0 0 0 0 3h4v4a1.5 1.5 0 0 1-3 0 1.5 1.5 0 0 0-3 0v4H7a1.5 1.5 0 0 1 0-3 1.5 1.5 0 0 0 0-3H4V7a1.5 1.5 0 0 1 3 0 1.5 1.5 0 0 0 3 0V4z"/>',
    simulation: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 17.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 13a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 7a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 2.6a1.65 1.65 0 0 0 1-1.51V1a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 7a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    adventure: '<polygon points="3 11 21 3 13 21 11 13 3 11"/>',
    horror: '<path d="M12 3c-4 0-7 3.2-7 7.2V21l2.5-2 2 2 2.5-2 2 2 2.5-2 2 2v-10.8C19 6.2 16 3 12 3z"/><circle cx="9.5" cy="10.5" r="1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="10.5" r="1" fill="currentColor" stroke="none"/>',
    rhythm: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    sports: '<path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M7 5H4a3 3 0 0 0 3 6M17 5h3a3 3 0 0 1-3 6"/>'
  };

  function iconSvg(key) {
    return `<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[key] || ICONS.all}</svg>`;
  }

  // ---------- Build category data ----------

  const categorized = games.map((game) => ({
    game,
    category: game.category || getGameCategory(game)
  }));

  const counts = { all: games.length };
  Object.keys(CATEGORY_LABELS).forEach((key) => { if (key !== "all") counts[key] = 0; });
  categorized.forEach(({ category }) => { counts[category] = (counts[category] || 0) + 1; });

  const categoryOrder = Object.keys(CATEGORY_LABELS).filter((key) => key === "all" || counts[key] > 0);

  let activeCategory = "all";
  let activeSearchTerm = "";
  let activeSort = readStoredSortMode();
  let popularityByKey = {};
  let popularityReady = false;
  let likesByKey = {};
  let likesReady = false;
  let firebasePopularityRef = null;
  let firebasePopularityListenerAttached = false;
  let firebaseLikesRef = null;
  let firebaseLikesListenerAttached = false;
  let firebasePresenceRef = null;
  let firebasePresenceListenerAttached = false;
  let userPresenceRef = null;

  // ---------- DOM refs ----------

  const appShell = document.getElementById("appShell");
  const navScroll = document.getElementById("navScroll");
  const gameGrid = document.getElementById("gameGrid");
  const breadcrumbTitle = document.getElementById("breadcrumbTitle");
  const contentEyebrow = document.getElementById("contentEyebrow");
  const contentTitle = document.getElementById("contentTitle");
  const contentCount = document.getElementById("contentCount");
  const sortNote = document.getElementById("sortNote");
  const sortButtons = document.querySelectorAll(".sort-option");
  const recentSection = document.getElementById("recentSection");
  const recentRow = document.getElementById("recentRow");
  const recentClearBtn = document.getElementById("recentClear");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  const surpriseMeButton = document.getElementById("surpriseMeButton");
  const searchButtonLabel = document.querySelector(".search-button-label");
  const presenceCount = document.getElementById("presenceCount");
  const breadcrumbBrand = document.querySelector(".breadcrumb-brand");
  const brandTitle = document.querySelector(".brand-title");
  const brandSubtitle = document.querySelector(".brand-subtitle");
  const themePanelLabel = document.querySelector(".theme-panel-label");
  const creditsOpen = document.getElementById("creditsOpen");
  const changelogOpen = document.getElementById("changelogOpen");
  const feedbackOpen = document.getElementById("feedbackOpen");
  const chatOpen = document.getElementById("chatOpen");
  const themeButtons = document.querySelectorAll(".theme-option");
  const evilThemeButton = document.querySelector(".evil-theme-button");
  const mascotButton = document.getElementById("brandMascot");
  const mascotOverlay = document.getElementById("mascotRainbowOverlay");
  let mascotTapCount = 0;

  function shouldUsePerformanceLite() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowCpu = typeof navigator !== "undefined" && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const lowMemory = typeof navigator !== "undefined" && navigator.deviceMemory && navigator.deviceMemory <= 4;
    return reducedMotion || lowCpu || lowMemory;
  }

  function applyPerformanceMode() {
    if (shouldUsePerformanceLite()) {
      document.body.classList.add("is-performance-lite");
    }
  }

  applyPerformanceMode();

  function isMobile() {
    return window.matchMedia("(max-width: 960px)").matches;
  }

  function openModal(backdrop) {
    if (!backdrop) return;
    backdrop.classList.remove("modal-hidden", "closing");
  }

  function closeModal(backdrop) {
    if (!backdrop || backdrop.classList.contains("modal-hidden")) return;
    backdrop.classList.add("closing");
    const finish = () => {
      backdrop.classList.add("modal-hidden");
      backdrop.classList.remove("closing");
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
    } else {
      backdrop.addEventListener("animationend", finish, { once: true });
    }
  }

  function navigateToGame(game, event) {
    if (!game || !game.url) return;
    recordRecentGame(game);
    trackGamePopularity(game);

    const shouldOpenNewTab = Boolean(event && (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1));
    if (shouldOpenNewTab) {
      window.open(game.url, "_blank", "noopener,noreferrer");
      return;
    }

    window.setTimeout(() => {
      window.location.href = game.url;
    }, firebasePopularityRef ? 80 : 0);
  }

  function slugifyGameLabel(label) {
    return String(label || "")
      .toLowerCase()
      .trim()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getPopularityKey(game) {
    return slugifyGameLabel(game && game.label ? game.label : game && game.url ? game.url : "");
  }

  function formatPlayCount(count) {
    const value = Number(count) || 0;
    if (value <= 0) return "0";
    return NUMBER_FORMAT.format(value);
  }

  function readStoredLikes() {
    try {
      const raw = localStorage.getItem(LIKES_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (err) {
      return {};
    }
  }

  function writeStoredLikes(likes) {
    try {
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likes));
    } catch (err) {
      // Ignore storage failures.
    }
  }

  function getGameLikeState(game) {
    const key = getPopularityKey(game);
    const stored = readStoredLikes();
    const entry = stored[key];
    const firebaseCount = getLikeSnapshotForGame(game);
    return {
      count: Number(firebaseCount > 0 ? firebaseCount : (entry && entry.count ? entry.count : 0)),
      liked: Boolean(entry && entry.liked)
    };
  }

  function likeGame(game) {
    const key = getPopularityKey(game);
    const stored = readStoredLikes();
    const current = stored[key] || { count: 0, liked: false };

    if (current.liked) {
      current.count = Math.max(0, Number(current.count || 0) - 1);
      current.liked = false;
      stored[key] = current;
      writeStoredLikes(stored);
      likesByKey[key] = Math.max(0, Number(likesByKey[key] || 0) - 1);

      if (firebaseLikesRef && firebaseAuth && firebaseAuth.currentUser) {
        firebaseLikesRef.child(key).transaction((value) => {
          const numeric = typeof value === "number"
            ? value
            : Number(value && typeof value === "object" ? (value.count || value.likes || value.value || 0) : 0);
          return Math.max(0, numeric - 1);
        }).catch((error) => {
          console.warn("Failed to sync unlike count.", error);
        });
      }

      refreshVisibleState();
      return;
    }

    current.count = Number(current.count || 0) + 1;
    current.liked = true;
    stored[key] = current;
    writeStoredLikes(stored);
    likesByKey[key] = Number(likesByKey[key] || 0) + 1;

    if (firebaseLikesRef && firebaseAuth && firebaseAuth.currentUser) {
      firebaseLikesRef.child(key).transaction((value) => {
        const numeric = typeof value === "number"
          ? value
          : Number(value && typeof value === "object" ? (value.count || value.likes || value.value || 0) : 0);
        return numeric + 1;
      }).catch((error) => {
        console.warn("Failed to sync like count.", error);
      });
    }

    refreshVisibleState();
  }

  function readStoredSortMode() {
    try {
      const stored = localStorage.getItem(SORT_KEY);
      if (stored === "popularity" || stored === "likes") return stored;
      return "alphabetical";
    } catch (err) {
      return "alphabetical";
    }
  }

  function writeStoredSortMode(mode) {
    try {
      localStorage.setItem(SORT_KEY, mode);
    } catch (err) {
      // Ignore storage failures.
    }
  }

  function applySortMode(mode) {
    if (mode === "popularity") {
      activeSort = "popularity";
    } else if (mode === "likes") {
      activeSort = "likes";
    } else {
      activeSort = "alphabetical";
    }
    writeStoredSortMode(activeSort);
    sortButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.sort === activeSort);
    });
    if (sortNote) {
      if (activeSort === "popularity") {
        sortNote.textContent = popularityReady ? "Sorted by most popular." : "Loading popularity...";
      } else if (activeSort === "likes") {
        sortNote.textContent = likesReady ? "Sorted by most liked." : "Loading likes...";
      } else {
        sortNote.textContent = "Sorted alphabetically.";
      }
    }
    refreshVisibleState();
  }

  function getPopularitySnapshotForGame(game) {
    const key = getPopularityKey(game);
    const raw = popularityByKey[key];
    if (typeof raw === "number") return raw;
    if (raw && typeof raw === "object") {
      const values = [raw.count, raw.plays, raw.popularity, raw.value];
      for (const value of values) {
        if (typeof value === "number" && Number.isFinite(value)) return value;
      }
    }
    return 0;
  }

  function getLikeSnapshotForGame(game) {
    const key = getPopularityKey(game);
    const raw = likesByKey[key];
    if (typeof raw === "number") return raw;
    if (raw && typeof raw === "object") {
      const values = [raw.count, raw.likes, raw.value, raw.plays];
      for (const value of values) {
        if (typeof value === "number" && Number.isFinite(value)) return value;
      }
    }
    return 0;
  }

  function buildEnrichedGames() {
    return categorized.map(({ game, category }) => ({
      game,
      category,
      popularity: getPopularitySnapshotForGame(game),
      likes: getLikeSnapshotForGame(game)
    }));
  }

  function sortEntries(entries) {
    const list = [...entries];
    if (activeSort === "popularity") {
      list.sort((a, b) => {
        const popularityDelta = (b.popularity || 0) - (a.popularity || 0);
        if (popularityDelta !== 0) return popularityDelta;
        return a.game.label.localeCompare(b.game.label, undefined, {
          numeric: true,
          sensitivity: "base"
        });
      });
      return list;
    }

    if (activeSort === "likes") {
      list.sort((a, b) => {
        const likeDelta = (b.likes || 0) - (a.likes || 0);
        if (likeDelta !== 0) return likeDelta;
        return a.game.label.localeCompare(b.game.label, undefined, {
          numeric: true,
          sensitivity: "base"
        });
      });
      return list;
    }

    list.sort((a, b) => a.game.label.localeCompare(b.game.label, undefined, {
      numeric: true,
      sensitivity: "base"
    }));
    return list;
  }

  function readStoredRecentGames() {
    try {
      const raw = localStorage.getItem(RECENT_GAMES_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function writeStoredRecentGames(items) {
    try {
      localStorage.setItem(RECENT_GAMES_KEY, JSON.stringify(items.slice(0, MAX_RECENT_GAMES)));
    } catch (err) {
      // Ignore storage failures.
    }
  }

  function recordRecentGame(game) {
    const next = {
      label: game.label,
      url: game.url,
      thumbnail: game.thumbnail || "",
      category: game.category || getGameCategory(game),
      ts: Date.now()
    };

    const stored = readStoredRecentGames();
    const filtered = stored.filter((item) => item && item.url !== next.url);
    filtered.unshift(next);
    writeStoredRecentGames(filtered);
    renderRecentRow();
  }

  function setPopularityState(nextState) {
    const normalized = nextState && typeof nextState === "object" ? nextState : {};
    popularityByKey = normalized;
    popularityReady = true;
    if (sortNote) {
      if (activeSort === "popularity") {
        sortNote.textContent = "Sorted by most popular.";
      } else if (activeSort === "likes") {
        sortNote.textContent = likesReady ? "Sorted by most liked." : "Loading likes...";
      } else {
        sortNote.textContent = "Sorted alphabetically.";
      }
    }
    renderGrid();
    renderSearchResults(searchInput ? searchInput.value : "");
  }

  function setLikesState(nextState) {
    const normalized = nextState && typeof nextState === "object" ? nextState : {};
    likesByKey = normalized;
    likesReady = true;
    if (sortNote) {
      if (activeSort === "popularity") {
        sortNote.textContent = popularityReady ? "Sorted by most popular." : "Loading popularity...";
      } else if (activeSort === "likes") {
        sortNote.textContent = "Sorted by most liked.";
      } else {
        sortNote.textContent = "Sorted alphabetically.";
      }
    }
    renderGrid();
    renderSearchResults(searchInput ? searchInput.value : "");
  }

  function loadPopularityFromFirebase() {
    if (!firebasePopularityRef || !firebaseAuth || !firebaseAuth.currentUser || firebasePopularityListenerAttached) {
      if (!popularityReady) {
        popularityReady = true;
        renderGrid();
      }
      return;
    }

    firebasePopularityListenerAttached = true;
    firebasePopularityRef.on("value", (snapshot) => {
      const next = {};
      snapshot.forEach((child) => {
        next[child.key] = child.val();
      });
      setPopularityState(next);
    }, (error) => {
      console.warn("Firebase popularity listener failed, falling back to local sort only.", error);
      popularityReady = true;
      renderGrid();
    });
  }

  function loadLikesFromFirebase() {
    if (!firebaseLikesRef || !firebaseAuth || !firebaseAuth.currentUser || firebaseLikesListenerAttached) {
      if (!likesReady) {
        likesReady = true;
        renderGrid();
      }
      return;
    }

    firebaseLikesListenerAttached = true;
    firebaseLikesRef.on("value", (snapshot) => {
      const next = {};
      snapshot.forEach((child) => {
        next[child.key] = child.val();
      });
      setLikesState(next);
    }, (error) => {
      console.warn("Firebase likes listener failed, falling back to local likes only.", error);
      likesReady = true;
      renderGrid();
    });
  }

  function trackGamePopularity(game) {
    if (!firebasePopularityRef || !firebaseAuth || !firebaseAuth.currentUser) return;

    const popularityKey = getPopularityKey(game);
    if (!popularityKey) return;

    firebasePopularityRef.child(popularityKey).transaction((current) => {
      const numeric = typeof current === "number"
        ? current
        : current && typeof current === "object"
          ? Number(current.count || current.plays || current.popularity || current.value || 0)
          : 0;
      return numeric + 1;
    }).catch((error) => {
      console.warn("Failed to write popularity counter.", error);
    });
  }

  function getRecentGames() {
    const stored = readStoredRecentGames();
    return stored
      .map((item) => {
        const match = games.find((game) => game.url === item.url);
        if (match) {
          return match;
        }
        return item;
      })
      .filter(Boolean)
      .slice(0, MAX_RECENT_GAMES);
  }

  function renderRecentRow() {
    if (!recentSection || !recentRow) return;

    const items = getRecentGames();
    recentRow.innerHTML = "";
    recentSection.hidden = items.length === 0;

    if (items.length === 0) {
      return;
    }

    const isEvil = document.body.dataset.theme === "evil" || document.documentElement.dataset.theme === "evil";
    items.forEach((game) => {
      const displayLabel = isEvil ? `Evil ${game.label}` : game.label;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "recent-card";
      btn.setAttribute("aria-label", `Play ${displayLabel}`);
      btn.innerHTML = `
        <span class="recent-card-thumb">
          ${game.thumbnail ? `<img src="${game.thumbnail}" alt="" loading="lazy" decoding="async" />` : `<span class="recent-card-fallback">${game.label.charAt(0).toUpperCase()}</span>`}
        </span>
        <span class="recent-card-meta">
          <span class="recent-card-title">${displayLabel}</span>
          <span class="recent-card-category">${CATEGORY_LABELS[game.category] || game.category || "Game"}</span>
        </span>
      `;
      btn.addEventListener("click", (event) => navigateToGame(game, event));
      recentRow.appendChild(btn);
    });
  }

  function readTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || "ember";
    } catch (err) {
      return "ember";
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");
  }

  async function loadCredits() {
    const creditsList = document.getElementById("credits-list");
    if (!creditsList) return;

    try {
      const response = await fetch("assets/credits.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load credits");
      const data = await response.json();
      const entries = Object.entries(data || {});
      if (!entries.length) {
        creditsList.innerHTML = "<li>No credits available yet.</li>";
        return;
      }
      creditsList.innerHTML = entries
        .map(([name, role]) => `<li><strong>${escapeHtml(name)}</strong> - ${escapeHtml(role)}</li>`)
        .join("");
    } catch (error) {
      creditsList.innerHTML = "<li>Credits are unavailable right now.</li>";
      console.warn("Failed to load credits.", error);
    }
  }

  function applyTheme(themeName) {
    const theme = THEME_OPTIONS[themeName] ? themeName : "ember";
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (err) {
      // Ignore storage failures.
    }
    themeButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.theme === theme);
    });
    if (evilThemeButton) {
      evilThemeButton.classList.toggle("is-active", theme === "evil");
    }
    applyEvilText(theme === "evil");
    renderGrid();
  }

  function applyEvilText(isEvil) {
    if (breadcrumbBrand) breadcrumbBrand.textContent = isEvil ? "Evil Barnical" : "Barnacle V3";
    if (contentEyebrow) contentEyebrow.textContent = isEvil ? "Evil Library" : "Library";
    if (contentTitle) contentTitle.textContent = isEvil ? "All evil" : (activeCategory === "all" ? "All games" : CATEGORY_LABELS[activeCategory]);
    if (searchButtonLabel) searchButtonLabel.textContent = isEvil ? "Search evil" : "Search games";
    if (presenceCount) presenceCount.textContent = isEvil ? "0 evil online" : "0 online";
    if (brandTitle) brandTitle.textContent = isEvil ? "Evil Barnical" : "Barnical V3";
    if (brandSubtitle) brandSubtitle.textContent = isEvil ? "Made by evil students" : "Made by a student, for students";
    if (themePanelLabel) themePanelLabel.textContent = isEvil ? "Evil Theme" : "Theme";
    if (creditsOpen) creditsOpen.querySelector(".nav-title").textContent = isEvil ? "Evil Credits" : "Credits";
    if (changelogOpen) changelogOpen.querySelector(".nav-title").textContent = isEvil ? "Evil Changelog" : "Changelog";
    if (feedbackOpen) feedbackOpen.querySelector(".nav-title").textContent = isEvil ? "Evil feedback" : "Send feedback";
    if (chatOpen) chatOpen.querySelector(".nav-title").textContent = isEvil ? "Evil chat" : "Live chat";
    if (sortNote) sortNote.textContent = isEvil ? "Sorted evil." : "Sorted alphabetically.";

    const searchInputEl = document.getElementById("searchInput");
    const searchOverlayEl = document.getElementById("searchOverlay");
    const searchEmptyState = document.getElementById("searchEmptyState");
    const recentEyebrow = document.querySelector(".recent-eyebrow");
    const recentTitle = document.querySelector(".recent-title");
    const surpriseMeButtonEl = document.getElementById("surpriseMeButton");
    const feedbackTitle = document.getElementById("feedback-title");
    const changelogTitle = document.getElementById("changelog-title");
    const creditsTitle = document.getElementById("credits-title");
    const chatTitle = document.getElementById("chat-title");

    if (searchInputEl) searchInputEl.placeholder = isEvil ? "Search evil games..." : "Search games...";
    if (searchOverlayEl) searchOverlayEl.setAttribute("aria-label", isEvil ? "Search evil games" : "Search games");
    if (searchEmptyState) {
      const emptyText = searchEmptyState.querySelector("p");
      if (emptyText) emptyText.textContent = isEvil ? "Type to search evil games..." : "Type to search games...";
    }
    if (recentEyebrow) recentEyebrow.textContent = isEvil ? "Recently evil" : "Recently played";
    if (recentTitle) recentTitle.textContent = isEvil ? "Jump back into evil" : "Jump back in";
    if (surpriseMeButtonEl) {
      const surpriseLabel = surpriseMeButtonEl.querySelector("span");
      if (surpriseLabel) surpriseLabel.textContent = isEvil ? "Surprise evil" : "Surprise me";
    }
    if (feedbackTitle) feedbackTitle.textContent = isEvil ? "Send evil feedback" : "Send Feedback";
    if (changelogTitle) changelogTitle.textContent = isEvil ? "Evil Changelog" : "Changelog";
    if (creditsTitle) creditsTitle.textContent = isEvil ? "Evil Credits" : "Credits";
    if (chatTitle) chatTitle.textContent = isEvil ? "Evil Chat" : "Live Chat";
  }

  function triggerMascotEffect() {
    if (!mascotButton) return;

    mascotTapCount += 1;
    mascotButton.classList.remove("is-activated");
    void mascotButton.offsetWidth;
    mascotButton.classList.add("is-activated");

    if (mascotTapCount < 10) {
      return;
    }

    mascotTapCount = 0;
    document.body.classList.add("is-mascot-rainbow");
    if (mascotOverlay) {
      mascotOverlay.classList.add("is-active");
    }
  }

  if (mascotButton) {
    mascotButton.addEventListener("click", triggerMascotEffect);
    mascotButton.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        triggerMascotEffect();
      }
    });
    mascotButton.setAttribute("tabindex", "0");
  }

  function openRandomGame() {
    if (!games.length) return;
    const choice = games[Math.floor(Math.random() * games.length)];
    navigateToGame(choice);
  }

  if (surpriseMeButton) {
    surpriseMeButton.addEventListener("click", openRandomGame);
  }

  if (recentClearBtn) {
    recentClearBtn.addEventListener("click", () => {
      try {
        localStorage.removeItem(RECENT_GAMES_KEY);
      } catch (err) {
        // Ignore storage failures.
      }
      renderRecentRow();
    });
  }

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => applyTheme(button.dataset.theme || "ember"));
  });

  if (evilThemeButton) {
    evilThemeButton.addEventListener("click", () => applyTheme("evil"));
  }

  // ---------- Sidebar nav ----------

  function renderNav() {
    navScroll.innerHTML = "";
    categoryOrder.forEach((key) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nav-item" + (key === activeCategory ? " is-active" : "");
      btn.dataset.category = key;
      btn.innerHTML = `
        <span class="nav-item-main">
          ${iconSvg(key)}
          <span class="nav-title">${CATEGORY_LABELS[key]}</span>
        </span>
        <span class="nav-count">${counts[key] || 0}</span>
      `;
      btn.addEventListener("click", () => {
        activeCategory = key;
        renderNav();
        renderGrid();
        if (isMobile()) closeMobileDrawer();
      });
      navScroll.appendChild(btn);
    });
  }

  // ---------- Game cards ----------

  function buildCard({ game, category }) {
    const isEvil = document.body.dataset.theme === "evil" || document.documentElement.dataset.theme === "evil";
    const displayLabel = isEvil ? `Evil ${game.label}` : game.label;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "game-card";
    card.setAttribute("aria-label", `Play ${displayLabel}`);

    const thumbWrap = document.createElement("div");
    thumbWrap.className = "game-thumb";

    const tag = document.createElement("span");
    tag.className = "game-tag";
    tag.textContent = CATEGORY_LABELS[category] || category;

    const play = document.createElement("span");
    play.className = "game-play";
    play.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" stroke="none"><polygon points="6 4 20 12 6 20"/></svg>';

    thumbWrap.appendChild(tag);
    thumbWrap.appendChild(play);

    if (game.thumbnail) {
      const img = document.createElement("img");
      img.src = game.thumbnail;
      img.alt = `${game.label} thumbnail`;
      img.loading = "lazy";
      img.decoding = "async";
      img.onerror = () => {
        img.remove();
        card.classList.add("no-thumbnail");
        const fallback = document.createElement("span");
        fallback.className = "game-thumb-fallback";
        fallback.textContent = game.label.charAt(0).toUpperCase();
        thumbWrap.appendChild(fallback);
      };
      thumbWrap.appendChild(img);
    } else {
      card.classList.add("no-thumbnail");
      const fallback = document.createElement("span");
      fallback.className = "game-thumb-fallback";
      fallback.textContent = game.label.charAt(0).toUpperCase();
      thumbWrap.appendChild(fallback);
    }

    const body = document.createElement("div");
    body.className = "game-body";
    const title = document.createElement("p");
    title.className = "game-title";
    title.textContent = displayLabel;
    body.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "game-meta";

    const categoryChip = document.createElement("span");
    categoryChip.className = "game-meta-chip";
    categoryChip.textContent = CATEGORY_LABELS[category] || category || "Game";
    meta.appendChild(categoryChip);

    const popularity = getPopularitySnapshotForGame(game);
    if (popularity > 0) {
      const popularityChip = document.createElement("span");
      popularityChip.className = "game-meta-chip game-meta-chip-popularity";
      popularityChip.textContent = `${formatPlayCount(popularity)} plays`;
      meta.appendChild(popularityChip);
    }

    body.appendChild(meta);

    const likeState = getGameLikeState(game);
    const likeControl = document.createElement("div");
    likeControl.className = "game-like-control" + (likeState.liked ? " is-liked" : "");
    likeControl.setAttribute("role", "button");
    likeControl.setAttribute("tabindex", "0");
    likeControl.setAttribute("aria-label", `Like ${game.label}`);
    likeControl.innerHTML = `
      <span class="game-like-icon">${likeState.liked ? "♥" : "♡"}</span>
      <span class="game-like-count">${formatPlayCount(likeState.count)}</span>
    `;
    likeControl.addEventListener("click", (event) => {
      event.stopPropagation();
      likeGame(game);
    });
    likeControl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        likeGame(game);
      }
    });
    body.appendChild(likeControl);

    card.appendChild(thumbWrap);
    card.appendChild(body);
    card.style.setProperty("--card-index", "0");

    card.addEventListener("click", (event) => navigateToGame(game, event));

    return card;
  }

  function buildSkeletonCard(index) {
    const card = document.createElement("div");
    card.className = "game-card is-skeleton";
    card.style.setProperty("--card-index", String(index));
    card.innerHTML = `
      <div class="game-thumb skeleton-block">
        <span class="skeleton-tag"></span>
        <span class="skeleton-play"></span>
      </div>
      <div class="game-body">
        <span class="skeleton-line skeleton-line-title"></span>
        <span class="skeleton-meta-row">
          <span class="skeleton-chip"></span>
          <span class="skeleton-chip skeleton-chip-wide"></span>
        </span>
      </div>
    `;
    return card;
  }

  function refreshVisibleState() {
    renderGrid();
    if (searchOverlay && searchOverlay.classList.contains("is-open")) {
      renderSearchResults(searchInput ? searchInput.value : "");
    }
  }

  function renderGrid() {
    const term = activeSearchTerm.trim().toLowerCase();
    const isLoading = (activeSort === "popularity" && !popularityReady) || (activeSort === "likes" && !likesReady);
    const list = sortEntries(buildEnrichedGames()).filter(({ game, category }) => {
      const matchesCategory = activeCategory === "all" || category === activeCategory;
      const matchesTerm = !term || game.label.toLowerCase().includes(term);
      return matchesCategory && matchesTerm;
    });
    const isEvil = document.body.dataset.theme === "evil" || document.documentElement.dataset.theme === "evil";

    const activeLabel = activeCategory === "all" ? (isEvil ? "All evil" : "All games") : (isEvil ? `Evil ${CATEGORY_LABELS[activeCategory]}` : CATEGORY_LABELS[activeCategory]);
    breadcrumbTitle.textContent = activeLabel;
    contentTitle.textContent = activeLabel;
    contentEyebrow.textContent = isEvil ? "Evil Library" : "Library";
    contentCount.textContent = isLoading
      ? (activeSort === "likes" ? "Loading likes..." : "Loading popularity...")
      : `${list.length} ${isEvil ? "evil game" : "game"}${list.length === 1 ? "" : "s"}`;
    if (sortNote) {
      if (activeSort === "popularity") {
        sortNote.textContent = popularityReady ? "Sorted by most popular." : "Loading popularity...";
      } else if (activeSort === "likes") {
        sortNote.textContent = likesReady ? "Sorted by most liked." : "Loading likes...";
      } else {
        sortNote.textContent = "Sorted alphabetically.";
      }
    }

    gameGrid.innerHTML = "";

    if (isLoading) {
      for (let i = 0; i < 12; i += 1) {
        gameGrid.appendChild(buildSkeletonCard(i));
      }
      return;
    }

    if (list.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p>No games match this filter.</p>
      `;
      gameGrid.appendChild(empty);
      return;
    }

    list.forEach((entry, index) => {
      const card = buildCard(entry);
      card.style.setProperty("--card-index", String(index));
      gameGrid.appendChild(card);
    });
  }

  // ---------- Sidebar collapse / mobile drawer ----------

  function closeMobileDrawer() {
    appShell.classList.remove("sidebar-open");
  }

  sidebarToggle.addEventListener("click", () => {
    if (isMobile()) {
      appShell.classList.toggle("sidebar-open");
    } else {
      appShell.classList.toggle("is-collapsed");
    }
  });

  drawerBackdrop.addEventListener("click", closeMobileDrawer);

  // ---------- Search overlay ----------

  const searchOverlay = document.getElementById("searchOverlay");
  const searchOpen = document.getElementById("searchOpen");
  const searchBackdrop = document.getElementById("searchBackdrop");
  const searchClose = document.getElementById("searchClose");
  const searchInput = document.getElementById("searchInput");
  const searchEmptyState = document.getElementById("searchEmptyState");
  const searchResults = document.getElementById("searchResults");

  function openSearch() {
    searchOverlay.classList.add("is-open");
    document.body.classList.add("is-modal-open");
    searchInput.value = "";
    renderSearchResults("");
    setTimeout(() => searchInput.focus(), 50);
  }

  function closeSearch() {
    searchOverlay.classList.remove("is-open");
    document.body.classList.remove("is-modal-open");
  }

  function renderSearchResults(term) {
    const cleaned = term.trim().toLowerCase();
    const isEvil = document.body.dataset.theme === "evil" || document.documentElement.dataset.theme === "evil";
    if (!cleaned) {
      searchEmptyState.hidden = false;
      searchEmptyState.querySelector("p").textContent = isEvil ? "Type to search evil games..." : "Type to search games...";
      searchOverlay.setAttribute("aria-label", isEvil ? "Search evil games" : "Search games");
      if (searchInput) searchInput.placeholder = isEvil ? "Search evil games..." : "Search games...";
      searchResults.hidden = true;
      searchResults.innerHTML = "";
      return;
    }

    const matches = sortEntries(buildEnrichedGames())
      .filter(({ game }) => game.label.toLowerCase().includes(cleaned))
      .slice(0, 30);

    if (matches.length === 0) {
      searchEmptyState.hidden = false;
      searchEmptyState.querySelector("p").textContent = isEvil ? "No evil games found." : "No games found.";
      searchResults.hidden = true;
      searchResults.innerHTML = "";
      return;
    }

    searchEmptyState.hidden = true;
    searchResults.hidden = false;
    searchResults.innerHTML = "";

    matches.forEach(({ game, category }) => {
      const displayLabel = isEvil ? `Evil ${game.label}` : game.label;
      const row = document.createElement("button");
      row.type = "button";
      row.className = "search-result-item";

      const thumb = document.createElement("span");
      thumb.className = "search-result-thumb";
      if (game.thumbnail) {
        const img = document.createElement("img");
        img.src = game.thumbnail;
        img.alt = "";
        img.onerror = () => img.remove();
        thumb.appendChild(img);
      }

      const meta = document.createElement("span");
      meta.className = "search-result-meta";
      const popularity = getPopularitySnapshotForGame(game);
      meta.innerHTML = `
        <span class="search-result-title">${displayLabel}</span>
        <span class="search-result-category">${CATEGORY_LABELS[category] || category}${popularity > 0 ? ` • ${formatPlayCount(popularity)} plays` : ""}</span>
      `;

      row.appendChild(thumb);
      row.appendChild(meta);
      row.addEventListener("click", (event) => navigateToGame(game, event));
      searchResults.appendChild(row);
    });
  }

  searchOpen.addEventListener("click", openSearch);
  searchBackdrop.addEventListener("click", closeSearch);
  searchClose.addEventListener("click", closeSearch);
  searchInput.addEventListener("input", (e) => renderSearchResults(e.target.value));
  sortButtons.forEach((button) => {
    button.addEventListener("click", () => applySortMode(button.dataset.sort || "alphabetical"));
  });

  function isTextInputTarget(target) {
    if (!target || target.nodeType !== 1) return false;
    const tag = target.tagName && target.tagName.toLowerCase();
    return Boolean(tag && (tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable));
  }

  document.addEventListener("keydown", (e) => {
    const isK = e.key === "k" || e.key === "K";
    if ((e.ctrlKey || e.metaKey) && isK) {
      e.preventDefault();
      if (searchOverlay.classList.contains("is-open")) closeSearch();
      else openSearch();
    } else if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !isTextInputTarget(e.target)) {
      e.preventDefault();
      if (searchOverlay.classList.contains("is-open")) closeSearch();
      else openSearch();
    } else if (e.key === "Escape") {
      if (searchOverlay.classList.contains("is-open")) closeSearch();
      if (changelogBackdrop) closeModal(changelogBackdrop);
      if (creditsBackdrop) closeModal(creditsBackdrop);
      if (feedbackBackdrop) closeModal(feedbackBackdrop);
      if (chatBackdrop) closeChat();
      closeMobileDrawer();
    }
  });

  // ---------- Credits / Changelog modals ----------

  const changelogOpenBtn = document.getElementById("changelogOpen");
  const changelogBackdrop = document.getElementById("changelog-backdrop");
  const changelogCloseBtn = document.getElementById("changelog-close");
  const creditsOpenBtn = document.getElementById("creditsOpen");
  const creditsBackdrop = document.getElementById("credits-backdrop");
  const creditsCloseBtn = document.getElementById("credits-close");

  if (changelogOpenBtn && changelogBackdrop) {
    changelogOpenBtn.addEventListener("click", () => {
      openModal(changelogBackdrop);
      if (isMobile()) closeMobileDrawer();
    });
  }
  if (changelogCloseBtn) {
    changelogCloseBtn.addEventListener("click", () => closeModal(changelogBackdrop));
    changelogBackdrop.addEventListener("click", (e) => {
      if (e.target === changelogBackdrop) closeModal(changelogBackdrop);
    });
  }

  if (creditsOpenBtn && creditsBackdrop) {
    creditsOpenBtn.addEventListener("click", () => {
      loadCredits();
      openModal(creditsBackdrop);
      if (isMobile()) closeMobileDrawer();
    });
  }
  if (creditsCloseBtn) {
    creditsCloseBtn.addEventListener("click", () => closeModal(creditsBackdrop));
    creditsBackdrop.addEventListener("click", (e) => {
      if (e.target === creditsBackdrop) closeModal(creditsBackdrop);
    });
  }

  // ---------- Feedback modal ----------

  const SHEETS_URL = "https://script.google.com/macros/s/AKfycbzGWX8FlaW5WU5hIAgTVokVm55r9ExqzAvybXOWcCFXj_7_BmG0YjwNTQjBykBvHZTR0g/exec";

  const feedbackOpenBtn = document.getElementById("feedbackOpen");
  const feedbackBackdrop = document.getElementById("feedback-backdrop");
  const feedbackCancel = document.getElementById("feedback-cancel");
  const feedbackSubmit = document.getElementById("feedback-submit");
  const feedbackMessage = document.getElementById("feedback-message");
  const feedbackStatus = document.getElementById("feedback-status");
  const feedbackTypeBtns = document.querySelectorAll(".feedback-type-btn");

  let selectedType = "Suggestion";

  feedbackTypeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      feedbackTypeBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedType = btn.dataset.type;
    });
  });

  if (feedbackOpenBtn) {
    feedbackOpenBtn.addEventListener("click", () => {
      openModal(feedbackBackdrop);
      feedbackMessage.focus();
      if (isMobile()) closeMobileDrawer();
    });
  }

  feedbackCancel.addEventListener("click", () => closeModal(feedbackBackdrop));
  feedbackBackdrop.addEventListener("click", (e) => {
    if (e.target === feedbackBackdrop) closeModal(feedbackBackdrop);
  });

  feedbackSubmit.addEventListener("click", async () => {
    const text = feedbackMessage.value.trim();
    if (!text) {
      feedbackStatus.textContent = "Please write something first.";
      feedbackStatus.className = "error";
      return;
    }

    feedbackSubmit.disabled = true;
    feedbackStatus.textContent = "Sending…";
    feedbackStatus.className = "";

    try {
      // mode: "no-cors" is required for Google Apps Script web apps — the response
      // is opaque (status/ok can't be read), so a resolved promise is treated as success.
      await fetch(SHEETS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, message: text })
      });

      feedbackStatus.textContent = "Feedback sent — thanks!";
      feedbackStatus.className = "success";
      feedbackMessage.value = "";
      feedbackTypeBtns.forEach((b) => b.classList.remove("active"));
      feedbackTypeBtns[0].classList.add("active");
      selectedType = "Suggestion";
      setTimeout(() => closeModal(feedbackBackdrop), 1200);
    } catch (err) {
      feedbackStatus.textContent = "Failed to send. Try again.";
      feedbackStatus.className = "error";
    } finally {
      feedbackSubmit.disabled = false;
    }
  });

  // ---------- Live chat ----------

  const CHAT_STORAGE_KEY = "barnical-live-chat-messages";
  const CHAT_NAME_KEY = "barnical-live-chat-name";
  const CHAT_CHANNEL_NAME = "barnical-live-chat";
  const CHAT_MESSAGE_LIMIT = 100;
  const MAX_CHAT_NAME_LENGTH = 24;
  const MAX_CHAT_MESSAGE_LENGTH = 280;
  const CHAT_ROOM_PATH = window.FIREBASE_CHAT_PATH || "barnical/chat/main/messages";
  const FIREBASE_CONFIG = window.FIREBASE_CONFIG || null;
  const PROFANITY_PATTERNS = [
    /f[\W_]*u[\W_]*c[\W_]*k(?:[\W_]*(?:ing|er|ers|ed|s))?/gi,
    /s[\W_]*h[\W_]*i[\W_]*t(?:[\W_]*(?:ty|ter|ted|s|head))?/gi,
    /b[\W_]*i[\W_]*t[\W_]*c[\W_]*h(?:[\W_]*(?:es|ing|y))?/gi,
    /a[\W_]*s[\W_]*s(?:[\W_]*(?:hole|holes|es|hat|clown))?/gi,
    /d[\W_]*i[\W_]*c[\W_]*k(?:[\W_]*(?:head|s|weed))?/gi,
    /p[\W_]*u[\W_]*s[\W_]*s[\W_]*y/gi,
    /s[\W_]*l[\W_]*u[\W_]*t(?:[\W_]*(?:s|ty))?/gi,
    /w[\W_]*h[\W_]*o[\W_]*r[\W_]*e(?:[\W_]*(?:s))?/gi,
    /c[\W_]*u[\W_]*n[\W_]*t(?:[\W_]*(?:s|y))?/gi,
    /c[\W_]*r[\W_]*a[\W_]*p(?:[\W_]*(?:py|s|ped))?/gi,
    /d[\W_]*a[\W_]*m[\W_]*n(?:[\W_]*(?:ed|ing|it))?/gi,
    /b[\W_]*a[\W_]*s[\W_]*t[\W_]*a[\W_]*r[\W_]*d(?:[\W_]*(?:s))?/gi,
    /m[\W_]*o[\W_]*t[\W_]*h[\W_]*e[\W_]*r[\W_]*f[\W_]*u[\W_]*c[\W_]*k(?:[\W_]*(?:ing|er|ers|ed|s))?/gi,
    /c[\W_]*o[\W_]*c[\W_]*k(?:[\W_]*(?:s|sucker|block))?/gi,
    /p[\W_]*r[\W_]*i[\W_]*c[\W_]*k(?:[\W_]*(?:s))?/gi,
    /t[\W_]*w[\W_]*a[\W_]*t(?:[\W_]*(?:s|ty))?/gi,
    /b[\W_]*u[\W_]*l[\W_]*l[\W_]*s[\W_]*h[\W_]*i[\W_]*t/gi,
    /d[\W_]*o[\W_]*u[\W_]*c[\W_]*h[\W_]*e(?:[\W_]*(?:bag|s))?/gi,
    /j[\W_]*a[\W_]*c[\W_]*k[\W_]*a[\W_]*s[\W_]*s(?:[\W_]*(?:es))?/gi,
    /d[\W_]*i[\W_]*p[\W_]*s[\W_]*h[\W_]*i[\W_]*t/gi,
    /d[\W_]*u[\W_]*m[\W_]*b[\W_]*a[\W_]*s[\W_]*s/gi,
    /w[\W_]*a[\W_]*n[\W_]*k(?:[\W_]*(?:er|ers|ing))?/gi,
    /b[\W_]*o[\W_]*l[\W_]*l[\W_]*o[\W_]*c[\W_]*k(?:[\W_]*(?:s))?/gi,
    /b[\W_]*u[\W_]*g[\W_]*g[\W_]*e[\W_]*r(?:[\W_]*(?:s|ed|ing))?/gi,
    /b[\W_]*e[\W_]*l[\W_]*l[\W_]*e[\W_]*n[\W_]*d/gi,
    /a[\W_]*r[\W_]*s[\W_]*e(?:[\W_]*(?:hole|holes))?/gi,
    /s[\W_]*h[\W_]*a[\W_]*g(?:[\W_]*(?:ging|ged))?/gi,
    /t[\W_]*i[\W_]*t(?:[\W_]*(?:s|ties|ty))?/gi,
    /b[\W_]*o[\W_]*o[\W_]*b(?:[\W_]*(?:s|ies|y))?/gi,
    /p[\W_]*e[\W_]*n[\W_]*i[\W_]*s(?:[\W_]*(?:es))?/gi,
    /v[\W_]*a[\W_]*g[\W_]*i[\W_]*n[\W_]*a(?:[\W_]*(?:s))?/gi,
    /c[\W_]*l[\W_]*i[\W_]*t/gi,
    /d[\W_]*i[\W_]*l[\W_]*d[\W_]*o(?:[\W_]*(?:s))?/gi,
    /s[\W_]*e[\W_]*m[\W_]*e[\W_]*n/gi,
    /c[\W_]*u[\W_]*m(?:[\W_]*(?:ming|shot|s|dumpster))?/gi,
    /j[\W_]*i[\W_]*z[\W_]*z/gi,
    /s[\W_]*m[\W_]*e[\W_]*g[\W_]*m[\W_]*a/gi,
    /a[\W_]*n[\W_]*u[\W_]*s/gi,
    /f[\W_]*a[\W_]*g(?:[\W_]*(?:g[\W_]*o[\W_]*t|s))?/gi,
    /n[\W_]*i[\W_]*g[\W_]*g(?:[\W_]*(?:e[\W_]*r|a|ers|as))?/gi,
    /r[\W_]*e[\W_]*t[\W_]*a[\W_]*r[\W_]*d(?:[\W_]*(?:ed|s))?/gi,
    /t[\W_]*r[\W_]*a[\W_]*n[\W_]*n[\W_]*y/gi,
    /s[\W_]*p[\W_]*i[\W_]*c/gi,
    /c[\W_]*h[\W_]*i[\W_]*n[\W_]*k/gi,
    /g[\W_]*o[\W_]*o[\W_]*k/gi,
    /k[\W_]*i[\W_]*k[\W_]*e/gi,
    /d[\W_]*y[\W_]*k[\W_]*e/gi,
    /c[\W_]*r[\W_]*a[\W_]*c[\W_]*k[\W_]*e[\W_]*r/gi
  ];

  const chatOpenBtn = document.getElementById("chatOpen");
  const chatBackdrop = document.getElementById("chat-backdrop");
  const chatCloseBtn = document.getElementById("chat-close");
  const chatThread = document.getElementById("chat-thread");
  const chatEmpty = document.getElementById("chat-empty");
  const chatNameInput = document.getElementById("chat-name");
  const chatMessageInput = document.getElementById("chat-message");
  const chatSendBtn = document.getElementById("chat-send");
  const chatPill = document.getElementById("chat-pill");

  function setChatStatus(text) {
    if (chatPill) {
      chatPill.textContent = text;
    }
  }

  function setPresenceCount(count) {
    if (!presenceCount) return;
    presenceCount.textContent = `${count} online`;
  }

  function updatePresenceEntry() {
    if (!userPresenceRef) return;
    userPresenceRef.set({
      ts: window.firebase.database.ServerValue.TIMESTAMP,
      active: true
    }).catch((error) => {
      console.warn("Failed to set presence state.", error);
    });
  }

  function attachPresenceListener() {
    if (!firebasePresenceRef || !firebaseAuth || !firebaseAuth.currentUser || firebasePresenceListenerAttached) {
      return;
    }

    firebasePresenceListenerAttached = true;
    firebasePresenceRef.on("value", (snapshot) => {
      const count = snapshot.exists() ? snapshot.numChildren() : 0;
      setPresenceCount(count);
    }, (error) => {
      console.warn("Failed to read presence state.", error);
    });
  }

  function setPresence() {
    if (!firebasePresenceRef || !firebaseAuth || !firebaseAuth.currentUser) return;

    userPresenceRef = firebasePresenceRef.child(firebaseAuth.currentUser.uid);
    userPresenceRef.onDisconnect().remove();
    updatePresenceEntry();
  }

  function clearPresence() {
    if (!userPresenceRef) return;
    userPresenceRef.remove().catch(() => {});
  }

  function censorProfanity(text) {
    let output = String(text || "");
    PROFANITY_PATTERNS.forEach((pattern) => {
      output = output.replace(pattern, (match) => "*".repeat(match.length));
    });
    return output;
  }

  function sanitizeChatName(name) {
    const cleaned = censorProfanity(name)
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_CHAT_NAME_LENGTH);

    if (!cleaned || /^\*+$/.test(cleaned)) {
      return "Guest";
    }

    return cleaned;
  }

  function sanitizeChatMessage(text) {
    return censorProfanity(text)
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
      .trim()
      .slice(0, MAX_CHAT_MESSAGE_LENGTH);
  }

  function createChatMessageRecord(raw) {
    const text = sanitizeChatMessage(raw && raw.text);
    if (!text) return null;

    return {
      id: raw && raw.id ? String(raw.id) : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: sanitizeChatName(raw && raw.name),
      text,
      ts: Number(raw && raw.ts) || Date.now()
    };
  }

  function loadChatMessages() {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.map(createChatMessageRecord).filter(Boolean).slice(-CHAT_MESSAGE_LIMIT)
        : [];
    } catch (err) {
      return [];
    }
  }

  function saveChatMessages(messages) {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-CHAT_MESSAGE_LIMIT)));
    } catch (err) {
      // Ignore storage failures so chat still works in memory.
    }
  }

  function loadChatName() {
    try {
      return sanitizeChatName(localStorage.getItem(CHAT_NAME_KEY) || "Guest");
    } catch (err) {
      return "Guest";
    }
  }

  function saveChatName(name) {
    try {
      localStorage.setItem(CHAT_NAME_KEY, sanitizeChatName(name));
    } catch (err) {
      // Ignore storage failures.
    }
  }

  function formatChatTime(timestamp) {
    return new Intl.DateTimeFormat([], {
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(timestamp));
  }

  function isChatOpen() {
    return Boolean(chatBackdrop && !chatBackdrop.classList.contains("modal-hidden"));
  }

  function setLocalChatMode() {
    chatMode = "local";
    chatMessages = loadChatMessages();
    setChatStatus("Local live");
    renderChatMessages(false);
  }

  let chatMessages = [];
  let chatMode = "local";
  let chatChannel = "BroadcastChannel" in window ? new BroadcastChannel(CHAT_CHANNEL_NAME) : null;
  let firebaseApp = null;
  let firebaseAuth = null;
  let firebaseMessagesRef = null;
  let firebaseListenerAttached = false;

  function renderChatMessages(scrollToBottom = false) {
    if (!chatThread) return;

    if (chatEmpty) {
      chatEmpty.hidden = chatMessages.length > 0;
    }

    const existingEmpty = chatThread.querySelector("#chat-empty");
    chatThread.innerHTML = "";

    if (chatMessages.length === 0) {
      if (existingEmpty) {
        chatThread.appendChild(existingEmpty);
      }
      return;
    }

    chatMessages.forEach((message) => {
      const item = document.createElement("article");
      item.className = "chat-message";

      const header = document.createElement("div");
      header.className = "chat-message-head";

      const name = document.createElement("span");
      name.className = "chat-message-name";
      name.textContent = message.name;

      const time = document.createElement("span");
      time.className = "chat-message-time";
      time.textContent = formatChatTime(message.ts);

      const body = document.createElement("p");
      body.className = "chat-message-text";
      body.textContent = message.text;

      header.appendChild(name);
      header.appendChild(time);
      item.appendChild(header);
      item.appendChild(body);
      chatThread.appendChild(item);
    });

    if (scrollToBottom) {
      requestAnimationFrame(() => {
        chatThread.scrollTop = chatThread.scrollHeight;
      });
    }
  }

  function refreshLocalChat() {
    chatMessages = loadChatMessages();
    renderChatMessages(false);
  }

  function broadcastLocalChatState() {
    if (chatChannel) {
      chatChannel.postMessage({ type: "sync" });
    }
  }

  function subscribeToFirebaseChat() {
    if (firebaseListenerAttached || !firebaseMessagesRef) return;

    firebaseListenerAttached = true;
    chatMode = "firebase";
    setChatStatus("server live");

    const query = firebaseMessagesRef.orderByChild("ts").limitToLast(CHAT_MESSAGE_LIMIT);
    query.on("value", (snapshot) => {
      const nextMessages = [];
      snapshot.forEach((child) => {
        const value = child.val() || {};
        const record = createChatMessageRecord({
          id: child.key,
          name: value.name,
          text: value.text,
          ts: value.ts
        });
        if (record) {
          nextMessages.push(record);
        }
      });

      chatMessages = nextMessages;
      renderChatMessages(isChatOpen());
    }, (error) => {
      console.warn("Firebase chat listener failed, falling back to local chat.", error);
      firebaseListenerAttached = false;
      setLocalChatMode();
    });
  }

  function initFirebaseChat() {
    if (!FIREBASE_CONFIG || !window.firebase) {
      popularityReady = true;
      renderGrid();
      setLocalChatMode();
      return;
    }

    try {
      firebaseApp = window.firebase.apps && window.firebase.apps.length
        ? window.firebase.app()
        : window.firebase.initializeApp(FIREBASE_CONFIG);
      firebaseAuth = window.firebase.auth();
      firebaseMessagesRef = window.firebase.database().ref(CHAT_ROOM_PATH);
      setChatStatus("Connecting...");

      firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
          subscribeToFirebaseChat();
          if (!firebasePopularityRef) {
            firebasePopularityRef = window.firebase.database().ref(POPULARITY_PATH);
          }
          if (!firebaseLikesRef) {
            firebaseLikesRef = window.firebase.database().ref(LIKES_PATH);
          }
          if (!firebasePresenceRef) {
            firebasePresenceRef = window.firebase.database().ref(PRESENCE_PATH);
          }
          setPresence();
          attachPresenceListener();
          loadPopularityFromFirebase();
          loadLikesFromFirebase();
        }
      });

      firebaseAuth.signInAnonymously().catch((error) => {
        console.warn("Anonymous Firebase auth failed, falling back to local chat.", error);
        firebaseListenerAttached = false;
        popularityReady = true;
        likesReady = true;
        setLocalChatMode();
        renderGrid();
      });
    } catch (error) {
      console.warn("Firebase chat initialization failed, falling back to local chat.", error);
      popularityReady = true;
      likesReady = true;
      setLocalChatMode();
      renderGrid();
    }
  }

  function openChat() {
    if (!chatBackdrop) return;

    openModal(chatBackdrop);
    if (chatNameInput) {
      chatNameInput.value = loadChatName();
    }
    renderChatMessages(true);
    if (chatMessageInput) {
      setTimeout(() => chatMessageInput.focus(), 50);
    }
  }

  function closeChat() {
    closeModal(chatBackdrop);
  }

  function sendChatMessage() {
    if (!chatNameInput || !chatMessageInput) return;

    const name = sanitizeChatName(chatNameInput.value);
    const text = sanitizeChatMessage(chatMessageInput.value);

    if (!text) return;

    const message = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      text,
      ts: Date.now()
    };

    saveChatName(name);

    if (chatMode === "firebase" && firebaseMessagesRef && firebaseAuth && firebaseAuth.currentUser) {
      const recordRef = firebaseMessagesRef.push();
      recordRef.set({
        name,
        text,
        ts: window.firebase.database.ServerValue.TIMESTAMP,
        uid: firebaseAuth.currentUser.uid
      }).then(() => {
        chatMessageInput.value = "";
      }).catch((error) => {
        console.warn("Firebase chat send failed, falling back to local cache.", error);
        chatMessages = [...chatMessages, message].slice(-CHAT_MESSAGE_LIMIT);
        saveChatMessages(chatMessages);
        chatMessageInput.value = "";
        renderChatMessages(true);
        broadcastLocalChatState();
      });
      return;
    }

    chatMessages = [...chatMessages, message].slice(-CHAT_MESSAGE_LIMIT);
    saveChatMessages(chatMessages);
    chatMessageInput.value = "";
    renderChatMessages(true);
    broadcastLocalChatState();
  }

  if (chatOpenBtn) {
    chatOpenBtn.addEventListener("click", () => {
      openChat();
      if (isMobile()) closeMobileDrawer();
    });
  }

  if (chatCloseBtn) {
    chatCloseBtn.addEventListener("click", () => closeChat());
  }

  if (chatBackdrop) {
    chatBackdrop.addEventListener("click", (e) => {
      if (e.target === chatBackdrop) closeChat();
    });
  }

  if (chatSendBtn) {
    chatSendBtn.addEventListener("click", sendChatMessage);
  }

  if (chatMessageInput) {
    chatMessageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  if (chatNameInput) {
    chatNameInput.value = loadChatName();
    chatNameInput.addEventListener("blur", () => {
      const cleanedName = sanitizeChatName(chatNameInput.value);
      chatNameInput.value = cleanedName;
      saveChatName(cleanedName);
    });
  }

  if (chatChannel) {
    chatChannel.addEventListener("message", () => {
      if (chatMode === "local") {
        refreshLocalChat();
      }
    });
  }

  window.addEventListener("beforeunload", () => {
    clearPresence();
  });

  window.addEventListener("storage", (e) => {
    if (chatMode !== "local") return;

    if (e.key === CHAT_STORAGE_KEY) {
      refreshLocalChat();
    }
    if (e.key === CHAT_NAME_KEY && chatNameInput) {
      chatNameInput.value = loadChatName();
    }
  });

  window.addEventListener("storage", (e) => {
    if (e.key === RECENT_GAMES_KEY) {
      renderRecentRow();
    }
    if (e.key === THEME_KEY) {
      applyTheme(readTheme());
    }
  });

  loadCredits();
  applyTheme(readTheme());
  applySortMode(activeSort);
  renderRecentRow();
  initFirebaseChat();
  if (chatMode === "local") {
    renderChatMessages(false);
  }

  // ---------- Init ----------

  renderNav();
  renderGrid();
})();
