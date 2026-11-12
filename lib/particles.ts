// 背景粒子场的「引擎」：在一张 <canvas> 上画两层东西——
//   1. 尘埃粒子：几千个小方点，在一个缓慢变化的「流场」里漂；鼠标靠近会被推开；
//      页面滚动时会被拉成竖向的短线。开场时它们还能拼成名字。
//   2. 智能体网络：几十个节点，离得近的互相连线，线上偶尔有「消息」跑过——
//      对应简历的主题：多智能体协作。
//
// 这里不依赖 React，也不自己开动画循环：组件（components/ParticleField.tsx）
// 每帧调用一次 frame()，窗口变化时调用 resize()。
//
// 概念：canvas 是一块可以用 JavaScript 直接画图的画布。和 DOM 元素不同，
// 画上去的东西只是像素，没有「元素」可言，所以同时画几千个点也很快。
import type { FrameState } from "./ticker";
import { clamp, lerp } from "./fx";

// 要拼成文字时，告诉引擎每一行字画在哪、用什么字体。
export interface TextLine {
  text: string;
  x: number; // 左边缘（视口坐标）
  y: number; // 基线位置（视口坐标）
  font: string; // canvas 的 font 写法，如 "normal 900 200px Archivo"
  letterSpacing: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number; // 速度
  vy: number;
  tx: number; // 拼字时的目标位置
  ty: number;
  has: boolean; // 当前是否有目标（= 正在拼字）
  z: number; // 深度 0~1：越大越「近」，漂得越快、滚动视差越大
  size: number;
  signal: boolean; // 少数粒子用信号色（青柠）
  band: number; // 透明度档位 0/1/2
}

interface NetNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number;
}

interface Pulse {
  from: number;
  to: number;
  t: number; // 0→1：消息在连线上走到哪了
}

export interface ParticleEngine {
  resize(force?: boolean): void;
  frame(state: FrameState): void;
  formText(lines: TextLine[]): boolean;
  release(): void;
  setGain(target: number): void;
}

const COLOR_FG = "241,243,238";
const COLOR_SIGNAL = "200,255,46";
const BAND_ALPHA = [0.28, 0.5, 0.78];

