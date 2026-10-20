export const seasonYear = 2026;

export type ScheduleEvent = {
  id: string;
  date: `${number}-${number}-${number}`;
  title: string;
  timeLabel: string;
  notes?: string;
  featureGroup?: string;
  seasonYear: number;
};

const event = (
  id: string,
  date: ScheduleEvent["date"],
  title: string,
  timeLabel = "8/7c",
  options: Pick<ScheduleEvent, "notes" | "featureGroup"> = {},
): ScheduleEvent => ({ id, date, title, timeLabel, seasonYear, ...options });

export const schedule: ScheduleEvent[] = [
  event("tis-the-season-for-setups", "2026-10-16", "'Tis the Season for Setups"),
  event("holiday-touchdown", "2026-10-17", "Holiday Touchdown: A Bears Love Story"),
  event("mr-and-mrs-christmas", "2026-10-18", "Mr. & Mrs. Christmas"),
  event("winter-wonderlanes", "2026-10-23", "Winter Wonderlanes"),
  event("forgotten-holiday", "2026-10-24", "Forgotten Holiday"),
  event("what-if-christmas", "2026-10-25", "What If Christmas"),
  event("whos-coming-for-christmas", "2026-10-30", "Who's Coming for Christmas?"),
  event("adopting-st-nick", "2026-10-31", "Adopting St. Nick"),

  event("a-danish-christmas", "2026-11-01", "A Danish Christmas"),
  event("mistletoe-murders-premiere", "2026-11-05", "Mistletoe Murders", "8/7c", { notes: "New Season Premiere" }),
  event("merry-memories", "2026-11-06", "Merry Memories"),
  event("holiday-unplugged", "2026-11-07", "Holiday Unplugged"),
  event("a-season-of-promises", "2026-11-08", "A Season of Promises"),
  event("mistletoe-murders-nov-12", "2026-11-12", "Mistletoe Murders"),
  event("my-christmas-cowboy", "2026-11-13", "My Christmas Cowboy"),
  event("the-nights-before-christmas", "2026-11-14", "The Nights Before Christmas"),
  event("mistletoe-and-mimosas", "2026-11-15", "Mistletoe and Mimosas"),
  event("mistletoe-murders-nov-19", "2026-11-19", "Mistletoe Murders"),
  event("our-holiday-playbook", "2026-11-20", "Our Holiday Playbook"),
  event("christmas-in-blue-dog-valley", "2026-11-21", "Christmas in Blue Dog Valley"),
  event("double-booked-for-the-holidays", "2026-11-22", "Double Booked for the Holidays"),
  event("christmas-delivered", "2026-11-26", "Christmas Delivered", "8/7c", { featureGroup: "november-26" }),
  event("mistletoe-murders-nov-26", "2026-11-26", "Mistletoe Murders", "10/9c", { featureGroup: "november-26" }),
  event("the-christmas-eve-feast", "2026-11-27", "The Christmas Eve Feast", "6/5c", { featureGroup: "november-27" }),
  event("return-to-santa", "2026-11-27", "Return to Santa", "8/7c", { featureGroup: "november-27" }),
  event("the-most-wonderful-secret", "2026-11-28", "The Most Wonderful Secret", "6/5c", { featureGroup: "november-28" }),
  event("holiday-ever-after", "2026-11-28", "Holiday Ever After: A Disney World Wish Come True", "8/7c", { featureGroup: "november-28" }),
  event("eight-nights-for-love", "2026-11-29", "Eight Nights for Love", "6/5c", { featureGroup: "november-29" }),
  event("miles-to-christmas", "2026-11-29", "Miles to Christmas", "8/7c", { featureGroup: "november-29" }),

  event("mistletoe-murders-dec-3", "2026-12-03", "Mistletoe Murders"),
  event("the-snowflake-effect", "2026-12-04", "The Snowflake Effect"),
  event("a-grand-biltmore-christmas", "2026-12-05", "A Grand Biltmore Christmas", "8/7c", { featureGroup: "december-5" }),
  event("hometown-holiday-experience", "2026-12-05", "The Hallmark Christmas Experience: A Hometown Holiday", "10/9c", { featureGroup: "december-5" }),
  event("an-angel-in-my-stocking", "2026-12-06", "An Angel in My Stocking"),
  event("mistletoe-murders-finale", "2026-12-10", "Mistletoe Murders", "8/7c", { notes: "Season Finale" }),
  event("christmas-in-canterbury", "2026-12-11", "Christmas in Canterbury"),
  event("snow-globe-town", "2026-12-12", "Snow Globe Town"),
  event("noelle-nomads", "2026-12-13", "Noelle Nomads"),
  event("hearts-all-aglow", "2026-12-18", "Hearts All Aglow"),
  event("barking-all-the-way", "2026-12-19", "Barking All the Way"),
  event("save-the-date-for-christmas", "2026-12-20", "Save the Date for Christmas"),
];

export function groupScheduleByDate(events: ScheduleEvent[] = schedule) {
  const groups = new Map<string, ScheduleEvent[]>();
  for (const item of events) {
    const current = groups.get(item.date) ?? [];
    current.push(item);
    groups.set(item.date, current);
  }
  return groups;
}

export function isValidSchedule(events: ScheduleEvent[] = schedule) {
  const ids = new Set<string>();
  let previousDate = "";
  for (const item of events) {
    if (ids.has(item.id) || item.seasonYear !== seasonYear || item.date < previousDate) return false;
    if (!/^2026-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])$/.test(item.date)) return false;
    const parsed = new Date(`${item.date}T00:00:00Z`);
    if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== item.date) return false;
    ids.add(item.id);
    previousDate = item.date;
  }
  return ids.size === 41;
}

if (!isValidSchedule(schedule)) {
  throw new Error("The holiday schedule must contain 41 unique, valid, chronologically ordered 2026 events.");
}
