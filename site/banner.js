(() => {
  "use strict";

  const init = () => {
    const heroTitle = document.querySelector(".hero h1");
    if (!heroTitle || document.getElementById("scroll-banner")) return;

    const banner = document.createElement("header");
    banner.id = "scroll-banner";
    banner.className = "scroll-banner";
    banner.setAttribute("aria-label", "GamePlaza");
    banner.innerHTML = '<a class="scroll-banner-link" href="#main"><img src="../Normal.png" alt="" class="scroll-banner-icon"><span>GamePlaza</span></a>';
    document.body.prepend(banner);

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
