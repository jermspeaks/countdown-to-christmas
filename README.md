# Countdown to Christmas

A small, responsive Astro app for browsing Hallmark Channel's 2026 Countdown to Christmas schedule. The schedule is transcribed into typed data from [`schedule.md`](./schedule.md).

## Views

- `/` — upcoming broadcasts
- `/recently-aired` — past broadcasts, newest date first
- `/calendar` — October–December 2026 calendar with selectable dates and full lineups

## Run locally

```sh
npm install
npm run dev
```

## Validate and build

```sh
npm run check
npm run build
npm run preview
```

The source schedule does not specify a year; 2026 is inferred from the weekday/date combinations. Air times retain the source's broadcast-zone labels (`8/7c`, etc.) and are not converted to a visitor's local time. Since the source does not provide exact airing instants, the upcoming/recently-aired split changes at the start of each visitor's local calendar date.
