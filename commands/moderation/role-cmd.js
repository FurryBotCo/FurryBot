module.exports = {
	triggers: [
		"role"
	],
	userPermissions: [
		"MANAGE_ROLES"
	],
	botPermissions: [
		"MANAGE_ROLES"
	],
	cooldown: 2e3,
	description: "Manage roles for a single user, or multiple!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		let data, embed, member, r, a, operation, l, role, count, role2, skipCount, members, counts;
		if(message.args.length === 0 || message.args[0] === "help") {
			data = {
				title: "Help with role command.",
				description: `\
				**${message.prefix}${message.command}** add <user> <role>\n\
				**${message.prefix}${message.command}** remove <user> <role>\n\
				**${message.prefix}${message.command}** removeall <role>\n\
				**${message.prefix}${message.command}** all <role>\n\
				**${message.prefix}${message.command}** bots [+/-]<role>\n\
				**${message.prefix}${message.command}** humans [+/-]<role>\n\
				**${message.prefix}${message.command}** in <role> [role to add]\n\
				[] = optional, <> = required\n\
				+ = add, - = remove, only usable on **humans**, and **bots**\n\
				brackets are just for placeholders, do not add them when running commands!\n\
				if you use them, do not put a space between them and the role name/mention/id`
			};
			embed = new message.client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}

		member = await message.getMemberFromArgs();
		if(member) {
			if(message.args.length <= 1) return message.reply("Please provide a role to add or remove!");
			r = await message.getRoleFromArgs(1);
			if(!r) {
				// operation
				// 0: toggle
				// 1: add
				// 2: remove
				if(["-","+"].some(s => message.args[1].startsWith(s) && message.args[1] !== s)) {
					a = message.args[1].slice(0,1);
					operation = a === "+" ? 1 : 2;
					l = message.args[1].slice(1);
				} else {
					l = message.args[1];
					operation = 0;
				}
				role = message.guild.roles.find(r => r.name.toLowerCase() === l.toLowerCase());
				if(!role) return message.reply("Role not found.");
			} else {
				role = r;
			}
			if(message.member.roles.highest.rawPosition <= role.rawPosition && message.guild.owner.id !== message.member.id) return message.reply("You cannot assign or remove roles as high as, or higher than you.");
			if(message.guild.me.roles.highest.rawPosition <= role.rawPosition) return message.reply("this role is higher than, or as high as me, I cannot remove or assign it.");
			if(role.managed) return message.reply("this role is managed (likely permissions for a bot), these cannot be removed or assigned.");
			switch(operation) {
			case 1:
				if(member.roles.has(role.id)) return message.reply(`No action was taken, as **${member.user.tag}** already has the role **${role.name}**`);
				return member.roles.add(role.id,`Command: ${message.author.tag} -> Add role ${role.name} to ${member.user.tag}`).then(() => {
					return message.reply(`Added role **${role.name}** to **${member.user.tag}**`);
				}).catch((e) => {
					return message.reply(`Command failed: ${e}`);
				});
				break; // eslint-disable-line no-unreachable

			case 2:
				if(!member.roles.has(role.id)) return message.reply(`No action was taken, as **${member.user.tag}** does not have the role **${role.name}**`);
				return member.roles.add(role.id,`Command: ${message.author.tag} -> Remove role ${role.name} from ${member.user.tag}`).then(() => {
					return message.reply(`Removed role **${role.name}** from **${member.user.tag}**`);
				}).catch((e) => {
					return message.reply(`Command failed: ${e}`);
				});
				break; // eslint-disable-line no-unreachable

			default:
				if(member.roles.has(role.id)) {
					return member.roles.remove(role.id,`Command: ${message.author.tag} -> Remove role ${role.name} from ${member.user.tag}`).then(() => {
						return message.reply(`Removed role **${role.name}** from **${member.user.tag}**`);
					}).catch((e) => {
						return message.reply(`Command failed: ${e}`);
					});
				} else {
					return member.roles.add(role.id,`Command: ${message.author.tag} -> Add role ${role.name} to ${member.user.tag}`).then(() => {
						return message.reply(`Added role **${role.name}** to **${member.user.tag}**`);
					}).catch((e) => {
						return message.reply(`Command failed: ${e}`);
					});
				}
			}
		}

		r = await message.getRoleFromArgs();
		if(r) {
			data = {
				title: `Role info - ${r.name} (${r.id})`,
				fields: [
					{
						name: "Hoisted",
						value: r.hoist ? "Yes" : "No",
						inline: false
					},{
						name: "Managed",
						value: r.managed ? "Yes" : "No",
						inline: false
					},{
						name: "Hex Color",
						value: r.hexColor,
						inline: false
					},{
						name: "Members With Role",
						value: r.guild.members.filter(m => m.roles.has(r.id)).size,
						inline: false
					}
				]
			};
			embed = new message.client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}

		if(!["in","add","remove","all","addall","removeall","humans","bots"].includes(message.args[0].toLowerCase())) return new Error("ERR_INVALID_USAGE");
		switch(message.args[0].toLowerCase()) {
		case "in":
			role = await message.getRoleFromArgs(1);
			if(!role) return message.reply("Role not found.");
			if(message.args.length === 2) {
				count = role.guild.members.filter(m => m.roles.has(role.id)).size;
				return message.reply(`${count} users have the role ${role.name}.`);
			}
			role2 = await message.getRoleFromArgs(2);
			if(!role2) return message.reply("Second role not found.");
			role.members.forEach(async(m) => {
				await m.roles.add(role2.id,`Command: ${message.author.tag} -> Add role ${role2.name} to users in role ${role.name}`).catch(noerr => null);
			});
			count = role.guild.members.filter(m => m.roles.has(role.id)).size;
			skipCount = role.guild.members.filter(m => m.roles.has(role2.id)).size;
			return message.reply(`Changed roles for ${count} users (skipped ${skipCount - count})`);
			break; // eslint-disable-line no-unreachable

		case "add":
			member = await message.getMemberFromArgs(1);
			role = await message.getRoleFromArgs(2);
			if(!member && !role) {
				role = await message.getRoleFromArgs(1);
				member = await message.getMemberFromArgs(2);
			}
			/*
				roles = [];
				rl = [...message.args].splice(1);
				for(let i = 0;i<rl.length;i++) {
					l = await message.getRoleFromArgs(i + 2);
					if(l instanceof message.client.Discord.Role) roles.push(l.id);
				}
				*/
			if(!member) return message.reply("User not found.");
			if(!role) return message.reply("Role not found.");
			if(message.member.roles.highest.rawPosition <= role.rawPosition && message.guild.owner.id !== message.member.id) return message.reply("You cannot assign or remove roles as high as, or higher than you.");
			if(message.guild.me.roles.highest.rawPosition <= role.rawPosition) return message.reply("this role is higher than, or as high as me, I cannot remove or assign it.");
			if(role.managed) return message.reply("this role is managed (likely permissions for a bot), these cannot be removed or assigned.");
			if(member.roles.has(role.id)) return message.reply(`**${member.user.tag}** already has the role ${role.name}.`);
			return member.roles.add(role.id,`Command: ${message.author.tag} -> Add role ${role.name} to ${member.user.tag}`).then(() => {
				return message.reply(`Added role ${role.name} to **${member.user.tag}**.`);
			}).catch((e) => {
				return message.reply(`Command failed: ${e}`);
			});
			break; // eslint-disable-line no-unreachable

		case "remove":
			member = await message.getMemberFromArgs(1);
			role = await message.getRoleFromArgs(2);
			if(!member && !role) {
				role = await message.getRoleFromArgs(1);
				member = await message.getMemberFromArgs(2);
			}
			if(!member) return message.reply("User not found.");
			if(!role) return message.reply("Role not found.");
			if(message.member.roles.highest.rawPosition <= role.rawPosition && message.guild.owner.id !== message.member.id) return message.reply("You cannot assign or remove roles as high as, or higher than you.");
			if(message.guild.me.roles.highest.rawPosition <= role.rawPosition) return message.reply("this role is higher than, or as high as me, I cannot remove or assign it.");
			if(role.managed) return message.reply("this role is managed (likely permissions for a bot), these cannot be removed or assigned.");
			if(!member.roles.has(role.id)) return message.reply(`**${member.user.tag}** does not have the role ${role.name}.`);
			return member.roles.remove(role.id,`Command: ${message.author.tag} -> remove role ${role.name} from ${member.user.tag}`).then(() => {
				return message.reply(`Removed role ${role.name} from **${member.user.tag}**.`);
			}).catch((e) => {
				return message.reply(`Command failed: ${e}`);
			});
			break; // eslint-disable-line no-unreachable

		case "all":
		case "addall":
			role = await message.getRoleFromArgs(1);
			if(!role) return message.reply("Role not found.");
			if(message.member.roles.highest.rawPosition <= role.rawPosition && message.guild.owner.id !== message.member.id) return message.reply("You cannot assign or remove roles as high as, or higher than you.");
			if(message.guild.me.roles.highest.rawPosition <= role.rawPosition) return message.reply("this role is higher than, or as high as me, I cannot remove or assign it.");
			if(role.managed) return message.reply("this role is managed (likely permissions for a bot), these cannot be removed or assigned.");
			members = message.guild.members.filter(m => !m.roles.has(role.id)).map(m => m.id);
			counts = {
				success: 0,
				fail: 0,
				skip: 0,
				before: message.guild.members.filter(m => m.roles.has(role.id)).size
			};
			message.channel.send(`Changing roles for ${members.length} members.\nmessage.client should take about ${message.client.parseTime(1e3 * message.guild.members.filter(m => !m.roles.has(role.id)).size, true, true)}.`);
			for(let m of members) {
				member = message.guild.members.get(m);
				if(!member.roles.has(role.id)) await member.roles.add(role.id,`Command: ${message.author.tag} -> Add role ${role.name} to ALL.`)
					.then(() => counts.success++)
					.catch(() => counts.fail++);
				else counts.skip++;
			}
			return message.channel.send(`Succeeded: **${counts.success}**\nFailed: **${counts.fail}**\nBefore: **${counts.before}**\nAfter: **${counts.before + counts.success}**\nSkipped: **${counts.skip}**`);
			break; // eslint-disable-line no-unreachable

		case "removeall":
			role = await message.getRoleFromArgs(1);
			if(!role) return message.reply("Role not found.");
			if(message.member.roles.highest.rawPosition <= role.rawPosition && message.guild.owner.id !== message.member.id) return message.reply("You cannot assign or remove roles as high as, or higher than you.");
			if(message.guild.me.roles.highest.rawPosition <= role.rawPosition) return message.reply("this role is higher than, or as high as me, I cannot remove or assign it.");
			if(role.managed) return message.reply("this role is managed (likely permissions for a bot), these cannot be removed or assigned.");
			members = message.guild.members.filter(m => m.roles.has(role.id)).map(m => m.id);
			counts = {
				success: 0,
				fail: 0,
				skip: 0,
				before: message.guild.members.filter(m => m.roles.has(role.id)).size
			};
			message.channel.send(`Changing roles for ${members.length} members.\nmessage.client should take about ${message.client.parseTime(1e3 * message.guild.members.filter(m => m.roles.has(role.id)).size, true, true)}.`);
			for(let m of members) {
				member = message.guild.members.get(m);
				if(member.roles.has(role.id)) await member.roles.remove(role.id,`Command: ${message.author.tag} -> Remove role ${role.name} from ALL.`)
					.then(() => counts.success++)
					.catch(() => counts.fail++);
				else counts.skip++;
			}
			return message.channel.send(`Succeeded: **${counts.success}**\nFailed: **${counts.fail}**\nBefore: **${counts.before}**\nAfter: **${counts.before - counts.success}**\nSkipped: **${counts.skip}**`);
			break; // eslint-disable-line no-unreachable

		case "humans":
			if(["-","+"].some(s => message.args[1].startsWith(s) && message.args[1] !== s)) {
				a = message.args[1].slice(0,1);
				operation = a === "+" ? 1 : 2;
				l = message.args[1].slice(1);
			} else {
				l = message.args[1];
				operation = 1;
			}
			if(operation === 1) {
				role = message.guild.roles.find(r => r.name.toLowerCase() === l.toLowerCase());
				if(!role) return message.reply("Role not found.");
				if(message.member.roles.highest.rawPosition <= role.rawPosition && message.guild.owner.id !== message.member.id) return message.reply("You cannot assign or remove roles as high as, or higher than you.");
				if(message.guild.me.roles.highest.rawPosition <= role.rawPosition) return message.reply("this role is higher than, or as high as me, I cannot remove or assign it.");
				if(role.managed) return message.reply("this role is managed (likely permissions for a bot), these cannot be removed or assigned.");
				members = message.guild.members.filter(m => !m.user.bot).map(m => m.id);
				counts = {
					success: 0,
					fail: 0,
					skip: 0,
					before: message.guild.members.filter(m => m.roles.has(role.id) && !m.user.bot).size
				};
				message.channel.send(`Changing roles for ${members.length} humans.\nmessage.client should take about ${message.client.parseTime(1e3 * message.guild.members.filter(m => !m.roles.has(role.id) && !m.user.bot).size, true, true)}.`);
				for(let m of members) {
					member = message.guild.members.get(m);
					if(!member.roles.has(role.id)) await member.roles.add(role.id,`Command: ${message.author.tag} -> Change role ${role.name} for all humans.`)
						.then(() => counts.success++)
						.catch(() => counts.fail++);
					else counts.skip++;
				}
				return message.channel.send(`Succeeded: **${counts.success}**\nFailed: **${counts.fail}**\nBefore: **${counts.before}**\nAfter: **${counts.before + counts.success}**\nSkipped: **${counts.skip}**`);
			} else {
				role = message.guild.roles.find(r => r.name.toLowerCase() === l.toLowerCase());
				if(!role) return message.reply("Role not found.");
				if(message.member.roles.highest.rawPosition <= role.rawPosition && message.guild.owner.id !== message.member.id) return message.reply("You cannot assign or remove roles as high as, or higher than you.");
				if(message.guild.me.roles.highest.rawPosition <= role.rawPosition) return message.reply("this role is higher than, or as high as me, I cannot remove or assign it.");
				if(role.managed) return message.reply("this role is managed (likely permissions for a bot), these cannot be removed or assigned.");
				members = message.guild.members.filter(m => !m.user.bot).map(m => m.id);
				counts = {
					success: 0,
					fail: 0,
					skip: 0,
					before: message.guild.members.filter(m => m.roles.has(role.id) && !m.user.bot).size
				};
				message.channel.send(`Changing roles for ${members.length} humans.\nmessage.client should take about ${message.client.parseTime(1e3 * message.guild.members.filter(m => m.roles.has(role.id) && !m.user.bot).size, true, true)}.`);
				for(let m of members) {
					member = message.guild.members.get(m);
					if(member.roles.has(role.id)) await member.roles.remove(role.id,`Command: ${message.author.tag} -> Change role ${role.name} for all humans.`)
						.then(() => counts.success++)
						.catch(() => counts.fail++);
					else counts.skip++;
				}
				return message.channel.send(`Succeeded: **${counts.success}**\nFailed: **${counts.fail}**\nBefore: **${counts.before}**\nAfter: **${counts.before - counts.success}**\nSkipped: **${counts.skip}**`);
			}
			break; // eslint-disable-line no-unreachable

		case "bots":
			if(["-","+"].some(s => message.args[1].startsWith(s) && message.args[1] !== s)) {
				a = message.args[1].slice(0,1);
				operation = a === "+" ? 1 : 2;
				l = message.args[1].slice(1);
			} else {
				l = message.args[1];
				operation = 1;
			}
			if(operation === 1) {
				role = message.guild.roles.find(r => r.name.toLowerCase() === l.toLowerCase());
				if(!role) return message.reply("Role not found.");
				if(message.member.roles.highest.rawPosition <= role.rawPosition && message.guild.owner.id !== message.member.id) return message.reply("You cannot assign or remove roles as high as, or higher than you.");
				if(message.guild.me.roles.highest.rawPosition <= role.rawPosition) return message.reply("this role is higher than, or as high as me, I cannot remove or assign it.");
				if(role.managed) return message.reply("this role is managed (likely permissions for a bot), these cannot be removed or assigned.");
				members = message.guild.members.filter(m => m.user.bot).map(m => m.id);
				counts = {
					success: 0,
					fail: 0,
					skip: 0,
					before: message.guild.members.filter(m => m.roles.has(role.id) && m.user.bot).size
				};
				message.channel.send(`Changing roles for ${members.length} bots.\nmessage.client should take about ${message.client.parseTime(1e3 * message.guild.members.filter(m => !m.roles.has(role.id) && m.user.bot).size, true, true)}.`);
				for(let m of members) {
					member = message.guild.members.get(m);
					if(!member.roles.has(role.id)) await member.roles.add(role.id,`Command: ${message.author.tag} -> Change role ${role.name} for all bots.`)
						.then(() => counts.success++)
						.catch(() => counts.fail++);
					else counts.skip++;
				}
				return message.channel.send(`Succeeded: **${counts.success}**\nFailed: **${counts.fail}**\nBefore: **${counts.before}**\nAfter: **${counts.before + counts.success}**\nSkipped: **${counts.skip}**`);
			} else {
				role = message.guild.roles.find(r => r.name.toLowerCase() === l.toLowerCase());
				if(!role) return message.reply("Role not found.");
				if(message.member.roles.highest.rawPosition <= role.rawPosition && message.guild.owner.id !== message.member.id) return message.reply("You cannot assign or remove roles as high as, or higher than you.");
				if(message.guild.me.roles.highest.rawPosition <= role.rawPosition) return message.reply("this role is higher than, or as high as me, I cannot remove or assign it.");
				if(role.managed) return message.reply("this role is managed (likely permissions for a bot), these cannot be removed or assigned.");
				members = message.guild.members.filter(m => m.user.bot).map(m => m.id);
				counts = {
					success: 0,
					fail: 0,
					skip: 0,
					before: message.guild.members.filter(m => m.roles.has(role.id) && m.user.bot).size
				};
				message.channel.send(`Changing roles for ${members.length} bots.\nmessage.client should take about ${message.client.parseTime(1e3 * message.guild.members.filter(m => m.roles.has(role.id) && m.user.bot).size, true, true)}.`);
				for(let m of members) {
					member = message.guild.members.get(m);
					if(member.roles.has(role.id)) await member.roles.remove(role.id,`Command: ${message.author.tag} -> Change role ${role.name} for all bots.`)
						.then(() => counts.success++)
						.catch(() => counts.fail++);
					else counts.skip++;
				}
				return message.channel.send(`Succeeded: **${counts.success}**\nFailed: **${counts.fail}**\nBefore: **${counts.before}**\nAfter: **${counts.before - counts.success}**\nSkipped: **${counts.skip}**`);
			}
			break; // eslint-disable-line no-unreachable
		} 
	})
};