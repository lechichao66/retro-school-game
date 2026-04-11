window.__JH_DATA__ = window.__JH_DATA__ || {};

window.__JH_DATA__.taskTemplates = [
  {
    id: "main_001",
    type: "main",
    name: "初入江湖",
    minLevel: 1,
    desc: "在新手村附近击败野狗，证明你能独自行走江湖。",
    objective: { action: "kill", target: "野狗", count: 3 },
    reward: { exp: 80, money: 40, items: [{ name: "小还丹", count: 1 }] }
  },
  {
    id: "main_002",
    type: "main",
    name: "密林试炼",
    minLevel: 10,
    desc: "前往后山密林，击败山贼精英。",
    objective: { action: "kill", target: "山贼精英", count: 2 },
    reward: { exp: 260, money: 150, items: [{ name: "精铁", count: 2 }] }
  },
  {
    id: "side_001",
    type: "side",
    name: "药房求材",
    minLevel: 5,
    desc: "替药房采集止血草。",
    objective: { action: "collect", target: "止血草", count: 4 },
    reward: { exp: 110, money: 60, items: [{ name: "大还丹", count: 1 }] }
  },
  {
    id: "side_002",
    type: "side",
    name: "兽谷哨探",
    minLevel: 20,
    desc: "击败百兽谷的狂暴山魈，带回情报。",
    objective: { action: "kill", target: "狂暴山魈", count: 5 },
    reward: { exp: 420, money: 260, items: [{ name: "熊胆", count: 1 }] }
  },
  {
    id: "daily_001",
    type: "daily",
    name: "日常巡逻",
    minLevel: 1,
    desc: "清剿任意普通怪，维持周边安宁。",
    objective: { action: "kill_type", target: "normal", count: 8 },
    reward: { exp: 90, money: 70 }
  },
  {
    id: "sect_001",
    type: "sect",
    name: "师门勤修",
    minLevel: 8,
    desc: "完成两次练功，积累门派贡献用于武功学习与称号晋升。",
    objective: { action: "cultivate", count: 2 },
    reward: { exp: 140, money: 50, sectContribution: 40, sectReputation: 10 }
  },
  {
    id: "sect_002",
    type: "sect",
    name: "师门采办",
    minLevel: 10,
    desc: "完成三次打工，为师门筹集银两与物资。",
    objective: { action: "work", count: 3 },
    reward: { exp: 180, money: 90, sectContribution: 60, sectReputation: 12, items: [{ name: "大还丹", count: 1 }] }
  },
  {
    id: "bounty_001",
    type: "bounty",
    name: "悬赏恶霸",
    minLevel: 12,
    desc: "击败村口恶霸·王五，领取悬红。",
    objective: { action: "kill", target: "村口恶霸·王五", count: 1 },
    reward: { exp: 220, money: 320, items: [{ name: "碎银子", count: 2 }] }
  }
];
