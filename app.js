// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const astro = require("./astrojs.js");

// Global variables
let today;
let summerDate;
let winterDate;
let springDate;
let fallDate;

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.command('/daylight', async ({ command, ack, say }) => { 
  // Acknowledge command request
  await ack(); 
  
  const daylightMessage = getDaylight();
  await say(daylightMessage);
});

function getDaylight() {
  today = new Date();
  const target_year = today.getFullYear();
  const date_eqsol = astro.eqsol(target_year); 

  // Get spring equinox
  const eqsol_spring = date_eqsol[0];
  const eqsol_spring_jd = astro.jd_data(eqsol_spring);
  const eqsol_spring_year = eqsol_spring_jd[2];
  const eqsol_spring_month = eqsol_spring_jd[1];
  const eqsol_spring_day = eqsol_spring_jd[0];
  springDate = new Date(
    eqsol_spring_year,
    eqsol_spring_month - 1,
    eqsol_spring_day
  );

  // Get summer solstice
  const eqsol_summer = date_eqsol[1];
  const eqsol_summer_jd = astro.jd_data(eqsol_summer);
  const eqsol_summer_year = eqsol_summer_jd[2];
  const eqsol_summer_month = eqsol_summer_jd[1];
  const eqsol_summer_day = eqsol_summer_jd[0];
  summerDate = new Date(
    eqsol_summer_year,
    eqsol_summer_month - 1,
    eqsol_summer_day
  );

  // Get fall equinox
  const eqsol_fall = date_eqsol[2];
  const eqsol_fall_jd = astro.jd_data(eqsol_fall);
  const eqsol_fall_year = eqsol_fall_jd[2];
  const eqsol_fall_month = eqsol_fall_jd[1];
  const eqsol_fall_day = eqsol_fall_jd[0];
  fallDate = new Date(
    eqsol_fall_year,
    eqsol_fall_month - 1,
    eqsol_fall_day
  );

  // Get winter solstice
  const eqsol_winter = date_eqsol[3];
  const eqsol_winter_jd = astro.jd_data(eqsol_winter);
  const eqsol_winter_year = eqsol_winter_jd[2];
  const eqsol_winter_month = eqsol_winter_jd[1];
  const eqsol_winter_day = eqsol_winter_jd[0];
  winterDate = new Date(
    eqsol_winter_year,
    eqsol_winter_month - 1,
    eqsol_winter_day
  );
  
  ///////////////////////////////
  // Calculate daylight status //
  ///////////////////////////////
  let message;
  let specialMessage;
  let daysToSolstice;
  let nextSeason;
  const diffTimeSummer = Math.abs(today - summerDate);
  const diffDaysSummer = Math.ceil(diffTimeSummer / (1000 * 60 * 60 * 24));
  const seasonLength = Math.ceil(
    Math.abs(winterDate - summerDate) / (1000 * 60 * 60 * 24)
  );
  const percentFull = Math.abs((diffDaysSummer - seasonLength) / seasonLength) * 100;

  // Create Emojis
  const totalEmojis = 20;
  const sunCount = Math.floor((totalEmojis * percentFull) / 100);
  const moonCount = totalEmojis - sunCount;
  const emojiString = "🌞".repeat(sunCount) + "🌚".repeat(moonCount);
  
  // Get distance to next solstice
  if (today > winterDate) {
    // Get distance to summer of next year
    const nextYear = summerDate.getFullYear();
    const nextMonth = summerDate.getMonth();
    const nextDay = summerDate.getDate();
    const nextSolstice = new Date(nextYear + 1, nextMonth, nextDay);
    daysToSolstice = Math.ceil(
      Math.abs(nextSolstice - today) / (1000 * 60 * 60 * 24)
    );
    nextSeason = "summer";
  } else if (today <= summerDate) {
    // Get distance to summer
    daysToSolstice = Math.ceil(
      Math.abs(today - summerDate) / (1000 * 60 * 60 * 24)
    );
    nextSeason = "summer";
  } else {
    // Get distance to winter
    daysToSolstice = Math.ceil(
      Math.abs(today - winterDate) / (1000 * 60 * 60 * 24)
    );
    nextSeason = "winter";
  }

  const distanceMessage = `${daysToSolstice} days until ${nextSeason} solstice!`;
  
  // Check for special dates
  if (today.getTime() == summerDate.getTime()) {
    specialMessage = "Happy summer solstice!";
  } else if (today.getTime() == winterDate.getTime()) {
    specialMessage = "Happy winter solstice!";
  } else if (today.getTime() == springDate.getTime()) {
    specialMessage = "Happy spring equinox!";
  } else if (today.getTime() == fallDate.getTime()) {
    specialMessage = "Happy fall equinox!";
  }

  if (specialMessage) {
    message = specialMessage;
  } else {
    message = `Today we're operating at ${percentFull.toFixed(2)}% of maximum daylight.`;
    message = `${message} \n${distanceMessage}`;
  }
  
  message = `${message} \n\n${emojiString}`;  
  return(message);
}


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
  console.log(getDaylight());
})();
