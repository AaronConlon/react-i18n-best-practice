# React i18n Best Practice

English | [简体中文](README-zh.md)

![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TanStack Router](https://img.shields.io/badge/TanStack%20Router-File--based%20routes-FF6D00?logo=reactrouter&logoColor=white)
![Rsbuild](https://img.shields.io/badge/Rsbuild-1.x-0D73F6)
![i18next](https://img.shields.io/badge/i18next-Dynamic%20loading-26A69A)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)
![Localization Ready](https://img.shields.io/badge/i18n-Production%20Ready-brightgreen)

A sample React 19 app demonstrating scalable internationalization best practices with dynamically loaded namespaces, automated translation consistency checks, and TanStack Router’s file-based routing powered by Rsbuild.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Internationalization Workflow](#internationalization-workflow)
- [Environment Variables](#environment-variables)
- [Quality Gates](#quality-gates)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Production-ready internationalization** using `i18next`, HTTP backends, chained language detection, and Suspense-friendly loading.
- **Automatic locale validation** via a script that enforces parity with the English source of truth before every commit.
- **File-based routing** with TanStack Router (`@tanstack/react-router`) and generated route trees for strong typing.
- **Modern build toolchain** using Rsbuild with React and auto code-splitting.
- **Multi-language UI** including English, French, and Simplified Chinese, with runtime language switching.

## Project Structure

```text
.
├── public/
│   └── locales/
│       ├── en/
│       ├── fr/
│       └── zh/
├── scripts/
│   └── check-i18n-consistency.js
├── src/
│   ├── App.tsx
│   ├── i18n.ts
│   ├── index.tsx
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── about.tsx
│   │   ├── index.tsx
│   │   └── test.tsx
│   └── routeTree.gen.ts
├── rsbuild.config.ts
└── package.json
```

## Getting Started

### Prerequisites
- Node.js ≥ 18
- Yarn Classic (`yarn --version` should report 1.x)

### Install dependencies

```bash
yarn install
```

### Start the development server

```bash
yarn dev
```

The app runs at [http://localhost:3000](http://localhost:3000) by default.

### Build for production

```bash
yarn build
```

### Preview the production build

```bash
yarn preview
```

## Available Scripts

| Command             | Description                                                   |
| ------------------- | ------------------------------------------------------------- |
| `yarn dev`          | Start Rsbuild dev server with hot module replacement.         |
| `yarn build`        | Create an optimized production build.                         |
| `yarn preview`      | Serve the build output locally for smoke testing.             |
| `yarn generate`     | Regenerate the TanStack Router route tree when routes change. |
| `yarn check:i18n`   | Verify locale files stay consistent across languages.         |

## Internationalization Workflow

1. **Create base keys** in `public/locales/en/*.json`. Use nested objects to group related copy when needed.
2. **Mirror translations** in each additional language folder (`fr`, `zh`, …). The consistency script will flag missing or extra keys.
3. **Access translations** with `useTranslation()` in components. Use namespace-qualified hooks (e.g., `useTranslation("user")`) to split copy by domain.
4. **Switch languages at runtime** via the language selector in `src/routes/__root.tsx`. The detector persists language choice and falls back to English.
5. **Lazy-load namespaces** automatically through the HTTP backend defined in `src/i18n.ts`, which respects cache-busting query params.

## Environment Variables

`src/i18n.ts` relies on two public environment variables:

- `PUBLIC_I18N_PATH`: Base path for locale files (defaults to `/` when unset).
- `PUBLIC_I18N_VERSION`: Version string appended as a `?v=` query param for cache busting.

Define them in `.env` or your deployment environment as needed.

## Quality Gates

- Husky’s pre-commit hook runs `yarn check:i18n`. Commits fail if localized JSON files fall out of sync.
- Type generation from TanStack Router ensures navigational changes remain type-safe.

## Tech Stack

- React 19 + ReactDOM 19
- TanStack Router with automatic route generation
- i18next with HTTP backend and browser language detection
- Rsbuild + Rspack bundler configuration
- TypeScript 5.x

## Contributing

1. Fork and clone the repository.
2. Install dependencies with `yarn install`.
3. Create a feature branch and commit with meaningful messages.
4. Ensure `yarn check:i18n` passes before pushing.
5. Open a pull request describing your changes.

## License

MIT License. See `LICENSE` for full terms.
