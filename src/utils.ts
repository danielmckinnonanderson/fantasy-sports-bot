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

export default Predicates;

