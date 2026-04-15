window.__JH_DATA__ = window.__JH_DATA__ || {};

function getEquipQualityColor(quality, fallback) {
  const cfg = window.__JH_DATA__?.equipQualityConfig || {};
  return cfg[quality]?.color || fallback || "#9ca3af";
}

function getEquipQualityMeta(quality) {
  const cfg = window.__JH_DATA__?.equipQualityConfig || {};
  return cfg[quality] || cfg.common || { key: "common", rank: 1, levelProfile: { defaultRequiredLevel: 40, preferredBand: "L40" }, economy: { sellMultiplier: 0.22 } };
}

function getEquipLevelBandConfig() {
  const fallback = {
    order: ["L10", "L20", "L30", "L40", "L50", "L60", "L70", "L80", "L90+"],
    bands: {
      L10: { key: "L10", minLevel: 1, maxLevel: 19, label: "10级段" },
      L20: { key: "L20", minLevel: 20, maxLevel: 29, label: "20级段" },
      L30: { key: "L30", minLevel: 30, maxLevel: 39, label: "30级段" },
      L40: { key: "L40", minLevel: 40, maxLevel: 49, label: "40级段" },
      L50: { key: "L50", minLevel: 50, maxLevel: 59, label: "50级段" },
      L60: { key: "L60", minLevel: 60, maxLevel: 69, label: "60级段" },
      L70: { key: "L70", minLevel: 70, maxLevel: 79, label: "70级段" },
      L80: { key: "L80", minLevel: 80, maxLevel: 89, label: "80级段" },
      "L90+": { key: "L90+", minLevel: 90, maxLevel: 999, label: "90级以上" }
    }
  };
  return window.__JH_DATA__?.equipLevelBands || fallback;
}

function resolveLevelBandByLevel(requiredLevel) {
  const cfg = getEquipLevelBandConfig();
  const order = Array.isArray(cfg.order) ? cfg.order : [];
  const bands = cfg.bands || {};
  const lv = Math.max(1, Math.floor(Number(requiredLevel) || 1));
  for (let i = 0; i < order.length; i += 1) {
    const key = order[i];
    const band = bands[key];
    if (!band) continue;
    const min = Math.floor(Number(band.minLevel) || 1);
    const max = Math.floor(Number(band.maxLevel) || min);
    if (lv >= min && lv <= max) return key;
  }
  return "L90+";
}

function normalizeLevelBandKey(levelBand) {
  if (typeof levelBand !== "string" || !levelBand) return "";
  const cfg = getEquipLevelBandConfig();
  const bands = cfg.bands || {};
  return bands[levelBand] ? levelBand : "";
}

function getFallbackLevelBand() {
  const cfg = getEquipLevelBandConfig();
  const order = Array.isArray(cfg.order) ? cfg.order : [];
  if (order.includes("L40")) return "L40";
  return order[0] || "L10";
}

function toEquipId(name) {
  return `equip_${String(name || "unknown").replace(/\s+/g, "_")}`;
}

function sanitizeAffixList(rawAffixes) {
  if (!Array.isArray(rawAffixes)) return [];
  return rawAffixes.map((affix, idx) => ({
    key: affix?.key || `affix_${idx + 1}`,
    name: affix?.name || "未命名词条",
    value: Number(affix?.value) || 0,
    valueType: affix?.valueType || "flat",
    tier: Math.max(1, Math.floor(Number(affix?.tier) || 1)),
    tags: Array.isArray(affix?.tags) ? affix.tags : []
  }));
}

