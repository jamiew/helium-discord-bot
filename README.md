# Helium Discord Bot

Display stats about Helium hotspots in your Discord server. Fun for leaderboards with friends.

## Setup

Install [nodejs](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/) and run:

```
yarn install
```

Currently expecting nodejs v14-ish, modify `engines` in `package.json` if you want to use something else.

Then make a copy of the default `.env` file:

```
cp .env.sample .env
```

## Adding the bot to Discord

- Create a [Discord app](https://discord.com/developers/applications)
- Copy the `Application ID` and set `DISCORD_CLIENT_ID` in your `.env`
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

Write `hotspot help` to see all the commands for managing owners/hotspots:

Then send `hotspot stats` to see the stats:

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
