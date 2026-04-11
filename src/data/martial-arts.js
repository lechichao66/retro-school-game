window.__JH_DATA__ = window.__JH_DATA__ || {};

window.__JH_DATA__.martialArtsBySect = {
  无门无派: {
    intro: "尚未拜入门派，当前仅可修习基础拳脚。",
    skills: [
      {
        id: "basic_fist",
        name: "基础拳脚",
        realm: "入门",
        effect: "造成基础伤害，小幅提升稳定输出。",
        baseMasteryGain: 1,
        learnReq: { level: 1, contribution: 0, money: 0 },
        battleSkill: "quickSlash"
      }
    ]
  },
  少林: {
    intro: "少林武学重守御与筋骨，越战越稳。",
    passive: "金钟护体：防御与抗性额外提升。",
    skills: [
      {
        id: "shaolin_luohan",
        name: "罗汉伏魔拳",
        realm: "初境",
        effect: "提升破甲与稳态输出，熟练后附带小额护盾。",
        baseMasteryGain: 2,
        learnReq: { level: 10, contribution: 80, money: 120 },
        battleSkill: "armorCrack"
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
        realm: "初境",
        effect: "提升暴击伤害并增强持续作战。",
        baseMasteryGain: 2,
        learnReq: { level: 10, contribution: 80, money: 120 },
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
        realm: "初境",
        effect: "提高弱点伤害并强化流血触发。",
        baseMasteryGain: 2,
        learnReq: { level: 10, contribution: 80, money: 120 },
        battleSkill: "bleedClaw"
      }
    ]
  }
};
