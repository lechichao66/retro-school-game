# Martial Arts System Design

## Goal
The martial arts system must become a real gameplay system,
not just a display-only data layer.

In the long run, it should connect:
- player growth
- sect identity
- battle execution
- status page display
- logs
- long-term progression

## Five Martial Arts Categories
The system supports 5 categories:

### 1. gongfa
- internal foundation
- resource cycle
- attack multiplier
- inner power efficiency

### 2. wugong
- main combat techniques
- active attacks
- combo, armor break, bleed, poison, burst

### 3. shenfa
- speed
- dodge
- hit
- crit, follow-up, tempo

### 4. lianti
- hp
- defense
- damage reduction
- toughness
- survival

### 5. miji
- special mechanics
- passive amplification
- trigger effects
- special utility

## Quality Tiers
Current supported tiers:
- low
- thirdRate
- secondRate
- firstRate
- topTier

Reserved for the future:
- xiantian
- grandmaster
- greatGrandmaster
- transcendence

## Growth Model
The martial arts system should eventually support:
- learn
- upgrade
- breakthrough

## Phase 1 Scope
Phase 1 only builds the foundation:
- unify schema
- define player martial arts slots
- define display structure
- connect martial arts to the status page

Phase 1 does NOT include:
- battle triggers
- battle execution mapping
- full sect contribution loop
- fragments, dungeon acquisition, or advanced progression

## Future Battle Integration Direction
Later phases should support:
- active martial arts
- passive martial arts
- trigger-based martial arts
- readable combat logs
- timing hooks such as:
  - beforeTurn
  - beforeAttack
  - onHit
  - onCrit
  - onDodge
  - onDamaged
  - afterTurn

## Design Principles
- martial arts must not remain display-only data
- martial arts must eventually affect real combat
- Phase 1 should stay small and safe
- all new martial-arts-related keys must use camelCase
- preserve compatibility with the current project structure