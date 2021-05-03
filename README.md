# Helium Discord Bot

Display stats about Helium hotspots in your Discord server. Fun for leaderboards with friends.

## Setup

Install nodejs, yarn, and run:

```
cp .env.sample .env
yarn install
```

Currently expecting node v14 -- see `engines` in `package.json`

## Adding the bot to Discord

- Create a [Discord app](https://discord.com/developers/applications)
- Copy the `Application ID` and set `DISCORD_APPLICATION_ID` in your `.env`
- Create a bot for the app
- Copy the bot `token` and set `DISCORD_TOKEN` in your `.env`

Then to start:

```
yarn start
```

You should see an oauth URL appear in the console. Open it to authorize the bot with your Discord channel.

## Add your hotspots

Now open up `.env` and enter all the Helium addresses you want to show up in your Discord server.

These should be specified as comma-separated list of `address:username` pairs, like "14Fu...:jamiew,15f7...:cpu". The username is optional.

You can list all hotspots in a given account using `HOTSPOT_OWNERS`, or just just `HOTSPOTS` to enumerate specific hotspots. You can use both variables and the lists will be combined.

## Talk to the bot

Write `hotspots stats` in a Discord channel and the bot should respond with:

```
34.83  Electric-Metal-Jaguar 'Joe' 00
26.49  Probiotic-Spanish-Moose 'Dan' 47
25.11  Handsome-Sanguin-Chiddler 'Chad' 99
04.20  Frothing-Butt-Weasel 'Casey' 69
```

## Tests

'Tests' is so generous. More like, "try running the script with sample data, hopefully it doesn't break." 

Run:

```
yarn test
```

## License

MIT 
