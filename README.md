# 个人简历网站

终端 / 科技风的双语单页简历，深浅色 + 三种风格切换。
技术栈：**Next.js 15 + React 19 + TypeScript**。

## 运行

```bash
npm install      # 首次：安装依赖
npm run dev      # 开发模式，访问 http://localhost:3000
```

改代码后浏览器会自动刷新（热更新）。

## 构建 / 部署

```bash
npm run build    # 生成纯静态站点到 out/ 目录
```

`out/` 里是纯 HTML/CSS/JS，可上传到任意静态托管（GitHub Pages / Vercel / Netlify / 自己的服务器）。

## 目录结构

| 路径 | 作用 | 你需要改的 |
|------|------|-----------|
| `lib/data.ts` | **所有简历内容**（姓名、经历、项目、技能、联系方式） | ✅ 主要改这里 |
| `lib/types.ts` | 简历数据的 TypeScript 类型定义 | 加字段时才动 |
| `lib/i18n.ts` | 双语取词工具 `pickLang` | 一般不动 |
| `app/layout.tsx` | 页面外壳：字体、标题、全局 CSS | 改 `<title>` |
| `app/page.tsx` | 主页面：管理语言/主题/风格，组装各区块 | 改默认风格 |
| `app/globals.css` | 全部样式与动效 | 想调外观时改 |
| `components/*.tsx` | 各区块组件（Hero / About / Skills ...） | 一般不用动 |
| `next.config.ts` | Next.js 配置（已开启静态导出） | 一般不动 |

## 改内容

打开 `lib/data.ts`，里面每条都有 `{ zh: "中文", en: "English" }` 的双语结构，直接替换占位文字即可。
顶部的 `meta`（user/host/cwd）控制终端提示符里的 `you@portfolio:~/resume` 那串字。

## 换头像

把图片放到 `public/avatar.jpg`，再到 `components/Hero.tsx` 里给 `<ImageSlot>` 加上 `src="/avatar.jpg"`。
（`public/` 下的文件，访问路径就是去掉 `public` 的根路径，例如 `public/avatar.jpg` → `/avatar.jpg`。）

## 导出 PDF

右上角点 `打印 / Print`，或浏览器 Cmd/Ctrl+P。已做打印优化：自动去掉特效、展开所有经历、转黑白排版。

## 风格切换

右下角 ⚙ 面板：Terminal / IDE Dark / Paper 三种主题、accent 配色、扫描线、光标闪烁等（设置存在浏览器 localStorage，刷新仍在）。
右上角可切 中/英、深/浅色。
