import config from "../config";
import DB from "@donovan_dmc/db";

const db = DB(config.db.host, config.db.port, config.db.database, config.db.opt);

export = db;
