import detailsMarkdown from "../../details.md?raw";
import { schedule } from "./schedule";

export interface ScheduleDetails {
  premiereDate: string;
  url: string;
  castLabel: string;
  starring: string;
  synopsis: string;
}

interface ParsedDetails extends ScheduleDetails {
  title: string;
}

function requiredField(block: string, pattern: RegExp, fieldName: string) {
  const value = block.match(pattern)?.[1];
  if (!value) throw new Error(`A schedule detail entry is missing its ${fieldName}.`);
  return value.trim();
}

function cleanMarkdown(value: string) {
  return value.replace(/`/g, "").replace(/\*([^*]+)\*/g, "$1").trim();
}

function parseDetails(markdown: string): ParsedDetails[] {
  return markdown
    .split(/^---\s*$/m)
    .map((block) => block.trim())
    .filter((block) => /^###\s+\d+\./m.test(block))
    .map((block) => {
      const title = requiredField(block, /^###\s+\d+\.\s+(.+)$/m, "title");
      const starringLine = block.match(/^\*\s+\*\*(Starring(?:\s*\/\s*Hosted by)?):\*\*\s*(.+)$/m);
      if (!starringLine) throw new Error(`Schedule details for “${title}” are missing the cast.`);

      return {
        title,
        premiereDate: cleanMarkdown(requiredField(block, /^\*\s+\*\*Premiere Date:\*\*\s*(.+)$/m, "premiere date")),
        url: requiredField(block, /^\*\s+\*\*URL:\*\*\s*`([^`]+)`$/m, "Hallmark URL"),
        castLabel: cleanMarkdown(starringLine[1]),
        starring: cleanMarkdown(starringLine[2]),
        synopsis: cleanMarkdown(requiredField(block, /^\*\s+\*\*Synopsis:\*\*\s*([\s\S]+?)\s*$/m, "synopsis")),
      };
    });
}

function scheduleTitle(title: string) {
  return title.replace(/\s+\([^)]*\)$/, "");
}

const parsedDetails = parseDetails(detailsMarkdown);
if (parsedDetails.length !== schedule.length) {
  throw new Error(`Expected ${schedule.length} detail entries to match the schedule; found ${parsedDetails.length}.`);
}

const detailsByEventId = new Map<string, ScheduleDetails>();
for (const [index, event] of schedule.entries()) {
  const details = parsedDetails[index];
  if (scheduleTitle(details.title) !== event.title) {
    throw new Error(`Schedule details entry ${index + 1} (“${details.title}”) does not match “${event.title}”.`);
  }
  detailsByEventId.set(event.id, details);
}

export function getScheduleDetails(eventId: string): ScheduleDetails {
  const details = detailsByEventId.get(eventId);
  if (!details) throw new Error(`No schedule details found for event “${eventId}”.`);
  return details;
}
