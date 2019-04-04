const config = require("./config");

class FurryBotServer {
	constructor(cnf) {
		this.config = config;
		this.cnf = cnf || this.config.serverOptions;
		this.express = require("express");
		this.logger = require("morgan");
		this.https = require("https");
		this.fs = require("fs");
		this.MongoClient = require("mongodb").MongoClient;
		
		this.bodyParser = require("body-parser");
		//this.ro = require("rethinkdbdash")(this.config.db.other);
	}

	async load(client) {
		this.mdb = await this.MongoClient.connect(`mongodb://${this.config.db.main.host}:${this.config.db.main.port}/${this.config.db.main.database}`,this.config.db.main.opt).then(res => res.db(this.config.db.main.db));
		this.server = this.express();
		const checkAuth = ((req,res,next) => {
			if(!next) return !((!req.headers.authorization || req.headers.authorization !== this.config.serverOptions.apiKey) && (!req.query.auth || req.query.auth !== this.config.serverOptions.apiKey));
			if((!req.headers.authorization || req.headers.authorization !== this.config.serverOptions.apiKey) && (!req.query.auth || req.query.auth !== this.config.serverOptions.apiKey)) return res.status(401).json({
				success: false,
				error: "invalid credentials"
			});
			next();
		});
		this.server.use(async(req,res,next) => {
			// return res.status(403).json({success:false,error:"invalid credentials"});
			next();
		})
			.use(this.logger("dev"))
			.use(this.bodyParser.json())
			.use(this.bodyParser.urlencoded({
				extended: true
			}))
			.get("/stats",async(req,res) => {
				client.trackEvent({
					group: "WEBSERVER",
					event: "web.request.stats",
					properties: {
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: require("os").hostname()
						}
					}
				});
				let d, date, a, dailyJoins;
				d = new Date();
				date = `${d.getMonth().toString().length > 1 ? d.getMonth()+1 : `0${d.getMonth()+1}`}-${d.getDate().toString().length > 1 ? d.getDate() : `0${d.getDate()}`}-${d.getFullYear()}`;
				a = await this.mdb.collection("dailyjoins").findOne({id: date});
				dailyJoins = a !== null ? a.count : null|| null;
				return res.status(200).json({
					success: true,
					clientStatus: client.guilds.get(this.config.bot.mainGuild).members.get(client.user.id).status,
					guildCount: client.guilds.size,
					userCount: client.guilds.map(g => g.memberCount).reduce((a,b) => a + b),
					shardCount: client.shards.size,
					memoryUsage: {
						process: {
							used: client.memory.process.getUsed(),
							total: client.memory.process.getTotal()
						},
						system: {
							used: client.memory.system.getUsed(),
							total: client.memory.system.getTotal()
						}
					},
					largeGuildCount: client.guilds.filter(g => g.large).length,
					apiVersion: this.config.bot.apiVersion,
					botVersion: this.config.bot.version,
					library: this.config.bot.library,
					libraryVersion: this.config.bot.libraryVersion,
					nodeVersion: process.version,
					dailyJoins,
					commandCount: client.commandList.length,
					messageCount: await client.mongo.db("analytics").collection(this.config.db.main.database).find({event:"client.events.message"}).count(),
					dmMessageCount: await client.mongo.db("analytics").collection(this.config.db.main.database).find({event:"client.events.message.directMessage"}).count()
				});
			})
			.get("/stats/ping",async(req,res) => {
				client.trackEvent({
					group: "WEBSERVER",
					event: "web.request.stats.ping",
					properties: {
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: require("os").hostname()
						}
					}
				});
				return res.status(200).json({
					success: true,
					ping: Math.floor(client.shards.map(s => s.latency).reduce((a,b) => a + b) / client.shards.size)
				});
			})
			.get("/commands",async(req,res) => {
				client.trackEvent({
					group: "WEBSERVER",
					event: "web.request.commands",
					properties: {
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: require("os").hostname()
						}
					}
				});
				const commands = require("./commands");
				let cmds = {};

				commands.map(c => c.name.toLowerCase()).forEach((c) => {
					cmds[c] = {};
				});

				commands.map(c => c.commands).forEach((cmd) => {
					cmd.forEach((c) => {

					});
				});
				commands.forEach((category) => {
					category.commands.forEach((cmd) => {
						let cc = Object.assign({},cmd);
						delete cc.run;
						cmds[category.name.toLowerCase()][cmd.triggers[0]] = cc;
					});
				});
				return res.status(200).json({success:true,list:cmds});
			})
			.get("/status",async(req,res) => {
				client.trackEvent({
					group: "WEBSERVER",
					event: "web.request.status",
					properties: {
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: require("os").hostname()
						}
					}
				});
				return res.status(200).json({
					success: true,
					clientStatus: client.guilds.get(this.config.bot.mainGuild).members.get(client.user.id).status
				});
			})
			.get("/checkauth",checkAuth,async(req,res) => {
				client.trackEvent({
					group: "WEBSERVER",
					event: "web.request.checkauth",
					properties: {
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: require("os").hostname()
						}
					}
				});
				return res.status(200).json({success:true});
			})

		// guilds section
			.get("/guilds",async(req,res) => {
				client.trackEvent({
					group: "WEBSERVER",
					event: "web.request.guilds",
					properties: {
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: require("os").hostname()
						}
					}
				});
				let jsn = {
					success: true,
					guildCount: client.guilds.size
				};
				if(checkAuth(req,res,false)) {
					jsn.guilds = client.guilds.map(g => ({[g.id]:{name:g.name,memberCount:g.memberCount}}));
				}
				res.status(200).json(jsn);
			})
			.get("/guilds/:id/shard",checkAuth,async(req,res) => {
				client.trackEvent({
					group: "WEBSERVER",
					event: "web.request.guilds.id.shard",
					properties: {
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: require("os").hostname()
						}
					}
				});
				if(!client.guilds.has(req.params.id)) return res.status(404).json({
					success: false,
					error: "invalid guild id"
				});
				return res.status(200).json({
					success: true,
					shardId: client.guilds.get(req.params.id).shard.id,
					shardCount: client.shards.size
				});
			})
			.get("/shorturl/:identifier",async(req,res) => {
				client.trackEvent({
					group: "WEBSERVER",
					event: "web.request.shorturl",
					properties: {
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: require("os").hostname()
						}
					}
				});
				const s = await client.mdb.collection("shorturl").findOne({id: req.params.identifier});
				if(!s) return res.status(404).json({success: false, error: "invalid short code"});
				return res.status(200).json(s);
			})
			.post("/vote/dbl",async(req,res) => {
				if(!req.headers["authorization"] || req.headers["authorization"] !== this.config.universalKey) return res.status(401).json({success: false, error: "unauthorized"});
				if(req.body.bot !== "398251412246495233") return res.status(400).json({success: false, error: "invalid bot"});
				let data, embed, user;
				switch(req.body.type.toLowerCase()) {
				case "upvote":
					client.trackEvent({
						group: "WEBSERVER",
						event: "upvote.dbl",
						properties: {
							bot: req.body.bot,
							user: req.body.user,
							type: req.body.type,
							isWeekend: req.body.isWeekend,
							query: req.body.query
						}
					});
					user = await client.mdb.collections("users").findOne({id: req.body.user});
					if(req.body.isWeekend) {
						await client.mdb.collections("users").findOneAndUpdate({id: req.body.user},{$set:{bal: user.bal + 1000}});
						data = {
							title: "Thanks For Upvoting!",
							description: `As a reward for upvoting on Discord Bots, you earned 1000 ${this.config.emojis.owo}\nWeekend Voting, Double ${this.config.emojis.owo}!`,
							color: 65535
						};
					} else {
						await client.mdb.collections("users").findOneAndUpdate({id: req.body.user},{$set:{bal: user.bal + 500}});
						data = {
							title: "Thanks For Upvoting!",
							description: `As a reward for upvoting on Discord Bots, you earned 500 ${this.config.emojis.owo}`,
							color: 65535
						};
					}
					embed = new client.Discord.MessageEmbed(data);
					await client.users.get(req.body.user).send(embed);
					break;

				case "test":
					client.trackEvent({
						group: "WEBSERVER",
						event: "upvote.dbl.test",
						properties: {
							bot: req.body.bot,
							user: req.body.user,
							type: req.body.type,
							isWeekend: req.body.isWeekend,
							query: req.body.query
						}
					});
					client.logger.log(`Test DBL Vote: ${req.body}`);
					break;
				}
			})
			.post("/dev/eval",checkAuth,async(req,res) => {
				client.trackEvent({
					group: "WEBSERVER",
					event: "web.request.dev.eval",
					properties: {
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: require("os").hostname()
						}
					}
				});
				console.log(req.body);
				if(!req.body.code) return res.status(400).json({ success: false, message: "missing code" });
				for(let b of  this.config.evalBlacklist) {
					if(b.test(req.body.code)) return res.status(400).json({ success: false, message: "blacklisted code found"});
				}
				const start = client.performance.now(),
					result = await eval(req.body.code),
					end = client.performance.now();
				return res.status(200).json({ success: true, result, time: (end-start).toFixed(3) });
			});
		if(![undefined,null,""].includes(this.cnf.ssl) && this.cnf.ssl === true) {
			if(this.cnf.port === 80) throw new Error("ssl server cannot be ran on insecure port");
			let privateKey = this.fs.readFileSync(`${this.config.rootDir}/ssl/ssl.key`);
			let certificate = this.fs.readFileSync(`${this.config.rootDir}/ssl/ssl.crt`);

			return this.https.createServer({
				key: privateKey,
				cert: certificate
			}, this.server).listen(this.cnf.port,this.cnf.bindIp,(() => client.logger.log("webserver listening")));
		} else {
			return this.server.listen(this.cnf.port,this.cnf.bindIp,(() => client.logger.log("webserver listening")));
		}
	}
}

module.exports = FurryBotServer;