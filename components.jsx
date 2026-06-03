/* global React */
const { useState, useEffect, useRef } = React;

// ---------- Boot sequence overlay ----------
function BootSequence({ lang, onDone }) {
  const linesZh = [
    "[ BOOT ] 初始化内核 ...........",
    "[  OK  ] 挂载 /dev/resume",
    "[  OK  ] 加载用户配置 ~/.profile",
    "[ SCAN ] 检索工作经历 .... 3 条记录",
    "[ SCAN ] 检索项目仓库 .... 24 个",
    "[  OK  ] 建立安全连接 [tls 1.3]",
    "[ DONE ] 系统就绪. 欢迎.",
  ];
  const linesEn = [
    "[ BOOT ] init kernel ...........",
    "[  OK  ] mount /dev/resume",
    "[  OK  ] load profile ~/.profile",
    "[ SCAN ] indexing experience .... 3 records",
    "[ SCAN ] indexing repos ......... 24 found",
    "[  OK  ] secure channel [tls 1.3]",
    "[ DONE ] system ready. welcome.",
  ];
  const lines = lang === "zh" ? linesZh : linesEn;
  const [shown, setShown] = useState(0);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (shown < lines.length) {
      const id = setTimeout(() => setShown(shown + 1), shown === 0 ? 180 : 90 + Math.random() * 90);
      return () => clearTimeout(id);
    }
    const id1 = setTimeout(() => setClosing(true), 360);
    const id2 = setTimeout(onDone, 760);
    return () => { clearTimeout(id1); clearTimeout(id2); };
  }, [shown]);
  return (
    <div className={`boot ${closing ? "boot-closing" : ""}`}>
      <div className="boot-inner">
        <div className="boot-bar">
          <span className="boot-bar-fill" style={{ width: `${(shown / lines.length) * 100}%` }}></span>
        </div>
        {lines.slice(0, shown).map((l, i) => {
          const ok = l.includes("OK") || l.includes("DONE");
          const scan = l.includes("SCAN");
          return (
            <div key={i} className="boot-line">
              <span className={ok ? "boot-ok" : scan ? "boot-scan" : "boot-tag"}>
                {l.slice(0, l.indexOf("]") + 1)}
              </span>
              {l.slice(l.indexOf("]") + 1)}
            </div>
          );
        })}
        {shown >= lines.length && <span className="cursor"></span>}
      </div>
    </div>
  );
}

// ---------- Glitch text ----------
function GlitchText({ text }) {
  return (
    <span className="glitch" data-text={text}>{text}</span>
  );
}

// ---------- Typewriter ----------
function Typewriter({ text, speed = 55, start = true }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    setN(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, start]);
  return <span>{text.slice(0, n)}</span>;
}

// ---------- Helpers ----------
function pickLang(val, lang) {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && (val.zh || val.en)) return val[lang] || val.en || val.zh || "";
  return val;
}

function FormattedBold({ text }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <span key={i} className="highlight">{p.slice(2, -2)}</span>
    ) : (
      <React.Fragment key={i}>{p}</React.Fragment>
    )
  );
}

function useInView(ref, opts = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const checkNow = () => {
      const el = ref.current;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh && r.bottom > 0) { setInView(true); return true; }
      return false;
    };
    if (checkNow()) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0, ...opts }
    );
    obs.observe(ref.current);
    const raf = requestAnimationFrame(checkNow);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, []);
  return inView;
}