function createEquipSchema(config) {
  const baseStats = config.baseStats || {};
  const quality = config.quality || "common";
  const qualityMeta = getEquipQualityMeta(quality);
  const levelCfg = getEquipLevelBandConfig();
  const bandCfgMap = levelCfg.bands || {};
  const explicitBand = normalizeLevelBandKey(config.levelBand);
  const explicitLevel = Number.isFinite(Number(config.requiredLevel)) ? Math.max(1, Math.floor(Number(config.requiredLevel))) : 0;
  const compatibilityLevel = config.legacyQualityLevelFallback === true
    ? Math.max(1, Math.floor(Number(qualityMeta.levelProfile?.defaultRequiredLevel) || 40))
    : 0;
  const requiredLevel = explicitLevel || compatibilityLevel;
  const resolvedBand = explicitBand
    || (requiredLevel > 0 ? resolveLevelBandByLevel(requiredLevel) : getFallbackLevelBand());
  const bandCfg = bandCfgMap[resolvedBand] || { label: resolvedBand, minLevel: requiredLevel || 40, maxLevel: requiredLevel || 40 };
  const finalizedRequiredLevel = requiredLevel || Math.max(1, Math.floor(Number(bandCfg.minLevel) || 40));

  return {
    schemaVersion: 1,
    id: config.id || "",
    name: config.name || "",

    quality,
    qualityRank: Number(qualityMeta.rank) || 1,
    color: getEquipQualityColor(quality, config.color),
    slot: config.slot || "weapon",
    slotType: config.slotType || config.slot || "weapon",
    slotGroup: config.slotGroup || (config.slot === "artifact" ? "reserved" : "core"),

    requiredLevel: finalizedRequiredLevel,
    levelBand: resolvedBand,
    levelBandLabel: bandCfg.label,
    levelMin: Math.floor(Number(bandCfg.minLevel) || finalizedRequiredLevel),
    levelMax: Math.floor(Number(bandCfg.maxLevel) || finalizedRequiredLevel),

    baseStats: {
      attack: Number(baseStats.attack) || 0,
      defense: Number(baseStats.defense) || 0
    },
    affixes: sanitizeAffixList(config.affixes),
    affixSlots: Number.isFinite(Number(config.affixSlots)) ? Math.max(0, Math.floor(Number(config.affixSlots))) : (Number(qualityMeta.affixPoolSize) || 0),
    enhanceLevel: Number.isFinite(config.enhanceLevel) ? config.enhanceLevel : 0,

    specialEffects: Array.isArray(config.specialEffects) ? config.specialEffects : [],
    extraStats: config.extraStats && typeof config.extraStats === "object" ? config.extraStats : {},

    valueProfile: {
      baseValue: Math.max(1, Math.floor(Number(config?.valueProfile?.baseValue) || 100)),
      valueMultiplier: Number(config?.valueProfile?.valueMultiplier) || Number(qualityMeta.economy?.baseValueMultiplier) || 1,
      sellMultiplier: Number(config?.valueProfile?.sellMultiplier) || Number(qualityMeta.economy?.sellMultiplier) || 0.22
    },

    tags: Array.isArray(config.tags) ? config.tags : [],
    reserved: {
      accessorySlot: config?.reserved?.accessorySlot || null,
      talismanSlot: config?.reserved?.talismanSlot || null,
      artifactPath: config?.reserved?.artifactPath || null,
      triggerHooks: Array.isArray(config?.reserved?.triggerHooks) ? config.reserved.triggerHooks : []
    },
    desc: config.desc || "",

    // 兼容旧逻辑（Phase 1 只做数据合同，不做数值/流程接入）
    attack: Number(baseStats.attack) || 0,
    defense: Number(baseStats.defense) || 0
  };
}

function ensureEquipRecordDefaults(name, equipRef) {
  if (!equipRef || typeof equipRef !== "object") return createEquipSchema({ name });
  const normalized = createEquipSchema({ ...equipRef, name, id: equipRef.id || toEquipId(name) });

  // 保留已有字段（避免破坏旧存档/旧逻辑潜在扩展）
  return { ...equipRef, ...normalized };
}

