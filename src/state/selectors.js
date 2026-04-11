(function initSelectors(global) {
  const g = global || window;

  function getMaxHpValue() {
    const p = g.player || { level: 1 };
    const baseHp = 100;
    const levelBonus = ((p.level || 1) - 1) * 20;
    const cultivationBonus = typeof g.getCultivationBonus === "function" ? g.getCultivationBonus("hp") : 0;
    return baseHp + levelBonus + cultivationBonus;
  }

  function getMaxMpValue() {
    const p = g.player || { level: 1 };
    const baseMp = 80;
    const levelBonus = ((p.level || 1) - 1) * 10;
    const cultivationBonus = typeof g.getCultivationBonus === "function" ? g.getCultivationBonus("mp") : 0;
    return baseMp + levelBonus + cultivationBonus;
  }

  function getEquipBonusValue() {
    const p = g.player || { equips: {} };
    const equips = p.equips || {};

    let attack = 0;
    let defense = 0;

    if (equips.weapon && g.equipData?.[equips.weapon]) {
      attack += g.equipData[equips.weapon].attack || 0;
      defense += g.equipData[equips.weapon].defense || 0;
    }

    if (equips.armor && g.equipData?.[equips.armor]) {
      attack += g.equipData[equips.armor].attack || 0;
      defense += g.equipData[equips.armor].defense || 0;
    }

    if (equips.shoes && g.equipData?.[equips.shoes]) {
      attack += g.equipData[equips.shoes].attack || 0;
      defense += g.equipData[equips.shoes].defense || 0;
    }

    if (typeof g.getCultivationBonus === "function") {
      attack += g.getCultivationBonus("attack");
      defense += g.getCultivationBonus("defense");
    }

    return { attack, defense };
  }

  function getPowerValueSafe() {
    const p = g.player || { level: 1, exp: 0 };
    const bonus = getEquipBonusValue();
    const maxHp = getMaxHpValue();
    const maxMp = getMaxMpValue();

    const levelScore = (p.level || 1) * 500;
    const baseScore = Math.floor(maxHp * 2 + maxMp * 5);
    const equipScore = bonus.attack * 20 + bonus.defense * 15;
    const expScore = Math.floor((p.exp || 0) * 0.5);

    return levelScore + baseScore + equipScore + expScore;
  }

  g.__JH_SELECTORS__ = {
    getMaxHpValue,
    getMaxMpValue,
    getEquipBonusValue,
    getPowerValueSafe
  };
})(window);
