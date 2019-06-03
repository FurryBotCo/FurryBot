const config = require("../config"),
	deasync = require("deasync"),
	{ MongoClient } = require("mongodb"),
	mongo = deasync(MongoClient.connect)(`mongodb://${config.db.main.host}:${config.db.main.port}/${config.db.main.database}`,config.db.main.opt),
	mdb = mongo.db(config.db.main.database);

module.exports = {
	MongoClient,
	mongo,
	mdb
};
