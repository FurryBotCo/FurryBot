import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors, Permissions } from "../../util/Constants";

export default new Command({
	triggers: [
		"perms",
		"listperms"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const member = msg.args.filter(a => !a.startsWith("--")).length === 0 ? msg.member : await msg.getMemberFromArgs();
	if (!member) return msg.errorEmbed("INVALID_MEMBER");

	const remove = ["all", "allGuild", "allText", "allVoice"];

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.information.perms.title}")
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.green)
			.setDescription([
				`{lang:commands.information.perms.${member.id === msg.member.id ? "self" : "other"}}`,
				"```diff",
				...Object.keys(Permissions.constant).filter(p => !remove.includes(p)).map(p => `${member.permission.has(p) ? "+" : "-"} ${msg.dashedArgs.parsed.value.includes("compact") ? p : `{lang:other.permissions.names.${p}}`}`),
				"```",
				...(!msg.dashedArgs.parsed.value.includes("compact") ? [
					"",
					`{lang:commands.information.perms.compact|${gConfig.settings.prefix}|${member.username}#${member.discriminator}}`
				] : [])
			].join("\n"))
			.toJSON()
	});
}));
