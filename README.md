# fantasy-sports-bot

An async web-server fantasy football bot, for running checks on starters in a Sleeper league and messaging your group on GroupMe.

Will run its roster-checks and message your group on a Cron schedule a few hours before games.

Additionally exposes three endpoints that can be curl'ed if you need to manually run a check or post a message:
`GET /health` - Simple heartbeat endpoint.
`GET /check` - Perform a dry-run roster check, returning the results of the check without sending a message.
`POST /check` - Perform an ad-hoc roster-check, messaging your group with the results.

In order to use this in a group, you must create a bot on the GroupMe developer website.
The GroupMe `bot_id`, along with your Sleeper league ID must be passed as arguments to the program.

WIP - Integration w/ database to track your league's all-time matchup history.


To install dependencies:

```bash
bun install
```

To build an executable:

```bash
bun run build
```

To run your built executable:
```bash
cd build
./ff-bot --league-id $YOUR_LEAGUE_ID --bot-id $YOUR_BOT_ID
```


Tested on Linux & Windows via WSL.
Linux works without issue, logging timestamps on Windows is broken but otherwise everything works fine.

This project was created using `bun init` in bun v1.0.3. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

