// Vitest 配置：主要测试 lib/ 下的纯逻辑，也允许用 React 的服务器渲染检查少量组件语义（不碰真实 DOM）。
// 为什么单独一个配置文件、而不复用 Next 的构建？因为这些测试跑在 Node 里、
// 直接 import lib/*.ts，速度快、也不需要起 Next 服务器。
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  // 和 Next/tsconfig 保持相同的 @/ 根目录别名，让服务器渲染测试能直接复用真实组件。
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  // Next 的 tsconfig 使用 jsx: "preserve"，留给 Next/SWC 在构建时处理；
  // 但 Vitest 4 通过 Oxc 直接读取 TSX，必须在这里把 JSX 转成普通 JS，
  // 否则 Vite 的导入分析会把标签当成语法错误。
  oxc: {
    jsx: { runtime: "automatic" },
  },
  test: {
    // 测试文件仍集中在 lib/，组件结构测试也从这里发起，避免引入 jsdom 和另一套浏览器环境。
    include: ["lib/**/*.test.ts"],
    // 纯逻辑测试用 node 环境即可，省去 jsdom 的开销。
    environment: "node",
  },
});
