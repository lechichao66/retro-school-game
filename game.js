// ==========================================
// 少年江湖 - 四文件版主逻辑 (game.js)
// 说明：本文件保留全部非战斗功能
// 战斗相关逻辑已拆到 battle.js
// ==========================================


// ===== 1. 玩家与全局状态 =====

var logs = [
  { type: "sys", text: "欢迎进入少年江湖。这里是单机怀旧版江湖大厅。", time: getNowTime() }
];

var uiNotice = {
  type: "sys",
  text: "欢迎来到少年江湖。"
};

var currentView = "hall";


// ===== 2. 顶部栏与基础 UI（委托 src/app/ui-render.js） =====
function updateTopBar() { return window.__JH_UI_RENDER__.updateTopBar(); }
function updateOnlineList() { return window.__JH_UI_RENDER__.updateOnlineList(); }
function updateAll() { return window.__JH_UI_RENDER__.updateAll(); }
function setMainTitle(text) { return window.__JH_UI_RENDER__.setMainTitle(text); }
function setMainContent(html) { return window.__JH_UI_RENDER__.setMainContent(html); }
function renderHallLog() { return window.__JH_UI_RENDER__.renderHallLog(); }
function refreshCurrentView() { return window.__JH_UI_RENDER__.refreshCurrentView(); }


// ===== 3. 页面函数（委托 src/app/ui-render.js） =====
function showHall() { return window.__JH_UI_RENDER__.showHall(); }
function showStatus() { return window.__JH_UI_RENDER__.showStatus(); }
function showBag() { return window.__JH_UI_RENDER__.showBag(); }
function showEquip() { return window.__JH_UI_RENDER__.showEquip(); }
function showShop() { return window.__JH_UI_RENDER__.showShop(); }
function showMarket() { return window.__JH_UI_RENDER__.showMarket(); }
function showSect() { return window.__JH_UI_RENDER__.showSect(); }
function showRank() { return window.__JH_UI_RENDER__.showRank(); }
function showJob() { return window.__JH_UI_RENDER__.showJob(); }
function showPharmacy() { return window.__JH_UI_RENDER__.showPharmacy(); }
function showTrain() { return window.__JH_UI_RENDER__.showTrain(); }
function doCultivationUpgrade(type) { return window.__JH_UI_RENDER__.doCultivationUpgrade(type); }


// ===== 4. 行为函数 =====
function fakeChat() {
  const texts = [
    `【闲聊】${player.name}：初入江湖，请多关照。`,
    `【闲聊】${player.name}：有人一起闯荡吗？`,
    `【闲聊】${player.name}：后山密林最近不太平啊。`,
    `【闲聊】${player.name}：谁知道哪里容易赚银两？`
  ];
  addLog("chat", randomPick(texts));
  setNotice("success", "你发送了一条闲聊。");
  refreshCurrentView();
}

function bubblePoint() {
  recoverHp(10);
  addLog("sys", "你在武林广场站了一会儿，感觉神清气爽。气血恢复 +10。");
  setNotice("success", "泡点成功：气血 +10。");
  updateAll();
  refreshCurrentView();
}

function train() {
  showTrain();
}

function work() {
  if (player.hp < 15) {
    addLog("error", "你体力透支，已经干不动活了。");
    setNotice("error", "体力不足，无法打工。");
    refreshCurrentView();
    return;
  }

  let income = 15;
  if (player.sect === "丐帮") income += 5;

  loseHp(10);
  player.money += income;
  gainExp(10);

  addLog("event", `你辛苦劳作了一阵，银两 +${income}，经验 +10。`);
  setNotice("success", `打工成功：银两 +${income}，经验 +10。`);
  updateAll();
  refreshCurrentView();
}

