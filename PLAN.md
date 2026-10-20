# Hallmark Countdown to Christmas App — Plan

## Goal

Build a small, responsive Astro app that makes the Hallmark Countdown to Christmas schedule easy to browse in two ways:

1. **Upcoming** — movies and episodes that have not aired yet, in chronological order.
2. **Recently aired** — the most recent past broadcasts first.
3. **Calendar** — a calendar view that highlights upcoming broadcasts and lets visitors inspect a date's lineup.

The existing [`schedule.md`](./schedule.md) is the source for the initial season schedule.

## Initial schedule facts and assumptions

- The schedule contains 41 program entries across October, November, and December, including multiple double-feature dates and recurring *Mistletoe Murders* episodes.
- The dates have no year. The weekday/date combinations match **2026**, so use 2026 for the initial data set, but keep the season year explicit in the data rather than deriving it invisibly.
- Listings use broadcast-zone notation such as `8/7c`, not a single local start time. Preserve the displayed time text; do not claim to convert it to the visitor's local timezone.
- *Mistletoe Murders* entries include premiere and finale annotations. Preserve those notes, as well as the double-feature grouping and each title's individual time.
- Treat the schedule as manually curated data; no scraping or external service is needed for the first version.

## Proposed stack

- **Astro** with TypeScript for the site and UI.
- Astro pages and components for the primarily static experience; use a small amount of client-side JavaScript for the live upcoming/aired split and interactive calendar controls.
- No database or external API for the MVP. Keep schedule data in a typed local module so it can later be replaced by a CMS or feed without changing the UI contract.

## Data model

Represent each broadcast as an individual event, grouped by its broadcast date:

- `id`: stable identifier
- `date`: ISO date (`YYYY-MM-DD`)
- `title`: movie or episode title
- `timeLabel`: original schedule label, such as `8/7c` or `10/9c`
- `notes`: optional labels such as `New Season Premiere` or `Season Finale`
- `featureGroup`: optional identifier/label for a double-feature date
- `seasonYear`: explicit year (2026 for this schedule)

Store the events in chronological order. Keep separate event records for each title in a double feature, even when they share a date. A shared group allows the list and calendar to communicate that those titles are part of one night's lineup.

## Implementation phases

### 1. Scaffold Astro

- Initialize the project in the repository root with Astro and TypeScript.
- Add the standard development, build, and preview scripts.
- Keep dependencies minimal; do not add a UI framework unless the interactive calendar proves to need one.

### 2. Normalize the schedule

- Create a typed schedule data module and transcribe every entry from `schedule.md`.
- Include the 2026 year explicitly, preserve all time labels and annotations, and model double features as grouped events.
- Add a validation/test step for required fields, valid dates, stable chronological ordering, and duplicate IDs.
- Keep `schedule.md` as the human-readable reference; document that the typed module powers the app.

### 3. Build the page and lists

- Create a shared page shell with a seasonal heading, brief schedule subtitle, and navigation between **Upcoming**, **Recently Aired**, and **Calendar**.
- Create reusable event-card/list components showing date, weekday, title, time label, and any premiere/finale or double-feature labels.
- Derive upcoming and recently aired from the current date at runtime. Upcoming is ascending; recently aired is descending. An event moves from upcoming to aired once its broadcast date/time has passed.
- Because the source has no exact time zone or instant, initially use the event's local calendar date as the split boundary and call this out in the UI or project notes. Avoid pretending the `8/7c` label is a precise browser-local timestamp.
- Provide a useful empty state if either list has no events.

### 4. Add calendar view

- Add month navigation and a conventional month grid with accessible previous/next controls.
- Mark dates with broadcasts and distinguish upcoming dates from past dates.
- Selecting a date should reveal that date's event lineup, including both entries on double-feature nights.
- On narrow screens, ensure the calendar remains usable (for example, allow horizontal overflow or switch to a date-grouped agenda layout).

### 5. Polish and validate

- Apply a festive but restrained visual style with clear contrast and readable typography.
- Support keyboard navigation and visible focus, semantic headings and lists, and accessible labels for calendar controls.
- Verify behavior around dates before, on, and after a broadcast date, including multiple events on one date.
- Run the type check (if configured), tests, and Astro production build; manually check desktop and mobile layouts.

## Suggested initial routes

- `/` — Upcoming schedule (default view)
- `/recently-aired` — Recently aired schedule
- `/calendar` — Calendar view

If the navigation is implemented as tabs rather than separate routes, retain the same three clear view names and ensure each view has a shareable URL or sensible browser-history behavior.

## Acceptance criteria

- Every event in `schedule.md` is represented exactly once, with its title, date, and time label intact.
- Double-feature dates show all scheduled titles and their separate broadcast times.
- Premiere/finale annotations are visible.
- Upcoming and recently aired lists sort in the intended directions and switch events according to the documented date-boundary rule.
- The calendar shows all event dates, supports month navigation, and reveals the full lineup for a selected date.
- The app builds successfully and the main views are usable with keyboard and on mobile-sized screens.

## Open decisions for implementation

- Confirm the season year is 2026; weekday/date alignment supports it, but the markdown does not state the year.
- Decide whether “recently aired” should show the full aired schedule or a limited recent window. The MVP plan assumes all aired events, newest first.
- Decide whether to add a user-selectable timezone or reminders later. Both need authoritative broadcast instants/timezone semantics not present in the source schedule.
