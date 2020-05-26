import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import Language from "../../util/Language";

export default new Command({
	triggers: [
		"unban"
	],
	permissions: {
		user: [
			"banMembers"
		],
		bot: [
			"banMembers"
		]
	},
	cooldown: 2e3,
	donatorCooldown: 2e3,
	restrictions: [],
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
				.toJSON()
		});
	}

	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : Language.get(gConfig.settings.lang, "other.words.noReason", false);
	await msg.channel.guild.unbanMember(user.id, `Unban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
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

	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) await msg.delete().catch(error => null);
}));
