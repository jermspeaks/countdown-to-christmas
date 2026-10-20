#!/usr/bin/env python3
"""Download poster URLs from poster-assets.md and convert them to WebP."""

from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "poster-assets.md"
OUTPUT = ROOT / "public" / "posters"
USER_AGENT = "Mozilla/5.0 (compatible; CountdownToChristmas/1.0)"


def entries_from_report(text: str) -> list[tuple[str, str]]:
    entries: list[tuple[str, str]] = []
    current_title: str | None = None
    for line in text.splitlines():
        title_match = re.match(r"###\s+\d+\.\s+(.+)$", line)
        if title_match:
            current_title = title_match.group(1).strip()
            continue
        url_match = re.match(r"\* \*\*Origin Asset URL:\*\* (https?://\S+)", line)
        if current_title and url_match:
            entries.append((current_title, url_match.group(1)))
            current_title = None
    return entries


def slugify(title: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")


def main() -> int:
    converter = shutil.which("cwebp")
    if not converter:
        print("Error: cwebp is required (install WebP tools and retry).", file=sys.stderr)
        return 1
    if not SOURCE.is_file():
        print(f"Error: report not found: {SOURCE}", file=sys.stderr)
        return 1

    OUTPUT.mkdir(parents=True, exist_ok=True)
    records: list[dict[str, object]] = []
    failures: list[tuple[str, str]] = []
    source_entries = entries_from_report(SOURCE.read_text(encoding="utf-8"))

    for title, url in source_entries:
        destination = OUTPUT / f"{slugify(title)}.webp"
        try:
            request = Request(url, headers={"User-Agent": USER_AGENT})
            with urlopen(request, timeout=20) as response:
                original = response.read()
                content_type = response.headers.get_content_type()
            if not original:
                raise ValueError("empty response")

            suffix = Path(url.split("?", 1)[0]).suffix or ".img"
            with tempfile.TemporaryDirectory(dir=OUTPUT) as temporary_directory:
                temporary_source = Path(temporary_directory) / f"source{suffix}"
                temporary_output = Path(temporary_directory) / "converted.webp"
                temporary_source.write_bytes(original)
                conversion = subprocess.run(
                    [converter, "-quiet", "-q", "82", str(temporary_source), "-o", str(temporary_output)],
                    capture_output=True,
                    check=False,
                )
                if conversion.returncode != 0:
                    message = conversion.stderr.decode("utf-8", errors="replace").strip()
                    raise ValueError(message or f"cwebp exited {conversion.returncode}")

                converted = temporary_output.read_bytes()
                if len(converted) < 12 or converted[:4] != b"RIFF" or converted[8:12] != b"WEBP":
                    raise ValueError("converter output did not have a valid WebP signature")
                temporary_output.replace(destination)

            warnings: list[str] = []
            if "placeholder" in url.lower():
                warnings.append("Source URL is a generic Hallmark placeholder image.")
            if "mistletoe" in title.lower() and "digi25" in url.lower():
                warnings.append("Source filename identifies this as Season 2 artwork, not confirmed Season 3 artwork.")

            records.append(
                {
                    "title": title,
                    "path": f"/posters/{destination.name}",
                    "source_url": url,
                    "source_content_type": content_type,
                    "sha256": hashlib.sha256(converted).hexdigest(),
                    "bytes": len(converted),
                    "source_bytes": len(original),
                    "warnings": warnings,
                }
            )
            print(f"Downloaded and converted: {title} -> {destination.name} ({len(converted)} bytes)")
        except (HTTPError, URLError, TimeoutError, OSError, ValueError) as error:
            failures.append((title, str(error)))
            print(f"Failed: {title}: {error}", file=sys.stderr)
        time.sleep(0.3)

    manifest = OUTPUT / "manifest.json"
    manifest.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nConverted {len(records)} of {len(source_entries)} URLs; {len(failures)} failed.")
    print(f"Manifest: {manifest.relative_to(ROOT)}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
