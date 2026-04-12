// ==========================================
// 少年江湖 - 稳定三文件版 工具箱 (utils.js)
// 只放通用工具函数，不放页面流程
// ==========================================


// ===== 1. 时间与基础小工具 =====
function getNowTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function randomPick(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}


// ===== 2. 玩家数值工具 =====
function getMaxHp() {
  if (window.__JH_SELECTORS__ && typeof window.__JH_SELECTORS__.getMaxHpValue === "function") {
    return window.__JH_SELECTORS__.getMaxHpValue();
  }

  const baseHp = 100;
  const levelBonus = (player.level - 1) * 20;
  const cultivationBonus = typeof getCultivationBonus === "function" ? getCultivationBonus("hp") : 0;
  const percentBonus = typeof getCultivationGrowthPercent === "function" ? getCultivationGrowthPercent("hp") : 0;
  return Math.floor((baseHp + levelBonus + cultivationBonus) * (1 + percentBonus));
}

function getMaxMp() {
  if (window.__JH_SELECTORS__ && typeof window.__JH_SELECTORS__.getMaxMpValue === "function") {
    return window.__JH_SELECTORS__.getMaxMpValue();
  }

  const baseMp = 80;
  const levelBonus = (player.level - 1) * 10;
  const cultivationBonus = typeof getCultivationBonus === "function" ? getCultivationBonus("mp") : 0;
  const percentBonus = typeof getCultivationGrowthPercent === "function" ? getCultivationGrowthPercent("mp") : 0;
  return Math.floor((baseMp + levelBonus + cultivationBonus) * (1 + percentBonus));
}

function clampPlayer() {
  if (!player) return;

  player.level = safeNumber(player.level, 1);
  player.hp = safeNumber(player.hp, getMaxHp());
  player.mp = safeNumber(player.mp, getMaxMp());
  player.money = Math.max(0, safeNumber(player.money, 0));
  player.exp = Math.max(0, safeNumber(player.exp, 0));

  const maxHp = getMaxHp();
  const maxMp = getMaxMp();

  if (player.hp > maxHp) player.hp = maxHp;
  if (player.hp < 0) player.hp = 0;

  if (player.mp > maxMp) player.mp = maxMp;
  if (player.mp < 0) player.mp = 0;

  if (!player.inventory) player.inventory = {};
  if (!player.equips) {
    player.equips = {
      weapon: "",
      armor: "",
      hat: "",
      belt: "",
      shoes: "",
      necklace: "",
      artifact: ""
    };
  }
  const equipSlots = ["weapon", "armor", "hat", "belt", "shoes", "necklace", "artifact"];
  equipSlots.forEach((slot) => {
    if (typeof player.equips[slot] !== "string") player.equips[slot] = "";
  });

  if (!player.job) player.job = "无职业";
  if (!player.sect) player.sect = "无门无派";
  if (!player.title) player.title = "江湖小虾";
  if (!player.location) player.location = "新手村";
  if (!player.stamina || typeof player.stamina !== "object") player.stamina = { current: 100, max: 100 };
  if (!player.vigor || typeof player.vigor !== "object") player.vigor = { current: 100, max: 100 };
  player.stamina.max = Math.max(30, safeNumber(player.stamina.max, 100));
  player.vigor.max = Math.max(30, safeNumber(player.vigor.max, 100));
  player.stamina.current = Math.max(0, Math.min(player.stamina.max, safeNumber(player.stamina.current, player.stamina.max)));
  player.vigor.current = Math.max(0, Math.min(player.vigor.max, safeNumber(player.vigor.current, player.vigor.max)));
  if (typeof player.lastRecoveryAt !== "number") player.lastRecoveryAt = Date.now();

  if (!player.martial || typeof player.martial !== "object") player.martial = {};
  if (!player.martial.mastery || typeof player.martial.mastery !== "object") player.martial.mastery = {};
  if (!Array.isArray(player.martial.learned)) player.martial.learned = ["basic_fist"];
  if (!player.martial.activeSkill) player.martial.activeSkill = "basic_fist";
  if (!Array.isArray(player.skills) || player.skills.length === 0) player.skills = ["ironSkin", "quickSlash"];

  player.sectContribution = Math.max(0, safeNumber(player.sectContribution, 0));
  player.sectReputation = Math.max(0, safeNumber(player.sectReputation, 0));
  ensureLogbookState();
  ensureHangupState();
}

