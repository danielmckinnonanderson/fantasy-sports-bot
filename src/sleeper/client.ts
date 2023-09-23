import { League, LeagueId, Roster, User, UserId } from "./types";

const BASE_URL = "https://api.sleeper.app/v1";

export default class SleeperClient {
  public async getUser(userId: UserId): Promise<User | null> {
    const result = await fetch(BASE_URL + "/user/" + userId);
    return result.ok 
      ? result.json()
      : null; 
  }

  public async getLeaguesForUser(userId: UserId, year: number): Promise<League[] | null> {
    const result = await fetch(BASE_URL + "/user/" + userId + "/leagues/nfl/" + year);
    return result.ok 
      ? result.json()
      : null; 
  }

  public async getUsersInLeague(leagueId: LeagueId): Promise<User[] | null> {
    const result = await fetch(BASE_URL + "/league/" + leagueId + "/users");
    return result.ok 
      ? result.json()
      : null; 
  }

  public async getRostersInLeague(leagueId: LeagueId): Promise<Roster[] | null> {
    const result = await fetch(BASE_URL + "/league/" + leagueId + "/rosters");
    return result.ok 
      ? result.json()
      : null; 
  }

  public async getLeague(leagueId: LeagueId): Promise<League | null> {
    const result = await fetch(BASE_URL + "/league/" + leagueId);
    return result.ok 
      ? result.json()
      : null; 
  }
}

