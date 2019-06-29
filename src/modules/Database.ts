import config from "@config";
import deasync from "deasync";
import { MongoClient, Db } from "mongodb";

const mongo: MongoClient = deasync(MongoClient.connect)(`mongodb://${config.db.main.host}:${config.db.main.port}/${config.db.main.database}`, config.db.main.opt),
    mdb: Db = mongo.db(config.db.main.database);

export {
    mongo,
    mdb
}