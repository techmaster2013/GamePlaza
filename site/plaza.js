// GamePlaza renderer
// Pulls from window.games / window.siteLinks (games.js). Add a game there, it
// shows up everywhere automatically (grid, search, surprise-me, categories).

(function () {
  const featuredContainer = document.getElementById("featured-container");
  const buttonContainer = document.getElementById("button-container");
  const searchInput = document.getElementById("game-search");
  const categoryBar = document.getElementById("category-bar");

  let activeCategory = "all";

  function openDictionary(url) {
    window.location.href = url;
  }

  function makeGameButton(game) {
    const btn = document.createElement("button");
    btn.textContent = game.label;
    btn.dataset.category = game.category || "arcade";
    btn.addEventListener("click", () => openDictionary(game.url));
    return btn;
  }

  function makeSiteButton(link, idOverride) {
    const btn = document.createElement("button");
    btn.textContent = link.label;
    if (idOverride) btn.id = idOverride;
    btn.addEventListener("click", () => openDictionary(link.url));
    return btn;
  }

  function renderFeatured() {
    featuredContainer.innerHTML = "";
    window.siteLinks.forEach((link) => {
      featuredContainer.appendChild(makeSiteButton(link));
    });
    const surpriseBtn = document.createElement("button");
    surpriseBtn.id = "surprise-btn";
    surpriseBtn.textContent = "Surprise Me!";
    surpriseBtn.addEventListener("click", playRandomGame);
    featuredContainer.appendChild(surpriseBtn);
  }

  function renderCategoryBar() {
    if (!categoryBar) return;
    categoryBar.innerHTML = "";
    const cats = ["all", ...Object.keys(window.CATEGORY_LABELS).filter((c) => c !== "all")];
    cats.forEach((cat) => {
      const btn = document.createElement("button");
      btn.textContent = window.CATEGORY_LABELS[cat];
      btn.classList.add("category-chip");
      if (cat === activeCategory) btn.classList.add("active");
      btn.addEventListener("click", () => {
        activeCategory = cat;
        renderCategoryBar();
        renderGames();
      });
      categoryBar.appendChild(btn);
    });
  }

  function renderGames() {
    const term = (searchInput.value || "").toLowerCase().trim();
    buttonContainer.innerHTML = "";
    window.games
      .filter((g) => activeCategory === "all" || g.category === activeCategory)
      .filter((g) => g.label.toLowerCase().includes(term))
      .forEach((g) => buttonContainer.appendChild(makeGameButton(g)));
  }

  function playRandomGame() {
    const pool = window.games.filter(
      (g) => activeCategory === "all" || g.category === activeCategory
    );
    if (pool.length === 0) {
      alert("No games found in this category!");
      return;
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    openDictionary(pick.url);
  }

  searchInput.addEventListener("input", renderGames);

  renderFeatured();
  renderCategoryBar();
  renderGames();

  // Exposed for any inline onclick references left in the HTML
  window.playRandomGame = playRandomGame;
})();
