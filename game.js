// ==========================================
// 少年江湖 - 四文件版主逻辑 (game.js)
// 说明：本文件保留全部非战斗功能
// 战斗相关逻辑已拆到 battle.js
// ==========================================


// ===== 1. 玩家与全局状态 =====

let logs = [
  { type: "sys", text: "欢迎进入少年江湖。这里是单机怀旧版江湖大厅。", time: getNowTime() }
];

let uiNotice = {
  type: "sys",
  text: "欢迎来到少年江湖。"
};

let currentView = "hall";


// ===== 2. 顶部栏与基础 UI =====
function updateTopBar() {
  clampPlayer();

  const panel = getPlayerPanelData();

  document.getElementById("playerName").textContent = panel.name;
  document.getElementById("sect").textContent = `${panel.sect} / ${panel.job}`;
  document.getElementById("title").textContent = panel.title;
  document.getElementById("hp").textContent = `${panel.hp} / ${panel.maxHp}`;
  document.getElementById("mp").textContent = `${panel.mp} / ${panel.maxMp}`;
  document.getElementById("money").textContent = panel.money;
  document.getElementById("exp").textContent = `${panel.exp} / ${panel.level * 100}`;
  document.getElementById("level").textContent = panel.level;
}

function updateOnlineList() {
  const box = document.getElementById("onlineList");
  if (!box) return;

  box.innerHTML = onlinePlayers.map(p => `
    <div class="online-player">
      <span class="online-name">${p.name}</span>
      <span class="online-sect">[${p.sect}]</span>
      <span class="online-state">${p.state}</span>
    </div>
  `).join("");
}

function updateAll() {
  clampPlayer();
  updateTopBar();
  updateOnlineList();
}

function setMainTitle(text) {
  const el = document.getElementById("mainTitle");
  if (el) el.textContent = text;
}

function setMainContent(html) {
  const el = document.getElementById("mainContent");
  if (el) el.innerHTML = html;
}

function renderHallLog() {
  const box = document.getElementById("hallLogBox");
  if (!box) return;

  box.innerHTML = logs.map(item => `
    <div class="log-line ${item.type}">
      <span style="color:#777; margin-right:8px;">[${item.time}]</span>${item.text}
    </div>
  `).join("");

  box.scrollTop = 0;
}

function refreshCurrentView() {
  const viewMap = {
    hall: showHall,
    status: showStatus,
    bag: showBag,
    equip: showEquip,
    shop: showShop,
    market: showMarket,
    sect: showSect,
    rank: showRank,
    job: showJob,
    pharmacy: showPharmacy,
    train: showTrain,
    encounter: () => {
      if (typeof currentBattle !== "undefined" && currentBattle && typeof showEncounter === "function") {
        showEncounter(currentBattle);
      } else {
        showHall();
      }
    },
    battle: () => {
      if (typeof showBattle === "function") {
        showBattle();
      } else {
        showHall();
      }
    }
  };

  if (viewMap[currentView]) {
    viewMap[currentView]();
  } else {
    showHall();
  }
}


// ===== 3. 页面函数 =====
function showHall() {
  currentView = "hall";

  const loc = player.location || "新手村";
  const mapInfo = mapData[loc];

  setMainTitle(`江湖大厅 - ${loc}`);
  setMainContent(`
    ${renderNoticeHtml()}

    <div style="background:#f9f9f9; padding:10px; border-left:4px solid #800000; margin-bottom:10px; font-size:0.95em;">
      <b>当前地界：</b>${mapInfo ? mapInfo.desc : "神秘区域"}
    </div>

    <div class="shop-actions">
      ${Object.keys(mapData).map(name => `
        <button class="action-btn"
                style="background:${name === loc ? "#800000" : "#d4d4d4"}; color:${name === loc ? "#fff" : "#000"};"
                onclick="changeMap('${name}')">
          ${name}
        </button>
      `).join("")}
    </div>

    <hr style="border:0; border-top:1px dashed #ccc; margin:15px 0;">

    <div class="shop-actions">
      <button class="action-btn" onclick="fakeChat()">闲聊</button>
      <button class="action-btn" onclick="bubblePoint()">泡点</button>
      <button class="action-btn" style="background:#800000; color:white;" onclick="startAdventure()">
        探索${loc}
      </button>
    </div>

    <div id="hallLogBox" class="log-box" style="height:460px; min-height:460px; max-height:460px; overflow-y:auto;"></div>
  `);

  renderHallLog();
}