// 创建引擎。拿不到 2D 画笔（极少数环境）时返回 null，调用方据此跳过特效。
export function createParticleEngine(canvas: HTMLCanvasElement): ParticleEngine | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  let width = 0;
  let height = 0;
  let particles: Particle[] = [];
  let groups: Particle[][] = []; // 按「颜色 × 透明度」分成 6 组：绘制时每组只设一次颜色
  let nodes: NetNode[] = [];
  let pulses: Pulse[] = [];
  let formed = false;
  let lastPulse = 0;
  let gain = 1; // 整体亮度：首屏最亮，正文区压暗保证文字可读
  let gainTarget = 1;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function makeParticle(): Particle {
    const alpha = 0.25 + Math.random() * 0.6;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      tx: 0,
      ty: 0,
      has: false,
      z: 0.15 + Math.random() * 0.75,
      size: Math.random() < 0.86 ? 1 : 2,
      signal: Math.random() < 0.14,
      band: alpha < 0.45 ? 0 : alpha < 0.66 ? 1 : 2,
    };
  }

  function seed(count: number) {
    particles = Array.from({ length: count }, makeParticle);
    groups = [[], [], [], [], [], []];
    for (const p of particles) groups[(p.signal ? 3 : 0) + p.band].push(p);
    const nodeCount = clamp(Math.round(width / 30), 14, 52);
    nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.36,
      vy: (Math.random() - 0.5) * 0.36,
      z: 0.3 + Math.random() * 0.5,
    }));
    pulses = [];
  }

  function linkDistance() {
    return clamp(width * 0.14, 120, 190);
  }

  // 画网络：节点之间的连线、节点到鼠标的连线、节点本身。返回连线距离的平方，后面发消息时要用。
  function drawNetwork(alpha: number, pointerX: number, pointerY: number): number {
    const dist = linkDistance();
    const dist2 = dist * dist;
    ctx!.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < dist2) {
          // 离得越近，线越亮
          ctx!.strokeStyle = `rgba(${COLOR_SIGNAL},${((1 - Math.sqrt(d2) / dist) * 0.34 * alpha).toFixed(3)})`;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }
      const px = a.x - pointerX;
      const py = a.y - pointerY;
      const pd2 = px * px + py * py;
      if (pd2 < 220 * 220) {
        ctx!.strokeStyle = `rgba(${COLOR_FG},${((1 - Math.sqrt(pd2) / 220) * 0.4 * alpha).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(pointerX, pointerY);
        ctx!.stroke();
      }
    }
    ctx!.fillStyle = `rgba(${COLOR_SIGNAL},${(0.85 * alpha).toFixed(3)})`;
    for (const n of nodes) ctx!.fillRect(n.x - 1.5, n.y - 1.5, 3, 3);
    return dist2;
  }

  // 减少动态效果时只画一帧静态画面。
  function drawStatic() {
    ctx!.clearRect(0, 0, width, height);
    for (let g = 0; g < 6; g++) {
      ctx!.fillStyle = `rgba(${g < 3 ? COLOR_FG : COLOR_SIGNAL},${(BAND_ALPHA[g % 3] * 0.5).toFixed(3)})`;
      for (const p of groups[g]) ctx!.fillRect(p.x, p.y, p.size, p.size);
    }
    drawNetwork(0.5, -9999, -9999);
  }

  function resize(force = false) {
    const nextW = window.innerWidth;
    const nextH = window.innerHeight;
    const widthChanged = nextW !== width;
    width = nextW;
    height = nextH;
    // 高分屏上一个 CSS 像素对应多个物理像素：把画布的实际像素数放大，再把坐标系缩回去，画出来才清晰。
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    // 手机上地址栏伸缩只会改高度：这时不重新撒点，否则画面会跳一下。
    if (force || widthChanged || particles.length === 0) {
      seed(clamp(Math.round((width * height) / 480), 700, 3200));
    }
    if (reduced) drawStatic();
  }

  // 把文字画到一张看不见的画布上，取出「有墨」的像素点，作为粒子的目标位置。
  function sampleText(lines: TextLine[]): number[] {
    try {
      const off = document.createElement("canvas");
      off.width = width;
      off.height = height;
      const c = off.getContext("2d");
      if (!c) return [];
      c.fillStyle = "#fff";
      c.textBaseline = "alphabetic";
      for (const line of lines) {
        c.font = line.font;
        if ("letterSpacing" in c) c.letterSpacing = line.letterSpacing;
        c.fillText(line.text, line.x, line.y);
      }
      // getImageData 返回每个像素的 RGBA 四个数；第 4 个（下标 +3）是不透明度。
      const data = c.getImageData(0, 0, width, height).data;
      const max = Math.floor(particles.length * 0.88);
      let step = 3;
      let points: number[] = [];
      // 点太多、粒子不够用时，把取样间隔调大再来一遍。
      for (let attempt = 0; attempt < 5; attempt++) {
        points = [];
        for (let y = 0; y < height; y += step) {
          for (let x = 0; x < width; x += step) {
            if (data[(y * width + x) * 4 + 3] > 120) points.push(x, y);
          }
        }
        const count = points.length / 2;
        if (count <= max) break;
        step = Math.ceil(step * Math.sqrt(count / max) + 0.5);
      }
      if (points.length / 2 > max) points.length = max * 2;
      return points;
    } catch {
      return [];
    }
  }

  function formText(lines: TextLine[]): boolean {
    if (reduced || lines.length === 0) return false;
    const points = sampleText(lines);
    const count = points.length / 2;
    if (!count) return false;
    particles.forEach((p, i) => {
      if (i < count) {
        p.tx = points[i * 2];
        p.ty = points[i * 2 + 1];
        p.has = true;
      } else {
        p.has = false;
      }
    });
    formed = true;
    return true;
  }

  // 松开：拼成文字的粒子从文字中心向外炸开，随后汇入背景流场。
  function release() {
    if (!formed) return;
    formed = false;
    let cx = 0;
    let cy = 0;
    let n = 0;
    for (const p of particles) {
      if (p.has) {
        cx += p.tx;
        cy += p.ty;
        n++;
      }
    }
    if (n) {
      cx /= n;
      cy /= n;
    }
    for (const p of particles) {
      if (!p.has) continue;
      p.has = false;
      const dx = p.x - cx;
      const dy = p.y - cy;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = 3 + Math.random() * 11;
      p.vx = (dx / d) * force + (Math.random() - 0.5) * 3;
      p.vy = (dy / d) * force + (Math.random() - 0.5) * 3;
    }
  }

  function frame(s: FrameState) {
    if (reduced || document.hidden) return;
    // k：这一帧相对于「标准的 1/60 秒」有多长。用它乘速度，帧率不稳时动画快慢也基本一致。
    const k = Math.min(s.dt / 16.67, 3);
    const t = s.now * 0.00012;
    const vel = s.vel;
    const pointerX = s.pointerOn ? s.pointerX : -9999;
    const pointerY = s.pointerOn ? s.pointerY : -9999;
    const radius = 150;
    const streak = Math.min(Math.abs(vel) * 1.2, 46);
    gain += (gainTarget - gain) * 0.08;

    ctx!.clearRect(0, 0, width, height);

    // —— 物理：拼字的粒子做弹簧运动，其余的在流场里漂 ——
    for (const p of particles) {
      if (p.has) {
        p.vx = (p.vx + (p.tx - p.x) * 0.06 * k) * 0.8;
        p.vy = (p.vy + (p.ty - p.y) * 0.06 * k) * 0.8;
      } else {
        // 用几个正弦波叠出一个平滑变化的方向角：位置相近的粒子方向也相近，于是看起来像水流。
        const angle =
          (Math.sin(p.x * 0.0023 + t * 3.1) +
            Math.cos(p.y * 0.0029 - t * 2.3) +
            Math.sin((p.x + p.y) * 0.0011 + t)) *
          1.6;
        p.vx = (p.vx + Math.cos(angle) * 0.018 * k * p.z) * 0.965;
        p.vy = (p.vy + Math.sin(angle) * 0.018 * k * p.z) * 0.965;
        p.y -= vel * p.z * 0.35; // 滚动视差：越「近」的粒子移动越多
      }
      const dx = p.x - pointerX;
      const dy = p.y - pointerY;
      const d2 = dx * dx + dy * dy;
      if (d2 < radius * radius && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const push = (1 - d / radius) * 0.9 * k;
        p.vx += (dx / d) * push;
        p.vy += (dy / d) * push;
      }
      p.x += p.vx * k;
      p.y += p.vy * k;
      // 漂出屏幕的粒子从另一边绕回来
      if (!p.has) {
        if (p.x < -8) p.x += width + 16;
        else if (p.x > width + 8) p.x -= width + 16;
        if (p.y < -8) p.y += height + 16;
        else if (p.y > height + 8) p.y -= height + 16;
      }
    }

    // —— 绘制：滚动时粒子被拉成竖向短线 ——
    for (let g = 0; g < 6; g++) {
      const group = groups[g];
      if (!group.length) continue;
      ctx!.fillStyle = `rgba(${g < 3 ? COLOR_FG : COLOR_SIGNAL},${(BAND_ALPHA[g % 3] * gain).toFixed(3)})`;
      for (const p of group) {
        if (p.has) continue;
        const tail = streak * p.z;
        ctx!.fillRect(p.x, vel > 0 ? p.y : p.y - tail, p.size, p.size + tail);
      }
    }
    if (formed) {
      ctx!.fillStyle = `rgba(${COLOR_FG},0.96)`;
      for (const p of particles) if (p.has && !p.signal) ctx!.fillRect(p.x, p.y, 2, 2);
      ctx!.fillStyle = `rgba(${COLOR_SIGNAL},1)`;
      for (const p of particles) if (p.has && p.signal) ctx!.fillRect(p.x, p.y, 2, 2);
    }

    // —— 网络节点、连线、消息脉冲 ——
    const dist = linkDistance();
    for (const n of nodes) {
      n.x += n.vx * k;
      n.y += n.vy * k - vel * n.z * 0.35;
      if (n.x < -dist) n.x += width + 2 * dist;
      else if (n.x > width + dist) n.x -= width + 2 * dist;
      if (n.y < -dist) n.y += height + 2 * dist;
      else if (n.y > height + dist) n.y -= height + 2 * dist;
    }
    const dist2 = drawNetwork(gain, pointerX, pointerY);
    // 每隔一小会儿，随机挑一个节点，给离它最近的邻居发一条「消息」
    if (s.now - lastPulse > 240 && nodes.length > 1 && pulses.length < 24) {
      lastPulse = s.now;
      const from = Math.floor(Math.random() * nodes.length);
      let best = -1;
      let bestD2 = dist2;
      for (let i = 0; i < nodes.length; i++) {
        if (i === from) continue;
        const dx = nodes[from].x - nodes[i].x;
        const dy = nodes[from].y - nodes[i].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD2) {
          bestD2 = d2;
          best = i;
        }
      }
      if (best >= 0) pulses.push({ from, to: best, t: 0 });
    }
    ctx!.fillStyle = `rgba(${COLOR_SIGNAL},${Math.min(1, 0.6 + gain * 0.4).toFixed(3)})`;
    for (let i = pulses.length - 1; i >= 0; i--) {
      const pulse = pulses[i];
      pulse.t += s.dt / 620;
      const a = nodes[pulse.from];
      const b = nodes[pulse.to];
      if (pulse.t >= 1 || !a || !b) {
        pulses.splice(i, 1);
        continue;
      }
      ctx!.fillRect(lerp(a.x, b.x, pulse.t) - 2, lerp(a.y, b.y, pulse.t) - 2, 4, 4);
    }
  }

  resize(true);

  return {
    resize,
    frame,
    formText,
    release,
    setGain(target: number) {
      gainTarget = target;
    },
  };
}
