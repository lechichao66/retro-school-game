(function initLevelSystem(global) {
  const g = global || window;

  function toSafeNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function getRequiredExpForLevel(level) {
    const safeLevel = Math.max(1, Math.floor(toSafeNumber(level, 1)));
    if (safeLevel <= 10) return 240 + safeLevel * 180;
    if (safeLevel <= 20) return 2100 + (safeLevel - 10) * 900;
    if (safeLevel <= 30) return 11800 + (safeLevel - 20) * 2600;
    if (safeLevel <= 40) return 39800 + (safeLevel - 30) * 6800;
    if (safeLevel <= 50) return 112000 + (safeLevel - 40) * 12800;
    return 240000 + (safeLevel - 50) * 18000;
  }

  function gainExpAndLevelUp(playerRef, amount, hooks = {}) {
    if (!playerRef || typeof playerRef !== "object") {
      return { levelUps: 0, gainedExp: 0 };
    }

    const gainedExp = Math.max(0, toSafeNumber(amount, 0));
    playerRef.exp = Math.max(0, toSafeNumber(playerRef.exp, 0)) + gainedExp;
    playerRef.level = Math.max(1, Math.floor(toSafeNumber(playerRef.level, 1)));

    let levelUps = 0;
    while (playerRef.exp >= getRequiredExpForLevel(playerRef.level)) {
      playerRef.exp -= getRequiredExpForLevel(playerRef.level);
      playerRef.level += 1;
      levelUps += 1;

      if (typeof hooks.onLevelUp === "function") {
        hooks.onLevelUp(playerRef.level, levelUps);
      }
    }

    return { levelUps, gainedExp };
  }

  g.__JH_LEVEL_SYSTEM__ = {
    getRequiredExpForLevel,
    gainExpAndLevelUp
  };
})(window);
