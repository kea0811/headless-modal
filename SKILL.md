---
name: headless-modal
description: Use when building a custom-styled, accessible modal / dialog in React (confirmation dialogs, forms, sheets, alertdialogs) and you want focus trap, scroll lock, portal rendering, Escape/overlay dismissal, and ARIA handled for you without any imposed styling. React 18 or 19, zero runtime dependencies.
---

# headless-modal

A headless modal / dialog primitive for React. Reach for it when the user needs a
dialog overlay that must be keyboard- and screen-reader accessible, but they want
to own the markup and CSS. It supplies the behavior (focus trap, focus return,
body scroll lock, portal rendering, `Escape` and overlay-click dismissal, ARIA
roles and wiring) and ships **no styles**.

## When to reach for this

User says:
- "Build an accessible modal / dialog / confirmation popup."
- "I need a focus trap and scroll lock for my custom dialog."
- "Make this overlay accessible — Esc to close, focus returns, ARIA."
- "A styled confirm dialog that can't be dismissed by accident (alertdialog)."

User does NOT mean this when they ask for:
- ❌ A pre-styled dialog component — this is headless; if they want batteries-included
  UI, point them at Radix UI / React Aria / a component library.
- ❌ A non-modal popover / tooltip / dropdown (no backdrop, no focus trap) — use a
  popover primitive instead.
- ❌ A toast / notification (transient, non-blocking) — different pattern.

## Install

```bash
pnpm add headless-modal
```

## Most common pattern (95% of cases)

```tsx
import {
  Modal, ModalTrigger, ModalPortal, ModalOverlay,
  ModalContent, ModalTitle, ModalDescription, ModalClose,
} from 'headless-modal';

function Confirm() {
  return (
    <Modal>
      <ModalTrigger className="btn">Delete</ModalTrigger>
      <ModalPortal>
        <ModalOverlay className="overlay">
          <ModalContent className="dialog">
            <ModalTitle>Delete this item?</ModalTitle>
            <ModalDescription>This can't be undone.</ModalDescription>
            <ModalClose className="btn">Cancel</ModalClose>
          </ModalContent>
        </ModalOverlay>
      </ModalPortal>
    </Modal>
  );
}
```

Style it yourself — the library ships zero CSS. Position the overlay and center
the dialog:

```css
.overlay { position: fixed; inset: 0; display: grid; place-items: center;
           background: rgba(0,0,0,.6); }
.dialog  { max-width: 440px; padding: 24px; border-radius: 16px; background: #fff; }
```

Need full control? Use the hook and spread the prop getters onto your own markup
(with your own `createPortal`):

```tsx
const modal = useModal();
<button {...modal.getTriggerProps()}>Open</button>
{modal.open && createPortal(
  <div className="overlay" {...modal.getOverlayProps()}>
    <div className="dialog" {...modal.getContentProps()}>…</div>
  </div>, document.body)}
```

## API / props

Shared by `<Modal>` and `useModal()`:

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` / `defaultOpen` | `boolean` | — / `false` | Controlled / uncontrolled. |
| `onOpenChange` | `(open: boolean) => void` | — | Fires on open-state change. |
| `closeOnEscape` | `boolean` | `true` | Close on `Escape`. |
| `closeOnOverlayClick` | `boolean` | `true` | Close when the overlay itself is clicked. |
| `trapFocus` | `boolean` | `true` | Keep focus inside the dialog. |
| `lockScroll` | `boolean` | `true` | Lock body scroll while open. |
| `returnFocus` | `boolean` | `true` | Return focus to the trigger on close. |
| `initialFocusRef` | `RefObject<HTMLElement>` | — | Element to focus first. |
| `role` | `'dialog' \| 'alertdialog'` | `'dialog'` | ARIA role. |

Parts: `Modal`, `ModalTrigger`, `ModalPortal`, `ModalOverlay`, `ModalContent`,
`ModalTitle`, `ModalDescription`, `ModalClose`. All forward refs and spread extra
props (`className`, `style`, `data-*`, handlers) onto the underlying element.

## Gotchas worth knowing

1. **It ships zero CSS.** `ModalOverlay` and `ModalContent` are unstyled `<div>`s —
   you must position the overlay (`position: fixed; inset: 0`) and size the dialog
   yourself, or "nothing appears to happen" on open.
2. **The parts must live inside `<Modal>`** — they read context and throw a clear
   error otherwise. With the bare `useModal` hook there's no provider; supply your
   own `createPortal` and spread the prop getters.
3. **Overlay-click close relies on structure**: put `<ModalContent>` *inside*
   `<ModalOverlay>`. The overlay only closes when the click target is the overlay
   itself, so clicks on the content don't leak through.
4. **Render `<ModalTitle>` / `<ModalDescription>`** to get `aria-labelledby` /
   `aria-describedby` — the content only advertises them when they're present.
5. **Focus trap + scroll lock live in effects** and are StrictMode-safe (React 18
   and 19). No manual teardown needed.

## Links

- npm: https://www.npmjs.com/package/headless-modal
- demo: https://headless-modal.vercel.app
- repo: https://github.com/kea0811/headless-modal
