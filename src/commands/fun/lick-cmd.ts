import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Strings, Request } from "../../util/Functions";
import Eris from "eris";
import Logger from "../../util/LoggerV8";

export default new Command({
	triggers: [
		"lick"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Lick someone... owo",
	usage: "<@member/text>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length < 1) throw new Error("ERR_INVALID_USAGE");

	const embed: Eris.EmbedOptions = {
		description: Strings.formatStr(Strings.fetchLangMessage(msg.gConfig.settings.lang, cmd), msg.author.mention, msg.args.join(" ")),
		author: {
			name: msg.author.tag,
			icon_url: msg.author.avatarURL
		},
		timestamp: new Date().toISOString(),
		color: Math.floor(Math.random() * 0xFFFFFF)
	};

	if (msg.gConfig.settings.commandImages) {
		const img = await Request.imageAPIRequest(false, "lick", true, true);
		if (img.success === false) {
			Logger.error(`Shard #${msg.channel.guild.shard.id}`, img.error);
			return msg.reply(`internal image api error, please try again later.`);
		}

		embed
			.image = { url: img.response.image };
	}

	return msg
		.channel
		.createMessage({
			embed
		});
}));
