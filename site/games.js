// GamePlaza game data
// Add new games here as { label, url, thumbnail (optional), category (optional) }
// No thumbnail? plaza.js falls back to an auto-generated placeholder card.

const games = [
  { label: "T9 OS", url: "https://prince-art-proxy.github.io/t9os/class.html" },
  { label: "Zombs Royale", url: "/GamePlaza/games/zombs.html" },
  { label: "DDLC+", url: "https://frogiesarcade.win//stuff/selfhosted/ddlcplus/index.html" },
  { label: "KART BROS!", url: "https://kartbros.io/" },
  { label: "Slope Game", url: "https://slopeonline.online/slope-game" },
  { label: "Online Racing Game", url: "https://jchabin.github.io/cars/" },
  { label: "Cookie Clicker", url: "https://orteil.dashnet.org/cookieclicker/" },
  { label: "slither.io", url: "http://slither.com/io" },
  { label: "Snake Game", url: "/games/snake.html" },
  { label: "SAB", url: "https://www.therepairroom.com/sab" },
  { label: "Bee Swarm Simulator", url: "/GamePlaza/games/bss/index.html" },
  { label: "Minecraft", url: "https://eaglercraft.com/play/?version=1.8.8-wasm" },
  { label: "Geometry Dash", url: "https://geodash.org/" },
  { label: "Clash Royale", url: "https://www.easyfun.gg/cloud-games/clash-royale-cloud-online.html" },
  { label: "Red Ball 4", url: "https://red-ball4.com/" },
  { label: "Crazy Cattle 3D", url: "https://pokerogue.io/crazy-cattle-3d" },
  { label: "Dino Game", url: "/GamePlaza/games/dino.html" },
  { label: "Drift Boss", url: "https://driftboss.io/" },
  { label: "Baldi's Basics Classic Remastered", url: "/GamePlaza/games/baldi/index.html" },
  { label: "New York Times Games", url: "https://www.nytimes.com/crosswords" },
  { label: "Chess", url: "https://www.chess.com/" },
  { label: "eParkour", url: "https://eparkour.io/" },
  { label: "Papa's Freezeria", url: "/GamePlaza/games/ruffles/freeze.html" },
  { label: "Chrome Music Lab", url: "https://musiclab.chromeexperiments.com/" },
  { label: "My Singing Monsters", url: "https://mysingingmonsters.io/" },
  { label: "Oregon Trail", url: "https://oregontrail.ws/games/the-oregon-trail/play/" },
  { label: "Poki", url: "https://poki.to/" },
  { label: "Google Baseball Game", url: "https://www.google.com/logos/2019/july4th19/r6/july4th19.html?hl=en" },
  { label: "Bugswim", url: "https://scratch.mit.edu/projects/841683021/" },
  { label: "Stickman Hook", url: "/GamePlaza/games/Stickman-Hook/index.html" },
  { label: "Brawl Stars", url: "https://definitelyscience.freetls.fastly.net/class/Brawl-Stars-Simulator/" },
  { label: "BERGENTRUCK_201X", url: "https://techmaster2013.github.io/b-rn1c-1/Upgraded/bergentruck/BERGENTRUCK_201X.html" },
  { label: "Portal Remake", url: "/GamePlaza/games/Portal.html" },
  { label: "Mario Kart", url: "/GamePlaza/games/ruffles/mario-kart.html" },
  { label: "Pac-Man", url: "/GamePlaza/games/ruffles/pacman.html" },
  { label: "Tetris", url: "/GamePlaza/games/ruffles/tetris.html" },
  { label: "Block Blast", url: "/GamePlaza/games/blockblast.html" },
  { label: "Learn to Fly", url: "/GamePlaza/games/ruffles/learn-to-fly.html" },
  { label: "R.E.P.O.", url: "https://xxpwnxxx420lord.github.io/b2/repo.html" },
  { label: "Bendy and the Ink Machine", url: "/b-rn1c-1/Upgraded/bendy/index.html" },
  { label: "Mahjong", url: "/GamePlaza/games/ruffles/mahjong.html" },
  { label: "Buckshot Roulette", url: "https://techmaster2013.github.io/b-rn1c-1/Upgraded/buckshot-roulette/index.html" },
  { label: "Fortnite", url: "https://www.xbox.com/en-US/play/games/fortnite/BT5P2X999VH2" },
  { label: "Nut Simulator", url: "/nut-sim/index.html" },
  { label: "Hollow Knight", url: "https://techmaster2013.github.io/b-rn1c-1/Upgraded/hollow%20knight/" },
  { label: "People Playground", url: "http://xxpwnxxx420lord.github.io/b2/PeoplePlaygroundBetter.html" },
  { label: "Brotato", url: "/brotato/index.html" },
  { label: "Undertale Yellow", url: "/b-rn1c-1/Upgraded/undertale-yellow/index.html" },
  { label: "My Femboy Roommate", url: "https://xxpwnxxx420lord.github.io/gitsgay/mfr-webport-main/" },
  { label: "Cuphead", url: "https://xxpwnxxx420lord.github.io/Barnical-Extended-Games/Cup/index.html" },
  { label: "FNF", url: "https://xxpwnxxx420lord.github.io/Barnical-Extended-Games/FNF/index.html" },
  { label: "osu!", url: "/GamePlaza/games/osu.html" },
  { label: "Rocket League", url: "https://xxpwnxxx420lord.github.io/Barnical-Extended-Games/rocket-league/index.html" },
  { label: "Superhot", url: "https://xxpwnxxx420lord.github.io/Barnical-Extended-Games/superhot/index.html" },
  { label: "Ultrakill", url: "https://xxpwnxxx420lord.github.io/Barnical-Extended-Games/ULTRAKILL%20Offline%20Download.html" },
  { label: "Adventures with Anxiety", url: "https://xxpwnxxx420lord.github.io/b2/anxiety-gh-pages/index.html" },
  { label: "Oneshot", url: "/GamePlaza/Oneshot/index.html" },
  { label: "Basketball Stars", url: "https://basketball-stars.io/" },
  { label: "Escape Road 3", url: "/escape-road/index.html" },
  { label: "Kindergarten 3", url: "/Kindergarten3/index.html" },
  { label: "That's Not my Neighbor", url: "/game-hub/thats-not-my-neighbor/index.html" },
  { label: "Eggfish", url: "/GamePlaza/games/eggfish.html" },
  { label: "Moo Moo", url: "/GamePlaza/games/moo.html" },
];

