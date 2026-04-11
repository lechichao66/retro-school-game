(function initSaveSystem(global) {
  const g = global || window;

  const SAVE_KEY = "jianghu_save_v03";
  const SAVE_VERSION = 4;

  function getDefaultSkills() {
    return ["ironSkin", "quickSlash"];
  }

  function getDefaultCultivation() {
    if (g.__JH_CULTIVATION_SYSTEM__ && typeof g.__JH_CULTIVATION_SYSTEM__.createDefaultCultivation === "function") {
      return g.__JH_CULTIVATION_SYSTEM__.createDefaultCultivation();
    }

    return {
      attack: 0,
      defense: 0,
      hp: 0,
      mp: 0,
      resist: 0
    };
  }

  function ensurePlayerCompatibility(playerRef) {
    if (!playerRef || typeof playerRef !== "object") playerRef = {};

    if (!playerRef.name) playerRef.name = "无名少侠";
    if (!playerRef.sect) playerRef.sect = "无门无派";
    if (!playerRef.title) playerRef.title = "江湖小虾";
    if (!playerRef.job) playerRef.job = "无职业";
    if (!playerRef.location) playerRef.location = "新手村";
    playerRef.sectContribution = Math.max(0, Number(playerRef.sectContribution) || 0);
    playerRef.sectReputation = Math.max(0, Number(playerRef.sectReputation) || 0);

    if (!playerRef.inventory || typeof playerRef.inventory !== "object") playerRef.inventory = {};
    if (!playerRef.equips || typeof playerRef.equips !== "object") {
      playerRef.equips = { weapon: "", armor: "", shoes: "" };
    }

    if (g.__JH_CULTIVATION_SYSTEM__ && typeof g.__JH_CULTIVATION_SYSTEM__.ensurePlayerCultivation === "function") {
      g.__JH_CULTIVATION_SYSTEM__.ensurePlayerCultivation(playerRef);
    } else if (!playerRef.cultivation) {
      playerRef.cultivation = getDefaultCultivation();
    }

    if (!Array.isArray(playerRef.skills) || playerRef.skills.length === 0) {
      playerRef.skills = getDefaultSkills();
    }

    if (!Array.isArray(playerRef.states)) playerRef.states = [];
    if (typeof playerRef.shield === "undefined") playerRef.shield = 0;
    if (!playerRef.currentMap) playerRef.currentMap = playerRef.location || "新手村";

    if (typeof g.safeNumber === "function") {
      playerRef.level = Math.max(1, g.safeNumber(playerRef.level, 1));
      playerRef.hp = g.safeNumber(playerRef.hp, typeof g.getMaxHp === "function" ? g.getMaxHp() : 100);
      playerRef.mp = g.safeNumber(playerRef.mp, typeof g.getMaxMp === "function" ? g.getMaxMp() : 80);
      playerRef.money = Math.max(0, g.safeNumber(playerRef.money, 0));
      playerRef.exp = Math.max(0, g.safeNumber(playerRef.exp, 0));
    }

    return playerRef;
  }

  function migrateSaveData(saveData) {
    if (!saveData || typeof saveData !== "object") {
      return {
        saveVersion: SAVE_VERSION,
        player: typeof g.defaultPlayer === "function" ? g.defaultPlayer() : {},
        logs: []
      };
    }

    if (!saveData.saveVersion) saveData.saveVersion = 1;
    if (!saveData.player || typeof saveData.player !== "object") {
      saveData.player = typeof g.defaultPlayer === "function" ? g.defaultPlayer() : {};
    }

    if (saveData.saveVersion < 2) {
      if (!saveData.player.cultivation) {
        saveData.player.cultivation = getDefaultCultivation();
      }
      if (!Array.isArray(saveData.player.states)) saveData.player.states = [];
      if (typeof saveData.player.shield === "undefined") saveData.player.shield = 0;
      if (!saveData.player.currentMap) saveData.player.currentMap = saveData.player.location || "新手村";
      saveData.saveVersion = 2;
    }

    if (saveData.saveVersion < 3) {
      if (!Array.isArray(saveData.player.skills) || saveData.player.skills.length === 0) {
        saveData.player.skills = getDefaultSkills();
      }
      saveData.saveVersion = 3;
    }

    if (saveData.saveVersion < SAVE_VERSION) {
      if (!Array.isArray(saveData.logs)) saveData.logs = [];
      ensurePlayerCompatibility(saveData.player);
      saveData.saveVersion = SAVE_VERSION;
    }

    return saveData;
  }

  function buildSavePayload(playerRef, logsRef) {
    return {
      saveVersion: SAVE_VERSION,
      player: playerRef,
      logs: Array.isArray(logsRef) ? logsRef : []
    };
  }

  function saveToLocalStorage(playerRef, logsRef) {
    const payload = buildSavePayload(playerRef, logsRef);
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    return payload;
  }

  function loadFromLocalStorage() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return migrateSaveData(parsed);
  }

  g.__JH_SAVE_SYSTEM__ = {
    SAVE_KEY,
    SAVE_VERSION,
    ensurePlayerCompatibility,
    migrateSaveData,
    buildSavePayload,
    saveToLocalStorage,
    loadFromLocalStorage
  };
})(window);
