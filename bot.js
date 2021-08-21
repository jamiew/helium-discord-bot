require('dotenv').config();

const HeliumAPI = require('./helium-api');
const DB = require('./db');

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', async message => {
  const args = message.content.split(" ");
  const command = args.slice(0, 2).join(" ").toLowerCase();
  let output = null;

  switch (command) {
    case 'helium help':
    case 'hotspot help':
      output = formatHelp();
      await message.channel.send(output);
      break;

    case 'validator stats':
    case 'validator stat':
      try {
        await message.react("✨");
        const validators = await HeliumAPI.getValidatorStats();
        if (validators !== undefined) {
          output = formatValidatorStats(validators);
          await sendStatsMessage(message, output);
        }
        else {
          await message.channel.send("No validators have been added. Type `helium help` to see how.")
        }
      } catch (error) {
        await message.channel.send(`Error: ${error}`);
        throw error;
      }
      break;

    case 'hotspot stats':
    case 'hotspot stat':
      try {
        await message.react("✨");
        hotspots = await HeliumAPI.getHotspotStats();
        if (hotspots !== undefined) {
          output = formatHotspotStats(hotspots);
          await sendStatsMessage(message, output);
        }
        else {
          await message.channel.send("No hotspots or owners have been added. Type `helium help` to see how.")
        }
      } catch (error) {
        await message.channel.send(`Error: ${error}`);
        throw error;
      }
      break;

    case 'helium config':
    case 'hotspot config':
      output = formatConfig();
      await message.channel.send(output);
      break;

    case 'hotspot add':
      await DB.addHotspotAddress(args[2], args[3]);
      await message.react("👍");
      break;

    case 'hotspot remove':
      await DB.removeHotspotAddress(args[2]);
      await message.react("👍");
      break;

    case 'hotspot activity':
      try {
        await message.react("✨");
        activity = await HeliumAPI.getHotspotActivity(args[2]);
        if (activity !== undefined) {
          await message.channel.send("No activity found.")
        }
        else {
          output = formatHotspotActivity(activity);
          await sendActivityMessage(message, output);
        }
      } catch (error) {
        await message.channel.send(`Error: ${error} \nMake sure you use a valid hotspot ID, name-with-hyphens, or even 'name without hyphens'.`);
        throw error;
      }
      break;

    case 'owner add':
      await DB.addOwnerAddress(args[2], args[3]);
      await message.react("👍");
      break;

    case 'owner remove':
      await DB.removeOwnerAddress(args[2]);
      await message.react("👍");
      break;

    case 'validator add':
      await DB.addValidator(args[2], args[3]);
      await message.react("👍");
      break;

    case 'validator remove':
      await DB.removeValidator(args[2]);
      await message.react("👍");
      break;
  }

});

// define specific paddings between columns
// currently shared b/w both hotspot & validator stats,
// but could just dynamically adjust based on output
const columnPaddings = [8, 30, 14, 8];
const activityPaddings = [27, 25, 27, 52];

