---
description: "Teaches agents how to discover, triage, review, and act on Dependabot version-update pull requests and security vulnerability alerts for the caffeine-calculator codebase"
applyTo: "**/.github/dependabot.yml, **/package.json"
---

# Dependabot Resolution Instructions

Guidance for discovering, triaging, reviewing, and acting on Dependabot pull requests and vulnerability alerts. Agents use these instructions when a Dependabot PR is detected, when a user asks about dependency vulnerabilities, or when performing proactive dependency hygiene.

## Discovery

### Finding Open Dependabot PRs

Use the **form-github-search-query** skill with natural language queries to discover open Dependabot PRs:

```
repo:seanm03/caffeine-calculator author:app/dependabot is:pr is:open
```

Common query patterns:

| Natural language | Resulting query |
|---|---|
| "Show open Dependabot PRs" | `author:app/dependabot is:pr is:open` |
| "Show Dependabot security PRs" | `author:app/dependabot is:pr is:open label:security` |
| "Show merged Dependabot PRs from last month" | `author:app/dependabot is:pr is:merged` |

Use the **show-github-search-result** skill to present findings in a readable table.

### Finding Vulnerability Alerts

Vulnerability alerts live in GitHub's Security tab at:

```
https://github.com/seanm03/caffeine-calculator/security/dependabot
```

For programmatic access, use `npm audit` locally as a proxy:

```bash
npm audit --json
```

The `npm audit` output mirrors most Dependabot alerts for the npm ecosystem and provides structured JSON with:

* Advisory ID and CVE
* Severity (`critical`, `high`, `moderate`, `low`)
* Affected package and version range
* Patched version (if available)
* Whether a fix requires semver-major changes

When Dependabot alerts exist without corresponding PRs (rare for npm), create a fix PR using the **create-pull-request** skill.

## Triage

### Severity Classification

Classify each alert or PR by severity. Match the GitHub advisory severity levels:

| Severity | Action | Timeline |
|---|---|---|
| Critical | Create fix immediately or merge PR if exists | Same session |
| High | Merge existing PR or create fix | Within 24 hours |
| Moderate | Schedule for next work session | This week |
| Low | Defer or batch with other low-severity updates | This sprint |

If a Dependabot PR already exists for an alert, prefer merging it over creating a new fix PR. Dependabot PRs include release notes and changelog links in the PR body.

### Version-Update PRs (Non-Security)

Dependabot also opens PRs for routine version bumps. These carry the `dependencies` label (plus `npm` or `github-actions`). Triage these by:

1. Checking the changelog or release notes linked in the PR body
2. Assessing whether the update includes breaking changes (major version bumps)
3. Running the project's test suite against the updated dependency

Major version bumps for React (react, react-dom, @types/react, @types/react-dom) are explicitly ignored in the Dependabot config. Other major bumps will appear and require manual review.

## Review Workflow

### Step 1: Check Out and Inspect

When a Dependabot PR is the active PR, use the **github-pull-request_currentActivePullRequest** tool to get full details including changed files, diff, and review comments.

For summarization, use the **summarize-github-issue-pr-notification** skill to produce a concise overview of the PR changes and any linked issues or references.

### Step 2: Validate Locally

Run these validation commands against the Dependabot branch:

```bash
# Install updated dependencies
npm ci

# Type checking
npx tsc --noEmit

# Linting (zero-warnings policy)
npm run lint

# Full test suite (338 tests as of 2026-06-10)
npm test

# Build verification
npm run build
```

The project's quality gates require:

* TypeScript: 0 errors (strict mode)
* ESLint: 0 errors, 0 warnings
* Tests: all 338+ tests passing
* Build: clean Vite production build

### Step 3: Assess Changelog Impact

Review the changelog or release notes for each updated dependency. Focus on:

* Breaking changes (even minor bumps can include them in some ecosystems)
* New deprecations that might affect this codebase
* Security fixes included in the update
* Performance improvements relevant to this project

### Step 4: Run npm Audit (Security PRs Only)

For security-related PRs and vulnerability investigations, run:

```bash
npm audit
```

Confirm the audit passes after the dependency update. If vulnerabilities remain after merging, note them for follow-up.

## Action Pathways

### Pathway A: Merge Dependabot PR Directly

When all validation passes and the changelog shows no concerns:

1. Approve the PR
2. Merge using squash or rebase (prefer squash for dependency bumps to keep history clean)
3. Confirm CI passes on the target branch

If the user has not explicitly requested PR merging, present findings and ask for confirmation before merging.

### Pathway B: Create a Fix PR (No Existing Dependabot PR)

When a vulnerability exists but Dependabot hasn't opened a PR:

1. Create a branch: `fix/dependabot-{package-name}-{cve-id}`
2. Update the affected dependency in `package.json`
3. Run `npm install` to update `package-lock.json`
4. Run full validation (type-check, lint, test, build)
5. Use the **create-pull-request** skill to open a PR with:
   * Title following conventional commit format: `fix(deps): resolve {CVE-ID} in {package-name}`
   * Body referencing the advisory, affected versions, and fix version
   * `dependencies` and `security` labels

### Pathway C: Manual Intervention Required

Some vulnerabilities require code changes beyond a version bump:

1. Use the **suggest-fix-issue** skill to propose remediation approaches
2. Document the vulnerability in a tracking file under `.copilot-tracking/dependabot/`
3. Create an issue for manual review if the fix exceeds safe automation boundaries

Signs that manual intervention is needed:

* No patched version exists (advisory without fix)
* Fix requires semver-major changes blocked by the Dependabot ignore list
* Vulnerability is in a transitive dependency without a direct upgrade path
* Fix introduces breaking API changes that require code modifications

### Pathway D: GitHub Actions Updates

Dependabot also updates GitHub Actions in CI workflows. For these:

1. Review the action's changelog for breaking input changes
2. Verify CI configuration is still valid by checking workflow syntax
3. Merge if the update is a patch or minor bump with no breaking changes

## Project-Specific Dependabot Configuration

The project's Dependabot configuration at `.github/dependabot.yml`:

| Setting | npm | GitHub Actions |
|---|---|---|
| Schedule | Monthly, Monday 9am PT | Monthly, Monday 9am PT |
| PR limit | 10 open | (default) |
| Labels | `dependencies`, `npm` | `dependencies`, `github-actions` |
| Commit prefix | `chore(deps)` / `chore(deps-dev)` | `chore(deps-ci)` |
| Version strategy | `increase` | (default) |
| Dependency scope | Direct only | All |
| Ignored bumps | React major versions | None |

### Ignored Updates

These major version bumps are excluded from automatic PRs and require manual review:

* `react` — version-update:semver-major
* `react-dom` — version-update:semver-major
* `@types/react` — version-update:semver-major
* `@types/react-dom` — version-update:semver-major

## Integration with Existing Skills

| Skill | When to Use |
|---|---|
| form-github-search-query | Discover open Dependabot PRs |
| show-github-search-result | Present Dependabot PR search results |
| summarize-github-issue-pr-notification | Summarize a Dependabot PR's content and changes |
| suggest-fix-issue | Propose remediation for vulnerabilities without an existing fix |
| create-pull-request | Create a fix PR when Dependabot hasn't opened one |
| address-pr-comments | Respond to review comments on Dependabot PRs |
| pr-reference | Generate structured diffs for Dependabot PR review |

## Session Memory

After completing Dependabot-related work, persist findings to session memory following the rpi-memory conventions. Record:

* PRs reviewed, merged, or deferred
* Vulnerabilities triaged and their resolution status
* Any deviations from the standard pathways and why
