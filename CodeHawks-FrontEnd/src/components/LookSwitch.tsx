import { useRef, useState } from 'react';
import { pixelWipe } from '../lib/pixel-wipe';

// The two looks from the countdown screens: the SWE club Typewriter look (the default)
// and the Hacktoberfest 2026 look. The choice sets data-look on <html>; styles.css does the rest.
const looks = {
  swe: { bg: '#122c74', accent: '#ffc62f' },
  htf: { bg: '#3d5f58', accent: '#e97b77' },
};

export default function LookSwitch() {
  const [look, setLook] = useState<keyof typeof looks>('swe');
  const canvas = useRef<HTMLCanvasElement>(null);
  const busy = useRef(false);

  const toggle = () => {
    if (busy.current) return;
    const next = look === 'swe' ? 'htf' : 'swe';
    const apply = () => {
      document.documentElement.dataset.look = next;
      setLook(next);
    };
    if (!canvas.current || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      apply();
      return;
    }
    busy.current = true;
    void pixelWipe(canvas.current, looks[next], apply).finally(() => { busy.current = false; });
  };

  return (
    <>
      <button className="look-switch" type="button" aria-pressed={look === 'htf'} onClick={toggle}>
        <span className="look-switch__box" aria-hidden="true" />
        Hacktoberfest look
      </button>
      <canvas className="look-wipe" ref={canvas} aria-hidden="true" />
    </>
  );
}
