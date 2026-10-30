export const now = {
  place: "Rogers, Arkansas",
  coordinates: { lat: 36.33, lon: -94.12 },
  timeZone: "America/Chicago",
  timeZoneName: "Central time",
  listening: {
    track: "Zetsuen",
    original: "絶縁",
    artist: "Trooper Salute",
    seconds: 390,
    href: "https://music.apple.com/us/album/zetsuen/6768151401?i=6768151403",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/80/66/76/806676af-84ea-1f93-c6f2-7e6ef41c637f/4580789766954.png/600x600bb.jpg",
  },
  workingOn: { text: "This website", href: "/index/this-website" },
};

export const moves = [
  { place: "Rochester, New York", coordinates: { lat: 43.16, lon: -77.61 } },
  { place: "Huntsville, Alabama", coordinates: { lat: 34.73, lon: -86.59 } },
  { place: "Binghamton, New York", coordinates: { lat: 42.1, lon: -75.92 } },
  { place: "Dallas, Texas", coordinates: { lat: 32.78, lon: -96.8 } },
  { place: "Columbus, Ohio", coordinates: { lat: 39.96, lon: -83.0 } },
  { place: "Nashville, Tennessee", coordinates: { lat: 36.16, lon: -86.78 } },
  { place: "Huntsville, Alabama", coordinates: { lat: 34.73, lon: -86.59 } },
  { place: now.place, coordinates: now.coordinates },
];

export const links = {
  email: "mailto:hello@tristan-kennedy.com",
  resume: "/resume.pdf",
  profiles: [
    { label: "GitHub", href: "https://github.com/tristan-kennedy" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/tristandkennedy/" },
    { label: "Letterboxd", href: "https://letterboxd.com/tdouglaskennedy/" },
  ],
};

export const work = [
  {
    role: "Software Engineer",
    company: "SPS Commerce",
    from: "2025-07",
    to: "now",
  },
  {
    role: "Associate Software Engineer",
    company: "SPS Commerce / SupplyPike",
    from: "2024-07",
    to: "2025-07",
  },
  {
    role: "Software Engineer Intern",
    company: "SupplyPike",
    from: "2023-05",
    to: "2024-07",
  },
  {
    role: "IT Intern",
    company: "IDEMIA",
    from: "2022-05",
    to: "2022-07",
  },
];

export const education = {
  degree: "B.S. Computer Science",
  school: "University of Alabama in Huntsville",
  from: "2021-08",
  to: "2024-05",
};

export interface Take {
  text: string;
  note?: string;
}

// Filler takes for Tristan to rewrite in his own words.
export const opinions: Take[] = [
  { text: "Breakfast is overrated." },
  {
    text: "Dark mode, always.",
    note: "Not actually always, because I’m too lazy to change it.",
  },
  { text: "Every movie is better in a theater." },
  { text: "Get to the airport two hours early." },
  {
    text: "Pizza Hut is the best fast food pizza chain.",
    note: "Pizza is a high floor, low ceiling food.",
  },
  {
    text: "Cane’s is the best fast food fried chicken.",
    note: "Chick-fil-A doesn’t count.",
  },
  {
    text: "100 people beat 1 gorilla.",
    note: "The gorilla gets tired. A hundred people don’t.",
  },
  { text: "The dress is blue and black." },
  { text: "A hot dog is not a sandwich." },
  { text: "GIF has a hard G." },
  { text: "Tabs." },
];

export const questions: Take[] = [
  {
    text: "Will I ever be done with this site?",
    note: "The change count in the footer says no.",
  },
  { text: "When is something finished, and when is it just abandoned?" },
  { text: "Does keeping a record of things change how I live them?" },
  { text: "Does any of this matter if it all gets forgotten anyway?" },
];

export const about = {
  opener:
    "The homepage is the short version. This is the long one, or as long as it gets before it turns into a résumé: where I’ve lived, what I do all day, what I’ve been watching and listening to, and a few takes I’ll defend next to questions I can’t put down.",
  where:
    "I was born in Rochester, New York, and moved a lot as a kid. Seven moves so far, two of them to Huntsville, and the last one here.",
  work: [
    "I’m a software engineer at SPS Commerce. I started at SupplyPike as an intern in 2023 and came along when SPS bought it in 2024.",
    "Most of what I build is the part of a product you don’t see: services, data, and the accounts and permissions that hold it together, with enough front end to keep me honest.",
  ],
  tools: [
    "At work it’s *TypeScript* nearly everywhere: *Node.js* services and *RabbitMQ* workers at the back, *React* at the front, *PostgreSQL* and *MongoDB* underneath, and *Databricks* when the data gets big. It ships through *Docker*, *Kubernetes*, and *GitHub Actions*, and *OpenTelemetry* and *Sentry* tell me when it breaks.",
    "At home it’s *Astro* and *Tailwind* for this site, and *TanStack Start*, *Drizzle*, and *Better Auth* for Golf Club Curator, a place to compare golf clubs that isn’t out yet. *Python* gets the quick scripts. More and more of it gets written alongside *Claude Code*, this site included.",
  ],
  films: "The last few films I logged on Letterboxd.",
};

export const letterboxdFeed = "https://letterboxd.com/tdouglaskennedy/rss/";

export function formatCoordinates({ lat, lon }: { lat: number; lon: number }) {
  const part = (value: number, positive: string, negative: string) =>
    `${Math.abs(value).toFixed(2)}° ${value >= 0 ? positive : negative}`;
  return `${part(lat, "N", "S")}, ${part(lon, "E", "W")}`;
}
