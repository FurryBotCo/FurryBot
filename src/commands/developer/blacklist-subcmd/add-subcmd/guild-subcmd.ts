import SubCommand from "../../../../util/CommandHandler/lib/SubCommand";
import config from "../../../../config";
import { mdb } from "../../../../modules/Database";
import Eris from "eris";
import { Blacklist } from "../../../../util/@types/Misc";
import { Strings, Time } from "../../../../util/Functions";

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
	description: "Add a server to the blacklist.",
	usage: "<id> <reason>",
	features: ["contribOnly"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const id = msg.args[0];
	if (id.length < 17 || id.length > 18) return msg.reply(`**${id}** isn't a valid server id.`);
	const gbl: Blacklist.GuildEntry = await mdb.collection("blacklist").find({ guildId: id }).toArray().then(res => res.filter(r => [0, null].includes(r.expire) || r.expire > Date.now())[0]);
	if (!!gbl) {
		const expiry = [0, null].includes(gbl.expire) ? "Never" : Time.formatDateWithPadding(new Date(gbl.expire));
		return msg.reply(`**${id}** is already blacklisted. Reason: ${gbl.reason}. Blame: ${gbl.blame}. Expiry: ${expiry}.`);
	} else {
		const reason = msg.args.length > 1 ? msg.args.slice(1, msg.args.length).join(" ") : "No Reason Specified";
		const k = Strings.random(7);
		await mdb.collection("blacklist").insertOne({
			created: Date.now(),
			type: "guild",
			blame: msg.author.tag,
			blameId: msg.author.id,
			reason,
			guildId: id,
			id: k,
			noticeShown: false,
			expire: null
		});
		const embed: Eris.EmbedOptions = {
			title: "Server Blacklisted",
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			description: `ID: \`${id}\`\nReason: ${reason}\nBlame: ${msg.author.tag}\nExpiry: Never\nBlacklist ID: ${k}`,
			color: Math.floor(Math.random() * 0xFFFFFF),
			timestamp: new Date().toISOString(),
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
		return msg.reply(`Added **${id}** to the blacklist, reason: ${reason}.`);
	}
}));
