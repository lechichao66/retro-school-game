(function initUiRender(global) {
  const g = global || window;

  function updateTopBar() {
    applyNaturalRecovery();
    if (window.__JH_GAME_ACTIONS__?.processHangupSettlement) window.__JH_GAME_ACTIONS__.processHangupSettlement(false);
    clampPlayer();

    const panel = getPlayerPanelData();

    document.getElementById("playerName").textContent = panel.name;
    document.getElementById("sect").textContent = `${panel.sect} / ${panel.job}`;
    document.getElementById("title").textContent = panel.title;
    document.getElementById("hp").textContent = `${panel.hp} / ${panel.maxHp}`;
    document.getElementById("mp").textContent = `${panel.mp} / ${panel.maxMp}`;
    document.getElementById("stamina").textContent = `${player.stamina?.current || 0} / ${player.stamina?.max || 0}`;
    document.getElementById("vigor").textContent = `${player.vigor?.current || 0} / ${player.vigor?.max || 0}`;
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
      task: showTask,
      martial: showMartial,
      battleLog: showBattleLog,
      logbook: showLogbook,
      changelog: showChangelog,
      treasure: showTreasure,
      dungeon: showDungeon,
      codex: showCodex,
      debug: showDebugPanel,
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

    const hangupState = player.hangup || {};
    const lobbyStatus = hangupState?.lobby?.active ? "进行中" : "未开启";
    const sectStatus = hangupState?.sectDuty?.active ? "进行中" : "未开启";
    const adventureSummary = (getLogbookEntries("adventure", 1)[0]?.text) || "暂无";
    const dungeonSummary = (getLogbookEntries("dungeon", 1)[0]?.text) || "暂无";
    const treasureSummary = (getLogbookEntries("treasure", 1)[0]?.text) || "暂无";
    const hangupSummary = (getLogbookEntries("hangup", 1)[0]?.text) || "暂无";
    const sectHangupSummary = (getLogbookEntries("sectHangup", 1)[0]?.text) || "暂无";

    setMainTitle(`江湖大厅 - ${loc}`);
    setMainContent(`
      ${renderNoticeHtml()}

      <div style="background:#f9f9f9; padding:10px; border-left:4px solid #800000; margin-bottom:10px; font-size:0.95em;">
        <b>当前地界：</b>${mapInfo ? mapInfo.desc : "神秘区域"}<br><b>推荐等级：</b>${mapInfo?.levelRange || "未知"}
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
        <button class="action-btn" onclick="bubblePoint()">${lobbyStatus === "进行中" ? "停止泡点挂机" : "开始泡点挂机"}</button>
        <button class="action-btn" onclick="work()">跑商赚钱</button>
        <button class="action-btn" style="background:#800000; color:white;" onclick="startAdventure()">
          探索${loc}
        </button>
        <button class="action-btn" onclick="showLogbook('hall')">日志总览</button>
        <button class="action-btn" onclick="showBattleLog('hall')">战斗日志</button>
        <button class="action-btn" onclick="showChangelog('hall')">更新日志</button>
        <button class="action-btn" onclick="showTreasure()">宝图</button>
        <button class="action-btn" onclick="showDungeon()">副本</button>
        <button class="action-btn" onclick="showCodex()">百科</button>
      </div>

      <div class="card" style="margin:10px 0;">
        <h3>大厅日志摘要</h3>
        <div class="list-line">泡点挂机：${lobbyStatus} ｜ 门派挂机：${sectStatus}</div>
        <div class="list-line">冒险：${adventureSummary}</div>
        <div class="list-line">副本：${dungeonSummary}</div>
        <div class="list-line">宝图：${treasureSummary}</div>
        <div class="list-line">泡点：${hangupSummary}</div>
        <div class="list-line">门派挂机：${sectHangupSummary}</div>
        <div class="notice">表现层预留：后续可在大厅接入像素头像/小人动作（练功、巡逻、打斗）动画。</div>
      </div>

      <div id="hallLogBox" class="log-box" style="height:460px; min-height:460px; max-height:460px; overflow-y:auto;"></div>
    `);

    renderHallLog();
  }

  function showStatus() {
    currentView = "status";
    const bonus = getEquipBonus();
    const adv = window.__JH_SELECTORS__?.getDerivedCombatStatsValue?.() || {};

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
          <div class="list-line">体力：${player.stamina?.current || 0} / ${player.stamina?.max || 0}</div>
          <div class="list-line">活力：${player.vigor?.current || 0} / ${player.vigor?.max || 0}</div>
          <div class="list-line">银两：${player.money}</div>
          <div class="list-line">攻击加成：${bonus.attack}</div>
          <div class="list-line">防御加成：${bonus.defense}</div>
          <div class="list-line">暴击率：${adv.critRate || 0}%</div>
          <div class="list-line">暴击伤害：${adv.critDamage || 150}%</div>
          <div class="list-line">抗性：${adv.resist || 0}</div>
          <div class="list-line">真实伤害：${adv.trueDamage || 0}</div>
          <div class="list-line">弱点伤害：${adv.weakHit || 0}%</div>
          <div class="list-line">伤害减免：${adv.damageReduce || 0}</div>
          <div class="list-line">综合战力：${getPowerValue()}</div>
        </div>
      </div>
    `);
  }

  function showBag() {
    currentView = "bag";

    const items = Object.keys(player.inventory)
      .filter(name => player.inventory[name] > 0)
      .map(name => {
        const equipInfo = equipData[name] ? getEquipDisplayParts(name) : null;
        return `
          <tr>
            <td>
              <b>${equipInfo ? equipInfo.titleHtml : name}</b><br>
              <small style="color:#666;">${getItemDetailText(name)}</small>
            </td>
            <td>${player.inventory[name]}</td>
            <td>${getItemTypeText(name)}</td>
            <td>
              <button class="small-btn" onclick="useItem('${name}')">使用/查看</button>
              ${equipData[name] ? `<button class="small-btn" onclick="equipItem('${name}')">穿戴</button>` : ""}
            </td>
          </tr>
        `;
      }).join("");

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
    const slotRows = [
      ["weapon", "武器", "赤手空拳"],
      ["armor", "衣服", "粗布麻衣"],
      ["hat", "帽子", "无帽"],
      ["belt", "腰带", "无腰带"],
      ["shoes", "鞋子", "草鞋"],
      ["necklace", "项链", "无项链"],
      ["artifact", "法宝", "无法宝"]
    ];
    const detailSlot = g.currentEquipDetailSlot || "";
    const detailName = player.equips[detailSlot] || "";

    setMainTitle("装备栏");
    setMainContent(`
      ${renderNoticeHtml()}
      <div class="status-grid">
        <div class="card">
          <h3>当前装备（7部位）</h3>
          ${slotRows.map(([slot, name, emptyName]) => {
            const equipName = player.equips[slot];
            const equipInfo = equipName ? getEquipDisplayParts(equipName) : null;
            const affixSummary = equipInfo ? `（词缀简写：${equipInfo.affixShort}）` : "";
            return `<div class="list-line">${name}：${getEquipText(equipName, emptyName)} ${equipName ? affixSummary : ""} ${equipName ? `<button class="small-btn" onclick="showEquipDetail('${slot}')">查看详情</button>` : ""}</div>`;
          }).join("")}
        </div>
        <div class="card">
          <h3>装备总加成</h3>
          <div class="list-line">攻击：+${bonus.attack}</div>
          <div class="list-line">防御：+${bonus.defense}</div>
          <div class="list-line">综合战力：${getPowerValue()}</div>
        </div>
      </div>
      <div class="shop-actions">
        ${slotRows.map(([slot, name]) => `<button class="action-btn" onclick="unequipSlot('${slot}')">卸下${name}</button>`).join("")}
      </div>
      <div class="card" style="margin-top:10px;">
        <h3>装备详情面板</h3>
        ${detailName ? getEquipDetailPanel(detailName) : "<div class='list-line'>请选择一件已装备物品查看详情。</div>"}
      </div>
    `);
  }

  function getEquipDetailPanel(name) {
    const info = getEquipDisplayParts(name);
    const equip = info.equip;
    if (!equip) return "<div class='list-line'>该装备数据不存在。</div>";

    const quality = getEquipQualityMeta(equip.quality);
    const baseAttack = equip.baseStats?.attack || equip.attack || 0;
    const baseDefense = equip.baseStats?.defense || equip.defense || 0;
    const affixes = Array.isArray(equip.affixes) ? equip.affixes : [];
    const effects = Array.isArray(equip.specialEffects) ? equip.specialEffects : [];
    const extraStats = equip.extraStats && typeof equip.extraStats === "object"
      ? Object.entries(equip.extraStats).map(([k, v]) => `${getStatLabel(k)}+${v}`).join("，")
      : "无";

    return `
      <div class="list-line"><b style="color:${quality.color}">[${quality.name}] ${name}</b></div>
      <div class="list-line">基础属性：攻击 +${baseAttack} / 防御 +${baseDefense}</div>
      <div class="list-line">额外属性：${extraStats}</div>
      <div class="list-line">词缀（完整）：${info.affixFull}</div>
      <div class="list-line">特殊效果：${effects.length ? effects.map((x) => getSpecialEffectText(x)).join("，") : "无"}</div>
      <div class="list-line">说明：${equip.desc || "暂无"}</div>
    `;
  }

  function showShop() {
    currentView = "shop";
    const selectedCategory = g.shopCategory || "全部";
    const categories = ["全部", ...new Set(shopItems.map((x) => x.category || (x.type === "equip" ? "装备" : "杂货")))];
    const filtered = selectedCategory === "全部" ? shopItems : shopItems.filter((x) => (x.category || (x.type === "equip" ? "装备" : "杂货")) === selectedCategory);
    const rows = filtered.map((item) => {
      const idx = shopItems.findIndex((x) => x.name === item.name);
      return `<tr><td>${item.name}</td><td>${item.desc}</td><td>${item.price}</td><td>${item.category || "杂货"}</td><td><button class="small-btn" onclick="buyShopItem(${idx})">购买</button></td></tr>`;
    }).join("");

    setMainTitle("江湖商城");
    setMainContent(`${renderNoticeHtml()}
      <div class="shop-actions">${categories.map((c) => `<button class="action-btn" style="background:${c === selectedCategory ? "#800000" : "#f2e9d8"}; color:${c === selectedCategory ? "#fff" : "#222"};" onclick="setShopCategory('${c}')">${c}</button>`).join("")}</div>
      <div class="table-box scroll-box"><table><thead><tr><th>商品</th><th>说明</th><th>价格</th><th>分类</th><th>购买</th></tr></thead><tbody>${rows || "<tr><td colspan='5'>该分类暂无商品</td></tr>"}</tbody></table></div>`);
  }
  function showMarket() { currentView = "market"; const rows = marketItems.map(item => `<tr><td>${item.name}</td><td>${item.qty}</td><td>${item.price}</td><td>${item.seller}</td><td><button class="small-btn" onclick="buyMarketItem('${item.name}', ${item.price})">购买</button></td></tr>`).join(""); setMainTitle("江湖寄售行"); setMainContent(`${renderNoticeHtml()}<div class="table-box"><table><thead><tr><th>物品</th><th>数量</th><th>单价</th><th>卖家</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table></div>`); }
  function showSect() {
    currentView = "sect";
    const tab = g.sectTab || "overview";
    const currentSect = sectList.find((x) => x.name === player.sect);
    const sectMartial = martialArtsBySect[player.sect] || martialArtsBySect["无门无派"] || { skills: [] };
    const rows = sectList.map((item, i) => `<tr><td>${item.name}</td><td>${item.req}</td><td>${item.intro}<br><small style='color:#666;'>秘技：${item.passiveName || "暂无"}（${item.passiveDesc || "待开放"}）</small></td><td><button class="small-btn" onclick="joinSect(${i})">加入</button></td></tr>`).join("");
    const grouped = (sectMartial.skills || []).reduce((acc, skill) => {
      const key = skill.category || "武功";
      if (!acc[key]) acc[key] = [];
      acc[key].push(skill);
      return acc;
    }, {});
    const martialRows = Object.keys(grouped).map((cat) => `<div class='card'><h3>${cat}</h3>${grouped[cat].map((skill) => {
      const mastery = player.martial?.mastery?.[skill.id] || 0;
      const learned = (player.martial?.learned || []).includes(skill.id);
      const reducedMoney = getMartialResearchCost(skill, "resource");
      return `<div class='list-line'><b>${skill.name}</b>【${skill.grade || "不入流"}】</div><div class='list-line'>学习条件：等级${skill.learnReq?.level || 1}、贡献${skill.learnReq?.contribution || 0}、银两${skill.learnReq?.money || 0}</div><div class='list-line'>熟练度：${mastery}　研习银两：${reducedMoney}</div><div class='list-line'>效果：${skill.effect}</div><div class='shop-actions'>${learned ? "<button class='small-btn' disabled>已学会</button>" : `<button class='small-btn' onclick="learnMartialSkill('${skill.id}')">学习</button>`}<button class='small-btn' onclick="trainMartialSkill('${skill.id}','battle')">战斗研习</button><button class='small-btn' onclick="trainMartialSkill('${skill.id}','resource')">银两研习</button></div><hr>`;
    }).join("")}</div>`).join("");
    const sectDutyActive = player.hangup?.sectDuty?.active;
    const sectTaskInfo = `<div class='card'><h3>师门成长闭环（首版）</h3><div class='list-line'>门派贡献：${player.sectContribution || 0}　门派声望：${player.sectReputation || 0}</div><div class='list-line'>来源：师门任务 / 门派值守挂机（每分钟 +10） / 后续活动。</div><div class='list-line'>用途：门派武功学习、门派称号兑换、丹药材料、秘技解锁。</div><div class='shop-actions'><button class='small-btn' onclick="setTaskTab('sect');showTask()">前往接取师门任务</button><button class='small-btn' onclick="toggleSectDutyHangup()">${sectDutyActive ? "停止门派值守挂机" : "开始门派值守挂机"}</button><button class='small-btn' onclick="showLogbook('sectHangup')">查看门派挂机日志</button><button class='small-btn' onclick="redeemSectReward('title')">兑换门派称号（200贡献）</button><button class='small-btn' onclick="redeemSectReward('pill')">兑换特殊丹药（120贡献）</button><button class='small-btn' onclick="redeemSectReward('material')">兑换特殊材料（80贡献）</button><button class='small-btn' onclick="redeemSectReward('passive')">解锁门派秘技（300贡献）</button></div></div>`;
    const exchangePanel = `<div class='card'><h3>师门兑换</h3><div class='list-line'>本页为首版入口，后续将扩展更多门派专属商品。</div>${sectTaskInfo}</div>`;
    const titlePanel = `<div class='card'><h3>门派称号</h3><div class='list-line'>当前称号：${player.title}</div><div class='list-line'>完成师门任务并积累贡献可提升门派身份。</div>${sectTaskInfo}</div>`;
    const contentMap = {
      overview: `<div class='card'><div class='list-line'><b>当前门派：</b>${player.sect}</div><div class='list-line'><b>当前秘技：</b>${currentSect?.passiveName || "暂无"} ${currentSect?.passiveDesc || ""}</div><div class='list-line'>门派页面整合：总览 / 武功 / 师门任务 / 门派称号 / 师门兑换</div></div><div class="table-box"><table><thead><tr><th>门派</th><th>要求</th><th>简介</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table></div>`,
      martial: `<div class='card'><div class='list-line'><b>武功阶段规则：</b>10级前使用基础技能，10级后以门派武学为主，基础技能保留为默认技。</div><div class='list-line'><b>武学品级体系：</b>不入流 → 三流 → 二流 → 一流 → 顶级（更高层级预留）。</div></div><div class='status-grid'>${martialRows || "<div class='card'>当前门派武学未开放。</div>"}</div>`,
      tasks: sectTaskInfo,
      title: titlePanel,
      exchange: exchangePanel
    };
    setMainTitle("江湖门派");
    setMainContent(`${renderNoticeHtml()}<div class='shop-actions'>${[
      ["overview", "门派总览"],
      ["martial", "门派武功"],
      ["tasks", "师门任务"],
      ["title", "门派称号"],
      ["exchange", "师门兑换"]
    ].map(([key, label]) => `<button class='action-btn' style='background:${tab === key ? "#800000" : "#f2e9d8"};color:${tab === key ? "#fff" : "#222"};' onclick="setSectTab('${key}')">${label}</button>`).join("")}</div>${contentMap[tab] || contentMap.overview}`);
  }
  function showRank() { currentView = "rank"; const rankData = [{ name: player.name, value: getPowerValue(), tag: "当前角色" }, { name: "秋风", value: 860, tag: "唐门" }, { name: "断水", value: 780, tag: "武当" }, { name: "孤城", value: 730, tag: "幽月宫" }, { name: "听雪", value: 650, tag: "世外桃源" }].sort((a, b) => b.value - a.value); const rows = rankData.map((item, i) => `<tr><td>${i + 1}</td><td>${item.name}</td><td>${item.value}</td><td>${item.tag}</td></tr>`).join(""); setMainTitle("江湖排行"); setMainContent(`${renderNoticeHtml()}<div class="table-box"><table><thead><tr><th>排名</th><th>玩家</th><th>综合值</th><th>备注</th></tr></thead><tbody>${rows}</tbody></table></div>`); }
  function showJob() { currentView = "job"; const rows = jobList.map((item, i) => `<tr><td>${item.name}</td><td>${item.intro}</td><td>${item.gain}</td><td><button class="small-btn" onclick="chooseJob(${i})">入职</button></td></tr>`).join(""); setMainTitle("江湖职业"); setMainContent(`${renderNoticeHtml()}<div class="notice">当前职业：<b>${player.job}</b></div><div class="table-box"><table><thead><tr><th>职业</th><th>说明</th><th>产出</th><th>选择</th></tr></thead><tbody>${rows}</tbody></table></div><div class="shop-actions"><button class="action-btn" onclick="doJob()">执行职业动作</button><button class="action-btn" onclick="work()">跑商赚钱（体力换银两）</button></div>`); }
  function showPharmacy() { currentView = "pharmacy"; const recipeHtml = recipes.map((r, i) => { const canCraft = canCraftRecipe(r); const materialText = Object.keys(r.materials).map(name => { const own = player.inventory[name] || 0; return `${name}(${own}/${r.materials[name]})`; }).join("，"); return `<div class="card"><h3>${r.name}</h3><div class="list-line">${r.effect}</div><div class="list-line">材料：${materialText}</div><button class="small-btn" ${canCraft ? "" : "disabled"} onclick="craftMedicine(${i})">炼制</button></div>`; }).join(""); setMainTitle("神农药房"); setMainContent(`${renderNoticeHtml()}<div class="status-grid">${recipeHtml || "<div class='card'>暂无药方</div>"}</div>`); }
  function showTrain() { currentView = "train"; const unlockLevel = window.CULTIVATION_UNLOCK_LEVEL || 20; const unlocked = (player.level || 1) >= unlockLevel; const rows = Object.keys(CULTIVATION_CONFIG).map(key => { const cfg = CULTIVATION_CONFIG[key]; const level = getCultivationLevel(key); const bonus = getCultivationBonus(key); const pct = Math.floor((getCultivationGrowthPercent(key) || 0) * 1000) / 10; const cost = !unlocked ? `未解锁（${unlockLevel}级）` : level >= cfg.maxLevel ? "已满级" : `${getCultivationCost(key)} 两`; return `<tr><td>${cfg.name}</td><td>${level} / ${cfg.maxLevel}</td><td>${cfg.effectText}${bonus}${pct > 0 ? `（额外 ${pct}%）` : ""}</td><td>${cost}</td><td><button class="small-btn" ${!unlocked || level >= cfg.maxLevel ? "disabled" : ""} onclick="doCultivationUpgrade('${key}')">提升</button></td></tr>`; }).join(""); const summary = getCultivationSummary(); const lockText = unlocked ? `已解锁：你当前等级 ${player.level}。` : `未解锁：修炼系统需 ${unlockLevel} 级开启，你当前为 ${player.level} 级。`; setMainTitle("修炼系统"); setMainContent(`${renderNoticeHtml()}<div class="status-grid"><div class="card"><h3>当前修炼总览</h3><div class="list-line">${lockText}</div><div class="list-line">攻击修炼加成：+${summary.attack}</div><div class="list-line">防御修炼加成：+${summary.defense}</div><div class="list-line">气血修炼加成：+${summary.hp}</div><div class="list-line">内力修炼加成：+${summary.mp}</div><div class="list-line">抗性修炼加成：+${summary.resist}</div><div class="list-line">修炼额外战力：${Math.floor((summary.attack + summary.defense + summary.hp / 2 + summary.mp / 2) * 3)}</div></div></div><div class="table-box"><table><thead><tr><th>修炼项目</th><th>等级</th><th>当前效果</th><th>升级花费</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table></div>`); }


  function showTask() {
    currentView = "task";
    const activeIds = new Set(player.activeTasks || []);
    const activeTab = g.taskTab || "main";
    const page = Number(g.taskPage || 1);
    const currentType = taskTypeList.find((x) => x.key === activeTab) || taskTypeList[0];
    const filteredTasks = (taskTemplates || []).filter((x) => x.type === currentType.key && player.level >= (x.minLevel || 1));
    const pageSize = 3;
    const totalPage = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
    const safePage = Math.min(totalPage, Math.max(1, page));
    g.taskPage = safePage;
    const tasks = filteredTasks.slice((safePage - 1) * pageSize, safePage * pageSize);
    const cards = (() => {
      const rows = tasks.map((task) => {
        const progress = player.taskProgress?.[task.id] || 0;
        const target = task.objective?.count || 1;
        const completed = progress >= target;
        const accepted = activeIds.has(task.id);
        return `<div class="card"><div class="list-line"><b>${task.name}</b>（Lv${task.minLevel}+）</div><div class="list-line">${task.desc}</div><div class="list-line">进度：${Math.min(progress, target)} / ${target}</div><div class="list-line">奖励：银两${task.reward.money || 0}，经验${task.reward.exp || 0}</div><div class="shop-actions">${!accepted ? `<button class='small-btn' onclick="acceptTask('${task.id}')">接取</button>` : `<button class='small-btn' disabled>进行中</button>`}${accepted && completed ? `<button class='small-btn' onclick="claimTask('${task.id}')">提交</button>` : ""}</div></div>`;
      }).join("");
      return `<div class="card"><h3>${currentType.name}</h3><div class="list-line">${currentType.desc}</div>${rows || "<div class='list-line'>当前无可接任务。</div>"}</div>`;
    })();

    setMainTitle("任务榜");
    setMainContent(`${renderNoticeHtml()}<div class='shop-actions'>${taskTypeList.map((type) => `<button class='action-btn' style='background:${type.key === currentType.key ? "#800000" : "#f2e9d8"};color:${type.key === currentType.key ? "#fff" : "#222"};' onclick="setTaskTab('${type.key}')">${type.name}</button>`).join("")}</div><div class="status-grid">${cards}</div><div class='shop-actions'><button class='small-btn' ${safePage <= 1 ? "disabled" : ""} onclick='setTaskPage(-1)'>上一页</button><span>第 ${safePage} / ${totalPage} 页</span><button class='small-btn' ${safePage >= totalPage ? "disabled" : ""} onclick='setTaskPage(1)'>下一页</button></div>`);
  }

  function showMartial() {
    g.sectTab = "martial";
    showSect();
  }

  function showBattleLog(mode) {
    if (mode === "hall") {
      const battleLogs = (window.__JH_RUNTIME_STATE__?.getBattleLogs?.() || []).slice(0, 12);
      const rows = battleLogs.map((item) => `<div class='log-line ${item.type}'><span style='color:#777;'>[${item.time}]</span> ${item.text}</div>`).join("");
      setNotice("info", "已在大厅内展开战斗日志（首版内嵌）。");
      setMainContent(`${document.getElementById("mainContent").innerHTML}<div class='card' style='margin-top:8px;'><h3>大厅内嵌 · 战斗日志</h3><div class='log-box' style='height:180px;overflow-y:auto;'>${rows || "暂无战斗日志。"}</div></div>`);
      return;
    }
    currentView = "battleLog";
    const battleLogs = (window.__JH_RUNTIME_STATE__?.getBattleLogs?.() || []).slice(0, 60);
    const rows = battleLogs.map((item) => `<div class='log-line ${item.type}'><span style='color:#777;'>[${item.time}]</span> ${item.text}</div>`).join("");
    setMainTitle("战斗日志");
    setMainContent(`${renderNoticeHtml()}<div class='card'><div class='list-line'>展示最近战斗、掉落、技能与状态触发记录。</div></div><div class='log-box' style='height:520px;overflow-y:auto;'>${rows || "暂无战斗日志。"}</div>`);
  }

  function showLogbook(mode) {
    if (mode === "hall") {
      const packs = [
        ["副本", getLogbookEntries("dungeon", 1)[0]?.text || "暂无"],
        ["宝图", getLogbookEntries("treasure", 1)[0]?.text || "暂无"],
        ["泡点挂机", getLogbookEntries("hangup", 1)[0]?.text || "暂无"],
        ["门派挂机", getLogbookEntries("sectHangup", 1)[0]?.text || "暂无"]
      ];
      setNotice("info", "已在大厅展开日志摘要。");
      setMainContent(`${document.getElementById("mainContent").innerHTML}<div class='card' style='margin-top:8px;'><h3>大厅内嵌 · 日志摘要</h3>${packs.map((x) => `<div class='list-line'>${x[0]}：${x[1]}</div>`).join("")}<div class='shop-actions'><button class='small-btn' onclick=\"showLogbook()\">进入完整日志系统</button></div></div>`);
      return;
    }
    currentView = "logbook";
    const tabs = [
      ["adventure", "冒险日志"],
      ["dungeon", "副本日志"],
      ["treasure", "宝图日志"],
      ["hangup", "泡点挂机日志"],
      ["sectHangup", "门派挂机日志"],
      ["economy", "营生日志"]
    ];
    if (typeof mode === "string" && tabs.some(([key]) => key === mode)) {
      g.logbookTab = mode;
    }
    const tab = g.logbookTab || "adventure";
    const rows = getLogbookEntries(tab, 80).map((item) => `<div class='log-line event'><span style='color:#777;'>[${item.time}]</span> ${item.text}</div>`).join("");
    setMainTitle("大日志系统");
    setMainContent(`${renderNoticeHtml()}<div class='shop-actions'>${tabs.map(([key, label]) => `<button class='action-btn' style='background:${tab === key ? "#800000" : "#f2e9d8"};color:${tab === key ? "#fff" : "#222"};' onclick="showLogbook('${key}')">${label}</button>`).join("")}</div><div class='card'><div class='list-line'>大厅仅展示摘要；完整记录统一在此按分类查看。</div></div><div class='log-box' style='height:500px;overflow-y:auto;'>${rows || "该分类暂无记录。"}</div>`);
  }

  function showChangelog(mode) {
    if (mode === "hall") {
      const info = g.__JH_DATA__?.versionLog || {};
      setNotice("info", "已在大厅内展开更新摘要。");
      setMainContent(`${document.getElementById("mainContent").innerHTML}<div class='card' style='margin-top:8px;'><h3>大厅内嵌 · 更新日志</h3><div class='list-line'>版本：${info.version || "未定义"}（${info.updatedAt || "未定义"}）</div>${(info.features || []).slice(0, 4).map((x) => `<div class='list-line'>- ${x}</div>`).join("")}</div>`);
      return;
    }
    currentView = "changelog";
    const info = g.__JH_DATA__?.versionLog || {};
    setMainTitle("更新日志 / 版本公告");
    setMainContent(`
      ${renderNoticeHtml()}
      <div class="card">
        <div class="list-line"><b>当前版本：</b>${info.version || "未定义"}</div>
        <div class="list-line"><b>更新时间：</b>${info.updatedAt || "未定义"}</div>
      </div>
      <div class="status-grid">
        <div class="card"><h3>本次功能更新</h3>${(info.features || []).map((x) => `<div class="list-line">- ${x}</div>`).join("") || "<div class='list-line'>暂无</div>"}</div>
        <div class="card"><h3>数值调整</h3>${(info.balance || []).map((x) => `<div class="list-line">- ${x}</div>`).join("") || "<div class='list-line'>暂无</div>"}</div>
        <div class="card"><h3>测试重点</h3>${(info.testFocus || []).map((x) => `<div class="list-line">- ${x}</div>`).join("") || "<div class='list-line'>暂无</div>"}</div>
        <div class="card"><h3>已知问题</h3>${(info.knownIssues || []).map((x) => `<div class="list-line">- ${x}</div>`).join("") || "<div class='list-line'>暂无</div>"}</div>
      </div>
    `);
  }

  function showTreasure() {
    currentView = "treasure";
    const maps = player.treasureMaps || [];
    const rows = maps.map((entry, idx) => `<div class='card'><div class='list-line'><b>${entry.name}</b>（目标：${entry.area}）</div><div class='list-line'>状态：${entry.used ? "已使用" : "可使用"}</div><div class='shop-actions'><button class='small-btn' onclick='useTreasureMap(${idx})' ${entry.used ? "disabled" : ""}>使用宝图</button><button class='small-btn' onclick='digTreasure(${idx})' ${entry.used ? "" : "disabled"}>挖宝</button></div></div>`).join("");
    setMainTitle("宝图入口（首版）");
    setMainContent(`${renderNoticeHtml()}<div class='card'><div class='list-line'>玩法：获得宝图 → 使用宝图 → 挖宝（可能遇怪）→ 获得掉落。</div><div class='shop-actions'><button class='small-btn' onclick='grantTreasureMap()'>获得一张样板宝图</button></div></div>${rows || "<div class='card'>暂无宝图，可先领取样板。</div>"}`);
  }

  function showDungeon() {
    currentView = "dungeon";
    const dungeons = g.__JH_DATA__?.dungeonTemplates || [];
    const rows = dungeons.map((d) => `<div class='card'><h3>${d.name}</h3><div class='list-line'>建议战力：${d.recommendedPower}（高于普通探索）</div><div class='list-line'>要求：等级${d.minLevel}+，体力消耗${d.staminaCost}</div><div class='list-line'>奖励：银两${d.reward.money}，经验${d.reward.exp}</div><div class='shop-actions'><button class='small-btn' onclick="runDungeon('${d.id}')">进入副本</button></div></div>`).join("");
    setMainTitle("副本入口（首版）");
    const latest = getLogbookEntries("dungeon", 1)[0];
    setMainContent(`${renderNoticeHtml()}<div class='card'><div class='list-line'>副本定位：门槛高于普通探索，奖励更好，先做小样板。</div><div class='list-line'>最近一次副本：${latest ? `${latest.time} ${latest.text}` : "暂无记录"}</div><div class='shop-actions'><button class='small-btn' onclick="showLogbook('dungeon')">查看完整副本日志</button></div></div><div class='status-grid'>${rows}</div>`);
  }

  function showCodex() {
    currentView = "codex";
    const sections = g.__JH_DATA__?.encyclopediaSections || {};
    const render = (title, list) => `<div class='card'><h3>${title}</h3>${(list || []).map((x) => `<div class='list-line'>- ${x}</div>`).join("") || "<div class='list-line'>暂无</div>"}</div>`;
    setMainTitle("百科全书（首版）");
    setMainContent(`${renderNoticeHtml()}<div class='status-grid'>${render("属性说明", sections.attrs)}${render("词缀说明", sections.affix)}${render("门派特色", sections.sect)}${render("武学类别", sections.martial)}${render("特殊效果说明", sections.effects)}${render("辅助职业说明", sections.assistant)}</div>`);
  }

  function showDebugPanel() {
    currentView = "debug";
    setMainTitle("调试入口（隐藏测试功能）");
    setMainContent(`
      ${renderNoticeHtml()}
      <div class="shop-actions">
        <button class="action-btn" onclick="debugSetLevel(10)">升到10级</button>
        <button class="action-btn" onclick="debugSetLevel(20)">升到20级</button>
        <button class="action-btn" onclick="debugSetLevel(30)">升到30级</button>
        <button class="action-btn" onclick="debugSetLevel(40)">升到40级</button>
      </div>
      <div class="shop-actions">
        <button class="action-btn" onclick="debugAddMoney(1000)">+1000银两</button>
        <button class="action-btn" onclick="debugCultivateAll(5)">修炼全体+5级</button>
        <button class="action-btn" onclick="debugFullRecover()">满血满蓝</button>
        <button class="action-btn" onclick="debugGrantTestGear()">发放最高测试套装</button>
      </div>
      <div class="notice">说明：该页用于本地回归验证，不作为正式玩法入口。</div>
    `);
  }

  function doCultivationUpgrade(type) {
    const ok = upgradeCultivation(type);
    if (!ok) {
      updateAll();
      showTrain();
      return;
    }

    if (typeof onPlayerActionProgress === "function") onPlayerActionProgress("cultivate");
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
    showTask,
    showMartial,
    showBattleLog,
    showLogbook,
    showChangelog,
    showTreasure,
    showDungeon,
    showCodex,
    showDebugPanel,
    doCultivationUpgrade,
    setSectTab(tab) { g.sectTab = tab; showSect(); },
    showEquipDetail(slot) { g.currentEquipDetailSlot = slot; showEquip(); },
    setShopCategory(category) { g.shopCategory = category; showShop(); },
    setTaskTab(tab) { g.taskTab = tab; g.taskPage = 1; showTask(); },
    setTaskPage(step) { g.taskPage = Math.max(1, Number(g.taskPage || 1) + Number(step || 0)); showTask(); }
  };
})(window);
