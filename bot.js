require('dotenv').config();

const HeliumAPI = require('./helium-api');
const DB = require('./db');

const Discord = require('discord.js');
const { debug } = require('request-promise-native');
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
      output = "```sh\n";
      output += "hotspot stats\n"
      output += "hotspot config\n"
      output += "hotspot add $address $name\n"
      output += "hotspot remove $address\n"
      output += "owner add $address $name\n"
      output += "owner remove $address\n"
      output += "validator add $address $name\n"
      output += "validator remove $address\n"
      output += "\n```";
      await message.channel.send(output);
      break;

    case 'hotspot stats':
    case 'hotspot stat':
    case 'validator stats':
      await message.react("✨");
      output = await HeliumAPI.fetchEverything();
      if (output !== undefined) {
        await message.channel.send(output);
      }
      else {
        await message.channel.send("No hotspots/owners have been added yet. `hotspot help` to see how.")
      }
      break;

    case 'hotspot config':
      output = "```ml\n";
      
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

console.log(`Hotspot bot starting...`);
console.log(`To add it to your server, visit:`);
console.log(`https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&scope=bot&permissions=1024`);
client.login(process.env.DISCORD_TOKEN);
