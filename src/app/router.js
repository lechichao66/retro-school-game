(function initRouter(global) {
  const g = global || window;

  function getCurrentViewSafe() {
    if (typeof g.currentView === "string") return g.currentView;
    return "hall";
  }

  function setCurrentViewSafe(view) {
    if (typeof view !== "string" || !view) return;
    g.currentView = view;
  }

  g.__JH_ROUTER__ = {
    getCurrentViewSafe,
    setCurrentViewSafe
  };
})(window);
