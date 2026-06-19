import { useEffect, useState, useRef } from 'react';

export interface KeyboardInput {
  aPressed: boolean;
  bPressed: boolean;
  xPressed: boolean;
  yPressed: boolean;
  dpadUp: boolean;
  dpadDown: boolean;
  dpadLeft: boolean;
  dpadRight: boolean;
}

export function useKeyboardControls(): KeyboardInput {
  const [input, setInput] = useState<KeyboardInput>({
    aPressed: false,
    bPressed: false,
    xPressed: false,
    yPressed: false,
    dpadUp: false,
    dpadDown: false,
    dpadLeft: false,
    dpadRight: false,
  });

  const lastPressRef = useRef({
    a: 0,
    b: 0,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const now = Date.now();
      const debounceDelay = 100;

      if (key === 'enter' && now - lastPressRef.current.a > debounceDelay) {
        lastPressRef.current.a = now;
        setInput(prev => ({ ...prev, aPressed: true }));
      } else if (key === 'escape' && now - lastPressRef.current.b > debounceDelay) {
        lastPressRef.current.b = now;
        setInput(prev => ({ ...prev, bPressed: true }));
      } else if (key === 'x' && now - lastPressRef.current.x > debounceDelay) {
        lastPressRef.current.x = now;
        setInput(prev => ({ ...prev, xPressed: true }));
      } else if (key === 'i' && now - lastPressRef.current.y > debounceDelay) {
        lastPressRef.current.y = now;
        setInput(prev => ({ ...prev, yPressed: true }));
      } else if (key === 'arrowup') {
        setInput(prev => ({ ...prev, dpadUp: true }));
      } else if (key === 'arrowdown') {
        setInput(prev => ({ ...prev, dpadDown: true }));
      } else if (key === 'arrowleft') {
        setInput(prev => ({ ...prev, dpadLeft: true }));
      } else if (key === 'arrowright') {
        setInput(prev => ({ ...prev, dpadRight: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      setInput(prev => {
        const newInput = { ...prev };

        if (key === 'enter') {
          newInput.aPressed = false;
        } else if (key === 'escape') {
          newInput.bPressed = false;
        } else if (key === 'x') {
          newInput.xPressed = false;
        } else if (key === 'i') {
          newInput.yPressed = false;
        } else if (key === 'arrowup') {
          newInput.dpadUp = false;
        } else if (key === 'arrowdown') {
          newInput.dpadDown = false;
        } else if (key === 'arrowleft') {
          newInput.dpadLeft = false;
        } else if (key === 'arrowright') {
          newInput.dpadRight = false;
        }

        return newInput;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return input;
}
