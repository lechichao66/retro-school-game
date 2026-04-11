window.__JH_DATA__ = window.__JH_DATA__ || {};
window.__JH_DATA__.recipes = [
  {
    name: "生姜甘草汤",
    materials: { "生姜": 1, "甘草": 1 },
    effect: "温中散寒，调和营卫。恢复 40 点气血。",
    action: () => {
      player.hp += 40;
      addLog("success", "你熬制并服用了【生姜甘草汤】，感到一股暖流涌向丹田，气血大增！");
    }
  },
  {
    name: "止血散",
    materials: { "止血草": 2 },
    effect: "快速止血。恢复 25 点气血。",
    action: () => {
      player.hp += 25;
      addLog("success", "你敷用了【止血散】，伤口逐渐稳定，气血有所恢复。");
    }
  }
];
