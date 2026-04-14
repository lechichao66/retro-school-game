const CULTIVATION_ANCHORS = {
  1: 300000,
  10: 4000000,
  20: 11000000,
  30: 38000000
};

function getCultivationStage(level) {
  if (level <= 10) return 1;
  if (level <= 20) return 2;
  return 3;
}

function getCultivationStageConfig(level) {
  const stage = getCultivationStage(level);
  if (stage === 1) return { targetClicks: 42, clickGainExp: 10 };
  if (stage === 2) return { targetClicks: 58, clickGainExp: 10 };
  return { targetClicks: 72, clickGainExp: 10 };
}

function getCultivationTargetCumulativeCost(level) {
  const safeLevel = Math.max(1, Math.min(30, Math.floor(Number(level) || 1)));
  const l1 = CULTIVATION_ANCHORS[1];
  const l10 = CULTIVATION_ANCHORS[10];
  const l20 = CULTIVATION_ANCHORS[20];
  const l30 = CULTIVATION_ANCHORS[30];

  if (safeLevel <= 10) {
    const ratio = (safeLevel - 1) / 9;
    return Math.round(l1 + (l10 - l1) * ratio);
  }
  if (safeLevel <= 20) {
    const ratio = (safeLevel - 10) / 10;
    return Math.round(l10 + (l20 - l10) * ratio);
  }
  const ratio = (safeLevel - 20) / 10;
  return Math.round(l20 + (l30 - l20) * ratio);
}

function getCultivationLevelTargetCost(level) {
  const safeLevel = Math.max(1, Math.min(30, Math.floor(Number(level) || 1)));
  if (safeLevel <= 1) return getCultivationTargetCumulativeCost(1);
  return getCultivationTargetCumulativeCost(safeLevel) - getCultivationTargetCumulativeCost(safeLevel - 1);
}

function getCultivationUpgradeRequiredExp(type, targetLevel) {
  const cfg = CULTIVATION_CONFIG[type];
  if (!cfg) return 0;
  const safeTarget = Math.max(1, Math.min(cfg.maxLevel, Math.floor(Number(targetLevel) || 1)));
  const stageCfg = getCultivationStageConfig(safeTarget);
  return stageCfg.targetClicks * stageCfg.clickGainExp;
}

const CULTIVATION_CONFIG = {
  attack: {
    key: "attack",
    name: "攻击修炼",
    maxLevel: 30,
    effectPerLevel: 14,
    percentPerLevel: 0.025,
    effectText: "攻击 +"
  },
  defense: {
    key: "defense",
    name: "防御修炼",
    maxLevel: 30,
    effectPerLevel: 14,
    percentPerLevel: 0.025,
    effectText: "防御 +"
  },
  hp: {
    key: "hp",
    name: "气血修炼",
    maxLevel: 30,
    effectPerLevel: 70,
    percentPerLevel: 0.03,
    effectText: "气血上限 +"
  },
  mp: {
    key: "mp",
    name: "内力修炼",
    maxLevel: 30,
    effectPerLevel: 50,
    percentPerLevel: 0.03,
    effectText: "内力上限 +"
  },
  resist: {
    key: "resist",
    name: "抗性修炼",
    maxLevel: 30,
    effectPerLevel: 2,
    percentPerLevel: 0,
    effectText: "抗性 +"
  }
};
const CULTIVATION_UNLOCK_LEVEL = 20;
window.CULTIVATION_UNLOCK_LEVEL = CULTIVATION_UNLOCK_LEVEL;

function getCultivationNode(type) {
  if (!player.cultivation || typeof player.cultivation !== "object") player.cultivation = {};
  const raw = player.cultivation[type];
  if (!raw || typeof raw !== "object") {
    player.cultivation[type] = { level: Math.max(0, Math.floor(Number(raw) || 0)), exp: 0 };
  }
  const node = player.cultivation[type];
  node.level = Math.max(0, Math.floor(Number(node.level) || 0));
  node.exp = Math.max(0, Math.floor(Number(node.exp) || 0));
  return node;
}

