import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"whoisplaying",
		"whoplays"
	],
	permissions: {
		user: [],
		bot: [
		]
	},
	cooldown: 2e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const l = msg.channel.guild.members.filter(m => m.game && m.game.name.toLowerCase().includes(msg.args.join(" ").toLowerCase()));

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle(`{lang:commands.information.whoisplaying.title|${msg.args.join(" ")}}`)
			.setDescription([
				`Total: **${l.length}**`,
				"",
				...l.map(m => `${m.username}#${m.discriminator} (<@!${m.id}>)`)
			].join("\n"))
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
			.toJSON()
	});
}));
