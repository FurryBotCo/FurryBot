const {
	config,
	os,
	util,
	phin,
	performance,
	Database: {
		MongoClient,
		mongo,
		mdb
	},
	functions
} = require("../../../modules/CommandRequire");

module.exports = (async function (guild) {
	if (!mdb || !guild) return;
	let d = new Date(),
		date = `${d.getMonth().toString().length > 1 ? d.getMonth()+1 : `0${d.getMonth()+1}`}-${d.getDate().toString().length > 1 ? d.getDate() : `0${d.getDate()}`}-${d.getFullYear()}`,
		j = await mdb.collection("dailyjoins").findOne({
			id: date
		});
	if (!j) j = await mdb.collection("dailyjoins").insertOne({
		id: date,
		count: 0
	}).then(s => mdb.collection("dailyjoins").findOne({
		id: date
	}));
	await mdb.collection("dailyjoins").findOneAndUpdate({
		id: date
	}, {
		$set: {
			count: +j.count + 1
		}
	});
	await mdb.collection("guilds").insertOne(Object.assign({
		id: guild.id
	}, config.default.guildConfig));
	let o, owner, embed, chn;
	o = guild.members.find(m => m.id === guild.ownerID);
	owner = !o ? "Unknown#0000" : `${o.username}#${o.discriminator} (${o.id})`;
	this.trackEvent({
		group: "EVENTS",
		guildId: guild.id,
		event: "client.events.guildCreate",
		properties: {
			name: guild.name,
			owner,
			ownderId: guild.ownerID,
			guildCreationDate: new Date(guild.createdAt),
			totalGuilds: this.bot.guilds.size,
			bot: {
				version: config.bot.version,
				beta: config.beta,
				alpha: config.alpha,
				server: os.hostname()
			}
		}
	});
	this.logger.log(`New guild joined: ${guild.name} (${guild.id}). This guild has ${guild.memberCount} members! Guild was put on shard #${guild.shard.id} (${+guild.shard.id+1})`);

	embed = {
		title: "Guild Joined!",
		description: `Guild Number ${this.bot.guilds.size}`,
		image: {
			url: guild.iconURL || "https://i.furcdn.net/noicon.png"
		},
		thumbnail: {
			url: o.avatarURL
		},
		author: {
			name: `${o.username}#${o.discriminator}`,
			icon: o.avatarURL
		},
		fields: [{
			name: "Name",
			value: `${guild.name} (${guild.id})`,
			inline: false
		}, {
			name: "Members",
			value: `Total: ${guild.memberCount}\n\n\
				${config.emojis.online}: ${guild.members.filter(m => m.status === "online").length}\n\
				${config.emojis.idle}: ${guild.members.filter(m => m.status === "idle").length}\n\
				${config.emojis.dnd}: ${guild.members.filter(m => m.status === "dnd").length}\n\
				${config.emojis.offline}: ${guild.members.filter(m => m.status === "offline").length}\n\n\
				Non Bots: ${guild.members.filter(m => !m.bot).length}\n\
				Bots: ${guild.members.filter(m => m.bot).length}`,
			inline: false
		}, {
			name: "Large Guild (300+ Members)",
			value: guild.large ? "Yes" : "No",
			inline: false
		}, {
			name: "Guild Owner",
			value: owner,
			inline: false
		}],
		timestamp: this.getCurrentTimestamp(),
		color: functions.randomColor(),
		footer: {
			text: `Shard ${![undefined,null].includes(guild.shard) ? `${+guild.shard.id+1}/${this.bot.shards.size}`: "1/1"} | Bot Version ${config.bot.version}`
		},
	};
	await this.bot.executeWebhook(config.webhooks.guildStatus.id, config.webhooks.guildStatus.token, {
		embeds: [embed],
		username: `Guild Join${config.beta ? " - Beta" : config.alpha ? " - Alpha" : ""}`,
		avatarURL: "https://i.furry.bot/furry.png"
	});
	embed = {
		description: config.bot.intro.text,
		fields: config.bot.intro.fields,
		author: {
			name: guild.name,
			icon: guild.iconURL
		},
		timestamp: this.getCurrentTimestamp(),
		color: functions.randomColor(),
		footer: {
			text: `Shard ${![undefined,null].includes(guild.shard) ? `${+guild.shard.id+1}/${this.bot.shards.size}`: "1/1"} | Bot Version ${config.bot.version}`
		},
	};
	chn = guild.channels.filter(c => c.type === "text" && ["sendMessages", "viewChannel", "embedLinks"].some(p => c.permissionsOf(this.bot.user.id).has(p)));
	if (chn.length === 0) return;
	return chn[0].createMessage({
		embed
	}).catch(error => null);
});