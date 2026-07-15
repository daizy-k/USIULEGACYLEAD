# USIU LegacyLead

A hand-me-down leadership platform for USIU Africa students — pass down knowledge, resources, and mentorship from graduating leaders to incoming ones.

## Tech Stack

- **Frontend:** React (Vite)
- **Backend / Data:** Firebase (Auth, Firestore, Storage)
- **Hosting / CI-CD:** Firebase Hosting + GitHub Actions

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd legacylead
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the Firebase config values from Firebase Console → Project Settings. **Never commit `.env.local`.**

```bash
cp .env.example .env.local
```

### 3. Run locally

```bash
npm run dev
```

App runs at `http://localhost:5173`.

## Project Structure

```
src/
├── assets/       # images, icons, fonts
├── components/   # reusable UI components
├── pages/        # route-level views
├── context/       # React context (e.g. AuthContext)
├── firebase/      # firebase config + helper functions
├── App.jsx
└── main.jsx
```

## Branching & Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) before pushing any code. Short version: **never commit directly to `main` or `dev`** — always work on a `feature/*` branch and open a PR.

## Team

| Name | Role |
|------|------|
|      |      |
|      |      |

## Status

🚧 In active development for [Collaborative Software Development] coursework.