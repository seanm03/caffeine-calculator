---
title: "RPI Agent - Cycle Memory Persistence"
description: "Persist session memory at the end of every RPI Agent cycle and after individual agent completions"
applyTo: "**"
---

## Cycle Memory Persistence

After every complete RPI Agent cycle (passing through Phase 5: Discover), and after any individual agent invocation (Phase Implementor, Researcher Subagent, Implementation Validator, RPI Validator, Task Reviewer), persist a session memory summary.

## Session Memory Protocol

### After Complete RPI Cycle (Phase 5)

After the Discover phase completes, save a session memory note at `/memories/session/` summarizing:

* Work items completed in the cycle
* Key decisions made and their rationale
* Files changed (added, modified, removed)
* Any deviations from plan and why
* Validation results (test counts, lint status, type-check status)
* Suggested next work from Discover phase

### After Individual Agent Invocations

After any individual agent completes (Phase Implementor, Researcher Subagent, Implementation Validator, RPI Validator, Task Reviewer), save a brief session memory note with:

* Agent name and purpose
* Key findings or changes made
* Any issues encountered

### Memory File Naming

Use the pattern: `/memories/session/{{YYYY-MM-DD}}-{{descriptive-slug}}.md`

Example: `/memories/session/2026-06-10-branded-types-migration.md`

### Memory Content Format

All session memory files must begin with `<!-- markdownlint-disable-file -->` to bypass mega-linter rules. Keep entries concise — brief bullet points rather than lengthy prose.
