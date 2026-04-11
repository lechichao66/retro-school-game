// ==========================================
// 少年江湖 - 稳定三文件版 数据中心 (data.js)
// 只放静态数据，不放流程逻辑
// ==========================================


// ===== 1. 在线名单 =====
const onlinePlayers = [
  { name: "秋风", sect: "唐门", state: "闲逛" },
  { name: "玉笛", sect: "唐门", state: "闭关" },
  { name: "小星", sect: "游侠", state: "打工" },
  { name: "断水", sect: "武当", state: "练功" },
  { name: "寒衣", sect: "丐帮", state: "闲聊" },
  { name: "孤城", sect: "幽月宫", state: "出海" },
  { name: "听雪", sect: "世外桃源", state: "休息" },
  { name: "青禾", sect: "无门派", state: "摆摊" },
  { name: "流萤", sect: "纯阳", state: "闯荡" },
  { name: "长歌", sect: "天网", state: "泡点" }
];


// ===== 2. 装备数据 =====
const equipData = {
  // 武器
  木剑: { slot: "weapon", attack: 5, defense: 0, desc: "初学者常用兵器" },
  铁剑: { slot: "weapon", attack: 10, defense: 0, desc: "较为结实的基础兵器" },
  青锋剑: { slot: "weapon", attack: 18, defense: 0, desc: "略有锋芒，适合中前期使用" },
  精铁剑: { slot: "weapon", attack: 28, defense: 0, desc: "精铁打造，锋利坚固" },
  斩马刀: { slot: "weapon", attack: 38, defense: 0, desc: "厚重霸道，适合硬拼" },
  寒铁剑: { slot: "weapon", attack: 50, defense: 2, desc: "寒铁铸成，剑气森然" },

  // 衣服
  布衣: { slot: "armor", attack: 0, defense: 4, desc: "普通衣物，略微防身" },
  皮甲: { slot: "armor", attack: 0, defense: 8, desc: "简单护身皮甲" },
  轻甲: { slot: "armor", attack: 0, defense: 14, desc: "防护更强的基础护甲" },
  锁子甲: { slot: "armor", attack: 0, defense: 22, desc: "铁环相扣，防御不俗" },
  黑铁甲: { slot: "armor", attack: 0, defense: 30, desc: "厚重结实，极具压迫感" },

  // 鞋子
  草鞋: { slot: "shoes", attack: 0, defense: 2, desc: "行走江湖的基础鞋履" },
  快靴: { slot: "shoes", attack: 2, defense: 3, desc: "更轻便一些的靴子" },
  黑靴: { slot: "shoes", attack: 3, defense: 5, desc: "较为扎实的江湖靴子" },
  鹿皮靴: { slot: "shoes", attack: 4, defense: 7, desc: "轻巧耐磨，行动更稳" },
  追风靴: { slot: "shoes", attack: 6, defense: 8, desc: "步伐轻灵，适合闯荡" }
};


// ===== 3. 商城数据 =====
const shopItems = [
  // 消耗品
  { name: "小还丹", desc: "恢复气血20、内力10", price: 10, type: "item" },
  { name: "大还丹", desc: "恢复气血50、内力25", price: 28, type: "item" },
  { name: "干粮", desc: "闯荡途中果腹所用，恢复少量气血", price: 3, type: "item" },
  { name: "清水", desc: "普通饮水，恢复少量内力", price: 2, type: "item" },

  // 武器
  { name: "木剑", desc: "初学者常用兵器", price: 20, type: "equip" },
  { name: "铁剑", desc: "较为结实的基础兵器", price: 45, type: "equip" },
  { name: "青锋剑", desc: "略有锋芒，适合中前期使用", price: 90, type: "equip" },
  { name: "精铁剑", desc: "精铁打造，锋利坚固", price: 180, type: "equip" },

  // 护甲
  { name: "布衣", desc: "普通衣物，略微防身", price: 15, type: "equip" },
  { name: "皮甲", desc: "简单护身皮甲", price: 38, type: "equip" },
  { name: "轻甲", desc: "防护更强的基础护甲", price: 80, type: "equip" },

  // 鞋子
  { name: "草鞋", desc: "行走江湖的基础鞋履", price: 8, type: "equip" },
  { name: "快靴", desc: "更轻便一些的靴子", price: 28, type: "equip" },
  { name: "黑靴", desc: "较为扎实的江湖靴子", price: 60, type: "equip" }
];