function ensureLogbookState() {
  if (!player || typeof player !== "object") return;
  if (!player.logbook || typeof player.logbook !== "object") player.logbook = {};
  ["adventure", "dungeon", "treasure", "hangup", "sectHangup", "economy"].forEach((key) => {
    if (!Array.isArray(player.logbook[key])) player.logbook[key] = [];
  });
}

function ensureHangupState() {
  if (!player || typeof player !== "object") return;
  if (!player.hangup || typeof player.hangup !== "object") player.hangup = {};
  if (!player.hangup.lobby || typeof player.hangup.lobby !== "object") player.hangup.lobby = { active: false, lastSettleAt: 0 };
  if (!player.hangup.sectDuty || typeof player.hangup.sectDuty !== "object") player.hangup.sectDuty = { active: false, lastSettleAt: 0 };
}

function appendLogbook(category, text) {
  ensureLogbookState();
  const key = category || "adventure";
  if (!player.logbook[key]) player.logbook[key] = [];
  player.logbook[key].unshift({ time: getNowTime(), text: text || "" });
  if (player.logbook[key].length > 80) player.logbook[key].pop();
}

function getLogbookEntries(category, limit) {
  ensureLogbookState();
  const key = category || "adventure";
  const cap = Math.max(1, Number(limit) || 20);
  return (player.logbook[key] || []).slice(0, cap);
}

function recoverStamina(amount) {
  clampPlayer();
  player.stamina.current = Math.min(player.stamina.max, player.stamina.current + Math.max(0, safeNumber(amount, 0)));
}

function recoverVigor(amount) {
  clampPlayer();
  player.vigor.current = Math.min(player.vigor.max, player.vigor.current + Math.max(0, safeNumber(amount, 0)));
}

function consumeStamina(amount) {
  clampPlayer();
  const need = Math.max(0, safeNumber(amount, 0));
  if (player.stamina.current < need) return false;
  player.stamina.current -= need;
  return true;
}

function consumeVigor(amount) {
  clampPlayer();
  const need = Math.max(0, safeNumber(amount, 0));
  if (player.vigor.current < need) return false;
  player.vigor.current -= need;
  return true;
}

function applyNaturalRecovery() {
  clampPlayer();
  const now = Date.now();
  const last = safeNumber(player.lastRecoveryAt, now);
  const elapsedMinutes = Math.floor(Math.max(0, now - last) / 60000);
  if (elapsedMinutes <= 0) return;

  const staminaGain = Math.min(20, elapsedMinutes * 2);
  const vigorGain = Math.min(20, elapsedMinutes * 2);
  recoverStamina(staminaGain);
  recoverVigor(vigorGain);
  player.lastRecoveryAt = now;
}


// ===== 3. 装备与战力计算 =====
function getEquipBonus() {
  if (window.__JH_SELECTORS__ && typeof window.__JH_SELECTORS__.getEquipBonusValue === "function") {
    return window.__JH_SELECTORS__.getEquipBonusValue();
  }

  let attack = 0;
  let defense = 0;

  [
    player.equips.weapon,
    player.equips.armor,
    player.equips.hat,
    player.equips.belt,
    player.equips.shoes,
    player.equips.necklace,
    player.equips.artifact
  ].forEach((equipName) => {
    if (!equipName || !equipData[equipName]) return;

    const equip = equipData[equipName];
    const baseAttack = equip.attack || equip.baseStats?.attack || 0;
    const baseDefense = equip.defense || equip.baseStats?.defense || 0;
    const quality = getEquipQualityMeta(equip.quality);
    const qMultiplier = Number(quality.statMultiplier) || 1;

    attack += Math.round(baseAttack * qMultiplier);
    defense += Math.round(baseDefense * qMultiplier);
  });

  const equipAttack = attack;
  const equipDefense = defense;
  const cultivationAttack = typeof getCultivationBonus === "function" ? getCultivationBonus("attack") : 0;
  const cultivationDefense = typeof getCultivationBonus === "function" ? getCultivationBonus("defense") : 0;
  const attackPct = typeof getCultivationGrowthPercent === "function" ? getCultivationGrowthPercent("attack") : 0;
  const defensePct = typeof getCultivationGrowthPercent === "function" ? getCultivationGrowthPercent("defense") : 0;

  attack = Math.floor(equipAttack + cultivationAttack * (1 + attackPct));
  defense = Math.floor(equipDefense + cultivationDefense * (1 + defensePct));

  return { attack, defense };
}
function getPowerValue() {
  if (window.__JH_SELECTORS__ && typeof window.__JH_SELECTORS__.getPowerValueSafe === "function") {
    return window.__JH_SELECTORS__.getPowerValueSafe();
  }

  const bonus = getEquipBonus();
  const maxHp = getMaxHp();
  const maxMp = getMaxMp();

  const levelScore = (player.level || 1) * 120;
  const baseScore = Math.floor(maxHp * 0.9 + maxMp * 1.2);
  const equipScore = bonus.attack * 8 + bonus.defense * 6;
  return levelScore + baseScore + equipScore;
}

