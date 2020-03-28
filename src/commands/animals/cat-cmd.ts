import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import phin from "phin";

export default new Command({
	triggers: [
		"cat"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles",
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const img = await phin({
		method: "GET",
		url: "https://aws.random.cat/meow",
		parse: "json"
	}).then(b => b.body);

	return msg.channel.createMessage({
		embed:
			new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.animals.cat.title}")
				.setTimestamp(new Date().toISOString())
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.setImage(img.file)
	});
}));
