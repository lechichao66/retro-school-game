window.__JH_DATA__ = window.__JH_DATA__ || {};

window.__JH_DATA__.equipLevelBands = {
  version: 1,
  order: ["L10", "L20", "L30", "L40", "L50", "L60", "L70", "L80", "L90+"],
  mainstreamRange: { minLevel: 40, maxLevel: 80 },
  baseStatAnchors: {
    weaponAttack: {
      L40: { min: 120, max: 160 },
      L50: { min: 180, max: 240 },
      L60: { min: 260, max: 340 },
      L70: { min: 360, max: 470 },
      L80: { min: 500, max: 650 }
    },
    armorDefenseBySlot: {
      armor: {
        L40: { min: 70, max: 95 },
        L50: { min: 105, max: 140 },
        L60: { min: 150, max: 200 },
        L70: { min: 210, max: 280 },
        L80: { min: 300, max: 390 }
      },
      hat: {
        L40: { min: 50, max: 70 },
        L50: { min: 75, max: 105 },
        L60: { min: 110, max: 150 },
        L70: { min: 155, max: 210 },
        L80: { min: 220, max: 300 }
      },
      belt: {
        L40: { min: 35, max: 50 },
        L50: { min: 55, max: 78 },
        L60: { min: 80, max: 115 },
        L70: { min: 120, max: 170 },
        L80: { min: 180, max: 250 }
      },
      shoes: {
        L40: { min: 20, max: 32 },
        L50: { min: 32, max: 50 },
        L60: { min: 48, max: 72 },
        L70: { min: 70, max: 105 },
        L80: { min: 100, max: 145 }
      }
    }
  },
  sellPriceBaseByBand: {
    L10: 1000,
    L20: 2000,
    L30: 3000,
    L40: 5000,
    L50: 10000,
    L60: 30000,
    L70: 60000,
    L80: 120000,
    "L90+": 180000
  },
  bands: {
    L10: { key: "L10", minLevel: 1, maxLevel: 19, label: "10级段" },
    L20: { key: "L20", minLevel: 20, maxLevel: 29, label: "20级段" },
    L30: { key: "L30", minLevel: 30, maxLevel: 39, label: "30级段" },
    L40: { key: "L40", minLevel: 40, maxLevel: 49, label: "40级段" },
    L50: { key: "L50", minLevel: 50, maxLevel: 59, label: "50级段" },
    L60: { key: "L60", minLevel: 60, maxLevel: 69, label: "60级段" },
    L70: { key: "L70", minLevel: 70, maxLevel: 79, label: "70级段" },
    L80: { key: "L80", minLevel: 80, maxLevel: 89, label: "80级段" },
    "L90+": { key: "L90+", minLevel: 90, maxLevel: 999, label: "90级以上" }
  }
};
