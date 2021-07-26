const request = require("request-promise-native");
const DB = require('./db');

require('dotenv').config();

const log = function (message) {
  console.log("helium-hotspots: " + message);
};

const httpGet = async function (url) {
  log(`GET ${url}`);
  let result = await request({
    url: url,
    method: "GET",
    json: true,
  });
  return result;
};

const fetchHotspotsForOwner = async function (owner) {
  let rsp = await httpGet(`https://api.helium.io/v1/accounts/${owner}/hotspots`);
  return rsp.data;
};

const fetchRewardSumForHotspot = async function (address) {
  let rsp = await httpGet(`https://api.helium.io/v1/hotspots/${address}/rewards/sum${queryParams()}`);
  return rsp.data;
};

const fetchHotspotDetails = async function (address) {
  let rsp = await httpGet(`https://api.helium.io/v1/hotspots/${address}`);
  return rsp.data;
};

const fetchValidatorDetails = async function (address) {
  let rsp = await httpGet(`https://api.helium.io/v1/validators/${address}`);
  return rsp.data;
}

const fetchTotalRewardsForValidator = async function (address) {
  let url = `https://api.helium.io/v1/validators/${address}/rewards/sum?min_time=2020-01-01&max_time=2050-01-01`;
  let rsp = await httpGet(url);
  // rsp = await httpGet(`${url}&cursor=${rsp['cursor']}`);
  return rsp.data;
};

const formatDate = function (date) {
  // hard-set to midnight UTC on the date specified
  // return date.toISOString().substr(0, 10) + "T00:00:00Z";
  return date.toISOString();
};

const queryParams = function() {
  return `?${dateTimeParams()}`
}

const dateTimeParams = function () {
  const maxTime = new Date(Date.now()); // right now
  const minTime = new Date(Date.now() - 864e5);  // 24 hours ago
  return "max_time=" + formatDate(maxTime) + "&min_time=" + formatDate(minTime);
};

const listValidators = function () {
  let validators = DB.getValidators();
  if (validators === undefined) {
    return undefined;
  }

  return new Map(validators.map(x => [x['address'], x['name']] ));
};

const listOwners = function () {
  let owners = DB.getOwners();
  if (owners === undefined) {
    return undefined;
  }

  return new Map(owners.map(x => [x['address'], x['name']] ));
};

const listHotspots = function () {
  let hotspots = DB.getHotspots();
  if (hotspots === undefined) {
    return undefined;
  }

  return new Map(hotspots.map(x => [x['address'], x['name']] ));
};

const getValidatorStats = async function () {
  if (listValidators() === undefined || listValidators().size == 0) {
    log("getValidatorStats: VALIDATORS are not set, please add some using the bot commands (see `helium help`)");
    return undefined;
  }

  const validators = [];
  for (let validator of listValidators()) {
    let _validator = await fetchTotalRewardsForValidator(validator[0]);
    const details = await fetchValidatorDetails(validator[0]);
    console.log({ details });
    console.log("Loaded validator: ", _validator, details);
    _validator['address'] = validator[0];
    _validator['displayName'] = validator[1] || details['name'];
    _validator['penalty'] = details['penalty'];
    validators.push(_validator);
  }
}

const getHotspotStats = async function () {
  // abort if HOTSPOT_OWNERS is not set (see .env)
  if (listOwners() === undefined && listHotspots() === undefined) {
    log("helium-hotspots: HOTSPOTS and OWNERS are not set, please add some using the bot commands");
    return;
  }

  // fetch hotspots for our owners
  // TODO make this execute in parallel
  let hotspots = [];

  if (listOwners() !== undefined) {
    for (let owner of listOwners()) {
      let _hotspots = await fetchHotspotsForOwner(owner[0]);
      log(`Found ${_hotspots.length} hotspots for ${owner[0]} owned by ${owner[1]}`);
      for (let hotspot of _hotspots) {
        hotspot['displayName'] = owner[1];
        hotspots.push(hotspot);
      }
    }
  }

  if (listHotspots() !== undefined) {
    for (let hotspot of listHotspots()) {
      let _hotspot = await fetchHotspotDetails(hotspot[0]);
      _hotspot['displayName'] = hotspot[1];
      hotspots.push(_hotspot);
    }
  }

  // hydrate with reward and activity data
  // TODO make this execute in parallel
  for (let hotspot of hotspots) {
    let rewards = await fetchRewardSumForHotspot(hotspot["address"], dateTimeParams());
    if (rewards["sum"] == null) {
      rewards["sum"] = 0;
    }
    hotspot["rewards_24h"] = (parseInt(rewards["sum"]) / 100000000);
  }

  // sort by reward amount
  hotspots = hotspots.sort(function (a, b) {
    if (a["rewards_24h"] > b["rewards_24h"]) return -1;
    if (a["rewards_24h"] < b["rewards_24h"]) return 1;
    return 0;
  });

  return hotspots;
};


module.exports = {
  getHotspotStats: getHotspotStats,
  getValidatorStats: getValidatorStats
};
