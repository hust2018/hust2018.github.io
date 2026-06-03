"use client";

import { RESUME, STRINGS } from "@/lib/data";
import { pickLang } from "@/lib/i18n";
import { FadeUp, SectionHead } from "./effects";
import type { Lang } from "@/lib/types";

export function Contact({ lang }: { lang: Lang }) {
  const c = RESUME.contact;
  // 每行：[显示的字段名, 值, 链接(没有则 null)]
  const rows: [string, string, string | null][] = [
    ["email", c.email, `mailto:${c.email}`],
    ["github", c.github, `https://${c.github}`],
    ["linkedin", c.linkedin, `https://${c.linkedin}`],
    ["blog", c.blog, `https://${c.blog}`],
    ["phone", c.phone, null],
  ];
  return (
    <section className="section" id="contact">
      <SectionHead num="06" title={pickLang(STRINGS.contact, lang)} meta="// curl --get" />
      <FadeUp>
        <div className="contact-block">
          {rows.map(([k, v, href]) => (
            <div className="contact-line" key={k}>
              <span className="key">{k}</span>
              <span className="val">
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
      <div className="signoff">
        <span className="prompt">$ </span>
        echo &quot;thanks for reading&quot;<span className="cursor"></span>
      </div>
    </section>
  );
}
