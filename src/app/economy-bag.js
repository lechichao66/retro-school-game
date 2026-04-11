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

    consumeRecipeMaterials(recipe);
    recipe.action();
    clampPlayer();

    setNotice("success", `炼制成功：${recipe.name}`);
    updateAll();
    showPharmacy();
  }

  g.__JH_ECONOMY_BAG__ = {
    useItem,
    equipItem,
    unequipSlot,
    buyShopItem,
    buyMarketItem,
    craftMedicine
  };
})(window);
