import { Cron, scheduledJobs } from "croner";
import "reflect-metadata";
import { Bao } from "baojs";
import GroupmeClient, { BotId } from "./src/groupme/client";
import SleeperClient from "./src/sleeper/client";
import { EmptyPlayer, FantasyPosition, InjuryStatus, LeagueId, NflPlayer, NflTeam, PlayerId, Position, Status, User, UserId } from "./src/sleeper/types";
import { Predicates, lookupPosition } from "./src/utils";
import { createLogger, format, transports } from "winston";



const fmt = format.printf(({ level, message, timestamp}) => {
  return `${timestamp} [${level}] : ${message}`;
});

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.colorize(),
    fmt,
  ),
  transports: [new transports.Console()]
});

// Setup vars
logger.info("Reading config from environment...");
const { BOT_ID, LEAGUE_ID } = getConfig();
logger.info("Done loading config!");


logger.info("Starting app...");
// Create webserver
const app = new Bao();

app.get("/health", async (ctx) => {
  const resp = JSON.stringify({ "success": true, "message": "OK" });
  return ctx.sendText(resp);
});

// perform an ad-hoc check, without sending results
app.get("/check", async (ctx) => {
  logger.info("Running roster check dry-run...");
  const msgClient = new GroupmeClient(BOT_ID);
  const slpClient = new SleeperClient();

  const results = await checkRosters(msgClient, slpClient, LEAGUE_ID);

  logger.info("Roster check complete!");

  const resp = JSON.stringify({ "success": true, results});
  return ctx.sendText(resp, { status: 200 });
});

// Endpoint to perform an add-hoc check, sending results to the provided BOT_ID's group
app.post("/check", async (ctx) => {
  logger.info("Running check...");
  const msgClient = new GroupmeClient(BOT_ID);
  const slpClient = new SleeperClient();

  const results = await checkRosters(msgClient, slpClient, LEAGUE_ID);
  const sent = results.forEach(value => postMessages(msgClient, value));
  logger.info("Roster check complete!");

  const counts = count(results);

  const resp = JSON.stringify({ "success": true, counts });
  logger.debug(resp)
  return ctx.sendText(resp, { status: 200 });
});

app.listen({
  port: 3000,
});

logger.info("Listening on port 3000");

main();


async function main() {
  // Setup client & all required Sleeper data
  const slpClient = new SleeperClient();
  const msgClient = new GroupmeClient(BOT_ID);

  // Finally, setup cron job timings
  const sundayMorning = "0 11 * * 0";
  const sundayPrimetime = "30 18 * * 0";
  const mondayPrimetime = "15 18 * * 1";
  const thursPrimeTime = "15 18 * * 4";

  logger.info("Setting up cron jobs...");

  const jobs: Cron[] = [
    Cron(sundayMorning, {
      name: "Roster check Sunday at 11:00am",
      timezone: "US/Central"
    }, async () => {
        logger.info("Running check...");
        const results = await checkRosters(msgClient, slpClient, LEAGUE_ID);
        const sent = results.forEach(value => postMessages(msgClient, value));
        logger.info("Roster check complete!");
    }),

    Cron(sundayPrimetime, {
      name: "Roster check Sunday at 6:30pm",
      timezone: "US/Central"
    }, async () => {
        logger.info("Running check...");
        const results = await checkRosters(msgClient, slpClient, LEAGUE_ID);
        const sent = results.forEach(value => postMessages(msgClient, value));
        logger.info("Roster check complete!");
    }),

    Cron(mondayPrimetime, {
      name: "Roster check Monday at 6:15pm",
      timezone: "US/Central"
    }, async () => {
        logger.info("Running check...");
        const results = await checkRosters(msgClient, slpClient, LEAGUE_ID);
        const sent = results.forEach(value => postMessages(msgClient, value));
        logger.info("Roster check complete!");
    }),

    Cron(thursPrimeTime, {
      name: "Roster check Thursday at 6:15pm",
      timezone: "US/Central"
    }, async () => {
        logger.info("Running check...");
        const results = await checkRosters(msgClient, slpClient, LEAGUE_ID);
        const sent = results.forEach(value => postMessages(msgClient, value));
        logger.info("Roster check complete!");
    })
  ]; 

  logger.info("Done setting up cron jobs!");
}


function getConfig(): { BOT_ID: BotId, LEAGUE_ID: LeagueId } {
  let leagueId = "";
  let botId = "";

  // Skip first two args since we don't care about path
  //   to Bun or path to program
  for (let i = 2; i < Bun.argv.length; i++) {
    const value = Bun.argv[i];

    switch (value) {
      case "--league-id": {
        leagueId = Bun.argv[i + 1].trim();
        break;
      };
      case "--bot-id": {
        botId = Bun.argv[i + 1].trim();
        break;
      };
      default: {
        break;
      }
    }
  }

  // Panic if required arguments are not provided
  if (leagueId.length == 0) {
    logger.error("No league ID. Run the program again with `--league-id $YOUR_LEAGUE_ID`. Stopping");
    process.exit(1);
  }

  if (botId.length == 0) {
    logger.error("No bot ID. Run the program again with `--bot-id $YOUR_BOT_ID`. Stopping");
    process.exit(1);
  }

  return {
    BOT_ID: botId,
    LEAGUE_ID: leagueId 
  };
}


