function defaultPlayer() {
  return {
    name: "无名少侠",
    sect: "无门无派",
    title: "江湖小虾",
    job: "无职业",
    location: "新手村",

    hp: 100,
    mp: 80,
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
      shoes: ""
    },

    cultivation: {
      attack: 0,
      defense: 0,
      hp: 0,
      mp: 0,
      resist: 0
    },

    skills: ["ironSkin", "quickSlash"],
    
    states: [],
    shield: 0,
    currentMap: "新手村"
  };
}

let player = defaultPlayer();

function getPlayerPanelData() {
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
    exp: player.exp,
    level: player.level
  };
}