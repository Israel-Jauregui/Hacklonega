import { event } from '../constants/event';

// schema.org Event for search results. Built from the same constants as the
// page so the two cannot drift. Unset facts (time, venue) are left out.
export function eventJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Hackathon',
    name: event.name,
    alternateName: `${event.programName} ${event.location.split(',')[0]}`,
    description: event.description,
    url: event.siteUrl,
    image: [`${event.siteUrl}og-hacklonega.png`],
    startDate: event.date,
    endDate: event.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    isAccessibleForFree: true,
    location: {
      '@type': 'Place',
      name: event.venue ?? event.hostName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dahlonega',
        addressRegion: 'GA',
        addressCountry: 'US',
      },
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: event.registrationUrl,
    },
  };
}
