const request = require("request-promise-native");
const DB = require('./db');

require('dotenv').config();

const log = function (message) {
  console.log("helium-hotspots: " + message);
};

const httpGet = async function (url) {
  log(`GET ${url}`);
  const result = await request({
    url: url,
    method: "GET",
    json: true,
  });
  return result;
};

const fetchHotspotsForOwner = async function (owner) {
  const rsp = await httpGet(`https://api.helium.io/v1/accounts/${owner}/hotspots`);
  return rsp.data;
};

const fetchHotspotByName = async function (name) {
  const rsp = await httpGet(`https://api.helium.io/v1/hotspots/name/${name}`);
  return rsp.data;
};

const fetchRewardSumForHotspot = async function (address) {
  const rsp = await httpGet(`https://api.helium.io/v1/hotspots/${address}/rewards/sum${queryParams()}`);
  return rsp.data;
};

// fetches first 2 pages of activity data; 1st page is usually empty
const fetchActivityForHotspot = async function (address, cursor=null) {
  const cursorParam = !!cursor ? `?cursor=${cursor}` : '';
  const rsp = await httpGet(`https://api.helium.io/v1/hotspots/${address}/activity${cursorParam}`);
  if(rsp.data && rsp.data.length > 0){
    console.log("fetchActivityForHotspot: found some results, length =>", rsp.data.length);
    return rsp.data;
  }
  else if(!!rsp.cursor) {
    console.log("fetchActivityForHotspot: fetching another page, no results in previous page, cursor =>", rsp.cursor);
    return (await fetchActivityForHotspot(address, rsp['cursor']));
  }
  else {
    console.error("fetchActivityForHotspot: no results and no cursor, giving up");
    return [];
  }
};

const fetchHotspotDetails = async function (address) {
  const rsp = await httpGet(`https://api.helium.io/v1/hotspots/${address}`);
  return rsp.data;
};

const fetchValidatorDetails = async function (address) {
  const rsp = await httpGet(`https://api.helium.io/v1/validators/${address}`);
  return rsp.data;
}

const fetchTotalRewardsForValidator = async function (address) {
  const url = `https://api.helium.io/v1/validators/${address}/rewards/sum?min_time=2020-01-01&max_time=2050-01-01`;
  const rsp = await httpGet(url);
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

const listValidators = function (guildID) {
  const validators = DB.getValidators(guildID);
  if (validators === undefined) { return undefined; }
  return new Map(validators.map(x => [x['address'], x['name']] ));
};

const listOwners = function (guildID) {
  const owners = DB.getOwners(guildID);
  if (owners === undefined) { return undefined; }
  return new Map(owners.map(x => [x['address'], x['name']] ));
};

const listHotspots = function (guildID) {
  const hotspots = DB.getHotspots(guildID);
  if (hotspots === undefined) { return undefined; }
  return new Map(hotspots.map(x => [x['address'], x['name']] ));
};

const getValidatorStats = async function (guildID) {
  if (listValidators(guildID) === undefined || listValidators(guildID).size == 0) {
    log("getValidatorStats: VALIDATORS are not set, please add some using the bot commands (see `helium help`)");
    return undefined;
  }

  const validators = [];
  for (let validator of listValidators(guildID)) {
    let _validator = await fetchTotalRewardsForValidator(validator[0]);
    const details = await fetchValidatorDetails(validator[0]);
    // console.debug("Loaded validator: ", _validator, details);
    _validator['address'] = validator[0];
    _validator['displayName'] = validator[1] || details['name'];
    _validator['penalty'] = details['penalty'];
    validators.push(_validator);
  }

  return validators;
}

const getHotspotStats = async function (guildID) {
  // abort if HOTSPOT_OWNERS is not set (see .env)
  if (listOwners(guildID) === undefined && listHotspots(guildID) === undefined) {
    log("helium-hotspots: missing both owners and hotspots, please add some using the bot commands");
    return;
  }

  // fetch hotspots for our owners
  // TODO make this execute in parallel
  let hotspots = [];

  if (listOwners(guildID) !== undefined) {
    for (let owner of listOwners(guildID)) {
      let _hotspots = await fetchHotspotsForOwner(owner[0]);
      log(`Found ${_hotspots.length} hotspots for ${owner[0]} owned by ${owner[1]}`);
      for (let hotspot of _hotspots) {
        hotspot['displayName'] = owner[1];
        hotspots.push(hotspot);
      }
    }
  }

  if (listHotspots(guildID) !== undefined) {
    for (let hotspot of listHotspots(guildID)) {
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

const getHotspotActivity = async function (name_or_address) {
  const hotspot = await getAddressForHotspot(name_or_address);
  const activity = await fetchActivityForHotspot(hotspot);
  activity.hotspot = hotspot;
  return activity;
};


// "hotspot" argument can be address, or name with or without hyphens
// e.g. both "slow-burgundy-mandrill" and "slow burgundy mandrill" are valid
const getAddressForHotspot = async function(hotspot) {
  hotspot = hotspot.trim();
  if(hotspot.includes('-') || hotspot.includes(' ')){
    hotspot = hotspot.replace(/ /g, '-');
    const details = await fetchHotspotByName(hotspot.toLowerCase());
    if(!details){
      throw(`Failed to fetch address for hotspot name ${hotspot}`);
    }
    return details[0]['address'];
  } else {
    return hotspot;
  }
};

module.exports = {
  getValidatorStats,
  getHotspotStats,
  getHotspotActivity,
  getAddressForHotspot
};
