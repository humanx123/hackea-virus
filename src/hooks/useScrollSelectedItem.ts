import { useLayoutEffect, useRef, type MutableRefObject } from 'react';

interface ScrollSelectedItemOptions {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
}

/**
 * Keeps the selected item visible inside the nearest scrollable ancestor.
 * Used by the gamepad-driven menus so the page follows the selection.
 */
export function useScrollSelectedItem<T extends HTMLElement>(
  selectedIndex: number,
  itemRefs: MutableRefObject<Array<T | null>>,
  options: ScrollSelectedItemOptions = {},
) {
  const {
    behavior = 'smooth',
    block = 'center',
    inline = 'nearest',
  } = options;

  const didMountRef = useRef(false);

  useLayoutEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const el = itemRefs.current[selectedIndex];
    if (!el) return;

    el.scrollIntoView({ behavior, block, inline });
  }, [behavior, block, inline, itemRefs, selectedIndex]);
}
