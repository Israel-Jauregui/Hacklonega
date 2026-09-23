export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];

// Seconds of active play before the ring starts dissolving, and how long it takes.
export const PLAY_TO_FADE = 5;
export const FADE_TIME = 2.4;

// Small fixed substeps keep the springs stable across refresh rates and dropped frames.
const step = (elapsed: number) => {
  const duration = Math.min(Math.max(elapsed, 0), .05);
  const count = Math.max(1, Math.ceil(duration * 120));
  return { count, dt: duration / count };
};
const length = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);
const smoothstep = (edge: number, value: number) => {
  const t = Math.min(Math.max(value / edge, 0), 1);
  return t * t * (3 - 2 * t);
};

export function multiply(a: Quat, b: Quat): Quat {
  const [ax, ay, az, aw] = a, [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

export const conjugate = (q: Quat): Quat => [-q[0], -q[1], -q[2], q[3]];

// Rotation vector (axis * angle) to quaternion.
export function fromRotation(v: Vec3): Quat {
  const angle = length(v);
  const s = angle < 1e-8 ? .5 : Math.sin(angle / 2) / angle;
  const q: Quat = [v[0] * s, v[1] * s, v[2] * s, Math.cos(angle / 2)];
  const n = Math.hypot(...q);
  return [q[0] / n, q[1] / n, q[2] / n, q[3] / n];
}

// Quaternion to rotation vector, always taking the short way around.
export function toRotation(q: Quat): Vec3 {
  const sign = q[3] < 0 ? -1 : 1;
  const x = q[0] * sign, y = q[1] * sign, z = q[2] * sign;
  const s = Math.hypot(x, y, z);
  if (s < 1e-8) return [2 * x, 2 * y, 2 * z];
  const angle = 2 * Math.atan2(s, q[3] * sign);
  return [x / s * angle, y / s * angle, z / s * angle];
}

// Rows of the rotation matrix. Read column-major by WebGL, this is the inverse
// rotation, which maps a view-space normal back onto the flat artwork.
export function inverseMatrix([x, y, z, w]: Quat) {
  return [
    1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w),
    2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w),
    2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y),
  ];
}

// Screen-space drag or velocity (y down) to a view-space rotation that moves the
// camera-facing surface in the same direction. For a ball rolling across the page
// without slipping, the same mapping with 1 / radius as the gain is exact.
export const surfaceRotation = (dx: number, dy: number, gain: number): Vec3 => [dy * gain, dx * gain, 0];

export function createMotion() {
  return {
    orientation: [0, 0, 0, 1] as Quat,
    spin: [0, 0, 0] as Vec3,
    squeeze: 0,
    squeezeSpeed: 0,
    dent: 0,
    // Direction of the squash in screen space: vertical for a press, the wall normal on impact.
    axis: [0, 1] as Vec2,
  };
}

export type Motion = ReturnType<typeof createMotion>;

export function rotateBy(motion: Motion, v: Vec3) {
  motion.orientation = multiply(fromRotation(v), motion.orientation);
}

type MotionInput = {
  held: boolean;
  idle: number;
  // Small resting tilt toward a hovering cursor.
  lean?: Vec3 | null;
  // Angular velocity that rolls the ball along with its travel.
  roll?: Vec3 | null;
};

export function advanceMotion(motion: Motion, elapsed: number, { held, idle, lean = null, roll = null }: MotionInput) {
  const { count, dt } = step(elapsed);
  const target = lean ? fromRotation(lean) : createMotion().orientation;
  for (let i = 0; i < count; i++) {
    const { spin } = motion;
    if (roll) {
      const blend = 1 - Math.exp(-10 * dt);
      for (let axis = 0; axis < 3; axis++) spin[axis] += (roll[axis] - spin[axis]) * blend;
    } else if (!held) {
      const error = toRotation(multiply(target, conjugate(motion.orientation)));
      // A hover lean answers quickly once the ball is calm. Anything else eases home slowly.
      const calm = lean && length(error) < .4 && length(spin) < 1.5;
      // A hard spin winds down on its own first; the return spring alone never moves this fast.
      const coasting = length(spin) > 3;
      if (calm || (idle > 1.8 && !coasting)) {
        const [k, c] = calm ? [18, 8.5] : [3, 3.5];
        for (let axis = 0; axis < 3; axis++) spin[axis] += (k * error[axis] - c * spin[axis]) * dt;
      } else {
        const drag = Math.exp(-.45 * dt);
        for (let axis = 0; axis < 3; axis++) spin[axis] *= drag;
      }
    }
    if (roll || !held) rotateBy(motion, [spin[0] * dt, spin[1] * dt, spin[2] * dt]);
    motion.squeezeSpeed += (180 * ((held ? .1 : 0) - motion.squeeze) - 13 * motion.squeezeSpeed) * dt;
    motion.squeeze = Math.max(-.08, Math.min(.22, motion.squeeze + motion.squeezeSpeed * dt));
    motion.dent += ((held ? .18 : 0) - motion.dent) * (1 - Math.exp(-12 * dt));
  }
  if (held || roll) return false;
  const error = length(toRotation(multiply(target, conjugate(motion.orientation))));
  const settled = error < .002 && length(motion.spin) < .004
    && Math.abs(motion.squeeze) + Math.abs(motion.squeezeSpeed) + motion.dent < .002;
  if (settled) Object.assign(motion, createMotion(), { orientation: target });
  return settled;
}

