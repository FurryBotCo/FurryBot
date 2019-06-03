const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../../modules/CommandRequire");

module.exports = {
	triggers: [
		"info",
		"i"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	description: "Get user or server roles",
	usage: "[server/@member/@role/name/id]",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let member, server, a, roles, fields, i, embed, allow, deny, role;
		if(message.args.length === 0) member = message.member;
		else if(message.args[0] === "server") server = message.channel.guild;
		// try member first
		else member = await message.getMemberFromArgs(0,false,true);
			
		// if member failed try role
		if(([undefined,null,""].includes(member) || !(member instanceof this.Eris.Member)) && message.args[0] !== "server") role = await message.getRoleFromArgs(0,false,true);

		//finally, try a server (if developer)
		//if(message.user.isDeveloper  && ([undefined,null,""].includes(member) || !(member instanceof this.Eris.Member)) && ([undefined,null,""].includes(role) || !(role instanceof this.Discord.Role)) && message.args[0] !== "server") server = await message.getServerFromArgs(0,false,true).then(s => s);
		server = null;
		
		if(server instanceof this.Eris.Guild) {
			// server roles
			a = server.roles.map(r => `<@&${r.id}>`),
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
			embed = {
				title: `this server has ${a.length} Roles`,
				desciption: `You can use \`${message.prefix}roleinfo <rolename>\` to get more info on a single role`,
				fields
			};
			return message.channel.createMessage({ embed });
		} else if (member instanceof this.Eris.Member) {
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
			embed = {
				title: `Member Roles - ${member.username}#${member.discriminator} - ${a.length} Roles`,
				desciption: `You can use \`${message.prefix}roleinfo <rolename>\` to get more info on a single role`,
				fields
			};
			return message.channel.createMessage({ embed });
		} else if (role instanceof this.Eris.Role) {
			// single role info
			allow = [],
			deny = [];
			for(let p in config.Permissions.constant) {
				if(role.permissions.allow & config.permissions[p]) allow.push(p);
				else deny.push(p);
			}
			embed = {
				title: `**${role.name}**`,
				fields: [
					{
						name: "Color",
						value: `${parseInt(role.color,16)} (${role.color})`,
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
						value: role.position,
						inline: false
					},{
						name: "Members With this Role",
						value: message.guild.members.filter(m => m.roles.includes(role.id)).size,
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
			};
			return message.channel.createMessage({ embed });
		} else {
			// nothing was found
			embed = {
				title: "Nothing was found",
				description: "Nothing was found from the given input, please provide one of the following:\n \"server\", server id (developer only), @role, role id, role name, @user, user id, FULL user name, FULL user tag (User#0000)"
			};
			Object.assign(embed, message.embed_defaults());
			return message.channel.createMessage({ embed });
		}
	})
};