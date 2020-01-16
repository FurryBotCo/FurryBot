import SubCommand from "../../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../../config";
import { mdb } from "../../../../modules/Database";
import Eris from "eris";
import { Blacklist } from "../../../../util/@types/Misc";
import { Strings, Time } from "../../../../util/Functions";

export default new SubCommand({
	triggers: [
		"user",
		"u"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Add a user to the blacklist.",
	usage: "<id> <reason>",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const u = await msg.getUserFromArgs();
	if (!u) return msg.reply(`**${msg.args[0]}** isn't a valid user.`);
	const { id } = u;
	const ubl: Blacklist.UserEntry = await mdb.collection("blacklist").find({ userId: id }).toArray().then(res => res.filter(r => [0, null].includes(r.expire) || r.expire > Date.now())[0]);
	if (!!ubl) {
		const expiry = [0, null].includes(ubl.expire) ? "Never" : Time.formatDateWithPadding(new Date(ubl.expire));
		return msg.reply(`**${u.username}#${u.discriminator}** (${u.id}) is already blacklisted. Reason: ${ubl.reason}. Blame: ${ubl.blame}. Expiry: ${expiry}.`);
	} else {
		const reason = msg.args.length > 1 ? msg.args.slice(1, msg.args.length).join(" ") : "No Reason Specified";
		const k = Strings.random(7);
		await mdb.collection("blacklist").insertOne({
			created: Date.now(),
			type: "user",
			blame: msg.author.tag,
			blameId: msg.author.id,
			reason,
			userId: id,
			id: k,
			noticeShown: false,
			expire: null
		});
		const embed: Eris.EmbedOptions = {
			title: "User Blacklisted",
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			description: `ID: \`${id}\`\nTag: ${u.username}#${u.discriminator}\nReason: ${reason}\nBlame: ${msg.author.tag}\nExpiry: Never\nBlacklist ID: ${k}`,
			timestamp: new Date().toISOString(),
			color: Math.floor(Math.random() * 0xFFFFFF),
			footer: {
				text: "Permanent Blacklist",
				icon_url: "https://i.furry.bot/furry.png"
			}
		};

		const g = this.guilds.get(config.bot.mainGuild);
		if (g && g.members.has(u.id)) {
			const m = g.members.get(u.id);
			if (!m.roles.includes(config.blacklistRoleId)) await m.addRole(config.blacklistRoleId, `user blacklisted by ${msg.author.tag}`);
		}
		await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
			embeds: [embed],
			username: `Blacklist Logs${config.beta ? " - Beta" : ""}`,
			avatarURL: "https://assets.furry.bot/blacklist_logs.png"
		});
		return msg.reply(`Added **${u.username}#${u.discriminator}** (${id}) to the blacklist, reason: ${reason}.`);
	}
}));
