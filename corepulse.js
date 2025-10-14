/* corepulse.js — Tiny drop-in SDK (v0.1)
   Simple, dependency-free; logs metrics to console by default.
   Use CorePulse.onData to receive metric objects, or CorePulse.sendTo(url).
*/
(function (root) {
  const CorePulse = {
    _cfg: { interval: 2000, track: ["fps", "memory", "network"] },
    _rafId: null,
    _timerId: null,
    _last: performance ? performance.now() : Date.now(),
    _frames: 0,
    _stats: { fps: 0, memory: null, network: { resources: 0 } },

    init(cfg = {}) {
      this._cfg = Object.assign({}, this._cfg, cfg);
      // setup fps loop
      if (typeof requestAnimationFrame === "function") {
        const loop = (t) => {
          this._frames++;
          if (t - this._last >= 1000) {
            this._stats.fps = this._frames;
            this._frames = 0;
            this._last = t;
          }
          this._rafId = requestAnimationFrame(loop);
        };
        this._rafId = requestAnimationFrame(loop);
      }
      return this;
    },

    start() {
      if (this._timerId) clearInterval(this._timerId);
      this._timerId = setInterval(() => this._collect(), this._cfg.interval);
      return this;
    },

    stop() {
      if (this._timerId) clearInterval(this._timerId);
      if (this._rafId) cancelAnimationFrame(this._rafId);
      return this;
    },

    _collect() {
      // memory (best-effort)
      if (this._cfg.track.includes("memory") && performance && performance.memory) {
        try {
          const m = performance.memory;
          this._stats.memory = {
            used: Math.round(m.usedJSHeapSize / 1024 / 1024),
            total: Math.round(m.totalJSHeapSize / 1024 / 1024),
          };
        } catch (e) {
          this._stats.memory = null;
        }
      } else {
        this._stats.memory = null;
      }

      // network resources (approx)
      if (this._cfg.track.includes("network") && performance && performance.getEntriesByType) {
        try {
          const entries = performance.getEntriesByType("resource") || [];
          this._stats.network = { resources: entries.length };
        } catch (e) {
          this._stats.network = { resources: 0 };
        }
      }

      // emit
      if (typeof this.onData === "function") {
        try { this.onData(this._stats); } catch (e) { console.error(e); }
      } else {
        // default to console log
        try { console.log("CorePulse", this._stats); } catch (e) {}
      }
    },

    onData: null,

    sendTo(url) {
      this.onData = (data) => {
        try {
          fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ts: Date.now(), data }),
          }).catch(()=>{});
        } catch (e) {}
      };
      return this;
    }
  };

  // export
  if (typeof module !== "undefined" && module.exports) {
    module.exports = CorePulse;
  } else {
    root.CorePulse = CorePulse;
  }
})(this);
