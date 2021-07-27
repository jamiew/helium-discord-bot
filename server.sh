#!/bin/bash
# Helper script to start a permanent node server

source .env

if [ -z $SERVER_UID ]; then
  echo "$0: export SERVER_UID e.g. 'helium'"
  exit 1
fi

echo "SERVER_UID=$SERVER_UID"
yarn run forever stop "$SERVER_UID"
yarn run forever --uid "$SERVER_UID" -a start bot.js
tail -F $HOME/.forever/${SERVER_UID}.log
