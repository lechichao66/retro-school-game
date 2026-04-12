(function initBattleSkills(global) {
  const SKILL_LIBRARY = {
    quickSlash: {
      name: "快斩",
      triggerChance: 0.18,
      damageMultiplier: 1.35,
      log: "攻势骤然加快，斩出迅捷一击！"
    },
    ironSkin: {
      name: "铁骨护体",
      triggerChance: 0.18,
      addShield: 8,
      log: "气息一沉，周身浮现护体劲气！"
    },
    bleedClaw: {
      name: "裂伤爪击",
      triggerChance: 0.20,
      addStateToTarget: {
        type: "bleed",
        value: 4,
        duration: 3
      },
      log: "撕裂伤口，令目标不断失血！"
    },
    armorCrack: {
      name: "碎甲重击",
      triggerChance: 0.16,
      addStateToTarget: {
        type: "armorBreak",
        value: 2,
        duration: 2
      },
      log: "一击震散护体，令目标防御下降！"
    },
    stunStrike: {
      name: "震击",
      triggerChance: 0.10,
      addStateToTarget: {
        type: "stun",
        value: 1,
        duration: 1
      },
      log: "这一击震得目标短暂失神！"
    },
    weakenCurse: {
      name: "虚弱咒",
      triggerChance: 0.14,
      addStateToTarget: {
        type: "weaken",
        value: 4,
        duration: 2
      },
      log: "诡异气息缠身，目标攻势变弱！"
    },
    regenAura: {
      name: "回生气",
      triggerChance: 0.16,
      addStateToSelf: {
        type: "regen",
        value: 5,
        duration: 3
      },
      log: "气脉流转，开始持续恢复！"
    },
    burnHit: {
      name: "灼火击",
      triggerChance: 0.15,
      addStateToTarget: {
        type: "burn",
        value: 5,
        duration: 2
      },
      log: "炽烈劲道灼伤了目标！"
    },
    shieldBurst: {
      name: "护体罡气",
      triggerChance: 0.12,
      addShield: 12,
      log: "护体罡气凝结成盾！"
    },
    savageBlow: {
      name: "蛮横猛击",
      triggerChance: 0.14,
      damageMultiplier: 1.6,
      log: "凶性大发，打出一记蛮横猛击！"
    }
  };

  function triggerSkills(attacker, defender, skillIds, attackerName, defenderName, baseDamage, options) {
    if (!skillIds || !Array.isArray(skillIds) || skillIds.length === 0) {
      return {
        damage: baseDamage,
        skipped: false
      };
    }

    const runtimeOptions = options && typeof options === "object" ? options : {};
    const skillSourceMap = runtimeOptions.skillSourceMap && typeof runtimeOptions.skillSourceMap === "object"
      ? runtimeOptions.skillSourceMap
      : {};

    const effects = global.__JH_BATTLE_EFFECTS__;
    let damage = baseDamage;

    for (const skillId of skillIds) {
      const skill = SKILL_LIBRARY[skillId];
      if (!skill) continue;

      if (Math.random() < (skill.triggerChance || 0)) {
        const sourceLabel = skillSourceMap[skillId] ? `（来源：${skillSourceMap[skillId]}）` : "";
        addLog("event", `【技能】${attackerName}施展了【${skill.name}】${sourceLabel}！${skill.log || ""}`);

        if (skill.damageMultiplier) {
          damage = Math.floor(damage * skill.damageMultiplier);
        }

        if (skill.addShield) {
          attacker.shield = (attacker.shield || 0) + skill.addShield;
          addLog("event", `【护盾】${attackerName}获得 ${skill.addShield} 点护盾！`);
        }

        if (skill.addStateToTarget) {
          effects.addBattleState(defender, { ...skill.addStateToTarget });
          addLog("event", `【状态】${defenderName}进入${effects.getStateText(skill.addStateToTarget.type)}状态！`);
        }

        if (skill.addStateToSelf) {
          effects.addBattleState(attacker, { ...skill.addStateToSelf });
          addLog("event", `【状态】${attackerName}进入${effects.getStateText(skill.addStateToSelf.type)}状态！`);
        }
      }
    }

    return {
      damage,
      skipped: false
    };
  }

  global.__JH_BATTLE_SKILLS__ = {
    SKILL_LIBRARY,
    triggerSkills
  };
})(window);
