window.__JH_DATA__ = window.__JH_DATA__ || {};
window.__JH_DATA__.tradeRoutes = {
  defaultRouteId: "novice_loop",
  post50GrowthPer10Levels: {
    min: 0.05,
    max: 0.08
  },
  expRatioByLevelBand: {
    l30: { min: 0.002, max: 0.006 },
    l40: { min: 0.004, max: 0.008 },
    l50: { min: 0.006, max: 0.009 }
  },
  routes: [
    {
      id: "novice_loop",
      name: "新手村短驳线",
      intro: "村镇周边短线运货，风险最低，适合起步积累。",
      requiredLevel: 1,
      silverByLevelBand: {
        l30: { min: 10000, max: 14000 },
        l40: { min: 12000, max: 16000 },
        l50: { min: 14000, max: 20000 }
      }
    },
    {
      id: "forest_supplies",
      name: "密林补给线",
      intro: "往返后山密林与村镇，收益更高但波动更大。",
      requiredLevel: 8,
      silverByLevelBand: {
        l30: { min: 13000, max: 17000 },
        l40: { min: 16000, max: 21000 },
        l50: { min: 20000, max: 28000 }
      }
    },
    {
      id: "yanpo_escort",
      name: "落雁护送线",
      intro: "接落雁坡商队护送，适合中期角色。",
      requiredLevel: 16,
      silverByLevelBand: {
        l30: { min: 17000, max: 22000 },
        l40: { min: 21000, max: 28000 },
        l50: { min: 28000, max: 37000 }
      }
    }
  ]
};
