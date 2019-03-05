const config = require("../config"),
	deasync = require("deasync"),
	{ MongoClient } = require("mongodb"),
	mongo = deasync(MongoClient.connect)(`mongodb://${config.db.main.host}:${config.db.main.port}/${config.db.main.database}`,config.db.main.opt),
	mdb = mongo.db(config.db.main.database),
	{ checkAuth } = require("./functions"),
	express = require("express"),
	fs = require("fs"),
	logger = require("morgan"),
	bodyParser = require("body-parser"),
	app = express();

app.use(logger("dev"))
	.use(bodyParser.json())
	.use(bodyParser.urlencoded({
		extended: true
	}));