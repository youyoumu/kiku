---
outline: deep
---

# Updating Kiku

Download the latest `Kiku_v*.apkg` from the [Release page](https://github.com/youyoumu/kiku/releases).

Before importing the `.apkg`, you need to delete all existing [Kiku files](./how-things-work.md#kiku-files).  
This is required because Anki will not overwrite files that already exist.

You may keep `_kiku_config.json` and `_kiku_plugin.js`.

After that, import the `.apkg` into Anki as usual.

::: info
If you choose to keep `_kiku_config.json`, make sure to open the settings page and click **Save** after updating it.
This ensures that the settings in the Front/Back/Styling templates are synced with your configuration.
:::

::: tip
You can delete all Kiku files except `_kiku_config.json` and `_kiku_plugin.js` by using Kiku Note Manager.
Go to `Tools` > `Kiku Note Manager` > `Delete Kiku files`
:::
