from aqt import mw
from aqt.utils import showInfo, askUserDialog
import os


def confirm_and_delete_kiku_media(files_to_delete: list[str]):
    """
    Shows a confirmation dialog listing files to delete.
    Deletes them only if the user confirms.
    """

    if not files_to_delete:
        showInfo("No Kiku media files detected.")
        return
    col = mw.col
    if not col:
        raise Exception("No collection open.")
    media_dir = col.media.dir()

    # Build display list (sorted, bullet points)
    file_list_str = "\n".join(f"- {name}" for name in sorted(files_to_delete))

    message = (
        "<b>The following Kiku files will be deleted:</b><br><br>"
        f"<pre>{file_list_str}</pre>"
        "<br>"
        "<b>⚠ Important:</b><br>"
        "After deleting these files, Kiku note types will be <b>broken</b><br>"
        "until you re-import the new <code>Kiku_v*.apkg</code>.<br><br>"
        "Do you want to continue?"
    )

    dlg = askUserDialog(message, buttons=["Delete", "Cancel"])
    if dlg.run() != "Delete":
        return

    # Perform actual deletion
    removed = []
    skipped = []

    for filename in files_to_delete:
        full_path = os.path.join(media_dir, filename)
        if os.path.exists(full_path):
            try:
                os.remove(full_path)
                removed.append(filename)
            except Exception:
                skipped.append(filename)
        else:
            skipped.append(filename)

    summary = (
        f"🗑 Deleted {len(removed)} file(s).\n"
        f"❗ {len(skipped)} file(s) skipped (not found or failed)."
    )

    showInfo(summary)
