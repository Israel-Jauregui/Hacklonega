import assert from 'node:assert/strict';
import test from 'node:test';
import {
  advanceEscape, advanceFlight, advanceMotion, advanceScroll, advanceSeat, createEscape, createScroll, createSeat, createFlight, createMotion, createThrow, flightScale,
  fromRotation, multiply, ringDissolve, surfaceRotation, throwVelocity, toRotation, trackThrow, FADE_TIME, PLAY_TO_FADE,
} from '../src/lib/steeple-physics.ts';

const rest = { held: false, idle: 10 };
const angle = q => Math.hypot(...toRotation(q));
const close = (a, b, epsilon = 1e-9) => a.every((value, index) => Math.abs(value - b[index]) < epsilon);

test('an untouched sphere remains stationary', () => {
  const motion = createMotion();
  assert.equal(advanceMotion(motion, 1 / 60, rest), true);
  assert.deepEqual(motion, createMotion());
});

test('release preserves momentum before the return spring takes over', () => {
  const motion = createMotion();
  motion.spin = [0, 4, 0];
  advanceMotion(motion, 1 / 60, { held: false, idle: 0 });
  assert.ok(toRotation(motion.orientation)[1] > 0);
  assert.ok(motion.spin[1] > 3.8 && motion.spin[1] < 4);
});

test('a held squeeze deforms, rebounds after release, and fully settles', () => {
  const motion = createMotion();
  motion.squeezeSpeed = 2;
  for (let frame = 0; frame < 180; frame++) advanceMotion(motion, 1 / 60, { held: true, idle: 0 });
  assert.ok(Math.abs(motion.squeeze - .1) < .001);
  assert.ok(Math.abs(motion.dent - .18) < .001);
  let rebounded = false;
  for (let frame = 0; frame < 600; frame++) {
    advanceMotion(motion, 1 / 60, { held: false, idle: frame / 60 });
    if (motion.squeeze < 0) rebounded = true;
  }
  assert.equal(rebounded, true);
  assert.deepEqual(motion, createMotion());
});

test('tumbled orientations return home at different refresh rates', () => {
  const starts = [[3.1, -2.8, 0], [-2.9, 3, .4], [0, 0, 3.1], [1.4, 1.4, -1.4]];
  for (const rate of [30, 60, 144]) {
    for (const start of starts) {
      const motion = createMotion();
      motion.orientation = fromRotation(start);
      motion.spin = [start[1] * 2, -start[0] * 2, 1];
      for (let frame = 0; frame < rate * 20; frame++) advanceMotion(motion, 1 / rate, { held: false, idle: frame / rate });
      assert.deepEqual(motion, createMotion(), `Return failed at ${rate} Hz from ${start}`);
    }
  }
});

test('a hard spin keeps going for a while, then still returns home', () => {
  const motion = createMotion();
  motion.spin = [4, 22, 0];
  for (let frame = 0; frame < 120; frame++) advanceMotion(motion, 1 / 60, { held: false, idle: 5 + frame / 60 });
  assert.ok(Math.hypot(...motion.spin) > 8, 'still spinning hard two seconds later');
  for (let frame = 0; frame < 60 * 20; frame++) advanceMotion(motion, 1 / 60, rest);
  assert.deepEqual(motion, createMotion());
});

test('frame-rate changes and a long frame do not destabilize the springs', () => {
  const motion = createMotion();
  Object.assign(motion, { orientation: fromRotation([2, -2, 0]), squeezeSpeed: 3 });
  const intervals = [1 / 144, 1 / 30, 1 / 60, 2];
  for (let frame = 0; frame < 2000; frame++) {
    advanceMotion(motion, intervals[frame % intervals.length], rest);
    assert.ok([...motion.orientation, ...motion.spin, motion.squeeze].every(Number.isFinite));
    assert.ok(Math.abs(Math.hypot(...motion.orientation) - 1) < 1e-9);
    assert.ok(motion.squeeze >= -.08 && motion.squeeze <= .22);
  }
  assert.deepEqual(motion, createMotion());
});

test('rotations compose and always unwind the short way', () => {
  assert.ok(Math.abs(angle(fromRotation([0, 2 * Math.PI + .3, 0])) - .3) < 1e-9);
  assert.ok(Math.abs(angle(fromRotation([0, -2 * Math.PI - .3, 0])) - .3) < 1e-9);
  const quarter = fromRotation([0, Math.PI / 2, 0]);
  assert.ok(close(toRotation(multiply(quarter, quarter)), [0, Math.PI, 0]));
});

test('dragging and rolling turn the front of the ball the way it moves', () => {
  // Rotating about +y carries the front of the sphere (+z) toward +x, i.e. screen right.
  const [x, y] = surfaceRotation(10, 0, .1);
  assert.equal(x, 0);
  assert.ok(y > 0);
  // Screen y points down; rotating about +x carries the front toward -y in view space, i.e. down.
  assert.ok(surfaceRotation(0, 10, .1)[0] > 0);
});

