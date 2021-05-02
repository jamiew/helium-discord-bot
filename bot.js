require('dotenv').config();

const Hotspots = require('./hotspots');

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', async message => {
  if (message.content.toLowerCase() === 'hotspot stats') {
    await message.channel.send("✨ Checking the blockchain, stand by...");
    let output = await Hotspots.fetchEverything();
    await message.channel.send(output);
    // message.reply(output);
  }
});

console.log(`Hotspot bot starting...`);
console.log(`To add it to your server, visit:`);
console.log(`https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&scope=bot&permissions=1024`);
client.login(process.env.DISCORD_TOKEN);