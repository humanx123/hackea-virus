import { useEffect, useState, useCallback } from 'react';
import type { GamepadInput } from '../types';

const DEADZONE = 0.15;

export function useGamepad() {
  const [input, setInput] = useState<GamepadInput>({
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
  });

  const [gamepadConnected, setGamepadConnected] = useState(false);

  const applyDeadzone = useCallback((value: number): number => {
    return Math.abs(value) < DEADZONE ? 0 : value;
  }, []);

  const handleGamepadInput = useCallback(() => {
    const gamepads = navigator.getGamepads?.();
    if (!gamepads || gamepads.length === 0) {
      if (gamepadConnected) {
        setGamepadConnected(false);
        setInput(prev => ({ ...prev, gamepadConnected: false }));
      }
      return;
    }

    const gamepad = gamepads[0];
    if (!gamepad) {
      if (gamepadConnected) {
        setGamepadConnected(false);
        setInput(prev => ({ ...prev, gamepadConnected: false }));
      }
      return;
    }

    if (!gamepadConnected) {
      setGamepadConnected(true);
    }

    // Button mapping for Xbox controller:
    // 0 = A, 1 = B, 2 = X, 3 = Y
    // 4 = LB, 5 = RB
    // 6 = LT, 7 = RT
    // 8 = Back/View, 9 = Start
    // 10 = Left Stick Click, 11 = Right Stick Click

    setInput({
      aPressed: gamepad.buttons[0]?.pressed ?? false,
      bPressed: gamepad.buttons[1]?.pressed ?? false,
      xPressed: gamepad.buttons[2]?.pressed ?? false,
      yPressed: gamepad.buttons[3]?.pressed ?? false,
      dpadUp: gamepad.buttons[12]?.pressed ?? false,
      dpadDown: gamepad.buttons[13]?.pressed ?? false,
      dpadLeft: gamepad.buttons[14]?.pressed ?? false,
      dpadRight: gamepad.buttons[15]?.pressed ?? false,
      leftStickX: applyDeadzone(gamepad.axes[0] ?? 0),
      leftStickY: applyDeadzone(gamepad.axes[1] ?? 0),
      rightStickX: applyDeadzone(gamepad.axes[2] ?? 0),
      rightStickY: applyDeadzone(gamepad.axes[3] ?? 0),
      lbPressed: gamepad.buttons[4]?.pressed ?? false,
      rbPressed: gamepad.buttons[5]?.pressed ?? false,
      ltValue: gamepad.buttons[6]?.value ?? 0,
      rtValue: gamepad.buttons[7]?.value ?? 0,
      selectPressed: gamepad.buttons[8]?.pressed ?? false,
      startPressed: gamepad.buttons[9]?.pressed ?? false,
      gamepadConnected: true,
    });
  }, [gamepadConnected, applyDeadzone]);

  useEffect(() => {
    const interval = setInterval(handleGamepadInput, 16);
    return () => clearInterval(interval);
  }, [handleGamepadInput]);

  return input;
}
