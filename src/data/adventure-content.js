window.__JH_DATA__ = window.__JH_DATA__ || {};

window.__JH_DATA__.treasureMapTemplates = [
  {
    id: "map_newbie_hill",
    name: "残旧宝图·后山",
    area: "后山密林",
    staminaCost: 12,
    encounterRate: 0.4,
    rewards: [
      { type: "money", value: 45 },
      { type: "item", name: "精铁", value: 1 },
      { type: "item", name: "小还丹", value: 1 }
    ]
  }
];

window.__JH_DATA__.dungeonTemplates = [
  {
    id: "dungeon_bandit_camp",
    name: "山贼营地",
    minLevel: 12,
    recommendedPower: 850,
    staminaCost: 16,
    reward: { money: 180, exp: 140, items: [{ name: "精铁", count: 2 }, { name: "山贼令牌", count: 1 }] }
  },
  {
    id: "dungeon_beast_den",
    name: "兽窟深处",
    minLevel: 20,
    recommendedPower: 1500,
    staminaCost: 20,
    reward: { money: 320, exp: 260, items: [{ name: "熊胆", count: 1 }, { name: "鳄皮", count: 1 }] }
  }
];

window.__JH_DATA__.assistantProfessions = [
  { name: "炼药", chain: "采药 → 炼药", intro: "消耗活力炼制丹药，依赖草药采集链。" },
  { name: "打造", chain: "采矿 → 打造", intro: "消耗体力锻造装备素材，依赖矿石产出。" },
  { name: "裁缝", chain: "材料采集 → 裁缝", intro: "处理皮毛与布料，制作护具类材料。" },
  { name: "厨师", chain: "捕鱼/食材 → 烹饪", intro: "加工食材为恢复类食物，偏向续航。" }
];

window.__JH_DATA__.encyclopediaSections = {
  attrs: [
    "气血：角色生存能力，降为0则战败。",
    "内力：部分技能和职业动作消耗。",
    "体力：探索/打工/副本等行动资源。",
    "活力：职业与研习等生活向行动资源。"
  ],
  affix: [
    "词缀简写用于列表展示，如“会+2”。",
    "词缀全称用于详情展示，如“会心+2”。",
    "特殊效果统一用“效果名（说明）”展示。"
  ],
  sect: [
    "门派贡献可用于武学学习门槛减免、称号兑换、秘技解锁。",
    "10级前主用基础技能，10级后逐步转为门派武学。"
  ],
  martial: ["功法", "武功", "身法", "炼体", "秘技"],
  effects: ["寒气侵体", "铁壁护体", "踏风身法", "武学精进", "震慑压制"],
  assistant: ["炼药", "打造", "裁缝", "厨师"]
};
