// 客户端组件。
"use client";

import { RESUME, STRINGS } from "@/lib/data";
import { pickLang } from "@/lib/i18n";
import { FadeUp, SectionHead } from "./effects";
import type { Lang } from "@/lib/types";

// 「联系方式」区块：把邮箱、GitHub 等整理成一行行可点击的链接。
export function Contact({ lang }: { lang: Lang }) {
  // 取出联系方式数据。
  const c = RESUME.contact;
  // 每行：[显示的字段名, 值, 链接(没有则 null)]
  // 这里手动把数据整理成一个「数组的数组」，下面用 .map 统一渲染，避免重复写 6 行 JSX。
  // 类型 [string, string, string | null][] 是「元组数组」：每个元素都是固定 3 项、
  // 第三项可以是字符串或 null（电话没有链接，所以是 null）。
  const rows: [string, string, string | null][] = [
    ["email", c.email, `mailto:${c.email}`],
  ];
  return (
    <section className="section" id="contact">
      <SectionHead num="07" title={pickLang(STRINGS.contact, lang)} meta="// curl --get" />
      <FadeUp>
        <div className="contact-block">
          {/* 遍历 rows。.map 的参数 ([k, v, href]) 直接把每个元组解构成三个变量。
              这里 key 用字段名 k（email/github...），它们本身就是唯一的，比用下标更稳妥。 */}
          {rows.map(([k, v, href]) => (
            <div className="contact-line" key={k}>
              <span className="key">{k}</span>
              <span className="val">
                {/* 条件渲染（三元）：有 href 就渲染成可点击的 <a> 链接，否则只显示纯文本 v。
                    target="_blank" 新标签页打开；rel="noopener noreferrer" 是安全惯例，
                    防止新页面通过 window.opener 操纵原页面。 */}
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {v}
                  </a>
                ) : (
                  v
                )}
              </span>
            </div>
          ))}
        </div>
      </FadeUp>
      {/* 页面结尾的「签名」行，模仿在终端里 echo 一句话。
          &quot; 是 HTML 实体，表示英文双引号 "（在 JSX 里直接写 " 容易和属性引号混淆）。 */}
      <div className="signoff">
        <span className="prompt">$ </span>
        echo &quot;thanks for reading&quot;<span className="cursor"></span>
      </div>
    </section>
  );
}
