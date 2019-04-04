module.exports = {
	triggers: [
		"seen",
		"seenon"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks" // 16384
	],
	cooldown: 2e3,
	description: "Get the servers we've seen a user on",
	usage: "[@user, or id]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let user, a, b, guilds, fields, embed, i;
		if(message.args.length === 0 || !message.args) {
			user = message.member;
		} else {
			// get member from message
			user = await message.getMemberFromArgs();
		}
	
		
		if(!user) return message.errorEmbed("INVALID_USER");
		
		a = this.bot.guilds.filter(g => g.members.has(user.id));
		b = a.map(g => `${g.name} (${g.id})`),
		guilds = [],
		fields = [],
		i = 0;
		for(let key in b) {
			if(!guilds[i]) guilds[i] = "";
			if(guilds[i].length > 1000 || +guilds[i].length+b[key].length > 1000) {
				i++;
				guilds[i] = b[key];
			} else {
				guilds[i]+=`\n${b[key]}`;
			}
		}
		guilds.forEach((g,c) => {
			fields.push({
				name: `Server List #${+c+1}`,
				value: g,
				inline: false
			});
		});
		embed = {
			title: `Seen On ${b.length} Servers - ${user.user.username}#${user.user.discriminator} (${user.id})`,
			desciption: `I see this user in ${guilds.size} other guilds.`,
			fields
		};
		message.channel.createMessage({ embed });
	})
};