const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync(process.env.CONFIG_PATH)
const db = low(adapter)

db.defaults({ owners: [], hotspots: [] }).write()

const addHotspotAddress = async function (address, name) {
  db.get('hotspots').push({
    address: address,
    name: name
  }).write();
};

const removeHotspotAddress = function (address) {
  db.get('hotspots').remove({ address: address }).write();
};

const addOwnerAddress = function (address, name) {
  db.get('owners').push({
    address: address,
    name: name
  }).write();
};

const removeOwnerAddress = function (address) {
  db.get('owners').remove({ address: address }).write();
};

const addValidator = function (address, name) {
  db.get('validators').push({
    address: address,
    name: name
  }).write();
};

const removeValidator = function (address) {
  db.get('validators').remove({ address: address }).write();
};


const getValidators = function () {
  return db.get('validators').value();
}

const getOwners = function () {
  return db.get('owners').value()
}

const getHotspots = function () {
  return db.get('hotspots').value()
}

module.exports = {
  addHotspotAddress,
  removeHotspotAddress,
  addOwnerAddress,
  removeOwnerAddress,
  getOwners,
  getHotspots,
  getValidators,
  addValidator,
  removeValidator
};
