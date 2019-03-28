module.exports = {
	triggers: [
		"uinfo",
		"userinfo",
		"ui"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Get some info on a user",
	usage: "[@member/id]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		message.channel.startTyping();
		let user, roles, data, req, x, ds, db, l, ll, rs, list, embed;
		if(message.args.length === 0 || !message.args) {
			user = message.member;
		} else {
			// get member from message
			user = await message.getMemberFromArgs();
		}

		if(!user) return message.errorEmbed("INVALID_USER");
		
		roles = user.roles.map(role => role.name !== "@everyone" ? `<@&${role.id}>` : "@everyone");
		
		data = {
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
					value: roles.length > 15 ?`Too many roles to list, please use \`${message.gConfig.prefix}roles ${user.user.id}\``:roles.toString(),
					inline: false
				}
			]
		};
		if(!user.user.bot) {
			try {
				req = await this.request(`https://discord.services/api/ban/${user.id}`,{
					method: "GET"
				});
		
				x = JSON.parse(req.body.toString());
				ds = typeof x.ban !== "undefined"?`\nReason: ${x.ban.reason}\nProof: [${x.ban.proof}](${x.ban.proof})`:"No";
			} catch(e) {
				ds = "Lookup failed.";
				this.logger.log(e);
				this.logger.log({
					headers: req.headers,
					body: req.body.toString(),
					statusCode: req.statusCode
				});
			}
			db = "Down until further notice";
			l = await this.db.isBlacklisted(user.id);
			ll = l.blacklisted ? `Reason: ${l.reason}` : "No";
			data.fields.push({
				name: "Blacklist",
				value: `Discord.Services: **${ds}**\nDiscord Bans: **${db}**\nlocal: **${ll}**`,
				inline: false
			},{
				name: "Bot List",
				value: "Humans are not listed on (most) bot lists.",
				inline: false
			});
		} else {
			// botlist lookup
			const req = await this.request(`https://botblock.org/api/bots/${user.id}`,{
				method: "GET"
			});
			try {
				rs = JSON.parse(req.body.toString());
				list = "(all links redirect from our api to make keeping links up to date easier)\n";
				for(let ls in rs.list_data) {
					const ll = rs.list_data[ls];
					if(ll[1] !== 200) continue;
					list += `[${ls}](https://api.furry.bot/botlistgo/${encodeURIComponent(ls)}/${encodeURIComponent(user.id)
				
				})\n`;

				}

				//list = Object.keys(this._.pickBy(rs.list_data,((val,key) => ([null,undefined,""].includes(val[0]) || ((typeof val[0].bot !== "undefined" && val[0].bot.toLowerCase() === "no bot found") || (typeof val[0].success !== "undefined" && [false,"false"].includes(val[0].success)))) ?  false : val[1] === 200))).map(list => ({name: list,url:`https://api.furry.bot/botlistgo.php?list=${list}&id=${user.id}`}));
			}catch(e){
				this.logger.log({
					headers: req.headers,
					body: req.body.toString(),
					statusCode: req.statusCode
				});
				this.logger.error(e);
				rs = req.body;
				list = "Lookup Failed.";
			}
			list = typeof list === "object" ? list.map(ls => `[${ls.name}](${ls.url})`).join("\n") : list;
			data.fields.push({
				name: "Blacklist",
				value: "Bots cannot be blacklisted.",
				inline: false
			},{
				name: "Bot List",
				value: list.length > 1000 ? `Output is too long, use \`${message.gConfig.prefix}botlistinfo ${user.user.tag}\`` : list.length === 0 ? "Not found on any." : list,
				inline: false
			});
		}
		Object.assign(data, message.embed_defaults());
		data.thumbnail={url: user.user.displayAvatarURL()};
		embed = new this.Discord.MessageEmbed(data);
		message.channel.send(embed);
		return message.channel.stopTyping();
	})
};