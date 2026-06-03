"use client";

import { useState } from "react";

// 头像位：传了 src 就显示图片，没有（或图片加载失败）就显示占位文字。
// 想放头像：把图片放到 public/avatar.jpg，然后在 Hero 里传 src="/avatar.jpg"。
// （Next.js 里 public/ 下的文件，访问路径就是去掉 public 的根路径。）
export function ImageSlot({ src, placeholder }: { src?: string; placeholder: string }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return <div className="image-slot-empty">{placeholder}</div>;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img className="image-slot-img" src={src} alt="avatar" onError={() => setError(true)} />
  );
}