function getEquipText(name, emptyText = "未装备") {
  if (!name) return emptyText;
  return getEquipDisplayParts(name).titleHtml;
}


function getEquipQualityMeta(qualityKey) {
  if (window.__JH_SELECTORS__ && typeof window.__JH_SELECTORS__.getEquipQualityMeta === "function") {
    return window.__JH_SELECTORS__.getEquipQualityMeta(qualityKey);
  }

  const cfg = window.__JH_DATA__?.equipQualityConfig || {};
  return cfg[qualityKey] || cfg.common || { key: "common", name: "凡品", color: "#9ca3af", statMultiplier: 1 };
}

function getEquipQualityText(qualityKey) {
  const mapped = getTermLabel("quality", qualityKey);
  return mapped || getEquipQualityMeta(qualityKey).name || "凡品";
}

function getTermLabel(group, key) {
  const terms = window.__JH_DATA__?.terminology || {};
  return terms?.[group]?.[key] || key;
}

function getStatLabel(key) {
  return getTermLabel("stat", key);
}

function getAffixLabel(key) {
  return getTermLabel("affix", key);
}

function getAffixShortLabel(key) {
  return getTermLabel("affixShort", key) || getAffixLabel(key);
}

function getEquipDisplayParts(name) {
  const equip = (typeof equipData !== "undefined" && equipData[name]) ? equipData[name] : null;
  if (!equip) {
    return { name, qualityText: "凡品", qualityColor: "#9ca3af", affixShort: "无词缀", affixFull: "无词缀", specialText: "无", titleHtml: name };
  }
  const quality = getEquipQualityMeta(equip.quality);
  const affixes = Array.isArray(equip.affixes) ? equip.affixes : [];
  const effects = Array.isArray(equip.specialEffects) ? equip.specialEffects : [];
  const affixShort = affixes.length ? affixes.map((x) => `${getAffixShortLabel(x.key || x.name)}+${x.value}`).join(" ") : "无词缀";
  const affixFull = affixes.length ? affixes.map((x) => `${getAffixLabel(x.key || x.name)}+${x.value}`).join("，") : "无词缀";
  const specialText = effects.length ? effects.map((x) => getSpecialEffectText(x)).join("，") : "无";
  const qualityText = quality.name || "凡品";
  return {
    name,
    equip,
    qualityText,
    qualityColor: quality.color || "#9ca3af",
    affixShort,
    affixFull,
    specialText,
    titleHtml: `<span style="color:${quality.color};">[${qualityText}]</span> ${name}`
  };
}

function getEquipAffixSummary(equip) {
  if (!equip) return "无词缀";
  const affixes = Array.isArray(equip.affixes) ? equip.affixes : [];
  if (!affixes.length) return "无词缀";
  return affixes.slice(0, 2).map((x) => `${getAffixShortLabel(x.key || x.name)}+${x.value}`).join(" ");
}

function getSpecialEffectText(effect) {
  if (!effect) return "未知效果";
  const key = effect.key || effect.name || "";
  const label = getTermLabel("effect", key);
  return effect.desc ? `${label}（${effect.desc}）` : label;
}




