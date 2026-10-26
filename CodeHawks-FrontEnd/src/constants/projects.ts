// The eight projects submitted on MLH, with the awards they won at the closing ceremony.
// Summaries are shortened from each team's own MLH write-up. Team names are as listed on MLH,
// plus Chance Caswell, whom the NeoPapyrus write-up credits.
export type Project = {
  slug: string;
  name: string;
  group: 'overall' | 'challenge' | 'runner-up';
  award: string;
  place?: string;
  summary: string;
  builtWith: string[];
  team: string[];
  source: string;
  demo?: string;
  mlh: string;
  photo: { slug: string; alt: string; width: number; height: number; focus?: 'top' };
};

const mlh = (id: string) => `https://www.mlh.com/events/hacktoberfest-hack-day-dahlonega-x-univ-north-georgia/submissions/${id}`;

export const groups = [
  { id: 'overall', label: 'Best Overall' },
  { id: 'challenge', label: 'Challenge winners' },
  { id: 'runner-up', label: 'Runners-up' },
] as const;

export const projects: Project[] = [
  {
    slug: 'fishnerd',
    name: 'fishnerd',
    group: 'overall',
    award: 'Best Overall',
    place: '1st place',
    summary: 'A fishing companion for Georgia’s freshwater fish. Snap a photo and BioCLIP, an open-weight model running on the team’s own backend, ranks likely matches from 290 species for you to confirm.',
    builtWith: ['BioCLIP', 'Python', 'TypeScript'],
    team: ['Colin Perry', 'Greyson Turner', 'Torben Conto'],
    source: 'https://github.com/torbenconto/hacklonega-2026',
    mlh: mlh('01a16f8b-a2a8-22c0-90fd-84b9dff2c97d'),
    photo: { slug: 'img-2196', alt: 'The fishnerd team on stage in front of their Best Overall slide', width: 1280, height: 960 },
  },
  {
    slug: 'cybercalc',
    name: 'CyberCalc',
    group: 'overall',
    award: 'Best Overall',
    place: '2nd place',
    summary: 'An open-source cybersecurity workbench for students and CTF players. It inspects bytes, hashes, encodings, XOR, subnets, and packet captures in the browser, and an opt-in open-weight model suggests the next lab. The math stays local.',
    builtWith: ['gpt-oss-20b', 'Hugging Face'],
    team: ['Gideon Prisk', 'Brianna Walter', 'Mickie Tran', 'Jack Burnett'],
    source: 'https://github.com/Bree-W/CyberCalc',
    mlh: mlh('01a16f9c-27e7-a1f0-0d54-b882ce359c1d'),
    photo: { slug: 'img-1440', alt: 'The CyberCalc team on stage in front of their Best Overall slide', width: 1280, height: 960 },
  },
  {
    slug: 'firetower',
    name: 'Firetower',
    group: 'overall',
    award: 'Best Overall',
    place: '3rd place',
    summary: 'Off-grid triage for when the cell towers go down. People send short texts over low-cost Meshtastic LoRa radios, and a gateway laptop uses an open-weight model to help decide what to act on first.',
    builtWith: ['Meshtastic', 'LoRa', 'gpt-oss-20b', 'FastAPI'],
    team: ['Joseph Oprea', 'Jacob Navarrete', 'Mark Huynh', 'Marius Lutenco'],
    source: 'https://github.com/jac0bandres/firetower',
    mlh: mlh('01a16f9a-1ca2-54cf-21f6-a08c8db7e729'),
    photo: { slug: 'img-2197', alt: 'The Firetower team on stage in front of their Best Overall slide', width: 1280, height: 960 },
  },
  {
    slug: 'classsync',
    name: 'ClassSync',
    group: 'challenge',
    award: 'Best Open-Source AI Project',
    summary: 'All your classes in one place. ClassSync brings the semester together so students can stop hunting through course pages and answer one question: what should I do next?',
    builtWith: ['Next.js', 'Supabase', 'gpt-oss-20b', 'DigitalOcean'],
    team: ['Ethan Wood', 'Andrew Buchberger', 'Michael Straughter', 'Bralin Garcia'],
    source: 'https://github.com/mikecancodes/classsync',
    demo: 'https://classsync-two.vercel.app/',
    mlh: mlh('01a16f8f-4f38-26a6-9ba3-0e32160c6dca'),
    photo: { slug: 'img-2193', alt: 'The ClassSync team on stage in front of their Best Open-Source AI Project slide', width: 1280, height: 960 },
  },
  {
    slug: 'standby',
    name: 'Standby',
    group: 'challenge',
    award: 'Best Use of Snowflake',
    summary: 'Flight info is scattered across airline apps, weather reports, and airport sites. Standby brings it together: speak or type your plans, and Snowflake’s historical flight data shows how often similar flights ran late.',
    builtWith: ['Snowflake', 'React', 'FastAPI', 'Ollama'],
    team: ['Callum Maclean', 'Tomas Karounas'],
    source: 'https://github.com/Yeti-Owner/Standby-Hacklonega',
    mlh: mlh('01a16f9a-b2d8-05c5-babd-65aa251145ad'),
    photo: { slug: 'img-1443', alt: 'The Standby team on stage in front of their Best Use of Snowflake slide', width: 1280, height: 960 },
  },
  {
    slug: 'resolute',
    name: 'Resolute',
    group: 'challenge',
    award: 'Most Creative',
    summary: 'A desktop desktop environment, inspired by the days before flat, boring desktops. It has a lamp, a clock, even a quill and ink. It has drawers too. Let’s see Windows do that.',
    builtWith: ['Python', 'X11'],
    team: ['Atticus Orsagh'],
    source: 'https://github.com/AtticusO/Resolute',
    mlh: mlh('01a16f9b-6bd7-604b-43a9-5303fd5d01b6'),
    photo: { slug: 'img-2195', alt: 'Atticus Orsagh on stage in front of the Most Creative slide for Resolute', width: 960, height: 1280, focus: 'top' },
  },
  {
    slug: 'womp',
    name: 'W.O.M.P.',
    group: 'runner-up',
    award: 'Best Open-Source AI Project',
    place: 'Runner-up',
    summary: 'Worlds of Mayhem & Possibilities: a strategy game where two AI commanders lead opposing countries across land, sea, and air. DigitalOcean powers the commanders, and Snowflake stores every campaign for saved wars and replays.',
    builtWith: ['DigitalOcean', 'Snowflake'],
    team: ['James Young'],
    source: 'https://github.com/legendmaker47/W.O.M.P.',
    mlh: mlh('01a16f94-f7ca-dcef-4296-0d023d4f08f0'),
    photo: { slug: 'img-2200', alt: 'On stage in front of the runner-up slide for W.O.M.P.', width: 1280, height: 960 },
  },
  {
    slug: 'neopapyrus',
    name: 'NeoPapyrus',
    group: 'runner-up',
    award: 'Best Use of Snowflake',
    place: 'Runner-up',
    summary: 'A research-paper discovery assistant. Ask a question and get an answer that cites the exact passages, make two papers argue, and find the open questions between them, all inside one Snowflake account.',
    builtWith: ['Snowflake', 'Llama', 'TypeScript'],
    team: ['Rohan Karve', 'Carlos Mata', 'Pramit Patel', 'Chance Caswell'],
    source: 'https://github.com/pramittpatel/NeoPapyrus',
    mlh: mlh('01a16f9c-2df0-a29d-b3c4-cd530a20bbdd'),
    photo: { slug: 'img-2201', alt: 'The NeoPapyrus team on stage in front of the runner-up slide', width: 1280, height: 960 },
  },
];
