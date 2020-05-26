import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import config from "../../config";
import truncate from "truncate";
import { Internal } from "../../util/Functions";

export default new Command({
	triggers: [
		"bugreport"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 18e5,
	donatorCooldown: 18e5,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1 || msg.args.join(" ").length === 0) return msg.reply("{lang:commands.misc.bugreport.nothing}");
	const m = await this.w.get("suggestion").execute({
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
		avatarURL: config.images.botIcon
	});
	await m.addReaction(Internal.emojiStringToId(config.emojis.upvote)).catch(err => this.log("error", err, `Shard #${msg.channel.guild.shard.id}`));
	await m.addReaction(Internal.emojiStringToId(config.emojis.downvote)).catch(err => this.log("error", err, `Shard #${msg.channel.guild.shard.id}`));
	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.misc.bugreport.title}")
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setDescription(`{lang:commands.misc.bugreport.desc}`)
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))
			.toJSON()
	});
}));
