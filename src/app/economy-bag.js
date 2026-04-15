(function initEconomyBag(global) {
  const g = global || window;

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
    if (!consumeVigor(12)) {
      setNotice("error", "活力不足（需12点），无法炼制。");
      showPharmacy();
      return;
    }

    consumeRecipeMaterials(recipe);
    recipe.action();
    clampPlayer();

    addLog("event", `你炼制了${recipe.name}，消耗活力12点。`);
    setNotice("success", `炼制成功：${recipe.name}`);
    updateAll();
    showPharmacy();
  }

  function isEquippedItem(name) {
    const equips = player?.equips || {};
    return Object.values(equips).includes(name);
  }

  function canSellItem(name) {
    if (!hasItem(name, 1)) return { ok: false, reason: "物品不存在" };
    if (isEquippedItem(name)) return { ok: false, reason: "已装备物品不可直接出售，请先卸下" };
    if (getItemTypeText(name) === "任务物品") return { ok: false, reason: "任务物品不可出售" };
    return { ok: true, reason: "" };
  }

  function sellItem(name, count = 1) {
    const qty = Math.max(1, Math.floor(Number(count) || 1));
    const check = canSellItem(name);
    if (!check.ok) {
      setNotice("error", `出售失败：${check.reason}`);
      showBag();
      return false;
    }

    const own = Number(player.inventory?.[name] || 0);
    const safeQty = Math.min(own, qty);
    if (safeQty <= 0) {
      setNotice("error", "出售失败：数量不足。");
      showBag();
      return false;
    }

    const unitPrice = getItemSellPrice(name);
    const gain = unitPrice * safeQty;
    removeItem(name, safeQty);
    player.money += gain;

    addLog("event", `你出售了 ${name} x${safeQty}，获得 ${gain} 两银子。`);
    setNotice("success", `出售成功：${name} x${safeQty}（+${gain} 两）`);
    updateAll();
    showBag();
    return true;
  }

  function sellBatchByMode(mode) {
    const cfg = window.__JH_DATA__?.inventorySaleConfig || {};
    const quickCfg = cfg.quickSell || {};
    const protectedSet = new Set(Array.isArray(quickCfg.protectedItems) ? quickCfg.protectedItems : []);

    const entries = Object.entries(player.inventory || {}).filter(([, qty]) => Number(qty) > 0);
    const selected = entries.filter(([name]) => {
      const check = canSellItem(name);
      if (!check.ok) return false;
      if (protectedSet.has(name)) return false;

      if (mode === "junk") {
        const junkTypes = Array.isArray(quickCfg.junkTypes) ? quickCfg.junkTypes : ["材料"];
        return junkTypes.includes(getItemTypeText(name));
      }

      if (mode === "lowEquip") {
        const equip = equipData?.[name];
        if (!equip) return false;
        const qKey = equip.quality || "common";
        const lowQ = Array.isArray(quickCfg.lowEquipQualityKeys) ? quickCfg.lowEquipQualityKeys : ["common", "fine"];
        return lowQ.includes(qKey);
      }

      return false;
    });

    if (!selected.length) {
      setNotice("info", mode === "junk" ? "当前没有可一键出售的杂物。" : "当前没有可一键出售的低级装备。");
      showBag();
      return;
    }

    let totalMoney = 0;
    let totalCount = 0;
    const soldNames = [];
    selected.forEach(([name, qty]) => {
      const sellQty = Math.max(0, Math.floor(Number(qty) || 0));
      if (sellQty <= 0) return;
      const unit = getItemSellPrice(name);
      const gain = unit * sellQty;
      removeItem(name, sellQty);
      totalMoney += gain;
      totalCount += sellQty;
      soldNames.push(`${name}x${sellQty}`);
    });

    player.money += totalMoney;
    addLog("event", `你执行了一键出售：${soldNames.join("、")}，共获得 ${totalMoney} 两银子。`);
    setNotice("success", `一键出售完成：${totalCount} 件（+${totalMoney} 两）`);
    updateAll();
    showBag();
  }

  g.__JH_ECONOMY_BAG__ = {
    useItem,
    equipItem,
    unequipSlot,
    buyShopItem,
    buyMarketItem,
    craftMedicine,
    sellItem,
    sellBatchByMode
  };
})(window);
