# 装备系统 1.0 最终实施方案（严格分阶段）

> 本方案用于替代上一版“装备系统 1.0”草案，按更严格边界执行。
> 原则：小步落地、可回滚、先数据合同与兼容，再显示，再经济，再预留。

---

## 0. 总体执行原则

- **必须按阶段顺序执行**，禁止跨阶段并行开发。
- **每阶段都有明确“可改文件白名单”**；未到该阶段的文件不得改动。
- **不做一锅炖**：每阶段完成后先自测与冻结，再进入下一阶段。
- **维持现有玩法循环**：不改变当前穿戴、战斗流程与 UI 导航逻辑。
- **保持存档兼容优先**：旧存档可读、旧装备可补全默认字段。

---

## 第一阶段（仅基础结构，严格封板）

### 1.1 阶段目标（只做这 5 项）

1. 装备数据合同升级
2. 等级带表（level bands）
3. 品级配置扩展
4. 存档兼容
5. 旧装备默认值补全

### 1.2 第一阶段可改文件（白名单）

- `src/data/equips.js`
- `src/data/equip-quality-config.js`
- `src/data/equip-level-bands.js`（新增）
- `src/systems/save-system.js`

### 1.3 第一阶段禁止改动

- `src/app/ui-render.js`
- `utils.js`
- `src/app/economy-bag.js`
- `src/state/selectors.js`
- 任何 battle 相关文件

### 1.4 数据合同（Phase 1 合法字段）

统一装备数据为“1.0 合同层”，核心字段建议如下（可兼容旧字段别名）：

```js
{
  id: "iron_sword",
  name: "铁剑",
  slot: "weapon",
  grade: "common",          // 品级 key（来自 equip-quality-config）
  levelReq: 1,               // 穿戴等级要求

  baseStats: {
    attack: 8,
    defense: 0
  },

  affixes: [
    // 词缀对象结构先保持轻量，权重体系后续再精化
  ],

  specialEffects: [
    // 仅预留，不在 1.0 经济与战斗中生效
  ],

  // 兼容/计算字段
  levelBand: "L1",          // 可由 levelReq 映射得到
  sellPrice: 0               // 可选缓存值；权威值由公式即时计算
}
```

说明：
- `specialEffects` 在 Phase 1 只作为**预留字段**，不进入经济计算与战斗流程。
- 不新增玩家装备槽位；饰品/护符/artifact 仅作为 schema/规划预留，不落地新槽位。

### 1.5 等级带表（新增 `equip-level-bands.js`）

新增统一等级带数据源，例如：

```js
window.__JH_DATA__.equipLevelBands = [
  { band: "L1", minLevel: 1,  maxLevel: 9,  basePrice: 20 },
  { band: "L2", minLevel: 10, maxLevel: 19, basePrice: 60 },
  { band: "L3", minLevel: 20, maxLevel: 29, basePrice: 140 },
  { band: "L4", minLevel: 30, maxLevel: 39, basePrice: 260 },
  { band: "L5", minLevel: 40, maxLevel: 49, basePrice: 420 }
];
```

要求：
- 数据可被 `levelReq` 稳定映射。
- 不写死到 UI 或经济模块；先作为合同层基础表。
- 价格可调参，但结构先固定。

### 1.6 品级配置扩展（`equip-quality-config.js`）

扩展并统一品级配置键，至少包含：

- `gradeName`（显示名）
- `gradeColor`（显示色）
- `gradeSellMultiplier`（卖价倍率）

> `gradeSellMultiplier` 是 1.0 经济公式唯一倍率来源。

### 1.7 卖价公式（1.0 先冻结定义，不做经济接入）

第一阶段只定义并冻结公式，不接入背包/商店流程：

```text
equipSellPrice = levelBandBasePrice × gradeSellMultiplier
```

明确不纳入：
- `affixValueFactor`
- `specialReserveFactor`

原因：
- 附加属性权重尚未稳定。
- 特效属于预留字段，不应提前进入经济。
- 先确保卖价模型简单、稳、可校准。

### 1.8 存档兼容（`save-system.js`）

