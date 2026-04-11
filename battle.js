// ==========================================
// 少年江湖 - 大厅内自动战斗版 battle.js
// 与当前 game.js 匹配
// 说明：遇怪后不切页面，直接在大厅日志内自动战斗
// ==========================================

let battleTimer = null;
let battleRunning = false;
let currentBattle = null;
const SKILL_LIBRARY = {
  quickSlash: {
    name: "快斩",
    triggerChance: 0.18,
    damageMultiplier: 1.35,
    log: "攻势骤然加快，斩出迅捷一击！"
  },

  ironSkin: {
    name: "铁骨护体",
    triggerChance: 0.18,
    addShield: 8,
    log: "气息一沉，周身浮现护体劲气！"
  },

  bleedClaw: {
    name: "裂伤爪击",
    triggerChance: 0.20,
    addStateToTarget: {
      type: "bleed",
      value: 4,
      duration: 3
    },
    log: "撕裂伤口，令目标不断失血！"
  },

  armorCrack: {
    name: "碎甲重击",
    triggerChance: 0.16,
    addStateToTarget: {
      type: "armorBreak",
      value: 2,
      duration: 2
    },
    log: "一击震散护体，令目标防御下降！"
  },

  stunStrike: {
    name: "震击",
    triggerChance: 0.10,
    addStateToTarget: {
      type: "stun",
      value: 1,
      duration: 1
    },
    log: "这一击震得目标短暂失神！"
  },

  weakenCurse: {
    name: "虚弱咒",
    triggerChance: 0.14,
    addStateToTarget: {
      type: "weaken",
      value: 4,
      duration: 2
    },
    log: "诡异气息缠身，目标攻势变弱！"
  },

  regenAura: {
    name: "回生气",
    triggerChance: 0.16,
    addStateToSelf: {
      type: "regen",
      value: 5,
      duration: 3
    },
    log: "气脉流转，开始持续恢复！"
  },

  burnHit: {
    name: "灼火击",
    triggerChance: 0.15,
    addStateToTarget: {
      type: "burn",
      value: 5,
      duration: 2
    },
    log: "炽烈劲道灼伤了目标！"
  },

  shieldBurst: {
    name: "护体罡气",
    triggerChance: 0.12,
    addShield: 12,
    log: "护体罡气凝结成盾！"
  },

  savageBlow: {
    name: "蛮横猛击",
    triggerChance: 0.14,
    damageMultiplier: 1.6,
    log: "凶性大发，打出一记蛮横猛击！"
  }
};


// ===== 1. 基础工具 =====
function getBattleTypeText(type) {
  if (type === "boss") return "BOSS";
  if (type === "elite") return "精英";
  return "普通怪";
}

function stopBattleTimer() {
  if (battleTimer) {
    clearInterval(battleTimer);
    battleTimer = null;
  }
  battleRunning = false;
}

function calculatePlayerDefense() {
  const bonus = getEquipBonus();
  const baseDef = 5 + bonus.defense;
  const breakValue = getArmorBreakValue(player.states);
  const effectiveDef = Math.max(0, baseDef - breakValue);

  return effectiveDef;
}

function calculatePlayerAttack() {
  const bonus = getEquipBonus();
  let atk = 15 + bonus.attack;

  atk -= getWeakenValue(player);

  if (atk < 1) atk = 1;

  const monsterDef = calculateMonsterDefense();
  atk = Math.max(1, atk - monsterDef);

  const critRoll = Math.random();
  if (critRoll < 0.15) {
    atk = Math.floor(atk * 1.8);
    addLog("event", `【暴击】你突然爆发，伤害提升！`);
  }

  return atk;
}
function calculateMonsterAttack() {
  if (!currentBattle) return 0;

  let atk = currentBattle.atk;

  atk -= getWeakenValue(currentBattle);

  if (atk < 1) atk = 1;

  if (currentBattle.type === "elite" && Math.random() < 0.12) {
    atk = Math.floor(atk * 1.5);
    addLog("event", `【凶性】${currentBattle.name} 突然发狠，伤害暴涨！`);
  }

  if (currentBattle.type === "boss" && Math.random() < 0.18) {
    atk = Math.floor(atk * 1.8);
    addLog("event", `【重击】${currentBattle.name} 发动了狠辣重击！`);
  }

  const playerDef = calculatePlayerDefense();
  const finalDamage = Math.max(1, atk - playerDef);

  return finalDamage;
}
function ensureBattleStateContainers() {
  if (!player.states) player.states = [];
  if (typeof player.shield === "undefined") player.shield = 0;

  if (currentBattle) {
    if (!currentBattle.states) currentBattle.states = [];
    if (typeof currentBattle.shield === "undefined") currentBattle.shield = 0;
  }
}

