import { useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  ModalTrigger,
  useModal,
} from 'headless-modal';

const REPO = 'https://github.com/kea0811/headless-modal';
const NPM = 'https://www.npmjs.com/package/headless-modal';

function Hero() {
  return (
    <header className="hero">
      <div className="hero-mark" aria-hidden="true">
        <span className="hero-mark-bar" />
      </div>
      <h1 className="hero-title">headless-modal</h1>
      <p className="hero-tagline">
        An <strong>accessible, headless</strong> modal for React. It owns the hard
        parts — focus trap, scroll lock, portals, ARIA — and leaves every pixel to
        you.
      </p>
      <div className="hero-pills">
        <span className="pill">React 18 &amp; 19</span>
        <span className="pill">Zero dependencies</span>
        <span className="pill">100% test coverage</span>
        <span className="pill">~2 kB gzipped</span>
      </div>
      <pre className="hero-install">
        <code>pnpm add headless-modal</code>
      </pre>
      <p className="hero-note">
        Every card below is live. Open one, then drive it with <kbd>Tab</kbd>,{' '}
        <kbd>Shift</kbd>+<kbd>Tab</kbd> and <kbd>Esc</kbd>.
      </p>
      <div className="hero-links">
        <a className="btn btn-primary" href={NPM} target="_blank" rel="noreferrer">
          View on npm
        </a>
        <a className="btn" href={REPO} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </header>
  );
}

interface CardProps {
  feature: string;
  title: string;
  blurb: string;
  children: ReactNode;
}

function Card({ feature, title, blurb, children }: CardProps) {
  return (
    <section className="card">
      <div className="card-head">
        <span className="card-feature">{feature}</span>
        <h2 className="card-title">{title}</h2>
        <p className="card-blurb">{blurb}</p>
      </div>
      <div className="card-body">{children}</div>
    </section>
  );
}

/** The canonical dialog: title, description, and a close button. */
function BasicDemo() {
  return (
    <Modal>
      <ModalTrigger className="btn btn-primary">Open dialog</ModalTrigger>
      <ModalPortal>
        <ModalOverlay className="hm-overlay">
          <ModalContent className="hm-content">
            <ModalTitle className="hm-title">Ship it?</ModalTitle>
            <ModalDescription className="hm-desc">
              This dialog is portaled to <code>document.body</code>, traps focus,
              and locks the page scroll — all with zero styling shipped by the
              library.
            </ModalDescription>
            <div className="hm-actions">
              <ModalClose className="btn">Cancel</ModalClose>
              <ModalClose className="btn btn-primary">Deploy</ModalClose>
            </div>
          </ModalContent>
        </ModalOverlay>
      </ModalPortal>
    </Modal>
  );
}

/** A form-heavy dialog: Tab cycles through the fields and never escapes. */
function FocusTrapDemo() {
  return (
    <Modal>
      <ModalTrigger className="btn btn-primary">Edit profile</ModalTrigger>
      <ModalPortal>
        <ModalOverlay className="hm-overlay">
          <ModalContent className="hm-content">
            <ModalTitle className="hm-title">Edit profile</ModalTitle>
            <ModalDescription className="hm-desc">
              Tab from the last field and focus loops back to the first — it can't
              leak to the page behind.
            </ModalDescription>
            <label className="field">
              <span className="field-label">Name</span>
              <input className="input" defaultValue="Ada Lovelace" />
            </label>
            <label className="field">
              <span className="field-label">Email</span>
              <input className="input" defaultValue="ada@example.com" />
            </label>
            <div className="hm-actions">
              <ModalClose className="btn">Cancel</ModalClose>
              <ModalClose className="btn btn-primary">Save</ModalClose>
            </div>
          </ModalContent>
        </ModalOverlay>
      </ModalPortal>
    </Modal>
  );
}

/** Dismissal knobs: Escape and click-outside both close by default. */
function DismissDemo() {
  return (
    <Modal>
      <ModalTrigger className="btn btn-primary">Open</ModalTrigger>
      <ModalPortal>
        <ModalOverlay className="hm-overlay">
          <ModalContent className="hm-content">
            <ModalTitle className="hm-title">Two ways out</ModalTitle>
            <ModalDescription className="hm-desc">
              Press <kbd>Esc</kbd> or click the dimmed backdrop to close. Both are
              on by default and each is a one-prop opt-out.
            </ModalDescription>
            <div className="hm-actions">
              <ModalClose className="btn btn-primary">Got it</ModalClose>
            </div>
          </ModalContent>
        </ModalOverlay>
      </ModalPortal>
    </Modal>
  );
}

/** An alertdialog that demands an explicit choice — no Escape, no backdrop close. */
function AlertDialogDemo() {
  return (
    <Modal role="alertdialog" closeOnEscape={false} closeOnOverlayClick={false}>
      <ModalTrigger className="btn btn-danger">Delete account</ModalTrigger>
      <ModalPortal>
        <ModalOverlay className="hm-overlay">
          <ModalContent className="hm-content">
            <ModalTitle className="hm-title">Delete account?</ModalTitle>
            <ModalDescription className="hm-desc">
              This is an <code>alertdialog</code>: Escape and backdrop clicks are
              disabled, so a choice is required. This can't be dismissed by
              accident.
            </ModalDescription>
            <div className="hm-actions">
              <ModalClose className="btn">Keep it</ModalClose>
              <ModalClose className="btn btn-danger">Delete</ModalClose>
            </div>
          </ModalContent>
        </ModalOverlay>
      </ModalPortal>
    </Modal>
  );
}

