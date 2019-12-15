import SubCommand from "../../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../../config";
import { Logger } from "clustersv2";
import { db, mdb } from "../../../../modules/Database";
import Eris from "eris";

export default new SubCommand({
	triggers: [
		"guild",
		"g",
		"server",
		"s"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Remove a server from the blacklist.",
	usage: "<id>",
	features: ["devOnly"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const id = msg.args[0];
	if (id.length < 17 || id.length > 18) return msg.reply(`**${id}** isn't a valid server id.`);
	const srv = await db.getGuild(id);
	if (!srv) return msg.reply(`Failed to fetch guild entry for **${id}**`);

	if (typeof srv.blacklist === "undefined") await srv.edit({ blacklist: { blacklisted: false, reason: null, blame: null } }).then(d => d.reload());
	if (!srv.blacklist.blacklisted) return msg.reply(`**${id}** is not blacklisted.`);
	else {
		await mdb.collection("guilds").findOneAndUpdate({ id }, { $set: { blacklist: { blacklisted: false, reason: null, blame: null } } });
		const embed: Eris.EmbedOptions = {
			title: "Server Unlacklisted",
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			description: `ID: \`${id}\`\nPrevious Reason: ${srv.blacklist.reason}\nBlame: ${msg.author.tag}`,
			color: Math.floor(Math.random() * 0xFFFFFF),
			timestamp: new Date().toISOString(),
			footer: {
				text: "",
				icon_url: "https://i.furry.bot/furry.png"
			}
		};
		await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
			embeds: [embed],
			username: `Blacklist Logs${config.beta ? " - Beta" : ""}`,
			avatarURL: "https://assets.furry.bot/blacklist_logs.png"
		});
		return msg.reply(`removed **${id}** from the blacklist, previous reason: ${srv.blacklist.reason}.`);
	}
}));
