---
outline: deep
---

# Field Grouping

## Group Manually

Suppose you already have a normal note with **Picture**, **Sentence**, and
**SentenceAudio** fields like this:
::: details Fields {open}

Picture:

```html
<img src="gochuumon_wa_usagi_desuka.mkv_957803.webp" />
```

Sentence:

```html
このお店に<b>貢献</b>するために―
```

SentenceAudio:

```html
[sound:Gochuumon wa Usagi Desuka S01E09 9092049A.mkv_955687.289_958481.289.mp3]
```

:::

<img src="/media/field-grouping-1.2.png" alt="field grouping normal" style="max-width: 100%;">

---

And you want to add a new **Picture**, **Sentence**, and **SentenceAudio** to the same note.
Without grouping, it will look like this:

::: details Fields {open}

Picture:

```html
<img src="Tate_no_Yuusha_no_NariagariS3-20.mkv_1190221.jpeg" />
<img src="gochuumon_wa_usagi_desuka.mkv_957803.webp" />
```

Sentence:

```html
どうせ勇者の捕縛に<b>貢献</b>すれば➡
<br />
このお店に<b>貢献</b>するために―
```

SentenceAudio:

<!-- prettier-ignore -->
```html
[sound:Tate no Yuusha no Nariagari S3 - 10.mkv_118779.mp3]
[sound:Gochuumon wa Usagi Desuka S01E09 9092049A.mkv_955687.289_958481.289.mp3]
```

:::

The pictures will be paginated, while everything else will simply be appended.

<video controls autoplay loop>
  <source src="/media/field-grouping-2.2.webm" type="video/webm" />
</video>

---

Now, to group the fields together, all you need to do is add a `data-group-id` to the `<img>` tag, and wrap the new Sentence/SentenceAudio in a `<span>` with the same `data-group-id`.

::: details Fields {open}

Picture:

```html
<img data-group-id="10" src="Tate_no_Yuusha_no_NariagariS3-20.mkv_1190221.jpeg" />
<img src="gochuumon_wa_usagi_desuka.mkv_957803.webp" />
```

Sentence:

```html
<span data-group-id="10"> どうせ勇者の捕縛に<b>貢献</b>すれば➡ </span>
このお店に<b>貢献</b>するために―
```

SentenceAudio:

```html
<span data-group-id="10"> [sound:Tate no Yuusha no Nariagari S3 - 10.mkv_118779.mp3] </span>
[sound:Gochuumon wa Usagi Desuka S01E09 9092049A.mkv_955687.289_958481.289.mp3]
```

:::

<video controls>
  <source src="/media/field-grouping-3.2.webm" type="video/webm" />
</video>

## More Info

