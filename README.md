# headless-modal

![tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)
![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)
![license](https://img.shields.io/badge/license-MIT-blue.svg)
![npm version](https://img.shields.io/npm/v/headless-modal.svg)
![npm downloads](https://img.shields.io/npm/dm/headless-modal.svg)
![bundle size](https://img.shields.io/bundlephobia/minzip/headless-modal?label=gzip)

**🌐 [Live demo →](https://headless-modal.vercel.app)**

> 🧩 Part of the **headless-** collection — accessibility-first React primitives. Find more at [github.com/kea0811?tab=repositories&q=headless](https://github.com/kea0811?tab=repositories&q=headless).

An accessible, **headless** modal / dialog primitive for React. It handles the
parts that are easy to get wrong — focus trap, scroll lock, portal rendering,
`Escape` and overlay-click to close, focus return, and the right ARIA — and
leaves the markup and styling entirely to you. No CSS ships, no opinions imposed.
Works with **React 18 and 19**.

## For AI coding agents

Drop [`SKILL.md`](./SKILL.md) into your AI editor / Claude Code workspace and it
learns how to use this library — when to reach for it, the install + canonical
pattern, the public API, and the gotchas that are easy to miss.

## Install

```bash
pnpm add headless-modal
```

```bash
npm install headless-modal   # or: yarn add headless-modal
```

> _Bleeding edge or before the first npm release: `pnpm add github:kea0811/headless-modal`._

## Quick start

The component API is a small set of composable parts. You bring the classes:

```tsx
import {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalOverlay,
  ModalContent,
  ModalTitle,
  ModalDescription,
  ModalClose,
} from 'headless-modal';

function Example() {
  return (
    <Modal>
      <ModalTrigger className="btn">Open</ModalTrigger>
      <ModalPortal>
        <ModalOverlay className="overlay">
          <ModalContent className="dialog">
            <ModalTitle>Ship it?</ModalTitle>
            <ModalDescription>
              Focus is trapped, page scroll is locked, and Esc closes it.
            </ModalDescription>
            <ModalClose className="btn">Cancel</ModalClose>
          </ModalContent>
        </ModalOverlay>
      </ModalPortal>
    </Modal>
  );
}
```

Nothing is styled. `ModalOverlay` and `ModalContent` render plain elements with
`data-state="open"` and the correct roles, so you target them in CSS:

```css
.overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.6);
}
.dialog {
  max-width: 440px;
  padding: 24px;
  border-radius: 16px;
  background: white;
}
.dialog:focus-visible {
  outline: 2px solid rebeccapurple;
}
```

## What you get for free

- **Focus trap** — `Tab` / `Shift+Tab` cycle inside the dialog and never leak to
  the page behind it.
- **Focus return** — closing sends focus back to whatever opened the dialog.
- **Scroll lock** — the body stops scrolling while the dialog is open, with
  scrollbar-width compensation so the page doesn't jump.
- **Portal** — content renders at the end of `document.body` (or a container you
  choose), so it escapes `overflow: hidden` and stacking-context traps.
- **Dismissal** — `Escape` and overlay clicks close by default; each is one prop
  to disable.
- **ARIA** — `role="dialog"` (or `alertdialog`), `aria-modal`, and
  `aria-labelledby` / `aria-describedby` wired to your title and description.

## Options

Pass these to `<Modal>` or `useModal()`:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | — | Controlled open state. |
| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled). |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the open state changes. |
| `closeOnEscape` | `boolean` | `true` | Close when `Escape` is pressed. |
| `closeOnOverlayClick` | `boolean` | `true` | Close when the overlay (not its children) is clicked. |
| `trapFocus` | `boolean` | `true` | Keep keyboard focus inside the dialog. |
| `lockScroll` | `boolean` | `true` | Lock body scroll while open. |
| `returnFocus` | `boolean` | `true` | Return focus to the trigger on close. |
| `initialFocusRef` | `RefObject<HTMLElement>` | — | Element to focus first on open. |
| `role` | `'dialog' \| 'alertdialog'` | `'dialog'` | ARIA role for the content. |

## Components

| Component | Renders | Notes |
| --- | --- | --- |
| `<Modal>` | nothing | Context provider — holds the state and config. |
| `<ModalTrigger>` | `<button>` | Opens the dialog; carries `aria-haspopup` / `aria-expanded`. |
| `<ModalPortal>` | portal | Renders children into `document.body` (or `container`) while open. |
| `<ModalOverlay>` | `<div>` | The backdrop; clicking it closes the dialog. |
| `<ModalContent>` | `<div>` | The dialog surface; traps focus and carries the ARIA. |
| `<ModalTitle>` | `<h2>` | Links itself via `aria-labelledby`. |
| `<ModalDescription>` | `<p>` | Links itself via `aria-describedby`. |
| `<ModalClose>` | `<button>` | Closes the dialog. |

Every part forwards its ref and spreads extra props onto the underlying element,
so `className`, `style`, `data-*`, and handlers all pass through.

## Examples

### Controlled

```tsx
function Example() {
  const [open, setOpen] = useState(false);
  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger className="btn">Open</ModalTrigger>
      {/* …portal / overlay / content… */}
    </Modal>
  );
}
```

### An `alertdialog` that demands a choice

```tsx
// No Escape, no backdrop dismiss — the user must pick an action.
<Modal role="alertdialog" closeOnEscape={false} closeOnOverlayClick={false}>
  …
</Modal>
```

### Focus a specific element first

```tsx
const inputRef = useRef<HTMLInputElement>(null);

<Modal initialFocusRef={inputRef}>
  <ModalPortal>
    <ModalOverlay className="overlay">
      <ModalContent className="dialog">
        <input ref={inputRef} placeholder="Type here" />
      </ModalContent>
    </ModalOverlay>
  </ModalPortal>
</Modal>;
```

### Just the hook

Skip the components and spread the prop getters onto your own markup:

```tsx
import { useModal } from 'headless-modal';
import { createPortal } from 'react-dom';

function Sheet() {
  const modal = useModal();

  return (
    <>
      <button {...modal.getTriggerProps()}>Open</button>
      {modal.open &&
        createPortal(
          <div className="overlay" {...modal.getOverlayProps()}>
            <div className="dialog" {...modal.getContentProps()}>
              <h2 {...modal.getTitleProps()}>Title</h2>
              <button {...modal.getCloseProps()}>Close</button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
```

`useModal` returns `{ open, setOpen, openModal, closeModal, toggle, contentId,
titleId, descriptionId, registerTitle, registerDescription, getTriggerProps,
getOverlayProps, getContentProps, getTitleProps, getDescriptionProps,
getCloseProps }`.

## Keyboard interaction

Out of the box, the dialog follows the
[WAI-ARIA dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/):

| Keys | Action |
| --- | --- |
| <kbd>Tab</kbd> | Move to the next focusable element, wrapping at the end |
| <kbd>Shift</kbd>+<kbd>Tab</kbd> | Move to the previous element, wrapping at the start |
| <kbd>Escape</kbd> | Close the dialog (unless `closeOnEscape={false}`) |

## Accessibility

- `ModalContent` gets `role="dialog"` (or `alertdialog`) and `aria-modal`.
- Render a `ModalTitle` and `ModalDescription` and they auto-link via
  `aria-labelledby` / `aria-describedby` — the content only advertises them when
  they actually exist.
- Focus moves into the dialog on open and returns to the trigger on close.
- `Tab` is trapped so keyboard and screen-reader users stay in the dialog.

## Contributing

Issues and PRs are welcome. To develop locally:

```bash
pnpm install
pnpm test          # vitest
pnpm test:coverage # 100% required
pnpm build         # ESM + CJS + .d.ts
pnpm demo:dev      # run the showcase
```

## License

[MIT](./LICENSE) © 2026 kea0811
