// 首页底部「最新文章 / Latest」小区块：把最近几篇博客文章作为「深度 1」的内部链接直接挂在首页。
//
// 为什么要放首页？这是为 SEO 服务的内部链接策略（见 spec §11）：
//   搜索引擎爬虫通常从首页进入，文章离首页越「近」（点击层级越浅）越容易被发现和收录。
//   把最新文章直接列在首页，等于给每篇文章一条「一跳即达」的入口，缩短抓取深度。
//
// 这是一个「纯展示组件」：只接收已经算好的 posts 数据，自己不读文件系统、不持有状态。
// 数据从哪来？静态导出没有运行时服务器，只有「构建期」能读 content/posts/，
// 所以由服务器组件 app/page.tsx 在构建时调用 getLatestPosts(3) 取好，
// 再一路经 ResumeApp 透传到这里——客户端只负责把它渲染出来。
import Link from "next/link";
// 只导入类型用 import type：编译成 JS 时这行会被擦掉，纯粹给 TS 做类型检查。
import type { PostMeta } from "@/lib/posts";
// urlFor：把站内路径变成「绝对 + 结尾带斜杠」的规范 URL，全站对外链接统一走它（见 lib/site.ts）。
import { urlFor } from "@/lib/site";
// 复用全站共享的区块标题 / 滚动渐显效果，避免重复造轮子（约定见 CLAUDE.md）。
import { SectionHead, FadeUp } from "@/components/effects";

// props 只有 posts。这里不接收界面语言 lang——
// 标题/“查看全部”都用中性的双语写法（中英并列），所以无需再多传一层语言 prop。
export function LatestPosts({ posts }: { posts: PostMeta[] }) {
  // 还没有任何文章时，整段都不渲染——否则首页会出现一个空荡荡的标题，很怪。
  // return null 是 React 里「什么都不画」的标准写法。
  if (posts.length === 0) return null;

  return (
    <section className="section" id="latest">
      {/* 复用 SectionHead，让这块和简历其它区块（01~07）保持同一套编号 + 终端提示符样式。
          编号顺着 Contact(07) 排到 08；meta 用一句模拟命令 `ls -t`（按时间倒序列文件）呼应「最新」。 */}
      <SectionHead num="08" title="最新文章 / Latest" meta="// ls -t ~/blog" />
      <FadeUp>
        <div className="latest-posts">
          {/* 遍历最新文章，每篇渲染成一行：左标题（链接）+ 右日期。
              key 用 slug：它在同一目录下天然唯一，比用数组下标更稳（增删文章时不会错位）。 */}
          {posts.map((p) => (
            <div className="latest-item" key={p.slug}>
              {/* 标题链到文章页。slug 经 urlFor 变成带结尾斜杠的绝对地址，
                  和 trailingSlash:true 下文章页的真实 URL 完全一致，避免多一次重定向 / canonical 分裂。 */}
              <Link href={urlFor(`/blog/${p.slug}`)}>{p.title}</Link>
              {/* <time dateTime> 给机器一个可解析的日期；显示文本仍是原始 ISO 串，简洁清楚。 */}
              <time dateTime={p.date}>{p.date}</time>
            </div>
          ))}
          {/* 「查看全部」入口：跳到 /blog/ 索引页。同样走 urlFor 保持 URL 形态统一。 */}
          <Link className="latest-all" href={urlFor("/blog")}>
            查看全部 / All posts →
          </Link>
        </div>
      </FadeUp>
    </section>
  );
}
