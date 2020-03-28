import Command from "../../util/CommandHandler/lib/Command";
import config from "../../config";
import truncate from "truncate";
import EmbedBuilder from "../../util/EmbedBuilder";
import Logger from "../../util/LoggerV8";

export default new Command({
	triggers: [
		"bugreport"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 18e5,
	donatorCooldown: 18e5,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1 || msg.args.join(" ").length === 0) return msg.reply("{lang:commands.misc.bugreport.nothing}");
	const m = await this.executeWebhook(config.webhooks.suggestion.id, config.webhooks.suggestion.token, {
		embeds: [
			new EmbedBuilder(gConfig.settings.lang)
				.setTitle(`Bug Report by ${msg.author.tag} from guild ${msg.channel.guild.name}`)
				.setDescription(`${truncate(msg.unparsedArgs.join(" "), 950)}`)
				.setThumbnail(msg.author.avatarURL)
				.setFooter(`User ID: ${msg.author.id} | Guild ID: ${msg.channel.guild.id}`)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.toJSON()
		],
		username: `Bug Report${config.beta ? " - Beta" : ""}`,
		avatarURL: "https://i.furry.bot/furry.png",
		wait: true
	});
	await m.addReaction(config.emojis.upvote).catch(err => Logger.error(`Shard #${msg.channel.guild.shard.id}`, err));
	await m.addReaction(config.emojis.downvote).catch(err => Logger.error(`Shard #${msg.channel.guild.shard.id}`, err));
	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.misc.bugreport.title}")
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setDescription(`{lang:commands.misc.bugreport.desc}`)
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))
	});
}));
