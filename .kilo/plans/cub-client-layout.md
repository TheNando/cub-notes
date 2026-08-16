# cub-client layout fixes + CSS simplification

Scope: `apps/cub-client` (navigation, notes menu, note page). No server/API changes.

## 1. Diagnosis (what is actually broken today)

### 1.1 Navigation right edge is clipped (the reported bug)

`apps/cub-client/src/features/navigation/side-nav.css:1-14`

```css
.cub-side-nav {
  width: min(18rem, 100%);
  min-height: 100%;
  margin: 5px;
}
```

`.app-shell` (`src/style.css:26`) sizes column 1 as `minmax(14.5rem, 18rem)`. At any width where the
track reaches its 18rem max, the nav resolves `width: min(18rem, 100%)` to the _full_ track width and
then adds `margin: 5px` **outside** that width. The margin box becomes `track + 10px`, so the nav
starts at `x = 5px` and ends 5px past the track. `.cub-notes-menu` is the next grid item, is painted
after the nav, and has an opaque background (`#fffdfa`), so it covers the nav's right 5px including
its rounded corners → "the right side is cut off". Gap between nav and notes menu is effectively
`-5px` instead of the required `5px`.

Root cause: the pane declares its own width while the grid track already owns it (two sources of
truth), and `box-sizing: border-box` does not include margins.

### 1.2 Nothing scrolls independently, so pane heights are not viewport-bound

`.app-shell` uses `min-height: 100vh` with an implicit `auto` row. The row grows to the tallest pane,
so a long notes list or long note makes the **document** scroll and stretches the nav past the
viewport. Consequences:

- Nav is not "10px smaller than the screen height" once any pane overflows.
- `.cub-notes-menu` has `overflow: hidden` while `.cub-notes-menu__list` has `overflow: auto` but no
  `flex: 1; min-height: 0`. As a flex item its height is content-based, so it never becomes a scroll
  container; with a longer list the menu clips rows that cannot be reached at all.
- `.cub-side-nav { overflow: auto }` never engages for the same reason.
- `min-height: 100%` on both panes resolves against an indefinite grid row, so it contributes nothing
  and is dead code.

### 1.3 Folder tree indentation is inconsistent

`side-nav.css:81-90` applies the `1.5rem | 1fr` grid only to `li.cub-side-nav__branch` (folders with
children). Leaf folders (`Inbox`, `Archive`) render a bare `<li>`, so their label button starts 1.5rem
to the left of `Projects` / `Areas` at the same tree depth. Labels in one tree level do not line up.

### 1.4 Smaller layout issues

- `.note-page__empty { padding-top: 15vh }` (`style.css:78`) fakes vertical centering with a viewport
  unit; it drifts once the note page becomes its own scroll container.
- Long unbroken words in a note title/body can overflow the note page (no `overflow-wrap`).
- Two `<h1>` elements per screen: `NotesMenu.Title` (`notes-menu.tsx:79`) and `NotePage`
  (`main.tsx:83`).
- The `@media (max-width: 64rem)` layout reflows to a 2-row/2-column shape that no longer fits a
  viewport-height shell and duplicates track definitions for little gain.

## 2. Maintainability problems worth fixing in the same pass

1. **Hard-coded values everywhere.** ~20 hex colors, 3 copies of the `Inter, ui-sans-serif, …` font
   stack, and repeated radii are duplicated across `style.css`, `side-nav.css`, `notes-menu.css`.
2. **Layout leaks into feature class names.** `style.css` targets `.app-shell > .cub-side-nav` and
   `.app-shell > .cub-notes-menu` for `grid-area`, and owns `.cub-notes-menu__empty` even though every
   other `cub-notes-menu__*` rule lives in `notes-menu.css`.
3. **`grid-template-areas` is unnecessary.** Three children in DOM order fill three columns (and three
   rows when stacked) without named areas, which also removes the coupling in (2).
4. **The `typeof className === "string" ? … : …` ternary is repeated 8 times** across `side-nav.tsx`
   and `notes-menu.tsx` because Preact types `class` as `Signalish<string | undefined>`.
5. **Stringly-typed state.** `main.tsx` stores `notesStatus` as UI copy and then compares it to the
   literal `"Loading notes…"` to derive `aria-busy` (`main.tsx:55`). Editing the copy silently breaks
   the busy state.
6. **Duplicate CSS.** `.cub-side-nav button { font: inherit }` and `.cub-notes-menu__card { font: inherit }`
   restate the global `button, input { font: inherit }`; `.cub-notes-menu__icon-button` rules are
   duplicated via `.cub-notes-menu__search-input button` selectors; `.sr-only` is scoped to the nav
   although it is a generic utility; the searching state hides nodes with three `display: none`
   override rules.
7. **Dead starter files:** `src/counter.ts` and `src/assets/{hero.png,typescript.svg,vite.svg}` are
   unreferenced.

## 3. Target behaviour