function showStatus() {
  currentView = "status";
  const bonus = getEquipBonus();

  setMainTitle("人物状态");
  setMainContent(`
    ${renderNoticeHtml()}
    <div class="status-grid">
      <div class="card">
        <h3>基础信息</h3>
        <div class="list-line">姓名：${player.name}</div>
        <div class="list-line">门派：${player.sect}</div>
        <div class="list-line">职业：${player.job}</div>
        <div class="list-line">称号：${player.title}</div>
        <div class="list-line">等级：${player.level}</div>
        <div class="list-line">经验：${player.exp} / ${player.level * 100}</div>
        <div class="list-line">当前位置：${player.location}</div>
      </div>

      <div class="card">
        <h3>当前属性</h3>
        <div class="list-line">气血：${player.hp} / ${getMaxHp()}</div>
        <div class="list-line">内力：${player.mp} / ${getMaxMp()}</div>
        <div class="list-line">银两：${player.money}</div>
        <div class="list-line">攻击加成：${bonus.attack}</div>
        <div class="list-line">防御加成：${bonus.defense}</div>
        <div class="list-line">综合战力：${getPowerValue()}</div>
      </div>
    </div>
  `);
}

function showBag() {
  currentView = "bag";

  const items = Object.keys(player.inventory)
    .filter(name => player.inventory[name] > 0)
    .map(name => `
      <tr>
        <td>
          <b>${name}</b><br>
          <small style="color:#666;">${getItemDetailText(name)}</small>
        </td>
        <td>${player.inventory[name]}</td>
        <td>${getItemTypeText(name)}</td>
        <td>
          <button class="small-btn" onclick="useItem('${name}')">使用/查看</button>
          ${equipData[name] ? `<button class="small-btn" onclick="equipItem('${name}')">穿戴</button>` : ""}
        </td>
      </tr>
    `).join("");

  setMainTitle("随身背包");
  setMainContent(`
    ${renderNoticeHtml()}
    <div class="table-box">
      <table>
        <thead>
          <tr>
            <th>物品</th>
            <th>数量</th>
            <th>类型</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${items || "<tr><td colspan='4'>空空如也</td></tr>"}
        </tbody>
      </table>
    </div>
  `);
}

function showEquip() {
  currentView = "equip";
  const bonus = getEquipBonus();

  setMainTitle("装备栏");
  setMainContent(`
    ${renderNoticeHtml()}
    <div class="status-grid">
      <div class="card">
        <h3>当前装备</h3>
        <div class="list-line">武器：${getEquipText(player.equips.weapon, "赤手空拳")}</div>
        <div class="list-line">衣服：${getEquipText(player.equips.armor, "粗布麻衣")}</div>
        <div class="list-line">鞋子：${getEquipText(player.equips.shoes, "草鞋")}</div>
      </div>

      <div class="card">
        <h3>装备总加成</h3>
        <div class="list-line">攻击：+${bonus.attack}</div>
        <div class="list-line">防御：+${bonus.defense}</div>
        <div class="list-line">综合战力：${getPowerValue()}</div>
      </div>
    </div>

    <div class="shop-actions">
      <button class="action-btn" onclick="unequipSlot('weapon')">卸下武器</button>
      <button class="action-btn" onclick="unequipSlot('armor')">卸下衣服</button>
      <button class="action-btn" onclick="unequipSlot('shoes')">卸下鞋子</button>
    </div>
  `);
}

function showShop() {
  currentView = "shop";

  const rows = shopItems.map((item, i) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.desc}</td>
      <td>${item.price}</td>
      <td>${item.type === "equip" ? "装备" : "物品"}</td>
      <td><button class="small-btn" onclick="buyShopItem(${i})">购买</button></td>
    </tr>
  `).join("");

  setMainTitle("江湖商城");
  setMainContent(`
    ${renderNoticeHtml()}
    <div class="table-box">
      <table>
        <thead>
          <tr>
            <th>商品</th>
            <th>说明</th>
            <th>价格</th>
            <th>类型</th>
            <th>购买</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `);
}

function showMarket() {
  currentView = "market";

  const rows = marketItems.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.price}</td>
      <td>${item.seller}</td>
      <td><button class="small-btn" onclick="buyMarketItem('${item.name}', ${item.price})">购买</button></td>
    </tr>
  `).join("");

  setMainTitle("江湖寄售行");
  setMainContent(`
    ${renderNoticeHtml()}
    <div class="table-box">
      <table>
        <thead>
          <tr>
            <th>物品</th>
            <th>数量</th>
            <th>单价</th>
            <th>卖家</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `);
}

