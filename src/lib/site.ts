export const now = {
  place: "Rogers, Arkansas",
  coordinates: { lat: 36.33, lon: -94.12 },
  timeZone: "America/Chicago",
  timeZoneName: "Central time",
  listening: {
    track: "Zetsuen",
    artist: "Trooper Salute",
    href: "https://open.spotify.com/search/Trooper%20Salute%20%E7%B5%B6%E7%B8%81",
  },
  workingOn: { text: "This website", href: "/index/this-website" },
};

export const links = {
  email: "mailto:hello@tristan-kennedy.com",
  resume: "/resume.pdf",
  profiles: [
    { label: "GitHub", href: "https://github.com/tristan-kennedy" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/tristandkennedy/" },
    { label: "Letterboxd", href: "https://letterboxd.com/tdouglaskennedy/" },
  ],
};

export function formatCoordinates({ lat, lon }: { lat: number; lon: number }) {
  const part = (value: number, positive: string, negative: string) =>
    `${Math.abs(value).toFixed(2)}° ${value >= 0 ? positive : negative}`;
  return `${part(lat, "N", "S")}, ${part(lon, "E", "W")}`;
}
