export type UserId = string;
export type LeagueId = string;
export type RosterId = string;
export type DraftId = string;
export type PlayerId = string;

export type User = {
  user_id: UserId,
  settings?: any,
  metadata?: any,
  league_id: LeagueId,
  is_owner: boolean,
  is_bot: boolean,
  display_name: string,
  avatar?: string;
};

export type Roster = {
  taxi: any;
  starters: string[];
  roster_id: RosterId;
  reserve: any;
  players: PlayerId[];
  player_map: any;
  owner_id: UserId;
  metadata: any;
  league_id: LeagueId;
  co_owners: any;
};

export type League = {
  total_rosters: number;
  status: string;
  sport: string;
  shard: number;
  settings: any;
  season_type: string;
  season: string;
  scoring_settings: any;
  roster_positions: string[];
  previous_league_id?: string;
  name: string;
  metadata: any;
  loser_bracket_id?: string;
  league_id: LeagueId;
  last_read_id?: string;
  last_pinned_message_id?: string;
  last_author_is_bot?: boolean;
  last_author_id?: string;
  last_author_display_name?: string;
  last_author_avatar?: string;
  group_id?: string;
  draft_id?: DraftId;
  company_id?: string;
  bracket_id?: string;
  avatar?: string;
};

export type Position = "QB" | "WR" | "RB" | "TE" | "K" | "DEF";

export type Status = "Active";

export type NflPlayer = {
  hashtag: string,
  depth_chart_position: number,
  status?: "Active",
  sport: "nfl",
  fantasy_positions: Position[],
  number?: number,
  search_last_name: string;
  injury_start_date?: string;
  weight: string,
  position: string,
  practice_participation?: string,
  sportradar_id?: string,
  team?: string,
  last_name: string,
  college?: string,
  fantasy_data_id?: string,
  injury_status?: string,
  player_id: PlayerId,
  height?: string,
  search_full_name?: string,
  age?: number,
  stats_id?: string,
  birth_country?: string,
  espn_id?: string,
  search_rank?: number,
  first_name?: string,
  depth_chart_order?: number,
  years_exp?: number,
  rotowire_id?: string,
  rotoworld_id?: string,
  search_first_name?: string,
  yahoo_id?: string,
};

