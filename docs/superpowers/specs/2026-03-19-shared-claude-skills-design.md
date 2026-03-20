# Shared Claude Skills System

## Problem

Claude Code skills are duplicated across TKA Platform, Cirque Aflame, and Orion Cloud Creations. 12 skills exist in both TKA and Cirque with varying degrees of drift. OCC has zero project skills. Adding a new project means copying skills and watching them diverge.

## Solution

A shared `@austencloud/claude-skills` package in the existing `F:/_CODE/shared-packages` monorepo. Skills are authored as markdown templates with minimal placeholders. Each consuming project has a config file and runs `npx @austencloud/claude-skills sync` to render project-specific skill files.

## Package Structure

```
packages/claude-skills/
  package.json                    # @austencloud/claude-skills
  bin/
    sync.js                       # CLI entry point
  templates/
    skills/
      commit/SKILL.md
      changelog/SKILL.md
      check/SKILL.md
      ai-bust/SKILL.md
      monolith/SKILL.md
      deadcode/SKILL.md
      audit/SKILL.md
    agents/
      audit-evaluator/AGENT.md
      audit-fixer/AGENT.md
```

## Shared Skills (7)

| Skill | Purpose |
|-------|---------|
| `commit` | Smart multi-concern commit grouping |
| `changelog` | User-friendly changelog from git history |
| `check` | TypeScript error analysis and fixing |
| `ai-bust` | AI writing pattern detection |
| `monolith` | Large file decomposition analysis |
| `deadcode` | Unused code detection and cleanup |
| `audit` | 8-dimension code quality auditing |

## Project-Specific Skills (stay local)

- TKA: `museum`, `museum-lore`, `museum-writer`, `premium`, `lab`, `concepts`, `grant`, `mvp`, `screenshots`, `ship`, `skel2tka`, `skill-audit`, `tika`, `voice-review`
- Cirque: `act-intake`, `log`
- Feedback skills (`fb`, `submitfb`, `prioritizefb`, `done`, `release`): remain project-specific due to deep workflow divergence and project-specific script paths

## Template Variables

| Variable | Description | Example (OCC) | Example (TKA) |
|----------|-------------|---------------|---------------|
| `projectName` | Display name for agent descriptions | Orion Cloud Creations | TKA Scribe |
| `projectDescription` | One-line project context | E-commerce site for handmade tie-dye clothing | Choreography platform for flow artists |
| `srcRoot` | Root source directory | src/lib | src/lib |
| `srcFeatures` | Feature modules directory | src/lib | src/lib/features |
| `srcShared` | Shared code directory | src/lib | src/lib/shared |

Templates use `{{variableName}}` syntax. Simple string replacement, no conditionals.

## Project Config

Each project has `.claude/skills.config.json`:

```json
{
  "projectName": "Orion Cloud Creations",
  "projectDescription": "E-commerce site for handmade tie-dye clothing",
  "srcRoot": "src/lib",
  "srcFeatures": "src/lib",
  "srcShared": "src/lib",
  "skills": ["commit", "changelog", "check", "ai-bust", "monolith", "deadcode", "audit"]
}
```

## Sync Behavior

`npx @austencloud/claude-skills sync`:

1. Read `.claude/skills.config.json` from current working directory
2. For each skill in the `skills` array:
   - Read template from package `templates/skills/{name}/SKILL.md`
   - Replace `{{variable}}` placeholders with config values
   - Write to `.claude/skills/{name}/SKILL.md`
3. For each agent associated with included skills:
   - Audit → writes `audit-evaluator` and `audit-fixer` to `.claude/agents/`
4. Skip skills not in the array
5. Never touch files not managed by sync

Rendered files include a header comment:
```
<!-- managed by @austencloud/claude-skills — do not edit manually, run: npx @austencloud/claude-skills sync -->
```

`npx @austencloud/claude-skills clean` removes all files with that marker.

## Audit Scripts in @austencloud/code-quality

The audit scripts move from TKA-local into the existing `@austencloud/code-quality` package:

| Current (TKA local) | New (shared) |
|---|---|
| `node scripts/audit-tracker.cjs --auto-claim` | `npx -p @austencloud/code-quality ac-audit --auto-claim` |
| `node scripts/collect-evidence.cjs "target"` | `npx -p @austencloud/code-quality ac-evidence "target"` |

Scripts are modified to:
- Read `srcFeatures` and `srcShared` from `.claude/skills.config.json` if present
- Fall back to `src/lib` if no config exists
- Accept `--src-features` and `--src-shared` CLI overrides

## Migration Plan

1. Create `@austencloud/claude-skills` package in monorepo
2. Port audit scripts into `@austencloud/code-quality`
3. Add `.claude/skills.config.json` to OCC, run sync
4. Add `.claude/skills.config.json` to TKA and Cirque, run sync
5. Remove old duplicated skill files from TKA and Cirque (project-specific skills stay)
6. Verify all three projects have working skills

## Design Decisions

- **Pull model (B) over push (A):** New projects don't require monorepo changes. Drop a config, run sync.
- **Simple string replacement over EJS/JS templates:** Templates stay readable as normal markdown. Portable to whatever Anthropic ships next.
- **Skills array as opt-in list:** Projects declare what they want. No "skip" list to maintain.
- **Audit in code-quality, not a separate package:** Matches existing `ac-monolith` and `ac-deadcode` pattern. One tooling package.
