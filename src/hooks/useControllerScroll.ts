import { useEffect, useRef } from 'react';
import type { GamepadInput } from '../types';
import type { KeyboardInput } from './useKeyboardControls';

interface UseControllerScrollOptions {
  containerRef: { current: HTMLElement | null };
  gamepadInput?: GamepadInput;
  keyboardInput?: KeyboardInput;
  axis?: 'vertical' | 'horizontal';
  enabled?: boolean;
  speed?: number;
  deadzone?: number;
}

const DEFAULT_GAMEPAD: GamepadInput = {
  aPressed: false,
  bPressed: false,
  xPressed: false,
  yPressed: false,
  dpadUp: false,
  dpadDown: false,
  dpadLeft: false,
  dpadRight: false,
  leftStickX: 0,
  leftStickY: 0,
  rightStickX: 0,
  rightStickY: 0,
  lbPressed: false,
  rbPressed: false,
  ltValue: 0,
  rtValue: 0,
  startPressed: false,
  selectPressed: false,
  gamepadConnected: false,
};

const DEFAULT_KEYBOARD: KeyboardInput = {
  aPressed: false,
  bPressed: false,
  xPressed: false,
  yPressed: false,
  dpadUp: false,
  dpadDown: false,
  dpadLeft: false,
  dpadRight: false,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function useControllerScroll({
  containerRef,
  gamepadInput,
  keyboardInput,
  axis = 'vertical',
  enabled = true,
  speed = 900,
  deadzone = 0.45,
}: UseControllerScrollOptions) {
  const inputRef = useRef({ gamepadInput, keyboardInput });
  inputRef.current = { gamepadInput, keyboardInput };

  useEffect(() => {
    if (!enabled) return;

    let animationId = 0;
    let lastTimestamp = performance.now();

    const getDirection = () => {
      const gp = inputRef.current.gamepadInput ?? DEFAULT_GAMEPAD;
      const kb = inputRef.current.keyboardInput ?? DEFAULT_KEYBOARD;

      if (axis === 'vertical') {
        if (gp.dpadUp || kb.dpadUp) return { direction: -1, intensity: 1 };
        if (gp.dpadDown || kb.dpadDown) return { direction: 1, intensity: 1 };

        const raw = gp.leftStickY ?? 0;
        if (Math.abs(raw) > deadzone) {
          return {
            direction: raw > 0 ? 1 : -1,
            intensity: clamp(Math.abs(raw), 0.35, 1),
          };
        }
      } else {
        if (gp.dpadLeft || kb.dpadLeft) return { direction: -1, intensity: 1 };
        if (gp.dpadRight || kb.dpadRight) return { direction: 1, intensity: 1 };

        const raw = gp.leftStickX ?? 0;
        if (Math.abs(raw) > deadzone) {
          return {
            direction: raw > 0 ? 1 : -1,
            intensity: clamp(Math.abs(raw), 0.35, 1),
          };
        }
      }

      return { direction: 0, intensity: 0 };
    };

    const tick = (timestamp: number) => {
      const el = containerRef.current;
      if (el) {
        const { direction, intensity } = getDirection();
        if (direction !== 0) {
          const delta = speed * intensity * ((timestamp - lastTimestamp) / 1000);
          if (axis === 'vertical') {
            const maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
            if (maxScrollTop > 0) {
              el.scrollTop = clamp(el.scrollTop + direction * delta, 0, maxScrollTop);
            }
          } else {
            const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
            if (maxScrollLeft > 0) {
              el.scrollLeft = clamp(el.scrollLeft + direction * delta, 0, maxScrollLeft);
            }
          }
        }
      }

      lastTimestamp = timestamp;
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [axis, containerRef, deadzone, enabled, speed]);
}
