import config from "../config";
import { Database as DB } from "bot-stuff";

const db = DB(config.db.host, config.db.port, config.db.database, config.db.opt);

export = db;