function getSectByName(name) {
  if (!Array.isArray(sectList)) return null;
  return sectList.find((x) => x.name === name) || null;
}

function getSectCombatBonus() {
  const sect = getSectByName(player?.sect);
  return sect?.bonus || { atkRate: 0, defRate: 0 };
}

// ===== 4. 背包与物品工具 =====
function getBagText() {
  if (!player || !player.inventory) return "空空如也";

  const items = [];
  for (const key in player.inventory) {
    if (player.inventory[key] > 0) {
      items.push(`${key} x${player.inventory[key]}`);
    }
  }

  return items.length ? items.join("，") : "空空如也";
}

function addItem(name, count = 1) {
  if (!player.inventory) player.inventory = {};
  player.inventory[name] = (player.inventory[name] || 0) + count;
}

function removeItem(name, count = 1) {
  if (!player.inventory || !player.inventory[name]) return false;
  if (player.inventory[name] < count) return false;

  player.inventory[name] -= count;
  if (player.inventory[name] <= 0) {
    delete player.inventory[name];
  }
  return true;
}

function hasItem(name, count = 1) {
  return !!(player.inventory && player.inventory[name] && player.inventory[name] >= count);
}

function getItemTypeText(name) {
  if (typeof equipData !== "undefined" && equipData[name]) return "装备";
  if (name === "小还丹" || name === "大还丹" || name === "干粮" || name === "清水") return "消耗品";
  if (name === "生姜" || name === "甘草" || name === "止血草" || name === "熊胆") return "药材";
  return "材料/杂物";
}

function getItemDetailText(name) {
  if (typeof itemData !== "undefined" && itemData[name]) {
    return itemData[name].detail;
  }

  if (typeof equipData !== "undefined" && equipData[name]) {
    const info = getEquipDisplayParts(name);
    const e = info.equip;
    const attack = e.attack || e.baseStats?.attack || 0;
    const defense = e.defense || e.baseStats?.defense || 0;
    const extras = e.extraStats && typeof e.extraStats === "object"
      ? Object.keys(e.extraStats).map((key) => `${getStatLabel(key)}+${e.extraStats[key]}`).join("，")
      : "";
    return `【<span style="color:${info.qualityColor};">${info.qualityText}</span>装备】攻击+${attack}，防御+${defense}，词缀：${info.affixShort}，详情词缀：${info.affixFull}，特殊：${info.specialText}${extras ? `，${extras}` : ""}。${e.desc || ""}`;
  }

  if (name === "小还丹") return "【丹药】恢复气血20、内力10。";
  if (name === "大还丹") return "【丹药】恢复气血50、内力25。";
  if (name === "干粮") return "【消耗品】恢复少量气血。";
  if (name === "清水") return "【消耗品】恢复少量内力。";

  return "江湖物资。";
}


// ===== 5. 日志与提示 =====
function ensureLogs() {
  if (!Array.isArray(logs)) logs = [];
}

function normalizeLogs() {
  ensureLogs();
  logs = logs.map(item => ({
    type: item?.type || "sys",
    text: item?.text || "",
    time: item?.time || getNowTime()
  }));
}

function addLog(type, text) {
  ensureLogs();
  logs.unshift({
    type: type || "sys",
    text: text || "",
    time: getNowTime()
  });

  if (logs.length > 100) logs.pop();

  if (window.__JH_RUNTIME_STATE__ && typeof window.__JH_RUNTIME_STATE__.setLogs === "function") {
    logs = window.__JH_RUNTIME_STATE__.setLogs(logs);
  }

  if (typeof renderHallLog === "function") {
    renderHallLog();
  }
}

function addBattleLog(type, text) {
  if (window.__JH_RUNTIME_STATE__ && typeof window.__JH_RUNTIME_STATE__.pushBattleLog === "function") {
    window.__JH_RUNTIME_STATE__.pushBattleLog({
      type: type || "event",
      text: text || "",
      time: getNowTime()
    });
  }
}

function setNotice(type, text) {
  if (window.__JH_RUNTIME_STATE__ && typeof window.__JH_RUNTIME_STATE__.setNotice === "function") {
    uiNotice = window.__JH_RUNTIME_STATE__.setNotice({
      type: type || "info",
      text: text || ""
    });
    return;
  }

  uiNotice = {
    type: type || "info",
    text: text || ""
  };
}

