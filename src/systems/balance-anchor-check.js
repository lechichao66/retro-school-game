(function initBalanceAnchorCheck(global) {
  const g = global || window;

  function snapshotAtLevel(level) {
    const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
    const baseHp = 100 + (safeLevel - 1) * 20;
    const baseMp = 80 + (safeLevel - 1) * 10;

    const hpFlat = typeof g.getCultivationBonus === "function" ? g.getCultivationBonus("hp") : 0;
    const mpFlat = typeof g.getCultivationBonus === "function" ? g.getCultivationBonus("mp") : 0;
    const hpPct = typeof g.getCultivationGrowthPercent === "function" ? g.getCultivationGrowthPercent("hp") : 0;
    const mpPct = typeof g.getCultivationGrowthPercent === "function" ? g.getCultivationGrowthPercent("mp") : 0;

    return {
      level: safeLevel,
      hp: Math.floor((baseHp + hpFlat) * (1 + hpPct)),
      mp: Math.floor((baseMp + mpFlat) * (1 + mpPct))
    };
  }

  function getAnchorValidation() {
    const anchors = [1, 20, 40].map(snapshotAtLevel);
    return {
      anchors,
      monotonicHp: anchors[0].hp <= anchors[1].hp && anchors[1].hp <= anchors[2].hp,
      monotonicMp: anchors[0].mp <= anchors[1].mp && anchors[1].mp <= anchors[2].mp
    };
  }

  g.__JH_BALANCE_CHECK__ = {
    snapshotAtLevel,
    getAnchorValidation
  };
})(window);
