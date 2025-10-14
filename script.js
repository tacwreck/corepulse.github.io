// Small site JS: year fill + console-friendly demo hook
document.addEventListener("DOMContentLoaded", () => {
  const y = new Date().getFullYear();
  const el = document.getElementById("year");
  if (el) el.textContent = y;

  // helpful console message for demo users
  console.log("%cCorePulse ✓", "color: #8b5cf6; font-weight: 700; font-size: 14px;");
  console.log("Open demo.html to see example usage and metrics (logs in the console).");
});
