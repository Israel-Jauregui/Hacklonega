# Hacklonega frontend

React 19 and Vite 7 landing page for the Hacktoberfest Hack Day in Dahlonega. The site has no registration form; all registration links go to the official MLH OrganizerHQ event.

## Local development

```sh
npm ci
npm run dev
```

Run `npm run typecheck`, `npm run lint`, and `npm run build` before a release. `npm run preview` serves the production build locally.

## Interactive steeple

On eligible desktops, the existing SVG illustration becomes the texture of a small WebGL sphere. Click or hold to squeeze it, drag to rotate, and flick to send it spinning. Hard spins coast down on their own; after 1.8 seconds without input, a damped spring gradually returns it to its original orientation. Before the first touch, a faint breathing halo and an occasional glint hint that it can be played with, and the ball leans slightly toward a hovering cursor. The artwork never moves on its own, only in response to a pointer, keys, or scrolling.

Scrolling pushes the ball the way it would push a ball in a moving box: it answers changes in scroll speed, smoothed so a mouse wheel's jumps read as a push. Seated, it lags behind the page on a spring in its socket, rolling as it slides, then wobbles back into place. Loose, it keeps its momentum while the page moves under it and bounces off the viewport edges. A hand on the ball holds it still.

While someone plays, a gold pixel ring holds the ball in place. After five seconds of active play the ring unravels pixel by pixel, and the ball can then be pulled out of the banner and thrown anywhere on screen. Loose, it shrinks to a toy size, rolls in the direction it travels, squashes and bounces off the viewport edges, and follows the cursor on a stiff spring so throws keep their momentum. Releases use the fastest stretch of the last ~110ms of pointer movement, which forgives the slowdown people make just before letting go, and a swing faster than 1400px/s slips the ball out of the cursor on its own. After six seconds untouched, or on Escape, it flies home and settles into its seat. A quiet hint appears only while someone is playing.

Arrow keys spin the ball, or roll it once it is loose. Space/Enter squeeze, and Escape/Home send it home. Orientation uses quaternions, so dragging and rolling behave the same from any angle.

The renderer loads separately, only for viewports wider than 900px with a fine primary pointer, hover support, and no reduced-motion preference. Mobile device signals, fewer than four reported logical CPU cores, or less than 4 GB of reported device memory retain the SVG. These are conservative eligibility hints, not guarantees: WebGL must also accept `failIfMajorPerformanceCaveat`, and a short rendering warmup must pass before the control appears. Sustained slow frames lower rendering resolution once, then restore the SVG if performance stays poor. Context failure or loss also restores the SVG.

Rendering pauses when settled, when held still, when offscreen, or when the tab is hidden. A hidden tab sends a loose ball straight home. GPU resources and event handlers are released when eligibility changes or the component unmounts. The artwork does not move automatically before interaction. No additional dependencies or remote assets are used.

`npm test` checks the motion math, including scroll pushes on a seated and a loose ball, momentum, squeeze/rebound, recovery across refresh rates, long frames, the ring timer, wall bounces, throw reading, and the return home. Browser rendering and the feel of the interaction still require manual review; no automated screenshots or visual review have been used.

## Event facts and release review

Edit `src/constants/event.ts` only after checking OrganizerHQ and the event onboarding materials. The organizer supplied October 24, 2026 as the event date and MCCB 109 as the starting location during copy review. Time, venue, contact email, and any partner challenge remain unset; the page directs visitors to the official MLH event page for details. The hero and footer should be reviewed with the organizer before public distribution.

The current site does not collect names, emails, registrations, or analytics. Hosting and DNS providers may still process routine request metadata. Review the privacy copy and MLH links before publication.

## Assets

The hero reuses the Dahlonega steeple pixel map from the project-owned CodeHawks banner, with newly authored layout, copy, type wordmark, mountain backdrop, and surrounding styles. No Microsoft artwork or font files are distributed. See [asset provenance](../docs/ASSET-PROVENANCE.md).
