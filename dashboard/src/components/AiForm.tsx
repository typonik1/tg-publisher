"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ActionButton from "@/components/ActionButton";
import { Card, INPUT } from "@/components/ui";

export default function AiForm({ initial }: { initial: any }) {
  const [enabled, setEnabled] = useState(!!initial?.ai_enabled);
  const [required, setRequired] = useState(!!initial?.ai_required);
  const [baseUrl, setBaseUrl] = useState(initial?.ai_base_url ?? "");
  const [model, setModel] = useState(initial?.ai_model ?? "");
  const [prompt, setPrompt] = useState(initial?.ai_prompt ?? "");
  const [timeout_, setTimeout_] = useState(initial?.ai_timeout ?? 40);
  const [apiKey, setApiKey] = useState("");
  const [clearKey, setClearKey] = useState(false);
  const [testText, setTestText] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const key = initial?.api_key ?? { configured: false, mask: "" };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/dash/ai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ai_enabled: enabled,
          ai_required: required,
          ai_base_url: baseUrl,
          ai_model: model,
          ai_prompt: prompt,
          ai_timeout: Number(timeout_),
          ...(apiKey.trim() ? { api_key: apiKey.trim() } : {}),
          ...(clearKey ? { clear_api_key: true } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `ошибка ${res.status}`);
      setApiKey("");
      setClearKey(false);
      setMsg("сохранено — действует сразу, без рестарта");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "ошибка");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card title="API-ключ">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <label className="text-xs text-zinc-400">
            Новый API key
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                if (e.target.value) setClearKey(false);
              }}
              placeholder={key.configured ? `Сейчас: ${key.mask} · оставь пустым, чтобы не менять` : "Вставь API key"}
              className={`mt-1 w-full ${INPUT}`}
              autoComplete="off"
            />
          </label>
          <label className="flex items-center gap-2 pb-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={clearKey}
              onChange={(e) => {
                setClearKey(e.target.checked);
                if (e.target.checked) setApiKey("");
              }}
            />
            удалить сохранённый ключ
          </label>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Новый ключ из панели хранится в защищённом файле volume на сервере, не в PostgreSQL и не возвращается браузеру.
          {key.configured ? <> Текущий: <span className="font-mono text-zinc-300">{key.mask}</span>.</> : " Сейчас ключ не задан."}
        </p>
      </Card>

      <Card title="Параметры AI">
        <form onSubmit={save} className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            AI включён
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
            Обязателен (AI_REQUIRED: сбой блокирует публикацию)
          </label>
          <label className="text-xs text-zinc-500">
            Base URL
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className={`w-full ${INPUT}`} />
          </label>
          <label className="text-xs text-zinc-500">
            Модель
            <input value={model} onChange={(e) => setModel(e.target.value)} className={`w-full ${INPUT}`} />
          </label>
          <label className="text-xs text-zinc-500">
            Таймаут, сек (5..300)
            <input
              type="number"
              value={timeout_}
              onChange={(e) => setTimeout_(Number(e.target.value))}
              className={`w-full ${INPUT}`}
            />
          </label>
          <label className="text-xs text-zinc-500 md:col-span-2">
            Промпт
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className={`w-full ${INPUT}`}
            />
          </label>
          <div className="flex items-center gap-3 md:col-span-2">
            <button
              disabled={busy}
              className="rounded border border-sky-700 bg-sky-800 px-3 py-1.5 text-sm hover:bg-sky-700 disabled:opacity-50"
            >
              {busy ? "сохранение…" : "Сохранить"}
            </button>
            {msg && <span className="text-xs text-emerald-400">{msg}</span>}
            {err && <span className="text-xs text-red-400">{err}</span>}
          </div>
        </form>
      </Card>

      <Card title="Проверить AI (без публикации)">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="текст для теста (необязательно)"
            className={`w-96 ${INPUT}`}
          />
          <ActionButton path="ai/test" body={{ text: testText }} label="Проверить AI" variant="primary" doneLabel="AI ответил" />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Если AI_REQUIRED выключен, сбой AI не блокирует публикацию — уйдёт оригинальная подпись.
        </p>
      </Card>
    </div>
  );
}
