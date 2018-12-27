module.exports = {
	triggers: [
		"roleinfo",
		"roles"
    ],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	description: "Get user or server roles",
	usage: "[server/@member/@role/name/id]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(client,message)=>{
        if(message.args.length === 0) {
            var member = message.member;
        } else if(message.args[0] === "server") {
			var server = message.guild;
		} else {
			// try member first
			console.log("Member check");
			// member mention
			if(message.mentions.members.first()) {
				var member = message.mentions.members.first();
			}
			
			// user ID
			if(!isNaN(message.args[0]) && !(message.args.length === 0 || !message.args || message.mentions.members.first())) {
				var member = message.guild.members.get(message.args[0]);
			}
			
			// username
			if(isNaN(message.args[0]) && message.args[0].indexOf("#") === -1 && !(message.args.length === 0 || !message.args || message.mentions.members.first())) {
				var usr = client.users.find(t=>t.username.toLowerCase()===message.args[0].toLowerCase());
				if(usr instanceof client.Discord.User) var member = message.guild.members.get(usr.id);
			}
			
			// user tag
			if(isNaN(message.args[0]) && message.args[0].indexOf("#") !== -1 && !message.mentions.members.first()) {
				var usr = client.users.find(t=>t.tag.toLowerCase()===message.args[0].toLowerCase());
				if(usr instanceof client.Discord.User) var member = message.guild.members.get(usr.id);
			}
		}
		
		// if member failed try role
		if(([undefined,null,""].includes(member) || !member instanceof client.Discord.GuildMember) && message.args[0] !== "server") {
			console.log("Role check");
			// role mention
			if(message.mentions.roles.first()) {
				var role = message.mentions.roles.first();
			}
			
			// role ID
			if(!isNaN(message.args[0]) && !(message.args.length === 0 || !message.args || message.mentions.roles.first())) {
				var role = message.guild.roles.get(message.args[0]);
			}
			
			// role name
			if(isNaN(message.args[0]) && !(message.args.length === 0 || !message.args || message.mentions.roles.first())) {
				var rl = message.guild.roles.find(r=>r.name.toLowerCase()===message.args[0].toLowerCase());
				if(rl instanceof client.Discord.Role) var role = message.guild.roles.get(rl.id);
			}
		}

		//finally, try a server (if developer)
		if(!isNaN(message.args[0]) && message.user.isDeveloper  && ([undefined,null,""].includes(member) || !member instanceof client.Discord.GuildMember) && ([undefined,null,""].includes(role) || !role instanceof client.Discord.Role) && message.args[0] !== "server") {
			console.log("Server check");
			var s = client.guilds.get(message.args[0]);
			if(s instanceof client.Discord.Guild) var server = s;
		}

		if(server instanceof client.Discord.Guild) {
			// server roles
			var a = message.guild.roles.map(r=>`<@&${r.id}>`),
			roles = [],
			fields = [],
			i = 0;
			for(let key in a) {
				if(!roles[i]) roles[i] = "";
				if(roles[i].length > 1000) {
					i++;
					roles[i] = a[key];
				} else {
					roles[i]+=`\n${a[key]}`;
				}
			}
			roles.forEach((r,c)=>{
				fields.push({
					name: `Role List #${+c+1}`,
					value: r,
					inline: false
				})
			});
			var data = {
				title: `This server has ${a.length} Roles`,
				desciption: `You can use \`${message.prefix}roleinfo <rolename>\` to get more info on a single role`,
				fields
			}
			var embed = new client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else if (member instanceof client.Discord.GuildMember) {
			// member roles
			var a = member.roles.map(r=>`<@&${r.id}>`),
			roles = [],
			fields = [],
			i = 0;
			for(let key in a) {
				if(!roles[i]) roles[i] = "";
				if(roles[i].length > 1000) {
					i++;
					roles[i] = a[key];
				} else {
					roles[i]+=`\n${a[key]}`;
				}
			}
			roles.forEach((r,c)=>{
				fields.push({
					name: `Role List #${+c+1}`,
					value: r,
					inline: false
				})
			});
			var data = {
				title: `Member Roles - ${member.user.tag} - ${a.length} Roles`,
				desciption: `You can use \`${message.prefix}roleinfo <rolename>\` to get more info on a single role`,
				fields
			}
			var embed = new client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else if (role instanceof client.Discord.Role) {
			// single role info
			var allow = Object.keys(client._.pickBy(role.permissions.serialize(),((val,key) =>{return val;}))),
				deny = Object.keys(client._.pickBy(role.permissions.serialize(),((val,key) =>{return !val;}))),
				data = {
				title: `**${role.name}**`,
					fields: [
						{
							name: "Color",
							value: `${role.hexColor} (${role.color})`,
							inline: false
						},{
							name: "Hoisted (displayed separately)",
							value: role.hoist ? "Yes" : "No",
							inline: false
						},{
							name: "Managed (bot role)",
							value: role.managed ? "Yes" : "No",
							inline: false
						},{
							name: "Mentionable",
							value: role.mentionable ? "Yes" : "No",
							inline: false
						},{
							name: "Position",
							value: role.rawPosition,
							inline: false
						},{
							name: "Members With This Role",
							value: role.members.size,
							inline: false
						},{
							name: "Permissions Allowed",
							value: `**${allow.length > 0 ? allow.join("**, **") : "NONE"}**`,
							inline: false
						},{
							name: "Permissions Denied",
							value: `**${deny.length > 0 ? deny.join("**, **") : "NONE"}**`,
							inline: false
						}
					]
				},
				embed = new client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else {
			// nothing was found
			var data = {
				title: "Nothing was found",
				description: "Nothing was found from the given input, please provide one of the following:\n \"server\", server id (developer only), @role, role id, role name, @user, user id, FULL user name, FULL user tag (User#0000)"
			}
			Object.assign(data, message.embed_defaults());
			var embed = new client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}
    })
};