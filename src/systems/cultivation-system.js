(function initCultivationSystem(global) {
  const g = global || window;

  const DEFAULT_CULTIVATION = Object.freeze({
    attack: 0,
    defense: 0,
    hp: 0,
    mp: 0,
    resist: 0
  });

  function safeLevel(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.floor(n);
  }

  function createDefaultCultivation() {
    return {
      attack: 0,
      defense: 0,
      hp: 0,
      mp: 0,
      resist: 0
    };
  }

  function normalizeCultivationData(rawCultivation) {
    const next = createDefaultCultivation();
    if (!rawCultivation || typeof rawCultivation !== "object") return next;

    Object.keys(next).forEach((key) => {
      next[key] = safeLevel(rawCultivation[key]);
    });

    return next;
  }

  function ensurePlayerCultivation(playerRef) {
    if (!playerRef || typeof playerRef !== "object") return createDefaultCultivation();
    playerRef.cultivation = normalizeCultivationData(playerRef.cultivation);
    return playerRef.cultivation;
  }

  g.__JH_CULTIVATION_SYSTEM__ = {
    DEFAULT_CULTIVATION,
    createDefaultCultivation,
    normalizeCultivationData,
    ensurePlayerCultivation
  };
})(window);
