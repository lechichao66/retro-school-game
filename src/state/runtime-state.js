(function initRuntimeState(global) {
  const g = global || window;

  function ensureRuntimeState() {
    if (!Array.isArray(g.logs)) g.logs = [];
    if (!Array.isArray(g.battleLogs)) g.battleLogs = [];
    if (!g.uiNotice || typeof g.uiNotice !== "object") {
      g.uiNotice = { type: "info", text: "" };
    }
    if (typeof g.currentView !== "string") g.currentView = "hall";
    if (typeof g.currentBattle === "undefined") g.currentBattle = null;
  }

  function setLogs(nextLogs) {
    g.logs = Array.isArray(nextLogs) ? nextLogs : [];
    return g.logs;
  }

  function pushBattleLog(entry) {
    if (!entry || typeof entry !== "object") return g.battleLogs;
    if (!Array.isArray(g.battleLogs)) g.battleLogs = [];
    g.battleLogs.unshift({
      type: entry.type || "event",
      text: entry.text || "",
      time: entry.time || (typeof g.getNowTime === "function" ? g.getNowTime() : "")
    });
    if (g.battleLogs.length > 150) g.battleLogs.pop();
    return g.battleLogs;
  }

  function setNotice(nextNotice) {
    if (!nextNotice || typeof nextNotice !== "object") return g.uiNotice;
    g.uiNotice = {
      type: nextNotice.type || "info",
      text: nextNotice.text || ""
    };
    return g.uiNotice;
  }

  function setCurrentView(view) {
    if (typeof view === "string" && view) {
      g.currentView = view;
    }
    return g.currentView;
  }

  g.__JH_RUNTIME_STATE__ = {
    ensureRuntimeState,
    setLogs,
    setNotice,
    setCurrentView,
    pushBattleLog,
    getLogs: () => g.logs,
    getBattleLogs: () => g.battleLogs || [],
    getNotice: () => g.uiNotice,
    getCurrentView: () => g.currentView,
    getCurrentBattle: () => g.currentBattle
  };
})(window);