function showSect() {
  currentView = "sect";

  const rows = sectList.map((item, i) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.req}</td>
      <td>${item.intro}</td>
      <td><button class="small-btn" onclick="joinSect(${i})">加入</button></td>
    </tr>
  `).join("");

  setMainTitle("江湖门派");
  setMainContent(`
    ${renderNoticeHtml()}
    <div class="table-box">
      <table>
        <thead>
          <tr>
            <th>门派</th>
            <th>要求</th>
            <th>简介</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `);
}

function showRank() {
  currentView = "rank";

  const rankData = [
    { name: player.name, value: getPowerValue(), tag: "当前角色" },
    { name: "秋风", value: 860, tag: "唐门" },
    { name: "断水", value: 780, tag: "武当" },
    { name: "孤城", value: 730, tag: "幽月宫" },
    { name: "听雪", value: 650, tag: "世外桃源" }
  ].sort((a, b) => b.value - a.value);

  const rows = rankData.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.name}</td>
      <td>${item.value}</td>
      <td>${item.tag}</td>
    </tr>
  `).join("");

  setMainTitle("江湖排行");
  setMainContent(`
    ${renderNoticeHtml()}
    <div class="table-box">
      <table>
        <thead>
          <tr>
            <th>排名</th>
            <th>玩家</th>
            <th>综合值</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `);
}

