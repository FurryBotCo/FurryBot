module.exports = {
	triggers: [
		"seen",
		"seenon"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Get the servers we've seen a user on",
	usage: "[@user, or id]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(client,message)=>{
		message.channel.startTyping();
		if(message.args.length === 0 || !message.args) {
			var user = message.member;
		} else {
			// get member from message
			var user = await message.getMemberFromArgs();
		}
	
		
		if(!user) {
			var data = {
				title: "User not found",
				description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag"
			}
			Object.assign(data, message.embed_defaults());
			var embed = new client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}
		
		var a = client.guilds.filter(g=>g.members.has(user.id));
		var b = a.map(g=>`${g.name} (${g.id})`),
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
		guilds.forEach((g,c)=>{
			fields.push({
				name: `Server List #${+c+1}`,
				value: g,
				inline: false
			})
		});
		var data = {
			title: `Seen On ${b.length} Servers - ${user.user.tag} (${user.id})`,
			desciption: `I see this user in ${guilds.size} other guilds.`,
			fields
		}
		var embed = new client.Discord.MessageEmbed(data);
		message.channel.send(embed);
		return message.channel.stopTyping();
	})
};