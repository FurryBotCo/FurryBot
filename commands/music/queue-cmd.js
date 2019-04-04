module.exports = {
	triggers: [
		"queue",
		"q"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Get the current music queue",
	usage: "",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let queue, ql, pages, page, fields, i, q, usr, addedBy, data, embed;
		queue = await this.mdb.collection("guilds").findOne({id: message.channel.guild.id}).then(res => res.music.queue);
		ql = this.chunk(queue,10);
		if(ql.length >= 1) {
			pages = ql.length;
			if([undefined,null,""].includes(page)) page = 1;
			if(page > pages) return message.channel.createMessage("Invalid page number.");
			fields = [];
			i = 0;
			for(let key in ql[page-1]) {
				q = ql[page-1][key];
				usr = await this.users.fetch(q.addedBy);
				addedBy = !usr ? "Unknown" : `${usr.username}#${usr.discriminator}`;
				if(i === 0) {
					fields.push({
						name: `${q.title} added by ${addedBy} at ${new Date(q.addedTimestamp).toDateString()}`,
						value: "Currently Playing",
						inline: false
					});
				} else {
					fields.push({
						name: `${q.title} added by ${addedBy} at ${new Date(q.addedTimestamp).toDateString()}`,
						value: `Position ${+i+1}`,
						inline: false
					});
				}
			}
		} else {
			fields = [
				{
					name: "Nothing playing",
					value: `Nothing is currently playing, queue something up with \`${message.gConfig.prefix}play <song search>\``,
					inline: false
				}
			];
		}
		data = {
			title: `Queue for ${message.channel.guild.name} - Page ${page}/${pages}`,
			fields,
			color: 2424780
		};
		embed = new this.Discord.MessageEmbed(data);
		return message.channel.createMessage(embed);
	})
};