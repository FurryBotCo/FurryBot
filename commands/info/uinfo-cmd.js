module.exports=(async (message, gConfig) => {
	if(!message) return new Error ("missing message parameter");
	if(!gConfig) return new Error ("missing gConfig parameter");
	await require(`../../BaseCommand.js`)(message, gConfig);
	
	if(args.length == 0 || !args) {
		var user=message.member;
	} else {
		// member mention
		if(message.mentions.members.first()) {
			var user = message.mentions.members.first();
		}
		
		// user ID
		if(!isNaN(args[0]) && !(args.length === 0 || !args || message.mentions.members.first())) {
			var user = message.guild.members.get(args[0]);
		}
		
		// username
		if(isNaN(args[0]) && args[0].indexOf("#") === -1 && !(args.length == 0 || !args || message.mentions.members.first())) {
			var usr=client.users.find(t=>t.usernam=e==args[0]);
			if(usr instanceof Discord.User) var user = message.guild.members.get(usr.id);
		}
		
		// user tag
		if(isNaN(args[0]) && args[0].indexOf("#") !== -1 && !message.mentions.members.first()) {
			var usr=client.users.find(t=>t.tag===args[0]);
			if(usr instanceof Discord.User) var user = message.guild.members.get(usr.id);
		}
	}

	
	if(!user) {
		var data={
			title: "User not found",
			description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag"
		}
		Object.assign(data, embed_defaults);
		var embed=new Discord.MessageEmbed(data);
		return message.channel.send(embed);
	}
	
	var roles = user.roles.map(role=>{if(role.name!=="@everyone"){return `<@&${role.id}>`}else{return "@everyone"}});
	
	var xhr1 = new XMLHttpRequest();

	xhr1.open("GET", `https://discord.services/api/ban/${user.id}`,false);

	xhr1.send();

	var x = JSON.parse(xhr1.responseText);
	var ds = typeof x.ban !== "undefined"?`\nReason: ${x.ban.reason}\nProof: [${x.ban.proof}](${x.ban.proof})`:false;
	var l = db.isBanned(user.id);
	var ll = l.banned?`Reason: ${l.reason}\nProof: [${l.proof}](${l.proof})`:false;
	var rr = roles.length > 30?`Too many roles to list, please use **${gConfig.prefix}roles ${user.id}**`:roles.toString();
	var data={
			name: "User info",
			fields: [
			{
				name: "Tag",
				value: user.user.tag,
				inline: true
			},{
				name: "User ID",
				value: user.id,
				inline: true
			},{
				name: "Joined Server",
				value: user.joinedAt.toString().split("GMT")[0],
				inline: true
			},{
				name: "Joined Discord",
				value: user.user.createdAt.toString().split("GMT")[0],
				inline: true
			},{
				name: `Roles [${roles.length}]`,
				value: rr,
				inline: false
			}, {
				name: "Blacklist",
				value: `Discord.Services: ${ds}\nLocal: ${ll}`,
				inline: false
			}, {
				name: "Vote for this bot",
				value: config.vote,
				inline: false
			}
			]
		};
		Object.assign(data, embed_defaults);
		data.thumbnail={url: user.user.displayAvatarURL};
		var embed=new Discord.MessageEmbed(data);
		return message.channel.send(embed);
});