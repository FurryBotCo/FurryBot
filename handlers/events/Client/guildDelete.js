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
	if (!this.mdb || !guild) return;
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
			count: +j.count - 1
		}
	});
	let o, owner, embed;
	o = guild.members.find(m => m.id === guild.ownerID);
	owner = !o ? "Unknown#0000" : `${o.username}#${o.discriminator} (${o.user.id})`;
	this.trackEvent({
		group: "EVENTS",
		guildId: guild.id,
		event: "client.events.guildDelete",
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
	this.logger.log(`Guild left: ${guild.name} (${guild.id}). This guild had ${guild.memberCount} members.`);
	embed = {
		title: "Guild Left!",
		description: `RIP Guild Number ${+this.bot.guilds.size + 1}`,
		image: {
			url: guild.iconURL || config.bot.noGuildIcon
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
		username: `Guild Left${config.beta ? " - Beta" : config.alpha ? " - Alpha" : ""}`,
		avatarURL: "https://i.furry.bot/furry.png"
	});
});