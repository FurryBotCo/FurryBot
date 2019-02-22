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
	run: (async(message) => {
		let member, server, a, roles, fields, i, data, embed, allow, deny, role;
		if(message.args.length === 0) member = message.member;
		else if(message.args[0] === "server") server = message.guild;
		// try member first
		else member = await message.getMemberFromArgs(0,false,true);
			
		// if member failed try role
		if(([undefined,null,""].includes(member) || !(member instanceof message.client.Discord.GuildMember)) && message.args[0] !== "server") role = await message.getRoleFromArgs(0,false,true);

		//finally, try a server (if developer)
		if(message.user.isDeveloper  && ([undefined,null,""].includes(member) || !(member instanceof message.client.Discord.GuildMember)) && ([undefined,null,""].includes(role) || !(role instanceof message.client.Discord.Role)) && message.args[0] !== "server") server = await message.getServerFromArgs(0,false,true).then(s => {console.log(s.name);return s;});
		
		if(server instanceof message.client.Discord.Guild) {
			// server roles
			a = message.guild.roles.map(r => `<@&${r.id}>`),
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
			roles.forEach((r,c) => {
				fields.push({
					name: `Role List #${+c+1}`,
					value: r,
					inline: false
				});
			});
			data = {
				title: `this server has ${a.length} Roles`,
				desciption: `You can use \`${message.prefix}roleinfo <rolename>\` to get more info on a single role`,
				fields
			};
			embed = new message.client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else if (member instanceof message.client.Discord.GuildMember) {
			// member roles
			a = member.roles.map(r => `<@&${r.id}>`),
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
			roles.forEach((r,c) => {
				fields.push({
					name: `Role List #${+c+1}`,
					value: r,
					inline: false
				});
			});
			data = {
				title: `Member Roles - ${member.user.tag} - ${a.length} Roles`,
				desciption: `You can use \`${message.prefix}roleinfo <rolename>\` to get more info on a single role`,
				fields
			};
			embed = new message.client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else if (role instanceof message.client.Discord.Role) {
			// single role info
			allow = Object.keys(message.client._.pickBy(role.permissions.serialize(),((val,key)  => {return val;}))),
			deny = Object.keys(message.client._.pickBy(role.permissions.serialize(),((val,key)  => {return !val;}))),
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
						name: "Members With this Role",
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
			embed = new message.client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else {
			// nothing was found
			data = {
				title: "Nothing was found",
				description: "Nothing was found from the given input, please provide one of the following:\n \"server\", server id (developer only), @role, role id, role name, @user, user id, FULL user name, FULL user tag (User#0000)"
			};
			Object.assign(data, message.embed_defaults());
			embed = new message.client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}
	})
};