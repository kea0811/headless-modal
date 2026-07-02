import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useState,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import { useModal } from './useModal';
import type {
  ModalCloseComponentProps,
  ModalContentComponentProps,
  ModalDescriptionComponentProps,
  ModalOverlayComponentProps,
  ModalPortalProps,
  ModalProps,
  ModalTitleComponentProps,
  ModalTriggerComponentProps,
  UseModalResult,
} from './types';

const ModalContext = createContext<UseModalResult | null>(null);

function useModalContext(component: string): UseModalResult {
  const context = useContext(ModalContext);
  if (context === null) {
    throw new Error(`<${component}> must be rendered inside a <Modal>.`);
  }
  return context;
}

/** Compose any number of refs (function or object) into a single callback ref. */
function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref != null) {
        (ref as { current: T | null }).current = node;
      }
    }
  };
}

/**
 * Context provider that wires up modal behavior via {@link useModal} and shares it
 * with descendant `<Modal*>` parts. Renders no DOM of its own.
 */
export function Modal(props: ModalProps) {
  const { children, ...options } = props;
  const modal = useModal(options);
  return <ModalContext.Provider value={modal}>{children}</ModalContext.Provider>;
}

/** Button that opens the dialog and reports the right ARIA to assistive tech. */
export const ModalTrigger = forwardRef<
  HTMLButtonElement,
  ModalTriggerComponentProps
>(function ModalTrigger({ children, ...rest }, forwardedRef) {
  const { getTriggerProps } = useModalContext('ModalTrigger');
  const { ref, ...triggerProps } = getTriggerProps();
  return (
    <button {...rest} {...triggerProps} ref={mergeRefs(forwardedRef, ref)}>
      {children}
    </button>
  );
});

/**
 * Renders its children into a portal (defaults to `document.body`) while the
 * dialog is open. Nothing is mounted when closed.
 */
export function ModalPortal({ container, children }: ModalPortalProps) {
  const { open } = useModalContext('ModalPortal');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) {
    return null;
  }
  return createPortal(children, container ?? document.body);
}

/**
 * The backdrop behind the dialog. Clicking it (but not its children) closes the
 * dialog when `closeOnOverlayClick` is enabled.
 */
export const ModalOverlay = forwardRef<
  HTMLDivElement,
  ModalOverlayComponentProps
>(function ModalOverlay({ children, ...rest }, forwardedRef) {
  const { getOverlayProps } = useModalContext('ModalOverlay');
  return (
    <div {...rest} {...getOverlayProps()} ref={forwardedRef}>
      {children}
    </div>
  );
});

/** The dialog surface. Traps focus, carries the ARIA, and handles `Tab` wrapping. */
export const ModalContent = forwardRef<
  HTMLDivElement,
  ModalContentComponentProps
>(function ModalContent({ children, ...rest }, forwardedRef) {
  const { getContentProps } = useModalContext('ModalContent');
  const { ref, ...contentProps } = getContentProps();
  return (
    <div {...rest} {...contentProps} ref={mergeRefs(forwardedRef, ref)}>
      {children}
    </div>
  );
});

/** Accessible title for the dialog — links itself via `aria-labelledby`. */
export const ModalTitle = forwardRef<
  HTMLHeadingElement,
  ModalTitleComponentProps
>(function ModalTitle({ children, ...rest }, forwardedRef) {
  const { getTitleProps, registerTitle } = useModalContext('ModalTitle');
  useEffect(() => registerTitle(), [registerTitle]);
  return (
    <h2 {...rest} {...getTitleProps()} ref={forwardedRef}>
      {children}
    </h2>
  );
});

/** Supporting description for the dialog — links itself via `aria-describedby`. */
export const ModalDescription = forwardRef<
  HTMLParagraphElement,
  ModalDescriptionComponentProps
>(function ModalDescription({ children, ...rest }, forwardedRef) {
  const { getDescriptionProps, registerDescription } =
    useModalContext('ModalDescription');
  useEffect(() => registerDescription(), [registerDescription]);
  return (
    <p {...rest} {...getDescriptionProps()} ref={forwardedRef}>
      {children}
    </p>
  );
});

/** Button that closes the dialog. */
export const ModalClose = forwardRef<HTMLButtonElement, ModalCloseComponentProps>(
  function ModalClose({ children, ...rest }, forwardedRef) {
    const { getCloseProps } = useModalContext('ModalClose');
    return (
      <button {...rest} {...getCloseProps()} ref={forwardedRef}>
        {children}
      </button>
    );
  },
);
