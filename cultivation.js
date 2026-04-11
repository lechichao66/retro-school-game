const CULTIVATION_CONFIG = {
  attack: {
    key: "attack",
    name: "攻击修炼",
    maxLevel: 30,
    baseCost: 30,
    growthCost: 1.2,
    effectPerLevel: 2,
    effectText: "攻击 +"
  },
  defense: {
    key: "defense",
    name: "防御修炼",
    maxLevel: 30,
    baseCost: 30,
    growthCost: 1.2,
    effectPerLevel: 2,
    effectText: "防御 +"
  },
  hp: {
    key: "hp",
    name: "气血修炼",
    maxLevel: 30,
    baseCost: 40,
    growthCost: 1.22,
    effectPerLevel: 10,
    effectText: "气血上限 +"
  },
  mp: {
    key: "mp",
    name: "内力修炼",
    maxLevel: 30,
    baseCost: 40,
    growthCost: 1.22,
    effectPerLevel: 8,
    effectText: "内力上限 +"
  },
  resist: {
    key: "resist",
    name: "抗性修炼",
    maxLevel: 30,
    baseCost: 50,
    growthCost: 1.25,
    effectPerLevel: 1,
    effectText: "抗性 +"
  }
};

function getCultivationLevel(type) {
  if (!player.cultivation) return 0;
  return player.cultivation[type] || 0;
}

function getCultivationCost(type) {
  const cfg = CULTIVATION_CONFIG[type];
  if (!cfg) return 0;

  const level = getCultivationLevel(type);
  return Math.floor(cfg.baseCost * Math.pow(cfg.growthCost, level));
}

function getCultivationBonus(type) {
  const cfg = CULTIVATION_CONFIG[type];
  if (!cfg) return 0;

  const level = getCultivationLevel(type);
  return level * cfg.effectPerLevel;
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

  if (!player.cultivation) {
    player.cultivation = {
      attack: 0,
      defense: 0,
      hp: 0,
      mp: 0,
      resist: 0
    };
  }

  const currentLevel = player.cultivation[type] || 0;

  if (currentLevel >= cfg.maxLevel) {
    addLog("error", `${cfg.name}已经达到最高等级。`);
    setNotice("error", `${cfg.name}已满级。`);
    return false;
  }

  const cost = getCultivationCost(type);

  if (player.money < cost) {
    addLog("error", `银两不足，无法提升${cfg.name}。`);
    setNotice("error", `银两不足，需要 ${cost} 两。`);
    return false;
  }

  player.money -= cost;
  player.cultivation[type] += 1;

  addLog("event", `你潜心修炼，${cfg.name}提升至 ${player.cultivation[type]} 级，花费银两 ${cost}。`);
  setNotice("success", `${cfg.name}提升成功！`);
  return true;
}