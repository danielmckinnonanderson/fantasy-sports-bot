import SleeperClient from "./src/sleeper/client";
import { LeagueId, User, UserId } from "./src/sleeper/types";

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

rosters
  .map(rost => { return { 
    owner_id: rost.owner_id,
    starters: rost.starters
  }})
  .map(obj  => { 
    const user: User | undefined = users.find(user => user.user_id === obj.owner_id);
    const team_name: string | undefined = user?.metadata.team_name;
    const username: string | undefined = user?.display_name;

    return { 
      team_name,
      username,
      starters: obj.starters
  }})
  .map(result => console.info(result));


