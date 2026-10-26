import { event } from './constants/event';
import { photos } from './constants/photos';
import { groups, projects } from './constants/projects';
import { HostedBy, PartnerBar, SeasonBadge } from './components/Credits';
import DahlonegaScene from './components/DahlonegaScene';
import LookSwitch from './components/LookSwitch';
import MountainBackdrop from './components/MountainBackdrop';
import PhotoStrip from './components/PhotoStrip';
import PhotoViewer from './components/PhotoViewer';
import ProjectCard from './components/ProjectCard';
import RetroWindow from './components/RetroWindow';
import Starfield from './components/Starfield';
import SteepleToy from './components/SteepleToy';

const viewerPhotos = photos.filter(photo => photo.viewer);
const stripPhotos = photos.filter(photo => photo.strip);
// Open on the teams with their shirts in front of the UNG screen, then carry on through the day.
const viewerStart = viewerPhotos.findIndex(photo => photo.slug === 'img-2142');

const recap = [
  'Hacklonega was UNG’s first hackathon.',
  'One Saturday in Dahlonega, one building, and a lot of students building with open-source AI and open-weight models.',
  'Arduinos and fanny packs went home with hackers, courtesy of MLH.',
  'Thanks for hacking the mountains with us.',
];

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <MountainBackdrop />
      <div className="site" id="top">
        <header className="site-header">
          <div className="site-brand">
            <SeasonBadge />
            <a className="site-logo" href="#top" aria-label="Hacklonega home">hacklonega<span aria-hidden="true">.</span></a>
          </div>
          <nav aria-label="Main navigation">
            <a href="#projects">Projects</a>
            <a href="#photos">Photos</a>
            <LookSwitch />
          </nav>
        </header>

        <main id="main">
          <section className="hero" aria-labelledby="hero-heading">
            <Starfield />
            <div className="banner">
              <div className="banner-kicker"><p>{event.programName}</p><p>{event.dateLabel} // {event.location}</p></div>
              <h1 id="hero-heading" className="type-word"><span className="type-word__text">hacklonega<span aria-hidden="true">.</span></span></h1>
              <div className="banner-body">
                <div className="banner-copy">
                  <p className="banner-lead"><span className="rule" aria-hidden="true" />That’s a wrap.</p>
                  <p className="banner-description">Hacklonega was UNG’s first hackathon. For one Saturday in Dahlonega, students teamed up and built with open-source AI. Here’s what they made, and how the day looked.</p>
                  <div className="banner-actions">
                    <a className="button button--primary" href="#projects">See the projects <span aria-hidden="true">↓</span></a>
                    <a className="button" href={event.photosUrl}>All {event.photoCount} photos <span aria-hidden="true">↗</span></a>
                  </div>
                  <HostedBy />
                </div>
                <figure className="campus-panel"><SteepleToy><DahlonegaScene /></SteepleToy></figure>
              </div>
            </div>
          </section>

          <section className="day" aria-labelledby="day-heading">
            <h2 className="sr-only" id="day-heading">The day</h2>
            <PhotoViewer photos={viewerPhotos} start={viewerStart} />
            <div className="day__side">
              <p className="lead"><span className="rule" aria-hidden="true" />The day at Hacklonega</p>
              <RetroWindow
                title="C:\CODEHAWKS\README.TXT"
                menu={<span className="win__menu-items" aria-hidden="true"><span>File</span><span>Edit</span><span>Hack</span><span>Help</span></span>}
                status={['UNG // Dahlonega', 'October 24, 2026']}
              >
                <div className="readme">
                  {recap.map((line, i) => <p className="line" key={line}>{line}{i === recap.length - 1 && <span className="cursor" aria-hidden="true" />}</p>)}
                </div>
              </RetroWindow>
            </div>
          </section>

          <section className="section" id="projects" aria-labelledby="projects-heading">
            <div className="section-head">
              <p className="eyebrow">The projects</p>
              <h2 id="projects-heading">What got built.</h2>
              <p>Built in one day with open-source AI. <a href={event.projectsUrl}>All projects on MLH <span aria-hidden="true">↗</span></a></p>
            </div>
            {groups.map(group => (
              <div className="project-group" key={group.id}>
                <h3 className="group-label">{group.label}</h3>
                <div className="project-grid">
                  {projects.filter(project => project.group === group.id).map(project => <ProjectCard project={project} key={project.slug} />)}
                </div>
              </div>
            ))}
          </section>

          <section className="section" id="photos" aria-labelledby="photos-heading">
            <div className="section-head">
              <p className="eyebrow">Photos</p>
              <h2 id="photos-heading">The day in photos.</h2>
              <p>A few favorites from October 24. MLH has the whole set.</p>
            </div>
            <PhotoStrip photos={stripPhotos} />
            <a className="button button--primary button--big" href={event.photosUrl}>See all {event.photoCount} photos <span aria-hidden="true">↗</span></a>
          </section>

          <section className="section thanks" aria-labelledby="thanks-heading">
            <div className="thanks__panel">
              <img className="thanks__logo" src="/partners/mlh.svg" alt="Major League Hacking" width="311" height="131" />
              <div>
                <p className="eyebrow">Special thanks</p>
                <h2 id="thanks-heading">Thank you, MLH.</h2>
                <p>Major League Hacking sent the Hackathon in a Box, the Arduinos and fanny packs we handed out, and basically everything else the day ran on. Hacklonega wouldn’t have happened without them.</p>
              </div>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <PartnerBar />
          <div className="footer-main">
            <HostedBy className="host--footer" />
          </div>
          <div className="footer-links">
            <a href={event.mlhEventUrl}>MLH event page <span aria-hidden="true">↗</span></a>
            <a href={event.projectsUrl}>Projects on MLH <span aria-hidden="true">↗</span></a>
            <a href={event.photosUrl}>All photos <span aria-hidden="true">↗</span></a>
            <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
          </div>
          <div className="footer-meta">
            <p>Hacktoberfest 2026: AI belongs to everyone.<br />Hacklonega was a Hacktoberfest Hack Day, {event.dateLabel}.</p>
            <p>This site has no forms or analytics. Hosting providers may process routine request data. Partner logos are their owners’ trademarks, shown to credit this event’s partners.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
