import { useEffect, useRef, useState } from 'react';

interface MenuNavOptions {
  itemCount: number;
  orientation?: 'horizontal' | 'vertical';
  gamepadInput: any;
  keyboardInput: any;
  onSelect: (index: number) => void;
  onCancel?: () => void;
  onExtra?: () => void; // Y button (e.g. info)
  wrap?: boolean;
}

/**
 * Unified menu navigation used by every selection screen so the feel
 * (debounce timing, analog-stick support, "armed" A/B/Y) is identical.
 *
 * "Armed" = a button must be seen released once before it fires, which
 * prevents a held button from cascading across freshly mounted screens.
 */
export function useMenuNav({
  itemCount,
  orientation = 'vertical',
  gamepadInput,
  keyboardInput,
  onSelect,
  onCancel,
  onExtra,
  wrap = true,
}: MenuNavOptions) {
  const [index, setIndex] = useState(0);
  const lastNavRef = useRef(0);
  const armed = useRef({ a: false, b: false, y: false });

  // Keep index valid if the list size changes.
  useEffect(() => {
    setIndex(i => Math.max(0, Math.min(i, itemCount - 1)));
  }, [itemCount]);

  // Directional navigation (d-pad + analog stick), consistent debounce.
  useEffect(() => {
    if (itemCount <= 0) return;
    const NAV_DELAY = 220;
    const now = Date.now();

    let dir = 0;
    if (orientation === 'vertical') {
      const up = gamepadInput.dpadUp || keyboardInput.dpadUp || (gamepadInput.leftStickY ?? 0) < -0.5;
      const down = gamepadInput.dpadDown || keyboardInput.dpadDown || (gamepadInput.leftStickY ?? 0) > 0.5;
      if (up) dir = -1;
      else if (down) dir = 1;
    } else {
      const left = gamepadInput.dpadLeft || keyboardInput.dpadLeft || (gamepadInput.leftStickX ?? 0) < -0.5;
      const right = gamepadInput.dpadRight || keyboardInput.dpadRight || (gamepadInput.leftStickX ?? 0) > 0.5;
      if (left) dir = -1;
      else if (right) dir = 1;
    }

    if (dir !== 0 && now - lastNavRef.current > NAV_DELAY) {
      lastNavRef.current = now;
      setIndex(prev => {
        let n = prev + dir;
        if (wrap) n = (n + itemCount) % itemCount;
        else n = Math.max(0, Math.min(itemCount - 1, n));
        return n;
      });
    }
  }, [gamepadInput, keyboardInput, orientation, itemCount, wrap]);

  // A = select (armed)
  useEffect(() => {
    const pressed = gamepadInput.aPressed || keyboardInput.aPressed;
    if (!pressed) { armed.current.a = true; return; }
    if (armed.current.a) { armed.current.a = false; onSelect(index); }
  }, [gamepadInput.aPressed, keyboardInput.aPressed, index, onSelect]);

  // B = cancel (armed)
  useEffect(() => {
    if (!onCancel) return;
    const pressed = gamepadInput.bPressed || keyboardInput.bPressed;
    if (!pressed) { armed.current.b = true; return; }
    if (armed.current.b) { armed.current.b = false; onCancel(); }
  }, [gamepadInput.bPressed, keyboardInput.bPressed, onCancel]);

  // Y = extra (armed)
  useEffect(() => {
    if (!onExtra) return;
    const pressed = gamepadInput.yPressed || keyboardInput.yPressed;
    if (!pressed) { armed.current.y = true; return; }
    if (armed.current.y) { armed.current.y = false; onExtra(); }
  }, [gamepadInput.yPressed, keyboardInput.yPressed, onExtra]);

  return { index, setIndex };
}
