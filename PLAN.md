# Hacklonega Website and Launch Plan

## Goal

Build and launch a polished, public registration website for the approved Hacktoberfest Hack Day in Dahlonega. The site should persuade students and local builders to attend, explain the 2026 event format accurately, and send registration traffic to the official OrganizerHQ page:

`https://events.mlh.com/events/14787-hacktoberfest-hack-day-dahlonega-x-university-of-north-georgia`

Create the work in a new sibling project named `Hacktoberfest-Hack-Day`. Do not modify either existing CodeHawks repository. Use the empty GitHub repository [`Israel-Jauregui/Hacklonega`](https://github.com/Israel-Jauregui/Hacklonega) when remote work begins.

The work is divided into three phases. The AI should complete and locally validate every artifact it can before asking the owner to perform account, billing, approval, or publication steps. Phase 1 is the exception: the owner has strong UI judgment and should be shown rendered drafts throughout the design loop.

## Current Program Facts to Design Around

As of September 22, 2026, the official Hacktoberfest materials describe a different format from prior years:

- Hacktoberfest 2026 centers on hands-on learning and building with open-source AI and open-weight models. The site must not describe the event as the old pull-request-count challenge.
- A Hacktoberfest Hack Day is a free, in-person, single-day mini-hackathon lasting 3 to 12 hours; the official guide calls 4 to 6 hours ideal.
- Registration and in-person check-in use OrganizerHQ. This website is promotional and must not create a second registration form.
- Every Hack Day uses OrganizerHQ Challenges for project submissions, judging, and winner publication.
- Every Hack Day runs the `Best Open-Source AI Project` challenge. MLH adds it to OrganizerHQ automatically.
- An event may receive one additional partner challenge assigned by MLH. Possible modules currently listed by MLH include Google Gemma, Snowflake, Solana, and GitHub Copilot. Do not advertise one until it appears in this event's OrganizerHQ/onboarding materials.
- Hosts may add a separate local challenge and provide its prize, but it must remain distinct from MLH-assigned challenges.
- Hosts must provide event photos and complete the OrganizerHQ/offboarding records after the event. Reimbursement and swag are subject to the official policy and availability.

Recheck these facts against the event's OrganizerHQ dashboard, approval email, and current MLH/Hacktoberfest host handbook immediately before public launch. Event-specific onboarding overrides general documentation.

## Decisions and Constraints

### Project structure

- Create `Hacktoberfest-Hack-Day/CodeHawks-FrontEnd` as a React 19 + Vite 7 single-page application.
- Create `Hacktoberfest-Hack-Day/CodeHawks-Backend/README.md` only to document that no runtime backend exists. Do not copy authentication, APIs, Lambda, DynamoDB, Cognito, SES, or member-management code.
- Keep event facts, URLs, contact details, and feature flags in a typed frontend constants module so unverified facts can be withheld without editing components.
- Use hash anchors for page sections. Do not add React Router for a single page.
- Use vanilla CSS and the approved XP.css dependency. Do not add Tailwind or a second UI framework.

### Visual direction

- Use the existing `HacklonegaAd.tsx` and `HacklonegaAd.css` only as a project-owned reference until reuse permission is documented.
- Preserve the Hacklonega retro desktop identity: blue title chrome, deep navy pixel-grid surfaces, gold accents, cobalt shadows, silver controls, terminal details, and crisp pixel treatment.
- Incorporate current Hacktoberfest visual cues through approved assets and small accents without replacing the site's distinctive XP/Luna direction.
- Keep the registration action visually dominant. The MLH badge, artwork, animation, and secondary links must not obscure it.
- Make the design responsive from small phones through wide desktop screens, with reduced-motion support and no overlap or horizontal scrolling.

### Registration and data boundaries

- Store the OrganizerHQ registration URL once and reuse it for every registration CTA.
- Open registration in the same tab unless user testing shows a reason to do otherwise.
- Do not add a contact form, newsletter form, account system, ticketing flow, RSVP database, analytics, advertising pixels, session replay, or third-party chat widget for the initial release.
- Do not proxy, rewrite, or append tracking parameters to the OrganizerHQ URL.
- If analytics or any personal-data collection is requested later, stop and update the privacy analysis, consent behavior, retention terms, and legal copy before implementation.

## Legal, Policy, and Public-Trust Requirements

This section is an implementation risk checklist, not a substitute for advice from the university or qualified counsel.

### MLH and Hacktoberfest compliance

- Use the official event name supplied in the approval/onboarding materials. Do not infer that `Hacklonega` is the approved event name.
- Publish the MLH Code of Conduct link in both navigation and footer. Also make the event's safety/reporting path discoverable without publishing a volunteer's private phone number.
- Use the official MLH trust badge, MLH logo, Hacktoberfest logo, and sponsor attribution only in the form and placement authorized by the current event kit.
- The older public 2022 MLH Member Event Guidelines and April 2025 Hacktoberfest brand PDF are background references. Do not treat them as the final 2026 license or asset kit.
- The 2025 Hacktoberfest brand guide requires DigitalOcean attribution when Hacktoberfest brand elements are used and restricts merchandise, endorsement-style use, and sale of branded items. Reconfirm the current 2026 requirements before launch because the program ownership and format changed.
- Do not promise a shirt, swag item, meal, reimbursement, partner prize, physical prize, badge, or prize value unless the event-specific materials confirm it. Use `subject to availability` where required.
- Do not publish a partner challenge based on preference or application choice. Publish only challenges visible in OrganizerHQ or confirmed in writing by MLH.
- Do not describe MLH, DEV, DigitalOcean, UNG, Microsoft, GitHub, or any partner as a sponsor or endorser beyond the exact relationship confirmed in official materials.

### University, trademark, copyright, and asset rights

- Obtain university/club approval before using UNG names, marks, logos, building art, or statements that imply university sponsorship or endorsement.
- Confirm ownership or permission for the `Hacklonega` name, the existing banner, the attached reference image, and claims such as `Dahlonega's first hackathon`.
- The Luna/XP-era visual language is an approved creative direction. The site may use newly authored blue title bars, gradients, bevels, silver panels, chunky controls, pixel details, and retro desktop/window compositions. Make Hacklonega the dominant identity and keep the implementation recognizably original rather than reproducing a Microsoft screen pixel for pixel.
- Do not copy Microsoft/Windows logos, the Start button/flag treatment, Bliss or other Microsoft wallpapers, system sounds, proprietary icons, screenshots, or product branding. Do not bundle Microsoft fonts; a CSS system-font fallback may use a font already installed on a visitor's device.
- Treat `Windows XP/Luna-inspired` as an internal design description. Public-facing copy does not need Microsoft product names or a Microsoft disclaimer unless the final site actually refers to Microsoft products.
- Use only approved MLH/Hacktoberfest assets from the organizer kit. Do not redraw their logos or use them as decorative source material for unrelated graphics.
- Record every font, icon, image, logo, and reused code asset in `docs/ASSET-PROVENANCE.md`, including source, license/permission, attribution, and local filename.
- Prefer locally hosted, licensed assets. Avoid runtime font/CDN requests that add privacy, reliability, or license ambiguity.

### Privacy, minors, photography, and event rules

- The website should intentionally collect no personal information. Registration and its legal consent flow remain on OrganizerHQ.
- Publish a short, accurate privacy notice explaining that the site has no forms or analytics at launch, that hosting/DNS providers may process routine request metadata, and that OrganizerHQ/MLH governs information submitted after following the registration link. Do not claim `we collect no data` if infrastructure logs or third-party requests exist.
- Link the applicable MLH privacy policy, contest/event terms, and Code of Conduct where the current OrganizerHQ/event kit requires them. Do not copy those policies into this site where a canonical link is more accurate.
- Confirm the attendee age policy, guardian requirements, university youth-program rules, accessibility accommodations contact, and emergency/incident process before publishing eligibility copy. The general Hacktoberfest FAQ says participants may be 13+, but that does not override local venue or university rules.
- Before promising photography or publishing a photo notice, confirm the organizer's release/notice process for attendees and minors. Do not treat registration alone as a photo release unless the actual registration terms say so.
- Do not draft an ad hoc liability waiver or binding event terms inside the website. Use the university/MLH-approved documents and have the responsible institution review any additional terms.
- Never publish private organizer details, attendee lists, registration exports, incident reports, or reimbursement records in the repository or website.

### Accuracy, accessibility, and security

- Verify the date, time zone, venue name/address, parking/transit instructions, price, eligibility, team size, food, accommodations, schedule, prizes, and contact route against authoritative organizer records before launch.
- Avoid unsupported superlatives, scarcity claims, attendance counts, sponsor claims, or guarantees.
- Target WCAG 2.2 AA: semantic landmarks and headings, complete keyboard operation, visible focus, adequate contrast, text alternatives, accessible disclosures, 44px touch targets where practical, zoom/reflow support, reduced motion, and descriptive link text.
- Add an accessibility statement/contact path and test the actual experience; do not claim certification or full legal compliance.
- Add a restrictive Content Security Policy and appropriate security headers at CloudFront. Allow only resources the site actually needs. Add `Referrer-Policy`, `X-Content-Type-Options`, `Permissions-Policy`, and clickjacking protection through CSP `frame-ancestors`.
- Keep dependencies minimal, commit the lockfile, audit production dependencies, and exclude credentials, state files, plans, logs, registration data, and private security findings from Git.

## Phase 1 — Build, Render, and Iterate on the Website

### 1.1 Preflight and scaffold

- Confirm the new destination does not already contain work that must be preserved.
- Inspect the source banner/component and document whether code/assets are reused or recreated.
- Scaffold the standalone React/Vite app, linting, type checking, Vitest, build scripts, `.gitignore`, root README, frontend README, backend placeholder README, and asset provenance file.
- Add centralized event constants with explicit `verified`, `pending`, or omitted values. Never render placeholders such as `[INSERT DATE]` on the public build.

### 1.2 Content and page modules

Implement a complete landing page with:

1. Header/navigation with the MLH Code of Conduct and registration action.
2. Hero with approved event name, verified date/location, concise open-source AI message, primary OrganizerHQ CTA, and one verified secondary action if available.
3. `What changed in 2026` explainer that sets correct expectations without assuming AI experience.
4. Hack Day overview explaining that attendees build an original project using open-source or open-weight AI.
5. Challenge section for `Best Open-Source AI Project`, including the public GitHub repository and open-source license requirements. Render assigned partner/local challenges only from verified constants.
6. Beginner path explaining team formation, workshops/mentors if confirmed, suggested preparation, and what to bring.
7. Verified schedule. If timing is not final, omit detailed times and show only approved high-level milestones.
8. Accessible FAQ using native `<details>/<summary>` or equivalent keyboard-safe disclosure controls.
9. Registration reminder near the page end.
10. Footer with registration, Code of Conduct, privacy notice, accessibility contact, verified organizer/social links, and required attribution.

Potential countdown behavior must have a verified target/time zone, work without JavaScript, respect reduced motion, and disappear cleanly after the deadline. Skip it if these conditions are not met.

### 1.3 UI iteration loop with the owner

The owner remains actively involved in visual decisions during Phase 1:

1. AI creates a working first composition and renders desktop and mobile screenshots.
2. Owner critiques hierarchy, spacing, color, typography, retro authenticity, copy tone, and CTA emphasis.
3. AI implements the feedback, rerenders the affected breakpoints, and calls out any accessibility or brand constraint that changes the design choice.
4. Repeat until the owner approves the visual direction.
5. AI performs a final polish pass for responsive states, focus/hover/active states, motion, loading behavior, and social preview artwork.

Do not interrupt the build for routine choices. Batch unresolved factual/legal items into the final owner checklist while keeping unverified claims out of rendered public copy.

### 1.4 Quality checks

- Test event identity, every registration CTA, exact clean OrganizerHQ URL, Code of Conduct links, challenge visibility rules, FAQ keyboard behavior, and missing-data fallbacks.
- Run `npm ci`, typecheck, lint, tests, production build, and dependency audit.
- Inspect desktop and mobile renders and test keyboard-only navigation, 200% zoom, reduced motion, color contrast, broken links, metadata, favicon, robots/sitemap behavior, and console/network errors.
- Verify no old CodeHawks authentication/member code, personal data, secrets, unlicensed assets, or draft legal claims appear in the production bundle.

### Phase 1 exit criteria

- The owner approves the visual direction after at least one rendered feedback round.
- All public facts are verified or omitted.
- The local production build and checks pass.
- Privacy, accessibility, asset provenance, and organizer-facing verification documents exist.

## Phase 2 — GitHub CI/CD and AWS Infrastructure

Phase 2 prepares GitHub and AWS automation without requiring a custom domain. The CloudFront-generated hostname can validate the deployment before Phase 3.

### 2.1 Git and GitHub preparation

- Initialize Git only inside `Hacktoberfest-Hack-Day/`, with `main` and a `feature/event-registration-site` branch.
- Add the approved GitHub remote only after resolving the exact destination with a read-only check.
- Create pull-request CI that uses `npm ci` and runs typecheck, lint, tests, and build.
- Give `GITHUB_TOKEN` read-only permissions by default and elevate only the individual job that requires more.
- Pin every third-party GitHub Action to a reviewed full commit SHA and include the readable release tag in a comment.
- Add Dependabot configuration for npm and GitHub Actions, a PR template, CODEOWNERS if appropriate, and documented release/rollback steps.
- Prepare branch protection/ruleset settings: PR required for `main`, required CI checks, stale approval dismissal, force-push/deletion prevention, and environment protection for production.

### 2.2 AWS architecture as code

- Use Terraform for a private S3 origin, CloudFront distribution with Origin Access Control, blocked public S3 access, default root object, SPA-safe error handling only if needed, compression, HTTPS redirect, security headers, sensible caching, and cost tags/budget alarms.
- Keep Phase 2 domain-neutral. Expose the CloudFront distribution hostname as an output and defer alternate domain names/certificate attachment to Phase 3.
- Separate bootstrap permissions from deploy permissions. Use GitHub OIDC with short-lived credentials, a narrowly scoped `sub` condition tied to the exact repository/environment, and no long-lived AWS access keys.
- Because GitHub changed OIDC subject behavior for some repositories created after July 15, 2026, inspect the repository's actual token/subject format before finalizing the AWS trust policy.
- Create distinct owner-approved workflows for infrastructure plan/apply and frontend deployment. Pull requests may validate and plan; production apply/deploy must use a protected GitHub environment.
- Publish build artifacts only from a successful CI job, deploy the exact reviewed artifact, sync safely to S3, and invalidate only necessary CloudFront paths.
- Add Terraform formatting/validation and policy/invariant checks. Never commit `.tfstate`, plan files, credentials, or sensitive outputs.

### 2.3 Local validation before owner action

- Validate workflows syntactically and inspect effective permissions.
- Run Terraform formatting and validation without cloud credentials or remote state.
- Review IAM policies for least privilege and ensure the S3 bucket cannot be read anonymously.
- Produce a bootstrap/runbook with exact owner actions and expected outputs.

### Phase 2 exit criteria

- CI, deployment workflows, Terraform, rollback instructions, and the owner runbook are complete and locally validated.
- No cloud resources have been mutated from a developer/agent shell.
- The owner can perform the queued GitHub/AWS approvals after all development artifacts are reviewable.

## Phase 3 — Domain Purchase, Cloudflare DNS, TLS, and Launch

Phase 3 depends on Phase 2 outputs but can be prepared with a `domain_name` variable before a domain is selected. This boundary keeps domain billing and registrar acceptance at the final human-action stage.

### 3.1 Domain planning

- Generate a short candidate list and check current availability/pricing immediately before purchase. Do not publish or hard-code a domain until the owner selects and purchases it.
- Default to Cloudflare Registrar if the owner wants Cloudflare to be both registrar and authoritative DNS. Cloudflare Registrar requires accurate registrant data, payment, agreement acceptance, and email verification, so this purchase remains a human action.
- If the domain is purchased elsewhere, add it to Cloudflare and queue the registrar nameserver change for the owner. Account for existing DNSSEC before changing nameservers.

### 3.2 DNS and certificate architecture

- Request the CloudFront ACM certificate in `us-east-1` for the apex and `www` names as needed.
- Manage ACM DNS validation records and site records in Cloudflare through Terraform using a least-privilege API token stored only in the protected GitHub environment.
- Point the apex and chosen canonical host to CloudFront. Make one host canonical and redirect the other without a redirect loop.
- Use Cloudflare as authoritative DNS. Start site records as DNS-only so CloudFront remains the single CDN/TLS edge. Enable Cloudflare proxying only after documenting a concrete need and testing TLS mode, host headers, cache behavior, redirects, security headers, and origin protection.
- Configure HTTPS, modern TLS, canonical URL, sitemap, robots, Open Graph/Twitter metadata, and production-only CSP.
- Add DNSSEC only after the zone is stable and document renewal, registrar recovery, and account ownership.

### 3.3 End-to-end launch checks

- Verify apex and `www`, HTTP-to-HTTPS, canonical redirects, certificate chain, IPv4/IPv6 behavior where applicable, DNS resolution, direct S3 denial, CloudFront access, cache headers, error responses, and mobile/desktop rendering.
- Recheck every legal/footer link and registration CTA on the production domain.
- Confirm no secrets or Terraform state are present in GitHub artifacts or repository history.
- Record the live resource names, account ownership, monthly cost expectation, deployment/rollback process, domain renewal setting, and incident contacts in private operations documentation.

### Phase 3 exit criteria

- The production domain resolves through Cloudflare DNS to the secured CloudFront distribution.
- HTTPS and canonical redirects work, the S3 origin remains private, and deployment/rollback are tested.
- Public copy and branding have final owner/organizer approval.

## Final Human Intervention Queue

Apart from Phase 1 visual critique, defer human account and publication work until all local artifacts are ready. Present one ordered runbook covering:

1. Confirm final event facts, age/guardian policy, photo notice/release process, accessibility contact, safety contact, challenge assignment, prize/swag wording, and MLH/UNG/club branding permissions.
2. Approve the final rendered site and public legal/privacy copy. Ask university counsel or the responsible university office to review any institution-specific terms, youth rules, or waiver language.
3. Confirm the GitHub repository and grant/verify required repository administration access.
4. Review the staged diff and secret scan, then approve the initial push and pull request.
5. Configure/approve GitHub rulesets and protected environments.
6. Perform the one-time AWS OIDC/bootstrap action using the prepared template, then approve the infrastructure workflow and first frontend deployment.
7. Select and purchase the domain, accept registrar agreements, provide accurate registrant details, and verify the registrant email.
8. Create or authorize the least-privilege Cloudflare token in the protected GitHub environment; perform any registrar nameserver step that cannot be automated safely.
9. Approve the domain/TLS infrastructure run and complete the final launch acceptance checklist.

Never ask the owner to hand-copy generated configuration that can be safely automated. Never request long-lived AWS keys or expose billing, registrant, attendee, or incident data in chat/repository files.

## Definition of Done

The project is complete when:

1. The new sibling project exists and the two existing CodeHawks repositories remain unchanged.
2. The owner-approved site accurately explains the 2026 Hack Day, is accessible and responsive, and sends every registration CTA to the official OrganizerHQ URL.
3. Legal/privacy copy, Code of Conduct access, asset provenance, trademark attribution, and factual verification are complete.
4. CI passes and deployments use reviewed artifacts, protected environments, pinned Actions, and GitHub OIDC rather than long-lived AWS credentials.
5. AWS serves the site through CloudFront from a private S3 origin.
6. The selected production domain uses Cloudflare authoritative DNS, valid HTTPS, working canonical redirects, and documented renewal/rollback ownership.
7. The owner receives both a public launch checklist and a separate practical event-operations checklist for running registration, check-in, challenges, judging, photography, and MLH offboarding.

## Event Operations Companion Deliverable

The website project must also produce a concise organizer checklist based on the final onboarding materials. Its baseline workflow is:

### Before event day

- Confirm the approved name/format, exact start/end times, venue and access details, public organizer email, accessibility information, safety plan, Code of Conduct response roles, attendee/guardian policy, and photography consent process.
- Keep registration and attendee messages in OrganizerHQ. Inspect the public event page as an attendee would.
- Confirm that `Best Open-Source AI Project` appears in OrganizerHQ. Confirm any MLH-assigned partner category; do not create a missing duplicate. Add a local category only if the host will supply and administer its prize.
- Set the project submission window, deadline, demo format/time limit, judging process, and work-start rule before hacking begins.
- Recruit enough check-in staff, mentors, and judges; test Wi-Fi, power, projector/audio, check-in devices, and the submission flow.
- Review reimbursement rules before spending, keep itemized receipts, and make no promises beyond the approved amount or confirmed materials.

### During event day

- Check in each attendee through OrganizerHQ only when they are physically present.
- In the opening, explain the Code of Conduct/reporting path, schedule, project-work rule, exact deadline, demo format, judging method, all confirmed challenges, and submission steps.
- Give teams build time and beginner support. Remind them before the deadline that every presenting project must be submitted through OrganizerHQ.
- For `Best Open-Source AI Project`, verify that the project uses open-source or open-weight AI materially, has a public GitHub repository, carries an open-source license, identifies its model/dependencies, and can be demonstrated.
- Give eligible submissions an equal chance to present. Select one winning team for the required challenge and one for each confirmed partner/local category.
- Mark and verify winners in OrganizerHQ, review the gallery for accidental personal information, switch winners/gallery to public, and only then announce results in the room.
- Take useful event photos only under the approved notice/consent process; avoid people who opted out and screens/badges/documents showing personal information.

### After event day

- Confirm all physical check-ins, submitted projects, winner records, and the public gallery.
- Submit the requested event summary and approved photos.
- Submit complete itemized receipts through the supplied reimbursement workflow by the onboarding deadline. Reimbursement is limited by approved spending, eligible expenses, verified in-person check-ins, and the program cap.
- Follow the onboarding instructions for remaining swag/materials and direct unresolved prize or reimbursement questions to `hacktoberfest@mlh.io` with the event name and relevant category/project.

## Authoritative References Reviewed September 22, 2026

- Hacktoberfest 2026 overview: <https://hacktoberfest.com/>
- Official Hacktoberfest host guide: <https://hacktoberfest-handbook.mlh.com/>
- Official MLH Hacktoberfest handbook repository: <https://github.com/MLH/hacktoberfest-handbook>
- Best Open-Source AI Project requirements: <https://github.com/MLH/hacktoberfest-handbook/blob/main/fest-planning-guide/open-source-prize-categories.md>
- OrganizerHQ submissions and winner selection: <https://github.com/MLH/hacktoberfest-handbook/blob/main/project-submissions-and-judging-for-hacktoberfest-hack-day.md>
- MLH Hack Days FAQ: <https://github.com/MLH/mlh-hack-days-organizer-guide/blob/main/frequently-asked-questions-faq.md>
- MLH Code of Conduct: <https://static.mlh.io/docs/mlh-code-of-conduct.pdf>
- GitHub Actions OIDC for AWS: <https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws>
- GitHub Actions secure-use guidance: <https://docs.github.com/en/actions/reference/security/secure-use>
- AWS CloudFront private S3 origin/OAC: <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html>
- AWS CloudFront certificate requirements: <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html>
- Cloudflare domain registration: <https://developers.cloudflare.com/registrar/get-started/register-domain/>
- Cloudflare authoritative nameservers: <https://developers.cloudflare.com/dns/nameservers/>
- WCAG 2.2: <https://www.w3.org/TR/WCAG22/>
