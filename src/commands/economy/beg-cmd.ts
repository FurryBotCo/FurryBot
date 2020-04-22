import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import config from "../../config";
import { Economy } from "../../util/Functions";

export default new Command({
	triggers: [
		"beg"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (isNaN(Number(uConfig.bal))) return msg.reply("{lang:other.error.invalidBalance}");
	const { multi, multiStr } = await Economy.calculateMulti(msg.author.id, this);
	const names = [
		...config.eco.people,
		msg.channel.guild.members.random().username,
		msg.channel.guild.members.random().username,
		msg.channel.guild.members.random().username
	];

	const person = names[Math.floor(Math.random() * names.length)];

	const amount = Math.floor(((Math.random() * 75) + 25) * (multi + 1));

	await uConfig.edit({ bal: uConfig.bal + amount });
	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.economy.beg.title}")
			.setColor(Colors.gold)
			.setTimestamp(new Date().toISOString())
			.setDescription(`{lang:commands.economy.beg.possible|${person}|${amount}|${gConfig.settings.ecoEmoji}}`)
			.setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL)
			.setFooter(`{lang:commands.economy.beg.multiplier|${multiStr}}`)
	});
}));
