import { useRef, type ReactNode } from 'react';
import type { GamepadInput } from '../types';
import type { KeyboardInput } from '../hooks/useKeyboardControls';
import { useControllerScroll } from '../hooks/useControllerScroll';
import { displaySizes } from '../styles/sizes';

export interface ControlHint {
  keys: string;
  label: string;
}

interface ScreenFrameProps {
  title: string;
  subtitle?: string;
  controls: ControlHint[];
  children: ReactNode;
  /** Max width of the content area. Default 1600. */
  contentMaxWidth?: number;
  /** Center content vertically (for short content like menus). */
  center?: boolean;
  /** Optional controller input to auto-scroll long screens. */
  gamepadInput?: GamepadInput;
  /** Optional keyboard input to auto-scroll long screens. */
  keyboardInput?: KeyboardInput;
}

/**
 * Standard page chrome shared by every screen: a consistent header
 * (title + optional subtitle), a flexible content area, and a fixed
 * control bar at the bottom. Keeps spacing, colors and typography
 * homogeneous across the whole app.
 */
export function ScreenFrame({
  title,
  subtitle,
  controls,
  children,
  contentMaxWidth = 1600,
  center = false,
  gamepadInput,
  keyboardInput,
}: ScreenFrameProps) {
  const mainRef = useRef<HTMLElement>(null);

  useControllerScroll({
    containerRef: mainRef,
    gamepadInput,
    keyboardInput,
    enabled: Boolean(gamepadInput || keyboardInput),
  });

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        color: '#0f0',
        fontFamily: '"Courier New", monospace',
        padding: `${displaySizes.largePadding} ${displaySizes.hugePadding} 0`,
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <header style={{ textAlign: 'center', flexShrink: 0 }}>
        <h1
          style={{
            fontSize: displaySizes.sectionTitle,
            margin: 0,
            fontWeight: 'bold',
            textShadow: '0 0 18px #0f0',
            letterSpacing: '2px',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <div
            style={{
              fontSize: displaySizes.largeText,
              color: '#0a0',
              marginTop: displaySizes.smallPadding,
            }}
          >
            {subtitle}
          </div>
        )}
      </header>

      {/* Content */}
      <main
        ref={mainRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          scrollBehavior: 'smooth',
          scrollPaddingTop: displaySizes.largePadding,
          scrollPaddingBottom: displaySizes.largePadding,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: center ? 'center' : 'flex-start',
          alignItems: 'center',
          padding: `${displaySizes.largePadding} 0`,
        }}
      >
        <div style={{ width: '100%', maxWidth: `${contentMaxWidth}px` }}>{children}</div>
      </main>

      {/* Control bar */}
      <footer
        style={{
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: displaySizes.largeGap,
          flexWrap: 'wrap',
          padding: `${displaySizes.mediumPadding} 0`,
          borderTop: '2px solid #003300',
          backgroundColor: 'rgba(0, 20, 0, 0.6)',
        }}
      >
        {controls.map((c, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: displaySizes.smallPadding,
              fontSize: displaySizes.normalText,
            }}
          >
            <span
              style={{
                color: '#0f0',
                fontWeight: 'bold',
                border: '2px solid #0f0',
                borderRadius: '6px',
                padding: '4px 14px',
                textShadow: '0 0 6px #0f0',
                minWidth: '40px',
                textAlign: 'center',
              }}
            >
              {c.keys}
            </span>
            <span style={{ color: '#0a0' }}>{c.label}</span>
          </div>
        ))}
      </footer>
    </div>
  );
}
