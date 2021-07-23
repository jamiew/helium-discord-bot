// helium-hotspots plugin
// Print daily rewards amounts for your Helium Hotspots
// #antennalife

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

  // build output
  let output = "";
  output += "```ml\n";
  output += "VALIDATORS\n";

  for (let i = 0; i < validators.length; i++) {
    const hnt = validators[i]["total"].toFixed(2);
    output += `${hnt.toString().padEnd(7)}${validators[i]["displayName"].padEnd(24)}`;
    output += `[${validators[i]['penalty'].toFixed(2)}]`
    output += "\n";
  }

  output += "```\n";
  return output;
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

  // build output
  // TODO this should be back in bot.js, nothing to do with API
  let sum = 0;
  let output = "";
  output += "```ml\n";

  // paddings between columns
  // TODO share between validator and hotspot output
  const paddings = [7, 30, 14, 6];

  // headers disabled due to 2k char message limit
  // this gets us over the line
  // TODO echo back in multiple messages if really big (right?)
  // output += "HNT".padEnd(paddings[0]);
  // output += "HOTSPOT".padEnd(paddings[1]);
  // output += "NAME".padEnd(paddings[4]);
  // output += "STATUS";
  // output += "\n";

  for (let i = 0; i < hotspots.length; i++) {
    const hotspot = hotspots[i];
    const hnt = hotspot["rewards_24h"].toFixed(2);
    sum += parseFloat(hnt);

    const ownerName = hotspot["displayName"] && hotspot["displayName"].toString();
    const blocksBehind = hotspot['block'] - hotspot['last_change_block'];
    const rewardScale = hotspot['reward_scale'];
    const onlineStatus = hotspot['status']['online'];
    const listenAddrs = hotspot['status']['listen_addrs'];
    console.log(listenAddrs)
    const relayed = listenAddrs && !!listenAddrs.filter((addr) => { addr.match(/p2p-circuit/) }).length > 0;
    console.log(hotspot["name"], { ownerName, rewardScale, onlineStatus, listenAddrs, relayed });

    output += `${hnt.toString().padEnd(paddings[0])}${hotspot["name"].padEnd(paddings[1])}`;
    output += (ownerName ? `@${ownerName}` : "n/a").padEnd(paddings[2]);
    if (onlineStatus == 'offline') {
      output += "OFFLINE";
    }
    else if (onlineStatus == 'online') {
      output += `${rewardScale && rewardScale.toFixed(2) || '0'}${!!relayed && 'R' || ''}`.padEnd(paddings[3]);
      if (blocksBehind >= parseInt(process.env.BLOCK_WARNING_THRESHOLD)) {
        output += " " + blocksBehind + " behind";
      }
    }
    output += "\n";
    // `[x](https://explorer.helium.com/address/${hotspot["address"]}`
  }

  if (process.env.SHOW_TOTAL == '1' && hotspots.length > 1) {
    output += `---------------------------------------------\n`
    output += `${sum.toFixed(2)}\n`
  }

  output += "```\n";
  return output;
};


module.exports = {
  getHotspotStats: getHotspotStats,
  getValidatorStats: getValidatorStats
};
