window.__JH_DATA__ = window.__JH_DATA__ || {};

window.__JH_DATA__.treasureMapTemplates = [
  {
    id: "map_newbie_hill",
    name: "残旧宝图·后山",
    area: "后山密林",
    staminaCost: 12,
    encounterRate: 0.4,
    rewards: [
      { type: "money", value: 90 },
      { type: "item", name: "精铁", value: 1 },
      { type: "item", name: "小还丹", value: 1 }
    ]
  }
];

window.__JH_DATA__.dungeonTemplates = [
  {
    id: "dungeon_lv10_money",
    name: "黑风寨外营（10级金钱本）",
    type: "金钱副本",
    minLevel: 10,
    recommendedPower: 900,
    staminaCost: 16,
    waves: ["山贼小弟 x3", "山贼打手 x2", "精英：山贼精英", "BOSS：村口恶霸·王五"],
    boss: "村口恶霸·王五",
    reward: { money: 650, exp: 520, items: [{ name: "山贼令牌", count: 1 }] }
  },
  {
    id: "dungeon_lv20_exp",
    name: "断桥追魂道（20级经验本）",
    type: "经验副本",
    minLevel: 20,
    recommendedPower: 1600,
    staminaCost: 20,
    waves: ["悍匪斥候 x3", "血衣弓手 x2", "精英：断桥刀卫", "BOSS：山贼三当家"],
    boss: "山贼三当家",
    reward: { money: 980, exp: 3200, items: [{ name: "精铁", count: 2 }] }
  },
  {
    id: "dungeon_lv30_drop",
    name: "百兽谷祭坛（30级掉宝本）",
    type: "掉宝副本",
    minLevel: 30,
    recommendedPower: 2800,
    staminaCost: 24,
    waves: ["狂暴山魈 x2", "深谷巨蟒 x2", "精英：白额大虫", "BOSS：兽王·狴犴姿"],
    boss: "兽王·狴犴姿",
    reward: { money: 2400, exp: 8600, items: [{ name: "熊胆", count: 2 }, { name: "鳄皮", count: 1 }] }
  },
  {
    id: "dungeon_lv40_mixed",
    name: "幽冥地宫（40级综合本）",
    type: "综合高难副本",
    minLevel: 40,
    recommendedPower: 5200,
    staminaCost: 28,
    waves: ["地宫守尸 x3", "阴火傀儡 + 幽魂剑客", "精英：玄甲鬼将 + 噬魂祭司", "BOSS：地宫之主·夜枭"],
    boss: "地宫之主·夜枭",
    reward: { money: 6200, exp: 18600, items: [{ name: "伤寒论残页", count: 1 }, { name: "大还丹", count: 2 }] }
  }
];

window.__JH_DATA__.assistantProfessions = [
  { name: "炼药", chain: "采药 → 炼药", intro: "消耗活力炼制丹药，依赖草药采集链。" },
  { name: "打造", chain: "采矿 → 打造", intro: "消耗活力锻造装备素材，依赖矿石产出。" },
  { name: "裁缝", chain: "材料采集 → 裁缝", intro: "处理皮毛与布料，制作护具类材料。" },
  { name: "厨师", chain: "捕鱼/食材 → 烹饪", intro: "加工食材为恢复类食物，偏向续航。" }
];

window.__JH_DATA__.encyclopediaSections = {
  attrs: ["气血：角色生存能力，降为0则战败。", "内力：部分技能和职业动作消耗。", "体力：探索/副本/宝图等行动资源。", "活力：辅助职业与生活系统核心资源。"],
  affix: ["有词缀时显示完整词缀，如‘会心+2，破甲+1’。", "无词缀时统一显示‘无词缀’。", "有额外属性显示具体属性，无则显示‘无’。"],
  sect: ["门派贡献来源：师门任务、门派挂机、活动。", "门派贡献用途：高阶武学解锁、称号/秘技/兑换。"],
  martial: ["功法：主攻击/内力/气血增幅", "武功：主动输出技能", "身法：主闪避/速度/暴击/先手", "炼体：主防御/承伤/抗性", "秘技：特殊被动/触发效果"],
  effects: ["寒气侵体：降低敌方速度。", "铁壁护体：受击时减伤。", "踏风身法：提高先手与闪避。", "震慑压制：概率打断敌方动作。"],
  dungeonTreasure: ["宝图闭环：执行一轮打图(10次)→结算可能获得宝图/银两/物资/事件→再对已有宝图执行使用/挖图。", "副本具备多波怪、精英/BOSS、高奖励与独立副本日志。"],
  assistant: ["炼药", "打造", "裁缝", "厨师"]
};
