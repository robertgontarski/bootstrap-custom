# Project Context & Goal

"Bootstrap more like Tailwind": an SCSS overlay compiled together with Bootstrap 5.3 into one stylesheet, `dist/bootstrap.css`, adding Tailwind-style utilities on top of stock Bootstrap. Private npm package `bootstrap` (v1.0.0). Only CSS is built - no JS; pages that need Bootstrap's JS load it themselves. `README.md` is the public class reference.

Core features:
- **Color scale** - Bootstrap's blue, indigo, purple, pink, red, orange, yellow, green, teal, cyan, gray in weights `100`-`900`, keyed `<color>-<weight>` (`blue-500`); 99 entries in `$all-colors`.
- **Color utilities** - `alert-`, `bg-`, `border-` (+ `top|end|bottom|start`), `btn-` / `btn-outline-`, `link-`, `shadow-` (+ `sm|lg`), `text-`, `text-bg-` / `text-bg-outline-` for every color.
- **Other utilities** - `fs-<bp>-<1-6>`, arbitrary `fs-[<8-100>px]` / `fs-<bp>-[<N>px]`, `cursor-<type>` (+ breakpoints), theme-only `d-<type>`, `transition` / `transition-fast|slow|none`, `transition-linear|in|out|in-out`.
- **Variant prefixes** - state `hover:` / `active:` / `focus:`, theme `light:` / `dark:` (bound to `data-bs-theme`), combined as `<theme>:<state>:<utility>`.
- **CSS variables** - `--app-color-<color>-<weight>` on `:root`.

# Tech Stack

