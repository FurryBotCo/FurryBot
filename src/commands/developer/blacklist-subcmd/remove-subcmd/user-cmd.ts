import SubCommand from "../../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../../config";
import { mdb } from "../../../../modules/Database";
import Eris from "eris";
import { Blacklist } from "../../../../util/@types/Misc";
import { Time } from "../../../../util/Functions";

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
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const u = await msg.getUserFromArgs();
	if (!u) return msg.reply(`**${msg.args[0]}** isn't a valid user.`);
	const { id } = u;
	const ubl: Blacklist.UserEntry[] = await mdb.collection("blacklist").find({ userId: id }).toArray().then(res => res.filter(r => [0, null].includes(r.expire) || r.expire > Date.now()));

	if (ubl.length === 0) return msg.reply(`it doesn't look like **${u.username}#${u.discriminator}** has any blacklists.`);
	await msg.channel.createMessage({
		embed: {
			title: `Blacklist Entries For ${u.username}#${u.discriminator}`,
			fields: ubl.map(b => ({ name: `Date: ${Time.formatDateWithPadding(new Date(b.created), true)}`, value: `Blame: ${b.blame}\nExpiry: ${[0, null].includes(b.expire) ? "Never" : Time.formatDateWithPadding(new Date(b.expire), true)}\nReason: ${b.reason}\nNotice Shown: ${b.noticeShown ? "Yes" : "No"}\nID: **${b.id}**`, inline: false }))
		}
	});
	await msg.channel.createMessage("Please either provide one of the ids to remove it, or say `cancel` to cancel.");
	const d = await this.messageCollector.awaitMessage(msg.channel.id, msg.author.id, 6e4);
	if (!d) return msg.reply("please provide an id to remove.");
	if (d.content.toLowerCase() === "cancel") return msg.reply("canceled.");
	const ids = ubl.map(b => b.id);
	if (!ids.includes(d.content)) return msg.reply("invalid id provided.");
	else {
		const bl = ubl.find(b => b.id === d.content);
		await mdb.collection("blacklist").findOneAndUpdate({ id: bl.id }, { $set: { expire: Date.now() } });
		const embed: Eris.EmbedOptions = {
			title: "User Unlacklisted",
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			description: `ID: \`${id}\`\nTag: ${u.username}#${u.discriminator}\nOld Reason: ${bl.reason}\nPrevious Blame: ${bl.blame}\nBlame: ${msg.author.tag}`,
			timestamp: new Date().toISOString(),
			color: Math.floor(Math.random() * 0xFFFFFF),
			footer: {
				text: "",
				icon_url: "https://i.furry.bot/furry.png"
			}
		};

		const g = this.guilds.get(config.bot.mainGuild);
		if (g && g.members.has(u.id)) {
			const m = g.members.get(u.id);
			if (m.roles.includes(config.blacklistRoleId)) await m.removeRole(config.blacklistRoleId, `user unblacklisted by ${msg.author.tag}`);
		}

		await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
			embeds: [embed],
			username: `Blacklist Logs${config.beta ? " - Beta" : ""}`,
			avatarURL: "https://assets.furry.bot/blacklist_logs.png"
		});
		return msg.reply(`Pardoned **${u.username}#${u.discriminator}** (${id})'s blacklist ${bl.id}, previous reason: ${bl.reason}. previous blame: ${bl.blame}`);
	}
}));
