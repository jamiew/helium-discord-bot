// run from root of friendo checkout, so it can see the .env file. Like:
// $ node plugins/helium-hotspots/test.js

require("dotenv").config();
process.env.TEST = true;

(async () => {
  const HeliumAPI = require('./helium-api');
  const Bot = require('./bot');

  // TODO load some fake config

  // is there a javascripty way to fake `client.on(msg)`?
  // or do we have to refactor each handler to be their own functions?

  testHeader("help");
  let output = Bot.formatHelp();
  console.log(output);

  testHeader("config");
  output = Bot.formatConfig();;
  console.log(output);

  testHeader("hotspot stats");
  const hotspots = await HeliumAPI.getHotspotStats();
  if(!hotspots || hotspots.length == 0){ throw("No hotspots") };
  output = Bot.formatHotspotStats(hotspots);
  console.log(output);

  testHeader("validator stats");
  const validators = await HeliumAPI.getValidatorStats();
  if(!validators || validators.length == 0){ throw("No validators") };
  output = Bot.formatValidatorStats(validators);
  console.log(output);

  // if we got this far we are gtg
  process.exit(0);
})();

function testHeader(name) {
  console.log(`\n******************** ${name} ********************\n`);
}