/** Controlled mode: state lives in the parent and drives the dialog. */
function ControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="row">
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          Open
        </button>
        <span className="status">
          state: <strong>{open ? 'open' : 'closed'}</strong>
        </span>
      </div>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalPortal>
          <ModalOverlay className="hm-overlay">
            <ModalContent className="hm-content">
              <ModalTitle className="hm-title">You own the state</ModalTitle>
              <ModalDescription className="hm-desc">
                Pass <code>open</code> and <code>onOpenChange</code> and the dialog
                becomes fully controlled — the status chip updates live.
              </ModalDescription>
              <div className="hm-actions">
                <button className="btn btn-primary" onClick={() => setOpen(false)}>
                  Close from parent
                </button>
              </div>
            </ModalContent>
          </ModalOverlay>
        </ModalPortal>
      </Modal>
    </>
  );
}

/** Point initialFocusRef at any element to focus it first on open. */
function InitialFocusDemo() {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Modal initialFocusRef={inputRef}>
      <ModalTrigger className="btn btn-primary">Add label</ModalTrigger>
      <ModalPortal>
        <ModalOverlay className="hm-overlay">
          <ModalContent className="hm-content">
            <ModalTitle className="hm-title">Name your label</ModalTitle>
            <ModalDescription className="hm-desc">
              Focus lands straight on the text field instead of the first button —
              just hand <code>initialFocusRef</code> the element you want.
            </ModalDescription>
            <label className="field">
              <span className="field-label">Label</span>
              <input ref={inputRef} className="input" placeholder="e.g. urgent" />
            </label>
            <div className="hm-actions">
              <ModalClose className="btn">Cancel</ModalClose>
              <ModalClose className="btn btn-primary">Create</ModalClose>
            </div>
          </ModalContent>
        </ModalOverlay>
      </ModalPortal>
    </Modal>
  );
}

/** No components at all — just the hook and prop getters on your own markup. */
function HookDemo() {
  const modal = useModal();
  return (
    <>
      <button className="btn btn-primary" {...modal.getTriggerProps()}>
        Open (hook only)
      </button>
      {modal.open &&
        createPortal(
          <div className="hm-overlay" {...modal.getOverlayProps()}>
            <div className="hm-content" {...modal.getContentProps()}>
              <h2 className="hm-title" {...modal.getTitleProps()}>
                Bring your own markup
              </h2>
              <p className="hm-desc" {...modal.getDescriptionProps()}>
                <code>useModal()</code> hands back prop getters you spread onto any
                elements — no <code>&lt;Modal&gt;</code> wrapper required.
              </p>
              <div className="hm-actions">
                <button className="btn btn-primary" {...modal.getCloseProps()}>
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

const USAGE = `import { useState } from 'react';
import {
  Modal, ModalTrigger, ModalPortal,
  ModalOverlay, ModalContent, ModalTitle,
  ModalDescription, ModalClose,
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
              Focus is trapped, scroll is locked, Esc closes.
            </ModalDescription>
            <ModalClose className="btn">Cancel</ModalClose>
          </ModalContent>
        </ModalOverlay>
      </ModalPortal>
    </Modal>
  );
}`;

function CodeBlock() {
  return (
    <section className="code-section">
      <div className="card-head">
        <span className="card-feature">Five-second integration</span>
        <h2 className="card-title">Drop it in</h2>
        <p className="card-blurb">
          The library ships no CSS — you style{' '}
          <code>.overlay</code> and <code>.dialog</code> however you like. Here's
          the whole thing:
        </p>
      </div>
      <pre className="code-block">
        <code>{USAGE}</code>
      </pre>
    </section>
  );
}

export function App() {
  return (
    <div className="page">
      <div className="glow" aria-hidden="true" />
      <main className="shell">
        <Hero />

        <div className="grid">
          <Card
            feature="The basics"
            title="A real dialog"
            blurb="Trigger, portal, overlay, content — the WAI-ARIA dialog pattern, wired up."
          >
            <BasicDemo />
          </Card>

          <Card
            feature="Focus trap"
            title="Tab stays inside"
            blurb="Keyboard focus cycles within the dialog and returns to the trigger on close."
          >
            <FocusTrapDemo />
          </Card>

          <Card
            feature="Dismissal"
            title="Esc & click-outside"
            blurb="Both close by default; each is a single prop to turn off."
          >
            <DismissDemo />
          </Card>

          <Card
            feature="alertdialog"
            title="Demand a choice"
            blurb="Switch the role and disable dismissal for destructive confirmations."
          >
            <AlertDialogDemo />
          </Card>

          <Card
            feature="Controlled"
            title="You own the state"
            blurb="Drive open/closed from your own state with open + onOpenChange."
          >
            <ControlledDemo />
          </Card>

          <Card
            feature="Initial focus"
            title="Focus what matters"
            blurb="Send first focus to any element with initialFocusRef."
          >
            <InitialFocusDemo />
          </Card>

          <Card
            feature="Hook only"
            title="Bring your own markup"
            blurb="Skip the components entirely and spread the prop getters yourself."
          >
            <HookDemo />
          </Card>
        </div>

        <CodeBlock />

        <footer className="footer">
          <p className="footer-text">
            Headless behavior, your design system.{' '}
            <a className="footer-link" href={REPO} target="_blank" rel="noreferrer">
              headless-modal on GitHub
            </a>
            .
          </p>
          <p className="footer-sub">MIT © 2026 kea0811</p>
        </footer>
      </main>
    </div>
  );
}
