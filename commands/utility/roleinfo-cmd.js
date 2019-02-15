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
	run: (async function(message) {
        if(message.args.length === 0) var member = message.member;
		else if(message.args[0] === "server") var server = message.guild;
		// try member first
		else var member = await message.getMemberFromArgs(0,false,true);
			
		// if member failed try role
		if(([undefined,null,""].includes(member) || !(member instanceof this.Discord.GuildMember)) && message.args[0] !== "server") var role = await message.getRoleFromArgs(0,false,true);

		//finally, try a server (if developer)
		if(message.user.isDeveloper  && ([undefined,null,""].includes(member) || !(member instanceof this.Discord.GuildMember)) && ([undefined,null,""].includes(role) || !(role instanceof this.Discord.Role)) && message.args[0] !== "server") var server = await message.getServerFromArgs(0,false,true).then(s=>{console.log(s.name);return s});
		
		if(server instanceof this.Discord.Guild) {
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
			roles.forEach((r,c) {
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
			var embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else if (member instanceof this.Discord.GuildMember) {
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
			roles.forEach((r,c) {
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
			var embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else if (role instanceof this.Discord.Role) {
			// single role info
			var allow = Object.keys(this._.pickBy(role.permissions.serialize(),((val,key) =>{return val;}))),
				deny = Object.keys(this._.pickBy(role.permissions.serialize(),((val,key) =>{return !val;}))),
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
				embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else {
			// nothing was found
			var data = {
				title: "Nothing was found",
				description: "Nothing was found from the given input, please provide one of the following:\n \"server\", server id (developer only), @role, role id, role name, @user, user id, FULL user name, FULL user tag (User#0000)"
			}
			Object.assign(data, message.embed_defaults());
			var embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}
    })
};