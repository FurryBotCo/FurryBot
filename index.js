const { Master: Sharder } = require("eris-sharder"),
	config = require("./config"),
	deasync = require("deasync"),
	//{ MongoClient } = require("mongodb"),
	//mongo = deasync(MongoClient.connect)(`mongodb://${config.db.main.host}:${config.db.main.port}/${config.db.main.database}`,config.db.main.opt),
	//mdb = mongo.db(config.db.main.database),
	master = new Sharder(config.bot.token,"/FurryBot.js",config.bot.options);

master.on("stats", async(res) => {
	//await mdb.collection("stats").findOneAndDelete({id: 1});
	//await mdb.collection("stats").insertOne(Object.assign({id: 1}, res));
});