# Hacklonega frontend

React 19 and Vite 7 landing page for the Hacktoberfest Hack Day in Dahlonega. The site has no registration form; all registration links go to the official MLH OrganizerHQ event.

## Local development

```sh
npm ci
npm run dev
```

Run `npm run typecheck`, `npm run lint`, and `npm run build` before a release. `npm run preview` serves the production build locally.

## Event facts and release review

Edit `src/constants/event.ts` only after checking OrganizerHQ and the event onboarding materials. Date, time, venue, contact email, and any partner challenge are intentionally absent from the first draft. The hero and footer should be reviewed with the organizer before public distribution.

The current site does not collect names, emails, registrations, or analytics. Hosting and DNS providers may still process routine request metadata. Review the privacy copy and MLH links before publication.

## Assets

The hero reuses the Hacklonega wordmark glyphs and Dahlonega steeple pixel map from the project-owned CodeHawks banner, with newly authored layout, copy, and surrounding styles. No Microsoft artwork or font files are distributed. See [asset provenance](../docs/ASSET-PROVENANCE.md).
