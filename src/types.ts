import type {
  HTMLAttributes,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
  RefCallback,
  RefObject,
} from 'react';

/** ARIA role for the dialog surface. `alertdialog` interrupts and demands a response. */
export type ModalRole = 'dialog' | 'alertdialog';

/** Options accepted by {@link useModal}. */
export interface UseModalOptions {
  /** Controlled open state. Pass together with `onOpenChange`. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. Ignored when `open` is provided. */
  defaultOpen?: boolean;
  /** Called with the next open state whenever it changes. */
  onOpenChange?: (open: boolean) => void;
  /** Close when the user presses `Escape`. Defaults to `true`. */
  closeOnEscape?: boolean;
  /** Close when the user clicks the overlay (outside the content). Defaults to `true`. */
  closeOnOverlayClick?: boolean;
  /** Keep keyboard focus inside the dialog while it is open. Defaults to `true`. */
  trapFocus?: boolean;
  /** Lock body scroll while the dialog is open. Defaults to `true`. */
  lockScroll?: boolean;
  /** Return focus to the trigger when the dialog closes. Defaults to `true`. */
  returnFocus?: boolean;
  /** Element to focus first when the dialog opens. Defaults to the first focusable, then the content. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** ARIA role for the content. Defaults to `'dialog'`. */
  role?: ModalRole;
}

/** Props to spread onto the element that opens the dialog. */
export interface ModalTriggerProps {
  ref: RefCallback<HTMLElement>;
  type: 'button';
  'aria-haspopup': 'dialog';
  'aria-expanded': boolean;
  'aria-controls': string | undefined;
  onClick: MouseEventHandler<HTMLElement>;
}

/** Props to spread onto the backdrop / overlay element. */
export interface ModalOverlayProps {
  'data-state': 'open' | 'closed';
  onClick: MouseEventHandler<HTMLElement>;
}

/** Props to spread onto the dialog content element. */
export interface ModalContentProps {
  id: string;
  role: ModalRole;
  'aria-modal': true;
  'aria-labelledby': string | undefined;
  'aria-describedby': string | undefined;
  'data-state': 'open' | 'closed';
  tabIndex: -1;
  ref: RefCallback<HTMLElement>;
  onKeyDown: KeyboardEventHandler<HTMLElement>;
}

/** Props to spread onto the title element. */
export interface ModalTitleProps {
  id: string;
}

/** Props to spread onto the description element. */
export interface ModalDescriptionProps {
  id: string;
}

/** Props to spread onto a close button. */
export interface ModalCloseProps {
  type: 'button';
  onClick: MouseEventHandler<HTMLElement>;
}

/** Everything {@link useModal} returns. */
export interface UseModalResult {
  /** Whether the dialog is currently open. */
  open: boolean;
  /** Imperatively set the open state (respects controlled mode). */
  setOpen: (open: boolean) => void;
  /** Convenience: open the dialog. */
  openModal: () => void;
  /** Convenience: close the dialog. */
  closeModal: () => void;
  /** Convenience: flip the open state. */
  toggle: () => void;
  /** Stable id assigned to the content element. */
  contentId: string;
  /** Stable id used to link the title (via `aria-labelledby`). */
  titleId: string;
  /** Stable id used to link the description (via `aria-describedby`). */
  descriptionId: string;
  /** Register a rendered title so the content advertises `aria-labelledby`. Returns an unregister fn. */
  registerTitle: () => () => void;
  /** Register a rendered description so the content advertises `aria-describedby`. Returns an unregister fn. */
  registerDescription: () => () => void;
  /** Spread onto the trigger element. */
  getTriggerProps: () => ModalTriggerProps;
  /** Spread onto the overlay element. */
  getOverlayProps: () => ModalOverlayProps;
  /** Spread onto the content element. */
  getContentProps: () => ModalContentProps;
  /** Spread onto the title element. */
  getTitleProps: () => ModalTitleProps;
  /** Spread onto the description element. */
  getDescriptionProps: () => ModalDescriptionProps;
  /** Spread onto a close button. */
  getCloseProps: () => ModalCloseProps;
}

/** Shared config props accepted by `<Modal>`. */
export interface ModalProps extends UseModalOptions {
  children?: ReactNode;
}

/** Props for `<ModalTrigger>`. */
export interface ModalTriggerComponentProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children?: ReactNode;
}

/** Props for `<ModalPortal>`. */
export interface ModalPortalProps {
  /** DOM node to portal into. Defaults to `document.body`. */
  container?: HTMLElement;
  children?: ReactNode;
}

/** Props for `<ModalOverlay>`. */
export interface ModalOverlayComponentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  children?: ReactNode;
}

/** Props for `<ModalContent>`. */
export interface ModalContentComponentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onKeyDown'> {
  children?: ReactNode;
}

/** Props for `<ModalTitle>`. */
export interface ModalTitleComponentProps
  extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
}

/** Props for `<ModalDescription>`. */
export interface ModalDescriptionComponentProps
  extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
}

/** Props for `<ModalClose>`. */
export interface ModalCloseComponentProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children?: ReactNode;
}
