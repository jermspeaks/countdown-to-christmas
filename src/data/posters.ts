import movieMetadata from "../../hallmark_christmas_2026_movies.json";
import posterManifest from "../../public/posters/manifest.json";

export type SchedulePoster = (typeof posterManifest)[number];

const postersByTitle = new Map(posterManifest.map((poster) => [poster.title, poster]));
const moviePostersByTitle = new Map(movieMetadata.map((movie) => [normalizeTitle(movie.title), movie]));
const placeholderMoviePosterTitles = new Set(
  [
    "Merry Memories",
    "A Season of Promises",
    "Mistletoe and Mimosas",
    "Our Holiday Playbook",
    "Return to Santa",
    "The Most Wonderful Secret",
    "Eight Nights for Love",
    "Miles to Christmas",
    "The Snowflake Effect",
    "An Angel in My Stocking",
    "Christmas in Canterbury",
    "Snow Globe Town",
    "Noelle Nomads",
    "Hearts All Aglow",
    "Barking All the Way",
    "Save the Date for Christmas",
  ].map(normalizeTitle),
);
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

export function getScheduleListPoster(title: string): { src: string; alt: string; format: "movie" | "landscape" } {
  const normalizedTitle = normalizeTitle(title);
  const movie = moviePostersByTitle.get(normalizedTitle);
  if (!placeholderMoviePosterTitles.has(normalizedTitle) && movie?.has_poster && movie.poster_url) {
    return { src: movie.poster_url, alt: `${title} movie poster`, format: "movie" };
  }

  const poster = getSchedulePoster(title);
  return {
    src: poster.path,
    alt: isPlaceholderPoster(poster) ? "Generic Hallmark Channel artwork" : `${title} poster`,
    format: "landscape",
  };
}

function normalizeTitle(title: string): string {
  return title
    .normalize("NFKC")
    .replace(/[’‘]/g, "'")
    .replace(/:\s*season\s+\d+\s+premiere$/i, "")
    .trim()
    .toLowerCase();
}
