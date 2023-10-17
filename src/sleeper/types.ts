export type UserId = string;
export type LeagueId = string;
export type RosterId = number;
export type DraftId = string;
export type PlayerId = string;
export type EmptyPlayer = null;
export type NoTeam = null;

export type NflSeasonWeek =
  | 1 | 2 | 3 | 4 | 5 | 6
  | 7 | 8 | 9 | 10 | 11 | 12
  | 13 | 14 | 15 | 16 | 17 | 18
  | 19 | 20;

export type NflTeam =
  | "ARI" | "ATL" | "BAL" | "BUF"
  | "CAR" | "CHI" | "CIN" | "CLE"
  | "DAL" | "DEN" | "DET" | "GB"
  | "HOU" | "IND" | "JAX" | "KC"
  | "LAC" | "LAR" | "LV"  | "MIA"
  | "MIN" | "NE"  | "NO"  | "NYG"
  | "NYJ" | "PHI" | "PIT" | "SEA"
  | "SF"  | "TB"  | "TEN" | "WAS"
  | NoTeam;

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

export type Matchup = {
  starters: PlayerId[];
  roster_id: RosterId;
  players: PlayerId[];
  matchup_id: number;
  points: number;
  custom_points: any;
  players_points: { [key: string]: number };
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

export type SportState = {
  week?: NflSeasonWeek;
  season_type: "pre" | "regular" | "post";
  season_start_date: string,
  season: "2018" | "2019" | "2020" | "2022" | "2023" | "2024" | "2025";
  previous_season?: "2018" | "2019" | "2020" | "2022" | "2023" | "2024" | "2025";
  leg?: number;
  league_season?: "2018" | "2019" | "2020" | "2022" | "2023" | "2024" | "2025";
  league_create_season?: "2018" | "2019" | "2020" | "2022" | "2023" | "2024" | "2025";
  display_week?: NflSeasonWeek;
}

export type Position = 
  | "QB" | "WR" | "RB" | "FB" | "TE"  | "C"   | "G"  | "T"
  | "NT" | "DT" | "DE" | "LB" | "ILB" | "OLB" | "CB" | "FS" | "SS"
  | "LS" | "P"  | "K";

export type FantasyPosition = "QB" | "WR" | "RB" | "TE" | "K" | "FLEX" | "DEF";

export type Status = 
  | "Active" | "Inactive" | "Injured Reserve" 
  | "Physically Unable to Perform" | "Practice Squad" 
  | "Non Football Injury" | null;

export type InjuryStatus = 
  | "IR" | "Questionable" | "Sus" 
  | "NA" | "OUT" | "PUP" | "DNR" | "Cov" | null;

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
  position: Position,
  practice_participation?: string,
  sportradar_id?: string,
  team?: NflTeam,
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

export type AllPlayers = {
  [key: PlayerId]: NflPlayer
};

