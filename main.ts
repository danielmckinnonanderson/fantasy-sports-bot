import { Cron } from "croner";
import GroupmeClient, { BotId } from "./src/groupme/client";
import SleeperClient from "./src/sleeper/client";
import { AllPlayers, EmptyPlayer, FantasyPosition, InjuryStatus, LeagueId, NflPlayer, NflTeam, PlayerId, Position, Status, User, UserId } from "./src/sleeper/types";
import { Predicates, lookupPosition } from "./src/utils";

let LEAGUE_ID: LeagueId = "";
let BOT_ID: BotId = "";

// Skip first two args since we don't care about path
//   to Bun or path to program
for (let i = 2; i < Bun.argv.length; i++) {
  const value = Bun.argv[i];

  switch (value) {
    case "--league-id": {
      LEAGUE_ID = Bun.argv[i + 1];
      break;
    };
    case "--bot-id": {
      BOT_ID = Bun.argv[i + 1];
      break;
    };
    default: {
      break;
    }
  }
}

// Panic if required arguments are not provided
if (LEAGUE_ID === "") {
  throw new Error("No league ID was passed to the executable!\n"
    + "Run the program again with arguments '--league-id <your league ID>'");
}

if (BOT_ID === "") {
  throw new Error("No bot ID was passed to the executable!\n"
    + "Run the program again with arguments '--bot-id <your user ID>'");
}

// Setup client & all required Sleeper data
const slpClient = new SleeperClient();
const msgClient = new GroupmeClient(BOT_ID);

// Finally, setup cron job timings
const sundayMorning = "0 11 * * 0";
const sundayPrimetime = "30 18 * * 0";
const mondayPrimetime = "15 18 * 9-12 1";
const thursPrimeTime = "15 18 * 9-12 4";

const jobs: Cron[] = [
  Cron(sundayMorning, {
    name: "Roster check Sunday at 11:00am",
    timezone: "US/Central"
  }, async () => {
      console.info("Running check...");
      await checkRosters(msgClient, slpClient);
  }),

  Cron(sundayPrimetime, {
    name: "Roster check Sunday at 6:30pm",
    timezone: "US/Central"
  }, async () => {
      console.info("Running check...");
      await checkRosters(msgClient, slpClient);
  }),

  Cron(mondayPrimetime, {
    name: "Roster check Monday at 6:15pm",
    timezone: "US/Central"
  }, async () => {
      console.info("Running check...");
      await checkRosters(msgClient, slpClient);
  }),

  Cron(thursPrimeTime, {
    name: "Roster check Thursday at 6:15pm",
    timezone: "US/Central"
  }, async () => {
      console.info("Running check...");
      await checkRosters(msgClient, slpClient);
  })
]; 

async function checkRosters(msgClient: GroupmeClient, slpClient: SleeperClient): Promise<void> {
  const nflState = await slpClient.getSportState("nfl");
  if (!nflState) {
    throw new Error("Could not get sport state for NFL");
  }

  const rosters = await slpClient.getRostersInLeague(LEAGUE_ID);
  if (!rosters) {
    throw new Error("Could not get rosters for league with ID '" + LEAGUE_ID + "'");
  }

  const users = await slpClient.getUsersInLeague(LEAGUE_ID);
  if (!users) {
    throw new Error("Could not get users in league with ID '" + LEAGUE_ID + "'");
  }

  const allPlayers = await cachedGetPlayers(slpClient);

  rosters
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
    })
    .forEach(value => {
      value.invalidStarters.empties.forEach(empty => {
        const emptyStarterText = `🕳️ ${value.username} (${value.teamName}) is not starting a player at ${empty.startingAt}! 🕳️`;
        const ok = msgClient.postBotMessage(emptyStarterText);
      });

      value.invalidStarters.injured.forEach(inj => {
        const injStarterText = `🏥 ${value.username} (${value.teamName}) is starting ${inj.player?.firstName + " " + inj.player?.lastName} (${inj.player?.injuryStatus}) at ${inj.startingAt}! 🏥`;
        const ok = msgClient.postBotMessage(injStarterText);
      });

      value.invalidStarters.inactives.forEach(inac => {
        const inacStarterText = `🚷 ${value.username} (${value.teamName}) is starting ${inac.player?.firstName + " " + inac.player?.lastName} (${inac.player?.status?.toLocaleUpperCase()}) at ${inac.startingAt}! 🚷`;
        const ok = msgClient.postBotMessage(inacStarterText);
      });

      value.invalidStarters.byes.forEach(bye => {
        const byeStarterText = `💤 ${value.username} (${value.teamName}) is starting ${bye.player?.firstName + " " + bye.player?.lastName} at ${bye.startingAt}! 💤`;
        const ok = msgClient.postBotMessage(byeStarterText);
      });
    });
}


async function cachedGetPlayers(client: SleeperClient): Promise<AllPlayers> {
  const path = "./data/all-players.json";
  const allPlayersLocal = Bun.file(path);
  const exists = await allPlayersLocal.exists();

  // TODO - more sophisticated caching logic, to refresh the value when it goes stale. Can of worms but oh well
  if (!exists) {
    const players = await client.getAllPlayers("nfl");

    if (!players) {
      throw new Error("Could not get all NFL players from Sleeper API!");
    }

    const written = await Bun.write(allPlayersLocal, JSON.stringify(players, null, 2));
    return players;
  }

  return await allPlayersLocal.json();
}

