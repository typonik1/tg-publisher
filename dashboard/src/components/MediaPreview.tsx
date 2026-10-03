"use client";

import { useState } from "react";

export default function MediaPreview({ postId, compact = false }: { postId: number | string; compact?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [missing, setMissing] = useState(false);

  return (
    <div className={`relative overflow-hidden border border-slate-700/50 bg-slate-950/50 ${compact ? "h-16 w-20 rounded-lg" : "aspect-video w-full rounded-xl"}`}>
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center px-2 text-center text-[10px] leading-4 text-slate-500">
          {missing ? "Нет изображения" : "Загрузка…"}
        </div>
      )}
      {!missing && (
        // Обычный img нужен для защищённого same-origin proxy, а не для внешнего URL.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/dash/posts/${postId}/preview`}
          alt={`Изображение публикации №${postId}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setMissing(true)}
          className={`h-full w-full object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
