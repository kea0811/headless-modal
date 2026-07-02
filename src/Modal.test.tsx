import { StrictMode, useRef, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  ModalTrigger,
} from './Modal';
import type { UseModalOptions } from './types';

interface DialogHarnessProps {
  modal?: UseModalOptions;
  withTitle?: boolean;
  withDescription?: boolean;
  empty?: boolean;
  container?: HTMLElement;
  children?: ReactNode;
}

function DialogHarness({
  modal,
  withTitle,
  withDescription,
  empty,
  container,
}: DialogHarnessProps) {
  return (
    <Modal {...modal}>
      <ModalTrigger>Open</ModalTrigger>
      <ModalPortal container={container}>
        <ModalOverlay data-testid="overlay">
          <ModalContent data-testid="content">
            {withTitle && <ModalTitle>Title</ModalTitle>}
            {withDescription && <ModalDescription>Details</ModalDescription>}
            {!empty && (
              <>
                <button data-testid="first">First</button>
                <button data-testid="second">Second</button>
                <ModalClose>Close</ModalClose>
              </>
            )}
          </ModalContent>
        </ModalOverlay>
      </ModalPortal>
    </Modal>
  );
}

function openViaTrigger() {
  fireEvent.click(screen.getByText('Open'));
}

// Reset body styles before each test — testing-library's afterEach cleanup
// unmounts open dialogs, whose scroll-lock teardown restores whatever body
// padding was captured at effect time, so a leftover can otherwise leak forward.
beforeEach(() => {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
});

