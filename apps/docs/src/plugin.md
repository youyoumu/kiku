---
outline: deep
---

# Plugin

A Kiku plugin is a JavaScript module named `_kiku_plugin.js`.
This module must export a named variable called `plugin`.
The type definitions for this module are available [here](https://github.com/youyoumu/kiku/blob/main/packages/note/src/plugins/pluginTypes.ts).

:::info
In addition to the JavaScript module, you may include a `_kiku_plugin.css` file for custom plugin styling.
:::

<<< ../../../packages/note/src/plugins/pluginTypes.ts

The plugin system is currently very basic, but more APIs will be added in the future.

## ExternalLinks

If defined, this component will be mounted under the **Definition** section on the back side of the note, replacing the default `ExternalLinks`.

### Example

<<< ../../../packages/note/src/plugins/ExternalLinks.js

## Sentence

If defined, this component will replace the default `Sentence` component.

### Example

<<< ../../../packages/note/src/plugins/Sentence.js

## Footer

If defined, this component will replace the default `Footer` component.

### Example

<<< ../../../packages/note/src/plugins/Footer.js

## Pitch

If defined, this component will replace the default `Pitch` component.

### Example

<<< ../../../packages/note/src/plugins/Pitch.js

## onPluginLoad

This function is called when the plugin is loaded.

### Example

<<< ../../../packages/note/src/plugins/onPluginLoad.js

## onSettingsMount

This function is called when the settings page is mounted.

### Example

<<< ../../../packages/note/src/plugins/onSettingsMount.js
