// APPLY SETTINGS FROM LOCALSTORAGE
window.addEventListener("load", () => {

    // Cloak
    const title = localStorage.getItem("gp_cloak_title");
    const icon = localStorage.getItem("gp_cloak_icon");

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

    // Mobile Sizer
    if (localStorage.getItem("gp_mobile_sizer") === "enabled") {
        document.body.style.width = "480px";
    }

    // Anti-Deledao
    if (localStorage.getItem("gp_deledao") === "enabled") {
        console.log("Anti-Deledao active");
    }

    // Auto-open modal
    const modal = document.getElementById("updateModal");
    if (modal) modal.classList.add("active");
});

// Load games
fetch("games.js")
    .then(res => res.json())
    .then(games => {
        window.allGames = games;
        renderGames(games);
    });

// Favorites + Recently Played
let favorites = JSON.parse(localStorage.getItem("gp_favorites") || "[]");
let recent = JSON.parse(localStorage.getItem("gp_recent") || "[]");

// Render game grid
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

// Favorite toggle
function toggleFavorite(name) {
    if (favorites.includes(name)) {
        favorites = favorites.filter(x => x !== name);
    } else {
        favorites.push(name);
    }
    localStorage.setItem("gp_favorites", JSON.stringify(favorites));
    renderGames(window.allGames);
}

// Recently played
function addRecent(name) {
    recent = recent.filter(x => x !== name);
    recent.unshift(name);
    recent = recent.slice(0, 20);
    localStorage.setItem("gp_recent", JSON.stringify(recent));
    updateCounts();
}

// Filters
document.getElementById("chip-fav").onclick = () =>
    renderGames(window.allGames.filter(g => favorites.includes(g.name)));

document.getElementById("chip-recent").onclick = () =>
    renderGames(window.allGames.filter(g => recent.includes(g.name)));

document.getElementById("chip-all").onclick = () =>
    renderGames(window.allGames);

// Counters
function updateCounts() {
    document.getElementById("favCount").textContent = favorites.length;
    document.getElementById("recentCount").textContent = recent.length;
}

// Search
document.getElementById("game-search").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    renderGames(window.allGames.filter(g => g.name.toLowerCase().includes(q)));
});

// Modal open
document.getElementById("update-trigger").onclick = () =>
    document.getElementById("updateModal").classList.add("active");

// Modal close
document.getElementById("closeBtn").onclick =
document.getElementById("dismissBtn").onclick = () =>
    document.getElementById("updateModal").classList.remove("active");

// Overlay close
document.getElementById("updateModal").onclick = (e) => {
    if (e.target.id === "updateModal") {
        document.getElementById("updateModal").classList.remove("active");
    }
};
