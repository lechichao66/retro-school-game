(function initPlayerState(global) {
  const g = global || window;

  function createDefaultPlayer() {
    return {
      name: "无名少侠",
      sect: "无门无派",
      title: "江湖小虾",
      job: "无职业",
      location: "新手村",
      sectContribution: 0,
      sectReputation: 0,

      hp: 100,
      mp: 80,
      stamina: { current: 100, max: 100 },
      vigor: { current: 100, max: 100 },
      lastRecoveryAt: Date.now(),
      money: 50,
      exp: 0,
      level: 1,

      inventory: {
        小还丹: 2,
        干粮: 2,
        木剑: 1
      },

      equips: {
        weapon: "",
        armor: "",
        hat: "",
        belt: "",
        shoes: "",
        necklace: "",
        artifact: ""
      },

      cultivation: {
        attack: 0,
        defense: 0,
        hp: 0,
        mp: 0,
        resist: 0
      },

      skills: ["ironSkin", "quickSlash"],
      martial: {
        title: "",
        mastery: {},
        realm: {},
        learned: ["basic_fist"],
        activeSkill: "basic_fist"
      },
      activeTasks: [],
      taskProgress: {},
      completedTasks: [],
      states: [],
      shield: 0,
      currentMap: "新手村"
    };
  }

  function getPlayerSafe() {
    return g.player || null;
  }

  function setPlayerSafe(nextPlayer) {
    if (!nextPlayer || typeof nextPlayer !== "object") return g.player || null;
    g.player = nextPlayer;
    return g.player;
  }

  function getPlayerPanelDataSafe() {
    const p = g.player || createDefaultPlayer();
    return {
      name: p.name,
      sect: p.sect,
      title: p.title,
      job: p.job,
      location: p.location,
      sectContribution: p.sectContribution || 0,
      sectReputation: p.sectReputation || 0,
      hp: p.hp,
      maxHp: typeof g.getMaxHp === "function" ? g.getMaxHp() : p.hp,
      mp: p.mp,
      maxMp: typeof g.getMaxMp === "function" ? g.getMaxMp() : p.mp,
      money: p.money,
      exp: p.exp,
      level: p.level
    };
  }

  g.__JH_PLAYER_STATE__ = {
    createDefaultPlayer,
    getPlayerSafe,
    setPlayerSafe,
    getPlayerPanelDataSafe
  };
})(window);
