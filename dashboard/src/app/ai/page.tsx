import { pubFetch } from "@/lib/api";
import { ErrorBox } from "@/components/ui";
import AiForm from "@/components/AiForm";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  let data: any = null;
  let error = "";
  try {
    data = await pubFetch("/api/ai");
  } catch (e: any) {
    error = e?.message ?? "нет связи с Control API";
  }
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Нейросеть</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Подключите AI-сервис, выберите модель и настройте, как бот будет переписывать подписи.
        </p>
      </div>
      {error ? <ErrorBox message={error} /> : <AiForm initial={data} />}
    </div>
  );
}
