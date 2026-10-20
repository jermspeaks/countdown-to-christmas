#!/usr/bin/env python3
import urllib.request
import urllib.parse
import re
import time
import sys

# All unique movies/shows from the Countdown to Christmas schedule
MOVIES = [
    {"title": "'Tis the Season for Setups", "slug": "tis-the-season-for-setups", "date": "Fri 10/16 8/7c"},
    {"title": "Holiday Touchdown: A Bears Love Story", "slug": "holiday-touchdown-a-bears-love-story", "date": "Sat 10/17 8/7c"},
    {"title": "Mr. & Mrs. Christmas", "slug": "mr-mrs-christmas", "date": "Sun 10/18 8/7c"},
    {"title": "Winter Wonderlanes", "slug": "winter-wonderlanes", "date": "Fri 10/23 8/7c"},
    {"title": "Forgotten Holiday", "slug": "forgotten-holiday", "date": "Sat 10/24 8/7c"},
    {"title": "What If Christmas", "slug": "what-if-christmas", "date": "Sun 10/25 8/7c"},
    {"title": "Who's Coming for Christmas?", "slug": "whos-coming-for-christmas", "date": "Fri 10/30 8/7c"},
    {"title": "Adopting St. Nick", "slug": "adopting-st-nick", "date": "Sat 10/31 8/7c"},
    {"title": "A Danish Christmas", "slug": "a-danish-christmas", "date": "Sun 11/1 8/7c"},
    {"title": "Mistletoe Murders", "slug": "mistletoe-murders", "date": "Thursdays 8/7c"},
    {"title": "Merry Memories", "slug": "merry-memories", "date": "Fri 11/6 8/7c"},
    {"title": "Holiday Unplugged", "slug": "holiday-unplugged", "date": "Sat 11/7 8/7c"},
    {"title": "A Season of Promises", "slug": "a-season-of-promises", "date": "Sun 11/8 8/7c"},
    {"title": "My Christmas Cowboy", "slug": "my-christmas-cowboy", "date": "Fri 11/13 8/7c"},
    {"title": "The Nights Before Christmas", "slug": "the-nights-before-christmas", "date": "Sat 11/14 8/7c"},
    {"title": "Mistletoe and Mimosas", "slug": "mistletoe-and-mimosas", "date": "Sun 11/15 8/7c"},
    {"title": "Our Holiday Playbook", "slug": "our-holiday-playbook", "date": "Fri 11/20 8/7c"},
    {"title": "Christmas in Blue Dog Valley", "slug": "christmas-in-blue-dog-valley", "date": "Sat 11/21 8/7c"},
    {"title": "Double Booked for the Holidays", "slug": "double-booked-for-the-holidays", "date": "Sun 11/22 8/7c"},
    {"title": "Christmas Delivered", "slug": "christmas-delivered", "date": "Thurs 11/26 8/7c"},
    {"title": "The Christmas Eve Feast", "slug": "the-christmas-eve-feast", "date": "Fri 11/27 6/5c"},
    {"title": "Return to Santa", "slug": "return-to-santa", "date": "Fri 11/27 8/7c"},
    {"title": "The Most Wonderful Secret", "slug": "the-most-wonderful-secret", "date": "Sat 11/28 6/5c"},
    {"title": "Holiday Ever After: A Disney World Wish Come True", "slug": "holiday-ever-after-a-disney-world-wish-come-true", "date": "Sat 11/28 8/7c"},
    {"title": "Eight Nights for Love", "slug": "eight-nights-for-love", "date": "Sun 11/29 6/5c"},
    {"title": "Miles to Christmas", "slug": "miles-to-christmas", "date": "Sun 11/29 8/7c"},
    {"title": "The Snowflake Effect", "slug": "the-snowflake-effect", "date": "Fri 12/4 8/7c"},
    {"title": "A Grand Biltmore Christmas", "slug": "a-grand-biltmore-christmas", "date": "Sat 12/5 8/7c"},
    {"title": "The Hallmark Christmas Experience: A Hometown Holiday", "slug": "the-hallmark-christmas-experience-a-hometown-holiday", "date": "Sat 12/5 10/9c"},
    {"title": "An Angel in My Stocking", "slug": "an-angel-in-my-stocking", "date": "Sun 12/6 8/7c"},
    {"title": "Christmas in Canterbury", "slug": "christmas-in-canterbury", "date": "Fri 12/11 8/7c"},
    {"title": "Snow Globe Town", "slug": "snow-globe-town", "date": "Sat 12/12 8/7c"},
    {"title": "Noelle Nomads", "slug": "noelle-nomads", "date": "Sun 12/13 8/7c"},
    {"title": "Hearts All Aglow", "slug": "hearts-all-aglow", "date": "Fri 12/18 8/7c"},
    {"title": "Barking All the Way", "slug": "barking-all-the-way", "date": "Sat 12/19 8/7c"},
    {"title": "Save the Date for Christmas", "slug": "save-the-date-for-christmas", "date": "Sun 12/20 8/7c"},
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

print("# Hallmark Countdown to Christmas - Master Image Assets\n", flush=True)

for idx, movie in enumerate(MOVIES, 1):
    url = f"https://www.hallmarkchannel.com/{movie['slug']}"
    req = urllib.request.Request(url, headers=HEADERS)

    origin_image = "Not Found"
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode("utf-8", errors="ignore")

            # 1. First look for og:image
            match = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', html)
            if not match:
                match = re.search(r'content=["\']([^"\']+)["\']\s+property=["\']og:image["\']', html)

            if match:
                full_dims4_url = match.group(1)
                # Extract Option 4 (?url=...)
                if "?url=" in full_dims4_url:
                    raw_s3 = full_dims4_url.split("?url=")[-1]
                    origin_image = urllib.parse.unquote(raw_s3)
                    # Upgrade http to https
                    if origin_image.startswith("http://"):
                        origin_image = origin_image.replace("http://", "https://", 1)
                else:
                    origin_image = full_dims4_url
            else:
                # 2. Fallback to json-ld brightspotcdn image if og:image wasn't matched
                json_match = re.search(r'"image"\s*:\s*"(https://[^"]+)"', html)
                if json_match:
                    origin_image = json_match.group(1)

    except Exception as e:
        origin_image = f"Error fetching: {e}"

    # Print markdown entry
    print(f"### {idx}. {movie['title']}")
    print(f"* **Premiere Date:** {movie['date']}")
    print(f"* **Page URL:** {url}")
    print(f"* **Origin Asset URL:** {origin_image}")
    if origin_image.startswith("http"):
        print(f"* **Preview:** ![{movie['title']}]({origin_image})")
    print("\n---\n", flush=True)

    # Polite rate limit to avoid CDN throttling
    time.sleep(0.3)
