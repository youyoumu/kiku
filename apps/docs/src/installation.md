---
outline: deep
---

# Installation

:::info
Kiku is designed to be compatible with [Lapis](https://github.com/donkuri/lapis), so the installation process is very similar. You can refer to their installation guide.
:::

::: warning
This documentation assumes you already know about Anki, Yomitan, and mining-stuff.
:::

## Installing notetype

Download the latest release `Kiku_v*.apkg` from [Release](https://github.com/youyoumu/kiku/releases/latest), and then import it to your Anki. After that the `Kiku` notetype should be available in your `Note Types` list.

## Yomitan Setup

Open your Yomitan settings, go to `Anki` > `Configure Anki flashcard`, select `Kiku` as the Model, and configure the following fields:

| Field                 | Value                                                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Expression            | `{expression}`                                                                                                                                             |
| ExpressionFurigana    | `{furigana-plain}`                                                                                                                                         |
| ExpressionReading     | `{reading}`                                                                                                                                                |
| ExpressionAudio       | `{audio}`                                                                                                                                                  |
| SelectionText         | `{popup-selection-text}`                                                                                                                                   |
| MainDefinition        | Something like `{single-glossary-jmdict/jitendex}`. Find this by clicking the down arrow next to this field, and finding a dictionary in a similar format. |
| DefinitionPicture     | Here you can include any image you'd like to use to help _illustrate_ the definition or the vocabulary term.                                               |
| Sentence              | `{cloze-prefix}<b>{cloze-body}</b>{cloze-suffix}`                                                                                                          |
| SentenceFurigana      |                                                                                                                                                            |
| SentenceAudio         |                                                                                                                                                            |
| Picture               |                                                                                                                                                            |
| Glossary              | `{glossary}`                                                                                                                                               |
| Hint                  |                                                                                                                                                            |
| IsWordAndSentenceCard |                                                                                                                                                            |
| IsClickCard           |                                                                                                                                                            |
| IsSentenceCard        |                                                                                                                                                            |
| IsAudioCard           |                                                                                                                                                            |
| PitchPosition         | `{pitch-accent-positions}`                                                                                                                                 |
| PitchCategories       | `{pitch-accent-categories}`                                                                                                                                |
| Frequency             | `{frequencies}`                                                                                                                                            |
| FreqSort              | `{frequency-harmonic-rank}`                                                                                                                                |
| MiscInfo              | `{document-title}` If you want your cards to include the title of the tab they were mined from, such as for light novels (LNs), please use this feature.   |

Credit to [Lapis](https://github.com/donkuri/lapis) for the table

## [Kiku Note Manager](https://ankiweb.net/shared/info/408592650?cb=1763445474367) addon

This addon is optional.
Currently this addon is only used to generate notes cache, so the Kanji View feature works across all platforms.
Install this addon, then go to `Tools` > `Kiku Note Manager` > `Generate notes cache`.
