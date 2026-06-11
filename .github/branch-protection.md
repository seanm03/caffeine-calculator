---
title: "Branch Protection Rules for `main`"
description: "Recommended GitHub branch protection settings for the caffeine-calculator main branch with step-by-step enablement instructions"
ms.date: 2026-06-11
ms.topic: reference
---

## Recommended Branch Protection Rules

These settings protect the `main` branch from unreviewed or untested changes. Apply them at **Repository Settings > Branches > Add branch protection rule** with `main` as the branch name pattern.

### Required Settings

| Setting | Value | Rationale |
|---------|-------|-----------|
| **Require a pull request before merging** | ✅ Enabled | Prevents direct pushes to `main`; all changes flow through PR review |
| **Required approvals** | 1 | At least one reviewer must approve before merge |
| **Dismiss stale pull request approvals when new commits are pushed** | ✅ Enabled | New commits invalidate previous approvals |
| **Require status checks to pass before merging** | ✅ Enabled | Build, lint, and tests must pass before merge |
| **Require branches to be up to date before merging** | ✅ Enabled | Prevents merge skew from stale branches |
| **Status checks** | `build (or tsc + vite build)`, `lint`, `test` | The project's CI pipeline must be green |

### Recommended Additional Settings

| Setting | Value | Rationale |
|---------|-------|-----------|
| **Require conversation resolution before merging** | ✅ Enabled | All review threads must be resolved |
| **Require signed commits** | Optional | Adds commit authenticity verification |
| **Require linear history** | Optional | Keeps `main` history clean (squash-merge compatible) |
| **Do not allow bypassing the above settings** | ✅ Enabled | Admins must also follow the same rules |
| **Restrict who can push to matching branches** | ✅ Enabled | Only designated maintainers can merge |

### What NOT to Enable

| Setting | Reason |
|---------|--------|
| **Require deployments to succeed** | This project deploys via GitHub Pages (`gh-pages` branch), not from `main` directly |
| **Lock branch** | Too restrictive — legitimate PR merges would be blocked |

## Step-by-Step Enablement

1. Navigate to <https://github.com/seanm03/caffeine-calculator/settings/branches>
2. Click **Add branch protection rule**
3. In "Branch name pattern," enter: `main`
4. Check **Require a pull request before merging**
   * Set "Required approvals" to `1`
   * Check **Dismiss stale pull request approvals when new commits are pushed**
   * Check **Require review from Code Owners** (if a `CODEOWNERS` file exists)
5. Check **Require status checks to pass before merging**
   * Check **Require branches to be up to date before merging**
   * Search and select CI checks (once CI workflow exists):
     * Type-check (`npx tsc --noEmit`)
     * Lint (`npx eslint src/ --max-warnings 0`)
     * Test (`npx vitest run`)
6. Check **Require conversation resolution before merging**
7. Check **Do not allow bypassing the above settings**
8. Click **Create** or **Save changes**

## Current CI Status

This project does not yet have a CI workflow that runs on PRs. The following checks should be configured before requiring status checks:

* TypeScript type-checking: `npx tsc --noEmit`
* ESLint: `npx eslint src/ --max-warnings 0`
* Vitest: `npx vitest run`

A starter CI workflow (`.github/workflows/ci.yml`) should be created to run these commands on every PR to `main`.

### Recommended CI Workflow

```yaml
name: CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint src/ --max-warnings 0
      - run: npx vitest run
```

> [!TIP]
> After creating this CI workflow and confirming it runs successfully, enable the corresponding status checks in branch protection so they are required for PR merges.
