/* CorePulse v0.1 — tiny dev SDK for demo purposes
   Usage (CDN): include corepulse.js then:
     CorePulse.init({ interval:2000, track: ['fps','memory'] });
     CorePulse.start();
   Or import / bundle this file into your project.
*/
(function (global) {
  const CorePulse = {
    _cfg: { interval: 2000, track: ["fps", "memory", "network"] },
    _timer: null,
    _stats: { fps: 0, memory: null, network: { rx: 0, tx: 0 } },
    init(cfg = {}) {
      this._cfg = Object.assign({}, this._cfg, cfg);
      if (typeof window !== "undefined") {
        // estimate fps
        this._lastFrame = performance.now();
        this._frames = 0;
        this._fpsLoop = (t) => {
          this._frames++;
          if (t - this._lastFrame >= 1000) {
            this._stats.fps = this._frames;
            this._frames = 0;
            this._lastFrame = t;
          }
          this._rafId = requestAnimationFrame(this._fpsLoop);
        };
      }
      return this;
    },
    start() {
      if (typeof window !== "undefined") {
        this._rafId = requestAnimationFrame(this._fpsLoop);
      }
      this._timer = setInterval(() => this._collect(), this._cfg.interval);
      return this;
    },
    stop() {
      clearInterval(this._timer);
      if (this._rafId) cancelAnimationFrame(this._rafId);
      return this;
    },
    _collect() {
      // FPS already updated via RAF loop
      if (this._cfg.track.includes("memory") && performance && performance.memory) {
        try {
          const mem = performance.memory;
          this._stats.memory = {
            used: Math.round(mem.usedJSHeapSize / 1024 / 1024),
            total: Math.round(mem.totalJSHeapSize / 1024 / 1024),
          };
        } catch (e) {
          this._stats.memory = null;
        }
      }
      if (this._cfg.track.includes("network")) {
        // basic network sample: count ResourceTiming entries
        try {
          const entries = performance.getEntriesByType("resource") || [];
          this._stats.network = { resources: entries.length };
        } catch (e) {
          this._stats.network = { resources: 0 };
        }
      }
      // emit - default: console.log (users can override onData)
      if (typeof this.onData === "function") {
        this.onData(this._stats);
      } else {
        console.log("CorePulse:", JSON.stringify(this._stats));
      }
    },
    onData: null,
    // small helper to bind an API endpoint or websocket
    sendTo(url) {
      this.onData = (data) => {
        try {
          fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ timestamp: Date.now(), data }),
          }).catch(() => {});
        } catch (e) {}
      };
      return this;
    },
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = CorePulse;
  } else {
    global.CorePulse = CorePulse;
  }
})(this);
