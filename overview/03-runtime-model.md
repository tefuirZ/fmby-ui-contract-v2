# 03 · 运行模型（主题加载与切换）

## 首屏加载时序（零主题阻塞）

主题**不阻塞首屏**——这是多主题不卡的命门。

```text
1. 浏览器请求 /                → host 的 index.html（含 host 主 chunk）
2. host 启动
   ├─ 读 localStorage 的 theme id（键 fmby:theme），无则用 DEFAULT_THEME_ID
   ├─ 从 THEME_REGISTRY 取该主题的 manifestUrl（字符串常量，不加载）
   └─ 懒 import() 主题入口 → 独立 async chunk（激活时才拉）
3. host 拉 /api/browse/home/bootstrap 等业务数据
4. 主题 chunk 就绪 → 注入 tokens.css + 挂载 Skin（如提供）
```

要点：

- host 首屏**不 import 主题产物**；注册表里只有 `?url` 资产地址 + `loadEntry` 懒函数
- 主题 manifest 有 **2KB 硬红线**（`THEME_MANIFEST_MAX_BYTES`）
- 体积由 `scripts/check-frontend-size.mjs` 依 vite manifest 断言

## 主题切换（tokens 热替换）

```text
用户点「界面皮肤」下拉
   → switchTheme(id)
   → 同 id 幂等直接返回
   → 否则：loadEntry() 懒加载该主题 chunk
          → 替换 <link rel=stylesheet> 的 tokens.css
          → 挂载/卸载 Skin 组件
          → 写 localStorage('fmby:theme', id)
   → 失败：回落当前主题，不重载页面
```

**不刷新页面、不重拉业务数据**——只换 CSS 变量与装饰组件。

## 主题注册表（host 侧）

`apps/host/src/theme/registry.ts`：

```ts
export const DEFAULT_THEME_ID = 'darkroom';

export const THEME_REGISTRY: Record<string, ThemeRegistration> = {
  darkroom: {
    id: 'darkroom',
    manifestUrl: darkroomManifestUrl,          // ?url 取地址，不加载
    assets: { 'tokens.css': darkroomTokensUrl, 'aurora.css': darkroomAmbientUrl },
    loadEntry: () => import('@fmby/v2-theme-darkroom').then((m) => m.default),
  },
  template: { ... },
};
```

新增主题 = 在此加一项（三处：manifestUrl / assets / loadEntry）。

## 主题入口模块

主题包 `src/index.ts` 默认导出 `ThemeEntryModule`：

```ts
import type { ThemeEntryModule } from '@fmby/v2-shared/theme';
import manifest from '../theme.manifest.json';

const entry: ThemeEntryModule = {
  manifest,
  // Skin 可选：CSS-only 主题可省略
  Skin: () => <div className="fmby-theme-ambient" />,
};
export default entry;
```

## 当前限制（必读）

### 主题 id 目前只存本地

- 「界面皮肤」选择（`darkroom` / `template`）**仅存 localStorage**，后端**无用户级主题 id 字段**
- 换设备 / 清缓存 → 主题选择丢失
- **后端已规划补该字段**（见 [`../features/implementation-status.md`](../features/implementation-status.md) 的 G-01）
- 在多主题持久化落地前，主题作者**不要假设**选择能跨端同步

### theme_mode 与 theme id 是两个概念

- `theme_mode`（`dark` / `light`）：明暗模式，**站点级设置**
- theme id（`darkroom` / `template`）：具体主题包
- 两者当前在后端 `appearance` 接口里有混用问题（见 G-16），主题作者应以 host 的
  `useTheme()` 上下文为准，不直接读写后端 appearance 的 `theme` 字段做主题切换

## 运维视角

- 主题静态资源由后端随 host 一起构建发布；**运行时安装/启用主题包已实现**（`POST /api/site/themes/install`、`POST /api/site/themes/{id}/enable`）
- 站点管理员**可在后端切换全局默认主题**（`POST /api/site/themes/{id}/enable`）；构建期 `DEFAULT_THEME_ID` 为缺省
  （`DEFAULT_THEME_ID`），用户级切换在浏览器端
