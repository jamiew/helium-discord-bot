# Helium Discord Bot

Display stats about Helium hotspots in a Discord channel.

## Env Setup
Install node and run `yarn install`

## Adding the bot to Discord
- Create a [Discord app](https://discord.com/developers/applications)
- Copy the `Application ID` and set `DISCORD_APPLICATION_ID=` in your .env
- Create a bot for the app
- Copy the bot `token` and set `DISCORD_TOKEN=` in your .env

Now configure enter in all the Helium addresses you want to show up in Discord inside your `.env` file.

Run `npm start`. You should an oauth URL appear in the console. Click it to authorize the bot with your Discord channel.


## Talk to the bot

Write `hotspots stats` in a Discord channel and the bot should respond with:

```
34.83  Electric-Metal-Jaguar 'Joe' 00
26.49  Probiotic-Spanish-Moose 'Dan' 47
25.11  Handsome-Sanguin-Chiddler 'Chad' 99
04.20  Frothing-Butt-Weasel 'Casey' 69
```
