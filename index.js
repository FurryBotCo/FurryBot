const BaseClient = require("./util/BaseClient"),
	config = require("./config");

/**
  * Main Class
  *	@contructor
  * @param {clientOptions} options - Object of options to pass to parent.
  * @extends BaseClient
  * @see {@link https://discord.js.org/#/docs/master/typedef/ClientOptions|ClientOptions}
  * @see {@link https://discord.js.org/#/docs/master/class/Client|Discord.Client}
  */
class FurryBot extends BaseClient {
	constructor(options) {
		var opt = options || {};
		super(opt);
		this.commands = require("./commands");
		this.responses = require("./responses");
		this.categories = require("./commands")
		this.commandList = this.commands.map(c => c.commands.map(cc => cc.triggers)).reduce((a,b) => a.concat(b)).reduce((a,b) => a.concat(b));
		this.responseList = this.responses.map(r => r.triggers).reduce((a,b) => a.concat(b));
		this.categoryList = this.categories.map(c => c.name);
		this.commandTimeout = {};
		this.commandList.forEach((cmd) => {
			this.commandTimeout[cmd] = new Set();
		});
		this.responseList.forEach((resp) => {
			this.commandTimeout[resp] = new Set();
		});
		this.analytics = new (require("analytics-node"))(this.config.apis.segment.writeKey);
		/*this.webhooks = {};
		for(let key in this.config.webhooks) {
			this.webhooks[key] = new this.Discord.WebhookClient(this.config.webhooks[key].id,this.config.webhooks[key].token,{disableEveryone:true});
			console.debug(`Setup ${key} webhook`);
		}*/
		this.load.apply(this);
	}
	
	/**
	  * Load Function
	  */
	async load() {
		for(let w in this.config.bot.webhooks) {
			this.config.bot.webhooks[w].hook = new this.Discord.WebhookClient(
				this.config.bot.webhooks[w].id,
				this.config.bot.webhooks[w].token,
				{
					disableEveryone: true
				})
		}
		this.mongo = await this.MongoClient.connect(`mongodb://${this.config.db.main.host}:${this.config.db.main.port}/${this.config.db.main.database}`,this.config.db.main.opt);
		this.mdb = this.mongo.db(this.config.db.main.database);
		console.log("[loadEvent]: start load");
		this.analytics.track({
			userId: "CLIENT",
			event: "client.load",
			properties: {
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.os.hostname()
				}
			}
		});
		this.fs.readdir(`${process.cwd()}/handlers/events/Client/`, (err, files) => {
			if (err) return console.error(err);
			files.forEach(file => {
				if (!file.endsWith(".js")) return;
				const event = require(`./handlers/events/Client/${file}`),
					eventName = file.split(".")[0];
				this.on(eventName, event.bind(this));
				this.analytics.track({
					userId: "CLIENT",
					event: `events.${eventName}.load`,
					properties: {
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: this.os.hostname()
						}
					}
				});
				console.log(`[EventManager]: Loaded Client#${eventName} event`);
				delete require.cache[require.resolve(`./handlers/events/Client/${file}`)];
			});
		});
		this.ws.shards.map(s => s.on("ready",require("./handlers/events/WebSocketShard/ready").bind(this,s.id)));
		delete require.cache[require.resolve("./handlers/events/WebSocketShard/ready")];
		console.log(`[EventManager]: Loaded WebSocketManager#ready event`);
		console.log("[loadEvent]: end of load");
	}

	getCategory(lookup) {
		if(!lookup) return null;
		let a;
		if(this.commandList.includes(lookup.toLowerCase())) a = this.commands.filter(c => c.commands.map(cc => cc.triggers).reduce((a,b) => a.concat(b)).includes(lookup.toLowerCase()));
		else if(this.categoryList.includes(lookup.toLowerCase())) a = this.categories.filter(cat => cat.name.toLowerCase() === lookup.toLowerCase());
		else return null;
		//this.logger.log(this.commands);
		return a.length === 0 ? null : a[0];
	}

	getCommand(command) {
		if(!command) return null;
		let a = this.commands.map(c => c.commands).reduce((a,b) => a.concat(b)).filter(cc => cc.triggers.includes(command));
		return a.length === 0 ? null : a[0];
	}

	getResponse(response) {
		if(!response) return null;
		let a = this.responses.filter(r => r.triggers.includes(response));
		return a.length === 0 ? null : a[0];
	}
}

const client = new FurryBot(config.bot.clientOptions);

//console.log(client.db.getGuild);

client.login(config.bot.token);

process.on("SIGINT", async () => {
	if(!client) {
		process.kill(process.pid, "SIGTERM");
	} else {
		if(!client.logger) {
			console.debug("Started termination via CTRL+C");
			client.voiceConnections.forEach((v) => v.disconnect());
			console.debug("Terminated all voice connections");
		} else {
			client.logger.debug("Started termination via CTRL+C");
			client.voiceConnections.forEach((v) => v.disconnect());
			client.logger.debug("Terminated all voice connections");
		}
		client.destroy();
		console.log("Terminated client");
		process.kill(process.pid,"SIGTERM");
	}
});

process.on("unhandledRejection", (p) => {
	if(client.logger !== undefined) {
		client.logger.error("Unhandled Promise Rejection:");
		client.logger.error(p);
	} else {
		console.error("Unhandled Promise Rejection:");
		console.error(p);
	}
});

module.exports = client;