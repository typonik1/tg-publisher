"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, INPUT } from "@/components/ui";
import { fmtDate } from "@/lib/format";

const FIELDS: [string, string, string][] = [
  ["candidate_min_age_min", "Минимальный возраст нового поста, минут", "Более свежие материалы ещё не попадут в публикацию."],
  ["max_post_age_hours", "Максимальный возраст нового поста, часов", "Более старые материалы бот пропустит."],
  ["best_min_score", "Минимальный рейтинг материала", "Чем выше значение, тем строже отбор по просмотрам и реакциям."],
  ["baseline_days", "Период сравнения источника, дней", "Статистика канала за этот период используется для оценки поста."],
  ["own_min_age_days", "Возраст поста из архива, дней", "Для повторной публикации берутся материалы не моложе этого срока."],
  ["repost_cooldown_days", "Перерыв между повторами, дней", "Один и тот же архивный пост не появится раньше указанного срока."],
  ["collect_interval", "Проверять источники каждые, секунд", "Как часто бот ищет новые материалы."],
];

export default function ScheduleForm({ initial }: { initial: any }) {
  const s = initial?.settings ?? {};
  const [tz, setTz] = useState(s.tz_name ?? "Europe/Moscow");
  const [times, setTimes] = useState((s.publish_times ?? []).join(", "));
  const [pattern, setPattern] = useState((s.schedule_pattern ?? []).join(","));
  const [nums, setNums] = useState<Record<string, number>>({
    candidate_min_age_min: s.candidate_min_age_min ?? 120,
    max_post_age_hours: s.max_post_age_hours ?? 48,
    best_min_score: s.best_min_score ?? 1,
    baseline_days: s.baseline_days ?? 7,
    own_min_age_days: s.own_min_age_days ?? 14,
    repost_cooldown_days: s.repost_cooldown_days ?? 60,
    collect_interval: s.collect_interval ?? 300,
  });
  const [paused, setPaused] = useState(!!s.publishing_paused);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/dash/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tz_name: tz,
          publish_times: times.split(",").map((x: string) => x.trim()).filter(Boolean),
          schedule_pattern: pattern.split(",").map((x: string) => x.trim()).filter(Boolean),
          ...nums,
          publishing_paused: paused,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `ошибка ${res.status}`);
      setMsg("Настройки сохранены и уже применяются.");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "ошибка");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card title="Следующая публикация" description="Текущий план по сохранённым настройкам.">
        <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
          <div>
            <div className="text-xs text-slate-500">Дата и время</div>
            <b className="mt-1 block">{initial?.next_slot ? fmtDate(initial.next_slot) : "Не запланирована"}</b>
          </div>
          <div><div className="text-xs text-slate-500">Материал</div><b className="mt-1 block">{initial?.next_kind === "old" ? "Лучший пост из архива" : initial?.next_kind === "parsed" ? "Новый пост из источников" : "Не определён"}</b></div>
          <div><div className="text-xs text-slate-500">Шаг последовательности</div><b className="mt-1 block">{(initial?.pattern_index ?? 0) + 1}</b></div>
        </div>
      </Card>

      <Card title="Время и порядок" description="Укажите время в формате 09:30. Несколько значений разделяйте запятыми.">
        <form onSubmit={save} className="grid gap-5 md:grid-cols-2">
          <label className="field-label">
            Часовой пояс
            <input value={tz} onChange={(e) => setTz(e.target.value)} className={`w-full ${INPUT}`} />
            <span className="field-help">Например: Europe/Moscow.</span>
          </label>
          <label className="field-label">
            Время публикаций
            <input value={times} onChange={(e) => setTimes(e.target.value)} className={`w-full ${INPUT}`} />
            <span className="field-help">Например: 09:00, 14:30, 20:00.</span>
          </label>
          <label className="field-label">
            Последовательность материалов
            <select value={pattern} onChange={(e) => setPattern(e.target.value)} className={`w-full ${INPUT}`}>
              <option value="parsed">Только новые посты</option>
              <option value="old">Только лучшие посты из архива</option>
              <option value="parsed,old">Новый → из архива</option>
              <option value="parsed,parsed,old">Два новых → один из архива</option>
              {!['parsed', 'old', 'parsed,old', 'parsed,parsed,old'].includes(pattern) && <option value={pattern}>Текущая особая последовательность</option>}
            </select>
            <span className="field-help">Бот повторяет выбранный порядок по кругу. Если нужного материала нет, он попробует другой тип.</span>
          </label>
          <label className="flex min-h-20 items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-950/30 p-4 text-sm text-slate-200">
            <input type="checkbox" checked={paused} onChange={(e) => setPaused(e.target.checked)} className="mt-0.5 h-4 w-4 accent-teal-500" />
            <span><b className="block">Приостановить автопубликацию</b><span className="mt-1 block text-xs leading-5 text-slate-400">Бот продолжит проверять источники и собирать материалы, но не будет публиковать их.</span></span>
          </label>
          <div className="md:col-span-2 mt-1 border-t border-slate-700/40 pt-5"><h3 className="text-sm font-semibold text-slate-100">Правила отбора</h3><p className="mt-1 text-xs text-slate-400">Настройте свежесть и качество материалов. Текущие значения подходят для большинства каналов.</p></div>
          {FIELDS.map(([k, label, help]) => (
            <label key={k} className="field-label">
              {label}
              <input
                type="number"
                step="any"
                value={nums[k]}
                onChange={(e) => setNums({ ...nums, [k]: Number(e.target.value) })}
                className={`w-full ${INPUT}`}
              />
              <span className="field-help">{help}</span>
            </label>
          ))}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-700/40 pt-5 md:col-span-2">
            <button
              disabled={busy}
              className="button-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Сохраняем…" : "Сохранить расписание"}
            </button>
            {msg && <span role="status" className="text-xs text-emerald-300">{msg}</span>}
            {err && <span role="alert" className="text-xs text-red-300">{err}</span>}
          </div>
        </form>
      </Card>
    </div>
  );
}
