import posterManifest from "../../public/posters/manifest.json";

export type SchedulePoster = (typeof posterManifest)[number];

const postersByTitle = new Map(posterManifest.map((poster) => [poster.title, poster]));

export function getSchedulePoster(title: string): SchedulePoster | undefined {
  return postersByTitle.get(title);
}
