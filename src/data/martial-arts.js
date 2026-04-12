window.__JH_DATA__ = window.__JH_DATA__ || {};

(function initMartialArtsData(global) {
  const g = global || window;

  const CATEGORY_MAP = {
    功法: "gongfa",
    武功: "wugong",
    身法: "shenfa",
    炼体: "lianti",
    秘技: "miji"
  };

  const QUALITY_MAP = {
    不入流: "low",
    三流: "thirdRate",
    二流: "secondRate",
    一流: "firstRate",
    绝顶: "topTier"
  };

  const REALM_STAGE_MAP = {
    入门: 1,
    初境: 1,
    中境: 2,
    高境: 3,
    圆满: 4
  };

  function normalizeCategory(raw) {
    return CATEGORY_MAP[raw] || raw || "wugong";
  }

  function normalizeQuality(raw) {
    return QUALITY_MAP[raw] || raw || "low";
  }

  function normalizeStage(raw) {
    return REALM_STAGE_MAP[raw] || 1;
  }

  function normalizeLearnReq(learnReq) {
    const source = learnReq && typeof learnReq === "object" ? learnReq : {};
    return {
      playerLevel: Number(source.playerLevel ?? source.level) || 1,
      sectContribution: Number(source.sectContribution ?? source.contribution) || 0,
      silver: Number(source.silver ?? source.money) || 0,
      prereqs: Array.isArray(source.prereqs) ? source.prereqs : []
    };
  }

  function normalizeMartialArtSkill(skill) {
    const source = skill && typeof skill === "object" ? skill : {};
    return {
      ...source,
      id: source.id || "",
      name: source.name || "未命名武学",
      sectId: source.sectId || "",
      category: source.category || normalizeCategory(source.categoryCn || source.type),
      categoryCn: source.categoryCn || source.category || "武功",
      quality: source.quality || normalizeQuality(source.grade),
      grade: source.grade || source.quality || "不入流",
      maxLevel: Number(source.maxLevel) || 50,
      currentStage: Number(source.currentStage) || normalizeStage(source.realm),
      realm: source.realm || "入门",
      baseMasteryGain: Number(source.baseMasteryGain) || 1,
      learnReq: normalizeLearnReq(source.learnReq),
      battleSkill: source.battleSkill || null,
      effect: source.effect || ""
    };
  }

  g.__JH_DATA__.martialArtsBySect = {
    无门无派: {
      intro: "尚未拜入门派，当前仅可修习基础拳脚。",
      skills: [
        {
          id: "basic_fist",
          name: "基础拳脚",
          category: "wugong",
          categoryCn: "武功",
          quality: "low",
          grade: "不入流",
          realm: "入门",
          effect: "造成基础伤害，小幅提升稳定输出。",
          baseMasteryGain: 1,
          learnReq: { playerLevel: 1, sectContribution: 0, silver: 0 },
          battleSkill: "quickSlash"
        }
      ]
    },
    少林: {
      intro: "少林武学重守御与筋骨，越战越稳。",
      passive: "金钟护体：防御与抗性额外提升。",
      skills: [
        {
          id: "shaolin_jingang_gongfa",
          name: "金刚心法",
          category: "gongfa",
          categoryCn: "功法",
          quality: "thirdRate",
          grade: "三流",
          realm: "初境",
          effect: "提升稳定内息，降低武学研习消耗压力。",
          baseMasteryGain: 2,
          learnReq: { playerLevel: 10, sectContribution: 60, silver: 90 },
          battleSkill: "ironSkin"
        },
        {
          id: "shaolin_luohan",
          name: "罗汉伏魔拳",
          category: "wugong",
          categoryCn: "武功",
          quality: "secondRate",
          grade: "二流",
          realm: "初境",
          effect: "提升破甲与稳态输出，熟练后附带小额护盾。",
          baseMasteryGain: 2,
          learnReq: { playerLevel: 10, sectContribution: 80, silver: 120 },
          battleSkill: "armorCrack"
        },
        {
          id: "shaolin_jingang_body",
          name: "金刚炼体",
          category: "lianti",
          categoryCn: "炼体",
          quality: "thirdRate",
          grade: "三流",
          realm: "初境",
          effect: "强化体魄，提升承伤与续航。",
          baseMasteryGain: 2,
          learnReq: { playerLevel: 12, sectContribution: 100, silver: 140 },
          battleSkill: "ironSkin"
        },
        {
          id: "shaolin_chan_secret",
          name: "禅定秘技",
          category: "miji",
          categoryCn: "秘技",
          quality: "firstRate",
          grade: "一流",
          realm: "初境",
          effect: "门派秘技，偏向状态稳定与防守反击。",
          baseMasteryGain: 3,
          learnReq: { playerLevel: 16, sectContribution: 180, silver: 220 },
          battleSkill: "regenAura"
        }
      ]
    },
    武当: {
      intro: "武当讲求以柔克刚，内息连绵。",
      passive: "太极回元：每回合有概率恢复少量气血。",
      skills: [
        {
          id: "wudang_taiji",
          name: "太极剑意",
          category: "shenfa",
          categoryCn: "身法",
          quality: "secondRate",
          grade: "二流",
          realm: "初境",
          effect: "提升暴击伤害并增强持续作战。",
          baseMasteryGain: 2,
          learnReq: { playerLevel: 10, sectContribution: 80, silver: 120 },
          battleSkill: "regenAura"
        }
      ]
    },
    唐门: {
      intro: "唐门偏向爆发与异常状态。",
      passive: "暗器贯脉：弱点伤害额外提升。",
      skills: [
        {
          id: "tangmen_shadow",
          name: "追魂暗器",
          category: "wugong",
          categoryCn: "武功",
          quality: "secondRate",
          grade: "二流",
          realm: "初境",
          effect: "提高弱点伤害并强化流血触发。",
          baseMasteryGain: 2,
          learnReq: { playerLevel: 10, sectContribution: 80, silver: 120 },
          battleSkill: "bleedClaw"
        }
      ]
    }
  };

  function getAllMartialArts() {
    return Object.values(g.__JH_DATA__.martialArtsBySect || {})
      .flatMap((sect) => Array.isArray(sect.skills) ? sect.skills : [])
      .map(normalizeMartialArtSkill);
  }

  g.__JH_MARTIAL_ARTS__ = {
    normalizeMartialArtSkill,
    normalizeCategory,
    normalizeQuality,
    normalizeLearnReq,
    getAllMartialArts
  };
})(window);
