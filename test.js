// run from root of friendo checkout, so it can see the .env file. Like:
// $ node plugins/helium-hotspots/test.js

require("dotenv").config();

(async () => {
  const hotspots = require("./hotspots.js");
  let output = await hotspots.fetchEverything();
  console.log("\nOutput:\n");
  console.log(output);
})();
