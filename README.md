# ALI MD MINI — Loader

Loader repo for the ALI MD MINI WhatsApp bot.

## Files

- `index.js` — loader entry point (loads the bot repo and runs the bot)
- `package.json` — loader + bot dependencies
- `app.json` — Heroku deploy config
- `Dockerfile` — container build
- `ali.jpg` — bot display picture

## How it works

The loader downloads the bot repo, extracts all folders and files, and runs
the bot. Pairing link comes from the loader app once it is deployed.

## Deploy

Deploy with the Heroku button (uses `app.json`) or push this repo to a
Heroku app. Set these config vars on the app:

- `MONGODB_URL` — MongoDB connection string (session storage)
- `DB_NAME` — database name (default: ladlaking)

One restart reloads the bot from fresh repo files.
