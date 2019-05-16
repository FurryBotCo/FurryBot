module.exports = {
	triggers: [
		"role"
	],
	userPermissions: [
		"manageRoles" // 268435456
	],
	botPermissions: [
		"manageRoles" // 268435456
	],
	cooldown: 2e3,
	description: "Manage roles for a single user, or multiple!",
	usage: "",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let data, embed, member, r, a, operation, l, role, count, role2, skipCount, members, counts, b, c;
		if(message.args.length === 0 || message.args[0] === "help") {
			embed = {
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
			return message.channel.createMessage({ embed });
		}

		member = await message.getMemberFromArgs();
		if(member) {
			if(message.args.length <= 1) return message.channel.createMessage(`<@!${message.author.id}>, Please provide a role to add or remove!`);
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
				role = message.channel.guild.roles.find(r => r.name.toLowerCase() === l.toLowerCase());
				if(!role) return message.channel.createMessage(`<@!${message.author.id}>, Role ${l} not found.`);
			} else {
				role = r;
			}
			b = this.compareMemberWithRole(message.member,role);
			c = this.compareMemberWithRole(message.guild.members.get(this.bot.user.id),role);
			if((b.higher || b.same) && message.channel.guild.ownerID !== message.member.id) return message.channel.createMessage(`<@!${message.author.id}>, You cannot assign or remove roles as high as, or higher than you.`);
			if(c.higher || c.same) return message.channel.createMessage(`<@!${message.author.id}>, this role is higher than, or as high as me, I cannot remove or assign it.`);
			if(role.managed) return message.channel.createMessage(`<@!${message.author.id}>, this role is managed (likely permissions for a bot), these cannot be removed or assigned.`);
			switch(operation) {
			case 1:
				if(member.roles.includes(role.id)) return message.channel.createMessage(`<@!${message.author.id}>, No action was taken, as **${member.username}#${member.discriminator}** already has the role **${role.name}**`);
				return member.addRole(role.id,`Command: ${message.author.username}#${message.author.discriminator} -> Add role ${role.name} to ${member.username}#${member.discriminator}`).then(() => {
					return message.channel.createMessage(`<@!${message.author.id}>, Added role **${role.name}** to **${member.username}#${member.discriminator}**`);
				}).catch((e) => {
					return message.channel.createMessage(`<@!${message.author.id}>, Command failed: ${e}`);
				});
				break; // eslint-disable-line no-unreachable

			case 2:
				if(!member.roles.includes(role.id)) return message.channel.createMessage(`<@!${message.author.id}>, o action was taken, as **${member.username}#${member.discriminator}** does not have the role **${role.name}**`);
				return member.addRole(role.id,`Command: ${message.author.username}#${message.author.discriminator} -> Remove role ${role.name} from ${member.username}#${member.discriminator}`).then(() => {
					return message.channel.createMessage(`<@!${message.author.id}>, Removed role **${role.name}** from **${member.username}#${member.discriminator}**`);
				}).catch((e) => {
					return message.channel.createMessage(`<@!${message.author.id}>, Command failed: ${e}`);
				});
				break; // eslint-disable-line no-unreachable

			default:
				if(member.roles.includes(role.id)) {
					return member.removeRole(role.id,`Command: ${message.author.username}#${message.author.discriminator} -> Remove role ${role.name} from ${member.username}#${member.discriminator}`).then(() => {
						return message.channel.createMessage(`<@!${message.author.id}>, Removed role **${role.name}** from **${member.username}#${member.discriminator}**`);
					}).catch((e) => {
						return message.channel.createMessage(`<@!${message.author.id}>, Command failed: ${e}`);
					});
				} else {
					return member.addRole(role.id,`Command: ${message.author.username}#${message.author.discriminator} -> Add role ${role.name} to ${member.username}#${member.discriminator}`).then(() => {
						return message.channel.createMessage(`<@!${message.author.id}>, Added role **${role.name}** to **${member.username}#${member.discriminator}**`);
					}).catch((e) => {
						return message.channel.createMessage(`<@!${message.author.id}>, Command failed: ${e}`);
					});
				}
			}
		}

		r = await message.getRoleFromArgs();
		if(r) {
			embed = {
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
			return message.channel.createMessage({ embed });
		}

		if(!["in","add","remove","all","addall","removeall","humans","bots"].includes(message.args[0].toLowerCase())) return new Error("ERR_INVALID_USAGE");
		switch(message.args[0].toLowerCase()) {
		case "in":
			role = await message.getRoleFromArgs(1);
			if(!role) return message.channel.createMessage(`<@!${message.author.id}>, Role not found.`);
			if(message.args.length === 2) {
				count = role.guild.members.filter(m => m.roles.has(role.id)).size;
				return message.channel.createMessage(`<@!${message.author.id}>, ${count} users have the role ${role.name}.`);
			}
			role2 = await message.getRoleFromArgs(2);
			if(!role2) return message.channel.createMessage(`<@!${message.author.id}>, Second role not found.`);
			role.members.forEach(async(m) => {
				await m.addRole(role2.id,`Command: ${message.author.username}#${message.author.discriminator} -> Add role ${role2.name} to users in role ${role.name}`).catch(noerr => null);
			});
			count = role.guild.members.filter(m => m.roles.has(role.id)).size;
			skipCount = role.guild.members.filter(m => m.roles.has(role2.id)).size;
			return message.channel.createMessage(`<@!${message.author.id}>, Changed roles for ${count} users (skipped ${skipCount - count})`);
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
					if(l instanceof this.Discord.Role) roles.push(l.id);
				}
				*/
			if(!member) return message.channel.createMessage(`<@!${message.author.id}>, User not found.`);
			if(!role) return message.channel.createMessage(`<@!${message.author.id}>, Role not found.`);
			b = this.compareMemberWithRole(message.member,role);
			c = this.compareMemberWithRole(message.guild.members.get(this.bot.user.id),role);
			if((b.higher || b.same) && message.channel.guild.ownerID !== message.member.id) return message.channel.createMessage(`<@!${message.author.id}>, You cannot assign or remove roles as high as, or higher than you.`);
			if(c.higher || c.same) return message.channel.createMessage(`<@!${message.author.id}>, this role is higher than, or as high as me, I cannot remove or assign it.`);
			if(role.managed) return message.channel.createMessage(`<@!${message.author.id}>, this role is managed (likely permissions for a bot), these cannot be removed or assigned.`);
			if(member.roles.includes(role.id)) return message.channel.createMessage(`<@!${message.author.id}>, **${member.username}#${member.discriminator}** already has the role ${role.name}.`);
			return member.addRole(role.id,`Command: ${message.author.username}#${message.author.discriminator} -> Add role ${role.name} to ${member.username}#${member.discriminator}`).then(() => {
				return message.channel.createMessage(`<@!${message.author.id}>, Added role ${role.name} to **${member.username}#${member.discriminator}**.`);
			}).catch((e) => {
				return message.channel.createMessage(`<@!${message.author.id}>, Command failed: ${e}`);
			});
			break; // eslint-disable-line no-unreachable

		case "remove":
			member = await message.getMemberFromArgs(1);
			role = await message.getRoleFromArgs(2);
			if(!member && !role) {
				role = await message.getRoleFromArgs(1);
				member = await message.getMemberFromArgs(2);
			}
			if(!member) return message.channel.createMessage(`<@!${message.author.id}>, User not found.`);
			if(!role) return message.channel.createMessage(`<@!${message.author.id}>, Role not found.`);
			b = this.compareMemberWithRole(message.member,role);
			c = this.compareMemberWithRole(message.guild.members.get(this.bot.user.id),role);
			if((b.higher || b.same) && message.channel.guild.ownerID !== message.member.id) return message.channel.createMessage(`<@!${message.author.id}>, You cannot assign or remove roles as high as, or higher than you.`);
			if(c.higher || c.same) return message.channel.createMessage(`<@!${message.author.id}>, this role is higher than, or as high as me, I cannot remove or assign it.`);
			if(role.managed) return message.channel.createMessage(`<@!${message.author.id}>, this role is managed (likely permissions for a bot), these cannot be removed or assigned.`);
			if(!member.roles.includes(role.id)) return message.channel.createMessage(`<@!${message.author.id}>, **${member.username}#${member.discriminator}** does not have the role ${role.name}.`);
			return member.removeRole(role.id,`Command: ${message.author.username}#${message.author.discriminator} -> remove role ${role.name} from ${member.username}#${member.discriminator}`).then(() => {
				return message.channel.createMessage(`<@!${message.author.id}>, Removed role ${role.name} from **${member.username}#${member.discriminator}**.`);
			}).catch((e) => {
				return message.channel.createMessage(`<@!${message.author.id}>, Command failed: ${e}`);
			});
			break; // eslint-disable-line no-unreachable

		case "all":
		case "addall":
			role = await message.getRoleFromArgs(1);
			if(!role) return message.channel.createMessage(`<@!${message.author.id}>, Role not found.`);
			b = this.compareMemberWithRole(message.member,role);
			c = this.compareMemberWithRole(message.guild.members.get(this.bot.user.id),role);
			if((b.higher || b.same) && message.channel.guild.ownerID !== message.member.id) return message.channel.createMessage(`<@!${message.author.id}>, You cannot assign or remove roles as high as, or higher than you.`);
			if(c.higher || c.same) return message.channel.createMessage(`<@!${message.author.id}>, this role is higher than, or as high as me, I cannot remove or assign it.`);
			if(role.managed) return message.channel.createMessage(`<@!${message.author.id}>, this role is managed (likely permissions for a bot), these cannot be removed or assigned.`);
			members = message.channel.guild.members.filter(m => !m.roles.includes(role.id));
			counts = {
				success: 0,
				fail: 0,
				skip: 0,
				before: message.channel.guild.members.filter(m => m.roles.includes(role.id)).size
			};
			message.channel.createMessage(`Changing roles for ${members.length} members.\nthis should take about ${this.parseTime(1e3 * message.channel.guild.members.filter(m => !m.roles.has(role.id)).size, true, true)}.`);
			for(let m of members) {
				member = message.channel.guild.members.get(m);
				if(!member.roles.has(role.id)) await member.addRole(role.id,`Command: ${message.author.username}#${message.author.discriminator} -> Add role ${role.name} to ALL.`)
					.then(() => counts.success++)
					.catch(() => counts.fail++);
				else counts.skip++;
			}
			return message.channel.createMessage(`Succeeded: **${counts.success}**\nFailed: **${counts.fail}**\nBefore: **${counts.before}**\nAfter: **${counts.before + counts.success}**\nSkipped: **${counts.skip}**`);
			break; // eslint-disable-line no-unreachable

		case "removeall":
			role = await message.getRoleFromArgs(1);
			if(!role) return message.channel.createMessage(`<@!${message.author.id}>, Role not found.`);
			b = this.compareMemberWithRole(message.member,role);
			c = this.compareMemberWithRole(message.guild.members.get(this.bot.user.id),role);
			if((b.higher || b.same) && message.channel.guild.ownerID !== message.member.id) return message.channel.createMessage(`<@!${message.author.id}>, You cannot assign or remove roles as high as, or higher than you.`);
			if(c.higher || c.same) return message.channel.createMessage(`<@!${message.author.id}>, this role is higher than, or as high as me, I cannot remove or assign it.`);
			if(role.managed) return message.channel.createMessage(`<@!${message.author.id}>, this role is managed (likely permissions for a bot), these cannot be removed or assigned.`);
			members = message.channel.guild.members.filter(m => m.roles.includes(role.id)).map(m => m.id);
			counts = {
				success: 0,
				fail: 0,
				skip: 0,
				before: message.channel.guild.members.filter(m => m.roles.includes(role.id)).size
			};
			message.channel.createMessage(`Changing roles for ${members.length} members.\nthis should take about ${this.parseTime(1e3 * message.channel.guild.members.filter(m => m.roles.has(role.id)).size, true, true)}.`);
			for(let m of members) {
				member = message.channel.guild.members.get(m);
				if(member.roles.has(role.id)) await member.removeRole(role.id,`Command: ${message.author.username}#${message.author.id} -> Remove role ${role.name} from ALL.`)
					.then(() => counts.success++)
					.catch(() => counts.fail++);
				else counts.skip++;
			}
			return message.channel.createMessage(`Succeeded: **${counts.success}**\nFailed: **${counts.fail}**\nBefore: **${counts.before}**\nAfter: **${counts.before - counts.success}**\nSkipped: **${counts.skip}**`);
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
				role = message.channel.guild.roles.find(r => r.name.toLowerCase() === l.toLowerCase());
				if(!role) return message.channel.createMessage(`<@!${message.author.id}>, Role not found.`);
				b = this.compareMemberWithRole(message.member,role);
				c = this.compareMemberWithRole(message.guild.members.get(this.bot.user.id),role);
				if((b.higher || b.same) && message.channel.guild.ownerID !== message.member.id) return message.channel.createMessage(`<@!${message.author.id}>, You cannot assign or remove roles as high as, or higher than you.`);
				if(c.higher || c.same) return message.channel.createMessage(`<@!${message.author.id}>, this role is higher than, or as high as me, I cannot remove or assign it.`);
				if(role.managed) return message.channel.createMessage(`<@!${message.author.id}>, this role is managed (likely permissions for a bot), these cannot be removed or assigned.`);
				members = message.channel.guild.members.filter(m => !m.user.bot);
				counts = {
					success: 0,
					fail: 0,
					skip: 0,
					before: message.channel.guild.members.filter(m => m.roles.has(role.id) && !m.user.bot).size
				};
				message.channel.createMessage(`Changing roles for ${members.length} humans.\nthis should take about ${this.parseTime(1e3 * message.channel.guild.members.filter(m => !m.roles.has(role.id) && !m.user.bot).size, true, true)}.`);
				for(let m of members) {
					member = message.channel.guild.members.get(m);
					if(!member.roles.has(role.id)) await member.addRole(role.id,`Command: ${message.author.username}#${message.author.discriminator} -> Change role ${role.name} for all humans.`)
						.then(() => counts.success++)
						.catch(() => counts.fail++);
					else counts.skip++;
				}
				return message.channel.createMessage(`Succeeded: **${counts.success}**\nFailed: **${counts.fail}**\nBefore: **${counts.before}**\nAfter: **${counts.before + counts.success}**\nSkipped: **${counts.skip}**`);
			} else {
				role = message.channel.guild.roles.find(r => r.name.toLowerCase() === l.toLowerCase());
				if(!role) return message.channel.createMessage(`<@!${message.author.id}>, Role not found.`);
				b = this.compareMemberWithRole(message.member,role);
				c = this.compareMemberWithRole(message.guild.members.get(this.bot.user.id),role);
				if((b.higher || b.same) && message.channel.guild.ownerID !== message.member.id) return message.channel.createMessage(`<@!${message.author.id}>, You cannot assign or remove roles as high as, or higher than you.`);
				if(c.higher || c.same) return message.channel.createMessage(`<@!${message.author.id}>, this role is higher than, or as high as me, I cannot remove or assign it`);
				if(role.managed) return message.channel.createMessage(`<@!${message.author.id}>, this role is managed (likely permissions for a bot), these cannot be removed or assigned.`);
				members = message.channel.guild.members.filter(m => !m.user.bot);
				counts = {
					success: 0,
					fail: 0,
					skip: 0,
					before: message.channel.guild.members.filter(m => m.roles.has(role.id) && !m.user.bot).size
				};
				message.channel.createMessage(`Changing roles for ${members.length} humans.\nthis should take about ${this.parseTime(1e3 * message.channel.guild.members.filter(m => m.roles.has(role.id) && !m.user.bot).size, true, true)}.`);
				for(let m of members) {
					member = message.channel.guild.members.get(m);
					if(member.roles.includes(role.id)) await member.removeRole(role.id,`Command: ${message.author.username}#${message.author.discriminator} -> Change role ${role.name} for all humans.`)
						.then(() => counts.success++)
						.catch(() => counts.fail++);
					else counts.skip++;
				}
				return message.channel.createMessage(`Succeeded: **${counts.success}**\nFailed: **${counts.fail}**\nBefore: **${counts.before}**\nAfter: **${counts.before - counts.success}**\nSkipped: **${counts.skip}**`);
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
				role = message.channel.guild.roles.find(r => r.name.toLowerCase() === l.toLowerCase());
				if(!role) return message.channel.createMessage(`<@!${message.author.id}>, Role not found.`);
				b = this.compareMemberWithRole(message.member,role);
				c = this.compareMemberWithRole(message.guild.members.get(this.bot.user.id),role);
				if((b.higher || b.same) && message.channel.guild.ownerID !== message.member.id) return message.channel.createMessage(`<@!${message.author.id}>, You cannot assign or remove roles as high as, or higher than you.`);
				if(c.higher || c.same) return message.channel.createMessage(`<@!${message.author.id}>, this role is higher than, or as high as me, I cannot remove or assign it.`);
				if(role.managed) return message.channel.createMessage(`<@!${message.author.id}>, this role is managed (likely permissions for a bot), these cannot be removed or assigned.`);
				members = message.channel.guild.members.filter(m => m.user.bot).map(m => m.id);
				counts = {
					success: 0,
					fail: 0,
					skip: 0,
					before: message.channel.guild.members.filter(m => m.roles.has(role.id) && m.user.bot).size
				};
				message.channel.createMessage(`Changing roles for ${members.length} bots.\nthis should take about ${this.parseTime(1e3 * message.channel.guild.members.filter(m => !m.roles.has(role.id) && m.user.bot).size, true, true)}.`);
				for(let m of members) {
					member = message.channel.guild.members.get(m);
					if(!member.roles.has(role.id)) await member.roles.add(role.id,`Command: ${message.author.username}#${message.author.discriminator} -> Change role ${role.name} for all bots.`)
						.then(counts.success++)
						.catch(counts.fail++);
					else counts.skip++;
				}
				return message.channel.createMessage(`Succeeded: **${counts.success}**\nFailed: **${counts.fail}**\nBefore: **${counts.before}**\nAfter: **${counts.before + counts.success}**\nSkipped: **${counts.skip}**`);
			} else {
				role = message.channel.guild.roles.find(r => r.name.toLowerCase() === l.toLowerCase());
				if(!role) return message.channel.createMessage(`<@!${message.author.id}>, Role not found.`);
				b = this.compareMemberWithRole(message.member,role);
				c = this.compareMemberWithRole(message.guild.members.get(this.bot.user.id),role);
				if((b.higher || b.same) && message.channel.guild.ownerID !== message.member.id) return message.channel.createMessage(`<@!${message.author.id}>, You cannot assign or remove roles as high as, or higher than you.`);
				if(c.higher || c.same) return message.channel.createMessage(`<@!${message.author.id}>, this role is higher than, or as high as me, I cannot remove or assign it.`);
				if(role.managed) return message.channel.createMessage(`<@!${message.author.id}>, this role is managed (likely permissions for a bot), these cannot be removed or assigned.`);
				members = message.channel.guild.members.filter(m => m.user.bot).map(m => m.id);
				counts = {
					success: 0,
					fail: 0,
					skip: 0,
					before: message.channel.guild.members.filter(m => m.roles.has(role.id) && m.user.bot).size
				};
				message.channel.createMessage(`Changing roles for ${members.length} bots.\nthis should take about ${this.parseTime(1e3 * message.channel.guild.members.filter(m => m.roles.includes(role.id) && m.user.bot).size, true, true)}.`);
				for(let m of members) {
					member = message.channel.guild.members.get(m);
					if(member.roles.includes(role.id)) await member.removeRole(role.id,`Command: ${message.author.username}#${message.author.discriminator} -> Change role ${role.name} for all bots.`)
						.then(() => counts.success++)
						.catch(() => counts.fail++);
					else counts.skip++;
				}
				return message.channel.createMessage(`Succeeded: **${counts.success}**\nFailed: **${counts.fail}**\nBefore: **${counts.before}**\nAfter: **${counts.before - counts.success}**\nSkipped: **${counts.skip}**`);
			}
			break; // eslint-disable-line no-unreachable
		} 
	})
};