function showJob() {
  currentView = "job";

  const rows = jobList.map((item, i) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.intro}</td>
      <td>${item.gain}</td>
      <td><button class="small-btn" onclick="chooseJob(${i})">入职</button></td>
    </tr>
  `).join("");

  setMainTitle("江湖职业");
  setMainContent(`
    ${renderNoticeHtml()}
    <div class="notice">当前职业：<b>${player.job}</b></div>
    <div class="table-box">
      <table>
        <thead>
          <tr>
            <th>职业</th>
            <th>说明</th>
            <th>产出</th>
            <th>选择</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="shop-actions">
      <button class="action-btn" onclick="doJob()">执行职业动作</button>
    </div>
  `);
}

function showPharmacy() {
  currentView = "pharmacy";

  const recipeHtml = recipes.map((r, i) => {
    const canCraft = canCraftRecipe(r);
    const materialText = Object.keys(r.materials).map(name => {
      const own = player.inventory[name] || 0;
      return `${name}(${own}/${r.materials[name]})`;
    }).join("，");

    return `
      <div class="card">
        <h3>${r.name}</h3>
        <div class="list-line">${r.effect}</div>
        <div class="list-line">材料：${materialText}</div>
        <button class="small-btn" ${canCraft ? "" : "disabled"} onclick="craftMedicine(${i})">炼制</button>
      </div>
    `;
  }).join("");

  setMainTitle("神农药房");
  setMainContent(`
    ${renderNoticeHtml()}
    <div class="status-grid">
      ${recipeHtml || "<div class='card'>暂无药方</div>"}
    </div>
  `);
}
function showTrain() {
  currentView = "train";

  const rows = Object.keys(CULTIVATION_CONFIG).map(key => {
    const cfg = CULTIVATION_CONFIG[key];
    const level = getCultivationLevel(key);
    const bonus = getCultivationBonus(key);
    const cost = level >= cfg.maxLevel ? "已满级" : `${getCultivationCost(key)} 两`;

    return `
      <tr>
        <td>${cfg.name}</td>
        <td>${level} / ${cfg.maxLevel}</td>
        <td>${cfg.effectText}${bonus}</td>
        <td>${cost}</td>
        <td>
          <button class="small-btn" ${level >= cfg.maxLevel ? "disabled" : ""} onclick="doCultivationUpgrade('${key}')">
            提升
          </button>
        </td>
      </tr>
    `;
  }).join("");

  const summary = getCultivationSummary();

  setMainTitle("修炼系统");
  setMainContent(`
    ${renderNoticeHtml()}
    <div class="status-grid">
      <div class="card">
        <h3>当前修炼总览</h3>
        <div class="list-line">攻击修炼加成：+${summary.attack}</div>
        <div class="list-line">防御修炼加成：+${summary.defense}</div>
        <div class="list-line">气血修炼加成：+${summary.hp}</div>
        <div class="list-line">内力修炼加成：+${summary.mp}</div>
        <div class="list-line">抗性修炼加成：+${summary.resist}</div>
      </div>
    </div>

    <div class="table-box">
      <table>
        <thead>
          <tr>
            <th>修炼项目</th>
            <th>等级</th>
            <th>当前效果</th>
            <th>升级花费</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `);
}
function doCultivationUpgrade(type) {
  const ok = upgradeCultivation(type);
  if (!ok) {
    updateAll();
    showTrain();
    return;
  }

  updateAll();
  showTrain();
}

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


// ===== 6. 背包、装备、商城、药房 =====
function useItem(name) {
  if (!hasItem(name, 1)) {
    addLog("error", `你没有 ${name}。`);
    setNotice("error", `使用失败：你没有 ${name}。`);
    showBag();
    return;
  }

  if (name === "小还丹") {
    removeItem(name, 1);
    recoverHp(20);
    recoverMp(10);
    addLog("event", "你服下一颗小还丹，气血 +20，内力 +10。");
    setNotice("success", "使用成功：小还丹已生效。");
  } else if (name === "大还丹") {
    removeItem(name, 1);
    recoverHp(50);
    recoverMp(25);
    addLog("event", "你服下一颗大还丹，气血 +50，内力 +25。");
    setNotice("success", "使用成功：大还丹已生效。");
  } else if (name === "干粮") {
    removeItem(name, 1);
    recoverHp(8);
    addLog("event", "你吃下一份干粮，气血 +8。");
    setNotice("success", "使用成功：干粮已食用。");
  } else if (name === "清水") {
    removeItem(name, 1);
    recoverMp(8);
    addLog("event", "你喝下一份清水，内力 +8。");
    setNotice("success", "使用成功：清水已饮用。");
  } else {
    setNotice("info", getItemDetailText(name));
  }

  updateAll();
  showBag();
}

function equipItem(name) {
  if (!hasItem(name, 1)) {
    addLog("error", `你没有 ${name}，无法装备。`);
    setNotice("error", `装备失败：你没有 ${name}。`);
    showBag();
    return;
  }

  const equip = equipData[name];
  if (!equip) {
    addLog("error", `${name} 不是可装备物品。`);
    setNotice("error", `${name} 不是装备。`);
    showBag();
    return;
  }

  const slot = equip.slot;
  const oldEquip = player.equips[slot];

  if (oldEquip === name) {
    setNotice("info", `${name} 已经装备中。`);
    showBag();
    return;
  }

  if (oldEquip) addItem(oldEquip, 1);
  removeItem(name, 1);
  player.equips[slot] = name;

  addLog("event", `你装备了 ${name}。`);
  setNotice("success", `装备成功：${name}`);
  updateAll();
  showBag();
}

function unequipSlot(slot) {
  const current = player.equips[slot];
  if (!current) {
    setNotice("error", "该部位当前没有装备。");
    showEquip();
    return;
  }

  addItem(current, 1);
  player.equips[slot] = "";

  addLog("event", `你卸下了 ${current}。`);
  setNotice("success", `卸下成功：${current}`);
  updateAll();
  showEquip();
}

function buyShopItem(index) {
  const item = shopItems[index];
  if (!item) return;

  if (player.money < item.price) {
    addLog("error", `你的银两不足，买不起 ${item.name}。`);
    setNotice("error", "银两不足。");
    showShop();
    return;
  }

  player.money -= item.price;
  addItem(item.name, 1);

  addLog("event", `你购买了 ${item.name} 1个，花费 ${item.price} 两。`);
  setNotice("success", `购买成功：${item.name} x1`);
  updateAll();
  showShop();
}

function buyMarketItem(name, price) {
  if (player.money < price) {
    addLog("error", `银两不足，无法购买 ${name}。`);
    setNotice("error", "银两不足。");
    showMarket();
    return;
  }

  player.money -= price;
  addItem(name, 1);

  addLog("event", `你在寄售行买下了 ${name} 1个，花费 ${price} 两。`);
  setNotice("success", `购买成功：${name} x1`);
  updateAll();
  showMarket();
}

function craftMedicine(index) {
  const recipe = recipes[index];
  if (!recipe) return;

  if (!canCraftRecipe(recipe)) {
    setNotice("error", "材料不足，无法炼制。");
    showPharmacy();
    return;
  }

  consumeRecipeMaterials(recipe);
  recipe.action();
  clampPlayer();

  setNotice("success", `炼制成功：${recipe.name}`);
  updateAll();
  showPharmacy();
}


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
    normalizePlayerAfterLoad();
    normalizeLogs();
    updateAll();
    showHall();
    console.log("少年江湖 - 新版 game.js 启动成功");
  } catch (err) {
    console.error("江湖启动失败：", err);
  }
};