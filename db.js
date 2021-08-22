const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
// TODO switch to JSONFile which won't block requests

const adapter = new FileSync(process.env.CONFIG_PATH);
const db = low(adapter);

const initServer = async function (guildID) {
  // const guildID = `server_${serverID}`;
  console.log(db.get(guildID).value());
  if(db.get(guildID).keys().value().length > 0){
    console.log(`${guildID} appears to be initialized:`, db.get(guildID).value());
    console.log(db.get(guildID).get('hotspots').value());
    return null;
  }
  else {
    console.log(`Initializing hash for ${guildID}`);
    const defaults = {}
    defaults[guildID] = { owners: [], hotspots: [], validators: [] };
    db.defaults(defaults).write();
    const values = db.get(guildID).value();
    console.log("values =>", values);
    return values;
  }
}

const addHotspotAddress = async function (guildID, address, name) {
  db.get(guildID)
    .get('hotspots')
    .push({
      address: address,
      name: name
    })
    .write();
};

const removeHotspotAddress = function (guildID, address) {
  db.get(guildID).get('hotspots')
    .remove({ address: address })
    .write();
};

const addOwnerAddress = function (guildID, address, name) {
  db.get(guildID).get('owners')
    .push({
      address: address,
      name: name
    })
    .write();
};

const removeOwnerAddress = function (guildID, address) {
  db.get(guildID).get('owners')
    .remove({ address: address })
    .write();
};

const addValidator = function (guildID, address, name) {
  db.get(guildID).get('validators')
    .push({
      address: address,
      name: name
    })
    .write();
};

const removeValidator = function (guildID, address) {
  db.get(guildID).get('validators')
    .remove({ address: address })
    .write();
};


const getValidators = function (guildID) {
  return db.get(guildID).get('validators').value() || [];
}

const getOwners = function (guildID) {
  return db.get(guildID).get('owners').value() || [];
}

const getHotspots = function (guildID) {
  return db.get(guildID).get('hotspots').value() || [];
}

module.exports = {
  db,
  initServer,
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