- The `data-group-id` value should be a positive integer. Kiku will sort them in descending order.
- If `data-group-id` is a [Unix Timestamp](https://www.unixtimestamp.com/) between year 2000 and 2100, it will be displayed as a date.
- Each unique `data-group-id` will create a new page.
- Anything without a `data-group-id` will be shown on the same page.
- **SentenceFurigana**, **SentenceTranslation** and **MiscInfo** fields will also be grouped.

## Merge Context Button

You can use Kiku's Merge Context button to merge fields from 2 different notes into one.
The button is available on the top left corner when you visit nested notes.

<video controls>
  <source src="/media/merge-context.mp4" type="video/mp4" />
</video>

- AnkiConnect is required, and **Prefer AnkiConnect** must be enabled in the settings.
- Ungrouped fields from both notes will be grouped with their own NoteID as the `data-group-id`.
- Existing `data-group-id` will be preserved.
- **Picture**, **Sentence**, **SentenceFurigana**, **SentenceTranslation**, **SentenceAudio**, **MiscInfo** and **Tag** will be merged.
- If either note has empty **SentenceFurigana**, the target note's **SentenceFurigana** will be updated as empty.
- Some special tags like `leech`, `marked`, `potential_leech` will not be added to the target note.
- "Delete Root Note" option will be available when the root note is less than 1 day old. This option will delete the root note after merging.

## Unindexed group

If you want to automatically add notes through anki-connect (for example using yomitan), it's not easy to know which id to use to not overlap with any existing ids.
In that case, you can use `data-group-id="unindexed"`.

- Each group with id "unindexed" will be considered different.
- Unindexed group are rendered sequentialy *after* explicitly indexed group
- The n-th unindexed group of one field is matched with the n-th unindexed group of the other fields.
- Therefore, there should be the same number of unindexed group in each field, if you want an empty field, you can create an empty span or image with the `data-group-id="unindexed"`.

A card could look like this:

::: details Fields {open}

Picture:

```html
<img data-group-id="unindexed" src="shadow_house_screenshot_2026-07-03-14-23-59-392.jpeg">
<img data-group-id="10" src="SubsPlease%20Tate%20no%20Yuusha%20no%20Nariagari%20S3%20-%2010%20(1080p)%20BCA53DD5.mkv_1190221.jpeg">
<img data-group-id="unindexed" src="Anime_Time_Solo_Leveli_928960_pzThqpQf.jpeg">
<img src="cbt%20gochuumon%20wa%20usagi%20desuka%20s01e09%20bdrip%201920x1080%20x264%20flac%209092049a.mkv_957803.webp">
```

Sentence:

```html
<span data-group-id="unindexed">偉大[いだい]なるおじいさまにもっと 貢献[こうけん]せねば</span>
<span data-group-id="10">どうせ 勇者[ゆうしゃ]の 捕縛[ほばく]に<b> 貢献[こうけん]</b>すれば➡</span>
<span data-group-id="unindexed">これで  少[すこ]しは<br> 世[よ]の 中[なか]に<b> 貢献[こうけん]</b>できるかな</span>
このお 店[たな,みせ]に<b> 貢献[こうけん]</b>するために―
```

SentenceAudio:

```html
<span data-group-id="unindexed"></span>
<span data-group-id="10">[sound:SubsPlease Tate no Yuusha no Nariagari S3 - 10 (1080p) BCA53DD5.mkv_118779-a512c7dd2b6572854ecfd7760d9f297cea529b66.mp3]</span>
<span data-group-id="unindexed">[sound:Anime_Time_Solo_Leveli_925842_K4AlcB99.mp3]</span>
[sound:CBT Gochuumon wa Usagi Desuka S01E09 BDrip 1920x1080 x264 FLAC 9092049A.mkv_955687.289_958481.289.mp3]
```

:::

## Yomitan Setup

Yomitan supports prepending/overwriting/appending to existing cards. We can configure it to use unindexed ids in order to automatically group the fields.

1. Open your Yomitan settings, you will first need to enable advanced options in the bottom left corner

2. Now, go to `Anki` > `Check for duplicates`, change the dropdown `When a duplicate is detected` to `allow overwriting`

3. To inject the `data-group-id` attribute into the images created by the `{screenshot}` and `{clipboard-image}`, we need to add our own handlebar code to yomitan.
    - Go to `Anki` > `Customize handlebars templates…`,
    - Scroll down,
    - paste the following code *before* <code v-pre>{{~> (lookup . "marker") ~}}</code>

    ```
    {{#*inline "clipboard-image-unindexed"}}
        {{~#if (hasMedia "clipboardImage")~}}
            <img data-group-id="unindexed" src="{{getMedia "clipboardImage"}}"/>
        {{~else~}}
            <img data-group-id="unindexed"/>
        {{~/if~}}
    {{/inline}}
    
    {{#*inline "screenshot-unindexed"}}
        {{~#if (hasMedia "screenshot")~}}
            <img data-group-id="unindexed" src="{{getMedia "screenshot"}}"/>
        {{~else~}}
            <img data-group-id="unindexed"/>
        {{~/if~}}
    {{/inline}}
    ```

    Now, we can use `{clipboard-image-unindexed}` and `{screenshot-unindexed}`.

4. Finally, open `Anki` > `Configure Anki flashcard`, select `Kiku` as the Model, select your deck, and configure the following fields:


| Field                 | Value                                                                                          |   Overwrite    |
| --------------------- | -----------------------------------------------------------------------------------------------|----------------|
| Expression            | `{expression}`                                                                                 | Fill if empty  |
| ExpressionFurigana    | `{furigana-plain}`                                                                             | Fill if empty  |
| ExpressionReading     | `{reading}`                                                                                    | Fill if empty  |
| ExpressionAudio       | `{audio}`                                                                                      | Fill if empty  |
| RelatedExpression     | (leave empty)                                                                                  | Skip           |
| SelectionText         | `{popup-selection-text}`                                                                       | Prepend        |
| MainDefinition        | Something like `{single-glossary-jmdict/jitendex}`                                             | Fill if empty  |
| DefinitionPicture     | (leave empty)                                                                                  | Fill if empty  |
| Sentence              | `<span data-group-id="unindexed">{cloze-prefix}<b>{cloze-body}</b>{cloze-suffix}</span>`       | Prepend        |
| SentenceFurigana      | `<span data-group-id="unindexed">{sentence-furigana-plain}</span>`                             | Prepend        |
| SentenceTranslation   | `<span data-group-id="unindexed"></span>`                                                      | Prepend        |
| SentenceAudio         | `<span data-group-id="unindexed"></span>`                                                      | Prepend        |
| Picture               | `{screenshot-unindexed}` OR `{clipboard-image-unindexed}` OR `<img data-group-id="unindexed">` | Prepend        |
| Glossary              | `{glossary}`                                                                                   | Fill if empty  |
| Hint                  | (leave empty)                                                                                  | Skip           |
| IsWordAndSentenceCard | (leave empty)                                                                                  | Skip           |
| IsClickCard           | (leave empty)                                                                                  | Skip           |
| IsSentenceCard        | (leave empty)                                                                                  | Skip           |
| IsAudioCard           | (leave empty)                                                                                  | Skip           |
| PitchPosition         | `{pitch-accent-positions}`                                                                     | Fill if empty  |
| PitchCategories       | `{pitch-accent-categories}`                                                                    | Fill if empty  |
| Frequency             | `{frequencies}`                                                                                | Fill if empty  |
| FreqSort              | `{frequency-harmonic-rank}`                                                                    | Fill if empty  |
| MiscInfo              | `<span data-group-id="unindexed">{document-title}</span>`                                      | Prepend        |
                                                                                                                                           
