// run from root of friendo checkout, so it can see the .env file. Like:
// $ node plugins/helium-hotspots/test.js

require("dotenv").config();

(async () => {
  const HeliumAPI = require('./helium-api');
  // TODO load some fake config
  const output = await HeliumAPI.getHotspotStats();
  console.log("\nOutput:\n");
  console.log(output);
})();
