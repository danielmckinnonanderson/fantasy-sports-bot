import { DataSource } from "typeorm";
import {  } from "./entities";

// TODO - creds from environment
const username = "";
const password = "";
const database = "";
const synchronize = true;

export const Datasource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username,
    password,
    database,
    synchronize,
    logging: true,
    entities: [
    
    ],
    subscribers: [],
    migrations: [],
});