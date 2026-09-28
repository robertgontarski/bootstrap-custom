# Bootstrap more like Tailwind

This repository is an overlay for the standard Bootstrap version that adds more powerful utilities for managing colors and styles in elements, inspired by a Tailwind-like approach.

## List of changes

- [Colors](#colors)
- [Interactive states](#interactive-states)
- [Alerts](#alerts)
- [Backgrounds](#backgrounds)
- [Borders](#borders)
- [Buttons](#buttons)
- [Links](#links)
- [Focus ring](#focus-ring)
- [Shadows](#shadows)
- [Texts](#texts)
- [Texts with a background](#texts-with-a-background)
- [Opacity](#opacity)
- [Fill and stroke](#fill-and-stroke)
- [Accent](#accent)
- [Gradients](#gradients)
- [Font sizes](#font-sizes)
- [Cursors](#cursors)
- [Display](#displays)
- [Transitions](#transitions)
- [Animations](#animations)
- [Line clamp](#line-clamp)
- [CSS variables](#css-variables)
- [Known limitations](#known-limitations)
- [Supported browsers](#supported-browsers)
- [Development](#development)

## Documentation

### Colors

The elements described below use the default Bootstrap color palette.  
All colors are available in the format `<color_name>-<color_weight>`.

Each color has weights in the range from `100` to `900`.

Available colors:

- blues `#0d6efd`
- indigos `#6610f2`
- purples `#6f42c1`
- pinks `#d63384`
- reds `#dc3545`
- oranges `#fd7e14`
- yellows `#ffc107`
- greens `#198754`
- teals `#20c997`
- cyans `#0dcaf0`
- grays `#6c757d`

Additionally, many elements support **theme-based color management**.  
To use this feature, prefix the class with `light:` or `dark:`.

You can combine them freely to create separate styles for each theme, and combine a theme prefix with a state prefix (see [Interactive states](#interactive-states)) to style one theme's hover, focus, active or disabled state, for example `dark:hover:text-red-500`.

This version also provides a **SCSS mixin** that simplifies theme handling and allows you to define custom variations.

```scss
@mixin theme($type: dark) {
  [data-bs-theme="#{$type}"] {
    @content;
  }
}
```

See [Known limitations](#known-limitations) for how `data-bs-theme` must be placed for theme-based classes to work.

### Interactive states

Color, shadow and text-background elements also support **state-based styling** through six prefixes, applied in this order when more than one could match the same element (a later one in this list wins):

- `group-hover:` - active while a `.group` ancestor is hovered (see below)
- `hover:` - `:hover`
- `focus:` - `:focus`
- `focus-visible:` - `:focus-visible` (keyboard focus only)
- `active:` - `:active`
- `disabled:` - `:disabled` only (not the `.disabled` class)

State prefixes are available on `alert-`, `bg-`, `border-` (including `top`/`end`/`bottom`/`start`), `fill-`, `shadow-` (including `sm`/`lg`), `stroke-`, `text-` and `text-bg-` / `text-bg-outline-`. `btn-` / `btn-outline-`, `link-`, `accent-`, gradient, transition and animation classes only support the theme prefixes, not state prefixes.

`group-hover:` needs a `.group` class on an ancestor element - the state prefix itself carries no pseudo-class, it reacts to that ancestor being hovered:

```html
<div class="group card">
  <p class="group-hover:text-blue-500">Hover the card, not this text</p>
</div>
```

>Basic
> - `hover:<utility>`, `focus:<utility>`, `focus-visible:<utility>`, `active:<utility>`, `disabled:<utility>`, `group-hover:<utility>`
>```html
><p class="hover:text-blue-500">Hover this text</p>
>```
>```html
><button class="btn btn-blue-500" disabled>...</button>
><input class="disabled:bg-gray-300" disabled>
>```

>Theme-based
> - `<theme_name>:<state_name>:<utility>`
>```html
><p class="dark:hover:text-red-500">Hover in dark theme</p>
>```

### Alerts

`.alert-<color>` also switches automatically to a darker palette whenever it sits under a `[data-bs-theme="dark"]` ancestor. Add `.force-light` to an alert to keep the light palette in every theme, or use `dark:alert-<color>` to pick a different color for the dark theme (it always wins over the automatic dark palette).

>Basic
> - `alert-<color_name>-<color_weight>`
>```html
><div class="alert alert-blue-500" role="alert"></div>
>```

>Theme-based
> - `<theme_name>:alert-<color_name>-<color_weight>`
>```html
><div class="alert light:alert-blue-500" role="alert"></div>
>```
>```html
><div class="alert dark:alert-blue-500" role="alert"></div>
>```

### Backgrounds

>Basic 
> - `bg-<color_name>-<color_weight>`
>```html
><div class="bg-blue-500"></div>
>```

>Theme-based
> - `<theme_name>:bg-<color_name>-<color_weight>`
>```html
><div class="light:bg-blue-500"></div>
>```
>```html
><div class="dark:bg-blue-500"></div>
>```

### Borders

>Basic 
> - `border-<color_name>-<color_weight>`
> - `border-<side>-<color_name>-<color_weight>`
>```html
><div class="border-blue-500"></div>
>```
>```html
><div class="border-top-blue-500"></div>
>```

>Theme-based
> - `<theme_name>:border-<color_name>-<color_weight>`
> - `<theme_name>:border-<side>-<color_name>-<color_weight>`
>```html
><div class="light:border-blue-500"></div>
>```
>```html
><div class="dark:border-top-blue-500"></div>
>```

### Buttons

>Basic 
> - `btn-<color_name>-<color_weight>`
> - `btn-outline-<color_name>-<color_weight>`
>```html
><button class="btn btn-blue-500"></button>
>```
>```html
><button class="btn btn-outline-blue-500"></button>
>```

>Theme-based
> - `<theme_name>:btn-<color_name>-<color_weight>`
> - `<theme_name>:btn-outline-<color_name>-<color_weight>`
>```html
><button class="btn light:btn-blue-500"></button>
>```
>```html
><button class="btn dark:btn-outline-blue-500"></button>
>```

### Links

>Basic 
> - `link-<color_name>-<color_weight>`
> - `link-underline-<color_name>-<color_weight>`
>```html
><a class="link-blue-500"></a>
>```
>```html
><a class="link-underline-purple-500"></a>
>```

>Theme-based
> - `<theme_name>:link-<color_name>-<color_weight>`
>```html
><a class="light:link-blue-500"></a>
>```
>```html
><a class="dark:link-blue-500"></a>
>```

`link-underline-<color_name>-<color_weight>` sets the underline color only (from Bootstrap's own `link-underline` utility); it has no theme-based form.

### Focus ring

`focus-ring-<color_name>-<color_weight>` colors Bootstrap's own `.focus-ring` outline from the color scale; combine both classes. It has no theme-based or state-based form.

>Basic 
> - `focus-ring-<color_name>-<color_weight>`
>```html
><button class="btn btn-blue-500 focus-ring focus-ring-purple-500"></button>
>```

### Shadows

>Basic 
> - `shadow-<color_name>-<color_weight>`
> - `shadow-<size>-<color_name>-<color_weight>`
>```html
><div class="shadow-blue-500"></div>
>```
>```html
><div class="shadow-lg-blue-500"></div>
>```

>Theme-based
> - `<theme_name>:shadow-<color_name>-<color_weight>`
> - `<theme_name>:shadow-<size>-<color_name>-<color_weight>`
>```html
><div class="light:shadow-blue-500"></div>
>```
>```html
><div class="dark:shadow-lg-blue-500"></div>
>```

### Texts

>Basic 
> - `text-<color_name>-<color_weight>`
>```html
><p class="text-blue-500"></p>
>```

>Theme-based
> - `<theme_name>:text-<color_name>-<color_weight>`
>```html
><p class="light:text-blue-500"></p>
>```
>```html
><p class="dark:text-blue-500"></p>
>```

### Texts with a background

`.text-bg-outline-<color>` follows the same automatic dark palette rule as alerts: it switches to a darker palette under a `[data-bs-theme="dark"]` ancestor, `.force-light` opts out, and `.force-dark` forces it in any theme.

>Basic 
> - `text-bg-<color_name>-<color_weight>`
> - `text-bg-outline-<color_name>-<color_weight>`
>```html
><span class="badge text-bg-blue-500"></span>
>```
>```html
><span class="badge text-bg-outline-blue-500"></span>
>```

>Theme-based
> - `<theme_name>:text-bg-<color_name>-<color_weight>`
> - `<theme_name>:text-bg-outline-<color_name>-<color_weight>`
>```html
><span class="badge light:text-bg-blue-500"></span>
>```
>```html
><span class="badge dark:text-bg-outline-blue-500"></span>
>```

### Opacity

Bootstrap's own `bg-opacity-*`, `text-opacity-*` and `border-opacity-*` utilities (values `10`/`25`/`50`/`75`/`100`, `text-opacity` has no `10`) now also work with the scale colors from this overlay, since `bg-<color>`, `text-<color>` and `border-<color>` read their color through the same opacity CSS variable Bootstrap uses.

>Basic
> - `bg-opacity-<10|25|50|75|100>`, `text-opacity-<25|50|75|100>`, `border-opacity-<10|25|50|75|100>`
>```html
><div class="bg-blue-500 bg-opacity-50"></div>
>```

State and theme variants (`hover:bg-blue-500`, `dark:bg-blue-500`, ...) always render as a solid color - they are not affected by the opacity scale.

### Fill and stroke

`fill-<color>` and `stroke-<color>` color SVG shapes the same way `text-<color>` colors text; both support state and theme prefixes (see [Interactive states](#interactive-states)).

>Basic 
> - `fill-<color_name>-<color_weight>`
> - `stroke-<color_name>-<color_weight>`
>```html
><circle class="fill-red-500 stroke-blue-500" />
>```

>Theme-based
> - `<theme_name>:fill-<color_name>-<color_weight>`
> - `<theme_name>:stroke-<color_name>-<color_weight>`
>```html
><circle class="dark:fill-purple-500" />
>```

### Accent

`accent-<color>` sets the native `accent-color` of checkboxes, radios and range inputs. It has no state-based form.

>Basic 
> - `accent-<color_name>-<color_weight>`
>```html
><input type="checkbox" class="accent-green-500" checked>
>```

>Theme-based
> - `<theme_name>:accent-<color_name>-<color_weight>`
>```html
><input type="range" class="dark:accent-blue-500">
>```

### Gradients

`bg-gradient-to-<direction>` sets the gradient direction (`t`, `tr`, `r`, `br`, `b`, `bl`, `l`, `tl`); combine it with one `from-<color>` and one `to-<color>` (and, optionally, one `via-<color>` for a middle stop). None of the three support state prefixes.

>Basic 
> - `bg-gradient-to-<t|tr|r|br|b|bl|l|tl>`
> - `from-<color_name>-<color_weight>`
> - `via-<color_name>-<color_weight>`
> - `to-<color_name>-<color_weight>`
>```html
><div class="bg-gradient-to-r from-blue-500 to-purple-500"></div>
>```
>```html
><div class="bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500"></div>
>```

>Theme-based
> - `<theme_name>:from-<color_name>-<color_weight>`
> - `<theme_name>:via-<color_name>-<color_weight>`
> - `<theme_name>:to-<color_name>-<color_weight>`
>```html
><div class="from-blue-500 to-purple-500 dark:from-red-500 dark:to-yellow-500"></div>
>```

A themed stop has higher specificity than an untheme stop from a different family (a themed `from-*` beats a base `via-*`/`to-*`), so theme every stop of a gradient together - never just one of them.

### Font sizes

In this case, `font_size` is available from 8 to 100.

>Basic 
> - `fs-<breakpoint>-<size>`
> - `fs-[<font_size>px]` 
> - `fs-<breakpoint>-[<font_size>px]`
>```html
><p class="fs-md-4"></p>
>```
>```html
><p class="fs-[16px]"></p>
>```
>```html
><p class="fs-md-[16px]"></p>
>```

>Theme-based
> - `<theme_name>:fs-<breakpoint>-<size>`
> - `<theme_name>:fs-[<font_size>px]`
> - `<theme_name>:fs-<breakpoint>-[<font_size>px]`
>```html
><p class="light:fs-md-4"></p>
>```
>```html
><p class="dark:fs-[16px]"></p>
>```
>```html
><p class="light:fs-md-[16px]"></p>
>```

`fs-<breakpoint>-[<font_size>px]` and its themed forms apply from that breakpoint up, same as `fs-<breakpoint>-<size>`. The unprefixed `fs-[<font_size>px]` and its themed forms apply at every width; a themed arbitrary size (`dark:fs-[16px]`) only applies under its own theme, never both.

### Cursors

>Basic 
> - `cursor-<type>`
> - `cursor-<breakpoint>-<type>`
>```html
><p class="cursor-pointer"></p>
>```
>```html
><p class="cursor-md-pointer"></p>
>```

>Theme-based
> - `<theme_name>:cursor-<type>`
> - `<theme_name>:cursor-<breakpoint>-<type>`
>```html
><p class="light:cursor-pointer"></p>
>```
>```html
><p class="dark:cursor-md-pointer"></p>
>```

### Displays

>Theme-based
> - `<theme_name>:d-<type>`
> - `<theme_name>:d-<breakpoint>-<type>`
>```html
><div class="light:d-none"></div>
>```
>```html
><div class="dark:d-md-none"></div>
>```

### Transitions

`transition` turns on a 0.3s transition of every property. Combine it with one property class, one duration class and/or one easing class to narrow it down; none of these support state prefixes.

>Basic 
> - `transition`
> - `transition-colors` / `transition-opacity` / `transition-transform` / `transition-shadow`
> - `transition-fast` / `transition-slow` / `transition-none`
> - `transition-linear` / `transition-in` / `transition-out` / `transition-in-out`
>```html
><button class="btn btn-blue-500 transition hover:bg-purple-500"></button>
>```
>```html
><button class="btn btn-blue-500 transition-colors hover:bg-purple-500"></button>
>```
>```html
><button class="btn btn-blue-500 transition transition-fast hover:bg-purple-500"></button>
>```

>Theme-based
> - `<theme_name>:transition`, `<theme_name>:transition-colors`, ... (every class above)
>```html
><button class="btn btn-blue-500 dark:transition dark:hover:bg-purple-500"></button>
>```

Every transition class is switched off automatically when the operating system's "reduce motion" setting is on.

### Animations

>Basic 
> - `animate-spin` / `animate-ping` / `animate-pulse` / `animate-bounce`
>```html
><span class="animate-spin">&#9680;</span>
>```

>Theme-based
> - `<theme_name>:animate-spin` / `<theme_name>:animate-ping` / `<theme_name>:animate-pulse` / `<theme_name>:animate-bounce`
>```html
><span class="dark:animate-pulse">&#9679;</span>
>```

Like transitions, every `animate-*` class is switched off automatically when the operating system's "reduce motion" setting is on. `animate-*` has no state-based form.

### Line clamp

`line-clamp-<1-6>` truncates text to that many lines with an ellipsis; `line-clamp-none` restores the normal, unclamped flow.

>Basic 
> - `line-clamp-<1|2|3|4|5|6|none>`
> - `line-clamp-<breakpoint>-<1|2|3|4|5|6|none>`
>```html
><p class="line-clamp-3">...</p>
>```
>```html
><p class="line-clamp-none line-clamp-md-2">...</p>
>```

>Theme-based
> - `<theme_name>:line-clamp-<1|2|3|4|5|6|none>`
> - `<theme_name>:line-clamp-<breakpoint>-<1|2|3|4|5|6|none>`
>```html
><p class="dark:line-clamp-2"></p>
>```
>```html
><p class="dark:line-clamp-md-2"></p>
>```

## CSS variables

The full color scale is also available as CSS custom properties on `:root`, for use in your own CSS:

- `--app-color-<color_name>-<color_weight>` - the color as a hex value, e.g. `--app-color-blue-500: #0d6efd;`.
- `--app-color-<color_name>-<color_weight>-rgb` - the same color as comma-separated `r, g, b` components, e.g. `--app-color-blue-500-rgb: 13, 110, 253;` (used internally by the opacity and gradient utilities).
- `--app-gradient-from`, `--app-gradient-to`, `--app-gradient-stops` - set by `from-*` / `via-*` / `to-*`; read directly only if you write a custom `background-image` rule.

## Known limitations

- Theme prefixes (`light:` / `dark:`) need `data-bs-theme` on an **ancestor** element, not on the element carrying the class itself.
- Nested themes (a `[data-bs-theme]` inside another `[data-bs-theme]` of the opposite value) are not supported.

## Supported browsers

Existing classes (colors, alerts, backgrounds, borders, buttons, links, shadows, texts, text-bg, font sizes, cursors, display) keep their original targets: Chrome/Edge 87+, Firefox 78+, Safari 14+.

The automatic dark palette of `.alert-*` and `.text-bg-outline-*` now relies on `:where()`, which raises its own minimum: Chrome/Edge 88+, Firefox 78+, Safari 14+. `group-hover:` uses the same `:where()` and needs the same minimum.

New features have their own minimums:

- `focus-visible:` - Chrome/Edge 86+, Firefox 85+, Safari 15.4+.
- `accent-<color>` - Chrome/Edge 93+, Firefox 92+, Safari 15.4+.

Below a feature's minimum, the browser ignores that rule rather than breaking - the element keeps its normal Bootstrap look.

## Development

- `npm run dev` serves `index.html`, a demo page that renders every utility family in this document with a light/dark theme toggle.
- `npm test` builds the project and runs the test suite (`node --test tests/`) against the built `dist/bootstrap.css`; it is also what CI runs on every push and pull request.
