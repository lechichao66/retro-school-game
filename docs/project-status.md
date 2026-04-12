# Project Status

## Project Type
This is an existing half-built browser-based text wuxia RPG project.

## Current Main Structure
Main directories currently include:
- src/应用
- src/战斗
- src/数据
- src/州
- src/系统

The project still keeps several top-level legacy files, including:
- battle.js
- cultivation.js
- data.js
- game.js
- index.html
- map.js
- player.js
- style.css
- utils.js

## Systems That Are Already Usable
The following systems are already usable in some form:
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

## Systems That Are Still Partial / Prototype
The following systems exist but are still incomplete:
- sect exchange / titles / secret techniques
- martial arts learning and upgrading
- treasure map loop
- dungeon loop
- encyclopedia linkage
- hall presentation layer

## Most Important Current Disconnect
Martial arts data, learning entry points, and upgrade entry points already exist,
but martial arts are not yet truly connected to the battle execution chain.

This is the current highest-priority issue.

## Current Top Priority
Rebuild the martial arts system in a safe, incremental way.

### Phase 1 Target
- unify martial arts schema
- add player martial arts slots
- standardize new martial-arts-related key naming
- show martial arts in the status page

### Phase 1 Does Not Include
- no battle trigger integration yet
- no major UI redesign
- no broad refactor of unrelated modules

## Current Risks
- some field naming is still inconsistent
- main logs and category logs may feel duplicated
- sect growth loop is incomplete
- dungeon / treasure map systems are still template-heavy
- martial arts are not truly mapped into battle

## Development Principle
This project must continue through incremental extension.
Do not broadly rewrite unrelated systems unless explicitly requested.