// Non-game site links (nav/utility) - kept separate, not part of the searchable game grid
const siteLinks = [
  { label: "GSite GamePlaza", url: "https://sites.google.com/nycstudents.net/gameplaza" },
  { label: "Update Requests", url: "https://docs.google.com/forms/d/e/1FAIpQLSdltdDYawD5naUl7gZbAJuKv4u13vMXt-XDTlmUP4LdpS7yAQ/viewform" },
  { label: "ProxyPlaza", url: "https://proxy-plaza.vercel.app/" },
  { label: "Settings", url: "/GamePlaza/site/settings.html" },
];

// ---- Categories ----
// Add a label to GAME_CATEGORY_OVERRIDES if the regex rules below guess wrong.
const CATEGORY_LABELS = {
  all: "All",
  action: "Action",
  arcade: "Arcade",
  puzzle: "Puzzle",
  simulation: "Sim",
  adventure: "Adventure",
  horror: "Horror",
  rhythm: "Rhythm",
  sports: "Sports",
  io: "IO Games",
};

const GAME_CATEGORY_OVERRIDES = {
  "T9 OS": "arcade",
  "Chrome Music Lab": "arcade",
  "New York Times Games": "puzzle",
  "Bugswim": "arcade",
  "My Femboy Roommate": "adventure",
  "Google Baseball Game": "sports",
};

const CATEGORY_RULES = [
  {
    category: "horror",
    patterns: [
      /baldi/i, /bendy/i, /buckshot roulette/i, /people playground/i,
      /that's not my neighbor/i, /eggfish/i, /r\.e\.p\.o/i, /undertale yellow/i,
      /adventures with anxiety/i, /kindergarten/i,
    ],
  },
  {
    category: "rhythm",
    patterns: [/\bfnf\b/i, /osu!/i],
  },
  {
    category: "puzzle",
    patterns: [/tetris/i, /chess/i, /mahjong/i, /block blast/i],
  },
  {
    category: "sports",
    patterns: [
      /basketball stars/i, /racing/i, /escape road/i, /drift boss/i,
      /red ball/i, /kart/i, /mario kart/i,
    ],
  },
  {
    category: "simulation",
    patterns: [
      /clicker/i, /simulator/i, /sim\b/i, /bee swarm/i, /papa's freezeria/i,
      /my singing monsters/i, /oregon trail/i, /moo moo/i,
    ],
  },
  {
    category: "io",
    patterns: [/\.io\b/i, /slither/i, /zombs royale/i, /ddlc\+/i],
  },
  {
    category: "adventure",
    patterns: [
      /minecraft/i, /hollow knight/i, /oneshot/i, /superhot/i, /ultrakill/i,
      /portal/i, /cuphead/i, /learn to fly/i, /sab\b/i, /bergentruck/i,
    ],
  },
  {
    category: "action",
    patterns: [
      /geometry dash/i, /clash royale/i, /crazy cattle/i, /dino game/i,
      /eparkour/i, /brawl stars/i, /stickman hook/i, /fortnite/i,
      /nut simulator/i, /brotato/i, /rocket league/i, /pac-man/i,
    ],
  },
];

function getGameCategory(game) {
  if (GAME_CATEGORY_OVERRIDES[game.label]) return GAME_CATEGORY_OVERRIDES[game.label];
  const text = `${game.label} ${game.url}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((p) => p.test(text))) return rule.category;
  }
  return "arcade";
}

const categorizedGames = games.map((game) => ({
  ...game,
  category: GAME_CATEGORY_OVERRIDES[game.label] || getGameCategory(game),
}));

const sortedGames = [...categorizedGames].sort((a, b) =>
  a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" })
);

window.games = sortedGames;
window.siteLinks = siteLinks;
window.CATEGORY_LABELS = CATEGORY_LABELS;
window.GAME_CATEGORY_OVERRIDES = GAME_CATEGORY_OVERRIDES;
window.getGameCategory = getGameCategory;
