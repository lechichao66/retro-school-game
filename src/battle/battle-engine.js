(function initBattleEngine(global) {
  let battleTimer = null;
  let battleRunning = false;

  function getCurrentBattle() {
    return global.currentBattle;
  }

  function stopBattleTimer() {
    if (battleTimer) {
      clearInterval(battleTimer);
      battleTimer = null;
    }
    battleRunning = false;
  }

  function ensureBattleStateContainers() {
    if (!player.states) player.states = [];
    if (typeof player.shield === "undefined") player.shield = 0;

    const currentBattle = getCurrentBattle();
    if (currentBattle) {
      if (!currentBattle.states) currentBattle.states = [];
      if (typeof currentBattle.shield === "undefined") currentBattle.shield = 0;
    }
  }

  function calculateMonsterDefense() {
    const currentBattle = getCurrentBattle();
    if (!currentBattle) return 0;

    const effects = global.__JH_BATTLE_EFFECTS__;
    const baseDef = currentBattle.def || 0;
    const breakValue = effects.getArmorBreakValue(currentBattle.states);
    const effectiveDef = Math.max(0, baseDef - breakValue);

    return effectiveDef;
  }

  function calculatePlayerDefense() {
    const effects = global.__JH_BATTLE_EFFECTS__;
    const bonus = getEquipBonus();
    const baseDef = 5 + bonus.defense;
    const breakValue = effects.getArmorBreakValue(player.states);
    const effectiveDef = Math.max(0, baseDef - breakValue);

    return effectiveDef;
  }

  function calculatePlayerAttack() {
    const effects = global.__JH_BATTLE_EFFECTS__;
    const bonus = getEquipBonus();
    let atk = 15 + bonus.attack;

    atk -= effects.getWeakenValue(player);

    if (atk < 1) atk = 1;

    const monsterDef = calculateMonsterDefense();
    atk = Math.max(1, atk - monsterDef);

    const critRoll = Math.random();
    if (critRoll < 0.15) {
      atk = Math.floor(atk * 1.8);
      addLog("event", "【暴击】你突然爆发，伤害提升！");
    }

    return atk;
  }

  function calculateMonsterAttack() {
    const currentBattle = getCurrentBattle();
    if (!currentBattle) return 0;

    const effects = global.__JH_BATTLE_EFFECTS__;
    let atk = currentBattle.atk;

    atk -= effects.getWeakenValue(currentBattle);

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

  function applyStatusEffects() {
    const effects = global.__JH_BATTLE_EFFECTS__;
    ensureBattleStateContainers();

    effects.processStates(player, "你");
    const currentBattle = getCurrentBattle();
    if (currentBattle) {
      effects.processStates(currentBattle, currentBattle.name);
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

  function beginBattle() {
    const currentBattle = getCurrentBattle();

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

  function finishBattleVictory() {
    const currentBattle = getCurrentBattle();
    if (!currentBattle) return;

    stopBattleTimer();

    const moneyGain = currentBattle.money || 0;
    const expGain = currentBattle.exp || 0;
    const monsterName = currentBattle.name;

    player.money += moneyGain;
    gainExp(expGain);

    addLog("success", `【胜利】你击败了 ${monsterName}！获得银两 ${moneyGain}，经验 ${expGain}`);
    setNotice("success", `胜利！银两 +${moneyGain}，经验 +${expGain}`);

    player.states = [];
    player.shield = 0;
    global.currentBattle = null;
    renderBattleInHall();
  }

  function finishBattleDefeat() {
    stopBattleTimer();

    addLog("error", "你被怪物击败了！");
    setNotice("error", "你输了，先去休息恢复吧。");

    player.states = [];
    player.shield = 0;
    global.currentBattle = null;
    renderBattleInHall();
  }

  function runBattleRound() {
    const effects = global.__JH_BATTLE_EFFECTS__;
    const skills = global.__JH_BATTLE_SKILLS__;
    let currentBattle = getCurrentBattle();

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

    applyStatusEffects();

    if (effects.hasState(player, "stun")) {
      addLog("event", "【眩晕】你一时失神，本回合无法出手！");
    }

    if (player.hp <= 0) {
      finishBattleDefeat();
      return;
    }

    currentBattle = getCurrentBattle();
    if (!currentBattle || currentBattle.hp <= 0) {
      finishBattleVictory();
      return;
    }

    if (!effects.hasState(player, "stun")) {
      let playerAtk = calculatePlayerAttack();
      const playerSkillResult = skills.triggerSkills(
        player,
        currentBattle,
        player.skills || [],
        "你",
        currentBattle.name,
        playerAtk
      );
      playerAtk = playerSkillResult.damage;

      const actualPlayerDamage = effects.applyDamageWithShield(currentBattle, playerAtk, currentBattle.name);

      addLog(
        "event",
        `【第 ${currentBattle.round} 回合】你出手造成 ${actualPlayerDamage} 伤害。（敌血：${currentBattle.hp}）`
      );

      if (Math.random() < 0.18) {
        effects.addBattleState(currentBattle, {
          type: "bleed",
          value: 4,
          duration: 3
        });
        addLog("event", `【流血】你的攻击撕裂了 ${currentBattle.name}，对方进入流血状态！`);
      }

      if (Math.random() < 0.12) {
        effects.addBattleState(currentBattle, {
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

    currentBattle = getCurrentBattle();
    if (!currentBattle) return;

    if (!effects.hasState(currentBattle, "stun")) {
      let monsterAtk = calculateMonsterAttack();
      const monsterSkillResult = skills.triggerSkills(
        currentBattle,
        player,
        currentBattle.skills || [],
        currentBattle.name,
        "你",
        monsterAtk
      );
      monsterAtk = monsterSkillResult.damage;

      const actualMonsterDamage = effects.applyDamageWithShield(player, monsterAtk, "你");

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

    if (currentBattle.type === "elite" && Math.random() < 0.12) {
      effects.addBattleState(player, {
        type: "bleed",
        value: 4,
        duration: 3
      });
      addLog("event", `【流血】${currentBattle.name} 的攻击撕裂了你，你进入流血状态！`);
    }

    if (currentBattle.type === "elite" && Math.random() < 0.10) {
      effects.addBattleState(player, {
        type: "armorBreak",
        value: 2,
        duration: 2
      });
      addLog("event", `【破甲】${currentBattle.name} 击中了你的要害，你的防御下降了！`);
    }

    if (currentBattle.type === "boss" && Math.random() < 0.15) {
      currentBattle.shield += 12;
      addLog("event", `【护盾】${currentBattle.name} 凝聚出一层护体罡气，获得 12 点护盾！`);
    }

    if (currentBattle.type === "boss" && Math.random() < 0.12) {
      effects.addBattleState(player, {
        type: "armorBreak",
        value: 3,
        duration: 2
      });
      addLog("event", `【破甲】${currentBattle.name} 的重击震散了你的护体，你的防御大幅下降！`);
    }

    renderBattleInHall();
  }

  global.__JH_BATTLE_ENGINE__ = {
    stopBattleTimer,
    beginBattle,
    runBattleRound,
    finishBattleVictory,
    finishBattleDefeat,
    renderBattleInHall,
    calculatePlayerDefense,
    getBattleRunning: () => battleRunning
  };
})(window);