function luck() {
  const roll = Math.random();

  if (roll < 0.3) {
    player.money += 20;
    addLog("sys", "你运气爆棚，在路边捡到了 20 两银子！");
    setNotice("success", "运气不错：银两 +20。");
  } else if (roll < 0.6) {
    loseHp(10);
    addLog("sys", "你走路不小心掉进坑里，气血 -10。");
    setNotice("error", "运气不佳：气血 -10。");
  } else {
    gainExp(15);
    addLog("sys", "你灵光一闪，悟出了一些道理。经验 +15。");
    setNotice("success", "运气不错：经验 +15。");
  }

  updateAll();
  showHall();
}

function rest() {
  recoverHp(40);
  recoverMp(30);
  addLog("event", "客栈修整完毕，气血与内力都有恢复。");
  setNotice("success", "休息成功：状态恢复。");
  updateAll();
  refreshCurrentView();
}


// ===== 5. 地图与遭遇入口（战斗交给 battle.js） =====
function changeMap(mapName) {
  const map = mapData[mapName];
  if (!map) return;

  if (player.level < map.minLevel) {
    addLog("error", `【等级不足】${mapName} 需要等级达到 ${map.minLevel} 级！`);
    setNotice("error", `需 ${map.minLevel} 级方可进入`);
    refreshCurrentView();
    return;
  }

  player.location = mapName;
  addLog("sys", `【旅行】你跋涉数里，来到了：${mapName}。`);
  setNotice("success", `已到达：${mapName}`);
  showHall();
}

function startAdventure() {
  const map = getCurrentMap();
  if (!map) {
    addLog("error", "当前地图数据不存在。");
    setNotice("error", "地图异常。");
    showHall();
    return;
  }

  if (player.hp <= 0) {
    setNotice("error", "你当前气血为 0，先去休息恢复。");
    showHall();
    return;
  }

  if (typeof stopBattleTimer === "function") {
    stopBattleTimer();
  }

  const monster = pickMonsterFromCurrentMap();
  if (!monster) {
    addLog("error", "系统错误：当前地图没有可遭遇怪物。");
    setNotice("error", "怪物数据异常。");
    showHall();
    return;
  }

  // currentBattle 在 battle.js 中声明，这里只负责赋值
  currentBattle = {
  name: monster.name,
  hp: monster.hp,
  maxHp: monster.hp,
  atk: monster.atk,
  def: monster.def || 0,
  money: monster.money,
  exp: monster.exp,
  power: monster.power,
  type: monster.type,
  round: 0,
  statusEffects: [],
  states: [],
  shield: 0,
  skills: monster.skills || [],
  rage: 0
};

  if (monster.type === "boss") {
    addLog("error", `【警报】一股强大的气息降临... 你惊动了区域主宰：${monster.name}！`);
    setNotice("error", `你遭遇了 BOSS：${monster.name}`);
  } else if (monster.type === "elite") {
    addLog("sys", `【精英】遇到了极其强悍的：${monster.name}！`);
    setNotice("info", `你遭遇了精英怪：${monster.name}`);
  } else {
    addLog("sys", `【遭遇】遇到了：${monster.name}。`);
    setNotice("info", `你遭遇了：${monster.name}`);
  }

  if (typeof showEncounter === "function") {
    showEncounter(currentBattle);
  } else {
    addLog("error", "战斗模块未加载：showEncounter 不存在。");
    setNotice("error", "battle.js 未正确加载。");
    showHall();
  }
}


// ===== 6. 背包、装备、商城、药房（委托 src/app/economy-bag.js） =====
function useItem(name) { return window.__JH_ECONOMY_BAG__.useItem(name); }
function equipItem(name) { return window.__JH_ECONOMY_BAG__.equipItem(name); }
function unequipSlot(slot) { return window.__JH_ECONOMY_BAG__.unequipSlot(slot); }
function buyShopItem(index) { return window.__JH_ECONOMY_BAG__.buyShopItem(index); }
function buyMarketItem(name, price) { return window.__JH_ECONOMY_BAG__.buyMarketItem(name, price); }
function craftMedicine(index) { return window.__JH_ECONOMY_BAG__.craftMedicine(index); }