// ===== 4. 寄售行假数据 =====
const marketItems = [
  { name: "矿石", qty: 268, price: 2, seller: "断水" },
  { name: "木头", qty: 522, price: 1, seller: "青禾" },
  { name: "冰水", qty: 184, price: 2, seller: "听雪" },
  { name: "小鱼", qty: 99, price: 3, seller: "秋风" },
  { name: "大黄鱼", qty: 16, price: 18, seller: "孤城" },
  { name: "生姜", qty: 35, price: 6, seller: "寒衣" },
  { name: "甘草", qty: 24, price: 8, seller: "玉笛" },
  { name: "止血草", qty: 42, price: 5, seller: "长歌" }
];


// ===== 5. 门派数据 =====
const sectList = [
  { name: "少林", req: "无", intro: "气血见长，适合稳健路线。" },
  { name: "武当", req: "无", intro: "内力深厚，练功收益稍强。" },
  { name: "唐门", req: "无", intro: "行事灵巧，擅长诡奇变化。" },
  { name: "丐帮", req: "无", intro: "四海为家，打工收益略高。" },
  { name: "幽月宫", req: "5级", intro: "偏阴柔路线，适合高闪避幻想玩法。" },
  { name: "纯阳", req: "8级", intro: "攻守兼备，适合中后期成长。" }
];


// ===== 6. 职业数据 =====
const jobList = [
  { name: "采冰", intro: "前往寒地采集冰水，是配药材料之一。", gain: "冰水" },
  { name: "采矿", intro: "在矿洞挖取矿石，可用于打造与交易。", gain: "矿石" },
  { name: "伐木", intro: "砍伐木材，获得木头，适合前期积累。", gain: "木头" },
  { name: "占卜", intro: "窥探运势，可能得福，也可能倒霉。", gain: "随机效果" },
  { name: "渔夫", intro: "出海捕鱼摸宝，收益浮动较大。", gain: "小鱼 / 大黄鱼 / 银两" }
];


// ===== 7. 怪物数据 =====
const monsterList = [
  // --- 新手村 Lv1-3 ---
  { name: "野兔", hp: 20, atk: 3, money: 2, exp: 5, power: 150, type: "normal" },
  { name: "野鸡", hp: 25, atk: 4, money: 2, exp: 6, power: 180, type: "normal" },
  { name: "野狗", hp: 45, atk: 8, money: 5, exp: 12, power: 450, type: "normal" },
  { name: "流氓", hp: 70, atk: 15, money: 15, exp: 20, power: 800, type: "normal" },
  { name: "强盗领役", hp: 150, atk: 25, money: 50, exp: 60, power: 1500, type: "elite" },
  { name: "村口恶霸·王五", hp: 400, atk: 45, money: 150, exp: 150, power: 3200, type: "boss" },

  // --- 后山密林 Lv3-8 ---
  { name: "山贼小弟", hp: 160, atk: 25, money: 35, exp: 45, power: 1600, type: "normal" },
  { name: "山贼打手", hp: 220, atk: 35, money: 50, exp: 65, power: 2200, type: "normal" },
  { name: "毒蛇", hp: 120, atk: 50, money: 25, exp: 70, power: 2500, type: "normal" },
  { name: "黑熊", hp: 500, atk: 45, money: 120, exp: 150, power: 3800, type: "normal" },
  { name: "黑豹", hp: 350, atk: 70, money: 150, exp: 200, power: 4500, type: "elite" },
  { name: "鳄鱼", hp: 600, atk: 55, money: 180, exp: 220, power: 4800, type: "elite" },
  { name: "山贼精英", hp: 550, atk: 80, money: 200, exp: 280, power: 5500, type: "elite" },
  { name: "山贼三当家", hp: 1200, atk: 95, money: 500, exp: 600, power: 8500, type: "boss" },
  { name: "山贼二当家", hp: 1800, atk: 120, money: 800, exp: 1000, power: 12000, type: "boss" },
  { name: "大当家·座山雕", hp: 3000, atk: 160, money: 2000, exp: 2500, power: 18000, type: "boss" },

  // --- 百兽谷 Lv8+ ---
  { name: "狂暴山魈", hp: 800, atk: 110, money: 350, exp: 400, power: 9000, type: "normal" },
  { name: "深谷巨蟒", hp: 1500, atk: 90, money: 550, exp: 650, power: 11000, type: "normal" },
  { name: "白额大虫", hp: 1200, atk: 140, money: 600, exp: 800, power: 13500, type: "elite" },
  { name: "兽王·狴犴姿", hp: 5000, atk: 240, money: 5000, exp: 8000, power: 35000, type: "boss" }
];


