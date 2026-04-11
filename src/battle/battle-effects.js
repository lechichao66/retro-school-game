(function initBattleEffects(global) {
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

  global.__JH_BATTLE_EFFECTS__ = {
    getStateText,
    addBattleState,
    processStates,
    applyDamageWithShield,
    getArmorBreakValue,
    hasState,
    getWeakenValue
  };
})(window);
