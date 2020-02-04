import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Logger } from "../../util/LoggerV8";
import { Request, Strings } from "../../util/Functions";

export default new Command({
	triggers: [
		"blep"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Do a little blep!",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	const img = await Request.imageAPIRequest(true, "blep");
	if (img.success === false) {
		Logger
			.error(`Shard #${msg.channel.guild.shard.id}`, img.error);
		return msg
			.reply(`internal image api error, please try again later.`);
	}

	return msg
		.channel
		.createMessage({
			embed: {
				description: Strings.formatStr(Strings.fetchLangMessage(msg.gConfig.settings.lang, cmd), msg.author.mention, msg.args.join(" ")),
				image: {
					url: img.response.image
				},
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				timestamp: new Date().toISOString(),
				color: Math.floor(Math.random() * 0xFFFFFF)
			}
		});
}));
