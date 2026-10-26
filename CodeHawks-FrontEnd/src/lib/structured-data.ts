import { event } from '../constants/event';

// schema.org Event for search results. Built from the same constants as the
// page so the two cannot drift. The event is over, so there is no offer to register.
export function eventJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Hackathon',
    name: event.name,
    alternateName: `${event.programName} ${event.location.split(',')[0]}`,
    description: event.description,
    url: event.siteUrl,
    image: [`${event.siteUrl}og-hacklonega.png`],
    startDate: event.startTime,
    endDate: event.endTime,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    isAccessibleForFree: true,
    organizer: {
      '@type': 'Organization',
      name: `${event.clubName}, ${event.hostName}`,
    },
    location: {
      '@type': 'Place',
      name: `${event.venue}, ${event.hostName}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.streetAddress,
        addressLocality: 'Dahlonega',
        addressRegion: 'GA',
        postalCode: event.postalCode,
        addressCountry: 'US',
      },
    },
  };
}
