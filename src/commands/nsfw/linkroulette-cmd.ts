import Command from "../../util/CommandHandler/lib/Command";
import { mongo } from "../../modules/Database";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"linkroulette",
		"lr"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: ["nsfw"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	// await msg.channel.startTyping();
	let s: any[] | any = await mongo.db("furrybot").collection("shorturl").find().toArray();

	if (s.length === 0) return msg.reply("{lang:commands.nsfw.linkroulette.noResults}");

	s = s[Math.floor(Math.random() * s.length)];
	if (!s) return msg.reply("{lang:commands.nsfw.linkroulette.invalid}");

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.nsfw.linkroulette.title}")
			.setDescription(`[${s.link}](${s.link}) - **{lang:commands.nsfw.linkroulette.link} #${s.linkNumber}**`)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))
	});
}));
