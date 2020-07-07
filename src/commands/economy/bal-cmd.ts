import Command from "../../modules/CommandHandler/Command";
import db from "../../modules/Database";
import config from "../../config";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"bal",
		"balance"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 0,
	donatorCooldown: 0,
	restrictions: ["developer"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const member = msg.args.length === 0 ? msg.member : await msg.getMemberFromArgs();
	if (!member) return msg.errorEmbed("INVALID_MEMBER");
	const u = member.id === msg.author.id ? uConfig : await db.getUser(member.id);

	if ([undefined, null, ""].includes(u.bal as any) || isNaN(u.bal)) {
		if (member.id === msg.author.id) {
			await u.edit({
				bal: config.defaults.config.user.bal
			});
			return msg.reply(`{lang:other.economy.invalidBalace|${config.defaults.config.user.bal}|${gConfig.settings.ecoEmoji}|${config.client.socials.discord}|${u.bal}}`);
		}
		else return msg.reply("{lang:other.economy.invalidBalanceOther}");
	}

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTitle(`{lang:commands.economy.bal.title|${member.username}#${member.discriminator}}`)
			.setColor(Colors.gold)
			.setTimestamp(new Date().toISOString())
			.setDescription(`**${u.bal}**${gConfig.settings.ecoEmoji}`)
			.toJSON()
	});
}));
