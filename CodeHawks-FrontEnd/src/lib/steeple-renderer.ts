import {
  advanceEscape, advanceFlight, advanceMotion, advanceScroll, advanceSeat, createEscape, createFlight, createMotion, createScroll, createSeat, createThrow,
  flightScale, ringDissolve, rotateBy, surfaceRotation, throwVelocity, trackThrow, PLAY_TO_FADE, type Vec3,
} from './steeple-physics';
import { createSphere, type Sphere } from './steeple-sphere';

// Ball radius as a fraction of its square canvas: 137 of 160 artwork units.
const BALL = .428125;
const MAX_THROW = 6500;
// Flings read a little stronger than the hand, because slinging it around should feel great.
const THROW_BOOST = 1.25;
// Before it escapes: radians per pixel of drag (scaled by ball width), top speed, and flick boost.
const SPIN_GAIN = 7;
const MAX_SPIN = 26;
const SPIN_BOOST = 1.3;
// A swing faster than this (px/s) tears the ball out of the cursor's grip, momentum and all.
const SLIP_SPEED = 1400;
// How fully a loose ball keeps its momentum when the page scrolls under it,
// how far a seated ball can lag in its socket (fraction of the ball's box), and how much it squashes.
const SCROLL_INERTIA = .85;
const SEAT_TRAVEL = .12;
const SEATED_SCROLL_SQUASH = 1 / 2500;

type Elements = {
  ball: HTMLElement;
  button: HTMLButtonElement;
  ring: SVGSVGElement;
  home: HTMLElement;
  artwork: SVGSVGElement;
};

type Options = {
  signal: AbortSignal;
  ready: () => void;
  discovered: () => void;
  unlocked: () => void;
  fallback: () => void;
};

