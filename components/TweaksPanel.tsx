"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

// ── useTweaks ────────────────────────────────────────────────────────────────
// 管理一组「风格设置」并持久化到浏览器的 localStorage。
// 泛型 <T> 让它能记住传入对象的具体形状，setTweak 的 key 会被限制为 T 的字段名。
export function useTweaks<T extends Record<string, unknown>>(
  defaults: T
): [T, <K extends keyof T>(key: K, val: T[K]) => void] {
  const [values, setValues] = useState<T>(defaults);

  // 挂载后从 localStorage 读取上次保存的设置，合并到默认值上。
  // 放在 useEffect 里（而非初始值）是为了让服务器端和首次渲染都用 defaults，
  // 避免「服务器渲染结果」和「浏览器渲染结果」不一致的 hydration 警告。
  useEffect(() => {
    try {
      const raw = localStorage.getItem("resume-tweaks");
      if (raw) setValues((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      /* localStorage 不可用时静默忽略 */
    }
  }, []);

  const setTweak = useCallback(<K extends keyof T>(key: K, val: T[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: val };
      try {
        localStorage.setItem("resume-tweaks", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return [values, setTweak];
}

// 面板自身的样式（一段 CSS 字符串，通过 <style> 注入）。保留原型的视觉。
const TWEAKS_STYLE = `
  .twk-fab{position:fixed;right:16px;bottom:16px;z-index:2147483646;
    appearance:none;border:.5px solid rgba(255,255,255,.18);
    background:rgba(20,22,30,.7);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);
    color:#e8eaf0;width:40px;height:40px;border-radius:12px;cursor:pointer;
    font-size:18px;line-height:1;box-shadow:0 8px 24px rgba(0,0,0,.35)}
  .twk-fab:hover{background:rgba(30,33,44,.85)}
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.82);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}
  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}
  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:pointer;padding:4px 6px;line-height:1.2;overflow-wrap:anywhere}
  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:pointer;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}
  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:34px;padding:0;border:0;
    border-radius:6px;overflow:hidden;cursor:pointer;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);transition:transform .12s,box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),0 2px 6px rgba(0,0,0,.15)}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── 面板外壳 ──────────────────────────────────────────────────────────────────
// 右下角 ⚙ 按钮：点开/收起设置面板。面板可拖动。
export function TweaksPanel({
  title = "Tweaks",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 16, y: 16 });

  // 按住标题栏拖动面板。
  const onDragStart = (e: React.MouseEvent) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX;
    const sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev: MouseEvent) => {
      const x = Math.max(8, startRight - (ev.clientX - sx));
      const y = Math.max(8, startBottom - (ev.clientY - sy));
      offsetRef.current = { x, y };
      panel.style.right = x + "px";
      panel.style.bottom = y + "px";
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <>
      <style>{TWEAKS_STYLE}</style>
      {!open ? (
        <button className="twk-fab" aria-label="Open tweaks" onClick={() => setOpen(true)}>
          ⚙
        </button>
      ) : (
        <div
          ref={dragRef}
          className="twk-panel"
          style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}
        >
          <div className="twk-hd" onMouseDown={onDragStart}>
            <b>{title}</b>
            <button
              className="twk-x"
              aria-label="Close tweaks"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="twk-body">{children}</div>
        </div>
      )}
    </>
  );
}

// ── 各种控件 ──────────────────────────────────────────────────────────────────

export function TweakSection({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <>
      <div className="twk-sect">{label}</div>
      {children}
    </>
  );
}

function TweakRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="twk-row">
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

type RadioOption = { value: string; label: string };

// 分段选择器（像 iOS 的 segmented control），可点可拖。
export function TweakRadio({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: RadioOption[];
  onChange: (v: string) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  const idx = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );
  const n = options.length;

  const segAt = (clientX: number): string => {
    const track = trackRef.current;
    if (!track) return valueRef.current;
    const r = track.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor(((clientX - r.left - 2) / inner) * n);
    return options[Math.max(0, Math.min(n - 1, i))].value;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev: PointerEvent) => {
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <TweakRow label={label}>
      <div
        ref={trackRef}
        role="radiogroup"
        onPointerDown={onPointerDown}
        className={dragging ? "twk-seg dragging" : "twk-seg"}
      >
        <div
          className="twk-seg-thumb"
          style={{
            left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
            width: `calc((100% - 4px) / ${n})`,
          }}
        />
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

export function TweakToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl">
        <span>{label}</span>
      </div>
      <button
        type="button"
        className="twk-toggle"
        data-on={value ? "1" : "0"}
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
      >
        <i />
      </button>
    </div>
  );
}

// 判断颜色深浅，决定对勾用深色还是白色。
function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, "0");
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}

// 配色选择：一排色块，点选当前 accent 颜色。
export function TweakColor({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <TweakRow label={label}>
      <div className="twk-chips" role="radiogroup">
        {options.map((c) => {
          const on = c.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              className="twk-chip"
              role="radio"
              aria-checked={on}
              data-on={on ? "1" : "0"}
              aria-label={c}
              title={c}
              style={{ background: c }}
              onClick={() => onChange(c)}
            >
              {on && (
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <path
                    d="M3 7.2 5.8 10 11 4.2"
                    fill="none"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    stroke={isLight(c) ? "rgba(0,0,0,.78)" : "#fff"}
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </TweakRow>
  );
}
