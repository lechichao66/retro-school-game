(function initGameStateBridge(global) {
  const g = global || window;

  function ensureRuntimeState() {
    if (g.__JH_RUNTIME_STATE__ && typeof g.__JH_RUNTIME_STATE__.ensureRuntimeState === "function") {
      g.__JH_RUNTIME_STATE__.ensureRuntimeState();
      return;
    }

    if (!Array.isArray(g.logs)) g.logs = [];
    if (!g.uiNotice || typeof g.uiNotice !== "object") g.uiNotice = { type: "info", text: "" };
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