function getCultivationLevel(type) {
  return getCultivationNode(type).level || 0;
}

function getCultivationCost(type) {
  const cfg = CULTIVATION_CONFIG[type];
  if (!cfg) return 0;
  const level = getCultivationLevel(type);
  if (level >= cfg.maxLevel) return 0;
  const nextLevel = level + 1;
  const stageCfg = getCultivationStageConfig(nextLevel);
  const levelCost = getCultivationLevelTargetCost(nextLevel);
  return Math.max(1, Math.ceil(levelCost / Math.max(1, stageCfg.targetClicks)));
}

function getCultivationBonus(type) {
  const cfg = CULTIVATION_CONFIG[type];
  if (!cfg) return 0;

  const level = getCultivationLevel(type);
  return level * cfg.effectPerLevel;
}


function getCultivationGrowthPercent(type) {
  const cfg = CULTIVATION_CONFIG[type];
  if (!cfg) return 0;

  const level = getCultivationLevel(type);
  return level * (cfg.percentPerLevel || 0);
}

function getCultivationSummary() {
  return {
    attack: getCultivationBonus("attack"),
    defense: getCultivationBonus("defense"),
    hp: getCultivationBonus("hp"),
    mp: getCultivationBonus("mp"),
    resist: getCultivationBonus("resist")
  };
}

function upgradeCultivation(type) {
  const cfg = CULTIVATION_CONFIG[type];
  if (!cfg) return false;
  if ((player.level || 1) < CULTIVATION_UNLOCK_LEVEL) {
    setNotice("error", `修炼系统需角色达到 ${CULTIVATION_UNLOCK_LEVEL} 级后开启。`);
    addLog("error", `你尝试修炼失败：需达到 ${CULTIVATION_UNLOCK_LEVEL} 级。`);
    return false;
  }

  if (window.__JH_CULTIVATION_SYSTEM__ && typeof window.__JH_CULTIVATION_SYSTEM__.ensurePlayerCultivation === "function") {
    window.__JH_CULTIVATION_SYSTEM__.ensurePlayerCultivation(player);
  } else if (!player.cultivation) {
    player.cultivation = {
      attack: { level: 0, exp: 0 },
      defense: { level: 0, exp: 0 },
      hp: { level: 0, exp: 0 },
      mp: { level: 0, exp: 0 },
      resist: { level: 0, exp: 0 }
    };
  }

  const node = getCultivationNode(type);
  const currentLevel = node.level || 0;

  if (currentLevel >= cfg.maxLevel) {
    addLog("error", `${cfg.name}已经达到最高等级。`);
    setNotice("error", `${cfg.name}已满级。`);
    return false;
  }

  const moneyCost = getCultivationCost(type);
  if (player.money < moneyCost) {
    addLog("error", `资源不足，无法提升${cfg.name}。`);
    setNotice("error", `提升需要银两 ${moneyCost}。`);
    return false;
  }

  player.money -= moneyCost;
  node.exp = (node.exp || 0) + getCultivationStageConfig(currentLevel + 1).clickGainExp;

  let levelUps = 0;
  while ((node.level || 0) < cfg.maxLevel) {
    const nextLevel = (node.level || 0) + 1;
    const needExp = getCultivationUpgradeRequiredExp(type, nextLevel);
    if ((node.exp || 0) < needExp) break;
    node.exp -= needExp;
    node.level = nextLevel;
    levelUps += 1;
  }

  if (levelUps > 0) {
    addLog("event", `你潜心修炼，${cfg.name}提升至 ${node.level} 级，消耗银两 ${moneyCost}。`);
    setNotice("success", `${cfg.name}提升成功！`);
  } else {
    addLog("event", `你修炼了${cfg.name}，进度提升（${node.exp}/${getCultivationUpgradeRequiredExp(type, currentLevel + 1)}）。`);
    setNotice("success", `${cfg.name}修炼进度提升。`);
  }
  player.cultivation[type] = { level: node.level || 0, exp: node.exp || 0 };
  return true;
}
