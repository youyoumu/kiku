from aqt.qt import QAction, QMenu, qconnect
from aqt import mw
import os

from .export_notes import export_notes_json
from .delete_media import confirm_and_delete_kiku_media


def add_menu_item():
    addon_dir = os.path.dirname(__file__)
    is_dev = os.path.exists(os.path.join(addon_dir, "..", ".env"))

    menu_name = "Kiku Note Manager (dev)" if is_dev else "Kiku Note Manager"
    kiku_menu = QMenu(menu_name, mw)
    mw.form.menuTools.addMenu(kiku_menu)

    # 1. Export notes action
    export_action = QAction("Generate notes cache", mw)
    qconnect(export_action.triggered, export_notes_json)
    kiku_menu.addAction(export_action)

    # 2. New "Clean media files" action
    clean_media_action = QAction("Delete Kiku files", mw)

    def handle_clean_media():
        sample_list = ["_kiku_front.html"]
        confirm_and_delete_kiku_media(sample_list)

    qconnect(clean_media_action.triggered, handle_clean_media)
    kiku_menu.addAction(clean_media_action)

