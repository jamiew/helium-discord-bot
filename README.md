[![Test suite](https://github.com/jamiew/helium-discord-bot/actions/workflows/tests.yml/badge.svg)](https://github.com/jamiew/helium-discord-bot/actions/workflows/tests.yml)

# Helium Discord Bot

Display stats about Helium hotspots in your Discord server. Fun for leaderboards with friends.

If you'd like to add this bot to your server, [visit this link](https://discord.com/oauth2/authorize?client_id=867127109470257164&scope=bot) - or use this repository to host your own.

This hosted bot is **very beta and subject to bugs and downtime**. If you see issues, please message @jamiedubs#0001 on Discord or file an issue in this repository.

Enjoying this bot? HNT tips are always appreciated: `133pR1mh1E8AMoPffWWNtFr7eyddpr8wjLs4hSQJJhCcyop7e9q`

![QR code for author's HNT wallet](https://dl.dropboxusercontent.com/s%2Fqrxg5wlnijeyitq%2Fscreen%2520shot%25202021-09-13%2520at%252010-47-50%2520account%2520133pr1mh1e8amopffwwntfr7eyddpr8wjls4hsqjjhccyop7e9q%2520%2520helium%2520explorer.png)

## Usage

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

And lastly, there's a `hotspot activity` command that will debug recent beacons, witnesses & other events:

```
hotspot activity slow-burgundy-mandrill
```
![](https://dl.dropboxusercontent.com/s%2F45qf9hej0slkg3v%2Fscreen%2520shot%25202021-08-21%2520at%252010-42-16%2520hotspots%2520%2528dev%2529%2520-%2520discord.png)


## Run your own bot

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
hotspot activity ($address|$magic-animal-name)

owner add $address $name
owner remove $address

validator stats
validator add $address $name
validator remove $address
```

So to add [Immense Shamrock Whale](https://explorer.helium.com/hotspots/112gxJkVqJF3REaJekpjmassJGiSs2jMu9GqtnZGDbd4n6xFfvws) owned by user `your_name`:

```
hotspot add 112gxJkVqJF3REaJekpjmassJGiSs2jMu9GqtnZGDbd4n6xFfvws your_name
```

To add all hotspots associated with an account:

```
hotspot add 12ywrqqzeNFwSMvCcaohpVdiwEeK4NZChtL9rs7dhKYd85fKG9U your_name
```

Check the last 24 hours of activity using a hotspot address or the hotspot name with hyphens!

```
hotspot activity 112gxJkVqJF3REaJekpjmassJGiSs2jMu9GqtnZGDbd4n6xFfvws
hotspot activity immense-shamrock-whale
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
