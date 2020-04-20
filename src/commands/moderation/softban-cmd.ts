import Command from "../../util/CommandHandler/lib/Command";
import { mdb } from "../../modules/Database";
import Eris from "eris";
import { Utility } from "../../util/Functions";
import config from "../../config";
import EmbedBuilder from "../../util/EmbedBuilder";
import Language from "../../util/Language";

export default new Command({
	triggers: [
		"softban"
	],
	userPermissions: [
		"banMembers"
	],
	botPermissions: [
		"banMembers"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length === 0) throw new Error("ERR_INVALID_USAGE");
	let deleteDays = 0;
	if (Object.keys(msg.dashedArgs.parsed.keyValue).includes("days")) {
		deleteDays = Number(msg.dashedArgs.parsed.keyValue.days);
		const a = [...msg.args];
		a.splice(a.indexOf(`--days=${msg.dashedArgs.parsed.keyValue.days}`));
		msg.args = a;
		if (deleteDays < 1) return msg.reply("{lang:commands.moderation.softban.deleteLessThan}");
		if (deleteDays > 14) return msg.reply("{lang:commands.moderation.softban.deleteMoreThan}");
	}
	// get member from message
	const user = await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	if (msg.channel.permissionsOf(this.user.id).has("viewAuditLogs")) {
		if (await msg.channel.guild.getBans().then(res => res.map(u => u.user.id).includes(user.id))) return msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.moderation.softban.alreadyBanned}")
				.setDescription(`{lang:commands.moderation.softban.alreadyBannedDesc|${user.username}#${user.discriminator}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
		});
	}

	if (user.id === msg.member.id && !config.developers.includes(msg.author.id)) return msg.reply("{lang:commands.moderation.softban.noBanSelf}");
	if (user.id === msg.channel.guild.ownerID) return msg.reply("{lang:commands.moderation.softban.noBanOwner}");
	const a = Utility.compareMembers(user, msg.member);
	if ((a.member1.higher || a.member1.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.reply(`{lang:commands.moderation.softban.noBanOther|${user.username}#${user.discriminator}}`);
	// if(!user.bannable) return msg.channel.createMessage(`<@!${msg.author.id}>, I cannot ban ${user.username}#${user.discriminator}! Do they have a higher role than me? Do I have ban permissions?`);
	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : Language.get(gConfig.settings.lang).get("other.noReason").toString();
	// if (!user.user.bot) m = await user.user.getDMChannel().then(dm => dm.createMessage(`You were banned from **${msg.channel.guild.name}**\nReason: ${reason}`));
	user.ban(7, `Softban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`***{lang:commands.moderation.softban.softbanned|${user.username}#${user.discriminator}|${reason}}***`).catch(noerr => null);
		await this.m.create(msg.channel, {
			type: "softban",
			reason,
			target: user.user,
			blame: msg.author,
			deleteDays: 7
		});
	}).catch(async (err) => {
		await msg.channel.createMessage(`{lang:commands.moderation.softban.couldNotSoftban|${user.username}#${user.discriminator}|${err}}`);
		// if (!!m) await m.delete();
	}).then(() => user.unban(`Softban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`)).catch(async (err) => {
		if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(`{lang:commands.moderation.softban.englishOnly}`);
		else await msg.channel.createMessage(`{lang:commands.moderation.softban.couldNotSoftban|${user.username}#${user.discriminator}|${err}}`);
	});

	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