- Language: **SCSS**, Dart Sass (`sass` ^1.83.4, locked 1.96.0), legacy `@import` module system - one global scope shared with Bootstrap.
- Base: **Bootstrap** ^5.3.3 (locked 5.3.8) SCSS sources via the `@bootstrap` alias (`vite.config.js` → `node_modules/bootstrap/`).
- Build: **Vite** ^6.0.5 (locked 6.4.1), `vite.config.js` (ESM, `"type": "module"`); CSS output is minified.
- Package manager: **npm** (`package-lock.json`, lockfileVersion 3). Node not pinned (no `.nvmrc` / `engines`); Vite 6 needs Node `^18 || ^20 || >=22`.
- `@popperjs/core` (Bootstrap JS peer) and `path` (npm shim; `vite.config.js` gets Node's core `path`) are declared but unused by the build.
- Testing, lint, format, CI/CD, containers: none (no stylelint, Prettier, `.editorconfig`, pipeline, Dockerfile).
- `makefile`: one target, `build`.
- Remote: GitHub `robertgontarski/bootstrap-custom`, trunk `main`.

# Architecture & Directory Structure

Single SCSS entry; every other file is a partial pulled in with `@import`.

```
src/styles/
├── bootstrap.scss          # only build entry → dist/bootstrap.css
└── modules/
    ├── _mixin.scss         # theme($type): wraps @content in [data-bs-theme="$type"]
    ├── _colors.scss        # re-keyed $grays, $all-colors, extends Bootstrap $utilities
    ├── _elements.scss      # imports _variables, then elements/* (import order = cascade order)
    ├── _variables.scss     # $states: hover / active / focus → pseudo-class
    └── elements/
        ├── _root.scss      # :root --app-color-* variables
        └── _<family>.scss  # one utility family per file: alert, background, border, button,
                            # cursor, display, link, shadow, size, text, text-bg, transition
```

Import order in `src/styles/bootstrap.scss` is load-bearing:
1. Bootstrap config: `functions`, `variables`, `maps`, `mixins`, `utilities`.
2. `modules/mixin`, `modules/colors` - the only place to override Bootstrap variables and maps.
3. `@bootstrap/scss/bootstrap` - full Bootstrap; re-imports its config (`!default` keeps overrides) and runs `utilities/api`.
4. `modules/elements` - custom rules; free to use Bootstrap functions, mixins and variables (`tint-color`, `shade-color`, `color-contrast`, `button-variant`, `button-outline-variant`, `media-breakpoint-up`, `$grid-breakpoints`, `$font-sizes`, `$btn-*`).

Build (`vite.config.js`):
- Inputs: every `.scss` file directly in `src/styles/` whose name does not start with `_` (not recursive). Each becomes `dist/<name>.css`; no JS is emitted.
- `dist/` is emptied on each build and gitignored.
- No `index.html` or demo page exists.

Element module anatomy - for each entry of `$all-colors` (or a local `$all-<things>` list):
- Base: `.<utility>-#{$color}`.
- State: `@each $state, $pseudo in $states` → `.#{$state}\:<utility>-#{$color}#{$pseudo}`.
- Theme: inside `@include theme(light)` / `theme(dark)` → `[class*="<theme>:<utility>-#{$color}"]`.
- Theme + state: inside `theme()` → `[class*="<theme>:#{$state}:<utility>-#{$color}"]#{$pseudo}`.
- Breakpoint: `@each $breakpoint, $value in $grid-breakpoints` → `<utility>-#{$breakpoint}-<value>` wrapped in `@include media-breakpoint-up($breakpoint)`.
- Coverage differs: state variants only in alert, background, border, shadow, text, text-bg; breakpoints only in cursor, display, size; `_display.scss` is theme-only (base `d-*` come from Bootstrap).

Tests: none - verification is a successful build plus grepping `dist/bootstrap.css` (see Commands).

Configuration & decisions: no `.env*`, no ADR / decision records.

Known quirks (current behavior; don't copy into new code, fix only when asked):
- `_colors.scss` re-keys `$grays` as `gray-100`..`gray-900`, so Bootstrap's `_root.scss` emits `--bs-gray-gray-<N>` instead of `--bs-gray-<N>`.
- Unprefixed `text-` / `bg-` / `border-<color>` are also generated by Bootstrap's utilities API with `!important` (via `_colors.scss`). The non-`!important` state and theme variants in `_text.scss` / `_background.scss` lose to them on the same element; the `!important` variants in `_border.scss` / `_shadow.scss` win.
- `[class*=...]` selectors (theme variants, every `fs-[<N>px]` form) match substrings: `[class*="fs-[16px]"]` also matches `light:fs-[16px]` / `dark:fs-[16px]`, so themed arbitrary sizes apply in every theme; overlapping names (`transition` in `transition-fast`, `d-inline` in `d-inline-flex`) work only because the longer rule comes later.
- `fs-<bp>-[<N>px]` and its themed forms have no media query - they apply at every width.
- The `$utilities` merge at the end of `_shadow.scss` runs after `utilities/api` and changes nothing.

# Coding Standards & Conventions

- `@import` only - never `@use` / `@forward` for project or Bootstrap files; Bootstrap 5.3's Sass is `@import`-based and the partials rely on its globals.
- Sass deprecation warnings (`import`, `global-builtin`, `if-function`, `color-functions`) are expected and mostly come from Bootstrap; own code adds `import` and `global-builtin` (`map-merge` / `map-get` in `_colors.scss`, `_shadow.scss`). Don't migrate piecemeal.
- Indentation: tabs (most partials, `vite.config.js`); `_size.scss` and `_transition.scss` use 2 spaces. Keep each file's style; tabs in new files.
- Naming:
  - Partials: `_<kebab-name>.scss`; one utility family per file in `modules/elements/`.
  - Variables: kebab-case; iteration lists `$all-<things>` (`$all-colors`, `$all-cursors`, `$all-displays`); lookup maps plural (`$states`, `$border-side`, `$transition-durations`, `$transition-easings`).
  - Mixins: shared in `modules/_mixin.scss` (`theme`); module-local camelCase `generate<Thing>($color, $value)` for declaration blocks reused across base and theme variants (`_button.scss`, `_link.scss`).
  - Classes: `<utility>-<color>-<weight>`; prefixes `<state>:`, `<theme>:`, `<theme>:<state>:`; breakpoint infix `<utility>-<bp>-<value>`; arbitrary value `fs-[<N>px]`.
- Selectors: state variants use escaped classes (`.hover\:bg-blue-500:hover`); theme variants use `[class*="dark:..."]` inside `@include theme(dark)`, which compiles to a descendant selector - `data-bs-theme` must sit on an ancestor, not on the element. Keep this split.
- Colors: iterate `$all-colors`; derive shades only with Bootstrap `tint-color` / `shade-color`; text on a solid color uses `color-contrast($value)` (`_text-bg.scss`).
  - Light palette (alert): `tint-color($value, 40% / 80% / 60%)` for text / background / border.
  - Dark palette (alert, `text-bg-outline`): text `tint-color($value, 20%)`, background `shade-color($value, 80%)`, border `shade-color($value, 40%)`.
  - `.alert-*` and `.text-bg-outline-*` switch to the dark palette under `[data-bs-theme=dark]` automatically; `.force-light` opts out, `.text-bg-outline-*.force-dark` forces it in any theme.
- `!important` only in `_border.scss` and `_shadow.scss` (to beat Bootstrap utilities).
- N/A in this repo: server/client boundary, data fetching, i18n (no JS, no UI strings).
- Language of shared artifacts: English - commit messages, PR titles and descriptions, documents saved in the repo.
- Branches and commits carry no ticket prefix (none in history).

# Commands & Scripts

| Target | Effect |
| --- | --- |
| `npm ci` | Clean install from `package-lock.json`. |
| `npm run build` / `make build` | `vite build` → `dist/bootstrap.css` (~2.5 MB minified, ~180 kB gzip, ~20 s). Exit code is the pass/fail signal; deprecation warnings are noise. |
| `npm run dev` | Vite dev server - nothing to render (no `index.html`). |
| `npm run preview` | Serves `dist/` - no HTML either. |

No test, lint, format or typecheck scripts exist.

Checking the output: the CSS is minified and rules with identical declarations are merged into one selector list, so grep for the selector text, not `selector{`:

```bash
npm run build
grep -oF 'hover\:bg-blue-500' dist/bootstrap.css | wc -l
grep -oF '[class*="dark:hover:bg-blue-500"]' dist/bootstrap.css | wc -l
ls -l dist/bootstrap.css    # compare size before / after
```

# AI-Specific Instructions (Dos and Don'ts)

Do:
- Read this file first when starting work.
- After every SCSS change run `npm run build` (must exit 0) and grep `dist/bootstrap.css` for each variant you touched: base, state, theme, theme + state, breakpoint. The build output is the only test.
- Check the size delta when adding utilities - each color utility is multiplied by 99 colors × (1 + 3 states) × (1 + 2 themes) = 1188 selectors.
- New utility family: add `modules/elements/_<family>.scss`, `@import` it in `modules/_elements.scss`, and document it in `README.md` (entry in "List of changes" + a section with "Basic" and "Theme-based" examples).
- Copy the variant matrix of the closest module: `_text.scss` (one-property color utility), `_border.scss` (side variants), `_cursor.scss` (keyword list with breakpoints).
- Override Bootstrap variables and maps only in partials imported before `@bootstrap/scss/bootstrap` (`modules/_colors.scss`).
- Keep `README.md` in sync with the class API; state prefixes and transitions are not documented there yet.

Don't:
- Edit `node_modules/bootstrap` or copy Bootstrap partials into `src/` - override through variables and maps.
- Put a `.scss` file without the `_` prefix directly in `src/styles/` unless a new `dist/<name>.css` bundle is intended.
- Change `$utilities` or other Bootstrap maps in `modules/elements/*` - `utilities/api` has already run.
- Mix selector styles: no `[class*=...]` for state-only variants, no escaped classes for theme variants.
- Add a class name that is a prefix of another in the same family without checking the substring-match order.
- Silence Sass deprecation warnings in `vite.config.js` (`silenceDeprecations`, `quietDeps`) or treat them as failures unless asked.
- Commit `dist/` or `node_modules/`.

Maintenance of this file: always follow the rules in CLAUDE.md. When new important information appears, propose adding it to this file. Never modify this file automatically - propose the change and let the maintainer accept it.