test('a hover lean settles on its target without extra frames, then eases back', () => {
  const motion = createMotion();
  const lean = [.1, -.12, 0];
  let settled = false;
  for (let frame = 0; frame < 180 && !settled; frame++) settled = advanceMotion(motion, 1 / 60, { ...rest, lean });
  assert.equal(settled, true);
  assert.ok(close(toRotation(motion.orientation), lean, 1e-6));
  for (let frame = 0; frame < 600; frame++) advanceMotion(motion, 1 / 60, rest);
  assert.deepEqual(motion, createMotion());
});

test('rolling spin follows travel and never reports settled', () => {
  const motion = createMotion();
  for (let frame = 0; frame < 60; frame++) assert.equal(advanceMotion(motion, 1 / 60, { ...rest, roll: [0, 5, 0] }), false);
  assert.ok(Math.abs(motion.spin[1] - 5) < .01);
});

test('only active play fills the timer, then the ring dissolves on its own', () => {
  const escape = createEscape();
  for (let frame = 0; frame < 600; frame++) advanceEscape(escape, 1 / 60, false);
  assert.equal(escape.played, 0);
  for (let frame = 0; frame < 60 * (PLAY_TO_FADE - .5); frame++) advanceEscape(escape, 1 / 60, true);
  assert.equal(ringDissolve(escape), 0);
  // Stepping away pauses the timer rather than resetting it.
  for (let frame = 0; frame < 600; frame++) advanceEscape(escape, 1 / 60, false);
  let unlockedAt = -1;
  for (let frame = 0; frame < 60 * 10; frame++) {
    if (advanceEscape(escape, 1 / 60, frame < 40)) {
      assert.equal(unlockedAt, -1, 'unlock is reported exactly once');
      unlockedAt = frame / 60;
    }
  }
  assert.equal(escape.unlocked, true);
  assert.equal(ringDissolve(escape), 1);
  assert.ok(Math.abs(unlockedAt - (.5 + FADE_TIME)) < .05, `unlocked at ${unlockedAt}s`);
});

const home = { x: 300, y: 200 };
const bounds = { width: 1200, height: 800 };
const flying = (overrides = {}) => Object.assign(createFlight(), { free: true, x: 600, y: 400 }, overrides);
const fly = (flight, input = {}) => advanceFlight(flight, 1 / 60, { held: false, idle: 0, home, bounds, radius: 100, freeScale: .5, ...input });

test('a seated ball simply follows its home', () => {
  const flight = createFlight();
  assert.equal(fly(flight).docked, true);
  assert.deepEqual([flight.x, flight.y, flight.free], [300, 200, false]);
});

test('a throw bounces off the walls, reports the impact, and stays on screen', () => {
  const flight = flying({ vx: 3000, vy: -1800, lift: 1 });
  const impacts = [];
  for (let frame = 0; frame < 60 * 5; frame++) {
    const { impact, normal } = fly(flight);
    if (impact) impacts.push({ impact, normal });
    const r = 100 * flightScale(flight, .5);
    assert.ok(flight.x >= r && flight.x <= bounds.width - r && flight.y >= r && flight.y <= bounds.height - r);
  }
  assert.ok(impacts.length >= 2);
  // Side walls squash horizontally, the top and bottom vertically.
  assert.ok(impacts.some(({ normal }) => normal[0] === 1 && normal[1] === 0));
  assert.ok(impacts.some(({ normal }) => normal[0] === 0 && normal[1] === 1));
  assert.ok(Math.hypot(flight.vx, flight.vy) < 3000);
});

test('a held ball is kept on screen and squashes against the wall instead of bouncing', () => {
  const flight = flying({ x: -50, y: 900, vx: -800, vy: 800, lift: 1 });
  const { impact } = fly(flight, { held: true });
  assert.ok(impact > 0);
  assert.deepEqual([flight.x, flight.y, flight.vx, flight.vy], [50, 750, 0, 0]);
});

test('a held ball swings after the hand and keeps that momentum', () => {
  const flight = flying({ lift: 1 });
  for (let frame = 0; frame < 12; frame++) fly(flight, { held: true, grip: { x: 600 + frame * 40, y: 400 } });
  // 40px per frame at 60Hz is 2400px/s. The ball trails slightly but is moving just as fast.
  assert.ok(flight.x < 600 + 11 * 40);
  assert.ok(flight.vx > 1800, `vx ${flight.vx}`);
  for (let frame = 0; frame < 300; frame++) fly(flight, { held: true, grip: { x: 700, y: 300 } });
  assert.ok(Math.hypot(flight.x - 700, flight.y - 300) < .5);
});

const flick = (points, start = 0, step = 8) => points.map(([x, y], index) => ({ t: start + index * step, x, y }));

test('a throw forgives the slowdown just before letting go', () => {
  // Fast for 64ms, then almost still for the last 24ms before release.
  const samples = flick([[0, 0], [30, 10], [60, 20], [90, 30], [120, 40], [150, 50], [180, 60], [210, 70], [240, 80], [241, 80], [242, 80], [242, 80]]);
  const [vx, vy] = throwVelocity(samples, 88, 6500);
  assert.ok(vx > 3000 && vy > 1000, `${vx}, ${vy}`);
});