export async function mountSteeple(canvas: HTMLCanvasElement, elements: Elements, options: Options) {
  const { ball, button, ring, home, artwork } = elements;
  let created: Sphere | undefined;
  let frame = 0;
  let destroyed = false;
  let placed = '';
  const events = new AbortController();
  let resizeObserver: ResizeObserver | undefined;
  let intersectionObserver: IntersectionObserver | undefined;
  const flag = (key: string, on: boolean) => {
    if (on === (key in ball.dataset)) return;
    if (on) ball.dataset[key] = 'true';
    else delete ball.dataset[key];
  };
  const dock = () => {
    flag('free', false);
    ball.style.removeProperty('width');
    ball.style.removeProperty('height');
    ball.style.removeProperty('transform');
    placed = '';
  };
  const dispose = () => {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(frame);
    events.abort();
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    dock();
    for (const key of ['held', 'ring', 'focus']) flag(key, false);
    ball.style.removeProperty('--lift');
    home.style.removeProperty('--away');
    ring.style.removeProperty('--dissolve');
    created?.dispose();
    options.signal.removeEventListener('abort', dispose);
  };
  options.signal.addEventListener('abort', dispose, { once: true });
  try {
    if (options.signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const sphere = created = await createSphere(canvas, artwork, options.signal);
    if (destroyed) {
      sphere.dispose();
      return dispose;
    }
    const motion = createMotion();
    const escape = createEscape();
    const flight = createFlight();
    let scroll = createScroll(window.scrollY);
    const seat = createSeat();
    let pointer: number | null = null;
    let pointerFocus = false;
    let press: Vec3 = [0, 0, 1];
    let lean: Vec3 | null = null;
    let downX = 0, downY = 0, lastX = 0, lastY = 0;
    let released = -Infinity;
    // Where the pointer grabbed a loose ball, relative to its centre at full size.
    let grab = { x: 0, y: 0 };
    let hand = { x: 0, y: 0 };
    const samples = createThrow();
    let lastFrame = 0;
    let visible = false;
    let ready = false;
    let discovered = false;
    let drawnAtRest = false;
    let dissolve = -1;
    let size = 0;
    let freeScale = 1;
    let sampleFrames = 0, slowFrames = 0, warmup = 10;
    let resolution = Math.min(devicePixelRatio || 1, 1.5);
    let reducedResolution = false;

    const viewport = () => ({ width: document.documentElement.clientWidth, height: document.documentElement.clientHeight });
    const homeCenter = () => {
      const rect = home.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };
    const running = () => !destroyed && !document.hidden && (visible || flight.free);
    const wake = () => {
      if (!frame && running()) frame = requestAnimationFrame(tick);
    };
    const discover = () => {
      if (discovered) return;
      discovered = true;
      options.discovered();
    };
    const resize = () => {
      size = home.getBoundingClientRect().width;
      sphere.resize(Math.max(1, Math.min(640, Math.round(size * resolution))));
      // Out on the page the ball shrinks to a toy-sized ~quarter of the viewport.
      const { width, height } = viewport();
      freeScale = Math.min(1, Math.max(150, Math.min(width, height) * .26) / (size * BALL * 2));
      if (flight.free) {
        ball.style.width = ball.style.height = `${size}px`;
        placed = '';
      }
      drawnAtRest = false;
      warmup = 10;
      wake();
    };
    const place = () => {
      if (!flight.free) dock();
      else {
        if (!('free' in ball.dataset)) {
          ball.style.width = ball.style.height = `${size}px`;
          flag('free', true);
        }
        const scale = flightScale(flight, freeScale);
        const transform = `translate3d(${(flight.x - size / 2).toFixed(2)}px, ${(flight.y - size / 2).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        if (transform !== placed) ball.style.transform = placed = transform;
      }
      const lift = flight.lift.toFixed(3);
      ball.style.setProperty('--lift', lift);
      home.style.setProperty('--away', lift);
    };
    // Pops the ball out of the banner at exactly the spot it was sitting in.
    const launch = () => {
      Object.assign(seat, createSeat());
      const center = homeCenter();
      Object.assign(flight, createFlight(), { free: true, ...center });
      lean = null;
      place();
    };
    const settleHome = () => {
      Object.assign(flight, createFlight());
      place();
    };

    function tick(now: number) {
      frame = 0;
      if (!running()) return;
      const elapsed = lastFrame ? (now - lastFrame) / 1000 : 1 / 60;
      lastFrame = now;
      const held = pointer !== null;
      const idle = (now - released) / 1000;

      if (advanceEscape(escape, elapsed, held || idle < 1)) {
        // The last pixels of the ring are gone: a small pop says the ball is loose.
        motion.axis = [0, 1];
        motion.squeezeSpeed += 2.4;
        options.unlocked();
      }
      const dissolved = ringDissolve(escape);
      if (Math.abs(dissolved - dissolve) > .0005) {
        dissolve = dissolved;
        ring.style.setProperty('--dissolve', dissolved.toFixed(4));
      }
      flag('ring', !escape.unlocked && (held || idle < 2.5 || escape.fading > 0));

      const kick = advanceScroll(scroll, elapsed, window.scrollY);
      let roll: Vec3 | null = null;
      let seated = true;
      if (!flight.free) {
        // A hand on the ball holds it still in its socket.
        const shove = held ? 0 : kick;
        if (shove) {
          motion.axis = [0, 1];
          motion.squeezeSpeed += Math.min(.6, Math.abs(shove) * SEATED_SCROLL_SQUASH);
        }
        seated = advanceSeat(seat, elapsed, shove, size * SEAT_TRAVEL);
        // It rolls along the socket as it slides, and rolls back as it returns.
        if (!held && Math.abs(seat.velocity) > 4) roll = surfaceRotation(0, seat.velocity, 1 / Math.max(size * BALL, 1));
        const transform = seat.offset ? `translate3d(0, ${seat.offset.toFixed(2)}px, 0)` : '';
        if (transform !== placed) {
          if (transform) ball.style.transform = transform;
          else ball.style.removeProperty('transform');
          placed = transform;
        }
      }

      if (flight.free) {
        const radius = size * BALL;
        const scale = flightScale(flight, freeScale);
        const grip = held ? { x: hand.x - grab.x * scale, y: hand.y - grab.y * scale } : undefined;
        const bounds = viewport();
        const result = advanceFlight(flight, elapsed, { held, idle, grip, home: homeCenter(), bounds, radius, freeScale, inertia: kick * SCROLL_INERTIA });
        if (result.impact > 90) {
          motion.axis = result.normal;
          motion.squeezeSpeed += Math.min(3.2, result.impact / 650);
        }
        if (result.docked) {
          motion.axis = [0, 1];
          motion.squeezeSpeed += .9;
        } else if (flight.returning && !visible) {
          // Home scrolled away: once the ball is off screen too, seat it without the trip.
          const r = radius * flightScale(flight, freeScale);
          if (flight.x < -r || flight.y < -r || flight.x > bounds.width + r || flight.y > bounds.height + r) settleHome();
        } else if (!flight.returning) {
          roll = surfaceRotation(flight.vx, flight.vy, 1 / (radius * flightScale(flight, freeScale)));
        }
        place();
      }

      const settled = advanceMotion(motion, elapsed, { held, idle, lean: flight.free ? null : lean, roll });
      if (!ready || !settled || !drawnAtRest) {
        sphere.draw(motion, press);
        drawnAtRest = settled;
      }

      // A short hidden warmup prevents enabling the toy on a struggling device.
      // Keep sampling during play, lower resolution once, then revert if needed.
      if (warmup > 0) warmup--;
      else {
        sampleFrames++;
        if (elapsed > .028) slowFrames++;
        if (sampleFrames >= (ready ? 90 : 45)) {
          if (slowFrames / sampleFrames > .3) {
            if (reducedResolution) { options.fallback(); return; }
            reducedResolution = true;
            resolution = .85;
            resize();
          } else if (!ready) {
            ready = true;
            options.ready();
          }
          sampleFrames = 0;
          slowFrames = 0;
        }
      }

      // Holding a settled dent needs no frames until the next pointer event.
      const holdingStill = held && !flight.free && Math.abs(motion.squeeze - .1) < .0005
        && Math.abs(motion.squeezeSpeed) < .001 && Math.abs(motion.dent - .18) < .0005;
      const escaping = !escape.unlocked && (held || idle < 2.5 || escape.played >= PLAY_TO_FADE);
      if (!ready || flight.free || escaping || scroll.velocity || !seated || (!settled && !holdingStill)) wake();
      else {
        lastFrame = 0;
        // Asleep, the next scroll event wakes the loop and is measured from here.
        scroll = createScroll(window.scrollY);
      }
    }

    const releasePointer = (cancelled = false, now = performance.now()) => {
      if (pointer === null) return;
      const previous = pointer;
      pointer = null;
      if (button.hasPointerCapture(previous)) button.releasePointerCapture(previous);
      flag('held', false);
      if (flight.free) {
        // Whichever reads stronger: the ball's own swing on its spring, or the flick of the hand.
        const [vx, vy] = cancelled ? [0, 0] : throwVelocity(samples, now, MAX_THROW);
        const [x, y] = Math.hypot(vx, vy) > Math.hypot(flight.vx, flight.vy) ? [vx, vy] : [flight.vx, flight.vy];
        const boost = cancelled ? 0 : Math.min(THROW_BOOST, MAX_THROW / Math.max(Math.hypot(x, y), 1));
        flight.vx = x * boost;
        flight.vy = y * boost;
      } else {
        // Same reading for a spin: the liveliest part of the last flick, not the final instant.
        const gain = SPIN_GAIN / Math.max(button.clientWidth, 1) * SPIN_BOOST;
        const [vx, vy] = cancelled ? [0, 0] : throwVelocity(samples, now, MAX_SPIN / gain);
        motion.spin = surfaceRotation(vx, vy, gain);
      }
      released = performance.now();
      wake();
    };
    const suspend = () => {
      releasePointer(true);
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      warmup = 10;
      sampleFrames = slowFrames = 0;
      Object.assign(motion, createMotion());
      Object.assign(seat, createSeat());
      if (flight.free) settleHome();
      else dock();
      drawnAtRest = false;
    };
    // Position on the ball's front face, in units of its radius, or null outside it.
    const facePoint = (event: PointerEvent) => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) / (rect.width * BALL);
      const y = -(event.clientY - rect.top - rect.height / 2) / (rect.height * BALL);
      return x * x + y * y > 1 ? null : [x, y] as const;
    };

    const listen = { signal: events.signal };
    button.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.pointerType === 'touch' || pointer !== null || !ready) return;
      const point = facePoint(event);
      if (!point) return;
      const [x, y] = point;
      event.preventDefault();
      pointerFocus = true;
      button.focus({ preventScroll: true });
      pointerFocus = false;
      flag('focus', false);
      pointer = event.pointerId;
      button.setPointerCapture(pointer);
      flag('held', true);
      press = [x, y, Math.sqrt(Math.max(0, 1 - x * x - y * y))];
      downX = lastX = event.clientX;
      downY = lastY = event.clientY;
      samples.length = 0;
      trackThrow(samples, event.timeStamp, event.clientX, event.clientY);
      hand = { x: event.clientX, y: event.clientY };
      motion.axis = [0, 1];
      motion.spin = [0, 0, 0];
      motion.squeezeSpeed = Math.min(3, motion.squeezeSpeed + 2);
      if (flight.free) {
        const scale = flightScale(flight, freeScale);
        grab = { x: (event.clientX - flight.x) / scale, y: (event.clientY - flight.y) / scale };
      }
      discover();
      wake();
    }, listen);
    button.addEventListener('pointermove', event => {
      if (pointer === null) {
        // At rest in the banner, the ball turns slightly toward a hovering cursor.
        if (!ready || flight.free || event.pointerType === 'touch') return;
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        const reach = Math.max(1, Math.hypot(x, y));
        lean = surfaceRotation(x / reach, y / reach, .15);
        wake();
        return;
      }
      if (event.pointerId !== pointer) return;
      // Coalesced events keep every sample from a fast flick, not just one per frame.
      const coalesced = event.getCoalescedEvents?.() ?? [];
      for (const sample of coalesced.length ? coalesced : [event]) trackThrow(samples, sample.timeStamp, sample.clientX, sample.clientY);
      const dx = event.clientX - lastX, dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      if (escape.unlocked) {
        hand = { x: event.clientX, y: event.clientY };
        // Past a small threshold a press becomes a pull out of the banner, not a squish.
        if (!flight.free && Math.hypot(event.clientX - downX, event.clientY - downY) > 4) {
          launch();
          grab = { x: downX - flight.x, y: downY - flight.y };
        }
      } else rotateBy(motion, surfaceRotation(dx, dy, SPIN_GAIN / Math.max(button.clientWidth, 1)));
      const [vx, vy] = throwVelocity(samples, event.timeStamp, Infinity);
      if ((flight.free || !escape.unlocked) && Math.hypot(vx, vy) > SLIP_SPEED) releasePointer(false, event.timeStamp);
      wake();
    }, listen);
    button.addEventListener('pointerleave', () => {
      if (!lean) return;
      lean = null;
      wake();
    }, listen);
    button.addEventListener('pointerup', event => {
      if (event.pointerId !== pointer) return;
      trackThrow(samples, event.timeStamp, event.clientX, event.clientY);
      releasePointer(false, event.timeStamp);
    }, listen);
    button.addEventListener('pointercancel', () => releasePointer(true), listen);
    button.addEventListener('lostpointercapture', () => releasePointer(true), listen);
    button.addEventListener('click', event => {
      // Pointer clicks already squeeze on press. Native keyboard/AT clicks use this path.
      if (event.detail !== 0) return;
      press = [0, 0, 1];
      motion.axis = [0, 1];
      motion.squeezeSpeed = Math.min(3, motion.squeezeSpeed + 2.6);
      motion.dent = .16;
      released = performance.now();
      discover();
      wake();
    }, listen);
    button.addEventListener('focus', () => flag('focus', !pointerFocus), listen);
    button.addEventListener('blur', () => flag('focus', false), listen);
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
    };
    button.addEventListener('keydown', event => {
      flag('focus', true);
      const direction = directions[event.key];
      if (!direction && event.key !== 'Escape' && event.key !== 'Home') return;
      event.preventDefault();
      discover();
      if (!direction) {
        releasePointer(true);
        if (flight.free) flight.returning = true;
        else {
          motion.spin = [0, 0, 0];
          released = performance.now() - 2000;
        }
      } else {
        const [x, y] = direction;
        if (escape.unlocked) {
          // Once loose, arrow keys bowl the ball across the screen.
          if (!flight.free) launch();
          flight.returning = false;
          flight.vx += x * 1100;
          flight.vy += y * 1100;
        } else {
          const spin = surfaceRotation(x, y, 2.8);
          if (x) motion.spin[1] = spin[1];
          if (y) motion.spin[0] = spin[0];
        }
        released = performance.now();
      }
      wake();
    }, listen);
    // Escape calls a loose ball home from anywhere on the page.
    window.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !flight.free || event.target === button) return;
      releasePointer(true);
      flight.returning = true;
      wake();
    }, listen);
    window.addEventListener('blur', () => releasePointer(true), listen);
    window.addEventListener('resize', resize, listen);
    window.addEventListener('scroll', wake, { passive: true, signal: events.signal });
    document.addEventListener('visibilitychange', () => { if (document.hidden) suspend(); else wake(); }, listen);
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); options.fallback(); }, listen);
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(home);
    intersectionObserver = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) { lastFrame = 0; scroll = createScroll(window.scrollY); wake(); }
      else if (!flight.free) suspend();
    }, { threshold: .05 });
    intersectionObserver.observe(home);
    resize();
    return dispose;
  } catch (error) {
    dispose();
    throw error;
  }
}
