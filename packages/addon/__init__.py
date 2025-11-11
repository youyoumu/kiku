from aqt import mw
from aqt.qt import QAction, QMenu, qconnect
from aqt.utils import showInfo
from aqt.operations import QueryOp
from anki.collection import Collection
import json, os, gzip, time, traceback
from datetime import datetime


def export_notes_background(col: Collection) -> str:
    """Runs in background thread; returns manifest path when done."""

    config = mw.addonManager.getConfig(__name__)
    if not config:
        raise Exception("Add-on config not found.")

    chunk_count = int(config.get("chunk_count", 10))
    show_progress = bool(config.get("show_progress", True))

    db = col.db
    if not db:
        raise Exception("No database open.")

    profile_name = mw.pm.name
    media_dir = col.media.dir()

    note_ids = db.list("SELECT id FROM notes")
    total = len(note_ids)
    if total == 0:
        raise Exception("No notes found.")

    chunks = {i: [] for i in range(chunk_count)}
    stats = {i: {"count": 0, "min": None, "max": None} for i in range(chunk_count)}

    last_progress = 0
    processed = 0

    for nid in note_ids:
        note = col.get_note(nid)
        model = note.note_type()
        if not model:
            continue
        model_name = model["name"]

        card_ids = db.list("SELECT id FROM cards WHERE nid=?", nid)

        field_objs = {
            f["name"]: {"order": order, "value": note.fields[order]}
            for order, f in enumerate(model["flds"])
        }

        note_json = {
            "cards": card_ids,
            "fields": field_objs,
            "mod": note.mod,
            "modelName": model_name,
            "noteId": note.id,
            "profile": profile_name,
            "tags": note.tags,
        }

        chunk_index = note.id % chunk_count
        chunks[chunk_index].append(note_json)

        s = stats[chunk_index]
        s["count"] += 1
        s["min"] = note.id if s["min"] is None else min(s["min"], note.id)
        s["max"] = note.id if s["max"] is None else max(s["max"], note.id)

        processed += 1
        now = time.time()
        if show_progress and now - last_progress >= 0.1:
            percent = (processed / total) * 100
            mw.taskman.run_on_main(
                lambda: mw.progress.update(
                    label=f"Exporting notes... {processed}/{total} ({percent:.1f}%)",
                    value=processed,
                    max=total,
                )
            )
            last_progress = now

    # chunk writing progress
    total_chunks = len([c for c in chunks.values() if c])
    written = 0
    total_notes = 0
    manifest_chunks = []

    for i, chunk_data in chunks.items():
        if not chunk_data:
            continue
        filename = f"_kiku_notes_{i}.json.gz"
        chunk_path = os.path.join(media_dir, filename)
        with gzip.open(chunk_path, "wt", encoding="utf-8") as f:
            json.dump(chunk_data, f, ensure_ascii=False)
        total_notes += len(chunk_data)
        manifest_chunks.append(
            {
                "file": filename,
                "count": stats[i]["count"],
                "range": [stats[i]["min"], stats[i]["max"]],
            }
        )
        written += 1
        if show_progress:
            mw.taskman.run_on_main(
                lambda i=i,
                written=written,
                total_chunks=total_chunks: mw.progress.update(
                    label=f"Writing chunks... {written}/{total_chunks} ({(written / total_chunks) * 100:.1f}%)",
                    value=written,
                    max=total_chunks,
                )
            )

    manifest = {
        "profile": profile_name,
        "totalNotes": total_notes,
        "chunkCount": chunk_count,
        "chunks": manifest_chunks,
        "generatedAt": datetime.now().timestamp() * 1000,
    }

    manifest_path = os.path.join(media_dir, "_kiku_notes_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    return f"✅ Exported {total_notes} notes in {total_chunks} chunks.\nManifest: {manifest_path}"


def on_export_success(message: str):
    showInfo(message)


def on_export_failed(exc: Exception):
    showInfo(f"❌ Failed to export notes:\n{exc}\n\n{traceback.format_exc()}")


def export_notes_json():
    config = mw.addonManager.getConfig(__name__)
    if not config:
        raise Exception("Add-on config not found.")
    show_progress = bool(config.get("show_progress", True))

    op = QueryOp(
        parent=mw,
        op=lambda col: export_notes_background(col),
        success=on_export_success,
    )

    if show_progress:
        op = op.with_progress(label="Exporting notes...")

    op.failure(on_export_failed)
    op.run_in_background()


def add_menu_item():
    # Create submenu under Tools
    kiku_menu = QMenu("Kiku Note Manager", mw)
    mw.form.menuTools.addMenu(kiku_menu)

    # Add Export JSON action inside submenu
    export_action = QAction("Export Notes JSON (with optional progress)", mw)
    qconnect(export_action.triggered, export_notes_json)
    kiku_menu.addAction(export_action)


add_menu_item()
