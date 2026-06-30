// 构建期 Markdown → HTML 流水线。代码高亮、数学公式都在这里变成静态 HTML，
// 客户端零额外 JS（Mermaid 除外，见下）。整条链是异步的（shiki 是异步插件），必须用 .process()。
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";

// 自定义 rehype 插件：把 ```mermaid 围栏从 shiki 高亮路径里「捞出来」。
// 原因：shiki 不认识 mermaid 这个语言会报错；我们把它替换成 <pre class="mermaid">原始源码</pre>，
// 留给客户端的 mermaid 库渲染。用闭包里的 flag 记录这页是否含图表（供文章页决定要不要加载 mermaid）。
//
// 注意 unified 的插件契约：传给 .use() 的是「attacher」——它在 freeze 时被调用一次，
// 返回真正的「transformer」（拿到 tree 的那个函数）。所以这里是两层箭头：
// 外层 () => 是 attacher，内层 (tree) => 才是每次 .process() 时跑的 transformer。
// （若只写一层，unified 会在 freeze 阶段把它当 attacher 调用、此时 tree 为 undefined 而报错。）
function liftMermaid(flag: { has: boolean }) {
  return () => (tree: unknown) => {
    // 经过 remark-rehype 后，```mermaid 围栏的 hast 形状是：
    //   <pre><code class="language-mermaid">graph TD; ...</code></pre>
    // visit 命中的是内层 <code>：此时 node=<code>，parent=外层 <pre>。
    // 所以我们直接「就地改写 parent（那个 <pre>）」：把它变成 <pre class="mermaid">，
    // children 换成纯文本的原始图表源码——这样 shiki 之后就看不到任何 language-mermaid 了。
    visit(tree as never, "element", (node: any, index: number | undefined, parent: any) => {
      if (node.tagName !== "code" || index == null || !parent) return;
      const cls: string[] = node.properties?.className || [];
      if (!cls.includes("language-mermaid")) return;
      const raw = (node.children || []).filter((c: any) => c.type === "text").map((c: any) => c.value).join("");
      flag.has = true;
      parent.tagName = "pre";
      parent.properties = { className: ["mermaid"] };
      parent.children = [{ type: "text", value: raw }];
    });
  };
}

export async function renderMarkdown(raw: string): Promise<{ html: string; hasMermaid: boolean }> {
  const flag = { has: false };
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: { className: ["heading-anchor"], ariaLabel: "Link to section" },
      content: { type: "text", value: "#" },
    })
    .use(rehypeKatex)
    .use(liftMermaid(flag))            // 必须在 rehypePrettyCode 之前
    .use(rehypePrettyCode, { theme: "github-dark-dimmed", keepBackground: false })
    .use(rehypeStringify)
    .process(raw);
  return { html: String(file), hasMermaid: flag.has };
}
