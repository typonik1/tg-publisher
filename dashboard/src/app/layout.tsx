import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";

const NAV: [string, string, string][] = [
  ["/", "Обзор", "⌂"],
  ["/sources", "Источники", "◉"],
  ["/queue", "Очередь", "▤"],
  ["/schedule", "Расписание", "◷"],
  ["/ai", "AI", "✦"],
  ["/footer", "Подпись", "↗"],
  ["/own-posts", "Свои посты", "◆"],
  ["/activity", "Активность", "≋"],
];

export const metadata = {
  title: "tg-publisher · Control Center",
  description: "Панель управления tg-publisher",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen bg-app text-zinc-100">
          <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/5 bg-[#0a0d14]/95 p-5 backdrop-blur-xl lg:block">
            <div className="mb-8">
              <div className="mb-2 inline-flex rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                Telegram automation
              </div>
              <div className="text-xl font-bold tracking-tight text-white">tg-publisher</div>
              <div className="mt-1 text-xs text-zinc-500">Control Center · v1.2</div>
            </div>
            <nav className="space-y-1.5">
              {NAV.map(([href, label, icon]) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] text-xs text-zinc-500 transition group-hover:bg-violet-500/15 group-hover:text-violet-300">
                    {icon}
                  </span>
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
            <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.06] p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.7)]" />
                Панель подключена
              </div>
              <div className="mt-1 text-[11px] text-zinc-500">VK Cloud · Control API</div>
            </div>
          </aside>

          <header className="sticky top-0 z-20 border-b border-white/5 bg-[#090c12]/80 px-5 py-3 backdrop-blur-xl lg:hidden">
            <div className="font-semibold">tg-publisher</div>
          </header>

          <main className="min-h-screen px-5 py-7 lg:ml-64 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1500px]">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
