import { pubFetch } from "@/lib/api";
import ActionButton from "@/components/ActionButton";
import { Empty, ErrorBox, PageHeader, Td, Th } from "@/components/ui";
import RepostButton from "@/components/RepostButton";
import MediaPreview from "@/components/MediaPreview";
import { excerpt, fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OwnPostsPage() {
  let data: any = { items: [], total: 0 };
  let error = "";
  try {
    data = await pubFetch("/api/own?limit=50");
  } catch (e: any) {
    error = e?.message ?? "нет связи с Control API";
  }
  const items: any[] = data?.items ?? [];

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Контент" title={`Архив канала · ${data?.total ?? 0}`} description="Опубликованные ранее материалы. Лучшие из них можно безопасно отправить повторно." action={<ActionButton path="own/scan" label="Обновить архив" variant="primary" doneLabel="архив обновлён" />} />
      {error && <ErrorBox message={error} />}

      {items.length === 0 && !error ? (
        <Empty>
          Архив пока пуст. Нажмите «Обновить архив» или дождитесь автоматической проверки канала.
        </Empty>
      ) : (
        <div className="table-wrap">
          <table className="w-full">
            <thead>
              <tr>
                <Th>Картинка</Th>
                <Th>Дата</Th>
                <Th>Реакции</Th>
                <Th>Просмотры</Th>
                <Th>Репосты</Th>
                <Th>Последний репост</Th>
                <Th>Текст</Th>
                <Th>Действия</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.group_key}>
                  <Td><MediaPreview postId={o.group_key} thumbnail src={`/api/dash/own/preview?group_key=${encodeURIComponent(o.group_key)}`} /></Td>
                  <Td className="whitespace-nowrap text-xs text-zinc-500">{fmtDate(o.post_date)}</Td>
                  <Td>{o.reactions ?? 0}</Td>
                  <Td>{o.views ?? 0}</Td>
                  <Td>{o.forwards ?? 0}</Td>
                  <Td className="whitespace-nowrap text-xs text-zinc-500">{fmtDate(o.last_reposted_at)}</Td>
                  <Td className="max-w-[280px] text-xs text-zinc-400">{excerpt(o.text)}</Td>
                  <Td>
                    <RepostButton groupKey={o.group_key} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-zinc-500">
        Материалы отсортированы по реакциям. Повторная публикация проходит через обычную очередь и сохраняет защиту от дублей.
      </p>
    </div>
  );
}
