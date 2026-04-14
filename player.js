function defaultPlayer() {
  if (window.__JH_PLAYER_STATE__ && typeof window.__JH_PLAYER_STATE__.createDefaultPlayer === "function") {
    return window.__JH_PLAYER_STATE__.createDefaultPlayer();
  }

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
    totalExp: 0,
    expReserve: 0,
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
      attack: { level: 0, exp: 0 },
      defense: { level: 0, exp: 0 },
      hp: { level: 0, exp: 0 },
      mp: { level: 0, exp: 0 },
      resist: { level: 0, exp: 0 }
    },

    skills: ["ironSkin", "quickSlash"],
    martial: {
      title: "",
      levels: { basic_fist: 1 },
      learned: ["basic_fist"],
      activeSkill: "basic_fist"
    },
    states: [],
    shield: 0,
    currentMap: "新手村"
  };
}

var player = (window.__JH_PLAYER_STATE__ && window.__JH_PLAYER_STATE__.getPlayerSafe && window.__JH_PLAYER_STATE__.getPlayerSafe()) || defaultPlayer();
if (window.__JH_PLAYER_STATE__ && typeof window.__JH_PLAYER_STATE__.setPlayerSafe === "function") {
  window.__JH_PLAYER_STATE__.setPlayerSafe(player);
}

function getPlayerPanelData() {
  if (window.__JH_PLAYER_STATE__ && typeof window.__JH_PLAYER_STATE__.getPlayerPanelDataSafe === "function") {
    return window.__JH_PLAYER_STATE__.getPlayerPanelDataSafe();
  }

  return {
    name: player.name,
    sect: player.sect,
    title: player.title,
    job: player.job,
    location: player.location,
    hp: player.hp,
    maxHp: typeof getMaxHp === "function" ? getMaxHp() : player.hp,
    mp: player.mp,
    maxMp: typeof getMaxMp === "function" ? getMaxMp() : player.mp,
    money: player.money,
    totalExp: player.totalExp || 0,
    expReserve: player.expReserve || 0,
    level: player.level
  };
}
