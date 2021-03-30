# Daylight-Bot

A slackbot to tell how long today is relative to the longest and shortest days of the year.

Build using [Bolt](https://slack.dev/bolt), a framework that lets you build JavaScript-based Slack apps.

Also uses the eqsol library to calculate solstice dates. I've downloaded and exported functions to work with node imports here, but you can find the original source here: [https://www.suchelu.it/as_esempio_eqsol_en.html](https://www.suchelu.it/as_esempio_eqsol_en.html)

## The Project

---

- `app.js` contains the primary Bolt app and all the date crunching logic and listeners for events coming from slack.

- `.env` is where we keep our Slack app's authorization token and signing secret, but that will not be checked into git.
