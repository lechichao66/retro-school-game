window.__JH_DATA__ = window.__JH_DATA__ || {};

function getEquipQualityColor(quality, fallback) {
  const cfg = window.__JH_DATA__?.equipQualityConfig || {};
  return cfg[quality]?.color || fallback || "#9ca3af";
}

function createEquipSchema(config) {
  const baseStats = config.baseStats || {};
  return {
    quality: config.quality || "common",
    color: getEquipQualityColor(config.quality || "common", config.color),
    slot: config.slot || "weapon",
    baseStats: {
      attack: baseStats.attack || 0,
      defense: baseStats.defense || 0
    },
    affixes: Array.isArray(config.affixes) ? config.affixes : [],
    enhanceLevel: Number.isFinite(config.enhanceLevel) ? config.enhanceLevel : 0,
    specialEffects: Array.isArray(config.specialEffects) ? config.specialEffects : [],
    extraStats: config.extraStats && typeof config.extraStats === "object" ? config.extraStats : {},
    desc: config.desc || "",

    // 兼容旧逻辑（Phase 2.1A 仅做结构层，暂不做完整数值重算）
    attack: baseStats.attack || 0,
    defense: baseStats.defense || 0
  };
}

window.__JH_DATA__.equipData = {
  木剑: createEquipSchema({ quality: "common", color: "#9ca3af", slot: "weapon", baseStats: { attack: 5, defense: 0 }, desc: "初学者常用兵器" }),
  铁剑: createEquipSchema({ quality: "common", color: "#9ca3af", slot: "weapon", baseStats: { attack: 10, defense: 0 }, desc: "较为结实的基础兵器" }),
  青锋剑: createEquipSchema({ quality: "fine", color: "#22c55e", slot: "weapon", baseStats: { attack: 18, defense: 0 }, affixes: [{ key: "crit", name: "会心", value: 2 }], desc: "略有锋芒，适合中前期使用" }),
  精铁剑: createEquipSchema({ quality: "fine", color: "#22c55e", slot: "weapon", baseStats: { attack: 28, defense: 0 }, affixes: [{ key: "atk_pct", name: "强攻", value: 3 }], desc: "精铁打造，锋利坚固" }),
  斩马刀: createEquipSchema({ quality: "rare", color: "#3b82f6", slot: "weapon", baseStats: { attack: 38, defense: 0 }, affixes: [{ key: "break", name: "破甲", value: 4 }], desc: "厚重霸道，适合硬拼" }),
  寒铁剑: createEquipSchema({ quality: "rare", color: "#3b82f6", slot: "weapon", baseStats: { attack: 50, defense: 2 }, affixes: [{ key: "ice_edge", name: "寒锋", value: 5 }], specialEffects: [{ key: "cold_hit", name: "寒气侵体", desc: "预留：后续可挂接减速或冻结效果" }], desc: "寒铁铸成，剑气森然" }),

  布衣: createEquipSchema({ quality: "common", color: "#9ca3af", slot: "armor", baseStats: { attack: 0, defense: 4 }, extraStats: { hp: 20, dmgReduce: 1 }, desc: "普通衣物，略微防身" }),
  皮甲: createEquipSchema({ quality: "common", color: "#9ca3af", slot: "armor", baseStats: { attack: 0, defense: 8 }, desc: "简单护身皮甲" }),
  轻甲: createEquipSchema({ quality: "fine", color: "#22c55e", slot: "armor", baseStats: { attack: 0, defense: 14 }, affixes: [{ key: "hp_flat", name: "养气", value: 25 }], desc: "防护更强的基础护甲" }),
  锁子甲: createEquipSchema({ quality: "fine", color: "#22c55e", slot: "armor", baseStats: { attack: 0, defense: 22 }, affixes: [{ key: "def_pct", name: "固守", value: 3 }], desc: "铁环相扣，防御不俗" }),
  黑铁甲: createEquipSchema({ quality: "rare", color: "#3b82f6", slot: "armor", baseStats: { attack: 0, defense: 30 }, extraStats: { hp: 80, dmgReduce: 4 }, affixes: [{ key: "thorns", name: "反震", value: 3 }], specialEffects: [{ key: "iron_skin", name: "铁壁", desc: "预留：后续可挂接受击减伤" }], desc: "厚重结实，极具压迫感" }),

  草鞋: createEquipSchema({ quality: "common", color: "#9ca3af", slot: "shoes", baseStats: { attack: 0, defense: 2 }, desc: "行走江湖的基础鞋履" }),
  快靴: createEquipSchema({ quality: "common", color: "#9ca3af", slot: "shoes", baseStats: { attack: 2, defense: 3 }, desc: "更轻便一些的靴子" }),
  黑靴: createEquipSchema({ quality: "fine", color: "#22c55e", slot: "shoes", baseStats: { attack: 3, defense: 5 }, affixes: [{ key: "speed", name: "迅步", value: 2 }], desc: "较为扎实的江湖靴子" }),
  鹿皮靴: createEquipSchema({ quality: "fine", color: "#22c55e", slot: "shoes", baseStats: { attack: 4, defense: 7 }, affixes: [{ key: "dodge", name: "闪避", value: 2 }], desc: "轻巧耐磨，行动更稳" }),
  追风靴: createEquipSchema({ quality: "rare", color: "#3b82f6", slot: "shoes", baseStats: { attack: 6, defense: 8 }, affixes: [{ key: "speed", name: "迅步", value: 4 }], specialEffects: [{ key: "wind_step", name: "踏风", desc: "预留：后续可挂接先手概率提升" }], desc: "步伐轻灵，适合闯荡" })
  ,
  布帽: createEquipSchema({ quality: "common", slot: "hat", baseStats: { attack: 0, defense: 3 }, extraStats: { hp: 18, resist: 1 }, desc: "轻便帽子，略增抗性" }),
  玄铁盔: createEquipSchema({ quality: "fine", slot: "hat", baseStats: { attack: 0, defense: 6 }, extraStats: { hp: 40, resist: 2 }, desc: "带来更好的头部防护" }),

  麻布腰带: createEquipSchema({ quality: "common", slot: "belt", baseStats: { attack: 0, defense: 2 }, extraStats: { hp: 15, mp: 10 }, desc: "基础护腰，便于蓄力" }),
  铁扣腰带: createEquipSchema({ quality: "fine", slot: "belt", baseStats: { attack: 1, defense: 5 }, extraStats: { hp: 35, mp: 25 }, desc: "稳固腰腹，内力更顺" }),

  铜环项链: createEquipSchema({ quality: "fine", slot: "necklace", baseStats: { attack: 4, defense: 1 }, affixes: [{ key: "crit", name: "会心", value: 3 }, { key: "crit_dmg", name: "暴伤", value: 6 }], desc: "能提升攻击命中要害的机会" }),
  赤炎坠: createEquipSchema({ quality: "rare", slot: "necklace", baseStats: { attack: 8, defense: 1 }, affixes: [{ key: "crit", name: "会心", value: 5 }, { key: "weak_hit", name: "弱点伤害", value: 8 }], desc: "偏向爆发输出的坠饰" }),

  青木法印: createEquipSchema({ quality: "fine", slot: "artifact", baseStats: { attack: 3, defense: 4 }, extraStats: { resist: 3, trueDamage: 4 }, specialEffects: [{ key: "skill_boost", name: "技能强化", desc: "预留：技能系数提高" }], desc: "初阶法宝，提供均衡加持" }),
  镇岳法玺: createEquipSchema({ quality: "rare", slot: "artifact", baseStats: { attack: 6, defense: 8 }, extraStats: { resist: 6, trueDamage: 8 }, specialEffects: [{ key: "stagger", name: "震慑", desc: "预留：概率打断敌方动作" }], desc: "高阶法宝，偏向特殊效果" }),
  玄武盔: createEquipSchema({ quality: "rare", slot: "hat", baseStats: { attack: 1, defense: 10 }, extraStats: { hp: 55, resist: 4, dmgReduce: 2 }, desc: "标准测试头盔，防御表现稳定。" }),
  龙纹腰带: createEquipSchema({ quality: "rare", slot: "belt", baseStats: { attack: 2, defense: 8 }, extraStats: { hp: 50, mp: 35, trueDamage: 4 }, desc: "标准测试腰带，攻防属性均衡。" })
};