function formatHotspotStats(hotspots) {
  let sum = 0;
  let output = "";

  // headers
  output += "HNT".padEnd(columnPaddings[0]);
  output += "HOTSPOT".padEnd(columnPaddings[1]);
  output += "NAME".padEnd(columnPaddings[2]);
  output += "STATUS".padEnd(columnPaddings[3]);
  output += "\n";

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
    let relayed = false;
    if(!!listenAddrs && listenAddrs[0]){
      relayed = listenAddrs[0].includes('p2p-circuit');
    }
    console.log(hotspot["name"], { ownerName, rewardScale, onlineStatus, listenAddrs, relayed });

    output += `${hnt.toString().padEnd(columnPaddings[0])}${hotspot["name"].padEnd(columnPaddings[1])}`;
    output += (ownerName ? `@${ownerName}` : "n/a").padEnd(columnPaddings[2]);
    if (onlineStatus == 'offline') {
      output += "OFFLINE";
    }
    else if (onlineStatus == 'online') {
      output += `${rewardScale && rewardScale.toFixed(2) || '0'}${!!relayed && ' Relayed' || ''}`.padEnd(columnPaddings[3]);
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

  return output;
}

function formatHotspotActivity(allActivity) {
  let output = "";

  // truncate just to first 20 results
  allActivity = allActivity.slice(0,19);

  // headers
  output += "== TYPE".padEnd(activityPaddings[0]);
  output += "DETAILS".padEnd(activityPaddings[1]);
  output += "META".padEnd(activityPaddings[2]);
  output += "TIME ==";
  output += "\n";

  for (let i = 0; i < allActivity.length; i++) {
    const activity = allActivity[i];
    let now = Math.round(Date.now() / 1000);
    let days = 60 * 60 * 24 * 1;
    if(activity['time'] < (now - days)){
      break;
    }
    let type = formatType(activity["type"]);
    let details = '';
    let meta = '';
    if (type === '`Received Mining Rewards'){
      details += '[';
      for (reward of activity["rewards"]) {
        details += formatType(reward['type'])+': +';
        details += (reward['amount'] / 100000000).toFixed(2)+' HNT, ';
      }
      details = details.substring(0, details.length - 2);
      details += ']';
    }
    if (type === '[Transfer Packets'){
      let packets = 0;
      for (summaries of activity['state_channel']['summaries']){
        packets = packets + summaries['num_packets'];
      }
      details += 'Packets: '+ packets;
    }
    if (type === 'Unknown Beacon'){
      if(activity['challenger'] === allActivity.hotspot){
        type = '.Challenged Beaconer';
      } else if(activity['path'][0]['receipt'] === null){
        type = '//Witness Beacon (Invalid)';
      } else if(activity['path'][0]['receipt']['gateway'] === allActivity.hotspot){
        type = '.Sent Beacon';
      } else {
        type = '.Witness Beacon';
        for(witness of activity['path'][0]['witnesses']){
          if (witness['gateway'] === allActivity.hotspot){
            type = '.Witness Beacon';
            if(witness['is_valid'] === false){
              type = '//Witness Beacon (Invalid)';
              details = formatType(witness['invalid_reason']);
              meta = 'RSSI: ' + witness['signal'].toString() + 'dBm SNR: ' + witness['snr'].toFixed(1) + ' dB';
            }
          }
        }
      }
      if(details === ''){
        details += 'Total witnesses: ' + activity['path'][0]['witnesses'].length.toString();
      }
      if(meta === ''){
        meta += activity['path'][0]['geocode']['short_city']+' ';
        meta += activity['path'][0]['geocode']['short_state']+' ';
        meta += activity['path'][0]['geocode']['short_country']+' ';
      }
    }

    const time = formatEpoch(activity['time']);

    console.log(activity["name"], { type, details, meta, time });
    if (type === '`Received Mining Rewards'){
      output += `${type.padEnd(activityPaddings[0])}${details.padEnd(activityPaddings[3])}`;
      output += `${time}\'`;
    } else {
      output += `${type.padEnd(activityPaddings[0])}${details.padEnd(activityPaddings[1])}`;
      output += `${meta.toString().padEnd(activityPaddings[2])}${time}`;
    }
    if(type === '[Transfer Packets'){
      output += "]";
    }
    output += "\n";
    // `[x](https://explorer.helium.com/address/${hotspot["address"]}`
  }

  if (process.env.SHOW_TOTAL == '1' && hotspots.length > 1) {
  }
  return output;
}

function formatValidatorStats(validators) {
  // build output
  let output = "";
  output += "VALIDATORS\n";

  for (let i = 0; i < validators.length; i++) {
    const hnt = validators[i]["total"].toFixed(2);
    output += `${hnt.toString().padEnd(columnPaddings[0])}${validators[i]["displayName"].padEnd(columnPaddings[1])}`;
    output += `[${validators[i]['penalty'].toFixed(2)}]`
    output += "\n";
  }

  return output;
}

function formatConfig() {
  let output = "```ml\n";

  if (DB.getOwners().length > 0) {
    output += 'VALIDATORS\n';
    if (DB.getValidators().length == 0) { output += "None\n"; }
    DB.getValidators().forEach(v => {
      output += `${v['name']} > "${v['address']}"\n`
    });
    output += "\n";
  }

  if (DB.getOwners().length > 0) {
    output += 'OWNERS\n';
    if (DB.getOwners().length == 0) { output += "None\n"; }
    DB.getOwners().forEach(owner => {
      output += `${owner['name']} > "${owner['address']}"\n`
    });
    output += "\n";
  }

  output += 'HOTSPOTS\n';
  if (DB.getHotspots().length == 0) { output += "None\n"; }
  DB.getHotspots().forEach(hotspot => {
    output += `${hotspot['name']} > "${hotspot['address']}"\n`
  });

  output += "\n```";
  return output;
}

function formatHelp() {
  let output = "```sh\n";
  output += "HOTSPOT COMMANDS\n"
  output += "helium config\n"
  output += "\nhotspot stats\n"
  output += "hotspot activity [$address|$magic-animal-name]\n"
  output += "hotspot add $address $name\n"
  output += "hotspot remove $address\n"
  output += "\nowner add $address $name\n"
  output += "owner remove $address\n"
  output += "\nvalidator stats\n"
  output += "validator add $address $name\n"
  output += "validator remove $address\n"
  output += "\n```";
  return output;
}

function formatType(type) {
  let output = '';
  switch (type) {
    case 'add_gateway_v1':
      output = 'Added to Blockchain'
      break;

    case 'assert_location_v2':
      output = 'Asserted Location'
      break;

    case 'rewards_v2':
      output = '`Received Mining Rewards'
      break;

    case 'poc_witnesses':
      output = 'Witness'
      break;

    case 'poc_receipts_v1':
      output = 'Unknown Beacon'
      break;

    case 'poc_challengers':
      output = 'Challenger'
      break;

    case 'state_channel_close_v1':
      output = '[Transfer Packets'
      break;

    case 'poc_request_v1':
      output = 'Created Challenge'
      break;

    case 'data_credits':
      output = 'Data'
      break;

    case 'poc_challengees':
      output = 'Beacon'
      break;

    case 'witness_rssi_below_lower_bound':
      output = 'Low RSSI'
      break;

    case 'witness_too_close':
      output = 'Too Close'
      break;

    case 'witness_rssi_too_high':
      output = 'High RSSI'
      break;

    default:
      output = 'Unknown';
  }
  return output;
}

function formatEpoch(epoch){
  var myDate = new Date(epoch*1000);
  return myDate.toLocaleString()
}

// if necessary, split into 2k character chunks and send multiple messages
function chunkifyString(str, maxSize) {
  let chunks = [];
  const lines = str.split(`\n`);
  for(i = 0, cur = 0; i < lines.length; i++) {
    if(chunks[cur] && (chunks[cur].length + lines[i].length) > maxSize) {
      cur += 1;
    }
    if(!chunks[cur]) { chunks[cur] = ''; }
    chunks[cur] += lines[i];
    chunks[cur] += "\n";
  }
  return chunks;
}

async function sendStatsMessage(message, fullText) {
  // 2k discord character max, we add ~10 characters, just fudge to 1900
  const chunks = chunkifyString(fullText, 1900)
  for(chunk of chunks) {
    let output = "```ml\n";
    output += chunk;
    output += "```\n"
    await message.channel.send(output);
  }
}

async function sendActivityMessage(message, fullText) {
  // 2k discord character max, we add ~10 characters, just fudge to 1900
  const chunks = chunkifyString(fullText, 1900)
  for(chunk of chunks) {
    let output = "```AsciiDoc\n";
    output += chunk;
    output += "```\n"
    await message.channel.send(output);
  }
}

module.exports = {
  formatHotspotStats,
  formatHotspotActivity,
  formatValidatorStats,
  formatConfig,
  formatHelp,
}

if(!!process.env.TEST) {
  console.info("Test mode, not logging in");
}
else {
  console.log(`Hotspot bot starting...`);
  console.log(`To add it to your server, visit:`);
  console.log(`https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&scope=bot&permissions=1024`);
  client.login(process.env.DISCORD_TOKEN);
}
