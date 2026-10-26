# Asset provenance

| Asset | Source and rights | Use |
| --- | --- | --- |
| Page layout, type wordmark, and mountain backdrop | Newly authored React/CSS/SVG in this repository (`src/App.tsx`, `src/components/MountainBackdrop.tsx`) | Site artwork; the hero wordmark is set in system Courier New to match the header logo |
| Retro windows, photo viewer, photo strip, starfield, pixel wipe, and the Hacktoberfest look | Ported from the project-owned countdown screens in [Software-Engineering-Club-UNG/hacklonega-countdown](https://github.com/Software-Engineering-Club-UNG/hacklonega-countdown). The Hacktoberfest look's colors and type follow the hacktoberfest.com 2026 site; no Hacktoberfest site code is included, and the only Hacktoberfest artwork is the wordmark listed below | `src/components/RetroWindow.tsx`, `PhotoViewer.tsx`, `PhotoStrip.tsx`, `Starfield.tsx`, `LookSwitch.tsx`, `src/lib/pixel-wipe.ts` |
| Favicon and Open Graph image | Newly authored SVG in this repository, using the preserved project wordmark and steeple maps. `public/og-hacklonega.png` is a 1200×630 render of `og-hacklonega.svg` | Browser and sharing previews |
| Steeple composition | Newly authored SVG in `src/components/DahlonegaScene.tsx` and `public/og-hacklonega.svg` | Original Dahlonega steeple with newly authored pixel mountain ridges, pine silhouettes, and sky details, clipped to a circle (a night-sky blue in the hero, cobalt in the sharing artwork) |
| Interactive steeple sphere | Newly authored mesh, shaders, and spring motion in `src/lib/steeple-renderer.ts` and `src/lib/steeple-physics.ts` | Desktop enhancement; textures are generated locally from the same project-owned SVG, with its landscape reused on the reverse side |
| Hacklonega wordmark glyphs and steeple pixel map | Reused from the existing project-owned CodeHawks `HacklonegaAd.tsx` | The steeple map appears in the landing page; the pixel wordmark glyphs now appear only in the favicon and Open Graph image |
| Event photos | Taken at Hacklonega on October 24, 2026 and provided by the organizers; MLH's event gallery on SmugMug has the same set, except three later closing-ceremony shots. Turned upright, converted to sRGB WebP (1280px copies and 420px-tall thumbnails), and stripped of all metadata, including location | `public/photos/`, listed in `src/constants/photos.ts` and `src/constants/projects.ts` |
| Project summaries, team names, and links | Shortened from each team's own write-up on the public MLH submissions page | Project cards (`src/constants/projects.ts`) |
| SWE club mark | [club-styling-guide](https://github.com/Software-Engineering-Club-UNG/club-styling-guide) `assets/logo/swe-mark.svg`, unaltered (`public/partners/swe-mark.svg`) | "Hosted by" lockup in the hero and footer |
| Hacktoberfest wordmark | Hacktoberfest's own "HACKTOBERFEST 26" wordmark from the hacktoberfest.com (2026) header, unaltered (`public/partners/hacktoberfest-wordmark.svg`) | The "Official Hack Day" plate at the top left, linking to hacktoberfest.com |
| MLH logo | Major League Hacking's mark as shown in the "Powered by" lockup on hacktoberfest.com (2026), unaltered (`public/partners/mlh.svg`) | "Powered by" credit and the thank-you panel. Trademark of Major League Hacking |
| DigitalOcean and Snowflake logos | Each company's mark as shown on hacktoberfest.com (2026), unaltered (`public/partners/`) | Track credits. Trademarks of DigitalOcean and Snowflake |
| Typography | Tahoma/Verdana/Courier New system fonts for the club look. Inter, Martian Mono, and Barlow Semi Condensed (SIL Open Font License), self-hosted from `@fontsource` packages, for the Hacktoberfest look | Font files ship with the build |

Partner and Hacktoberfest marks are shown only to credit this MLH Hack Day's program, organizer partner, and tracks, always on a light surface. Remove any of them if MLH or the partner asks.

The September 2026 remodel uses SproutGT (<https://sprout.hack.gt/>) as a reference for pacing and composition. No SproutGT artwork, fonts, or code are included. The retained pixel maps and surrounding composition are Hacklonega artwork, not official MLH, Hacktoberfest, or university brand assets.
