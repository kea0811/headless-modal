import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useModal } from './useModal';

describe('useModal (hook units)', () => {
  it('defaults to closed with a dialog role and no aria links', () => {
    const { result } = renderHook(() => useModal());
    const content = result.current.getContentProps();

    expect(result.current.open).toBe(false);
    expect(content.role).toBe('dialog');
    expect(content['aria-modal']).toBe(true);
    expect(content.tabIndex).toBe(-1);
    expect(content['data-state']).toBe('closed');
    expect(content['aria-labelledby']).toBeUndefined();
    expect(content['aria-describedby']).toBeUndefined();
    expect(result.current.getOverlayProps()['data-state']).toBe('closed');
  });

  it('honors an explicit alertdialog role', () => {
    const { result } = renderHook(() => useModal({ role: 'alertdialog' }));
    expect(result.current.getContentProps().role).toBe('alertdialog');
  });

  it('opens uncontrolled and fires onOpenChange only on a real change', () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useModal({ onOpenChange }));

    // Setting to the current value (false -> false) must not fire onOpenChange.
    act(() => result.current.setOpen(false));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(result.current.open).toBe(false);

    act(() => result.current.setOpen(true));
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(result.current.open).toBe(true);
  });

  it('works without an onOpenChange handler', () => {
    const { result } = renderHook(() => useModal());
    act(() => result.current.openModal());
    expect(result.current.open).toBe(true);
  });

  it('supports openModal / closeModal / toggle', () => {
    const { result } = renderHook(() => useModal());

    act(() => result.current.toggle());
    expect(result.current.open).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.open).toBe(false);

    act(() => result.current.openModal());
    expect(result.current.open).toBe(true);
    act(() => result.current.closeModal());
    expect(result.current.open).toBe(false);
  });

  it('starts open when defaultOpen is set', () => {
    const { result } = renderHook(() => useModal({ defaultOpen: true }));
    expect(result.current.open).toBe(true);
  });

  it('respects controlled mode (ignores internal state changes)', () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useModal({ open: true, onOpenChange }),
    );
    expect(result.current.open).toBe(true);

    // In controlled mode setOpen never mutates internal state; it just reports.
    act(() => result.current.setOpen(false));
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(result.current.open).toBe(true);
  });

  it('exposes stable ids and prop-getter wiring', () => {
    const { result } = renderHook(() => useModal());
    const { contentId, titleId, descriptionId } = result.current;

    expect(result.current.getContentProps().id).toBe(contentId);
    expect(result.current.getTitleProps().id).toBe(titleId);
    expect(result.current.getDescriptionProps().id).toBe(descriptionId);
    expect(contentId).not.toBe(titleId);
  });

  it('advertises aria links only while a title/description is registered', () => {
    const { result } = renderHook(() => useModal());
    const { titleId, descriptionId } = result.current;

    let unregisterTitle = () => {};
    let unregisterDescription = () => {};
    act(() => {
      unregisterTitle = result.current.registerTitle();
      unregisterDescription = result.current.registerDescription();
    });

    let content = result.current.getContentProps();
    expect(content['aria-labelledby']).toBe(titleId);
    expect(content['aria-describedby']).toBe(descriptionId);

    act(() => {
      unregisterTitle();
      unregisterDescription();
    });

    content = result.current.getContentProps();
    expect(content['aria-labelledby']).toBeUndefined();
    expect(content['aria-describedby']).toBeUndefined();
  });

  it('close button and trigger prop-getters carry the right attributes', () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.getCloseProps().type).toBe('button');

    const closed = result.current.getTriggerProps();
    expect(closed['aria-haspopup']).toBe('dialog');
    expect(closed['aria-expanded']).toBe(false);
    expect(closed['aria-controls']).toBeUndefined();

    act(() => result.current.openModal());
    const open = result.current.getTriggerProps();
    expect(open['aria-expanded']).toBe(true);
    expect(open['aria-controls']).toBe(result.current.contentId);
  });
});
