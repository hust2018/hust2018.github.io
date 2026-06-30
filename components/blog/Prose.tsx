// 文章正文容器（服务器组件，无需 "use client"——它不交互，只渲染静态 HTML）。
//
// 为什么用 dangerouslySetInnerHTML？
//   文章正文是「构建期」由 lib/markdown.ts 的 unified 流水线把 Markdown 编译成的一段 HTML 字符串
//   （代码高亮、KaTeX 公式都已经是静态标签了）。React 默认会把字符串当文本转义显示，
//   所以要把这段「可信的、我们自己生成的」HTML 注入进 DOM，必须用这个 API。
//   名字里带 dangerously 是提醒：注入外部不可信内容会有 XSS 风险——但这里内容来自我们仓库里的
//   .md 文件、且流水线默认丢弃原始 HTML（remark-rehype 不开 rehype-raw），所以是安全的。
//
// 为什么 lang 放在 <article> 而不是 <html>？
//   静态导出下整站共用一个根布局的 <html lang>（见 app/layout.tsx），它无法逐篇文章变化。
//   所以把每篇文章的真实语言标在最近的祖先 <article lang> 上——浏览器、屏幕阅读器、搜索引擎
//   都会就近采用这个 lang（详见 spec §9）。
export function Prose({ html, lang }: { html: string; lang: "zh" | "en" }) {
  return (
    <article
      lang={lang}
      className="prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
