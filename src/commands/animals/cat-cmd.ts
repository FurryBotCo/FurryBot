import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "clustersv2";

export default new Command({
	triggers: [
		"cat"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Get a picture of a cat!",
	usage: "",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	try {
		return msg.channel.createMessage("", {
			file: await this.f.getImageFromURL("https://cataas.com/cat/gif"),
			name: "cat.gif"
		});
	} catch (e) {
		Logger.error(`Shard #${msg.channel.guild.shard.id}`, e);
		return msg.channel.createMessage("unknown api error", {
			file: await this.f.getImageFromURL(config.images.serverError),
			name: "error.png"
		});
	}
}));