export function createEscape() {
  return { played: 0, fading: 0, unlocked: false };
}

export type Escape = ReturnType<typeof createEscape>;

// Only active play fills the timer. Once the ring starts dissolving it finishes on its own.
export function advanceEscape(state: Escape, elapsed: number, engaged: boolean) {
  if (state.unlocked) return false;
  const dt = Math.min(Math.max(elapsed, 0), .05);
  if (state.played < PLAY_TO_FADE) {
    if (engaged) state.played = Math.min(PLAY_TO_FADE, state.played + dt);
    return false;
  }
  state.fading = Math.min(FADE_TIME, state.fading + dt);
  state.unlocked = state.fading >= FADE_TIME;
  return state.unlocked;
}

export const ringDissolve = (state: Escape) => state.unlocked ? 1 : state.fading / FADE_TIME;

export function createFlight() {
  // lift: 0 while seated in the banner, 1 once fully out on the page.
  return { x: 0, y: 0, vx: 0, vy: 0, lift: 0, free: false, returning: false };
}

export type Flight = ReturnType<typeof createFlight>;

type Sample = { t: number; x: number; y: number };

// Recent pointer positions (ms timestamps), used to read a throw the way the hand meant it.
export const createThrow = (): Sample[] => [];

export function trackThrow(samples: Sample[], t: number, x: number, y: number) {
  samples.push({ t, x, y });
  while (samples.length > 2 && t - samples[0].t > 160) samples.shift();
}

// Most people slow down just before letting go. Rather than the final instant, take the
// fastest stretch of the last ~110ms. A hand that stopped before release throws nothing.
export function throwVelocity(samples: Sample[], now: number, limit: number): Vec2 {
  const recent = samples.filter(sample => now - sample.t <= 110);
  let best: Vec2 = [0, 0], fastest = 0;
  for (let i = 0; i < recent.length; i++) {
    for (let j = i + 1; j < recent.length; j++) {
      const dt = (recent[j].t - recent[i].t) / 1000;
      if (dt < .016) continue;
      const vx = (recent[j].x - recent[i].x) / dt, vy = (recent[j].y - recent[i].y) / dt;
      const speed = Math.hypot(vx, vy);
      if (speed > fastest) {
        fastest = speed;
        best = [vx, vy];
      }
    }
  }
  const scale = fastest > limit ? limit / fastest : 1;
  return [best[0] * scale, best[1] * scale];
}

// Scrolling moves the viewport a loose ball lives in, and the page a seated ball sits on. Like a ball in a
// box that is pushed, the ball answers changes in scroll speed, not the scroll position itself.
const MAX_SCROLL_SPEED = 6000;

export const createScroll = (y = 0) => ({ y, velocity: 0 });

export type Scroll = ReturnType<typeof createScroll>;

// Reads the new scroll position and returns how much the (smoothed) scroll speed changed, in px/s.
// Smoothing turns a mouse wheel's discrete jumps into a push rather than a teleport.
export function advanceScroll(scroll: Scroll, elapsed: number, y: number) {
  const dt = Math.max(elapsed, 1 / 240);
  const raw = Math.max(-MAX_SCROLL_SPEED, Math.min(MAX_SCROLL_SPEED, (y - scroll.y) / dt));
  scroll.y = y;
  const next = scroll.velocity + (raw - scroll.velocity) * (1 - Math.exp(-Math.min(dt, .05) / .06));
  const velocity = Math.abs(next) < 1 && raw === 0 ? 0 : next;
  const kick = velocity - scroll.velocity;
  scroll.velocity = velocity;
  return kick;
}

// Seated, the ball rides a spring in its socket. When scrolling speeds up the page pulls ahead and the ball
// lags behind it, then wobbles back into place. `offset` is in px, positive down the screen.
export const createSeat = () => ({ offset: 0, velocity: 0 });