// ===== 8. 地图数据 =====
const mapData = {
  "新手村": {
    minLevel: 1,
    monsters: ["野兔", "野鸡", "野狗", "流氓"],
    elites: ["强盗领役"],
    boss: ["村口恶霸·王五"],
    desc: "看似平静的村落，边缘地带常有禽兽和流寇出没。"
  },
  "后山密林": {
    minLevel: 3,
    monsters: ["山贼小弟", "山贼打手", "毒蛇", "黑熊"],
    elites: ["山贼精英", "黑豹", "鳄鱼"],
    boss: ["山贼三当家", "山贼二当家", "大当家·座山雕"],
    desc: "古木参天，深处不仅有嗜血猛兽，更有占山为王的悍匪。"
  },
  "百兽谷": {
    minLevel: 8,
    monsters: ["狂暴山魈", "深谷巨蟒"],
    elites: ["白额大虫"],
    boss: ["兽王·狴犴姿"],
    desc: "生人禁地，这里的野兽已开启灵智，战力惊人。"
  }
};


// ===== 9. 掉落表 =====
const dropTable = {
  野狗: [
    { name: "生姜", chance: 0.35, desc: "辛温发散，可解表散寒。" },
    { name: "碎银子", chance: 0.3, desc: "江湖通用的碎银。" }
  ],
  流氓: [
    { name: "甘草", chance: 0.25, desc: "补脾益气，清热解毒。" },
    { name: "止血草", chance: 0.35, desc: "外敷止血的草药。" }
  ],
  山贼打手: [
    { name: "精铁", chance: 0.3, desc: "打造兵器的材料。" },
    { name: "皮毛", chance: 0.2, desc: "可用于制作护具。" }
  ],
  黑熊: [
    { name: "熊胆", chance: 0.15, desc: "珍贵药材，可用于高级药方。" },
    { name: "皮毛", chance: 0.4, desc: "可用于制作护具。" }
  ],
  鳄鱼: [
    { name: "鳄皮", chance: 0.25, desc: "坚韧皮料，可制作高级护甲。" }
  ],
  山贼三当家: [
    { name: "山贼令牌", chance: 0.2, desc: "证明其身份的令牌。" },
    { name: "伤寒论残页", chance: 0.08, desc: "记载古方秘闻的残页。" }
  ]
};


// ===== 10. 伤势类型 =====
const injuryTypes = [
  { name: "气滞血瘀", desc: "胸口沉闷，运气不畅。", mpLoss: 5 },
  { name: "外感风寒", desc: "身体发冷，反应迟钝。", atkLoss: 3 },
  { name: "经络受损", desc: "手脚酸软，劲力难施。", powerLoss: 0.1 }
];


// ===== 11. 药方 / 配方 =====
const recipes = [
  {
    name: "生姜甘草汤",
    materials: { "生姜": 1, "甘草": 1 },
    effect: "温中散寒，调和营卫。恢复 40 点气血。",
    action: () => {
      player.hp += 40;
      addLog("success", "你熬制并服用了【生姜甘草汤】，感到一股暖流涌向丹田，气血大增！");
    }
  },
  {
    name: "止血散",
    materials: { "止血草": 2 },
    effect: "快速止血。恢复 25 点气血。",
    action: () => {
      player.hp += 25;
      addLog("success", "你敷用了【止血散】，伤口逐渐稳定，气血有所恢复。");
    }
  }
];


// ===== 12. 物品说明 =====
const itemData = {
  生姜: { detail: "【药性】辛，温。归肺、脾、胃经。散寒解表。" },
  甘草: { detail: "【药性】甘，平。归心、肺、脾、胃经。补脾益气，调和诸药。" },
  止血草: { detail: "【药材】性平，常用于外伤止血。" },
  冰水: { detail: "【材料】寒地采集的清水，可用于配制凉性药剂。" },
  矿石: { detail: "【材料】打造兵器的重要原料。" },
  木头: { detail: "【材料】可用于打造、交易或制作工具。" },
  小鱼: { detail: "【食材】可出售换钱，也可后续扩展为烹饪材料。" },
  大黄鱼: { detail: "【食材】较值钱的鱼类资源。" },
  精铁: { detail: "【材料】打造中级兵器的基础材料。" },
  皮毛: { detail: "【材料】可制作护具或出售。" },
  熊胆: { detail: "【珍贵药材】可用于高级药方。" },
  鳄皮: { detail: "【高级材料】可用于打造优质护甲。" },
  碎银子: { detail: "【财物】散落的银两，可在商城购买物资。" },
  山贼令牌: { detail: "【信物】某些任务可能会用到。" },
  "伤寒论残页": { detail: "【残卷】记录古方秘闻，后续可扩展任务或高级配方。" },
  小还丹: { detail: "【丹药】恢复气血20、内力10。" },
  大还丹: { detail: "【丹药】恢复气血50、内力25。" },
  干粮: { detail: "【消耗品】恢复少量气血，行走江湖必备。" }
};