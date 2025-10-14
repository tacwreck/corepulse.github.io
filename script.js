/* script.js — small site behaviors: mobile nav, preview metric updates, year */
(function () {
  // mobile nav toggle
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  navToggle && navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    navToggle.classList.toggle("open");
  });

  // update year in footer
  document.addEventListener("DOMContentLoaded", () => {
    const y = new Date().getFullYear();
    const el = document.getElementById("year");
    if (el) el.textContent = y;

    // small preview feed for hero panel (reads from CorePulse if present)
    function updatePreview(stats) {
      const fps = document.getElementById("uiFps");
      const mem = document.getElementById("uiMem");
      const res = document.getElementById("uiRes");
      if (fps) fps.textContent = stats && stats.fps != null ? stats.fps + " fps" : "—";
      if (mem) mem.textContent = stats && stats.memory ? `${stats.memory.used} MB` : "—";
      if (res) res.textContent = stats && stats.network ? `${stats.network.resources} res` : "—";
    }

    // If CorePulse is loaded and has onData, use it; else show simulated small heartbeat
    if (window.CorePulse && typeof window.CorePulse.onData === "function") {
      // bind a shallow preview handler
      const prev = window.CorePulse.onData;
      window.CorePulse.onData = (s) => {
        updatePreview(s);
        prev && prev(s);
      };
    } else {
      // simulated preview when SDK not present
      let t = 0;
      setInterval(() => {
        t++;
        updatePreview({
          fps: 55 + Math.round(4 * Math.sin(t / 2)),
          memory: { used: 120 + Math.round(6 * Math.cos(t / 4)) },
          network: { resources: 12 + (t % 3) },
        });
      }, 1600);
    }
  });
})();
