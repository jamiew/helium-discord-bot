// Run with: `yarn test`
// Executes all our major commands w/ some sample data
// duplicates lots of logic from bot.js...
// is there a javascripty way to fake `client.on(msg)`?
// or should we just refactor each handler to be their own functions?
// TODO should test against missing or malformed config items too

require("dotenv").config();
process.env.TEST = true;
process.env.CONFIG_PATH = "testConfig.json";

(async () => {
  const HeliumAPI = require('./helium-api');
  const Bot = require('./bot');

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

  // test support for all possible hotspot names
  const testHotspots = [
    '11Kj6LV5M51PzPjBVbtgESL625SsrzdPoi59PDPQ2xdeozNuRuq',
    'slow-burgundy-mandrill',
    'slow burgundy mandrill'
  ];
  for(testHotspot of testHotspots){
    testHeader(`hotspot activity ${testHotspot}`);
    const activity = await HeliumAPI.getHotspotActivity(testHotspot);
    if(!activity || activity.length == 0){ throw("No activity data") };
    output = await Bot.formatHotspotActivity(activity);
    console.log(output);
  };

  // if we got this far we are gtg
  process.exit(0);
})();

function testHeader(name) {
  console.log(`\n******************** ${name} ********************\n`);
}