function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  return (
    <div
      ref={ref}
      className={`fade-up ${visible ? "in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ---------- Live clock ----------
function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// ---------- Top bar ----------
function TopBar({ lang, setLang, theme, setTheme, onPrint }) {
  const { meta } = window.RESUME;
  const now = useClock();
  const time = now.toLocaleTimeString("en-GB", { hour12: false });
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="dots">
          <span className="dot live"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <div className="topbar-title">
          <span><span className="label">SESSION:</span> <span className="val">{meta.user}@{meta.host}</span></span>
          <span className="sep">│</span>
          <span><span className="label">PATH:</span> <span className="val">{meta.cwd}</span></span>
          <span className="sep">│</span>
          <span><span className="label">TIME:</span> <span className="val accent">{time}</span></span>
        </div>
        <div className="topbar-actions">
          <button
            className="icon-btn"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            title="Toggle language"
          >
            <span style={{ opacity: lang === "zh" ? 1 : 0.4 }}>ZH</span>
            <span style={{ color: "var(--fg-mute)" }}>/</span>
            <span style={{ opacity: lang === "en" ? 1 : 0.4 }}>EN</span>
          </button>
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            {theme === "dark" ? "◐ DARK" : "◑ LIGHT"}
          </button>
          <button className="icon-btn" onClick={onPrint} title="Print / PDF">
            ⎙ {pickLang(window.STRINGS.print, lang)}
          </button>
        </div>
      </div>
    </header>
  );
}

// ---------- Hero ----------
function Hero({ lang, booted }) {
  const { hero, meta } = window.RESUME;
  const stats = [
    { v: hero.yearsExp, plus: true, k: { zh: "年经验", en: "yrs exp" } },
    { v: "24", plus: true, k: { zh: "项目", en: "projects" } },
    { v: "5.6k", plus: false, k: { zh: "GitHub ★", en: "GitHub ★" } },
    { v: "12", plus: false, k: { zh: "开源贡献", en: "OSS contrib" } },
  ];
  return (
    <section className="hero">
      <div className="hero-lines">
        <div className="hero-prompt">
          <span className="prompt">{meta.user}@{meta.host}</span>
          <span style={{ color: "var(--fg-mute)" }}>:</span>
          <span className="prompt-path">{meta.cwd}</span>
          <span style={{ color: "var(--fg-mute)" }}>$ </span>
          <span>cat about.md --format=human</span>
        </div>
        <h1 className="hero-name">
          <GlitchText text={pickLang(hero.name, lang)} />
        </h1>
        <div className="hero-role">
          <span className="arrow">▸</span>
          <Typewriter text={pickLang(hero.role, lang)} start={booted} />
          <span className="cursor"></span>
        </div>
        <p className="hero-tagline">{pickLang(hero.tagline, lang)}</p>
        <div className="hero-meta">
          <span>
            <span style={{ color: "var(--fg-mute)" }}>◉ </span>
            <b>{pickLang(hero.location, lang)}</b>
          </span>
          <span className="dotsep">│</span>
          <span className="status">
            <span className="live-dot"></span>
            {pickLang(hero.status, lang)}
          </span>
        </div>
        <div className="hero-stats">
          {stats.map((s, i) => (
            <div key={i} className="stat">
              <div className="v">
                {s.v}
                {s.plus && <span className="plus">+</span>}
              </div>
              <div className="k">{pickLang(s.k, lang)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-photo">
        <image-slot
          id="resume-photo"
          shape="rect"
          placeholder={lang === "zh" ? "拖入头像" : "drop photo"}
        ></image-slot>
        <div className="hero-photo-label">ID_0001</div>
      </div>
    </section>
  );
}

// ---------- Section head ----------
function SectionHead({ num, title, meta }) {
  return (
    <div className="section-head">
      <span className="num">[ {num} ]</span>
      <h2>
        <span className="prompt-char">$</span>
        {title}
      </h2>
      {meta && <span className="meta">{meta}</span>}
    </div>
  );
}

// ---------- About ----------
function About({ lang }) {
  const paras = window.RESUME.about[lang];
  return (
    <section className="section about" id="about">
      <SectionHead num="01" title={pickLang(window.STRINGS.about, lang)} meta="// cat about.md" />
      <FadeUp>
        {paras.map((p, i) => (
          <p key={i}><FormattedBold text={p} /></p>
        ))}
      </FadeUp>
    </section>
  );
}

// ---------- Skills ----------
function Skills({ lang }) {
  const skills = window.RESUME.skills;
  return (
    <section className="section" id="skills">
      <SectionHead
        num="02"
        title={pickLang(window.STRINGS.skills, lang)}
        meta="// ls ~/skills"
      />
      <FadeUp>
        <div className="skills-grid">
          {skills.map((s, i) => (
            <React.Fragment key={i}>
              <div className="skill-cat">{pickLang(s.cat, lang)}</div>
              <div className="skill-chips">
                {s.items.map((it, j) => (
                  <span key={j} className="chip">{pickLang(it, lang)}</span>
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}

// ---------- Experience ----------
function ExpItem({ item, lang, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => setOpen(defaultOpen), [defaultOpen]);
  const bullets = item.bullets[lang];
  return (
    <div className={`exp ${open ? "open" : ""}`}>
      <button className="exp-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="exp-caret">▶</span>
        <span className="exp-title">
          <span className="role">{pickLang(item.role, lang)}</span>
          <span className="at">@</span>
          <span className="company">{pickLang(item.company, lang)}</span>
        </span>
        <span className="exp-date">{item.date}</span>
      </button>
      <div className="exp-body">
        <div className="exp-inner">
          <ul>
            {bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          {item.stack && (
            <div className="stack">
              {item.stack.map((s, i) => <span key={i} className="chip">{s}</span>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Experience({ lang }) {
  const items = window.RESUME.experience;
  const [allOpen, setAllOpen] = useState(true);
  return (
    <section className="section" id="experience">
      <SectionHead
        num="03"
        title={pickLang(window.STRINGS.experience, lang)}
        meta={
          <button
            className="icon-btn"
            style={{ padding: "2px 8px", fontSize: 10 }}
            onClick={() => setAllOpen(!allOpen)}
          >
            {allOpen
              ? pickLang(window.STRINGS.collapseAll, lang)
              : pickLang(window.STRINGS.expandAll, lang)}
          </button>
        }
      />
      <FadeUp>
        <div className="exp-list">
          {items.map((it, i) => (
            <ExpItem key={i} item={it} lang={lang} defaultOpen={allOpen} />
          ))}
        </div>
      </FadeUp>
    </section>
  );
}

// ---------- Projects ----------
function Projects({ lang }) {
  const items = window.RESUME.projects;
  return (
    <section className="section" id="projects">
      <SectionHead
        num="04"
        title={pickLang(window.STRINGS.projects, lang)}
        meta="// tree ~/projects"
      />
      <FadeUp>
        <div className="projects">
          {items.map((p, i) => (
            <div key={i} className="project">
              <div className="project-head">
                <span className="project-name">{p.name}</span>
                <span className="project-year">{p.year}</span>
              </div>
              <div className="project-desc">{pickLang(p.desc, lang)}</div>
              <div className="project-stack">
                {p.stack.map((t, j) => <span key={j} className="tag">{t}</span>)}
              </div>
              <div className="project-meta">
                <span>★ <b>{p.stars}</b></span>
                <span>● {p.lang}</span>
              </div>
            </div>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}

// ---------- Education ----------
function Education({ lang }) {
  const items = window.RESUME.education;
  return (
    <section className="section" id="education">
      <SectionHead num="05" title={pickLang(window.STRINGS.education, lang)} />
      <FadeUp>
        <div className="edu-list">
          {items.map((e, i) => (
            <div key={i} className="edu">
              <div className="date">{e.date}</div>
              <div>
                <div className="school">{pickLang(e.school, lang)}</div>
                <div className="degree">{pickLang(e.degree, lang)}</div>
              </div>
              <div className="extra">{pickLang(e.extra, lang)}</div>
            </div>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}

// ---------- Contact ----------
function Contact({ lang }) {
  const c = window.RESUME.contact;
  const rows = [
    ["email", c.email, `mailto:${c.email}`],
    ["github", c.github, `https://${c.github}`],
    ["linkedin", c.linkedin, `https://${c.linkedin}`],
    ["blog", c.blog, `https://${c.blog}`],
    ["phone", c.phone, null],
  ];
  return (
    <section className="section" id="contact">
      <SectionHead
        num="06"
        title={pickLang(window.STRINGS.contact, lang)}
        meta="// curl --get"
      />
      <FadeUp>
        <div className="contact-block">
          {rows.map(([k, v, href]) => (
            <div className="contact-line" key={k}>
              <span className="key">{k}</span>
              <span className="val">
                {href ? <a href={href} target="_blank" rel="noopener noreferrer">{v}</a> : v}
              </span>
            </div>
          ))}
        </div>
      </FadeUp>
      <div className="signoff">
        <span className="prompt">$ </span>
        echo "thanks for reading"<span className="cursor"></span>
      </div>
    </section>
  );
}

// ---------- Side rail navigator ----------
function SideRail({ lang }) {
  const sections = [
    { id: "about", label: { zh: "关于", en: "About" } },
    { id: "skills", label: { zh: "技能", en: "Skills" } },
    { id: "experience", label: { zh: "经历", en: "Exp" } },
    { id: "projects", label: { zh: "项目", en: "Projects" } },
    { id: "education", label: { zh: "教育", en: "Edu" } },
    { id: "contact", label: { zh: "联系", en: "Contact" } },
  ];
  const [active, setActive] = useState("about");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  return (
    <nav className="rail" aria-label="Section navigation">
      {sections.map((s, i) => (
        <a key={s.id} href={`#${s.id}`} className={active === s.id ? "active" : ""}>
          <span className="bar"></span>
          <span className="lbl">{String(i + 1).padStart(2, "0")} · {pickLang(s.label, lang)}</span>
        </a>
      ))}
    </nav>
  );
}

Object.assign(window, {
  TopBar, Hero, About, Skills, Experience, Projects, Education, Contact, SideRail,
  BootSequence, GlitchText, Typewriter, pickLang
});