function getStateText(type) {
  if (type === "bleed") return "流血";
  if (type === "armorBreak") return "破甲";
  if (type === "stun") return "眩晕";
  if (type === "weaken") return "虚弱";
  if (type === "regen") return "再生";
  if (type === "burn") return "灼烧";
  return type;
}

function addBattleState(target, state) {
  if (!target.states) target.states = [];
  target.states.push({ ...state });
}

function processStates(target, targetName) {
  if (!target || !target.states || target.states.length === 0) return;

  target.states = target.states.filter(state => {
    if (state.type === "bleed") {
      target.hp = Math.max(0, target.hp - state.value);
      addLog("event", `【流血】${targetName}损失 ${state.value} 点气血。`);
    }

    if (state.type === "burn") {
      target.hp = Math.max(0, target.hp - state.value);
      addLog("event", `【灼烧】${targetName}被灼伤，损失 ${state.value} 点气血。`);
    }

    if (state.type === "regen") {
      target.hp = Math.min(target.maxHp || target.hp, target.hp + state.value);
      addLog("event", `【再生】${targetName}恢复了 ${state.value} 点气血。`);
    }

    state.duration -= 1;

    if (state.duration <= 0) {
      addLog("sys", `【状态结束】${targetName}的${getStateText(state.type)}状态结束。`);
      return false;
    }

    return true;
  });
}
function applyDamageWithShield(target, damage, targetName) {
  let finalDamage = damage;

  if (typeof target.shield !== "undefined" && target.shield > 0) {
    const absorb = Math.min(target.shield, finalDamage);
    target.shield -= absorb;
    finalDamage -= absorb;

    addLog("event", `【护盾】${targetName}的护盾吸收了 ${absorb} 点伤害！`);
  }

  target.hp = Math.max(0, target.hp - finalDamage);
  return finalDamage;
}

function getArmorBreakValue(states) {
  if (!states || !Array.isArray(states)) return 0;

  let total = 0;
  states.forEach(state => {
    if (state.type === "armorBreak") {
      total += state.value || 0;
    }
  });

  return total;
}

function calculateMonsterDefense() {
  if (!currentBattle) return 0;

  const baseDef = currentBattle.def || 0;
  const breakValue = getArmorBreakValue(currentBattle.states);
  const effectiveDef = Math.max(0, baseDef - breakValue);

  return effectiveDef;
}

function hasState(target, stateType) {
  if (!target || !target.states) return false;
  return target.states.some(state => state.type === stateType);
}

function getWeakenValue(target) {
  if (!target || !target.states) return 0;

  let total = 0;
  target.states.forEach(state => {
    if (state.type === "weaken") {
      total += state.value || 0;
    }
  });

  return total;
}

function triggerSkills(attacker, defender, skillIds, attackerName, defenderName, baseDamage) {
  if (!skillIds || !Array.isArray(skillIds) || skillIds.length === 0) {
    return {
      damage: baseDamage,
      skipped: false
    };
  }

  let damage = baseDamage;

  for (const skillId of skillIds) {
    const skill = SKILL_LIBRARY[skillId];
    if (!skill) continue;

    if (Math.random() < (skill.triggerChance || 0)) {
      addLog("event", `【技能】${attackerName}施展了【${skill.name}】！${skill.log || ""}`);

      if (skill.damageMultiplier) {
        damage = Math.floor(damage * skill.damageMultiplier);
      }

      if (skill.addShield) {
        attacker.shield = (attacker.shield || 0) + skill.addShield;
        addLog("event", `【护盾】${attackerName}获得 ${skill.addShield} 点护盾！`);
      }

      if (skill.addStateToTarget) {
        addBattleState(defender, { ...skill.addStateToTarget });
        addLog("event", `【状态】${defenderName}进入${getStateText(skill.addStateToTarget.type)}状态！`);
      }

      if (skill.addStateToSelf) {
        addBattleState(attacker, { ...skill.addStateToSelf });
        addLog("event", `【状态】${attackerName}进入${getStateText(skill.addStateToSelf.type)}状态！`);
      }
    }
  }

  return {
    damage,
    skipped: false
  };
}

function applyStatusEffects() {
  ensureBattleStateContainers();

  processStates(player, "你");
  if (currentBattle) {
    processStates(currentBattle, currentBattle.name);
  }
}

function renderBattleInHall() {
  updateAll();
  if (currentView === "hall") {
    renderHallLog();
  } else {
    refreshCurrentView();
  }
}


