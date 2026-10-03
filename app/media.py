"""Re-upload source media without guessing document types from filenames."""
from telethon.tl import types as t


def album_kind(msg):
    if isinstance(msg.media, t.MessageMediaPhoto):
        return "visual"
    attrs = msg.document.attributes
    if any(isinstance(a, (t.DocumentAttributeAnimated, t.DocumentAttributeSticker)) for a in attrs):
        return None
    for a in attrs:
        if isinstance(a, t.DocumentAttributeVideo):
            return None if a.round_message else "visual"
        if isinstance(a, t.DocumentAttributeAudio):
            return None if a.voice else "audio"
    return "document"


async def prepare_media(client, msg, path):
    file = await client.upload_file(path)
    spoiler = getattr(msg.media, "spoiler", None)
    if isinstance(msg.media, t.MessageMediaPhoto):
        return t.InputMediaUploadedPhoto(file, spoiler=spoiler)
    doc = msg.document
    return t.InputMediaUploadedDocument(
        file, mime_type=doc.mime_type, attributes=list(doc.attributes),
        spoiler=spoiler, nosound_video=True if album_kind(msg) == "visual" else None,
    )


def media_batches(items):
    """Keep order; albums contain <=10 items of a compatible Telegram kind."""
    batch, previous = [], None
    for media, kind in items:
        if batch and (kind is None or kind != previous or len(batch) == 10):
            yield batch
            batch = []
        batch.append(media)
        previous = kind
        if kind is None:
            yield batch
            batch = []
    if batch:
        yield batch
