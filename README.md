# Helium Discord Bot

Display stats about Helium hotspots in a Discord channel.

## Setup

Install nodejs, yarn, and run `yarn install`

## Adding the bot to Discord

- Create a [Discord app](https://discord.com/developers/applications)
- Copy the `Application ID` and set `DISCORD_APPLICATION_ID` in your .env
- Create a bot for the app
- Copy the bot `token` and set `DISCORD_TOKEN` in your .env

Run `yarn start`. You should see an oauth URL appear in the console. Open it to authorize the bot with your Discord channel.

## Add your hotspots

Now enter all the Helium addresses you want to show up in Discord inside your `.env` file.

These should be specified as comma-separated list of `address:username` pairs, like "14Fu...:jamiew". The username is optional.

You can list all hotspots in a given account using `HOTSPOT_OWNERS`, or just just `HOTSPOTS` to enumerate specific ones. You can use both variables and the lists will be combined.

## Talk to the bot

Write `hotspots stats` in a Discord channel and the bot should respond with:

```
34.83  Electric-Metal-Jaguar 'Joe' 00
26.49  Probiotic-Spanish-Moose 'Dan' 47
25.11  Handsome-Sanguin-Chiddler 'Chad' 99
04.20  Frothing-Butt-Weasel 'Casey' 69
```

## License

MIT 
