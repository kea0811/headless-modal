import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type RefCallback,
} from 'react';
import type {
  ModalCloseProps,
  ModalContentProps,
  ModalDescriptionProps,
  ModalOverlayProps,
  ModalTitleProps,
  ModalTriggerProps,
  UseModalOptions,
  UseModalResult,
} from './types';

/** Elements that can receive keyboard focus, in the order the browser tabs through them. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Collect the focusable descendants of `container`, in DOM (tab) order. */
function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

/**
 * Headless engine for an accessible modal dialog. Owns open state (controlled or
 * uncontrolled), focus trapping, focus return, body scroll lock, `Escape`/overlay
 * dismissal, and the WAI-ARIA wiring — and hands back prop getters you spread onto
 * your own elements.
 */
export function useModal(options: UseModalOptions = {}): UseModalResult {
  const {
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    closeOnEscape = true,
    closeOnOverlayClick = true,
    trapFocus = true,
    lockScroll = true,
    returnFocus = true,
    initialFocusRef,
    role = 'dialog',
  } = options;

  const reactId = useId();
  const contentId = `${reactId}-content`;
  const titleId = `${reactId}-title`;
  const descriptionId = `${reactId}-description`;

  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  // Latest open + onOpenChange in refs so `setOpen` can stay referentially stable.
  const openRef = useRef(open);
  openRef.current = open;
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      if (next !== openRef.current) {
        onOpenChangeRef.current?.(next);
      }
    },
    [isControlled],
  );

  const openModal = useCallback(() => setOpen(true), [setOpen]);
  const closeModal = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen(!openRef.current), [setOpen]);

  // The element that opened the dialog — used to return focus on close.
  const triggerRef = useRef<HTMLElement | null>(null);
  const triggerRefCallback = useCallback<RefCallback<HTMLElement>>((node) => {
    triggerRef.current = node;
  }, []);

  // The dialog content node, tracked via state so the focus lifecycle can live
  // entirely inside a single effect (StrictMode-safe — never split setup into a
  // ref callback and teardown into a separate effect).
  const [contentNode, setContentNode] = useState<HTMLElement | null>(null);
  const contentRefCallback = useCallback<RefCallback<HTMLElement>>((node) => {
    setContentNode(node);
  }, []);

  // Title / description presence, so the content only advertises
  // `aria-labelledby` / `aria-describedby` when a matching element is rendered.
  const [titleCount, setTitleCount] = useState(0);
  const [descriptionCount, setDescriptionCount] = useState(0);
  const registerTitle = useCallback(() => {
    setTitleCount((count) => count + 1);
    return () => setTitleCount((count) => count - 1);
  }, []);
  const registerDescription = useCallback(() => {
    setDescriptionCount((count) => count + 1);
    return () => setDescriptionCount((count) => count - 1);
  }, []);

  // Lock body scroll while open, compensating for the removed scrollbar so the
  // page behind the dialog doesn't shift.
  useEffect(() => {
    if (!open || !lockScroll) {
      return;
    }
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      const base = parseFloat(prevPaddingRight) || 0;
      body.style.paddingRight = `${base + scrollbarWidth}px`;
    }
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [open, lockScroll]);

  // Close on Escape from anywhere while open.
  useEffect(() => {
    if (!open || !closeOnEscape) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, closeOnEscape, setOpen]);

  // Move focus into the dialog on open; restore it to the trigger on close.
  useEffect(() => {
    if (!open || !contentNode) {
      return;
    }
    const toRestore = triggerRef.current;
    const explicit = initialFocusRef?.current ?? null;
    const target = explicit ?? getFocusable(contentNode)[0] ?? contentNode;
    target.focus();
    return () => {
      if (returnFocus && toRestore) {
        toRestore.focus();
      }
    };
  }, [open, contentNode, returnFocus, initialFocusRef]);

  const getTriggerProps = useCallback(
    (): ModalTriggerProps => ({
      ref: triggerRefCallback,
      type: 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': open,
      'aria-controls': open ? contentId : undefined,
      onClick: () => setOpen(true),
    }),
    [open, contentId, setOpen, triggerRefCallback],
  );

  const getOverlayProps = useCallback(
    (): ModalOverlayProps => ({
      'data-state': open ? 'open' : 'closed',
      onClick: (event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) {
          setOpen(false);
        }
      },
    }),
    [open, closeOnOverlayClick, setOpen],
  );

  const getContentProps = useCallback(
    (): ModalContentProps => ({
      id: contentId,
      role,
      'aria-modal': true,
      'aria-labelledby': titleCount > 0 ? titleId : undefined,
      'aria-describedby': descriptionCount > 0 ? descriptionId : undefined,
      'data-state': open ? 'open' : 'closed',
      tabIndex: -1,
      ref: contentRefCallback,
      onKeyDown: (event) => {
        if (event.key !== 'Tab' || !trapFocus) {
          return;
        }
        const node = event.currentTarget;
        const focusables = getFocusable(node);
        if (focusables.length === 0) {
          // Nothing to move to — keep focus pinned inside the dialog.
          event.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (event.shiftKey) {
          if (active === first || !node.contains(active)) {
            event.preventDefault();
            last.focus();
          }
        } else if (active === last || !node.contains(active)) {
          event.preventDefault();
          first.focus();
        }
      },
    }),
    [
      contentId,
      role,
      titleCount,
      descriptionCount,
      titleId,
      descriptionId,
      open,
      trapFocus,
      contentRefCallback,
    ],
  );

  const getTitleProps = useCallback(
    (): ModalTitleProps => ({ id: titleId }),
    [titleId],
  );

  const getDescriptionProps = useCallback(
    (): ModalDescriptionProps => ({ id: descriptionId }),
    [descriptionId],
  );

  const getCloseProps = useCallback(
    (): ModalCloseProps => ({ type: 'button', onClick: () => setOpen(false) }),
    [setOpen],
  );

  return {
    open,
    setOpen,
    openModal,
    closeModal,
    toggle,
    contentId,
    titleId,
    descriptionId,
    registerTitle,
    registerDescription,
    getTriggerProps,
    getOverlayProps,
    getContentProps,
    getTitleProps,
    getDescriptionProps,
    getCloseProps,
  };
}
