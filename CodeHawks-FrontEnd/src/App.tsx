import { event } from './constants/event';

// The wordmark and steeple pixel maps come from the project's existing
// Hacklonega banner. Keeping the same shapes makes the site feel like one event.
const glyphs: Record<string, string[]> = {
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  N: ['10001', '11001', '11001', '10101', '10011', '10011', '10001'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
};

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

function PixelWord({ word }: { word: string }) {
  return (
    <span className="pixel-word" aria-hidden="true">
      {word.split('').map((letter, letterIndex) => (
        <span className="pixel-letter" key={letterIndex}>
          {glyphs[letter].flatMap((row, rowIndex) =>
            row.split('').map((cell, columnIndex) => (
              <i className={cell === '1' ? 'pixel-cell filled' : 'pixel-cell'} key={`${rowIndex}-${columnIndex}`} />
            )),
          )}
        </span>
      ))}
    </span>
  );
}

function PixelSteeple() {
  return (
    <span className="pixel-steeple" aria-hidden="true">
      {steeple.flatMap((row, rowIndex) =>
        row.split('').map((cell, columnIndex) => (
          <i className={`steeple-cell steeple-cell--${cell}`} key={`${rowIndex}-${columnIndex}`} />
        )),
      )}
    </span>
  );
}

function Register({ className = '', label = 'Register for free' }: { className?: string; label?: string }) {
  return <a className={className} href={event.registrationUrl}>{label}<span aria-hidden="true">↗</span></a>;
}

const day = [
  { title: 'Arrive', body: 'Check in through MLH OrganizerHQ when you get to the venue.' },
  { title: 'Make', body: 'Find collaborators, explore open-source AI, and build something original.' },
  { title: 'Submit', body: 'Share a public GitHub repository with an open-source license through OrganizerHQ Challenges.' },
  { title: 'Show', body: 'Demo what you made. One team will win Best Open-Source AI Project.' },
];

const questions = [
  ['What is Hacklonega?', 'A one-day, in-person Hacktoberfest Hack Day in Dahlonega, Georgia. People get together to learn and build projects using open-source or open-weight AI.'],
  ['Is it free?', 'Yes. Hacktoberfest Hack Days are free to attend. Registration is handled by MLH OrganizerHQ.'],
  ['Do I need to know how to code or use AI?', 'No prior hackathon or AI experience is required. Bring curiosity and a willingness to try things with other builders.'],
  ['Can I come with a team?', 'Yes. You can build with others. Final team rules and any team-formation details will be posted on the official registration page.'],
  ['What should I bring?', 'Bring a laptop and charger. A GitHub account will help when it is time to publish and submit your project.'],
  ['What do I have to submit?', 'For the Best Open-Source AI Project challenge, submit an original project that meaningfully uses open-source or open-weight AI. It needs a public GitHub repository and an open-source license.'],
] as const;

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="site">
        <header className="site-header">
          <a className="site-logo" href="#top" aria-label="Hacklonega home"><span className="site-logo__mark" aria-hidden="true">&gt;_</span><span>HACKLONEGA</span></a>
          <nav aria-label="Main navigation"><a href="#about">About</a><a href="#day">The day</a><a href="#faq">FAQ</a><a href={event.conductUrl}>Code of Conduct</a></nav>
          <Register className="header-register" label="Register" />
        </header>

        <main id="main">
          <section className="hero" id="top" aria-labelledby="hero-heading">
            <div className="hero-window">
              <div className="title-bar"><span className="title-bar__icon" aria-hidden="true">&gt;_</span><span>hacklonega.exe</span><span className="title-bar__controls" aria-hidden="true"><i>_</i><i>□</i><i>×</i></span></div>
              <div className="banner">
                <div className="banner-copy">
                  <p className="banner-kicker"><span>&gt;_</span> HACKTOBERFEST HACK DAY</p>
                  <h1 id="hero-heading" className="sr-only">Hacklonega</h1>
                  <PixelWord word="HACKLONEGA" />
                  <div className="banner-tagline"><span aria-hidden="true" /><p>HACK THE MOUNTAINS.<br />BUILD IN THE OPEN.</p></div>
                  <p className="banner-location"><span className="location-pin" aria-hidden="true" /><span><strong>DAHLONEGA, GEORGIA</strong><small>ONE DAY. IN PERSON. FREE.</small></span></p>
                  <Register className="hero-register" label="REGISTER ON MLH" />
                </div>
                <aside className="campus-panel" aria-label="Dahlonega pixel art">
                  <div className="campus-panel__label"><span>UNG</span> // DAHLONEGA</div>
                  <div className="campus-panel__art"><PixelSteeple /></div>
                </aside>
              </div>
              <div className="status-bar"><span>CODEHAWKS @ UNG</span><span>HACKTOBERFEST 2026</span></div>
            </div>
            <p className="hero-caption">A day for making things with people who love making things.</p>
          </section>

          <section className="about section" id="about" aria-labelledby="about-heading">
            <div className="section-label"><span>01</span> / ABOUT</div>
            <div className="about-grid">
              <h2 id="about-heading">WHAT IS<br /><span>HACKLONEGA?</span></h2>
              <div className="about-copy"><p>Hacklonega is Dahlonega’s Hacktoberfest Hack Day: a free, in-person day to learn, experiment, and build together.</p><p>Hacktoberfest celebrates open source around the world. In 2026, Hack Days focus on making projects with open-source AI and open-weight models. You do not need to arrive with an idea or know your way around AI. Start where you are.</p><a href={event.hostGuideUrl}>Learn about Hacktoberfest <span aria-hidden="true">↗</span></a></div>
            </div>
          </section>

          <section className="day section" id="day" aria-labelledby="day-heading">
            <div className="section-label"><span>02</span> / THE DAY</div>
            <div className="day-heading"><h2 id="day-heading">HOW THE DAY<br /><span>UNFOLDS</span></h2><p>The final times and venue details will appear on the official MLH registration page.</p></div>
            <div className="day-list">{day.map((item, index) => <article className="day-row" key={item.title}><span className="day-row__number">0{index + 1}</span><h3>{item.title}</h3><p>{item.body}</p><span className="day-row__arrow" aria-hidden="true">↗</span></article>)}</div>
          </section>

          <section className="challenge section" id="challenge" aria-labelledby="challenge-heading">
            <div className="section-label"><span>03</span> / THE CHALLENGE</div>
            <div className="challenge-grid"><div><p className="challenge-prompt">&gt; challenge.load<span className="cursor">_</span></p><h2 id="challenge-heading">BEST OPEN-<br />SOURCE AI<br /><span>PROJECT</span></h2></div><div className="challenge-copy"><p>Make an original project where open-source or open-weight AI is an important part of how it works. Show us what you tried, what you learned, and what you built.</p><ul><li>Public GitHub repository</li><li>Open-source license</li><li>Submission through OrganizerHQ Challenges</li></ul><a href={event.challengeUrl}>Read the official challenge rules <span aria-hidden="true">↗</span></a></div></div>
          </section>

          <section className="faq section" id="faq" aria-labelledby="faq-heading"><div className="section-label"><span>04</span> / FAQ</div><div className="faq-grid"><h2 id="faq-heading">A FEW<br /><span>GOOD QUESTIONS.</span></h2><div className="faq-items">{questions.map(([question, answer]) => <details key={question}><summary><span>{question}</span><span className="faq-plus" aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></div></section>

          <section className="closing" aria-labelledby="closing-heading"><div className="closing-inner"><span className="closing-spark" aria-hidden="true">✳</span><p>SEE YOU IN DAHLONEGA.</p><h2 id="closing-heading">LET'S BUILD<br />SOMETHING OPEN.</h2><Register className="closing-register" label="REGISTER FOR FREE" /></div></section>
        </main>

        <footer className="site-footer"><div className="footer-main"><a className="footer-brand" href="#top">HACKLONEGA<span>_</span></a><div className="footer-links"><Register label="Register" /><a href={event.conductUrl}>MLH Code of Conduct</a><a href="#privacy">Privacy</a><a href="#top">Back to top ↑</a></div></div><div className="footer-meta"><p>Hacklonega is a Hacktoberfest Hack Day in Dahlonega, Georgia. Hacktoberfest 2026 is powered by MLH and DEV and presented by DigitalOcean.</p><p id="privacy">This site has no form or analytics. Hosting providers may process routine request data. Registration happens on MLH OrganizerHQ under its privacy terms.</p></div></footer>
      </div>
    </>
  );
}
