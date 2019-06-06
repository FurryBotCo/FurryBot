const config = require("./config");
const os = require("os");

class FurryBotServer {
	constructor(cnf) {
		this.config = config;
		this.cnf = cnf || config.serverOptions;
		this.express = require("express");
		this.logger = require("morgan");
		this.https = require("https");
		this.fs = require("fs");
		this.MongoClient = require("mongodb").MongoClient;

		this.bodyParser = require("body-parser");
		//this.ro = require("rethinkdbdash")(config.db.other);
	}

	async load(client) {
		this.mdb = await this.MongoClient.connect(`mongodb://${config.db.main.host}:${config.db.main.port}/${config.db.main.database}`, config.db.main.opt).then(res => res.db(config.db.main.db));
		this.server = this.express();
		const checkAuth = ((req, res, next) => {
			if (!next) return !((!req.headers.authorization || req.headers.authorization !== config.serverOptions.apiKey) && (!req.query.auth || req.query.auth !== config.serverOptions.apiKey));
			if ((!req.headers.authorization || req.headers.authorization !== config.serverOptions.apiKey) && (!req.query.auth || req.query.auth !== config.serverOptions.apiKey)) return res.status(401).json({
				success: false,
				error: "invalid credentials"
			});
			next();
		});
		//process.stdout.on("data",(d) => client.bot.logger.log(d));
		//process.stderr.on("data",(e) => client.bot.logger.error(e));
		const {
			default: chalk
		} = require("chalk");
		this.server.use(async (req, res, next) => {
				// return res.status(403).json({success:false,error:"invalid credentials"});
				next();
			})
			/*.use(this.logger("dev",{
				stream: process.stdout
			}))*/
			// logger
			// :method :url :status :response-time ms - :res[content-length]
			.use(async (req, res, next) => {
				const s = process.hrtime();
				res.on("finish", () => {
					const t = process.hrtime(s);
					const m = t[0] * 1000 + t[1] / 1e6;
					client.logger.debug(`Webserver: ${chalk.red(req.method.toUpperCase())} ${chalk.green(req.originalUrl)} ${chalk.yellow(res.statusCode)} ${chalk.blue(`${m}ms`)}`);
				});
				return next();
			})
			.use(this.bodyParser.json())
			.use(this.bodyParser.urlencoded({
				extended: true
			}))
			.get("/stats", async (req, res) => {
				client.bot.trackEvent({
					group: "WEBSERVER",
					event: "web.request.stats",
					properties: {
						bot: {
							version: config.bot.version,
							beta: config.beta,
							alpha: config.alpha,
							server: os.hostname()
						}
					}
				});
				let d, date, a, dailyJoins;
				d = new Date();
				date = `${d.getMonth().toString().length > 1 ? d.getMonth()+1 : `0${d.getMonth()+1}`}-${d.getDate().toString().length > 1 ? d.getDate() : `0${d.getDate()}`}-${d.getFullYear()}`;
				a = await this.mdb.collection("dailyjoins").findOne({
					id: date
				});
				dailyJoins = a !== null ? a.count : null || null;
				return res.status(200).json({
					success: true,
					clientStatus: client.bot.guilds.get(config.bot.mainGuild).members.get(client.bot.user.id).status,
					guildCount: client.bot.guilds.size,
					userCount: client.bot.guilds.map(g => g.memberCount).reduce((a, b) => a + b),
					shardCount: client.bot.shards.size,
					memoryUsage: {
						process: {
							used: client.bot.memory.process.getUsed(),
							total: client.bot.memory.process.getTotal()
						},
						system: {
							used: client.bot.memory.system.getUsed(),
							total: client.bot.memory.system.getTotal()
						}
					},
					largeGuildCount: client.bot.guilds.filter(g => g.large).length,
					apiVersion: config.bot.apiVersion,
					botVersion: config.bot.version,
					library: config.bot.library,
					libraryVersion: config.bot.libraryVersion,
					nodeVersion: process.version,
					dailyJoins,
					commandCount: client.bot.commandList.length,
					messageCount: 0,
					dmMessageCount: 0
				});
			})
			.get("/stats/ping", async (req, res) => {
				client.bot.trackEvent({
					group: "WEBSERVER",
					event: "web.request.stats.ping",
					properties: {
						bot: {
							version: config.bot.version,
							beta: config.beta,
							alpha: config.alpha,
							server: os.hostname()
						}
					}
				});
				return res.status(200).json({
					success: true,
					ping: Math.floor(client.bot.shards.map(s => s.latency).reduce((a, b) => a + b) / client.bot.shards.size)
				});
			})
			.get("/commands", async (req, res) => {
				client.bot.trackEvent({
					group: "WEBSERVER",
					event: "web.request.commands",
					properties: {
						bot: {
							version: config.bot.version,
							beta: config.beta,
							alpha: config.alpha,
							server: os.hostname()
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
						let cc = Object.assign({}, cmd);
						delete cc.run;
						cmds[category.name.toLowerCase()][cmd.triggers[0]] = cc;
					});
				});
				return res.status(200).json({
					success: true,
					list: cmds
				});
			})
			.get("/status", async (req, res) => {
				client.bot.trackEvent({
					group: "WEBSERVER",
					event: "web.request.status",
					properties: {
						bot: {
							version: config.bot.version,
							beta: config.beta,
							alpha: config.alpha,
							server: os.hostname()
						}
					}
				});
				return res.status(200).json({
					success: true,
					clientStatus: client.bot.guilds.get(config.bot.mainGuild).members.get(client.bot.user.id).status
				});
			})
			.get("/checkauth", checkAuth, async (req, res) => {
				client.bot.trackEvent({
					group: "WEBSERVER",
					event: "web.request.checkauth",
					properties: {
						bot: {
							version: config.bot.version,
							beta: config.beta,
							alpha: config.alpha,
							server: os.hostname()
						}
					}
				});
				return res.status(200).json({
					success: true
				});
			})

			// guilds section
			.get("/guilds", async (req, res) => {
				client.bot.trackEvent({
					group: "WEBSERVER",
					event: "web.request.guilds",
					properties: {
						bot: {
							version: config.bot.version,
							beta: config.beta,
							alpha: config.alpha,
							server: os.hostname()
						}
					}
				});
				let jsn = {
					success: true,
					guildCount: client.bot.guilds.size
				};
				if (checkAuth(req, res, false)) {
					jsn.guilds = client.bot.guilds.map(g => ({
						[g.id]: {
							name: g.name,
							memberCount: g.memberCount
						}
					}));
				}
				res.status(200).json(jsn);
			})
			.get("/guilds/:id/shard", checkAuth, async (req, res) => {
				client.bot.trackEvent({
					group: "WEBSERVER",
					event: "web.request.guilds.id.shard",
					properties: {
						bot: {
							version: config.bot.version,
							beta: config.beta,
							alpha: config.alpha,
							server: os.hostname()
						}
					}
				});
				if (!client.bot.guilds.has(req.params.id)) return res.status(404).json({
					success: false,
					error: "invalid guild id"
				});
				return res.status(200).json({
					success: true,
					shardId: client.bot.guilds.get(req.params.id).shard.id,
					shardCount: client.bot.shards.size
				});
			})
			.get("/shorturl/:identifier", async (req, res) => {
				client.bot.trackEvent({
					group: "WEBSERVER",
					event: "web.request.shorturl",
					properties: {
						bot: {
							version: config.bot.version,
							beta: config.beta,
							alpha: config.alpha,
							server: os.hostname()
						}
					}
				});
				const s = await client.bot.mdb.collection("shorturl").findOne({
					id: req.params.identifier
				});
				if (!s) return res.status(404).json({
					success: false,
					error: "invalid short code"
				});
				return res.status(200).json(s);
			})
			.post("/vote/dbl", async (req, res) => {
				if (!req.headers["authorization"] || req.headers["authorization"] !== config.universalKey) return res.status(401).json({
					success: false,
					error: "unauthorized"
				});
				if (req.body.bot !== "398251412246495233") return res.status(400).json({
					success: false,
					error: "invalid bot"
				});
				let data, embed, user;
				switch (req.body.type.toLowerCase()) {
					case "upvote":
						client.bot.trackEvent({
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
						user = await client.bot.mdb.collections("users").findOne({
							id: req.body.user
						});
						if (req.body.isWeekend) {
							await client.bot.mdb.collections("users").findOneAndUpdate({
								id: req.body.user
							}, {
								$set: {
									bal: user.bal + 1000
								}
							});
							data = {
								title: "Thanks For Upvoting!",
								description: `As a reward for upvoting on Discord Bots, you earned 1000 ${config.emojis.owo}\nWeekend Voting, Double ${config.emojis.owo}!`,
								color: 65535
							};
						} else {
							await client.bot.mdb.collections("users").findOneAndUpdate({
								id: req.body.user
							}, {
								$set: {
									bal: user.bal + 500
								}
							});
							data = {
								title: "Thanks For Upvoting!",
								description: `As a reward for upvoting on Discord Bots, you earned 500 ${config.emojis.owo}`,
								color: 65535
							};
						}
						embed = new client.bot.Discord.MessageEmbed(data);
						await client.bot.users.get(req.body.user).send(embed);
						break;

					case "test":
						client.bot.trackEvent({
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
						client.bot.logger.log(`Test DBL Vote: ${req.body}`);
						break;
				}
			})
			.post("/dev/eval", checkAuth, async (req, res) => {
				client.bot.trackEvent({
					group: "WEBSERVER",
					event: "web.request.dev.eval",
					properties: {
						bot: {
							version: config.bot.version,
							beta: config.beta,
							alpha: config.alpha,
							server: os.hostname()
						}
					}
				});
				console.log(req.body);
				if (!req.body.code) return res.status(400).json({
					success: false,
					message: "missing code"
				});
				for (let b of config.evalBlacklist) {
					if (b.test(req.body.code)) return res.status(400).json({
						success: false,
						message: "blacklisted code found"
					});
				}
				const start = client.bot.performance.now(),
					result = await eval(req.body.code),
					end = client.bot.performance.now();
				return res.status(200).json({
					success: true,
					result,
					time: (end - start).toFixed(3)
				});
			});
		if (![undefined, null, ""].includes(this.cnf.ssl) && this.cnf.ssl === true) {
			if (this.cnf.port === 80) throw new Error("ssl server cannot be ran on insecure port");
			let privateKey = this.fs.readFileSync(`${config.rootDir}/ssl/ssl.key`);
			let certificate = this.fs.readFileSync(`${config.rootDir}/ssl/ssl.crt`);

			return this.https.createServer({
				key: privateKey,
				cert: certificate
			}, this.server).listen(this.cnf.port, this.cnf.bindIp, (() => client.bot.logger.log("webserver listening")));
		} else {
			return this.server.listen(this.cnf.port, this.cnf.bindIp, (() => client.bot.logger.log("webserver listening")));
		}
	}
}

module.exports = FurryBotServer;