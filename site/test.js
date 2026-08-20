"use strict";

/*
 * GamePlaza plaza.js
 *
 * Main responsibilities:
 * - particles
 * - settings/cloaking
 * - games
 * - search
 * - categories
 * - favorites
 * - history
 * - update modal
 * - surprise button
 * - back-to-top
 * - playful title/search text
 */

/* =========================================================
   PARTICLES
   ========================================================= */

(function initParticles() {
    const canvas = document.getElementById("particles");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];

        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2 + 1,
                dx: (Math.random() - 0.5) * 0.5,
                dy: (Math.random() - 0.5) * 0.5
            });
        }
    }

    function animate() {
        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        for (const particle of particles) {
            particle.x += particle.dx;
            particle.y += particle.dy;

            if (
                particle.x < 0 ||
                particle.x > canvas.width
            ) {
                particle.dx *= -1;
            }

            if (
                particle.y < 0 ||
                particle.y > canvas.height
            ) {
                particle.dy *= -1;
            }

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.r,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = "#3b82f6";

            ctx.fill();
        }

        requestAnimationFrame(animate);
    }

    resize();
    createParticles();

    window.addEventListener("resize", () => {
        resize();
        createParticles();
    });

    animate();
})();


/* =========================================================
   GLOBAL SETTINGS
   ========================================================= */

(function initGlobalSettings() {
    const title = localStorage.getItem("gp_cloak_title");
    const icon = localStorage.getItem("gp_cloak_icon");
    const sizer = localStorage.getItem("gp_mobile_sizer");

    if (title) {
        document.title = title;
    }

    if (icon) {
        let link = document.querySelector(
            "link[rel~='icon']"
        );

        if (!link) {
            link = document.createElement("link");

            link.rel = "icon";

            document.head.appendChild(link);
        }

        link.href = icon;
    }

    if (sizer === "enabled") {
        document.body.style.width = "480px";
        document.body.style.margin = "0 auto";
    }
})();


/* =========================================================
   UPDATE MODAL
   ========================================================= */

(function initUpdateModal() {
    const modal = document.getElementById("updateModal");

    if (!modal) return;

    const trigger = document.getElementById("update-trigger");
    const close = document.getElementById("closeBtn");
    const dismiss = document.getElementById("dismissBtn");

    function openModal() {
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
    }

    function closeModal() {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
    }

    if (trigger) {
        trigger.addEventListener("click", openModal);
    }

    if (close) {
        close.addEventListener("click", closeModal);
    }

    if (dismiss) {
        dismiss.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            modal.classList.contains("active")
        ) {
            closeModal();
        }
    });

    /*
     * IMPORTANT:
     * Modal initialization is independent from the game system.
     * If games.js ever fails, the modal still works.
     */
    openModal();
})();


/* =========================================================
   INDEX / GAME SYSTEM
   ========================================================= */

