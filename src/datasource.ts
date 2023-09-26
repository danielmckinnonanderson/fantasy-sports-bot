import { DataSource } from "typeorm";
import WeeklyMatchup from "./entities";

// TODO - creds from environment
const username = "user";
const password = "password";
const database = "test-db";
const synchronize = true;

export const Datasource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username,
    password,
    database,
    synchronize,
    logging: true,
    entities: [
      WeeklyMatchup
    ],
    subscribers: [],
    migrations: [],
});