- App shell is exactly one viewport tall; each pane scrolls internally; the document never scrolls
  (desktop/tablet).
- Navigation renders as a rounded rectangle with a **5px** gutter on all four sides: 5px from the
  window edges and 5px between it and the notes menu. Height = `100dvh - 10px`. Never overflows its
  column.
- Notes menu and note page fill their tracks, clip nothing, and scroll internally.
- Below `48rem`: single column, document scrolls, one uniform 5px gutter (the shell supplies it).

## 4. Implementation plan

### 4.1 `src/style.css` — tokens, reset, shell only

- Add a `:root` token block and use it in every rule:
  `--cub-gutter: 5px`, `--cub-nav-width`, `--cub-menu-width`, `--cub-font-sans`, `--cub-font-serif`,
  surfaces (`--cub-bg`, `--cub-surface`, `--cub-line`, `--cub-line-soft`, `--cub-hover`),
  ink (`--cub-ink`, `--cub-ink-soft`, `--cub-ink-muted`), accent/selection
  (`--cub-accent`, `--cub-selected-bg`, `--cub-selected-line`), nav palette
  (`--cub-nav-bg`, `--cub-nav-ink`, `--cub-nav-ink-soft`, `--cub-nav-ink-muted`, `--cub-nav-hover`,
  `--cub-nav-active`, `--cub-nav-focus`), radii (`--cub-radius-sm/md/lg`). Values are the existing
  hexes, so there is no visual change from tokenising.
- Set `font-family: var(--cub-font-sans)` and `color-scheme: light` once on `:root`; delete the two
  duplicate `font-family` declarations in the feature stylesheets (they inherit).
- Move `.sr-only` here as a global utility and use `clip-path: inset(50%)` instead of the deprecated
  `clip`.
- Replace the shell with a viewport-bound grid, no named areas:

```css
.app-shell {
  display: grid;
  height: 100vh; /* fallback */
  height: 100dvh;
  grid-template-columns:
    minmax(14.5rem, var(--cub-nav-width))
    minmax(18rem, var(--cub-menu-width))
    minmax(0, 1fr);
  overflow: hidden;
}

/* Panes own their scrolling; this lets them shrink instead of stretching the shell. */
.app-shell > * {
  min-width: 0;
  min-height: 0;
}

@media (max-width: 48rem) {
  .app-shell {
    height: auto;
    min-height: 100dvh;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--cub-gutter);
    padding: var(--cub-gutter);
    overflow: visible;
  }
}
```

- Delete `.app-shell > .cub-side-nav`, `.app-shell > .cub-notes-menu`, `grid-template-areas`, the
  `@media (max-width: 64rem)` block, and all `.note-page*` / `.cub-notes-menu__empty` rules (they move
  to feature stylesheets).

### 4.2 `features/navigation/side-nav.css`

- `.cub-side-nav`: drop `width`, `min-height: 100%`, `font-family`, and the `.cub-side-nav button { font: inherit }`
  rule. Keep `margin: var(--cub-gutter)`, `border-radius: var(--cub-radius-lg)`, and add
  `min-height: 0; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; scrollbar-gutter: stable`.
  Grid stretch then makes the panel `track - 10px` wide and `100dvh - 10px` tall with no overflow.
- Replace `.cub-side-nav__branch` with a `.cub-side-nav__row` applied to **every** tree `<li>` so all
  labels at a depth align:

```css
.cub-side-nav__row {
  display: grid;
  grid-template-columns: 1.5rem minmax(0, 1fr);
  grid-template-areas:
    "toggle label"
    "tree   tree";
  align-items: center;
}

.cub-side-nav__toggle {
  grid-area: toggle;
}
.cub-side-nav__item {
  grid-area: label;
}
.cub-side-nav__row > .cub-side-nav__tree {
  grid-area: tree;
  padding-left: 1.5rem;
}
```

- Swap literals for tokens; mobile override becomes just `margin: 0` (shell padding supplies the
  gutter) instead of re-declaring `width`/`min-height`.

### 4.3 `features/navigation/side-nav.tsx`

- Use the shared `cx` helper and `WithClass<HTMLElement>` props type (§4.6) instead of the inline
  `typeof className === "string"` ternary.
- Every tree `<li>` gets `class="cub-side-nav__row"`; the toggle button is only rendered when the
  folder has children (the empty `toggle` grid cell keeps alignment — no placeholder element needed).

### 4.4 `features/notes/notes-menu.css` / `notes-menu.tsx`

- `.cub-notes-menu`: drop `width`, `min-height: 100%`, `font-family`, `color`; keep
  `display: flex; flex-direction: column; min-height: 0; overflow: hidden`.
- `.cub-notes-menu__list`: add `flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain`
  so the list is the scroll container.
- Give the search close button the `cub-notes-menu__icon-button` class in TSX and delete the
  `.cub-notes-menu__search-input button` duplicate selectors (3 rules → sizing override only).
