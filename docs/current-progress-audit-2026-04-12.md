# Current Progress Audit (2026-04-12)

## 1. Systems Already Working
- hall / map switching
- exploration and encounters
- turn-based battle
- backpack and equipment
- shop / market
- quest system
- sect join / sect pages
- cultivation system
- treasure map and dungeon entry
- logbook system
- save / load

## 2. Systems Still Partial / Prototype
- sect exchange / titles / secret techniques
- martial arts learning and upgrading
- treasure map loop
- dungeon loop
- encyclopedia linkage
- hall presentation layer

## 3. Current Confirmed Problems / Risks
- hall log navigation behavior is unclear
- main logs and category logs may feel duplicated
- some field naming is inconsistent
- sect contribution and secret-technique loop is incomplete
- martial arts learning / upgrading is not deeply mapped into battle
- dungeon / treasure map rewards are still template-heavy
- mixed naming styles increase maintenance cost

## 4. Current Data Size
- maps: 5
- monsters: 32
- equips: 26
- tasks: 25
- sects: 6
- martial arts: 7
- items: 21
- dungeons: 4
- treasure-map event templates: 1

## 5. Top Priority Systems To Rebuild Next
1. martial-arts to battle mapping layer
2. sect growth loop (contribution / exchange / secret techniques)
3. unified log model
4. dungeon / treasure-map gameplay loop
5. field naming standardization

## 6. Martial Arts Rebuild Preconditions
- battle loop is usable but still lightweight
- attributes are mostly sufficient but naming needs standardization
- sect contribution loop exists but is not fully closed
- status page has room for martial-arts display
- logging foundation exists but needs cleaner rules

## 7. Recommended 3-Phase Martial Arts Rebuild Plan
### Phase 1: Model and Contract Layer
- unify martial arts schema
- unify naming rules
- define learn / upgrade / breakthrough resource rules

### Phase 2: Battle Integration Layer
- connect martial arts into the battle engine
- support active / passive / trigger martial arts
- add readable combat logs for martial arts

### Phase 3: Growth and Balance Layer
- connect sect contribution / exchange / progression
- unify status page / sect page / logs feedback
- do balance verification with level anchors and battle samples

## Core Conclusion
The biggest current disconnect is:
martial arts data and learning flow already exist,
but martial arts are not yet truly connected to battle execution.