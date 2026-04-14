(function initCultivationSystem(global) {
  const g = global || window;

  const CULTIVATION_KEYS = ["attack", "defense", "hp", "mp", "resist"];
  const DEFAULT_CULTIVATION = Object.freeze({
    attack: { level: 0, exp: 0 },
    defense: { level: 0, exp: 0 },
    hp: { level: 0, exp: 0 },
    mp: { level: 0, exp: 0 },
    resist: { level: 0, exp: 0 }
  });

  function safeLevel(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.floor(n);
  }

  function createDefaultCultivation() {
    return {
      attack: { level: 0, exp: 0 },
      defense: { level: 0, exp: 0 },
      hp: { level: 0, exp: 0 },
      mp: { level: 0, exp: 0 },
      resist: { level: 0, exp: 0 }
    };
  }

  function normalizeCultivationNode(rawNode) {
    if (typeof rawNode === "number") {
      return { level: safeLevel(rawNode), exp: 0 };
    }
    if (!rawNode || typeof rawNode !== "object") return { level: 0, exp: 0 };
    return {
      level: safeLevel(rawNode.level),
      exp: safeLevel(rawNode.exp)
    };
  }

  function normalizeCultivationData(rawCultivation) {
    const next = createDefaultCultivation();
    if (!rawCultivation || typeof rawCultivation !== "object") return next;

    CULTIVATION_KEYS.forEach((key) => {
      next[key] = normalizeCultivationNode(rawCultivation[key]);
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
