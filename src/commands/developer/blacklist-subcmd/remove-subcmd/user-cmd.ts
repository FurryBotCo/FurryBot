import SubCommand from "../../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../../config";
import { Logger } from "../../../../util/LoggerV8";
import { db, mdb } from "../../../../modules/Database";
import Eris from "eris";

export default new SubCommand({
	triggers: [
		"user",
		"u"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Remove a user from the blacklist.",
	usage: "<id>",
	features: ["devOnly"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const u = await msg.getUserFromArgs();
	const tag = `${u.username}#${u.discriminator}`;
	if (!u) return msg.reply(`**${msg.args[0]}** isn't a valid user.`);
	const { id } = u;
	const usr = await db.getUser(id);

	if (!usr) return msg.reply(`Failed to fetch user entry for **${tag}**`);
	if (!usr.blacklist.blacklisted) return msg.reply(`**${tag}** is not blacklisted.`);
	else {
		await mdb.collection("users").findOneAndUpdate({ id }, { $set: { blacklist: { blacklisted: false, reason: null, blame: null } } });
		const embed: Eris.EmbedOptions = {
			title: "User Unlacklisted",
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			description: `ID: \`${id}\`\nTag: ${tag}\nOld Reason: ${usr.blacklist.reason}\nBlame: ${msg.author.tag}`,
			timestamp: new Date().toISOString(),
			color: Math.floor(Math.random() * 0xFFFFFF),
			footer: {
				text: "Permanent Blacklist",
				icon_url: "https://i.furry.bot/furry.png"
			}
		};

		await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
			embeds: [embed],
			username: `Blacklist Logs${config.beta ? " - Beta" : ""}`,
			avatarURL: "https://assets.furry.bot/blacklist_logs.png"
		});
		return msg.reply(`Remove **${tag}** (${id}) from the blacklist, old reason: ${usr.blacklist.reason}.`);
	}
}));
