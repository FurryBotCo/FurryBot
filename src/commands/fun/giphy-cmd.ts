import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import config from "../../config";
import phin from "phin";
import { Request } from "../../util/Functions";

export default new Command({
	triggers: [
		"giphy"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks",
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	if (msg.args.length < 1) throw new Error("ERR_INVALID_USAGE");
	const rq = await phin<any>({
		method: "GET",
		url: `https://api.giphy.com/v1/gifs/search?api_key=${config.keys.giphy.apikey}&q=${msg.args.join("%20")}&limit=50&offset=7&rating=G&lang=en`,
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
	}, {
		file: await Request.getImageFromURL("https://assets.furry.bot/PoweredByGiphy.png"),
		name: "PoweredByGiphy.png"
	});
}));
