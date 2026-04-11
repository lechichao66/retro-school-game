(function initGameStateBridge(global) {
  const g = global || window;

  function ensureRuntimeState() {
    if (!Array.isArray(g.logs)) g.logs = [];
    if (!g.uiNotice || typeof g.uiNotice !== "object") {
      g.uiNotice = { type: "info", text: "" };
    }
    if (typeof g.currentView !== "string") g.currentView = "hall";
    if (typeof g.currentBattle === "undefined") g.currentBattle = null;
  }

  g.__JH_GAME_STATE__ = {
    ensureRuntimeState,
    get logs() {
      return g.logs;
    },
    get uiNotice() {
      return g.uiNotice;
    }
  };
})(window);
