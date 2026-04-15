(function initSaveSystem(global) {
  const g = global || window;

  const SAVE_KEY = "jianghu_save_v03";
  const SAVE_VERSION = 7;

  function getDefaultSkills() {
    return ["ironSkin", "quickSlash"];
  }


  function createDefaultMartialEquipped() {
    return {
      gongfa: null,
      wugong: "basic_fist",
      shenfa: null,
      lianti: null,
      miji: null
    };
  }

  function ensureMartialEquippedCompatibility(martialRef) {
    if (!martialRef || typeof martialRef !== "object") return;
    const base = createDefaultMartialEquipped();
    if (!martialRef.equipped || typeof martialRef.equipped !== "object") {
      martialRef.equipped = { ...base };
    }

    Object.keys(base).forEach((slot) => {
      const val = martialRef.equipped[slot];
      if (typeof val !== "string" || !val) martialRef.equipped[slot] = base[slot];
    });

    const legacyActiveSkill = martialRef.activeSkill;
    if ((!martialRef.equipped.wugong || martialRef.equipped.wugong === "basic_fist") && typeof legacyActiveSkill === "string" && legacyActiveSkill) {
      martialRef.equipped.wugong = legacyActiveSkill;
    }
    martialRef.activeSkill = martialRef.equipped.wugong || "basic_fist";
  }


  function getDefaultEquipLevelBands() {
    return {
      order: ["L10", "L20", "L30", "L40", "L50", "L60", "L70", "L80", "L90+"],
      bands: {
        L10: { minLevel: 1, maxLevel: 19, label: "10级段" },
        L20: { minLevel: 20, maxLevel: 29, label: "20级段" },
        L30: { minLevel: 30, maxLevel: 39, label: "30级段" },
        L40: { minLevel: 40, maxLevel: 49, label: "40级段" },
        L50: { minLevel: 50, maxLevel: 59, label: "50级段" },
        L60: { minLevel: 60, maxLevel: 69, label: "60级段" },
        L70: { minLevel: 70, maxLevel: 79, label: "70级段" },
        L80: { minLevel: 80, maxLevel: 89, label: "80级段" },
        "L90+": { minLevel: 90, maxLevel: 999, label: "90级以上" }
      }
    };
  }

  function resolveEquipLevelBand(requiredLevel) {
    const levelCfg = g.__JH_DATA__?.equipLevelBands || getDefaultEquipLevelBands();
    const order = Array.isArray(levelCfg.order) ? levelCfg.order : [];
    const bands = levelCfg.bands || {};
    const lv = Math.max(1, Math.floor(Number(requiredLevel) || 1));
    for (let i = 0; i < order.length; i += 1) {
      const key = order[i];
      const band = bands[key];
      if (!band) continue;
      const min = Math.floor(Number(band.minLevel) || 1);
      const max = Math.floor(Number(band.maxLevel) || min);
      if (lv >= min && lv <= max) return { key, band };
    }
    return { key: "L90+", band: bands["L90+"] || { minLevel: 90, maxLevel: 999, label: "90级以上" } };
  }

  function getEquipFallbackBand() {
    const levelCfg = g.__JH_DATA__?.equipLevelBands || getDefaultEquipLevelBands();
    const order = Array.isArray(levelCfg.order) ? levelCfg.order : [];
    const bands = levelCfg.bands || {};
    const preferred = order.includes("L40") ? "L40" : (order[0] || "L10");
    return { key: preferred, band: bands[preferred] || { minLevel: 40, maxLevel: 49, label: "40级段" } };
  }

  function ensureEquipDataCompatibility() {
    const equipData = g.__JH_DATA__?.equipData;
    const qualityCfg = g.__JH_DATA__?.equipQualityConfig || {};
    if (!equipData || typeof equipData !== "object") return;

    Object.keys(equipData).forEach((name) => {
      const equip = equipData[name];
      if (!equip || typeof equip !== "object") return;

      const quality = typeof equip.quality === "string" ? equip.quality : "common";
      const qualityMeta = qualityCfg[quality] || qualityCfg.common || {};
      const explicitBand = typeof equip.levelBand === "string" && equip.levelBand ? equip.levelBand : "";
      const explicitRequiredLevel = Number.isFinite(Number(equip.requiredLevel))
        ? Math.max(1, Math.floor(Number(equip.requiredLevel)))
        : 0;
      const legacyQualityLevel = Number.isFinite(Number(qualityMeta.levelProfile?.defaultRequiredLevel))
        ? Math.max(1, Math.floor(Number(qualityMeta.levelProfile.defaultRequiredLevel)))
        : 0;
      const bandFromRequiredLevel = explicitRequiredLevel > 0 ? resolveEquipLevelBand(explicitRequiredLevel) : null;
      const fallbackBand = getEquipFallbackBand();
      const safeBand = explicitBand && (g.__JH_DATA__?.equipLevelBands?.bands?.[explicitBand] || getDefaultEquipLevelBands().bands?.[explicitBand]);
      const chosenBand = safeBand
        ? { key: explicitBand, band: safeBand }
        : (bandFromRequiredLevel || fallbackBand);
      const requiredLevel = explicitRequiredLevel
        || Math.max(1, Math.floor(Number(chosenBand.band?.minLevel) || 0))
        || legacyQualityLevel
        || 40;
      const { key: levelBand, band } = chosenBand;
      const baseStats = equip.baseStats && typeof equip.baseStats === "object" ? equip.baseStats : {};

      equip.schemaVersion = Math.max(1, Math.floor(Number(equip.schemaVersion) || 1));
      if (typeof equip.id !== "string" || !equip.id) equip.id = `equip_${String(name).replace(/\s+/g, "_")}`;
      if (typeof equip.name !== "string" || !equip.name) equip.name = name;
      equip.quality = quality;
      equip.qualityRank = Math.max(1, Number(equip.qualityRank) || Number(qualityMeta.rank) || 1);
      if (typeof equip.slot !== "string" || !equip.slot) equip.slot = "weapon";
      if (typeof equip.slotType !== "string" || !equip.slotType) equip.slotType = equip.slot;
      if (typeof equip.slotGroup !== "string" || !equip.slotGroup) equip.slotGroup = equip.slot === "artifact" ? "reserved" : "core";

      equip.requiredLevel = requiredLevel;
      equip.levelBand = levelBand;
      if (typeof equip.levelBandLabel !== "string" || !equip.levelBandLabel) equip.levelBandLabel = band.label || levelBand;
      equip.levelMin = Math.floor(Number(equip.levelMin) || Number(band.minLevel) || requiredLevel);
      equip.levelMax = Math.floor(Number(equip.levelMax) || Number(band.maxLevel) || requiredLevel);

      equip.baseStats = {
        attack: Number(baseStats.attack ?? equip.attack ?? 0) || 0,
        defense: Number(baseStats.defense ?? equip.defense ?? 0) || 0
      };
      equip.attack = equip.baseStats.attack;
      equip.defense = equip.baseStats.defense;

      if (!Array.isArray(equip.affixes)) equip.affixes = [];
      equip.affixes = equip.affixes.map((affix, idx) => ({
        key: affix?.key || `affix_${idx + 1}`,
        name: affix?.name || "未命名词条",
        value: Number(affix?.value) || 0,
        valueType: affix?.valueType || "flat",
        tier: Math.max(1, Math.floor(Number(affix?.tier) || 1)),
        tags: Array.isArray(affix?.tags) ? affix.tags : []
      }));

      if (!Number.isFinite(Number(equip.affixSlots))) equip.affixSlots = Number(qualityMeta.affixPoolSize) || 0;
      if (!Number.isFinite(Number(equip.enhanceLevel))) equip.enhanceLevel = 0;
      if (!Array.isArray(equip.specialEffects)) equip.specialEffects = [];
      if (!equip.extraStats || typeof equip.extraStats !== "object") equip.extraStats = {};

      if (!equip.valueProfile || typeof equip.valueProfile !== "object") equip.valueProfile = {};
      equip.valueProfile.baseValue = Math.max(1, Math.floor(Number(equip.valueProfile.baseValue) || 100));
      equip.valueProfile.valueMultiplier = Number(equip.valueProfile.valueMultiplier) || Number(qualityMeta.economy?.baseValueMultiplier) || 1;
      equip.valueProfile.sellMultiplier = Number(equip.valueProfile.sellMultiplier) || Number(qualityMeta.economy?.sellMultiplier) || 0.22;

      if (!Array.isArray(equip.tags)) equip.tags = [];
      if (!equip.reserved || typeof equip.reserved !== "object") equip.reserved = {};
      if (!("accessorySlot" in equip.reserved)) equip.reserved.accessorySlot = null;
      if (!("talismanSlot" in equip.reserved)) equip.reserved.talismanSlot = null;
      if (!("artifactPath" in equip.reserved)) equip.reserved.artifactPath = null;
      if (!Array.isArray(equip.reserved.triggerHooks)) equip.reserved.triggerHooks = [];
      if (typeof equip.desc !== "string") equip.desc = "";
    });
  }

  function getDefaultTradeState() {
    const defaultRouteId = g.__JH_DATA__?.tradeRoutes?.defaultRouteId || "novice_loop";
    return {
      selectedRouteId: defaultRouteId
    };
  }

  function ensureTradeStateCompatibility(playerRef) {
    if (!playerRef.trade || typeof playerRef.trade !== "object") playerRef.trade = getDefaultTradeState();
    const routeCfg = g.__JH_DATA__?.tradeRoutes || {};
    const routeIds = new Set((Array.isArray(routeCfg.routes) ? routeCfg.routes : []).map((x) => x.id));
    const defaultRouteId = routeCfg.defaultRouteId || "novice_loop";
    if (typeof playerRef.trade.selectedRouteId !== "string" || (routeIds.size > 0 && !routeIds.has(playerRef.trade.selectedRouteId))) {
      playerRef.trade.selectedRouteId = defaultRouteId;
    }
  }

  function getDefaultCultivation() {
    if (g.__JH_CULTIVATION_SYSTEM__ && typeof g.__JH_CULTIVATION_SYSTEM__.createDefaultCultivation === "function") {
      return g.__JH_CULTIVATION_SYSTEM__.createDefaultCultivation();
    }

    return {
      attack: { level: 0, exp: 0 },
      defense: { level: 0, exp: 0 },
      hp: { level: 0, exp: 0 },
      mp: { level: 0, exp: 0 },
      resist: { level: 0, exp: 0 }
    };
  }

  function getRequiredExpForLevelSafe(level) {
    if (g.__JH_LEVEL_SYSTEM__?.getRequiredExpForLevel) return g.__JH_LEVEL_SYSTEM__.getRequiredExpForLevel(level);
    return Math.max(100, Math.floor(Number(level) || 1) * 100);
  }

  function estimateLegacyTotalExp(level, legacyExp) {
    const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
    let total = Math.max(0, Number(legacyExp) || 0);
    for (let lv = 1; lv < safeLevel; lv += 1) {
      total += getRequiredExpForLevelSafe(lv);
    }
    return Math.floor(total);
  }

  function ensureExpFields(playerRef) {
    const legacyExp = Math.max(0, Number(playerRef.exp) || 0);
    const hasTotalExp = Number.isFinite(Number(playerRef.totalExp));
    const hasExpReserve = Number.isFinite(Number(playerRef.expReserve));
    const safeLevel = Math.max(1, Math.floor(Number(playerRef.level) || 1));
    const estimatedLegacyTotal = estimateLegacyTotalExp(safeLevel, legacyExp);

    if (!hasTotalExp) {
      playerRef.totalExp = estimatedLegacyTotal;
    } else {
      playerRef.totalExp = Math.max(0, Number(playerRef.totalExp) || 0);
      if (playerRef.totalExp < estimatedLegacyTotal) {
        playerRef.totalExp = estimatedLegacyTotal;
      }
    }

    if (!hasExpReserve) {
      playerRef.expReserve = legacyExp;
    } else {
      playerRef.expReserve = Math.max(0, Number(playerRef.expReserve) || 0);
    }

    delete playerRef.exp;
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
    ensureTradeStateCompatibility(playerRef);

    if (!playerRef.inventory || typeof playerRef.inventory !== "object") playerRef.inventory = {};
    if (!playerRef.equips || typeof playerRef.equips !== "object") playerRef.equips = {};
    const equipSlots = ["weapon", "armor", "hat", "belt", "shoes", "necklace", "artifact"];
    equipSlots.forEach((slot) => {
      if (typeof playerRef.equips[slot] !== "string") playerRef.equips[slot] = "";
    });

    ensureEquipDataCompatibility();
    ensureExpFields(playerRef);

    if (g.__JH_CULTIVATION_SYSTEM__ && typeof g.__JH_CULTIVATION_SYSTEM__.ensurePlayerCultivation === "function") {
      g.__JH_CULTIVATION_SYSTEM__.ensurePlayerCultivation(playerRef);
    } else if (!playerRef.cultivation) {
      playerRef.cultivation = getDefaultCultivation();
    }

    if (!Array.isArray(playerRef.skills) || playerRef.skills.length === 0) {
      playerRef.skills = getDefaultSkills();
    }
    if (!playerRef.martial || typeof playerRef.martial !== "object") playerRef.martial = {};
    if (typeof playerRef.martial.title !== "string") playerRef.martial.title = "";
    if (!playerRef.martial.levels || typeof playerRef.martial.levels !== "object") {
      const legacy = playerRef.martial.mastery || {};
      const converted = {};
      Object.keys(legacy).forEach((id) => { converted[id] = Math.max(1, Math.floor((Number(legacy[id]) || 0) / 12) + 1); });
      playerRef.martial.levels = converted;
    }
    if (!Array.isArray(playerRef.martial.learned)) playerRef.martial.learned = ["basic_fist"];
    if (!playerRef.martial.activeSkill) playerRef.martial.activeSkill = "basic_fist";
    if (!playerRef.martial.levels.basic_fist) playerRef.martial.levels.basic_fist = 1;
    ensureMartialEquippedCompatibility(playerRef.martial);
    if (!playerRef.stamina || typeof playerRef.stamina !== "object") playerRef.stamina = { current: 100, max: 100 };
    if (!playerRef.vigor || typeof playerRef.vigor !== "object") playerRef.vigor = { current: 100, max: 100 };
    playerRef.stamina.max = Math.max(30, Number(playerRef.stamina.max) || 100);
    playerRef.vigor.max = Math.max(30, Number(playerRef.vigor.max) || 100);
    playerRef.stamina.current = Math.max(0, Math.min(playerRef.stamina.max, Number(playerRef.stamina.current) || playerRef.stamina.max));
    playerRef.vigor.current = Math.max(0, Math.min(playerRef.vigor.max, Number(playerRef.vigor.current) || playerRef.vigor.max));
    if (typeof playerRef.lastRecoveryAt !== "number") playerRef.lastRecoveryAt = Date.now();

    if (!Array.isArray(playerRef.activeTasks)) playerRef.activeTasks = [];
    if (!playerRef.taskProgress || typeof playerRef.taskProgress !== "object") playerRef.taskProgress = {};
    if (!Array.isArray(playerRef.completedTasks)) playerRef.completedTasks = [];
    if (!playerRef.logbook || typeof playerRef.logbook !== "object") playerRef.logbook = {};
    ["adventure", "dungeon", "treasure", "hangup", "sectHangup", "economy"].forEach((key) => {
      if (!Array.isArray(playerRef.logbook[key])) playerRef.logbook[key] = [];
    });
    if (!playerRef.treasureDaily || typeof playerRef.treasureDaily !== "object") playerRef.treasureDaily = { date: "", rounds: 0 };
    if (typeof playerRef.treasureDaily.date !== "string") playerRef.treasureDaily.date = "";
    playerRef.treasureDaily.rounds = Math.max(0, Math.floor(Number(playerRef.treasureDaily.rounds) || 0));
    if (!playerRef.dungeonLastRun || typeof playerRef.dungeonLastRun !== "object") playerRef.dungeonLastRun = null;

    if (!playerRef.hangup || typeof playerRef.hangup !== "object") playerRef.hangup = {};
    if (!playerRef.hangup.lobby || typeof playerRef.hangup.lobby !== "object") playerRef.hangup.lobby = { active: false, lastSettleAt: 0 };
    if (!playerRef.hangup.sectDuty || typeof playerRef.hangup.sectDuty !== "object") playerRef.hangup.sectDuty = { active: false, lastSettleAt: 0 };
    playerRef.hangup.lobby.active = Boolean(playerRef.hangup.lobby.active);
    playerRef.hangup.sectDuty.active = Boolean(playerRef.hangup.sectDuty.active);
    playerRef.hangup.lobby.lastSettleAt = Number(playerRef.hangup.lobby.lastSettleAt) || 0;
    playerRef.hangup.sectDuty.lastSettleAt = Number(playerRef.hangup.sectDuty.lastSettleAt) || 0;

    if (!playerRef.hallAvatarState || typeof playerRef.hallAvatarState !== "object") {
      playerRef.hallAvatarState = { action: "idle", updatedAt: Date.now() };
    }
    if (typeof playerRef.hallAvatarState.action !== "string") playerRef.hallAvatarState.action = "idle";
    if (typeof playerRef.hallAvatarState.updatedAt !== "number") playerRef.hallAvatarState.updatedAt = Date.now();

    if (!Array.isArray(playerRef.states)) playerRef.states = [];
    if (typeof playerRef.shield === "undefined") playerRef.shield = 0;
    if (!playerRef.currentMap) playerRef.currentMap = playerRef.location || "新手村";

    if (typeof g.safeNumber === "function") {
      playerRef.level = Math.max(1, g.safeNumber(playerRef.level, 1));
      playerRef.hp = g.safeNumber(playerRef.hp, typeof g.getMaxHp === "function" ? g.getMaxHp() : 100);
      playerRef.mp = g.safeNumber(playerRef.mp, typeof g.getMaxMp === "function" ? g.getMaxMp() : 80);
      playerRef.money = Math.max(0, g.safeNumber(playerRef.money, 0));
      playerRef.totalExp = Math.max(0, g.safeNumber(playerRef.totalExp, 0));
      playerRef.expReserve = Math.max(0, g.safeNumber(playerRef.expReserve, 0));
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