// Throws an error if any of the data required to check rosters cannot be fetched
async function checkRosters(msgClient: GroupmeClient, slpClient: SleeperClient, leagueId: LeagueId) {
  const nflState = await slpClient.getSportState("nfl");
  if (!nflState) {
    logger.error("Could not get sport state for NFL");
    process.exit(1);
    throw new Error("Could not get sport state for NFL");
  }

  const rosters = await slpClient.getRostersInLeague(leagueId);
  if (!rosters) {
    logger.error("Could not get rosters for league with ID '" + leagueId + "'");
    process.exit(1);
    throw new Error("Could not get rosters for league with ID '" + leagueId + "'");
  }

  const users = await slpClient.getUsersInLeague(leagueId);
  if (!users) {
    logger.error("Could not get users in league with ID '" + leagueId + "'");
    process.exit(1);
    throw new Error("Could not get users in league with ID '" + leagueId + "'");
  }

  const allPlayers = await slpClient.getAllPlayers("nfl");
  if (!allPlayers) {
    logger.error("Could not get all NFL players");
    process.exit(1);
    throw new Error("Could not get all NFL players");
  }

  return rosters
    .map(rost => { 
      return { 
        owner_id: rost.owner_id,
        starters: rost.starters
      };
    })
    .map((ownerIdStarters: { owner_id: UserId, starters: PlayerId[] })  => { 
      const user: User | undefined = users.find(user => user.user_id === ownerIdStarters.owner_id);
      const team_name: string | undefined = user?.metadata.team_name;
      const username: string | undefined = user?.display_name;

      return { 
        team_name,
        username,
        starters: ownerIdStarters.starters
      };
    })
    .map((ownerStarters: { team_name?: string, username?: string, starters: PlayerId[] }) => {
      const startingPlayers: (NflPlayer | EmptyPlayer)[] = ownerStarters.starters.map(starterId => {
        const player: NflPlayer | EmptyPlayer = allPlayers[starterId];
        return player;
      });

      return {
        teamName: ownerStarters.team_name,
        username: ownerStarters.username,
        starters: startingPlayers
      };
    })
    .map((value: { teamName?: string, username?: string, starters: (NflPlayer | EmptyPlayer)[] }) => { 
      return {
        username: value.username,
        teamName: value.teamName,
        starters: value.starters.map((player, index) => { 
          return player 
            ? {
              player: {
                firstName: player.first_name,
                lastName: player.last_name,
                injuryStatus: player.injury_status,
                status: player.status,
                availPositions: player.fantasy_positions,
              },
              startingAt: lookupPosition(index)
            }
            : {
              player: null as EmptyPlayer,
              startingAt: lookupPosition(index)
            };
        })
      };
    })
    .map(value => {
      const empties   = value.starters.filter((st) => st.player == null as EmptyPlayer);
      const injured   = value.starters.filter((st) => Predicates.isInjured(st.player as { injuryStatus: InjuryStatus } | EmptyPlayer));
      const inactives = value.starters.filter((st) => Predicates.isInactive(st.player as { status: Status, availPositions: FantasyPosition[] } | EmptyPlayer));
      const byes      = value.starters.filter((st) => Predicates.isOnBye(st.player as { team: NflTeam } | EmptyPlayer, nflState.season_type, nflState.week));

      return {
        username: value.username,
        teamName: value.teamName,
        invalidStarters: {
          empties,
          injured,
          inactives,
          byes
        }
      }
    });
}

// Side effects only. Returns value unchanged
async function postMessages( msgClient: GroupmeClient, value: any ) {
  value?.invalidStarters.empties.forEach(async (empty: { startingAt: string }) => {
    const emptyStarterText = `🕳️ ${value?.username} (${value?.teamName}) is not starting a player at ${empty.startingAt}! 🕳️`;
    logger.debug(emptyStarterText);
    const ok = await msgClient.postBotMessage(emptyStarterText);
    if (!ok) logger.error(`Could not post message for empty starter at '${empty.startingAt}'`);
  });

  value?.invalidStarters.injured.forEach(async (inj: { player?: any , startingAt: string }) => {
    const injStarterText = `🏥 ${value?.username} (${value?.teamName}) is starting ${inj.player?.firstName + " " + inj.player?.lastName} (${inj.player?.injuryStatus}) at ${inj.startingAt}! 🏥`;
    logger.debug(injStarterText);
    const ok = await msgClient.postBotMessage(injStarterText);
    if (!ok) logger.error(`Could not post message for player on bye '${inj.player?.firstName} ${inj.player?.lastName}'`);
  });

  value?.invalidStarters.byes.forEach(async (bye: { player?: any, startingAt: string }) => {
    const byeStarterText = `💤 ${value.username} (${value.teamName}) is starting ${bye.player?.firstName + " " + bye.player?.lastName} at ${bye.startingAt}! 💤`;
    logger.debug(byeStarterText);
    const ok = await msgClient.postBotMessage(byeStarterText);
    if (!ok) logger.error(`Could not post message for player on bye '${bye.player?.firstName} ${bye.player?.lastName}'`);
  });

  return value;
}

function count(rosterCheckResult: any[])  {
  let result = {
    injured: 0,
    empty: 0,
    bye: 0,
  };

  rosterCheckResult.forEach(value => {
    result.bye += value?.invalidStarters.byes.length;
    result.injured += value?.invalidStarters.injured.length;
    result.empty += value?.invalidStarters.empties.length;
  });

  return result;
}
