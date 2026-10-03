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
  const [apiKey, setApiKey] = useState("");
  const [clearApiKey, setClearApiKey] = useState(false);
  const [prompt, setPrompt] = useState(initial?.ai_prompt ?? "");
  const [timeout_, setTimeout_] = useState(initial?.ai_timeout ?? 40);
  const [testText, setTestText] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const keyConfigured = !!initial?.api_key_configured;
  const keyMask = initial?.api_key?.mask ?? "";

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
          ...(apiKey.trim() ? { api_key: apiKey } : {}),
          ...(clearApiKey ? { clear_api_key: true } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `ошибка ${res.status}`);
      setApiKey("");
      setClearApiKey(false);
      setMsg("Настройки сохранены и уже используются ботом");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "ошибка");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card title="Подключение к нейросети">
        <form onSubmit={save} className="grid gap-5 md:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-200">
            <input className="mt-0.5" type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            <span>
              <span className="block font-medium">Использовать нейросеть</span>
              <span className="mt-1 block text-xs font-normal text-zinc-500">Бот будет улучшать подписи перед публикацией.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-200">
            <input className="mt-0.5" type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
            <span>
              <span className="block font-medium">Не публиковать при ошибке AI</span>
              <span className="mt-1 block text-xs font-normal text-zinc-500">Если выключено, бот опубликует исходную подпись.</span>
            </span>
          </label>

          <label className="text-sm text-zinc-300 md:col-span-2">
            Адрес API
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className={`mt-1.5 w-full ${INPUT}`}
            />
            <span className="mt-1 block text-xs text-zinc-500">Укажите адрес сервиса в формате OpenAI API, включая /v1. При смене сервиса введите новый ключ.</span>
          </label>

          <label className="text-sm text-zinc-300">
            Модель
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
              className={`mt-1.5 w-full ${INPUT}`}
            />
            <span className="mt-1 block text-xs text-zinc-500">Точное имя модели у выбранного сервиса.</span>
          </label>
          <label className="text-sm text-zinc-300">
            Максимальное время ответа
            <input
              type="number"
              min={5}
              max={300}
              value={timeout_}
              onChange={(e) => setTimeout_(Number(e.target.value))}
              className={`mt-1.5 w-full ${INPUT}`}
            />
            <span className="mt-1 block text-xs text-zinc-500">От 5 до 300 секунд.</span>
          </label>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4 md:col-span-2">
            <label className="text-sm text-zinc-300">
              API-ключ
              <input
                type="password"
                autoComplete="new-password"
                value={apiKey}
                disabled={clearApiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={keyConfigured ? "Оставьте пустым, чтобы сохранить текущий ключ" : "Вставьте API-ключ"}
                className={`mt-1.5 w-full ${INPUT} disabled:cursor-not-allowed disabled:opacity-50`}
              />
            </label>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className={keyConfigured ? "text-emerald-400" : "text-amber-400"}>
                {keyConfigured ? <>Ключ подключён: <span className="font-mono">{keyMask}</span></> : "Ключ ещё не задан"}
              </span>
              {keyConfigured && (
                <label className="flex cursor-pointer items-center gap-2 text-zinc-400">
                  <input
                    type="checkbox"
                    checked={clearApiKey}
                    onChange={(e) => {
                      setClearApiKey(e.target.checked);
                      if (e.target.checked) setApiKey("");
                    }}
                  />
                  Удалить сохранённый ключ
                </label>
              )}
            </div>
            <p className="mt-2 text-xs text-zinc-500">Ключ хранится на сервере. Панель показывает только последние 4 символа.</p>
          </div>

          <label className="text-sm text-zinc-300 md:col-span-2">
            Инструкция для нейросети
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className={`mt-1.5 w-full ${INPUT}`}
            />
            <span className="mt-1 block text-xs text-zinc-500">Опишите стиль, длину и правила для новых подписей.</span>
          </label>
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <button
              disabled={busy}
              className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-500 disabled:opacity-50"
            >
              {busy ? "Сохраняем…" : "Сохранить настройки"}
            </button>
            {msg && <span className="text-xs text-emerald-400">{msg}</span>}
            {err && <span className="text-xs text-red-400">{err}</span>}
          </div>
        </form>
      </Card>

      <Card title="Проверка подключения">
        <p className="mb-3 text-sm text-zinc-400">Отправьте пробный текст. Бот ничего не опубликует, а только проверит настройки.</p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Например: Сделай короткую подпись"
            className={`min-w-64 flex-1 ${INPUT}`}
          />
          <ActionButton path="ai/test" body={{ text: testText }} label="Отправить тест" variant="primary" doneLabel="Нейросеть ответила" />
        </div>
      </Card>
    </div>
  );
}
