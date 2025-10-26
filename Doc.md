# React i18n 浅解



今天，让我来分享一下自己对于 React i18n 的理解，并使用核心 lib: `i18next`和`react-i18next`从零开始配置解决方案。

> `react-i18next` 版本为：`16.1.5`，因此相关文档需要看 LeGACY v9 的部分：https://react.i18next.com/legacy-v9/step-by-step-guide

前者是一个与框架无关的国际化库，无论 nodejs 和浏览器端都可以在工程化中使用。后者是 React 的适配层，且是基于`i18next`的绑定层，有了它我们就可以在`React`中轻松添加 i18n 支持。

项目仓库：[AaronConlon/react-i18n-best-practice](https://github.com/AaronConlon/react-i18n-best-practice)

## 目标

我的 i18n 方案实现了以下若干需求：

- 常规多语言切换

- 语言选择持久化

- 浏览器语言检测

- 大型项目：resource 拆分和命名空间管理

- TypeScript 项目下，翻译函数支持完善的自动补全

- 翻译文件懒加载，仅在需要的地方加载最小化翻译文件，并且让 i18next 支持 Suspense

- 翻译文件一致性检测脚本

## 行动

### 准备工作

1. 使用 rsbuild 的命令，初始化一个 react 19 项目，选择支持 TypeScript 即可
2. 安装 i18n libs
   1. react-i18next
   2. i18next
3. 安装 @tanstack/react-router 和 @tanstack/router-plugin，并且根据文档添加 rsbuild 配置来启用 react-router
4. 根据 <https://github.com/TanStack/router/tree/main/examples/react/quickstart-rspack-file-based> 这个例子，配置好可运行的环境

### 常规多语言及切换

先看看项目目录结构：

```bash
.
├── node_modules
├── package.json
├── README.md
├── rsbuild.config.ts
├── src
│   ├── App.tsx
│   ├── env.d.ts
│   ├── i18n.ts
│   ├── index.tsx
│   ├── routes
│   │   ├── __root.tsx
│   │   ├── about.tsx
│   │   └── index.tsx
│   ├── routeTree.gen.ts
│   ├── styles.css
│   └── utils
├── tsconfig.json
└── yarn.lock
```

首先创建`src/i18n.ts`初始化文件：

```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  // 语言
  en: {
    // 默认命名空间
    translation: {
      "Welcome to React": "Welcome to React and react-i18next",
    },
  },
  fr: {
    translation: {
      "Welcome to React": "Bienvenue à React et react-i18next",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  // 默认语言
  lng: "en",
  // 备用语言
  fallbackLng: "en",
  // 插值方式
  interpolation: {
    // 不转义 html 标签，避免 XSS 攻击
    escapeValue: false,
  },
});

export default i18n;
```

并且在`src/index.tsx`中引入：

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// 导入，初始化 i18n
import "./i18n";

const rootEl = document.getElementById("root");

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
```

然后看看 `routes`下的几个路由文件：

### __root.tsx

```typescript
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

const RootLayout = () => {
  const { i18n } = useTranslation();

  return (
    <>
      <div className="header">
        <Link to="/" className="header-link">
          Home
        </Link>{" "}
        <Link to="/about" className="header-link">
          About
        </Link>
        {/* language selector */}
        <select
          className="language-selector"
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="fr">French</option>
        </select>
      </div>
      <Outlet />
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
```

通过`useTranslation` hook 可以得到 `i18n`实例，这个实例具有当前语言属性和修改语言的方法。

接下来看`src/routes/index.tsx`的内容：

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  return <div className="content">{t("Welcome to React")}</div>;
}
```

还是核心 hook：`useTranslation`，通过 `t`函数传入翻译资源的字段来读取翻译的结果。

> 如上所示是 react-i18next 最常规的使用方法，还有几种写法和在 react 组件外获取翻译内容，有兴趣可以去看文档

现在，在`/`路由下点击语言切换即可看到效果：

**英语**：

![image-20251023043834284](https://de4965e.webp.li/blog-images/2025/10/6c31ca1794255fd73f2c2c3ba43513d5.png)

**法语**
![image-20251023043932544](https://de4965e.webp.li/blog-images/2025/10/744847498c5856473bef5b7cbdc11946.png)

### 语言持久化和语言检测

如果仅需实现持久化，则简单在`i18n.ts`这里直接将硬编码的默认语言改为从 localStorage 或 cookie 里读取即可，如此一来既可以让后端接口返回自动修改用户语言，也可以在修改语言的时候将选择的语言保存到本地。

我个人更喜欢另一种方案：`i18next-browser-languagedetector`插件，根据用户浏览器的语言来设置默认语言！

首先，安装好插件：

```bash
yarn add i18next-browser-languagedetector 
```

然后再修改`i18n.ts`初始化逻辑（忽略部分代码）：

```typescript
import detector from "i18next-browser-languagedetector";

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources,
    // 备用语言
    fallbackLng: "en",
    // 插值方式
    interpolation: {
      // 不转义 html 标签，避免 XSS 攻击
      escapeValue: false,
    },
  });

```

> 测试的浏览器语言是中文，因此在代码里加上中文相关的 resource 翻译和 select option 即可。

此时，浏览器的 localStorage 里会自动加上`i18nextLng` ，其值为`zh`。



**i18next-browser-languagedetector** 选择语言的默认优先级如下：

- cookie
- localStorage
- navigator
- querystring (append `?lng=LANGUAGE` to URL)
- htmlTag
- path
- subdomain

因此，笔者建议将语言选项的值保存到 cookie。

> 产品应该减少用户的操作，并且提供一种“顺畅”的用户体验。





### 大型项目：resource 拆分和命名空间管理

企业级项目代码量较为庞大，将 resource 翻译的代码写在 `i18n.ts`里实在是太过拥挤，因此我们必须将这些翻译资源拆分到不同的模块下，通过 json 的格式保存，再统一导入。

看代码：

```typescript
import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import cn from "./locales/cn.json";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
  cn: {
    translation: cn,
  },
};

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources,
    // 备用语言
    fallbackLng: "en",
    // 插值方式
    interpolation: {
      // 不转义 html 标签，避免 XSS 攻击
      escapeValue: false,
    },
  });

export default i18n;
```

首先，我们将翻译资源统一放在 `src/locales`下，按语言命名通过 json 导入，然后赋值给`translation`（默认命名空间）。

当项目进一步扩大之后，翻译 json 文件将会变得越来越大，无论是查找还是修改都非常麻烦（在一个超大 json 文件中增删改查）。这时候，我们可以将翻译文件分为若干模块：

- Common (通用)
- User（用户页面）
- Dashboard（看板页面）

这时候我们可以在`locales`下创建多语言目录，并且在目录内创建若干个命名空间对应的`json`文件：

```bash
.
├── en
│   ├── common.json
│   ├── dashboard.json
│   └── user.json
├── fr
│   ├── common.json
│   ├── dashboard.json
│   └── user.json
└── zh
    ├── common.json
    ├── dashboard.json
    └── user.json
```

举例 `zh/common.json`：

```json
{
  "welcome": "欢迎",
  "loading": "加载中...",
  "error": "错误",
  "success": "成功"
}
```

在组件中通过命名空间使用：

```jsx
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(["common", "user", "dashboard"]);
  return (
    <div className="content">
      {/* common namespace */}
      <div className="common">{t("common:welcome")}</div>
      <div className="common">{t("common:loading")}</div>
      <br />
      {/* user namespace */}
      <div className="user">{t("user:profile")}</div>
      {/* dashboard namespace */}
      <div className="dashboard">{t("dashboard:overview")}</div>
    </div>
  );
}
```

这里的钩子函数参数非常关键：`useTranslation(["common", "user", "dashboard"])`，不同的参数会设置不同的默认命名空间，当设置了默认命名空间的时候，就可以在`t()`函数里缺省命名空间前缀。

例如：

```jsx
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(["common"]);
  return (
    <div className="content">
      {/* common namespace */}
      <div className="common">{t("common:welcome")}</div>
      <div className="common">{t("loading")}</div>
      <br />
      {/* user namespace */}
      <div className="user">{t("user:profile")}</div>
      {/* dashboard namespace */}
      <div className="dashboard">{t("dashboard:overview")}</div>
    </div>
  );
}
```

直接写`t("loading")`是可以得到翻译结果的，因为指定了`common`命名空间。此时如果你写`t("profile")`，那么是得不到翻译结果的。

如果不传参给`useTranslation`，那么就会从`i18n.ts`里的默认命名空间去寻找翻译结果。

函数`t()`根据传入的 key 去获取翻译自有一套规则，并且可能会根据版本变化而更新。

与其花时间去折腾其规则，不如创建多个指定命名空间且名字不同的`t`函数，亦或者统一在`t()`函数传参的时候写明命名空间。

```jsx
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { t: tUser } = useTranslation("user");
  const { t: tDashboard } = useTranslation("dashboard");
  return (
    <div className="content">
      {/* common namespace */}
      <div className="common">{t("welcome")}</div>
      <div className="common">{t("loading")}</div>
      <br />
      {/* user namespace */}
      <div className="user">{tUser("profile")}</div>
      {/* dashboard namespace */}
      <div className="dashboard">{tDashboard("overview")}</div>
    </div>
  );
}
```

### TypeScript 编写体验优化

如果你也使用 TypeScript 编写 React 代码，那么我想你会喜欢在使用`t()`函数的时候填写`key`获得编辑器的自动提示支持。

实现方案如下：

- 微调 `i18n.ts`文件
- 创建`src/i18next.d.ts`类型声明文件

首先来看新的`i18n.ts`文件：

```typescript
import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import zhCommon from "./locales/zh/common.json";
import zhDashboard from "./locales/zh/dashboard.json";
import zhUser from "./locales/zh/user.json";

import enCommon from "./locales/en/common.json";
import enDashboard from "./locales/en/dashboard.json";
import enUser from "./locales/en/user.json";

import frCommon from "./locales/fr/common.json";
import frDashboard from "./locales/fr/dashboard.json";
import frUser from "./locales/fr/user.json";

export const defaultNS = "common";

export const resources = {
  en: {
    common: enCommon,
    user: enUser,
    dashboard: enDashboard,
  },
  fr: {
    common: frCommon,
    user: frUser,
    dashboard: frDashboard,
  },
  zh: {
    common: zhCommon,
    user: zhUser,
    dashboard: zhDashboard,
  },
} as const;

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources,
    ns: ["common", "user", "dashboard"],
    defaultNS,
    // 备用语言
    fallbackLng: "en",
    // 插值方式
    interpolation: {
      // 不转义 html 标签，避免 XSS 攻击
      escapeValue: false,
    },
  });

export default i18n;
```

变化在于：

- 将默认命名空间导出
- 将 resource 导出，并且在末尾使用`as const`来让 TypeScript 断言，告诉编译器这个对象缩窄后的类型。

再看类型声明文件：`i18next.d.ts`:

```typescript
import { defaultNS, resources } from "./i18n";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: {
      common: (typeof resources)["en"]["common"];
      user: (typeof resources)["en"]["user"];
      dashboard: (typeof resources)["en"]["dashboard"];
    };
  }
}
```

给 module `i18next`的 `CustomTypeOptions`接口声明默认命名空间和 resource 的类型，如此一来就可以在`t()`这里自动补全`key`了。

### JSON 懒加载

直接通过 `import`语句导入`json`文件，在打包的时候会把全部翻译资源打包到代码中去，显著增加`bundle`尺寸。

在开始之前，明确自己的场景和需求，回答以下几个问题：

- 能否需要 CDN
- 是否限制 Bundle 体积
- 是否运行于不稳定的网络
- 是否离线运行
- 是否需要严格确保加载资源的可用性

得出答案之后，我们逐一分析以下场景选择的技术栈和实现方案：

#### 国内企业中后台（React SPA）

通常企业后台对 SEO、首屏加载速度、弱网和离线、强可用都要求不高，选择`i18next-resources-to-backend`插件足以。

```typescript
import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

i18n
  .use(detector)
  .use(
    resourcesToBackend(
      (lang: string, ns: string) => import(`./locales/${lang}/${ns}.json`)
    )
  )
  .use(initReactI18next)
  .init({
    ns: ["common"],
    defaultNS: "common",
    // 备用语言
    fallbackLng: "en",
    // 插值方式
    interpolation: {
      // 不转义 html 标签，避免 XSS 攻击
      escapeValue: false,
    },
  });

export default i18n;
```

所有初始化时设置的`ns`都会在首次加载直接请求对应的`chunk`文件，如上所示我的测试环境会立即请求：

```bash
http://localhost:3000/static/js/async/src_locales_en_common_json.js
```

回过头来看，我们的目标还有一个 React Suspense 特性需要支持。为什么要这个特性？在本地开发的时候资源加载极快，你可能一不小心没注意到翻译的结果会出现闪烁，究其原因在于 i18next-react 在初次渲染的时候还没有获取到翻译的资源，于是会立即渲染对应的 key 的字符串内容。

所以，我们应该在这个阶段提供特定的 UI 来防止闪烁，看看如下代码：

```jsx
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

const RootLayout = () => {
  const { i18n, t } = useTranslation("menu");

  return (
    <>
      <div className="header">
        <Link to="/" className="header-link">
          {t("home")}
        </Link>{" "}
        <Link to="/about" className="header-link">
          {t("about")}
        </Link>
        <Link to="/test" className="header-link">
          {t("test")}
        </Link>
        {/* language selector */}
        <select
          className="language-selector"
          value={i18n.language}
          onChange={async (e) => {
            const newLang = e.target.value;
            // save to cookie
            // document.cookie = `i18nextLng=${newLang}; path=/`;
            await i18n.changeLanguage(newLang);
          }}
        >
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="zh">中文</option>
        </select>
      </div>
      <Outlet />
    </>
  );
};

export const Route = createRootRoute({
  component: RootLayout,
  pendingComponent: () => (
    <div className="loading">Loading at root layout...</div>
  ),
});
```

在创建路由这里添加一个 Suspense fallback（pendingComponents），即可在渲染 RootLayout 组件的时候，让内部逻辑触发 Suspense 边界条件，从而渲染 loading 内容。



`rsbuild`会将这个 json 文件打包成一个独立的`js`文件，此外上述配置还加上了 react use suspense 支持：

```typescript
{
  react: {
    useSuspense: true,
  }
}
```

现在，初始化加载语言翻译资源会触发 Suspense fallback 了！当然，上述代码仅在初始化的时候会渲染 fallback，初始化完成后再次切换语言将会请求新的语言翻译 chunk，此时不会触发 Suspense fallback，针对这一点我们可以单独使用`useTransition`或者单独维护一个 loading 状态，在 `Outlet`组件下方渲染独立的 Loading Mask 组件（和 pendingComponent 共用）。



#### 出海应用 + 独立服务器部署（React SPA）

独立服务器意味着资源存放在服务器这里，出海应用的用户可能来自不同的国家和地区，这时候使用 CDN 存放 JSON 翻译资源可以加快初始化和更换语言的速度。

使用`i18next-resources-to-backend`依然可以做到这一点，不过我们需要将`import`语句修改为`fetch`远程 json 资源的逻辑。但是这一步细化一下也有一些问题需要处理，例如：缓存控制和版本处理、出错处理。

在这里我们需要考虑一个问题：翻译 JSON 文件是否需要在 Build 阶段构建成 js chunk，亦或是将翻译资源独立出来，存放在 OSS 上，利用 CDN 的能力提速，同时还可以灵活更新 OSS 文件，让应用不需要耗时构建整个应用。

有一个插件能很好地处理这个需求：`i18next-http-backend`，其核心是：让语言包成为“外部资源”，让国际化系统想加载数据一样加载翻译。

```typescript
import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n
  .use(detector)
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath:
        import.meta.env.PUBLIC_I18N_PATH + "locales/{{lng}}/{{ns}}.json",
      crossOrigin: true,
      queryStringParams: {
        v: import.meta.env.PUBLIC_I18N_VERSION,
      },
    },
    ns: ["common", "menu"],
    defaultNS: "common",
    // 备用语言
    fallbackLng: "en",
    // 插值方式
    interpolation: {
      // 不转义 html 标签，避免 XSS 攻击
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
```

其核心在于配置项：

```typescript
backend: {
  loadPath:
    import.meta.env.PUBLIC_I18N_PATH + "locales/{{lng}}/{{ns}}.json",
  crossOrigin: true,
  queryStringParams: {
    v: import.meta.env.PUBLIC_I18N_VERSION,
  },
}
```

> 现在，我们可以将 /locales 目录移动到 public 下

我们通过环境变量去设置翻译文件的来源，在开发模式下读取'/'（public）的翻译文件，在生产环境读取 CDN 地址的资源。

如果项目复杂，我们也可以通过 API 获取用户更多信息，在这里修改其翻译资源的来源和版本等配置。

在用户请求 CDN 资源的时候，指定 queryStringParams 中的对象，通过这个机制来控制缓存，CDN 服务器根据 URL 来区分是否返回缓存，当然浏览器也一样。

我们可以通过一个 API 后端服务来统一下发用户的资源版本号和 CDN 地址（如果有必要的话），这个后端 API 既可以是独立于不同项目的，也可以是这个项目下配合的后端服务。

如果想做灰度测试，或者通过某个用户来测试线上环境的翻译效果，则可以单独给这个用户增加版本，从而触发用户浏览器缓存失效，最终从用户浏览器，经过 CDN 服务器，最终回源到 OSS 去请求最新的文件。



#### 离线应用、桌面应用、内网应用

假设开发一个离线应用，亦或是可以读取到载体的文件系统的应用，我们可以将翻译资源通过主动下载的方式保存到用户的设备。

我们可以选择这个插件：`i18next-fs-backend`

```typescript
import i18n from 'i18next'
import FsBackend from 'i18next-fs-backend'
import { initReactI18next } from 'react-i18next'
import path from 'path'
import { fileURLToPath } from 'url'

// __dirname 兼容 ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 语言文件目录（绝对路径）
const localesPath = path.join(__dirname, './locales')

i18n
  .use(FsBackend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: path.join(localesPath, '{{lng}}/{{ns}}.json'),
    },
    lng: 'zh',                 // 默认语言
    fallbackLng: 'en',
    ns: ['common', 'dashboard'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,      // React 已自动防 XSS
    }
  })

export default i18n
```

离线应用的语言 JSON 都从 fs 直接读取，不依赖 HTTP 也不需要 CDN。

如果是内网应用，则可以提供一个服务上传翻译资源，再通过 fs 写入到指定的目录。

这些插件的写法非常相似，切换起来很容易。



#### XXX 产品

假设...

- 产品用户来自不同地区，网络情况复杂无比
- CDN 服务不稳定，加钱也没用
- 甲方要求高，千万不能出错
- 翻译内容频繁需要更新



那么，我建议使用这个方案：

```typescript
import i18n from 'i18next'
import Backend from 'i18next-chained-backend'
import LocalStorageBackend from 'i18next-localstorage-backend'
import HttpBackend from 'i18next-http-backend'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'

const CDN_PRIMARY = 'https://cdn1.yourcompany.com/locales'
const CDN_SECONDARY = 'https://cdn2.backupcdn.com/locales'
const LOCAL_VERSION = '2025.10.26' // 版本控制：可由 CI/CD 自动注入

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: 'zh',
    fallbackLng: 'en',
    ns: ['common', 'menu', 'dashboard'],
    defaultNS: 'common',
    backend: {
      // 1️⃣ 多层后端配置（顺序：缓存 → 主 CDN → 备 CDN → 本地 fallback）
      backends: [
        LocalStorageBackend,
        HttpBackend,
        HttpBackend,
        resourcesToBackend((lng, ns) => import(`../locales/${lng}/${ns}.json`)),
      ],
      backendOptions: [
        // --- LocalStorage 缓存层 ---
        {
          expirationTime: 7 * 24 * 3600 * 1000, // 缓存 7 天
          versions: {
            common: LOCAL_VERSION,
            menu: LOCAL_VERSION,
            dashboard: LOCAL_VERSION,
          },
        },
        // --- 主 CDN ---
        {
          loadPath: `${CDN_PRIMARY}/{{lng}}/{{ns}}.json`,
          crossDomain: true,
          queryStringParams: { v: LOCAL_VERSION },
        },
        // --- 备用 CDN ---
        {
          loadPath: `${CDN_SECONDARY}/{{lng}}/{{ns}}.json`,
          crossDomain: true,
          queryStringParams: { v: LOCAL_VERSION },
        },
        // --- 本地 fallback ---
        {}, // resourcesToBackend 不需要额外配置
      ],
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  })

export default i18n
```



上述方案的功能如下：

- 多 CDN 容错 - 两个 httpBackend
- 持久化存储 - 优先从 localstorage 读取
- 本地 fallback - 构建阶段同样将翻译资源打包成 chunk
- 自动切换逻辑 - `i18next-chained-backend`按顺序执行



版本的控制和缓存更新可以参考之前提到过的方案（版本服务 API），多 CDN 的目标是让用户先从更稳定、更靠近用户的地方的服务商请求数据。

与此同时，应用也可以考虑支持一个清理换存的服务，让用户主动触发。



### 一致性检测

开发过程中修改翻译资源容易遗漏某个语言的信息，很有必要添加一个 script 在提交 Git 记录的时候提前检测翻译资源，以免字段没有对齐。

首先，添加相关 scripts 到 package.json 里：

```json
{
  "scripts": {
    "check:i18n": "node scripts/check-i18n-consistency.js",
    "prepare": "husky install"
  }
}
```

创建在根目录的 scripts 目录下编辑 check-i18n-consistency.js:

```js
#!/usr/bin/env node
/**
 * 检查 /locales/en/*.json 是否在其他语言下都有对应文件，
 * 并确保 JSON key 一致。
 */
import fs from "fs"
import path from "path"

const BASE_LANG = "en"
const LOCALES_DIR = path.resolve("./public/locales")

function getAllLangs() {
  return fs
    .readdirSync(LOCALES_DIR)
    .filter((f) => fs.statSync(path.join(LOCALES_DIR, f)).isDirectory())
}

function loadJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    return JSON.parse(content)
  } catch (e) {
    console.error(`❌ 无法解析 JSON 文件：${filePath}`)
    process.exit(1)
  }
}

function getJsonKeys(obj, prefix = "") {
  let keys = []
  for (const key in obj) {
    const full = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys = keys.concat(getJsonKeys(obj[key], full))
    } else {
      keys.push(full)
    }
  }
  return keys
}

// ----------------- 主逻辑 -----------------
const langs = getAllLangs()
if (!langs.includes(BASE_LANG)) {
  console.error(`❌ 缺少基准语言目录：${BASE_LANG}`)
  process.exit(1)
}

const baseFiles = fs
  .readdirSync(path.join(LOCALES_DIR, BASE_LANG))
  .filter((f) => f.endsWith(".json"))

let hasError = false

for (const lang of langs.filter((l) => l !== BASE_LANG)) {
  console.log(`🔍 检查语言：${lang}`)

  for (const file of baseFiles) {
    const baseFile = path.join(LOCALES_DIR, BASE_LANG, file)
    const targetFile = path.join(LOCALES_DIR, lang, file)

    if (!fs.existsSync(targetFile)) {
      console.error(`❌ 缺少 ${lang}/${file}`)
      hasError = true
      continue
    }

    const baseJson = loadJson(baseFile)
    const targetJson = loadJson(targetFile)

    const baseKeys = getJsonKeys(baseJson)
    const targetKeys = getJsonKeys(targetJson)

    const missing = baseKeys.filter((k) => !targetKeys.includes(k))
    const extra = targetKeys.filter((k) => !baseKeys.includes(k))

    if (missing.length || extra.length) {
      console.error(`❌ ${lang}/${file} 键不一致:`)
      if (missing.length)
        console.error(`   缺少：${missing.join(", ")}`)
      if (extra.length)
        console.error(`   多余：${extra.join(", ")}`)
      hasError = true
    }
  }
}

if (hasError) {
  console.error("\n🚫 多语言文件结构不一致，请修复后再提交。")
  process.exit(1)
}

console.log("✅ 多语言文件检查通过！")
process.exit(0)

```

接着安装`husky`并初始化：

```bash
yarn add -D husky
yarn husky install
```

创建 pre-commit 钩子：

```bash
mkdir -p .husky
touch .husky/pre-commit
chmod +x .husky/pre-commit
```

> husky v9 版本更新之后，配置可能有所不同

编辑 pre-commit:

```bash
echo "✨ Running lint-staged and i18n check..."
yarn run check:i18n
```

上述 sh 脚本会在 git 提交的时候执行 `check:i18n` 这个命令，我们也可以在其他时候执行以下检查字段有没有对齐。

好了，让我们来检查一下是否顺利。

```bash
➜  react-i18n-best-practice git:(main) ✗ yarn check:i18n
yarn run v1.22.22
$ node scripts/check-i18n-consistency.js
🔍 检查语言：fr
🔍 检查语言：zh
✅ 多语言文件检查通过！
✨  Done in 0.96s.
➜  react-i18n-best-practice git:(main) ✗ 
```

将 `locales/zh/common.json`修改为：

```json
{
  "welcome": "欢迎",
  "loading": "加载中...",
  "error": "错误",
  "successssss": "成功"
}
```

再提交 git 让 husky 检查一次：

```bash
➜  react-i18n-best-practice git:(main) ✗ gacm "chore: test husky"
✨ Running lint-staged and i18n check...
yarn run v1.22.22
$ node scripts/check-i18n-consistency.js
🔍 检查语言：fr
🔍 检查语言：zh
❌ zh/common.json 键不一致:
   缺少：success
   多余：successssss

🚫 多语言文件结构不一致，请修复后再提交。
error Command failed with exit code 1.
```

大功告成！



## 最后

好了，我的 React SPA 多语言方案大致已经梳理清楚了，如果你也有一些不同的见解，欢迎留言交流。

下一篇分析我将给大家带来 React SPA + Antd 的使用分析，通过其 token 机制制定多主题色系统，最终实现一个我们满意的风格。



