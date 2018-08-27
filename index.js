const Mastodon = require("mastodon");
const uniqueRandomArray = require("unique-random-array");
const express = require("express");
const app = express();
const CronJob = require("cron").CronJob;
require("dotenv").config();

const TOPICS = [
  "saarland",
  "saar",
  "Illingen",
  "Heusweiler",
  "Saarbrücken",
  ".saarland",
  "Eppelborn",
  "DFKI",
  "UdS"
];

const MASTODON_CLIENT = Mastodon({
  access_token: process.env.ACCESS_TOKEN,
  api_url: "https://botsin.space/api/v1/"
});


const job = new CronJob({
  cronTime: "0 30 * * * *",
  onTick: function() {
    /*
     * Runs every day at 17-23 pm 
     */
    const d = new Date();
    console.log('Cron ran at:', d);
    
    const getTopic = uniqueRandomArray(TOPICS);
    MASTODON_CLIENT.get("search", { q: getTopic(), resolve: true })
      .then(res => res.data.accounts)
      .then((accounts = []) => accounts.map(account => account.acct))
      .then(accts =>
        accts.map(acct =>
          MASTODON_CLIENT.post("statuses", {
            status: `Folgeempfehlung @${acct}.`,
            visibility: "public"
          })
        )
      );
  },
  start: false,
  timeZone: "America/New_York"
});

job.start();

//this does nothing except tell now we're alive
const port = process.env.PORT || 2345;
app.listen(port, function() {
  console.log("app listening on port: ", port);
});
