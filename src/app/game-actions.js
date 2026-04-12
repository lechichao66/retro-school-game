(function initGameActions(global) {
  const g = global || window;
  const HANGUP_SETTLE_MS = 60 * 1000;
  const LOBBY_DROP_RATE = 0.06;
  const LOBBY_DROPS = ["止血草", "矿石", "木头", "小鱼"];
  let hangupTicker = null;

  function ensureTaskState() {
    if (!Array.isArray(player.activeTasks)) player.activeTasks = [];
    if (!player.taskProgress || typeof player.taskProgress !== "object") player.taskProgress = {};
    if (!Array.isArray(player.completedTasks)) player.completedTasks = [];
  }

  function ensureGrowthState() {
    if (!Array.isArray(player.treasureMaps)) player.treasureMaps = [];
    if (!player.assistantProfessions || typeof player.assistantProfessions !== "object") {
      player.assistantProfessions = { 炼药: 0, 打造: 0, 裁缝: 0, 厨师: 0 };
    }
    if (!player.unlockedSecretTechs || typeof player.unlockedSecretTechs !== "object") player.unlockedSecretTechs = {};
    if (!player.martial || typeof player.martial !== "object") player.martial = { learned: ["basic_fist"], levels: { basic_fist: 1 }, activeSkill: "basic_fist" };
    if (!player.martial.levels || typeof player.martial.levels !== "object") player.martial.levels = { basic_fist: 1 };
  }

  function ensureHangup() {
    if (typeof ensureHangupState === "function") ensureHangupState();
    if (!player.hallAvatarState || typeof player.hallAvatarState !== "object") {
      player.hallAvatarState = { action: "idle", updatedAt: Date.now() };
    }
  }

  function addGameplayLog(category, text, type) {
    const labelMap = {
      adventure: "冒险",
      dungeon: "副本",
      treasure: "宝图",
      hangup: "挂机",
      sectHangup: "门派挂机",
      economy: "营生"
    };
    if (typeof appendLogbook === "function") appendLogbook(category, text);
    addLog(type || "event", `【${labelMap[category] || "日志"}】${text}`);
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

  function abandonTask(taskId) {
    ensureTaskState();
    if (!player.activeTasks.includes(taskId)) {
      setNotice("info", "该任务不在进行中。");
      showTask();
      return;
    }
    player.activeTasks = player.activeTasks.filter((x) => x !== taskId);
    addLog("sys", `你放弃了任务【${getTaskById(taskId)?.name || taskId}】。`);
    setNotice("info", "任务已放弃。");
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
    ensureHangup();
    if (!player.hangup.lobby.active) {
      if (player.hangup.sectDuty.active) {
        setNotice("error", "当前正在执行门派值守，请先停止门派挂机。");
        refreshCurrentView();
        return;
      }
      player.hangup.lobby.active = true;
      player.hangup.lobby.lastSettleAt = Date.now();
      player.hallAvatarState = { action: "train", updatedAt: Date.now() };
      addGameplayLog("hangup", "你在大厅进入泡点挂机状态。每分钟自动结算经验与银两。", "sys");
      setNotice("success", "已开始泡点挂机。再次点击可停止。");
    } else {
      player.hangup.lobby.active = false;
      player.hallAvatarState = { action: "idle", updatedAt: Date.now() };
      addGameplayLog("hangup", "你停止了泡点挂机，转为手动行动。", "sys");
      setNotice("info", "已停止泡点挂机。");
    }
    updateAll();
    refreshCurrentView();
  }

  function train() {
    showTrain();
  }

  function work() {
    if (!consumeStamina(18)) {
      addLog("error", "你体力不足，当前无法继续跑商。");
      setNotice("error", "体力不足（需18点），无法跑商。");
      refreshCurrentView();
      return;
    }

    let income = 20;
    if (player.sect === "丐帮") income += 5;

    player.money += income;
    gainExp(6);

    addGameplayLog("economy", `你完成一趟短线跑商，消耗体力18点，获得银两 +${income}，经验 +6。`, "event");
    setNotice("success", `跑商成功：银两 +${income}，经验 +6。`);
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
    addGameplayLog("adventure", `你在${player.location}开始了一次探索，遭遇目标：${monster.name}。`, "sys");

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
    if (!player.martial || typeof player.martial !== "object") player.martial = { title: "", levels: { basic_fist: 1 }, learned: ["basic_fist"], activeSkill: "basic_fist" };
    if (!player.martial.levels) player.martial.levels = { basic_fist: 1 };
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

    if (player.job === "采药") {
      addItem("止血草", 1);
      onPlayerActionProgress("collect", { name: "止血草", count: 1 });
      player.money += 2;
      gainExp(10);
      addLog("event", "你采到一株止血草。获得【止血草 x1】，银两 +2，经验 +10。");
      setNotice("success", "采药成功：获得止血草 x1。");
    } else if (player.job === "采冰") {
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

  function getMartialResearchCost(skill, mode) {
    const base = mode === "resource" ? 120 : 0;
    const reqContribution = Number(skill?.learnReq?.contribution || 0);
    const discountLevel = Math.floor((player.sectContribution || 0) / 100);
    const capLevel = Math.floor(reqContribution / 20);
    const finalDiscountLevel = Math.max(0, Math.min(discountLevel, capLevel));
    return Math.max(20, base - finalDiscountLevel * 8);
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
    if ((player.sectContribution || 0) < (req.contribution || 0)) return setNotice("error", "门派贡献不足（仅用于解锁门槛）。"), showSect();
    if (player.money < (req.money || 0)) return setNotice("error", "银两不足。"), showSect();
    player.money -= req.money || 0;
    if (!player.martial.learned.includes(skill.id)) player.martial.learned.push(skill.id);
    player.martial.levels[skill.id] = player.martial.levels[skill.id] || 1;
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
    const currentLevel = player.martial.levels[skillId] || 1;
    const maxLevel = Math.max(1, (player.level || 1) + 10);
    if (currentLevel >= maxLevel) {
      setNotice("info", `已达到当前上限：${maxLevel} 级。`);
      showSect();
      return;
    }
    const moneyCost = getMartialResearchCost(skill, "resource");
    const expCost = 220 + currentLevel * 70;
    if (player.money < moneyCost || player.exp < expCost) {
      setNotice("error", `研习需要银两${moneyCost}与经验${expCost}。`);
      showSect();
      return;
    }
    player.money -= moneyCost;
    player.exp -= expCost;
    player.martial.levels[skillId] = currentLevel + 1;
    addLog("event", `你研习【${skill.name}】并提升到 ${currentLevel + 1} 级，消耗银两${moneyCost}、经验${expCost}。`);
    setNotice("success", `${skill.name} 升至 ${currentLevel + 1} 级。`);
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
    if (type === "passive") {
      player.sectReputation = (player.sectReputation || 0) + 20;
      player.unlockedSecretTechs[player.sect] = true;
    }
    addLog("success", `你完成了师门兑换：${type}。`);
    setNotice("success", "师门兑换成功。");
    showSect();
  }

  function grantTreasureMap() {
    ensureGrowthState();
    const template = (g.__JH_DATA__?.treasureMapTemplates || [])[0];
    if (!template) return;
    player.treasureMaps.push({ ...template, used: false });
    addGameplayLog("treasure", `你获得了宝图【${template.name}】。`, "sys");
    setNotice("success", "获得样板宝图 x1。");
    if (typeof showTreasure === "function") showTreasure();
  }

  function useTreasureMap(index) {
    ensureGrowthState();
    const map = player.treasureMaps[index];
    if (!map || map.used) return;
    if (!consumeStamina(map.staminaCost || 10)) {
      setNotice("error", "体力不足，无法使用宝图。");
      showTreasure();
      return;
    }
    map.used = true;
    addGameplayLog("treasure", `你研读了【${map.name}】，锁定了挖宝坐标。体力 -${map.staminaCost || 10}。`, "event");
    setNotice("success", "宝图已启用，可执行挖宝。");
    showTreasure();
  }

  function digTreasure(index) {
    ensureGrowthState();
    const map = player.treasureMaps[index];
    if (!map?.used) return;
    const monsterRoll = Math.random() < (map.encounterRate || 0.3);
    if (monsterRoll) {
      addGameplayLog("treasure", "挖宝时惊动了守宝小怪，你仓促应战后勉强脱身。", "event");
      loseHp(8);
    }
    const rewardTexts = [];
    (map.rewards || []).forEach((r) => {
      if (r.type === "money") player.money += Number(r.value || 0);
      if (r.type === "money") rewardTexts.push(`银两+${Number(r.value || 0)}`);
      if (r.type === "item" && r.name) {
        const c = Number(r.value || 1);
        addItem(r.name, c);
        rewardTexts.push(`${r.name} x${c}`);
      }
    });
    player.treasureMaps.splice(index, 1);
    const rewardText = rewardTexts.length ? rewardTexts.join("，") : "无";
    setNotice("success", `挖宝成功：${rewardText}`);
    addGameplayLog("treasure", `宝图探索完成，结算奖励：${rewardText}。`, "success");
    updateAll();
    showTreasure();
  }

  function runDungeon(dungeonId) {
    const cfg = (g.__JH_DATA__?.dungeonTemplates || []).find((x) => x.id === dungeonId);
    if (!cfg) return;
    if (player.level < (cfg.minLevel || 1)) return setNotice("error", "等级不足，无法进入副本。"), showDungeon();
    if (!consumeStamina(cfg.staminaCost || 15)) return setNotice("error", "体力不足，无法进入副本。"), showDungeon();
    const powerGap = getPowerValue() - (cfg.recommendedPower || 0);
    if (powerGap < -200) {
      loseHp(20);
      addGameplayLog("dungeon", `你挑战副本【${cfg.name}】失败，体力消耗且气血受损。`, "error");
      setNotice("error", "副本挑战失败：当前战力偏低。");
      updateAll();
      showDungeon();
      return;
    }
    const waves = Array.isArray(cfg.waves) ? cfg.waves : [];
    const wavePenalty = Math.max(0, waves.length - 1) * 60;
    if (powerGap < -wavePenalty) {
      loseHp(25);
      addGameplayLog("dungeon", `你在副本【${cfg.name}】多波战中败退。`, "error");
      setNotice("error", "副本挑战失败：多波战强度过高。");
      updateAll();
      showDungeon();
      return;
    }
    const reward = cfg.reward || {};
    player.money += reward.money || 0;
    gainExp(reward.exp || 0);
    (reward.items || []).forEach((it) => addItem(it.name, it.count || 1));
    const waveText = waves.length ? `共${waves.length}波，BOSS：${cfg.boss || "无"}` : "单波";
    addGameplayLog("dungeon", `你通关副本【${cfg.name}】（${waveText}），获得银两${reward.money || 0}、经验${reward.exp || 0}。`, "success");
    setNotice("success", `副本通关：${cfg.name}`);
    updateAll();
    showDungeon();
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
    stopAllHangup();
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

  function toggleSectDutyHangup() {
    ensureHangup();
    if (player.sect === "无门无派") {
      setNotice("error", "无门无派无法执行门派值守，请先加入门派。");
      showSect();
      return;
    }
    if (!player.hangup.sectDuty.active) {
      if (player.hangup.lobby.active) {
        setNotice("error", "当前正在泡点挂机，请先停止大厅泡点。");
        showSect();
        return;
      }
      player.hangup.sectDuty.active = true;
      player.hangup.sectDuty.lastSettleAt = Date.now();
      player.hallAvatarState = { action: "patrol", updatedAt: Date.now() };
      addGameplayLog("sectHangup", `你开始执行${player.sect}门派值守，每分钟自动获得门派贡献。`, "sys");
      setNotice("success", "已开始门派值守挂机。再次点击可停止。");
    } else {
      player.hangup.sectDuty.active = false;
      player.hallAvatarState = { action: "idle", updatedAt: Date.now() };
      addGameplayLog("sectHangup", "你结束了本轮门派值守挂机。", "sys");
      setNotice("info", "已停止门派值守挂机。");
    }
    updateAll();
    showSect();
  }

  function settleLobbyHangupRound() {
    const expGain = 6;
    const moneyGain = 8;
    gainExp(expGain);
    player.money += moneyGain;
    let dropText = "无";
    if (Math.random() < LOBBY_DROP_RATE) {
      const drop = randomPick(LOBBY_DROPS) || "止血草";
      addItem(drop, 1);
      dropText = `${drop} x1`;
    }
    addGameplayLog("hangup", `泡点结算：经验 +${expGain}、银两 +${moneyGain}，掉落：${dropText}。`, "event");
  }

  function settleSectDutyRound() {
    const contributionGain = 10;
    player.sectContribution = (player.sectContribution || 0) + contributionGain;
    addGameplayLog("sectHangup", `门派值守结算：门派贡献 +${contributionGain}。`, "event");
  }

  function processHangupSettlement(forceSettle) {
    ensureHangup();
    const now = Date.now();
    const loopSettle = (stateKey, settleFn) => {
      const state = player.hangup[stateKey];
      if (!state?.active) return;
      const last = Number(state.lastSettleAt) || now;
      let rounds = 0;
      if (forceSettle) {
        rounds = Math.max(1, Math.floor((now - last) / HANGUP_SETTLE_MS));
      } else if (now - last >= HANGUP_SETTLE_MS) {
        rounds = Math.floor((now - last) / HANGUP_SETTLE_MS);
      }
      if (rounds <= 0) return;
      for (let i = 0; i < rounds; i += 1) settleFn();
      state.lastSettleAt = last + rounds * HANGUP_SETTLE_MS;
    };

    loopSettle("lobby", settleLobbyHangupRound);
    loopSettle("sectDuty", settleSectDutyRound);
    if (forceSettle) updateAll();
  }

  function startHangupTicker() {
    if (hangupTicker) clearInterval(hangupTicker);
    hangupTicker = setInterval(() => {
      processHangupSettlement(false);
    }, 5000);
  }

  function stopAllHangup() {
    ensureHangup();
    player.hangup.lobby.active = false;
    player.hangup.sectDuty.active = false;
    player.hallAvatarState = { action: "idle", updatedAt: Date.now() };
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
    abandonTask,
    onMonsterDefeated,
    onPlayerActionProgress,
    updateCombatSkillLoadout,
    saveGameBtn,
    loadGameBtn,
    resetGameBtn,
    processHangupSettlement,
    toggleSectDutyHangup,
    stopAllHangup,
    debugSetLevel,
    debugAddMoney,
    debugCultivateAll,
    debugFullRecover,
    debugGrantTestGear,
    learnMartialSkill,
    trainMartialSkill,
    redeemSectReward,
    getMartialResearchCost,
    grantTreasureMap,
    useTreasureMap,
    digTreasure,
    runDungeon
  };
  g.getMartialResearchCost = getMartialResearchCost;
  ensureGrowthState();
  ensureHangup();
  startHangupTicker();
})(window);