- Replace the `--searching` `display: none` overrides: `NotesMenu.Title` and `NotesMenu.NewNoteButton`
  return `null` while `isSearchOpen` (state already lives in `NotesMenuContext`), so the modifier class
  reduces to `width: 100%` on `__actions` — or is dropped entirely.
- Add `NotesMenu.Empty` (a `<li role="status">`) and move `.cub-notes-menu__empty` from `style.css`
  into `notes-menu.css`.
- `NotesMenu.Title` renders `<h2>` instead of `<h1>` (note page keeps the page `<h1>`).
- Remove `font: inherit` from `.cub-notes-menu__card` (global rule covers it).

### 4.5 New `features/notes/note-page.tsx` + `note-page.css`

- Move `NotePage` / `EmptyNotePage` out of `main.tsx` into a feature module, matching the
  `side-nav` / `notes-menu` pattern; move all `.note-page*` rules into `note-page.css`.
- `.note-page { min-height: 0; overflow-y: auto; display: grid; align-content: start; }`, empty state
  uses a `.note-page--empty { align-content: center; }` modifier instead of `padding-top: 15vh`.
- Add `overflow-wrap: break-word` to the content/heading wrappers; use `var(--cub-font-serif)` for the
  heading.

### 4.6 New `src/lib/class-names.ts`

```ts
import type * as Preact from "preact";

/** Element props whose `class` is a plain string, so merging stays a one-liner. */
export type WithClass<E extends EventTarget> = Omit<Preact.HTMLAttributes<E>, "class"> & {
  class?: string;
};

/** Joins class names and ignores falsy values. */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
```

Used by `side-nav.tsx`, `notes-menu.tsx`, `note-page.tsx` (removes 8 ternaries).

### 4.7 `src/main.tsx`

- Replace the stringly-typed `notesStatus` with a discriminated state and derive copy/`aria-busy`:

```tsx
type NotesState = { status: "loading" } | { status: "ready"; notes: NotePreview[] };
```

`aria-busy={state.status === "loading"}`, empty copy rendered through `NotesMenu.Empty`.

- Keep the existing `isCurrent` cancellation guard.
- `main.tsx` shrinks to the shell + data wiring; note-page markup lives in its feature module.

### 4.8 Cleanup

- Delete unreferenced `src/counter.ts` and `src/assets/{hero.png,typescript.svg,vite.svg}` (verified
  unused by grep). `public/favicon.svg` and `public/icons.svg` stay.

## 5. Files touched

| File                                   | Action                                               |
| -------------------------------------- | ---------------------------------------------------- |
| `src/style.css`                        | rewrite: tokens, reset, shell grid only              |
| `src/features/navigation/side-nav.css` | fix sizing/scroll, row grid, tokens                  |
| `src/features/navigation/side-nav.tsx` | `cx`, `__row` class on all tree items                |
| `src/features/notes/notes-menu.css`    | scroll container, tokens, dedupe                     |
| `src/features/notes/notes-menu.tsx`    | `cx`, `Empty`, `h2`, search simplification           |
| `src/features/notes/note-page.tsx`     | new (moved from `main.tsx`)                          |
| `src/features/notes/note-page.css`     | new (moved from `style.css`)                         |
| `src/lib/class-names.ts`               | new                                                  |
| `src/main.tsx`                         | typed notes state, uses `NotePage`/`NotesMenu.Empty` |
| `src/counter.ts`, `src/assets/*`       | delete                                               |

## 6. Verification

1. `vp check` (oxfmt + oxlint, type-aware).
2. `vp run --filter cub-client build` (runs `tsc` then the Vite build).
3. `vp run -r test` (existing package tests must stay green).
4. `vp run --filter cub-client dev`, then in DevTools at 1440px, 1100px, 900px, 768px, 375px:
   - `document.scrollingElement.scrollHeight === innerHeight` above 48rem (no document scroll).
   - `document.querySelector(".cub-side-nav").getBoundingClientRect()` → `x === 5`,
     `height === innerHeight - 10`, `right === navColumnRight - 5`, and 5px of cream visible between
     nav and notes menu on all sides.
   - Nav scrolls internally with every folder expanded; notes list scrolls with a long list; a long
     note scrolls in the note page only.
   - Folder labels at the same depth are left-aligned (leaf vs. parent).
   - Search expansion, keyboard focus rings, and the empty-folder status row still work.

## 7. Decisions / risks

- Dropping the `64rem` breakpoint keeps three columns down to `48rem` (at 900px: ~232px nav, ~288px
  menu, ~380px note page — usable). If the intermediate stacked layout is required, it can be
  reintroduced with `grid-template-rows: minmax(0, 1fr) minmax(0, 40%)` instead of `auto` rows.
- `100dvh` (with a `100vh` fallback) is used so mobile browser chrome does not clip the panel.
- Tokenising reuses the current hex values, so the only intended visual deltas are: nav no longer
  clipped, panes scroll independently, folder indentation aligned, empty note state centred.
