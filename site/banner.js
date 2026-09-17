(() => {
  "use strict";

  const init = () => {
    const heroTitle = document.querySelector(".hero h1");
    const heroActions = document.querySelector(".hero-actions");
    if (!heroTitle || document.getElementById("scroll-banner")) return;

    const style = document.createElement("style");
    style.textContent = `
      .scroll-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        display: flex;
        justify-content: center;
        transform: translateY(-110%);
        opacity: 0;
        pointer-events: none;
        transition: transform .25s ease, opacity .25s ease;
        background: rgba(25, 15, 38, .94);
        border-bottom: 1px solid rgba(123, 31, 162, .7);
        box-shadow: 0 8px 24px rgba(0, 0, 0, .28);
        backdrop-filter: blur(10px);
      }
      .scroll-banner.visible { transform: translateY(0); opacity: 1; pointer-events: auto; }
      .scroll-banner-inner {
        width: min(1100px, calc(100% - 32px));
        min-height: 58px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .scroll-banner-link {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: var(--text, #f9f6ef);
        font-weight: 700;
        font-size: 1.15rem;
        text-decoration: none;
      }
      .scroll-banner-icon { width: 34px; height: 34px; object-fit: contain; border-radius: 8px; }
      .scroll-banner-settings,
      .hero-settings-button {
        border: 1px solid rgba(244, 143, 177, .65);
        border-radius: 8px;
        padding: 9px 14px;
        color: var(--text, #f9f6ef);
        background: var(--panel, #190f26);
        cursor: pointer;
        font: inherit;
        text-decoration: none;
      }
      .scroll-banner-settings:hover, .hero-settings-button:hover { background: var(--panel-hover, #25163a); }
      @media (max-width: 520px) {
        .scroll-banner-inner { width: calc(100% - 20px); }
        .scroll-banner-settings { padding: 8px 10px; font-size: .9rem; }
      }
    `;
    document.head.appendChild(style);

    const banner = document.createElement("header");
    banner.id = "scroll-banner";
    banner.className = "scroll-banner";
    banner.setAttribute("aria-label", "GamePlaza");
    banner.innerHTML = `
      <div class="scroll-banner-inner">
        <a class="scroll-banner-link" href="#main">
          <img src="../Normal.png" alt="" class="scroll-banner-icon">
          <span>GamePlaza</span>
        </a>
        <a class="scroll-banner-settings" href="settings.html">⚙ Settings</a>
      </div>`;
    document.body.prepend(banner);

    if (heroActions && !document.getElementById("hero-settings")) {
      const settings = document.createElement("a");
      settings.id = "hero-settings";
      settings.className = "hero-settings-button";
      settings.href = "settings.html";
      settings.textContent = "⚙ Settings";
      heroActions.appendChild(settings);
    }

    const updateVisibility = () => {
      banner.classList.toggle("visible", window.scrollY > heroTitle.getBoundingClientRect().bottom);
    };

    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility, { passive: true });
    updateVisibility();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
