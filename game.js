// ==========================================
// 少年江湖 - game.js 兼容入口层
// 说明：本文件仅保留初始化、页面调度委托、旧全局函数桥接
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
function showTask() { return window.__JH_UI_RENDER__.showTask(); }
function showMartial() { return window.__JH_UI_RENDER__.showMartial(); }
function showBattleLog(mode) { return window.__JH_UI_RENDER__.showBattleLog(mode); }
function showLogbook(mode) { return window.__JH_UI_RENDER__.showLogbook(mode); }
function showTreasure() { return window.__JH_UI_RENDER__.showTreasure(); }
function showInn(section) { return window.__JH_UI_RENDER__.showInn(section); }
function showDungeon() { return window.__JH_UI_RENDER__.showDungeon(); }
function showCodex() { return window.__JH_UI_RENDER__.showCodex(); }
function showNavHub() { return window.__JH_UI_RENDER__.showNavHub(); }
function showPharmacy() { return window.__JH_UI_RENDER__.showPharmacy(); }
function showTrain() { return window.__JH_UI_RENDER__.showTrain(); }
function doCultivationUpgrade(type) { return window.__JH_UI_RENDER__.doCultivationUpgrade(type); }


// ===== 4. 非战斗行为（委托 src/app/game-actions.js） =====
function fakeChat() { return window.__JH_GAME_ACTIONS__.fakeChat(); }
function bubblePoint() { return window.__JH_GAME_ACTIONS__.bubblePoint(); }
function train() { return window.__JH_GAME_ACTIONS__.train(); }
function work() { return window.__JH_GAME_ACTIONS__.work(); }
function luck() { return window.__JH_GAME_ACTIONS__.luck(); }
function rest() { return window.__JH_GAME_ACTIONS__.rest(); }
function changeMap(mapName) { return window.__JH_GAME_ACTIONS__.changeMap(mapName); }
function startAdventure() { return window.__JH_GAME_ACTIONS__.startAdventure(); }


// ===== 5. 背包、装备、商城、药房（委托 src/app/economy-bag.js） =====
function useItem(name) { return window.__JH_ECONOMY_BAG__.useItem(name); }
function equipItem(name) { return window.__JH_ECONOMY_BAG__.equipItem(name); }
function unequipSlot(slot) { return window.__JH_ECONOMY_BAG__.unequipSlot(slot); }
function buyShopItem(index) { return window.__JH_ECONOMY_BAG__.buyShopItem(index); }
function buyMarketItem(name, price) { return window.__JH_ECONOMY_BAG__.buyMarketItem(name, price); }
function craftMedicine(index) { return window.__JH_ECONOMY_BAG__.craftMedicine(index); }


// ===== 6. 门派、职业、存档（委托 src/app/game-actions.js） =====
function joinSect(index) { return window.__JH_GAME_ACTIONS__.joinSect(index); }
function chooseJob(index) { return window.__JH_GAME_ACTIONS__.chooseJob(index); }
function doJob() { return window.__JH_GAME_ACTIONS__.doJob(); }
function setTradeRoute(routeId) { return window.__JH_GAME_ACTIONS__.setTradeRoute(routeId); }
function acceptTask(taskId) { return window.__JH_GAME_ACTIONS__.acceptTask(taskId); }
function claimTask(taskId) { return window.__JH_GAME_ACTIONS__.claimTask(taskId); }
function abandonTask(taskId) { return window.__JH_GAME_ACTIONS__.abandonTask(taskId); }
function learnMartialSkill(skillId) { return window.__JH_GAME_ACTIONS__.learnMartialSkill(skillId); }
function trainMartialSkill(skillId, mode) { return window.__JH_GAME_ACTIONS__.trainMartialSkill(skillId, mode); }
function redeemSectReward(type) { return window.__JH_GAME_ACTIONS__.redeemSectReward(type); }
function toggleSectDutyHangup() { return window.__JH_GAME_ACTIONS__.toggleSectDutyHangup(); }
function grantTreasureMap() { return window.__JH_GAME_ACTIONS__.grantTreasureMap(); }
function useTreasureMap(idx) { return window.__JH_GAME_ACTIONS__.useTreasureMap(idx); }
function digTreasure(idx) { return window.__JH_GAME_ACTIONS__.digTreasure(idx); }
function runDungeon(id) { return window.__JH_GAME_ACTIONS__.runDungeon(id); }
function saveGameBtn() { return window.__JH_GAME_ACTIONS__.saveGameBtn(); }
function loadGameBtn() { return window.__JH_GAME_ACTIONS__.loadGameBtn(); }
function resetGameBtn() { return window.__JH_GAME_ACTIONS__.resetGameBtn(); }
function debugSetLevel(level) { return window.__JH_GAME_ACTIONS__.debugSetLevel(level); }
function debugAddMoney(amount) { return window.__JH_GAME_ACTIONS__.debugAddMoney(amount); }
function debugCultivateAll(level) { return window.__JH_GAME_ACTIONS__.debugCultivateAll(level); }
function debugFullRecover() { return window.__JH_GAME_ACTIONS__.debugFullRecover(); }
function debugGrantTestGear() { return window.__JH_GAME_ACTIONS__.debugGrantTestGear(); }


