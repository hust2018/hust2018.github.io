# 个人简历网站

中英双语的单页简历。视觉方向叫「信号」：纯黑暗场、超大动态字、一个荧光青柠的信号色，背景是一片会随鼠标和滚动变化的粒子场。
技术栈：**Next.js 15 + React 19 + TypeScript**，包管理用 **pnpm**，不依赖任何动画库。

## 运行

```bash
pnpm install     # 首次：安装依赖
pnpm dev         # 开发模式，访问 http://localhost:3000
pnpm test        # 运行单元测试
```

改代码后浏览器会自动刷新（热更新）。

> 如果 `pnpm dev` 打开后页面报 500，多半是终端里带着 `NODE_ENV=production`。
> 改用 `NODE_ENV=development pnpm dev` 即可。

## 构建 / 部署

```bash
pnpm build          # 生成纯静态站点到 out/ 目录
pnpm publish-site   # 测试 + 构建 + 发布到线上
```

`out/` 里是纯 HTML/CSS/JS，可上传到任意静态托管。

**发布前先提交源码。** `pnpm publish-site` 只会自动提交 `content/posts/` 下的文章；
简历数据、组件、样式的改动会被构建并发布，但不会被提交。先自己 `git commit` 再发布，
否则线上是新的、仓库里却是旧的。

## 目录结构

| 路径 | 作用 | 你需要改的 |
|------|------|-----------|
| `lib/data.ts` | **所有简历内容**（姓名、经历、技能、联系方式）和界面文案 | ✅ 主要改这里 |
| `lib/types.ts` | 简历数据的 TypeScript 类型定义 | 加字段时才动 |
| `lib/i18n.ts` | 双语取词工具 `pickLang` | 一般不动 |
| `lib/fx.ts` | 特效用到的纯计算（有单元测试 `lib/fx.test.ts`） | 调特效手感时改 |
| `lib/ticker.ts` | 全站共用的「每帧时钟」：滚动、鼠标状态 | 一般不动 |
| `lib/particles.ts` | 背景粒子场的绘制引擎 | 想调粒子时改 |
| `app/layout.tsx` | 页面外壳：字体、标题、全局 CSS | 改 `<title>` |
| `app/globals.css` | 全部样式；颜色、字体、间距都在最上面的 `:root` 里 | 想调外观时改 |
| `components/ResumeApp.tsx` | 首页总装：管理语言等状态，组装各区块 | 调整区块顺序时改 |
| `components/*.tsx` | 各区块组件（Hero / About / Experience ...） | 一般不用动 |
| `components/effects.tsx` | 共用的小积木和特效 Hook | 写新特效时先看这里 |

## 改内容

打开 `lib/data.ts`，里面每条都有 `{ zh: "中文", en: "English" }` 的双语结构，直接改文字即可。几个约定：

- 经历要点如果写成 `**小标题**：正文`，页面会显示成「标题一行 + 正文一段」。
- 每段经历的 `era` 是 `"agent"` 或 `"security"`，决定这一段用青柠色还是橙色。
- 要点留空（`bullets: { zh: [], en: [] }`）时，这段经历只显示公司、时间和职位。
- 页面有哪些区块、按什么顺序、编号是多少，都由文件末尾的 `SECTIONS` 决定。

改完内容后，记得重新生成 PDF（见下）。

## 换头像

把新图片存成 `public/portrait.jpg` 覆盖原图。如果图片的像素尺寸不是 900×1200，
到 `components/Hero.tsx` 里把 `<img>` 的 `width` / `height` 改成新图片的真实尺寸。

## 导出 PDF

```bash
pnpm pdf         # 根据 lib/data.ts 重新生成 public/resume.pdf 和 resume.md（需要本机装有 Chrome）
```

右上角「下载 PDF」按钮下载的就是这份文件。它是一份干净的浅色文档，和网站的视觉风格无关。

## 语言与快捷键

右上角可切 中 / 英（选择会记在浏览器里）。按 `⌘K`（Windows 上是 `Ctrl K`）或 `` ` `` 键呼出终端面板，
里面可以敲 `help` 看有哪些命令。
