// ==========================================
// 少年江湖 - battle.js 兼容壳
// Step 4: 战斗引擎模块拆分（兼容旧函数名）
// ==========================================

(function initBattleCompat(global) {
  function tryEscape() {
    if (!global.currentBattle) {
      setNotice("error", "当前没有遭遇目标。");
      return;
    }

    const roll = Math.random();

    if (roll < 0.5) {
      addLog("sys", `你成功避开了 ${global.currentBattle.name}。`);
      setNotice("success", "你成功脱离战斗。");
      global.__JH_BATTLE_ENGINE__.stopBattleTimer();
      global.currentBattle = null;
      global.__JH_BATTLE_ENGINE__.renderBattleInHall();
    } else {
      addLog("error", `你没能甩开 ${global.currentBattle.name}！`);
      setNotice("error", "脱离失败，战斗继续！");
      global.__JH_BATTLE_ENGINE__.renderBattleInHall();
    }
  }

  function showBattle() {
    global.__JH_BATTLE_ENGINE__.renderBattleInHall();
  }

  function useBattleItem(name) {
    if (!global.currentBattle) {
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

    global.__JH_BATTLE_ENGINE__.renderBattleInHall();
  }

  function applyPoisonEffect() {
    if (!global.currentBattle) return;

    global.currentBattle.statusEffects.push({
      type: "poison",
      damagePerTurn: 5,
      duration: 3
    });

    addLog("event", `${global.currentBattle.name} 让你中了毒！`);
  }

  function monsterSkill() {
    if (!global.currentBattle) return;

    const roll = Math.random();
    if (roll < 0.2) {
      const extraRaw = global.currentBattle.atk;
      const playerDef = global.__JH_BATTLE_ENGINE__.calculatePlayerDefense();
      const extra = Math.max(1, extraRaw - playerDef);

      player.hp = Math.max(0, player.hp - extra);
      addLog("event", `【技能】${global.currentBattle.name} 发动凶狠一击，你额外损失 ${extra} 点气血！`);
    }
  }

  global.showEncounter = function showEncounter(monster) {
    return global.__JH_ENCOUNTER_SERVICE__.showEncounter(monster);
  };
  global.beginBattle = function beginBattle() {
    return global.__JH_BATTLE_ENGINE__.beginBattle();
  };
  global.stopBattleTimer = function stopBattleTimer() {
    return global.__JH_BATTLE_ENGINE__.stopBattleTimer();
  };
  global.runBattleRound = function runBattleRound() {
    return global.__JH_BATTLE_ENGINE__.runBattleRound();
  };
  global.finishBattleVictory = function finishBattleVictory() {
    return global.__JH_BATTLE_ENGINE__.finishBattleVictory();
  };
  global.finishBattleDefeat = function finishBattleDefeat() {
    return global.__JH_BATTLE_ENGINE__.finishBattleDefeat();
  };
  global.getBattleTypeText = function getBattleTypeText(type) {
    return global.__JH_ENCOUNTER_SERVICE__.getBattleTypeText(type);
  };

  global.tryEscape = tryEscape;
  global.showBattle = showBattle;
  global.useBattleItem = useBattleItem;
  global.runAway = tryEscape;
  global.applyPoisonEffect = applyPoisonEffect;
  global.monsterSkill = monsterSkill;
})(window);
