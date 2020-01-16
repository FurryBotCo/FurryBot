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
	botPermissions: [],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Do a little blep!",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	const text = Strings.formatStr(Strings.fetchLangMessage(msg.gConfig.settings.lang, cmd), msg.author.mention, msg.args.join(" "));

	if (msg.channel.permissionsOf(this.user.id).has("attachFiles")) {
		const img = await Request.imageAPIRequest(true, "blep");
		if (img.success === false) {
			Logger.error(`Shard #${msg.channel.guild.shard.id}`, img.error);
			return msg.reply(`internal image api error, please try again later.`);
		}

		return msg.channel.createMessage(text, {
			file: await Request.getImageFromURL(img.response.image),
			name: img.response.name
		});
	} else return msg.channel.createMessage(`<@!${msg.author.id}> did a little blep!`);
}));
