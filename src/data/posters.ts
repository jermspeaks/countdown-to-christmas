import posterManifest from "../../public/posters/manifest.json";

export type SchedulePoster = (typeof posterManifest)[number];

const postersByTitle = new Map(posterManifest.map((poster) => [poster.title, poster]));
const placeholderPoster = posterManifest.find((poster) =>
  poster.warnings.some((warning) => warning.includes("generic Hallmark placeholder")),
);

if (!placeholderPoster) {
  throw new Error("The poster manifest must include a generic Hallmark placeholder image.");
}
const fallbackPoster: SchedulePoster = placeholderPoster;

export function getSchedulePoster(title: string): SchedulePoster {
  return postersByTitle.get(title) ?? fallbackPoster;
}

export function isPlaceholderPoster(poster: SchedulePoster): boolean {
  return poster === fallbackPoster;
}