function clearNotice() {
  if (window.__JH_RUNTIME_STATE__ && typeof window.__JH_RUNTIME_STATE__.setNotice === "function") {
    uiNotice = window.__JH_RUNTIME_STATE__.setNotice({
      type: "info",
      text: ""
    });
    return;
  }

  uiNotice = {
    type: "info",
    text: ""
  };
}

function renderNoticeHtml() {
  if (!uiNotice || !uiNotice.text) return "";

  const bgMap = {
    success: "#e6f7e6",
    error: "#fdeaea",
    info: "#eef4ff",
    sys: "#fff8db"
  };

  const bdMap = {
    success: "#8dc48d",
    error: "#d99a9a",
    info: "#8fb0dd",
    sys: "#e0ca78"
  };

  const bg = bgMap[uiNotice.type] || bgMap.info;
  const bd = bdMap[uiNotice.type] || bdMap.info;

  return `
    <div style="background:${bg}; border:1px solid ${bd}; padding:8px; margin-bottom:10px;">
      ${uiNotice.text}
    </div>
  `;
}


// ===== 6. 经验、升级、恢复 =====
function gainExp(amount) {
  amount = safeNumber(amount, 0);

  const levelSystem = window.__JH_LEVEL_SYSTEM__;
  if (levelSystem && typeof levelSystem.gainExpAndLevelUp === "function") {
    levelSystem.gainExpAndLevelUp(player, amount, {
      onLevelUp(nextLevel) {
        player.hp = getMaxHp();
        player.mp = getMaxMp();
        if (window.__JH_GAME_ACTIONS__?.updateCombatSkillLoadout) {
          window.__JH_GAME_ACTIONS__.updateCombatSkillLoadout();
        }
        addLog("sys", `【突破】你晋升到了第 ${nextLevel} 层境界，真气贯通，状态已全满！`);
        setNotice("success", `升级成功：你已升到 ${nextLevel} 级，状态回满。`);
      }
    });
  } else {
    player.exp += amount;
    while (player.exp >= player.level * 100) {
      player.exp -= player.level * 100;
      player.level += 1;
      player.hp = getMaxHp();
      player.mp = getMaxMp();
      addLog("sys", `【突破】你晋升到了第 ${player.level} 层境界，真气贯通，状态已全满！`);
      setNotice("success", `升级成功：你已升到 ${player.level} 级，状态回满。`);
    }
  }

  clampPlayer();
}

function recoverHp(amount) {
  player.hp += safeNumber(amount, 0);
  clampPlayer();
}

function recoverMp(amount) {
  player.mp += safeNumber(amount, 0);
  clampPlayer();
}

function loseHp(amount) {
  player.hp -= safeNumber(amount, 0);
  clampPlayer();
}

function loseMp(amount) {
  player.mp -= safeNumber(amount, 0);
  clampPlayer();
}


// ===== 7. 地图、怪物、掉落工具 =====
function getCurrentMap() {
  const loc = player?.location || "新手村";
  if (typeof mapData === "undefined") return null;
  return mapData[loc] || null;
}

function getMonsterByName(name) {
  if (typeof monsterList === "undefined") return null;
  return monsterList.find(m => m.name === name) || null;
}

function pickMonsterFromCurrentMap() {
  const map = getCurrentMap();
  if (!map) return null;

  const roll = Math.random();
  let name = null;

  if (roll < 0.05 && map.boss?.length) {
    name = randomPick(map.boss);
  } else if (roll < 0.20 && map.elites?.length) {
    name = randomPick(map.elites);
  } else {
    name = randomPick(map.monsters);
  }

  return getMonsterByName(name);
}

function rollDrops(monsterName) {
  if (typeof dropTable === "undefined") return [];

  const drops = dropTable[monsterName];
  if (!drops || !Array.isArray(drops)) return [];

  const results = [];
  drops.forEach(item => {
    if (Math.random() < item.chance) {
      results.push(item.name);
    }
  });

  return results;
}