// ===== 7. 门派与职业 =====
function joinSect(index) {
  const sect = sectList[index];
  if (!sect) return;

  if (sect.req !== "无") {
    const requiredLevel = parseInt(sect.req, 10);
    if (!Number.isNaN(requiredLevel) && player.level < requiredLevel) {
      setNotice("error", `加入失败：需要 ${requiredLevel} 级。`);
      showSect();
      return;
    }
  }

  player.sect = sect.name;
  addLog("sys", `你已加入 ${sect.name}。`);
  setNotice("success", `加入门派成功：${sect.name}`);
  updateAll();
  showSect();
}

function chooseJob(index) {
  const job = jobList[index];
  if (!job) return;

  player.job = job.name;
  addLog("sys", `你选择了职业【${job.name}】。`);
  setNotice("success", `入职成功：${job.name}`);
  updateAll();
  showJob();
}

function doJob() {
  if (player.job === "无职业") {
    addLog("error", "你还没有职业，请先入职。");
    setNotice("error", "请先选择职业。");
    showJob();
    return;
  }

  if (player.job === "采冰") {
    loseHp(6);
    addItem("冰水", 1);
    player.money += 2;
    gainExp(10);
    addLog("event", "你辛苦采来一份冰水。获得【冰水 x1】，银两 +2，经验 +10。");
    setNotice("success", "职业动作成功：获得冰水 x1。");
  } else if (player.job === "采矿") {
    loseHp(8);
    addItem("矿石", 1);
    player.money += 3;
    gainExp(12);
    addLog("event", "你在矿洞挖到一块矿石。获得【矿石 x1】，银两 +3，经验 +12。");
    setNotice("success", "职业动作成功：获得矿石 x1。");
  } else if (player.job === "伐木") {
    loseHp(7);
    addItem("木头", 1);
    player.money += 3;
    gainExp(11);
    addLog("event", "你砍下了一段木材。获得【木头 x1】，银两 +3，经验 +11。");
    setNotice("success", "职业动作成功：获得木头 x1。");
  } else if (player.job === "占卜") {
    const roll = Math.random();
    loseMp(10);

    if (roll < 0.25) {
      player.money += 15;
      gainExp(10);
      addLog("sys", "你占得吉兆，财运上升。银两 +15，经验 +10。");
      setNotice("success", "占卜成功：财运上升。");
    } else if (roll < 0.5) {
      recoverHp(10);
      gainExp(8);
      addLog("sys", "你窥得天机，精神振奋。气血 +10，经验 +8。");
      setNotice("success", "占卜成功：精神振奋。");
    } else if (roll < 0.75) {
      player.money = Math.max(0, player.money - 8);
      addLog("sys", "你卜算失误，白白破财。银两 -8。");
      setNotice("error", "占卜失误：银两 -8。");
    } else {
      addItem("小还丹", 1);
      gainExp(12);
      addLog("sys", "你卜得奇缘，意外获得一颗小还丹。经验 +12。");
      setNotice("success", "占卜成功：获得小还丹 x1。");
    }
  } else if (player.job === "渔夫") {
    const roll = Math.random();
    loseHp(5);

    if (roll < 0.4) {
      addItem("小鱼", 2);
      player.money += 4;
      gainExp(10);
      addLog("event", "你出海捕到了两条小鱼。获得【小鱼 x2】，银两 +4，经验 +10。");
      setNotice("success", "捕鱼成功：获得小鱼 x2。");
    } else if (roll < 0.75) {
      addItem("大黄鱼", 1);
      player.money += 8;
      gainExp(15);
      addLog("event", "你今日手气不错，捕到一条大黄鱼。银两 +8，经验 +15。");
      setNotice("success", "捕鱼成功：获得大黄鱼 x1。");
    } else {
      player.money += 20;
      gainExp(18);
      addLog("event", "你在海上意外捞到漂来的包裹。银两 +20，经验 +18。");
      setNotice("success", "出海有收获：银两 +20。");
    }
  }

  updateAll();
  showJob();
}


