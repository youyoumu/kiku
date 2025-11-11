from aqt import mw
from aqt.qt import QAction, qconnect
from aqt.utils import showInfo
import json
import os
import gzip
import traceback
from datetime import datetime


def export_notes_json():
    col = mw.col
    if not col:
        raise Exception("No collection open.")
    db = col.db
    if not db:
        raise Exception("No database open.")

    try:
        profile_name = mw.pm.name
        media_dir = col.media.dir()

        # Prepare 10 buckets
        chunks = {i: [] for i in range(10)}
        stats = {i: {"count": 0, "min": None, "max": None} for i in range(10)}

        for nid in db.list("SELECT id FROM notes"):
            note = col.get_note(nid)
            model = note.note_type()
            if not model:
                continue  # skip notes without a model
            model_name = model["name"]

            # Get all card IDs for this note
            card_ids = db.list("SELECT id FROM cards WHERE nid=?", nid)

            # Build field map
            field_objs = {}
            for order, f in enumerate(model["flds"]):
                name = f["name"]
                value = note.fields[order] if order < len(note.fields) else ""
                field_objs[name] = {"order": order, "value": value}

            note_json = {
                "cards": card_ids,
                "fields": field_objs,
                "mod": note.mod,
                "modelName": model_name,
                "noteId": note.id,
                "profile": profile_name,
                "tags": note.tags,
            }

            # Determine chunk based on noteId % 10
            chunk_index = note.id % 10
            chunks[chunk_index].append(note_json)

            # Update stats
            s = stats[chunk_index]
            s["count"] += 1
            s["min"] = note.id if s["min"] is None else min(s["min"], note.id)
            s["max"] = note.id if s["max"] is None else max(s["max"], note.id)

        # Write and compress each chunk
        total_notes = 0
        manifest_chunks = []

        for i in range(10):
            chunk_data = chunks[i]
            if not chunk_data:
                continue  # skip empty chunks

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

        # Write manifest
        manifest = {
            "profile": profile_name,
            "totalNotes": total_notes,
            "chunks": manifest_chunks,
            "generatedAt": datetime.now().timestamp() * 1000,
        }

        manifest_path = os.path.join(media_dir, "_kiku_notes_manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)

        showInfo(
            f"✅ Exported {total_notes} notes into 10 gzipped chunk files and manifest:\n{manifest_path}"
        )

    except Exception as e:
        showInfo(f"❌ Failed to export notes:\n{e}\n\n{traceback.format_exc()}")


def add_menu_item():
    action = QAction("Export Notes JSON (Split + Gzip + Manifest)", mw)
    qconnect(action.triggered, export_notes_json)
    mw.form.menuTools.addAction(action)


add_menu_item()
