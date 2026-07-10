// 这个文件只负责「把指针位置换算成 3D 倾斜角度」，不读取 window 或 DOM。
// 把纯数学和浏览器事件分开有两个好处：
//   1. 计算逻辑可以直接在 Node 环境里做单元测试；
//   2. Hero 的鼠标移动不会把难测试的浏览器细节混进角度规则里。

// 元素在视口里的矩形信息。字段和 getBoundingClientRect() 中会用到的部分一致，
// 但这里只保留计算真正需要的四个数，避免让纯函数依赖 DOMRect。
export type TiltBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

// calculateTilt 的输入：指针的视口坐标、元素矩形，以及可选的最大倾角。
export type TiltInput = {
  pointerX: number;
  pointerY: number;
  bounds: TiltBounds;
  maxAngle?: number;
};

// 输出分别对应 CSS 的 rotateX 和 rotateY，单位由调用方补成 deg。
export type TiltResult = {
  rotateX: number;
  rotateY: number;
};

// 把数值限制在给定区间内。指针即使跑到元素外，也不会让甲板无限旋转。
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

// 把元素中心视为 (0, 0)：
//   - 指针向上，rotateX 为正；向下为负；
//   - 指针向右，rotateY 为正；向左为负。
// 默认最大 6°，既能看出景深，又不会让简历文字跟着大幅晃动。
export function calculateTilt({
  pointerX,
  pointerY,
  bounds,
  maxAngle = 6,
}: TiltInput): TiltResult {
  // 宽高为 0 或不是有效数字时无法归一化。直接回正，避免产生 Infinity / NaN
  // 并最终写进 CSS，导致整个 transform 声明失效。
  if (
    bounds.width <= 0 ||
    bounds.height <= 0 ||
    !Number.isFinite(bounds.width) ||
    !Number.isFinite(bounds.height)
  ) {
    return { rotateX: 0, rotateY: 0 };
  }

  // 先把指针在元素里的相对位置归一化到 0...1，再钳制越界值。
  const x = clamp((pointerX - bounds.left) / bounds.width, 0, 1);
  const y = clamp((pointerY - bounds.top) / bounds.height, 0, 1);

  return {
    // toFixed 后再转回 number，避免浮点运算产生一长串无意义小数写进 CSS。
    rotateX: Number(((0.5 - y) * maxAngle * 2).toFixed(4)),
    rotateY: Number(((x - 0.5) * maxAngle * 2).toFixed(4)),
  };
}
