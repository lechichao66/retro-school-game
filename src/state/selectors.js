(function initSelectorBridge(global) {
  const g = global || window;

  function getMaxHpSafe() {
    return typeof g.getMaxHp === "function" ? g.getMaxHp() : 0;
  }

  function getMaxMpSafe() {
    return typeof g.getMaxMp === "function" ? g.getMaxMp() : 0;
  }

  function getPowerValueSafe() {
    return typeof g.getPowerValue === "function" ? g.getPowerValue() : 0;
  }

  g.__JH_SELECTORS__ = {
    getMaxHpSafe,
    getMaxMpSafe,
    getPowerValueSafe
  };
})(window);
