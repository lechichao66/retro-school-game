window.__JH_DATA__ = window.__JH_DATA__ || {};

window.__JH_DATA__.taskTemplates = [
  { id: "main_001", type: "main", name: "初入江湖", minLevel: 1, desc: "击败野狗，证明你能独自行走江湖。", objective: { action: "kill", target: "野狗", count: 3 }, reward: { exp: 160, money: 80, items: [{ name: "小还丹", count: 1 }] } },
  { id: "main_002", type: "main", name: "密林试炼", minLevel: 10, desc: "前往后山密林，击败山贼精英。", objective: { action: "kill", target: "山贼精英", count: 2 }, reward: { exp: 860, money: 320, items: [{ name: "精铁", count: 2 }] } },
  { id: "main_003", type: "main", name: "断桥风云", minLevel: 20, desc: "压制断桥刀卫，打开前往深谷的道路。", objective: { action: "kill", target: "断桥刀卫", count: 3 }, reward: { exp: 3200, money: 980 } },
  { id: "main_004", type: "main", name: "百兽惊魂", minLevel: 30, desc: "击退白额大虫与古藤妖猿。", objective: { action: "kill", target: "古藤妖猿", count: 2 }, reward: { exp: 9200, money: 2100 } },
  { id: "main_005", type: "main", name: "地宫启封", minLevel: 40, desc: "挑战地宫之主·夜枭。", objective: { action: "kill", target: "地宫之主·夜枭", count: 1 }, reward: { exp: 26000, money: 6200, items: [{ name: "伤寒论残页", count: 1 }] } },

  { id: "side_001", type: "side", name: "药房求材", minLevel: 5, desc: "替药房采集止血草。", objective: { action: "collect", target: "止血草", count: 4 }, reward: { exp: 420, money: 180, items: [{ name: "大还丹", count: 1 }] } },
  { id: "side_002", type: "side", name: "矿洞补给", minLevel: 8, desc: "上交矿石支援铁匠。", objective: { action: "collect", target: "矿石", count: 5 }, reward: { exp: 520, money: 220 } },
  { id: "side_003", type: "side", name: "渔港鲜货", minLevel: 12, desc: "收集小鱼补充粮草。", objective: { action: "collect", target: "小鱼", count: 6 }, reward: { exp: 760, money: 260 } },
  { id: "side_004", type: "side", name: "兽谷哨探", minLevel: 20, desc: "击败百兽谷的狂暴山魈，带回情报。", objective: { action: "kill", target: "狂暴山魈", count: 5 }, reward: { exp: 3600, money: 1200, items: [{ name: "熊胆", count: 1 }] } },
  { id: "side_005", type: "side", name: "幽冥残痕", minLevel: 36, desc: "清理阴火傀儡，护送队伍撤离。", objective: { action: "kill", target: "阴火傀儡", count: 4 }, reward: { exp: 12800, money: 3600 } },

  { id: "daily_001", type: "daily", name: "日常巡逻", minLevel: 1, desc: "清剿任意普通怪，维持周边安宁。", objective: { action: "kill_type", target: "normal", count: 8 }, reward: { exp: 420, money: 220 } },
  { id: "daily_002", type: "daily", name: "商队护送", minLevel: 8, desc: "完成跑商。", objective: { action: "work", count: 4 }, reward: { exp: 660, money: 300 } },
  { id: "daily_003", type: "daily", name: "勤修不辍", minLevel: 10, desc: "完成修炼。", objective: { action: "cultivate", count: 3 }, reward: { exp: 880, money: 260 } },
  { id: "daily_004", type: "daily", name: "资源收集", minLevel: 14, desc: "采集木头。", objective: { action: "collect", target: "木头", count: 6 }, reward: { exp: 1080, money: 320 } },
  { id: "daily_005", type: "daily", name: "精英清剿", minLevel: 22, desc: "击败精英怪。", objective: { action: "kill_type", target: "elite", count: 2 }, reward: { exp: 4600, money: 1500 } },

  { id: "sect_001", type: "sect", name: "师门勤修", minLevel: 8, desc: "完成两次练功，积累门派贡献。", objective: { action: "cultivate", count: 2 }, reward: { exp: 640, money: 220, sectContribution: 40, sectReputation: 10 } },
  { id: "sect_002", type: "sect", name: "师门采办", minLevel: 10, desc: "完成三次跑商，为师门筹资。", objective: { action: "work", count: 3 }, reward: { exp: 820, money: 300, sectContribution: 60, sectReputation: 12, items: [{ name: "大还丹", count: 1 }] } },
  { id: "sect_003", type: "sect", name: "值守演武场", minLevel: 14, desc: "击败普通敌人。", objective: { action: "kill_type", target: "normal", count: 10 }, reward: { exp: 1200, money: 360, sectContribution: 80, sectReputation: 16 } },
  { id: "sect_004", type: "sect", name: "门规巡检", minLevel: 22, desc: "击败精英敌人。", objective: { action: "kill_type", target: "elite", count: 3 }, reward: { exp: 5200, money: 1600, sectContribution: 120, sectReputation: 26 } },
  { id: "sect_005", type: "sect", name: "宗门讨逆", minLevel: 36, desc: "击败首领级敌人。", objective: { action: "kill_type", target: "boss", count: 1 }, reward: { exp: 16200, money: 4200, sectContribution: 180, sectReputation: 40 } },

  { id: "bounty_001", type: "bounty", name: "悬赏恶霸", minLevel: 12, desc: "击败村口恶霸·王五，领取悬红。", objective: { action: "kill", target: "村口恶霸·王五", count: 1 }, reward: { exp: 980, money: 900, items: [{ name: "碎银子", count: 2 }] } },
  { id: "bounty_002", type: "bounty", name: "通缉三当家", minLevel: 20, desc: "缉拿山贼三当家。", objective: { action: "kill", target: "山贼三当家", count: 1 }, reward: { exp: 4200, money: 2400 } },
  { id: "bounty_003", type: "bounty", name: "铁掌追缉", minLevel: 30, desc: "击败铁掌凶徒·葛魁。", objective: { action: "kill", target: "铁掌凶徒·葛魁", count: 1 }, reward: { exp: 10800, money: 5200 } },
  { id: "bounty_004", type: "bounty", name: "兽王猎令", minLevel: 38, desc: "讨伐兽王·狴犴姿。", objective: { action: "kill", target: "兽王·狴犴姿", count: 1 }, reward: { exp: 18800, money: 7600 } },
  { id: "bounty_005", type: "bounty", name: "地宫缉凶", minLevel: 45, desc: "击败地宫之主·夜枭。", objective: { action: "kill", target: "地宫之主·夜枭", count: 1 }, reward: { exp: 32000, money: 12000 } }
];
