(function initUiRender(global) {
  const g = global || window;

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

  function showEquip() { currentView = "equip"; const bonus = getEquipBonus(); setMainTitle("装备栏"); setMainContent(`
    ${renderNoticeHtml()}
    <div class="status-grid"><div class="card"><h3>当前装备</h3><div class="list-line">武器：${getEquipText(player.equips.weapon, "赤手空拳")}</div><div class="list-line">衣服：${getEquipText(player.equips.armor, "粗布麻衣")}</div><div class="list-line">鞋子：${getEquipText(player.equips.shoes, "草鞋")}</div></div><div class="card"><h3>装备总加成</h3><div class="list-line">攻击：+${bonus.attack}</div><div class="list-line">防御：+${bonus.defense}</div><div class="list-line">综合战力：${getPowerValue()}</div></div></div><div class="shop-actions"><button class="action-btn" onclick="unequipSlot('weapon')">卸下武器</button><button class="action-btn" onclick="unequipSlot('armor')">卸下衣服</button><button class="action-btn" onclick="unequipSlot('shoes')">卸下鞋子</button></div>`); }
  function showShop() { currentView = "shop"; const rows = shopItems.map((item, i) => `<tr><td>${item.name}</td><td>${item.desc}</td><td>${item.price}</td><td>${item.type === "equip" ? "装备" : "物品"}</td><td><button class="small-btn" onclick="buyShopItem(${i})">购买</button></td></tr>`).join(""); setMainTitle("江湖商城"); setMainContent(`${renderNoticeHtml()}<div class="table-box"><table><thead><tr><th>商品</th><th>说明</th><th>价格</th><th>类型</th><th>购买</th></tr></thead><tbody>${rows}</tbody></table></div>`); }
  function showMarket() { currentView = "market"; const rows = marketItems.map(item => `<tr><td>${item.name}</td><td>${item.qty}</td><td>${item.price}</td><td>${item.seller}</td><td><button class="small-btn" onclick="buyMarketItem('${item.name}', ${item.price})">购买</button></td></tr>`).join(""); setMainTitle("江湖寄售行"); setMainContent(`${renderNoticeHtml()}<div class="table-box"><table><thead><tr><th>物品</th><th>数量</th><th>单价</th><th>卖家</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table></div>`); }
  function showSect() { currentView = "sect"; const rows = sectList.map((item, i) => `<tr><td>${item.name}</td><td>${item.req}</td><td>${item.intro}</td><td><button class="small-btn" onclick="joinSect(${i})">加入</button></td></tr>`).join(""); setMainTitle("江湖门派"); setMainContent(`${renderNoticeHtml()}<div class="table-box"><table><thead><tr><th>门派</th><th>要求</th><th>简介</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table></div>`); }
  function showRank() { currentView = "rank"; const rankData = [{ name: player.name, value: getPowerValue(), tag: "当前角色" }, { name: "秋风", value: 860, tag: "唐门" }, { name: "断水", value: 780, tag: "武当" }, { name: "孤城", value: 730, tag: "幽月宫" }, { name: "听雪", value: 650, tag: "世外桃源" }].sort((a, b) => b.value - a.value); const rows = rankData.map((item, i) => `<tr><td>${i + 1}</td><td>${item.name}</td><td>${item.value}</td><td>${item.tag}</td></tr>`).join(""); setMainTitle("江湖排行"); setMainContent(`${renderNoticeHtml()}<div class="table-box"><table><thead><tr><th>排名</th><th>玩家</th><th>综合值</th><th>备注</th></tr></thead><tbody>${rows}</tbody></table></div>`); }
  function showJob() { currentView = "job"; const rows = jobList.map((item, i) => `<tr><td>${item.name}</td><td>${item.intro}</td><td>${item.gain}</td><td><button class="small-btn" onclick="chooseJob(${i})">入职</button></td></tr>`).join(""); setMainTitle("江湖职业"); setMainContent(`${renderNoticeHtml()}<div class="notice">当前职业：<b>${player.job}</b></div><div class="table-box"><table><thead><tr><th>职业</th><th>说明</th><th>产出</th><th>选择</th></tr></thead><tbody>${rows}</tbody></table></div><div class="shop-actions"><button class="action-btn" onclick="doJob()">执行职业动作</button></div>`); }
  function showPharmacy() { currentView = "pharmacy"; const recipeHtml = recipes.map((r, i) => { const canCraft = canCraftRecipe(r); const materialText = Object.keys(r.materials).map(name => { const own = player.inventory[name] || 0; return `${name}(${own}/${r.materials[name]})`; }).join("，"); return `<div class="card"><h3>${r.name}</h3><div class="list-line">${r.effect}</div><div class="list-line">材料：${materialText}</div><button class="small-btn" ${canCraft ? "" : "disabled"} onclick="craftMedicine(${i})">炼制</button></div>`; }).join(""); setMainTitle("神农药房"); setMainContent(`${renderNoticeHtml()}<div class="status-grid">${recipeHtml || "<div class='card'>暂无药方</div>"}</div>`); }
  function showTrain() { currentView = "train"; const rows = Object.keys(CULTIVATION_CONFIG).map(key => { const cfg = CULTIVATION_CONFIG[key]; const level = getCultivationLevel(key); const bonus = getCultivationBonus(key); const cost = level >= cfg.maxLevel ? "已满级" : `${getCultivationCost(key)} 两`; return `<tr><td>${cfg.name}</td><td>${level} / ${cfg.maxLevel}</td><td>${cfg.effectText}${bonus}</td><td>${cost}</td><td><button class="small-btn" ${level >= cfg.maxLevel ? "disabled" : ""} onclick="doCultivationUpgrade('${key}')">提升</button></td></tr>`; }).join(""); const summary = getCultivationSummary(); setMainTitle("修炼系统"); setMainContent(`${renderNoticeHtml()}<div class="status-grid"><div class="card"><h3>当前修炼总览</h3><div class="list-line">攻击修炼加成：+${summary.attack}</div><div class="list-line">防御修炼加成：+${summary.defense}</div><div class="list-line">气血修炼加成：+${summary.hp}</div><div class="list-line">内力修炼加成：+${summary.mp}</div><div class="list-line">抗性修炼加成：+${summary.resist}</div></div></div><div class="table-box"><table><thead><tr><th>修炼项目</th><th>等级</th><th>当前效果</th><th>升级花费</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table></div>`); }

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

  g.__JH_UI_RENDER__ = {
    updateTopBar,
    updateOnlineList,
    updateAll,
    setMainTitle,
    setMainContent,
    renderHallLog,
    refreshCurrentView,
    showHall,
    showStatus,
    showBag,
    showEquip,
    showShop,
    showMarket,
    showSect,
    showRank,
    showJob,
    showPharmacy,
    showTrain,
    doCultivationUpgrade
  };
})(window);
