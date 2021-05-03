require('dotenv').config();
const fs = require('fs');

const OwnerName = 'owners';
const HotspotName = 'hotspots';

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
  if (config[HotspotName] == null) {
    config[HotspotName] = [];
  }

  config[HotspotName].push({
    "address": address,
    "name": name
  });
  
  saveConfig(config);
};

const removeHotspotAddress = function (address) {
  let config = getConfig();
  var filtered = config[HotspotName].filter(h => h['address'] != address);
  config[HotspotName] = filtered;
  saveConfig(config);
};

const addOwnerAddress = function (address, name) {
  let config = getConfig();

  if (config[OwnerName] == null) {
    config[OwnerName] = [];
  }

  config[OwnerName].push({
    "address": address,
    "name": name
  });

  saveConfig(config);
};

const removeOwnerAddress = function (address) {
  let config = getConfig();
  var filtered = config[OwnerName].filter(h => h['address'] != address);
  config[OwnerName] = filtered;
  saveConfig(config);
};

const getOwners = function () {
  return getConfig()[OwnerName];
}

const getHotspots = function () {
  return getConfig()[HotspotName];
}

module.exports = {
  addHotspotAddress,
  removeHotspotAddress,
  addOwnerAddress,
  removeOwnerAddress,
  getOwners,
  getHotspots
};
