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
  return baseHp + levelBonus + cultivationBonus;
}

function getMaxMp() {
  if (window.__JH_SELECTORS__ && typeof window.__JH_SELECTORS__.getMaxMpValue === "function") {
    return window.__JH_SELECTORS__.getMaxMpValue();
  }

  const baseMp = 80;
  const levelBonus = (player.level - 1) * 10;
  const cultivationBonus = typeof getCultivationBonus === "function" ? getCultivationBonus("mp") : 0;
  return baseMp + levelBonus + cultivationBonus;
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
      shoes: ""
    };
  }

  if (!player.job) player.job = "无职业";
  if (!player.sect) player.sect = "无门无派";
  if (!player.title) player.title = "江湖小虾";
  if (!player.location) player.location = "新手村";
}


// ===== 3. 装备与战力计算 =====
function getEquipBonus() {
  if (window.__JH_SELECTORS__ && typeof window.__JH_SELECTORS__.getEquipBonusValue === "function") {
    return window.__JH_SELECTORS__.getEquipBonusValue();
  }

  let attack = 0;
  let defense = 0;

  if (player.equips.weapon && equipData[player.equips.weapon]) {
    attack += equipData[player.equips.weapon].attack || 0;
    defense += equipData[player.equips.weapon].defense || 0;
  }

  if (player.equips.armor && equipData[player.equips.armor]) {
    attack += equipData[player.equips.armor].attack || 0;
    defense += equipData[player.equips.armor].defense || 0;
  }

  if (player.equips.shoes && equipData[player.equips.shoes]) {
    attack += equipData[player.equips.shoes].attack || 0;
    defense += equipData[player.equips.shoes].defense || 0;
  }

  if (typeof getCultivationBonus === "function") {
    attack += getCultivationBonus("attack");
    defense += getCultivationBonus("defense");
  }

  return { attack, defense };
}
function getPowerValue() {
  if (window.__JH_SELECTORS__ && typeof window.__JH_SELECTORS__.getPowerValueSafe === "function") {
    return window.__JH_SELECTORS__.getPowerValueSafe();
  }

  const bonus = getEquipBonus();
  const maxHp = getMaxHp();
  const maxMp = getMaxMp();

  const levelScore = (player.level || 1) * 500;
  const baseScore = Math.floor(maxHp * 2 + maxMp * 5);
  const equipScore = bonus.attack * 20 + bonus.defense * 15;
  const expScore = Math.floor((player.exp || 0) * 0.5);

  return levelScore + baseScore + equipScore + expScore;
}

function getEquipText(name, emptyText = "未装备") {
  return name ? name : emptyText;
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
    const e = equipData[name];
    return `【装备】攻击+${e.attack || 0}，防御+${e.defense || 0}。${e.desc || ""}`;
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
  player.exp += amount;

  while (player.exp >= player.level * 100) {
    player.exp -= player.level * 100;
    player.level += 1;

    player.hp = getMaxHp();
    player.mp = getMaxMp();

    addLog("sys", `【突破】你晋升到了第 ${player.level} 层境界，真气贯通，状态已全满！`);
    setNotice("success", `升级成功：你已升到 ${player.level} 级，状态回满。`);
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
    player.cultivation = {
      attack: 0,
      defense: 0,
      hp: 0,
      mp: 0,
      resist: 0
    };
  }
   if (!player.skills) {
  player.skills = ["ironSkin", "quickSlash"];
 } 
  if (!player.currentMap) player.currentMap = player.location || "新手村";

  player.level = safeNumber(player.level, 1);
  player.hp = safeNumber(player.hp, getMaxHp());
  player.mp = safeNumber(player.mp, getMaxMp());
  player.money = safeNumber(player.money, 0);
  player.exp = safeNumber(player.exp, 0);

  clampPlayer();
}
function migrateSaveData(saveData) {
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

  // v1 -> v2：加入修炼、状态、护盾、当前地图
  if (saveData.saveVersion < 2) {
    if (!saveData.player) {
      saveData.player = defaultPlayer();
    }

    if (!saveData.player.cultivation) {
      saveData.player.cultivation = {
        attack: 0,
        defense: 0,
        hp: 0,
        mp: 0,
        resist: 0
      };
    }

    if (!saveData.player.states) {
      saveData.player.states = [];
    }

    if (typeof saveData.player.shield === "undefined") {
      saveData.player.shield = 0;
    }

    if (!saveData.player.currentMap) {
      saveData.player.currentMap = saveData.player.location || "新手村";
    }

    saveData.saveVersion = 2;
  }
     // v2 -> v3：加入玩家技能
   if (saveData.saveVersion < 3) {
  if (!saveData.player.skills) {
    saveData.player.skills = ["ironSkin", "quickSlash"];
  }

  saveData.saveVersion = 3;
   }
  return saveData;
}