// ===== 8. 存档 =====
function saveGameBtn() {
  localStorage.setItem("jianghu_save_v03", JSON.stringify({
    saveVersion: 2,
    player,
    logs
  }));
  addLog("sys", "【存档】进度已封存至书笈中。");
  setNotice("success", "存档成功！");
  updateAll();
  refreshCurrentView();
}

function loadGameBtn() {
  const save = localStorage.getItem("jianghu_save_v03");
  if (!save) {
    addLog("error", "未找到存档记录。");
    setNotice("error", "读档失败：没有找到存档。");
    refreshCurrentView();
    return;
  }

  let data = JSON.parse(save);
  data = migrateSaveData(data);

  player = data.player || defaultPlayer();
  logs = data.logs || logs;

  if (typeof currentBattle !== "undefined") {
    currentBattle = null;
  }
  if (typeof stopBattleTimer === "function") {
    stopBattleTimer();
  }

  normalizePlayerAfterLoad();
  normalizeLogs();

  addLog("sys", "【读档】记忆寻回，进度已载入。");
  setNotice("success", "读档成功！");
  updateAll();
  showHall();
}

function resetGameBtn() {
  const ok = confirm("确定要自废武功，重头再来吗？数据将全部清空。");
  if (!ok) return;

  player = defaultPlayer();
  logs = [
    { type: "sys", text: "【系统】你已重置江湖人生。", time: getNowTime() }
  ];

  if (typeof currentBattle !== "undefined") {
    currentBattle = null;
  }
  if (typeof stopBattleTimer === "function") {
    stopBattleTimer();
  }

  setNotice("success", "重开成功：新的江湖旅程开始了。");
  updateAll();
  showHall();
}


// ===== 9. 兼容 HTML 按钮名 =====
window.showHall = showHall;
window.showStatus = showStatus;
window.showBag = showBag;
window.showEquip = showEquip;
window.showShop = showShop;
window.showMarket = showMarket;
window.showSect = showSect;
window.showRank = showRank;
window.showJob = showJob;
window.showPharmacy = showPharmacy;

window.train = train;
window.work = work;
window.luck = luck;
window.rest = rest;
window.adventure = startAdventure;

window.fakeChat = fakeChat;
window.bubblePoint = bubblePoint;
window.changeMap = changeMap;
window.startAdventure = startAdventure;

window.buyShopItem = buyShopItem;
window.buyMarketItem = buyMarketItem;
window.useItem = useItem;
window.equipItem = equipItem;
window.unequipSlot = unequipSlot;
window.craftMedicine = craftMedicine;

window.joinSect = joinSect;
window.chooseJob = chooseJob;
window.doJob = doJob;

window.saveGame = saveGameBtn;
window.loadGame = loadGameBtn;
window.resetGame = resetGameBtn;
window.saveGameBtn = saveGameBtn;
window.loadGameBtn = loadGameBtn;
window.resetGameBtn = resetGameBtn;
window.showTrain = showTrain;
window.doCultivationUpgrade = doCultivationUpgrade;

// ===== 10. 初始化 =====
window.onload = function () {
  try {
    if (window.__JH_RUNTIME_STATE__ && typeof window.__JH_RUNTIME_STATE__.ensureRuntimeState === "function") {
      window.__JH_RUNTIME_STATE__.ensureRuntimeState();
      logs = window.__JH_RUNTIME_STATE__.getLogs();
      uiNotice = window.__JH_RUNTIME_STATE__.getNotice();
      currentView = window.__JH_RUNTIME_STATE__.getCurrentView();
    }

    normalizePlayerAfterLoad();
    normalizeLogs();
    updateAll();
    showHall();
    console.log("少年江湖 - 新版 game.js 启动成功");
  } catch (err) {
    console.error("江湖启动失败：", err);
  }
};