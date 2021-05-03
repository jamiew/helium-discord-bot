require('dotenv').config();

const Hotspots = require('./hotspots');
const Config = require('./config');

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', async message => {
  let output = "";
  let args = message.content.split(" ");
  let command = args.slice(0, 2).join(" ").toLowerCase();

  switch (command) {
    case 'hotspot help':
      output = "```\n";
      output += "hotspot stats\n"
      output += "hotspot config\n"
      output += "hotspot add {address} {name}\n"
      output += "hotspot remove {address}\n"
      output += "host add {address} {name}\n"
      output += "host remove {address}\n"
      output += "\n```";
      await message.channel.send(output);
      break;

    case 'hotspot stats':
    case 'hotspot stat':
      await message.channel.send("✨ Checking the blockchain, stand by...");
      output = await Hotspots.fetchEverything();
      if (output !== undefined) {
        await message.channel.send(output);
      }
      else {
        await message.channel.send("No hotspots/owners have been added yet. `hotspot help` to see how.")
      }
      break;

    case 'hotspot config':
      output = "```ml\n";
      output += 'OWNERS\n';
      Config.getOwners().forEach(owner => {
        output += `${owner['name']} > ${owner['address']}\n`
      });

      output += '\HOTSPOTS\n';
      Config.getHotspots().forEach(hotspot => {
        output += `${hotspot['name']} > ${hotspot['address']}\n`
      });

      output += "\n```";
      await message.channel.send(output);
      break;

    case 'hotspot add':
      await Config.addHotspotAddress(args[2], args[3]);
      await message.channel.send("Hotspot added!");
      break;

    case 'hotspot remove':
      await Config.removeHotspotAddress(args[2]);
      await message.channel.send("Hotspot removed!");
      break;

    case 'owner add':
      await Config.addOwnerAddress(args[2], args[3]);
      await message.channel.send("Owner added!");
      break;

    case 'owner remove':
      await Config.removeOwnerAddress(args[2]);
      await message.channel.send("Owner removed!");
      break;
  }

});

console.log(`Hotspot bot starting...`);
console.log(`To add it to your server, visit:`);
console.log(`https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&scope=bot&permissions=1024`);
client.login(process.env.DISCORD_TOKEN);
