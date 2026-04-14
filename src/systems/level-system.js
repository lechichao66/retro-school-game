(function initLevelSystem(global) {
  const g = global || window;
  const AUTO_LEVEL_CAP = 40;

  function toSafeNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function getRequiredExpForLevel(level) {
    const safeLevel = Math.max(1, Math.floor(toSafeNumber(level, 1)));
    if (safeLevel <= 20) return 6500 + (safeLevel - 1) * 3000;
    if (safeLevel <= 40) return 76000 + (safeLevel - 21) * 16000;
    if (safeLevel <= 70) return 420000 + (safeLevel - 41) * 28000;
    if (safeLevel <= 100) return 1260000 + (safeLevel - 71) * 52000;
    if (safeLevel <= 130) return 2820000 + (safeLevel - 101) * 82000;
    if (safeLevel <= 150) return 5280000 + (safeLevel - 131) * 130000;
    return 7880000 + (safeLevel - 151) * 180000;
  }

  function getAutoLevelCap() {
    return AUTO_LEVEL_CAP;
  }

  function getExpReserve(playerRef) {
    return Math.max(0, toSafeNumber(playerRef?.expReserve, 0));
  }

  function gainExpAndLevelUp(playerRef, amount, hooks = {}) {
    if (!playerRef || typeof playerRef !== "object") {
      return { levelUps: 0, gainedExp: 0 };
    }

    const gainedExp = Math.max(0, toSafeNumber(amount, 0));
    playerRef.totalExp = Math.max(0, toSafeNumber(playerRef.totalExp, 0)) + gainedExp;
    playerRef.expReserve = getExpReserve(playerRef) + gainedExp;
    playerRef.level = Math.max(1, Math.floor(toSafeNumber(playerRef.level, 1)));

    let levelUps = 0;
    while (playerRef.level < AUTO_LEVEL_CAP && playerRef.expReserve >= getRequiredExpForLevel(playerRef.level)) {
      playerRef.expReserve -= getRequiredExpForLevel(playerRef.level);
      playerRef.level += 1;
      levelUps += 1;

      if (typeof hooks.onLevelUp === "function") {
        hooks.onLevelUp(playerRef.level, levelUps);
      }
    }

    return { levelUps, gainedExp };
  }

  function tryManualLevelUp(playerRef, hooks = {}) {
    if (!playerRef || typeof playerRef !== "object") return { ok: false, reason: "invalid_player" };
    playerRef.level = Math.max(1, Math.floor(toSafeNumber(playerRef.level, 1)));
    playerRef.expReserve = getExpReserve(playerRef);
    if (playerRef.level < AUTO_LEVEL_CAP) return { ok: false, reason: "auto_phase" };
    const need = getRequiredExpForLevel(playerRef.level);
    if (playerRef.expReserve < need) return { ok: false, reason: "exp_insufficient", need };
    playerRef.expReserve -= need;
    playerRef.level += 1;
    if (typeof hooks.onLevelUp === "function") hooks.onLevelUp(playerRef.level, 1);
    return { ok: true, need, nextLevel: playerRef.level };
  }

  g.__JH_LEVEL_SYSTEM__ = {
    AUTO_LEVEL_CAP,
    getRequiredExpForLevel,
    getAutoLevelCap,
    gainExpAndLevelUp,
    tryManualLevelUp
  };
})(window);
