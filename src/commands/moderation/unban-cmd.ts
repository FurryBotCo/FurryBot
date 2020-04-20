import Command from "../../util/CommandHandler/lib/Command";
import { mdb } from "../../modules/Database";
import Eris from "eris";
import { Utility } from "../../util/Functions";
import config from "../../config";
import EmbedBuilder from "../../util/EmbedBuilder";
import Language from "../../util/Language";

export default new Command({
	triggers: [
		"unban",
		"ub"
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

	const user = await msg.getUserFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	if (msg.channel.permissionsOf(this.user.id).has("viewAuditLogs")) {
		if (!(await msg.channel.guild.getBans().then(res => res.map(u => u.user.id))).includes(user.id)) return msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.moderation.unban.notBanned}")
				.setDescription(`{lang:commands.moderation.unban.notBannedDesc|${user.username}#${user.discriminator}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
		});
	}

	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : Language.get(gConfig.settings.lang).get("other.noReason").toString();
	msg.channel.guild.unbanMember(user.id, `Unban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`***{lang:commands.moderation.unban.unbanned|${user.username}#${user.discriminator}|${reason}}***`).catch(noerr => null);
		await this.m.create(msg.channel, {
			type: "unban",
			reason,
			target: user,
			blame: msg.author
		});
	}).catch(async (err) => {
		if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(`{lang:commands.moderation.unban.englishOnly}`);
		else await msg.channel.createMessage(`{lang:commands.moderation.unban.couldNotUnban|${user.username}#${user.discriminator}|${err}}`);
	});

	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
