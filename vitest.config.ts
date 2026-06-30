// Vitest 配置：只测 lib/ 下的纯逻辑单元（不碰 React/DOM）。
// 为什么单独一个配置文件、而不复用 Next 的构建？因为这些测试跑在 Node 里、
// 直接 import lib/*.ts，速度快、也不需要起 Next 服务器。
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 只收集 lib 目录里的 *.test.ts；组件/页面不在这里测（静态导出靠 pnpm build 验证）。
    include: ["lib/**/*.test.ts"],
    // 纯逻辑测试用 node 环境即可，省去 jsdom 的开销。
    environment: "node",
  },
});
