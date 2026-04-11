(function initLevelSystem(global) {
  const g = global || window;

  function toSafeNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function getRequiredExpForLevel(level) {
    const safeLevel = Math.max(1, Math.floor(toSafeNumber(level, 1)));
    return safeLevel * 100;
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
