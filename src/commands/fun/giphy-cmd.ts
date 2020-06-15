import Command from "../../modules/CommandHandler/Command";
import config from "../../config";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Request } from "../../util/Functions";
import phin from "phin";
import CommandError from "../../modules/CommandHandler/CommandError";

export default new Command({
	triggers: [
		"giphy"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks",
			"attachFiles"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) throw new CommandError("ERR_INVALID_USAGE", cmd);
	const rq = await phin<any>({
		method: "GET",
		url: `https://api.giphy.com/v1/gifs/search?api_key=${config.apiKeys.giphy.apikey}&q=${msg.args.join("%20")}&limit=50&offset=7&rating=G&lang=en`,
		parse: "json",
		timeout: 5e3
	});

	if (rq.body.data.length === 0) return msg.reply(`{lang:commands.fun.giphy.noResults|${msg.args.join(" ")}}`);


	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setDescription(`{lang:commands.fun.giphy.title|${msg.args.join(" ")}}`)
			.setImage(rq.body.data[Math.floor(Math.random() * rq.body.data.length)].images.fixed_width.url)
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))
			.setThumbnail("attachment://PoweredByGiphy.png")
			.setFooter("{lang:commands.fun.giphy.disclaimer}")
			.toJSON()
	}, {
		file: await Request.getImageFromURL(config.images.giphyPoweredBy),
		name: "PoweredByGiphy.png"
	});
}));
