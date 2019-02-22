module.exports = (async function() {
	this.logger = new this.FurryBotLogger(this);
	this.logger.log(`Bot has started with ${this.users.size} users in ${this.channels.size} channels of ${this.guilds.size} guilds.`);
	this.analytics.track({
		userId: "CLIENT",
		event: "client.events.ready",
		properties: {
			userCount: this.users.size,
			channelCount: this.channels.size,
			guildCount: this.channels.size,
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			}
		}
	});

	const statuses = [
			{status: `🐾 ${this.config.defaultPrefix}help for help! 🐾`, type: "PLAYING"},
			{status: `🐾 ${this.config.defaultPrefix}help in ${this.guilds.size} guilds! 🐾`, type: "PLAYING"},
			{status: `🐾 ${this.config.defaultPrefix}help with ${this.users.size} users! 🐾`, type: "WATCHING"},
			{status: `🐾 ${this.config.defaultPrefix}help in ${this.channels.size} channels! 🐾`, type: "LISTENING"},
			{status: `🐾 ${this.config.defaultPrefix}help with ${this.options.shardCount} shard${this.options.shardCount>1?"s":""}! 🐾`, type: "PLAYING"}
		],
		rotateStatus = (() => {
			for(let i = 0;i<statuses.length;i++) {
				//setTimeout(this.user.setActivity,i * 15e3, statuses[i].status,{type: statuses[i].type});
				setTimeout(() => this.user.setActivity(statuses[i].status,{type: statuses[i].type}), i * 15e3);
			}
		});

	rotateStatus();
	setInterval(rotateStatus,(statuses.length -1) * 15e3);

	this.logger.log(`ready with ${this.options.shardCount} shard${this.options.shardCount>1?"s":""}!`);

	this.setInterval(() => {
		this.voiceConnections.forEach((vc) => {
			if(vc.channel.members.filter(m => m.id!==this.user.id).size === 0) {
				vc.channel.leave();
				this.logger.log(`Left voice channel ${vc.channel.name} (${vc.channel.id}) due to inactivity.`);
			}
		});
	},3e4);
   
	this.db = new this.FurryBotDatabase(this);
   
	await this.dbStats(this);
	// post general stats to db every 60 seconds
	this.setInterval(this.dbStats,6e4,this);
    
	/*var webhookData = {
        title: `Shard #${this.shard.id} is ready`,
        timestamp: this.getCurrentTimestamp()
    }*/
    
	//var webhookEmbed = new this.Discord.MessageEmbed(webhookData);
    
	//this.webhooks.shards.send(webhookEmbed);
	this.srv = this.server.load(this);
	if(!this.config.beta) {
		//const ls = this.listStats(this);
		setInterval(this.listStats,3e5,this);
	}

	// if ever needed, auto leave voice channels
	/*setInterval(async() => {
        this.voiceConnections.filter(v => !v.speaking.has("SPEAKING")).forEach(async(v) => {
            v.channel.leave();
            var data = {
                "title": "Left Voice Channel",
                "description": `Left voice channel ${v.channel.name} due to inactivity.`,
                "color": 2424780,
                "timestamp": new Date().toISOString()
            }
            var embed = new this.Discord.MessageEmbed(data);
            var a = await this.db.collection("guilds").findOne({id: v.channel.guild.id});
            if(a.music.textChannel !== null) {
                var chn = this.channels.get(a.music.textChannel);
                if(!chn || !(chn instanceof this.Discord.TextChannel)) var chn = null;
            }
            if(chn !== null && chn instanceof this.Discord.TextChannel) {
                chn.send(embed);
                await this.db.collection("guilds").findOneAndUpdate({id: v.channel.guild.id},{
                    $set: {
						music: {
							queue: [],
							playing: false,
							textChannel: null
						}
					}
                });
            }
        })
    },3e5);*/

	setInterval(async() => {
		if(["00:00:00"].includes(this.getDateTime())) {
			let date, data, embed, d, count;
			date = new Date(),
			d = `${date.getMonth().toString().length > 1 ? d.getMonth()+1 : `0${date.getMonth()+1}`}-${(date.getDate()-1).toString().length > 1 ? date.getDate() -1: `0${date.getDate()-1}`}-${date.getFullYear()}`,
			count = await this.db.collection("dailyjoins").findOne({id: d}).then(res => res.count) || 0;
			data = {
				author: {
					name: "Donovan_DMC#1337",
					"icon_url": "https://i.donovand.info/Don.gif"
				},
				title: `Total Guilds Joined ${d}\t Current Total: ${this.guilds.size}`,
				description: `Total Guilds Joined Today: **${count}**`,
				footer: {
					text: `Shard ${this.guilds.get(this.config.bot.mainGuild).shard.id+1}/${this.options.shardCount} | Bot Version ${this.config.bot.version}`
				},
				color: this.randomColor(),
				timestamp: this.getCurrentTimestamp(),
				thumbnail: {
					url: "https://i.furry.bot/furry-small.png"
				}
			};
			embed = new this.Discord.MessageEmbed(data);
			this.channels.get(this.config.bot.channels.daily).send(embed).then(n => {
				this.logger.log(`Posted daily stats, ${d}: ${count}, total: ${this.guilds.size}`);
			}).catch(this.logger.error);
		}
	},1e3);

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
	console.log("end of ready");
});