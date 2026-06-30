// 首页现在是「服务器组件」（注意：本文件顶部没有 "use client"，所以默认在服务器/构建期运行）。
// 它的唯一职责：在「构建期」读取最新文章，作为 prop 传给客户端简历组件 ResumeApp。
//
// 为什么要这么拆？
//   - 简历主体 ResumeApp 需要 localStorage / 状态等浏览器能力，必须是客户端组件；
//   - 而「最新文章」要读 content/posts/ 下的文件，静态导出下只有构建期（服务器侧）能读文件系统；
//   客户端组件不能读文件，服务器组件不能用 localStorage——于是用「服务器拿数据 + 客户端管交互」的分工：
//   本组件（服务器）取好数据，把它当作 prop 注入到 ResumeApp（客户端）里。
//   app 目录下名为 page 的文件是 Next.js 的约定，这里对应网站根路由「/」。
import { getLatestPosts } from "@/lib/posts";
import { ResumeApp } from "@/components/ResumeApp";

// export default：Next 会把这个默认导出的组件当作「/」路由的页面来渲染。
export default function Page() {
  // getLatestPosts(3)：取最新的 3 篇已发布文章（构建期执行一次，结果被静态烘焙进 HTML）。
  return <ResumeApp latest={getLatestPosts(3)} />;
}
