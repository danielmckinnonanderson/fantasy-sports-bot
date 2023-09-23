import { EmptyPlayer, FantasyPosition, InjuryStatus, NflSeasonWeek, NflTeam, Status } from './sleeper/types';

const isInjured = (player: { injuryStatus: InjuryStatus } | EmptyPlayer): boolean => {
  if (player == null as EmptyPlayer) {
    // An empty player can't have an injury
    return false;
  }

  const healthy = player.injuryStatus === null || player.injuryStatus == "Questionable";
  return !healthy;
}

const isInactive = (player: { status: Status, availPositions: FantasyPosition[] } | EmptyPlayer): boolean => {
  if (player == null as EmptyPlayer) {
    // An empty player can't be inactive
    return false;
  }

  if (player.availPositions.includes("DEF")) {
    // Defenses are a collection of players and thus are not active or inactive
    return false;
  }

  const active = player.status === "Active";
  return !active;
}

const isOnBye = (player: { team: NflTeam } | EmptyPlayer, seasonType: "pre" | "regular" |"post", week?: NflSeasonWeek): boolean => {
  if (!week) {
    // No information on current week, so teams cannot be on bye
    return false;
  }

  if (player == null as EmptyPlayer) {
    // An empty player can't be on bye
    return false;
  }

  const onByeThisWeek = false;
  return onByeThisWeek;
}

const Predicates = {
  isInjured,
  isInactive,
  isOnBye
};


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

export { Predicates, lookupPosition };

