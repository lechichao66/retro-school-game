window.__JH_DATA__ = window.__JH_DATA__ || {};
window.__JH_DATA__.injuryTypes = [
  { name: "气滞血瘀", desc: "胸口沉闷，运气不畅。", mpLoss: 5 },
  { name: "外感风寒", desc: "身体发冷，反应迟钝。", atkLoss: 3 },
  { name: "经络受损", desc: "手脚酸软，劲力难施。", powerLoss: 0.1 }
];

window.__JH_DATA__.itemData = {
  生姜: { detail: "【药性】辛，温。归肺、脾、胃经。散寒解表。", basePrice: 4 },
  甘草: { detail: "【药性】甘，平。归心、肺、脾、胃经。补脾益气，调和诸药。", basePrice: 5 },
  止血草: { detail: "【药材】性平，常用于外伤止血。", basePrice: 6 },
  冰水: { detail: "【材料】寒地采集的清水，可用于配制凉性药剂。", basePrice: 2 },
  矿石: { detail: "【材料】打造兵器的重要原料。", basePrice: 4 },
  木头: { detail: "【材料】可用于打造、交易或制作工具。", basePrice: 2 },
  小鱼: { detail: "【食材】可出售换钱，也可后续扩展为烹饪材料。", basePrice: 5 },
  大黄鱼: { detail: "【食材】较值钱的鱼类资源。", basePrice: 18 },
  精铁: { detail: "【材料】打造中级兵器的基础材料。", basePrice: 12 },
  皮毛: { detail: "【材料】可制作护具或出售。", basePrice: 8 },
  熊胆: { detail: "【珍贵药材】可用于高级药方。", basePrice: 24 },
  鳄皮: { detail: "【高级材料】可用于打造优质护甲。", basePrice: 22 },
  碎银子: { detail: "【财物】散落的银两，可在商城购买物资。", sellPrice: 4 },
  山贼令牌: { detail: "【信物】某些任务可能会用到。", basePrice: 20 },
  "伤寒论残页": { detail: "【残卷】记录古方秘闻，后续可扩展任务或高级配方。", basePrice: 30 },
  追风靴: { detail: "【装备】轻灵靴子，适合高速流派。" },
  黑铁甲: { detail: "【装备】厚重甲胄，防御突出。" },
  寒铁剑: { detail: "【装备】寒气逼人的利剑，攻守兼备。" },
  小还丹: { detail: "【丹药】恢复气血20、内力10。", basePrice: 10 },
  大还丹: { detail: "【丹药】恢复气血50、内力25。", basePrice: 28 },
  干粮: { detail: "【消耗品】恢复少量气血，行走江湖必备。", basePrice: 3 },
  清水: { detail: "【消耗品】恢复少量内力，行走江湖常备。", basePrice: 2 }
};

window.__JH_DATA__.inventorySaleConfig = {
  defaultSellRate: 0.45,
  sellRateByType: {
    装备: 0.5,
    消耗品: 0.45,
    材料: 0.5,
    "任务物品": 0.2,
    "宝图/凭证": 0.1
  },
  quickSell: {
    junkTypes: ["材料"],
    lowEquipQualityKeys: ["common", "fine"],
    protectedItems: ["山贼令牌", "伤寒论残页"]
  }
};
