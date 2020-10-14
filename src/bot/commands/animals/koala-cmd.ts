import Command from "../../../util/cmd/Command";
import EmbedBuilder from "../../../util/EmbedBuilder";
import Request from "../../../util/Functions/Request";

export default new Command(["koala"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		const r = await Request.fetchURL("https://some-random-api.ml/img/koala");
		const img = JSON.parse(r.toString()).link as string;
		return msg.channel.createMessage({
			embed:
				new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.title}`)
					.setDescription(`[{lang:other.words.imageURL}](${img})`)
					.setTimestamp(new Date().toISOString())
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setColor(Math.floor(Math.random() * 0xFFFFFF))
					.setImage(img)
					.toJSON()
		});
	});
