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
    const autoCap = window.__JH_LEVEL_SYSTEM__?.getAutoLevelCap?.() || window.__JH_LEVEL_SYSTEM__?.AUTO_LEVEL_CAP || 40;
    const need = window.__JH_LEVEL_SYSTEM__?.getRequiredExpForLevel?.(panel.level) || panel.level * 100;
    const expText = panel.level >= autoCap
      ? `${panel.expReserve}（经验池）`
      : `${panel.expReserve} / ${need}`;
    document.getElementById("exp").textContent = expText;
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

  function renderRecentLogbook(category, limit, emptyText) {
    const rows = getLogbookEntries(category, limit).map((item) => `
      <div class='list-line'><span style='color:#777;'>[${item.time}]</span> ${item.text}</div>
    `).join("");
    return rows || `<div class='list-line'>${emptyText || "暂无记录"}</div>`;
  }

  function refreshCurrentView() {
    const viewMap = {
      hall: showHall,
      inn: showInn,
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
      navHub: showNavHub,
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
    const hangupSummary = (getLogbookEntries("hangup", 1)[0]?.text) || "暂无";
    const sectHangupSummary = (getLogbookEntries("sectHangup", 1)[0]?.text) || "暂无";

    setMainTitle(`江湖大厅 - ${loc}`);
    setMainContent(`
      ${renderNoticeHtml()}

      <div style="background:#fff7e9; padding:10px; border-left:4px solid #7f4f2a; margin-bottom:10px; font-size:0.95em;">
        <b>当前地界：</b>${mapInfo ? mapInfo.desc : "神秘区域"}<br><b>推荐等级：</b>${mapInfo?.levelRange || "未知"}
      </div>

      <div class="shop-actions">
        ${Object.keys(mapData).map(name => `
          <button class="action-btn"
                  style="background:${name === loc ? "#7f4f2a" : "#f2e6d0"}; color:${name === loc ? "#fff" : "#2f2922"};"
                  onclick="changeMap('${name}')">
            ${name}
          </button>
        `).join("")}
      </div>

      <hr style="border:0; border-top:1px dashed #ccc; margin:15px 0;">

      <div class="shop-actions">
        <button class="action-btn" onclick="fakeChat()">闲聊</button>
        <button class="action-btn" onclick="bubblePoint()">${lobbyStatus === "进行中" ? "停止泡点" : "开始泡点"}</button>
        <button class="action-btn" style="background:#7f4f2a; color:white;" onclick="startAdventure()">
          探索${loc}
        </button>
        <button class="action-btn" onclick="work()">跑商赚钱</button>
        <button class="action-btn" onclick="showLogbook('hall')">日志总览</button>
        <button class="action-btn" onclick="showNavHub()">江湖司南（更多入口）</button>
      </div>

      <div class="card" style="margin:10px 0;" id="hallSummaryCard">
        <h3>大厅近况</h3>
        <div class="list-line">泡点挂机：${lobbyStatus} ｜ 门派挂机：${sectStatus}</div>
        <div class="list-line">冒险：${adventureSummary}</div>
        <div class="list-line">泡点：${hangupSummary}</div>
        <div class="list-line">门派挂机：${sectHangupSummary}</div>
        <div class="notice">大厅仅保留主流程与系统即时反馈；副本/宝图/营生请在各自页面查看日志。</div>
      </div>

      <div id="hallLogBox" class="log-box" style="height:260px; min-height:260px; max-height:260px; overflow-y:auto;"></div>
    `);

    renderHallLog();
  }

  function showNavHub() {
    currentView = "navHub";
    setMainTitle("江湖司南");
    setMainContent(`
      ${renderNoticeHtml()}
      <div class="card">
        <h3>功能分区导览</h3>
        <div class="list-line">为保持大厅清爽，次级入口统一归并到此页。所有功能仍可达，未删除。</div>
      </div>
      <div class="status-grid">
        <div class="card">
          <h3>成长与修行</h3>
          <div class="shop-actions">
            <button class="small-btn" onclick="showInn()">客栈/生活</button>
            <button class="small-btn" onclick="showTrain()">修炼系统</button>
            <button class="small-btn" onclick="showJob()">职业</button>
            <button class="small-btn" onclick="showPharmacy()">药房</button>
            <button class="small-btn" onclick="luck()">运气</button>
          </div>
        </div>
        <div class="card">
          <h3>探索与挑战</h3>
          <div class="shop-actions">
            <button class="small-btn" onclick="showTreasure()">宝图</button>
            <button class="small-btn" onclick="showDungeon()">副本</button>
            <button class="small-btn" onclick="showRank()">排行</button>
            <button class="small-btn" onclick="showCodex()">百科</button>
            <button class="small-btn" onclick="showBattleLog()">战斗日志</button>
          </div>
        </div>
        <div class="card">
          <h3>维护与测试</h3>
          <div class="shop-actions">
            <button class="small-btn" onclick="showChangelog()">更新日志</button>
            <button class="small-btn" onclick="showDebugPanel()">调试面板</button>
            <button class="small-btn" onclick="showHall()">返回大厅</button>
          </div>
        </div>
      </div>
    `);
  }

  function normalizeMartialArtSkillUi(skill) {
    if (window.__JH_MARTIAL_ARTS__?.normalizeMartialArtSkill) {
      return window.__JH_MARTIAL_ARTS__.normalizeMartialArtSkill(skill);
    }
    const source = skill && typeof skill === "object" ? skill : {};
    return {
      ...source,
      id: source.id || "",
      name: source.name || "未知武学",
      category: source.category || source.categoryCn || "wugong",
      categoryCn: source.categoryCn || source.category || "武功",
      quality: source.quality || source.grade || "low",
      grade: source.grade || source.quality || "不入流"
    };
  }

  function getMartialCategoryLabel(categoryKey) {
    const map = {
      gongfa: "功法",
      wugong: "武功",
      shenfa: "身法",
      lianti: "炼体",
      miji: "秘技"
    };
    return map[categoryKey] || categoryKey || "武功";
  }

  function getMartialStatusData() {
    const martial = player.martial || {};
    const learnedIds = Array.isArray(martial.learned) ? martial.learned : [];
    const equipped = martial.equipped && typeof martial.equipped === "object"
      ? martial.equipped
      : { gongfa: null, wugong: martial.activeSkill || "basic_fist", shenfa: null, lianti: null, miji: null };

    const allSkills = Object.values(martialArtsBySect || {})
      .flatMap((sect) => Array.isArray(sect.skills) ? sect.skills : [])
      .map((x) => normalizeMartialArtSkillUi(x));

    const learnedSkills = learnedIds.map((id) => allSkills.find((x) => x.id === id) || {
      id,
      name: id,
      category: "wugong",
      categoryCn: "武功",
      quality: "low",
      grade: "不入流"
    });

    return { learnedSkills, equipped, levels: martial.levels || {} };
  }

  function getEquippedMartialDisplayName(skillId) {
    if (!skillId) return "未装备";
    const allSkills = Object.values(martialArtsBySect || {})
      .flatMap((sect) => Array.isArray(sect.skills) ? sect.skills : []);
    const found = allSkills.find((x) => x.id === skillId);
    return found?.name || skillId;
  }

  function showStatus() {
    currentView = "status";
    const bonus = getEquipBonus();
    const adv = window.__JH_SELECTORS__?.getDerivedCombatStatsValue?.() || {};
    const martialData = getMartialStatusData();
    const autoCap = window.__JH_LEVEL_SYSTEM__?.getAutoLevelCap?.() || 40;
    const manualNeed = window.__JH_LEVEL_SYSTEM__?.getRequiredExpForLevel?.(player.level) || 0;
    const manualBreakthrough = player.level >= autoCap
      ? `<div class="shop-actions" style="margin-top:6px;"><button class="small-btn" onclick="manualLevelUp()">手动突破（需经验池 ${manualNeed}）</button></div>`
      : "";
    const slotLabels = {
      gongfa: "功法",
      wugong: "武功",
      shenfa: "身法",
      lianti: "炼体",
      miji: "秘技"
    };

    setMainTitle("人物状态");
    setMainContent(`
      ${renderNoticeHtml()}
      <div class="status-grid status-grid-status">
        <div class="card">
          <h3>基础信息</h3>
          <div class="list-line">姓名：${player.name}</div>
          <div class="list-line">门派：${player.sect}</div>
          <div class="list-line">职业：${player.job}</div>
          <div class="list-line">称号：${player.title}</div>
          <div class="list-line">等级：${player.level}</div>
          <div class="list-line">总经验：${player.totalExp || 0}</div>
          <div class="list-line">经验池：${player.expReserve || 0}</div>
          <div class="list-line">升级进度：${player.level >= (window.__JH_LEVEL_SYSTEM__?.getAutoLevelCap?.() || 40) ? "40级后改为手动突破" : `${player.expReserve || 0} / ${window.__JH_LEVEL_SYSTEM__?.getRequiredExpForLevel?.(player.level) || player.level * 100}`}</div>
          ${manualBreakthrough}
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

        <div class="card">
          <h3>武功区域</h3>
          <div class="list-line"><b>已学武功</b></div>
          ${martialData.learnedSkills.length
            ? martialData.learnedSkills.map((x) => `<div class="list-line">${x.name}（${getMartialCategoryLabel(x.category)}/${x.grade}） Lv.${martialData.levels?.[x.id] || 1}</div>`).join("")
            : "<div class='list-line'>暂无已学武功</div>"}
          <hr style="border:0; border-top:1px dashed #ccc; margin:10px 0;">
          <div class="list-line"><b>当前装备槽位</b></div>
          ${Object.keys(slotLabels)
            .map((key) => `<div class="list-line">${slotLabels[key]}：${getEquippedMartialDisplayName(martialData.equipped?.[key])}</div>`)
            .join("")}
        </div>
      </div>
    `);
  }

  function showBag() {
    currentView = "bag";
    const tab = g.bagTab || "all";
    const tabs = [
      ["all", "全部"],
      ["consume", "消耗品"],
      ["material", "材料"],
      ["equip", "装备"],
      ["task", "任务物品"],
      ["token", "宝图/凭证"]
    ];
    const classify = (name) => {
      const type = getItemTypeText(name);
      if (type === "装备") return "equip";
      if (type === "消耗品") return "consume";
      if (type === "任务物品") return "task";
      if (type === "宝图/凭证") return "token";
      return "material";
    };
    const items = Object.keys(player.inventory || {})
      .filter(name => player.inventory[name] > 0)
      .filter(name => tab === "all" || classify(name) === tab)
      .map(name => {
        const equipInfo = equipData[name] ? getEquipDisplayParts(name) : null;
        const qty = Number(player.inventory[name] || 0);
        const unitSell = getItemSellPrice(name);
        const totalSell = unitSell * qty;
        const isTask = getItemTypeText(name) === "任务物品";
        const canSell = !isTask;
        const quickTooltip = equipInfo
          ? getEquipTooltipHtml(name, { compact: false })
          : `<div class="equip-tooltip-block"><div class="equip-tooltip-line">${getItemDetailText(name)}</div></div>`;
        const nameCellHtml = equipInfo
          ? `<span class="equip-tooltip-anchor bag-equip-tooltip-trigger" data-tooltip-html="${encodeURIComponent(quickTooltip)}">${equipInfo.titleHtml}</span>`
          : `<b title="${getItemDetailText(name)}">${name}</b>`;
        return `
          <tr>
            <td>
              ${nameCellHtml}<br>
              <small style="color:#666;">${getItemDetailText(name)}</small>
            </td>
            <td>${qty}</td>
            <td>${getItemTypeText(name)}</td>
            <td>${canSell ? `${unitSell} / ${totalSell}` : "-"}</td>
            <td>
              <button class="small-btn" onclick="useItem('${name}')">使用/查看</button>
              ${equipData[name] ? `<button class="small-btn" onclick="equipItem('${name}')">穿戴</button>` : ""}
              ${canSell ? `<button class="small-btn" onclick="sellItem('${name}', 1)">卖1个</button>` : ""}
              ${canSell && qty > 1 ? `<button class="small-btn" onclick="sellItem('${name}', ${qty})">全卖</button>` : ""}
            </td>
          </tr>
        `;
      }).join("");

    setMainTitle("随身背包");
    setMainContent(`
      ${renderNoticeHtml()}
      <div class="shop-actions">${tabs.map(([key, label]) => `<button class="action-btn" style="background:${tab === key ? "#800000" : "#f2e9d8"}; color:${tab === key ? "#fff" : "#222"};" onclick="setBagTab('${key}')">${label}</button>`).join("")}</div>
      <div class="shop-actions" style="margin-top:8px;">
        <button class="action-btn" onclick="sellBatchByMode('junk')">一键卖杂物</button>
        <button class="action-btn" onclick="sellBatchByMode('lowEquip')">一键卖低级装备</button>
        <div class="notice" style="margin:0;">列表主识别为装备名称颜色与光感，品级名称仅在悬浮信息与详情页显示。</div>
      </div>
      <div class="table-box scroll-box" style="max-height:460px;">
        <table>
          <thead>
            <tr>
              <th>物品</th>
              <th>数量</th>
              <th>类型</th>
              <th>卖价（单件/总价）</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${items || "<tr><td colspan='5'>该分类空空如也</td></tr>"}
          </tbody>
        </table>
      </div>
    `);
    bindBagEquipTooltips();
  }

  function ensureBagTooltipLayer() {
    let layer = document.getElementById("bagTooltipLayer");
    if (layer) return layer;
    layer = document.createElement("div");
    layer.id = "bagTooltipLayer";
    layer.className = "equip-tooltip-panel bag-tooltip-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
    return layer;
  }

  function hideBagTooltipLayer() {
    const layer = document.getElementById("bagTooltipLayer");
    if (!layer) return;
    layer.classList.remove("is-visible");
    layer.innerHTML = "";
    layer.style.left = "-9999px";
    layer.style.top = "-9999px";
  }

  function bindBagEquipTooltips() {
    hideBagTooltipLayer();
    const triggers = Array.from(document.querySelectorAll(".bag-equip-tooltip-trigger"));
    if (!triggers.length) return;
    const layer = ensureBagTooltipLayer();

    const renderLayerAt = (trigger) => {
      const raw = trigger.getAttribute("data-tooltip-html") || "";
      layer.innerHTML = decodeURIComponent(raw);
      layer.classList.add("is-visible");
      layer.style.left = "-9999px";
      layer.style.top = "-9999px";

      const rect = trigger.getBoundingClientRect();
      const layerRect = layer.getBoundingClientRect();
      const margin = 10;
      const maxLeft = window.innerWidth - layerRect.width - margin;
      const left = Math.max(margin, Math.min(rect.left, maxLeft));
      const belowTop = rect.bottom + 8;
      const aboveTop = rect.top - layerRect.height - 8;
      const top = (belowTop + layerRect.height + margin <= window.innerHeight || aboveTop < margin)
        ? belowTop
        : aboveTop;
      layer.style.left = `${Math.round(left + window.scrollX)}px`;
      layer.style.top = `${Math.round(top + window.scrollY)}px`;
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener("mouseenter", () => renderLayerAt(trigger));
      trigger.addEventListener("mouseleave", hideBagTooltipLayer);
      trigger.addEventListener("focus", () => renderLayerAt(trigger));
      trigger.addEventListener("blur", hideBagTooltipLayer);
    });
    if (!g.__bagTooltipGlobalBindDone) {
      window.addEventListener("scroll", hideBagTooltipLayer, { passive: true });
      window.addEventListener("resize", hideBagTooltipLayer, { passive: true });
      g.__bagTooltipGlobalBindDone = true;
    }
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
    const slotLabels = {
      weapon: "武器",
      armor: "衣服",
      hat: "帽子",
      belt: "腰带",
      shoes: "鞋子",
      necklace: "项链",
      artifact: "法宝"
    };
    const baseAttack = equip.baseStats?.attack || equip.attack || 0;
    const baseDefense = equip.baseStats?.defense || equip.defense || 0;
    const effects = Array.isArray(equip.specialEffects) ? equip.specialEffects : [];
    const extraEntries = equip.extraStats && typeof equip.extraStats === "object"
      ? Object.entries(equip.extraStats).filter(([, v]) => Number(v) !== 0)
      : [];
    const extraStats = extraEntries.length ? extraEntries : [];
    const slotText = slotLabels[equip.slot] || equip.slot || "未知";
    const levelContext = typeof resolveEquipLevelContext === "function"
      ? resolveEquipLevelContext(equip)
      : { requiredLevel: Math.max(1, Math.floor(Number(equip.requiredLevel) || 1)) };
    const requiredLevel = levelContext.requiredLevel;
    const specialEffectsHtml = effects.length
      ? effects.map((x) => {
        const effectText = getSpecialEffectText(x);
        const reserveTag = x?.desc && String(x.desc).includes("预留")
          ? "<span class='equip-detail-reserved'>（预留 / 未激活 / 后续开放）</span>"
          : "";
        return `<div class="list-line">- ${effectText}${reserveTag}</div>`;
      }).join("")
      : "<div class='list-line'>- 无（预留 / 未激活 / 后续开放）</div>";

    return `
      <div class="equip-detail-block">
        <div class="list-line equip-detail-title"><b class="equip-name equip-quality-${quality.key || "common"}" style="color:${quality.color}">${name}</b></div>
        <div class="list-line">品级：${quality.name || "凡品"}</div>
        <div class="list-line">部位：${slotText}</div>
        <div class="list-line">等级要求：${requiredLevel}</div>
      </div>
      <div class="equip-detail-block">
        <div class="list-line"><b>基础属性</b></div>
        <div class="list-line">攻击 +${baseAttack}</div>
        <div class="list-line">防御 +${baseDefense}</div>
      </div>
      <div class="equip-detail-block">
        <div class="list-line"><b>附加属性</b></div>
        ${extraStats.length ? extraStats.map(([k, v]) => `<div class="list-line">${getStatLabel(k)} +${v}</div>`).join("") : "<div class='list-line'>无</div>"}
        <div class="list-line">词缀（完整）：${info.affixFull}</div>
      </div>
      <div class="equip-detail-block">
        <div class="list-line"><b>特效</b></div>
        ${specialEffectsHtml}
      </div>
      <div class="equip-detail-block">
        <div class="list-line">说明：${equip.desc || "暂无"}</div>
      </div>
    `;
  }

  function getEquipSlotLabel(slot) {
    const slotLabels = {
      weapon: "武器",
      armor: "衣服",
      hat: "帽子",
      belt: "腰带",
      shoes: "鞋子",
      necklace: "项链",
      artifact: "法宝"
    };
    return slotLabels[slot] || slot || "未知";
  }

  function getEquipTooltipHtml(name, options = {}) {
    const info = getEquipDisplayParts(name);
    const equip = info?.equip;
    if (!equip) {
      return `<div class="equip-tooltip-block"><div class="equip-tooltip-line">${name}</div></div>`;
    }

    const compact = options.compact !== false;
    const quality = getEquipQualityMeta(equip.quality);
    const baseAttack = equip.baseStats?.attack || equip.attack || 0;
    const baseDefense = equip.baseStats?.defense || equip.defense || 0;
    const levelContext = typeof resolveEquipLevelContext === "function"
      ? resolveEquipLevelContext(equip)
      : { requiredLevel: Math.max(1, Math.floor(Number(equip.requiredLevel) || 1)) };
    const requiredLevel = levelContext.requiredLevel;
    const extraEntries = equip.extraStats && typeof equip.extraStats === "object"
      ? Object.entries(equip.extraStats).filter(([, v]) => Number(v) !== 0)
      : [];
    const effects = Array.isArray(equip.specialEffects) ? equip.specialEffects : [];
    const effectText = effects.length
      ? effects.map((x) => {
        const reserved = x?.desc && String(x.desc).includes("预留") ? "（预留 / 未激活 / 后续开放）" : "";
        return `${getSpecialEffectText(x)}${reserved}`;
      }).join("；")
      : "无（预留 / 未激活 / 后续开放）";

    const extraText = extraEntries.length
      ? extraEntries.map(([k, v]) => `${getStatLabel(k)}+${v}`).join("，")
      : "无";

    return `
      <div class="equip-tooltip-block">
        <div class="equip-tooltip-title" style="color:${quality.color || "#9ca3af"}">${name}</div>
        <div class="equip-tooltip-line">品级：${quality.name || "凡品"}</div>
        <div class="equip-tooltip-line">部位：${getEquipSlotLabel(equip.slot)}</div>
        <div class="equip-tooltip-line">等级要求：${requiredLevel}</div>
      </div>
      <div class="equip-tooltip-block">
        <div class="equip-tooltip-subtitle">基础属性</div>
        <div class="equip-tooltip-line">攻击 +${baseAttack} / 防御 +${baseDefense}</div>
      </div>
      ${compact ? "" : `
      <div class="equip-tooltip-block">
        <div class="equip-tooltip-subtitle">附加属性</div>
        <div class="equip-tooltip-line">${extraText}</div>
      </div>
      <div class="equip-tooltip-block">
        <div class="equip-tooltip-subtitle">特效</div>
        <div class="equip-tooltip-line">${effectText}</div>
      </div>
      `}
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
      const key = skill.category || "wugong";
      if (!acc[key]) acc[key] = [];
      acc[key].push(skill);
      return acc;
    }, {});
    const martialRows = Object.keys(grouped).map((cat) => `<div class='card'><h3>${getMartialCategoryLabel(cat)}</h3>${grouped[cat].map((skill) => {
      const skillLevel = player.martial?.levels?.[skill.id] || 0;
      const learned = (player.martial?.learned || []).includes(skill.id);
      const reducedMoney = getMartialResearchCost(skill, "resource");
      const nextExp = 220 + skillLevel * 70;
      return `<div class='list-line'><b>${skill.name}</b>【${skill.grade || "不入流"}】</div><div class='list-line'>学习条件：等级${skill.learnReq?.level || 1}、贡献门槛${skill.learnReq?.contribution || 0}、银两${skill.learnReq?.money || 0}</div><div class='list-line'>武功等级：${skillLevel}（上限：人物等级+10）</div><div class='list-line'>研习消耗：银两${reducedMoney} + 经验池${nextExp}</div><div class='list-line'>效果：${skill.effect}</div><div class='shop-actions'>${learned ? "<button class='small-btn' disabled>已学会</button>" : `<button class='small-btn' onclick="learnMartialSkill('${skill.id}')">学习</button>`}<button class='small-btn' onclick="trainMartialSkill('${skill.id}','resource')">研习升级</button></div><hr>`;
    }).join("")}</div>`).join("");
    const sectDutyActive = player.hangup?.sectDuty?.active;
    const sectTaskInfo = `<div class='card'><h3>师门任务</h3><div class='list-line'>门派贡献：${player.sectContribution || 0}　门派声望：${player.sectReputation || 0}</div><div class='shop-actions'><button class='small-btn' onclick="setTaskTab('sect');showTask()">前往接取师门任务</button></div></div>`;
    const exchangePanel = `<div class='card'><h3>师门兑换</h3><div class='shop-actions'><button class='small-btn' onclick="redeemSectReward('title')">兑换门派称号（200贡献）</button><button class='small-btn' onclick="redeemSectReward('pill')">兑换特殊丹药（120贡献）</button><button class='small-btn' onclick="redeemSectReward('material')">兑换特殊材料（80贡献）</button><button class='small-btn' onclick="redeemSectReward('passive')">解锁门派秘技（300贡献）</button></div></div>`;
    const titlePanel = `<div class='card'><h3>门派称号</h3><div class='list-line'>当前称号：${player.title}</div><div class='list-line'>可通过贡献兑换身份称号。</div></div>`;
    const hangupPanel = `<div class='card'><h3>门派挂机</h3><div class='list-line'>当前状态：${sectDutyActive ? "进行中" : "未开启"}</div><div class='shop-actions'><button class='small-btn' onclick="toggleSectDutyHangup()">${sectDutyActive ? "停止门派值守挂机" : "开始门派值守挂机"}</button><button class='small-btn' onclick="showLogbook('sectHangup')">查看门派挂机日志</button></div></div>`;
    const contentMap = {
      overview: `<div class='card'><div class='list-line'><b>当前门派：</b>${player.sect}</div><div class='list-line'><b>当前秘技：</b>${currentSect?.passiveName || "暂无"} ${currentSect?.passiveDesc || ""}</div><div class='list-line'>门派贡献来源：师门任务 / 门派挂机 / 活动。</div><div class='list-line'>门派贡献用途：解锁高阶武学、兑换称号与秘技、兑换物资。</div></div><div class="table-box scroll-box" style="max-height:360px;"><table><thead><tr><th>门派</th><th>要求</th><th>简介</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table></div>`,
      martial: `<div class='card'><div class='list-line'><b>武功阶段规则：</b>10级前使用基础技能，10级后以门派武学为主，基础技能保留为默认技。</div><div class='list-line'><b>武学品级体系：</b>不入流 → 三流 → 二流 → 一流 → 顶级（更高层级预留）。</div></div><div class='status-grid'>${martialRows || "<div class='card'>当前门派武学未开放。</div>"}</div>`,
      tasks: sectTaskInfo,
      title: titlePanel,
      exchange: exchangePanel,
      hangup: hangupPanel
    };
    setMainTitle("江湖门派");
    setMainContent(`${renderNoticeHtml()}<div class='shop-actions'>${[
      ["overview", "门派总览"],
      ["martial", "门派武功"],
      ["tasks", "师门任务"],
      ["title", "门派称号"],
      ["exchange", "师门兑换"],
      ["hangup", "门派挂机"]
    ].map(([key, label]) => `<button class='action-btn' style='background:${tab === key ? "#800000" : "#f2e9d8"};color:${tab === key ? "#fff" : "#222"};' onclick="setSectTab('${key}')">${label}</button>`).join("")}</div>${contentMap[tab] || contentMap.overview}`);
  }
  function showRank() { currentView = "rank"; const rankData = [{ name: player.name, value: getPowerValue(), tag: "当前角色" }, { name: "秋风", value: 860, tag: "唐门" }, { name: "断水", value: 780, tag: "武当" }, { name: "孤城", value: 730, tag: "幽月宫" }, { name: "听雪", value: 650, tag: "世外桃源" }].sort((a, b) => b.value - a.value); const rows = rankData.map((item, i) => `<tr><td>${i + 1}</td><td>${item.name}</td><td>${item.value}</td><td>${item.tag}</td></tr>`).join(""); setMainTitle("江湖排行"); setMainContent(`${renderNoticeHtml()}<div class="table-box"><table><thead><tr><th>排名</th><th>玩家</th><th>综合值</th><th>备注</th></tr></thead><tbody>${rows}</tbody></table></div>`); }
  function showJob() {
    currentView = "job";
    const rows = jobList.map((item, i) => `<tr><td>${item.name}</td><td>${item.intro}</td><td>${item.gain}</td><td><button class="small-btn" onclick="chooseJob(${i})">入职</button></td></tr>`).join("");
    const routes = Array.isArray(tradeRoutes?.routes) ? tradeRoutes.routes : [];
    const defaultRouteId = tradeRoutes?.defaultRouteId || routes[0]?.id || "novice_loop";
    if (!player.trade || typeof player.trade !== "object") player.trade = {};
    const selectedRouteId = typeof player.trade.selectedRouteId === "string" ? player.trade.selectedRouteId : defaultRouteId;
    const currentRoute = routes.find((x) => x.id === selectedRouteId) || routes[0] || null;
    const currentBand = (player.level || 1) >= 50 ? "l50" : ((player.level || 1) >= 40 ? "l40" : "l30");
    const expCfg = tradeRoutes?.expRatioByLevelBand?.[currentBand] || tradeRoutes?.expRatioByLevelBand?.l30 || { min: 0.002, max: 0.006 };
    const expRangeText = `${(expCfg.min * 100).toFixed(1)}%~${(expCfg.max * 100).toFixed(1)}%`;
    const routeRows = routes.map((route) => {
      const requiredLevel = Number(route.requiredLevel) || 1;
      const canSelect = player.level >= requiredLevel;
      const isSelected = currentRoute?.id === route.id;
      const silverCfg = route?.silverByLevelBand?.[currentBand] || route?.silverByLevelBand?.l30 || { min: 10000, max: 14000 };
      const minSilver = Math.max(1, Math.floor(Number(silverCfg.min) || 10000));
      const maxSilver = Math.max(minSilver, Math.floor(Number(silverCfg.max) || minSilver));
      return `<tr><td>${route.name}</td><td>${route.intro || "-"}</td><td>等级${requiredLevel}+ / 当前档位${currentBand === "l50" ? "50级+" : (currentBand === "l40" ? "40级段" : "30级段")}</td><td>单次参考：${minSilver}~${maxSilver} 两，经验为下一级需求的 ${expRangeText}</td><td>${isSelected ? "<span style='color:#2f855a;'>当前</span>" : `<button class='small-btn' ${canSelect ? "" : "disabled"} onclick="setTradeRoute('${route.id}')">选择</button>`}</td></tr>`;
    }).join("");

    setMainTitle("江湖职业");
    setMainContent(`${renderNoticeHtml()}<div class="notice">当前职业：<b>${player.job}</b></div><div class='card'><h3>跑商路线</h3><div class='list-line'>当前路线：<b>${currentRoute?.name || "暂无"}</b>（建议在对应等级地图执行，收益更稳定）</div><div class='table-box'><table><thead><tr><th>路线</th><th>说明</th><th>门槛/基础参数</th><th>玩家可读收益参考</th><th>操作</th></tr></thead><tbody>${routeRows || "<tr><td colspan='5'>暂无跑商路线配置</td></tr>"}</tbody></table></div></div><div class="table-box"><table><thead><tr><th>职业</th><th>说明</th><th>产出</th><th>选择</th></tr></thead><tbody>${rows}</tbody></table></div><div class="shop-actions"><button class="action-btn" onclick="doJob()">执行职业动作</button><button class="action-btn" onclick="work()">执行一次跑商（体力换银两）</button></div><div class='card'><h3>跑商最近记录</h3>${renderRecentLogbook("economy", 4, "暂无跑商记录。")}<div class='shop-actions'><button class='small-btn' onclick="showLogbook('economy')">查看完整跑商日志</button></div></div>`);
  }
  function showPharmacy() { currentView = "pharmacy"; const recipeHtml = recipes.map((r, i) => { const canCraft = canCraftRecipe(r); const materialText = Object.keys(r.materials).map(name => { const own = player.inventory[name] || 0; return `${name}(${own}/${r.materials[name]})`; }).join("，"); return `<div class="card"><h3>${r.name}</h3><div class="list-line">${r.effect}</div><div class="list-line">材料：${materialText}</div><button class="small-btn" ${canCraft ? "" : "disabled"} onclick="craftMedicine(${i})">炼制</button></div>`; }).join(""); setMainTitle("神农药房"); setMainContent(`${renderNoticeHtml()}<div class="status-grid">${recipeHtml || "<div class='card'>暂无药方</div>"}</div>`); }
  function showTrain() { currentView = "train"; const unlockLevel = window.CULTIVATION_UNLOCK_LEVEL || 20; const unlocked = (player.level || 1) >= unlockLevel; const rows = Object.keys(CULTIVATION_CONFIG).map(key => { const cfg = CULTIVATION_CONFIG[key]; const level = getCultivationLevel(key); const node = getCultivationNode(key); const bonus = getCultivationBonus(key); const pct = Math.floor((getCultivationGrowthPercent(key) || 0) * 1000) / 10; const needExp = getCultivationUpgradeRequiredExp(key, level + 1); const progress = `${node.exp || 0} / ${needExp}`; const cost = !unlocked ? `未解锁（${unlockLevel}级）` : level >= cfg.maxLevel ? "已满级" : `${getCultivationCost(key)} 两`; return `<tr><td>${cfg.name}</td><td>${level} / ${cfg.maxLevel}<br><small>进度 ${progress}</small></td><td>${cfg.effectText}${bonus}${pct > 0 ? `（额外 ${pct}%）` : ""}</td><td>${cost}</td><td><button class="small-btn" ${!unlocked || level >= cfg.maxLevel ? "disabled" : ""} onclick="doCultivationUpgrade('${key}')">提升</button></td></tr>`; }).join(""); const summary = getCultivationSummary(); const lockText = unlocked ? `已解锁：你当前等级 ${player.level}。` : `未解锁：修炼系统需 ${unlockLevel} 级开启，你当前为 ${player.level} 级。`; const autoCap = window.__JH_LEVEL_SYSTEM__?.getAutoLevelCap?.() || 40; const manualNeed = window.__JH_LEVEL_SYSTEM__?.getRequiredExpForLevel?.(player.level) || 0; const manualEntry = player.level >= autoCap ? `<div class='shop-actions'><button class='small-btn' onclick='manualLevelUp()'>手动突破（需经验池 ${manualNeed}）</button></div>` : "<div class='list-line'>40级前自动升级，40级后可在状态页或此页手动突破。</div>"; setMainTitle("修炼系统"); setMainContent(`${renderNoticeHtml()}<div class="status-grid"><div class="card"><h3>当前修炼总览</h3><div class="list-line">${lockText}</div><div class="list-line">总经验：${player.totalExp || 0}</div><div class="list-line">可支配经验池：${player.expReserve || 0}</div>${manualEntry}<div class="list-line">攻击修炼加成：+${summary.attack}</div><div class="list-line">防御修炼加成：+${summary.defense}</div><div class="list-line">气血修炼加成：+${summary.hp}</div><div class="list-line">内力修炼加成：+${summary.mp}</div><div class="list-line">抗性修炼加成：+${summary.resist}</div><div class="list-line">修炼额外战力：${Math.floor((summary.attack + summary.defense + summary.hp / 2 + summary.mp / 2) * 3)}</div></div></div><div class="table-box"><table><thead><tr><th>修炼项目</th><th>等级</th><th>当前效果</th><th>升级花费</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table></div>`); }


  function showTask() {
    currentView = "task";
    const activeIds = new Set(player.activeTasks || []);
    const activeTab = g.taskTab || "main";
    const page = Number(g.taskPage || 1);
    const refreshTick = Number(g.taskRefreshTick || 0);
    const currentType = taskTypeList.find((x) => x.key === activeTab) || taskTypeList[0];
    let filteredTasks = (taskTemplates || []).filter((x) => x.type === currentType.key && player.level >= (x.minLevel || 1));
    if (filteredTasks.length > 1 && refreshTick > 0) {
      const shift = refreshTick % filteredTasks.length;
      filteredTasks = [...filteredTasks.slice(shift), ...filteredTasks.slice(0, shift)];
    }
    const pageSize = 5;
    const totalPage = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
    const safePage = Math.min(totalPage, Math.max(1, page));
    g.taskPage = safePage;
    const tasks = filteredTasks.slice((safePage - 1) * pageSize, safePage * pageSize);
    if (!g.selectedTaskId || !tasks.some((x) => x.id === g.selectedTaskId)) g.selectedTaskId = tasks[0]?.id || "";
    const selectedTask = filteredTasks.find((x) => x.id === g.selectedTaskId) || null;
    const rows = tasks.map((task) => {
      const progress = player.taskProgress?.[task.id] || 0;
      const target = task.objective?.count || 1;
      const accepted = activeIds.has(task.id);
      const status = accepted ? (progress >= target ? "可提交" : "进行中") : "可接取";
      return `<tr><td><button class='small-btn' onclick="selectTaskDetail('${task.id}')">查看</button></td><td>${task.name}</td><td>${task.minLevel}+</td><td>${Math.min(progress, target)}/${target}</td><td>${status}</td></tr>`;
    }).join("");
    const progress = selectedTask ? (player.taskProgress?.[selectedTask.id] || 0) : 0;
    const target = selectedTask?.objective?.count || 1;
    const completed = progress >= target;
    const accepted = selectedTask ? activeIds.has(selectedTask.id) : false;
    const detail = selectedTask ? `<div class='card'><h3>${selectedTask.name}</h3><div class='list-line'>${selectedTask.desc}</div><div class='list-line'>目标：${selectedTask.objective?.action || "未知"} / ${selectedTask.objective?.target || "任意"} x ${target}</div><div class='list-line'>进度：${Math.min(progress, target)} / ${target}</div><div class='list-line'>奖励：银两${selectedTask.reward.money || 0}，经验${selectedTask.reward.exp || 0}</div><div class='shop-actions'>${!accepted ? `<button class='small-btn' onclick="acceptTask('${selectedTask.id}')">接取</button>` : `<button class='small-btn' onclick="abandonTask('${selectedTask.id}')">放弃</button>`}${accepted && completed ? `<button class='small-btn' onclick="claimTask('${selectedTask.id}')">提交</button>` : ""}<button class='small-btn' onclick='refreshTaskList()'>刷新/换一批</button></div></div>` : "<div class='card'>当前无可选任务。</div>";

    setMainTitle("任务榜");
    setMainContent(`${renderNoticeHtml()}<div class='shop-actions'>${taskTypeList.map((type) => `<button class='action-btn' style='background:${type.key === currentType.key ? "#800000" : "#f2e9d8"};color:${type.key === currentType.key ? "#fff" : "#222"};' onclick="setTaskTab('${type.key}')">${type.name}</button>`).join("")}</div><div class='status-grid'><div class='card'><h3>${currentType.name}列表</h3><div class='table-box scroll-box' style='max-height:360px;'><table><thead><tr><th>详情</th><th>任务</th><th>等级</th><th>进度</th><th>状态</th></tr></thead><tbody>${rows || "<tr><td colspan=5>暂无任务</td></tr>"}</tbody></table></div></div>${detail}</div><div class='shop-actions'><button class='small-btn' ${safePage <= 1 ? "disabled" : ""} onclick='setTaskPage(-1)'>上一页</button><span>第 ${safePage} / ${totalPage} 页</span><button class='small-btn' ${safePage >= totalPage ? "disabled" : ""} onclick='setTaskPage(1)'>下一页</button><button class='small-btn' onclick='refreshTaskList()'>刷新/换一批</button></div>`);
  }

  function showMartial() {
    g.sectTab = "martial";
    showSect();
  }

  function showBattleLog(mode) {
    if (mode === "hall") {
      setNotice("info", "大厅战斗日志已固定在大厅主日志区，不再重复追加。");
      showHall();
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
      setNotice("info", "大厅日志摘要已固定单实例展示，不再重复插入。");
      showHall();
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
      setNotice("info", "更新日志请在独立页查看，大厅不再追加区块。");
      showHall();
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
    return showInn("treasure");
  }

  function showInn(section) {
    currentView = "inn";
    const activeSection = section === "treasure" ? "treasure" : "life";
    const maps = player.treasureMaps || [];
    const treasureCfg = g.__JH_DATA__?.treasureSystemConfig || {};
    const normalMapCfg = treasureCfg.normalMap || {};
    const roundCfg = treasureCfg.round || {};
    const recyclePrice = Math.max(0, Math.floor(Number(normalMapCfg.recyclePrice) || 20000));
    const dailyLimit = Math.max(1, Math.floor(Number(roundCfg.dailyRoundLimit) || 50));
    const dailyInfo = player.treasureDaily && typeof player.treasureDaily === "object"
      ? player.treasureDaily
      : { rounds: 0 };
    const groupedTreasureMaps = maps.reduce((acc, entry, idx) => {
      const status = entry.used ? "used" : "unused";
      const targetMap = entry.targetMap || entry.area || "未知区域";
      const groupKey = `${entry.name || "无名宝图"}__${targetMap}__${status}`;
      if (!acc[groupKey]) {
        acc[groupKey] = {
          key: groupKey,
          name: entry.name || "无名宝图",
          targetMap,
          status,
          indexes: []
        };
      }
      acc[groupKey].indexes.push(idx);
      return acc;
    }, {});
    const treasureRows = Object.values(groupedTreasureMaps).map((group) => {
      const idx = group.indexes[0];
      const count = group.indexes.length;
      const statusText = group.status === "used" ? "已使用" : "可使用";
      return `<div class='card'><div class='list-line'><b>${group.name}</b>（目标：${group.targetMap}） × ${count}</div><div class='list-line'>状态：${statusText}</div><div class='shop-actions'><button class='small-btn' onclick='useTreasureMap(${idx})' ${group.status === "used" ? "disabled" : ""}>使用宝图</button><button class='small-btn' onclick='digTreasure(${idx})' ${group.status === "used" ? "" : "disabled"}>挖宝</button><button class='small-btn' onclick='sellTreasureMap(${idx})'>卖图（${recyclePrice}）</button></div></div>`;
    }).join("");
    const lastRun = player.treasureLastRun && typeof player.treasureLastRun === "object" ? player.treasureLastRun : null;
    const eventCounter = lastRun?.eventCounter || {};
    const lastRunSummary = lastRun
      ? `<div class='card'><h3>最近一轮打图摘要</h3><div class='list-line'>时间：${lastRun.time || "未知"}｜地点：${lastRun.area || "未知"}</div><div class='list-line'>轮次：${lastRun.attempts || 0}次｜扑空${eventCounter.empty || 0}｜银两点${eventCounter.findMoney || 0}｜物资点${eventCounter.findItem || 0}｜宝图掉落${eventCounter.mapDrop || 0}｜机关${eventCounter.trap || 0}｜遭遇${eventCounter.ambush || 0}</div><div class='list-line'>奖励：银两${lastRun.rewards?.money || 0}｜物品：${Object.keys(lastRun.rewards?.items || {}).length ? Object.keys(lastRun.rewards.items).map((name) => `${name} x${lastRun.rewards.items[name]}`).join("，") : "无"}｜新增宝图${(lastRun.rewards?.maps || []).length || 0}</div><div class='list-line'>损耗：气血 -${lastRun.hpLoss || 0}</div></div>`
      : "<div class='card'><h3>最近一轮打图摘要</h3><div class='list-line'>暂无打图摘要，可直接执行一轮打图获取宝图与其他奖励。</div></div>";
    const treasureModule = `<div class='card'><h3>宝图模块</h3><div class='list-line'>主玩法：打图一轮（每轮${Math.max(1, Math.floor(Number(roundCfg.attemptsPerRound) || 10))}次，其中固定宝图${Math.max(0, Math.floor(Number(roundCfg.normalMapFixedDropCount) || 7))}张）→ 其余次数结算银两/物资/事件 → 再对已有宝图执行使用或挖图。</div><div class='list-line'>普通宝图可直接回收：固定 ${recyclePrice} 银两；挖图收益围绕 2 万银两波动并带保底，同时可掉落超级宝图碎片。</div><div class='list-line'>今日轮次：${dailyInfo.rounds || 0} / ${dailyLimit}</div><div class='shop-actions'><button class='small-btn' onclick='grantTreasureMap()'>获得一张样板宝图</button><button class='small-btn' onclick='runTreasureRound()'>执行一轮打图</button><button class='small-btn' onclick=\"showInn('treasure')\">刷新宝图页</button><button class='small-btn' onclick=\"showLogbook('treasure')\">查看完整宝图日志</button></div></div>${lastRunSummary}<div class='card'><h3>宝图最近记录</h3>${renderRecentLogbook("treasure", 8, "暂无宝图记录。")}</div>${treasureRows || "<div class='card'>暂无宝图，可先领取样板。</div>"}`;
    const lifeModule = `<div class='card'><h3>客栈修整</h3><div class='list-line'>在客栈休息可恢复气血、内力、体力与活力。</div><div class='list-line'>当前体力：${player.stamina?.current || 0} / ${player.stamina?.max || 0}，活力：${player.vigor?.current || 0} / ${player.vigor?.max || 0}</div><div class='shop-actions'><button class='small-btn' onclick='rest()'>休息</button><button class='small-btn' onclick=\"showInn('treasure')\">前往宝图模块</button></div></div>`;

    setMainTitle("客栈 / 生活页");
    setMainContent(`${renderNoticeHtml()}<div class='shop-actions'><button class='action-btn' style='background:${activeSection === "life" ? "#800000" : "#f2e9d8"};color:${activeSection === "life" ? "#fff" : "#222"};' onclick='showInn()'>客栈修整</button><button class='action-btn' style='background:${activeSection === "treasure" ? "#800000" : "#f2e9d8"};color:${activeSection === "treasure" ? "#fff" : "#222"};' onclick=\"showInn('treasure')\">宝图</button></div>${activeSection === "life" ? lifeModule : `${lifeModule}${treasureModule}`}`);
  }

  function showDungeon() {
    currentView = "dungeon";
    const dungeons = g.__JH_DATA__?.dungeonTemplates || [];
    const rows = dungeons.map((d) => `<div class='card'><h3>${d.name}</h3><div class='list-line'>类型：${d.type || "副本"}</div><div class='list-line'>建议战力：${d.recommendedPower}（高于普通探索）</div><div class='list-line'>要求：等级${d.minLevel}+，体力消耗${d.staminaCost}</div><div class='list-line'>多波：${(d.waves || []).join(" → ") || "单波"}</div><div class='list-line'>奖励：银两${d.reward.money}，经验${d.reward.exp}</div><div class='shop-actions'><button class='small-btn' onclick="runDungeon('${d.id}')">进入副本</button></div></div>`).join("");
    setMainTitle("副本入口");
    const latest = getLogbookEntries("dungeon", 1)[0];
    const lastRun = player.dungeonLastRun && typeof player.dungeonLastRun === "object" ? player.dungeonLastRun : null;
    const completionText = lastRun ? `${Math.round((Number(lastRun.completionRate) || 0) * 100)}%` : "0%";
    const processSummary = lastRun
      ? `<div class='card'><h3>最近一次副本过程摘要</h3><div class='list-line'>时间：${lastRun.time || "未知"}｜副本：${lastRun.dungeonName || "未知"}</div><div class='list-line'>结果：${lastRun.success ? "通关" : `失败（止步第${lastRun.failedWave || "?"}阶段）`}</div><div class='list-line'>完成度：${lastRun.clearedWaves || 0} / ${lastRun.totalWaves || 0}（${completionText}）</div><div class='list-line'>失败波次：${lastRun.failedWaveName || "无"}</div><div class='list-line'>奖励结算：银两${lastRun.rewards?.money || 0}，经验${lastRun.rewards?.exp || 0}，表现修正${lastRun.performanceAdjPct >= 0 ? "+" : ""}${lastRun.performanceAdjPct || 0}%</div></div>`
      : "<div class='card'><h3>最近一次副本过程摘要</h3><div class='list-line'>暂无副本挑战记录。</div></div>";
    setMainContent(`${renderNoticeHtml()}<div class='card'><div class='list-line'>副本定位：多波怪 + 精英/BOSS + 高难度 + 高奖励。</div><div class='list-line'>最近一次副本：${latest ? `${latest.time} ${latest.text}` : "暂无记录"}</div><div class='shop-actions'><button class='small-btn' onclick="showLogbook('dungeon')">查看完整副本日志</button></div></div>${processSummary}<div class='card'><h3>副本最近记录</h3>${renderRecentLogbook("dungeon", 4, "暂无副本记录。")}</div><div class='status-grid'>${rows}</div>`);
  }

  function showCodex() {
    currentView = "codex";
    const sections = g.__JH_DATA__?.encyclopediaSections || {};
    const render = (title, list) => `<div class='card'><h3>${title}</h3>${(list || []).map((x) => `<div class='list-line'>- ${x}</div>`).join("") || "<div class='list-line'>暂无</div>"}</div>`;
    setMainTitle("百科全书");
    setMainContent(`${renderNoticeHtml()}<div class='status-grid'>${render("属性说明", sections.attrs)}${render("装备词缀", sections.affix)}${render("特殊效果", sections.effects)}${render("武学分类", sections.martial)}${render("门派特色", sections.sect)}${render("副本/宝图说明", sections.dungeonTreasure)}${render("辅助职业说明", sections.assistant)}</div>`);
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
    showNavHub,
    showInn,
    showDebugPanel,
    doCultivationUpgrade,
    setSectTab(tab) { g.sectTab = tab; showSect(); },
    showEquipDetail(slot) { g.currentEquipDetailSlot = slot; showEquip(); },
    setShopCategory(category) { g.shopCategory = category; showShop(); },
    setBagTab(tab) { g.bagTab = tab; showBag(); },
    setTaskTab(tab) { g.taskTab = tab; g.taskPage = 1; g.selectedTaskId = ""; showTask(); },
    setTaskPage(step) { g.taskPage = Math.max(1, Number(g.taskPage || 1) + Number(step || 0)); showTask(); },
    selectTaskDetail(taskId) { g.selectedTaskId = taskId; showTask(); },
    refreshTaskList() { g.taskRefreshTick = Number(g.taskRefreshTick || 0) + 1; g.selectedTaskId = ""; showTask(); }
  };
})(window);