// ===== 8. 配方工具 =====
function canCraftRecipe(recipe) {
  if (!recipe || !recipe.materials) return false;

  for (const mat in recipe.materials) {
    if (!hasItem(mat, recipe.materials[mat])) {
      return false;
    }
  }
  return true;
}

function consumeRecipeMaterials(recipe) {
  if (!recipe || !recipe.materials) return false;
  if (!canCraftRecipe(recipe)) return false;

  for (const mat in recipe.materials) {
    removeItem(mat, recipe.materials[mat]);
  }
  return true;
}


// ===== 9. 存档兼容处理 =====
function normalizePlayerAfterLoad() {
  if (window.__JH_SAVE_SYSTEM__ && typeof window.__JH_SAVE_SYSTEM__.ensurePlayerCompatibility === "function") {
    player = window.__JH_SAVE_SYSTEM__.ensurePlayerCompatibility(player);
  } else {
    if (!player) player = {};
    if (!player.name) player.name = "无名少侠";
    if (!player.sect) player.sect = "无门无派";
    if (!player.title) player.title = "江湖小虾";
    if (!player.job) player.job = "无职业";
    if (!player.location) player.location = "新手村";
    if (!player.inventory) player.inventory = {};
    if (!player.equips) {
      player.equips = {
        weapon: "",
        armor: "",
        shoes: ""
      };
    }
    if (!player.cultivation) {
      player.cultivation = { attack: 0, defense: 0, hp: 0, mp: 0, resist: 0 };
    }
    if (!player.skills) player.skills = ["ironSkin", "quickSlash"];
    if (!player.martial) player.martial = { title: "", mastery: {}, realm: {}, learned: ["basic_fist"], activeSkill: "basic_fist" };
    if (!Array.isArray(player.martial.learned)) player.martial.learned = ["basic_fist"];
    if (!player.martial.activeSkill) player.martial.activeSkill = "basic_fist";
    if (!player.stamina) player.stamina = { current: 100, max: 100 };
    if (!player.vigor) player.vigor = { current: 100, max: 100 };
    if (typeof player.lastRecoveryAt !== "number") player.lastRecoveryAt = Date.now();
    if (!Array.isArray(player.activeTasks)) player.activeTasks = [];
    if (!player.taskProgress || typeof player.taskProgress !== "object") player.taskProgress = {};
    if (!Array.isArray(player.completedTasks)) player.completedTasks = [];
    if (!player.logbook) player.logbook = {};
    if (!player.hangup) player.hangup = {};
    if (!player.currentMap) player.currentMap = player.location || "新手村";
    player.level = safeNumber(player.level, 1);
    player.hp = safeNumber(player.hp, getMaxHp());
    player.mp = safeNumber(player.mp, getMaxMp());
    player.money = safeNumber(player.money, 0);
    player.exp = safeNumber(player.exp, 0);
  }

  clampPlayer();
  applyNaturalRecovery();
  ensureLogbookState();
  ensureHangupState();
}
function migrateSaveData(saveData) {
  if (window.__JH_SAVE_SYSTEM__ && typeof window.__JH_SAVE_SYSTEM__.migrateSaveData === "function") {
    return window.__JH_SAVE_SYSTEM__.migrateSaveData(saveData);
  }

  if (!saveData || typeof saveData !== "object") {
    return {
      saveVersion: 3,
      player: defaultPlayer(),
      logs: []
    };
  }

  if (!saveData.saveVersion) {
    saveData.saveVersion = 1;
  }

  if (saveData.saveVersion < 2) {
    if (!saveData.player) saveData.player = defaultPlayer();
    if (!saveData.player.cultivation) {
      saveData.player.cultivation = { attack: 0, defense: 0, hp: 0, mp: 0, resist: 0 };
    }
    if (!saveData.player.states) saveData.player.states = [];
    if (typeof saveData.player.shield === "undefined") saveData.player.shield = 0;
    if (!saveData.player.currentMap) saveData.player.currentMap = saveData.player.location || "新手村";
    saveData.saveVersion = 2;
  }

  if (saveData.saveVersion < 3) {
    if (!saveData.player.skills) saveData.player.skills = ["ironSkin", "quickSlash"];
    saveData.saveVersion = 3;
  }

  return saveData;
}
