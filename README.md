# Dorak - Bank Visit Organizer (PWA)

Arabic (RTL) progressive web app that organizes bank visits: pick a governorate, bank, branch and time slot, and the app saves your visit ticket on your device. Includes a loan calculator (fixed-payment, reducing-balance estimate with upfront fees).

**Live:** https://dorak-pwa.vercel.app/

## Features

- Branch, service and time-slot picker with elapsed slots automatically disabled (Africa/Cairo time)
- Saved visits stored locally on the device, with safe rescheduling and cancel-edit
- Arabic and Persian digit phone input with Egyptian mobile validation
- Loan calculator: principal, interest, duration and fees
- Installable PWA (manifest + service worker), works offline

## Tech

Plain HTML/CSS/JavaScript in a single static app - no build step. PWA via `manifest.json` and `sw.js`.

## Run locally

Serve the folder over HTTP (service workers need it):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Tests

```bash
npm install
npm test    # Playwright smoke tests (tests/review.test.cjs)
```