test('a hand that stopped before release throws nothing, and throws are capped', () => {
  const samples = flick([[0, 0], [40, 0], [80, 0]]);
  assert.deepEqual(throwVelocity(samples, 16 + 200, 6500), [0, 0]);
  const [vx] = throwVelocity(flick([[0, 0], [400, 0], [800, 0]]), 16, 6500);
  assert.ok(Math.abs(vx - 6500) < 1e-6);
});

test('the tracker keeps only recent samples', () => {
  const samples = createThrow();
  for (let t = 0; t <= 1000; t += 8) trackThrow(samples, t, t, 0);
  assert.ok(samples.length < 25 && samples.at(-1).t === 1000);
});

test('an idle ball flies home, grows back to size, and docks', () => {
  const flight = flying({ x: 1000, y: 650, vx: 400, lift: 1 });
  let docked = false;
  for (let frame = 0; frame < 60 * 6 && !docked; frame++) docked = fly(flight, { idle: 7 }).docked;
  assert.equal(docked, true);
  assert.deepEqual(flight, Object.assign(createFlight(), home));
});

test('the return trip ignores the viewport when home has scrolled away', () => {
  const flight = flying({ lift: 1 });
  const away = { x: 300, y: -900 };
  let lowest = Infinity;
  for (let frame = 0; frame < 60 * 2; frame++) {
    fly(flight, { idle: 7, home: away });
    lowest = Math.min(lowest, flight.y);
  }
  assert.ok(lowest < 0);
});

test('grabbing a returning ball cancels the trip home', () => {
  const flight = flying({ returning: true, lift: 1 });
  fly(flight, { held: true, idle: 9 });
  assert.equal(flight.returning, false);
});

test('scroll kicks follow changes in scroll speed and cancel out once scrolling stops', () => {
  const scroll = createScroll(0);
  let y = 0, total = 0, first = 0;
  for (let frame = 0; frame < 30; frame++) {
    y += 20;
    const kick = advanceScroll(scroll, 1 / 60, y);
    if (frame === 0) first = kick;
    total += kick;
  }
  assert.ok(first > 0, 'scrolling down starts with a downward kick');
  assert.ok(Math.abs(scroll.velocity - 1200) < 20, 'steady scrolling reads as its real speed');
  for (let frame = 0; frame < 120; frame++) total += advanceScroll(scroll, 1 / 60, y);
  assert.equal(scroll.velocity, 0);
  assert.ok(Math.abs(total) < 1e-9, 'a finished scroll leaves no net push');
});

test('a single wheel jump is smoothed into a bounded push', () => {
  const scroll = createScroll(0);
  const kick = advanceScroll(scroll, 1 / 60, 5000);
  assert.ok(kick > 0 && kick < 6000);
});

test('a loose ball keeps its momentum when the page scrolls under it, then stays on screen', () => {
  const bounds = { width: 1200, height: 800 };
  const flight = Object.assign(createFlight(), { free: true, x: 600, y: 400 });
  const scroll = createScroll(0);
  let y = 0, rose = false;
  for (let frame = 0; frame < 600; frame++) {
    if (frame < 20) y += 40;
    const inertia = advanceScroll(scroll, 1 / 60, y);
    advanceFlight(flight, 1 / 60, { held: false, idle: 0, home: { x: 0, y: 0 }, bounds, radius: 100, freeScale: .5, inertia });
    if (flight.y < 380) rose = true;
    assert.ok(flight.y >= 0 && flight.y <= bounds.height, `left the viewport at frame ${frame}`);
  }
  assert.equal(rose, true, 'scrolling down sends the ball up the screen');
});

test('a held ball ignores scrolling', () => {
  const flight = Object.assign(createFlight(), { free: true, x: 600, y: 400 });
  advanceFlight(flight, 1 / 60, {
    held: true, idle: 0, grip: { x: 600, y: 400 }, home: { x: 0, y: 0 }, bounds: { width: 1200, height: 800 }, radius: 100, freeScale: .5, inertia: 3000,
  });
  assert.ok(Math.abs(flight.vy) < 1);
});

test('a seated ball lags a scroll push, stays in its socket, and settles back', () => {
  const seat = createSeat();
  const limit = 48;
  let lowest = 0, crossed = false;
  const scroll = createScroll(0);
  let y = 0;
  for (let frame = 0; frame < 240; frame++) {
    if (frame < 15) y += 25;
    const kick = advanceScroll(scroll, 1 / 60, y);
    advanceSeat(seat, 1 / 60, kick, limit);
    lowest = Math.max(lowest, seat.offset);
    if (seat.offset < -1) crossed = true;
    assert.ok(Math.abs(seat.offset) <= limit);
  }
  assert.ok(lowest > 10, 'scrolling down leaves the ball visibly behind, lower in its socket');
  assert.equal(crossed, true, 'it swings back past centre as the scroll stops');
  assert.deepEqual(seat, createSeat());
});
