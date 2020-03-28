import Command from "../../util/CommandHandler/lib/Command";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import { Request } from "../../util/Functions";
import EmbedBuilder from "../../util/EmbedBuilder";
import db from "../../modules/Database";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"bal",
		"balance"
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
	let member = msg.member;
	if (msg.args.length > 0) member = await msg.getMemberFromArgs();
	if (!member) return msg.errorEmbed("INVALID_MEMBER");
	const m = member.id === msg.author.id ? uConfig : await db.getUser(member.id);

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle(member.id === msg.member.id ? "{lang:commands.economy.bal.yourBalance}" : `{lang:commands.economy.bal.otherBalance} ${member.username}#${member.discriminator}`)
			.setColor(Colors.gold)
			.setTimestamp(new Date().toISOString())
			.setDescription(`${m.bal}${gConfig.settings.ecoEmoji}`)
			.setAuthor(`${member.username}#${member.discriminator}`, member.avatarURL)
	});
}));
