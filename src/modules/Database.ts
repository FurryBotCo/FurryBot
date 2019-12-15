import config from "../config";
import DB from "../util/db";

const db = new DB(config.db.host, config.db.port, config.db.database, config.db.opt, config.beta);

const mdb = db.mdb;
const mongo = db.mongo;

export { mdb };
export { mongo };
export { db };
export default db;
