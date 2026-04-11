(function initGameActions(global) {
  const g = global || window;

  function ensureTaskState() {
    if (!Array.isArray(player.activeTasks)) player.activeTasks = [];
    if (!player.taskProgress || typeof player.taskProgress !== "object") player.taskProgress = {};
    if (!Array.isArray(player.completedTasks)) player.completedTasks = [];
  }

  function getTaskById(taskId) {
    return (taskTemplates || []).find((x) => x.id === taskId) || null;
  }

  function grantTaskReward(task) {
    const reward = task.reward || {};
    if (reward.money) player.money += reward.money;
    if (reward.exp) gainExp(reward.exp);
    if (reward.sectContribution) player.sectContribution += reward.sectContribution;
    if (reward.sectReputation) player.sectReputation += reward.sectReputation;
    (reward.items || []).forEach((x) => addItem(x.name, x.count || 1));
  }

  function acceptTask(taskId) {
    ensureTaskState();
    const task = getTaskById(taskId);
    if (!task) return;
    if (player.level < (task.minLevel || 1)) {
      setNotice("error", `接取失败：需要 ${task.minLevel} 级。`);
      showTask();
      return;
    }
    if (player.activeTasks.includes(taskId)) {
      setNotice("info", "该任务已在进行中。");
      showTask();
      return;
    }
    player.activeTasks.push(taskId);
    if (typeof player.taskProgress[taskId] !== "number") player.taskProgress[taskId] = 0;
    addLog("sys", `你接取了任务【${task.name}】。`);
    setNotice("success", `接取成功：${task.name}`);
    showTask();
  }

  function claimTask(taskId) {
    ensureTaskState();
    const task = getTaskById(taskId);
    if (!task) return;
    const target = task.objective?.count || 1;
    const progress = player.taskProgress[taskId] || 0;
    if (progress < target) {
      setNotice("error", "任务未完成，无法提交。");
      showTask();
      return;
    }
    grantTaskReward(task);
    player.activeTasks = player.activeTasks.filter((x) => x !== taskId);
    player.completedTasks.push(taskId);
    addLog("success", `任务完成【${task.name}】。`);
    setNotice("success", `已提交任务：${task.name}`);
    updateAll();
    showTask();
  }

  function onMonsterDefeated(monsterName, monsterType) {
    ensureTaskState();
    player.activeTasks.forEach((taskId) => {
      const task = getTaskById(taskId);
      if (!task) return;
      const obj = task.objective || {};
      if (obj.action === "kill" && obj.target === monsterName) player.taskProgress[taskId] = (player.taskProgress[taskId] || 0) + 1;
      if (obj.action === "kill_type" && obj.target === monsterType) player.taskProgress[taskId] = (player.taskProgress[taskId] || 0) + 1;
    });
  }

  function onPlayerActionProgress(action, payload) {
    ensureTaskState();
    player.activeTasks.forEach((taskId) => {
      const task = getTaskById(taskId);
      if (!task) return;
      const obj = task.objective || {};
      if (obj.action === action) player.taskProgress[taskId] = (player.taskProgress[taskId] || 0) + 1;
      if (obj.action === "collect" && action === "collect" && obj.target === payload?.name) {
        player.taskProgress[taskId] = Math.min(obj.count || 1, (player.taskProgress[taskId] || 0) + (payload?.count || 1));
      }
    });
  }

  function applySectSkills(sectName) {
    const sect = (sectList || []).find((x) => x.name === sectName);
    const baseSkills = ["ironSkin", "quickSlash"];
    if (player.level < 10) {
      player.skills = baseSkills;
      return;
    }
    player.skills = [...new Set([...(sect?.starterSkills || []), ...baseSkills])];
  }

  function updateCombatSkillLoadout() {
    if (player.level < 10) {
      player.skills = ["ironSkin", "quickSlash"];
      if (!player.martial) player.martial = { mastery: {}, learned: ["basic_fist"], activeSkill: "basic_fist" };
      player.martial.activeSkill = "basic_fist";
      return;
    }
    applySectSkills(player.sect);
    const sectConfig = martialArtsBySect[player.sect] || { skills: [] };
    const learned = player.martial?.learned || [];
    const sectSkill = (sectConfig.skills || []).find((x) => learned.includes(x.id));
    player.martial.activeSkill = sectSkill?.id || "basic_fist";
  }

  function getSectSkillById(skillId) {
    const sectConfig = martialArtsBySect[player.sect] || martialArtsBySect["无门无派"] || { skills: [] };
    return (sectConfig.skills || []).find((x) => x.id === skillId) || null;
  }

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
    if (!consumeStamina(18)) {
      addLog("error", "你体力不足，已经干不动活了。");
      setNotice("error", "体力不足（需18点），无法打工。");
      refreshCurrentView();
      return;
    }

    let income = 15;
    if (player.sect === "丐帮") income += 5;

    player.money += income;
    gainExp(10);

    addLog("event", `你辛苦劳作了一阵，消耗体力18点，银两 +${income}，经验 +10。`);
    setNotice("success", `打工成功：银两 +${income}，经验 +10。`);
    onPlayerActionProgress("work");
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
    recoverStamina(30);
    recoverVigor(30);
    player.lastRecoveryAt = Date.now();
    addLog("event", "客栈修整完毕，气血、内力、体力与活力均有恢复。");
    setNotice("success", "休息成功：状态与体力活力已恢复。");
    updateAll();
    refreshCurrentView();
  }

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

    g.currentBattle = {
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
      showEncounter(g.currentBattle);
    } else {
      addLog("error", "战斗模块未加载：showEncounter 不存在。");
      setNotice("error", "battle.js 未正确加载。");
      showHall();
    }
  }

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
    applySectSkills(sect.name);
    if (!player.martial || typeof player.martial !== "object") player.martial = { title: "", mastery: {}, realm: {}, learned: ["basic_fist"], activeSkill: "basic_fist" };
    if (!player.martial.mastery) player.martial.mastery = {};
    if (!player.martial.realm) player.martial.realm = {};
    if (!Array.isArray(player.martial.learned)) player.martial.learned = ["basic_fist"];
    if (!player.martial.learned.includes("basic_fist")) player.martial.learned.push("basic_fist");
    updateCombatSkillLoadout();
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

    if (!consumeVigor(10)) {
      setNotice("error", "活力不足（需10点），无法执行职业动作。");
      showJob();
      return;
    }

    if (player.job === "采冰") {
      addItem("冰水", 1);
      onPlayerActionProgress("collect", { name: "冰水", count: 1 });
      player.money += 2;
      gainExp(10);
      addLog("event", "你辛苦采来一份冰水。获得【冰水 x1】，银两 +2，经验 +10。");
      setNotice("success", "职业动作成功：获得冰水 x1。");
    } else if (player.job === "采矿") {
      addItem("矿石", 1);
      onPlayerActionProgress("collect", { name: "矿石", count: 1 });
      player.money += 3;
      gainExp(12);
      addLog("event", "你在矿洞挖到一块矿石。获得【矿石 x1】，银两 +3，经验 +12。");
      setNotice("success", "职业动作成功：获得矿石 x1。");
    } else if (player.job === "伐木") {
      addItem("木头", 1);
      onPlayerActionProgress("collect", { name: "木头", count: 1 });
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

  function learnMartialSkill(skillId) {
    if (player.level < 10) {
      setNotice("error", "10级后才能正式学习门派武功。");
      showSect();
      return;
    }
    const skill = getSectSkillById(skillId);
    if (!skill) return;
    const req = skill.learnReq || {};
    if (player.level < (req.level || 1)) return setNotice("error", "等级不足，无法学习。"), showSect();
    if ((player.sectContribution || 0) < (req.contribution || 0)) return setNotice("error", "门派贡献不足。"), showSect();
    if (player.money < (req.money || 0)) return setNotice("error", "银两不足。"), showSect();
    player.sectContribution -= req.contribution || 0;
    player.money -= req.money || 0;
    if (!player.martial.learned.includes(skill.id)) player.martial.learned.push(skill.id);
    updateCombatSkillLoadout();
    addLog("success", `你已学会门派武功【${skill.name}】。`);
    setNotice("success", `学习成功：${skill.name}`);
    showSect();
  }

  function trainMartialSkill(skillId, mode) {
    const skill = getSectSkillById(skillId) || (martialArtsBySect["无门无派"]?.skills || []).find((x) => x.id === skillId);
    if (!skill) return;
    if (!player.martial.learned.includes(skillId)) {
      setNotice("error", "尚未学会该武功。");
      showSect();
      return;
    }
    if (mode === "resource") {
      if (player.money < 80 || !consumeVigor(12)) {
        setNotice("error", "银两80与活力12不足，无法研习。");
        showSect();
        return;
      }
      player.money -= 80;
      player.martial.mastery[skillId] = (player.martial.mastery[skillId] || 0) + 12;
      addLog("event", `你消耗银两与活力研习【${skill.name}】，熟练度 +12。`);
    } else {
      player.martial.mastery[skillId] = (player.martial.mastery[skillId] || 0) + 4;
      addLog("event", `你在实战中体悟【${skill.name}】，熟练度 +4。`);
    }
    setNotice("success", `${skill.name} 熟练度提升。`);
    showSect();
  }

  function redeemSectReward(type) {
    const costMap = { title: 200, pill: 120, material: 80, passive: 300 };
    const cost = costMap[type] || 0;
    if ((player.sectContribution || 0) < cost) {
      setNotice("error", `门派贡献不足（需要${cost}）。`);
      showSect();
      return;
    }
    player.sectContribution -= cost;
    if (type === "title") player.title = `${player.sect}入室弟子`;
    if (type === "pill") addItem("大还丹", 1);
    if (type === "material") addItem("玄铁", 1);
    if (type === "passive") player.sectReputation = (player.sectReputation || 0) + 20;
    addLog("success", `你完成了师门兑换：${type}。`);
    setNotice("success", "师门兑换成功。");
    showSect();
  }

  function saveGameBtn() {
    if (g.__JH_SAVE_SYSTEM__ && typeof g.__JH_SAVE_SYSTEM__.saveToLocalStorage === "function") {
      g.__JH_SAVE_SYSTEM__.saveToLocalStorage(player, logs);
    } else {
      localStorage.setItem("jianghu_save_v03", JSON.stringify({
        saveVersion: 3,
        player,
        logs
      }));
    }
    addLog("sys", "【存档】进度已封存至书笈中。");
    setNotice("success", "存档成功！");
    updateAll();
    refreshCurrentView();
  }

  function loadGameBtn() {
    const save = g.__JH_SAVE_SYSTEM__ && typeof g.__JH_SAVE_SYSTEM__.loadFromLocalStorage === "function"
      ? g.__JH_SAVE_SYSTEM__.loadFromLocalStorage()
      : localStorage.getItem("jianghu_save_v03");
    if (!save) {
      addLog("error", "未找到存档记录。");
      setNotice("error", "读档失败：没有找到存档。");
      refreshCurrentView();
      return;
    }

    let data = save;
    if (typeof save === "string") {
      data = JSON.parse(save);
      data = migrateSaveData(data);
    }

    player = data.player || defaultPlayer();
    logs = data.logs || logs;
    if (g.__JH_RUNTIME_STATE__?.setLogs) g.__JH_RUNTIME_STATE__.setLogs(logs);
    if (g.battleLogs) g.battleLogs = [];

    if (typeof g.currentBattle !== "undefined") {
      g.currentBattle = null;
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
    if (g.battleLogs) g.battleLogs = [];

    if (typeof g.currentBattle !== "undefined") {
      g.currentBattle = null;
    }
    if (typeof stopBattleTimer === "function") {
      stopBattleTimer();
    }

    setNotice("success", "重开成功：新的江湖旅程开始了。");
    updateAll();
    showHall();
  }

  function debugSetLevel(level) {
    const targetLevel = Math.max(1, Math.floor(Number(level) || 1));
    player.level = targetLevel;
    player.exp = 0;
    player.hp = getMaxHp();
    player.mp = getMaxMp();
    setNotice("success", `调试成功：已设置为 ${targetLevel} 级。`);
    addLog("sys", `【调试】等级设为 ${targetLevel} 级。`);
    updateAll();
    if (currentView === "debug") showDebugPanel();
  }

  function debugAddMoney(amount) {
    const gain = Math.max(0, Math.floor(Number(amount) || 0));
    player.money += gain;
    setNotice("success", `调试成功：银两 +${gain}`);
    addLog("sys", `【调试】银两增加 ${gain}。`);
    updateAll();
    if (currentView === "debug") showDebugPanel();
  }

  function debugCultivateAll(addLevel) {
    const delta = Math.max(1, Math.floor(Number(addLevel) || 1));
    if (!player.cultivation) player.cultivation = {};
    Object.keys(CULTIVATION_CONFIG).forEach((key) => {
      const cap = CULTIVATION_CONFIG[key].maxLevel;
      player.cultivation[key] = Math.min(cap, (player.cultivation[key] || 0) + delta);
    });
    setNotice("success", `调试成功：全修炼提升 ${delta} 级（封顶受限）。`);
    addLog("sys", `【调试】全修炼 +${delta} 级。`);
    updateAll();
    if (currentView === "debug") showDebugPanel();
  }

  function debugFullRecover() {
    player.hp = getMaxHp();
    player.mp = getMaxMp();
    player.states = [];
    player.shield = 0;
    setNotice("success", "调试成功：状态已恢复至满值。");
    addLog("sys", "【调试】已满血满蓝并清除临时状态。");
    updateAll();
    if (currentView === "debug") showDebugPanel();
  }

  function debugGrantTestGear() {
    ["寒铁剑", "黑铁甲", "玄武盔", "龙纹腰带", "追风靴", "赤炎坠", "镇岳法玺"].forEach((name) => addItem(name, 1));
    setNotice("success", "调试成功：已发放当前版本标准最高测试套装。");
    addLog("sys", "【调试】发放当前版本标准最高测试套装。");
    updateAll();
    if (currentView === "debug") showDebugPanel();
  }

  g.__JH_GAME_ACTIONS__ = {
    fakeChat,
    bubblePoint,
    train,
    work,
    luck,
    rest,
    changeMap,
    startAdventure,
    joinSect,
    chooseJob,
    doJob,
    acceptTask,
    claimTask,
    onMonsterDefeated,
    onPlayerActionProgress,
    updateCombatSkillLoadout,
    saveGameBtn,
    loadGameBtn,
    resetGameBtn,
    debugSetLevel,
    debugAddMoney,
    debugCultivateAll,
    debugFullRecover,
    debugGrantTestGear,
    learnMartialSkill,
    trainMartialSkill,
    redeemSectReward
  };
})(window);