describe('Modal components — open / close plumbing', () => {
  it('is closed until the trigger opens it, then closes via the close button', () => {
    render(<DialogHarness />);
    expect(screen.queryByTestId('content')).toBeNull();

    openViaTrigger();
    expect(screen.getByTestId('content')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('wires the trigger aria-controls to the content only when open', () => {
    render(<DialogHarness />);
    const trigger = screen.getByText('Open');
    expect(trigger).not.toHaveAttribute('aria-controls');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    openViaTrigger();
    const content = screen.getByTestId('content');
    expect(trigger).toHaveAttribute('aria-controls', content.id);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('links aria-labelledby / aria-describedby to the rendered title + description', () => {
    render(<DialogHarness withTitle withDescription modal={{ defaultOpen: true }} />);
    const content = screen.getByTestId('content');
    expect(content).toHaveAttribute('aria-labelledby', screen.getByText('Title').id);
    expect(content).toHaveAttribute(
      'aria-describedby',
      screen.getByText('Details').id,
    );
  });

  it('omits aria links when no title/description are present', () => {
    render(<DialogHarness modal={{ defaultOpen: true }} />);
    const content = screen.getByTestId('content');
    expect(content).not.toHaveAttribute('aria-labelledby');
    expect(content).not.toHaveAttribute('aria-describedby');
  });

  it('drops the aria link when the title unmounts', () => {
    const { rerender } = render(
      <DialogHarness withTitle modal={{ defaultOpen: true }} />,
    );
    expect(screen.getByTestId('content')).toHaveAttribute('aria-labelledby');

    rerender(<DialogHarness modal={{ defaultOpen: true }} />);
    expect(screen.getByTestId('content')).not.toHaveAttribute('aria-labelledby');
  });
});

describe('Modal components — dismissal behavior', () => {
  it('closes on Escape and preventDefaults it', () => {
    render(<DialogHarness modal={{ defaultOpen: true }} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('ignores non-Escape keys at the document level', () => {
    render(<DialogHarness modal={{ defaultOpen: true }} />);
    fireEvent.keyDown(document, { key: 'a' });
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('does not close on Escape when closeOnEscape is false', () => {
    render(<DialogHarness modal={{ defaultOpen: true, closeOnEscape: false }} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('closes when the overlay itself is clicked', () => {
    render(<DialogHarness modal={{ defaultOpen: true }} />);
    fireEvent.click(screen.getByTestId('overlay'));
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('stays open when a click originates inside the content', () => {
    render(<DialogHarness modal={{ defaultOpen: true }} />);
    fireEvent.click(screen.getByTestId('content'));
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('does not close on overlay click when closeOnOverlayClick is false', () => {
    render(
      <DialogHarness modal={{ defaultOpen: true, closeOnOverlayClick: false }} />,
    );
    fireEvent.click(screen.getByTestId('overlay'));
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});

describe('Modal components — focus management', () => {
  it('focuses the first focusable element on open', () => {
    render(<DialogHarness modal={{ defaultOpen: true }} />);
    expect(screen.getByTestId('first')).toHaveFocus();
  });

  it('falls back to the content element when nothing is focusable', () => {
    render(<DialogHarness empty modal={{ defaultOpen: true }} />);
    expect(screen.getByTestId('content')).toHaveFocus();
  });

  it('honors an explicit initialFocusRef', () => {
    function WithInitialFocus() {
      const ref = useRef<HTMLButtonElement>(null);
      return (
        <Modal defaultOpen initialFocusRef={ref}>
          <ModalPortal>
            <ModalOverlay>
              <ModalContent>
                <button data-testid="first">First</button>
                <button ref={ref} data-testid="target">
                  Target
                </button>
              </ModalContent>
            </ModalOverlay>
          </ModalPortal>
        </Modal>
      );
    }
    render(<WithInitialFocus />);
    expect(screen.getByTestId('target')).toHaveFocus();
  });

  it('returns focus to the trigger on close', () => {
    render(<DialogHarness />);
    const trigger = screen.getByText('Open');
    openViaTrigger();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger).toHaveFocus();
  });

  it('does not return focus when returnFocus is false', () => {
    render(<DialogHarness modal={{ returnFocus: false }} />);
    const trigger = screen.getByText('Open');
    openViaTrigger();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger).not.toHaveFocus();
  });

  it('does not throw returning focus when there is no trigger', () => {
    render(
      <Modal defaultOpen>
        <ModalPortal>
          <ModalOverlay>
            <ModalContent>
              <ModalClose>Close</ModalClose>
            </ModalContent>
          </ModalOverlay>
        </ModalPortal>
      </Modal>,
    );
    expect(() => fireEvent.click(screen.getByText('Close'))).not.toThrow();
  });
});

describe('Modal components — focus trap (Tab handling)', () => {
  function setup(modal?: UseModalOptions) {
    render(<DialogHarness modal={{ defaultOpen: true, ...modal }} />);
    return {
      content: screen.getByTestId('content'),
      first: screen.getByTestId('first'),
      second: screen.getByTestId('second'),
      close: screen.getByText('Close'),
    };
  }

  it('wraps forward from the last element to the first', () => {
    const { content, first, close } = setup();
    close.focus();
    fireEvent.keyDown(content, { key: 'Tab' });
    expect(first).toHaveFocus();
  });

  it('wraps backward from the first element to the last', () => {
    const { content, first, close } = setup();
    first.focus();
    fireEvent.keyDown(content, { key: 'Tab', shiftKey: true });
    expect(close).toHaveFocus();
  });

  it('pulls stray forward focus back to the first element', () => {
    const { content, first } = setup();
    (document.activeElement as HTMLElement | null)?.blur();
    fireEvent.keyDown(content, { key: 'Tab' });
    expect(first).toHaveFocus();
  });

  it('pulls stray backward focus onto the last element', () => {
    const { content, close } = setup();
    (document.activeElement as HTMLElement | null)?.blur();
    fireEvent.keyDown(content, { key: 'Tab', shiftKey: true });
    expect(close).toHaveFocus();
  });

  it('leaves interior Tab / Shift+Tab to the browser', () => {
    const { content, first, second } = setup();
    first.focus();
    fireEvent.keyDown(content, { key: 'Tab' });
    expect(first).toHaveFocus();

    second.focus();
    fireEvent.keyDown(content, { key: 'Tab', shiftKey: true });
    expect(second).toHaveFocus();
  });

  it('keeps focus pinned when there is nothing to tab to', () => {
    render(<DialogHarness empty modal={{ defaultOpen: true }} />);
    const content = screen.getByTestId('content');
    const prevented = !fireEvent.keyDown(content, { key: 'Tab' });
    expect(prevented).toBe(true);
    expect(content).toHaveFocus();
  });

  it('ignores non-Tab keys on the content', () => {
    const { content, first } = setup();
    first.focus();
    fireEvent.keyDown(content, { key: 'a' });
    expect(first).toHaveFocus();
  });

  it('does nothing when trapFocus is disabled', () => {
    const { content, close } = setup({ trapFocus: false });
    close.focus();
    const prevented = !fireEvent.keyDown(content, { key: 'Tab' });
    expect(prevented).toBe(false);
    expect(close).toHaveFocus();
  });
});

describe('Modal components — scroll lock', () => {
  it('locks the body and compensates for the scrollbar while open', () => {
    render(<DialogHarness modal={{ defaultOpen: true }} />);
    expect(document.body.style.overflow).toBe('hidden');
    // jsdom reports innerWidth 1024 and clientWidth 0 -> a positive scrollbar width.
    expect(document.body.style.paddingRight).not.toBe('');
  });

  it('adds the scrollbar width on top of existing body padding', () => {
    document.body.style.paddingRight = '8px';
    try {
      render(<DialogHarness modal={{ defaultOpen: true }} />);
      expect(document.body.style.paddingRight).toBe('1032px');
    } finally {
      document.body.style.paddingRight = '';
    }
  });

  it('skips scrollbar compensation when there is no scrollbar', () => {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: window.innerWidth,
    });
    try {
      render(<DialogHarness modal={{ defaultOpen: true }} />);
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.style.paddingRight).toBe('');
    } finally {
      delete (document.documentElement as unknown as { clientWidth?: number })
        .clientWidth;
    }
  });

  it('does not lock scroll when lockScroll is false', () => {
    render(<DialogHarness modal={{ defaultOpen: true, lockScroll: false }} />);
    expect(document.body.style.overflow).toBe('');
  });

  it('restores the body scroll on close', () => {
    render(<DialogHarness modal={{ defaultOpen: true }} />);
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.body.style.overflow).toBe('');
  });
});

describe('Modal components — portal, refs, context', () => {
  it('portals into a custom container when provided', () => {
    const container = document.createElement('div');
    container.id = 'portal-host';
    document.body.appendChild(container);
    try {
      render(<DialogHarness container={container} modal={{ defaultOpen: true }} />);
      expect(container.querySelector('[data-testid="content"]')).not.toBeNull();
    } finally {
      container.remove();
    }
  });

  it('forwards a ref object through to the content node', () => {
    function WithContentRef() {
      const ref = useRef<HTMLDivElement>(null);
      return (
        <Modal defaultOpen>
          <ModalPortal>
            <ModalOverlay>
              <ModalContent ref={ref}>
                <span>Hi</span>
                <span data-ref-target />
              </ModalContent>
            </ModalOverlay>
          </ModalPortal>
        </Modal>
      );
    }
    render(<WithContentRef />);
    expect(screen.getByText('Hi').closest('[role="dialog"]')).not.toBeNull();
  });

  it('throws a helpful error when a part is used outside <Modal>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<ModalContent>orphan</ModalContent>)).toThrow(
        '<ModalContent> must be rendered inside a <Modal>.',
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('survives React StrictMode (double-invoked effects and refs)', () => {
    render(
      <StrictMode>
        <DialogHarness />
      </StrictMode>,
    );
    openViaTrigger();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('first')).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('content')).toBeNull();
    expect(screen.getByText('Open')).toHaveFocus();
  });
});
