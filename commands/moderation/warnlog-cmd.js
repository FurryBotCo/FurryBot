module.exports = {
	triggers: [
		"warnlog"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Check the warnings a user has",
	usage: "<@member/id> [page]",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let user, page, mn, warnings, embed, wr, pages, fields, w, usr, blame;
		
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
        
		warnings = await this.mdb.collection("users").findOne({id: user.id}).then(res => res.warnings.filter(w => w.gid === message.channel.guild.id).sort((s,g) => s.id < g.id ? -1 : s.id > g.id ? 1 : 0).sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp)));
		if(warnings.length <= 0) {
			embed = {
				title: "No Warnings Found",
				description: `No warnings were found for the specified user **${user.username}#${user.discriminator}**`,
				color: 41728
			};
			Object.assign(embed, message.embed_defaults("color"));
			message.channel.createMessage({ embed });
			
		}
		wr = this.chunk(warnings,10);
		pages = wr.length;
		if([undefined,null,""].includes(page)) page = 1;
		if(page > pages) return message.channel.createMessage("Invalid page number.");
		fields = [];
		for(let key in wr[page-1]) {
			w = wr[page-1][key];
			usr = await this.bot.getRESTUser(w.blame);
			blame = !usr ? "Unknown" : `${usr.username}#${usr.discriminator}`;
			fields.push({
				name: `#${w.wid} - ${new Date(w.timestamp).toDateString()} by **${blame}**`,
				value: w.reason,
				inline: false
			});
		}
		embed = {
			title: `Warn Log for **${user.username}#${user.discriminator}** - Page ${page}/${pages}`,
			fields
		};
		Object.assign(embed,message.embed_defaults());
		message.channel.createMessage({ embed });
		
	})
};