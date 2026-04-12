(function initMartialBattleMapper(global) {
  const g = global || window;

  function uniqueSkillIds(skillIds) {
    return [...new Set((Array.isArray(skillIds) ? skillIds : []).filter((x) => typeof x === "string" && x))];
  }

  function buildStarterSkillSourceMap(skillIds) {
    return uniqueSkillIds(skillIds).reduce((acc, skillId) => {
      acc[skillId] = "starterSkills/基础技能";
      return acc;
    }, {});
  }

  function getMartialSkillById(skillId, martialArtsBySect) {
    if (!skillId || !martialArtsBySect) return null;

    const all = Object.values(martialArtsBySect || {})
      .flatMap((sect) => Array.isArray(sect?.skills) ? sect.skills : [])
      .filter(Boolean);

    const found = all.find((item) => item.id === skillId);
    if (!found) return null;

    if (g.__JH_MARTIAL_ARTS__?.normalizeMartialArtSkill) {
      return g.__JH_MARTIAL_ARTS__.normalizeMartialArtSkill(found);
    }

    return found;
  }

  function mapEquippedWugongToBattleSkills(playerRef, baseSkillIds, martialArtsBySect) {
    const skillIds = uniqueSkillIds(baseSkillIds);
    const skillSourceMap = buildStarterSkillSourceMap(skillIds);

    const equippedWugongId = playerRef?.martial?.equipped?.wugong || playerRef?.martial?.activeSkill || "";
    if (!equippedWugongId) {
      return {
        skillIds,
        skillSourceMap,
        mappedWugong: null
      };
    }

    const wugong = getMartialSkillById(equippedWugongId, martialArtsBySect);
    if (!wugong || wugong.category !== "wugong" || !wugong.battleSkill) {
      return {
        skillIds,
        skillSourceMap,
        mappedWugong: null
      };
    }

    if (!skillIds.includes(wugong.battleSkill)) {
      skillIds.push(wugong.battleSkill);
    }
    skillSourceMap[wugong.battleSkill] = `wugong:${wugong.name}`;

    return {
      skillIds,
      skillSourceMap,
      mappedWugong: {
        id: wugong.id,
        name: wugong.name,
        battleSkill: wugong.battleSkill
      }
    };
  }

  g.__JH_MARTIAL_BATTLE_MAPPER__ = {
    mapEquippedWugongToBattleSkills
  };
})(window);
