# Martial Arts Schema

## Purpose
This document defines the standard data structure for the martial arts system.

It is used for:
- martial arts data definitions
- player martial arts slots
- UI display
- future battle integration

## Naming Rule
All new martial-arts-related keys must use camelCase.

## Standard Martial Art Object Example

```js
{
  id: "shaolin-basic-heart",
  name: "Shaolin Basic Heart Method",
  sectId: "shaolin",
  category: "gongfa",
  quality: "thirdRate",
  maxLevel: 50,
  currentStage: 1,

  learnReq: {
    playerLevel: 1,
    sectContribution: 0,
    silver: 100,
    prereqs: []
  },

  upgradeCost: {
    silverBase: 50,
    expBase: 20,
    contributionBase: 0
  },

  breakthroughReq: {
    enabled: true,
    stages: [10, 20, 30, 40]
  },

  baseBonuses: {
    attackMultiplier: 0,
    hpMax: 0,
    mpMax: 0,
    defense: 0,
    speed: 0,
    dodgeRate: 0,
    hitRate: 0,
    critRate: 0,
    critDamage: 0,
    damageReduction: 0
  },

  displayStats: [
    "attackMultiplier",
    "mpMax",
    "critDamage"
  ],

  activeSkill: null,
  passiveEffects: [],
  triggerEffects: [],
  battleHooks: [],

  source: {
    type: "sectTeach",
    note: "starter martial art"
  },

  nextEvolution: []
}
```

## Field Definitions

### Core Identity
- `id`: unique martial art id
- `name`: display name
- `sectId`: source sect id
- `category`: one of:
  - `gongfa`
  - `wugong`
  - `shenfa`
  - `lianti`
  - `miji`
- `quality`: martial art quality tier

### Growth
- `maxLevel`: level cap of this martial art
- `currentStage`: current breakthrough stage

### Learning
- `learnReq`: learning requirements

### Upgrading
- `upgradeCost`: base upgrade cost model

### Breakthrough
- `breakthroughReq`: stage-based breakthrough structure

### Stats
- `baseBonuses`: stable non-trigger bonuses
- `displayStats`: stats emphasized in the status page

### Reserved Combat Fields
Phase 1 does not fully integrate combat yet, but reserves:
- `activeSkill`
- `passiveEffects`
- `triggerEffects`
- `battleHooks`

### Acquisition
- `source`: how the martial art is obtained
- `nextEvolution`: future evolution path

## Player Martial Arts Slots
The player should eventually hold 5 equipped martial arts slots:

```js
{
  gongfa: null,
  wugong: null,
  shenfa: null,
  lianti: null,
  miji: null
}
```

## Phase 1 Target
Phase 1 only does the following:
- unify schema
- support martial arts slots
- support status page display
- prepare for future battle integration