// ===== 2. 遭遇后直接开战 =====
function showEncounter(monster) {
  if (!monster) {
    setNotice("error", "遭遇目标异常。");
    showHall();
    return;
  }

  const myPower = getPowerValue();
  const enemyPower = monster.power || 0;

  let dangerText = "势均力敌";
  const diff = myPower - enemyPower;

  if (diff >= 3000) dangerText = "碾压";
  else if (diff >= 1000) dangerText = "优势";
  else if (diff >= -1000) dangerText = "势均力敌";
  else if (diff >= -4000) dangerText = "危险";
  else dangerText = "极度危险";

  addLog(
    "sys",
    `【开战】${monster.name} 出现在你面前！（类型：${getBattleTypeText(monster.type)}，战力：${enemyPower}，你的战力：${myPower}，评估：${dangerText}）`
  );

  setNotice("info", `遭遇 ${monster.name}，战斗开始！`);

  beginBattle();
}

function beginBattle() {
  if (!currentBattle) {
    setNotice("error", "当前没有战斗目标。");
    showHall();
    return;
  }

  if (battleRunning) {
    setNotice("info", "战斗已经在进行了。");
    return;
  }

  battleRunning = true;

  addLog("sys", `【战斗开始】你与 ${currentBattle.name} 交手了！`);
  renderBattleInHall();

  battleTimer = setInterval(() => {
    runBattleRound();
  }, 1000);
}


// ===== 3. 每秒一回合 =====
function runBattleRound() {
  if (!currentBattle || !battleRunning) {
    stopBattleTimer();
    return;
  }

  if (player.hp <= 0) {
    finishBattleDefeat();
    return;
  }

  currentBattle.round += 1;
  ensureBattleStateContainers();

  // 回合开始先结算状态
  applyStatusEffects();

    if (hasState(player, "stun")) {
    addLog("event", `【眩晕】你一时失神，本回合无法出手！`);
  }

  if (player.hp <= 0) {
    finishBattleDefeat();
    return;
  }

  if (currentBattle.hp <= 0) {
    finishBattleVictory();
    return;
  }

  // 玩家先出手
    // 玩家先出手
  if (!hasState(player, "stun")) {
    let playerAtk = calculatePlayerAttack();
    const playerSkillResult = triggerSkills(
      player,
      currentBattle,
      player.skills || [],
      "你",
      currentBattle.name,
      playerAtk
    );
    playerAtk = playerSkillResult.damage;

    const actualPlayerDamage = applyDamageWithShield(currentBattle, playerAtk, currentBattle.name);

    addLog(
      "event",
      `【第 ${currentBattle.round} 回合】你出手造成 ${actualPlayerDamage} 伤害。（敌血：${currentBattle.hp}）`
    );

    if (Math.random() < 0.18) {
      addBattleState(currentBattle, {
        type: "bleed",
        value: 4,
        duration: 3
      });
      addLog("event", `【流血】你的攻击撕裂了 ${currentBattle.name}，对方进入流血状态！`);
    }

    if (Math.random() < 0.12) {
      addBattleState(currentBattle, {
        type: "armorBreak",
        value: 2,
        duration: 2
      });
      addLog("event", `【破甲】你击中了 ${currentBattle.name} 的破绽，对方防御下降！`);
    }

    if (currentBattle.hp <= 0) {
      finishBattleVictory();
      return;
    }
  }
  
   // 怪物反击
  if (!hasState(currentBattle, "stun")) {
    let monsterAtk = calculateMonsterAttack();
    const monsterSkillResult = triggerSkills(
      currentBattle,
      player,
      currentBattle.skills || [],
      currentBattle.name,
      "你",
      monsterAtk
    );
    monsterAtk = monsterSkillResult.damage;

    const actualMonsterDamage = applyDamageWithShield(player, monsterAtk, "你");

    addLog(
      "event",
      `【第 ${currentBattle.round} 回合】${currentBattle.name} 反击造成 ${actualMonsterDamage} 伤害。（你剩余气血：${player.hp}）`
    );

    if (player.hp <= 0) {
      finishBattleDefeat();
      return;
    }
  } else {
    addLog("event", `【眩晕】${currentBattle.name} 一时失神，本回合无法行动！`);
  }

  // 精英怪低概率给你挂流血
  if (currentBattle.type === "elite" && Math.random() < 0.12) {
    addBattleState(player, {
      type: "bleed",
      value: 4,
      duration: 3
    });
    addLog("event", `【流血】${currentBattle.name} 的攻击撕裂了你，你进入流血状态！`);
  }

  // 精英怪低概率破甲
  if (currentBattle.type === "elite" && Math.random() < 0.10) {
    addBattleState(player, {
      type: "armorBreak",
      value: 2,
      duration: 2
    });
    addLog("event", `【破甲】${currentBattle.name} 击中了你的要害，你的防御下降了！`);
  }

  // BOSS 低概率给自己上护盾
  if (currentBattle.type === "boss" && Math.random() < 0.15) {
    currentBattle.shield += 12;
    addLog("event", `【护盾】${currentBattle.name} 凝聚出一层护体罡气，获得 12 点护盾！`);
  }

  // BOSS 低概率给你破甲
  if (currentBattle.type === "boss" && Math.random() < 0.12) {
    addBattleState(player, {
      type: "armorBreak",
      value: 3,
      duration: 2
    });
    addLog("event", `【破甲】${currentBattle.name} 的重击震散了你的护体，你的防御大幅下降！`);
  }

  renderBattleInHall();
}
// ===== 4. 胜负 =====
function finishBattleVictory() {
  if (!currentBattle) return;

  stopBattleTimer();

  const moneyGain = currentBattle.money || 0;
  const expGain = currentBattle.exp || 0;
  const monsterName = currentBattle.name;

  player.money += moneyGain;
  gainExp(expGain);

  addLog("success", `【胜利】你击败了 ${monsterName}！获得银两 ${moneyGain}，经验 ${expGain}`);
  setNotice("success", `胜利！银两 +${moneyGain}，经验 +${expGain}`);

  currentBattle = null;
  renderBattleInHall();
}

