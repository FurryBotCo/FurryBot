import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import EmbedBuilder from "../../util/EmbedBuilder";
import Request from "../../util/Functions/Request";
import Language from "../../util/Language";
import phin from "phin";
import config from "../../config";
import { Colors } from "../../util/Constants";

export default new Command(["giphy"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) throw new CommandError("ERR_INVALID_USAGE", cmd);
		const rq = await phin<{
			data: { // there's more but I dont' care
				images: {
					fixed_width: {
						url: string;
					};
				};
			}[];
		}>({
			method: "GET",
			url: `https://api.giphy.com/v1/gifs/search?api_key=${config.apis.giphy.apikey}&q=${msg.args.join("%20")}&limit=50&offset=7&rating=G&lang=en`,
			parse: "json",
			timeout: 5e3
		});

		if (rq.body.data.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noResults`, [msg.args.join(" ")]));


		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setDescription(`{lang:${cmd.lang}.title|${msg.args.join(" ")}}`)
				.setImage(rq.body.data[Math.floor(Math.random() * rq.body.data.length)].images.fixed_width.url)
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
				.setThumbnail("attachment://PoweredByGiphy.png")
				.setFooter(`{lang:${cmd.lang}.disclaimer}`)
				.toJSON()
		}, {
			file: await Request.getImageFromURL("https://assets.furry.bot/PoweredByGiphy.png"),
			name: "PoweredByGiphy.png"
		});
	});
