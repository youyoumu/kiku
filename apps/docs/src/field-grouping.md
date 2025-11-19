---
outline: deep
---

# Field Grouping

## The Steps

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

<img src="/media/field-grouping-1.png" alt="field grouping normal" style="max-width: 100%;">

---

And you want to add new **Picture**, **Sentence**, and **SentenceAudio** to the same note.
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

```html
[sound:Tate no Yuusha no Nariagari S3 - 10.mkv_118779.mp3] [sound:Gochuumon wa
Usagi Desuka S01E09 9092049A.mkv_955687.289_958481.289.mp3]
```

:::

Each picture will be displayed on a different page, while everything else will simply be appended.

<video controls autoplay loop>
  <source src="/media/field-grouping-2.webm" type="video/webm" />
</video>

---

Now, to group the fields together, all you need to do is add a `data-group-id` to the `<img>` tag, and wrap the new Sentence/SentenceAudio in a `<span>` with the same `data-group-id`.

::: details Fields {open}

Picture:

```html
<img
  data-group-id="10"
  src="Tate_no_Yuusha_no_NariagariS3-20.mkv_1190221.jpeg"
/>
<img src="gochuumon_wa_usagi_desuka.mkv_957803.webp" />
```

Sentence:

```html
<span data-group-id="10"> どうせ勇者の捕縛に<b>貢献</b>すれば➡ </span>
このお店に<b>貢献</b>するために―
```

SentenceAudio:

```html
<span data-group-id="10">
  [sound:Tate no Yuusha no Nariagari S3 - 10.mkv_118779.mp3]
</span>
[sound:Gochuumon wa Usagi Desuka S01E09 9092049A.mkv_955687.289_958481.289.mp3]
```

:::

<video controls>
  <source src="/media/field-grouping-3.webm" type="video/webm" />
</video>

## More info

- The `data-group-id` value should be a positive integer (ideally a [Unix Timestamp](https://www.unixtimestamp.com/)). Kiku will sort them in descending order.
- Each unique `data-group-id` will create a new page.
- Each group may only contain one Picture.
- Anything without a `data-group-id` will be shown on the same page.
