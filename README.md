# Session Summary Command on Stream for Age of Empires II: Definitive Edition
1. This is an API for displaying session summary information of a player for the game AoE2:DE. It will diplay this information for games played in the last 6 hours (or more, if you play continuously for longer)
2. The API can be used by this link: https://alian713-twitch-commands.herokuapp.com/session

# URL Parameters

  1. `command`: `start` or `end` tracking the session.
  2. `steam_id`: steam id of the player to track the session for.

# Usage on Twitch with Nightbot:
`!addcom !session $(urlfetch https://alian713-twitch-commands.herokuapp.com/techtree?command=$(querystring)&steam_id=<your steam id>)`

Example outputs:

`RM elo change: 15, wins: 6, losses: 4 || TRM elo change: 13, wins: 2, losses: 2`

# Notes

1. The firebase file used in this app isn't included in the repo
