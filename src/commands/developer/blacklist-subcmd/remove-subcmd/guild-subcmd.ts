import SubCommand from "../../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../../config";
import { Logger } from "../../../../util/LoggerV8";
import { db, mdb } from "../../../../modules/Database";
import Eris from "eris";
import { BlacklistEntry } from "../../../../util/@types/Misc";

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
	const gbl: BlacklistEntry[] = await mdb.collection("blacklist").find({ guildId: id }).toArray().then(res => res.filter(r => [0, null].includes(r.expire) || r.expire > Date.now()));

	if (gbl.length === 0) return msg.reply(`doesn't look like **${id}** has any blacklists.`);

	await msg.channel.createMessage({
		embed: {
			title: `Blacklist Entries For ${id}`,
			fields: gbl.map(b => ({ name: `Date: ${this.f.formatDateWithPadding(new Date(b.created), true)}`, value: `Blame: ${b.blame}\nExpiry: ${[0, null].includes(b.expire) ? "Never" : this.f.formatDateWithPadding(new Date(b.expire), true)}\nReason: ${b.reason}\nNotice Shown: ${b.noticeShown ? "Yes" : "No"}\nID: **${b.id}**`, inline: false }))
		}
	});
	await msg.channel.createMessage("Please either provide one of the ids to remove it, or say `cancel` to cancel.");
	const d = await this.messageCollector.awaitMessage(msg.channel.id, msg.author.id, 6e4);
	if (!d) return msg.reply("please provide an id to remove.");
	if (d.content.toLowerCase() === "cancel") return msg.reply("canceled.");
	const ids = gbl.map(b => b.id);
	if (!ids.includes(d.content)) return msg.reply("invalid id provided.");
	else {
		const bl = gbl.find(b => b.id === d.content);
		await mdb.collection("blacklist").findOneAndUpdate({ id: bl.id }, { $set: { expire: Date.now() } });
		const embed: Eris.EmbedOptions = {
			title: "Server Unlacklisted",
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			description: `ID: \`${id}\`\nPrevious Reason: ${bl.reason}\nPrevious Blame: ${bl.blame}\nBlame: ${msg.author.tag}`,
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
		return msg.reply(`pardoned **${id}**'s blacklist ${bl.id}, previous reason: ${bl.reason}, previous blame: ${bl.blame}`);
	}
}));
