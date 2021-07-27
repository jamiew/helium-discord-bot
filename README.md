[![Test suite](https://github.com/jamiew/helium-discord-bot/actions/workflows/tests.yml/badge.svg)](https://github.com/jamiew/helium-discord-bot/actions/workflows/tests.yml)

# Helium Discord Bot

Display stats about Helium hotspots in your Discord server. Fun for leaderboards with friends.

Once configured, you can type:

```
hotspot stats
```

And the bot will output rolling 24 hour stats for the configured hotspots:

```
6.83  electric-metal-jaguar      @joejoe
5.49  probiotic-spanish-moose    @DanP
1.11  handsome-sanguin-chiddler  @ziggy     99 blocks behind
0.20  frothing-red-weasel        @rach
```

Similarly you can now also track [validators](https://www.helium.com/stake):

```
validator stats
```

Output is total HNT rewards for each validator:

```
VALIDATORS
34.55  gigantic-onyx-raven
141.42 innocent-cherry-yak
72.31  cold-ultraviolet-alligator
21.95  scrawny-cobalt-raven
```


## Setup

Install [nodejs](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/) and run:

```
yarn install
```

Currently expecting nodejs v14-ish. Modify `engines` in `package.json` if you want to use something else.

Then make a copy of the default `.env` file:

```
cp .env.sample .env
```

Then create a new Discord bot and get your app ID and bot token:

- Create a [Discord app](https://discord.com/developers/applications)
- Copy the `Application ID` and set `DISCORD_CLIENT_ID` in your `.env`
- Go to 'Bot' tab and add a bot for the app
- Copy the bot `token` and set `DISCORD_TOKEN` in your `.env`


Lastly, start the bot:

```
yarn start
```

You should see an OAuth URL appear in the console. Copy and open in your browser to authorize the bot with your particular Discord server.

## Running forever

You can run the bot with `yarn start`, but the bundled `forever` library will restart the bot if it crashes or disconnects. The `./server.sh` script is a wrapper around it and can be launched using:

```
SERVER_UID=helium yarn server
```

You can run multiple bots on same machine by changing `SERVER_UID`

## Add your hotspots

You can chat with the bot to add Helium addresses you want to show up.

Write `hotspot help` to see all the commands for managing owners/hotspots

```sh
hotspot stats
hotspot config

hotspot add $address $name
hotspot remove $address

owner add $address $name
owner remove $address
```

So to add [Immense Shamrock Whale](https://explorer.helium.com/hotspots/112gxJkVqJF3REaJekpjmassJGiSs2jMu9GqtnZGDbd4n6xFfvws) owned by user `your_name`:

```
hotspot add 112gxJkVqJF3REaJekpjmassJGiSs2jMu9GqtnZGDbd4n6xFfvws your_name
```

To add all hotspots associated with an account:

```
hotspot add 12ywrqqzeNFwSMvCcaohpVdiwEeK4NZChtL9rs7dhKYd85fKG9U your_name
```

## Add your validators

But wait there's more! The bot will give you your `validator stats` now too:

```
validator stats
```

Same syntax as hotspots to add/remove:

```
validator add {address}
validator remove {address}
```

## Pull requests welcome

There are some basic tests you should run first:

```
yarn test
```

This uses sample configuration data from `testConfig.json`. If you find examples that cause regressions, please add it to the list.

## Freely licensed

MIT