// ===== 7. 兼容 HTML 按钮名 =====
window.showHall = showHall;
window.showStatus = showStatus;
window.showBag = showBag;
window.showEquip = showEquip;
window.showShop = showShop;
window.showMarket = showMarket;
window.showSect = showSect;
window.showRank = showRank;
window.showJob = showJob;
window.showTask = showTask;
window.showMartial = showMartial;
window.showBattleLog = showBattleLog;
window.showLogbook = showLogbook;
window.showTreasure = showTreasure;
window.showInn = showInn;
window.showDungeon = showDungeon;
window.showCodex = showCodex;
window.showNavHub = showNavHub;
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
window.setTradeRoute = setTradeRoute;
window.acceptTask = acceptTask;
window.claimTask = claimTask;
window.abandonTask = abandonTask;
window.learnMartialSkill = learnMartialSkill;
window.trainMartialSkill = trainMartialSkill;
window.redeemSectReward = redeemSectReward;
window.toggleSectDutyHangup = toggleSectDutyHangup;
window.grantTreasureMap = grantTreasureMap;
window.useTreasureMap = useTreasureMap;
window.digTreasure = digTreasure;
window.runDungeon = runDungeon;
window.showEquipDetail = function showEquipDetail(slot) { return window.__JH_UI_RENDER__.showEquipDetail(slot); };
window.setShopCategory = function setShopCategory(category) { return window.__JH_UI_RENDER__.setShopCategory(category); };
window.setBagTab = function setBagTab(tab) { return window.__JH_UI_RENDER__.setBagTab(tab); };
window.setTaskTab = function setTaskTab(tab) { return window.__JH_UI_RENDER__.setTaskTab(tab); };
window.setTaskPage = function setTaskPage(step) { return window.__JH_UI_RENDER__.setTaskPage(step); };
window.selectTaskDetail = function selectTaskDetail(taskId) { return window.__JH_UI_RENDER__.selectTaskDetail(taskId); };
window.refreshTaskList = function refreshTaskList() { return window.__JH_UI_RENDER__.refreshTaskList(); };
window.setSectTab = function setSectTab(tab) { return window.__JH_UI_RENDER__.setSectTab(tab); };
window.onMonsterDefeated = function onMonsterDefeated(name, type) { return window.__JH_GAME_ACTIONS__.onMonsterDefeated(name, type); };
window.onPlayerActionProgress = function onPlayerActionProgress(action, payload) { return window.__JH_GAME_ACTIONS__.onPlayerActionProgress(action, payload); };

window.saveGame = saveGameBtn;
window.loadGame = loadGameBtn;
window.resetGame = resetGameBtn;
window.saveGameBtn = saveGameBtn;
window.loadGameBtn = loadGameBtn;
window.resetGameBtn = resetGameBtn;
window.showTrain = showTrain;
window.showChangelog = function showChangelog(mode) { return window.__JH_UI_RENDER__.showChangelog(mode); };
window.showDebugPanel = function showDebugPanel() { return window.__JH_UI_RENDER__.showDebugPanel(); };
window.doCultivationUpgrade = doCultivationUpgrade;
window.debugSetLevel = debugSetLevel;
window.debugAddMoney = debugAddMoney;
window.debugCultivateAll = debugCultivateAll;
window.debugFullRecover = debugFullRecover;
window.debugGrantTestGear = debugGrantTestGear;

function autoLoadLatestSave() {
  if (!window.__JH_SAVE_SYSTEM__ || typeof window.__JH_SAVE_SYSTEM__.loadFromLocalStorage !== "function") {
    return false;
  }

  const data = window.__JH_SAVE_SYSTEM__.loadFromLocalStorage();
  if (!data || !data.player) return false;

  player = data.player;
  logs = Array.isArray(data.logs) ? data.logs : logs;
  return true;
}

// ===== 8. 初始化 =====
window.onload = function () {
  try {
    if (window.__JH_RUNTIME_STATE__ && typeof window.__JH_RUNTIME_STATE__.ensureRuntimeState === "function") {
      window.__JH_RUNTIME_STATE__.ensureRuntimeState();
      logs = window.__JH_RUNTIME_STATE__.getLogs();
      uiNotice = window.__JH_RUNTIME_STATE__.getNotice();
      currentView = window.__JH_RUNTIME_STATE__.getCurrentView();
    }

    autoLoadLatestSave();
    normalizePlayerAfterLoad();
    if (window.__JH_GAME_ACTIONS__?.updateCombatSkillLoadout) window.__JH_GAME_ACTIONS__.updateCombatSkillLoadout();
    normalizeLogs();
    updateAll();
    showHall();
    const v = window.__JH_DATA__?.versionLog?.version;
    if (v) {
      const key = "jianghu_last_seen_version";
      const seen = localStorage.getItem(key);
      if (seen !== v) {
        localStorage.setItem(key, v);
        setNotice("info", `已更新到 ${v}。可在“更新日志”查看详情。`);
        if (confirm(`检测到版本更新：${v}\n是否立即查看更新日志？`)) {
          showChangelog();
        } else {
          showHall();
        }
      }
    }
    console.log("少年江湖 - game.js 兼容入口加载成功");
  } catch (err) {
    console.error("江湖启动失败：", err);
  }
};
