# AGENTS.md

## Project identity
This is an existing half-built browser-based text wuxia RPG project.
It is not a greenfield rewrite.

## Read first before coding
Always read these files before making implementation decisions:
- README.md
- docs/current-progress-audit-2026-04-12.md
- docs/project-status.md
- docs/design/martial-arts-system.md
- docs/data/martial-arts-schema.md

## Current top priority
The current top priority is rebuilding the martial arts system in a safe, incremental way.

Phase 1 only:
- unify martial arts schema
- add character martial arts slots
- standardize new martial-arts-related key naming
- show learned martial arts in the status page

Do not integrate martial arts battle triggers in Phase 1.

## Important constraints
- Do not rewrite the whole project
- Do not refactor unrelated systems
- Prefer incremental changes over large rewrites
- Preserve existing gameplay loops unless explicitly asked
- Preserve save/load compatibility as much as possible
- Keep the current modular structure under SRC intact

## Existing structure
Main folders currently include:
- SRC/应用
- SRC/战斗
- SRC/数据
- SRC/州
- SRC/系统

Treat these folders as the current architecture and extend them carefully.

## Martial arts implementation rules
- Martial arts must eventually support 5 categories:
  - gongfa
  - wugong
  - shenfa
  - lianti
  - miji
- All NEW martial-arts-related keys should use camelCase
- Martial arts should first exist as data + player slots + status page display
- Battle integration comes later, in a separate phase

## Battle-related rules
- Any future combat integration must keep battle logs readable
- Do not silently inject hidden combat effects without log output
- Do not modify battle-engine flow unless the task explicitly requires it

## UI rules
- Do not redesign the UI broadly
- Only add clearly scoped martial-arts-related display where needed
- Preserve existing pages and navigation behavior unless explicitly asked

## Output expectations
When finishing a task:
- summarize changed files
- summarize schema changes
- explain gameplay impact
- list the next recommended implementation step