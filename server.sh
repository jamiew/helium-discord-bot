#!/bin/bash
# Helper script to start a permanent node server

source .env
forever stop "$SERVER_UID"
forever --uid "$SERVER_UID" -a start bot.js
tail -f /home/pi/.forever/${SERVER_UID}.log