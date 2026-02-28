# Nafaya IPTV Player

A lightweight IPTV Smarters-style web player that lets you load an authorized M3U playlist (URL or local file), browse channels, and play streams directly in the browser.

## Features

- Load playlists from:
  - Remote M3U URL
  - Local `.m3u` / `.m3u8` file
- Parse and list channels from `#EXTINF` metadata
- Search channels instantly
- Play HLS streams (`.m3u8`) via `hls.js`
- Reload current channel stream
- Includes a built-in demo playlist to verify the UI quickly

## Run locally

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Notes

- For remote playlist URLs, CORS must allow browser requests.
- This project is intended for **legal, licensed, and authorized content only**.
