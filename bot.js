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
      await message.react("👍");;
      break;

    case 'hotspot remove':
      await DB.removeHotspotAddress(args[2]);
      await message.react("👍");
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

function formatHotspotStats(hotspots) {
  let sum = 0;
  let output = "";

  // headers
  output += "HNT".padEnd(columnPaddings[0]);
  output += "HOTSPOT".padEnd(columnPaddings[1]);
  output += "NAME".padEnd(columnPaddings[4]);
  output += "STATUS";
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
    const relayed = listenAddrs && !!listenAddrs.filter((addr) => { addr.match(/p2p-circuit/) }).length > 0;
    console.log(hotspot["name"], { ownerName, rewardScale, onlineStatus, listenAddrs, relayed });

    output += `${hnt.toString().padEnd(columnPaddings[0])}${hotspot["name"].padEnd(columnPaddings[1])}`;
    output += (ownerName ? `@${ownerName}` : "n/a").padEnd(columnPaddings[2]);
    if (onlineStatus == 'offline') {
      output += "OFFLINE";
    }
    else if (onlineStatus == 'online') {
      output += `${rewardScale && rewardScale.toFixed(2) || '0'}${!!relayed && 'R' || ''}`.padEnd(columnPaddings[3]);
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
    DB.getValidators().forEach(v => {
      output += `${v['name']} > ${v['address']}\n`
    });
    output += "\n";
  }

  if (DB.getOwners().length > 0) {
    output += 'OWNERS\n';
    DB.getOwners().forEach(owner => {
      output += `${owner['name']} > ${owner['address']}\n`
    });
    output += "\n";
  }

  output += 'HOTSPOTS\n';
  if (DB.getHotspots().length == 0) { output += "None\n"; }
  DB.getHotspots().forEach(hotspot => {
    output += `${hotspot['name']} > ${hotspot['address']}\n`
  });

  output += "\n```";
  return output;
}

function formatHelp() {
  let output = "```sh\n";
  output += "HOTSPOT COMMANDS\n"
  output += "helium config\n"
  output += "\nhotspot stats\n"
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

module.exports = {
  formatHotspotStats,
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