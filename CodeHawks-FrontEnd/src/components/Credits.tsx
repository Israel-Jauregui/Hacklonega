import { event } from '../constants/event';

// Hacklonega is the club's event, so the host gets its own lockup with the club mark.
// Partners are credited separately, the way the countdown screens did it.
export function HostedBy({ className = '' }: { className?: string }) {
  return (
    <div className={`host ${className}`}>
      <img className="host__mark" src="/partners/swe-mark.svg" alt="" width="1000" height="1000" />
      <p>
        <span className="host__label">Hosted by</span>
        <span className="host__name">{event.clubName}</span>
        <span className="host__place">{event.hostName} // {event.location}</span>
      </p>
    </div>
  );
}

// A plate at the top left of the page, like the season badge on MLH member events,
// saying this was an official Hacktoberfest Hack Day. The wordmark is Hacktoberfest's own, unaltered.
export function SeasonBadge() {
  return (
    <a className="season" href={event.hacktoberfestUrl} aria-label="An official Hacktoberfest 2026 Hack Day. Visit hacktoberfest.com">
      <img src="/partners/hacktoberfest-wordmark.svg" alt="" width="2243" height="215" />
      <span className="season__label">Official Hack Day</span>
    </a>
  );
}

// Partner marks are each company's own artwork, unaltered, always on a light surface.
export function PartnerBar() {
  return (
    <div className="partners" role="group" aria-label="Partners">
      <div className="partners__set">
        <span className="partners__label">Powered by</span>
        <img className="partners__mlh" src="/partners/mlh.svg" alt="Major League Hacking" width="311" height="131" />
      </div>
      <span className="partners__rule" aria-hidden="true" />
      <div className="partners__set">
        <span className="partners__label">Tracks</span>
        <img className="partners__track" src="/partners/snowflake.svg" alt="Snowflake" width="143" height="32" />
        <img className="partners__track" src="/partners/digitalocean.svg" alt="DigitalOcean" width="188" height="32" />
      </div>
    </div>
  );
}
