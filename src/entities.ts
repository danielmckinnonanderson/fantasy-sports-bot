import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { NflSeasonWeek } from './sleeper/types';

type MatchupID = number;

type FantasySeason =
    | 2009 | 2010 | 2011 | 2012
    | 2013 | 2014 | 2015 | 2016
    | 2017 | 2018 | 2019 | 2020
    | 2022 | 2023 | 2024 | 2025
    | 2026 | 2027 | 2028 | 2029;

// Database entity representing a completed matchup for
//  a given week.
@Entity()
export default class WeeklyMatchup {

    @PrimaryGeneratedColumn("identity") id!: MatchupID;

    // TODO - schema
    @Column() ownerA!: string;
    @Column() teamA!: string;
    @Column("float") pointsA!: number;

    @Column() ownerB!: string;
    @Column() teamB!: string;
    @Column("float") pointsB!: number;

    @Column("string") season!: FantasySeason;
    @Column("int8") week!: NflSeasonWeek;
    @Column("string") seasonType!: "regular" | "post"

    @Column("string") specialMatchup!: "playoffs" | "championship" | "loserbracket" | "toiletbowl" | null;

    @Column() teamAWon!: boolean;
}

