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

And get ready to copy in these values...

## Add the bot to your Discord

- Create a [Discord app](https://discord.com/developers/applications)
- Copy the `Application ID` and set `DISCORD_CLIENT_ID` in your `.env`
- Create a bot for the app
- Copy the bot `token` and set `DISCORD_TOKEN` in your `.env`

Then to start:

```
yarn start
```

You should see an OAuth URL appear in the console. Open it to authorize the bot with your Discord channel.


## Add your hotspots

You can chat with the bot to add Helium addresses you want to show up.

Write `hotspot help` to see all the commands for managing owners/hotspots

```
hotspot stats
hotspot config
hotspot add {address} {name}
hotspot remove {address}
owner add {address} {name}
owner remove {address}
```

So to add [Immense Shamrock Whale](112gxJkVqJF3REaJekpjmassJGiSs2jMu9GqtnZGDbd4n6xFfvws) owned by user `your_name`:

```
hotspot add 112gxJkVqJF3REaJekpjmassJGiSs2jMu9GqtnZGDbd4n6xFfvws your_name
```

To add all hotspots associated with an account:

```
hotspot add 12ywrqqzeNFwSMvCcaohpVdiwEeK4NZChtL9rs7dhKYd85fKG9U your_name
```

## Pull requests welcome

There are some very basic tests. Basically "try running the script with sample data, hopefully it doesn't break." 

Run:

```
yarn test
```

## Freely licensed

MIT 
