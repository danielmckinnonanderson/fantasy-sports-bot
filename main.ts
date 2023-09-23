import SleeperClient from "./src/sleeper/client";
import { FantasyPosition, LeagueId, NflPlayer, Position, User, UserId } from "./src/sleeper/types";

const EmptyPlayer: null = null;
let LEAGUE_ID: LeagueId = "";
let USER_ID: UserId = "";

// Skip first two args since we don't care about path
//   to Bun or path to program
for (let i = 2; i < Bun.argv.length; i++) {
  const value = Bun.argv[i];

  switch (value) {
    case "--league-id": {
      LEAGUE_ID = Bun.argv[i + 1];
      break;
    };
    case "--user-id": {
      USER_ID = Bun.argv[i + 1];
      break;
    };
    default: {
      break;
    }
  }
}

if (LEAGUE_ID === "") {
  throw new Error("No league ID was passed to the executable!\n"
    + "Run the program again with arguments '--league-id <your league ID>'");
}

if (USER_ID === "") {
  throw new Error("No user ID was passed to the executable!\n"
    + "Run the program again with arguments '--user-id <your user ID>'");
}

const client = new SleeperClient();

const rosters = await client.getRostersInLeague(LEAGUE_ID);
if (!rosters) {
  throw new Error("Could not get rosters for league with ID '" + LEAGUE_ID + "'");
}

const users = await client.getUsersInLeague(LEAGUE_ID);
if (!users) {
  throw new Error("Could not get users in league with ID '" + LEAGUE_ID + "'");
}

const allPlayers = await client.getAllPlayers("nfl");
if (!allPlayers) {
  throw new Error("Could not get all NFL players");
}

rosters
  .map(rost => { return { 
    owner_id: rost.owner_id,
    starters: rost.starters
  }})
  .map(ownerIdStarters  => { 
    const user: User | undefined = users.find(user => user.user_id === ownerIdStarters.owner_id);
    const team_name: string | undefined = user?.metadata.team_name;
    const username: string | undefined = user?.display_name;

    return { 
      team_name,
      username,
      starters: ownerIdStarters.starters
    };
  })
  .map(ownerStarters => {
    const startingPlayers: (NflPlayer | null)[] = ownerStarters.starters.map(starterId => {
      const player: NflPlayer | null = allPlayers[starterId];
      return player;
    });

    return {
      teamName: ownerStarters.team_name,
      username: ownerStarters.username,
      starters: startingPlayers
    };
  })
  .map(value => { 
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
            player: EmptyPlayer,
            startingAt: lookupPosition(index)
          };
      })
    };
  })
  .map(result => console.info(result));



// TODO - Make generic per note below
//
// Starting positions are dependent on the league. This is a quick & dirty
//   alternative to looking up the settings from the league_settings object.
function lookupPosition(starterIndex: number): FantasyPosition {
  switch (starterIndex) {
    case 0: return "QB";
    case 1:
    case 2: return "RB";
    case 3:
    case 4:
    case 5: return "WR";
    case 6: return "TE";
    case 7:
    case 8: return "FLEX";
    case 9: return "K";
    case 10: return "DEF";
    default: throw new Error("Tried to get a starter index which was not present given the amount of starters!");
  }
}