(function initGameSystem() {
    const gameGrid = document.getElementById("game-grid");

    if (!gameGrid) return;

    const loading = document.getElementById("loading");
    const noGames = document.getElementById("no-games");

    const searchInput = document.getElementById("game-search");
    const searchClear = document.getElementById("search-clear");

    const categoryRow = document.getElementById("category-row");

    const chipFav = document.getElementById("chip-fav");
    const chipRecent = document.getElementById("chip-recent");
    const chipAll = document.getElementById("chip-all");

    const favCount = document.getElementById("favCount");
    const recentCount = document.getElementById("recentCount");

    const surpriseBtn = document.getElementById("surprise-btn");

    /* ---------------------------------------------------------
       DATA
       --------------------------------------------------------- */

    let allGames = Array.isArray(window.games)
        ? window.games
        : [];

    let favorites = readStorageArray(
        "gp_favorites"
    );

    let recent = readStorageArray(
        "gp_recent"
    );

    /*
     * One unified filter state.
     *
     * search:
     *     current search text
     *
     * category:
     *     "all" or a category name
     *
     * activity:
     *     "all", "favorites", or "recent"
     */
    const state = {
        search: "",
        category: "all",
        activity: "all"
    };


    /* ---------------------------------------------------------
       STORAGE
       --------------------------------------------------------- */

    function readStorageArray(key) {
        try {
            const value = JSON.parse(
                localStorage.getItem(key) || "[]"
            );

            return Array.isArray(value)
                ? value
                : [];
        } catch {
            return [];
        }
    }

    function saveFavorites() {
        localStorage.setItem(
            "gp_favorites",
            JSON.stringify(favorites)
        );
    }

    function saveRecent() {
        localStorage.setItem(
            "gp_recent",
            JSON.stringify(recent)
        );
    }


    /* ---------------------------------------------------------
       GAME NAME
       --------------------------------------------------------- */

    function getGameName(game) {
        return String(
            game?.name ||
            game?.label ||
            "Unknown"
        );
    }


    /* ---------------------------------------------------------
       FILTERING
       --------------------------------------------------------- */

    function getFilteredGames() {
        const query = state.search
            .trim()
            .toLowerCase();

        return allGames.filter((game) => {
            const name = getGameName(game);

            /* Search */
            if (
                query &&
                !name.toLowerCase().includes(query)
            ) {
                return false;
            }

            /* Category */
            if (
                state.category !== "all" &&
                String(game.category || "")
                    .toLowerCase() !==
                    state.category.toLowerCase()
            ) {
                return false;
            }

            /* Activity */
            if (
                state.activity === "favorites" &&
                !favorites.includes(name)
            ) {
                return false;
            }

            if (
                state.activity === "recent" &&
                !recent.includes(name)
            ) {
                return false;
            }

            return true;
        });
    }


    /* ---------------------------------------------------------
       RENDER
       --------------------------------------------------------- */

    function renderGames() {
        const list = getFilteredGames();

        gameGrid.innerHTML = "";

        if (loading) {
            loading.style.display = "none";
        }

        if (noGames) {
            noGames.hidden = list.length !== 0;
        }

        for (const game of list) {
            const button = document.createElement("button");

            button.type = "button";

            const name = getGameName(game);

            if (game.img) {
                const img = document.createElement("img");

                img.src = game.img;

                img.alt = "";

                img.loading = "lazy";

                button.appendChild(img);
            }

            const title = document.createElement("div");

            title.className = "game-title";

            const text = document.createTextNode(
                name + " "
            );

            title.appendChild(text);

            const star = document.createElement("span");

            star.className = "game-star";

            star.textContent = favorites.includes(name)
                ? "★"
                : "☆";

            star.setAttribute(
                "aria-label",
                favorites.includes(name)
                    ? "Remove from favorites"
                    : "Add to favorites"
            );

            star.addEventListener(
                "click",
                (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    toggleFavorite(name);
                }
            );

            title.appendChild(star);

            button.appendChild(title);

            button.addEventListener(
                "click",
                () => {
                    addRecent(name);

                    if (game.url) {
                        window.location.href = game.url;
                    }
                }
            );

            gameGrid.appendChild(button);
        }

        updateCounts();
        updateActiveChips();
        updateSearchClear();
    }


    /* ---------------------------------------------------------
       FAVORITES
       --------------------------------------------------------- */

    function toggleFavorite(name) {
        if (favorites.includes(name)) {
            favorites = favorites.filter(
                (item) => item !== name
            );
        } else {
            favorites.push(name);
        }

        saveFavorites();

        /*
         * IMPORTANT:
         * We do NOT modify state.search,
         * state.category, or state.activity.
         *
         * Therefore favoriting a game while searching
         * or browsing a category does NOT kick the user
         * back to All.
         */
        renderGames();
    }


    /* ---------------------------------------------------------
       HISTORY
       --------------------------------------------------------- */

    function addRecent(name) {
        recent = recent.filter(
            (item) => item !== name
        );

        recent.unshift(name);

        recent = recent.slice(0, 20);

        saveRecent();

        updateCounts();

        /*
         * If the user is currently viewing History,
         * update the rendered list too.
         */
        if (state.activity === "recent") {
            renderGames();
        }
    }


    /* ---------------------------------------------------------
       COUNTS
       --------------------------------------------------------- */

    function updateCounts() {
        if (favCount) {
            favCount.textContent =
                favorites.length;
        }

        if (recentCount) {
            recentCount.textContent =
                recent.length;
        }
    }


    /* ---------------------------------------------------------
       CHIP STATE
       --------------------------------------------------------- */

    function updateActiveChips() {
        /*
         * Activity chips and category chips are handled
         * separately now.
         *
         * This fixes the old problem where:
         *
         * document.querySelectorAll(".chip")
         *
         * accidentally changed the active state of
         * unrelated controls.
         */

        if (chipFav) {
            chipFav.classList.toggle(
                "active",
                state.activity === "favorites"
            );
        }

        if (chipRecent) {
            chipRecent.classList.toggle(
                "active",
                state.activity === "recent"
            );
        }

        if (chipAll) {
            chipAll.classList.toggle(
                "active",
                state.activity === "all"
            );
        }

        if (categoryRow) {
            const chips =
                categoryRow.querySelectorAll(".chip");

            chips.forEach((chip) => {
                const category =
                    chip.dataset.category;

                chip.classList.toggle(
                    "active",
                    category === state.category
                );
            });
        }
    }


    /* ---------------------------------------------------------
       CATEGORIES
       --------------------------------------------------------- */

    function buildCategories() {
        if (!categoryRow) return;

        categoryRow.innerHTML = "";

        const categories = [
            ...new Set(
                allGames
                    .map((game) => game.category)
                    .filter(Boolean)
                    .map(String)
            )
        ];

        categories.sort((a, b) =>
            a.localeCompare(b)
        );

        function createCategoryChip(
            label,
            value
        ) {
            const chip =
                document.createElement("button");

            chip.type = "button";

            chip.className = "chip";

            chip.textContent = label;

            chip.dataset.category = value;

            chip.addEventListener(
                "click",
                () => {
                    state.category = value;

                    renderGames();
                }
            );

            return chip;
        }

        categoryRow.appendChild(
            createCategoryChip(
                "All",
                "all"
            )
        );

        for (const category of categories) {
            categoryRow.appendChild(
                createCategoryChip(
                    category,
                    category
                )
            );
        }

        updateActiveChips();
    }


    /* ---------------------------------------------------------
       ACTIVITY CHIPS
       --------------------------------------------------------- */

    if (chipFav) {
        chipFav.addEventListener(
            "click",
            () => {
                state.activity = "favorites";

                renderGames();
            }
        );
    }

    if (chipRecent) {
        chipRecent.addEventListener(
            "click",
            () => {
                state.activity = "recent";

                renderGames();
            }
        );
    }

    if (chipAll) {
        chipAll.addEventListener(
            "click",
            () => {
                state.activity = "all";

                renderGames();
            }
        );
    }


    /* ---------------------------------------------------------
       SEARCH
       --------------------------------------------------------- */

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            () => {
                state.search =
                    searchInput.value;

                renderGames();
            }
        );
    }

    if (searchClear) {
        searchClear.addEventListener(
            "click",
            () => {
                state.search = "";

                if (searchInput) {
                    searchInput.value = "";
                    searchInput.focus();
                }

                renderGames();
            }
        );
    }

    function updateSearchClear() {
        if (!searchClear) return;

        searchClear.hidden =
            !state.search;
    }


    /* ---------------------------------------------------------
       SURPRISE ME
       --------------------------------------------------------- */

    if (surpriseBtn) {
        surpriseBtn.addEventListener(
            "click",
            () => {
                surpriseBtn.classList.add(
                    "flash"
                );

                setTimeout(() => {
                    surpriseBtn.classList.remove(
                        "flash"
                    );
                }, 400);

                if (!allGames.length) return;

                const random =
                    allGames[
                        Math.floor(
                            Math.random() *
                            allGames.length
                        )
                    ];

                if (!random?.url) return;

                const name =
                    getGameName(random);

                addRecent(name);

                window.location.href =
                    random.url;
            }
        );
    }


    /* ---------------------------------------------------------
       BACK TO TOP
       --------------------------------------------------------- */

    const backTop =
        document.getElementById("backTop");

    if (backTop) {
        backTop.addEventListener(
            "click",
            () => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        );
    }


    /* ---------------------------------------------------------
       PLAYFUL TITLE / SEARCH
       --------------------------------------------------------- */

    (function playfulTextFlasher() {
        const pageTitle =
            document.querySelector(
                "h1 .magic-text"
            );

        if (!pageTitle || !searchInput) {
            return;
        }

        const originalTitle =
            pageTitle.textContent;

        const originalPlaceholder =
            searchInput.getAttribute(
                "placeholder"
            ) || "";

        const messages = [
            {
                title: "gameplaza is the best",
                placeholder: "choose a game already"
            },
            {
                title: "hiiiiiiiii",
                placeholder: "choose a game already"
            }
        ];

        const fadeDuration = 600;
        const visibleDuration = 10000;

        pageTitle.style.transition =
            `opacity ${fadeDuration}ms ease`;

        searchInput.style.transition =
            `opacity ${fadeDuration}ms ease`;

        let scheduled = null;

        function scheduleNext() {
            const delay =
                7000 +
                Math.random() * 23000;

            scheduled =
                setTimeout(
                    doFlash,
                    delay
                );
        }

        function doFlash() {
            const message =
                messages[
                    Math.floor(
                        Math.random() *
                        messages.length
                    )
                ];

            pageTitle.style.opacity = "0";
            searchInput.style.opacity = "0";

            setTimeout(() => {
                pageTitle.textContent =
                    message.title;

                searchInput.setAttribute(
                    "placeholder",
                    message.placeholder
                );

                pageTitle.style.opacity = "1";
                searchInput.style.opacity = "1";

                setTimeout(() => {
                    pageTitle.style.opacity = "0";
                    searchInput.style.opacity = "0";

                    setTimeout(() => {
                        pageTitle.textContent =
                            originalTitle;

                        searchInput.setAttribute(
                            "placeholder",
                            originalPlaceholder
                        );

                        pageTitle.style.opacity = "1";
                        searchInput.style.opacity = "1";

                        scheduleNext();
                    }, fadeDuration);
                }, visibleDuration);
            }, fadeDuration);
        }

        scheduleNext();

        window.addEventListener(
            "beforeunload",
            () => {
                if (scheduled) {
                    clearTimeout(scheduled);
                }
            }
        );
    })();


    /* ---------------------------------------------------------
       INITIALIZE
       --------------------------------------------------------- */

    buildCategories();
    renderGames();

})();
