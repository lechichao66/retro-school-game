# Battle System Design

## Goal
The battle system is the core execution layer of the game.

It should:
- support readable turn-based combat
- integrate player growth systems
- support future martial arts integration
- keep combat logs clear and understandable
- remain compatible with the existing browser text RPG structure

## Battle Style
This project uses a turn-based text combat system.

Core characteristics:
- turn-based
- text-log driven
- readable combat feedback
- expandable with martial arts, equipment effects, and status effects

## Current Confirmed Combat Elements
The current combat system already supports:
- attack and defense interaction
- crit rate
- crit damage
- resistance
- true damage
- weak-point damage
- shields
- status effects
- equipment effects
- combat logs

## Standard Combat Flow
A normal battle should follow this sequence:

1. battle starts
2. initialize player and enemy combat state
3. determine turn order
4. enter round loop
5. apply pre-turn effects
6. execute action
7. calculate hit / dodge / crit / damage / shield / status
8. apply post-action effects
9. write combat logs
10. check victory or defeat
11. distribute rewards
12. return to the appropriate page

## Martial Arts Integration Direction
Martial arts should not directly break the current battle system.
They should be integrated in a staged way.

Recommended order:
1. map martial arts slots into battle-ready data
2. support active martial arts
3. support passive martial arts
4. support trigger-based martial arts
5. expand logs and balancing

## Reserved Martial Arts Timing Hooks
Future martial arts integration should support these timing hooks:
- beforeTurn
- beforeAttack
- onHit
- onCrit
- onDodge
- onDamaged
- afterTurn

## Martial Arts Categories in Battle
The five categories should affect battle differently:

### gongfa
- attack multiplier
- resource efficiency
- inner power support

### wugong
- main active combat skill
- direct damage / combo / break / bleed / poison

### shenfa
- speed
- dodge
- hit
- crit rhythm

### lianti
- hp
- defense
- damage reduction
- survival

### miji
- trigger mechanics
- passive amplification
- special combat utility

## Phase 2 Principle
Phase 2 should use the smallest safe integration path.

It should:
- avoid large rewrites of battle-engine
- first build a mapping layer from player.martial.equipped to combat-ready skills/effects
- preserve the current project structure
- keep combat logs readable
- remain compatible with current starterSkills during transition

## Combat Log Rule
Any new combat effect from martial arts must be visible in logs.

Logs should clearly show:
- what triggered
- which martial art caused it
- what effect happened

Hidden combat effects without readable feedback should be avoided.

## Scope Boundary
This document is a battle-system outline.
It does not yet define all formulas in detail.

Detailed balancing, exact formula tuning, and advanced martial-art execution order
can be defined in later documents if needed.