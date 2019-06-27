import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@src/util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";

export default new Command({
	triggers: [
		"uinfo",
		"userinfo",
		"ui"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	description: "Get some info on a user",
	usage: "[@member/id]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let user, roles, data, req, x, ds, db, l, ll, rs, list, embed;
	try {
		if (msg.args.length === 0 || !msg.args) {
			user = msg.member;
		} else {
			// get member from message
			user = await msg.getMemberFromArgs();
		}
	} catch (e) {
		await msg.channel.createMessage(`<@!${msg.author.id}>, there was an unknown error while doing this.`);
		return this.logger.error(e);
	}

	if (!user) return msg.errorEmbed("INVALID_USER");

	roles = user.roles.map(role => role !== msg.channel.guild.id ? `<@&${role}>` : "@everyone");

	embed = {
		name: "User info",
		fields: [{
			name: "Tag",
			value: `${user.user.username}#${user.user.discriminator}`,
			inline: true
		}, {
			name: "User ID",
			value: user.id,
			inline: true
		}, {
			name: "Joined Server",
			value: new Date(user.joinedAt).toString().split("GMT")[0],
			inline: true
		}, {
			name: "Joined Discord",
			value: new Date(user.user.createdAt).toString().split("GMT")[0],
			inline: true
		}, {
			name: `Roles [${roles.length}]`,
			value: roles.length > 15 ? `Too many roles to list, please use \`${msg.gConfig.prefix}roles ${user.user.id}\`` : roles.toString(),
			inline: false
		}]
	};
	if (!user.user.bot) {
		try {
			/*req = await phin({
				method: "GET",
				url: `https://discord.services/api/ban/${user.id}`
			});
	
			x = JSON.parse(req.body.toString());
			ds = typeof x.ban !== "undefined"?`\nReason: ${x.ban.reason}\nProof: [${x.ban.proof}](${x.ban.proof})`:"No";*/
			ds = "Down until further notice";
		} catch (e) {
			ds = "Lookup failed.";
			this.logger.log(e);
			this.logger.log({
				headers: req.headers,
				body: req.body.toString(),
				statusCode: req.statusCode
			});
		}
		db = "Down until further notice";
		/*l = await mdb.collection("users").findOne({
			id: user.id
		}).then(res => {
			if (!res.blacklisted) return false;
			return {
				blacklisted: res.blacklisted,
				reason: res.blacklistReason
			};
		});
		ll = l.blacklisted ? `Reason: ${l.reason}` : "No";
		embed.fields.push({
			name: "Blacklist",
			value: `Discord.Services: **${ds}**\nDiscord Bans: **${db}**\nlocal: **${ll}**`,
			inline: false
		}, {
				name: "Bot List",
				value: "Humans are not listed on (most) bot lists.",
				inline: false
			});*/
	} else {
		// botlist lookup
		const req = await phin({
			method: "GET",
			url: `https://botblock.org/api/bots/${user.id}`
		});
		try {
			rs = JSON.parse(req.body.toString());
			list = "(all links redirect from our api to make keeping links up to date easier)\n";
			for (let ls in rs.list_data) {
				const ll = rs.list_data[ls];
				if (ll[1] !== 200) continue;
				list += `[${ls}](https://api.furry.bot/botlistgo/${encodeURIComponent(ls)}/${encodeURIComponent(user.id)

					})\n`;

			}

			//list = Object.keys(this._.pickBy(rs.list_data,((val,key) => ([null,undefined,""].includes(val[0]) || ((typeof val[0].bot !== "undefined" && val[0].bot.toLowerCase() === "no bot found") || (typeof val[0].success !== "undefined" && [false,"false"].includes(val[0].success)))) ?  false : val[1] === 200))).map(list => ({name: list,url:`https://api.furry.bot/botlistgo.php?list=${list}&id=${user.id}`}));
		} catch (e) {
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
		embed.fields.push({
			name: "Blacklist",
			value: "Bots cannot be blacklisted.",
			inline: false
		}, {
				name: "Bot List",
				value: list.length > 1000 ? `Output is too long, use \`${msg.gConfig.prefix}botlistinfo ${user.username}#${user.discriminator}\`` : list.length === 0 ? "Not found on any." : list,
				inline: false
			});
	}

	Object.assign(embed, msg.embed_defaults());
	embed.thumbnail = {
		url: user.user.avatarURL
	};
	msg.channel.createMessage({
		embed
	});
}));