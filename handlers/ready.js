const {
		config,
		os,
		fs,
		functions,
		Temp
	} = require("../modules/CommandRequire"),
	server = new (require("../server"))(config.serverOptions);
	
module.exports = (async function() {
	this.logger.log(`Bot has started with ${this.bot.users.size} users in ${this.bot.guilds.map(g => g.channels.size).reduce((a,b) => a + b)} channels of ${this.bot.guilds.size} guilds.`);
	this.trackEvent({
		group: "EVENTS",
		event: "client.events.ready",
		properties: {
			userCount: this.bot.users.size,
			channelCount: this.bot.guilds.map(g => g.channels.size).reduce((a,b) => a + b),
			guildCount: this.bot.guilds.size,
			bot: {
				version: config.bot.version,
				beta: config.beta,
				alpha: config.alpha,
				server: os.hostname()
			}
		}
	});

	const statuses = [
			{
				status: "🐾 ${config.defaultPrefix}help for help! 🐾",
				type: 0 // playing
			},
			{
				status: "🐾 ${config.defaultPrefix}help in ${this.bot.guilds.size} guilds! 🐾",
				type: 0 // playing
			},
			{
				status: "🐾 ${config.defaultPrefix}help with ${this.bot.users.size} users! 🐾",
				type: 3 // watching
			},
			{
				status: "🐾 ${config.defaultPrefix}help in ${this.bot.guilds.map(g => g.channels.size).reduce((a,b) => a + b)} channels! 🐾",
				type: 2 // listening
			}, 
			{
				status: "🐾 ${config.defaultPrefix}help with ${this.bot.shards.size} shard${this.bot.shards.size>1?\"s\":\"\"}! 🐾",
				type: 0 // playing
			}
		],
		rotateStatus = (() => {
			for(let i = 0;i<statuses.length;i++) {
				//setTimeout(this.bot.user.setActivity,i * 15e3, statuses[i].status,{type: statuses[i].type});
				setTimeout(() => this.bot.
					editStatus("online",{name: eval(`\`${statuses[i].status}\``),type: statuses[i].type}), i * 15e3);
			}
		});

	rotateStatus();
	setInterval(rotateStatus,(statuses.length -1) * 15e3);

	this.logger.log(`ready with ${this.bot.shards.size} shard${this.bot.shards.size>1?"s":""}!`);

	this.srv = server.load(this);
	if(!config.beta) {
		//const ls = this.listStats(this);
		this.ls = setInterval(this.listStats,3e5,this);
	}

	/*setInterval(() => {
		if(!fs.existsSync(`${config.rootDir}/tmp`)) {
			fs.mkdirSync(`${config.rootDir}/tmp`);
			fs.writeFileSync(`${config.rootDir}/tmp/placeholder`,"");
			this.logger.debug("Made temporary folder, and added placeholder file");
		}
		if(!fs.existsSync(`${config.rootDir}/tmp/placeholder`)) {
			fs.writeFileSync(`${config.rootDir}/tmp/placeholder`,"");
			this.logger.debug("Recreated placeholder file in temporary directory");
		}
		fs.readdir(`${config.rootDir}/tmp`, (err, files) => {
			if (err) this.logger.error(err);
			for (let file of files) {
				if(file === "placeholder") continue;
				fs.unlink(this.path.join(`${config.rootDir}/tmp`, file), err => {
					if (err) throw err;
				});
			}
			this.logger.debug("Cleared Temporary Directory");
		});
	},1.8e+6);*/

	this.Temp = Temp(`${config.rootDir}/tmp`);
	this.logger.log("end of ready");

	// redo daily counts posting sometime
});