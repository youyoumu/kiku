---
outline: deep
---

# Custom Theme

Open `_kiku_style.css` in your `collection.media` directory. At the bottom of the file, you will find the following section:

```css
/* the rest of the file ... */

@layer custom {
  [data-theme] {
    /* custom theme here */
  }
}
```

You can override the `cupcake` theme with your own theme like this:

```css
/* the rest of the file ... */

@layer custom {
  /* override the cupcake theme with a black-and-white theme */
  [data-theme="cupcake"] {
    prefersdark: false;
    color-scheme: "light";
    --color-base-100: oklch(100% 0 0);
    --color-base-200: oklch(100% 0 0);
    --color-base-300: oklch(100% 0 0);
    --color-base-content: oklch(0% 0 0);
    --color-primary: oklch(0% 0 0);
    --color-primary-content: oklch(100% 0 0);
    --color-secondary: oklch(0% 0 0);
    --color-secondary-content: oklch(100% 0 0);
    --color-accent: oklch(0% 0 0);
    --color-accent-content: oklch(100% 0 0);
    --color-neutral: oklch(0% 0 0);
    --color-neutral-content: oklch(100% 0 0);
    --color-info: oklch(0% 0 0);
    --color-info-content: oklch(100% 0 0);
    --color-success: oklch(0% 0 0);
    --color-success-content: oklch(100% 0 0);
    --color-warning: oklch(0% 0 0);
    --color-warning-content: oklch(100% 0 0);
    --color-error: oklch(0% 0 0);
    --color-error-content: oklch(100% 0 0);
    --radius-selector: 1rem;
    --radius-field: 2rem;
    --radius-box: 1rem;
    --size-selector: 0.25rem;
    --size-field: 0.25rem;
    --border: 1px;
    --depth: 0;
    --noise: 0;
  }
}
```

After saving the file, open the Kiku settings and click **Save**. This will update Kiku’s style template using the modified `_kiku_style.css`.

::: info
You can generate your own theme using the [daisyUI Theme Generator](https://daisyui.com/theme-generator/).
:::
