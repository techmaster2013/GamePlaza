```javascript
/* =========================================================
   GAMEPLAZA
   Main JavaScript
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       PARTICLES
    ===================================================== */

    const canvas = document.getElementById("particles");

    if (canvas) {

        const ctx = canvas.getContext("2d");

        let particles = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resizeCanvas();

        window.addEventListener("resize", resizeCanvas);

        for (let i = 0; i < 60; i++) {

            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                r: Math.random() * 2 + 1,
                dx: (Math.random() - 0.5) * 0.5,
                dy: (Math.random() - 0.5) * 0.5
            });

        }

        function animateParticles() {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            particles.forEach(p => {

                p.x += p.dx;
                p.y += p.dy;

                if (p.x < 0 || p.x > canvas.width)
                    p.dx *= -1;

                if (p.y < 0 || p.y > canvas.height)
                    p.dy *= -1;

                ctx.beginPath();

                ctx.arc(
                    p.x,
                    p.y,
                    p.r,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = "#3b82f6";

                ctx.fill();

            });

            requestAnimationFrame(animateParticles);
        }

        animateParticles();
    }


    /* =====================================================
       SETTINGS / CLOAK
    ===================================================== */

    const cloakTitle =
        localStorage.getItem("gp_cloak_title");

    const cloakIcon =
        localStorage.getItem("gp_cloak_icon");

    const mobileSizer =
        localStorage.getItem("gp_mobile_sizer");

    if (cloakTitle) {
        document.title = cloakTitle;
    }

    if (cloakIcon) {

        let icon =
            document.querySelector(
                "link[rel~='icon']"
            );

        if (!icon) {

            icon =
                document.createElement("link");

            icon.rel = "icon";

            document.head.appendChild(icon);
        }

        icon.href = cloakIcon;
    }

    if (mobileSizer === "enabled") {
        document.body.classList.add("mobile-sized");
    }


    /* =====================================================
       GAME DATA
    ===================================================== */

    let allGames =
        Array.isArray(window.games)
            ? window.games
            : [];

    let favorites =
        JSON.parse(
            localStorage.getItem("gp_favorites") || "[]"
        );

    let recent =
        JSON.parse(
            localStorage.getItem("gp_recent") || "[]"
        );


    function gameName(game) {
        return game?.name ||
               game?.label ||
               "Unknown";
    }


    function gameUrl(game) {
        return game?.url || "#";
    }


    /* =====================================================
       FAVORITES
    ===================================================== */

    function saveFavorites() {

        localStorage.setItem(
            "gp_favorites",
            JSON.stringify(favorites)
        );

    }


    function toggleFavorite(name) {

        if (favorites.includes(name)) {

            favorites =
                favorites.filter(
                    item => item !== name
                );

        } else {

            favorites.push(name);

        }

        saveFavorites();

        updateCounts();

        renderHome();

        renderGames(
            getCurrentFilteredGames()
        );
    }


    /* =====================================================
       RECENT
    ===================================================== */

    function addRecent(name) {

        recent =
            recent.filter(
                item => item !== name
            );

        recent.unshift(name);

        recent =
            recent.slice(0, 20);

        localStorage.setItem(
            "gp_recent",
            JSON.stringify(recent)
        );

        updateCounts();

        renderHome();
    }


    /* =====================================================
       COUNTERS
    ===================================================== */

    function updateCounts() {

        const fav =
            document.getElementById("favCount");

        const rec =
            document.getElementById("recentCount");

        const homeFav =
            document.getElementById(
                "homeFavoriteCount"
            );

        const homeRecent =
            document.getElementById(
                "homeRecentCount"
            );

        const homeGame =
            document.getElementById(
                "homeGameCount"
            );


        if (fav)
            fav.textContent =
                favorites.length;

        if (rec)
            rec.textContent =
                recent.length;

        if (homeFav)
            homeFav.textContent =
                `${favorites.length} game${favorites.length === 1 ? "" : "s"}`;

        if (homeRecent)
            homeRecent.textContent =
                `${recent.length} game${recent.length === 1 ? "" : "s"}`;

        if (homeGame)
            homeGame.textContent =
                `${allGames.length} games`;
    }


    /* =====================================================
       HOME PAGE
    ===================================================== */

    function findGame(name) {

        return allGames.find(
            game =>
                gameName(game) === name
        );
    }


    function createHomeGameCard(game) {

        const card =
            document.createElement("button");

        card.className =
            "home-game-card";

        const icon =
            document.createElement("span");

        icon.className =
            "game-icon";

        icon.textContent =
            favorites.includes(gameName(game))
                ? "★"
                : "🎮";

        const title =
            document.createElement("strong");

        title.textContent =
            gameName(game);

        const category =
            document.createElement("small");

        category.textContent =
            game.category || "Game";

        card.appendChild(icon);
        card.appendChild(title);
        card.appendChild(category);

        card.addEventListener("click", () => {

            addRecent(gameName(game));

            if (gameUrl(game) !== "#")
                window.location.href =
                    gameUrl(game);

        });

        return card;
    }


    function renderHome() {

        /* -------------------------
           FEATURED
        ------------------------- */

        const featured =
            document.getElementById(
                "featured-name"
            );

        const featuredDescription =
            document.getElementById(
                "featured-description"
            );

        const featuredPlay =
            document.getElementById(
                "featured-play"
            );

        if (featured && allGames.length) {

            /*
             * Keep Crazy Cattle 3D as the featured
             * game if it exists, otherwise use the
             * first game.
             */

            const game =
                findGame("Crazy Cattle 3D") ||
                allGames[0];

            featured.textContent =
                gameName(game);

            featuredDescription.textContent =
                game.description ||
                "Today's featured game from the GamePlaza collection.";

            if (featuredPlay) {

                featuredPlay.onclick = () => {

                    addRecent(
                        gameName(game)
                    );

                    window.location.href =
                        gameUrl(game);

                };

            }

        }


        /* -------------------------
           RECENT
        ------------------------- */

        const recentContainer =
            document.getElementById(
                "recent-games"
            );

        if (recentContainer) {

            recentContainer.innerHTML = "";

            const recentGames =
                recent
                    .map(name => findGame(name))
                    .filter(Boolean)
                    .slice(0, 3);

            if (!recentGames.length) {

                recentContainer.innerHTML = `
                    <div class="empty-state">
                        <span>⏱</span>
                        <strong>No recently played games yet.</strong>
                        <small>Games you play will appear here.</small>
                    </div>
                `;

            } else {

                recentGames.forEach(
                    game =>
                        recentContainer.appendChild(
                            createHomeGameCard(game)
                        )
                );

            }
        }


        /* -------------------------
           RECENTLY ADDED
        ------------------------- */

        const newContainer =
            document.getElementById(
                "new-games"
            );

        if (newContainer) {

            newContainer.innerHTML = "";

            /*
             * The last three entries are treated
             * as recently added, matching your
             * current GamePlaza update style.
             */

            allGames
                .slice(-3)
                .reverse()
                .forEach(game => {

                    newContainer.appendChild(
                        createHomeGameCard(game)
                    );

                });

        }


        /* -------------------------
           FAVORITES
        ------------------------- */

        const favoriteContainer =
            document.getElementById(
                "favorite-games"
            );

        if (favoriteContainer) {

            favoriteContainer.innerHTML = "";

            const favoriteGames =
                favorites
                    .map(name => findGame(name))
                    .filter(Boolean)
                    .slice(0, 3);

            if (!favoriteGames.length) {

                favoriteContainer.innerHTML = `
                    <div class="empty-state">
                        <span>☆</span>
                        <strong>No favorites yet.</strong>
                        <small>Press ☆ next to a game to add it here.</small>
                    </div>
                `;

            } else {

                favoriteGames.forEach(
                    game =>
                        favoriteContainer.appendChild(
                            createHomeGameCard(game)
                        )
                );

            }
        }


        updateCounts();
    }


    /* =====================================================
       GAME LIBRARY
    ===================================================== */

    let currentList =
        [...allGames];


    function getCurrentFilteredGames() {
        return currentList;
    }


    function renderGames(list) {

        const grid =
            document.getElementById(
                "game-grid"
            );

        if (!grid)
            return;

        currentList = list;

        grid.innerHTML = "";

        list.forEach(game => {

            const btn =
                document.createElement("button");

            if (game.img) {

                const img =
                    document.createElement("img");

                img.src =
                    game.img;

                img.alt =
                    gameName(game);

                btn.appendChild(img);
            }


            const title =
                document.createElement("div");

            title.className =
                "game-title";

            title.textContent =
                `${gameName(game)} ${
                    favorites.includes(gameName(game))
                        ? "★"
                        : "☆"
                }`;


            title.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    toggleFavorite(
                        gameName(game)
                    );

                }
            );


            btn.appendChild(title);


            btn.addEventListener(
                "click",
                () => {

                    addRecent(
                        gameName(game)
                    );

                    window.location.href =
                        gameUrl(game);

                }
            );


            grid.appendChild(btn);

        });


        const loading =
            document.getElementById(
                "loading"
            );

        if (loading)
            loading.style.display =
                "none";
    }


    /* =====================================================
       CATEGORIES
    ===================================================== */

    function buildCategories() {

        const row =
            document.getElementById(
                "category-row"
            );

        if (!row)
            return;

        row.innerHTML = "";

        const categories =
            [
                ...new Set(
                    allGames
                        .map(game => game.category)
                        .filter(Boolean)
                )
            ];


        function activate(chip) {

            document
                .querySelectorAll(
                    ".category-row .chip"
                )
                .forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );

            chip.classList.add("active");
        }


        const allChip =
            document.createElement("div");

        allChip.className =
            "chip active";

        allChip.textContent =
            "All";

        allChip.onclick = () => {

            activate(allChip);

            renderGames(
                [...allGames]
            );

        };

        row.appendChild(allChip);


        categories.forEach(category => {

            const chip =
                document.createElement("div");

            chip.className =
                "chip";

            chip.textContent =
                category;

            chip.onclick = () => {

                activate(chip);

                renderGames(
                    allGames.filter(
                        game =>
                            game.category ===
                            category
                    )
                );

            };

            row.appendChild(chip);

        });

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    const search =
        document.getElementById(
            "game-search"
        );

    const clear =
        document.getElementById(
            "search-clear"
        );


    if (search) {

        search.addEventListener(
            "input",
            () => {

                const query =
                    search.value
                        .trim()
                        .toLowerCase();


                if (clear)
                    clear.hidden =
                        query.length === 0;


                if (!query) {

                    renderGames(
                        [...allGames]
                    );

                    return;
                }


                renderGames(
                    allGames.filter(
                        game =>
                            gameName(game)
                                .toLowerCase()
                                .includes(query)
                    )
                );

            }
        );

    }


    if (clear) {

        clear.addEventListener(
            "click",
            () => {

                if (search)
                    search.value = "";

                clear.hidden = true;

                renderGames(
                    [...allGames]
                );

                if (search)
                    search.focus();

            }
        );

    }


    /* =====================================================
       ACTIVITY FILTERS
    ===================================================== */

    const chipFav =
        document.getElementById(
            "chip-fav"
        );

    const chipRecent =
        document.getElementById(
            "chip-recent"
        );

    const chipAll =
        document.getElementById(
            "chip-all"
        );


    function activateActivity(chip) {

        document
            .querySelectorAll(
                ".activity-section .chip"
            )
            .forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );

        chip.classList.add("active");
    }


    if (chipFav) {

        chipFav.onclick = () => {

            activateActivity(
                chipFav
            );

            renderGames(
                allGames.filter(
                    game =>
                        favorites.includes(
                            gameName(game)
                        )
                )
            );

        };

    }


    if (chipRecent) {

        chipRecent.onclick = () => {

            activateActivity(
                chipRecent
            );

            renderGames(
                allGames.filter(
                    game =>
                        recent.includes(
                            gameName(game)
                        )
                )
            );

        };

    }


    if (chipAll) {

        chipAll.onclick = () => {

            activateActivity(
                chipAll
            );

            renderGames(
                [...allGames]
            );

        };

    }


    /* =====================================================
       SURPRISE ME
    ===================================================== */

    function surpriseMe() {

        if (!allGames.length)
            return;

        const game =
            allGames[
                Math.floor(
                    Math.random() *
                    allGames.length
                )
            ];

        addRecent(
            gameName(game)
        );

        window.location.href =
            gameUrl(game);

    }


    const surprise =
        document.getElementById(
            "surprise-btn"
        );

    const lucky =
        document.getElementById(
            "luckyButton"
        );

    const heroSurprise =
        document.getElementById(
            "heroSurprise"
        );


    if (surprise)
        surprise.onclick =
            surpriseMe;

    if (lucky)
        lucky.onclick =
            surpriseMe;

    if (heroSurprise)
        heroSurprise.onclick =
            surpriseMe;


    /* =====================================================
       BROWSE BUTTONS
    ===================================================== */

    function goToBrowse() {

        const browse =
            document.getElementById(
                "browse"
            );

        if (browse) {

            browse.scrollIntoView({
                behavior: "smooth"
            });

            setTimeout(
                () => {

                    if (search)
                        search.focus();

                },
                500
            );

        }

    }


    const heroBrowse =
        document.getElementById(
            "heroBrowse"
        );

    const homeAll =
        document.getElementById(
            "homeAll"
        );


    if (heroBrowse)
        heroBrowse.onclick =
            goToBrowse;

    if (homeAll)
        homeAll.onclick =
            goToBrowse;


    /* =====================================================
       HOME ACTIVITY BUTTONS
    ===================================================== */

    function showFavorites() {

        goToBrowse();

        setTimeout(
            () => {

                if (chipFav)
                    chipFav.click();

            },
            550
        );

    }


    function showRecent() {

        goToBrowse();

        setTimeout(
            () => {

                if (chipRecent)
                    chipRecent.click();

            },
            550
        );

    }


    const homeFavorites =
        document.getElementById(
            "homeFavorites"
        );

    const homeRecent =
        document.getElementById(
            "homeRecent"
        );

    const viewFavorites =
        document.getElementById(
            "viewFavorites"
        );

    const viewHistory =
        document.getElementById(
            "viewHistory"
        );


    if (homeFavorites)
        homeFavorites.onclick =
            showFavorites;

    if (viewFavorites)
        viewFavorites.onclick =
            showFavorites;

    if (homeRecent)
        homeRecent.onclick =
            showRecent;

    if (viewHistory)
        viewHistory.onclick =
            showRecent;


    /* =====================================================
       UPDATE MODAL
       FIXED / DOM-SAFE
    ===================================================== */

    const modal =
        document.getElementById(
            "updateModal"
        );

    const trigger =
        document.getElementById(
            "update-trigger"
        );

    const close =
        document.getElementById(
            "closeBtn"
        );

    const dismiss =
        document.getElementById(
            "dismissBtn"
        );


    function openModal() {

        if (!modal)
            return;

        modal.classList.add(
            "active"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow =
            "hidden";

    }


    function closeModal() {

        if (!modal)
            return;

        modal.classList.remove(
            "active"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow =
            "";

    }


    /*
     * The homepage doesn't show the update
     * trigger by default, but the modal still
     * works if another page provides it.
     */

    if (trigger)
        trigger.addEventListener(
            "click",
            openModal
        );

    if (close)
        close.addEventListener(
            "click",
            closeModal
        );

    if (dismiss)
        dismiss.addEventListener(
            "click",
            closeModal
        );


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {
                    closeModal();
                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" ||
                event.key === "Esc"
            ) {
                closeModal();
            }

        }
    );


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    const backTop =
        document.getElementById(
            "backTop"
        );

    if (backTop) {

        backTop.onclick = () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        };

    }


    /* =====================================================
       PLAYFUL TEXT
    ===================================================== */

    if (search) {

        const title =
            document.querySelector(
                ".hero h1 .magic-text"
            );

        if (title) {

            const originalTitle =
                title.textContent;

            const originalPlaceholder =
                search.placeholder;

            const messages = [

                [
                    "gameplaza is the best",
                    "choose a game already"
                ],

                [
                    "hiiiiiiiii",
                    "what are you playing?"
                ],

                [
                    "welcome to the plaza",
                    "find something fun..."
                ]

            ];


            function flashText() {

                const message =
                    messages[
                        Math.floor(
                            Math.random() *
                            messages.length
                        )
                    ];


                title.style.opacity = "0";
                search.style.opacity = "0";


                setTimeout(
                    () => {

                        title.textContent =
                            message[0];

                        search.placeholder =
                            message[1];

                        title.style.opacity = "1";
                        search.style.opacity = "1";


                        setTimeout(
                            () => {

                                title.style.opacity =
                                    "0";

                                search.style.opacity =
                                    "0";


                                setTimeout(
                                    () => {

                                        title.textContent =
                                            originalTitle;

                                        search.placeholder =
                                            originalPlaceholder;

                                        title.style.opacity =
                                            "1";

                                        search.style.opacity =
                                            "1";

                                        scheduleFlash();

                                    },
                                    500
                                );

                            },
                            7000
                        );

                    },
                    500
                );

            }


            function scheduleFlash() {

                const delay =
                    10000 +
                    Math.random() * 25000;

                setTimeout(
                    flashText,
                    delay
                );

            }


            title.style.transition =
                "opacity .5s ease";

            search.style.transition =
                "opacity .5s ease";

            scheduleFlash();

        }

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    buildCategories();

    renderGames(
        [...allGames]
    );

    renderHome();

    updateCounts();

});
```
