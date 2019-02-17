module.exports = {
	triggers: [
		"warnlog"
	],
	userPermissions: [
		"MANAGE_GUILD"
	],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Check the warnings a user has",
	usage: "<@member/id> [page]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		let user, page, mn, warnings, data, embed, wr, pages, fields, w, usr, blame;
		message.channel.startTyping();
		if(message.args.length === 0 || !message.args || (!isNaN(message.args[0]) && message.args[0].length < 17)) {
			user = message.member;
			page = ![undefined,null,""].includes(message.args[0]) && !isNaN(message.args[0]) && message.args[0].length < 17 ? message.args[0] : 1;
		} else {
			if(![undefined,null,""].includes(message.args[0]) && isNaN(message.args[0]) && message.args[0].length >= 17) {
				page = message.args[0];
				mn = 1;
			} else {
				page = ![undefined,null,""].includes(message.args[0]) && !isNaN(message.args[0]) && message.args[0].length < 17 ? message.args[0] : 1; // lgtm [js/useless-assignment-to-message]
			}
    
			if(![undefined,null,""].includes(message.args[1]) && isNaN(message.args[1]) && message.args[1].length >= 17) {
				page = message.args[1];
				mn = 0;
			} else {
				page = ![undefined,null,""].includes(message.args[1]) && !isNaN(message.args[1]) && message.args[1].length < 17 ? message.args[1] : 1;
			}
            
			if(!mn) mn = 1;
    
			user = await message.getMemberFromArgs(mn);
		}
    
        
		if(!user) return message.errorEmbed("INVALID_USER");
        
		warnings = await message.client.db.getUserWarnings(user.id,message.guild.id).then(res => res.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp)));
		if(warnings.length <= 0) {
			data = {
				title: "No Warnings Found",
				description: `No warnings were found for the specified user **${user.user.tag}**`,
				color: 41728
			};
			Object.assign(data, message.embed_defaults("color"));
			embed = new message.client.Discord.MessageEmbed(data);
			message.channel.send(embed);
			return message.channel.stopTyping();
		}
		wr = message.client.chunk(warnings,10);
		pages = wr.length;
		if([undefined,null,""].includes(page)) page = 1;
		if(page > pages) return message.reply("Invalid page number.");
		fields = [];
		for(let key in wr[page-1]) {
			w = wr[page-1][key];
			usr = await message.client.users.fetch(w.blame);
			blame = !usr ? "Unknown" : usr.tag;
			fields.push({
				name: `#${w.wid} - ${new Date(w.timestamp).toDateString()} by **${blame}**`,
				value: w.reason,
				inline: false
			});
		}
		data = {
			title: `Warn Log for **${user.user.tag}** - Page ${page}/${pages}`,
			fields
		};
		Object.assign(data,message.embed_defaults());
		embed = new message.client.Discord.MessageEmbed(data);
		message.channel.send(embed);
		return message.channel.stopTyping();
	})
};