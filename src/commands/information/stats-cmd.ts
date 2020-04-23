import Command from "../../util/CommandHandler/lib/Command";
import Eris from "eris";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Internal } from "../../util/Functions";
import { Colors } from "../../util/Constants";
import config from "../../config";

export default new Command({
	triggers: [
		"stats"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const stats = await Internal.getStats();

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.information.stats.title}")
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setThumbnail(config.images.botIcon)
			.setColor(Colors.gold)
			.setTimestamp(new Date().toISOString())
			.addField("{lang:commands.information.stats.commandsTotal}", !stats.commandsTotal ? "{lang:other.noneYet}" : stats.commandsTotal.toString(), true)
			.addField("{lang:commands.information.stats.messages}", !stats.messages ? "{lang:other.noneYet}" : stats.messages.toString(), true)
			.addField("{lang:commands.information.stats.guildCount}", this.guilds.size.toString(), true)
			.addField("{lang:commands.information.stats.largeGuildCount}", this.guilds.filter(g => g.large).length.toString(), true)
			.addField("{lang:commands.information.stats.userCount}", this.users.size.toString(), true)
			.addField("{lang:commands.information.stats.channelCount}", Object.keys(this.channelGuildMap).length.toString(), true)
			.addField("{lang:commands.information.stats.shardCount}", this.shards.size.toString(), true)
	});
}));
