import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';

// This deliberately favors the original illustration on phones and smaller devices.
const desktopQuery = '(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

function hasDesktopBudget() {
  const device = navigator as Navigator & { deviceMemory?: number; userAgentData?: { mobile?: boolean } };
  return !device.userAgentData?.mobile
    && !/Android|iPhone|iPad|iPod|Mobile/i.test(device.userAgent)
    && !(device.platform === 'MacIntel' && device.maxTouchPoints > 1)
    && (device.hardwareConcurrency || 4) >= 4
    && (device.deviceMemory ?? 4) >= 4;
}

// Midpoint circle, so the rings share the steeple's pixel-art language.
// Coordinates are cells from the centre of the 320-unit canvas.
function pixelCircle(radius: number) {
  const cells = new Map<string, [number, number]>();
  let x = radius, y = 0, error = 1 - radius;
  while (x >= y) {
    for (const [a, b] of [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]]) cells.set(`${a},${b}`, [a, b]);
    y++;
    if (error < 0) error += 2 * y + 1;
    else {
      x--;
      error += 2 * (y - x) + 1;
    }
  }
  return [...cells.values()];
}

const CELL = 3.5;
const noise = (n: number) => {
  const value = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

// Each pixel has its own moment to go. Mixing noise with a clockwise sweep from the
// top makes the ring unravel rather than blink out evenly.
const ringPixels = pixelCircle(44).map(([a, b], index) => {
  const angle = Math.atan2(b, a);
  const sweep = ((angle + Math.PI / 2) / (Math.PI * 2) + 1) % 1;
  const style = {
    '--t': (.8 * (.55 * noise(index) + .45 * sweep)).toFixed(3),
    '--dx': Math.cos(angle).toFixed(3),
    '--dy': Math.sin(angle).toFixed(3),
  } as CSSProperties;
  return <rect key={index} x={160 + a * CELL - CELL / 2} y={160 + b * CELL - CELL / 2} width={CELL} height={CELL} style={style} />;
});

const socketPixels = pixelCircle(40).flatMap(([a, b], index) => (a + b) % 2
  ? []
  : [<rect key={index} x={160 + a * CELL - CELL / 2} y={160 + b * CELL - CELL / 2} width={CELL} height={CELL} />]);

export default function SteepleToy({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const ball = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLButtonElement>(null);
  const ring = useRef<SVGSVGElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const [active, setActive] = useState(false);
  const [discovered, setDiscovered] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const artwork = root.current?.querySelector<SVGSVGElement>('.steeple-toy__art svg');
    const [container, button, pixels, home] = [ball.current, surface.current, ring.current, anchor.current];
    if (!artwork || !container || !button || !pixels || !home) return;
    const elements = { ball: container, button, ring: pixels, home, artwork };
    const query = matchMedia(desktopQuery);
    let disposed = false;
    let failed = false;
    let generation = 0;
    let stop: (() => void) | undefined;

    const update = () => {
      const current = ++generation;
      stop?.();
      stop = undefined;
      setActive(false);
      setUnlocked(false);
      if (failed || !query.matches || !hasDesktopBudget()) return;
      // No renderer download or WebGL context on the static path.
      void import('../lib/steeple-renderer').then(async ({ mountSteeple }) => {
        if (disposed || current !== generation) return;
        const canvas = document.createElement('canvas');
        canvas.setAttribute('aria-hidden', 'true');
        button.prepend(canvas);
        const abort = new AbortController();
        let release: (() => void) | undefined;
        const cleanup = () => {
          abort.abort();
          release?.();
          canvas.remove();
        };
        stop = cleanup;
        const live = () => !disposed && current === generation;
        const fallback = () => {
          if (!live()) return;
          failed = true;
          setActive(false);
          setUnlocked(false);
          // Let the renderer finish its current callback before releasing resources.
          queueMicrotask(cleanup);
        };
        try {
          release = await mountSteeple(canvas, elements, {
            signal: abort.signal,
            ready: () => { if (live()) setActive(true); },
            discovered: () => { if (live()) setDiscovered(true); },
            unlocked: () => { if (live()) setUnlocked(true); },
            fallback,
          });
          if (abort.signal.aborted) release();
        } catch {
          fallback();
        }
      }).catch(() => { if (!disposed && current === generation) failed = true; });
    };

    update();
    query.addEventListener('change', update);
    return () => {
      disposed = true;
      generation++;
      query.removeEventListener('change', update);
      stop?.();
    };
  }, []);

  return (
    <div className="steeple-toy" ref={root} data-active={active}>
      <div className="steeple-toy__art" aria-hidden={active || undefined}>{children}</div>
      {/* The seat the ball returns to. It shows as an empty socket while the ball is out. */}
      <div className="steeple-toy__anchor" ref={anchor} aria-hidden="true">
        <svg className="steeple-toy__socket" viewBox="0 0 320 320" focusable="false">
          <circle cx="160" cy="160" r="137" />
          <g shapeRendering="crispEdges">{socketPixels}</g>
        </svg>
      </div>
      {/* Stays in the hero's DOM and tab order. Once loose it switches to position: fixed,
          which escapes the banner's overflow as long as no ancestor gains a transform or filter. */}
      <div className="steeple-ball" ref={ball} data-active={active} data-discovered={discovered} data-unlocked={unlocked}>
        <div className="steeple-ball__halo" aria-hidden="true" />
        <div className="steeple-ball__shadow" aria-hidden="true" />
        <svg className="steeple-ball__ring" ref={ring} viewBox="0 0 320 320" aria-hidden="true" focusable="false" shapeRendering="crispEdges">
          {ringPixels}
        </svg>
        <button
          className="steeple-ball__surface"
          ref={surface}
          type="button"
          disabled={!active}
          tabIndex={active ? 0 : -1}
          aria-hidden={!active || undefined}
          aria-label="Play with the Dahlonega stress ball"
          aria-describedby={hintId}
        >
          <span className="steeple-ball__glint" aria-hidden="true" />
        </button>
      </div>
      <p
        key={unlocked ? 'free' : 'home'}
        className="steeple-toy__hint"
        data-free={unlocked}
        aria-hidden="true"
        hidden={!active}
      >
        <span>{unlocked ? 'Throw it anywhere. It comes back.' : 'Drag to spin. Click to squish.'}</span>
      </p>
      <span className="sr-only" id={hintId}>
        Drag to spin and click to squish. Keep playing and the ring around it fades, then the ball can be thrown anywhere on the screen. Arrow keys spin it, or roll it once it is loose. Space or Enter squish it, and Escape or Home bring it back.
      </span>
      <span className="sr-only" role="status">{unlocked ? 'The ring is gone. The ball is loose, and arrow keys now roll it around the screen.' : ''}</span>
    </div>
  );
}
