window.__JH_DATA__ = window.__JH_DATA__ || {};

function createEquipQualityMeta(config) {
  return {
    key: config.key,
    name: config.name,
    rank: config.rank,
    color: config.color,

    // 兼容旧逻辑（仍供现有战斗/展示读取）
    statMultiplier: config.statMultiplier,
    affixPoolSize: config.affixPoolSize,
    enhanceCap: config.enhanceCap,

    // Equip 1.0 Phase 1 扩展合同
    levelProfile: {
      defaultRequiredLevel: config.defaultRequiredLevel,
      preferredBand: config.preferredBand,
      mainstreamWeight: config.mainstreamWeight
    },
    affixProfile: {
      minCount: config.affixMinCount,
      maxCount: config.affixPoolSize,
      maxTier: config.affixMaxTier,
      allowSpecialAffix: config.allowSpecialAffix
    },
    economy: {
      baseValueMultiplier: config.baseValueMultiplier,
      sellMultiplier: config.sellMultiplier,
      salvageMultiplier: config.salvageMultiplier
    },
    rollProfile: {
      statRollMin: config.statRollMin,
      statRollMax: config.statRollMax,
      qualityVariance: config.qualityVariance
    },
    reserved: {
      prefixPool: [],
      suffixPool: [],
      uniqueAffixPool: [],
      extraValueHooks: []
    }
  };
}

window.__JH_DATA__.equipQualityConfig = {
  common: createEquipQualityMeta({
    key: "common", name: "凡品", rank: 1, color: "#9ca3af",
    statMultiplier: 1.00, affixPoolSize: 0, enhanceCap: 5,
    defaultRequiredLevel: 40, preferredBand: "L40", mainstreamWeight: 1.2,
    affixMinCount: 0, affixMaxTier: 1, allowSpecialAffix: false,
    baseValueMultiplier: 1.0, sellMultiplier: 0.22, salvageMultiplier: 0.30,
    statRollMin: 0.96, statRollMax: 1.02, qualityVariance: 0.02
  }),
  fine: createEquipQualityMeta({
    key: "fine", name: "良品", rank: 2, color: "#22c55e",
    statMultiplier: 1.05, affixPoolSize: 1, enhanceCap: 8,
    defaultRequiredLevel: 50, preferredBand: "L50", mainstreamWeight: 1.1,
    affixMinCount: 1, affixMaxTier: 2, allowSpecialAffix: false,
    baseValueMultiplier: 1.3, sellMultiplier: 0.24, salvageMultiplier: 0.35,
    statRollMin: 0.98, statRollMax: 1.08, qualityVariance: 0.04
  }),
  rare: createEquipQualityMeta({
    key: "rare", name: "稀有", rank: 3, color: "#3b82f6",
    statMultiplier: 1.16, affixPoolSize: 2, enhanceCap: 10,
    defaultRequiredLevel: 60, preferredBand: "L60", mainstreamWeight: 1.0,
    affixMinCount: 1, affixMaxTier: 3, allowSpecialAffix: true,
    baseValueMultiplier: 1.8, sellMultiplier: 0.27, salvageMultiplier: 0.42,
    statRollMin: 1.00, statRollMax: 1.14, qualityVariance: 0.06
  }),
  epic: createEquipQualityMeta({
    key: "epic", name: "珍奇", rank: 4, color: "#a855f7",
    statMultiplier: 1.25, affixPoolSize: 3, enhanceCap: 12,
    defaultRequiredLevel: 70, preferredBand: "L70", mainstreamWeight: 0.7,
    affixMinCount: 2, affixMaxTier: 4, allowSpecialAffix: true,
    baseValueMultiplier: 2.5, sellMultiplier: 0.30, salvageMultiplier: 0.50,
    statRollMin: 1.02, statRollMax: 1.20, qualityVariance: 0.08
  }),
  legend: createEquipQualityMeta({
    key: "legend", name: "传说", rank: 5, color: "#f59e0b",
    statMultiplier: 1.35, affixPoolSize: 4, enhanceCap: 15,
    defaultRequiredLevel: 80, preferredBand: "L80", mainstreamWeight: 0.45,
    affixMinCount: 3, affixMaxTier: 5, allowSpecialAffix: true,
    baseValueMultiplier: 3.4, sellMultiplier: 0.34, salvageMultiplier: 0.58,
    statRollMin: 1.05, statRollMax: 1.28, qualityVariance: 0.10
  })
};
