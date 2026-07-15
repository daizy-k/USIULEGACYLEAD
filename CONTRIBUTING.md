# Contributing & Branching Guide

Please read this before pushing anything. It keeps us from stepping on each other's work.

## Branch Structure

```
main        → always deployable, demo-ready
dev         → integration branch, where features come together
feature/*   → one branch per feature/task, branched off dev
```

**Never commit directly to `main` or `dev`.** All work happens on a `feature/*` branch and gets merged via Pull Request.

## Naming Feature Branches

Use the format `feature/short-description`:

```
feature/login-page
feature/dashboard-ui
feature/firestore-schema
feature/navbar
```

Avoid vague branches like `frontend` or `updates` — if it covers more than one thing, split it.

## Daily Workflow

```bash
# 1. Start from an up-to-date dev
git checkout dev
git pull origin dev

# 2. Create your feature branch
git checkout -b feature/your-task-name

# 3. Work, commit in small chunks
git add .
git commit -m "feat: add login form validation"

# 4. Push your branch
git push -u origin feature/your-task-name

# 5. Open a Pull Request into dev on GitHub
```

## Pull Request Rules

- PRs merge into `dev`, never `main`.
- At least **one other teammate reviews** before merging — even a quick skim.
- Keep PRs small and focused on one feature/task. Easier to review, easier to catch conflicts early.
- Delete your feature branch after it's merged.

## Commit Message Convention

```
feat: add new feature
fix: bug fix
chore: setup/config/non-code changes
docs: documentation changes
style: formatting only, no logic change
```

## Merging to Main

Only merge `dev` → `main` at agreed milestones (e.g. before a demo/submission), and only after `dev` has been tested and everyone's features are integrated.

## Before You Start Any New Task

```bash
git checkout dev
git pull origin dev
```

Do this **every time** — pulling stale `dev` into a new feature branch is the #1 cause of painful merge conflicts.