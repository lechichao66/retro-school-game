(function initEncounterService(global) {
  function getBattleTypeText(type) {
    if (type === "boss") return "BOSS";
    if (type === "elite") return "精英";
    return "普通怪";
  }

  function showEncounter(monster) {
    if (!monster) {
      setNotice("error", "遭遇目标异常。");
      showHall();
      return;
    }

    const myPower = getPowerValue();
    const enemyPower = monster.power || 0;

    let dangerText = "势均力敌";
    const diff = myPower - enemyPower;

    if (diff >= 3000) dangerText = "碾压";
    else if (diff >= 1000) dangerText = "优势";
    else if (diff >= -1000) dangerText = "势均力敌";
    else if (diff >= -4000) dangerText = "危险";
    else dangerText = "极度危险";

    addLog(
      "sys",
      `【开战】${monster.name} 出现在你面前！（类型：${getBattleTypeText(monster.type)}，战力：${enemyPower}，你的战力：${myPower}，评估：${dangerText}）`
    );

    setNotice("info", `遭遇 ${monster.name}，战斗开始！`);

    global.__JH_BATTLE_ENGINE__.beginBattle();
  }

  global.__JH_ENCOUNTER_SERVICE__ = {
    getBattleTypeText,
    showEncounter
  };
})(window);