function finishBattleDefeat() {
  stopBattleTimer();

  addLog("error", `你被怪物击败了！`);
  setNotice("error", "你输了，先去休息恢复吧。");

  currentBattle = null;
  renderBattleInHall();
}


// ===== 5. 预留函数（兼容 game.js / 以后扩展） =====
function tryEscape() {
  if (!currentBattle) {
    setNotice("error", "当前没有遭遇目标。");
    return;
  }

  const roll = Math.random();

  if (roll < 0.5) {
    addLog("sys", `你成功避开了 ${currentBattle.name}。`);
    setNotice("success", "你成功脱离战斗。");
    stopBattleTimer();
    currentBattle = null;
    renderBattleInHall();
  } else {
    addLog("error", `你没能甩开 ${currentBattle.name}！`);
    setNotice("error", "脱离失败，战斗继续！");
    renderBattleInHall();
  }
}

function showBattle() {
  // 现在不再切独立战斗页
  // 为兼容 game.js 保留这个函数
  renderBattleInHall();
}

function useBattleItem(name) {
  if (!currentBattle) {
    setNotice("error", "当前没有战斗目标。");
    return;
  }

  if (!hasItem(name, 1)) {
    setNotice("error", `你没有 ${name}。`);
    return;
  }

  if (name === "小还丹") {
    removeItem("小还丹", 1);
    recoverHp(20);
    recoverMp(10);
    addLog("event", "你在战斗中服下一颗小还丹，气血 +20，内力 +10。");
    setNotice("success", "使用成功：小还丹");
  } else if (name === "大还丹") {
    removeItem("大还丹", 1);
    recoverHp(50);
    recoverMp(25);
    addLog("event", "你在战斗中服下一颗大还丹，气血 +50，内力 +25。");
    setNotice("success", "使用成功：大还丹");
  } else if (name === "干粮") {
    removeItem("干粮", 1);
    recoverHp(8);
    addLog("event", "你在战斗中吃下一份干粮，气血 +8。");
    setNotice("success", "使用成功：干粮");
  } else {
    setNotice("error", `${name} 不能在战斗中使用。`);
  }

  renderBattleInHall();
}

function applyPoisonEffect() {
  if (!currentBattle) return;

  currentBattle.statusEffects.push({
    type: "poison",
    damagePerTurn: 5,
    duration: 3
  });

  addLog("event", `${currentBattle.name} 让你中了毒！`);
}

function monsterSkill() {
  if (!currentBattle) return;

  const roll = Math.random();
  if (roll < 0.2) {
    const extraRaw = currentBattle.atk;
    const playerDef = calculatePlayerDefense();
    const extra = Math.max(1, extraRaw - playerDef);

    player.hp = Math.max(0, player.hp - extra);
    addLog("event", `【技能】${currentBattle.name} 发动凶狠一击，你额外损失 ${extra} 点气血！`);
  }
}


// ===== 6. 导出到全局 =====
window.showEncounter = showEncounter;
window.beginBattle = beginBattle;
window.tryEscape = tryEscape;
window.showBattle = showBattle;
window.stopBattleTimer = stopBattleTimer;
window.runBattleRound = runBattleRound;
window.useBattleItem = useBattleItem;
window.runAway = tryEscape;
window.finishBattleVictory = finishBattleVictory;
window.finishBattleDefeat = finishBattleDefeat;
window.getBattleTypeText = getBattleTypeText;
window.applyPoisonEffect = applyPoisonEffect;
window.monsterSkill = monsterSkill;