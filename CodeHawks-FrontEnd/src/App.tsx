import { event } from './constants/event';
import MountainBackdrop from './components/MountainBackdrop';
import SteepleToy from './components/SteepleToy';

// The steeple pixel map comes from the project's existing Hacklonega banner,
// so the site and the banner feel like one event.
const steeple = [
  '...................g.................',
  '...................gg................',
  '..................ggg................',
  '..................ggg................',
  '.................gggg................',
  '.................gggg................',
  '................ggggggg..............',
  '................ggggg.g..............',
  '...............gggggg.g..............',
  '...............gggggg.g..............',
  '..............ggggggg.gg.............',
  '..............ggggggg.gg.............',
  '..............ggggggg.gg.............',
  '.............gggggggg.ggg............',
  '.............gggggggg..gg............',
  '............ggggggggg..ggg...........',
  '............ggg.gggggg.gggg..........',
  '...........ggg...ggggg.gggg..........',
  '..........gggg....gg...gggg..........',
  '.........gggg...........gg...........',
  '........ggg....ww...w................',
  '..............wwwwwww......g.........',
  '...........wwwwwwwwww..w...g.........',
  '.........wwwwwwwwwwww..www.gg........',
  '..........wwwwwwwwwww..www..g........',
  '..........wwwwwwwwwww..wwww..g.......',
  '..........wwwwwwwwwww..wwww..........',
  '..........wwwwwwwwwww..wwww..........',
  '..........wwwwwwwwwww..wwww..........',
  '..........wwwwwwwwwww..wwww..........',
  '..........wwwwwwwwwww..wwww..........',
  '..........wwwww........wwww..........',
  '..........www............ww..........',
  '..........ww....wwwwwww..............',
  '..............wwwwwwwwwww............',
  '............wwww.........ww..........',
  '...........www.......................',
  '.........www.........................',
];

function DahlonegaScene() {
  return (
    <svg className="dahlonega-scene" viewBox="0 0 520 340" role="img" aria-labelledby="scene-title">
      <title id="scene-title">The original gold and cream Dahlonega pixel steeple with layered mountains and pine trees, contained within a cobalt circle</title>
      <defs>
        <clipPath id="dahlonega-circle">
          <circle cx="322" cy="153" r="137" />
        </clipPath>
      </defs>
      <g clipPath="url(#dahlonega-circle)">
        {/* A night sky a step darker than the page keeps the circle distinct. */}
        <circle cx="322" cy="153" r="137" fill="#0e2461" />
        <g fill="#92b6e6" opacity=".55">
          <path d="M207 105h18v-5h24v5h17v4h-59zm167-30h19v-5h27v5h22v4h-68z" />
          <path d="M250 57h3v3h-3zm151 43h4v4h-4zm-176 40h3v3h-3z" />
          <path d="M415 129h14v2h-14zm6-6h2v14h-2z" />
        </g>
        <path d="M175 210v-25h20v-15h20v-17h20v-16h18v18h20v18h20v17h25v-12h24v-18h20v-20h20v-17h18v17h18v18h20v18h25v20h22v115H175Z" fill="#3764b5" />
        <path d="M175 238v-20h23v-14h23v-16h23v-14h20v15h23v17h24v19h24v-10h22v-16h24v-18h21v16h24v17h23v18h29v69H175Z" fill="#254984" />
        <path d="M175 270v-19h30v-12h31v-10h29v12h34v12h33v-13h31v-13h28v11h30v13h29v10h23v40H175Z" fill="#173561" />
        <g fill="#10294f">
          <path d="M219 205h5v8h5v8h5v7h-9v14h-7v-14h-9v-7h5v-8h5zm-21 21h5v7h5v7h4v7h-8v13h-7v-13h-8v-7h4v-7h5z" />
          <path d="M405 207h5v9h5v8h5v8h-10v16h-6v-16h-10v-8h5v-8h6zm27 20h5v7h5v8h5v7h-10v16h-6v-16h-9v-7h5v-8h5z" />
        </g>
        <path d="M238 262h25v3h-25zm109 10h32v3h-32zm-60 9h17v3h-17z" fill="#5074a3" />
        <g data-steeple="" transform="translate(216 35) scale(5.5)" shapeRendering="crispEdges">
          {steeple.flatMap((row, rowIndex) =>
            row.split('').flatMap((cell, columnIndex) => cell === '.'
              ? []
              : [<rect x={columnIndex} y={rowIndex} width="1" height="1" fill={cell === 'g' ? '#ffc62f' : '#f3eedf'} key={`${rowIndex}-${columnIndex}`} />]),
          )}
        </g>
      </g>
    </svg>
  );
}

function Register({ className = '', label = 'Register on MLH' }: { className?: string; label?: string }) {
  return <a className={className} href={event.registrationUrl}>{label}<span aria-hidden="true">↗</span></a>;
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <MountainBackdrop />
      <div className="site" id="top">
        <header className="site-header">
          <a className="site-logo" href="#top" aria-label="Hacklonega home">hacklonega<span aria-hidden="true">.</span></a>
          <nav aria-label="Main navigation">
            <a href="#about">About</a>
            <a href={event.conductUrl}>MLH Code of Conduct <span aria-hidden="true">↗</span></a>
          </nav>
        </header>

        <main id="main">
          <section className="hero" aria-labelledby="hero-heading">
            <div className="banner">
              <div className="banner-kicker"><p>{event.programName}</p><p>{event.location}</p></div>
              <h1 id="hero-heading" className="type-word"><span className="type-word__text">hacklonega<span aria-hidden="true">.</span></span></h1>
              <div className="banner-body">
                <div className="banner-copy">
                  <p className="banner-tagline">Hack the mountains.</p>
                  <p className="banner-date"><time dateTime={event.date}>{event.dateLabel}</time></p>
                  <p className="banner-description">Team up with other students and build something using open-source AI.</p>
                  <Register className="hero-register" />
                  <p className="banner-details">Free to attend</p>
                </div>
                <figure className="campus-panel"><SteepleToy><DahlonegaScene /></SteepleToy></figure>
              </div>
            </div>
            <a className="hero-caption" href="#about">About the hackathon <span aria-hidden="true">↓</span></a>
          </section>

          <section className="about" id="about" aria-labelledby="about-heading">
            <div className="about-heading">
              <p className="eyebrow">About the event</p>
              <h2 id="about-heading">UNG’s first hackathon</h2>
            </div>
            <div className="about-copy">
              <p>Hacklonega is a one-day hackathon in Dahlonega, part of Hacktoberfest Hack Days. We’ll be building projects with open-source AI and open-weight models.</p>
              <p>We’ll start in <strong>{event.startingLocation}</strong>. Bring a laptop and charger.</p>
              <a href={event.hostGuideUrl}>About Hacktoberfest <span aria-hidden="true">↗</span></a>
            </div>
            <div className="event-note">
              <p className="eyebrow">Event details</p>
              <p>See the <a href={event.registrationUrl}>official MLH event page <span aria-hidden="true">↗</span></a> for the schedule and latest event details.</p>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <div className="footer-main">
            <a className="footer-brand" href="#top">hacklonega.</a>
            <div className="footer-links">
              <Register />
              <a href={event.conductUrl}>MLH Code of Conduct <span aria-hidden="true">↗</span></a>
              <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
            </div>
          </div>
          <div className="footer-meta">
            <p>Hacktoberfest Hack Day · Dahlonega, Georgia<br />Registration is hosted by MLH.</p>
            <p>This site has no form or analytics. Hosting providers may process routine request data. Registration happens on MLH OrganizerHQ under its privacy terms.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