window.__JH_DATA__.equipData = {
  木剑: createEquipSchema({ quality: "common", color: "#9ca3af", slot: "weapon", levelBand: "L40", requiredLevel: 40, baseStats: { attack: 128, defense: 0 }, affixes: [{ key: "hit", name: "命中", value: 2 }], desc: "40级段入门兵器，攻击底子已按装备1.0重校。" }),
  铁剑: createEquipSchema({ quality: "common", color: "#9ca3af", slot: "weapon", levelBand: "L40", requiredLevel: 45, baseStats: { attack: 156, defense: 0 }, affixes: [{ key: "crit", name: "会心", value: 2 }], desc: "40级段上位基础剑，强调稳定输出。" }),
  青锋剑: createEquipSchema({ quality: "fine", color: "#22c55e", slot: "weapon", levelBand: "L50", requiredLevel: 50, baseStats: { attack: 196, defense: 0 }, affixes: [{ key: "crit", name: "会心", value: 4 }, { key: "speed", name: "迅步", value: 1 }], desc: "50级段武器，偏暴击与少量速度。" }),
  精铁剑: createEquipSchema({ quality: "fine", color: "#22c55e", slot: "weapon", levelBand: "L60", requiredLevel: 60, baseStats: { attack: 298, defense: 0 }, affixes: [{ key: "hit", name: "命中", value: 4 }, { key: "crit_dmg", name: "暴伤", value: 8 }], desc: "60级段武器，命中与暴伤方向更明显。" }),
  斩马刀: createEquipSchema({ quality: "rare", color: "#3b82f6", slot: "weapon", levelBand: "L70", requiredLevel: 70, baseStats: { attack: 418, defense: 0 }, affixes: [{ key: "break", name: "破甲", value: 9 }, { key: "weak_hit", name: "弱点伤害", value: 12 }], desc: "70级段重兵器，主打破甲与弱点追击。" }),
  寒铁剑: createEquipSchema({ quality: "rare", color: "#3b82f6", slot: "weapon", levelBand: "L80", requiredLevel: 80, baseStats: { attack: 560, defense: 0 }, affixes: [{ key: "crit", name: "会心", value: 7 }, { key: "crit_dmg", name: "暴伤", value: 16 }, { key: "speed", name: "迅步", value: 2 }], specialEffects: [{ key: "cold_hit", name: "寒气侵体", desc: "预留：后续可挂接减速或冻结效果" }], desc: "80级段武器，基础攻击已进入高档区间。" }),

  布衣: createEquipSchema({ quality: "common", color: "#9ca3af", slot: "armor", levelBand: "L40", requiredLevel: 40, baseStats: { attack: 0, defense: 74 }, extraStats: { hp: 120 }, affixes: [{ key: "dmgReduce", name: "护体", value: 1 }], desc: "40级段主防具，防御为主并附少量气血。" }),
  皮甲: createEquipSchema({ quality: "common", color: "#9ca3af", slot: "armor", levelBand: "L50", requiredLevel: 50, baseStats: { attack: 0, defense: 118 }, extraStats: { hp: 180 }, affixes: [{ key: "dmgReduce", name: "护体", value: 2 }], desc: "50级段主防具，防御与生存同步提升。" }),
  轻甲: createEquipSchema({ quality: "fine", color: "#22c55e", slot: "armor", levelBand: "L60", requiredLevel: 60, baseStats: { attack: 0, defense: 168 }, extraStats: { hp: 260 }, affixes: [{ key: "dmgReduce", name: "护体", value: 3 }], desc: "60级段主防具，偏硬度与气血。" }),
  锁子甲: createEquipSchema({ quality: "fine", color: "#22c55e", slot: "armor", levelBand: "L70", requiredLevel: 70, baseStats: { attack: 0, defense: 238 }, extraStats: { hp: 360 }, affixes: [{ key: "dmgReduce", name: "护体", value: 4 }], desc: "70级段主防具，进入高防守区。" }),
  黑铁甲: createEquipSchema({ quality: "rare", color: "#3b82f6", slot: "armor", levelBand: "L80", requiredLevel: 80, baseStats: { attack: 0, defense: 332 }, extraStats: { hp: 520 }, affixes: [{ key: "dmgReduce", name: "护体", value: 6 }], specialEffects: [{ key: "iron_skin", name: "铁壁", desc: "预留：后续可挂接受击减伤" }], desc: "80级段主防具，防御底子显著抬高。" }),

  草鞋: createEquipSchema({ quality: "common", color: "#9ca3af", slot: "shoes", levelBand: "L40", requiredLevel: 40, baseStats: { attack: 0, defense: 24 }, extraStats: { speed: 6, dodge: 3 }, desc: "40级段鞋子，主打身法与闪避。" }),
  快靴: createEquipSchema({ quality: "common", color: "#9ca3af", slot: "shoes", levelBand: "L50", requiredLevel: 50, baseStats: { attack: 0, defense: 38 }, extraStats: { speed: 8, dodge: 4 }, desc: "50级段鞋子，速度方向更明显。" }),
  黑靴: createEquipSchema({ quality: "fine", color: "#22c55e", slot: "shoes", levelBand: "L60", requiredLevel: 60, baseStats: { attack: 0, defense: 55 }, extraStats: { speed: 10, dodge: 5 }, affixes: [{ key: "speed", name: "迅步", value: 2 }], desc: "60级段鞋子，速度与闪避双方向。" }),
  鹿皮靴: createEquipSchema({ quality: "fine", color: "#22c55e", slot: "shoes", levelBand: "L70", requiredLevel: 70, baseStats: { attack: 0, defense: 82 }, extraStats: { speed: 12, dodge: 7, resist: 2 }, affixes: [{ key: "dodge", name: "闪避", value: 3 }], desc: "70级段鞋子，加入少量抗性。" }),
  追风靴: createEquipSchema({ quality: "rare", color: "#3b82f6", slot: "shoes", levelBand: "L80", requiredLevel: 80, baseStats: { attack: 0, defense: 116 }, extraStats: { speed: 15, dodge: 9, resist: 3 }, affixes: [{ key: "speed", name: "迅步", value: 4 }], specialEffects: [{ key: "wind_step", name: "踏风", desc: "预留：后续可挂接先手概率提升" }], desc: "80级段鞋子，速度向装备代表。" }),

  布帽: createEquipSchema({ quality: "common", slot: "hat", levelBand: "L40", requiredLevel: 40, baseStats: { attack: 0, defense: 58 }, extraStats: { hp: 120, resist: 2 }, desc: "40级段头盔，偏防御并附气血/抗性。" }),
  玄铁盔: createEquipSchema({ quality: "fine", slot: "hat", levelBand: "L60", requiredLevel: 60, baseStats: { attack: 0, defense: 126 }, extraStats: { hp: 220, resist: 4 }, desc: "60级段头盔，防御与抗性稳定提升。" }),

  麻布腰带: createEquipSchema({ quality: "common", slot: "belt", levelBand: "L40", requiredLevel: 40, baseStats: { attack: 0, defense: 38 }, extraStats: { hp: 200, mp: 60 }, desc: "40级段腰带，气血为主并保留内力上限方向。" }),
  铁扣腰带: createEquipSchema({ quality: "fine", slot: "belt", levelBand: "L60", requiredLevel: 60, baseStats: { attack: 0, defense: 88 }, extraStats: { hp: 320, mp: 120 }, desc: "60级段腰带，强化气血并小幅提高内力上限。" }),

  铜环项链: createEquipSchema({ quality: "fine", slot: "necklace", baseStats: { attack: 4, defense: 1 }, affixes: [{ key: "crit", name: "会心", value: 3 }, { key: "crit_dmg", name: "暴伤", value: 6 }], desc: "能提升攻击命中要害的机会" }),
  赤炎坠: createEquipSchema({ quality: "rare", slot: "necklace", baseStats: { attack: 8, defense: 1 }, affixes: [{ key: "crit", name: "会心", value: 5 }, { key: "weak_hit", name: "弱点伤害", value: 8 }], desc: "偏向爆发输出的坠饰" }),

  青木法印: createEquipSchema({ quality: "fine", slot: "artifact", baseStats: { attack: 3, defense: 4 }, extraStats: { resist: 3, trueDamage: 4 }, specialEffects: [{ key: "skill_boost", name: "技能强化", desc: "预留：技能系数提高" }], desc: "初阶法宝，提供均衡加持" }),
  镇岳法玺: createEquipSchema({ quality: "rare", slot: "artifact", baseStats: { attack: 6, defense: 8 }, extraStats: { resist: 6, trueDamage: 8 }, specialEffects: [{ key: "stagger", name: "震慑", desc: "预留：概率打断敌方动作" }], desc: "高阶法宝，偏向特殊效果" }),
  玄武盔: createEquipSchema({ quality: "rare", slot: "hat", levelBand: "L80", requiredLevel: 80, baseStats: { attack: 0, defense: 244 }, extraStats: { hp: 360, resist: 7 }, affixes: [{ key: "dmgReduce", name: "护体", value: 3 }], desc: "80级段头盔测试件，防御与抗性稳定。" }),
  龙纹腰带: createEquipSchema({ quality: "rare", slot: "belt", levelBand: "L80", requiredLevel: 80, baseStats: { attack: 0, defense: 195 }, extraStats: { hp: 420, mp: 180 }, desc: "80级段腰带测试件，气血主导并保留内力上限方向。" })
};

Object.keys(window.__JH_DATA__.equipData).forEach((equipName) => {
  const record = window.__JH_DATA__.equipData[equipName];
  window.__JH_DATA__.equipData[equipName] = ensureEquipRecordDefaults(equipName, record);
});
