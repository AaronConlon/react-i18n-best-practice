# React i18n Best Practice

[English](README.md) | 简体中文

![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TanStack Router](https://img.shields.io/badge/TanStack%20Router-File--based%20routes-FF6D00?logo=reactrouter&logoColor=white)
![Rsbuild](https://img.shields.io/badge/Rsbuild-1.x-0D73F6)
![i18next](https://img.shields.io/badge/i18next-Dynamic%20loading-26A69A)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)
![Localization Ready](https://img.shields.io/badge/i18n-Production%20Ready-brightgreen)

一个展示国际化最佳实践的 React 19 示例项目：支持按命名空间动态加载文案、自动校验多语言一致性，并通过 Rsbuild 与 TanStack Router 提供现代化的文件式路由体验。

## 目录

- [功能亮点](#功能亮点)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [可用脚本](#可用脚本)
- [国际化工作流](#国际化工作流)
- [环境变量](#环境变量)
- [质量保障](#质量保障)
- [技术栈](#技术栈)
- [参与贡献](#参与贡献)
- [许可证](#许可证)

## 功能亮点

- **面向生产环境的国际化方案**：基于 `i18next`，整合 HTTP 后端、链式语言检测与 Suspense 兼容的加载流程。
- **自动化的多语言校验**：脚本会确保其他语言与英文基准保持键名一致，提交前自动阻止缺失或多余键值。
- **文件式路由体验**：使用 TanStack Router（`@tanstack/react-router`）生成强类型路由树。
- **现代构建工具链**：结合 Rsbuild 与 React，自动启用代码拆分。
- **多语言界面体验**：内置英文、法文与简体中文，支持运行时自由切换。

## 项目结构

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

## 快速开始

### 前置要求
- Node.js ≥ 18
- Yarn Classic（`yarn --version` 返回 1.x）

### 安装依赖

```bash
yarn install
```

### 启动开发服务器

```bash
yarn dev
```

默认会在 [http://localhost:3000](http://localhost:3000) 提供预览。

### 生产构建

```bash
yarn build
```

### 本地预览构建结果

```bash
yarn preview
```

## 可用脚本

| 命令             | 说明                                       |
| ---------------- | ------------------------------------------ |
| `yarn dev`       | 启动 Rsbuild 开发服务器并启用热更替。     |
| `yarn build`     | 生成优化过的生产构建产物。                 |
| `yarn preview`   | 本地预览生产构建结果，用于冒烟测试。       |
| `yarn generate`  | 在路由有变动时重新生成 TanStack Router 类型。 |
| `yarn check:i18n`| 校验多语言 JSON 文件的一致性。             |

## 国际化工作流

1. **在 `public/locales/en/*.json` 定义基础文案**。必要时可通过嵌套对象组织领域。
2. **将译文同步到其他语言文件夹**（`fr`、`zh` 等）。校验脚本会提示缺失或多余的键。
3. **在组件中使用 `useTranslation()` 访问文案**，结合命名空间（如 `useTranslation("user")`）拆分领域。
4. **通过 `src/routes/__root.tsx` 的语言下拉框进行运行时切换**。浏览器语言检测会保留用户选择，并在缺失时回退到英语。
5. **利用 `src/i18n.ts` 的 HTTP backend 懒加载命名空间**，并通过 `PUBLIC_I18N_VERSION` 实现缓存失效控制。

## 环境变量

`src/i18n.ts` 依赖以下两个公开环境变量：

- `PUBLIC_I18N_PATH`：多语言资源的基础路径（未配置时默认为 `/`）。
- `PUBLIC_I18N_VERSION`：附加在请求上的 `?v=` 版本号，用于缓存控制。

可在 `.env` 文件或部署环境中按需设置。

## 质量保障

- Husky 的 pre-commit 钩子会执行 `yarn check:i18n`，确保多语言文件在提交前保持同步。
- TanStack Router 生成的类型保证导航逻辑的类型安全。

## 技术栈

- React 19 + ReactDOM 19
- TanStack Router 自动生成路由
- i18next（HTTP backend 与浏览器语言检测）
- Rsbuild + Rspack 构建配置
- TypeScript 5.x

## 参与贡献

1. Fork 并克隆仓库。
2. 运行 `yarn install` 安装依赖。
3. 新建特性分支并提交清晰的 commit 信息。
4. 提交前确保 `yarn check:i18n` 通过。
5. 提交 Pull Request，描述修改内容。

## 许可证

MIT License。详见 `LICENSE` 文件。
