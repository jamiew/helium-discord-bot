require('dotenv').config();
const fs = require('fs');

const OWNERS_KEY = 'owners';
const HOTSPOTS_KEY = 'hotspots';

const getConfig = function () {
  let rawdata;
  try {
    rawdata = fs.readFileSync(process.env.CONFIG_PATH, (err) => {});
  } catch(err) {}
  // console.log("getConfig", rawdata);
  return rawdata === undefined ? {} : JSON.parse(rawdata);
};

const saveConfig = function (obj) {
  console.log("saveConfig", obj);
  fs.writeFileSync(process.env.CONFIG_PATH, JSON.stringify(obj), err => {
    console.log(err);
  });
};

const addHotspotAddress = async function (address, name) {
  let config = await getConfig();
  if (config[HOTSPOTS_KEY] == null) {
    config[HOTSPOTS_KEY] = [];
  }

  config[HOTSPOTS_KEY].push({
    "address": address,
    "name": name
  });

  saveConfig(config);
};

const removeHotspotAddress = function (address) {
  let config = getConfig();
  var filtered = config[HOTSPOTS_KEY].filter(h => h['address'] != address);
  config[HOTSPOTS_KEY] = filtered;
  saveConfig(config);
};

const addOwnerAddress = function (address, name) {
  let config = getConfig();

  if (config[OWNERS_KEY] == null) {
    config[OWNERS_KEY] = [];
  }

  config[OWNERS_KEY].push({
    "address": address,
    "name": name
  });

  saveConfig(config);
};

const removeOwnerAddress = function (address) {
  let config = getConfig();
  var filtered = config[OWNERS_KEY].filter(h => h['address'] != address);
  config[OWNERS_KEY] = filtered;
  saveConfig(config);
};

const getOwners = function () {
  return getConfig()[OWNERS_KEY] || [];
}

const getHotspots = function () {
  return getConfig()[HOTSPOTS_KEY] || [];
}

module.exports = {
  addHotspotAddress,
  removeHotspotAddress,
  addOwnerAddress,
  removeOwnerAddress,
  getOwners,
  getHotspots
};