export type Seat = ReturnType<typeof createSeat>;

export function advanceSeat(seat: Seat, elapsed: number, kick: number, limit: number) {
  // The ball lags opposite to the page's change in on-screen speed, softened by its grip on the socket.
  seat.velocity += kick * .6;
  const { count, dt } = step(elapsed);
  for (let i = 0; i < count; i++) {
    seat.velocity += (-140 * seat.offset - 10 * seat.velocity) * dt;
    seat.offset += seat.velocity * dt;
    // The socket rim stops it and knocks some of the speed back.
    if (Math.abs(seat.offset) > limit) {
      const side = Math.sign(seat.offset);
      seat.offset = side * limit;
      if (seat.velocity * side > 0) seat.velocity *= -.4;
    }
  }
  const settled = Math.abs(seat.offset) < .05 && Math.abs(seat.velocity) < 1;
  if (settled) Object.assign(seat, createSeat());
  return settled;
}

type FlightInput = {
  held: boolean;
  idle: number;
  // Where the hand is holding the ball. It follows on a stiff spring so it carries real momentum.
  grip?: { x: number; y: number };
  home: { x: number; y: number };
  bounds: { width: number; height: number };
  // Radius of the ball while seated, and how small it becomes out on the page.
  radius: number;
  freeScale: number;
  returnAfter?: number;
  // How much the viewport's own vertical speed changed this frame (px/s, from advanceScroll).
  // The ball keeps its momentum, so on screen it moves the opposite way.
  inertia?: number;
};

export const flightScale = (flight: Flight, freeScale: number) => 1 + (freeScale - 1) * flight.lift;

export function advanceFlight(flight: Flight, elapsed: number, input: FlightInput) {
  const { held, idle, grip, home, bounds, radius, freeScale, returnAfter = 6, inertia = 0 } = input;
  let impact = 0;
  let normal: Vec2 = [0, 1];
  if (!flight.free) {
    Object.assign(flight, createFlight(), { x: home.x, y: home.y });
    return { docked: true, impact, normal };
  }
  if (held) flight.returning = false;
  else if (idle > returnAfter) flight.returning = true;
  // A hand holding the ball keeps it in place on screen.
  if (!held) flight.vy -= inertia;
  const { count, dt } = step(elapsed);
  for (let i = 0; i < count; i++) {
    const distance = Math.hypot(home.x - flight.x, home.y - flight.y);
    const lift = flight.returning ? smoothstep(radius * 2.4, distance) : 1;
    flight.lift += (lift - flight.lift) * (1 - Math.exp(-9 * dt));
    if (held) {
      if (grip) {
        flight.vx += (900 * (grip.x - flight.x) - 48 * flight.vx) * dt;
        flight.vy += (900 * (grip.y - flight.y) - 48 * flight.vy) * dt;
      }
    } else if (flight.returning) {
      flight.vx += (9 * (home.x - flight.x) - 6 * flight.vx) * dt;
      flight.vy += (9 * (home.y - flight.y) - 6 * flight.vy) * dt;
    } else {
      const drag = Math.exp(-.4 * dt);
      flight.vx *= drag;
      flight.vy *= drag;
    }
    if (!held || grip) {
      flight.x += flight.vx * dt;
      flight.y += flight.vy * dt;
    }
    // Home may have scrolled out of view, so a returning ball ignores the edges.
    if (flight.returning) continue;
    const r = Math.min(radius * flightScale(flight, freeScale), bounds.width / 2, bounds.height / 2);
    for (const [position, velocity, limit, wall] of [['x', 'vx', bounds.width, [1, 0]], ['y', 'vy', bounds.height, [0, 1]]] as const) {
      const low = flight[position] < r, high = flight[position] > limit - r;
      if (!low && !high) continue;
      flight[position] = low ? r : limit - r;
      if (low ? flight[velocity] >= 0 : flight[velocity] <= 0) continue;
      if (Math.abs(flight[velocity]) > impact) {
        impact = Math.abs(flight[velocity]);
        normal = [...wall];
      }
      // Slammed into a wall while held it just squashes; thrown, it bounces.
      flight[velocity] = held ? 0 : flight[velocity] * -.78;
    }
  }
  const docked = flight.returning && flight.lift < .02
    && Math.hypot(flight.x - home.x, flight.y - home.y) < 1 && Math.hypot(flight.vx, flight.vy) < 24;
  if (docked) Object.assign(flight, createFlight(), { x: home.x, y: home.y });
  return { docked, impact, normal };
}
