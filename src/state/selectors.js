(function initSelectors(global) {
  const g = global || window;

  function getEquipDataMap() {
    return g.__JH_DATA__?.equipData || g.equipData || {};
  }

  function getQualityConfigMap() {
    return g.__JH_DATA__?.equipQualityConfig || {};
  }

  function getEquipQualityMeta(qualityKey) {
    const cfg = getQualityConfigMap();
    return cfg[qualityKey] || cfg.common || { key: "common", name: "凡品", color: "#9ca3af", statMultiplier: 1 };
  }

  function getEquipQualityMultiplier(qualityKey) {
    const meta = getEquipQualityMeta(qualityKey);
    const n = Number(meta.statMultiplier);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }

  function getCultivationPercent(type) {
    if (typeof g.getCultivationGrowthPercent === "function") {
      return Math.max(0, Number(g.getCultivationGrowthPercent(type)) || 0);
    }
    return 0;
  }

  function getScaledEquipStats(equip) {
    if (!equip || typeof equip !== "object") return { attack: 0, defense: 0 };

    const baseAttack = Number(equip.baseStats?.attack ?? equip.attack ?? 0) || 0;
    const baseDefense = Number(equip.baseStats?.defense ?? equip.defense ?? 0) || 0;
    const multiplier = getEquipQualityMultiplier(equip.quality);

    return {
      attack: Math.round(baseAttack * multiplier),
      defense: Math.round(baseDefense * multiplier)
    };
  }

  function sumEquipAdvancedStats() {
    const p = g.player || { equips: {} };
    const equips = p.equips || {};
    const data = getEquipDataMap();
    const total = {
      crit: 0,
      crit_dmg: 0,
      resist: 0,
      trueDamage: 0,
      weak_hit: 0,
      dmgReduce: 0
    };

    [equips.weapon, equips.armor, equips.hat, equips.belt, equips.shoes, equips.necklace, equips.artifact].forEach((equipName) => {
      const equip = data[equipName];
      if (!equip) return;
      const extra = equip.extraStats || {};
      total.resist += Number(extra.resist || 0);
      total.trueDamage += Number(extra.trueDamage || 0);
      total.weak_hit += Number(extra.weak_hit || 0);
      total.dmgReduce += Number(extra.dmgReduce || 0);

      (equip.affixes || []).forEach((affix) => {
        if (!affix) return;
        const value = Number(affix.value || 0);
        if (affix.key === "crit") total.crit += value;
        if (affix.key === "crit_dmg") total.crit_dmg += value;
        if (affix.key === "weak_hit") total.weak_hit += value;
        if (affix.key === "dmgReduce") total.dmgReduce += value;
      });
    });
    return total;
  }

  function getDerivedCombatStatsValue() {
    const p = g.player || {};
    const sect = (g.sectList || []).find((x) => x.name === p.sect) || {};
    const passive = sect.passiveBonus || {};
    const equipStats = sumEquipAdvancedStats();
    const cultResist = typeof g.getCultivationBonus === "function" ? g.getCultivationBonus("resist") : 0;

    return {
      critRate: Math.min(75, 5 + equipStats.crit + Number(passive.critRate || 0)),
      critDamage: 150 + equipStats.crit_dmg + Number(passive.critDamage || 0),
      resist: equipStats.resist + cultResist + Number(passive.resist || 0),
      trueDamage: equipStats.trueDamage + Number(passive.trueDamage || 0),
      weakHit: equipStats.weak_hit + Number(passive.weakHit || 0),
      damageReduce: equipStats.dmgReduce + Number(passive.damageReduce || 0)
    };
  }

  function getMaxHpValue() {
    const p = g.player || { level: 1 };
    const baseHp = 100;
    const levelBonus = ((p.level || 1) - 1) * 20;
    const cultivationFlat = typeof g.getCultivationBonus === "function" ? g.getCultivationBonus("hp") : 0;

    const subtotal = baseHp + levelBonus + cultivationFlat;
    const hpPct = getCultivationPercent("hp");
    return Math.floor(subtotal * (1 + hpPct));
  }

  function getMaxMpValue() {
    const p = g.player || { level: 1 };
    const baseMp = 80;
    const levelBonus = ((p.level || 1) - 1) * 10;
    const cultivationFlat = typeof g.getCultivationBonus === "function" ? g.getCultivationBonus("mp") : 0;

    const subtotal = baseMp + levelBonus + cultivationFlat;
    const mpPct = getCultivationPercent("mp");
    return Math.floor(subtotal * (1 + mpPct));
  }

  function getEquipBonusValue() {
    const p = g.player || { equips: {} };
    const equips = p.equips || {};
    const data = getEquipDataMap();

    let attack = 0;
    let defense = 0;

    [equips.weapon, equips.armor, equips.hat, equips.belt, equips.shoes, equips.necklace, equips.artifact].forEach((equipName) => {
      if (!equipName || !data[equipName]) return;
      const scaled = getScaledEquipStats(data[equipName]);
      attack += scaled.attack;
      defense += scaled.defense;
    });

    const equipAttack = attack;
    const equipDefense = defense;

    let cultivationAttack = 0;
    let cultivationDefense = 0;
    if (typeof g.getCultivationBonus === "function") {
      cultivationAttack = g.getCultivationBonus("attack");
      cultivationDefense = g.getCultivationBonus("defense");
    }

    const attackPct = getCultivationPercent("attack");
    const defensePct = getCultivationPercent("defense");
    const sectBonus = typeof g.getSectCombatBonus === "function" ? g.getSectCombatBonus() : { atkRate: 0, defRate: 0 };

    const attackBase = Math.floor(equipAttack + cultivationAttack * (1 + attackPct));
    const defenseBase = Math.floor(equipDefense + cultivationDefense * (1 + defensePct));

    return {
      attack: Math.floor(attackBase * (1 + (Number(sectBonus.atkRate) || 0))),
      defense: Math.floor(defenseBase * (1 + (Number(sectBonus.defRate) || 0)))
    };
  }

  function getPowerValueSafe() {
    const p = g.player || { level: 1, exp: 0 };
    const bonus = getEquipBonusValue();
    const maxHp = getMaxHpValue();
    const maxMp = getMaxMpValue();

    const levelScore = (p.level || 1) * 120;
    const baseScore = Math.floor(maxHp * 0.9 + maxMp * 1.2);
    const equipScore = bonus.attack * 8 + bonus.defense * 6;
    return levelScore + baseScore + equipScore;
  }

  function getStatAnchorSnapshot(level) {
    const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
    const baseHp = 100 + (safeLevel - 1) * 20;
    const baseMp = 80 + (safeLevel - 1) * 10;

    const hpPct = getCultivationPercent("hp");
    const mpPct = getCultivationPercent("mp");

    return {
      level: safeLevel,
      hpBase: baseHp,
      mpBase: baseMp,
      hpFinal: Math.floor((baseHp + (typeof g.getCultivationBonus === "function" ? g.getCultivationBonus("hp") : 0)) * (1 + hpPct)),
      mpFinal: Math.floor((baseMp + (typeof g.getCultivationBonus === "function" ? g.getCultivationBonus("mp") : 0)) * (1 + mpPct))
    };
  }

  function getBalanceAnchors() {
    return [1, 20, 40].map(getStatAnchorSnapshot);
  }

  g.__JH_SELECTORS__ = {
    getEquipQualityMeta,
    getEquipQualityMultiplier,
    getScaledEquipStats,
    getMaxHpValue,
    getMaxMpValue,
    getEquipBonusValue,
    getPowerValueSafe,
    getDerivedCombatStatsValue,
    getBalanceAnchors
  };
})(window);
