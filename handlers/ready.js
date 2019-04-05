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
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			}
		}
	});

	const statuses = [
			{
				status: "🐾 ${this.config.defaultPrefix}help for help! 🐾",
				type: 0 // playing
			},
			{
				status: "🐾 ${this.config.defaultPrefix}help in ${this.bot.guilds.size} guilds! 🐾",
				type: 0 // playing
			},
			{
				status: "🐾 ${this.config.defaultPrefix}help with ${this.bot.users.size} users! 🐾",
				type: 3 // watching
			},
			{
				status: "🐾 ${this.config.defaultPrefix}help in ${this.bot.guilds.map(g => g.channels.size).reduce((a,b) => a + b)} channels! 🐾",
				type: 2 // listening
			}, 
			{
				status: "🐾 ${this.config.defaultPrefix}help with ${this.bot.shards.size} shard${this.bot.shards.size>1?\"s\":\"\"}! 🐾",
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

	this.srv = this.server.load(this.bot);
	if(!this.config.beta) {
		//const ls = this.listStats(this);
		this.ls = setInterval(this.listStats,3e5,this);
	}

	setInterval(() => {
		if(!this.fs.existsSync(`${this.config.rootDir}/tmp`)) {
			this.fs.mkdirSync(`${this.config.rootDir}/tmp`);
			this.fs.writeFileSync(`${this.config.rootDir}/tmp/placeholder`,"");
			this.logger.debug("Made temporary folder, and added placeholder file");
		}
		if(!this.fs.existsSync(`${this.config.rootDir}/tmp/placeholder`)) {
			this.fs.writeFileSync(`${this.config.rootDir}/tmp/placeholder`,"");
			this.logger.debug("Recreated placeholder file in temporary directory");
		}
		this.fs.readdir(`${this.config.rootDir}/tmp`, (err, files) => {
			if (err) this.logger.error(err);
			for (let file of files) {
				if(file === "placeholder") continue;
				this.fs.unlink(this.path.join(`${this.config.rootDir}/tmp`, file), err => {
					if (err) throw err;
				});
			}
			this.logger.debug("Cleared Temporary Directory");
		});
	},3e5);
	this.logger.log("end of ready");

	// redo daily counts posting sometime
});