// The pixel wipe the countdown screens used to swap looks: blocks grow in from the left
// in the next look's colors, the page swaps underneath at full cover, then the blocks shrink away.
export type WipeColors = { bg: string; accent: string };

const IN = 700;
const OUT = 700;
const SPREAD = .55;

export function pixelWipe(canvas: HTMLCanvasElement, colors: WipeColors, swap: () => void): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    swap();
    return Promise.resolve();
  }
  const w = innerWidth, h = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const size = Math.ceil(Math.max(w, h) / 26);
  const cols = Math.ceil(w / size), rows = Math.ceil(h / size);
  const cells: { x: number; y: number; order: number; accent: boolean }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const order = (c / Math.max(cols - 1, 1)) * .55 + ((rows - 1 - r) / Math.max(rows - 1, 1)) * .3 + Math.random() * .15;
      cells.push({ x: c * size, y: r * size, order, accent: Math.random() < .06 });
    }
  }

  return new Promise(resolve => {
    let start = 0, swapped = false;
    const frame = (now: number) => {
      start ||= now;
      const t = now - start;
      ctx.clearRect(0, 0, w, h);
      if (t >= IN && !swapped) {
        swapped = true;
        swap();
      }
      if (t >= IN + OUT) {
        canvas.width = canvas.height = 0;
        resolve();
        return;
      }
      const p = t < IN ? t / IN : (t - IN) / OUT;
      for (const cell of cells) {
        let k = Math.min(1, Math.max(0, (p - cell.order * SPREAD) / (1 - SPREAD)));
        if (t >= IN) k = 1 - k;
        k = Math.ceil(k * 4) / 4; // grow in pixel steps
        if (!k) continue;
        const s = Math.ceil(size * k);
        ctx.fillStyle = cell.accent ? colors.accent : colors.bg;
        ctx.fillRect(cell.x + (size - s) / 2, cell.y + (size - s) / 2, s + .5, s + .5);
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}