兼容策略：
- 读取旧存档时，若装备缺少新字段（`grade` / `levelReq` / `baseStats` / `affixes` / `specialEffects` 等），自动补默认值。
- 旧字段（如 `attack` / `defense`）存在时，迁移填入 `baseStats`，保持向后兼容。
- 不更改现有装备槽位结构；仅修复字段缺失。

### 1.9 第一阶段验收清单（DoD）

- 新增 `equip-level-bands.js` 并成功挂到数据命名空间。
- `equips.js` 中每件装备都可通过合同补全函数得到完整字段。
- `equip-quality-config.js` 的每个品级都有 `gradeSellMultiplier`。
- 旧存档载入后不会因字段缺失报错。
- 未触碰白名单外文件。
- 未改动 `ui-render.js` / `utils.js` / `economy-bag.js` / `selectors.js` / battle 相关文件。

### 1.10 第一阶段封板后才能进入第二阶段

- 阶段验收项全部通过后，先冻结分支与数据合同说明。
- 未封板前禁止提前做 tooltip、卖价联动、扩展字段落地。

---

## 第二阶段（tooltip 与显示）

> 第一阶段完成并冻结后再开始。

### 2.1 阶段目标

在不改动战斗逻辑前提下，完善装备 tooltip 与展示一致性。

### 2.2 tooltip 必显字段（按优先顺序）

1. 装备名
2. 品级
3. 部位
4. 等级要求
5. 基础属性
6. 附加属性
7. 卖价

### 2.3 特效字段展示规则（强制文案）

若存在 `specialEffects`，只能以“预留态”展示：
- 预留
- 未激活
- 后续开放

禁止让玩家误解为当前已生效。

### 2.4 第二阶段边界

- 可动 UI 展示相关文件（如 `ui-render.js`）。
- 不改战斗引擎，不注入特效生效逻辑。
- 不改卖价公式。

---

## 第三阶段（卖价接入与经济联动）

> 第二阶段完成后执行。

### 3.1 阶段目标

将第一阶段确定的卖价公式稳定接入背包/商店售卖流程。

### 3.2 经济侧规则

- 售价统一由 `levelBandBasePrice × gradeSellMultiplier` 计算。
- 词缀与特效仍不计价。
- 若缺少等级带或品级配置，回退到安全默认值并记录日志。
- 明确不使用 `affixValueFactor` / `specialReserveFactor`。

### 3.3 第三阶段边界

- 允许改 `economy-bag.js` 等经济文件。
- 不扩展新装备槽位。
- 不引入复杂动态估值模型。

---

## 第四阶段（扩展字段预留）

> 第三阶段稳定后执行。

### 4.1 阶段目标

只做“未来能力预留”，不做玩法生效。

### 4.2 可预留内容

- artifact/护符/饰品的 schema 规划字段
- 词缀权重、特效估值等未来参数位
- 后续系统开关标记（feature flags）

### 4.3 禁止事项

- 不新增 player-state 装备槽位。
- 不在 UI 中正式开放未来饰品系统入口。
- 不把预留字段偷偷接入战斗或经济主流程。

---

## terminology.js 与 selectors.js 的当前定位

- 在“装备系统 1.0 第一阶段”中，二者均为**可选项，不是刚需**。
- 若只是术语展示整齐，不为此新增 `terminology.js`。
- 若装备派生读取仍可维护，不在第一阶段提前改 `selectors.js`。

---

## 实施节奏建议（可直接开工）

1. 先开 `phase-1/equip-contract` 分支任务：仅白名单四文件。
2. 完成后跑存档回归（新档/旧档/缺字段档）。
3. 冻结 Phase 1，并输出字段变更表。
4. 再进入 Phase 2 tooltip 展示。
5. 再进入 Phase 3 经济接入。
6. 最后 Phase 4 预留扩展。

---

## 每阶段输出物模板

每阶段结束时固定输出：

1. **变更文件清单**（仅列本阶段）
2. **schema 变更摘要**（新增字段、默认值、兼容策略）
3. **玩法影响说明**（玩家体感是否变化）
4. **下一步推荐实施项**（下一阶段的最小入口）
